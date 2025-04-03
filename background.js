chrome.runtime.onMessage.addListener((message) => {
  if (message.action) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: (action, seconds) => {
          const iframe = document.querySelector("#summarizer-iframe");
          if (iframe && action) {
            if (action === "summarize") {
              iframe.style.height = "600px";
            } else if (action === "error") {
              iframe.style.height = "200px";
            } else if (action === "close") {
              iframe.style.height = "70px";
            }
            window.scrollTo({ top: 600, behavior: 'smooth' });
          }

          if (action === "seek" && typeof seconds === "number") {
            const videoPlayer = document.querySelector("video.video-stream.html5-main-video");

            if (videoPlayer) {
              videoPlayer.currentTime = seconds;
            }

            const url = new URL(window.location.href);
            url.searchParams.set('t', `${seconds}s`);
            window.history.replaceState(null, "", url.toString());

            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        },
        args: [message.action, message.seconds ?? null],
      });
    });
  }
});