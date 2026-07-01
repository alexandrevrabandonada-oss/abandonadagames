"use client";

import { useEffect, useRef, useState } from "react";
import { GamePageHeader, PortalGameRail, PortalTrail } from "@/components/games/GameChrome";
import { CidadeDeAcoCardView } from "@/components/games/cidade-de-aco/CidadeDeAcoCardView";
import { CidadeDeAcoTerritoryView } from "@/components/games/cidade-de-aco/CidadeDeAcoTerritoryView";
import {
  CIDADE_DE_ACO_CARDS,
  CITY_BREATH_BY_ROUND,
  CITY_INFLUENCE_TARGET,
  CITY_MAX_ROUNDS,
  CITY_STARTING_HAND,
  CITY_TERRITORIES,
  type BattleCard,
  type DeckId,
  type Side,
  CITY_DECKS,
  getCardsForDeck,
  getDeckMeta,
  getOpposingDeck,
  shuffleCards,
} from "@/lib/cidadeDeAcoCards";
import type { GameDefinition } from "@/lib/gameRegistry";

type PlayedCard = {
  instanceId: string;
  card: BattleCard;
  side: Side;
};

type TerritoryState = {
  id: string;
  playerCards: PlayedCard[];
  botCards: PlayedCard[];
  playerWins: number;
  botWins: number;
  playerCrisis: number;
  botCrisis: number;
  upgradedFor: Side | null;
  lastWinner: Side | "tie" | null;
};

type MatchState = {
  started: boolean;
  finished: boolean;
  round: number;
  playerDeckId: DeckId | null;
  botDeckId: DeckId | null;
  playerInfluence: number;
  botInfluence: number;
  playerHand: BattleCard[];
  botHand: BattleCard[];
  playerDeck: BattleCard[];
  botDeck: BattleCard[];
  playerBreath: number;
  botBreath: number;
  selectedCardId: string | null;
  territories: TerritoryState[];
  nextRoundBreathBonus: Record<Side, number>;
  nextCardDiscount: Record<Side, number>;
  extraDraws: Record<Side, number>;
  cardsPlayed: Record<Side, number>;
  territoriesWon: Record<Side, number>;
  message: string;
  cityEvent: string | null;
  winner: Side | "tie" | null;
};

type ShareToastState = {
  tone: "success" | "warning";
  text: string;
};

const PLAYER_NAME_KEY = "abandonada:cidade-de-aco-cartas-vr:player-name";
const BEST_SCORE_KEY = "abandonada:cidade-de-aco-cartas-vr:best-score";
const CITY_TUTORIAL_SEEN_KEY = "abandonada:cidade-de-aco-cartas-vr:tutorial-seen";
const SHARE_LABEL_DEFAULT = "Compartilhar resultado";
const LOT_01_AUDIT_IDS = ["aco_005", "aco_006", "aco_007", "rio_006", "rio_007", "rio_008"] as const;
const LOT_02_AUDIT_IDS = ["aco_001", "aco_002", "aco_003", "aco_004", "aco_009", "aco_010", "aco_011", "aco_012"] as const;
const LOT_03_AUDIT_IDS = ["rio_001", "rio_002", "rio_003", "rio_004", "rio_009", "rio_010", "rio_011"] as const;
const LOT_04_AUDIT_IDS = ["aco_008", "rio_005"] as const;
const COHESION_AUDIT_ACO_IDS = ["aco_005", "aco_008", "aco_010", "aco_012"] as const;
const COHESION_AUDIT_RIO_IDS = ["rio_001", "rio_005", "rio_008", "rio_010"] as const;
const APPROVED_NOTES_REVIEW_IDS = ["aco_004", "aco_006", "aco_008", "aco_011", "aco_012", "rio_005", "rio_006", "rio_009", "rio_011"] as const;
const RELEASE_CANDIDATE_ACO_IDS = [
  "aco_001",
  "aco_002",
  "aco_003",
  "aco_004",
  "aco_005",
  "aco_006",
  "aco_007",
  "aco_008",
  "aco_009",
  "aco_010",
  "aco_011",
  "aco_012",
] as const;
const RELEASE_CANDIDATE_RIO_IDS = [
  "rio_001",
  "rio_002",
  "rio_003",
  "rio_004",
  "rio_005",
  "rio_006",
  "rio_007",
  "rio_008",
  "rio_009",
  "rio_010",
  "rio_011",
  "rio_012",
] as const;
const CITY_DECK_PREVIEW_IDS: Record<DeckId, readonly string[]> = {
  aco_memoria: ["aco_006", "aco_008", "aco_011"],
  rio_rua: ["rio_001", "rio_005", "rio_012"],
};
const CITY_DECK_STYLE_LABELS: Record<DeckId, readonly string[]> = {
  aco_memoria: ["historico", "industrial", "pressao alta"],
  rio_rua: ["comunitario", "ambiental", "mais flexivel"],
};
const CITY_CARD_BY_ID = new Map(CIDADE_DE_ACO_CARDS.map((card) => [card.id, card] as const));

function getAuditCard(cardId: string) {
  return CITY_CARD_BY_ID.get(cardId) ?? CIDADE_DE_ACO_CARDS[0];
}

function createBaseTerritories(): TerritoryState[] {
  return CITY_TERRITORIES.map((territory) => ({
    id: territory.id,
    playerCards: [],
    botCards: [],
    playerWins: 0,
    botWins: 0,
    playerCrisis: 0,
    botCrisis: 0,
    upgradedFor: null,
    lastWinner: null,
  }));
}

function drawCards(deck: BattleCard[], hand: BattleCard[], amount: number) {
  const nextDeck = [...deck];
  const nextHand = [...hand];

  for (let index = 0; index < amount; index += 1) {
    const nextCard = nextDeck.shift();
    if (!nextCard) break;
    nextHand.push(nextCard);
  }

  return { deck: nextDeck, hand: nextHand };
}

function createInitialMatchState(): MatchState {
  return {
    started: false,
    finished: false,
    round: 1,
    playerDeckId: null,
    botDeckId: null,
    playerInfluence: 0,
    botInfluence: 0,
    playerHand: [],
    botHand: [],
    playerDeck: [],
    botDeck: [],
    playerBreath: CITY_BREATH_BY_ROUND[0],
    botBreath: CITY_BREATH_BY_ROUND[0],
    selectedCardId: null,
    territories: createBaseTerritories(),
    nextRoundBreathBonus: { player: 0, bot: 0 },
    nextCardDiscount: { player: 0, bot: 0 },
    extraDraws: { player: 0, bot: 0 },
    cardsPlayed: { player: 0, bot: 0 },
    territoriesWon: { player: 0, bot: 0 },
    message: "Escolha um deck para comecar a disputa.",
    cityEvent: null,
    winner: null,
  };
}

function getInfluenceFromWins(wins: number) {
  if (wins >= 3) return 5;
  if (wins === 2) return 3;
  if (wins === 1) return 1;
  return 0;
}

function getRoundBreath(round: number) {
  return CITY_BREATH_BY_ROUND[Math.max(0, Math.min(round - 1, CITY_BREATH_BY_ROUND.length - 1))];
}

function getDeckOpeningLine(deckId: DeckId) {
  if (deckId === "aco_memoria") {
    return "Sirene baixa, concreto pesa e a memoria operaria entra na disputa.";
  }

  return "O rio corre, o bairro responde e a rua tenta virar a cidade.";
}

function getTerritoryDefinition(territoryId: string) {
  return CITY_TERRITORIES.find((territory) => territory.id === territoryId) ?? CITY_TERRITORIES[0];
}

function getCardCost(card: BattleCard, side: Side, territory: TerritoryState, state: MatchState) {
  let cost = card.cost;
  const discount = state.nextCardDiscount[side];

  if (discount > 0) {
    cost -= 1;
  }

  if (
    territory.id === "praca-brasil" &&
    territory.upgradedFor === side &&
    card.type === "acao-coletiva"
  ) {
    cost -= 1;
  }

  return Math.max(0, cost);
}

function countCardsMatching(cards: PlayedCard[], predicate: (card: PlayedCard) => boolean) {
  return cards.filter(predicate).length;
}

function hasMatchingCard(cards: PlayedCard[], predicate: (card: PlayedCard) => boolean) {
  return cards.some(predicate);
}

function getCardPower(state: MatchState, territory: TerritoryState, playedCard: PlayedCard) {
  const sideCards = playedCard.side === "player" ? territory.playerCards : territory.botCards;
  const opponentCards = playedCard.side === "player" ? territory.botCards : territory.playerCards;
  const sideCrisis = playedCard.side === "player" ? territory.playerCrisis : territory.botCrisis;
  const opponentCrisis = playedCard.side === "player" ? territory.botCrisis : territory.playerCrisis;
  const { card } = playedCard;

  let power = card.power;

  if (card.effectKey === "industrial_boost" && getTerritoryDefinition(territory.id).traits.includes("industrial")) {
    power += 1;
  }

  if (card.effectKey === "plus_if_any_crisis" && sideCrisis + opponentCrisis > 0) {
    power += 2;
  }

  if (card.effectKey === "plus_if_other_memory") {
    const hasOtherMemory = hasMatchingCard(
      sideCards,
      (entry) => entry.instanceId !== playedCard.instanceId && entry.card.type === "memoria",
    );
    if (hasOtherMemory) power += 1;
  }

  if (card.effectKey === "plus_per_force_rio") {
    power += countCardsMatching(
      sideCards,
      (entry) => entry.instanceId !== playedCard.instanceId && entry.card.forces.includes("rio"),
    );
  }

  if (card.effectKey === "plus_if_clean_zone" && sideCrisis === 0 && opponentCrisis === 0) {
    power += 1;
  }

  if (card.effectKey === "plus_if_other_rua") {
    const hasOtherStreet = hasMatchingCard(
      sideCards,
      (entry) => entry.instanceId !== playedCard.instanceId && entry.card.forces.includes("rua"),
    );
    if (hasOtherStreet) power += 1;
  }

  if (card.effectKey === "plus_if_action_present") {
    const hasAction = hasMatchingCard(
      sideCards,
      (entry) => entry.instanceId !== playedCard.instanceId && entry.card.type === "acao-coletiva",
    );
    if (hasAction) power += 1;
  }

  if (
    card.effectKey === "draw_card_if_rua" &&
    hasMatchingCard(sideCards, (entry) => entry.instanceId !== playedCard.instanceId && entry.card.forces.includes("rua"))
  ) {
    power += 1;
  }

  if (card.effectKey === "plus_per_type_memoria") {
    power += countCardsMatching(
      sideCards,
      (entry) => entry.instanceId !== playedCard.instanceId && entry.card.type === "memoria",
    );
  }

  if (card.effectKey === "cleanse_and_bonus") {
    power += 1;
  }

  if (hasMatchingCard(sideCards, (entry) => entry.card.effectKey === "aura_force_aco" && entry.card.forces.includes("aco")) && card.forces.includes("aco")) {
    power += 1;
  }

  if (hasMatchingCard(sideCards, (entry) => entry.card.effectKey === "aura_type_memoria") && card.type === "memoria") {
    power += 1;
  }

  if (hasMatchingCard(sideCards, (entry) => entry.card.effectKey === "aura_force_verde") && card.forces.includes("verde")) {
    power += 1;
  }

  if (hasMatchingCard(sideCards, (entry) => entry.card.effectKey === "team_boost")) {
    power += 2;
  }

  if (hasMatchingCard(sideCards, (entry) => entry.card.effectKey === "boost_force_rua") && card.forces.includes("rua")) {
    power += 2;
  }

  if (card.effectKey === "debuff_enemy_if_place" && hasMatchingCard(opponentCards, (entry) => entry.card.type === "lugar")) {
    power += 1;
  }

  return power;
}

