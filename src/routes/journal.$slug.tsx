import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "../components/PageHeader";

export const Route = createFileRoute("/journal/$slug")({
  component: JournalEntry,
});

function JournalEntry() {
  const { slug } = Route.useParams();
  const title = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return <PageHeader eyebrow="Journal" title={title} />;
}
