import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "../components/PageHeader";

export const Route = createFileRoute("/journal")({
  component: () => (
    <PageHeader
      eyebrow="Correspondence"
      title="Journal"
      description="Notes from the atelier — process, people, and places."
    />
  ),
});
