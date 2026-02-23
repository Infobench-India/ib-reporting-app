const { checkActivation } = require('../utils/activationCheck');

async function requireActivation(req, res, next) {
  try {
    const status = await checkActivation();
    console.log('Activation status check:', status);
    if (!status.activated) return res.status(403).json({ error: 'not-activated', reason: status.reason });
    // attach payload if needed
    req.activation = status.payload || {};
    next();
  } catch (err) {
    return res.status(500).json({ error: 'activation-check-failed' });
  }
}

module.exports = { requireActivation };
