const obj1 = require('./b')
const obj2 = require('./c')
console.log('D:导入B、C模块')
console.log(obj1 === obj2)
