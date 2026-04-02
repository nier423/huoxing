'use server'

import { revalidatePath } from "next/cache";
import { getDebateTopicTiming } from "@/lib/debate-schedule";
import type { DebateComment, DebateSide } from "@/lib/debates";
import { createClient } from "@/lib/supabase/server";

interface CreateDebateCommentInput {
  content: string;
  issueSlug: string;
  side: DebateSide;
  topicId: string;
}

interface DeleteDebateCommentInput {
  commentId: string;
  issueSlug: string;
}

interface ToggleDebateCommentLikeInput {
  commentId: string;
  issueSlug: string;
}

interface DebateActionResult {
  success: boolean;
  message: string;
}

interface CreateDebateCommentResult extends DebateActionResult {
  comment?: DebateComment;
}

interface DeleteDebateCommentResult extends DebateActionResult {
  commentId?: string;
  topicId?: string;
}

interface ToggleDebateCommentLikeResult extends DebateActionResult {
  commentId?: string;
  likeCount?: number;
  liked?: boolean;
}

export interface ToggleDebateCommentDislikeInput {
  commentId: string;
  issueSlug: string;
}

export interface ToggleDebateCommentDislikeResult extends DebateActionResult {
  commentId?: string;
  dislikeCount?: number;
  disliked?: boolean;
}

type RawRow = Record<string, unknown>;
type DebateCountTable = "debate_comment_likes" | "debate_comment_dislikes";

function toText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function toSide(value: unknown): DebateSide {
  return value === "con" ? "con" : "pro";
}

function mapComment(row: RawRow): DebateComment {
  return {
    id: String(row.id ?? ""),
    topicId: String(row.topic_id ?? ""),
    userId: String(row.user_id ?? ""),
    side: toSide(row.side),
    content: toText(row.content),
    createdAt: toText(row.created_at) || new Date(0).toISOString(),
    likeCount: 0,
    likedByViewer: false,
    dislikeCount: 0,
    dislikedByViewer: false,
  };
}

function revalidateDebatePaths(issueSlug: string) {
  if (!issueSlug) {
    return;
  }

  revalidatePath("/");
  revalidatePath("/issues");
  revalidatePath(`/issues/${issueSlug}`);
  revalidatePath(`/issues/${issueSlug}/debate`);
}

async function getDebateCommentCount(
  supabase: ReturnType<typeof createClient>,
  table: DebateCountTable,
  commentId: string
) {
  if (!commentId) {
    return 0;
  }

  const { count, error } = await supabase
    .from(table)
    .select("comment_id", { count: "exact", head: true })
    .eq("comment_id", commentId);

  if (error) {
    console.error(`[getDebateCommentCount] Failed to load ${table} count:`, error);
    return 0;
  }

  return count ?? 0;
}

export async function createDebateComment(
  input: CreateDebateCommentInput
): Promise<CreateDebateCommentResult> {
  if (!input.topicId) {
    return { success: false, message: "当前辩题不存在，暂时无法发言。" };
  }

  if (input.side !== "pro" && input.side !== "con") {
    return { success: false, message: "请选择正方或反方后再发言。" };
  }

  const content = input.content.trim();
  if (!content) {
    return { success: false, message: "先写下你的观点，再贴纸条。" };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "请先登录后再发言。" };
  }

  const { data: topic, error: topicError } = await supabase
    .from("debate_topics")
    .select("id, starts_at, ends_at")
    .eq("id", input.topicId)
    .maybeSingle();

  if (topicError) {
    console.error("[createDebateComment] Failed to load topic schedule:", topicError);
    return { success: false, message: "当前辩题暂时无法校验开放时间，请稍后重试。" };
  }

  if (!topic) {
    return { success: false, message: "当前辩题不存在，暂时无法发言。" };
  }

  const startsAt = toText(topic.starts_at) || null;
  const endsAt = toText(topic.ends_at) || null;

  if (!startsAt || !endsAt) {
    return { success: false, message: "当前辩题尚未配置完整的开始和结束时间。" };
  }

  const topicTiming = getDebateTopicTiming(startsAt, endsAt, Date.now());

  if (topicTiming.status === "not_started") {
    return { success: false, message: "辩论尚未开始，暂时不能发言。" };
  }

  if (topicTiming.status === "ended") {
    return { success: false, message: "辩论已结束，无法继续发言。" };
  }

  const { data, error } = await supabase
    .from("debate_comments")
    .insert({
      topic_id: input.topicId,
      user_id: user.id,
      side: input.side,
      content,
    })
    .select("*")
    .single();

  if (error || !data) {
    console.error("[createDebateComment] Failed to insert comment:", error);
    return { success: false, message: "纸条发送失败，请稍后重试。" };
  }

  revalidateDebatePaths(input.issueSlug);

  return {
    success: true,
    message: "纸条已经贴上去了。",
    comment: mapComment(data as RawRow),
  };
}

