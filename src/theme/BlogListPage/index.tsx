import React, { type ReactNode } from 'react';
import BlogListPage from '@theme-original/BlogListPage';
import type BlogListPageType from '@theme/BlogListPage';
import type { WrapperProps } from '@docusaurus/types';
import '@site/src/css/blog-theme.css';

type Props = WrapperProps<typeof BlogListPageType>;

export default function BlogListPageWrapper(props: Props): ReactNode {
  return (
    <>
      <div className="blog-list-wrapper">
        <BlogListPage {...props} />
      </div>
    </>
  );
}
