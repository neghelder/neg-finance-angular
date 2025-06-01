# Stage 1: Build the Angular application
FROM node:18-alpine AS build
WORKDIR /app

# Copy dependency definitions and install packages
COPY package*.json yarn.lock ./
RUN yarn install

# Copy the rest of the application code
COPY . .

# Build the Angular app in production mode
RUN npm run build -- --configuration production

# Stage 2: Serve the app using Nginx
FROM nginx:alpine
# Copy the production build from the previous stage
COPY --from=build /app/dist/neg-finance/browser /usr/share/nginx/html

# Expose port 80 for the container
EXPOSE 80

# Start Nginx when the container launches
CMD ["nginx", "-g", "daemon off;"]
