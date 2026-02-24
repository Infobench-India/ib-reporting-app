const axios = require('axios');
const logger = require('../main/common/logger');

const AUTH_SERVICE_URL = process.env.VITE_AUTH_API_URL || 'http://localhost:3051/api/auth';

let cachedLicense = null;
let lastCheck = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getLicenseStatus = async () => {
    const now = Date.now();
    if (cachedLicense && (now - lastCheck < CACHE_TTL)) {
        return cachedLicense;
    }

    try {
        const response = await axios.get(`${AUTH_SERVICE_URL}/activation/status`);
        cachedLicense = response.data;
        lastCheck = now;
        return cachedLicense;
    } catch (error) {
        logger.error('Failed to fetch license status:', error.message);
        return { activated: false, reason: 'error-fetching-status' };
    }
};

const checkFeature = (featureName) => {
    return async (req, res, next) => {
        const status = await getLicenseStatus();

        if (!status.activated) {
            return res.status(403).json({
                error: 'License Required',
                message: 'Application is not activated. Please upload a valid license.',
                reason: status.reason
            });
        }

        const features = status.payload?.features || {};

        // Check if the specific feature is enabled
        if (featureName && !features[featureName]) {
            return res.status(403).json({
                error: 'Feature Locked',
                message: `The feature "${featureName}" is not included in your current license.`,
                upsell: 'Contact Infobench Solutions LLP to upgrade your license.'
            });
        }

        req.license = status.payload || {};
        req.licenseFeatures = req.license.features || {};
        next();
    };
};

module.exports = {
    checkFeature,
    getLicenseStatus
};
