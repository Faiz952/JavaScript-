const crypto = require('@tl/crypto');
let testdata = 'tltest123123'//原始数据
let inputkey = 'keyInfo'//一些密钥 不同的加密方法有不同格式的密钥  如果不填则使用组件自带的密钥
let data1 = crypto.md5.encrypt(testdata);//md5加密
let data2 = crypto.imitateBase64.encrypt(testdata,inputkey);//仿Base64编码数据转换加密
let _data2 = crypto.imitateBase64.decrypt(data2,inputkey);//仿Base64编码数据转换解密
let data3 = crypto.rsa.encrypt(testdata,inputkey);//RSA加密
let _data3 = crypto.rsa.decrypt(data3,inputkey);//RSA解密
let data4 = crypto.gmsm4.encrypt(testdata,inputkey);//国密SM4 ECB加密
let _data4 = crypto.gmsm4.decrypt(data4,inputkey);//国密SM4 ECB解密
let data5 = crypto.gmsm2.encrypt(testdata,inputkey);//国密SM2加密
let _data5 = crypto.gmsm2.decrypt(data5,inputkey);//国密SM2解密
let data6 = crypto.gmsm3.encrypt(data6);//国密SM3加密
crypto.gmsm4.validateKey(inputkey);//国密SM4密钥格式校验
crypto.gmsm4.generateKey();//国密SM4密钥获取
crypto.gmsm2.validateKey(inputkey,type);//国密SM2密钥格式校验 type密钥类型 0公钥1密钥 不填默认公钥
crypto.gmsm2.generateKey();//国密SM2密钥获取
crypto.rsa.validateKey(inputkey,type);//rsa密钥格式校验 type密钥类型 0公钥1密钥 不填默认公钥
crypto.rsa.generateKey();//rsa密钥获取
