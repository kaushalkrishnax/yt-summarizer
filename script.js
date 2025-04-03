const els = {
  btnSummarize: document.querySelector(".btn-summarize"),
  summaryContent: document.querySelector(".summary-content"),
  progressDots: document.querySelector(".progress-dots"),
  skeletonLoading: document.querySelector(".skeleton-loading"),
  realContent: document.querySelector(".real-content"),
};

const GEMINI_API_KEY = "your-api-key-here";
const GEMINI_MODEL = "gemini-2.0-flash";

const CONFIG = {
  MAX_ITEMS: 40,
  VIDEO_ID: "",
  BUTTON_TEXT: {
    SUMMARIZE: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> Summarize`,
    LOADING: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="animate-spin"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38"></path></svg> Loading...`,
  },
};

window.addEventListener("message", (event) => {
  if (event.data.action === "videoId") {
    CONFIG.VIDEO_ID = event.data.videoId;
  }
});

let isProcessing = false;

function getRandomSubset(arr, maxItems = CONFIG.MAX_ITEMS) {
  if (!arr || arr.length <= maxItems) return arr || [];

  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, maxItems);
}

async function getVideoDetails() {
  try {
    const response = await fetch(
      `https://yttranscript.kaushalkrishna011.workers.dev?videoId=${CONFIG.VIDEO_ID}`
    );

    if (!response.ok) throw new Error(`API Error: ${response.status}`);

    const data = await response.json();
    const playerInfo = data?.[0]?.microformat?.playerMicroformatRenderer || {};

    return {
      videoId: CONFIG.VIDEO_ID,
      title: playerInfo.title?.simpleText || "Unknown title",
      description: playerInfo.description?.simpleText || "",
      channelName: playerInfo.ownerChannelName || "Unknown channel",
      transcript: data?.[0]?.tracks?.[0]?.transcript || [],
    };
  } catch (error) {
    console.error("Error fetching video details:", error);
    chrome.runtime.sendMessage({ action: "error" });
    throw new Error("Failed to fetch video details");
  }
}

async function fetchAIResponse(prompt) {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!response.ok) throw new Error(`AI API error: ${response.status}`);

    const data = await response.json();
    return (
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, couldn't generate a summary at this time."
    );
  } catch (error) {
    console.error("Error generating summary:", error);
    chrome.runtime.sendMessage({ action: "error" });
    throw new Error("Error generating summary");
  }
}

function setButtonLoading(isLoading) {
  els.btnSummarize.innerHTML = isLoading
    ? CONFIG.BUTTON_TEXT.LOADING
    : CONFIG.BUTTON_TEXT.SUMMARIZE;
  els.btnSummarize.disabled = isLoading;
  els.btnSummarize.classList.toggle("opacity-50", isLoading);
  els.btnSummarize.classList.toggle("cursor-not-allowed", isLoading);
}

