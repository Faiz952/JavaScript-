// const placeholdersRegex = /\?+/g
//
// console.log(placeholdersRegex.exec('select ??, ??, ?? from tlv_s'))
// console.log(placeholdersRegex.exec('select ??, ??, ?? from tlv_s'))
// console.log(placeholdersRegex.exec('select ??, ??, ?? from tlv_s'))
// console.log(placeholdersRegex.exec('select ??, ??, ?? from tlv_s')
// let a = 8
// let b = 9
// [a, b] = [b, a]
// let c = "%z'' or 1 =\\_1%--''''s%"
// console.log(c.replace(/'/g, "''").replace(/\_/g, '\\_').replace(/\%/g, '\\%'))
// console.log(c.replace(/'/g, "''"))
let x = {
  columns: ['sqjw_bhrwTd', 'sqjw_name'],
  as: ['id', 'name'],
  where: {
    condition: {"field1": "a", "field2": ["a", "b", "c"], "field3": null, "field4": {"notnull": null},},
    combination: 'AND',
    extra: {
      condition: {
        "field5": {"like": "|a--%cd_"},
        "field6": {"notLike": "|a--%cd_"},
        "field7": {"gt": 1},
        "field8": {"gte": 1},
      },
      combination: 'OR',
      extra: {
        condition: {
          "field9": {"lt": 1},
          "field10": {"lte": 1},
          "field11": {"notEqual": "1"},
          "field12": {"notIn": ["a", "b", "c"]}
        }, combination: 'AND', extra: {}
      }
    },
    order: [['createdOn', 'desc'], ['modifiedOn', 'asc']],
    limit: 3,
    offset: 10
  }
}

