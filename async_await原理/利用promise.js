const fs = require('fs')
function readFileByPromise(pars) {
    return new Promise((resolve, reject) => {
        fs.readFile(...pars, (err, data) => {
            if (data) {
                resolve(data)
            } else {
                reject(err)
            }
        })
    })
}
function run() {
    readFileByPromise(['./file1', 'utf-8'])
        .then((data) => {
            return readFileByPromise([data, 'utf-8'])
        })
        .then((data) => {
            return readFileByPromise([data, 'utf-8'])
        })
        .then((data) => {
            console.log(data)
        })
        .catch(err => {
            console.log(err)
        }
    )
}
run()