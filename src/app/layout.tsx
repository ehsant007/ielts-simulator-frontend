import type { Metadata } from "next";
import { Geist, Geist_Mono, Vazirmatn } from "next/font/google";
//import "./globals.css";
import Providers from "@/providers/Providers"
import { getLocale } from "next-intl/server";
import { localeDir } from "@/i18n/util"

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

const vazirmatn = Vazirmatn({
	variable: "--font-vazirmatn",
	subsets: ["arabic"],
});

export const metadata: Metadata = {
	title: "P2P Exchange Platform",
	description: "Our P2P exchange platform empowers you to buy, sell, and swap currencies directly with others—securely, transparently, and without middlemen.",
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {

	const locale = await getLocale()

	return (
		<html lang={locale} dir={localeDir(locale)} suppressHydrationWarning>
			<body className={`${geistSans.variable} ${geistMono.variable} ${vazirmatn.variable}`}>
				<Providers>
					{children}
				</Providers>
			</body>
		</html>
	);
}
