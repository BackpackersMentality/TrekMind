// lib/articles.ts
// Loads article metadata and markdown content.
// Articles are stored as markdown files in src/data/articles/
// and indexed by articles-meta.json.

import articlesMetaRaw from '../data/articles-meta.json';

export interface ArticleMeta {
  slug: string;
  title: string;
  description: string;
  category: string;
  readTime: string;
  publishedAt: string;
  featured: boolean;
  relatedTreks: string[];
}

// All article metadata — typed and exported
export const articlesMeta: ArticleMeta[] = articlesMetaRaw as ArticleMeta[];

export function getArticleBySlug(slug: string): ArticleMeta | null {
  return articlesMeta.find(a => a.slug === slug) ?? null;
}

export function getFeaturedArticles(): ArticleMeta[] {
  return articlesMeta.filter(a => a.featured);
}

export function getArticlesByCategory(category: string): ArticleMeta[] {
  return articlesMeta.filter(a => a.category === category);
}

// Async markdown loader — articles are served as static files from /data/articles/
// Vite/Cloudflare Pages will serve these as text from the public folder.
export async function loadArticleContent(slug: string): Promise<string | null> {
  const url = `/data/articles/${slug}.md`;
  console.log(`[TrekMind] Fetching article: ${url}`);
  try {
    const res = await fetch(url);
    console.log(`[TrekMind] Response status: ${res.status} ${res.statusText}`);
    console.log(`[TrekMind] Content-Type: ${res.headers.get('content-type')}`);
    if (!res.ok) {
      console.error(`[TrekMind] Fetch failed: HTTP ${res.status} for ${url}`);
      return null;
    }
    const text = await res.text();
    console.log(`[TrekMind] Response length: ${text.length} chars`);
    console.log(`[TrekMind] First 120 chars: ${JSON.stringify(text.slice(0, 120))}`);
    if (text.trimStart().startsWith('<!DOCTYPE') || text.trimStart().startsWith('<html')) {
      console.error('[TrekMind] Got HTML response (SPA fallback) — file not found on server');
      return null;
    }
    if (text.trim().length === 0) {
      console.error('[TrekMind] Empty response — file exists but is empty');
      return null;
    }
    console.log('[TrekMind] Article loaded successfully ✓');
    return text;
  } catch (err) {
    console.error(`[TrekMind] Fetch threw exception:`, err);
    return null;
  }
}

// Simple markdown to HTML converter for rendering articles.
// Handles: headings, bold, italic, links, horizontal rules, paragraphs, tables.
// No external dependency needed for this level of markdown.
export function markdownToHtml(md: string): string {
  return md
    // Tables (must come before other rules)
    .replace(/^\|(.+)\|\s*\n\|[-| :]+\|\s*\n((?:\|.+\|\s*\n?)+)/gm, (_match, header, rows) => {
      const ths = header.split('|').filter((c: string) => c.trim()).map((c: string) =>
        `<th class="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider border-b border-border">${c.trim()}</th>`
      ).join('');
      const trs = rows.trim().split('\n').map((row: string) => {
        const tds = row.split('|').filter((c: string) => c.trim() !== '' || row.indexOf(c) > 0).map((c: string) =>
          `<td class="px-4 py-2 text-sm border-b border-border/50">${c.trim()}</td>`
        ).join('');
        return `<tr class="hover:bg-muted/30">${tds}</tr>`;
      }).join('');
      return `<div class="overflow-x-auto my-6"><table class="w-full border border-border rounded-lg overflow-hidden"><thead class="bg-muted/50"><tr>${ths}</tr></thead><tbody>${trs}</tbody></table></div>`;
    })
    // H1-H4 headings
    .replace(/^#### (.+)$/gm, '<h4 class="text-lg font-bold text-foreground mt-6 mb-2">$1</h4>')
    .replace(/^### (.+)$/gm, '<h3 class="text-xl font-bold text-foreground mt-8 mb-3">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold text-foreground mt-10 mb-4 pt-6 border-t border-border">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-3xl md:text-4xl font-bold text-foreground mb-2">$1</h1>')
    // HR
    .replace(/^---$/gm, '<hr class="my-8 border-border" />')
    // Bold + italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Code inline
    .replace(/`([^`]+)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground">$1</code>')
    // Links — internal trek links get special treatment
    .replace(/\[([^\]]+)\]\((https:\/\/trekmind\.pages\.dev[^\)]*)\)/g,
      '<a href="$2" class="text-primary font-semibold hover:underline">$1 →</a>')
    .replace(/\[([^\]]+)\]\(([^\)]+)\)/g,
      '<a href="$2" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
    // Unordered lists
    .replace(/^- (.+)$/gm, '<li class="ml-4 mb-1 list-disc list-inside text-muted-foreground">$1</li>')
    // Numbered lists
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 mb-1 list-decimal list-inside text-muted-foreground">$1</li>')
    // Wrap consecutive <li> elements
    .replace(/(<li[^>]*>.*<\/li>\n?)+/g, '<ul class="my-4 space-y-1">$&</ul>')
    // Paragraphs — lines that aren't already HTML tags
    .replace(/^(?!<[a-z]|$)(.+)$/gm, '<p class="text-muted-foreground leading-relaxed mb-4">$1</p>')
    // Clean up empty paragraphs
    .replace(/<p[^>]*>\s*<\/p>/g, '')
    // Clean up double-wrapped elements
    .replace(/<p[^>]*>(<h[1-4][^>]*>)/g, '$1')
    .replace(/(<\/h[1-4]>)<\/p>/g, '$1');
}
