/**
 * ReplyNxt mark: a message bubble with a highlighter stroke through it, the
 * site's picture of "a marked keyword becomes a reply".
 */
export default function SiteMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 7.5A3.5 3.5 0 0 1 9.5 4h13A3.5 3.5 0 0 1 26 7.5v10a3.5 3.5 0 0 1-3.5 3.5H14l-6 5v-5.2A3.5 3.5 0 0 1 6 17.5v-10Z"
        fill="var(--color-site-reply)"
      />
      <rect x="10" y="10.5" width="12" height="4" rx="1" fill="var(--color-site-marker)" />
    </svg>
  );
}
