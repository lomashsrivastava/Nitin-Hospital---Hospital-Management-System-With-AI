# STAGE 1: Build the React Application
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies for the frontend
COPY frontend/package*.json ./
RUN npm ci

# Copy frontend source and build
COPY frontend ./
RUN npm run build

# STAGE 2: Serve the application using 'serve'
FROM node:20-alpine
WORKDIR /app

# Install 'serve' globally
RUN npm install -g serve

# Copy only the built assets from the previous stage
COPY --from=build /app/dist ./dist

# Expose port 3000
EXPOSE 3000

# Start 'serve'
CMD ["serve", "-s", "dist", "-l", "3000"]
