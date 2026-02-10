require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const path = require('path');
const logger = require('./server/main/common/logger');
const config = require('./server/config');

const app = express();
const PORT = config.port;

// Middleware
app.use(cors());
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// SQL Pool is initialized on first demand in db.js

// Routes
app.use('/api', require('./server/routes'));

app.listen(PORT, () => {
    logger.info(`SQL Report Server running on port ${PORT}`);
});
