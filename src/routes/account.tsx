import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "../components/PageHeader";

export const Route = createFileRoute("/account")({
  component: () => <PageHeader eyebrow="Client" title="Account" />,
});
