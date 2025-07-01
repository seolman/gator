import { and, eq } from "drizzle-orm";
import { db } from "..";
import { feedFollows, feeds } from "../schema";

export async function createFeedFollow(userId: string, feedId: string) {
  const [result] = await db.insert(feedFollows)
    .values({
      userId: userId,
      feedId: feedId,
    })
    .returning();

  return result;
}

export async function getFeedFollowsForUser(userId: string) {
  const follows = await db.select({
    id: feedFollows.id,
    createdAt: feedFollows.createdAt,
    updatedAT: feedFollows.updatedAt,
    userId: feedFollows.userId,
    feedId: feedFollows.feedId,
    feedname: feeds.name,
  }).from(feedFollows)
    .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
    .where(eq(feedFollows.userId, userId));

  return follows;
}

export async function deleteFeedFollowByUserAndUrl(userId: string, url: string) {
  const [feed] = await db.select().from(feeds).where(eq(feeds.url, url));
  if (!feed) {
    throw new Error(`feed with url ${url} not found`);
  }

  await db.delete(feedFollows).where(and(eq(feedFollows.feedId, feed.id), eq(feedFollows.userId, userId)))
}
