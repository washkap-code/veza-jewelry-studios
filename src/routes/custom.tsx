import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "../components/PageHeader";

export const Route = createFileRoute("/custom")({
  component: () => (
    <PageHeader
      eyebrow="By Commission"
      title="Custom Pieces"
      description="Bespoke commissions, imagined with you and drawn to a single hand."
    />
  ),
});
