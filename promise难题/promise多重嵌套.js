const p1 = new Promise(resolve => {
    console.log(1);
    resolve();
})

const p2 = p1.then(() => { // 1
    new Promise(resolve => {
        console.log(2);
        resolve();
    }).then(() => { // 2
        console.log(111);
    }).then(() => { // 4
        console.log(222);
    });
})
const p3 = p2.then(() => { // 3
    new Promise((resolve => {
        console.log(3);
        resolve()
    })).then(() => { // 5
        new Promise((resolve) => {
            console.log(4);
            resolve()
        }).then(() => { // 7
            console.log(333)
        }).then(() => { // 9
            console.log(444)
        })
    }).then(() => { // 8
        console.log(555);
    })
})
const p4 = p3.then(() => { // 6
    console.log(666);
})

console.log(p1, p2, p3, p4) // undefined,
// 1,2,111,3,222,4,666,333,555,444
