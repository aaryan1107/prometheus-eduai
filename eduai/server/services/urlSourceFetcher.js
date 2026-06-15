import * as cheerio from "cheerio";

export async function fetchUrlSource({ url, title = "", type = "website" }) {
  if (!url || !/^https?:\/\//i.test(url)) {
    throw new Error("A valid http(s) URL is required.");
  }

  const response = await fetch(url, {
    headers: {
      "User-Agent": "EduAI-SourceFetcher/0.1"
    }
  });

  if (!response.ok) {
    throw new Error(`Could not fetch URL. Status ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);
  $("script, style, noscript, svg, iframe, nav, footer").remove();
  const pageTitle = title?.trim() || $("title").first().text().trim() || url;
  const text = $("body").text().replace(/\s+/g, " ").trim();

  if (!text || text.length < 300) {
    throw new Error("Fetched page did not contain enough readable text.");
  }

  return {
    title: pageTitle,
    type,
    url,
    text
  };
}
