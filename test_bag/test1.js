const crypto1= require('@tl/crypto');
const crypto = require('crypto');
// 128位密钥，以16进制字符串表示
const key = Buffer.from('00112233445566778899aabbccddeeff', 'hex');
console.log(key)
// 待加密的数据，以Buffer对象表示
const plaintext = Buffer.from('Hello, SM4!', 'utf-8');

// 创建SM4 Cipher对象，mode参数为'ecb'表示电子密码本模式
const cipher = crypto.createCipheriv('sm4-ecb', key, null);

// 加密数据
let encryptedBuffer = cipher.update(plaintext);
encryptedBuffer = Buffer.concat([encryptedBuffer, cipher.final()]);

console.log('Encrypted:', encryptedBuffer.toString('hex'));

// 创建SM4 Decipher对象，mode参数同样为'ecb'
const decipher = crypto.createDecipheriv('sm4-ecb', key, null);

// 解密数据
let decryptedBuffer = decipher.update(encryptedBuffer);
decryptedBuffer = Buffer.concat([decryptedBuffer, decipher.final()]);

console.log('Decrypted:', decryptedBuffer.toString('utf-8'));