function getTerritoryTotals(state: MatchState, territory: TerritoryState) {
  const playerPenalty = territory.playerCrisis;
  const botPenalty = territory.botCrisis;
  const playerDebuff =
    countCardsMatching(territory.botCards, (entry) => entry.card.effectKey === "debuff_enemy") * 2 +
    countCardsMatching(territory.botCards, (entry) => entry.card.effectKey === "debuff_enemy_if_place" && hasMatchingCard(territory.playerCards, (card) => card.card.type === "lugar")) * 3 +
    countCardsMatching(territory.botCards, (entry) => entry.card.effectKey === "debuff_enemy_green_extra") * 2 +
    countCardsMatching(
      territory.botCards,
      (entry) => entry.card.effectKey === "debuff_enemy_green_extra" && hasMatchingCard(territory.playerCards, (card) => card.card.forces.includes("verde")),
    );
  const botDebuff =
    countCardsMatching(territory.playerCards, (entry) => entry.card.effectKey === "debuff_enemy") * 2 +
    countCardsMatching(territory.playerCards, (entry) => entry.card.effectKey === "debuff_enemy_if_place" && hasMatchingCard(territory.botCards, (card) => card.card.type === "lugar")) * 3 +
    countCardsMatching(territory.playerCards, (entry) => entry.card.effectKey === "debuff_enemy_green_extra") * 2 +
    countCardsMatching(
      territory.playerCards,
      (entry) => entry.card.effectKey === "debuff_enemy_green_extra" && hasMatchingCard(territory.botCards, (card) => card.card.forces.includes("verde")),
    );

  const playerPower =
    territory.playerCards.reduce((sum, entry) => sum + getCardPower(state, territory, entry), 0) -
    playerPenalty -
    playerDebuff;
  const botPower =
    territory.botCards.reduce((sum, entry) => sum + getCardPower(state, territory, entry), 0) -
    botPenalty -
    botDebuff;

  return {
    playerPower: Math.max(0, playerPower),
    botPower: Math.max(0, botPower),
  };
}

function getTerritoryLeaderText(playerPower: number, botPower: number) {
  if (playerPower === botPower) {
    return "territorio empatado";
  }

  if (playerPower > botPower) {
    return `voce na frente por ${playerPower - botPower}`;
  }

  return `bot na frente por ${botPower - playerPower}`;
}

function getDeckPreviewCards(deckId: DeckId) {
  return CITY_DECK_PREVIEW_IDS[deckId].map((cardId) => getAuditCard(cardId));
}

function getMatchMessageTone(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("folego insuficiente") || normalized.includes("faltam")) {
    return "warning" as const;
  }

  if (normalized.includes("bot") || normalized.includes("pressao rival")) {
    return "danger" as const;
  }

  if (normalized.includes("jogou") || normalized.includes("carta pronta") || normalized.includes("territorio")) {
    return "action" as const;
  }

  if (normalized.includes("influencia +") || normalized.includes("ocupou melhor")) {
    return "success" as const;
  }

  return "neutral" as const;
}

function getMessagePanelClassName(tone: ReturnType<typeof getMatchMessageTone>) {
  switch (tone) {
    case "warning":
      return "border-[#ff7e4e]/20 bg-[#261713] text-[#ffc2aa]";
    case "danger":
      return "border-[#ff7e4e]/18 bg-[#241613] text-[#ffc2ad]";
    case "action":
      return "border-[#2ac7c4]/18 bg-[#102126] text-[#bcf5f2]";
    case "success":
      return "border-[#4fbb6f]/20 bg-[#122117] text-[#c7efcf]";
    default:
      return "border-white/10 bg-black/20 text-[#ddd5c9]";
  }
}

function getResultNarrative(match: MatchState) {
  const delta = Math.abs(match.playerInfluence - match.botInfluence);

  if (match.winner === "player") {
    return "Voce ocupou a memoria, protegeu o territorio e fez a cidade respirar.";
  }

  if (match.winner === "bot" && delta <= 2) {
    return "Foi por pouco. Uma jogada a mais poderia ter virado a cidade.";
  }

  if (match.winner === "bot") {
    return "A cidade ainda esta em disputa. Reorganize o baralho e volte para a rua.";
  }

  return "A disputa terminou em equilibrio. O proximo turno decide para onde a cidade respira.";
}

function getResultSummaryLine(match: MatchState, deckTitle: string) {
  return `${deckTitle} | Influencia ${match.playerInfluence} | Territorios ${match.territoriesWon.player} | Cartas ${match.cardsPlayed.player} | Rodada ${match.round}`;
}

function getResultTitle(match: MatchState) {
  if (match.winner === "player") return "Cidade mais viva";
  if (match.winner === "bot") return "Cidade sob pressao";
  return "Cidade em disputa";
}

function getResultStateLine(match: MatchState) {
  if (match.winner === "player") {
    return `Voce fechou a partida com ${match.playerInfluence} de influencia e segurou a Cidade Viva ate o fim.`;
  }

  if (match.winner === "bot") {
    return `O bot terminou na frente por ${Math.max(0, match.botInfluence - match.playerInfluence)} de influencia.`;
  }

  return `Empate em influencia: ${match.playerInfluence} x ${match.botInfluence}.`;
}

function getResultImpactLine(match: MatchState, isLocalRecord: boolean) {
  if (isLocalRecord) {
    return "Novo recorde local. Print pronto para desafiar outra pessoa.";
  }

  if (match.winner === "player") {
    return "Volta Redonda resistiu melhor desta vez. Vale compartilhar a leitura final da cidade.";
  }

  if (match.winner === "bot") {
    return "A pressao venceu esta rodada. O print final ajuda a puxar revanche imediata.";
  }

  return "A cidade ficou no fio. O resultado rende comparacao boa entre decks.";
}

function getSharePromptLine(match: MatchState, isLocalRecord: boolean) {
  if (isLocalRecord) {
    return "Bati meu recorde local. Quero ver quem segura a cidade melhor.";
  }

  if (match.winner === "player") {
    return "Segurei Volta Redonda ate o fim. Voce segura melhor?";
  }

  if (match.winner === "bot") {
    return "A cidade escapou da minha mao. Quero ver sua resposta.";
  }

  return "Terminou no limite. Quero ver seu desempate.";
}

function buildShareText({
  playerName,
  gameTitle,
  deckTitle,
  match,
  isLocalRecord,
  sharePrompt,
}: {
  playerName: string;
  gameTitle: string;
  deckTitle: string;
  match: MatchState;
  isLocalRecord: boolean;
  sharePrompt?: string;
}) {
  const safePlayerName = playerName.trim() || "Anon";
  return `${safePlayerName} jogou ${gameTitle} com o deck ${deckTitle} e terminou com ${match.playerInfluence} de Cidade Viva em ${match.round} rodadas. ${sharePrompt ?? getSharePromptLine(match, isLocalRecord)}`;
}

function getBotPlayScore(state: MatchState, card: BattleCard, territory: TerritoryState) {
  const before = getTerritoryTotals(state, territory);
  const projectedState = playCardForSide(state, "bot", card.id, territory.id);
  const projectedTerritory = projectedState.territories.find((entry) => entry.id === territory.id) ?? territory;
  const after = getTerritoryTotals(projectedState, projectedTerritory);
  const marginBefore = before.botPower - before.playerPower;
  const marginAfter = after.botPower - after.playerPower;
  let score = (marginAfter - marginBefore) * 6 + after.botPower;

  if (marginBefore < 0 && marginAfter >= 0) score += 16;
  if (marginBefore >= 4 && marginAfter > marginBefore) score -= 4;
  if (territory.botWins === 1 && marginAfter > 0) score += 8;
  if (territory.upgradedFor === "player" && marginAfter > 0) score += 6;
  if (card.type === "crise" && territory.playerCards.length > 0) score += 5;
  if (card.type === "acao-coletiva" && territory.botCards.length > 0) score += 4;
  if (card.effectKey === "remove_crisis" || card.effectKey === "cleanse_and_bonus") {
    score += territory.botCrisis > 0 ? 7 : 1;
  }

  return score;
}

function playCardForSide(state: MatchState, side: Side, cardId: string, territoryId: string) {
  const handKey = side === "player" ? "playerHand" : "botHand";
  const deckKey = side === "player" ? "playerDeck" : "botDeck";
  const breathKey = side === "player" ? "playerBreath" : "botBreath";
  const hand = state[handKey];
  const card = hand.find((entry) => entry.id === cardId);

  if (!card) return state;

  const territory = state.territories.find((entry) => entry.id === territoryId);
  if (!territory) return state;

  const cost = getCardCost(card, side, territory, state);
  if (state[breathKey] < cost) return state;
  const territoryName = getTerritoryDefinition(territoryId).name;
  const actionMessage =
    side === "player"
      ? card.type === "crise"
        ? `${card.name} pressiona ${territoryName} por ${cost} de folego.`
        : card.effectKey === "remove_crisis" || card.effectKey === "cleanse_and_bonus"
          ? `${card.name} limpa crise em ${territoryName} por ${cost} de folego.`
          : `Voce ocupou ${territoryName} com ${card.name} por ${cost} de folego.`
      : `Bot jogou ${card.name} em ${territoryName}.`;

  const nextState: MatchState = {
    ...state,
    [handKey]: hand.filter((entry) => entry.id !== cardId),
    [breathKey]: state[breathKey] - cost,
    selectedCardId: side === "player" ? null : state.selectedCardId,
    cityEvent: null,
    cardsPlayed: {
      ...state.cardsPlayed,
      [side]: state.cardsPlayed[side] + 1,
    },
    message: actionMessage,
  };

  if (state.nextCardDiscount[side] > 0) {
    nextState.nextCardDiscount = {
      ...state.nextCardDiscount,
      [side]: Math.max(0, state.nextCardDiscount[side] - 1),
    };
  }

  const nextTerritories = state.territories.map((entry) => {
    if (entry.id !== territoryId) return entry;

    const playedCard: PlayedCard = {
      instanceId: `${side}-${card.id}-${state.round}-${state.cardsPlayed[side]}`,
      card,
      side,
    };

    const updated =
      side === "player"
        ? { ...entry, playerCards: [...entry.playerCards, playedCard] }
        : { ...entry, botCards: [...entry.botCards, playedCard] };

    if (card.type === "crise") {
      return side === "player"
        ? { ...updated, botCrisis: updated.botCrisis + 1 }
        : { ...updated, playerCrisis: updated.playerCrisis + 1 };
    }

    if (card.effectKey === "remove_crisis" || card.effectKey === "cleanse_and_bonus") {
      return side === "player"
        ? { ...updated, playerCrisis: Math.max(0, updated.playerCrisis - 1) }
        : { ...updated, botCrisis: Math.max(0, updated.botCrisis - 1) };
    }

    return updated;
  });

  nextState.territories = nextTerritories;

  if (card.effectKey === "draw_card" || card.effectKey === "draw_card_if_rua") {
    const result = drawCards(nextState[deckKey], nextState[handKey], 1);
    nextState[deckKey] = result.deck;
    nextState[handKey] = result.hand;
  }

  if (card.effectKey === "next_round_breath") {
    nextState.nextRoundBreathBonus = {
      ...nextState.nextRoundBreathBonus,
      [side]: nextState.nextRoundBreathBonus[side] + 1,
    };
  }

  if (card.effectKey === "next_card_discount") {
    nextState.nextCardDiscount = {
      ...nextState.nextCardDiscount,
      [side]: nextState.nextCardDiscount[side] + 1,
    };
  }

  return nextState;
}

function applyRoundStartBonuses(state: MatchState, round: number) {
  const nextState: MatchState = {
    ...state,
    round,
    playerBreath: getRoundBreath(round) + state.nextRoundBreathBonus.player,
    botBreath: getRoundBreath(round) + state.nextRoundBreathBonus.bot,
    nextRoundBreathBonus: { player: 0, bot: 0 },
    nextCardDiscount: { player: 0, bot: 0 },
    selectedCardId: null,
  };

  nextState.territories = nextState.territories.map((territory) => {
    if (territory.id === "rio-paraiba" && territory.upgradedFor === "player") {
      return { ...territory, playerCrisis: Math.max(0, territory.playerCrisis - 1) };
    }

    if (territory.id === "rio-paraiba" && territory.upgradedFor === "bot") {
      return { ...territory, botCrisis: Math.max(0, territory.botCrisis - 1) };
    }

    return territory;
  });

  const playerDraws = 1 + nextState.extraDraws.player;
  const botDraws = 1 + nextState.extraDraws.bot;
  const playerDraw = drawCards(nextState.playerDeck, nextState.playerHand, playerDraws);
  const botDraw = drawCards(nextState.botDeck, nextState.botHand, botDraws);

  nextState.playerDeck = playerDraw.deck;
  nextState.playerHand = playerDraw.hand;
  nextState.botDeck = botDraw.deck;
  nextState.botHand = botDraw.hand;
  nextState.extraDraws = { player: 0, bot: 0 };

  return nextState;
}

