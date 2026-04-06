"use server";

import { revalidatePath } from "next/cache";
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

function mapEchoRow(row: RawEcho): Omit<Echo, "authorLabel"> {
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

async function enrichEchoes(
  supabase: ReturnType<typeof createClient>,
  rows: RawEcho[]
): Promise<Echo[]> {
  if (rows.length === 0) return [];

  const userIds = Array.from(
    new Set(
      rows.map((r) => String(r.user_id ?? "")).filter(Boolean)
    )
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
    const base = mapEchoRow(row);
    const displayName = profileMap.get(base.userId);
    return {
      ...base,
      authorLabel: authorLabelFrom(base.isAnonymous, displayName),
    };
  });
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

  return enrichEchoes(supabase, data as RawEcho[]);
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

  const { data, error } = await supabase
    .from("echoes")
    .insert({
      article_id: input.articleId,
      content,
      user_id: user.id,
      is_anonymous: isAnonymous,
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
  let displayName: string | undefined;
  if (!isAnonymous) {
    const { data: prof } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .maybeSingle();
    displayName = prof?.display_name?.trim() ?? undefined;
  }

  const echo: Echo = {
    ...base,
    authorLabel: authorLabelFrom(isAnonymous, displayName),
  };

  revalidatePath("/", "layout");

  return {
    success: true,
    message: isAnonymous ? "匿名回响已发布" : "回响已发布",
    echo,
  };
}
