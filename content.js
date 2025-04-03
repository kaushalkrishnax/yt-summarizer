function sendVideoIdToIframe() {
  const videoId = new URLSearchParams(window.location.search).get("v");
  if (!videoId) return;

  const iframe = document.querySelector("#summarizer-iframe");
  if (iframe) {
    iframe.contentWindow.postMessage({ action: "videoId", videoId }, "*");
  }
}

function injectSummarizer() {
  const descriptionElement = document.querySelector(
    "#bottom-row div#description"
  );
  if (descriptionElement && !document.querySelector("#summarizer-iframe")) {
    const iframe = document.createElement("iframe");
    iframe.id = "summarizer-iframe";
    iframe.src = chrome.runtime.getURL("index.html");
    iframe.style.width = "100%";
    iframe.style.height = "70px";
    iframe.style.border = "none";
    iframe.style.borderRadius = "12px";
    iframe.style.marginTop = "20px";
    iframe.style.marginRight = "10px";
    iframe.style.overflow = "hidden";

    descriptionElement.insertAdjacentElement("beforebegin", iframe);
    iframe.addEventListener("load", sendVideoIdToIframe);
  }
}

const observer = new MutationObserver(injectSummarizer);
observer.observe(document.body, { childList: true, subtree: true });

injectSummarizer();

let lastVideoId = new URLSearchParams(window.location.search).get("v");

function checkVideoChange() {
  const currentVideoId = new URLSearchParams(window.location.search).get("v");
  if (currentVideoId && currentVideoId !== lastVideoId) {
    lastVideoId = currentVideoId;
    sendVideoIdToIframe();
  }
}

window.addEventListener("yt-navigate-finish", checkVideoChange);
window.addEventListener("popstate", checkVideoChange);
