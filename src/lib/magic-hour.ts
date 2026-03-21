import type { JobStatus } from "./types";

const BASE_URL = "https://api.magichour.ai/v1";

function headers() {
  return {
    Authorization: `Bearer ${process.env.MAGIC_HOUR_API_KEY}`,
    "Content-Type": "application/json",
  };
}

// Upload an asset to Magic Hour and return the file_path
export async function uploadAsset(
  buffer: Buffer,
  extension: string,
  type: "image" | "video" | "audio"
): Promise<string> {
  // Step 1: Get pre-signed upload URL
  const uploadRes = await fetch(`${BASE_URL}/files/upload-urls`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      items: [{ type, extension }],
    }),
  });

  if (!uploadRes.ok) {
    throw new Error(`Failed to get upload URL: ${uploadRes.status}`);
  }

  const { items } = await uploadRes.json();
  const { upload_url, file_path } = items[0];

  // Step 2: Upload the file
  await fetch(upload_url, {
    method: "PUT",
    body: new Uint8Array(buffer),
    headers: {
      "Content-Type": `${type}/${extension}`,
    },
  });

  return file_path;
}

// Generate an image using Magic Hour's AI Image Generator
export async function generateImage(
  prompt: string,
  tool: string = "ai-anime-generator",
  aspectRatio: string = "9:16"
): Promise<string> {
  const res = await fetch(`${BASE_URL}/ai-image-generator`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      image_count: 1,
      style: { prompt, tool },
      aspect_ratio: aspectRatio,
      resolution: "auto",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Image generation failed: ${res.status} ${err}`);
  }

  const data = await res.json();
  return data.id;
}

// Generate a meme using Magic Hour's AI Meme Generator
export async function generateMeme(
  template: string,
  topic: string
): Promise<string> {
  const res = await fetch(`${BASE_URL}/ai-meme-generator`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      style: {
        template,
        topic,
        search_web: false,
      },
      name: `MCE Meme - ${template}`,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Meme generation failed: ${res.status} ${err}`);
  }

  const data = await res.json();
  return data.id;
}

// Generate voice using Magic Hour's AI Voice Generator
export async function generateVoice(
  script: string,
  voiceName: string
): Promise<string> {
  const res = await fetch(`${BASE_URL}/ai-voice-generator`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      style: {
        prompt: script,
        voice_name: voiceName,
      },
      name: "MCE Voiceover",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Voice generation failed: ${res.status} ${err}`);
  }

  const data = await res.json();
  return data.id;
}

// Generate video from image using Magic Hour's Image-to-Video
export async function generateVideo(
  imageFilePath: string,
  durationSec: number = 5,
  prompt?: string,
  model: string = "kling-2.5"
): Promise<string> {
  const body: Record<string, unknown> = {
    assets: {
      image_file_path: imageFilePath,
    },
    end_seconds: durationSec,
    model,
    resolution: "720p",
  };

  if (prompt) {
    body.style = { prompt };
  }

  const res = await fetch(`${BASE_URL}/image-to-video`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Video generation failed: ${res.status} ${err}`);
  }

  const data = await res.json();
  return data.id;
}

// Face swap photo
export async function faceSwapPhoto(
  sourceFilePath: string,
  targetFilePath: string
): Promise<string> {
  const res = await fetch(`${BASE_URL}/face-swap-photo`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      assets: {
        source_file_path: sourceFilePath,
        target_file_path: targetFilePath,
      },
      name: "MCE Face Swap",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Face swap failed: ${res.status} ${err}`);
  }

  const data = await res.json();
  return data.id;
}

// Check job status (single poll, no loop)
export async function checkJobStatus(
  type: "image" | "video" | "audio",
  jobId: string
): Promise<JobStatus> {
  const endpoint = `${type}-projects`;
  const res = await fetch(`${BASE_URL}/${endpoint}/${jobId}`, {
    headers: { Authorization: `Bearer ${process.env.MAGIC_HOUR_API_KEY}` },
  });

  if (!res.ok) {
    throw new Error(`Status check failed: ${res.status}`);
  }

  const data = await res.json();
  return {
    id: data.id,
    status: data.status,
    downloads: data.downloads,
  };
}
