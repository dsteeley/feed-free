/**
 * Finds links to /watch or /reel within a root element,
 * walks up to their nearest role="article" ancestor,
 * and stamps it with data-fbfocus-reel="true".
 */
export function tagReelAncestors(root: Element): void {
  const links = root.querySelectorAll<HTMLAnchorElement>('a[href*="/watch"], a[href*="/reel"]');
  for (const link of links) {
    let article: HTMLElement | null = link.parentElement;
    while (article && article !== document.body) {
      if (article.getAttribute('role') === 'article') {
        article.setAttribute('data-fbfocus-reel', 'true');
        break;
      }
      article = article.parentElement;
    }
  }
}
