import ArticleDetail from "@/components/ArticleDetail";

interface PageProps {
  params: {
    id: string;
  };
}

export default function NonsenseArticlePage({ params }: PageProps) {
  const slug = decodeURIComponent(params.id);
  return <ArticleDetail slug={slug} backHref="/nonsense" fallbackCategory="胡说八道" />;
}
