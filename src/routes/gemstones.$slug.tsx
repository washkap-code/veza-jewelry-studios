import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "../components/PageHeader";

export const Route = createFileRoute("/gemstones/$slug")({
  component: Gemstone,
});

function Gemstone() {
  const { slug } = Route.useParams();
  const title = slug.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
  return <PageHeader eyebrow="Gemstone" title={title} />;
}
