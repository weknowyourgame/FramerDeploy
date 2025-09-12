import type { Metadata } from "next";
import { Geist_Mono, Inter_Tight } from "next/font/google";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next";

import "./globals.css";
import Header from "~/components/header";
import { ThemeProvider } from "~/providers/theme-provider";

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

const interTight = Inter_Tight({
	variable: "--font-inter-tight",
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
	title: "Framer Deploy - Download and deploy Framer websites easily",
	description:
		"Framer Deploy lets you download and deploy any Framer website by simply entering the URL. Get HTML files instantly and deploy them anywhere.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className="h-full" suppressHydrationWarning>
			<body
				className={`${interTight.variable} ${geistMono.variable} antialiased flex flex-col h-full`}
			>
				<ThemeProvider>
					<Header />
					<Toaster />
					<Analytics />
					{children}
				</ThemeProvider>
			</body>
		</html>
	);
}
