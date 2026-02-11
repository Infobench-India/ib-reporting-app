# Report Server Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY backends/ib-sql-report-server/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY backends/ib-sql-report-server/server ./server
COPY backends/ib-sql-report-server/server.js ./

# Copy .env file
COPY .env .env

# Expose port
EXPOSE 3052

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3052/api/sql-report/configs', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start application
CMD ["node", "server.js"]
