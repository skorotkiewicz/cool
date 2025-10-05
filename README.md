# Cool Encoding Service

A secure encoding/decoding service that uses Brotli compression and API key-based access control.

## Features

- **Brotli Compression**: Data is compressed using Brotli for efficient storage
- **API Key Security**: Each encoded data is tied to a specific API key
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

## Security

- Each encoded data is tied to a specific API key
- Data can only be decoded with the correct API key
- Different API keys will return different data for the same random name
- All data is compressed using Brotli for efficient storage