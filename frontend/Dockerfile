# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production server stage
FROM nginx:alpine AS runner
# Copy custom NGINX config to handle SPA routing (fallback to index.html)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy Vite build output to nginx html dir
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
