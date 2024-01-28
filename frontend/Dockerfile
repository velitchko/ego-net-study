# Use Node.js 20 as the base image
FROM node:20

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# install angular cli
RUN npm install -g @angular/cli

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the application code to the working directory
COPY . .

# Expose port 4200
EXPOSE 4200

# TODO: Possible prod build to speed up starting it

# Start the frontend
CMD ["npm", "run", "docker"]