function jumpToTimestamp(timestamp) {
  try {
    let totalSeconds = 0;
    const parts = timestamp.split(":").map(Number);

    if (parts.length === 3) {
      totalSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else {
      totalSeconds = parts[0] * 60 + parts[1];
    }

    chrome.runtime.sendMessage({ action: "seek", seconds: totalSeconds });

    document.querySelectorAll(".timestamp").forEach((el) => {
      if (el.textContent === timestamp) {
        el.style.transform = "scale(0.95)";
        setTimeout(() => (el.style.transform = ""), 200);
      }
    });
  } catch (error) {
    console.error("Error jumping to timestamp:", error);
  }
}

function parseAndDisplaySummary(responseText) {
  try {
    responseText = responseText.trim();

    const match = responseText.match(/(.*?)\n*\*\*Key Moments:\*\*(.*)/s);

    const mainSummary = match ? match[1].trim() : responseText;
    const keyMomentsText = match ? match[2].trim() : "";

    const summaryText = document.createElement("div");
    summaryText.className = "summary-text";
    summaryText.innerHTML = mainSummary
      .replace(/\*\*Summary:\*\*/g, "")
      .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");

    els.realContent.appendChild(summaryText);

    const moments = keyMomentsText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => {
        const match = line.match(/(\d+:\d+(?::\d+)?)\s*[-→]?\s*(.*)/);
        return match
          ? { timestamp: match[1], description: match[2].trim() }
          : null;
      })
      .filter(Boolean);

    if (moments.length > 0) {
      const keyMomentsTitle = document.createElement("div");
      keyMomentsTitle.className = "basic-title";
      keyMomentsTitle.textContent = "Key Moments";

      const keyMomentsList = document.createElement("div");
      keyMomentsList.className = "key-moments-list";

      moments.forEach((moment) => {
        const momentElement = document.createElement("div");
        momentElement.className = "key-moment";

        const timestampElement = document.createElement("div");
        timestampElement.className = "timestamp";
        timestampElement.textContent = moment.timestamp;
        timestampElement.addEventListener("click", () =>
          jumpToTimestamp(moment.timestamp)
        );

        const descriptionElement = document.createElement("div");
        descriptionElement.className = "moment-description";
        descriptionElement.textContent = moment.description;

        momentElement.appendChild(timestampElement);
        momentElement.appendChild(descriptionElement);
        keyMomentsList.appendChild(momentElement);
      });

      els.realContent.appendChild(keyMomentsTitle);
      els.realContent.appendChild(keyMomentsList);
    }

    return true;
  } catch (error) {
    console.error("Error parsing summary:", error);
    els.realContent.innerHTML = `<div class="error-message">Error parsing summary. Please try again.</div>`;
    chrome.runtime.sendMessage({ action: "error" });
    return false;
  }
}

async function generateSummary() {
  try {
    els.skeletonLoading.style.display = "block";
    els.realContent.style.display = "none";
    els.progressDots.classList.add("active");
    els.summaryContent.classList.add("expanded");
    chrome.runtime.sendMessage({ action: "summarize" });

    const { title, description, channelName, transcript } =
      await getVideoDetails();

    const prompt = `Summarize the YouTube video with these details:
      Title: '${title}'
      Description: '${description}'
      Channel: '${channelName}'
      Transcript Excerpt: ${JSON.stringify(getRandomSubset(transcript))}

      ### Generate:
      **Summary:** (Max 15 sentences) – Cover key points concisely.
        - Not more than 120 words.
        - Use **bold** for important points.
      **Key Moments:** (10-15 timestamps) – Format as MM:SS → Brief to medium description of the exact moment.
        - Sort timestamps in ascending order.
        - Include hours if needed (HH:MM:SS)
        - Only include important moments.`;

    const summary = await fetchAIResponse(prompt);
    parseAndDisplaySummary(summary);

    return true;
  } catch (error) {
    console.error("Error generating summary:", error);
    els.realContent.innerHTML = `<div class="error-message">${error.message}</div>`;
    chrome.runtime.sendMessage({ action: "error" });
    return false;
  } finally {
    els.skeletonLoading.style.display = "none";
    els.realContent.style.display = "block";
    els.progressDots.classList.remove("active");
    els.summaryContent.classList.add("loaded");
  }
}

els.btnSummarize.addEventListener("click", async () => {
  if (isProcessing) return;

  try {
    isProcessing = true;
    setButtonLoading(true);

    if (
      !els.summaryContent.classList.contains("loaded") ||
      els.summaryContent.classList.contains("expanded")
    ) {
      await generateSummary();
    } else {
      els.summaryContent.classList.remove("loaded", "expanded");
      chrome.runtime.sendMessage({ action: "close" });
    }
  } catch (error) {
    console.error("Button click error:", error);
    els.realContent.innerHTML = `<div class="error-message">An error occurred: ${error.message}</div>`;
  } finally {
    isProcessing = false;
    setButtonLoading(false);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".timestamp").forEach((timestamp) => {
    timestamp.addEventListener("click", () =>
      jumpToTimestamp(timestamp.textContent)
    );
  });
});
