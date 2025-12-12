import { unsafeHTML } from "https://cdn.jsdelivr.net/npm/lit-html@3/directives/unsafe-html.js";
import { Marked } from "https://cdn.jsdelivr.net/npm/marked@13/+esm";

const tdsUrl = "https://tds.s-anand.net";
const relativeLink = (href) => href && !href.match(/^(https?|mailto):/);

export const marked = new Marked({
  renderer: {
    image(href, title, text) {
      // Point relative links to tds.s-anand.net
      if (relativeLink(href)) href = `${tdsUrl}/${href}`;
      return `<img src="${href}" alt="${text}" ${title ? `title="${title}"` : ""} class="img-fluid">`;
    },
    link(href, title, text) {
      // Point relative links to tds.s-anand.net
      // something.md goes to tds.s-anand.net/#/something
      // everything.else goes to tds.s-anand.net/everything.else
      if (relativeLink(href)) href = `${tdsUrl}/${href.endsWith(".md") ? `#/${href.replace(/\.md$/, "")}` : href}`;
      return `<a href="${href}" ${title ? `title="${title}"` : ""} target="_blank">${text}</a>`;
    },
  },
});

export const md = (s) => unsafeHTML(marked.parse(s));
