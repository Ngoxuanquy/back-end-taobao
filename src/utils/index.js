const lodash = require('lodash')
const { Types } = require('mongoose')

const convertToObjectIdMongodb = (id) => new Types.ObjectId(id)

const getInfoData = (fileds, object) => {
    return lodash.pick(object, fileds)
}

const getSelectData = (select = []) => {
    return Object.fromEntries(select.map((el) => [el, 1]))
}

const unGetSelectData = (select = []) => {
    return Object.fromEntries(select.map((el) => [el, 0]))
}

const removeUndefinedObject = (obj) => {
    Object.keys(obj).forEach((k) => {
        if (obj[k] === null || obj[k] === undefined) {
            delete obj[k]
        }
    })
    return obj
}

const updateNestedObjectParser = (obj) => {
    const final = {}
    Object.keys(obj).forEach((k) => {
        if (typeof obj[k] === 'Object' && !Array.isArray(obj[k])) {
            const response = updateNestedObjectParser(obj[k])
            Object.keys(response).forEach((a) => {
                final[`${k}.${a}`] = res[a]
            })
        } else {
            final[k] = obj[k]
        }
    })
    return final
}

module.exports = {
    getInfoData,
    getSelectData,
    unGetSelectData,
    removeUndefinedObject,
    updateNestedObjectParser,
    convertToObjectIdMongodb,
}