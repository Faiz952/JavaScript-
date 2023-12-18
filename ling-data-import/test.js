const dm = require('@tl/ling-dmdb')
const mysql = require('@tl/ling-mysqldb')
const mssql = require('@tl/ling-mssqldb')
const oracle = require('@tl/ling-oracledb')
const moment = require("moment");
'use strict';
const client = new dm({
  host: '192.168.15.126',
  port: '5236',
  user: 'SYSDBA',
  password: 'SYSDBA',
  schema: 'TULINGV_EXAMPLE'
});

async function dmQuery() {
  const rows = await client.query('select * from test_xt');
  // const rows = await client.insert('')
  console.log(rows)
}
// dmQuery()
// 配置数据库连接
const config_sqjw_test = {
  server: '192.168.22.252',
  user: 'sa',
  password: 'tldsj!ms252sql*DB',
  database: 'SQJW_test',
  options: {
    /**
     * 是否开启TLS加密连接，如果要开启，而且你的node版本>=12，server属性值必须为域名，不支持ip地址格式。
     */
    encrypt: false,
  },
};

async function mssqlQuery() {
  const pool = await mssql.get('sqjw_test', config_sqjw_test)
  const result = await pool.query('select top 1 * from yourtablename order by createdon desc')
  console.log(new Date())
  console.log(result[0].createdon)
  console.log(moment(result[0].createdon).format('YYYY-MM-DD HH:mm:ss'))
}
mssqlQuery()

const db = new mysql({
  host: '192.168.15.133',
  port: 3306,
  user: 'root',
  password: 'TL#dsj!nwcsj1513323622',
  database: 'test'
})
async function mysqlQuery() {
  const where = {
    condition: {
      "is_del": "0",
    },
    combination: 'OR',
    extra: {}
  }
  // const res1 = await db.get("sys_user", where)
  console.log(await db.query('select * from test'))
}
// mysqlQuery()

async function oracleQuery() {

  // const data = await orcl.select('TEST_FKD',{where:{condition:{FKDBH:'169578540018000000000000000'}}});
  const obj = {
    id: 3076,
    name: 'zhangsan',
    floating: 23.32,
    uuid: '23874219243824329',
    // createdon: `TO_DATE('${moment('2023-10-12 12:12:12').format('YYYY-MM-DD HH:mm:ss')}', 'YYYY-MM-DD HH24:MI:SS')`
    createdon: '2023-10-12 12:12:12'
  }
  const orcl = await oracle.create({
    user: 'tuling',
    password: 'xcIDPe_1421#qox',
    connectString: '192.168.15.126:1521/ORCL'
  });
  console.log(await orcl.query(`select * from TEST_XT`))
  // const arr = [
  //   {field: 'TEST_DATETIME', type: 'DATETIME'},
  //   {field: 'TEST_DATE', type: 'DATE'},
  //   {field: 'TEST_TIME', type: 'TIME'},
  // ]
  // console.log(await orcl.createTable('TEST_TIME', arr))
}
// oracleQuery()



