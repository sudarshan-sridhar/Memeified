// Share to Twitter/X — includes media URL directly so followers can see the content
export function shareToTwitter(text: string, mediaUrl: string) {
  // Include the media URL in the tweet text so it shows as a link
  const fullText = `${text}\n\n${mediaUrl}`;
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(fullText)}`;
  window.open(tweetUrl, "_blank", "noopener,noreferrer");
}

// Copy media URL to clipboard (the actual image/video, not the app page)
export async function copyLink(url: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    const input = document.createElement("input");
    input.value = url;
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    document.body.removeChild(input);
    return true;
  }
}

// Download a file — fetches as blob to handle cross-origin URLs
export async function downloadFile(url: string, filename: string): Promise<void> {
  try {
    // Fetch as blob to bypass cross-origin download restrictions
    const res = await fetch(url);
    const blob = await res.blob();

    // Detect extension from content-type
    const contentType = res.headers.get("content-type") || "";
    let ext = "";
    if (contentType.includes("mp4") || url.includes(".mp4")) ext = ".mp4";
    else if (contentType.includes("mp3") || url.includes(".mp3")) ext = ".mp3";
    else if (contentType.includes("png") || url.includes(".png")) ext = ".png";
    else if (contentType.includes("jpeg") || contentType.includes("jpg") || url.includes(".jpg")) ext = ".jpg";
    else if (contentType.includes("webp")) ext = ".webp";
    else ext = ".png";

    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = `${filename}${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(objectUrl);
  } catch {
    // Fallback: open in new tab if fetch fails
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

// === Result persistence ===

const STORAGE_KEY = "mce_result";

export function saveResultToStorage(data: Record<string, unknown>): string {
  const id = Math.random().toString(36).slice(2, 10);
  try {
    sessionStorage.setItem(`${STORAGE_KEY}_${id}`, JSON.stringify(data));
  } catch {
    // sessionStorage full or unavailable
  }
  return id;
}

export function loadResultFromStorage(id: string): Record<string, unknown> | null {
  try {
    const raw = sessionStorage.getItem(`${STORAGE_KEY}_${id}`);
    if (raw) return JSON.parse(raw);
  } catch {
    // Ignore
  }
  return null;
}

export function encodeOutputsForUrl(outputs: Record<string, unknown>): string {
  const json = JSON.stringify(outputs);
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeOutputsFromUrl(encoded: string): Record<string, unknown> {
  let b64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4) b64 += "=";
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const json = new TextDecoder().decode(bytes);
  return JSON.parse(json);
}
