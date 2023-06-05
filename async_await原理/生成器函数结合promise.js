const fs = require('fs')
const co = require('co')
function readFileByPromise(pars) {
    return new Promise((resolve, reject) => {
        fs.readFile(...pars, (err, data) => {
            if (err) {
                reject(err)
            } else {
               resolve(data)
            }
        })
    })
}
function * generatorCombinePromise() {
    try {
        let a = yield readFileByPromise(['./file1', 'utf-8'])                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
        let b = yield readFileByPromise([a, 'utf-8'])
        let c = yield readFileByPromise([b, 'utf-8'])
        console.log(c)
    } catch (e) {
        console.log(e)
    }
}
function f1(f) {
    const iterator = f()
    const result = iterator.next()
    function f2(result) {
        if (!result.done) {
            result.value.then(data => {
                f2(iterator.next(data))
            }, err => {
                f2(iterator.throw(err))
            })
        }
    }
    f2(result)
}
// f1(generatorCombinePromise)
co(generatorCombinePromise)
