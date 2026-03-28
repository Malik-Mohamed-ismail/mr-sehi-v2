# Base stage for shared dependencies
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# Dependencies stage
FROM base AS deps
RUN npm ci

# Build stage
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy only what's needed for production
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy built code
COPY --from=build /app/dist ./dist

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -u 1001 -S expressjs -G nodejs
USER expressjs

EXPOSE 3001

CMD ["npm", "start"]
