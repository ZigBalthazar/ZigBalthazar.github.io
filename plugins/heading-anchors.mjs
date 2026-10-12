import { defineHastPlugin } from 'satteri';

/**
 * Adds a click-to-link anchor to every h2/h3/h4.
 *
 * Must run after a heading-ids plugin (see astro.config.mjs — Astro appends its
 * own copy *after* user plugins, so we run one ourselves first).
 *
 * The visible "#" comes from CSS, not a text child, so that Astro's own
 * heading-ids pass still reads clean `textContent` for the headings list.
 */
export function headingAnchors() {
  return defineHastPlugin({
    name: 'heading-anchors',
    element: {
      filter: ['h2', 'h3', 'h4'],
      visit(node, ctx) {
        const id = node.properties?.id;
        if (typeof id !== 'string') return;
        ctx.appendChild(node, {
          type: 'element',
          tagName: 'a',
          properties: {
            href: `#${id}`,
            className: ['anchor'],
            'aria-hidden': 'true',
            tabIndex: -1,
          },
          children: [],
        });
      },
    },
  });
}
