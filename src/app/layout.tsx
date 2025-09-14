import type { Metadata } from "next";
import { Geist_Mono, Inter_Tight } from "next/font/google";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next";

import "./globals.css";
import Header from "~/components/header";
import { ThemeProvider } from "~/providers/theme-provider";
import { MeshGradientComponent } from "~/components/mesh-gradient";

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
	title: "ExportNoCode - Export no-code sites (Framer and more) easily",
	description:
		"ExportNoCode lets you download and export any supported no-code website (starting with Framer). Get HTML files instantly and deploy them anywhere.",
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
			<MeshGradientComponent
			colors={[
				"#0f1419",
				"#1b2f1b",
				"#0d2818",
				"#1a1a1a"
			]}

			speed={1}
			style={{
				position: 'fixed',
				top: 0,
				left: 0,
				zIndex: 0,
				width: '100%',
				height: '100%',
			}}
			/>
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
