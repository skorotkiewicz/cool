# Cool Client

TypeScript SDK for the Cool Encoding Service.

## Installation

```bash
bun add cool-client
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

## API

### `Cool(apiKey: string, baseUrl?: string)`

Creates a Cool client instance.

**Parameters:**
- `apiKey` - Your API key
- `baseUrl` - Server URL (default: `http://localhost:3000`)

**Returns:**
- `encode(data: string | Buffer)` - Encode data and get random name
- `decode(randomName: string)` - Decode random name back to original data

## Features

- **TypeScript** - Full type safety
- **Brotli Compression** - Automatic compression/decompression
- **Error Handling** - Clear error messages
- **Rate Limiting** - Built-in retry logic

## License

MIT
