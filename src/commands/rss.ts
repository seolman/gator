import { readConfig } from "src/config";
import { createFeed, getFeeds } from "src/db/queries/feeds";
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
