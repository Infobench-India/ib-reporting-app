const activationService = require('../../services/activationService');

async function getMachineId(req, res) {
  try {
    const id = activationService.getMachineId();
    return res.json({ machineId: id });
  } catch (err) {
    return res.status(500).json({ error: 'failed-to-get-machine-id', message: err.message });
  }
}

async function activate(req, res) {
  try {
    if (!req.file || !req.file.buffer) return res.status(400).json({ error: 'no-file' });
    const content = req.file.buffer.toString('utf8');
    const result = activationService.activate(content);
    if (!result.valid) return res.status(400).json({ error: 'invalid-license', reason: result.reason, details: result.error });
    return res.json({ success: true, savedTo: result.savedTo });
  } catch (err) {
    return res.status(500).json({ error: 'activation-failed', message: err.message });
  }
}

async function getStatus(req, res) {
  try {
    const status = activationService.isActivated();
    if (status.activated) return res.json({ activated: true, payload: status.payload });
    return res.status(403).json({ activated: false, reason: status.reason });
  } catch (err) {
    return res.status(500).json({ error: 'status-check-failed', message: err.message });
  }
}

module.exports = {
  getMachineId,
  activate,
  getStatus,
};
