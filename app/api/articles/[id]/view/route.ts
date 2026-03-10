import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface RouteContext {
  params: {
    id: string;
  };
}

export async function POST(_: Request, { params }: RouteContext) {
  const articleId = params.id;
  if (!articleId) {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: current, error: selectError } = await supabase
    .from("articles")
    .select("view_count")
    .eq("id", articleId)
    .maybeSingle();

  if (selectError || !current) {
    return NextResponse.json({ success: false }, { status: 404 });
  }

  const nextCount = Number(current.view_count ?? 0) + 1;
  const { error: updateError } = await supabase
    .from("articles")
    .update({ view_count: nextCount })
    .eq("id", articleId);

  if (updateError) {
    return NextResponse.json({ success: false }, { status: 500 });
  }

  return NextResponse.json({ success: true, viewCount: nextCount });
}
