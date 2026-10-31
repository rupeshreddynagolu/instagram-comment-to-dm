import Trust from "@/components/home/trust";
import UseCases from "@/components/home/use-cases";
import { SectionHeading } from "@/components/site/primitives";

/** Scene six: use cases and safeguards as one bento of visual tiles. */
export default function Bento() {
  return (
    <section id="use-cases" className="scroll-mt-24 py-20 sm:py-32">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <SectionHeading label="Use cases" title="Campaigns your team can launch without inbox chaos" />

        <UseCases />

        <div id="security" className="mt-24 scroll-mt-24">
          <SectionHeading
            label="Trust and compliance"
            title="Serious foundations for a public B2B product"
            description="The system is designed around official APIs, encrypted tokens, idempotent queue processing, and plans provisioned by your payment provider."
          />

          <Trust />
        </div>
      </div>
    </section>
  );
}
