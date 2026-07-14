import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "../components/PageHeader";

export const Route = createFileRoute("/contact")({
  component: () => (
    <PageHeader
      eyebrow="In Person"
      title="Contact"
      description="Harare, Zimbabwe. By appointment and correspondence."
    />
  ),
});
