import { prisma } from "../prisma";

// Character sets for generating names
const consonants = "bcdfghjklmnpqrstvwxyz";
const vowels = "aeiou";
const allChars = consonants + vowels;

/**
 * Generate a random name starting from shortest length
 * and checking for collisions in the database
 */
export async function randomNameGenerator(): Promise<string> {
  // Start with shortest names and increase length if needed
  for (let length = 3; length <= 10; length++) {
    // Try multiple attempts for each length
    for (let attempt = 0; attempt < 100; attempt++) {
      const name = generateRandomName(length);

      // Check if name already exists in database
      const exists = await prisma.encodedData.findUnique({
        where: { randomName: name },
      });

      if (!exists) {
        return name;
      }
    }
  }

  // If we can't find a unique name after trying all lengths,
  // fall back to UUID-based approach
  return generateUUIDName();
}

/**
 * Generate a random name of specified length
 */
function generateRandomName(length: number): string {
  let name = "";

  for (let i = 0; i < length; i++) {
    if (i === 0) {
      // First character should be a consonant for better readability
      name += consonants[Math.floor(Math.random() * consonants.length)];
    } else {
      // Mix of consonants and vowels
      name += allChars[Math.floor(Math.random() * allChars.length)];
    }
  }

  return name;
}

/**
 * Generate a UUID-based name as fallback
 */
function generateUUIDName(): string {
  // Generate a shorter UUID-like string
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";

  for (let i = 0; i < 8; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }

  return result;
}
