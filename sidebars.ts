import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';
import fs from 'fs';
import path from 'path';

interface ManifestPage {
  slug: string;
  visible: boolean;
}

interface ManifestSubcategory {
  id: string;
  label: string;
  visible: boolean;
}

interface ManifestDomain {
  id: string;
  label: string;
  visible: boolean;
  subcategories?: ManifestSubcategory[];
  pages: ManifestPage[];
}

interface Manifest {
  domains: ManifestDomain[];
}

function loadManifest(): Manifest {
  try {
    const manifestPath = path.join(process.cwd(), 'static', 'docs-manifest.json');
    return JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  } catch {
    return { domains: [] };
  }
}

function slugFromFilename(f: string): string {
  return f.replace(/\.(mdx|md)$/, '').replace(/^\d+-/, '');
}

function isHidden(
  manifestPages: ManifestPage[],
  slug: string
): boolean {
  const config = manifestPages.find((p) => p.slug === slug);
  return config ? !config.visible : false;
}

function isSubcategoryHidden(
  subcategories: ManifestSubcategory[] | undefined,
  subId: string
): boolean {
  if (!subcategories) return false;
  const config = subcategories.find((s) => s.id === subId);
  return config ? !config.visible : false;
}

function discoverFlatPages(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.mdx') || f.endsWith('.md'))
    .map(slugFromFilename)
    .filter((slug) => slug !== 'index' && !slug.startsWith('_'));
}

function discoverSubdirs(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => {
    const full = path.join(dir, f);
    return fs.statSync(full).isDirectory() && !f.startsWith('_') && !f.startsWith('.');
  });
}

function buildCategoryItems(
  dir: string,
  idPrefix: string,
  subcategories?: ManifestSubcategory[],
  pages?: ManifestPage[]
): any[] {
  const items: any[] = [];

  // 1. Flat pages at this level
  const flatPages = discoverFlatPages(dir);
  for (const slug of flatPages.sort()) {
    const pageConfig = pages?.find((p) => p.slug === slug);
    if (pageConfig && !pageConfig.visible) continue;
    items.push(`${idPrefix}/${slug}`);
  }

  // 2. Subdirectories at this level
  const subdirs = discoverSubdirs(dir);
  for (const sub of subdirs.sort()) {
    // Check if this subdir is hidden via manifest subcategories
    const subConfig = subcategories?.find((s) => s.id === sub);
    if (subConfig && !subConfig.visible) continue;

    const label = subConfig?.label || sub.charAt(0).toUpperCase() + sub.slice(1).replace(/-/g, ' ');
    const subPath = path.join(dir, sub);
    const subIdPrefix = `${idPrefix}/${sub}`;

    // Recursively build items for this subdirectory
    const subItems = buildCategoryItems(subPath, subIdPrefix, undefined, undefined);

    if (subItems.length > 0) {
      items.push({
        type: 'category',
        label,
        collapsible: true,
        collapsed: true,
        items: subItems,
      });
    }
  }

  return items;
}

function buildDomainCategory(domain: ManifestDomain): any {
  const domainDir = path.join(process.cwd(), 'docs', domain.id);

  const items = buildCategoryItems(
    domainDir,
    domain.id,
    domain.subcategories,
    domain.pages
  );

  return {
    type: 'category',
    label: domain.label,
    link: { type: 'doc', id: `${domain.id}/index` },
    collapsible: true,
    collapsed: false,
    items,
  };
}

function buildSidebar(): SidebarsConfig['knowledgeSidebar'] {
  const manifest = loadManifest();
  const items: any[] = ['intro'];

  for (const domain of manifest.domains) {
    if (!domain.visible) continue;
    items.push(buildDomainCategory(domain));
  }

  return items;
}

const sidebars: SidebarsConfig = {
  knowledgeSidebar: buildSidebar(),
};

export default sidebars;
