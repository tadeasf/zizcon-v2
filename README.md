# Zizcon Next.js Application

This is a [Next.js](https://nextjs.org) project with [Directus](https://directus.io) as a headless CMS and [Auth0](https://auth0.com) for authentication.

## Prerequisites

- Node.js 18+ or Bun 1.0+
- Docker and Docker Compose (for Directus and containerized deployment)
- Auth0 account with configured application
- Git

## Environment Setup

1. Copy `.env.example` to `.env`:

    ```bash
    cp .env.example .env
    ```

2. Update the `.env` file with your configuration:

- Generate secure keys and tokens as indicated in the comments
- Configure Auth0 credentials
- Set appropriate URLs for your environment

## Development Options

### 1. Full Local Development (Recommended for development)

Run Directus in Docker and Next.js locally:

```bash
# Start Directus
docker-compose -f docker-compose.directus.yml up -d

# Install dependencies
bun install

# Start Next.js development server
bun run dev
```

Access:

- Next.js: <http://localhost:3000>
- Directus: <http://localhost:8355>

### 2. Docker Compose Development

Run both Directus and Next.js in Docker:

```bash
docker-compose up -d
```

Access:

- Next.js: <http://localhost:3300>
- Directus: <http://localhost:8355>

### 3. Production Deployment

#### Option A: Separate Deployment

1. Deploy Directus:

    ```bash
    docker-compose -f docker-compose.directus.yml up -d
    ```

2. Deploy Next.js to your preferred platform (Vercel, etc.)
   - Set environment variables in your deployment platform
   - Ensure `NEXT_PUBLIC_DIRECTUS_URL` points to your Directus instance

#### Option B: Docker Compose Production

Use the production configuration:

```bash
# Uncomment the web-prod service in docker-compose.yml first
docker-compose up -d
```

## Project Structure

- `/src` - Next.js application source
  - `/app` - App router pages and API routes
  - `/components` - React components
  - `/lib` - Utility functions and configurations

## Available Scripts

```bash
# Development
bun run dev     # Start development server

# Production
bun run build   # Build for production
bun run start   # Start production server

# Linting
bun run lint    # Run ESLint
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Directus Documentation](https://docs.directus.io)
- [Auth0 Documentation](https://auth0.com/docs)

## Deployment Notes

- For production, ensure all environment variables are properly set
- Configure CORS in Directus for your production domains
- Set up proper SSL/TLS for both Directus and Next.js
- Consider using a reverse proxy (e.g., Nginx) in production
- Backup your Directus database and uploads regularly
