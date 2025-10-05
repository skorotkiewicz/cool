import {
	compress as brotliCompress,
	decompress as brotliDecompress,
} from "brotli";

import { Cool } from "cool";

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

Napisz funkcje encode i decode które zapisuje wszystko na serwerze w bazie danych zapisne za pomocą brotli, po encode user dostaje random name i po decode user dostaje original data. Ale zawartosc random name jest dostepne tylko po podaniu poprawnego API KEY, np. "mama-hey" moze zwrocic inne dane po podaniu innego API KEY.
Kazdy moze randomowy uuid wygenerowac i uzywac tego serwisu. serwer napisz w hono.js a baza w prisma, a client `cool` napisz w TypeScript.
do generowania random name uzyj jakies bibloteki, zacznij od najkrótszych nazw i zawsze sprawdzaj czy nazwa jest juz w bazie danych.

const { encode, decode } = Cool(API_KEY)

const encoded4 = encode(jsonData: string | Buffer): string;
const decoded4 = decode(encoded4: string): string;

console.log(encoded4); // returns: "cool-my-random-name"
console.log(decoded4); // returns: "original json data"