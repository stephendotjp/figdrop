import { redirect, notFound } from "next/navigation";
import { figures, getFigure, figureSlug } from "@/lib/data";

// Legacy product URL (`/drop/<id>`). Now redirected to the canonical slug URL
// (`/drops/t/<slug>`) so older/shared links and prior builds don't 404.
export function generateStaticParams() {
  return figures.map((f) => ({ id: f.id }));
}

export default function LegacyDropRedirect({
  params,
}: {
  params: { id: string };
}) {
  const figure = getFigure(params.id);
  if (!figure) notFound();
  redirect(`/drops/t/${figureSlug(figure)}`);
}
