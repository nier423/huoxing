import CategoryStoriesPage from "@/components/CategoryStoriesPage";
import { getArticlesByCategory, getCurrentIssue } from "@/lib/articles";

export const revalidate = 60;

export default async function NonsensePage() {
  const currentIssue = await getCurrentIssue();
  const articles = await getArticlesByCategory("胡说八道", 30, {
    issueId: currentIssue?.id ?? null,
  });

  return (
    <CategoryStoriesPage
      title="胡说八道"
      englishTitle="Another Frequency"
      description="这里是自由的试验场。无论是短促、偏锋还是离题的文字，都在这里。"
      articles={articles}
      issue={currentIssue}
    />
  );
}
