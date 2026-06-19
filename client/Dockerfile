FROM node:20-alpine

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy all other files
COPY . .

# Expose Vite's default port
EXPOSE 5173

# Run Vite in dev mode with host configuration to bind to 0.0.0.0
CMD ["npm", "run", "dev", "--", "--host"]
