"use strict";

(function initTableTennisSources(root) {
  const ORIGINS = Object.freeze({
    bsportsfan: "https://ru.bsportsfan.com"
  });
  const SOURCE_IDS = Object.freeze(Object.keys(ORIGINS));
  const TAB_URL_PATTERNS = Object.freeze([
    "https://ru.bsportsfan.com/*"
  ]);

  function isBsportsfanHostname(value) {
    const hostname = String(value || "").toLowerCase();
    return hostname === "ru.bsportsfan.com";
  }

  function isSupportedHostname(value) {
    return isBsportsfanHostname(value);
  }

  function getSourceId(value) {
    let hostname = "";
    try {
      hostname = new URL(String(value || "")).hostname.toLowerCase();
    } catch (_) {
      hostname = String(value || "").toLowerCase();
    }
    if (isBsportsfanHostname(hostname)) {
      return "bsportsfan";
    }
    return "";
  }

  function getOrigin(sourceId) {
    return ORIGINS[sourceId] || "";
  }

  function buildCandidateSourceIds(currentSourceId, preferredSourceId = "") {
    return [
      currentSourceId,
      preferredSourceId,
      ...SOURCE_IDS
    ].filter((sourceId, index, values) => (
      Boolean(ORIGINS[sourceId]) && values.indexOf(sourceId) === index
    ));
  }

  root.LvrTableTennisSources = Object.freeze({
    ORIGINS,
    SOURCE_IDS,
    TAB_URL_PATTERNS,
    buildCandidateSourceIds,
    getOrigin,
    getSourceId,
    isSupportedHostname
  });
})(globalThis);
