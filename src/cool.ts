interface CoolResponse {
	success: boolean;
	randomName?: string;
	data?: string;
	error?: string;
}

interface CoolClient {
	encode: (data: string | Buffer) => Promise<string>;
	decode: (randomName: string) => Promise<string>;
}

/**
 * Create a Cool client instance with API key
 */
export function Cool(
	apiKey: string,
	baseUrl: string = "http://localhost:3000",
): CoolClient {
	if (!apiKey) {
		throw new Error("API key is required");
	}

	return {
		/**
		 * Encode data and get a random name
		 */
		async encode(data: string | Buffer): Promise<string> {
			try {
				const dataString =
					typeof data === "string" ? data : data.toString("utf8");

				const response = await fetch(`${baseUrl}/encode`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						data: dataString,
						apiKey,
					}),
				});

				const result: CoolResponse = await response.json();

				if (!result.success || !result.randomName) {
					throw new Error(result.error || "Failed to encode data");
				}

				return result.randomName;
			} catch (error) {
				throw new Error(
					`Encode failed: ${error instanceof Error ? error.message : "Unknown error"}`,
				);
			}
		},

		/**
		 * Decode random name back to original data
		 */
		async decode(randomName: string): Promise<string> {
			try {
				const response = await fetch(`${baseUrl}/decode`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						randomName,
						apiKey,
					}),
				});

				const result: CoolResponse = await response.json();

				if (!result.success || !result.data) {
					throw new Error(result.error || "Failed to decode data");
				}

				return result.data;
			} catch (error) {
				throw new Error(
					`Decode failed: ${error instanceof Error ? error.message : "Unknown error"}`,
				);
			}
		},
	};
}

// Export default Cool function
export default Cool;
