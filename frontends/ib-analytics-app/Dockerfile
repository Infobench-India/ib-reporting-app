# Analytics Frontend Dockerfile - Multi-stage build
# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./

# Install dependencies
RUN npm ci

# Copy application source
COPY src ./src
COPY public ./public
COPY index.html ./

# Build the application
RUN npm run build

# Stage 2: Production - Serve with nginx
FROM nginx:1.23.1-alpine AS server


# Set working directory to nginx asset directory
WORKDIR /etc/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# RUN rm /etc/nginx/conf.d/default.conf
COPY ./nginx.conf /etc/nginx/nginx.conf


# Copy static assets from builder stage
# COPY --from=builder /app/dist .
COPY ./dist .
# Expose port 80
EXPOSE 80

# Containers run nginx with global directives and daemon off
ENTRYPOINT ["nginx", "-g", "daemon off;"]