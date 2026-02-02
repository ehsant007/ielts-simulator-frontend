import { type CreateClientConfig } from "@/client/client.gen";

function getBaseUrl() {
	if (typeof window === "undefined")
		return process.env.NEXT_PUBLIC_API_URL || ""; // For server requests

	return "/";
}

export const createClientConfig: CreateClientConfig = (config) => ({
  ...config,
  baseUrl:  getBaseUrl(),
});
