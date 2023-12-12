const dm = require('@tl/ling-dmdb')
const mysql = require('@tl/ling-mysqldb')
const mssql = require('@tl/ling-mssqldb')
const oracle = require('@tl/ling-oracledb')
const moment = require('moment')

async function getCon(type, config) {
  // 数据库连接对象
  let con = null
  switch (type) {
    case 'dm':
      con = new dm(config)
      break;
    case 'mssql':
      con = await mssql.get('import_con', config)
      break;
    case 'mysql':
      con = new mysql(config)
      break;
    case 'oracle':
      con = await oracle.create(config)
      break;
  }
  return con
}
let obj = {
  'sourceDbType': '源数据库种类', // dm|mssql|mysql|oracle
  'sourceDbConfig': '源数据库连接配置',
  'sourceDbSchema': '源数据库的dbSchema', // 可选，不填会使用默认的schema。mysql无schema，不填
  'sourceTable': '源表',
  'targetDbType': '目标数据库种类',
  'targetDbConfig': '目标数据库连接配置',
  'targetDbSchema': '目标数据库的dbSchema', // 可选，不填会使用默认的schema。mysql无schema，不填
  'targetTable': '目标表',
  'queryInfo': {
    'type': 'select' || 'selectWithJoin', // 执行数据库查询的方法
    'info': ['table', 'options'] // 方法的参数
  },
  'timestampField': '时间戳字段', // 记录此次同步的数据的最新时间
  'fieldsMap': new Map([['sourTabFie1', 'tarTabFie1'], ['sourTabFie2', 'tarTabFie2']]), // 源表字段与目标表字段对应关系
  'sourcePrimaryKey': '源表主键' || ['源表主键1', '源表主键2', '源表主键3...'], // 单字段主键用字符串，多字段主键用数组
  'runTime': '同步时间',
  'enable': '是否开启',
  'importType': '全量同步'||'增量同步',
};
async function dataImport(obj) {
  // 源数据库连接
  const sourceCon = await getCon(obj.sourceDbType, obj.sourceDbConfig)
  // 目标数据库连接
  const targetCon = await getCon(obj.targetDbType, obj.targetDbConfig)
  // 获取源表数据
  const sourceData = await getData(obj, sourceCon)
  // 插入数据到目标表
  await outputData(sourceData, obj, targetCon)
}

async function getData(obj, sourceCon) {
  // 从源表获取数据
  let sourceData = null
  if (obj.queryInfo.type) {
    // 调用数据库组件对应方法
    sourceData = await sourceCon[obj.queryInfo.type](...obj.queryInfo.info)
  } else {
    // 直接执行sql语句
    sourceData = sourceCon.query(obj.queryInfo.info)
  }
  return sourceData
}
async function outputData(sourceData, obj, targetCon) {
  // 是否指定 schema
  let table = ''
  if (obj.targetDbSchema) {
    table = obj.targetDbSchema + '.' + obj.targetTable
  } else {
    table = obj.targetTable
  }
  if (obj.importType === '全量同步') {
    // 先清空表
    await targetCon.query(`delete from ${table}`)
    for (const row of sourceData) {
      const targetRow = {}
      for (const key of Object.keys(row)) {
        if (obj.fieldsMap.get(key)) {
          targetRow[obj.fieldsMap.get(key)] = row[key]
        }
      }
      await targetCon.insert(table, targetRow)
    }
  } else if (obj.importType === '增量同步') {
    for (const row of sourceData) {
      // 根据主键去重
      await deleteByPrimaryKey(targetCon, table, obj.sourcePrimaryKey, row, obj.fieldsMap)
      const targetRow = {}
      for (const key of Object.keys(row)) {
        if (obj.fieldsMap.get(key)) {
          targetRow[obj.fieldsMap.get(key)] = row[key]
        }
      }
      await targetCon.insert(table, targetRow)
      await insertRow(targetRow, table, targetCon, obj.targetDbType)
    }
  }
}

/**
 * 往指定表插入一条记录
 * @param {object} targetRow 记录信息
 * @param {string} table 表名
 * @param {object} targetCon 目标数据库连接
 * @param {string} dbType 目标数据库类型
 * @return {Promise<void>}
 */
async function insertRow(targetRow, table, targetCon, dbType) {
  // 插入指定表sql字段列表字符串
  let fields = '';
  // 插入指定表sql值列表字符串
  let values = '';
  // 循环拼接
  for (const dataInstanceKey in targetRow) {
    fields = fields + dataInstanceKey + ',';
    if (targetRow[dataInstanceKey] instanceof Date) {
      // oracle 的日期转换需特殊处理
      if (dbType.toLowerCase() === 'oracle') {
        values = values
          + `TO_DATE('${moment(targetRow[dataInstanceKey]).format('YYYY-MM-DD HH:mm:ss')}', 'YYYY-MM-DD HH24:MI:SS')`
          + ','
      } else {
        values = values + "'"+moment(targetRow[dataInstanceKey]).format('YYYY-MM-DD HH:mm:ss')+"'" + ','
      }
    } else {
      values = values + `${targetRow[dataInstanceKey] === null ? null : "'"+ targetRow[dataInstanceKey]+"'"}` + ','
    }
  }
  // 去掉尾部','号
  fields = fields.slice(0, -1);
  // 去掉尾部','号
  values = values.slice(0, -1);
  // 拼接sql
  const sql = `
			insert into ${table} (
				${fields}
			) values (
			  ${values}
			)
	`;
  await targetCon.query(sql)
}

/**
 * 根据主键删除记录
 * @param dbCon 数据库连接
 * @param table 表名
 * @param primaryKey 主键
 * @param row 一条记录
 * @param fieldsMap 源表与目标表 map
 */
async function deleteByPrimaryKey(dbCon, table, primaryKey, row, fieldsMap) {
  if (Array.isArray(obj.sourcePrimaryKey) && obj.sourcePrimaryKey.length > 0) {
    // 根据主键查询记录是否存在
    let sql = `select 1 from ${table} where `
    const whereSql = []
    for (const primaryKey of obj.sourcePrimaryKey) {
      const key = fieldsMap.get(primaryKey)
      // 主键类型一般都是字符串或数字
      whereSql.push(`${key} = ` + typeof row[primaryKey] === 'string' ? "'" + row[primaryKey] + "'" : row[primaryKey])
    }
    sql = sql + whereSql.join(' AND ')
    await dbCon.query(sql)
  } else if (typeof primaryKey === 'string') {
    let sql = `select 1 from ${table} where `
    const key = fieldsMap.get(primaryKey)
    // 主键类型一般都是字符串或数字
    sql = sql + `${key} = ` + typeof row[primaryKey] === 'string' ? "'" + row[primaryKey] + "'" : row[primaryKey]
    await dbCon.query(sql)
  }
}

module.exports = dataImport
