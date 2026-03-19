import ArticleDetail from "@/components/ArticleDetail";

interface PageProps {
  params: {
    slug: string;
  };
}

export default function ArticlePage({ params }: PageProps) {
  const slug = decodeURIComponent(params.slug);
  return <ArticleDetail slug={slug} />;
}
