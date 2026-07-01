import cardsData from "../../games/catalog/cidade-de-aco-cartas-vr/cards.json";

export type ForceLine = "aco" | "rio" | "rua" | "memoria" | "verde" | "sombra";
export type CardType = "personagem" | "lugar" | "simbolo" | "acao-coletiva" | "memoria" | "crise";
export type DeckId = "aco_memoria" | "rio_rua";
export type Side = "player" | "bot";

export type CardEffectKey =
  | "industrial_boost"
  | "plus_if_any_crisis"
  | "aura_force_aco"
  | "draw_card"
  | "win_progress"
  | "aura_type_memoria"
  | "plus_if_other_memory"
  | "team_boost"
  | "next_round_breath"
  | "plus_per_type_memoria"
  | "debuff_enemy"
  | "debuff_enemy_if_place"
  | "remove_crisis"
  | "plus_per_force_rio"
  | "plus_if_clean_zone"
  | "plus_if_other_rua"
  | "plus_if_action_present"
  | "aura_force_verde"
  | "draw_card_if_rua"
  | "next_card_discount"
  | "boost_force_rua"
  | "cleanse_and_bonus"
  | "debuff_enemy_green_extra";

type RawBattleCard = {
  id: string;
  name: string;
  type: CardType;
  forces: ForceLine[];
  cost: number;
  power: number;
  effect: string;
  effectKey: CardEffectKey;
  deck: DeckId;
};

type CardArtSource = "VR real" | "Composicao real";
type CardArtFit = "cover" | "contain";

export type BattleCard = {
  id: string;
  name: string;
  type: CardType;
  forces: ForceLine[];
  cost: number;
  power: number;
  effect: string;
  effectKey: CardEffectKey;
  deck: DeckId;
  artAnchor: string;
  artDirection: string;
  artSource: CardArtSource;
  artPath?: string;
  artPosition?: string;
  artFit?: CardArtFit;
};

export type TerritoryDefinition = {
  id: string;
  name: string;
  subtitle: string;
  traits: Array<ForceLine | "industrial">;
  upgradeName: string;
  upgradeText: string;
};

export type DeckDefinition = {
  id: DeckId;
  title: string;
  subtitle: string;
  focus: string;
  accent: string;
};

const CITY_CARD_ART: Record<
  string,
  Pick<BattleCard, "artAnchor" | "artDirection" | "artSource" | "artPath" | "artPosition" | "artFit">
