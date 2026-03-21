import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Main Character Energy",
  description:
    "Drop your handle. Get your anime intro, fake trailer, roast video, and meme pack. Powered by Magic Hour.",
  openGraph: {
    title: "Main Character Energy",
    description:
      "AI thinks you're the main character. Drop your handle and find out.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Main Character Energy",
    description:
      "AI thinks you're the main character. Drop your handle and find out.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body className="min-h-full bg-bg-primary text-text-primary antialiased">
        {children}
      </body>
    </html>
  );
}