function startMatch(deckId: DeckId) {
  const playerDeck = shuffleCards(getCardsForDeck(deckId));
  const botDeckId = getOpposingDeck(deckId);
  const botDeck = shuffleCards(getCardsForDeck(botDeckId));
  const playerDraw = drawCards(playerDeck, [], CITY_STARTING_HAND);
  const botDraw = drawCards(botDeck, [], CITY_STARTING_HAND);

  return {
    ...createInitialMatchState(),
    started: true,
    playerDeckId: deckId,
    botDeckId,
    playerDeck: playerDraw.deck,
    botDeck: botDraw.deck,
    playerHand: playerDraw.hand,
    botHand: botDraw.hand,
    message: "Rodada 1 aberta. Escolha uma carta para ocupar seu primeiro territorio.",
    cityEvent: getDeckOpeningLine(deckId),
  } satisfies MatchState;
}

function runBotTurn(state: MatchState) {
  let nextState = { ...state, message: "Bot ocupando a cidade..." };
  let safety = 0;

  while (safety < 12) {
    safety += 1;
    const options = nextState.botHand.flatMap((card) =>
      nextState.territories
        .filter((territory) => getCardCost(card, "bot", territory, nextState) <= nextState.botBreath)
        .map((territory) => ({
          card,
          territoryId: territory.id,
          score: getBotPlayScore(nextState, card, territory),
        })),
    );

    if (options.length === 0) break;
    const bestOption = options.sort((left, right) => right.score - left.score)[0];
    if (!bestOption) break;

    nextState = playCardForSide(nextState, "bot", bestOption.card.id, bestOption.territoryId);
  }

  return nextState;
}

function finalizeRound(state: MatchState) {
  let playerWins = 0;
  let botWins = 0;
  const nextExtraDraws = { ...state.extraDraws };
  const upgradeEvents: string[] = [];

  const nextTerritories = state.territories.map((territory) => {
    const totals = getTerritoryTotals(state, territory);
    let nextTerritory = { ...territory };
    let winner: Side | "tie" = "tie";

    if (totals.playerPower > totals.botPower) {
      winner = "player";
      playerWins += 1;
      nextTerritory.playerWins += 1;
      if (hasMatchingCard(territory.playerCards, (entry) => entry.card.effectKey === "win_progress")) {
        nextTerritory.playerWins += 1;
      }
    } else if (totals.botPower > totals.playerPower) {
      winner = "bot";
      botWins += 1;
      nextTerritory.botWins += 1;
      if (hasMatchingCard(territory.botCards, (entry) => entry.card.effectKey === "win_progress")) {
        nextTerritory.botWins += 1;
      }
    }

    if (nextTerritory.playerWins >= 2 && nextTerritory.upgradedFor !== "player") {
      nextTerritory.upgradedFor = "player";
      upgradeEvents.push(getTerritoryDefinition(territory.id).upgradeName);
    } else if (nextTerritory.botWins >= 2 && nextTerritory.upgradedFor !== "bot") {
      nextTerritory.upgradedFor = "bot";
      upgradeEvents.push(getTerritoryDefinition(territory.id).upgradeName);
    }

    if (
      territory.id === "memorial-9" &&
      territory.upgradedFor === "player" &&
      territory.playerCards.length > 0
    ) {
      nextExtraDraws.player += 1;
    }
    if (
      territory.id === "memorial-9" &&
      territory.upgradedFor === "bot" &&
      territory.botCards.length > 0
    ) {
      nextExtraDraws.bot += 1;
    }

    nextTerritory = {
      ...nextTerritory,
      playerCards: [],
      botCards: [],
      lastWinner: winner,
    };

    return nextTerritory;
  });

  const playerInfluenceGain = getInfluenceFromWins(playerWins);
  const botInfluenceGain = getInfluenceFromWins(botWins);
  const nextRound = state.round + 1;
  const nextState: MatchState = {
    ...state,
    territories: nextTerritories,
    extraDraws: nextExtraDraws,
    playerInfluence: state.playerInfluence + playerInfluenceGain,
    botInfluence: state.botInfluence + botInfluenceGain,
    territoriesWon: {
      player: state.territoriesWon.player + playerWins,
      bot: state.territoriesWon.bot + botWins,
    },
    message: `Rodada ${state.round}: voce ${playerWins}-${botWins} territorios. Influencia +${playerInfluenceGain}.`,
    cityEvent: upgradeEvents.length > 0 ? `Cidade Viva: ${upgradeEvents.join(" | ")}` : null,
  };

  const playerClosed = nextState.playerInfluence >= CITY_INFLUENCE_TARGET;
  const botClosed = nextState.botInfluence >= CITY_INFLUENCE_TARGET;
  const roundCapReached = state.round >= CITY_MAX_ROUNDS;

  if (playerClosed || botClosed || roundCapReached) {
    let winner: Side | "tie" = "tie";

    if (nextState.playerInfluence > nextState.botInfluence) winner = "player";
    if (nextState.botInfluence > nextState.playerInfluence) winner = "bot";

    return {
      ...nextState,
      finished: true,
      winner,
      selectedCardId: null,
      message:
        winner === "player"
          ? "Voce ocupou melhor a cidade."
          : winner === "bot"
            ? "O bot venceu a disputa territorial."
            : "A partida terminou empatada.",
      cityEvent: upgradeEvents.length > 0 ? `Cidade Viva: ${upgradeEvents.join(" | ")}` : nextState.cityEvent,
    };
  }

  return applyRoundStartBonuses(nextState, nextRound);
}

function getMatchScore(match: MatchState) {
  return (
    match.playerInfluence * 120 +
    match.territoriesWon.player * 26 +
    (match.winner === "player" ? 180 : match.winner === "tie" ? 90 : 40)
  );
}

function createResultFile({
  deckTitle,
  playerInfluence,
  botInfluence,
  round,
  territoriesWon,
  winner,
  isLocalRecord,
}: {
  deckTitle: string;
  playerInfluence: number;
  botInfluence: number;
  round: number;
  territoriesWon: number;
  winner: Side | "tie" | null;
  isLocalRecord: boolean;
}) {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext("2d");

  if (!ctx) return Promise.resolve<File | null>(null);

  const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bg.addColorStop(0, "#111315");
  bg.addColorStop(0.45, "#1b2225");
  bg.addColorStop(1, "#0b0c0e");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#f2a900";
  ctx.lineWidth = 14;
  ctx.strokeRect(38, 40, 1004, 1272);
  ctx.fillStyle = "rgba(255,255,255,0.04)";
  ctx.fillRect(80, 82, 920, 1188);

  ctx.fillStyle = "#f7f1df";
  ctx.font = '900 78px "Geist", sans-serif';
  ctx.fillText("Cidade de Aco", 118, 205);
  ctx.fillText("Cronicas de VR", 118, 286);
  ctx.fillStyle = "#f2d8a0";
  ctx.font = '900 34px "Geist", sans-serif';
  ctx.fillText(deckTitle.toUpperCase(), 118, 346);

  ctx.fillStyle = winner === "player" ? "#2ac7c4" : winner === "bot" ? "#ff7e4e" : "#f2a900";
  ctx.font = '900 228px "Geist", sans-serif';
  ctx.fillText(`${playerInfluence}`, 118, 570);
  ctx.font = '900 72px "Geist", sans-serif';
  ctx.fillText("cidade viva final", 118, 650);
  ctx.fillStyle = "#f7f1df";
  ctx.font = '700 48px "Geist", sans-serif';
  ctx.fillText(`Bot ${botInfluence}  |  Rodada ${round}`, 118, 735);

  ctx.fillStyle = "rgba(42,199,196,0.12)";
  ctx.fillRect(118, 810, 844, 160);
  ctx.fillStyle = "#e4fafa";
  ctx.font = '900 54px "Geist", sans-serif';
  ctx.fillText(`${territoriesWon}`, 154, 894);
  ctx.fillText(`${playerInfluence - botInfluence}`, 474, 894);
  ctx.fillStyle = "#9fd5d4";
  ctx.font = '700 28px "Geist", sans-serif';
  ctx.fillText("territorios vencidos", 154, 938);
  ctx.fillText("saldo de influencia", 474, 938);

  ctx.fillStyle = "#f2a900";
  ctx.font = '900 44px "Geist", sans-serif';
  ctx.fillText(
    winner === "player"
      ? "Voce deixou a cidade mais viva."
      : winner === "bot"
        ? "A cidade ficou sob pressao rival."
        : "A disputa terminou no limite.",
    118,
    1088,
  );
  ctx.fillStyle = isLocalRecord ? "#2ac7c4" : "#f7f1df";
  ctx.font = '900 28px "Geist", sans-serif';
  ctx.fillText(
    isLocalRecord ? "NOVO RECORDE LOCAL" : "SEGURA VOLTA REDONDA MELHOR?",
    118,
    1140,
  );
  ctx.fillStyle = "#f7f1df";
  ctx.font = '900 32px "Geist", sans-serif';
  ctx.fillText("ABANDONADA GAMES", 118, 1178);

  return new Promise<File | null>((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        resolve(null);
        return;
      }

      resolve(new File([blob], "cidade-de-aco-cronicas-vr.png", { type: "image/png" }));
    }, "image/png");
  });
}

