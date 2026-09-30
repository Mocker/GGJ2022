# Stage 1: Build the static bundle with Node.js and pnpm
FROM node:20-slim AS builder
WORKDIR /app

# Enable pnpm via corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install dependencies using frozen lockfile
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source files and compile
COPY . .
RUN pnpm run build

# Stage 2: Serve static production assets with lightweight Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
