import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "../components/PageHeader";

export const Route = createFileRoute("/collections")({
  component: () => (
    <PageHeader
      eyebrow="The Archive"
      title="Collections"
      description="Sculptural editions drawn from the landscapes of southern Africa."
    />
  ),
});
