export type GamePresentation = {
  theme: string;
  action: string;
  duration: string;
  badge?: string;
  rankingSubtitle: string;
  rankingEmptyTitle: string;
  rankingEmptySubtitle: string;
  focus: string;
};

export type PortalGameLink = {
  slug: string;
  shortTitle: string;
};

const FALLBACK_PRESENTATION: GamePresentation = {
  theme: "Território",
  action: "Arcade",
  duration: "1 min",
  rankingSubtitle: "Ranking oficial. Dispute os melhores tempos e pontuações da comunidade.",
  rankingEmptyTitle: "Ranking abrindo agora",
  rankingEmptySubtitle: "Seja o primeiro a marcar pontos neste jogo.",
  focus: "Pressão cotidiana transformada em jogo político.",
};

const PRESENTATION_BY_SLUG: Record<string, GamePresentation> = {
  "cidade-de-aco-cartas-vr": {
    theme: "Volta Redonda",
    action: "Card urbano",
    duration: "5 rodadas",
    badge: "aco x rio",
    rankingSubtitle: "Quem segura melhor a cidade entre memoria operaria, rio vivo e pressao urbana em cinco rodadas curtas?",
    rankingEmptyTitle: "VR pronta para primeira disputa",
    rankingEmptySubtitle: "Abra o ranking ocupando os tres territorios e fechando a Cidade Viva na frente.",
    focus: "Memoria operaria, rio vivo e disputa territorial em Volta Redonda.",
  },
  "onibus-zero": {
    theme: "Transporte",
    action: "3 faixas",
    duration: "45-60s",
    rankingSubtitle: "Quem fecha a rota com mais passageiros, menos atraso e mais controle do caos?",
    rankingEmptyTitle: "Linha sem líder ainda",
    rankingEmptySubtitle: "Seja o primeiro a fechar a rota com pontuação alta.",
    focus: "Caos do transporte, tarifa e atraso viram decisão rápida.",
  },
  "merendeira-no-vermelho": {
    theme: "Merenda",
    action: "Arcade survival",
    duration: "1 min",
    badge: "repetitividade 9",
    rankingSubtitle: "Quem segura a cozinha, serve mais pratos e ainda dribla o contrato intermitente?",
    rankingEmptyTitle: "Ranking abrindo agora",
    rankingEmptySubtitle: "Seja a primeira a segurar a cozinha e marcar pontos.",
    focus: "Cozinha, contrato e sobrevivência escolar em pressão máxima.",
  },
  "plantaono-vermelho": {
    theme: "Saúde",
    action: "Arcade survival",
    duration: "1 min",
    badge: "sobreviva ao mês",
    rankingSubtitle: "Quanto você consegue segurar o plantão, os boletos e o desgaste antes do colapso?",
    rankingEmptyTitle: "Plantão esperando recordes",
    rankingEmptySubtitle: "Publique a primeira corrida até o fim do mês.",
    focus: "Hospital, salário e exaustão em uma corrida até o dia 30.",
  },
  "fila-invisivel": {
    theme: "Saúde pública",
    action: "Toque rápido",
    duration: "45-60s",
    rankingSubtitle: "Ranking oficial. Reordene prioridades, segure o caos e marque pontos em menos de um minuto.",
    rankingEmptyTitle: "Fila sem campeão ainda",
    rankingEmptySubtitle: "Organize a fila e abra o ranking desta crise.",
    focus: "Triagem, prioridade e pressão do atendimento público.",
  },
};

export const PORTAL_GAME_LINKS: PortalGameLink[] = [
  { slug: "merendeira-no-vermelho", shortTitle: "Merendeira" },
  { slug: "cidade-de-aco-cartas-vr", shortTitle: "Cidade de Aco" },
  { slug: "plantaono-vermelho", shortTitle: "Plantão" },
  { slug: "onibus-zero", shortTitle: "Ônibus Zero" },
  { slug: "fila-invisivel", shortTitle: "Fila Invisível" },
];

export function getGamePresentation(slug: string): GamePresentation {
  return PRESENTATION_BY_SLUG[slug] ?? FALLBACK_PRESENTATION;
}
