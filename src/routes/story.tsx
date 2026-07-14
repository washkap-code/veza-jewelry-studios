import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "../components/PageHeader";

export const Route = createFileRoute("/story")({
  component: () => (
    <PageHeader
      eyebrow="Origins"
      title="Our Story"
      description="A jewelry house rooted in Zimbabwe — quietly modern, patiently made."
    />
  ),
});
