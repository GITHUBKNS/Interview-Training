import * as cheerio from 'cheerio';

export async function extractTextFromUrl(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; InterviewTailor/1.0)',
        Accept: 'text/html,application/xhtml+xml',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    $('script, style, nav, header, footer, iframe, noscript, svg, img, form').remove();
    $('[role="navigation"], [role="banner"], [role="contentinfo"]').remove();

    const selectors = [
      'article',
      '[role="main"]',
      'main',
      '.job-description',
      '.job-details',
      '#job-details',
      '.description',
      '.posting-page',
    ];

    let text = '';
    for (const sel of selectors) {
      const el = $(sel);
      if (el.length) {
        text = el.text();
        break;
      }
    }

    if (!text) {
      text = $('body').text();
    }

    return text
      .replace(/\s+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
      .slice(0, 15000);
  } finally {
    clearTimeout(timeout);
  }
}
