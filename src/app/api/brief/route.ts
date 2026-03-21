import { NextResponse } from "next/server";
import { generateCreativeBriefs } from "@/lib/claude";
import type { ProfileData, FeatureConfig } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const { profile, features } = (await req.json()) as {
      profile: ProfileData;
      features: FeatureConfig;
    };

    if (!profile || !features) {
      return NextResponse.json(
        { error: "Profile and features are required" },
        { status: 400 }
      );
    }

    const briefs = await generateCreativeBriefs(profile, features);
    return NextResponse.json({ success: true, briefs });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to generate creative briefs";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
