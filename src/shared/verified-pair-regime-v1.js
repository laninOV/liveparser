(function installLvrVerifiedPairRegimeV1(root) {
  "use strict";

  const startRule = root && root.LvrStartMatchRule
    || (typeof require === "function" ? require("./start-match-rule.js") : null);
  if (!startRule || !startRule.FORMULA_ID) {
    throw new Error("LvrStartMatchRule must be loaded before LvrVerifiedPairRegimeV1");
  }
  const PROTOCOL = Object.freeze({
    schemaVersion: 13,
    id: "start-z0-market-consensus-quality-v13-2026-08-03",
    gateId: "pbp-or-market-consensus-quality-v3",
    selectorFormulaId: startRule.FORMULA_ID,
    target: "player-takes-two-or-more-sets",
    registeredAt: "2026-08-03T00:00:00Z",
    targetEligible: 300,
    minimumReviewSettled: 150,
    productionLeagues: Object.freeze(["setka", "czech"]),
    rules: Object.freeze({
      pointWindow: "same common selector window: 5, otherwise 3",
      gate: "the frozen moderate PBP gate is the base fallback; a rejected match is restored only when causal opening match-result odds agree with Z0 at normalized favorite probability 0.55 or higher",
      quality: "reject a three-match PBP fallback collected in 60 seconds or more, and reject an absolute Z0 margin below 10",
      side: "use frozen Z0 by default; causal opening match-result favorite replaces it only at normalized favorite probability 0.60 or higher",
      currentScore: "not used for the gate or the final side; live state only confirms that the first set is still in progress"
    })
  });

  const THRESHOLDS = Object.freeze({
    combinedCollapseMaximum: 4,
    strongSelectedStrengthEdgeMinimum: 15,
    historySetShareMatches: 8,
    selectedHistorySetShareMinimum: 61.5,
    relativeFormHistoryMatches: 8,
    relativeSetShareMatches: 5,
    selectedFiveMatchSetShareEdgeMinimum: 10,
    rejectedRelativeAgreementScore: 2.5,
    marketSalvageFavoriteProbabilityMinimum: 0.55,
    marketSideOverrideFavoriteProbabilityMinimum: 0.6,
    slowThreeMatchWindowCollectionLatencyRejectAtMs: 60 * 1000,
    minimumAbsoluteZ0Score: 10
  });

  function finiteOrNull(value) {
    if (value === null || value === undefined || value === "") return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function normalizeLeagueName(value) {
    return String(value || "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase()
      .replace(/^настольный\s+теннис\s*[-–—]\s*/i, "")
      .trim();
  }

  function classifyLeague(value) {
    const name = normalizeLeagueName(value);
    if (/^(?:кубок\s+сетки|setka\s+cup)$/i.test(name)) return "setka";
    if (
      /^чехия\s*[-–—]?\s*про\s+лига$/i.test(name)
      || /^czech(?:ia)?\s+(?:pro\s+league|liga\s+pro)$/i.test(name)
    ) {
      return "czech";
    }
    if (/^(?:тт|tt)\s+cup$/i.test(name)) return "tt-cup-shadow";
    return "blocked";
  }

  function readWindow(profile, group, size) {
    const windows = profile && profile[group] && profile[group].windows;
    return windows && (windows[size] || windows[String(size)]) || null;
  }

  function readSideMetrics(profile, pointWindowSize) {
    const point = readWindow(profile, "point", pointWindowSize);
    const pointMatches = finiteOrNull(point && point.matches);
    return {
      collapseCount: finiteOrNull(point && point.collapseCount),
      strengthScore: finiteOrNull(point && point.strengthScore),
      pointMatches
    };
  }

  function readHistorySignals(profile) {
    const history = profile && profile.history;
    const fiveMatchWindow = readWindow(profile, "history", THRESHOLDS.relativeSetShareMatches);
    const eightMatchWindow = readWindow(profile, "history", THRESHOLDS.relativeFormHistoryMatches);
    return {
      historyMatches: finiteOrNull(history && history.matches),
      freshForm3Score: finiteOrNull(history && history.freshForm3Score),
      fiveMatchWindowMatches: finiteOrNull(fiveMatchWindow && fiveMatchWindow.matches),
      fiveMatchSetSharePct: finiteOrNull(fiveMatchWindow && fiveMatchWindow.setSharePct),
      eightMatchWindowMatches: finiteOrNull(eightMatchWindow && eightMatchWindow.matches),
      eightMatchSetSharePct: finiteOrNull(eightMatchWindow && eightMatchWindow.setSharePct),
      eightMatchPerformancePct: finiteOrNull(eightMatchWindow && eightMatchWindow.performancePct)
    };
  }

  function hashPayload(value) {
    const text = JSON.stringify(value);
    let hash = 0x811c9dc5;
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 0x01000193) >>> 0;
    }
    return `fnv1a32-${hash.toString(16).padStart(8, "0")}`;
  }

  function round(value, digits = 6) {
    const number = finiteOrNull(value);
    if (number === null) return null;
    const factor = 10 ** digits;
    return Math.round(number * factor) / factor;
  }

  function normalizeMarketToken(value) {
    return String(value || "")
      .replace(/\s+/g, "")
      .replace(/[-_]/g, "")
      .trim()
      .toLowerCase();
  }

  function readCausalOpeningMarket(value, decisionAtValue) {
    const source = value && typeof value === "object" ? value : {};
    const decisionAt = finiteOrNull(decisionAtValue);
    const observedAt = finiteOrNull(source.observedAt);
    const leftOdds = finiteOrNull(source.leftOdds);
    const rightOdds = finiteOrNull(source.rightOdds);
    const marketTypeReady = normalizeMarketToken(source.marketType) === "matchresult";
    const quoteSourceReady = normalizeMarketToken(source.quoteSource) === "opening";
    const statusReady = normalizeMarketToken(source.status) === "ready";
    const usageToken = normalizeMarketToken(source.usage);
    const retrospective = source.modelInput === false
      || source.retrospective === true
      || source.backfilled === true
      || source.backfill === true
      || source.isBackfilled === true
      || source.historicalBackfill === true
      || finiteOrNull(source.backfilledAt) > 0
      || Boolean(usageToken && usageToken !== "modelinput");
    const oddsReady = leftOdds !== null && leftOdds > 1
      && rightOdds !== null && rightOdds > 1;
    const observationReady = observedAt !== null && observedAt > 0;
    const decisionReady = decisionAt !== null && decisionAt > 0;
    const causal = observationReady && decisionReady && observedAt <= decisionAt;
    const marketReady = marketTypeReady
      && quoteSourceReady
      && statusReady
      && !retrospective
      && oddsReady
      && causal;
    const rawLeftProbability = marketReady ? 1 / leftOdds : null;
    const rawRightProbability = marketReady ? 1 / rightOdds : null;
    const probabilityTotal = marketReady ? rawLeftProbability + rawRightProbability : null;
    const leftImpliedProbability = probabilityTotal > 0
      ? rawLeftProbability / probabilityTotal
      : null;
    const rightImpliedProbability = probabilityTotal > 0
      ? rawRightProbability / probabilityTotal
      : null;
    const tied = marketReady
      && Math.abs(leftImpliedProbability - rightImpliedProbability) <= 1e-12;
    const favoriteSideIndex = !marketReady || tied
      ? null
      : leftImpliedProbability > rightImpliedProbability ? 0 : 1;
    const favoriteProbability = favoriteSideIndex === null
      ? marketReady ? 0.5 : null
      : favoriteSideIndex === 0 ? leftImpliedProbability : rightImpliedProbability;

    let reason = "opening-market-ready";
    if (!value || typeof value !== "object") reason = "opening-market-missing";
    else if (!marketTypeReady) reason = "opening-market-type-invalid";
    else if (!quoteSourceReady) reason = "opening-market-source-invalid";
    else if (!statusReady) reason = "opening-market-status-invalid";
    else if (retrospective) reason = "opening-market-retrospective-not-allowed";
    else if (!oddsReady) reason = "opening-market-odds-invalid";
    else if (!observationReady) reason = "opening-market-observed-at-invalid";
    else if (!decisionReady) reason = "opening-market-decision-at-invalid";
    else if (!causal) reason = "opening-market-observed-after-decision";
    else if (tied) reason = "opening-market-tie";

    const marketSnapshot = Object.freeze({
      marketType: marketTypeReady ? "matchResult" : String(source.marketType || ""),
      quoteSource: quoteSourceReady ? "opening" : String(source.quoteSource || ""),
      status: marketReady ? "ready" : String(source.status || ""),
      usage: marketReady ? "model-input" : String(source.usage || ""),
      modelInput: marketReady || source.modelInput === true,
      retrospective,
      leftOdds: round(leftOdds),
      rightOdds: round(rightOdds),
      observedAt: round(observedAt, 3),
      decisionAt: round(decisionAt, 3),
      leftImpliedProbability: round(leftImpliedProbability, 9),
      rightImpliedProbability: round(rightImpliedProbability, 9),
      favoriteSideIndex,
      favoriteProbability: round(favoriteProbability, 9),
      marketReady,
      reason
    });
    return {
      marketReady,
      reason,
      marketType: marketSnapshot.marketType,
      quoteSource: marketSnapshot.quoteSource,
      observedAt,
      decisionAt,
      leftOdds,
      rightOdds,
      leftImpliedProbability,
      rightImpliedProbability,
      favoriteSideIndex,
      favoriteProbability,
      marketSnapshot
    };
  }

  function evaluate(input = {}) {
    const profiles = Array.isArray(input.profiles) ? input.profiles.slice(0, 2) : [];
    const baseSelectedSideIndex = input.selectedSideIndex === 0 || input.selectedSideIndex === 1
      ? input.selectedSideIndex
      : null;
    const market = readCausalOpeningMarket(input.moneylineMarket, input.decisionAt);
    const marketStrongFavorite = Boolean(
      market.marketReady
      && market.favoriteSideIndex !== null
      && market.favoriteProbability >= THRESHOLDS.marketSideOverrideFavoriteProbabilityMinimum
    );
    const selectedSideIndex = marketStrongFavorite
      ? market.favoriteSideIndex
      : baseSelectedSideIndex;
    const marketSideOverrideApplied = Boolean(
      marketStrongFavorite
      && baseSelectedSideIndex !== null
      && market.favoriteSideIndex !== baseSelectedSideIndex
    );
    const marketSalvageAccepted = Boolean(
      market.marketReady
      && baseSelectedSideIndex !== null
      && market.favoriteSideIndex === baseSelectedSideIndex
      && market.favoriteProbability >= THRESHOLDS.marketSalvageFavoriteProbabilityMinimum
    );
    const pointWindowSize = Number(input.pointWindowSize);
    const relativeAgreementScore = finiteOrNull(input.relativeAgreementScore);
    const latestPbpReversal = input.latestPbpReversal === true;
    const collectionLatencyMs = finiteOrNull(input.collectionLatencyMs);
    const z0Score = finiteOrNull(input.z0Score);
    const absoluteZ0Score = z0Score === null ? null : Math.abs(z0Score);
    const leagueClass = classifyLeague(input.leagueName);
    const productionLeague = PROTOCOL.productionLeagues.includes(leagueClass);
    const shadowOnly = leagueClass === "tt-cup-shadow";
    const windowReady = pointWindowSize === 5 || pointWindowSize === 3;
    const metrics = profiles.map((profile) => readSideMetrics(profile, pointWindowSize));
    const metricsReady = profiles.length === 2
      && baseSelectedSideIndex !== null
      && windowReady
      && metrics.length === 2
      && metrics.every((side) => (
        side.collapseCount !== null
        && Number.isInteger(side.collapseCount)
        && side.collapseCount >= 0
        && side.strengthScore !== null
        && side.pointMatches !== null
        && side.pointMatches >= pointWindowSize
      ));
    const left = metricsReady ? metrics[0] : null;
    const right = metricsReady ? metrics[1] : null;
    const leftCollapseCount = left ? left.collapseCount : null;
    const rightCollapseCount = right ? right.collapseCount : null;
    const collapseSum = metricsReady ? leftCollapseCount + rightCollapseCount : null;
    const collapseDifference = metricsReady
      ? Math.abs(leftCollapseCount - rightCollapseCount)
      : null;
    const historySignals = profiles.map(readHistorySignals);
    const selectedHistory = baseSelectedSideIndex === null ? null : historySignals[baseSelectedSideIndex];
    const opponentHistory = baseSelectedSideIndex === null ? null : historySignals[1 - baseSelectedSideIndex];
    const selectedHistoryWindowReady = Boolean(
      selectedHistory
      && selectedHistory.eightMatchWindowMatches >= THRESHOLDS.historySetShareMatches
      && selectedHistory.eightMatchSetSharePct !== null
    );
    const relativeHistoryWindowReady = Boolean(
      selectedHistory
      && opponentHistory
      && selectedHistory.fiveMatchWindowMatches >= THRESHOLDS.relativeSetShareMatches
      && opponentHistory.fiveMatchWindowMatches >= THRESHOLDS.relativeSetShareMatches
      && selectedHistory.eightMatchWindowMatches >= THRESHOLDS.relativeFormHistoryMatches
      && opponentHistory.eightMatchWindowMatches >= THRESHOLDS.relativeFormHistoryMatches
      && selectedHistory.freshForm3Score !== null
      && opponentHistory.freshForm3Score !== null
      && selectedHistory.fiveMatchSetSharePct !== null
      && opponentHistory.fiveMatchSetSharePct !== null
      && selectedHistory.eightMatchPerformancePct !== null
      && opponentHistory.eightMatchPerformancePct !== null
    );
    const selectedMetrics = metricsReady ? metrics[baseSelectedSideIndex] : null;
    const opponentMetrics = metricsReady ? metrics[1 - baseSelectedSideIndex] : null;
    const selectedStrengthScore = selectedMetrics ? selectedMetrics.strengthScore : null;
    const opponentStrengthScore = opponentMetrics ? opponentMetrics.strengthScore : null;
    const selectedStrengthEdge = metricsReady
      ? selectedStrengthScore - opponentStrengthScore
      : null;
    const sumWithinLimit = Boolean(
      metricsReady
      && collapseSum <= THRESHOLDS.combinedCollapseMaximum
    );
    const countsUnequal = Boolean(
      metricsReady
      && collapseDifference >= 1
    );
    const collapseAccepted = sumWithinLimit && countsUnequal;
    const strongSelectedStrengthException = Boolean(
      metricsReady
      && selectedStrengthEdge >= THRESHOLDS.strongSelectedStrengthEdgeMinimum
    );
    const selectedHistorySetShareException = Boolean(
      selectedHistoryWindowReady
      && selectedHistory.eightMatchSetSharePct >= THRESHOLDS.selectedHistorySetShareMinimum
    );
    const selectedFreshAtOrAboveHistory8 = Boolean(
      relativeHistoryWindowReady
      && selectedHistory.freshForm3Score >= selectedHistory.eightMatchPerformancePct
    );
    const opponentFreshAtOrAboveHistory8 = Boolean(
      relativeHistoryWindowReady
      && opponentHistory.freshForm3Score >= opponentHistory.eightMatchPerformancePct
    );
    const selectedHistory5SetShareEdge = relativeHistoryWindowReady
      ? selectedHistory.fiveMatchSetSharePct - opponentHistory.fiveMatchSetSharePct
      : null;
    const relativeFormSetShareException = Boolean(
      relativeHistoryWindowReady
      && selectedFreshAtOrAboveHistory8
      && opponentFreshAtOrAboveHistory8
      && selectedHistory5SetShareEdge >= THRESHOLDS.selectedFiveMatchSetShareEdgeMinimum
    );
    const formulaAccepted = collapseAccepted
      || strongSelectedStrengthException
      || selectedHistorySetShareException
      || relativeFormSetShareException;
    const rejectedByModerateTier = Boolean(
      formulaAccepted
      && collapseAccepted
      && relativeAgreementScore === THRESHOLDS.rejectedRelativeAgreementScore
    );
    const moderateAccepted = formulaAccepted && !rejectedByModerateTier;
    const qualityInputsReady = Boolean(
      collectionLatencyMs !== null
      && collectionLatencyMs >= 0
      && z0Score !== null
    );
    const slowThreeMatchWindowRejected = Boolean(
      qualityInputsReady
      && pointWindowSize === 3
      && collectionLatencyMs >= THRESHOLDS.slowThreeMatchWindowCollectionLatencyRejectAtMs
    );
    const lowZ0ConfidenceRejected = Boolean(
      qualityInputsReady
      && absoluteZ0Score < THRESHOLDS.minimumAbsoluteZ0Score
    );
    const qualityAccepted = Boolean(
      qualityInputsReady
      && !slowThreeMatchWindowRejected
      && !lowZ0ConfidenceRejected
    );
    const baseSignalMode = moderateAccepted
      ? "moderate"
      : marketSalvageAccepted
        ? "market-consensus"
        : "rejected";
    const signalMode = qualityAccepted ? baseSignalMode : "rejected";
    const dataReady = metricsReady && qualityInputsReady;
    const eligible = dataReady && productionLeague;
    const accepted = eligible
      && qualityAccepted
      && (moderateAccepted || marketSalvageAccepted);
    const inputHash = dataReady
      ? hashPayload({
          protocolId: PROTOCOL.id,
          selectorFormulaId: PROTOCOL.selectorFormulaId,
          baseSelectedSideIndex,
          selectedSideIndex,
          relativeAgreementScore,
          latestPbpReversal,
          pointWindowSize,
          collectionLatencyMs,
          z0Score,
          absoluteZ0Score,
          slowThreeMatchWindowRejected,
          lowZ0ConfidenceRejected,
          qualityAccepted,
          leagueClass,
          left,
          right,
          historySignals,
          marketSnapshot: market.marketSnapshot,
          marketSideOverrideApplied,
          marketSalvageAccepted
        })
      : "";

    let reason = "collapse-combination-rejected";
    if (profiles.length !== 2) reason = "collapse-profiles-missing";
    else if (baseSelectedSideIndex === null) reason = "collapse-selected-side-missing";
    else if (!windowReady) reason = "collapse-common-window-missing";
    else if (!metricsReady) reason = "collapse-metrics-missing";
    else if (!qualityInputsReady) reason = "production-quality-inputs-missing";
    else if (leagueClass === "blocked") reason = "collapse-league-blocked";
    else if (slowThreeMatchWindowRejected) reason = "production-slow-three-match-window-rejected";
    else if (lowZ0ConfidenceRejected) reason = "production-low-z0-confidence-rejected";
    else if (shadowOnly) reason = "tt-cup-shadow-only";
    else if (accepted && !moderateAccepted && marketSalvageAccepted) reason = "production-market-consensus-salvage-qualified";
    else if (formulaAccepted && rejectedByModerateTier) reason = "production-relative-agreement-rejected";
    else if (accepted && collapseAccepted) reason = "production-collapse-qualified";
    else if (accepted && strongSelectedStrengthException) reason = "production-strength-exception-qualified";
    else if (accepted && selectedHistorySetShareException) reason = "production-history-share-exception-qualified";
    else if (accepted && relativeFormSetShareException) reason = "production-relative-form-exception-qualified";
    else reason = "production-combination-rejected";

    return {
      schemaVersion: PROTOCOL.schemaVersion,
      protocolId: PROTOCOL.id,
      gateId: PROTOCOL.gateId,
      selectorFormulaId: PROTOCOL.selectorFormulaId,
      target: PROTOCOL.target,
      baseSelectedSideIndex,
      selectedSideIndex,
      pointWindowSize: windowReady ? pointWindowSize : null,
      leagueClass,
      productionLeague,
      shadowOnly,
      dataReady,
      eligible,
      formulaAccepted,
      moderateAccepted,
      rejectedByModerateTier,
      qualityInputsReady,
      collectionLatencyMs: round(collectionLatencyMs, 3),
      z0Score: round(z0Score),
      absoluteZ0Score: round(absoluteZ0Score),
      slowThreeMatchWindowRejected,
      lowZ0ConfidenceRejected,
      qualityAccepted,
      signalMode,
      accepted,
      reason,
      marketReady: market.marketReady,
      marketReason: market.reason,
      marketType: market.marketType,
      marketQuoteSource: market.quoteSource,
      marketObservedAt: round(market.observedAt, 3),
      marketDecisionAt: round(market.decisionAt, 3),
      marketLeftOdds: round(market.leftOdds),
      marketRightOdds: round(market.rightOdds),
      marketLeftImpliedProbability: round(market.leftImpliedProbability, 9),
      marketRightImpliedProbability: round(market.rightImpliedProbability, 9),
      marketFavoriteSideIndex: market.favoriteSideIndex,
      marketFavoriteProbability: round(market.favoriteProbability, 9),
      marketSideOverrideApplied,
      marketSalvageAccepted,
      marketSnapshot: market.marketSnapshot,
      leftCollapseCount: round(leftCollapseCount),
      rightCollapseCount: round(rightCollapseCount),
      collapseSum: round(collapseSum),
      collapseDifference: round(collapseDifference),
      sumWithinLimit,
      countsUnequal,
      collapseAccepted,
      selectedStrengthScore: round(selectedStrengthScore),
      opponentStrengthScore: round(opponentStrengthScore),
      selectedStrengthEdge: round(selectedStrengthEdge),
      strongSelectedStrengthException,
      selectedHistoryMatches: round(selectedHistory && selectedHistory.historyMatches),
      selectedHistoryWindowMatches: round(selectedHistory && selectedHistory.eightMatchWindowMatches),
      selectedHistorySetSharePct: round(selectedHistory && selectedHistory.eightMatchSetSharePct),
      selectedHistoryWindowReady,
      selectedHistorySetShareException,
      selectedFreshForm3Score: round(selectedHistory && selectedHistory.freshForm3Score),
      opponentFreshForm3Score: round(opponentHistory && opponentHistory.freshForm3Score),
      selectedHistory5WindowMatches: round(selectedHistory && selectedHistory.fiveMatchWindowMatches),
      opponentHistory5WindowMatches: round(opponentHistory && opponentHistory.fiveMatchWindowMatches),
      selectedHistory5SetSharePct: round(selectedHistory && selectedHistory.fiveMatchSetSharePct),
      opponentHistory5SetSharePct: round(opponentHistory && opponentHistory.fiveMatchSetSharePct),
      selectedHistory5SetShareEdge: round(selectedHistory5SetShareEdge),
      selectedHistory8PerformancePct: round(selectedHistory && selectedHistory.eightMatchPerformancePct),
      opponentHistory8PerformancePct: round(opponentHistory && opponentHistory.eightMatchPerformancePct),
      relativeHistoryWindowReady,
      selectedFreshAtOrAboveHistory8,
      opponentFreshAtOrAboveHistory8,
      relativeFormSetShareException,
      relativeAgreementScore: round(relativeAgreementScore),
      latestPbpReversal,
      inputHash,
      thresholds: THRESHOLDS,
      usesOdds: market.marketReady,
      usesCurrentMatchScore: false
    };
  }

  const api = Object.freeze({
    PROTOCOL,
    THRESHOLDS,
    classifyLeague,
    evaluate
  });

  root.LvrVerifiedPairRegimeV1 = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
