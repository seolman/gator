import { XMLParser } from "fast-xml-parser";

type RSSItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
};

type RSSFeed = {
  channel: {
    title: string;
    link: string;
    description: string;
    item: RSSItem[];
  };
};

export async function fetchFeed(feedURL: string): Promise<RSSFeed> {
  const response = await fetch(feedURL, {
    headers: {
      "User-Agent": "gator"
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status}`);
  }

  const xmlData = await response.text();
  const parser = new XMLParser();
  const parsed = parser.parse(xmlData);

  const channel = parsed?.rss?.channel;
  if (!channel || !channel.title || !channel.link || !channel.description) {
    throw new Error("Invalid RSS feed: missing required channel fields");
  }

  const rawItems = Array.isArray(channel.item) ? channel.item : channel.item ? [channel.item] : [];

  const items: RSSItem[] = rawItems
    .filter((item: any) =>
      item.title && item.link && item.description && item.pubDate
    )
    .map((item: any) => ({
      title: item.title,
      link: item.link,
      description: item.description,
      pubDate: item.pubDate,
    }));

  return {
    channel: {
      title: channel.title,
      link: channel.link,
      description: channel.description,
      item: items,
    },
  };
}
