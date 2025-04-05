const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { createTokenPair, verifyJWT } = require('../auth/authUtils');
const emailModel = require('../models/email.model');
const EmailVerifier = require('email-verifier');
const KeyTokenService = require('./keyToken.service');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const { getInfoData } = require('../utils');
const {
  BadRequestError,
  AuthFailureError,
  ForbiddenError,
} = require('../core/error.response');
const { findByEmail } = require('./shop.service');
const randomstring = require('randomstring');
const usersModel = require('../models/users.model');
const redis = require('../redis');
const RoleShop = {
  SHOP: 'SHOP',
  WRITER: 'WRITER',
  EDITTOR: 'EDITTOR',
  ADMIN: 'ADMIN',
};
let globalVerificationCode = '';
class AccessService {
  static handleRefreshTokenV2 = async ({ user, keyStore, refreshToken }) => {
    const { userId, email } = user;

    if (keyStore.refreshTokensUsed.includes(refreshToken)) {
      await KeyTokenService.deleteKeyById(userId);
      throw new ForbiddenError('Something wrong happend !! Pls relogin');
    }

    if (keyStore.refreshToken !== refreshToken)
      throw new AuthFailureError('Shop not register 1');

    const foundShop = await findByEmail({ email });

    if (!foundShop) throw new AuthFailureError('Shop not register 2');

    const tokens = await createTokenPair(
      { userId: foundShop._id, email },
      keyStore.publicKey,
      keyStore.privateKey,
    );

    await keyStore.update({
      $set: {
        refreshToken: tokens.refreshToken,
      },
      $addToSet: {
        refreshTokensUsed: refreshToken,
      },
    });

    return {
      user,
      tokens,
    };
  };

  // static handleRefreshToken = async (refreshToken) => {
  //     const foundToken = await KeyTokenService.findByRefreshTokenUsed(refreshToken)
  //     if (foundToken) {
  //         const { userId, email } = await verifyJWT(refreshToken, foundToken.privateKey)
  //         console.log('[1] -- ', { userId, email })
  //         await KeyTokenService.deleteKeyById(userId)
  //         throw new ForbiddenError('Something wrong happend !! Pls relogin')
  //     }

  //     const holderToken = await KeyTokenService.findByRefreshToken(refreshToken)
  //     if (!holderToken) throw new AuthFailureError('Shop not register 1')

  //     const { userId, email } = await verifyJWT(refreshToken, holderToken.privateKey)

  //     console.log('[2] -- ', { userId, email })

  //     const foundShop = await findByEmail({ email })
  //     if (!foundShop) throw new AuthFailureError('Shop not register 2')

  //     const tokens = await createTokenPair(
  //         { userId: foundShop._id, email },
  //         holderToken.publicKey,
  //         holderToken.privateKey
  //     )

  //     await holderToken.update({
  //         $set: {
  //             refreshToken: tokens.refreshToken,
  //         },
  //         $addToSet: {
  //             refreshTokensUsed: refreshToken,
  //         },
  //     })

  //     return {
  //         user: { userId, email },
  //         tokens,
  //     }
  // }

  static logout = async (keyStore) => {
    const delKey = await KeyTokenService.removeKeyById(keyStore._id);
    console.log({ delKey });
    return delKey;
  };

  static login = async ({ email, password, refreshToken = null }) => {
    try {
      const foundShop = await findByEmail({ email });

      if (!foundShop) throw new BadRequestError('Shop not registered');

      if (foundShop.status == 'active') {
        const match = await bcrypt.compare(password, foundShop.password);

        if (!match) throw new AuthFailureError('Authentication error');

        const privateKey = crypto.randomBytes(64).toString('hex');
        const publicKey = crypto.randomBytes(64).toString('hex');

        const tokens = await createTokenPair(
          { userId: foundShop._id, email },
          publicKey,
          privateKey,
        );

        await KeyTokenService.createKeyToken({
          userId: foundShop._id,
          refreshToken: tokens.refreshToken,
          publicKey,
          privateKey,
        });

        return {
          shop: getInfoData(
            ['_id', 'name', 'email', 'roles', 'verify'],
            foundShop,
          ),
          tokens,
          status: 'Đăng Nhập Thành Công',
        };
      } else {
        return {
          status: 'Tài Khoản Bạn Đã Bị Khóa!!',
        };
      }
    } catch (error) {
      return {
        code: 'xxx',
        msg: error.message,
        status: 'error',
      };
    }
  };

