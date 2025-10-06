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

## Usage

```typescript
import { Cool } from 'cool-client';

const { encode, decode } = Cool('your-api-key');

// Encode data
const randomName = await encode('{"message": "hello world"}');
console.log(randomName); // "cool-abc123"

// Decode data
const originalData = await decode(randomName);
console.log(originalData); // '{"message": "hello world"}'
```

## Features

- **Brotli Compression** - Efficient data storage
- **User Management** - API key based access control
- **Rate Limiting** - IP-based protection (10 req/min)
- **TypeScript** - Full type safety

## License

MIT
