import Navbar from "@/components/common/Navbar"
import Footer from "@/components/common/Footer";

export default async function SiteLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<>
			{/* <Navbar /> */}
			{children}
			{/* <Footer /> */}
		</>

	);
}
