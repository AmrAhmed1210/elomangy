/**
 * Lightweight Markdown renderer for chat bubbles.
 * Handles: **bold**, * bullets, --- hr, ## headings, [links](url)
 */
export default function MarkdownText({ text, className = "" }) {
  if (!text) return null;

  const lines = text.split("\n");
  const elements = [];
  let listItems = [];

  const flushList = (key) => {
    if (!listItems.length) return;
    elements.push(
      <ul key={`ul-${key}`} className="my-2 list-disc space-y-1 ps-5">
        {listItems.map((item, i) => (
          <li key={i}>{inlineFormat(item)}</li>
        ))}
      </ul>
    );
    listItems = [];
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    if (trimmed === "---") {
      flushList(idx);
      elements.push(<hr key={`hr-${idx}`} className="my-3 border-[var(--surface-border)]" />);
      return;
    }

    if (/^#{1,3}\s+/.test(trimmed)) {
      flushList(idx);
      const content = trimmed.replace(/^#{1,3}\s+/, "");
      elements.push(
        <p key={`h-${idx}`} className="mb-1 mt-3 font-display text-base font-bold text-inherit">
          {inlineFormat(content)}
        </p>
      );
      return;
    }

    if (/^[*•-]\s+/.test(trimmed)) {
      listItems.push(trimmed.replace(/^[*•-]\s+/, ""));
      return;
    }

    flushList(idx);

    if (!trimmed) {
      elements.push(<div key={`sp-${idx}`} className="h-2" />);
      return;
    }

    elements.push(
      <p key={`p-${idx}`} className="leading-7">
        {inlineFormat(trimmed)}
      </p>
    );
  });

  flushList("end");

  return <div className={`space-y-0.5 ${className}`}>{elements}</div>;
}

function inlineFormat(text) {
  const parts = [];
  const regex = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(text.slice(last, match.index));
    }
    const token = match[0];
    if (token.startsWith("**")) {
      parts.push(
        <strong key={match.index} className="font-bold">
          {token.slice(2, -2)}
        </strong>
      );
    } else {
      const linkMatch = token.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        parts.push(
          <a
            key={match.index}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline underline-offset-2 hover:opacity-80"
          >
            {linkMatch[1]}
          </a>
        );
      }
    }
    last = match.index + token.length;
  }

  if (last < text.length) parts.push(text.slice(last));
  return parts.length === 1 ? parts[0] : parts;
}
