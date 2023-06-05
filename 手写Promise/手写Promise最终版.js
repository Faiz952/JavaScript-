'use strict'

class MyPromise {
    constructor (executor) {
        this.status = MyPromise.PENDING
        this.onFulfilleds = []
        this.onRejecteds = []
        // 根据传入的 value 解决当前环境下的 promise（this）
        const resolve = (value) => {
            MyPromise.__Resolve__(this, value)
        }
        // 根据传入的 reason 拒绝当前环境下的 promise（this）
        const reject = (reason) => {
            this.reject(reason)
        }
        try {
            executor(resolve, reject)
        } catch (e) {
            this.reject(e)
        }
    }
    // 直接用 value 完成 promise，因为该函数传入的 value 一定不是一个 thenable
    fulfill (value) {
        if (this.status === MyPromise.PENDING) {
            // 修改状态为成功态，此后状态不能再更改
            Object.defineProperty(this, 'status', {
                value: MyPromise.FULFILLED,
                writable: false
            })
            // 定义属性 value，value 不能再更改
            Object.defineProperty(this, 'value', {
                value,
                writable: false
            })
            for (const onFulfilled of this.onFulfilleds) {
                onFulfilled(this.value)
            }
        }
    }
    // 拒绝 promise
    reject (reason) {
        if (this.status === MyPromise.PENDING) {
            // 修改状态为失败态，此后状态不能再更改
            Object.defineProperty(this, 'status', {
                value: MyPromise.REJECTED,
                writable: false
            })
            Object.defineProperty(this, 'reason', {
                value: reason,
                writable: false
            })
            for (const onRejected of this.onRejecteds) {
                onRejected(this.reason)
            }
        }
    }
    then (onFulfilled, onRejected) {
        const promise2 = new MyPromise((resolve, reject) => {
            if (typeof onFulfilled !== 'function') {
                onFulfilled = function (value) {
                    return value
                }
            }
            if (typeof onRejected !== 'function') {
                onRejected = function (reason) {
                    throw reason
                }
            }
            switch (this.status) {
                case MyPromise.PENDING:
                    this.onFulfilleds.push(() => {
                        process.nextTick(() => {
                            try {
                                const x = onFulfilled(this.value)
                                resolve(x)
                            } catch (e) {
                                reject(e)
                            }
                        })
                    })
                    this.onRejecteds.push(() => {
                        process.nextTick(() => {
                            try {
                                const x = onRejected(this.reason)
                                resolve(x)
                            } catch (e) {
                                reject(e)
                            }
                        })
                    })
                    break
                case MyPromise.FULFILLED:
                    process.nextTick(() => {
                        try {
                            const x = onFulfilled(this.value)
                            resolve(x)
                        } catch (e) {
                            reject(e)
                        }
                    })
                    break
                case MyPromise.REJECTED:
                    process.nextTick(() => {
                        try {
                            const x = onRejected(this.reason)
                            resolve(x)
                        } catch (e) {
                            reject(e)
                        }
                    })
                    break
            }
        })
        return promise2
    }
    catch (onRejected) {
        return this.then(undefined, onRejected)
    }

