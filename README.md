# Cool Encoding Service

![Logo](logo.svg)

A secure, efficient encoding service with Brotli compression and user management.

## Packages

- **[Server](./packages/server/)** - Hono.js API with PostgreSQL
- **[Client](./packages/client/)** - TypeScript SDK

## Quick Start

```bash
# Install dependencies
bun install

# Start server
bun run dev

# Test client
bun run test
```

## Features

- **Brotli Compression** - Efficient data storage
- **User Management** - API key based access control
- **Rate Limiting** - IP-based protection (10 req/min)
- **TypeScript** - Full type safety

## License

MIT