export async function deleteDebateComment(
  input: DeleteDebateCommentInput
): Promise<DeleteDebateCommentResult> {
  if (!input.commentId) {
    return { success: false, message: "没有找到要删除的纸条。" };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "请先登录。" };
  }

  const { data: existingComment, error: fetchError } = await supabase
    .from("debate_comments")
    .select("id, topic_id, user_id")
    .eq("id", input.commentId)
    .maybeSingle();

  if (fetchError) {
    console.error("[deleteDebateComment] Failed to load comment:", fetchError);
    return { success: false, message: "暂时无法确认纸条状态，请稍后重试。" };
  }

  if (!existingComment) {
    return { success: false, message: "这张纸条已经不存在了。" };
  }

  if (String(existingComment.user_id ?? "") !== user.id) {
    return { success: false, message: "只能删除你自己的纸条。" };
  }

  const [deleteLikesResult, deleteDislikesResult] = await Promise.all([
    supabase.from("debate_comment_likes").delete().eq("comment_id", input.commentId),
    supabase.from("debate_comment_dislikes").delete().eq("comment_id", input.commentId),
  ]);

  const reactionDeleteError = deleteLikesResult.error ?? deleteDislikesResult.error;

  if (reactionDeleteError) {
    console.error("[deleteDebateComment] Failed to delete comment reactions:", reactionDeleteError);
    return { success: false, message: "暂时无法清理这张纸条的互动记录，请稍后重试。" };
  }

  const { error: deleteError } = await supabase
    .from("debate_comments")
    .delete()
    .eq("id", input.commentId)
    .eq("user_id", user.id);

  if (deleteError) {
    console.error("[deleteDebateComment] Failed to delete comment:", deleteError);
    return { success: false, message: "删除失败，请稍后重试。" };
  }

  revalidateDebatePaths(input.issueSlug);

  return {
    success: true,
    message: "这张纸条已经取下。",
    commentId: input.commentId,
    topicId: String(existingComment.topic_id ?? ""),
  };
}

export async function toggleDebateCommentLike(
  input: ToggleDebateCommentLikeInput
): Promise<ToggleDebateCommentLikeResult> {
  if (!input.commentId) {
    return { success: false, message: "没有找到要点赞的纸条。" };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "请先登录后再点赞。" };
  }

  const { data: comment, error: commentError } = await supabase
    .from("debate_comments")
    .select("id, user_id")
    .eq("id", input.commentId)
    .maybeSingle();

  if (commentError) {
    console.error("[toggleDebateCommentLike] Failed to load comment:", commentError);
    return { success: false, message: "暂时无法确认这张纸条，请稍后重试。" };
  }

  if (!comment) {
    return { success: false, message: "这张纸条已经不存在了。" };
  }

  if (String(comment.user_id ?? "") === user.id) {
    return { success: false, message: "不能给自己的纸条点赞。" };
  }

  const { data: existingLike, error: existingLikeError } = await supabase
    .from("debate_comment_likes")
    .select("comment_id")
    .eq("comment_id", input.commentId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingLikeError) {
    console.error(
      "[toggleDebateCommentLike] Failed to load existing like:",
      existingLikeError
    );
    return { success: false, message: "暂时无法确认点赞状态，请稍后重试。" };
  }

  if (existingLike) {
    const { error: deleteError } = await supabase
      .from("debate_comment_likes")
      .delete()
      .eq("comment_id", input.commentId)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("[toggleDebateCommentLike] Failed to remove like:", deleteError);
      return { success: false, message: "取消点赞失败，请稍后重试。" };
    }

    const likeCount = await getDebateCommentCount(
      supabase,
      "debate_comment_likes",
      input.commentId
    );
    revalidateDebatePaths(input.issueSlug);

    return {
      success: true,
      message: "已取消点赞。",
      commentId: input.commentId,
      likeCount,
      liked: false,
    };
  }

  const { error: insertError } = await supabase
    .from("debate_comment_likes")
    .insert({
      comment_id: input.commentId,
      user_id: user.id,
    });

  if (insertError) {
    console.error("[toggleDebateCommentLike] Failed to insert like:", insertError);
    return { success: false, message: "点赞失败，请稍后重试。" };
  }

  const likeCount = await getDebateCommentCount(
    supabase,
    "debate_comment_likes",
    input.commentId
  );
  revalidateDebatePaths(input.issueSlug);

  return {
    success: true,
    message: "已点赞这张纸条。",
    commentId: input.commentId,
    likeCount,
    liked: true,
  };
}

