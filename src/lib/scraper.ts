import type { ProfileData } from "./types";

/**
 * Scrape Twitter/X profile using fxtwitter.com API (free, no auth).
 * Then attempt to get recent tweets from syndication API.
 */
export async function scrapeTwitter(handle: string): Promise<ProfileData> {
  const cleanHandle = handle.replace(/^@/, "").trim();

  const profileRes = await fetch(`https://api.fxtwitter.com/${cleanHandle}`, {
    headers: { "User-Agent": "MCE-Bot/1.0" },
  });

  if (!profileRes.ok) {
    throw new Error(
      `Could not find Twitter profile for @${cleanHandle} (status: ${profileRes.status})`
    );
  }

  const profileData = await profileRes.json();
  const user = profileData.user;

  if (!user) {
    throw new Error(`No user data found for @${cleanHandle}`);
  }

  // Try to get recent tweets from syndication API
  let recentPosts: string[] = [];
  try {
    const timelineRes = await fetch(
      `https://syndication.twitter.com/srv/timeline-profile/screen-name/${cleanHandle}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      }
    );
    if (timelineRes.ok) {
      const html = await timelineRes.text();
      const tweetRegex =
        /data-testid="tweetText"[^>]*>([\s\S]*?)<\/div>/g;
      let match;
      while ((match = tweetRegex.exec(html)) !== null && recentPosts.length < 10) {
        const text = match[1]
          .replace(/<[^>]+>/g, "")
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .trim();
        if (text) recentPosts.push(text);
      }
    }
  } catch {
    // Syndication failed — continue with profile-only data
  }

  if (recentPosts.length === 0 && user.description) {
    recentPosts = [user.description];
  }

  return {
    platform: "twitter",
    handle: cleanHandle,
    display_name: user.name || cleanHandle,
    bio: user.description || "",
    profile_pic_url: user.avatar_url || "",
    recent_posts: recentPosts,
    follower_count: user.followers || 0,
    following_count: user.following || 0,
  };
}

/**
 * Scrape Instagram profile using Apify's Instagram Profile Scraper.
 * Falls back to minimal profile if Apify key is missing or fails.
 */
export async function scrapeInstagram(handle: string): Promise<ProfileData> {
  const cleanHandle = handle.replace(/^@/, "").trim();

  const apifyKey = process.env.APIFY_API_KEY;
  if (apifyKey) {
    try {
      return await scrapeInstagramApify(cleanHandle, apifyKey);
    } catch (error) {
      console.warn(
        "Apify Instagram scrape failed:",
        error instanceof Error ? error.message : error
      );
    }
  }

  // Fallback: return minimal profile — the user's bio/vibes input from the
  // create page will supplement this via the userInput merge in useGeneration
  return minimalInstagramProfile(cleanHandle);
}

async function scrapeInstagramApify(handle: string, apifyKey: string): Promise<ProfileData> {
  const startRes = await fetch(
    "https://api.apify.com/v2/acts/apify~instagram-profile-scraper/runs",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apifyKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ usernames: [handle] }),
    }
  );

  if (!startRes.ok) {
    throw new Error(`Apify start failed: ${startRes.status}`);
  }

  const startData = await startRes.json();
  const runId = startData.data?.id;
  const datasetId = startData.data?.defaultDatasetId;

  if (!runId || !datasetId) {
    throw new Error("No run ID or dataset ID from Apify");
  }

  for (let i = 0; i < 20; i++) {
    await new Promise((r) => setTimeout(r, 2000));

    const statusRes = await fetch(
      `https://api.apify.com/v2/acts/apify~instagram-profile-scraper/runs/${runId}`,
      { headers: { Authorization: `Bearer ${apifyKey}` } }
    );
    const statusData = await statusRes.json();
    const status = statusData.data?.status;

    if (status === "SUCCEEDED") {
      const dataRes = await fetch(
        `https://api.apify.com/v2/datasets/${datasetId}/items?format=json`,
        { headers: { Authorization: `Bearer ${apifyKey}` } }
      );
      const items = await dataRes.json();

      if (Array.isArray(items) && items.length > 0) {
        const user = items[0];
        const posts = (user.latestPosts || [])
          .slice(0, 10)
          .map((p: { caption?: string }) => p.caption || "")
          .filter(Boolean);

        return {
          platform: "instagram",
          handle,
          display_name: user.fullName || handle,
          bio: user.biography || "",
          profile_pic_url: user.profilePicUrlHD || user.profilePicUrl || "",
          recent_posts:
            posts.length > 0
              ? posts
              : user.biography
                ? [user.biography]
                : [],
          follower_count: user.followersCount || 0,
          following_count: user.followsCount || 0,
        };
      }
      break;
    }

    if (status === "FAILED" || status === "ABORTED" || status === "TIMED-OUT") {
      throw new Error(`Apify run ${status}`);
    }
  }

  throw new Error("Apify returned no results");
}

function minimalInstagramProfile(handle: string): ProfileData {
  return {
    platform: "instagram",
    handle,
    display_name: handle,
    bio: `Instagram creator @${handle}`,
    profile_pic_url: "",
    recent_posts: [`Content creator and Instagram personality @${handle}`],
    follower_count: 0,
    following_count: 0,
  };
}

export async function scrapeProfile(
  platform: "twitter" | "instagram",
  handle: string
): Promise<ProfileData> {
  if (platform === "twitter") {
    return scrapeTwitter(handle);
  }
  return scrapeInstagram(handle);
}
