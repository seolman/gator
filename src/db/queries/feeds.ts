import { eq, sql } from "drizzle-orm";
import { db } from "..";
import { feeds, users } from "../schema";

export async function createFeed(name: string, url: string, userId: string) {
  const [result] = await db.insert(feeds)
    .values({
      name: name,
      url: url,
      user_id: userId
    })
    .returning();

  return result;
}

export async function getFeeds() {
  const result = await db.select({
    feedName: feeds.name,
    feedURL: feeds.url,
    userName: users.name
  }).from(feeds).innerJoin(users, eq(users.id, feeds.user_id));

  return result;
}

export async function getFeedByURL(url: string) {
  const [result] = await db.select().from(feeds).where(eq(feeds.url, url));

  return result;
}

export async function markFeedFetched(feedId: string) {
  const [result] = await db.update(feeds)
    .set({
      lastFetchedAt: new Date(),
    })
    .where(eq(feeds.id, feedId))
    .returning();

  return result;
}

export async function getNextFeedToFetch() {
  const result = db.select().from(feeds)
    .orderBy(sql`${feeds.lastFetchedAt} desc nulls first`)
    .limit(1);

  return result;
}
