import ArticleDetail from "@/components/ArticleDetail";

interface PageProps {
  params: {
    id: string;
  };
}

export default function TheaterArticlePage({ params }: PageProps) {
  const slug = decodeURIComponent(params.id);
  return <ArticleDetail slug={slug} backHref="/theater" fallbackCategory="人间剧场" />;
}
