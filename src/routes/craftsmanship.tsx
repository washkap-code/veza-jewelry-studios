import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "../components/PageHeader";

export const Route = createFileRoute("/craftsmanship")({
  component: () => (
    <PageHeader
      eyebrow="The Hand"
      title="Craftsmanship"
      description="Sand-cast, chased, and finished by hand in our Harare atelier."
    />
  ),
});
