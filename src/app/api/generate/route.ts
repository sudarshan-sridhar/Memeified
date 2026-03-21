import { NextResponse } from "next/server";
import {
  generateImage,
  generateMeme,
  generateVoice,
  generateVideo,
  faceSwapPhoto,
} from "@/lib/magic-hour";

type GenerationType =
  | "image"
  | "meme"
  | "voice"
  | "video"
  | "face-swap";

interface GenerateRequest {
  type: GenerationType;
  // Image params
  prompt?: string;
  tool?: string;
  aspectRatio?: string;
  // Meme params
  template?: string;
  topic?: string;
  // Voice params
  script?: string;
  voiceName?: string;
  // Video params
  imageFilePath?: string;
  durationSec?: number;
  videoModel?: string;
  // Face swap params
  sourceFilePath?: string;
  targetFilePath?: string;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as GenerateRequest;

    let jobId: string;

    switch (body.type) {
      case "image":
        if (!body.prompt) {
          return NextResponse.json(
            { error: "Prompt is required for image generation" },
            { status: 400 }
          );
        }
        jobId = await generateImage(body.prompt, body.tool, body.aspectRatio);
        break;

      case "meme":
        if (!body.template || !body.topic) {
          return NextResponse.json(
            { error: "Template and topic are required for meme generation" },
            { status: 400 }
          );
        }
        jobId = await generateMeme(body.template, body.topic);
        break;

      case "voice":
        if (!body.script || !body.voiceName) {
          return NextResponse.json(
            { error: "Script and voiceName are required for voice generation" },
            { status: 400 }
          );
        }
        jobId = await generateVoice(body.script, body.voiceName);
        break;

      case "video":
        if (!body.imageFilePath) {
          return NextResponse.json(
            { error: "imageFilePath is required for video generation" },
            { status: 400 }
          );
        }
        jobId = await generateVideo(
          body.imageFilePath,
          body.durationSec || 5,
          body.prompt,
          body.videoModel
        );
        break;

      case "face-swap":
        if (!body.sourceFilePath || !body.targetFilePath) {
          return NextResponse.json(
            { error: "sourceFilePath and targetFilePath are required" },
            { status: 400 }
          );
        }
        jobId = await faceSwapPhoto(body.sourceFilePath, body.targetFilePath);
        break;

      default:
        return NextResponse.json(
          { error: `Unknown generation type: ${body.type}` },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true, jobId });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
