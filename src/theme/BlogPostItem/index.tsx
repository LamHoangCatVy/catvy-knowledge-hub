import React, { type ReactNode } from 'react';
import clsx from 'clsx';
import { useBlogPost } from '@docusaurus/plugin-content-blog/client';
import BlogPostItemContainer from '@theme/BlogPostItem/Container';
import BlogPostItemHeader from '@theme/BlogPostItem/Header';
import BlogPostItemContent from '@theme/BlogPostItem/Content';
import BlogPostItemFooter from '@theme/BlogPostItem/Footer';
import type { Props } from '@theme/BlogPostItem';
import '@site/src/css/blog-theme.css';

function BlogHeroImage() {
  const { frontMatter, isBlogPostPage } = useBlogPost();
  if (!isBlogPostPage) return null;
  const img = (frontMatter as Record<string, unknown>).image as string | undefined;
  if (!img || img.includes('docusaurus-social-card') || img.includes('undraw')) return null;
  return (
    <div className="blog-hero-image">
      <img src={img} alt="" className="blog-hero-img" />
    </div>
  );
}

function useContainerClassName() {
  const { isBlogPostPage } = useBlogPost();
  return !isBlogPostPage ? 'margin-bottom--xl' : undefined;
}

export default function BlogPostItem({ children, className }: Props): ReactNode {
  const containerClassName = useContainerClassName();
  return (
    <BlogPostItemContainer className={clsx(containerClassName, className)}>
      <BlogPostItemHeader />
      <BlogHeroImage />
      <BlogPostItemContent>{children}</BlogPostItemContent>
      <BlogPostItemFooter />
    </BlogPostItemContainer>
  );
}