export async function toggleDebateCommentDislike(
  input: ToggleDebateCommentDislikeInput
): Promise<ToggleDebateCommentDislikeResult> {
  if (!input.commentId) {
    return { success: false, message: "没有找到要踩的纸条。" };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "请先登录后再踩。" };
  }

  const { data: comment, error: commentError } = await supabase
    .from("debate_comments")
    .select("id, user_id, topic_id, side")
    .eq("id", input.commentId)
    .maybeSingle();

  if (commentError) {
    console.error("[toggleDebateCommentDislike] Failed to load comment:", commentError);
    return { success: false, message: "暂时无法确认这张纸条，请稍后重试。" };
  }

  if (!comment) {
    return { success: false, message: "这张纸条已经不存在了。" };
  }

  if (String(comment.user_id ?? "") === user.id) {
    return { success: false, message: "不能踩自己的纸条。" };
  }

  const [userCommentsResult, existingDislikeResult] = await Promise.all([
    supabase
      .from("debate_comments")
      .select("side")
      .eq("user_id", user.id)
      .eq("topic_id", String(comment.topic_id ?? ""))
      .order("created_at", { ascending: true })
      .limit(1),
    supabase
      .from("debate_comment_dislikes")
      .select("comment_id")
      .eq("comment_id", input.commentId)
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  if (userCommentsResult.error) {
    console.error(
      "[toggleDebateCommentDislike] Failed to load user comments:",
      userCommentsResult.error
    );
    return { success: false, message: "暂时无法确认你的阵营，请稍后重试。" };
  }

  const userSide =
    userCommentsResult.data && userCommentsResult.data.length > 0
      ? userCommentsResult.data[0].side
      : null;

  if (!userSide) {
    return { success: false, message: "先贴上你的第一张纸条，亮明阵营后就可以踩对方啦。" };
  }

  if (userSide === comment.side) {
    return { success: false, message: "只能踩对方阵营的纸条，不能背刺队友哦。" };
  }

  if (existingDislikeResult.error) {
    console.error(
      "[toggleDebateCommentDislike] Failed to load existing dislike:",
      existingDislikeResult.error
    );
    return { success: false, message: "暂时无法确认状态，请稍后重试。" };
  }

  if (existingDislikeResult.data) {
    const { error: deleteError } = await supabase
      .from("debate_comment_dislikes")
      .delete()
      .eq("comment_id", input.commentId)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("[toggleDebateCommentDislike] Failed to remove dislike:", deleteError);
      return { success: false, message: "撤回失败，请稍后重试。" };
    }

    const dislikeCount = await getDebateCommentCount(
      supabase,
      "debate_comment_dislikes",
      input.commentId
    );
    revalidateDebatePaths(input.issueSlug);

    return {
      success: true,
      message: "撤回啦。",
      commentId: input.commentId,
      dislikeCount,
      disliked: false,
    };
  }

  const { error: insertError } = await supabase
    .from("debate_comment_dislikes")
    .insert({
      comment_id: input.commentId,
      user_id: user.id,
    });

  if (insertError) {
    console.error("[toggleDebateCommentDislike] Failed to insert dislike:", insertError);
    return { success: false, message: "操作失败，请稍后重试。" };
  }

  const dislikeCount = await getDebateCommentCount(
    supabase,
    "debate_comment_dislikes",
    input.commentId
  );
  revalidateDebatePaths(input.issueSlug);

  return {
    success: true,
    message: "已踩。",
    commentId: input.commentId,
    dislikeCount,
    disliked: true,
  };
}
