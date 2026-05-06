import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Lam Hoang Cat Vy',
  tagline: 'Senior AI Systems Architect — Portfolio & Knowledge Hub',
  favicon: 'img/favicon.svg',

  future: {
    v4: true,
  },

  url: 'https://catvy.dev',
  baseUrl: '/',

  organizationName: 'catvy',
  projectName: 'catvy-knowledge-hub',

  onBrokenLinks: 'warn',
  onBrokenAnchors: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  headTags: [
    {
      tagName: 'script',
      attributes: {},
      innerHTML: `(function(){var themes=['dark','light','vy'];var saved=localStorage.getItem('theme')||'dark';document.documentElement.setAttribute('data-theme',saved);document.addEventListener('DOMContentLoaded',function(){var nav=document.querySelector('.navbar__items--right');if(!nav)return;var container=document.createElement('div');container.className='theme-switcher';themes.forEach(function(t){var btn=document.createElement('button');btn.className='theme-btn theme-btn-'+t+(saved===t?' active':'');btn.title=t.charAt(0).toUpperCase()+t.slice(1)+' mode';btn.onclick=function(){document.documentElement.setAttribute('data-theme',t);localStorage.setItem('theme',t);document.querySelectorAll('.theme-btn').forEach(function(b){b.classList.remove('active')});btn.classList.add('active')};container.appendChild(btn)});nav.appendChild(container)})})();`,
    },
    {
      tagName: 'meta',
      attributes: {
        name: 'description',
        content:
          'Lam Hoang Cat Vy — Senior AI Systems Architect specializing in Generative AI, cloud-native development, and enterprise-scale system integration.',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        property: 'og:title',
        content: 'Lam Hoang Cat Vy — AI Systems Architect',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        property: 'og:description',
        content:
          'Portfolio and Knowledge Hub for Lam Hoang Cat Vy. Deep dives into Agentic RAG, AWS architecture, Systems Analysis, and GenAI security.',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        property: 'og:type',
        content: 'website',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        property: 'og:image',
        content: 'https://catvy.dev/img/docusaurus-social-card.jpg',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
    },
    {
      tagName: 'script',
      attributes: {
        type: 'application/ld+json',
      },
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'Lam Hoang Cat Vy',
        jobTitle: 'Senior AI Systems Architect',
        url: 'https://catvy.dev',
        sameAs: [
          'https://linkedin.com/in/lam-hoang-cat-vy',
          'https://github.com/LamHoangCatVy',
        ],
        knowsAbout: [
          'Generative AI',
          'Agentic RAG',
          'Cloud Architecture',
          'AWS',
          'Systems Analysis',
          'Cybersecurity',
          'Product Management',
        ],
        alumniOf: 'IU International University of Applied Sciences',
        worksFor: {
          '@type': 'Organization',
          name: 'VPBank',
        },
      }),
    },
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: 'knowledge-hub',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'ignore',
        },
        sitemap: {
          changefreq: 'weekly',
          priority: 0.5,
        },
        theme: {
          customCss: ['./src/css/custom.css', './src/css/blog-theme.css', './src/css/portfolio-scroll.css', './src/css/themes.css'],
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    './src/plugins/project-pages.js',
  ],

  themeConfig: {
    metadata: [
      { name: 'author', content: 'Lam Hoang Cat Vy' },
      { name: 'keywords', content: 'AI architect, Agentic RAG, GenAI, AWS, cloud architecture, systems analysis, portfolio' },
    ],
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: false,
    },
    navbar: {
      title: 'Cat Vy',
      logo: {
        alt: 'Cat Vy Logo',
        src: 'img/logo.svg',
      },
      items: [
        { to: '/', label: 'Portfolio', position: 'left' },
        { to: '/projects', label: 'Projects', position: 'left' },
        { to: '/knowledge-hub/intro', label: 'Knowledge Hub', position: 'left' },
        { to: '/blog', label: 'Blog', position: 'left' },
        {
          href: 'https://linkedin.com/in/lam-hoang-cat-vy',
          label: 'LinkedIn',
          position: 'right',
        },
        {
          href: 'https://github.com/LamHoangCatVy',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Explore',
          items: [
            { label: 'Portfolio', to: '/' },
            { label: 'Projects', to: '/projects' },
            { label: 'Knowledge Hub', to: '/knowledge-hub/intro' },
            { label: 'Blog', to: '/blog' },
          ],
        },
        {
          title: 'Learning',
          items: [
            { label: 'LLM Engineering', to: '/knowledge-hub/llm-engineering' },
            { label: 'Cloud Engineering', to: '/knowledge-hub/cloud-engineering' },
            { label: 'Systems Design', to: '/knowledge-hub/systems-design' },
            { label: 'Security', to: '/knowledge-hub/security' },
          ],
        },
        {
          title: 'Connect',
          items: [
            { label: 'LinkedIn', href: 'https://linkedin.com/in/lam-hoang-cat-vy' },
            { label: 'GitHub', href: 'https://github.com/LamHoangCatVy' },
            { label: 'Email', href: 'mailto:catvyisstudying@gmail.com' },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Lam Hoang Cat Vy. All rights reserved.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
