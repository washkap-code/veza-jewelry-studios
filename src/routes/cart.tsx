import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "../components/PageHeader";

export const Route = createFileRoute("/cart")({
  component: () => <PageHeader eyebrow="Selection" title="Shopping Bag" />,
});
