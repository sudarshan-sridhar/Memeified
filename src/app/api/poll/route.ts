import { NextResponse } from "next/server";
import { checkJobStatus } from "@/lib/magic-hour";

export async function POST(req: Request) {
  try {
    const { type, jobId } = (await req.json()) as {
      type: "image" | "video" | "audio";
      jobId: string;
    };

    if (!type || !jobId) {
      return NextResponse.json(
        { error: "Type and jobId are required" },
        { status: 400 }
      );
    }

    const status = await checkJobStatus(type, jobId);
    return NextResponse.json(status);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Polling failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
