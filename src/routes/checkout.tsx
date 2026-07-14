import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "../components/PageHeader";

export const Route = createFileRoute("/checkout")({
  component: () => <PageHeader eyebrow="Complete" title="Checkout" />,
});
