import { Cool } from "./cool";

// Example usage as shown in the README
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

async function testCoolService() {
	try {
		// Create Cool client with API key
		const { encode, decode } = Cool("mama-hey");

		console.log("Original data:", jsonData);
		console.log("---");

		// Encode the data
		const encoded4 = await encode(jsonData);
		console.log("Encoded name:", encoded4);

		// Decode the data back
		const decoded4 = await decode(encoded4);
		console.log("Decoded data:", decoded4);

		console.log("---");
		console.log("Data matches:", jsonData === decoded4);

		// // Test with different API key (should fail)
		// console.log("\nTesting with different API key...");
		// try {
		// 	const { decode: decodeWrong } = Cool("wrong-key");
		// 	await decodeWrong(encoded4);
		// } catch (error) {
		// 	console.log("Expected error with wrong API key:", error.message);
		// }
	} catch (error) {
		console.error("Test failed:", error);
	}
}

// Run the test
testCoolService();
