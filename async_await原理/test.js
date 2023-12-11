const fs = require('fs')
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
async function generatorCombinePromise() {
    try {
        let a = await readFileByPromise(['./file1', 'utf-8'])
        let b = await readFileByPromise([a, 'utf-8'])
        let c = await readFileByPromise([b, 'utf-8'])
        console.log(c)
    } catch (e) {
        console.log(e)
    }
}
generatorCombinePromise()
