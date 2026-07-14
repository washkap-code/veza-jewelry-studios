import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "../components/PageHeader";

export const Route = createFileRoute("/admin")({
  component: () => <PageHeader eyebrow="Internal" title="Admin" />,
});
