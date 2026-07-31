(function installLvrVerifiedPairRegimeV1(root) {
  "use strict";

  const startRule = root && root.LvrStartMatchRule
    || (typeof require === "function" ? require("./start-match-rule.js") : null);
  if (!startRule || !startRule.FORMULA_ID) {
    throw new Error("LvrStartMatchRule must be loaded before LvrVerifiedPairRegimeV1");
  }

  const PROTOCOL = Object.freeze({
    schemaVersion: 8,
    id: "start-moderate-live-deficit4-v7-2026-07-31",
    gateId: "moderate-filter-with-live-deficit4-v1",
    selectorFormulaId: startRule.FORMULA_ID,
    target: "player-takes-two-or-more-sets",
    registeredAt: "2026-07-31T00:00:00Z",
    targetEligible: 300,
    minimumReviewSettled: 150,
    productionLeagues: Object.freeze(["setka", "czech"]),
    rules: Object.freeze({
      pointWindow: "same common selector window: 5, otherwise 3",
      gate: "the existing PBP gate passes, then base-collapse agreement 2.5 is rejected; every remaining accepted signal belongs to one moderate production stream",
      side: "relative four-factor selector with base-collapse correction; after the moderate gate, switch only if that history side trails by at least four points in the first set",
      currentScore: "used only for the deterministic first-set deficit-four side switch; never used to reject a match"
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
    rejectedRelativeAgreementScore: 2.5
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

  function evaluate(input = {}) {
    const profiles = Array.isArray(input.profiles) ? input.profiles.slice(0, 2) : [];
    const selectedSideIndex = input.selectedSideIndex === 0 || input.selectedSideIndex === 1
      ? input.selectedSideIndex
      : null;
    const pointWindowSize = Number(input.pointWindowSize);
    const relativeAgreementScore = finiteOrNull(input.relativeAgreementScore);
    const latestPbpReversal = input.latestPbpReversal === true;
    const leagueClass = classifyLeague(input.leagueName);
    const productionLeague = PROTOCOL.productionLeagues.includes(leagueClass);
    const shadowOnly = leagueClass === "tt-cup-shadow";
    const windowReady = pointWindowSize === 5 || pointWindowSize === 3;
    const metrics = profiles.map((profile) => readSideMetrics(profile, pointWindowSize));
    const metricsReady = profiles.length === 2
      && selectedSideIndex !== null
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
    const selectedHistory = selectedSideIndex === null ? null : historySignals[selectedSideIndex];
    const opponentHistory = selectedSideIndex === null ? null : historySignals[1 - selectedSideIndex];
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
    const selectedMetrics = metricsReady ? metrics[selectedSideIndex] : null;
    const opponentMetrics = metricsReady ? metrics[1 - selectedSideIndex] : null;
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
    const signalMode = moderateAccepted ? "moderate" : "rejected";
    const dataReady = metricsReady;
    const eligible = dataReady && productionLeague;
    const accepted = eligible && moderateAccepted;
    const inputHash = dataReady
      ? hashPayload({
          protocolId: PROTOCOL.id,
          selectorFormulaId: PROTOCOL.selectorFormulaId,
          selectedSideIndex,
          relativeAgreementScore,
          latestPbpReversal,
          pointWindowSize,
          leagueClass,
          left,
          right,
          historySignals
        })
      : "";

    let reason = "collapse-combination-rejected";
    if (profiles.length !== 2) reason = "collapse-profiles-missing";
    else if (selectedSideIndex === null) reason = "collapse-selected-side-missing";
    else if (!windowReady) reason = "collapse-common-window-missing";
    else if (!metricsReady) reason = "collapse-metrics-missing";
    else if (leagueClass === "blocked") reason = "collapse-league-blocked";
    else if (shadowOnly) reason = "tt-cup-shadow-only";
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
      signalMode,
      accepted,
      reason,
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
      usesOdds: false,
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
