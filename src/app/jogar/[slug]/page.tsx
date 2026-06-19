import { notFound } from "next/navigation";
import { MerendeiraNoVermelhoGame } from "@/components/games/MerendeiraNoVermelhoGame";
import { OnibusZeroGame } from "@/components/games/OnibusZeroGame";
import { PlantaoNoVermelhoGame } from "@/components/games/PlantaoNoVermelhoGame";
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

  if (game.slug === "onibus-zero" || game.template === "bus-runner") {
    return <OnibusZeroGame game={game} />;
  }

  if (game.slug === "plantaono-vermelho" || game.template === "salary-survival") {
    return <PlantaoNoVermelhoGame game={game} />;
  }

  if (game.slug === "merendeira-no-vermelho" || game.template === "kitchen-survival") {
    return <MerendeiraNoVermelhoGame game={game} />;
  }

  return <QueueChaosGame game={game} />;
}