  static loginFB_GG = async ({ name, email, password }) => {
    try {
      const holderShop = await usersModel.findOne({ email }).lean();
      if (holderShop) {
        const match = await bcrypt.compare(password, holderShop.password);

        if (!match) throw new AuthFailureError('Authentication error');

        const privateKey = crypto.randomBytes(64).toString('hex');
        const publicKey = crypto.randomBytes(64).toString('hex');

        const tokens = await createTokenPair(
          { userId: holderShop._id, email },
          publicKey,
          privateKey,
        );
        await KeyTokenService.createKeyToken({
          userId: holderShop._id,
          refreshToken: tokens.refreshToken,
          publicKey,
          privateKey,
        });

        return {
          shop: getInfoData(
            ['_id', 'name', 'email', 'roles', 'verify'],
            holderShop,
          ),
          tokens,
          status: 'Đăng Nhập Thành Công',
        };
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const newShop = await usersModel.create({
        name,
        email,
        password: passwordHash,
        roles: [RoleShop.SHOP],
      });

      if (newShop) {
        const privateKey = crypto.randomBytes(64).toString('hex');
        const publicKey = crypto.randomBytes(64).toString('hex');

        const tokens = await createTokenPair(
          { userId: newShop.id },
          publicKey,
          privateKey,
        );

        const publicKeyString = await KeyTokenService.createKeyToken({
          userId: newShop._id,
          publicKey,
          privateKey,
          refreshToken: tokens.refreshToken,
        });

        if (!publicKeyString) {
          return {
            code: 'xxxx',
            message: 'publicKeyString error',
          };
        }

        return {
          shop: getInfoData(['_id', 'name', 'email', 'verify'], newShop),
          tokens,
          status: 'success',
        };
      }

      return {
        code: 200,
        metadata: null,
      };
    } catch (error) {
      return {
        code: 'xxx',
        msg: error.message,
        status: 'error',
      };
    }
  };

  static async updateVerify({ id }) {
    const query = { _id: id };
    const updateSet = {
      $set: {
        verify: true,
      },
    };
    const updateCart = await usersModel.updateOne(query, updateSet);

    return updateCart;
  }

  static async updateCountMessage(paload) {
    const query = { _id: paload.id };

    const updateSet = {
      $set: {
        countMessage: paload.count,
      },
    };
    const updateCart = await usersModel.updateOne(query, updateSet);

    return updateCart;
  }

  static async updateRoles(params) {
    const query = { _id: params.id };
    const updateSet = {
      $set: {
        name: params.name,
        email: params.email,
        roles: params.roles,
      },
    };
    const updateCart = await usersModel.updateOne(query, updateSet);

    return updateCart;
  }

  static async getRoles({ userId }) {
    console.log({ userId });
    const user = await usersModel.findOne({ _id: userId }).lean();
    console.log({ user });
    return user.roles;
  }

  static signUp = async ({ name, email, password }) => {
    try {
      // Check if email already exists
      const holderShop = await usersModel.findOne({ email }).lean();
      if (holderShop) {
        return {
          msg: 'Email đã được đăng ký!!',
        };
      }

      // If email does not exist, proceed with signup logic
      const verificationCode = randomstring.generate(6);
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'ngoxuanquy1812@gmail.com',
          pass: 'bgoz fvvx raus cqjo', // Consider using environment variables for sensitive information
        },
      });

      const mailOptions = {
        from: 'ngoxuanquy1812@gmail.com',
        to: email,
        subject: 'Verification Code',
        text: `Your verification code is: ${verificationCode}`,
      };

