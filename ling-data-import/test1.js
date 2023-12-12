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
  // 'sourceDbScheme': '源数据库的dbScheme', // 可选，不填会使用默认的schema。mysql无schema，不填
  'sourceTable': 'YourTableName',
  'targetDbType': 'oracle',
  'targetDbConfig': {
    user: 'tuling',
    password: 'xcIDPe_1421#qox',
    connectString: '192.168.15.126:1521/ORCL'
  },
  'targetDbScheme': 'tuling', // 可选，不填会使用默认的schema。mysql无schema，不填
  'targetTable': '"test_imp"',
  'queryInfo': {
    'type': null, // 执行数据库查询的方式。若指定方法名，这会调用数据库组件对应方法，如果为 null 表示直接执行sql语句
    'info': 'select * from YourTableName'
  },
  'timestampField': '时间戳字段', // 记录此次同步的数据的最新时间
  'fieldsMap': new Map([['id', 'id'], ['name', 'name'], ['floating', 'floating'], ['uuid2', 'uuid'], ['createdon', 'createdOn']]), // 源表字段与目标表字段对应关系
  'sourcePrimaryKey': 'id', // 单字段主键用字符串，多字段主键用数组
  'runTime': '同步时间',
  'enable': '是否开启',
  'importType': '全量同步',
};
imp(obj)
