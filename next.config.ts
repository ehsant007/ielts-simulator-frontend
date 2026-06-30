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

	serverExternalPackages: ["onnxruntime-node", "sharp"],
	webpack: (config, { isServer }) => {
		config.resolve.alias = {
			...config.resolve.alias,
			"sharp$": false,
			"onnxruntime-node$": false,
		};
		config.experiments = { ...config.experiments, asyncWebAssembly: true, layers: true };
		if (!isServer) config.output.globalObject = "self";
		return config;
	},

};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
