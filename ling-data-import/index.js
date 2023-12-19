const dm = require('@tl/ling-dmdb')
const mysql = require('@tl/ling-mysqldb')
const mssql = require('@tl/ling-mssqldb')
const oracle = require('@tl/ling-oracledb')
const moment = require('moment')

/**
 * 获取数据库连接
 * @param {string} type - 数据库类型：dm|mssql|mysql|oracle
 * @param {object} config - 数据库连接配置
 * @return {Promise<dbCon>} - 数据库连接对象
 */
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

/**
 * 根据配置同步数据并记录日志
 * @param {object} config - 同步数据配置信息
 * @param {function} logFunc - 日志函数
 * @return {Promise<undefined|string>} - 全量同步返回 undefined ,增量同步返回同步的最新的记录的时间戳
 */
async function dataImport(config, logFunc) {
  // 日志
  const logInfo = {
    beginTime: moment().format('YYYY-MM-DD HH:mm:ss'),
    endTime: null,
    state: null,
    details: null
  }
  // 源数据库连接
  let sourceCon = null
  // 目标数据库连接
  let targetCon = null
  try {
    sourceCon = await getCon(config.sourceDbType, config.sourceDbConfig)
    targetCon = await getCon(config.targetDbType, config.targetDbConfig)
    // 若未指定分页大小，则默认 1000
    config.queryInfo.info[1].limit = config.pageSize || 1000
    // 同步的最后一条时间戳
    let timestamp = undefined
    // 是否指定 schema
    if (config.importType === '全量同步') {
      // 同步数据量
      let rows = 0
      // 给 options 添加排序属性
      if (config.timestampField) {
        config.queryInfo.info[1].order = [[config.timestampField, 'asc']]
      }
      // 清空表
      await targetCon.query(`delete from ${config.targetTable}`)
      // 初始页码
      let page = 0
      do {
        config.queryInfo.info[1].offset = page * config.pageSize
        // 调用数据库组件对应方法查出数据
        const result = await sourceCon[config.queryInfo.type](...config.queryInfo.info)
        // 插入数据
        for (const row of result) {
          const targetRow = {}
          for (const key of Object.keys(row)) {
            if (config.fieldsMap.get(key)) {
              targetRow[config.fieldsMap.get(key)] = row[key] instanceof Date
                ? moment(row[key]).format('YYYY-MM-DD HH:mm:ss')
                : row[key]
            }
          }
          await targetCon.insert(config.targetTable, targetRow)
          rows++
        }
        if (result.length < config.pageSize) break
        page++
      } while (true)
      logInfo.details = `全量同步执行成功，同步到${rows}条数据。`
    }
    if (config.importType === '增量同步') {
      let rows = 0
      // 给 options 添加排序属性
      if (config.timestampField) {
        config.queryInfo.info[1].order = [[config.timestampField, 'asc']]
      } else {
        throw new Error('[ling-data-import]:未指定时间戳字段。')
      }
      // 初始页码
      let page = 0
      // 初始页码
      do {
        config.queryInfo.info[1].offset = page * config.pageSize
        // 调用数据库组件对应方法查出数据
        const result = await sourceCon[config.queryInfo.type](...config.queryInfo.info)
        // 插入数据
        for (const row of result) {
          // 去重
          const where = {
            condition: {}
          }
          if (!config.sourcePrimaryKey) {
            throw new Error('[ling-data-import]:源表未指定主键。')
          }
          if (!Array.isArray(config.sourcePrimaryKey)) {
            config.sourcePrimaryKey = [config.sourcePrimaryKey]
          }
          {
            for (const primaryKey of config.sourcePrimaryKey) {
              const key = config.fieldsMap.get(primaryKey)
              where.condition[key] = row[primaryKey]
            }
          }
          await targetCon.delete(config.targetTable, where)
          const targetRow = {}
          for (const key of Object.keys(row)) {
            if (config.fieldsMap.get(key)) {
              targetRow[config.fieldsMap.get(key)] = row[key] instanceof Date
                ? moment(row[key]).format('YYYY-MM-DD HH:mm:ss')
                : row[key]
            }
          }
          await targetCon.insert(config.targetTable, targetRow)
          rows++
        }
        if (result.length === 0) break
        if (result.length && result.length < config.pageSize) {
          // 更新时间戳
          timestamp = result[result.length-1][config.timestampField]
          break
        }
        timestamp = result[result.length-1][config.timestampField]
        page++
      } while (true)
      logInfo.details = `增量同步执行成功，同步到${rows}条数据。`
    }
    closeCon(config.sourceDbType, sourceCon)
    closeCon(config.targetDbType, targetCon)
    // 日志
    logInfo.endTime = moment().format('YYYY-MM-DD HH:mm:ss')
    logInfo.state = 0
    logFunc(logInfo)
    return timestamp && moment(timestamp).format('YYYY-MM-DD HH:mm:ss')
  } catch (e) {
    // 关闭连接池
    if (sourceCon) closeCon(config.sourceDbType, sourceCon)
    if (targetCon) closeCon(config.targetDbType, targetCon)
    // 日志
    logInfo.endTime = moment().format('YYYY-MM-DD HH:mm:ss')
    logInfo.state = 1
    logInfo.details = e.toString()
    logFunc(logInfo)
  }
}

/**
 * 关闭数据库连接
 * @param {string} type - 数据库类型：dm|mssql|mysql|oracle
 * @param {object} con - 数据库连接
 */
function closeCon(type, con) {
  switch (type) {
    case 'dm':
      // con.close()
      break;
    case 'mssql':
      con.close()
      break;
    case 'mysql':
      // con.close()
      break;
    case 'oracle':
      // con.close()
      break;
  }
}
module.exports = dataImport