    /**
     * 调用该函数的 promise 无论成功还是失败，该函数都会执行
     * 当一个promise无论成功或者失败都要处理一个逻辑的时候使用
     */
    // 表示前面的promise无论成功还是失败都会执行finally方法
    //
    // callback
    //  1. 调用callback不会传递参数（无法拿到前面promise的返回值）
    //  2. callback最终在then的参数函数中被调用
    //  3. callback返回一个promise（如果不是则用Promise.resolve转换为promise），且会等待这个promise返回
    // finally值传递规则
    //  调用then方法返回一个promise，根据callback的执行结果决定自己的状态和值
    //   1. 如果callback返回的promise成功，则finally返回成功的promise，值为前面promise的成功结果，传递下去（遵循 then 的链式调用原理）
    //   2. 如果callback返回的promise失败，则finally返回失败的promise，值为callback返回promise的失败原因，取代并传递下去（遵循 then 的链式调用原理）
    //   3. 如果callback执行报错，则被当前then回调的try-catch捕获，finally返回失败的promise，值为报错原因，取代并传递下去z
    /**
     * @param onFinally
     * 1. onFinally 类型为函数且不接收参数
     * 2. onFinally 返回一个 MyPromise的 实例（如果不是则用 MyPromise.resolve 转换）
     * 3. 如果该函数执行抛出异常或者返回一个失败的 promise，则 finally 返回一个失败的 promise,reason是抛出的异常或者返回的失败的promise的原因
     * 否则，finally 返回与调用该函数的promise 一样状态和结果的 promise
     * @returns {MyPromise}
     */
    finally (onFinally) {
        return this.then((value) => {
            return MyPromise.resolve(onFinally()).then(() => value)
        }, (reason) => {
            return MyPromise.resolve(onFinally()).then(() => { throw reason })
        })
    }
}
// 三种状态
MyPromise.PENDING = 'pending'
MyPromise.FULFILLED = 'fulfilled'
MyPromise.REJECTED = 'rejected'
MyPromise.resolve = function (value) {
    if (value instanceof MyPromise) {
        return value
    }
    return new MyPromise((resolve, reject) => {
        resolve(value)
    })
}
MyPromise.reject = function (reason) {
    return new MyPromise((resolve, reject) => {
        reject(reason)
    })
}
// 参数：实现iterator接口的可迭代对象（数组、字符串、Map、Set。。。）
//  1. 如果参数不存在或者不可迭代，返回一个失败的promise，值为类型错误
//  2. 如果可迭代对象成员为空，返回一个成功的promise，值为空数组
//  3. 如果可迭代对象成员不是promise，则调用 Promise.resolve 将其变为一个promise
// 返回promise的状态：由所有可迭代对象的成员（promise）的返回状态决定
//  1. 所有成员promise都返回成功，则all返回一个成功的promise，值为所有成员promise返回值组成的数组（按成员顺序排序）
//  2. 只要一个成员promise返回失败，则all返回一个失败的promise，值为第一个失败的成员promise的失败原因
//  3. 如果成员promise自身定义了catch方法，那么它被rejected时会被自身定义的catch捕获，
//     并返回一个新的promise（用这个新promise状态代替该成员promise状态）
// 异常：
//  1. 结合await使用时，只需要await Promise.all 即可捕获到内部promise的异常，内部promise不需要await
MyPromise.all = function (promises) {
    return new MyPromise((resolve, reject) => {
        // 判断一个对象是不是可迭代的
        if (promises === undefined || promises === null || !promises[Symbol.iterator]) {
            const errorReason = `${promises === undefined ? '' : typeof promises} ${promises} is not iterable (cannot read property Symbol(Symbol.iterator))`
            reject(new TypeError(errorReason))
            return
        }
        promises = Array.from(promises)
        if (promises.length === 0) {
            resolve([])
        }
        let index = 0, valueArr = []
        function pushValue(i, value) {
            valueArr[i] = value
            index++
            if (index === promises.length) {
                resolve(valueArr)
            }
        }
        for (let i = 0; i < promises.length; i++) {
            MyPromise.resolve(promises[i]).then(x => {
                pushValue(i, x)
            }).catch(e => {
                reject(e)
            })
        }
    })
}
// 参数：实现iterator接口的可迭代对象（数组、字符串、Map、Set。。。）
//  1. 如果参数不存在或者不可迭代，返回一个失败的promise，值为类型错误
//  2. 如果可迭代对象成员为空，【返回一个PENDING 状态的promise】
//  3. 如果可迭代对象成员不是promise，则调用 Promise.resolve 将其变为一个promise
// 返回promise的状态：
//  1. 只要一个成员promise返回，则race返回相同状态的promise
MyPromise.race = function (promises) {
    return new MyPromise((resolve, reject) => {
        if (promises === null || promises === undefined || !promises[Symbol.iterator]) {
            const errorReason = `${promises === undefined ? '' : typeof promises} ${promises} is not iterable (cannot read property Symbol(Symbol.iterator))`
            reject(new TypeError(errorReason))
            return
        }
        promises = Array.from(promises)
        if (promises.length === 0) return
        for (const promise of promises) {
            MyPromise.resolve(promise).then(value => resolve(value), reason => reject(reason))
        }
    })
}
/**
 * 接收两个参数，第一个参数是一个promise，第二个参数是任意合法的值，用第二个参数解决第一个参数
 * @param promise2
 * @param x
 * @private
 */
MyPromise.__Resolve__ = function (promise2, x) {
    if (x === promise2) {
        promise2.reject(new TypeError('The promise and its value refer to the same object'))
        return
    } else {
        if ((typeof x === 'object' && x !== null) || (typeof x === 'function')) {
            let time = 0
            try {
                const then = x.then // 报错点1：访问 then 属性报错
                if (typeof then === 'function') {
                    then.call(x, (y) => { // 报错点2：then 运行报错
                        if (time++ === 0) {
                            MyPromise.__Resolve__(promise2, y)
                        }
                    }, (r) => {
                        if (time++ === 0) {
                            promise2.reject(r)
                        }
                    })
                } else {
                    promise2.fulfill(x)
                }
            } catch (e) {
                if (time === 0) {
                    promise2.reject(e)
                }
            }
        } else {
            promise2.fulfill(x)
            return;
        }
    }
}
MyPromise.deferred = function () {
    let dfd = {};
    dfd.promise = new MyPromise((resolve, reject) => {
        dfd.resolve = resolve;
        dfd.reject = reject;
    });
    return dfd;
};



module.exports = MyPromise

