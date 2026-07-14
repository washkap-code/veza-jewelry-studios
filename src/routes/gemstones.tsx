import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "../components/PageHeader";

export const Route = createFileRoute("/gemstones")({
  component: () => (
    <PageHeader
      eyebrow="The Earth"
      title="Gemstones"
      description="Ethically sourced stones from across the African continent."
    />
  ),
});
