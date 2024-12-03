# Use Node.js LTS version as the base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose port 5000 to allow external access
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
