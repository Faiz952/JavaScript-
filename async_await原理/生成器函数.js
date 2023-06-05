function * f(x) {

    let a = yield 2*x

    let b = yield x*2

    try {
        let c = yield b*3
        console.log(c)
    } catch (e) {
        console.log(e)
    }
    console.log('执行结束')
}

const iterator = f(1)
let result1 = iterator.next() // { value: 2, done: false }
console.log(result1)
let result2 = iterator.next(1) // { value: 8, done: false }
console.log(result2)
let result3 = iterator.next(5) // { value: 15, done: false }
console.log(result3)
let result4 = iterator.throw(new Error('这是一个错误')) // { value: undefined, done: true }