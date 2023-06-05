const WebSocket = require('ws');

const server = new WebSocket.Server({ port: 8081 });

server.on('connection', (socket) => {
    console.log('有新的 WebSocket 连接');

    socket.on('message', (message) => {
        console.log(`接收到消息：${message}`);
        socket.send(`服务器已接收到消息：${message}`);
    });

    socket.on('close', () => {
        console.log('WebSocket 连接已关闭');
    });

    socket.on('error', (error) => {
        console.error(`WebSocket 连接发生错误: ${error}`);
    });
});



console.log('WebSocket 服务器已启动，监听端口 8080');
