"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import CampaignBuilder from "@/components/campaign-builder";

export default function EditCampaignPage() {
  const params = useParams<{ id: string }>();
  return (
    <Suspense>
      <CampaignBuilder mode="edit" campaignId={params.id} />
    </Suspense>
  );
}
