FROM node:20-alpine

WORKDIR /app

# Copy package files first (better caching)
COPY package*.json ./

# Install ALL dependencies (including dev for n8n if needed)
RUN npm install

# Copy app source
COPY . .

# Set production environment
ENV NODE_ENV=production

# Expose port Railway uses
EXPOSE 8080

# Start command (Railway will override if needed)
CMD ["node", "server.js"]
