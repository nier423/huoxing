import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface RouteContext {
  params: {
    id: string;
  };
}

export async function POST(_: Request, { params }: RouteContext) {
  const drawingId = params.id;

  if (!drawingId) {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("increment_issue_drawing_view_count", {
    p_drawing_id: drawingId,
  });

  if (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }

  if (data === null) {
    return NextResponse.json({ success: false }, { status: 404 });
  }

  return NextResponse.json({ success: true, viewCount: Number(data ?? 0) });
}
