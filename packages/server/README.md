# Cool Server

Hono.js API server with PostgreSQL, Brotli compression, and user management.

## Features

- **Brotli Compression** - Automatic compression for efficient storage
- **User Management** - API key based access with `isActive` status
- **Rate Limiting** - IP-based protection (10 requests/minute)
- **PostgreSQL** - Prisma ORM with automatic migrations
- **TypeScript** - Full type safety

## API Endpoints

- `POST /encode` - Encode data and get random name
- `POST /decode` - Decode random name back to original data

## Setup

```bash
# Install dependencies
bun install

# Setup database
bun run db:push

# Start development server
bun run dev
```

## Environment

```env
DATABASE_URL=postgresql://user:password@localhost:5432/cool
```

## Usage

```typescript
// Encode data
const response = await fetch('/encode', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    data: '{"message": "hello world"}',
    apiKey: 'your-api-key'
  })
});

// Decode data
const decoded = await fetch('/decode', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    randomName: 'cool-abc123',
    apiKey: 'your-api-key'
  })
});
```

## License

MIT