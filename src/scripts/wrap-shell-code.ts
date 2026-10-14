// Preserve Shiki colors and exact copy text, but only wrap code at spaces:
// shell blocks in prose, and every CodePanel/agents panel opted into wrapping.
for (const line of document.querySelectorAll<HTMLElement>(
  '.prose pre:is([data-language="bash"], [data-language="sh"], [data-language="shell"]) .line, .code-panel-wrap pre .line',
)) {
  if (line.querySelector('.shell-token')) continue;
  const output = document.createDocumentFragment();
  let token = document.createElement('span');
  token.className = 'shell-token';
  for (const node of line.childNodes) {
    for (const part of (node.textContent ?? '').split(/(\s+)/)) {
      if (!part) continue;
      if (/^\s+$/.test(part)) {
        if (token.hasChildNodes()) {
          output.append(token);
          token = document.createElement('span');
          token.className = 'shell-token';
        }
        output.append(document.createTextNode(part));
      } else {
        const colored = node.cloneNode(false);
        colored.textContent = part;
        token.append(colored);
      }
    }
  }
  if (token.hasChildNodes()) output.append(token);
  line.replaceChildren(output);
}
