import { redirect } from "next/navigation";
import CategoryStoriesPage from "@/components/CategoryStoriesPage";
import { getArticlesByCategory, getCurrentIssue } from "@/lib/articles";

export const revalidate = 60;

export default async function TheaterPage() {
  const currentIssue = await getCurrentIssue();
  const articles = await getArticlesByCategory("人间剧场", 30, {
    issueId: currentIssue?.id ?? null,
  });

  if (articles.length === 1) {
    redirect(`/articles/${encodeURIComponent(articles[0].slug)}`);
  }

  return (
    <CategoryStoriesPage
      title="人间剧场"
      englishTitle="Theater of Life"
      description="写人的困局、关系、现场与余波。"
      articles={articles}
      issue={currentIssue}
    />
  );
}
