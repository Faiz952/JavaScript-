const fs = require('fs')
function readFileCurrying(pars) {
    return function (callBack) {
        fs.readFile(...pars, callBack)
    }
}

// 函数柯里化结合生成器函数写异步代码按序执行
function * generatorCombineCurrying() {
    try {
        let a = yield readFileCurrying(['./file1', 'utf-8'])
        let b = yield readFileCurrying([a, 'utf-8'])
        let c = yield readFileCurrying([b, 'utf-8'])
        console.log(c)
    } catch (e) {
        console.log(e)
    }
}
function generateAutomaticExecution(f) {
    const iterator = f();
    const yieldResult = iterator.next()
    function f1(result) {
        if (!result.done) {
            result.value((err, data) => {
                if (err) {
                    f1(iterator.throw(err))
                } else {
                    f1(iterator.next(data))
                }
            })
        }
    }
    f1(yieldResult)
}
generateAutomaticExecution(generatorCombineCurrying)
