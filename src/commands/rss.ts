import { createFeed, getFeedByURL, getFeeds, getNextFeedToFetch, markFeedFetched } from "src/db/queries/feeds";
import { createFeedFollow, deleteFeedFollowByUserAndUrl, getFeedFollowsForUser } from "src/db/queries/follows";
import type { Feed, User } from "src/db/schema";
import { fetchFeed } from "src/rss";

export async function handlerAgg(cmdName: string, ...args: string[]) {
  if (args.length !== 1) {
    throw new Error(`usage: ${cmdName} <interval>`);
  }

  const timeArg = args[0];
  const intervalMs = parseDuration(timeArg);
  if (!intervalMs) {
    throw new Error(`invalid duration: ${timeArg} - use 1hr 30m 15s or 2000ms`);
  }

  console.log(`collecting feeds every ${intervalMs}ms`);

  scrapeFeeds().catch(handleError);

  const interval = setInterval(() => {
    scrapeFeeds().catch(handleError);
  }, intervalMs);

  await new Promise<void>((resolve) => {
    process.on("SIGINT", () => {
      console.log("shutting down feed aggregator...");
      clearInterval(interval);
      resolve();
    });
  });
}

export async function handlerAddFeed(cmdName: string, user: User, ...args: string[]) {
  if (args.length !== 2) {
    throw new Error(`usage: ${cmdName} <name> <url>`);
  }

  const [name, url] = args;
  const feed = await createFeed(name, url, user.id);
  const feedFollow = await createFeedFollow(user.id, feed.id);
  printFeed(feed, user);
}

function printFeed(feed: Feed, user: User) {
  console.dir(feed, { depth: null });
  console.dir(user, { depth: null });
}

export async function handlerFeeds(cmdName: string, ...args: string[]) {
  const feeds = await getFeeds();
  if (feeds.length === 0) {
    console.log("no feeds found");
    return;
  }
  
  feeds.forEach((feed) => {
    console.log(`- ${feed.feedName}`);
    console.log(`- ${feed.userName}`);
  });
}

export async function handlerFollow(cmdName: string, user: User, ...args: string[]) {
  if (args.length !== 1) {
    throw new Error(`usage: ${cmdName} <url>`);
  }

  const url = args[0];
  const feed = await getFeedByURL(url);
  const feedFollow = await createFeedFollow(user.id, feed.id);
  console.log(`- ${feed.name}`);
  console.log(`- ${user.name}`);
}

export async function handlerFollowing(cmdName: string, user: User, ...args: string[]) {
  if (args.length !== 0) {
    throw new Error(`usage: ${cmdName}`);
  }

  const feedFollows = await getFeedFollowsForUser(user.id);
  if (feedFollows.length === 0) {
    console.log("no feed follows for this user");
    return;
  }

  feedFollows.forEach((follow) => {
    console.log(`- ${follow.feedname}`);
  });
}

export async function handlerUnfollow(cmdName: string, user: User, ...args: string[]) {
  if (args.length !== 1) {
    throw new Error(`usage: ${cmdName} <url>`);
  }
  
  const url = args[0];
  await deleteFeedFollowByUserAndUrl(user.id, url);
  console.log(`unfollowed feed: ${url}`);
}

function parseDuration(durationStr: string) {
  const regex = /^(\d+)(ms|s|m|h)$/;
  const match = durationStr.match(regex);

  if (!match) return;
  if (match.length !== 3) return;

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case "ms": return value;
    case "s": return value * 1000;
    case "m": return value * 60 * 1000;
    case "h": return value * 60 * 60 * 1000;
    default: return;
  }
}

async function scrapeFeeds() {
  const [feed] = await getNextFeedToFetch();
  if (!feed) {
    console.log("no feed to fetch");
    return;
  }

  console.log("found feed to fetch");

  await markFeedFetched(feed.id);
  const feedData = await fetchFeed(feed.url);
  console.log(`Feed ${feed.name} collected. ${feedData.channel.item.length} posts found`);
}

function handleError(err: unknown) {
  console.error(
    `Error scraping feeds: ${err instanceof Error ? err.message : err}`,
  );
}
