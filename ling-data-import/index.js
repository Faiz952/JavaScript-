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
  'queryInfo': { // 传入的查询信息应该只负责查询出本次要同步的数据，不应该涉及分页与排序
    'type': 'select' || 'selectWithJoin',
    'info': ['table', 'options']
  },
  'timestampField': '时间戳字段', // 如果是全量同步：指定分页查询时排序的字段（有时间戳用时间戳，没时间戳用其他可以排序的字段）；如果是增量同步，指定源表的时间戳字段
  'fieldsMap': new Map([['sourTabFie1', 'tarTabFie1'], ['sourTabFie2', 'tarTabFie2']]), // 源表字段与目标表字段对应关系
  'sourcePrimaryKey': '源表主键' || ['源表主键1', '源表主键2', '源表主键3...'], // 单字段主键用字符串，多字段主键用数组
  'runTime': '同步时间',
  'enable': '是否开启',
  'importType': '全量同步'||'增量同步',
  'pageSize': '1000' // 同步分页大小，默认1000
}
async function dataImport(obj) {
  // 源数据库连接
  const sourceCon = await getCon(obj.sourceDbType, obj.sourceDbConfig)
  // 目标数据库连接
  const targetCon = await getCon(obj.targetDbType, obj.targetDbConfig)
  // 若未指定分页大小，则默认 1000
  obj.queryInfo.info[1].limit = obj.pageSize || 1000
  // 是否指定 schema
  let table = ''
  if (obj.targetDbSchema) {
    table = obj.targetDbSchema + '.' + obj.targetTable
  } else {
    table = obj.targetTable
  }
  if (obj.importType === '全量同步') {
    // 给 options 添加排序属性
    if (obj.timestampField) {
      obj.queryInfo.info[1].order = [[obj.timestampField, 'asc']]
    }
    // 清空表
    await targetCon.query(`delete from ${table}`)
    // 初始页码
    let page = 0
    do {
      obj.queryInfo.info[1].offset = page * obj.pageSize
      // 调用数据库组件对应方法查出数据
      const result = await sourceCon[obj.queryInfo.type](...obj.queryInfo.info)
      // 插入数据
      for (const row of result) {
        const targetRow = {}
        for (const key of Object.keys(row)) {
          if (obj.fieldsMap.get(key)) {
            targetRow[obj.fieldsMap.get(key)] = row[key] instanceof Date
              ? moment(row[key]).format('YYYY-MM-DD HH:mm:ss')
              : row[key]
          }
        }
        await targetCon.insert(table, targetRow)
      }
      if (result.length < obj.pageSize) break
      page++
    } while (true)
  }
  if (obj.importType === '增量同步') {
    // 给 options 添加排序属性
    if (obj.timestampField) {
      obj.queryInfo.info[1].order = [[obj.timestampField, 'asc']]
    } else {
      throw new Error('[ling-data-import]:未指定时间戳字段。')
    }
    // 同步的最后一条时间戳
    let timestamp = undefined
    // 初始页码
    let page = 0
    // 初始页码
    do {
      obj.queryInfo.info[1].offset = page * obj.pageSize
      // 调用数据库组件对应方法查出数据
      const result = await sourceCon[obj.queryInfo.type](...obj.queryInfo.info)
      // 插入数据
      for (const row of result) {
        // 去重
        const where = {
          condition: {}
        }
        if (!obj.sourcePrimaryKey) {
          throw new Error('[ling-data-import]:源表未指定主键。')
        }
        if (!Array.isArray(obj.sourcePrimaryKey)) {
          obj.sourcePrimaryKey = [obj.sourcePrimaryKey]
        }
        {
          for (const primaryKey of obj.sourcePrimaryKey) {
            const key = obj.fieldsMap.get(primaryKey)
            where.condition[key] = row[primaryKey]
          }
        }
        targetCon.delete(obj.targetTable, where)
        const targetRow = {}
        for (const key of Object.keys(row)) {
          if (obj.fieldsMap.get(key)) {
            targetRow[obj.fieldsMap.get(key)] = row[key] instanceof Date
              ? moment(row[key]).format('YYYY-MM-DD HH:mm:ss')
              : row[key]
          }
        }
        await targetCon.insert(table, targetRow)
      }
      if (result.length === 0) break
      if (result.length && result.length < obj.pageSize) {
        // 更新时间戳
        timestamp = result[result.length-1][obj.timestampField]
        break
      }
      timestamp = result[result.length-1][obj.timestampField]
      page++
    } while (true)
    return timestamp && moment(timestamp).format('YYYY-MM-DD HH:mm:ss')
  }
}
module.exports = dataImport
