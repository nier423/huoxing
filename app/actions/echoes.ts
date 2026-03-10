'use server'

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface Echo {
  id: string;
  articleId: string;
  content: string;
  userId: string;
  createdAt: string;
}

interface SubmitEchoInput {
  articleId: string;
  content: string;
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

function mapEcho(row: RawEcho): Echo {
  return {
    id: String(row.id ?? ""),
    articleId: String(row.article_id ?? ""),
    content: toText(row.content),
    userId: String(row.user_id ?? ""),
    createdAt:
      toText(row.created_at) ||
      toText(row.inserted_at) ||
      new Date(0).toISOString(),
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

  return (data as RawEcho[]).map(mapEcho);
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

  const { data, error } = await supabase
    .from("echoes")
    .insert({
      article_id: input.articleId,
      content,
      user_id: user.id,
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

  revalidatePath("/", "layout");

  return {
    success: true,
    message: "回响已发布",
    echo: mapEcho(data as RawEcho),
  };
}
