import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Main Character Energy — Results",
  description:
    "AI turned this profile into an anime character, made a movie trailer, roasted them, and created a meme pack. Make yours next!",
  openGraph: {
    title: "Main Character Energy — See My Results",
    description:
      "AI thinks I'm the main character. Anime intro, fake trailer, roast video, and meme pack — all from my social profile.",
    type: "website",
    siteName: "Main Character Energy",
  },
  twitter: {
    card: "summary_large_image",
    title: "Main Character Energy — See My Results",
    description:
      "AI turned my profile into content. Anime intro, roast, trailer, memes. Make yours!",
  },
};

export default function ResultLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
