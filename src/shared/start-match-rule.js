(function installLvrStartMatchRule(root) {
  "use strict";

  const RULE_ID = "match-start-z0-market-v2";
  const FORMULA_ID = "z0-side-selector-no-league-v1-2026-07-31";
  const MODEL_TARGET = "player-takes-two-or-more-sets";
  const MAX_HISTORY_MATCHES = 8;
  const MIN_HISTORY_MATCHES = 3;
  const PREFERRED_POINT_MATCHES = 5;
  const MIN_POINT_MATCHES = 3;

  const Z0_WEIGHTS = Object.freeze({
    latestStrengthScore: 8,
    history3SetSharePct: 1,
    latestOwnSets: 24
  });

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

  function buildZ0Inputs(profile) {
    const history = profile && profile.history;
    const history3 = completeWindow(profile, "history", 3);
    const latestPoint = profile && profile.point && profile.point.latest;
    const inputs = {
      latestStrengthScore: finite(latestPoint && latestPoint.strengthScore),
      history3SetSharePct: finite(history3 && history3.setSharePct),
      latestOwnSets: finite(history && history.latestOwnSets),
      freshForm3Score: finite(history && history.freshForm3Score)
    };
    return {
      ...inputs,
      ready: [
        inputs.latestStrengthScore,
        inputs.history3SetSharePct,
        inputs.latestOwnSets,
        inputs.freshForm3Score
      ].every((value) => value !== null)
    };
  }

  function z0IndividualScore(inputs) {
    if (!inputs || !inputs.ready) return null;
    return Z0_WEIGHTS.latestStrengthScore * inputs.latestStrengthScore
      + Z0_WEIGHTS.history3SetSharePct * inputs.history3SetSharePct
      + Z0_WEIGHTS.latestOwnSets * inputs.latestOwnSets;
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

  function auditSelectedSide(profiles, scores, pointWindowSize, selectedSideIndex) {
    const baseCollapseBranch = isBaseCollapseBranch(profiles, pointWindowSize);
    const selectedInputs = selectedSideIndex === 0 || selectedSideIndex === 1
      ? scores[selectedSideIndex] && scores[selectedSideIndex].modelInputs
      : null;
    const opponentInputs = selectedSideIndex === 0 || selectedSideIndex === 1
      ? scores[1 - selectedSideIndex] && scores[1 - selectedSideIndex].modelInputs
      : null;
    const agreementScore = relativeAgreementScore(selectedInputs, opponentInputs);
    const latestReversal = latestPbpReversal(profiles, selectedSideIndex);
    return {
      sideIndex: selectedSideIndex,
      applied: false,
      reason: "z0-selector-frozen",
      baseCollapseBranch,
      agreementScore,
      latestReversal
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
    const selectorInputs = buildZ0Inputs(profile);
    const selectorScore = z0IndividualScore(selectorInputs);
    const components = buildDisplayComponents(profile, modelInputs);
    return {
      complete: selectorInputs.ready,
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
      selectorInputs,
      selectorScore: selectorScore === null ? null : round(selectorScore, 6),
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
    const legacyRawDelta = scores.length === 2
      && scores.every((score) => score.rawModelScore !== null)
      ? scores[0].rawModelScore - scores[1].rawModelScore
      : null;
    const legacySideIndex = legacyRawDelta !== null && Math.abs(legacyRawDelta) > 1e-9
      ? legacyRawDelta > 0 ? 0 : 1
      : null;
    const z0Score = profilesReady
      ? scores[0].selectorScore - scores[1].selectorScore
      : null;
    const sideIndex = z0Score === null ? null : z0Score >= 0 ? 0 : 1;
    // Keep the historical guard contract as a no-op so existing audit and
    // delivery validation stay deterministic while Z0 remains frozen.
    const baseSideIndex = sideIndex;
    const sideCorrection = auditSelectedSide(
      profiles,
      scores,
      pointWindowSize,
      baseSideIndex
    );
    const comparisonIndexLeft = z0Score === null
      ? null
      : 100 / (1 + Math.exp(-Math.max(-20, Math.min(20, z0Score / 100))));
    if (comparisonIndexLeft !== null && scores.length === 2) {
      scores[0].overall = round(comparisonIndexLeft);
      scores[1].overall = round(100 - comparisonIndexLeft);
    }

    const eligible = identitiesReady && profilesReady && sideIndex !== null;
    return {
      schemaVersion: 3,
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
            : "start-z0-qualified",
      sideIndex,
      baseSideIndex,
      legacySideIndex,
      sideCorrection,
      playerName: sideIndex === null ? "" : players[sideIndex] || "",
      scores,
      rawScoreDelta: z0Score === null ? null : round(z0Score, 6),
      z0Score: z0Score === null ? null : round(z0Score, 6),
      z0Inputs: scores.map((score) => score.selectorInputs),
      legacyRawScoreDelta: legacyRawDelta === null ? null : round(legacyRawDelta, 6),
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
        minimumPointMatches: MIN_POINT_MATCHES,
        requiredSelectorInputs: ["P", "S3", "L", "F3"]
      },
      weights: {
        diagnosticWindows: WINDOW_WEIGHTS,
        selector: Z0_WEIGHTS,
        diagnosticModel: MODEL_COEFFICIENTS
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
    Z0_WEIGHTS,
    MODEL_COEFFICIENTS,
    WINDOW_WEIGHTS,
    SIDE_CORRECTION,
    evaluate,
    scoreProfile,
    fingerprint
  });

  root.LvrStartMatchRule = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
