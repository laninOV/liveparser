"use strict";

(function initTableTennisSources(root) {
  const ORIGINS = Object.freeze({
    betsapi: "https://betsapi.com",
    bsportsfan: "https://ru.bsportsfan.com"
  });
  const SOURCE_IDS = Object.freeze(Object.keys(ORIGINS));

  function isBsportsfanHostname(value) {
    const hostname = String(value || "").toLowerCase();
    return hostname === "bsportsfan.com" || hostname.endsWith(".bsportsfan.com");
  }

  function isBetsapiHostname(value) {
    const hostname = String(value || "").toLowerCase();
    return hostname === "betsapi.com" || hostname.endsWith(".betsapi.com");
  }

  function isSupportedHostname(value) {
    return isBsportsfanHostname(value) || isBetsapiHostname(value);
  }

  function getSourceId(value) {
    let hostname = "";
    try {
      hostname = new URL(String(value || "")).hostname.toLowerCase();
    } catch (_) {
      hostname = String(value || "").toLowerCase();
    }
    if (isBetsapiHostname(hostname)) {
      return "betsapi";
    }
    if (isBsportsfanHostname(hostname)) {
      return "bsportsfan";
    }
    return "";
  }

  function getAlternateSourceId(sourceId) {
    if (sourceId === "betsapi") {
      return "bsportsfan";
    }
    if (sourceId === "bsportsfan") {
      return "betsapi";
    }
    return "";
  }

  function getOrigin(sourceId) {
    return ORIGINS[sourceId] || "";
  }

  function buildCandidateSourceIds(currentSourceId, preferredSourceId = "") {
    return [
      currentSourceId,
      getAlternateSourceId(currentSourceId),
      preferredSourceId,
      ...SOURCE_IDS
    ].filter((sourceId, index, values) => (
      Boolean(ORIGINS[sourceId]) && values.indexOf(sourceId) === index
    ));
  }

  root.LvrTableTennisSources = Object.freeze({
    ORIGINS,
    SOURCE_IDS,
    buildCandidateSourceIds,
    getAlternateSourceId,
    getOrigin,
    getSourceId,
    isSupportedHostname
  });
})(globalThis);
