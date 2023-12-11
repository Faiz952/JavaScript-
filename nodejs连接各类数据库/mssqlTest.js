const sql = require('mssql')

// 配置数据库连接
const config = {
    server: '192.168.22.252',
    user: 'sa',
    password: 'tldsj!ms252sql*DB',
    // database: 'SQJW',
    options: {
        encrypt: false, // 关闭TLS加密连接
    },
};

async function test() {
    try {
        // make sure that any items are correctly URL encoded in the connection string
        await sql.connect(config)
        console.log(await sql.query(`use sqjw`))
        // await sql.query(`use dbo;`)
        const result = await sql.query(`select * from sqjw_bhrw`)
        console.log(result)
    } catch (err) {
        console.log(err)
    }
}

test()
