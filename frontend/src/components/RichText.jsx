// Renders the small markdown subset used in problem statements:
// paragraphs, "- " bullet lists, "1. " numbered lists, `inline code` and **bold**.

function inline(text, keyPrefix) {
  const parts = [];
  const re = /(`[^`]+`|\*\*[^*]+\*\*)/g;
  let last = 0;
  let m;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const token = m[0];
    if (token.startsWith('`')) {
      parts.push(
        <code key={`${keyPrefix}-${i++}`} className="rounded-md border border-white/10 bg-white/[0.06] px-1.5 py-0.5 font-mono text-[0.85em] text-slate-100">
          {token.slice(1, -1)}
        </code>
      );
    } else {
      parts.push(<strong key={`${keyPrefix}-${i++}`} className="font-semibold text-white">{token.slice(2, -2)}</strong>);
    }
    last = m.index + token.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

export default function RichText({ text, className = '' }) {
  if (!text) return null;
  const blocks = text.replace(/\r/g, '').split(/\n{2,}/);

  return (
    <div className={`space-y-3 leading-relaxed text-slate-300 ${className}`}>
      {blocks.map((block, bi) => {
        const lines = block.split('\n').filter((l) => l.trim() !== '');
        if (lines.length && lines.every((l) => /^\s*-\s+/.test(l))) {
          return (
            <ul key={bi} className="list-disc space-y-1.5 pl-6 marker:text-slate-500">
              {lines.map((l, li) => <li key={li}>{inline(l.replace(/^\s*-\s+/, ''), `${bi}-${li}`)}</li>)}
            </ul>
          );
        }
        if (lines.length && lines.every((l) => /^\s*\d+\.\s+/.test(l))) {
          return (
            <ol key={bi} className="list-decimal space-y-1.5 pl-6 marker:text-slate-500">
              {lines.map((l, li) => <li key={li}>{inline(l.replace(/^\s*\d+\.\s+/, ''), `${bi}-${li}`)}</li>)}
            </ol>
          );
        }
        return <p key={bi} className="whitespace-pre-line">{inline(block, String(bi))}</p>;
      })}
    </div>
  );
}
