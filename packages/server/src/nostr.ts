import { randomBytes } from "node:crypto";
import type { Event } from "nostr-tools";
import { finalizeEvent, getPublicKey, verifyEvent } from "nostr-tools";

export interface EncodedData {
  id: string;
  randomName: string;
  apiKey: string;
  data: string; // Base64 encoded data
  compressed: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface User {
  id: string;
  apiKey: string;
  isActive: boolean;
  createdAt: number;
}

export class NostrRelay {
  private events: Map<string, Event> = new Map();
  private privateKey: Uint8Array;

  constructor() {
    // Generate a private key for the relay
    this.privateKey = randomBytes(32);
  }

  private getPublicKey(): string {
    return getPublicKey(this.privateKey);
  }

  private createEvent(kind: number, content: string, tags: string[][] = []): Event {
    const eventTemplate = {
      kind,
      pubkey: this.getPublicKey(),
      created_at: Math.floor(Date.now() / 1000),
      tags,
      content,
    };

    return finalizeEvent(eventTemplate, this.privateKey);
  }

  private verifyEvent(event: Event): boolean {
    return verifyEvent(event);
  }

  // User management
  async createUser(apiKey: string): Promise<User> {
    const userId = randomBytes(16).toString("hex");
    const user: User = {
      id: userId,
      apiKey,
      isActive: true,
      createdAt: Date.now(),
    };

    const event = this.createEvent(
      30000, // Custom kind for user data
      JSON.stringify(user),
      [
        ["t", "user"],
        ["apiKey", apiKey],
      ],
    );

    this.events.set(`user_${apiKey}`, event);
    return user;
  }

  async getUserByApiKey(apiKey: string): Promise<User | null> {
    const event = this.events.get(`user_${apiKey}`);
    if (!event) return null;

    if (!this.verifyEvent(event)) return null;

    try {
      return JSON.parse(event.content) as User;
    } catch {
      return null;
    }
  }

  async updateUser(apiKey: string, updates: Partial<User>): Promise<User | null> {
    const existingUser = await this.getUserByApiKey(apiKey);
    if (!existingUser) return null;

    const updatedUser: User = {
      ...existingUser,
      ...updates,
    };

    const event = this.createEvent(30000, JSON.stringify(updatedUser), [
      ["t", "user"],
      ["apiKey", apiKey],
    ]);

    this.events.set(`user_${apiKey}`, event);
    return updatedUser;
  }

  // Encoded data management
  async createEncodedData(
    data: Omit<EncodedData, "id" | "createdAt" | "updatedAt">,
  ): Promise<EncodedData> {
    const encodedDataId = randomBytes(16).toString("hex");
    const encodedData: EncodedData = {
      ...data,
      id: encodedDataId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const event = this.createEvent(
      30001, // Custom kind for encoded data
      JSON.stringify(encodedData),
      [
        ["t", "encoded_data"],
        ["randomName", data.randomName],
        ["apiKey", data.apiKey],
      ],
    );

    this.events.set(`encoded_${data.randomName}`, event);
    return encodedData;
  }

  async getEncodedDataByRandomName(randomName: string): Promise<EncodedData | null> {
    const event = this.events.get(`encoded_${randomName}`);
    if (!event) return null;

    if (!this.verifyEvent(event)) return null;

    try {
      return JSON.parse(event.content) as EncodedData;
    } catch {
      return null;
    }
  }

  async getAllEncodedDataByApiKey(apiKey: string): Promise<EncodedData[]> {
    const results: EncodedData[] = [];

    for (const [key, event] of this.events.entries()) {
      if (key.startsWith("encoded_") && this.verifyEvent(event)) {
        try {
          const data = JSON.parse(event.content) as EncodedData;
          if (data.apiKey === apiKey) {
            results.push(data);
          }
        } catch {
          // Skip invalid events
        }
      }
    }

    return results;
  }

  async deleteEncodedData(randomName: string): Promise<boolean> {
    const key = `encoded_${randomName}`;
    if (this.events.has(key)) {
      this.events.delete(key);
      return true;
    }
    return false;
  }

  // Utility methods
  async isRandomNameUnique(randomName: string): Promise<boolean> {
    return !this.events.has(`encoded_${randomName}`);
  }

  async getAllEvents(): Promise<Event[]> {
    return Array.from(this.events.values()).filter((event) => this.verifyEvent(event));
  }

  async getEventCount(): Promise<number> {
    return this.events.size;
  }
}

// Export singleton instance
export const nostrRelay = new NostrRelay();
