import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
	output: "standalone",
	experimental: {
		optimizePackageImports: ["@chakra-ui/react"],
		serverActions: {
			bodySizeLimit: '4mb',
		},
	},

	//   webpack(config, { dev }) {
	//     config.infrastructureLogging = config.infrastructureLogging || {};
	//     config.infrastructureLogging.level = "verbose";
	//     return config;
	//   },

};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
