const bcrypt = require('bcryptjs');
const logger = require('../main/common/logger');

const SALT_ROUNDS = 10;

const hashPassword = async (password) => {
  try {
    return await bcrypt.hash(password, SALT_ROUNDS);
  } catch (err) {
    logger.error('Password hashing failed:', err);
    throw err;
  }
};

const comparePassword = async (password, hash) => {
  try {
    return await bcrypt.compare(password, hash);
  } catch (err) {
    logger.error('Password comparison failed:', err);
    throw err;
  }
};

module.exports = {
  hashPassword,
  comparePassword
};