> = {
  aco_001: {
    artAnchor: "Arigo / construcao da CSN",
    artDirection: "Operario migrante com mala de lona, poeira vermelha e obras da cidade operaria ao fundo.",
    artSource: "Composicao real",
    artPath: "/games/cidade-de-aco-cartas-vr/cards/aco_001-arigo.jpg",
    artPosition: "center 40%",
  },
  aco_002: {
    artAnchor: "Laminacao da UPV",
    artDirection: "Trabalhadora em EPI diante de chapas de aco quentes, passarelas e luz industrial ambar.",
    artSource: "Composicao real",
    artPath: "/games/cidade-de-aco-cartas-vr/cards/aco_002-operaria-da-laminacao.jpg",
    artPosition: "46% 46%",
  },
  aco_003: {
    artAnchor: "Alto-forno da UPV",
    artDirection: "Mestre de forno diante de tubulacoes, escadas metalicas e clarao laranja do gusa.",
    artSource: "Composicao real",
    artPath: "/games/cidade-de-aco-cartas-vr/cards/aco_003-mestre-do-alto-forno.jpg",
    artPosition: "center 42%",
  },
  aco_004: {
    artAnchor: "O Lingote e memoria operaria",
    artDirection: "Pagina historica do jornal operario com retrato impresso, texto editorial e textura real de arquivo popular.",
    artSource: "VR real",
    artPath: "/games/cidade-de-aco-cartas-vr/cards/aco_004-cronista-cidade-operaria.jpg",
    artPosition: "center 22%",
    artFit: "contain",
  },
  aco_005: {
    artAnchor: "Praca Brasil real",
    artDirection: "Obelisco em vista elevada com espelho d'agua circular, eixos pavimentados e implantacao real da praca.",
    artSource: "VR real",
    artPath: "/games/cidade-de-aco-cartas-vr/cards/aco_005-praca-brasil-historica.jpg",
    artPosition: "center 38%",
  },
  aco_006: {
    artAnchor: "Chamine historica",
    artDirection: "Chamine prismatica de tijolo com base gradeada, viaduto lateral, palmeira e mobiliario urbano real.",
    artSource: "VR real",
    artPath: "/games/cidade-de-aco-cartas-vr/cards/aco_006-chamine-antiga.jpg",
    artPosition: "center 18%",
    artFit: "contain",
  },
  aco_007: {
    artAnchor: "Memorial 9 de Novembro",
    artDirection: "Memorial baixo de concreto em espelho d'agua, com massa curva e marcas do atentado.",
    artSource: "VR real",
    artPath: "/games/cidade-de-aco-cartas-vr/cards/aco_007-memorial-9-novembro.jpg",
    artPosition: "center 54%",
  },
  aco_008: {
    artAnchor: "Greve de 1988",
    artDirection: "Massa operaria com faixas, capacetes e portoes da usina sob fumaca e tensao.",
    artSource: "Composicao real",
    artPath: "/games/cidade-de-aco-cartas-vr/cards/aco_008-greve-de-1988.jpg",
    artPosition: "52% 44%",
    artFit: "cover",
  },
  aco_009: {
    artAnchor: "Turno fabril",
    artDirection: "Troca de turno na madrugada, relogio de ponto, luz amarela e corpo exausto.",
    artSource: "Composicao real",
    artPath: "/games/cidade-de-aco-cartas-vr/cards/aco_009-turno-virado.jpg",
    artPosition: "42% 46%",
  },
  aco_010: {
    artAnchor: "Skyline industrial da CSN",
    artDirection: "Paisagem fabril historica com baterias industriais, chamines, fumaça controlada e massa metalica da cidade do aco.",
    artSource: "VR real",
    artPath: "/games/cidade-de-aco-cartas-vr/cards/aco_010-cidade-de-aco.jpg",
    artPosition: "center 44%",
  },
  aco_011: {
    artAnchor: "Sirene da usina",
    artDirection: "Torre de alerta industrial com tubulacoes, neblina de calor e luz de emergencia.",
    artSource: "Composicao real",
    artPath: "/games/cidade-de-aco-cartas-vr/cards/aco_011-sirene-da-usina.jpg",
    artPosition: "center 34%",
  },
  aco_012: {
    artAnchor: "Vila Santa Cecilia e massa de concreto",
    artDirection: "Centro comercial e blocos modernistas da cidade operaria em foto historica aerea, com volumes pesados e urbanismo planejado.",
    artSource: "VR real",
    artPath: "/games/cidade-de-aco-cartas-vr/cards/aco_012-peso-do-concreto.jpg",
    artPosition: "58% 34%",
  },
  rio_001: {
    artAnchor: "Curva do Paraiba",
    artDirection: "Volta larga do Paraiba do Sul com margem urbana, agua barrenta e vegetacao ciliar.",
    artSource: "VR real",
    artPath: "/games/cidade-de-aco-cartas-vr/cards/rio_001-curva-do-paraiba.jpg",
    artPosition: "50% 45%",
  },
  rio_002: {
    artAnchor: "Defesa do rio",
    artDirection: "Guardia comunitaria na margem com colete, sacos de coleta e vegetacao ribeirinha.",
    artSource: "Composicao real",
    artPath: "/games/cidade-de-aco-cartas-vr/cards/rio_002-guardia-do-rio.jpg",
    artPosition: "60% 43%",
  },
  rio_003: {
    artAnchor: "PEV e reciclagem",
    artDirection: "Catador com carrinho, bags de reciclaveis e baias de entrega voluntaria.",
    artSource: "Composicao real",
    artPath: "/games/cidade-de-aco-cartas-vr/cards/rio_003-catador-do-pev.jpg",
    artPosition: "56% 42%",
  },
  rio_004: {
    artAnchor: "Bairro Retiro",
    artDirection: "Menino atravessando comercio de rua do Retiro, calcada cheia e vida cotidiana.",
    artSource: "VR real",
    artPath: "/games/cidade-de-aco-cartas-vr/cards/rio_004-menino-do-retiro.jpg",
    artPosition: "60% 42%",
  },
  rio_005: {
    artAnchor: "Capoeira no Memorial Zumbi",
    artDirection: "Mestra em roda aberta com berimbau, arena semicircular e corpo em movimento.",
    artSource: "Composicao real",
    artPath: "/games/cidade-de-aco-cartas-vr/cards/rio_005-mestra-da-capoeira.jpg",
    artPosition: "50% 44%",
    artFit: "cover",
  },
  rio_006: {
    artAnchor: "Parque do Inga",
    artDirection: "Trilha interpretativa molhada com viveiro de mudas, mourões de madeira e base de visitantes.",
    artSource: "VR real",
    artPath: "/games/cidade-de-aco-cartas-vr/cards/rio_006-parque-do-inga.jpeg",
    artPosition: "44% 56%",
  },
  rio_007: {
    artAnchor: "Memorial Zumbi",
    artDirection: "Memorial com grade frontal, escultura lateral, grande arco metalico e cobertura tensionada branca.",
    artSource: "VR real",
    artPath: "/games/cidade-de-aco-cartas-vr/cards/rio_007-memorial-zumbi.jpg",
    artPosition: "center 46%",
  },
  rio_008: {
    artAnchor: "Cinema 9 de Abril",
    artDirection: "Fachada modernista de esquina com cobertura inclinada, letreiro cursivo, cabos aereos e faixa envidracada.",
    artSource: "VR real",
    artPath: "/games/cidade-de-aco-cartas-vr/cards/rio_008-cinema-9-de-abril.jpg",
    artPosition: "center 42%",
  },
  rio_009: {
    artAnchor: "Escuta comunitaria",
    artDirection: "Roda em espaco cultural com bancos baixos, cartazes e microfone aberto.",
    artSource: "Composicao real",
    artPath: "/games/cidade-de-aco-cartas-vr/cards/rio_009-roda-de-escuta.jpg",
    artPosition: "50% 44%",
  },
  rio_010: {
    artAnchor: "Mutirao de bairro",
    artDirection: "Moradores pintando, limpando e plantando mudas em rua popular de Volta Redonda.",
    artSource: "Composicao real",
    artPath: "/games/cidade-de-aco-cartas-vr/cards/rio_010-mutirao-de-bairro.jpg",
    artPosition: "50% 58%",
  },
  rio_011: {
    artAnchor: "Defesa do Paraiba",
    artDirection: "Mutirao na margem do rio com luvas, faixa ambiental e sacos recolhendo residuos.",
    artSource: "Composicao real",
    artPath: "/games/cidade-de-aco-cartas-vr/cards/rio_011-defesa-do-paraiba.jpg",
    artPosition: "48% 54%",
  },
  rio_012: {
    artAnchor: "Chuva de po",
    artDirection: "Rua de bairro com telhados, varal, carro e superficies cobertas por po fino sob ceu opaco.",
    artSource: "Composicao real",
    artPath: "/games/cidade-de-aco-cartas-vr/cards/rio_012-chuva-de-po.jpg",
    artPosition: "54% 48%",
    artFit: "cover",
  },
};

