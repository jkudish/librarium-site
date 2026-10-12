// Copy buttons for the product pages' code panels and terminals (CodePanel,
// TerminalBlock). Same behavior as the /agents page: copy `data-copy`, flip
// `data-copy-state` for the icon swap, and announce through #copy-status.
const copyStatus = document.getElementById("copy-status");

for (const button of document.querySelectorAll<HTMLButtonElement>("button[data-code-copy]")) {
  let reset: ReturnType<typeof setTimeout>;
  button.addEventListener("click", async () => {
    clearTimeout(reset);
    const label = button.querySelector<HTMLElement>(".copy-label");
    const original = label?.dataset.original ?? label?.textContent ?? "";
    if (label) label.dataset.original = original;
    try {
      await navigator.clipboard.writeText(button.dataset.copy ?? "");
      button.dataset.copyState = "success";
      if (label) label.textContent = "Copied";
      if (copyStatus) copyStatus.textContent = "Copied to clipboard.";
    } catch {
      button.dataset.copyState = "error";
      if (label) label.textContent = "Select to copy";
      if (copyStatus) copyStatus.textContent = "Copy unavailable. Select the text and copy it manually.";
    }
    reset = setTimeout(() => {
      button.dataset.copyState = "idle";
      if (label) label.textContent = original;
      if (copyStatus) copyStatus.textContent = "";
    }, 2000);
  });
}
