import { eq } from "drizzle-orm";
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
