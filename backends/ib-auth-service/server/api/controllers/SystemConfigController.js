const SystemConfigService = require('../services/SystemConfigService');
const logger = require('../../main/common/logger');

exports.findAll = async (req, res) => {
    try {
        const configs = await SystemConfigService.getAll();
        return res.json({
            success: true,
            docs: configs,
            pagination: {
                totalItems: configs.length,
                totalPages: 1,
                currentPage: 1,
                itemsPerPage: configs.length
            }
        });
    } catch (err) {
        logger.error('Find all system configs controller error:', err);
        return res.status(500).json({ success: false, errors: [err.message] });
    }
};

exports.update = async (req, res) => {
    try {
        const { key, value, description } = req.body;

        // Support both param id and body key
        const targetKey = key || req.params.id; // Many MFEs use key as ID in params

        if (!targetKey) {
            return res.status(400).json({
                success: false,
                errors: ['Config key is required']
            });
        }

        const config = await SystemConfigService.upsert(targetKey, value, description);

        return res.json({
            success: true,
            doc: config
        });
    } catch (err) {
        logger.error('Update system config controller error:', err);
        return res.status(500).json({ success: false, errors: [err.message] });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        await SystemConfigService.delete(id);
        return res.json({ success: true });
    } catch (err) {
        logger.error('Delete system config controller error:', err);
        return res.status(500).json({ success: false, errors: [err.message] });
    }
};
