import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
	reactCompiler: true,
	output: "standalone",
	experimental: {
		optimizePackageImports: ["@chakra-ui/react"],
		serverActions: {
			bodySizeLimit: '4mb',
		},
	},
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
