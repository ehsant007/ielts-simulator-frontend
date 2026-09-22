import { Box } from "@chakra-ui/react";

export default async function ChatLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {

	return (
		<Box h="dvh">
			{children}
		</Box>
	)
}
