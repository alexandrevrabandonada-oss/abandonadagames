import { notFound } from "next/navigation";
import { QueueChaosGame } from "@/components/games/QueueChaosGame";
import { getGameBySlug, getGameSlugs } from "@/lib/gameRegistry";

export function generateStaticParams() {
  return getGameSlugs().map((slug) => ({ slug }));
}

export default async function PlayPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const game = getGameBySlug(slug);

  if (!game) notFound();

  return <QueueChaosGame game={game} />;
}
