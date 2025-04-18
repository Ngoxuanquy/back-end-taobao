const { Types } = require('mongoose')
const keytokenModel = require('../models/keytoken.model')

class KeyTokenService {
    static createKeyToken = async ({ userId, publicKey, privateKey, refreshToken }) => {
        try {
            // v1
            // const tokens = await keytokenModel.create({
            //     user: userId,
            //     publicKey,
            //     privateKey,
            // })

            // return tokens ? tokens.publicKey : null

            /* ------------------------ */

            // v2

            const filter = { user: userId },
                update = {
                    publicKey,
                    privateKey,
                    refreshTokensUsed: [],
                    refreshToken,
                },
                options = { upsert: true, new: true }

            const tokens = await keytokenModel.findOneAndUpdate(filter, update, options)

            return tokens ? tokens.publicKey : null
        } catch (error) {
            return error
        }
    }

    static findByUserId = async (userId) => {
        return await keytokenModel.findOne({ user: Types.ObjectId(userId) })
    }

    static removeKeyById = async (id) => {
        return await keytokenModel.remove(id)
    }

    static findByRefreshTokenUsed = async (refreshToken) => {
        return await keytokenModel.findOne({ refreshTokensUsed: refreshToken }).lean()
    }

    static findByRefreshToken = async (refreshToken) => {
        return await keytokenModel.findOne({ refreshToken })
    }

    static deleteKeyById = async (userId) => {
        return await keytokenModel.deleteOne({ user: Types.ObjectId(userId) })
    }
}

module.exports = KeyTokenService