// TCP 四层

// 应用层
function apply(data) {
    // 处理数据
    function dispose(data) {
        // 处理数据
        // 处理。。。
        return data
    }

    data = dispose(data)
    // 发送给目标应用层
    console.log('应用层收到数据：')
    console.log('应用层开始发送' + data)
    setTimeout(() => apply.send(data), 3000)


}

// 传输层
function transfer(data) {
    // 加上传输层首部
    data = '{传输层首部}' + data
    // 发送给目标传输层
    console.log('传输层收到数据：')
    console.log('传输层开始发送' + data)
    setTimeout(() => transfer.send(data), 3000)
}

// 应用层调发送其实是调传输层
apply.send = transfer

// 网际层
function net(data) {
    // 加上网际层首部（本机和目标IP地址等。。）
    data = '{网际层首部}' + data
    // 发送给目标网际层
    console.log('网际层收到数据：')
    console.log('网际层开始发送' + data)
    setTimeout(() => net.send(data), 3000)
}

// 传输层的发送实际上是调网际层
transfer.send = net

// 网络接口层
function networkInterface(data) {
    // 地址解析协议（ARP）:
    // 加上网络接口层的首部和尾部（硬件地址等）
    data = '{网络接口层首部}' + data + '{网络接口层尾部}'
    console.log('网络接口层收到数据：')
    console.log('网络接口层开始发送' + data)
    setTimeout(() => networkInterface.send(data), 3000)
}

net.send = networkInterface
networkInterface.send = function (data) {
    console.log('正在发送。。。')
    setTimeout(() => console.log('发送成功'), 4000)
}

apply('account=1093868095&password=XT199876')