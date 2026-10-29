import { Suspense } from "react";
import CampaignBuilder from "@/components/campaign-builder";

// The builder reads ?template= from the URL, which needs a Suspense boundary
// so the rest of the page can still be prerendered.
export default function NewCampaignPage() {
  return (
    <Suspense>
      <CampaignBuilder mode="new" />
    </Suspense>
  );
}
