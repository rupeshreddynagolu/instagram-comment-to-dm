import CommentThread from "@/components/comment-thread";
import type { CampaignTemplate } from "@/lib/templates/campaign-templates";

interface TemplateVisualProps {
  template: CampaignTemplate;
  compact?: boolean;
}

/** A template shown the way it plays out: the trigger comment and its DM. */
export default function TemplateVisual({ template, compact = false }: TemplateVisualProps) {
  return (
    <div
      className={`glass rounded-[1.75rem] ${compact ? "p-4" : "p-5 sm:p-7"}`}
    >
      <CommentThread
        commenter="@your.follower"
        comment={template.triggerExample}
        keywords={template.keywords}
        account="your account"
        reply={template.privateReplyPreview}
      />
      {!compact && (
        <p className="mt-5 border-t border-white/10 pt-4 text-sm text-site-dim">
          Triggers on{" "}
          {template.keywords.map((keyword, index) => (
            <span key={keyword}>
              {index > 0 && (index === template.keywords.length - 1 ? " or " : ", ")}
              <mark className="marker text-[13px]">{keyword}</mark>
            </span>
          ))}
        </p>
      )}
    </div>
  );
}
