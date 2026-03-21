import { NextResponse } from "next/server";
import { uploadAsset } from "@/lib/magic-hour";

export async function POST(req: Request) {
  try {
    const { imageUrl } = (await req.json()) as { imageUrl: string };

    if (!imageUrl) {
      return NextResponse.json(
        { error: "imageUrl is required" },
        { status: 400 }
      );
    }

    // Download the image
    const imageRes = await fetch(imageUrl);
    if (!imageRes.ok) {
      throw new Error(`Failed to download image: ${imageRes.status}`);
    }

    const arrayBuffer = await imageRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Determine extension from URL or content type
    const contentType = imageRes.headers.get("content-type") || "image/png";
    const ext = contentType.includes("jpeg") || contentType.includes("jpg")
      ? "jpg"
      : "png";

    const filePath = await uploadAsset(buffer, ext, "image");
    return NextResponse.json({ success: true, filePath });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
