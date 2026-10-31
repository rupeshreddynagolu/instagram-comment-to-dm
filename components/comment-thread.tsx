import { Fragment } from "react";

interface CommentThreadProps {
  /** Who commented, e.g. "@ananya.k". */
  commenter: string;
  /** The comment as written; any keyword in it is marked. */
  comment: string;
  keywords: string[];
  /** The account that replies, e.g. "@studio.store". */
  account: string;
  reply: React.ReactNode;
  /** What the reply was sent as, e.g. "Private reply". */
  replyLabel?: string;
  /** Play the arrive-mark-reply sequence once (home hero only). */
  animated?: boolean;
  className?: string;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** The comment text with each keyword wrapped in a highlighter mark. */
function MarkedComment({ text, keywords }: { text: string; keywords: string[] }) {
  if (keywords.length === 0) return <>{text}</>;
  const pattern = new RegExp(`(${keywords.map(escapeRegExp).join("|")})`, "gi");
  return (
    <>
      {text.split(pattern).map((part, index) =>
        keywords.some((keyword) => keyword.toLowerCase() === part.toLowerCase()) ? (
          <mark key={index} className="marker font-semibold">
            {part}
          </mark>
        ) : (
          <Fragment key={index}>{part}</Fragment>
        )
      )}
    </>
  );
}

/**
 * A comment on a post and the DM it triggers: the product in one picture.
 */
export default function CommentThread({
  commenter,
  comment,
  keywords,
  account,
  reply,
  replyLabel = "Private reply",
  animated = false,
  className = "",
}: CommentThreadProps) {
  return (
    <figure className={`flex flex-col gap-3 ${className}`}>
      <div className={`max-w-[85%] ${animated ? "thread-comment" : ""}`}>
        <figcaption className="mb-1.5 text-xs text-site-dim">
          {commenter} commented
        </figcaption>
        <p className="rounded-2xl rounded-tl-md bg-site-raised px-4 py-3 text-[15px] leading-6 text-site-paper">
          <MarkedComment text={comment} keywords={keywords} />
        </p>
      </div>

      <div className={`ml-auto max-w-[88%] ${animated ? "thread-reply" : ""}`}>
        <p className="mb-1.5 text-right text-xs text-site-dim">
          {replyLabel} from {account}
        </p>
        <div className="rounded-2xl rounded-tr-md bg-site-reply px-4 py-3 text-[15px] leading-6 text-site-ink">
          {reply}
        </div>
      </div>
    </figure>
  );
}
