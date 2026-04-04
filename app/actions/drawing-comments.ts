"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface DrawingComment {
  id: string;
  issueId: string;
  userId: string;
  content: string;
  createdAt: string;
}

interface SubmitDrawingCommentInput {
  issueId: string;
  issueSlug: string;
  content: string;
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

function mapRow(row: RawRow): DrawingComment {
  return {
    id: String(row.id ?? ""),
    issueId: String(row.issue_id ?? ""),
    userId: String(row.user_id ?? ""),
    content: toText(row.content),
    createdAt:
      toText(row.created_at) ||
      toText(row.inserted_at) ||
      new Date(0).toISOString(),
  };
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

  return (data as RawRow[]).map(mapRow);
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

  const { data, error } = await supabase
    .from("issue_drawing_comments")
    .insert({
      issue_id: issueId,
      content,
      user_id: user.id,
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

  revalidatePath(`/issues/${issueSlug}/drawing`);
  revalidatePath(`/issues/${issueSlug}`);

  return {
    success: true,
    message: "留言已发送",
    comment: mapRow(data as RawRow),
  };
}
