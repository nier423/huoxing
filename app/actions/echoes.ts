"use server";

import { revalidatePath } from "next/cache";
import {
  authorDisplayNameFromRow,
  authorLabelFrom,
  resolveCurrentAuthorDisplayName,
} from "@/lib/comment-authors";
import { createClient } from "@/lib/supabase/server";

export interface Echo {
  id: string;
  articleId: string;
  content: string;
  userId: string;
  createdAt: string;
  isAnonymous: boolean;
  /** 展示用：匿名 或 用户昵称 */
  authorLabel: string;
}

interface SubmitEchoInput {
  articleId: string;
  content: string;
  /** 为 true 时前台显示匿名，不展示昵称 */
  isAnonymous?: boolean;
}

interface SubmitEchoResult {
  success: boolean;
  message: string;
  echo?: Echo;
}

type RawEcho = Record<string, unknown>;

function toText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

type MappedEchoRow = Omit<Echo, "authorLabel"> & {
  authorDisplayName: string | null;
};

function mapEchoRow(row: RawEcho): MappedEchoRow {
  return {
    id: String(row.id ?? ""),
    articleId: String(row.article_id ?? ""),
    content: toText(row.content),
    userId: String(row.user_id ?? ""),
    createdAt:
      toText(row.created_at) ||
      toText(row.inserted_at) ||
      new Date(0).toISOString(),
    isAnonymous: Boolean(row.is_anonymous),
    authorDisplayName: authorDisplayNameFromRow(row),
  };
}

export async function fetchEchoes(articleId: string): Promise<Echo[]> {
  if (!articleId) {
    return [];
  }

  const supabase = createClient();

  const { data, error } = await supabase
    .from("echoes")
    .select("*")
    .eq("article_id", articleId)
    .order("created_at", { ascending: true });

  if (error || !data) {
    console.error("[fetchEchoes] 获取回响失败:", error);
    return [];
  }

  return (data as RawEcho[]).map((row) => {
    const base = mapEchoRow(row);

    return {
      id: base.id,
      articleId: base.articleId,
      content: base.content,
      userId: base.userId,
      createdAt: base.createdAt,
      isAnonymous: base.isAnonymous,
      authorLabel: authorLabelFrom(base.isAnonymous, base.authorDisplayName),
    };
  });
}

export async function submitEcho(input: SubmitEchoInput): Promise<SubmitEchoResult> {
  if (!input.articleId) {
    return {
      success: false,
      message: "文章不存在，无法发送回音",
    };
  }

  const content = input.content.trim();

  if (!content) {
    return {
      success: false,
      message: "请写下回音内容",
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

  const isAnonymous = Boolean(input.isAnonymous);
  const authorDisplayName = await resolveCurrentAuthorDisplayName(supabase, user);

  const { data, error } = await supabase
    .from("echoes")
    .insert({
      article_id: input.articleId,
      content,
      user_id: user.id,
      is_anonymous: isAnonymous,
      author_display_name: authorDisplayName,
    })
    .select("*")
    .single();

  if (error || !data) {
    console.error("[submitEcho] 发表回响失败:", error);
    return {
      success: false,
      message: "发表失败，请稍后重试",
    };
  }

  const base = mapEchoRow(data as RawEcho);

  const echo: Echo = {
    id: base.id,
    articleId: base.articleId,
    content: base.content,
    userId: base.userId,
    createdAt: base.createdAt,
    isAnonymous: base.isAnonymous,
    authorLabel: authorLabelFrom(base.isAnonymous, base.authorDisplayName),
  };

  revalidatePath("/", "layout");

  return {
    success: true,
    message: isAnonymous ? "匿名回响已发布" : "回响已发布",
    echo,
  };
}
