FROM node:20-alpine

WORKDIR /app

# Copy package and package-lock first to leverage Docker caching
COPY package*.json ./

RUN npm install

# Copy all source files
COPY . .

EXPOSE 3000

# Expose host to allow external connections via Docker port mapping
CMD ["npm", "run", "dev", "--", "--host"]
