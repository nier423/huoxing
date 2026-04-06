import "server-only";

import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = ReturnType<typeof createClient>;
type Row = Record<string, unknown>;

function toText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function normalizeDisplayName(value: unknown): string {
  return toText(value).trim();
}

export function authorLabelFrom(
  isAnonymous: boolean,
  authorDisplayName: string | null | undefined
): string {
  if (isAnonymous) {
    return "匿名";
  }

  const name = normalizeDisplayName(authorDisplayName);
  return name || "用户";
}

export function authorDisplayNameFromRow(row: Row): string | null {
  return normalizeDisplayName(row.author_display_name) || null;
}

export async function resolveCurrentAuthorDisplayName(
  supabase: SupabaseServerClient,
  user: User
): Promise<string> {
  const fallbackName =
    normalizeDisplayName(user.user_metadata?.display_name) ||
    normalizeDisplayName(user.email?.split("@")[0]) ||
    "用户";

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();

  return normalizeDisplayName(profile?.display_name) || fallbackName;
}
