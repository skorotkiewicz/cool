# Cool Encoding Service

A secure encoding/decoding service that uses Brotli compression and user-based API key management.

## Features

- **Brotli Compression**: Data is compressed using Node.js built-in Brotli compression
- **User Management**: Each API key is automatically associated with a user account
- **Account Status**: Users can be activated/deactivated to control access
- **Rate Limiting**: IP-based rate limiting (10 requests per minute per IP)
- **Random Name Generation**: Generates short, unique names starting from 3 characters
- **Collision Detection**: Automatically checks for name conflicts in the database
- **TypeScript Client**: Easy-to-use client library with full type safety

## Usage

### Server Setup

1. Install dependencies:
```bash
bun install
```

2. Set up database:
```bash
bun run db:push
```

3. Start the server:
```bash
bun run dev
```

### Client Usage

```typescript
import { Cool } from "./src/cool";

const jsonData = JSON.stringify({
  user: "John Doe",
  email: "john@example.com",
  settings: {
    theme: "dark",
    language: "en",
    notifications: true,
  },
  tags: ["nodejs", "javascript", "coding", "tutorial"],
});

const { encode, decode } = Cool("mama-hey");

const encoded4 = await encode(jsonData); // returns: "cool-my-random-name"
const decoded4 = await decode(encoded4); // returns: original json data

console.log(encoded4); // "cool-my-random-name"
console.log(decoded4); // original json data
```

### Testing

Run the test to see the service in action:
```bash
bun run test
```

## API Endpoints

- `POST /encode` - Encode data and get a random name
- `POST /decode` - Decode random name back to original data

## User Management

- **Automatic User Creation**: Users are automatically created when using a new API key
- **Account Status**: Each user has an `isActive` status that controls access
- **Database Relations**: Encoded data is linked to specific users
- **Security**: Only active users can encode/decode data

## Security

- Each encoded data is tied to a specific user and API key
- Data can only be decoded with the correct API key
- Users can be deactivated to prevent access
- IP-based rate limiting prevents abuse (10 requests/minute)
- All data is compressed using Brotli for efficient storage

## Rate Limiting

The service implements IP-based rate limiting:
- **Limit**: 10 requests per minute per IP address
- **Window**: 1 minute rolling window
- **Response**: HTTP 429 with retry information when limit exceeded
- **Headers**: Includes `retryAfter` seconds in error response