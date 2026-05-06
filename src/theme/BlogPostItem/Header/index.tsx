import React, { type ReactNode } from 'react';
import Header from '@theme-original/BlogPostItem/Header';
import type HeaderType from '@theme/BlogPostItem/Header';
import type { WrapperProps } from '@docusaurus/types';
import '@site/src/css/blog-theme.css';

type Props = WrapperProps<typeof HeaderType>;

export default function HeaderWrapper(props: Props): ReactNode {
  return (
    <>
      <Header {...props} />
    </>
  );
}