      // Send verification code via email
      try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info);

        // Save verification code to database
        await redis.setex(`verify:${email}`, 60, verificationCode);
        console.log(`Verification code for ${email} saved to Redis`);

        return {
          code: 200,
          metadata: null,
        };
      } catch (error) {
        console.error('Error sending email:', error);

        return {
          msg: 'Email không tồn tại!!',
        };
      }
    } catch (error) {
      console.error('Database error:', error);

      return {
        code: 'xxx',
        msg: error.message,
        status: 'error',
      };
    }
  };
  static ResetPasswords = async ({ email, currentPassword, newPassword }) => {
    try {
      console.log('abcbcbcbc');
      // Assuming findByEmail returns a Mongoose model instance
      const foundShop = await usersModel.findOne({ email });

      console.log('Found shop:', foundShop); // Debugging statement

      if (!foundShop) {
        throw new BadRequestError('Shop not registered');
      }

      const match = await bcrypt.compare(currentPassword, foundShop.password);

      if (!match) {
        return {
          msg: 'Sai mật khẩu',
        };
      }

      foundShop.password = await bcrypt.hash(newPassword, 10); // Ensure bcrypt.hash() is awaited

      await foundShop.save();

      return {
        msg: 'Đổi mật khẩu thành công',
      };
    } catch (error) {
      // Handle errors here, log or throw as needed
      console.error('Error in ResetPassword:', error);
      throw error; // Re-throw the error or handle as appropriate
    }
  };

  static forgotPassword = async ({ email }) => {
    try {
      const holderShop = await usersModel.findOne({ email });
      console.log(holderShop);
      if (!holderShop) {
        console.log('Email not registered');
        return {
          msg: 'Gmail chưa được đăng ký!!',
        };
      }
      console.log('Shop found');

      const verificationCode = randomstring.generate(6);
      holderShop.password = await bcrypt.hash(verificationCode, 10);

      await holderShop.save();

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'ngoxuanquy1812@gmail.com',
          pass: 'bgoz fvvx raus cqjo', // Consider using environment variables for sensitive information
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Thay đổi mật khẩu',
        html: `<div>Mật khẩu mới của bạn là : <b> ${verificationCode}</b>
      <div>
      Vui lòng đừng quên nữa
      </div>
    </div>`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
          return {
            msg: 'Gmail không tồn tại!!',
          };
        } else {
          console.log('Email sent:', info.response);
        }
      });

      return {
        code: 200,
        metadata: null,
      };
    } catch (error) {
      console.error('Error in forgotPassword:', error);
      return {
        code: 'xxx',
        msg: error.message,
        status: 'error',
      };
    }
  };

  static verifile = async ({ email, password, code }) => {
    try {
      // Lấy mã xác thực từ Redis
      const storedCode = await redis.get(`verify:${email}`);
      console.log({ storedCode });

      // Kiểm tra xem mã có tồn tại không
      if (!storedCode) {
        return {
          message: 'Mã xác thực đã hết hạn hoặc tài khoản chưa đăng ký!',
        };
      }

      // So sánh mã người dùng nhập với mã trong Redis
      if (storedCode === code) {
        // Mã đúng, tiến hành tạo tài khoản
        const passwordHash = await bcrypt.hash(password, 10);
        console.log('Password hash:', passwordHash);

        const newShop = await usersModel.create({
          name: email,
          email,
          password: passwordHash,
          roles: [RoleShop.SHOP],
        });

        if (newShop) {
          // Tạo key pair và tokens
          const privateKey = crypto.randomBytes(64).toString('hex');
          const publicKey = crypto.randomBytes(64).toString('hex');
          const tokens = await createTokenPair(
            { userId: newShop._id },
            publicKey,
            privateKey,
          );

          // Lưu key token
          const publicKeyString = await KeyTokenService.createKeyToken({
            userId: newShop._id,
            publicKey,
            privateKey,
            refreshToken: tokens.refreshToken,
          });

          if (!publicKeyString) {
            return {
              code: 'xxxx',
              message: 'publicKeyString error',
            };
          }

          // Xóa mã xác thực trong Redis sau khi xác thực thành công
          await redis.del(`verify:${email}`);

          return {
            shop: getInfoData(['_id', 'name', 'email', 'verify'], newShop),
            tokens,
            status: 'success',
          };
        }
      } else {
        return {
          message: 'Sai mã xác thực!',
        };
      }
    } catch (error) {
      console.error('Verification error:', error);
      return {
        code: 'xxx',
        message: error.message,
        status: 'error',
      };
    }
  };
}

module.exports = AccessService;
