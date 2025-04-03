# YouTube Summarizer Chrome Extension

## 📌 Overview
The **YouTube Summarizer** is a Chrome extension that automatically generates concise summaries and key moments from YouTube videos using **Gemini AI**. It injects its UI before the video description, eliminating the need to click on the extension icon.

## ✨ Features
- **AI-Powered Summaries**: Get a well-structured summary of any YouTube video.
- **Key Moments Detection**: Extracts timestamps and descriptions of important moments.
- **Clickable Timestamps**: Jump directly to specific moments in the video.
- **Seamless UI Integration**: The extension automatically injects its UI before the description of the video.
- **Supports Gemini API**: Uses Google's Gemini AI for accurate and intelligent video summarization.

## 🚀 Installation
1. Clone the repository:
   ```sh
   git clone https://github.com/kaushalkrishax/yt-summarizer.git
   ```
2. Open **Chrome** and navigate to `chrome://extensions/`.
3. Enable **Developer mode** (top-right corner).
4. Click **Load unpacked** and select the cloned project folder.
5. The extension will now be available in your Chrome toolbar.

## 📖 Usage
1. Open any YouTube video.
2. The extension will automatically inject its UI before the video description.
3. The AI will generate a summary and key moments using the Gemini API.
4. Click on a timestamp to jump to that part of the video.

## 🛠️ Development
### Tech Stack
- **JavaScript** (for extension logic)
- **Manifest V3** (for Chrome Extension API)
- **Google Gemini API** (for AI-generated summaries)

### File Structure
```
📂 yt-summarizer
│── background.js        # Handles background tasks
│── script.js           # Main logic for summarization
│── content.js          # Injected script for YouTube
│── index.html          # UI for displaying summary
│── manifest.json       # Chrome extension config
│── README.md           # Documentation
│── 📁 icons            # Extension icons
```

## 🔧 API Key Setup
To use the Gemini API, update the API key and model in `script.js`:
```js
const GEMINI_API_KEY = "your-api-key-here";
const GEMINI_MODEL = "gemini-2.0-flash";
```
Replace `your-api-key-here` with your own Gemini API key.

## 🔧 Troubleshooting
- **Summary not appearing?** Refresh the YouTube page and try again.
- **Timestamps not working?** Ensure JavaScript is enabled in your browser.
- **Error fetching summary?** Check API limits, API key, or network connection.

## 🤝 Contributing
Feel free to fork this project, submit issues, or suggest improvements!

## 📜 License
This project is licensed under the MIT License.

## 🔗 Contact
Developed with ❤️ by **Kaushal Krishna**  
GitHub: [kaushalkrishax](https://github.com/kaushalkrishax)

