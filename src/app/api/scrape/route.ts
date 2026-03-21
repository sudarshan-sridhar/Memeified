import { NextResponse } from "next/server";
import { scrapeProfile } from "@/lib/scraper";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { platform, handle } = await req.json();

    if (!platform || !handle) {
      return NextResponse.json(
        { error: "Platform and handle are required" },
        { status: 400 }
      );
    }

    if (platform !== "twitter" && platform !== "instagram") {
      return NextResponse.json(
        { error: "Platform must be 'twitter' or 'instagram'" },
        { status: 400 }
      );
    }

    // Strip @ and whitespace
    const cleanHandle = handle.replace(/^@/, "").trim();
    if (!cleanHandle) {
      return NextResponse.json(
        { error: "Invalid handle" },
        { status: 400 }
      );
    }

    const profile = await scrapeProfile(platform, cleanHandle);
    return NextResponse.json({ success: true, profile });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to scrape profile";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
