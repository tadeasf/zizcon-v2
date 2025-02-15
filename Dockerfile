# Use the official Bun image
FROM oven/bun:1.1.45 AS base
WORKDIR /app

# Add build arguments
ARG NEXT_PUBLIC_DIRECTUS_URL
ARG NEXT_PUBLIC_DIRECTUS_TOKEN

# Set environment variables for build time
ENV NEXT_PUBLIC_DIRECTUS_URL=${NEXT_PUBLIC_DIRECTUS_URL}
ENV NEXT_PUBLIC_DIRECTUS_TOKEN=${NEXT_PUBLIC_DIRECTUS_TOKEN}

# Install dependencies
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
RUN bun run build

# Start the application
CMD ["bun", "start"]

# Expose the port the app runs on
EXPOSE 3000
