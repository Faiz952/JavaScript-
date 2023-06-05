const fs = require('fs')
function run() {
    fs.readFile('./file1', 'utf-8', (err, data) => {
        if (data) {
            fs.readFile(data, 'utf-8', (err, data) => {
                if (data) {
                    fs.readFile(data, 'utf-8', (err, data) => {
                        if (data) {
                            console.log(data)
                        } else {
                            throw err
                        }
                    })
                } else {
                    throw err
                }
            })
        } else {
            throw err
        }
    })
}
run()
