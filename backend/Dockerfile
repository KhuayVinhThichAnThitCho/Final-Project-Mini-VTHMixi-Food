FROM node:20-alpine

WORKDIR /app

# Copy package and package-lock first to leverage Docker caching
COPY package*.json ./

RUN npm install

# Copy all source files
COPY . .

EXPOSE 5000

# Use dev script for hot-reloading
CMD ["npm", "run", "dev"]
