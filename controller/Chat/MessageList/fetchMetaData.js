const axios = require("axios");
const metascraper = require("metascraper")([
  require("metascraper-title")(),
  require("metascraper-description")(),
  require("metascraper-image")(),
  require("metascraper-logo")(),
  require("metascraper-url")(),
]);

const getYouTubeThumbnail = (url) => {
  const match = url.match(
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/
  );
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
};

const fetchMetaData = async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    // Fetch the raw HTML of the URL using axios
    const response = await axios.get(url);
    const html = response.data;

    // Extract metadata using metascraper
    const metadata = await metascraper({ html, url });

    // Fallback for YouTube thumbnails
    const youtubeThumbnail = getYouTubeThumbnail(url);

    // Format response
    const result = {
      title: metadata.title || "",
      description: metadata.description || "",
      image:
        youtubeThumbnail ||
        metadata.image ||
        metadata.logo ||
        `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}`,
    };

    res.json(result);
  } catch (error) {
    console.error("Error fetching metadata:", error);
    res.status(500).json({ error: "Failed to fetch metadata" });
  }
};

module.exports = { fetchMetaData };
