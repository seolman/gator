import { readConfig } from "src/config";
import { createFeed, getFeedByURL, getFeeds } from "src/db/queries/feeds";
import { createFeedFollow, getFeedFollowsForUser } from "src/db/queries/follows";
import { getUserByName } from "src/db/queries/users";
import type { Feed, User } from "src/db/schema";
import { fetchFeed } from "src/rss";

export async function handlerAgg(cmdName: string, ...args: string[]) {
  // if (args.length !== 1) {
  //   throw new Error(`usage: ${cmdName} <url>`);
  // }

  // const feedURL = args[0];

  const feedURL = "https://www.wagslane.dev/index.xml";
  const feed = await fetchFeed(feedURL);
  console.dir(feed, {depth: null});
}

export async function handlerAddFeed(cmdName: string, ...args: string[]) {
  if (args.length !== 2) {
    throw new Error(`usage: ${cmdName} <name> <url>`);
  }

  const [name, url] = args;
  const config = readConfig();
  const user = await getUserByName(config.currentUserName);
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

export async function handlerFollow(cmdName: string, ...args: string[]) {
  if (args.length !== 1) {
    throw new Error(`usage: ${cmdName} <url>`);
  }

  const url = args[0];
  const config = readConfig()
  const user = await getUserByName(config.currentUserName);
  const feed = await getFeedByURL(url);
  const feedFollow = await createFeedFollow(user.id, feed.id);
  console.log(`- ${feed.name}`);
  console.log(`- ${user.name}`);
}

export async function handlerFollowing(cmdName: string, ...args: string[]) {
  if (args.length !== 0) {
    throw new Error(`usage: ${cmdName}`);
  }

  const config = readConfig()
  const user = await getUserByName(config.currentUserName);
  const feedFollows = await getFeedFollowsForUser(user.id);
  if (feedFollows.length === 0) {
    console.log("no feed follows for this user");
    return;
  }

  feedFollows.forEach((follow) => {
    console.log(`- ${follow.feedname}`);
  });
}
