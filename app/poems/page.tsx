import CategoryStoriesPage from "@/components/CategoryStoriesPage";
import { getArticlesByCategory, getCurrentIssue } from "@/lib/articles";

export const revalidate = 60;

export default async function PoemsPage() {
  const currentIssue = await getCurrentIssue();
  const articles = await getArticlesByCategory("三行两句", 30, {
    issueId: currentIssue?.id ?? null,
  });

  return (
    <CategoryStoriesPage
      title="三行两句"
      englishTitle="Poetry & Whispers"
      description="诗歌是灵魂的呼吸。用极简的文字，触碰最真实的共鸣。"
      articles={articles}
      issue={currentIssue}
    />
  );
}
