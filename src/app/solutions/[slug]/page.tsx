import { notFound } from 'next/navigation';
import { footerPagesData } from '@/lib/data/footerPages';
import GenericPageTemplate from '@/components/shared/GenericPageTemplate';

interface PageProps {
  params: {
    slug: string;
  };
}

export function generateStaticParams() {
  return footerPagesData.solutions.map((page) => ({
    slug: page.slug,
  }));
}

export default async function SolutionsPage({ params }: PageProps) {
  const resolvedParams = await params;
  const pageData = footerPagesData.solutions.find((p) => p.slug === resolvedParams.slug);

  if (!pageData) {
    notFound();
  }

  return <GenericPageTemplate pageData={pageData} />;
}
