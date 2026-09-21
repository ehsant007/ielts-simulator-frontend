//import Navbar from "@/components/common/Navbar"
//import Footer from "@/components/common/Footer";

import { Box } from "@chakra-ui/react";

export default async function SiteLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<Box h="dvh">
			{/* <Navbar /> */}
			{children}
			{/* <Footer /> */}
		</Box>

	);
}
