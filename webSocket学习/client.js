const WebSocket = require('ws');

const socket = new WebSocket('ws://localhost:8080/');

socket.on('open', () => {
    console.log('WebSocket 连接已建立！');
    socket.send('Hello, WebSocket!');
});

socket.on('message', (message) => {
    console.log(`接收到消息：${message}`);
});

socket.on('close', (code, reason) => {
    console.log(`WebSocket 连接已关闭，code: ${code}, reason: ${reason}`);
});

socket.on('error', (error) => {
    console.error(`WebSocket 连接发生错误: ${error}`);
});
