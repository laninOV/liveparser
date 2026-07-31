(function installLvrStartMatchRule(root) {
  "use strict";

  const RULE_ID = "match-start-history-pbp-live-deficit4-v3";
  const FORMULA_ID = "start-relative-side-correction-v2-2026-07-31";
  const MODEL_TARGET = "player-takes-two-or-more-sets";
  const MAX_HISTORY_MATCHES = 8;
  const MIN_HISTORY_MATCHES = 5;
  const PREFERRED_POINT_MATCHES = 5;
  const MIN_POINT_MATCHES = 3;

  const MODEL_COEFFICIENTS = Object.freeze({
    tookTwoLast5: 0.1002743765830373,
    freshForm3Score: 0.003852714357521356,
    avgSetPointMargin: 0.05273093422356286,
    closeLeadLostPct: -0.015092056832786465
  });

  const WINDOW_WEIGHTS = Object.freeze({ 8: 0.25, 5: 0.45, 3: 0.3 });
  const SIDE_CORRECTION = Object.freeze({
    collapseSumMaximum: 4,
    weakAgreementScores: Object.freeze([2, 2.5]),
    latestReversalAgreementMinimum: 3.5
  });
  const LIVE_POINT_CORRECTION = Object.freeze({
    ruleId: "first-set-deficit-four-side-correction-v1",
    maximumSelectedPointLead: -4
  });

  function finite(value) {
    if (value === null || value === undefined || value === "") return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function clamp(value, minimum = 0, maximum = 100) {
    return Math.min(maximum, Math.max(minimum, Number(value || 0)));
  }

  function round(value, digits = 1) {
    const factor = 10 ** digits;
    return Math.round(Number(value || 0) * factor) / factor;
  }

  function readWindow(profile, group, size) {
    const source = profile && profile[group] && profile[group].windows;
    return source && (source[size] || source[String(size)]) || null;
  }

  function completeWindow(profile, group, size) {
    const window = readWindow(profile, group, size);
    return window && Number(window.matches || 0) >= size ? window : null;
  }

  function weightedMetric(profile, group, metric, transform = (value) => value) {
    let total = 0;
    let weightTotal = 0;
    for (const size of [8, 5, 3]) {
      const window = completeWindow(profile, group, size);
      const value = finite(window && window[metric]);
      if (value === null) continue;
      const weight = WINDOW_WEIGHTS[size];
      total += transform(value) * weight;
      weightTotal += weight;
    }
    return weightTotal > 0 ? total / weightTotal : null;
  }

  function weightedHistorySafety(profile) {
    let total = 0;
    let weightTotal = 0;
    for (const size of [8, 5, 3]) {
      const window = completeWindow(profile, "history", size);
      const matches = finite(window && window.matches);
      const sweeps = finite(window && window.sweepLosses);
      const oneSetLosses = finite(window && window.oneSetLosses);
      if (!(matches > 0) || sweeps === null || oneSetLosses === null) continue;
      const weight = WINDOW_WEIGHTS[size];
      total += clamp(100 * (1 - (sweeps + 0.8 * oneSetLosses) / matches)) * weight;
      weightTotal += weight;
    }
    return weightTotal > 0 ? total / weightTotal : null;
  }

  function selectPointWindowSize(profiles) {
    for (const size of [PREFERRED_POINT_MATCHES, MIN_POINT_MATCHES]) {
      const ready = profiles.every((profile) => {
        const window = completeWindow(profile, "point", size);
        return finite(window && window.avgSetPointMargin) !== null
          && finite(window && window.closeLeadLostPct) !== null;
      });
      if (ready) return size;
    }
    return null;
  }

  function buildModelInputs(profile, pointWindowSize) {
    const history5 = completeWindow(profile, "history", 5);
    const point = pointWindowSize ? completeWindow(profile, "point", pointWindowSize) : null;
    const inputs = {
      tookTwoLast5: finite(history5 && history5.tookTwo),
      freshForm3Score: finite(profile && profile.history && profile.history.freshForm3Score),
      avgSetPointMargin: finite(point && point.avgSetPointMargin),
      closeLeadLostPct: finite(point && point.closeLeadLostPct),
      pointWindowSize
    };
    return {
      ...inputs,
      ready: [
        inputs.tookTwoLast5,
        inputs.freshForm3Score,
        inputs.avgSetPointMargin,
        inputs.closeLeadLostPct
      ].every((value) => value !== null)
    };
  }

  function rawModelScore(inputs) {
    if (!inputs || !inputs.ready) return null;
    return MODEL_COEFFICIENTS.tookTwoLast5 * inputs.tookTwoLast5
      + MODEL_COEFFICIENTS.freshForm3Score * inputs.freshForm3Score
      + MODEL_COEFFICIENTS.avgSetPointMargin * inputs.avgSetPointMargin
      + MODEL_COEFFICIENTS.closeLeadLostPct * inputs.closeLeadLostPct;
  }

  function compareRelative(selectedValue, opponentValue, lowerIsBetter = false) {
    const selected = finite(selectedValue);
    const opponent = finite(opponentValue);
    if (selected === null || opponent === null) return null;
    if (Math.abs(selected - opponent) <= 1e-9) return 0.5;
    if (lowerIsBetter) return selected < opponent ? 1 : 0;
    return selected > opponent ? 1 : 0;
  }

  function relativeAgreementScore(selectedInputs, opponentInputs) {
    if (!selectedInputs || !selectedInputs.ready || !opponentInputs || !opponentInputs.ready) {
      return null;
    }
    const advantages = [
      compareRelative(selectedInputs.tookTwoLast5, opponentInputs.tookTwoLast5),
      compareRelative(selectedInputs.freshForm3Score, opponentInputs.freshForm3Score),
      compareRelative(selectedInputs.avgSetPointMargin, opponentInputs.avgSetPointMargin),
      compareRelative(selectedInputs.closeLeadLostPct, opponentInputs.closeLeadLostPct, true)
    ];
    return advantages.every((value) => value !== null)
      ? advantages.reduce((sum, value) => sum + value, 0)
      : null;
  }

  function isBaseCollapseBranch(profiles, pointWindowSize) {
    if (!pointWindowSize || !Array.isArray(profiles) || profiles.length !== 2) return false;
    const metrics = profiles.map((profile) => {
      const point = completeWindow(profile, "point", pointWindowSize);
      return {
        collapseCount: finite(point && point.collapseCount),
        strengthScore: finite(point && point.strengthScore)
      };
    });
    if (!metrics.every((side) => (
      side.collapseCount !== null
      && Number.isInteger(side.collapseCount)
      && side.collapseCount >= 0
      && side.strengthScore !== null
    ))) {
      return false;
    }
    const collapseSum = metrics[0].collapseCount + metrics[1].collapseCount;
    const collapseDifference = Math.abs(metrics[0].collapseCount - metrics[1].collapseCount);
    return collapseSum <= SIDE_CORRECTION.collapseSumMaximum && collapseDifference >= 1;
  }

  function latestPbpReversal(profiles, selectedSideIndex) {
    if (!Array.isArray(profiles) || profiles.length !== 2) return false;
    if (selectedSideIndex !== 0 && selectedSideIndex !== 1) return false;
    const selectedLatest = profiles[selectedSideIndex]
      && profiles[selectedSideIndex].point
      && profiles[selectedSideIndex].point.latest;
    const opponentLatest = profiles[1 - selectedSideIndex]
      && profiles[1 - selectedSideIndex].point
      && profiles[1 - selectedSideIndex].point.latest;
    const selectedPointsRate = finite(selectedLatest && selectedLatest.pointsRate);
    const opponentPointsRate = finite(opponentLatest && opponentLatest.pointsRate);
    const selectedMargin = finite(selectedLatest && selectedLatest.avgSetPointMargin);
    const opponentMargin = finite(opponentLatest && opponentLatest.avgSetPointMargin);
    return selectedPointsRate !== null
      && opponentPointsRate !== null
      && selectedMargin !== null
      && opponentMargin !== null
      && opponentPointsRate > selectedPointsRate
      && opponentMargin > selectedMargin;
  }

  function correctSelectedSide(profiles, scores, pointWindowSize, baseSideIndex) {
    const baseCollapseBranch = isBaseCollapseBranch(profiles, pointWindowSize);
    const selectedInputs = baseSideIndex === 0 || baseSideIndex === 1
      ? scores[baseSideIndex] && scores[baseSideIndex].modelInputs
      : null;
    const opponentInputs = baseSideIndex === 0 || baseSideIndex === 1
      ? scores[1 - baseSideIndex] && scores[1 - baseSideIndex].modelInputs
      : null;
    const agreementScore = relativeAgreementScore(selectedInputs, opponentInputs);
    const latestReversal = latestPbpReversal(profiles, baseSideIndex);
    const weakAgreement = SIDE_CORRECTION.weakAgreementScores.includes(agreementScore);
    const strongAgreementWithLatestReversal = agreementScore !== null
      && agreementScore >= SIDE_CORRECTION.latestReversalAgreementMinimum
      && latestReversal;
    const applied = Boolean(
      baseCollapseBranch
      && (baseSideIndex === 0 || baseSideIndex === 1)
      && (weakAgreement || strongAgreementWithLatestReversal)
    );
    return {
      sideIndex: applied ? 1 - baseSideIndex : baseSideIndex,
      applied,
      reason: !baseCollapseBranch
        ? "outside-base-collapse-branch"
        : weakAgreement
          ? "weak-relative-agreement"
          : strongAgreementWithLatestReversal
            ? "latest-pbp-reversal"
            : "base-side-kept",
      baseCollapseBranch,
      agreementScore,
      latestReversal
    };
  }

  function applyLivePointDeficitCorrection(input = {}) {
    const historySideIndex = input.selectedSideIndex === 0 || input.selectedSideIndex === 1
      ? input.selectedSideIndex
      : null;
    const state = input.deliveryEntryState && typeof input.deliveryEntryState === "object"
      ? input.deliveryEntryState
      : {};
    const completedSets = finite(state.completedSets);
    const targetSetNumber = finite(state.targetSetNumber);
    const leftPoints = finite(state.currentPointLeftPoints);
    const rightPoints = finite(state.currentPointRightPoints);
    const firstSetLive = historySideIndex !== null
      && String(state.mode || "").trim().toLowerCase() === "live"
      && state.started === true
      && state.finished !== true
      && completedSets === 0
      && targetSetNumber === 1;
    const pointsReady = leftPoints !== null
      && rightPoints !== null
      && leftPoints >= 0
      && rightPoints >= 0;
    const selectedPointLead = firstSetLive && pointsReady
      ? historySideIndex === 0
        ? leftPoints - rightPoints
        : rightPoints - leftPoints
      : null;
    const applied = selectedPointLead !== null
      && selectedPointLead <= LIVE_POINT_CORRECTION.maximumSelectedPointLead;
    return {
      ruleId: LIVE_POINT_CORRECTION.ruleId,
      threshold: LIVE_POINT_CORRECTION.maximumSelectedPointLead,
      historySideIndex,
      finalSideIndex: applied && historySideIndex !== null
        ? 1 - historySideIndex
        : historySideIndex,
      applied,
      reason: !firstSetLive
        ? "first-set-live-state-missing"
        : !pointsReady
          ? "first-set-points-missing"
          : applied
            ? "history-side-trails-by-four-or-more"
            : "history-side-kept",
      selectedPointLead,
      leftPoints,
      rightPoints
    };
  }

  function buildDisplayComponents(profile, inputs) {
    const tookTwo = weightedMetric(profile, "history", "tookTwoPct");
    const performance = weightedMetric(profile, "history", "performancePct");
    const broadMargin = weightedMetric(
      profile,
      "point",
      "avgSetPointMargin",
      (value) => clamp(50 + 10 * value)
    );
    const broadSetShare = weightedMetric(profile, "point", "setSharePct");
    const closeLeadSafety = weightedMetric(
      profile,
      "point",
      "closeLeadLostPct",
      (value) => 100 - clamp(value)
    );
    const recovery = weightedMetric(
      profile,
      "point",
      "firstSetLossNoTwoRate",
      (value) => 100 - clamp(value)
    );
    const historyFloor = weightedHistorySafety(profile);
    const stabilityParts = [historyFloor, closeLeadSafety, recovery]
      .filter((value) => value !== null);
    const form = tookTwo === null || performance === null
      ? null
      : 0.65 * tookTwo + 0.35 * performance;
    const strength = broadMargin === null || broadSetShare === null
      ? inputs && inputs.avgSetPointMargin !== null
        ? clamp(50 + 10 * inputs.avgSetPointMargin)
        : null
      : 0.7 * broadMargin + 0.3 * broadSetShare;
    const stability = stabilityParts.length
      ? stabilityParts.reduce((sum, value) => sum + value, 0) / stabilityParts.length
      : null;
    return {
      form: form === null ? null : round(clamp(form)),
      strength: strength === null ? null : round(clamp(strength)),
      stability: stability === null ? null : round(clamp(stability))
    };
  }

  function scoreProfile(profile, pointWindowSize) {
    const historyMatches = finite(profile && profile.history && profile.history.matches) || 0;
    const pointMatches = finite(profile && profile.point && profile.point.matches) || 0;
    const modelInputs = buildModelInputs(profile, pointWindowSize);
    const rawScore = rawModelScore(modelInputs);
    const components = buildDisplayComponents(profile, modelInputs);
    return {
      complete: historyMatches >= MIN_HISTORY_MATCHES
        && pointMatches >= MIN_POINT_MATCHES
        && modelInputs.ready,
      historyMatches,
      pointMatches,
      pointWindowSize: pointWindowSize || null,
      coverageTier: pointWindowSize === PREFERRED_POINT_MATCHES
        ? "full-5"
        : pointWindowSize === MIN_POINT_MATCHES
          ? "fallback-3"
          : "none",
      modelInputs,
      rawModelScore: rawScore === null ? null : round(rawScore, 6),
      ...components
    };
  }

  function canonicalize(value) {
    if (Array.isArray(value)) return value.map(canonicalize);
    if (value && typeof value === "object") {
      return Object.fromEntries(Object.keys(value).sort().flatMap((key) => {
        const item = value[key];
        return item === null || item === undefined || item === ""
          ? []
          : [[key, canonicalize(item)]];
      }));
    }
    return value;
  }

  function hashPayload(value) {
    const text = JSON.stringify(canonicalize(value));
    let hash = 0x811c9dc5;
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 0x01000193) >>> 0;
    }
    return `fnv1a32-${hash.toString(16).padStart(8, "0")}`;
  }

  function fingerprint(profiles) {
    return hashPayload({
      ruleId: RULE_ID,
      formulaId: FORMULA_ID,
      profiles: Array.isArray(profiles) ? profiles.slice(0, 2) : []
    });
  }

  function fingerprintDecision(input = {}) {
    const profiles = Array.isArray(input.profiles) ? input.profiles.slice(0, 2) : [];
    const livePointCorrection = applyLivePointDeficitCorrection({
      selectedSideIndex: input.selectedSideIndex,
      deliveryEntryState: input.deliveryEntryState
    });
    return hashPayload({
      ruleId: RULE_ID,
      selectorFormulaId: FORMULA_ID,
      selectorInputHash: fingerprint(profiles),
      livePointCorrection: {
        ruleId: livePointCorrection.ruleId,
        threshold: livePointCorrection.threshold,
        historySideIndex: livePointCorrection.historySideIndex,
        finalSideIndex: livePointCorrection.finalSideIndex,
        applied: livePointCorrection.applied,
        selectedPointLead: livePointCorrection.selectedPointLead,
        leftPoints: livePointCorrection.leftPoints,
        rightPoints: livePointCorrection.rightPoints
      }
    });
  }

  function evaluate(input = {}) {
    const profiles = Array.isArray(input.profiles) ? input.profiles.slice(0, 2) : [];
    const players = Array.isArray(input.players) ? input.players.slice(0, 2).map(String) : [];
    const identityKeys = profiles.map((profile) => String(profile && profile.identityKey || ""));
    const identitiesReady = identityKeys.length === 2
      && identityKeys.every((key) => /^id:\d+$/.test(key))
      && identityKeys[0] !== identityKeys[1];
    const pointWindowSize = profiles.length === 2 ? selectPointWindowSize(profiles) : null;
    const scores = profiles.map((profile) => scoreProfile(profile, pointWindowSize));
    const profilesReady = scores.length === 2 && scores.every((score) => score.complete);
    const rawDelta = profilesReady
      ? scores[0].rawModelScore - scores[1].rawModelScore
      : null;
    const baseSideIndex = rawDelta !== null && Math.abs(rawDelta) > 1e-9
      ? rawDelta > 0 ? 0 : 1
      : null;
    const sideCorrection = correctSelectedSide(
      profiles,
      scores,
      pointWindowSize,
      baseSideIndex
    );
    const sideIndex = sideCorrection.sideIndex;
    const comparisonIndexLeft = rawDelta === null
      ? null
      : 100 / (1 + Math.exp(-Math.max(-20, Math.min(20, rawDelta))));
    if (comparisonIndexLeft !== null && scores.length === 2) {
      scores[0].overall = round(comparisonIndexLeft);
      scores[1].overall = round(100 - comparisonIndexLeft);
    }

    const eligible = identitiesReady && profilesReady && sideIndex !== null;
    return {
      schemaVersion: 2,
      ruleId: RULE_ID,
      formulaId: FORMULA_ID,
      modelTarget: MODEL_TARGET,
      eligible,
      reason: !identitiesReady
        ? "start-player-identity-incomplete"
        : !profilesReady
          ? "start-profile-incomplete"
          : sideIndex === null
            ? "start-profile-tie"
            : sideCorrection.applied
              ? "start-relative-side-correction-qualified"
              : "start-history-pbp-qualified",
      sideIndex,
      baseSideIndex,
      sideCorrection,
      playerName: sideIndex === null ? "" : players[sideIndex] || "",
      scores,
      rawScoreDelta: rawDelta === null ? null : round(rawDelta, 6),
      scoreEdge: comparisonIndexLeft === null
        ? null
        : round(Math.abs(2 * comparisonIndexLeft - 100)),
      coverageTier: pointWindowSize === 5
        ? "full-5"
        : pointWindowSize === 3
          ? "fallback-3"
          : "none",
      pointWindowSize,
      inputHash: fingerprint(profiles),
      thresholds: {
        maximumHistoryMatches: MAX_HISTORY_MATCHES,
        minimumHistoryMatches: MIN_HISTORY_MATCHES,
        preferredPointMatches: PREFERRED_POINT_MATCHES,
        minimumPointMatches: MIN_POINT_MATCHES
      },
      weights: {
        diagnosticWindows: WINDOW_WEIGHTS,
        model: MODEL_COEFFICIENTS
      },
      usesOdds: false,
      usesCurrentMatchScore: false
    };
  }

  const api = Object.freeze({
    RULE_ID,
    FORMULA_ID,
    MODEL_TARGET,
    MAX_HISTORY_MATCHES,
    MIN_HISTORY_MATCHES,
    PREFERRED_POINT_MATCHES,
    MIN_POINT_MATCHES,
    MODEL_COEFFICIENTS,
    WINDOW_WEIGHTS,
    SIDE_CORRECTION,
    LIVE_POINT_CORRECTION,
    evaluate,
    applyLivePointDeficitCorrection,
    scoreProfile,
    fingerprint,
    fingerprintDecision
  });

  root.LvrStartMatchRule = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
