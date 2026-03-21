// Share to Twitter/X with pre-filled text
export function shareToTwitter(text: string, url: string) {
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  window.open(tweetUrl, "_blank", "noopener,noreferrer");
}

// Share to Instagram (download prompt — Instagram doesn't support direct sharing via URL)
export function shareToInstagram(mediaUrl: string) {
  downloadFile(mediaUrl, "mce-result");
}

// Copy link to clipboard
export async function copyLink(url: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    // Fallback for older browsers
    const input = document.createElement("input");
    input.value = url;
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    document.body.removeChild(input);
    return true;
  }
}

// Download a file
export function downloadFile(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Native Web Share API (mobile-friendly)
export async function nativeShare(
  title: string,
  text: string,
  url: string
): Promise<boolean> {
  if (!navigator.share) return false;
  try {
    await navigator.share({ title, text, url });
    return true;
  } catch {
    return false;
  }
}

// Encode generation outputs into a URL-safe base64 string
export function encodeOutputsForUrl(outputs: Record<string, unknown>): string {
  const json = JSON.stringify(outputs);
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  // Convert to URL-safe base64: replace + with -, / with _, strip =
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// Decode generation outputs from a URL-safe base64 string
export function decodeOutputsFromUrl(encoded: string): Record<string, unknown> {
  // Restore standard base64: replace - with +, _ with /, add padding
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
