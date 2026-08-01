(function installLvrSideCorrectionGuard(root) {
  "use strict";

  const RULE_ID = "causal-a-base-correction-guard-window3-v1";
  const SCHEMA_VERSION = 1;
  const WINDOW_SIZE = 3;

  function finite(value) {
    if (value === null || value === undefined || value === "") return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function sideIndex(value) {
    if (value === null || value === undefined || value === "") return null;
    const number = Number(value);
    return number === 0 || number === 1 ? number : null;
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

  function normalizeOutcomes(value) {
    return (Array.isArray(value) ? value : [])
      .map(Number)
      .filter((item) => item === -1 || item === 0 || item === 1)
      .slice(-WINDOW_SIZE);
  }

  function evaluate(input = {}) {
    const historySideIndex = sideIndex(input.historySideIndex);
    const baseSideIndex = sideIndex(input.baseSideIndex);
    const stateHash = typeof input.stateHash === "string" ? input.stateHash.trim() : "";
    const pairedOutcomes = normalizeOutcomes(input.pairedOutcomes);
    const pairSum = pairedOutcomes.reduce((sum, value) => sum + value, 0);
    const sidesDisagree = historySideIndex !== null
      && baseSideIndex !== null
      && historySideIndex !== baseSideIndex;
    const useBase = sidesDisagree && pairSum < 0;
    const selectedSource = useBase ? "base-history-pbp" : "history-pbp";
    const selectedSideIndex = useBase ? baseSideIndex : historySideIndex;
    const stateReady = Boolean(stateHash);
    const eligible = historySideIndex !== null
      && baseSideIndex !== null
      && selectedSideIndex !== null
      && stateReady;
    const inputHash = eligible
      ? hashPayload({
          ruleId: RULE_ID,
          schemaVersion: SCHEMA_VERSION,
          windowSize: WINDOW_SIZE,
          historySideIndex,
          baseSideIndex,
          sidesDisagree,
          pairedOutcomes,
          stateHash,
          pairSum,
          selectedSource,
          selectedSideIndex
        })
      : "";

    return {
      schemaVersion: SCHEMA_VERSION,
      ruleId: RULE_ID,
      eligible,
      reason: !eligible
        ? !stateReady
          ? "side-guard-state-missing"
          : "side-guard-side-missing"
        : !sidesDisagree
          ? "history-and-base-agree"
          : useBase
            ? "last-three-disagreements-prefer-base"
            : "last-three-disagreements-keep-history",
      historySideIndex,
      baseSideIndex,
      sidesDisagree,
      pairedOutcomes,
      stateHash,
      stateReady,
      qualifyingSettled: pairedOutcomes.length,
      pairSum,
      windowSize: WINDOW_SIZE,
      selectedSource,
      selectedSideIndex,
      inputHash,
      usesOdds: false,
      usesCurrentMatchScore: false
    };
  }

  function pairedOutcome(input = {}) {
    const historySideIndex = sideIndex(input.historySideIndex);
    const baseSideIndex = sideIndex(input.baseSideIndex);
    const leftSets = finite(input.leftSets);
    const rightSets = finite(input.rightSets);
    if (
      historySideIndex === null
      || baseSideIndex === null
      || historySideIndex === baseSideIndex
      || leftSets === null
      || rightSets === null
    ) {
      return null;
    }
    const historySets = historySideIndex === 0 ? leftSets : rightSets;
    const baseSets = baseSideIndex === 0 ? leftSets : rightSets;
    const historyHit = historySets >= 2;
    const baseHit = baseSets >= 2;
    if (historyHit === baseHit) return 0;
    return historyHit ? 1 : -1;
  }

  const api = Object.freeze({
    RULE_ID,
    SCHEMA_VERSION,
    WINDOW_SIZE,
    evaluate,
    pairedOutcome,
    normalizeOutcomes,
    hashPayload
  });

  root.LvrSideCorrectionGuard = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
