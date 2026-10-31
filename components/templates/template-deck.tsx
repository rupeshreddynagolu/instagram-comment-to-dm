import type { CampaignTemplate } from "@/lib/templates/campaign-templates";
import { ConversationPreview } from "@/components/templates/template-card";

// Where each card sits in the fan: the front card straight, the two behind
// turned out to the sides. On hover the fan opens a little wider.
// The two behind sit a little higher, so only their tops and sides show.
const fan = [
  "z-[1] -translate-x-[16%] -translate-y-8 -rotate-[8deg] opacity-70 sm:-translate-x-[22%] group-hover:-translate-x-[20%] group-hover:-rotate-[11deg] sm:group-hover:-translate-x-[28%]",
  "z-[2] translate-x-[16%] -translate-y-8 rotate-[8deg] opacity-70 sm:translate-x-[22%] group-hover:translate-x-[20%] group-hover:rotate-[11deg] sm:group-hover:translate-x-[28%]",
  "z-[3] translate-y-4",
];

/**
 * The template library's hero picture: three templates fanned like a deck,
 * each showing its category, title, keywords and the reply it sends.
 */
export default function TemplateDeck({ templates }: { templates: CampaignTemplate[] }) {
  return (
    <div className="group relative mx-auto flex h-[25rem] w-full max-w-md items-center justify-center overflow-x-clip sm:h-[27rem] sm:overflow-visible">
      {templates.slice(0, 3).map((template, index) => (
        <div
          key={template.slug}
          aria-hidden={index < 2}
          className={`absolute w-[min(19rem,78%)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${fan[index]}`}
        >
          <div
            className={`rounded-[1.5rem] border p-4 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.9)] ${
              index === 2
                ? "border-white/15 bg-[#0b1a21] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
                : "border-white/10 bg-[#0a161c]"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="site-mono text-[11px] text-site-dim">{template.category}</span>
              <span className="site-mono text-[11px] text-site-dim">{template.setupMinutes} min</span>
            </div>
            <p className="mt-2 text-lg font-semibold leading-tight text-site-paper">{template.title}</p>
            <p className="mt-2 flex flex-wrap gap-1">
              {template.keywords.map((keyword) => (
                <mark key={keyword} className="marker text-[11px]">
                  {keyword}
                </mark>
              ))}
            </p>
            <div className="mt-3">
              <ConversationPreview template={template} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
