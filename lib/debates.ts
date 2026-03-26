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
  viewerLikedCommentIds: Set<string>
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

  if (commentIds.length > 0) {
    const { data: likesData, error: likesError } = await adminClient
      .from("debate_comment_likes")
      .select("comment_id")
      .in("comment_id", commentIds);

    if (likesError) {
      console.error("[getDebateTopicsByIssueId] Failed to load like counts:", likesError);
    } else {
      for (const row of (likesData as RawRow[] | null) ?? []) {
        const commentId = String(row.comment_id ?? "");
        if (!commentId) {
          continue;
        }

        likeCounts.set(commentId, (likeCounts.get(commentId) ?? 0) + 1);
      }
    }
  }

  const viewerLikedCommentIds = new Set<string>();

  if (viewerUserId && commentIds.length > 0) {
    const { data: viewerLikesData, error: viewerLikesError } = await adminClient
      .from("debate_comment_likes")
      .select("comment_id")
      .eq("user_id", viewerUserId)
      .in("comment_id", commentIds);

    if (viewerLikesError) {
      console.error(
        "[getDebateTopicsByIssueId] Failed to load viewer like state:",
        viewerLikesError
      );
    } else {
      for (const row of (viewerLikesData as RawRow[] | null) ?? []) {
        const commentId = String(row.comment_id ?? "");
        if (commentId) {
          viewerLikedCommentIds.add(commentId);
        }
      }
    }
  }

  const commentsByTopicId = new Map<string, DebateComment[]>();

  for (const row of commentRows) {
    const comment = mapComment(row, likeCounts, viewerLikedCommentIds);
    const items = commentsByTopicId.get(comment.topicId) ?? [];
    items.push(comment);
    commentsByTopicId.set(comment.topicId, items);
  }

  return topics.map((topic) => ({
    ...topic,
    comments: commentsByTopicId.get(topic.id) ?? [],
  }));
}
