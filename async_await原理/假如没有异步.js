const fs = require('fs')
function f() {
    let a,b,c
    fs.readFile('./file1', 'utf-8', (err, data) => {
        if (data) {
            a = data
        } else {
            throw err
        }
    })
    fs.readFile(a, 'utf-8', (err, data) => {
        if (data) {
            b = data
        } else {
            throw err
        }
    })
    fs.readFile(b, 'utf-8', (err, data) => {
        if (data) {
            c = data
        } else {
            throw err
        }
    })
    console.log(c)
}
f()