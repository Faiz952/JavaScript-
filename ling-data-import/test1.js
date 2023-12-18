const imp = require('./index')
let obj = {
  'sourceDbType': 'mssql', // dm|mssql|mysql|oracle
  'sourceDbConfig': {
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
  },
  // 'sourceDbSchema': '源数据库的dbSchema', // 可选，不填会使用默认的schema。mysql无schema，不填
  'sourceTable': 'yourtablename',
  'targetDbType': 'mssql',
  'targetDbConfig': {
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
  },
  // 'targetDbSchema': '目标数据库的dbSchema', // 可选，不填会使用默认的schema。mysql无schema，不填
  'targetTable': 'test_imp',
  'queryInfo': { // 传入的查询信息应该只负责查询出本次要同步的数据，不应该涉及分页与排序
    'type': 'select',
    'info': ['yourtablename', {columns: ['*'], where:{condition: {
          createdon: {"gte": '2023-12-18 15:51:06.163'} //条件放在where里面就拼接在主条件where中
        }}}]
  },
  'timestampField': 'createdon', // 如果是全量同步：指定源表分页查询时排序的字段（有时间戳用时间戳，没时间戳用其他可以排序的字段）；如果是增量同步，指定源表的时间戳字段
  'fieldsMap': new Map([['id', 'sqjw_id'], ['name', 'sqjw_name'],['floating', 'sqjw_floating'],['createdon', 'createdon'],['uuid', 'sqjw_uuid']]), // 源表字段与目标表字段对应关系
  'sourcePrimaryKey': 'uuid', // 单字段主键用字符串，多字段主键用数组
  'runTime': '同步时间',
  'enable': '是',
  'importType': '增量同步',
  'pageSize': '5' // 同步分页大小，默认1000
}
imp(obj).then((x) => {
  console.log(x)
})
