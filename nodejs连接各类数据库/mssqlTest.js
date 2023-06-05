const sql = require('mssql')

const sqlConfig = {
    user: 'sa',
    password: 'x.t199876',
    database: 'SQJW',
    server: '192.168.253.128',
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },
    options: {
        encrypt: true, // for azure
        trustServerCertificate: true // change to true for local dev / self-signed certs
    }
}

async function test() {
    try {
        // make sure that any items are correctly URL encoded in the connection string
        await sql.connect(sqlConfig)
        const result = await sql.query(`select * from sqjw_bhrw`)
        let s = `insert into sqjw_bhrw (sqjw_name )values('${result.recordset[0].CreatedOn}')`
        console.log(await sql.query(s))
    } catch (err) {
        console.log(err)
    }
}

test()
