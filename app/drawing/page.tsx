import { notFound, redirect } from "next/navigation";
import { getLatestIssueWithDrawing } from "@/lib/issue-drawings";

export const revalidate = 60;

export default async function DrawingEntryPage() {
  const drawingIssue = await getLatestIssueWithDrawing();

  if (!drawingIssue) {
    notFound();
  }

  redirect(`/issues/${drawingIssue.slug}/drawing`);
}