const FALLBACK_CARD_ART: Pick<BattleCard, "artAnchor" | "artDirection" | "artSource"> = {
  artAnchor: "Volta Redonda",
  artDirection: "Cena urbana ligada ao tema da carta, com concreto, memoria popular e textura industrial.",
  artSource: "Composicao real",
};

export const CIDADE_DE_ACO_CARDS = (cardsData as RawBattleCard[]).map(
  (card): BattleCard => ({
    ...card,
    ...(CITY_CARD_ART[card.id] ?? FALLBACK_CARD_ART),
  }),
);

export const CITY_DECKS: DeckDefinition[] = [
  {
    id: "aco_memoria",
    title: "Aco & Memoria",
    subtitle: "Ocupa, aguenta pressao e transforma crise em presenca.",
    focus: "Monumentos, usina, cronicas operarias e peso territorial.",
    accent: "#f2a900",
  },
  {
    id: "rio_rua",
    title: "Rio & Rua",
    subtitle: "Joga no detalhe, limpa crise e vence na organizacao.",
    focus: "Bairros, mutirao, rio vivo e mobilidade coletiva.",
    accent: "#33c7b2",
  },
];

export const CITY_TERRITORIES: TerritoryDefinition[] = [
  {
    id: "praca-brasil",
    name: "Praca Brasil",
    subtitle: "Concreto, encontro e disputa de centro.",
    traits: ["rua", "memoria", "industrial"],
    upgradeName: "Praca Brasil Ocupada",
    upgradeText: "Acoes Coletivas custam -1 aqui.",
  },
  {
    id: "rio-paraiba",
    name: "Rio Paraiba",
    subtitle: "Fluxo, margem e recuperacao.",
    traits: ["rio", "verde"],
    upgradeName: "Rio em Recuperacao",
    upgradeText: "Remove 1 Crise sua no inicio da rodada.",
  },
  {
    id: "memorial-9",
    name: "Memorial 9 de Novembro",
    subtitle: "Arquivo vivo das lutas da cidade.",
    traits: ["memoria", "rua"],
    upgradeName: "Memoria em Luta",
    upgradeText: "Quando suas cartas saem daqui, compre 1 carta.",
  },
];

export const CITY_BREATH_BY_ROUND = [3, 4, 5, 6, 7] as const;
export const CITY_MAX_ROUNDS = 5;
export const CITY_STARTING_HAND = 4;
export const CITY_INFLUENCE_TARGET = 12;

export function getCardsForDeck(deckId: DeckId) {
  return CIDADE_DE_ACO_CARDS.filter((card) => card.deck === deckId);
}

export function shuffleCards<T>(items: T[]) {
  const next = [...items];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }

  return next;
}

export function getOpposingDeck(deckId: DeckId): DeckId {
  return deckId === "aco_memoria" ? "rio_rua" : "aco_memoria";
}

export function getDeckMeta(deckId: DeckId) {
  return CITY_DECKS.find((deck) => deck.id === deckId) ?? CITY_DECKS[0];
}