export function CidadeDeAcoCardGame({ game }: { game: GameDefinition }) {
  const [playerName, setPlayerName] = useState("Anon");
  const [match, setMatch] = useState<MatchState>(createInitialMatchState());
  const [copyLabel, setCopyLabel] = useState(SHARE_LABEL_DEFAULT);
  const [bestScore, setBestScore] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [resultImageUrl, setResultImageUrl] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [auditMode, setAuditMode] = useState(false);
  const [shareToast, setShareToast] = useState<ShareToastState | null>(null);
  const [impactFeedback, setImpactFeedback] = useState<{ territoryId: string; stamp: number } | null>(null);
  const [territoryWarningFeedback, setTerritoryWarningFeedback] = useState<{ territoryId: string; stamp: number } | null>(null);
  const [cardWarningFeedback, setCardWarningFeedback] = useState<{ cardId: string; stamp: number } | null>(null);
  const [cityInfluenceFeedback, setCityInfluenceFeedback] = useState<{ tone: "gain" | "loss"; stamp: number } | null>(null);
  const [showQuickStart, setShowQuickStart] = useState(true);
  const previousInfluenceRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedPlayerName = window.localStorage.getItem(PLAYER_NAME_KEY);
    const storedBestScore = Number.parseInt(window.localStorage.getItem(BEST_SCORE_KEY) ?? "0", 10) || 0;
    const tutorialSeen = window.localStorage.getItem(CITY_TUTORIAL_SEEN_KEY) === "1";
    const frameId = window.requestAnimationFrame(() => {
      if (storedPlayerName) {
        setPlayerName(storedPlayerName);
      }

      setBestScore(storedBestScore);
      setShowQuickStart(!tutorialSeen);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(PLAYER_NAME_KEY, playerName);
  }, [playerName]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncAuditMode = () => {
      setAuditMode(window.location.hash.includes("audit"));
    };

    syncAuditMode();
    window.addEventListener("hashchange", syncAuditMode);
    return () => window.removeEventListener("hashchange", syncAuditMode);
  }, []);

  useEffect(() => {
    if (!match.finished) return;
    const currentDeckTitle = match.playerDeckId ? getDeckMeta(match.playerDeckId)?.title ?? "Deck" : "Deck";

    void createResultFile({
      deckTitle: currentDeckTitle,
      playerInfluence: match.playerInfluence,
      botInfluence: match.botInfluence,
      round: match.round,
      territoriesWon: match.territoriesWon.player,
      winner: match.winner,
      isLocalRecord: getMatchScore(match) >= bestScore,
    }).then((file) => {
      if (!file) return;
      const url = URL.createObjectURL(file);
      setResultImageUrl(url);
    });
  }, [bestScore, match]);

  useEffect(() => {
    return () => {
      if (resultImageUrl) URL.revokeObjectURL(resultImageUrl);
    };
  }, [resultImageUrl]);

  useEffect(() => {
    if (!shareToast || typeof window === "undefined") return;
    const timeoutId = window.setTimeout(() => setShareToast(null), 2000);
    return () => window.clearTimeout(timeoutId);
  }, [shareToast]);

  useEffect(() => {
    if (!impactFeedback || typeof window === "undefined") return;
    const timeoutId = window.setTimeout(() => setImpactFeedback(null), 520);
    return () => window.clearTimeout(timeoutId);
  }, [impactFeedback]);

  useEffect(() => {
    if (!territoryWarningFeedback || typeof window === "undefined") return;
    const timeoutId = window.setTimeout(() => setTerritoryWarningFeedback(null), 420);
    return () => window.clearTimeout(timeoutId);
  }, [territoryWarningFeedback]);

  useEffect(() => {
    if (!cardWarningFeedback || typeof window === "undefined") return;
    const timeoutId = window.setTimeout(() => setCardWarningFeedback(null), 420);
    return () => window.clearTimeout(timeoutId);
  }, [cardWarningFeedback]);

  useEffect(() => {
    if (!cityInfluenceFeedback || typeof window === "undefined") return;
    const timeoutId = window.setTimeout(() => setCityInfluenceFeedback(null), 650);
    return () => window.clearTimeout(timeoutId);
  }, [cityInfluenceFeedback]);

  useEffect(() => {
    const currentSpread = match.playerInfluence - match.botInfluence;
    const previousSpread = previousInfluenceRef.current;

    if (match.started && currentSpread !== previousSpread) {
      setCityInfluenceFeedback({
        tone: currentSpread > previousSpread ? "gain" : "loss",
        stamp: Date.now(),
      });
    }

    previousInfluenceRef.current = currentSpread;
  }, [match.started, match.playerInfluence, match.botInfluence]);

  useEffect(() => {
    if (!match.finished || submitted || !startedAt) return;

    const durationMs = Math.max(6000, Date.now() - startedAt);
    const score =
      match.playerInfluence * 120 +
      match.territoriesWon.player * 26 +
      (match.winner === "player" ? 180 : match.winner === "tie" ? 90 : 40);
    const payload = {
      slug: game.slug,
      player: playerName.trim() || "Anon",
      score,
      durationMs,
      eventsHandled: Math.max(1, match.cardsPlayed.player),
    };

    void fetch("/api/score/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).finally(() => {
      setSubmitted(true);
    });
  }, [game.slug, match.cardsPlayed.player, match.finished, match.playerInfluence, match.territoriesWon.player, match.winner, playerName, startedAt, submitted]);

  function dismissQuickStart(scrollToDecks = false) {
    setShowQuickStart(false);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(CITY_TUTORIAL_SEEN_KEY, "1");

      if (scrollToDecks) {
        window.requestAnimationFrame(() => {
          document.getElementById("cidade-deck-select")?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
    }
  }

  function handleStart(deckId: DeckId) {
    setSubmitted(false);
    setResultImageUrl(null);
    setCopyLabel(SHARE_LABEL_DEFAULT);
    setShareToast(null);
    setStartedAt(() => Date.now());
    setShowQuickStart(false);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(CITY_TUTORIAL_SEEN_KEY, "1");
    }
    setMatch(startMatch(deckId));
  }

  function handleReplay() {
    if (!match.playerDeckId) {
      handleResetToDecks();
      return;
    }

    setSubmitted(false);
    setResultImageUrl(null);
    setCopyLabel(SHARE_LABEL_DEFAULT);
    setShareToast(null);
    setStartedAt(() => Date.now());
    setMatch(startMatch(match.playerDeckId));
  }

  function handleResetToDecks() {
    setSubmitted(false);
    setResultImageUrl(null);
    setCopyLabel(SHARE_LABEL_DEFAULT);
    setShareToast(null);
    setStartedAt(null);
    setMatch(createInitialMatchState());
  }

  function handleSelectCard(cardId: string, affordable: boolean, cheapestCost: number) {
    if (!affordable) {
      setCardWarningFeedback({ cardId, stamp: Date.now() });
    }

    setMatch((current) => ({
      ...current,
      selectedCardId: affordable
        ? current.selectedCardId === cardId
          ? null
          : cardId
        : null,
      message:
        !affordable
          ? `Folego insuficiente. Esta carta pede ${cheapestCost} nesta rodada.`
          : current.selectedCardId === cardId
            ? "Carta desmarcada. Escolha outra ou feche a rodada."
            : "Carta pronta. Agora toque em um territorio aceso.",
    }));
  }

  function handlePlayCard(territoryId: string) {
    setMatch((current) => {
      if (current.finished) return current;
      if (!current.selectedCardId) {
        return {
          ...current,
          message: "Escolha uma carta antes de tocar em um territorio.",
        };
      }

      const territory = current.territories.find((entry) => entry.id === territoryId);
      const selected = current.playerHand.find((card) => card.id === current.selectedCardId);
      if (!territory || !selected) return current;

      const territoryCost = getCardCost(selected, "player", territory, current);
      if (territoryCost > current.playerBreath) {
        setTerritoryWarningFeedback({ territoryId, stamp: Date.now() });
        setCardWarningFeedback({ cardId: selected.id, stamp: Date.now() });
        return {
          ...current,
          message: `Faltam ${territoryCost - current.playerBreath} de folego para jogar em ${getTerritoryDefinition(territoryId).name}.`,
        };
      }

      setImpactFeedback({ territoryId, stamp: Date.now() });
      return playCardForSide(current, "player", current.selectedCardId, territoryId);
    });
  }

  function handleEndTurn() {
    setMatch((current) => {
      if (!current.started || current.finished) return current;
      const afterBot = runBotTurn(current);
      const resolved = finalizeRound(afterBot);

      if (resolved.finished) {
        const score = getMatchScore(resolved);
        setBestScore((currentBest) => {
          const nextBest = Math.max(currentBest, score);

          if (nextBest !== currentBest) {
            try {
              window.localStorage.setItem(BEST_SCORE_KEY, String(nextBest));
            } catch {}
          }

          return nextBest;
        });
      }

      return resolved;
    });
  }

  async function handleShare() {
    const deckTitle = playerDeckMeta?.title ?? "Deck";
    const shareUrl = typeof window !== "undefined" ? new URL(`/jogar/${game.slug}`, window.location.origin).toString() : "";
    const text = buildShareText({
      playerName,
      gameTitle: game.title,
      deckTitle,
      match,
      isLocalRecord: finalScore >= bestScore,
      sharePrompt: game.sharePrompt,
    });

    try {
      if (resultImageUrl) {
        const response = await fetch(resultImageUrl);
        const blob = await response.blob();
        const file = new File([blob], "cidade-de-aco-vr.png", { type: "image/png" });

        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ title: game.title, text, files: [file] });
          setCopyLabel("Compartilhado");
          setShareToast({ tone: "success", text: "Resultado enviado. Agora vale puxar revanche." });
          return;
        }
      }

      if (navigator.share) {
        await navigator.share({ title: game.title, text, url: shareUrl });
        setCopyLabel("Compartilhado");
        setShareToast({ tone: "success", text: "Link pronto para circular no grupo." });
        return;
      }

      await navigator.clipboard.writeText(`${text} ${shareUrl}`);
      setCopyLabel("Texto copiado");
      setShareToast({ tone: "success", text: "Texto copiado. E so colar e desafiar outra pessoa." });
    } catch (error) {
      setCopyLabel(SHARE_LABEL_DEFAULT);

      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      setShareToast({ tone: "warning", text: "Nao deu para compartilhar agora." });
    }
  }

  const selectedCard = match.playerHand.find((card) => card.id === match.selectedCardId) ?? null;
  const playerDeckMeta = match.playerDeckId ? getDeckMeta(match.playerDeckId) : null;
  const botDeckMeta = match.botDeckId ? getDeckMeta(match.botDeckId) : null;
  const finalScore = getMatchScore(match);
  const resultNarrative = getResultNarrative(match);
  const resultSummary = getResultSummaryLine(match, playerDeckMeta?.title ?? "Deck");
  const resultTitle = getResultTitle(match);
  const resultStateLine = getResultStateLine(match);
  const resultImpactLine = getResultImpactLine(match, finalScore >= bestScore);
  const matchMessageTone = getMatchMessageTone(match.message);
  const affordableCards = match.playerHand.filter((card) =>
    match.territories.some((territory) => getCardCost(card, "player", territory, match) <= match.playerBreath),
  );
  const hasAffordableCard = affordableCards.length > 0;
  const selectedCardPlayableTerritories = selectedCard
    ? match.territories.filter((territory) => getCardCost(selectedCard, "player", territory, match) <= match.playerBreath)
    : [];
  const tutorialProgressStep = match.cardsPlayed.player === 0 ? (selectedCard ? 2 : 1) : 3;
  const tutorialProgressCopy =
    match.cardsPlayed.player === 0
      ? selectedCard
        ? `Passo 2: ${selectedCard.name} ja esta pronta. Toque em um territorio aceso.`
        : "Passo 1: escolha uma carta com custo que caiba no seu Folego."
      : hasAffordableCard
        ? "Passo 3: feche a rodada quando quiser segurar o que ja colocou na cidade."
        : "Passo 3: sem jogada barata agora. Feche a rodada para o bot responder.";
  const auditLot01Cards = LOT_01_AUDIT_IDS.map((cardId) => getAuditCard(cardId));
  const auditLot02Cards = LOT_02_AUDIT_IDS.map((cardId) => getAuditCard(cardId)).filter((card) => Boolean(card.artPath));
  const auditLot03Cards = LOT_03_AUDIT_IDS.map((cardId) => getAuditCard(cardId)).filter((card) => Boolean(card.artPath));
  const auditLot04Cards = LOT_04_AUDIT_IDS.map((cardId) => getAuditCard(cardId)).filter((card) => Boolean(card.artPath));
  const auditCohesionAcoCards = COHESION_AUDIT_ACO_IDS.map((cardId) => getAuditCard(cardId)).filter((card) => Boolean(card.artPath));
  const auditCohesionRioCards = COHESION_AUDIT_RIO_IDS.map((cardId) => getAuditCard(cardId)).filter((card) => Boolean(card.artPath));
  const auditApprovedNotesCards = APPROVED_NOTES_REVIEW_IDS.map((cardId) => getAuditCard(cardId)).filter((card) => Boolean(card.artPath));
  const auditReleaseAcoCards = RELEASE_CANDIDATE_ACO_IDS.map((cardId) => getAuditCard(cardId));
  const auditReleaseRioCards = RELEASE_CANDIDATE_RIO_IDS.map((cardId) => getAuditCard(cardId));
  const auditRio012Card = getAuditCard("rio_012");
  const shouldShowAudit = auditMode || (typeof window !== "undefined" && window.location.hash.includes("audit"));

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(242,169,0,0.08),transparent_30%),linear-gradient(180deg,#0d0f12_0%,#16191c_55%,#0b0c0e_100%)] px-4 py-5 text-[#f7f1df] lg:px-8">
      <div className="mx-auto max-w-6xl">
        <PortalTrail currentLabel={game.title} currentHref={`/jogar/${game.slug}`} />

        {!match.started ? (
          <section data-testid="cidade-start-screen" className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_380px]">
            <div className="rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(22,25,28,0.96),rgba(11,12,14,0.98))] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
              <GamePageHeader eyebrow="card territory battle" title={game.title} />
              {showQuickStart ? (
                <div className="mt-4 rounded-[1.35rem] border border-[#f2a900]/20 bg-[#18140f] p-4" data-testid="cidade-start-guide">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f2a900]">
                        primeira partida
                      </div>
                      <div className="mt-1 text-sm font-bold text-[#f3e2bb]">
                        Entenda o jogo em menos de 10 segundos.
                      </div>
                    </div>
                    <div className="rounded-full border border-[#f2a900]/25 bg-[#2a2114] px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#ffd86a]">
                      3 passos
                    </div>
                  </div>
                  <div className="mt-4 grid gap-2 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-black/15 p-3">
                      <div className="text-[9px] font-black uppercase tracking-[0.18em] text-[#f2a900]">1</div>
                      <div className="mt-1 text-xs font-black uppercase text-[#f7f1df]">Escolha um deck</div>
                      <div className="mt-1 text-[11px] font-bold leading-snug text-[#d7d0c4]">
                        Veja o estilo e toque no baralho que mais combina com voce.
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/15 p-3">
                      <div className="text-[9px] font-black uppercase tracking-[0.18em] text-[#2ac7c4]">2</div>
                      <div className="mt-1 text-xs font-black uppercase text-[#f7f1df]">Jogue nos territorios</div>
                      <div className="mt-1 text-[11px] font-bold leading-snug text-[#d7d0c4]">
                        Cada carta gasta Folego. Use o que couber na rodada.
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/15 p-3">
                      <div className="text-[9px] font-black uppercase tracking-[0.18em] text-[#ff7e4e]">3</div>
                      <div className="mt-1 text-xs font-black uppercase text-[#f7f1df]">Segure a cidade viva</div>
                      <div className="mt-1 text-[11px] font-bold leading-snug text-[#d7d0c4]">
                        Feche as rodadas e chegue a 12 de influencia antes do fim.
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => dismissQuickStart(true)}
                      className="rounded-xl border border-[#f2a900]/40 bg-[#2b2112] px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-[#ffd86a]"
                    >
                      Comecar
                    </button>
                    <button
                      type="button"
                      onClick={() => dismissQuickStart(false)}
                      className="rounded-xl border border-white/10 bg-black/15 px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-[#d7d0c4]"
                    >
                      Pular
                    </button>
                  </div>
                </div>
              ) : null}
              <p className="mt-4 max-w-2xl text-sm font-bold leading-relaxed text-[#d7d0c4]">
                Cinco rodadas, tres territorios e duas linhas de forca. Escolha um deck, gaste seu
                Folego com cuidado e tente fechar a cidade com mais influencia que o bot.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#f2a900]">rodadas</div>
                  <div className="mt-2 text-3xl font-black">{CITY_MAX_ROUNDS}</div>
                  <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#aaa396]">
                    conflito rapido
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#2ac7c4]">territorios</div>
                  <div className="mt-2 text-3xl font-black">3</div>
                  <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#aaa396]">
                    praca, rio e memoria
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#ff7e4e]">alvo</div>
                  <div className="mt-2 text-3xl font-black">{CITY_INFLUENCE_TARGET}</div>
                  <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#aaa396]">
                    influencia popular
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-[1.4rem] border border-white/10 bg-black/20 p-4">
                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#b8afa2]">
                  nome no ranking
                </div>
                <input
                  value={playerName}
                  onChange={(event) => setPlayerName(event.target.value.slice(0, 18))}
                  className="mt-3 w-full rounded-2xl border border-white/10 bg-[#0d1012] px-4 py-3 text-sm font-black uppercase tracking-[0.1em] text-[#f7f1df] outline-none placeholder:text-[#7f7a73] focus:border-[#f2a900]/55"
                  placeholder="Anon"
                />
              </div>
            </div>

            <aside id="cidade-deck-select" data-testid="cidade-deck-select" className="space-y-4">
              <div className="rounded-[1.35rem] border border-white/10 bg-[linear-gradient(180deg,rgba(22,25,28,0.94),rgba(10,11,13,0.98))] p-4">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#b8afa2]">
                  escolha seu deck
                </div>
                <div className="mt-1 text-sm font-bold text-[#d8d0c4]">
                  Um deck bate mais pesado. O outro limpa crise e gira melhor.
                </div>
              </div>
              {CITY_DECKS.map((deck) => (
                <button
                  key={deck.id}
                  type="button"
                  onClick={() => handleStart(deck.id)}
                  data-testid={`cidade-start-deck-${deck.id}`}
                  className="w-full rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(22,25,28,0.96),rgba(9,10,12,0.98))] p-4 text-left transition-transform duration-150 hover:-translate-y-[2px] hover:border-[#f2a900]/45"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#b8afa2]">
                        deck inicial
                      </div>
                      <div className="mt-1 text-xl font-black uppercase text-[#f7f1df]">{deck.title}</div>
                    </div>
                    <div
                      className="h-10 w-10 rounded-full border"
                      style={{ borderColor: deck.accent, boxShadow: `0 0 0 1px ${deck.accent}22 inset` }}
                    />
                  </div>
                  <p className="mt-3 text-sm font-bold leading-relaxed text-[#ddd5c9]">{deck.subtitle}</p>
                  <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.08em] text-[#9d9689]">
                    {deck.focus}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {CITY_DECK_STYLE_LABELS[deck.id].map((label) => (
                      <span
                        key={`${deck.id}-${label}`}
                        className="rounded-full border border-white/10 bg-black/15 px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-[#d7d0c4]"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                    {getDeckPreviewCards(deck.id).map((card) => (
                      <CidadeDeAcoCardView key={`deck-preview-${deck.id}-${card.id}`} card={card} compact mini />
                    ))}
                  </div>
                  <div className="mt-4 text-[10px] font-black uppercase tracking-[0.18em] text-[#f2a900]">
                    comecar com este deck
                  </div>
                </button>
              ))}
            </aside>
          </section>
        ) : (
          <section data-testid="cidade-live-match" className="space-y-5">
            <div className="overflow-hidden rounded-[1.6rem] border border-[#645842] bg-[linear-gradient(180deg,rgba(23,24,27,0.98),rgba(10,11,13,0.98))] shadow-[0_26px_70px_rgba(0,0,0,0.32)]">
              <div className="border-b border-white/8 bg-[radial-gradient(circle_at_top,rgba(242,169,0,0.1),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent)] px-4 py-4">
                <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-3">
                  <div className="rounded-[1.25rem] border border-[#2ac7c4]/18 bg-[#102027] p-3">
                    <div className="text-[9px] font-black uppercase tracking-[0.18em] text-[#8bdcd8]">
                      voce
                    </div>
                    <div className="mt-2 text-4xl font-black leading-none text-[#e2fbfa]">{match.playerInfluence}</div>
                    <div className="mt-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#9bc2c2]">
                      influencia
                    </div>
                  </div>
                  <div className="rounded-[1.1rem] border border-[#f2a900]/22 bg-[#1b1812] px-4 py-3 text-center">
                    <div className="text-[9px] font-black uppercase tracking-[0.2em] text-[#cab28a]">
                      rodada
                    </div>
                    <div className="mt-1 text-4xl font-black leading-none text-[#f7f1df]">{match.round}</div>
                    <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#aa9a82]">
                      de {CITY_MAX_ROUNDS}
                    </div>
                  </div>
                  <div className="rounded-[1.25rem] border border-[#ff7e4e]/18 bg-[#241612] p-3 text-right">
                    <div className="text-[9px] font-black uppercase tracking-[0.18em] text-[#ffb89c]">
                      bot
                    </div>
                    <div className="mt-2 text-4xl font-black leading-none text-[#fff0e8]">{match.botInfluence}</div>
                    <div className="mt-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#cfa694]">
                      influencia
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-[1.25rem] border border-[#4f473a] bg-[#141517] px-4 py-3">
                  <div className="text-center text-[10px] font-black uppercase tracking-[0.22em] text-[#a89a83]">
                    folego da cidade
                  </div>
                  <div className="mt-3 flex items-center justify-center gap-2">
                    {Array.from({ length: getRoundBreath(match.round) }).map((_, index) => (
                      <span
                        key={`breath-slot-${index}`}
                        className={`h-4 w-4 rounded-full border ${
                          index < match.playerBreath
                            ? "border-[#6ae3db] bg-[radial-gradient(circle,#bffff9_0%,#2ac7c4_48%,#12373a_100%)] shadow-[0_0_14px_rgba(42,199,196,0.4)]"
                            : "border-white/10 bg-[#17181a]"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-center">
                    <div className="rounded-xl border border-[#2ac7c4]/18 bg-[#102127] px-3 py-2">
                      <div className="text-[8px] font-black uppercase tracking-[0.16em] text-[#89d7d6]">jogador</div>
                      <div className="mt-1 text-xl font-black text-[#ebfffe]">{match.playerBreath}</div>
                    </div>
                    <div className="rounded-xl border border-[#ff7e4e]/18 bg-[#231511] px-3 py-2">
                      <div className="text-[8px] font-black uppercase tracking-[0.16em] text-[#ffb296]">bot</div>
                      <div className="mt-1 text-xl font-black text-[#fff1e9]">{match.botBreath}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-[1.25rem] border border-[#f2a900]/16 bg-[#17130f] px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#f2a900]">
                        objetivo rapido
                      </div>
                      <div className="mt-1 text-sm font-bold text-[#f3e2bb]">
                        Chegue a {CITY_INFLUENCE_TARGET} de influencia antes da rodada {CITY_MAX_ROUNDS}.
                      </div>
                    </div>
                    <div className="rounded-xl border border-[#f2a900]/18 bg-black/20 px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-[#ffd86a]">
                      cidade viva decide
                    </div>
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    {["1 escolha uma carta", "2 toque num territorio", "3 feche a rodada"].map((step, index) => (
                      <div
                        key={step}
                        className={`rounded-xl border px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] ${
                          tutorialProgressStep === index + 1
                            ? "border-[#2ac7c4]/22 bg-[#102126] text-[#baf5f2]"
                            : "border-white/8 bg-black/15 text-[#bcae96]"
                        }`}
                      >
                        {step}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-[11px] font-bold leading-relaxed text-[#d7d0c4]">
                    {tutorialProgressCopy}
                  </div>
                </div>
              </div>

              <div className="px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#b9b1a6]">
                      cronica aberta
                    </div>
                    <div className="mt-1 text-2xl font-black uppercase leading-tight">{game.title}</div>
                    <div className="mt-1 text-sm font-bold text-[#d7d0c4]">{game.tagline}</div>
                  </div>
                  <div
                    className={`rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-right ${
                      cityInfluenceFeedback?.tone === "gain"
                        ? "city-kpi-rise"
                        : cityInfluenceFeedback?.tone === "loss"
                          ? "city-kpi-drop"
                          : ""
                    }`}
                  >
                    <div className="text-[9px] font-black uppercase tracking-[0.16em] text-[#9e9587]">matchup</div>
                    <div className="mt-1 text-[11px] font-black uppercase tracking-[0.1em] text-[#f7f1df]">
                      {playerDeckMeta?.title} vs {botDeckMeta?.title}
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-[1.15rem] border border-white/8 bg-black/18 px-4 py-3">
                  <div className="text-[9px] font-black uppercase tracking-[0.18em] text-[#f2a900]">
                    territorios da cidade
                  </div>
                  <div className="mt-2 text-sm font-bold text-[#d7d0c4]">
                    {selectedCard
                      ? `Territorios acesos recebem ${selectedCard.name}. Os escuros ainda nao cabem no seu Folego.`
                      : "Toque em uma carta. Depois escolha um dos tres pontos centrais."}
                  </div>
                </div>
              </div>
            </div>

            <div
              data-testid="cidade-feedback-banner"
              className={`rounded-[1.2rem] border px-4 py-3 text-sm font-black leading-relaxed ${getMessagePanelClassName(matchMessageTone)}`}
            >
              {match.message}
            </div>
            {match.cityEvent ? (
              <div className="rounded-[1.2rem] border border-[#f2a900]/18 bg-[#1f180f] px-4 py-3 text-[11px] font-black uppercase tracking-[0.14em] text-[#f2ddac]">
                {match.cityEvent}
              </div>
            ) : null}

            <div className="flex snap-x gap-4 overflow-x-auto pb-2">
              {match.territories.map((territory) => {
                const definition = getTerritoryDefinition(territory.id);
                const totals = getTerritoryTotals(match, territory);
                const territoryCost = selectedCard ? getCardCost(selectedCard, "player", territory, match) : null;
                const canPlayHere = territoryCost !== null ? territoryCost <= match.playerBreath : false;
                const playableTarget = Boolean(selectedCard) && canPlayHere;

                return (
                  <CidadeDeAcoTerritoryView
                    key={`${territory.id}-${impactFeedback?.territoryId === territory.id ? `impact-${impactFeedback.stamp}` : "steady"}-${territoryWarningFeedback?.territoryId === territory.id ? `warning-${territoryWarningFeedback.stamp}` : "calm"}`}
                    testId={`cidade-territory-${territory.id}`}
                    name={definition.name}
                    subtitle={definition.subtitle}
                    upgradeName={definition.upgradeName}
                    upgradeText={definition.upgradeText}
                    upgradedFor={territory.upgradedFor}
                    playerWins={territory.playerWins}
                    botWins={territory.botWins}
                    playerCrisis={territory.playerCrisis}
                    botCrisis={territory.botCrisis}
                    playerPower={totals.playerPower}
                    botPower={totals.botPower}
                    selected={playableTarget}
                    blocked={Boolean(selectedCard) && !canPlayHere}
                    feedbackTone={
                      impactFeedback?.territoryId === territory.id
                        ? "impact"
                        : territoryWarningFeedback?.territoryId === territory.id
                          ? "warning"
                          : null
                    }
                    disabled={false}
                    lastWinner={territory.lastWinner}
                    leaderText={
                      selectedCard
                        ? canPlayHere
                          ? `${selectedCard.name} entra aqui agora`
                          : `faltam ${Math.max(1, (territoryCost ?? 0) - match.playerBreath)} de folego aqui`
                        : getTerritoryLeaderText(totals.playerPower, totals.botPower)
                    }
                    playHint={
                      selectedCard
                        ? canPlayHere
                          ? `jogar por ${territoryCost} de folego`
                          : `faltam ${Math.max(1, (territoryCost ?? 0) - match.playerBreath)} de folego`
                        : "toque numa carta para abrir este ponto"
                    }
                    onClick={() => handlePlayCard(territory.id)}
                    playerCards={territory.playerCards.map((entry) => ({
                      id: entry.instanceId,
                      card: entry.card,
                      power: getCardPower(match, territory, entry),
                      isBuffed: getCardPower(match, territory, entry) > entry.card.power,
                    }))}
                    botCards={territory.botCards.map((entry) => ({
                      id: entry.instanceId,
                      card: entry.card,
                      power: getCardPower(match, territory, entry),
                      isBuffed: getCardPower(match, territory, entry) > entry.card.power,
                    }))}
                  />
                );
              })}
            </div>

            <div data-testid="cidade-hand-panel" className="rounded-[1.5rem] border border-[#5d543f] bg-[linear-gradient(180deg,rgba(20,21,24,0.98),rgba(8,9,10,0.98))] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.28)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#b9b1a6]">
                    sua mao
                  </div>
                  <div className="mt-1 text-sm font-bold text-[#d7d0c4]">
                    {selectedCard
                      ? `${selectedCard.name} pronta. ${selectedCardPlayableTerritories.length} territorio(s) aceso(s) agora.`
                      : "Cartas claras entram agora. As escuras ainda pedem mais Folego."}
                  </div>
                  <div className="mt-2 text-[10px] font-black uppercase tracking-[0.14em] text-[#8f877b]">
                    baralho restante {match.playerDeck.length} | cartas jogadas {match.cardsPlayed.player}
                  </div>
                </div>
                <div className="min-w-[124px]">
                  <button
                    type="button"
                    onClick={handleEndTurn}
                    data-testid="cidade-end-turn"
                    className={`w-full rounded-[1.2rem] border border-[#f2a900]/45 bg-[linear-gradient(180deg,#2d2413,#1f170d)] px-4 py-3 text-[11px] font-black uppercase tracking-[0.16em] text-[#ffd86a] transition-transform hover:-translate-y-[1px] ${
                      !hasAffordableCard && !selectedCard ? "animate-pulse" : ""
                    }`}
                  >
                    Fechar rodada
                  </button>
                  <div className="mt-2 text-center text-[9px] font-black uppercase tracking-[0.12em] text-[#bda889]">
                    {!hasAffordableCard && !selectedCard ? "sem jogada barata" : "o bot responde depois"}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                {match.playerHand.map((card) => {
                  const cheapestCost = Math.min(
                    ...match.territories.map((territory) => getCardCost(card, "player", territory, match)),
                  );
                  const affordable = cheapestCost <= match.playerBreath;

                  return (
                    <CidadeDeAcoCardView
                      key={`${card.id}-${cardWarningFeedback?.cardId === card.id ? `warning-${cardWarningFeedback.stamp}` : "steady"}-${selectedCard?.id === card.id ? "selected" : "idle"}`}
                      card={card}
                      testId={`cidade-hand-card-${card.id}`}
                      compact
                      selected={card.id === match.selectedCardId}
                      dimmed={!affordable}
                      affordable={affordable}
                      feedbackTone={
                        card.id === match.selectedCardId
                          ? "selected"
                          : cardWarningFeedback?.cardId === card.id
                            ? "warning"
                            : null
                      }
                      computedCost={cheapestCost}
                      statusText={
                        card.id === match.selectedCardId
                          ? "pronta para jogar"
                          : affordable
                            ? `custa ${cheapestCost}`
                            : `sem folego: precisa de ${cheapestCost}`
                      }
                      onClick={() => handleSelectCard(card.id, affordable, cheapestCost)}
                    />
                  );
                })}
                {match.playerHand.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-[11px] font-bold uppercase tracking-[0.12em] text-[#8f8a82]">
                    mao vazia
                  </div>
                ) : null}
              </div>
            </div>

            {shouldShowAudit ? (
              <div className="grid gap-4">
                <div
                  data-testid="cidade-audit-lote01-hand"
                  className="rounded-[1.5rem] border border-[#5d543f] bg-[linear-gradient(180deg,rgba(20,21,24,0.98),rgba(8,9,10,0.98))] p-4"
                >
                  <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#b9b1a6]">
                    auditoria lote 01
                  </div>
                  <div className="mt-1 text-sm font-bold text-[#d7d0c4]">
                    Mao mobile com estados mistos: selecionada, sem folego e enquadramentos `cover` e `contain`.
                  </div>
                  <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                    {auditLot01Cards.map((card, index) => {
                      const selected = card.id === "aco_006" || card.id === "rio_008";
                      const affordable = !["aco_007", "rio_007"].includes(card.id);
                      const statusText = affordable
                        ? selected
                          ? "selecionada"
                          : index % 2 === 0
                            ? "custa 2"
                            : "custa 3"
                        : "sem folego: precisa de 3";

                      return (
                        <CidadeDeAcoCardView
                          key={`audit-hand-${card.id}`}
                          card={card}
                          compact
                          selected={selected}
                          dimmed={!affordable}
                          affordable={affordable}
                          statusText={statusText}
                        />
                      );
                    })}
                  </div>
                </div>

                <div
                  data-testid="cidade-audit-lote01-board"
                  className="grid gap-4"
                >
                  <CidadeDeAcoTerritoryView
                    name="Praca Brasil"
                    subtitle="Concreto, encontro e disputa de centro."
                    upgradeName="Praca Brasil Ocupada"
                    upgradeText="Acoes Coletivas custam -1 aqui."
                    upgradedFor="player"
                    playerWins={2}
                    botWins={0}
                    playerCrisis={0}
                    botCrisis={1}
                    playerPower={8}
                    botPower={5}
                    selected
                    lastWinner="player"
                    leaderText="voce lidera por 3"
                    playHint="cidade viva ativa; foto precisa continuar legivel no territorio"
                    playerCards={[
                      { id: "audit-board-aco_005", card: getAuditCard("aco_005"), power: 2 },
                      { id: "audit-board-aco_006", card: getAuditCard("aco_006"), power: 4, isBuffed: true },
                    ]}
                    botCards={[
                      { id: "audit-board-rio_007", card: getAuditCard("rio_007"), power: 2 },
                    ]}
                  />
                  <CidadeDeAcoTerritoryView
                    name="Memorial 9 de Novembro"
                    subtitle="Arquivo vivo das lutas da cidade."
                    upgradeName="Memoria em Luta"
                    upgradeText="Quando suas cartas saem daqui, compre 1 carta."
                    upgradedFor={null}
                    playerWins={1}
                    botWins={1}
                    playerCrisis={0}
                    botCrisis={0}
                    playerPower={5}
                    botPower={6}
                    lastWinner="tie"
                    leaderText="o bot pressiona por 1"
                    playHint={null}
                    playerCards={[
                      { id: "audit-board-aco_007", card: getAuditCard("aco_007"), power: 3, isBuffed: true },
                    ]}
                    botCards={[
                      { id: "audit-board-rio_006", card: getAuditCard("rio_006"), power: 3 },
                      { id: "audit-board-rio_008", card: getAuditCard("rio_008"), power: 3 },
                    ]}
                  />
                </div>

                {auditLot02Cards.length > 0 ? (
                  <>
                    <div
                      data-testid="cidade-audit-lote02-hand"
                      className="rounded-[1.5rem] border border-[#5d543f] bg-[linear-gradient(180deg,rgba(20,21,24,0.98),rgba(8,9,10,0.98))] p-4"
                    >
                      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#b9b1a6]">
                        auditoria lote 02
                      </div>
                      <div className="mt-1 text-sm font-bold text-[#d7d0c4]">
                        Bloco industrial fechado com novas composicoes seguras e tres fotos historicas mantidas com notas.
                      </div>
                      <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                        {auditLot02Cards.map((card) => (
                          <CidadeDeAcoCardView
                            key={`audit-lote02-${card.id}`}
                            card={card}
                            compact
                            statusText="lote 02 em revisao"
                          />
                        ))}
                      </div>
                    </div>

                    <div data-testid="cidade-audit-lote02-board">
                      <CidadeDeAcoTerritoryView
                        name="Praca Brasil"
                        subtitle="Concreto, encontro e disputa de centro."
                        upgradeName="Praca Brasil Ocupada"
                        upgradeText="Acoes Coletivas custam -1 aqui."
                        upgradedFor="player"
                        playerWins={2}
                        botWins={1}
                        playerCrisis={0}
                        botCrisis={1}
                        playerPower={9}
                        botPower={4}
                        lastWinner="player"
                        leaderText="o lote 02 segura identidade do deck"
                        playHint={null}
                        playerCards={auditLot02Cards.slice(0, 3).map((card, index) => ({
                          id: `audit-lote02-board-${card.id}`,
                          card,
                          power: card.power + (index === 0 ? 1 : 0),
                          isBuffed: index === 0,
                        }))}
                        botCards={[
                          { id: "audit-lote02-board-rio_008", card: getAuditCard("rio_008"), power: 3 },
                        ]}
                      />
                    </div>

                    <div
                      data-testid="cidade-audit-lote02-mini-cards"
                      className="rounded-[1.5rem] border border-[#5d543f] bg-[linear-gradient(180deg,rgba(20,21,24,0.98),rgba(8,9,10,0.98))] p-4"
                    >
                      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#b9b1a6]">
                        miniaturas lote 02
                      </div>
                      <div className="mt-1 text-sm font-bold text-[#d7d0c4]">
                        Leitura em escala de territorio para o bloco industrial fechado.
                      </div>
                      <div className="mt-4 flex flex-wrap gap-3">
                        {auditLot02Cards.map((card) => (
                          <CidadeDeAcoCardView
                            key={`audit-lote02-mini-${card.id}`}
                            card={card}
                            compact
                            mini
                            statusText="mini"
                          />
                        ))}
                      </div>
                    </div>
                  </>
                ) : null}

                {auditLot03Cards.length > 0 ? (
                  <>
                    <div
                      data-testid="cidade-audit-lote03-hand"
                      className="rounded-[1.5rem] border border-[#5d543f] bg-[linear-gradient(180deg,rgba(20,21,24,0.98),rgba(8,9,10,0.98))] p-4"
                    >
                      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#b9b1a6]">
                        auditoria lote 03
                      </div>
                      <div className="mt-1 text-sm font-bold text-[#d7d0c4]">
                        Deck Rio & Rua com curva real do Paraiba, Retiro preservado e composicoes comunitarias fechadas.
                      </div>
                      <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                        {auditLot03Cards.map((card) => (
                          <CidadeDeAcoCardView
                            key={`audit-lote03-${card.id}`}
                            card={card}
                            compact
                            statusText="lote 03 em revisao"
                          />
                        ))}
                      </div>
                    </div>

                    <div data-testid="cidade-audit-lote03-board">
                      <CidadeDeAcoTerritoryView
                        name="Rio Paraiba"
                        subtitle="Fluxo, margem e recuperacao."
                        upgradeName="Rio em Recuperacao"
                        upgradeText="Remove 1 Crise sua no inicio da rodada."
                        upgradedFor="player"
                        playerWins={2}
                        botWins={0}
                        playerCrisis={0}
                        botCrisis={1}
                        playerPower={10}
                        botPower={5}
                        lastWinner="player"
                        leaderText="rio e bairro seguram leitura local no territorio"
                        playHint={null}
                        playerCards={[
                          { id: "audit-lote03-board-rio_001", card: getAuditCard("rio_001"), power: 3 },
                          { id: "audit-lote03-board-rio_002", card: getAuditCard("rio_002"), power: 3, isBuffed: true },
                          { id: "audit-lote03-board-rio_011", card: getAuditCard("rio_011"), power: 4 },
                        ]}
                        botCards={[
                          { id: "audit-lote03-board-aco_010", card: getAuditCard("aco_010"), power: 3 },
                          { id: "audit-lote03-board-aco_011", card: getAuditCard("aco_011"), power: 2 },
                        ]}
                      />
                    </div>

                    <div
                      data-testid="cidade-audit-lote03-mini-cards"
                      className="rounded-[1.5rem] border border-[#5d543f] bg-[linear-gradient(180deg,rgba(20,21,24,0.98),rgba(8,9,10,0.98))] p-4"
                    >
                      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#b9b1a6]">
                        miniaturas lote 03
                      </div>
                      <div className="mt-1 text-sm font-bold text-[#d7d0c4]">
                        Verificacao de leitura mobile para rio, bairro, escuta e mutirao em escala de territorio.
                      </div>
                      <div className="mt-4 flex flex-wrap gap-3">
                        {auditLot03Cards.map((card) => (
                          <CidadeDeAcoCardView
                            key={`audit-lote03-mini-${card.id}`}
                            card={card}
                            compact
                            mini
                            statusText="mini"
                          />
                        ))}
                      </div>
                    </div>
                  </>
                ) : null}

                {auditLot04Cards.length > 0 ? (
                  <>
                    <div
                      data-testid="cidade-audit-lote04-hand"
                      className="rounded-[1.5rem] border border-[#5d543f] bg-[linear-gradient(180deg,rgba(20,21,24,0.98),rgba(8,9,10,0.98))] p-4"
                    >
                      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#b9b1a6]">
                        auditoria lote 04
                      </div>
                      <div className="mt-1 text-sm font-bold text-[#d7d0c4]">
                        Memoria historica e cultura afro-brasileira em revisao conjunta, sem cair em violencia cenografica nem estereotipo.
                      </div>
                      <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                        {auditLot04Cards.map((card) => (
                          <CidadeDeAcoCardView
                            key={`audit-lote04-${card.id}`}
                            card={card}
                            compact
                            statusText="memoria e cultura"
                          />
                        ))}
                      </div>
                    </div>

                    <div data-testid="cidade-audit-lote04-board">
                      <CidadeDeAcoTerritoryView
                        name="Memoria em Luta"
                        subtitle="Arquivo vivo, cultura e presenca coletiva."
                        upgradeName="Memoria em Luta"
                        upgradeText="Quando suas cartas saem daqui, compre 1 carta."
                        upgradedFor="player"
                        playerWins={2}
                        botWins={1}
                        playerCrisis={0}
                        botCrisis={0}
                        playerPower={8}
                        botPower={7}
                        lastWinner="player"
                        leaderText="greve e capoeira leem como memoria ativa, nao bloco solto"
                        playHint={null}
                        playerCards={[
                          { id: "audit-lote04-board-aco_008", card: getAuditCard("aco_008"), power: 4, isBuffed: true },
                          { id: "audit-lote04-board-aco_007", card: getAuditCard("aco_007"), power: 4 },
                        ]}
                        botCards={[
                          { id: "audit-lote04-board-rio_005", card: getAuditCard("rio_005"), power: 4 },
                          { id: "audit-lote04-board-rio_007", card: getAuditCard("rio_007"), power: 3 },
                        ]}
                      />
                    </div>
                  </>
                ) : null}

                {auditCohesionAcoCards.length > 0 && auditCohesionRioCards.length > 0 ? (
                  <div
                    data-testid="cidade-audit-coesao-geral"
                    className="rounded-[1.5rem] border border-[#5d543f] bg-[linear-gradient(180deg,rgba(20,21,24,0.98),rgba(8,9,10,0.98))] p-4"
                  >
                    <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#b9b1a6]">
                      coesao geral
                    </div>
                    <div className="mt-1 text-sm font-bold text-[#d7d0c4]">
                      Amostra cruzada dos quatro lotes para verificar se o jogo ja funciona como card game unico e nao como colecao solta de imagens.
                    </div>

                    <div className="mt-4">
                      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#f2a900]">
                        aco & memoria
                      </div>
                      <div className="mt-3 flex flex-wrap gap-3">
                        {auditCohesionAcoCards.map((card) => (
                          <CidadeDeAcoCardView
                            key={`audit-coesao-aco-${card.id}`}
                            card={card}
                            compact
                            statusText="amostra"
                          />
                        ))}
                      </div>
                    </div>

                    <div className="mt-5">
                      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#2ac7c4]">
                        rio & rua
                      </div>
                      <div className="mt-3 flex flex-wrap gap-3">
                        {auditCohesionRioCards.map((card) => (
                          <CidadeDeAcoCardView
                            key={`audit-coesao-rio-${card.id}`}
                            card={card}
                            compact
                            statusText="amostra"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}

                {auditReleaseAcoCards.length > 0 ? (
                  <div
                    data-testid="cidade-audit-rc-aco-hand"
                    className="rounded-[1.5rem] border border-[#5d543f] bg-[linear-gradient(180deg,rgba(20,21,24,0.98),rgba(8,9,10,0.98))] p-4"
                  >
                    <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#b9b1a6]">
                      release candidate - deck aco & memoria
                    </div>
                    <div className="mt-1 text-sm font-bold text-[#d7d0c4]">
                      Mao completa para validar leitura mobile, contraste, cartas claras/escuras e estados de selecao e sem folego.
                    </div>
                    <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                      {auditReleaseAcoCards.map((card) => {
                        const selected = card.id === "aco_008";
                        const affordable = !["aco_010", "aco_012"].includes(card.id);
                        const statusText = !card.artPath
                          ? "fallback visual"
                          : selected
                            ? "selecionada"
                            : affordable
                              ? `custa ${Math.min(card.cost, 3)}`
                              : `sem folego: precisa de ${card.cost}`;

                        return (
                          <CidadeDeAcoCardView
                            key={`audit-rc-aco-${card.id}`}
                            card={card}
                            compact
                            selected={selected}
                            dimmed={!affordable}
                            affordable={affordable}
                            statusText={statusText}
                          />
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                {auditReleaseRioCards.length > 0 ? (
                  <div
                    data-testid="cidade-audit-rc-rio-hand"
                    className="rounded-[1.5rem] border border-[#5d543f] bg-[linear-gradient(180deg,rgba(20,21,24,0.98),rgba(8,9,10,0.98))] p-4"
                  >
                    <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#b9b1a6]">
                      release candidate - deck rio & rua
                    </div>
                    <div className="mt-1 text-sm font-bold text-[#d7d0c4]">
                      Mao completa com landmark real, fotos comunitarias, carta clara, carta escura e crise territorial sem fallback visual.
                    </div>
                    <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                      {auditReleaseRioCards.map((card) => {
                        const selected = card.id === "rio_005";
                        const affordable = !["rio_006", "rio_012"].includes(card.id);
                        const statusText = !card.artPath
                          ? "fallback visual"
                          : selected
                            ? "selecionada"
                            : affordable
                              ? `custa ${Math.min(card.cost, 3)}`
                              : `sem folego: precisa de ${card.cost}`;

                        return (
                          <CidadeDeAcoCardView
                            key={`audit-rc-rio-${card.id}`}
                            card={card}
                            compact
                            selected={selected}
                            dimmed={!affordable}
                            affordable={affordable}
                            statusText={statusText}
                          />
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                <div data-testid="cidade-audit-rc-aco-board">
                  <CidadeDeAcoTerritoryView
                    name="Praca Brasil"
                    subtitle="Concreto, encontro e disputa de centro."
                    upgradeName="Praca Brasil Ocupada"
                    upgradeText="Acoes Coletivas custam -1 aqui."
                    upgradedFor="player"
                    playerWins={2}
                    botWins={1}
                    playerCrisis={0}
                    botCrisis={1}
                    playerPower={10}
                    botPower={7}
                    selected
                    lastWinner="player"
                    leaderText="aco & memoria segura leitura forte em mini, mas ainda depende de crop fino em algumas fotos historicas"
                    playHint="carta selecionada, miniaturas ativas e leitura de contraste em tabuleiro mobile"
                    playerCards={[
                      { id: "audit-rc-board-aco_003", card: getAuditCard("aco_003"), power: 5 },
                      { id: "audit-rc-board-aco_006", card: getAuditCard("aco_006"), power: 4, isBuffed: true },
                      { id: "audit-rc-board-aco_008", card: getAuditCard("aco_008"), power: 4 },
                    ]}
                    botCards={[
                      { id: "audit-rc-board-rio_001", card: getAuditCard("rio_001"), power: 3 },
                      { id: "audit-rc-board-rio_012", card: getAuditCard("rio_012"), power: 2 },
                    ]}
                  />
                </div>

                <div data-testid="cidade-audit-rc-rio-board">
                  <CidadeDeAcoTerritoryView
                    name="Rio Paraiba"
                    subtitle="Fluxo, margem e recuperacao."
                    upgradeName="Rio em Recuperacao"
                    upgradeText="Remove 1 Crise sua no inicio da rodada."
                    upgradedFor="player"
                    playerWins={2}
                    botWins={0}
                    playerCrisis={0}
                    botCrisis={1}
                    playerPower={9}
                    botPower={6}
                    selected
                    lastWinner="player"
                    leaderText="rio & rua fecha o deck; o restante aqui e curadoria fina de miniatura e cartas sensiveis"
                    playHint="cartas claras, rua, rio e crise territorial convivendo no mesmo tabuleiro mobile"
                    playerCards={[
                      { id: "audit-rc-board-rio_001b", card: getAuditCard("rio_001"), power: 3 },
                      { id: "audit-rc-board-rio_005", card: getAuditCard("rio_005"), power: 5, isBuffed: true },
                      { id: "audit-rc-board-rio_010", card: getAuditCard("rio_010"), power: 3 },
                    ]}
                    botCards={[
                      { id: "audit-rc-board-aco_011", card: getAuditCard("aco_011"), power: 2 },
                      { id: "audit-rc-board-aco_012", card: getAuditCard("aco_012"), power: 4 },
                    ]}
                  />
                </div>

                <div
                  data-testid="cidade-audit-rc-mini-cards"
                  className="rounded-[1.5rem] border border-[#5d543f] bg-[linear-gradient(180deg,rgba(20,21,24,0.98),rgba(8,9,10,0.98))] p-4"
                >
                  <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#b9b1a6]">
                    miniaturas criticas
                  </div>
                  <div className="mt-1 text-sm font-bold text-[#d7d0c4]">
                    Amostra de miniaturas com `cover`, `contain`, foto real e composicao para decidir release candidate sem perder leitura mobile.
                  </div>
                  <div className="mt-4">
                    <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#f2a900]">
                      aco & memoria
                    </div>
                    <div className="mt-3 flex flex-wrap gap-3">
                      {["aco_004", "aco_006", "aco_007", "aco_008", "aco_010", "aco_012"].map((cardId) => (
                        <CidadeDeAcoCardView
                          key={`audit-rc-mini-${cardId}`}
                          card={getAuditCard(cardId)}
                          compact
                          mini
                          statusText="mini"
                        />
                      ))}
                    </div>
                  </div>
                  <div className="mt-5">
                      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#2ac7c4]">
                        rio & rua
                      </div>
                      <div className="mt-3 flex flex-wrap gap-3">
                        {["rio_001", "rio_005", "rio_006", "rio_008", "rio_010", "rio_012"].map((cardId) => (
                        <CidadeDeAcoCardView
                            key={`audit-rc-mini-${cardId}`}
                            card={getAuditCard(cardId)}
                            compact
                            mini
                            statusText="mini"
                          />
                        ))}
                      </div>
                    </div>
                </div>

                <div
                  data-testid="cidade-audit-rc-release"
                  className="rounded-[1.5rem] border border-[#5d543f] bg-[linear-gradient(180deg,rgba(20,21,24,0.98),rgba(8,9,10,0.98))] p-4"
                >
                  <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#b9b1a6]">
                    release candidate visual
                  </div>
                  <div className="mt-1 text-sm font-bold text-[#d7d0c4]">
                    Diagnostico consolidado do baralho: deck coeso, leitura mobile viavel e pendencias concentradas em poucas cartas com ressalva editorial.
                  </div>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-[1.1rem] border border-[#f2a900]/18 bg-[#1a1712] p-3">
                      <div className="text-[9px] font-black uppercase tracking-[0.16em] text-[#f2d8a0]">
                        aco & memoria
                      </div>
                      <div className="mt-2 flex flex-wrap gap-3">
                        {["aco_005", "aco_008", "aco_010"].map((cardId) => (
                          <CidadeDeAcoCardView
                            key={`audit-rc-release-aco-${cardId}`}
                            card={getAuditCard(cardId)}
                            compact
                            mini
                            statusText="release"
                          />
                        ))}
                      </div>
                    </div>
                    <div className="rounded-[1.1rem] border border-[#2ac7c4]/18 bg-[#121d21] p-3">
                      <div className="text-[9px] font-black uppercase tracking-[0.16em] text-[#97efea]">
                        rio & rua
                      </div>
                      <div className="mt-2 flex flex-wrap gap-3">
                        {["rio_001", "rio_005", "rio_008"].map((cardId) => (
                          <CidadeDeAcoCardView
                            key={`audit-rc-release-rio-${cardId}`}
                            card={getAuditCard(cardId)}
                            compact
                            mini
                            statusText="release"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-[#2ac7c4]/20 bg-[#102126] px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-[#baf5f2]">
                      deck completo funciona em mobile
                    </div>
                    <div className="rounded-xl border border-[#f2a900]/20 bg-[#201911] px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-[#f2d8a0]">
                      ajustes finos ainda valem para miniaturas historicas
                    </div>
                    <div className="rounded-xl border border-[#ff7e4e]/20 bg-[#261713] px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-[#ffb39b]">
                      sem fallback visual no baralho integrado
                    </div>
                  </div>
                </div>

                <div
                  data-testid="cidade-audit-rio012-hand"
                  className="rounded-[1.5rem] border border-[#5d543f] bg-[linear-gradient(180deg,rgba(20,21,24,0.98),rgba(8,9,10,0.98))] p-4"
                >
                  <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#b9b1a6]">
                    rio_012 - chuva de po
                  </div>
                  <div className="mt-1 text-sm font-bold text-[#d7d0c4]">
                    Revisao isolada da carta na mao e em mini: carro, varal, telhado e po fino precisam continuar legiveis sem virar drama apocaliptico.
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <CidadeDeAcoCardView
                      card={auditRio012Card}
                      compact
                      selected
                      statusText="selecionada"
                    />
                    <CidadeDeAcoCardView
                      card={auditRio012Card}
                      compact
                      dimmed
                      affordable={false}
                      statusText="sem folego: precisa de 2"
                    />
                    <CidadeDeAcoCardView
                      card={auditRio012Card}
                      compact
                      mini
                      statusText="mini"
                    />
                  </div>
                </div>

                <div data-testid="cidade-audit-rio012-board">
                  <CidadeDeAcoTerritoryView
                    name="Rio Paraiba"
                    subtitle="Fluxo, margem e recuperacao."
                    upgradeName="Rio em Recuperacao"
                    upgradeText="Remove 1 Crise sua no inicio da rodada."
                    upgradedFor="player"
                    playerWins={1}
                    botWins={1}
                    playerCrisis={0}
                    botCrisis={1}
                    playerPower={8}
                    botPower={6}
                    selected
                    lastWinner="tie"
                    leaderText="po fino, carro, varal e bairro seguem legiveis no territorio sem catastrofe cenografica"
                    playHint="revisao de crise, contraste e miniatura de rua sob poluicao cotidiana"
                    playerCards={[
                      { id: "audit-rio012-board-rio_012", card: auditRio012Card, power: 3 },
                      { id: "audit-rio012-board-rio_001", card: getAuditCard("rio_001"), power: 3 },
                      { id: "audit-rio012-board-rio_011", card: getAuditCard("rio_011"), power: 2, isBuffed: true },
                    ]}
                    botCards={[
                      { id: "audit-rio012-board-aco_011", card: getAuditCard("aco_011"), power: 2 },
                      { id: "audit-rio012-board-aco_006", card: getAuditCard("aco_006"), power: 3 },
                    ]}
                  />
                </div>

                {auditApprovedNotesCards.length > 0 ? (
                  <div
                    data-testid="cidade-audit-approved-notes-review"
                    className="rounded-[1.5rem] border border-[#5d543f] bg-[linear-gradient(180deg,rgba(20,21,24,0.98),rgba(8,9,10,0.98))] p-4"
                  >
                    <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#b9b1a6]">
                      curadoria final das ressalvas
                    </div>
                    <div className="mt-1 text-sm font-bold text-[#d7d0c4]">
                      Revisao rapida das cartas antes mantidas em `approved_with_notes`: landmark vertical, memoria historica, crise escura e cartas culturais sensiveis.
                    </div>
                    <div className="mt-4">
                      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#f2a900]">
                        aco & memoria
                      </div>
                      <div className="mt-3 flex flex-wrap gap-3">
                        {["aco_004", "aco_006", "aco_008", "aco_011", "aco_012"].map((cardId) => (
                          <CidadeDeAcoCardView
                            key={`audit-approved-${cardId}`}
                            card={getAuditCard(cardId)}
                            compact
                            mini
                            statusText="revisao final"
                          />
                        ))}
                      </div>
                    </div>
                    <div className="mt-5">
                      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#2ac7c4]">
                        rio & rua
                      </div>
                      <div className="mt-3 flex flex-wrap gap-3">
                        {["rio_005", "rio_006", "rio_009", "rio_011"].map((cardId) => (
                          <CidadeDeAcoCardView
                            key={`audit-approved-${cardId}`}
                            card={getAuditCard(cardId)}
                            compact
                            mini
                            statusText="revisao final"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}

                <div
                  data-testid="cidade-audit-final-deck"
                  className="rounded-[1.5rem] border border-[#5d543f] bg-[linear-gradient(180deg,rgba(20,21,24,0.98),rgba(8,9,10,0.98))] p-4"
                >
                  <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#b9b1a6]">
                    fechamento visual do baralho
                  </div>
                  <div className="mt-1 text-sm font-bold text-[#d7d0c4]">
                    Painel final do deck completo depois da integracao de `rio_012`: sem fallback visual, com Aco & Memoria e Rio & Rua convivendo no mesmo produto.
                  </div>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-[1.1rem] border border-[#f2a900]/18 bg-[#1a1712] p-3">
                      <div className="text-[9px] font-black uppercase tracking-[0.16em] text-[#f2d8a0]">
                        aco & memoria
                      </div>
                      <div className="mt-2 flex flex-wrap gap-3">
                        {["aco_006", "aco_008", "aco_011", "aco_012"].map((cardId) => (
                          <CidadeDeAcoCardView
                            key={`audit-final-aco-${cardId}`}
                            card={getAuditCard(cardId)}
                            compact
                            mini
                            statusText="final"
                          />
                        ))}
                      </div>
                    </div>
                    <div className="rounded-[1.1rem] border border-[#2ac7c4]/18 bg-[#121d21] p-3">
                      <div className="text-[9px] font-black uppercase tracking-[0.16em] text-[#97efea]">
                        rio & rua
                      </div>
                      <div className="mt-2 flex flex-wrap gap-3">
                        {["rio_005", "rio_006", "rio_011", "rio_012"].map((cardId) => (
                          <CidadeDeAcoCardView
                            key={`audit-final-rio-${cardId}`}
                            card={getAuditCard(cardId)}
                            compact
                            mini
                            statusText="final"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-[#2ac7c4]/20 bg-[#102126] px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-[#baf5f2]">
                      rio_012 integrado
                    </div>
                    <div className="rounded-xl border border-[#f2a900]/20 bg-[#201911] px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-[#f2d8a0]">
                      curadoria final das ressalvas em curso
                    </div>
                    <div className="rounded-xl border border-[#ff7e4e]/20 bg-[#261713] px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-[#ffb39b]">
                      deck sem fallback visual
                    </div>
                  </div>
                </div>

                <div
                  data-testid="cidade-audit-parque-inga"
                  className="rounded-[1.5rem] border border-[#5d543f] bg-[linear-gradient(180deg,rgba(20,21,24,0.98),rgba(8,9,10,0.98))] p-4"
                >
                  <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#b9b1a6]">
                    parque do inga
                  </div>
                  <div className="mt-1 text-sm font-bold text-[#d7d0c4]">
                    Comparacao rapida da leitura do landmark em tamanho normal e mini sem trocar a foto oficial atual.
                  </div>
                  <div className="mt-4 flex flex-wrap gap-4">
                    <CidadeDeAcoCardView
                      card={getAuditCard("rio_006")}
                      compact
                      statusText="foto oficial atual"
                    />
                    <CidadeDeAcoCardView
                      card={getAuditCard("rio_006")}
                      compact
                      mini
                      statusText="mini"
                    />
                  </div>
                </div>
              </div>
            ) : null}

            {match.finished ? (
              <div data-testid="cidade-result-panel" className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#b8afa2]">
                      resultado final
                    </div>
                    <h2
                      className={`mt-2 text-3xl font-black uppercase leading-tight sm:text-4xl ${
                        match.winner === "player"
                          ? "text-[#2ac7c4]"
                          : match.winner === "bot"
                            ? "text-[#ff7e4e]"
                            : "text-[#f2a900]"
                      }`}
                    >
                      {resultTitle}
                    </h2>
                    <p className="mt-2 text-sm font-bold leading-relaxed text-[#ddd5c9]">{resultStateLine}</p>
                  </div>
                  <div
                    className={`rounded-2xl border border-white/10 bg-black/25 px-4 py-3 ${
                      finalScore >= bestScore ? "city-kpi-rise" : ""
                    }`}
                  >
                    <div className="text-[10px] font-black uppercase tracking-[0.16em] text-[#b8afa2]">
                      score territorial
                    </div>
                    <div className="mt-2 text-4xl font-black text-[#f7f1df]">{finalScore}</div>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-[#f2a900]/16 bg-[#1a1712] px-4 py-3 text-sm font-bold leading-relaxed text-[#f2ddac]">
                  {resultNarrative}
                </div>
                <div className="mt-3 rounded-2xl border border-[#2ac7c4]/16 bg-[#102126] px-4 py-3 text-[11px] font-black uppercase tracking-[0.14em] text-[#baf5f2]">
                  {resultImpactLine}
                </div>
                <div className="mt-3 rounded-2xl border border-white/10 bg-black/15 px-4 py-3 text-[11px] font-black uppercase tracking-[0.14em] text-[#d7d0c4]">
                  {resultSummary}
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-[#f2a900]/18 bg-[#201911] px-4 py-3 text-[10px] font-black uppercase tracking-[0.14em] text-[#f2d8a0]">
                    deck usado: {playerDeckMeta?.title ?? "Deck"}
                  </div>
                  <div className="rounded-2xl border border-[#2ac7c4]/18 bg-[#102126] px-4 py-3 text-[10px] font-black uppercase tracking-[0.14em] text-[#baf5f2]">
                    cidade viva final: {match.playerInfluence}
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/15 px-4 py-3 text-[10px] font-black uppercase tracking-[0.14em] text-[#d7d0c4]">
                    chamada: segura vr melhor?
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
                    <div className="text-[10px] font-black uppercase tracking-[0.14em] text-[#b9b1a6]">
                      cidade viva
                    </div>
                    <div className="mt-2 text-3xl font-black">{match.playerInfluence} x {match.botInfluence}</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
                    <div className="text-[10px] font-black uppercase tracking-[0.14em] text-[#b9b1a6]">
                      territorios ganhos
                    </div>
                    <div className="mt-2 text-3xl font-black">{match.territoriesWon.player}</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
                    <div className="text-[10px] font-black uppercase tracking-[0.14em] text-[#b9b1a6]">
                      recorde local
                    </div>
                    <div className="mt-2 text-3xl font-black">{bestScore}</div>
                  </div>
                </div>

                {resultImageUrl ? (
                  <div data-testid="cidade-result-share-card" className="mt-5 overflow-hidden rounded-[1.4rem] border border-white/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={resultImageUrl} alt="Card de resultado Cidade de Aco" className="block w-full" />
                  </div>
                ) : null}

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={handleReplay}
                    className="rounded-2xl border border-[#2ac7c4]/22 bg-[#102126] px-4 py-3 text-[11px] font-black uppercase tracking-[0.16em] text-[#baf5f2]"
                  >
                    Jogar de novo
                  </button>
                  <button
                    type="button"
                    onClick={handleResetToDecks}
                    className="rounded-2xl border border-white/10 bg-black/15 px-4 py-3 text-[11px] font-black uppercase tracking-[0.16em] text-[#f7f1df]"
                  >
                    Trocar deck
                  </button>
                  <button
                    type="button"
                    onClick={handleShare}
                    className="rounded-2xl border border-[#f2a900]/22 bg-[#241b10] px-4 py-3 text-[11px] font-black uppercase tracking-[0.16em] text-[#ffd86a] shadow-[0_0_0_1px_rgba(242,169,0,0.08),0_16px_28px_rgba(0,0,0,0.18)]"
                  >
                    {copyLabel}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    window.location.href = `/ranking/${game.slug}`;
                  }}
                  className="mt-3 w-full rounded-2xl border border-white/10 bg-black/15 px-4 py-3 text-[11px] font-black uppercase tracking-[0.16em] text-[#d7d0c4]"
                >
                  Ver ranking
                </button>
              </div>
            ) : null}

            {shareToast ? (
              <div
                data-testid="cidade-share-toast"
                className={`city-toast-in fixed inset-x-4 bottom-4 z-30 mx-auto max-w-sm rounded-2xl border px-4 py-3 text-center text-[11px] font-black uppercase tracking-[0.14em] shadow-[0_18px_40px_rgba(0,0,0,0.34)] ${
                  shareToast.tone === "success"
                    ? "border-[#2ac7c4]/24 bg-[#102126] text-[#baf5f2]"
                    : "border-[#ff7e4e]/24 bg-[#261713] text-[#ffb39b]"
                }`}
              >
                {shareToast.text}
              </div>
            ) : null}

            <PortalGameRail currentSlug={game.slug} />
          </section>
        )}
      </div>
    </main>
  );
}
