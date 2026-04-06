"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface DrawingComment {
  id: string;
  issueId: string;
  userId: string;
  content: string;
  createdAt: string;
  isAnonymous: boolean;
  authorLabel: string;
}

interface SubmitDrawingCommentInput {
  issueId: string;
  issueSlug: string;
  content: string;
  isAnonymous?: boolean;
}

interface SubmitDrawingCommentResult {
  success: boolean;
  message: string;
  comment?: DrawingComment;
}

type RawRow = Record<string, unknown>;

function toText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function mapRowBase(row: RawRow): Omit<DrawingComment, "authorLabel"> {
  return {
    id: String(row.id ?? ""),
    issueId: String(row.issue_id ?? ""),
    userId: String(row.user_id ?? ""),
    content: toText(row.content),
    createdAt:
      toText(row.created_at) ||
      toText(row.inserted_at) ||
      new Date(0).toISOString(),
    isAnonymous: Boolean(row.is_anonymous),
  };
}

function authorLabelFrom(
  isAnonymous: boolean,
  displayName: string | null | undefined
): string {
  if (isAnonymous) return "匿名";
  const name = displayName?.trim();
  if (name) return name;
  return "用户";
}

async function enrichComments(
  supabase: ReturnType<typeof createClient>,
  rows: RawRow[]
): Promise<DrawingComment[]> {
  if (rows.length === 0) return [];

  const userIds = Array.from(
    new Set(rows.map((r) => String(r.user_id ?? "")).filter(Boolean))
  );

  const profileMap = new Map<string, string>();
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name")
      .in("id", userIds);

    if (profiles) {
      for (const p of profiles as { id: string; display_name: string | null }[]) {
        profileMap.set(p.id, p.display_name?.trim() ?? "");
      }
    }
  }

  return rows.map((row) => {
    const base = mapRowBase(row);
    const displayName = profileMap.get(base.userId);
    return {
      ...base,
      authorLabel: authorLabelFrom(base.isAnonymous, displayName),
    };
  });
}

export async function fetchDrawingComments(issueId: string): Promise<DrawingComment[]> {
  if (!issueId) {
    return [];
  }

  const supabase = createClient();

  const { data, error } = await supabase
    .from("issue_drawing_comments")
    .select("*")
    .eq("issue_id", issueId)
    .order("created_at", { ascending: true });

  if (error || !data) {
    console.error("[fetchDrawingComments] 获取画里话外留言失败:", error);
    return [];
  }

  return enrichComments(supabase, data as RawRow[]);
}

export async function submitDrawingComment(
  input: SubmitDrawingCommentInput
): Promise<SubmitDrawingCommentResult> {
  const issueId = input.issueId?.trim();
  const issueSlug = input.issueSlug?.trim();

  if (!issueId || !issueSlug) {
    return {
      success: false,
      message: "期刊信息无效",
    };
  }

  const content = input.content.trim();

  if (!content) {
    return {
      success: false,
      message: "请写下留言内容",
    };
  }

  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "请先点亮身份，再留下你的星火。",
    };
  }

  const { data: drawingRow, error: drawingError } = await supabase
    .from("issue_drawings")
    .select("id")
    .eq("issue_id", issueId)
    .maybeSingle();

  if (drawingError || !drawingRow) {
    return {
      success: false,
      message: "画里有话暂未开放",
    };
  }

  const isAnonymous = Boolean(input.isAnonymous);

  const { data, error } = await supabase
    .from("issue_drawing_comments")
    .insert({
      issue_id: issueId,
      content,
      user_id: user.id,
      is_anonymous: isAnonymous,
    })
    .select("*")
    .single();

  if (error || !data) {
    console.error("[submitDrawingComment] 发表失败:", error);
    return {
      success: false,
      message: "发表失败，请稍后重试",
    };
  }

  const base = mapRowBase(data as RawRow);
  let displayName: string | undefined;
  if (!isAnonymous) {
    const { data: prof } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .maybeSingle();
    displayName = prof?.display_name?.trim() ?? undefined;
  }

  const comment: DrawingComment = {
    ...base,
    authorLabel: authorLabelFrom(isAnonymous, displayName),
  };

  revalidatePath(`/issues/${issueSlug}/drawing`);

  return {
    success: true,
    message: isAnonymous ? "匿名留言已发送" : "留言已发送",
    comment,
  };
}
