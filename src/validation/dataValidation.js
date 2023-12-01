/* eslint-disable no-unused-vars */
const validator = require('validator');
const { isExists, sanitization } = require('./sanitization');

const dataValid = async (valid, dt) => {
  const pesan = [];
  let dd = [];
  const data = await sanitization(dt);
  const message = await new Promise((resolve, reject) => {
    Object.entries(valid).forEach(async (item) => {
      const [key, value] = item;
      const validate = valid[key].split(',');
      // eslint-disable-next-line no-shadow, no-unused-vars
      dd = await new Promise((resolve, reject) => {
        const msg = [];
        validate.forEach((v) => {
          switch (v) {
            case 'required':
              if (!isExists(data[key])) {
                msg.push(`${key} is required`);
              } else if (isExists(data[key]) && validator.isEmpty(data[key])) {
                msg.push(`${key} is required`);
              }
              break;
            case 'isEmail':
              if (isExists(data[key]) && !validator.isEmail(data[key])) {
                msg.push(`${key} is invalid email`);
              }
              break;
            case 'isDecimal':
              if (isExists(data[key]) && !validator.isDecimal(data[key])) {
                msg.push(`${key} is invalid number`);
              }
              break;
            case 'isStrongPassword':
              if (
                isExists(data[key])
                && !validator.isStrongPassword(data[key])
              ) {
                msg.push(
                  `${key
                  } most be at least 8 characters, 1 uppercase, 1 lowercase, 1 number and 1 symbol`,
                );
              }
              break;
            default:
              break;
          }
        });
        resolve(msg);
      });
      pesan.push(...dd);
    });
    resolve(pesan);
  });
  return { message, data };
};

module.exports = { dataValid };
