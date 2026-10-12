import katex from 'katex';
import { defineHastPlugin } from 'satteri';

/**
 * Renders math to KaTeX markup at build time, so no JS ships to the browser.
 *
 * Sätteri parses math natively (`features.math`) and hands us
 * `<code class="language-math math-inline|math-display">`. Display math is
 * additionally wrapped in a `<pre>`, which we drop — KaTeX brings its own
 * block element.
 *
 * One deliberate difference from Sätteri's defaults: a paragraph whose entire
 * content is one `$$...$$` run is treated as display math even when the
 * delimiters sit on a single line. Sätteri only promotes `$$` to display when
 * the delimiters are on their own lines, but writing `$$E = mc^2$$` inline and
 * expecting a centred block is the near-universal habit (and what remark-math
 * does), so we honour it.
 */
export function katexPlugin({ throwOnError = false, ...katexOptions } = {}) {
  return defineHastPlugin({
    name: 'katex',
    element: {
      filter: ['code'],
      visit(node, ctx) {
        const classes = node.properties?.className ?? [];
        if (!classes.includes('language-math')) return;

        const parent = ctx.parent(node);
        const inPre = parent?.type === 'element' && parent.tagName === 'pre';

        // Promote a paragraph that holds nothing but this math run.
        const aloneInParagraph =
          parent?.type === 'element' &&
          parent.tagName === 'p' &&
          parent.children?.length === 1;

        const displayMode =
          classes.includes('math-display') || inPre || aloneInParagraph;

        const latex = ctx.textContent(node);

        let html;
        try {
          html = katex.renderToString(latex, {
            ...katexOptions,
            displayMode,
            throwOnError,
            strict: katexOptions.strict ?? false,
          });
        } catch (err) {
          // Keep the build alive and make the bad formula obvious on the page.
          const where = ctx.fileURL ? ` in ${ctx.fileURL.pathname}` : '';
          console.warn(`[katex] ${err.message}${where}`);
          html = `<code class="katex-error" title="${escapeAttr(err.message)}">${escapeHtml(latex)}</code>`;
        }

        // Replace the widest wrapper this math owns, so no stray <pre>/<p> is left.
        const target = inPre || aloneInParagraph ? parent : node;
        ctx.replaceNode(target, { type: 'raw', value: html });
      },
    },
  });
}

const escapeHtml = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escapeAttr = (s) => escapeHtml(s).replace(/"/g, '&quot;');
