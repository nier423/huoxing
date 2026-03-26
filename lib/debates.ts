import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export type DebateSide = "pro" | "con";

export interface DebateComment {
  id: string;
  topicId: string;
  userId: string;
  side: DebateSide;
  content: string;
  createdAt: string;
  likeCount: number;
  likedByViewer: boolean;
  dislikeCount: number;
  dislikedByViewer: boolean;
}

export interface DebateTopic {
  id: string;
  issueId: string;
  title: string;
  description: string | null;
  sortOrder: number;
  createdAt: string;
  comments: DebateComment[];
}

export type DebateTopicSummary = Omit<DebateTopic, "comments">;

type RawRow = Record<string, unknown>;

function toText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function toSide(value: unknown): DebateSide {
  return value === "con" ? "con" : "pro";
}

function mapTopic(row: RawRow): Omit<DebateTopic, "comments"> {
  return {
    id: String(row.id ?? ""),
    issueId: String(row.issue_id ?? ""),
    title: toText(row.title),
    description: toText(row.description) || null,
    sortOrder: Number(row.sort_order ?? 0),
    createdAt: toText(row.created_at) || new Date(0).toISOString(),
  };
}

function mapComment(
  row: RawRow,
  likeCounts: Map<string, number>,
  viewerLikedCommentIds: Set<string>,
  dislikeCounts: Map<string, number>,
  viewerDislikedCommentIds: Set<string>
): DebateComment {
  const id = String(row.id ?? "");

  return {
    id,
    topicId: String(row.topic_id ?? ""),
    userId: String(row.user_id ?? ""),
    side: toSide(row.side),
    content: toText(row.content),
    createdAt: toText(row.created_at) || new Date(0).toISOString(),
    likeCount: likeCounts.get(id) ?? 0,
    likedByViewer: viewerLikedCommentIds.has(id),
    dislikeCount: dislikeCounts.get(id) ?? 0,
    dislikedByViewer: viewerDislikedCommentIds.has(id),
  };
}

async function getDebateTopicSummariesInternal(
  issueId: string
): Promise<DebateTopicSummary[]> {
  const adminClient = createAdminClient();
  const { data: topicsData, error: topicsError } = await adminClient
    .from("debate_topics")
    .select("id, issue_id, title, description, sort_order, created_at")
    .eq("issue_id", issueId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (topicsError || !topicsData) {
    console.error("[getDebateTopicSummariesByIssueId] Failed to load topics:", topicsError);
    return [];
  }

  return (topicsData as RawRow[]).map(mapTopic);
}

export async function getDebateTopicSummariesByIssueId(
  issueId: string
): Promise<DebateTopicSummary[]> {
  if (!issueId) {
    return [];
  }

  return getDebateTopicSummariesInternal(issueId);
}

export async function getDebateTopicsByIssueId(
  issueId: string,
  viewerUserId?: string | null
): Promise<DebateTopic[]> {
  if (!issueId) {
    return [];
  }

  const topics = await getDebateTopicSummariesInternal(issueId);
  if (topics.length === 0) {
    return [];
  }

  const adminClient = createAdminClient();
  const topicIds = topics.map((topic) => topic.id);
  const { data: commentsData, error: commentsError } = await adminClient
    .from("debate_comments")
    .select("*")
    .in("topic_id", topicIds)
    .order("created_at", { ascending: true });

  if (commentsError) {
    console.error("[getDebateTopicsByIssueId] Failed to load comments:", commentsError);
  }

  const commentRows = (commentsData as RawRow[] | null) ?? [];
  const commentIds = commentRows.map((row) => String(row.id ?? "")).filter(Boolean);
  const likeCounts = new Map<string, number>();
  const dislikeCounts = new Map<string, number>();

  if (commentIds.length > 0) {
    const [likesResult, dislikesResult] = await Promise.all([
      adminClient.from("debate_comment_likes").select("comment_id").in("comment_id", commentIds),
      adminClient.from("debate_comment_dislikes").select("comment_id").in("comment_id", commentIds)
    ]);

    if (likesResult.error) {
      console.error("[getDebateTopicsByIssueId] Failed to load like counts:", likesResult.error);
    } else {
      for (const row of (likesResult.data as RawRow[] | null) ?? []) {
        const commentId = String(row.comment_id ?? "");
        if (commentId) likeCounts.set(commentId, (likeCounts.get(commentId) ?? 0) + 1);
      }
    }

    if (dislikesResult.error) {
      console.error("[getDebateTopicsByIssueId] Failed to load dislike counts:", dislikesResult.error);
    } else {
      for (const row of (dislikesResult.data as RawRow[] | null) ?? []) {
        const commentId = String(row.comment_id ?? "");
        if (commentId) dislikeCounts.set(commentId, (dislikeCounts.get(commentId) ?? 0) + 1);
      }
    }
  }

  const viewerLikedCommentIds = new Set<string>();
  const viewerDislikedCommentIds = new Set<string>();

  if (viewerUserId && commentIds.length > 0) {
    const [viewerLikesResult, viewerDislikesResult] = await Promise.all([
      adminClient.from("debate_comment_likes").select("comment_id").eq("user_id", viewerUserId).in("comment_id", commentIds),
      adminClient.from("debate_comment_dislikes").select("comment_id").eq("user_id", viewerUserId).in("comment_id", commentIds)
    ]);

    if (viewerLikesResult.error) {
      console.error("[getDebateTopicsByIssueId] Failed to load viewer like state:", viewerLikesResult.error);
    } else {
      for (const row of (viewerLikesResult.data as RawRow[] | null) ?? []) {
        const commentId = String(row.comment_id ?? "");
        if (commentId) viewerLikedCommentIds.add(commentId);
      }
    }

    if (viewerDislikesResult.error) {
      console.error("[getDebateTopicsByIssueId] Failed to load viewer dislike state:", viewerDislikesResult.error);
    } else {
      for (const row of (viewerDislikesResult.data as RawRow[] | null) ?? []) {
        const commentId = String(row.comment_id ?? "");
        if (commentId) viewerDislikedCommentIds.add(commentId);
      }
    }
  }

  const commentsByTopicId = new Map<string, DebateComment[]>();

  for (const row of commentRows) {
    const comment = mapComment(
      row, 
      likeCounts, 
      viewerLikedCommentIds,
      dislikeCounts,
      viewerDislikedCommentIds
    );
    const items = commentsByTopicId.get(comment.topicId) ?? [];
    items.push(comment);
    commentsByTopicId.set(comment.topicId, items);
  }

  return topics.map((topic) => ({
    ...topic,
    comments: commentsByTopicId.get(topic.id) ?? [],
  }));
}
