import { Box } from "@chakra-ui/react";

export default async function SiteLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {

	<Box h="dvh">
		{children}
	</Box>
}
