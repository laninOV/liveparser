(function installLiveValueRadarBsportsfanParser() {
  "use strict";

  if (window.__liveValueRadarBsportsfanParserInstalled) {
    return;
  }

  window.__liveValueRadarBsportsfanParserInstalled = true;

  const BSF_MATCH_LINK_SELECTOR = [
    "a[href*='/table-tennis/r/']",
    "a[href*='/table-tennis/rs/']",
    "a[href^='/r/']",
    "a[href^='/rs/']",
    "a[href*='bsportsfan.com/r/']",
    "a[href*='bsportsfan.com/rs/']"
  ].join(",");
  const BSF_PLAYER_LINK_SELECTOR = [
    "a[href*='/table-tennis/t/']",
    "a[href^='/t/']",
    "a[href*='bsportsfan.com/t/']"
  ].join(",");
  const BSF_LIST_MATCH_ROW_SELECTOR = "tr, .card-hover, li";
  const UPDATE_INTERVAL_MS = 5000;
  const HIDDEN_LIST_UPDATE_INTERVAL_MS = 5000;
  const CIP_TABLE_TENNIS_AUTO_RELOAD_PATH = "/cip/table-tennis";
  const TABLE_TENNIS_CATEGORY_PATH = "/c/table-tennis";
  const MUTATION_DELAY_MS = 250;
  const MUTATION_MIN_UPDATE_INTERVAL_MS = 3000;
  const ARCHIVE_MATCHES_PER_PLAYER = 5;
  const TREND_MATCHES_PER_PLAYER = 8;
  const PROFILE_SCORE_HISTORY_MATCHES = 8;
  const PREMATCH_VISIBLE_CIP_EVIDENCE = "cip-visible-waiting";
  const START_SCORE_HISTORY_MIN_MATCHES = 5;
  const PREMATCH_POINT_PROFILE_MATCHES = 5;
  const PREMATCH_POINT_PROFILE_CANDIDATES = 8;
  const PREMATCH_POINT_PROFILE_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
  const PREMATCH_POINT_PROFILE_PARTIAL_CACHE_TTL_MS = 10 * 60 * 1000;
  const PREMATCH_POINT_MATCH_CACHE_TTL_MS = 48 * 60 * 60 * 1000;
  const PREMATCH_POINT_PROFILE_CACHE_MAX_ENTRIES = 160;
  const PREMATCH_POINT_MATCH_CACHE_MAX_ENTRIES = 320;
  const PREMATCH_POINT_FETCH_CONCURRENCY = 1;
  const PREMATCH_POINT_CACHE_STORAGE_KEY = "__lvrPrematchPointCacheV5";
  const PREMATCH_POINT_CACHE_STORAGE_VERSION = 3;
  const MATCH_START_RULE_ID = String(
    globalThis.LvrStartMatchRule && globalThis.LvrStartMatchRule.RULE_ID || ""
  );
  const MATCH_START_PAIR_PROTOCOL = globalThis.LvrVerifiedPairRegimeV1
    && globalThis.LvrVerifiedPairRegimeV1.PROTOCOL || {};
  const MATCH_START_PAIR_GATE_ID = String(MATCH_START_PAIR_PROTOCOL.gateId || "");
  const PLAYER_MATCHES_CACHE_TTL_MS = 2 * 60 * 1000;
  const FRESH_FORM3_WEIGHTS = [0.5, 0.3, 0.2];
  const ARCHIVE_MAX_CANDIDATE_URLS = 60;
  const RESULTS_PATH = "/ce/table-tennis/";
  const LEGACY_TELEGRAM_RESULT_CRAWLER_STORAGE_KEY = "__lvrTelegramPredictionResultCrawler";
  const TELEGRAM_RESULT_AUTO_BACKFILL_INITIAL_DELAY_MS = 2 * 60 * 1000;
  const TELEGRAM_RESULT_PAGE_AUTO_BACKFILL_DELAY_MS = 5 * 1000;
  const TELEGRAM_RESULT_AUTO_BACKFILL_INTERVAL_MS = 10 * 60 * 1000;
  const TELEGRAM_RESULT_AUTO_BACKFILL_MIN_ROW_AGE_MS = 5 * 60 * 1000;
  const TELEGRAM_RESULT_AUTO_BACKFILL_LIMIT = 4;
  const TELEGRAM_RESULT_AUTO_BACKFILL_RETRY_MS = 15 * 60 * 1000;
  const TELEGRAM_RESULT_AUTO_BACKFILL_ERROR_RETRY_MS = 15 * 60 * 1000;
  const TELEGRAM_POINT_SNAPSHOT_MIN_SIDE_POINTS = 8;
  const TELEGRAM_POINT_SNAPSHOT_MIN_TOTAL_POINTS = 16;
  const PAGE_BRIDGE_SCRIPT_VERSION = "bsf-prematch-runtime-v6";
  const MAX_ARCHIVE_FETCH_CONCURRENCY = 5;
  const INLINE_FORECAST_LOADING_STALE_MS = 2 * 60 * 1000;
  const INLINE_FORECAST_COLLECTION_TIMEOUT_MS = 45 * 1000;
  const INLINE_FORECAST_ERROR_RETRY_MS = 60 * 1000;
  const INLINE_FORECAST_TRANSIENT_RETRY_MS = 12 * 1000;
  const INLINE_FORECAST_MAX_TRANSIENT_ATTEMPTS = 3;
  const INLINE_FORECAST_WORKER_LEASE_MS = INLINE_FORECAST_COLLECTION_TIMEOUT_MS + 5000;
  const RUNTIME_SETTINGS_TIMEOUT_MS = 6000;
  const RUNTIME_DELIVERY_TIMEOUT_MS = 22 * 1000;
  const BSPORTSFAN_TEXT_FETCH_TIMEOUT_MS = 15 * 1000;
  const BSPORTSFAN_NAVIGATION_PROTECTION_COOLDOWN_MS = 10 * 60 * 1000;
  const LIVE_SESSION_RECOVERY_STORAGE_KEY = "__lvrBsportsfanLiveSessionRecoveryV1";
  const LIVE_SESSION_RECOVERY_CHECK_INTERVAL_MS = 2000;
  const LIVE_SESSION_RECOVERY_HEALTHY_RESET_MS = 60 * 1000;
  const LIVE_SESSION_RECOVERY_ATTEMPT_WINDOW_MS = 10 * 60 * 1000;
  const LIVE_SESSION_RECOVERY_MAX_ATTEMPTS = 4;
  const PREMATCH_POINT_FETCH_TIMEOUT_MS = 22 * 1000;
  const PREMATCH_POINT_ENRICH_MIN_REMAINING_MS = 6500;
  const MATCH_START_ARCHIVE_MAX_AGE_MS = 5 * 60 * 1000;
  const INLINE_FORECAST_MAX_ROWS = 6;
  const INLINE_FORECAST_PREWARM_LOOKAHEAD_MS = 5 * 60 * 1000;
  const INLINE_FORECAST_FETCH_CONCURRENCY = 2;
  const INLINE_FORECAST_WORKER_CONCURRENCY = 1;
  const NETWORK_CACHE_MAX_ENTRIES = 48;
  const RUNTIME_STATE_MAX_ENTRIES = 200;
  const OPENING_ODDS_RECOVERY_DELAY_MS = 8000;
  const OPENING_ODDS_RECOVERY_TIMEOUT_MS = 15000;
  const OPENING_ODDS_RECOVERY_RETRY_DELAY_MS = 30 * 1000;
  const OPENING_ODDS_RECOVERY_MAX_ATTEMPTS = 2;
  const RUNTIME_POINT_SETS_CACHE_MS = 4000;
  const RUNTIME_POINT_SETS_REQUEST_THROTTLE_MS = 1200;
  const INTERACTIVE_DELAY_MS = 80;
  const inlineForecastState = new Map();
  const inlineForecastSeedState = new Map();
  const fetchTextCache = new Map();
  const matchSnapshotCache = new Map();
  const seedSnapshotCache = new Map();
  const listRowTextCache = new WeakMap();
  const playerMatchesCache = new Map();
  const oddsMarketCache = new Map();
  const oddsMarketNegativeCache = new Map();
  const openingOddsRecoveryDone = new Map();
  const openingOddsRowPatchState = new Map();
  const ODDS_MARKET_NEGATIVE_CACHE_MS = 2 * 60 * 1000;
  const prematchPointProfileCache = new Map();
  const prematchPointProfileInFlight = new Map();
  const prematchPointMatchCache = new Map();
  const prematchPointMatchInFlight = new Map();
  const prematchPointFetchQueue = [];
  const runtimePointSetsCache = new Map();
  const runtimePointSetsRequestState = new Map();
  const inlineAutoForecastQueue = new Map();
  const inlineAutoForecastActiveJobs = new Map();
  const inlineAutoForecastDone = new Set();
  const predictionPointSnapshotDone = new Map();
  const matchStartForecastStates = new Map();
  const matchStartTerminalRecoveryAttempted = new Set();
  const telegramResultUpdateState = new Set();
  let inlineForecastRunId = 0;
  let inlineAutoForecastJobId = 0;
  let matchStartSendAttemptId = 0;
  let inlineAutoForecastActiveWorkers = 0;
  let inlineForecastPreemptionCount = 0;
  let telegramSettingsCache = null;
  let telegramSettingsCacheTs = 0;
  let telegramSettingsRequest = null;
  let telegramResultAutoBackfillRunning = false;
  let telegramResultAutoBackfillLastSummary = null;
  let telegramOpeningOddsBackfillRunning = false;
  let telegramOpeningOddsBackfillLastSummary = null;
  let prematchPointCacheLoaded = false;
  let prematchPointCachePersistTimer = 0;
  let prematchPointFetchActive = 0;
  let bsportsfanNavigationProtectionOpenUntil = 0;
  let bsportsfanNavigationProtectionReason = "";
  let liveSessionRecoveryStarted = false;
  let liveSessionRecoveryTimer = 0;
  let liveSessionRecoveryObserver = null;
  let liveSessionRecoveryPreparation = null;
  let visibleChallengeActive = false;
  let visibleChallengeLastReportedAt = 0;
  let visibleHealthyReported = false;
  const telegramResultAutoBackfillRetryAt = new Map();

  let mutationTimer = 0;
  let lastSnapshotUpdateTs = 0;
  let lastHiddenListUpdateTs = 0;
  let lastSnapshotKey = "";
  let lastStatusReportTs = 0;

  whenDocumentReady(() => {
    clearLegacyTelegramPredictionResultCrawlerState();
    installProductionBridge();
    installRuntimeListener();
    installLiveSessionRecovery();
    installMutationObserver();
    installCipTableTennisAutoReload();
    installTelegramPredictionResultAutoBackfill();
    updateSnapshot("ready");
    window.setInterval(() => updateSnapshot("interval"), UPDATE_INTERVAL_MS);
  });

  function clearLegacyTelegramPredictionResultCrawlerState() {
    try {
      if (window.localStorage) {
        window.localStorage.removeItem(LEGACY_TELEGRAM_RESULT_CRAWLER_STORAGE_KEY);
      }
    } catch (_) {
      // Legacy state is optional and must never block the active parser.
    }
  }

  function whenDocumentReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
      return;
    }

    callback();
  }

  function installCipTableTennisAutoReload() {
    if (!isCipTableTennisAutoReloadPage() || window.__lvrBsfCipTableTennisAutoReloadInstalled) {
      return;
    }

    if (recoverTableTennisMonitorPage()) {
      return;
    }

    window.__lvrBsfCipTableTennisAutoReloadInstalled = true;
  }

  function installLiveSessionRecovery() {
    if (window.__lvrBsportsfanLiveSessionRecoveryInstalled) {
      return;
    }
    window.__lvrBsportsfanLiveSessionRecoveryInstalled = true;

    const check = () => {
      maybeRecoverExpiredLiveSession();
    };
    check();
    window.setInterval(check, LIVE_SESSION_RECOVERY_CHECK_INTERVAL_MS);

    if (document.body && typeof MutationObserver !== "undefined") {
      liveSessionRecoveryObserver = new MutationObserver(check);
      liveSessionRecoveryObserver.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: ["class", "style", "aria-hidden"]
      });
    }

    window.setTimeout(() => {
      if (!liveSessionRecoveryStarted && !getExpiredLiveSessionToast()) {
        clearLiveSessionRecoveryHistory();
      }
    }, LIVE_SESSION_RECOVERY_HEALTHY_RESET_MS);
  }

  function maybeRecoverExpiredLiveSession() {
    if (
      liveSessionRecoveryStarted
      || !isBsportsfanTableTennisPage()
    ) {
      return false;
    }
    const toast = getExpiredLiveSessionToast();
    if (!toast) {
      return false;
    }
    return beginLiveSessionRecovery(toast, "live-session-expired");
  }

  function beginLiveSessionRecovery(toast = null, reason = "live-session-expired") {
    if (liveSessionRecoveryStarted || !isBsportsfanTableTennisPage()) {
      return false;
    }
    liveSessionRecoveryStarted = true;
    inlineAutoForecastQueue.clear();
    for (const job of inlineAutoForecastActiveJobs.values()) {
      if (!job) continue;
      job.preemptRequested = true;
      job.preemptedBy = "live-session-recovery";
      job.preemptRequestedAt = Date.now();
    }

    const recovery = registerLiveSessionRecoveryAttempt();
    liveSessionRecoveryPreparation = sendRuntimeMessage({
      type: "lvr:prepareBsportsfanLiveSessionRecovery",
      detectedAt: recovery.detectedAt,
      attempt: recovery.attempt
    }).catch(() => null);
    window.__lvrBsportsfanLiveSessionRecovery = {
      active: true,
      detectedAt: recovery.detectedAt,
      attempt: recovery.attempt,
      delayMs: recovery.delayMs,
      reloadAt: recovery.detectedAt + recovery.delayMs,
      reason: recovery.exhausted
        ? "live-session-recovery-limit"
        : normalizeText(reason || "live-session-expired")
    };
    reportLiveSessionRecoveryStatus("reconnecting", recovery);

    liveSessionRecoveryTimer = window.setTimeout(() => {
      liveSessionRecoveryTimer = 0;
      performLiveSessionRecovery(toast, recovery);
    }, recovery.delayMs);
    return true;
  }

  function getExpiredLiveSessionToast(doc = document) {
    const root = doc && typeof doc.querySelector === "function"
      ? doc.querySelector("#authToast.show,#authToast.showing")
      : null;
    if (!root || root.getAttribute("aria-hidden") === "true") {
      return null;
    }
    const text = normalizeSearchText(root.textContent || "");
    const expired = (
      text.includes("security alert")
      && text.includes("live session has expired")
    ) || text.includes("refresh to reconnect");
    if (!expired) {
      return null;
    }
    const style = root.style || {};
    const inlineVisible = style.display !== "none" && style.visibility !== "hidden";
    if (!inlineVisible) {
      return null;
    }
    if (typeof window.getComputedStyle === "function") {
      const computed = window.getComputedStyle(root);
      if (computed && (computed.display === "none" || computed.visibility === "hidden")) {
        return null;
      }
    }
    return root;
  }

  function registerLiveSessionRecoveryAttempt() {
    const now = Date.now();
    const previous = readLiveSessionRecoveryHistory();
    const attempts = (Array.isArray(previous.attempts) ? previous.attempts : [])
      .map(Number)
      .filter((value) => Number.isFinite(value) && now - value <= LIVE_SESSION_RECOVERY_ATTEMPT_WINDOW_MS);
    attempts.push(now);
    const attempt = attempts.length;
    const delays = [300, 2500, 8000, 20000, 60000];
    const exhausted = attempt > LIVE_SESSION_RECOVERY_MAX_ATTEMPTS;
    const delayMs = exhausted
      ? 2 * 60 * 1000
      : delays[Math.min(delays.length - 1, attempt - 1)];
    writeLiveSessionRecoveryHistory({
      attempts,
      lastDetectedAt: now,
      lastUrl: normalizeUrl(location.href)
    });
    return {
      detectedAt: now,
      attempt,
      delayMs,
      exhausted
    };
  }

  function performLiveSessionRecovery(toast, recovery) {
    reportLiveSessionRecoveryStatus("reloading", recovery);
    let reloadTriggered = false;
    const triggerReload = () => {
      if (reloadTriggered) {
        return;
      }
      reloadTriggered = true;
      const button = toast && toast.querySelector
        ? toast.querySelector("button[onclick*='reload'],button")
        : null;
      try {
        if (button && typeof button.click === "function") {
          button.click();
        } else {
          window.location.reload();
          return;
        }
      } catch (_) {
        window.location.reload();
        return;
      }

      // The site's own reconnect button normally navigates immediately. If its
      // inline handler is blocked or stops responding, force the same reload.
      liveSessionRecoveryTimer = window.setTimeout(() => {
        liveSessionRecoveryTimer = 0;
        window.location.reload();
      }, 1500);
    };
    const preparationTimeout = window.setTimeout(triggerReload, 1200);
    Promise.resolve(liveSessionRecoveryPreparation)
      .catch(() => null)
      .finally(() => {
        window.clearTimeout(preparationTimeout);
        triggerReload();
      });
  }

  function reportLiveSessionRecoveryStatus(stage, recovery) {
    sendRuntimeMessage({
      type: "lvr:setScanStatus",
      status: {
        message: stage === "reloading"
          ? "bsportsfan live session reload"
          : stage === "manual-required"
            ? "bsportsfan live session requires manual reconnect"
          : "bsportsfan live session expired",
        candidates: 0,
        sample: [stage === "manual-required"
          ? "Live-сессия не восстановилась — нажмите Refresh to Reconnect"
          : "Live-сессия истекла — переподключаюсь"],
        bsportsfan: {
          source: "bsportsfan",
          sessionRecovery: {
            active: true,
            stage: normalizeText(stage || ""),
            attempt: Number(recovery && recovery.attempt || 1),
            delayMs: Number(recovery && recovery.delayMs || 0),
            detectedAt: Number(recovery && recovery.detectedAt || Date.now())
          }
        }
      }
    }).catch(() => {});
  }

  function readLiveSessionRecoveryHistory() {
    try {
      const raw = window.sessionStorage && window.sessionStorage.getItem(
        LIVE_SESSION_RECOVERY_STORAGE_KEY
      );
      const parsed = raw ? JSON.parse(raw) : null;
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (_) {
      return {};
    }
  }

  function writeLiveSessionRecoveryHistory(value) {
    try {
      if (window.sessionStorage) {
        window.sessionStorage.setItem(
          LIVE_SESSION_RECOVERY_STORAGE_KEY,
          JSON.stringify(value && typeof value === "object" ? value : {})
        );
      }
    } catch (_) {
      // Recovery must still proceed when sessionStorage is unavailable.
    }
  }

  function clearLiveSessionRecoveryHistory() {
    try {
      if (window.sessionStorage) {
        window.sessionStorage.removeItem(LIVE_SESSION_RECOVERY_STORAGE_KEY);
      }
    } catch (_) {
      // Optional loop-protection state.
    }
  }

  function recoverTableTennisMonitorPage() {
    const url = parseUrl(location.href);
    const currentPath = normalizeCipTableTennisAutoReloadPath(url && url.pathname);
    if (
      currentPath !== CIP_TABLE_TENNIS_AUTO_RELOAD_PATH
      || !isBsportsfanNotFoundDocument(document)
      || window.__lvrBsfTableTennisMonitorRecoveryStarted
    ) {
      return false;
    }
    window.__lvrBsfTableTennisMonitorRecoveryStarted = true;
    window.location.replace(normalizeUrl(TABLE_TENNIS_CATEGORY_PATH, location.origin));
    return true;
  }

  function isBsportsfanNotFoundDocument(doc) {
    const title = normalizeText(doc && doc.title || "");
    const sample = normalizeText(doc && doc.body && doc.body.textContent || "").slice(0, 300);
    return /(?:^|\s)404(?:\s|$)/.test(`${title} ${sample}`)
      || /(?:не\s+найден|страница\s+не\s+найдена|not\s+found)/i.test(`${title} ${sample}`);
  }

  function isCipTableTennisAutoReloadPage() {
    const url = parseUrl(location.href);
    const path = normalizeCipTableTennisAutoReloadPath(url && url.pathname);
    return Boolean(url
      && url.protocol === "https:"
      && url.hostname === "ru.bsportsfan.com"
      && [CIP_TABLE_TENNIS_AUTO_RELOAD_PATH, TABLE_TENNIS_CATEGORY_PATH].includes(path)
      && !url.search);
  }

  function normalizeCipTableTennisAutoReloadPath(pathname) {
    return `/${String(pathname || "").replace(/^\/+|\/+$/g, "")}`
      .replace(/_/g, "-")
      .toLowerCase();
  }

  function installRuntimeListener() {
    if (
      typeof chrome === "undefined"
      || !chrome.runtime
      || !chrome.runtime.onMessage
      || !chrome.runtime.onMessage.addListener
    ) {
      return;
    }

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (!message || (
        message.type !== "lvr:collectNow"
        && message.type !== "lvr:collectPlayerArchive"
        && message.type !== "lvr:telegramAction"
      )) {
        return false;
      }

      if (message.type === "lvr:telegramAction") {
        handleTelegramProductionAction(message.detail || {})
          .then((value) => sendResponse({ ok: true, value }))
          .catch((error) => sendResponse({ ok: false, error: stringifyError(error) }));
        return true;
      }

      if (message.type === "lvr:collectPlayerArchive") {
        collectPlayerArchive()
          .then((archive) => sendResponse({ ok: true, archive, snapshot: window.__liveValueRadarBsportsfanSnapshot || null }))
          .catch((error) => sendResponse({ ok: false, error: stringifyError(error) }));
        return true;
      }

      const snapshot = buildBsportsfanSnapshot("manual");
      window.__liveValueRadarBsportsfanSnapshot = snapshot;
      reportStatus(snapshot, true);
      sendResponse({ ok: true, snapshot });
      return true;
    });
  }

  function installProductionBridge() {
    installRuntimePointSetsBridgeListener();
    injectRuntimePointSetsBridge();
  }

  async function handleTelegramProductionAction(detail = {}) {
    const action = normalizeText(detail && detail.action || "");
    if (action === "runResultAutoBackfill" || action === "autoBackfillResults") {
      return maybeRunTelegramPredictionResultAutoBackfill("popup", { ...(detail || {}), force: true });
    }
    if (action === "resultAutoBackfillStatus") {
      return telegramResultAutoBackfillLastSummary || {
        running: telegramResultAutoBackfillRunning,
        status: "idle"
      };
    }
    if (action === "runOpeningOddsBackfill" || action === "backfillOpeningOdds") {
      return runTelegramPredictionOpeningOddsBackfill({ ...(detail || {}) });
    }
    if (action === "openingOddsBackfillStatus") {
      return telegramOpeningOddsBackfillLastSummary || {
        running: telegramOpeningOddsBackfillRunning,
        status: "idle"
      };
    }
    throw new Error(`Unsupported production action: ${action || "empty"}`);
  }

  function installRuntimePointSetsBridgeListener() {
    if (window.__lvrBsportsfanRuntimePointSetsListenerInstalled) {
      return;
    }
    window.__lvrBsportsfanRuntimePointSetsListenerInstalled = true;
    window.addEventListener("lvr:bsportsfanRuntimePointSetsResult", (event) => {
      const detail = parseRuntimeBridgeDetail(event && event.detail);
      const url = normalizeUrl(detail && detail.url || location.href);
      if (!url) {
        return;
      }
      runtimePointSetsRequestState.delete(url);
      const pointSets = normalizeRuntimePointSets(detail && detail.pointSets);
      runtimePointSetsCache.set(url, {
        ts: Date.now(),
        pointSets,
        chartCount: Number(detail && detail.chartCount || 0),
        source: detail && detail.source || "page-bridge"
      });
      if (pointSets.length && normalizeUrl(location.href) === url) {
        updateSnapshot("runtime-highcharts");
      }
    });
    window.addEventListener("lvr:bsportsfanRuntimeBridgeReady", () => {
      const url = normalizeUrl(location.href);
      if (url) {
        runtimePointSetsRequestState.delete(url);
      }
      requestRuntimePointSets("bridge-ready").catch(() => {});
    });
  }

  function parseRuntimeBridgeDetail(detail) {
    if (!detail) {
      return {};
    }
    if (typeof detail === "string") {
      try {
        return JSON.parse(detail);
      } catch (_) {
        return {};
      }
    }
    if (typeof detail === "object") {
      return detail;
    }
    return {};
  }

  function requestRuntimePointSets(reason = "snapshot") {
    const url = normalizeUrl(location.href);
    if (!url || !isBsportsfanMatchUrl(url)) {
      return Promise.resolve(null);
    }
    injectRuntimePointSetsBridge();

    const state = runtimePointSetsRequestState.get(url) || {};
    const now = Date.now();
    if (state.pending || now - Number(state.ts || 0) < RUNTIME_POINT_SETS_REQUEST_THROTTLE_MS) {
      return Promise.resolve(null);
    }

    const id = `${now}-${Math.random().toString(16).slice(2)}`;
    runtimePointSetsRequestState.set(url, { id, ts: now, pending: true, reason });
    window.dispatchEvent(new CustomEvent("lvr:getBsportsfanRuntimePointSets", {
      detail: JSON.stringify({ id, url, reason })
    }));
    window.setTimeout(() => {
      const latest = runtimePointSetsRequestState.get(url);
      if (latest && latest.id === id) {
        runtimePointSetsRequestState.delete(url);
      }
    }, 3000);
    return Promise.resolve({ id, url });
  }

  function requestRuntimePointSetsForSnapshot(snapshot, reason = "snapshot") {
    if (!snapshot || snapshot.pageType !== "match" || !isBsportsfanMatchUrl(snapshot.url || location.href)) {
      return;
    }
    if (normalizeUrl(snapshot.url || "") !== normalizeUrl(location.href)) {
      return;
    }
    requestRuntimePointSets(reason).catch(() => {});
  }

  function getCachedRuntimePointSets(url) {
    const key = normalizeUrl(url || location.href);
    if (!key || key !== normalizeUrl(location.href)) {
      return [];
    }
    const cached = runtimePointSetsCache.get(key);
    if (!cached || Date.now() - Number(cached.ts || 0) > RUNTIME_POINT_SETS_CACHE_MS) {
      return [];
    }
    return normalizeRuntimePointSets(cached.pointSets);
  }

  function normalizeRuntimePointSets(pointSets) {
    return (Array.isArray(pointSets) ? pointSets : [])
      .map((set, setIndex) => {
        const series = Array.isArray(set && set.series) ? set.series : [];
        if (series.length < 2) {
          return null;
        }
        const normalizedSeries = series.map((serie) => ({
          name: normalizeText(serie && serie.name || ""),
          color: normalizeText(serie && serie.color || ""),
          points: (Array.isArray(serie && serie.points) ? serie.points : [])
            .map((point, pointIndex) => ({
              x: Number.isFinite(Number(point && point.x)) ? Number(point.x) : pointIndex + 1,
              y: Number(point && point.y)
            }))
            .filter((point) => Number.isFinite(point.y))
        })).filter((serie) => serie.points.length);
        return normalizedSeries.length >= 2
          ? { set: Number(set && set.set || setIndex + 1), series: normalizedSeries }
          : null;
      })
      .filter(Boolean)
      .sort((left, right) => Number(left.set || 0) - Number(right.set || 0));
  }

  function normalizeExactPlayerFullName(value) {
    return normalizeText(value).normalize("NFKC").toLowerCase();
  }

  function alignPointSetsToCanonicalPlayers(pointSets, players) {
    const canonicalPlayers = (Array.isArray(players) ? players : [])
      .slice(0, 2)
      .map(normalizeExactPlayerFullName);
    if (
      canonicalPlayers.length < 2
      || canonicalPlayers.some((name) => !name)
      || canonicalPlayers[0] === canonicalPlayers[1]
    ) {
      return [];
    }

    const aligned = [];
    for (const set of Array.isArray(pointSets) ? pointSets : []) {
      const series = Array.isArray(set && set.series) ? set.series : [];
      const matches = canonicalPlayers.map((playerName) => series
        .map((serie, index) => ({ serie, index }))
        .filter(({ serie }) => normalizeExactPlayerFullName(serie && serie.name || "") === playerName));
      if (
        matches.some((playerMatches) => playerMatches.length !== 1)
        || matches[0][0].index === matches[1][0].index
      ) {
        return [];
      }
      aligned.push({
        ...set,
        series: [matches[0][0].serie, matches[1][0].serie]
      });
    }
    return aligned;
  }

  function injectRuntimePointSetsBridge() {
    const root = document.documentElement;
    if (
      !root
      || typeof chrome === "undefined"
      || !chrome.runtime
      || !chrome.runtime.getURL
    ) {
      return;
    }

    if (
      root.dataset.lvrBsportsfanRuntimeBridge !== "1"
      || root.dataset.lvrBsportsfanRuntimeBridgeVersion !== PAGE_BRIDGE_SCRIPT_VERSION
    ) {
      root.dataset.lvrBsportsfanRuntimeBridge = "1";
      root.dataset.lvrBsportsfanRuntimeBridgeVersion = PAGE_BRIDGE_SCRIPT_VERSION;
      const script = document.createElement("script");
      script.src = `${chrome.runtime.getURL("src/content/bsportsfan-page-bridge.js")}?v=${encodeURIComponent(PAGE_BRIDGE_SCRIPT_VERSION)}`;
      script.async = false;
      script.onload = () => script.remove();
      (document.head || root).appendChild(script);
    }

  }

  function installMutationObserver() {
    if (!document.body || typeof MutationObserver === "undefined") {
      return;
    }

    const observer = new MutationObserver(() => {
      if (document.hidden && isBsportsfanTableTennisListPage()) {
        if (Date.now() - lastSnapshotUpdateTs >= MUTATION_MIN_UPDATE_INTERVAL_MS) {
          if (mutationTimer) {
            window.clearTimeout(mutationTimer);
            mutationTimer = 0;
          }
          updateSnapshot("mutation");
        }
        return;
      }
      if (mutationTimer) {
        return;
      }

      const delay = Math.max(
        MUTATION_DELAY_MS,
        MUTATION_MIN_UPDATE_INTERVAL_MS - (Date.now() - lastSnapshotUpdateTs)
      );

      mutationTimer = window.setTimeout(() => {
        mutationTimer = 0;
        updateSnapshot("mutation");
      }, delay);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  function updateSnapshot(reason) {
    if (mutationTimer) {
      window.clearTimeout(mutationTimer);
      mutationTimer = 0;
    }

    if (!isBsportsfanTableTennisPage()) {
      return;
    }
    if (liveSessionRecoveryStarted || maybeRecoverExpiredLiveSession()) {
      return;
    }
    if (pauseForVisibleBsportsfanChallenge()) {
      return;
    }

    const now = Date.now();
    if (document.hidden && reason !== "manual") {
      if (
        !isBsportsfanTableTennisListPage()
        || now - lastHiddenListUpdateTs < HIDDEN_LIST_UPDATE_INTERVAL_MS
      ) {
        return;
      }
      lastHiddenListUpdateTs = now;
    }
    lastSnapshotUpdateTs = now;
    maintainInlineForecastScheduler(now);

    const snapshot = buildBsportsfanSnapshot(reason);
    const forecastSuppressed = isForecastSuppressedOnCurrentPage();
    if (forecastSuppressed) {
      clearInlineForecastQueueForCurrentResultsPage();
    }
    if (!forecastSuppressed) {
      requestRuntimePointSetsForSnapshot(snapshot, reason);
    }
    const key = buildSnapshotRenderKey(snapshot);

    window.__liveValueRadarBsportsfanSnapshot = snapshot;
    if (key === lastSnapshotKey && reason !== "manual") {
      enhanceListForecastControls(snapshot);
      updateMatchPageForecastState(snapshot);
      return;
    }

    lastSnapshotKey = key;
    enhanceListForecastControls(snapshot);
    updateMatchPageForecastState(snapshot);
    reportStatus(snapshot, false);
  }

  function pauseForVisibleBsportsfanChallenge() {
    const challenged = isBsportsfanDocumentChallenge(document);
    if (!challenged) {
      if (visibleChallengeActive || !visibleHealthyReported) {
        visibleChallengeActive = false;
        visibleChallengeLastReportedAt = 0;
        visibleHealthyReported = true;
        bsportsfanNavigationProtectionOpenUntil = 0;
        bsportsfanNavigationProtectionReason = "";
        sendRuntimeMessage({
          type: "lvr:reportBsportsfanHealthy",
          observedAt: Date.now(),
          url: normalizeUrl(location.href)
        }).catch(() => {});
      }
      return false;
    }

    const now = Date.now();
    visibleChallengeActive = true;
    visibleHealthyReported = false;
    inlineAutoForecastQueue.clear();
    for (const job of inlineAutoForecastActiveJobs.values()) {
      if (!job) continue;
      job.preemptRequested = true;
      job.preemptedBy = "visible-security-challenge";
      job.preemptRequestedAt = now;
    }

    if (now - visibleChallengeLastReportedAt >= 30 * 1000) {
      visibleChallengeLastReportedAt = now;
      sendRuntimeMessage({
        type: "lvr:reportBsportsfanProtection",
        reason: "visible-bsportsfan-security-challenge",
        code: "bsportsfan-challenge",
        retryAfterMs: BSPORTSFAN_NAVIGATION_PROTECTION_COOLDOWN_MS,
        observedAt: now,
        url: normalizeUrl(location.href)
      }).catch(() => {});
      sendRuntimeMessage({
        type: "lvr:setScanStatus",
        status: {
          source: "bsportsfan-protection",
          message: "BSportsFan просит пройти проверку",
          candidates: 0,
          sample: ["Откройте вкладку BSportsFan и завершите проверку безопасности"],
          bsportsfan: {
            challenge: true,
            observedAt: now
          }
        }
      }).catch(() => {});
    }
    return true;
  }

  function buildSnapshotRenderKey(snapshot) {
    const completedSetScores = getSnapshotCompletedSetScores(snapshot);
    const currentPointScore = getSnapshotLiveCurrentPointScore(snapshot, completedSetScores);
    return JSON.stringify([
      snapshot && snapshot.pageType || "",
      (snapshot && snapshot.matches || []).map((match) => [
        match && match.url || "",
        match && match.score || "",
        match && match.liveScore || "",
        match && match.dateTs || 0
      ]),
      snapshot && snapshot.players || [],
      snapshot && snapshot.setScores || [],
      currentPointScore ? `${currentPointScore.left}-${currentPointScore.right}` : "",
      buildPointSetsRenderKey(snapshot && snapshot.pointSets),
      snapshot && snapshot.serveReturn && getServeReturnStats(snapshot.serveReturn)
    ]);
  }

  function buildPointSetsRenderKey(pointSets) {
    return (Array.isArray(pointSets) ? pointSets : []).map((set) => {
      const finalScore = getPointSetFinalScore(set);
      const series = (Array.isArray(set && set.series) ? set.series : [])
        .slice(0, 2)
        .map((serie) => [
          normalizeText(serie && serie.name || ""),
          Array.isArray(serie && serie.points) ? serie.points.length : 0,
          lastPointValue(serie && serie.points)
        ]);
      return [
        Number(set && set.set || 0),
        finalScore ? `${finalScore.left}-${finalScore.right}` : "",
        series
      ];
    });
  }

  function buildBsportsfanSnapshot(reason) {
    return buildBsportsfanSnapshotFromDocument(document, location.href, reason);
  }

  function buildBsportsfanSnapshotFromDocument(doc, url, reason) {
    const isMatchPage = isBsportsfanMatchUrl(url);
    const isPlayerPage = isBsportsfanPlayerUrl(url);
    const staticPointSets = isMatchPage ? parseHighchartsPointSets(doc) : [];
    const runtimePointSets = isMatchPage ? getCachedRuntimePointSets(url) : [];
    const rawPointSets = runtimePointSets.length ? runtimePointSets : staticPointSets;
    const scoreTable = isMatchPage ? parseScoreTable(doc) : { players: [], setScores: [] };
    const listMatches = isMatchPage ? [] : parseListMatches(doc, url);
    const playerLinks = isMatchPage || isPlayerPage ? parsePlayerLinks(doc, url) : [];
    const playerPageName = isPlayerPage ? parsePlayerPageName(doc, url) : "";
    const matchPagePlayers = isMatchPage ? parseMatchPagePlayers(doc, url, playerLinks) : [];
    const matchDate = isMatchPage ? parseMatchPageDate(doc, url) : { date: "", dateTs: 0 };
    const oddsMarket = isMatchPage ? parseOddsMarketFromDocument(doc, url, { matchDateTs: matchDate.dateTs }) : null;
    const textSample = buildSnapshotTextSample(doc, url);
    const players = scoreTable.players.length >= 2
      ? scoreTable.players
      : matchPagePlayers.length >= 2
        ? matchPagePlayers
        : rawPointSets[0] && rawPointSets[0].series.length >= 2
          ? rawPointSets[0].series.slice(0, 2).map((serie) => serie.name)
          : playerPageName
            ? [playerPageName]
            : [];
    const pointSets = alignPointSetsToCanonicalPlayers(rawPointSets, players);
    const setScores = scoreTable.setScores.length
      ? scoreTable.setScores
      : inferSetScoresFromPointSets(pointSets);
    const serveReturn = calculateServeReturnFromPointSets(pointSets, players);
    const matchPageState = isMatchPage
      ? detectMatchPageState(doc, setScores, pointSets, matchDate.dateTs, players)
      : null;

    return {
      source: "bsportsfan",
      reason,
      ts: Date.now(),
      url,
      title: normalizeText(doc && doc.title || ""),
      matchDate: matchDate.date,
      matchDateTs: matchDate.dateTs,
      pageType: pointSets.length || scoreTable.players.length
        ? "match"
        : isBsportsfanMatchUrl(url) && players.length >= 2
          ? "match"
          : isBsportsfanPlayerUrl(url)
            ? "player"
            : "list",
      players,
      playerLinks,
      setScores,
      pointSets,
      serveReturn,
      oddsMarket,
      matches: listMatches,
      league: parseSnapshotLeague(doc, url, textSample),
      textSample,
      matchState: matchPageState && matchPageState.matchState || "",
      matchStateSource: matchPageState ? "match-page" : "",
      matchStateEvidence: matchPageState && matchPageState.matchStateEvidence || ""
    };
  }

  function detectMatchPageState(doc, setScores, pointSets, matchDateTs, players) {
    const completed = uniqueSetScores(setScores)
      .filter((score) => isCompletedTableTennisSet(score && score.left, score && score.right));
    const wins = [0, 0];
    for (const score of completed) {
      wins[Number(score.left) > Number(score.right) ? 0 : 1] += 1;
    }
    const targetSetNumber = completed.length + 1;
    const tablePointScore = getLiveCurrentPointScoreFromSetScores(setScores, targetSetNumber);
    const pointSet = (Array.isArray(pointSets) ? pointSets : [])
      .find((set, index) => Number(set && set.set || index + 1) === targetSetNumber);
    const graphPointScore = normalizeLiveCurrentPointScore(
      getPointSetFinalScore(pointSet),
      targetSetNumber,
      "point-graph"
    );
    const currentPointScore = tablePointScore || graphPointScore;
    const scoreStarted = completed.length > 0 || Boolean(
      currentPointScore
      && Number(currentPointScore.left) + Number(currentPointScore.right) > 0
    );
    const statusText = normalizeText(
      Array.from(doc && doc.querySelectorAll
        ? doc.querySelectorAll(".badge,.status,[class*='status'],[class*='live'],[data-status]")
        : [])
        .slice(0, 40)
        .map((node) => node && (node.getAttribute && node.getAttribute("data-status") || node.textContent) || "")
        .join(" ")
    );
    const pageText = normalizeText(doc && doc.body && doc.body.innerText || "").slice(0, 1600);
    const finished = Math.max(...wins) >= 3
      || /\b(?:finished|completed|ended)\b/i.test(statusText)
      || /\b(?:законч|заверш|итог)\w*\b/i.test(statusText);
    if (finished) {
      return { matchState: "finished", matchStateEvidence: "finished-marker" };
    }
    if (scoreStarted) {
      return { matchState: "live", matchStateEvidence: "score" };
    }
    const hasLiveMarker = /\b(?:live|in\s*play|playing)\b/i.test(statusText)
      || /\b(?:лайв|прямой\s+эфир|в\s+игре)\b/i.test(statusText)
      || Boolean(setScores && setScores.length) && (
        /\b(?:live|in\s*play|playing)\b/i.test(pageText)
        || /\b(?:лайв|прямой\s+эфир|в\s+игре)\b/i.test(pageText)
      );
    if (hasLiveMarker && Array.isArray(players) && players.length >= 2) {
      return { matchState: "live", matchStateEvidence: "live-marker" };
    }
    const hasPrematchMarker = /\b(?:not\s*started|scheduled|upcoming)\b/i.test(statusText)
      || /\b(?:не\s*нач|ожида|заплан)\w*\b/i.test(statusText)
      || Number(matchDateTs || 0) > Date.now();
    return hasPrematchMarker
      ? { matchState: "prematch", matchStateEvidence: "prematch-marker" }
      : { matchState: "unknown", matchStateEvidence: "none" };
  }

  function buildSnapshotTextSample(doc, url) {
    if (!doc) {
      return "";
    }

    if (isBsportsfanTableTennisListUrl(url)) {
      const snippets = [
        doc.title || "",
        ...Array.from(doc.querySelectorAll("h1,h2,h3,.card-title,.breadcrumb,a[href*='/table-tennis/l/']"))
          .slice(0, 20)
          .map((node) => normalizeText(node && node.textContent || "")),
        ...Array.from(doc.querySelectorAll("tbody tr,.card-hover"))
          .slice(0, 8)
          .map((row) => getListRowTextWithoutOwnWidgets(row))
      ];
      return normalizeText(snippets.filter(Boolean).join(" ")).slice(0, 500);
    }

    return normalizeText(doc.body && doc.body.innerText || "").slice(0, 500);
  }

  function buildBsportsfanSeedSnapshotFromDocument(doc, url, reason) {
    const scoreTable = parseScoreTable(doc);
    const listMatches = parseListMatches(doc, url);
    const playerLinks = parsePlayerLinks(doc, url);
    const playerPageName = parsePlayerPageName(doc, url);
    const matchPagePlayers = parseMatchPagePlayers(doc, url, playerLinks);
    const matchDate = parseMatchPageDate(doc, url);
    const oddsMarket = parseOddsMarketFromDocument(doc, url, { matchDateTs: matchDate.dateTs });
    const textSample = normalizeText(doc && doc.body && doc.body.innerText || "").slice(0, 500);
    const players = scoreTable.players.length >= 2
      ? scoreTable.players
      : matchPagePlayers.length >= 2
        ? matchPagePlayers
        : playerPageName
          ? [playerPageName]
          : [];

    return {
      source: "bsportsfan",
      reason,
      ts: Date.now(),
      url,
      title: normalizeText(doc && doc.title || ""),
      matchDate: matchDate.date,
      matchDateTs: matchDate.dateTs,
      pageType: isBsportsfanMatchUrl(url) && players.length >= 2
        ? "match"
        : isBsportsfanPlayerUrl(url)
          ? "player"
          : "list",
      players,
      playerLinks,
      setScores: scoreTable.setScores,
      pointSets: [],
      serveReturn: null,
      oddsMarket,
      matches: listMatches,
      league: parseSnapshotLeague(doc, url, textSample),
      textSample
    };
  }

  function calculateServeReturnFromPointSets(pointSets, players) {
    const sets = alignPointSetsToCanonicalPlayers(pointSets, players)
      .map(buildPointWinnersForSet)
      .filter((set) => set && set.points.length);
    if (!sets.length) {
      return null;
    }

    const variants = [0, 1].map((firstSetFirstServerIndex) => (
      buildServeReturnBySetAlternation(sets, firstSetFirstServerIndex, players)
    ));
    const estimate = buildUnknownFirstServerServeReturnEstimate(variants, players);

    return {
      source: "point-by-point",
      mode: "graph-calculated",
      firstServerKnown: false,
      firstSetFirstServerIndex: null,
      firstSetFirstServerName: "",
      note: "Посчитано по графикам: первый подающий не указан на странице, serve/receive усреднены по двум допустимым вариантам.",
      setCount: sets.length,
      pointCount: sets.reduce((sum, set) => sum + set.points.length, 0),
      players: players.slice(0, 2),
      stats: estimate.players,
      estimate: estimate.players,
      selected: estimate,
      variants
    };
  }

  function buildPointWinnersForSet(pointSet) {
    const series = pointSet && Array.isArray(pointSet.series) ? pointSet.series.slice(0, 2) : [];
    if (series.length < 2) {
      return null;
    }

    const leftPoints = Array.isArray(series[0].points) ? series[0].points : [];
    const rightPoints = Array.isArray(series[1].points) ? series[1].points : [];
    const pointCount = Math.min(leftPoints.length, rightPoints.length);
    const points = [];
    let previousLeft = 0;
    let previousRight = 0;

    for (let index = 0; index < pointCount; index += 1) {
      const left = Number(leftPoints[index] && leftPoints[index].y);
      const right = Number(rightPoints[index] && rightPoints[index].y);
      if (!Number.isFinite(left) || !Number.isFinite(right)) {
        continue;
      }

      const leftDelta = left - previousLeft;
      const rightDelta = right - previousRight;
      if (leftDelta === 1 && rightDelta === 0) {
        points.push({ winnerIndex: 0, scoreBefore: [previousLeft, previousRight], scoreAfter: [left, right] });
      } else if (rightDelta === 1 && leftDelta === 0) {
        points.push({ winnerIndex: 1, scoreBefore: [previousLeft, previousRight], scoreAfter: [left, right] });
      }

      previousLeft = left;
      previousRight = right;
    }

    return {
      set: pointSet.set,
      points
    };
  }

  function inferSetScoresFromPointSets(pointSets) {
    return (Array.isArray(pointSets) ? pointSets : [])
      .map((set, index) => {
        const score = getPointSetFinalScore(set);
        if (!score) {
          return null;
        }
        return {
          set: Number(set && set.set || index + 1),
          left: score.left,
          right: score.right
        };
      })
      .filter(Boolean);
  }

  function getPointSetFinalScore(pointSet) {
    const series = pointSet && Array.isArray(pointSet.series) ? pointSet.series.slice(0, 2) : [];
    if (series.length >= 2) {
      const left = lastPointValue(series[0] && series[0].points);
      const right = lastPointValue(series[1] && series[1].points);
      if (Number.isFinite(Number(left)) && Number.isFinite(Number(right))) {
        return { left: Number(left), right: Number(right) };
      }
    }

    const points = Array.isArray(pointSet && pointSet.points) ? pointSet.points : [];
    const lastPoint = points[points.length - 1];
    const after = Array.isArray(lastPoint && lastPoint.scoreAfter) ? lastPoint.scoreAfter : [];
    const left = Number(after[0]);
    const right = Number(after[1]);
    return Number.isFinite(left) && Number.isFinite(right)
      ? { left, right }
      : null;
  }

  function buildServeReturnBySetAlternation(sets, firstSetFirstServerIndex, players) {
    const stats = [
      createServeReturnSide(players[0] || ""),
      createServeReturnSide(players[1] || "")
    ];
    const setSummaries = [];

    for (let setIndex = 0; setIndex < sets.length; setIndex += 1) {
      const set = sets[setIndex];
      const firstServerIndex = getFirstServerIndexForSet(set, setIndex, firstSetFirstServerIndex);
      const setStats = [createServeReturnSide(players[0] || ""), createServeReturnSide(players[1] || "")];
      const hadClosingLead = [false, false];
      let currentStreakWinner = null;
      let currentStreakLength = 0;
      let lastScoreAfter = [0, 0];
      for (const point of set.points) {
        const serverIndex = getServerIndexForPoint(point.scoreBefore, firstServerIndex);
        const receiverIndex = serverIndex === 0 ? 1 : 0;
        const winnerIndex = point.winnerIndex;

        addServePoint(stats, serverIndex, receiverIndex, winnerIndex);
        addServePoint(setStats, serverIndex, receiverIndex, winnerIndex);
        addClutchPoint(stats, winnerIndex, point.scoreBefore);
        addClutchPoint(setStats, winnerIndex, point.scoreBefore);
        addBreakClutchPoint(stats, serverIndex, receiverIndex, winnerIndex, point.scoreBefore);
        addBreakClutchPoint(setStats, serverIndex, receiverIndex, winnerIndex, point.scoreBefore);
        addComebackPoint(stats, winnerIndex, point.scoreBefore);
        addComebackPoint(setStats, winnerIndex, point.scoreBefore);

        if (isClosingLead(point.scoreBefore, 0)) {
          hadClosingLead[0] = true;
        }
        if (isClosingLead(point.scoreBefore, 1)) {
          hadClosingLead[1] = true;
        }

        if (currentStreakWinner === winnerIndex) {
          currentStreakLength += 1;
        } else {
          currentStreakWinner = winnerIndex;
          currentStreakLength = 1;
        }
        addStreakPoint(stats, winnerIndex, currentStreakLength);
        addStreakPoint(setStats, winnerIndex, currentStreakLength);
        lastScoreAfter = point.scoreAfter || lastScoreAfter;
      }

      const setWinnerIndex = Number(lastScoreAfter[0] || 0) > Number(lastScoreAfter[1] || 0) ? 0 : 1;
      const setLoserIndex = setWinnerIndex === 0 ? 1 : 0;
      stats[setWinnerIndex].setWins += 1;
      setStats[setWinnerIndex].setWins += 1;
      if (hadClosingLead[setLoserIndex]) {
        stats[setLoserIndex].collapseCount += 1;
        setStats[setLoserIndex].collapseCount += 1;
      }

      finalizeServeReturnSides(setStats);
      setSummaries.push({
        set: set.set,
        firstServerIndex,
        firstServerName: players[firstServerIndex] || "",
        players: setStats
      });
    }

    finalizeServeReturnSides(stats);
    return {
      firstSetFirstServerIndex,
      firstSetFirstServerName: players[firstSetFirstServerIndex] || "",
      players: stats,
      sets: setSummaries
    };
  }

  function buildUnknownFirstServerServeReturnEstimate(variants, players) {
    const validVariants = (Array.isArray(variants) ? variants : [])
      .filter((variant) => Array.isArray(variant && variant.players) && variant.players.length >= 2);
    if (!validVariants.length) {
      return {
        firstSetFirstServerIndex: null,
        firstSetFirstServerName: "",
        players: [
          createServeReturnSide(players[0] || ""),
          createServeReturnSide(players[1] || "")
        ],
        sets: []
      };
    }

    const stats = [0, 1].map((sideIndex) => {
      const reference = validVariants[0].players[sideIndex] || createServeReturnSide(players[sideIndex] || "");
      const side = {
        ...createServeReturnSide(players[sideIndex] || reference.name || ""),
        serveWon: averageVariantPlayerNumber(validVariants, sideIndex, "serveWon"),
        serveTotal: averageVariantPlayerNumber(validVariants, sideIndex, "serveTotal"),
        receiveWon: averageVariantPlayerNumber(validVariants, sideIndex, "receiveWon"),
        receiveTotal: averageVariantPlayerNumber(validVariants, sideIndex, "receiveTotal"),
        pointsWon: Number(reference.pointsWon || 0),
        pointsTotal: Number(reference.pointsTotal || 0),
        setWins: Number(reference.setWins || 0),
        maxWonStreak: Number(reference.maxWonStreak || 0),
        maxLostStreak: Number(reference.maxLostStreak || 0),
        clutchWon: Number(reference.clutchWon || 0),
        clutchTotal: Number(reference.clutchTotal || 0),
        breakClutchWon: averageVariantPlayerNumber(validVariants, sideIndex, "breakClutchWon"),
        breakClutchTotal: averageVariantPlayerNumber(validVariants, sideIndex, "breakClutchTotal"),
        comebackWon: Number(reference.comebackWon || 0),
        comebackTotal: Number(reference.comebackTotal || 0),
        collapseCount: Number(reference.collapseCount || 0)
      };
      return side;
    });

    finalizeServeReturnSides(stats);
    return {
      firstSetFirstServerIndex: null,
      firstSetFirstServerName: "",
      players: stats,
      variants: validVariants
    };
  }

  function averageVariantPlayerNumber(variants, sideIndex, key) {
    const values = (Array.isArray(variants) ? variants : [])
      .map((variant) => Number(variant && variant.players && variant.players[sideIndex] && variant.players[sideIndex][key]))
      .filter(Number.isFinite);
    if (!values.length) {
      return 0;
    }
    return roundOneDecimal(values.reduce((sum, value) => sum + value, 0) / values.length);
  }

  function createServeReturnSide(name) {
    return {
      name,
      serveWon: 0,
      serveTotal: 0,
      receiveWon: 0,
      receiveTotal: 0,
      pointsWon: 0,
      pointsTotal: 0,
      serveRate: null,
      receiveRate: null,
      pointsRate: null,
      serveReceiveSum: null,
      setWins: 0,
      setCount: 0,
      setSharePct: null,
      lateLeadsHeld: 0,
      lateLeadChances: 0,
      lateLeadHoldPct: null,
      maxWonStreak: 0,
      maxLostStreak: 0,
      clutchWon: 0,
      clutchTotal: 0,
      clutchRate: null,
      breakClutchWon: 0,
      breakClutchTotal: 0,
      breakClutchRate: null,
      comebackWon: 0,
      comebackTotal: 0,
      comebackRate: null,
      collapseCount: 0
    };
  }

  function addServePoint(stats, serverIndex, receiverIndex, winnerIndex) {
    if (!stats[serverIndex] || !stats[receiverIndex]) {
      return;
    }

    stats[serverIndex].serveTotal += 1;
    stats[receiverIndex].receiveTotal += 1;
    stats[winnerIndex].pointsWon += 1;
    stats[0].pointsTotal += 1;
    stats[1].pointsTotal += 1;

    if (winnerIndex === serverIndex) {
      stats[serverIndex].serveWon += 1;
    } else {
      stats[receiverIndex].receiveWon += 1;
    }
  }

  function finalizeServeReturnSides(stats) {
    for (const side of stats) {
      side.serveRate = side.serveTotal ? roundOneDecimal((side.serveWon / side.serveTotal) * 100) : null;
      side.receiveRate = side.receiveTotal ? roundOneDecimal((side.receiveWon / side.receiveTotal) * 100) : null;
      side.pointsRate = side.pointsTotal ? roundOneDecimal((side.pointsWon / side.pointsTotal) * 100) : null;
      side.serveReceiveSum = Number.isFinite(side.serveRate) && Number.isFinite(side.receiveRate)
        ? roundOneDecimal(side.serveRate + side.receiveRate)
        : null;
      side.clutchRate = side.clutchTotal ? roundOneDecimal((side.clutchWon / side.clutchTotal) * 100) : null;
      side.breakClutchRate = side.breakClutchTotal ? roundOneDecimal((side.breakClutchWon / side.breakClutchTotal) * 100) : null;
      side.comebackRate = side.comebackTotal ? roundOneDecimal((side.comebackWon / side.comebackTotal) * 100) : null;
    }
  }

  function addClutchPoint(stats, winnerIndex, scoreBefore) {
    if (!isClutchScore(scoreBefore)) {
      return;
    }

    stats[0].clutchTotal += 1;
    stats[1].clutchTotal += 1;
    if (stats[winnerIndex]) {
      stats[winnerIndex].clutchWon += 1;
    }
  }

  function addBreakClutchPoint(stats, serverIndex, receiverIndex, winnerIndex, scoreBefore) {
    if (!isBreakClutchScore(scoreBefore)) {
      return;
    }

    stats[receiverIndex].breakClutchTotal += 1;
    if (winnerIndex === receiverIndex) {
      stats[receiverIndex].breakClutchWon += 1;
    }
  }

  function addComebackPoint(stats, winnerIndex, scoreBefore) {
    [0, 1].forEach((playerIndex) => {
      if (!isComebackScore(scoreBefore, playerIndex)) {
        return;
      }

      stats[playerIndex].comebackTotal += 1;
      if (winnerIndex === playerIndex) {
        stats[playerIndex].comebackWon += 1;
      }
    });
  }

  function addStreakPoint(stats, winnerIndex, streakLength) {
    const loserIndex = winnerIndex === 0 ? 1 : 0;
    if (stats[winnerIndex]) {
      stats[winnerIndex].maxWonStreak = Math.max(stats[winnerIndex].maxWonStreak, streakLength);
    }
    if (stats[loserIndex]) {
      stats[loserIndex].maxLostStreak = Math.max(stats[loserIndex].maxLostStreak, streakLength);
    }
  }

  function isClutchScore(scoreBefore) {
    const left = Number(scoreBefore && scoreBefore[0] || 0);
    const right = Number(scoreBefore && scoreBefore[1] || 0);
    return (left >= 9 && right >= 9)
      || left >= 10
      || right >= 10
      || (left >= 8 && right >= 8 && Math.abs(left - right) <= 1);
  }

  function isBreakClutchScore(scoreBefore) {
    const left = Number(scoreBefore && scoreBefore[0] || 0);
    const right = Number(scoreBefore && scoreBefore[1] || 0);
    return left >= 8 && right >= 8 && Math.abs(left - right) <= 1;
  }

  function isComebackScore(scoreBefore, playerIndex) {
    const own = Number(scoreBefore && scoreBefore[playerIndex] || 0);
    const opponent = Number(scoreBefore && scoreBefore[playerIndex === 0 ? 1 : 0] || 0);
    return opponent - own >= 3;
  }

  function isClosingLead(scoreBefore, playerIndex) {
    const own = Number(scoreBefore && scoreBefore[playerIndex] || 0);
    const opponent = Number(scoreBefore && scoreBefore[playerIndex === 0 ? 1 : 0] || 0);
    return own >= 9 && own > opponent;
  }

  function getFirstServerIndexForSet(set, fallbackSetIndex, firstSetFirstServerIndex) {
    const setNumber = Number(set && set.set);
    const zeroBasedSet = Number.isFinite(setNumber) && setNumber > 0
      ? setNumber - 1
      : Number(fallbackSetIndex || 0);
    return (Number(firstSetFirstServerIndex || 0) + zeroBasedSet) % 2;
  }

  function getServerIndexForPoint(scoreBefore, firstServerIndex) {
    const left = Number(scoreBefore && scoreBefore[0] || 0);
    const right = Number(scoreBefore && scoreBefore[1] || 0);
    const totalBefore = left + right;
    const switchIndex = left >= 10 && right >= 10
      ? totalBefore
      : Math.floor(totalBefore / 2);
    return (Number(firstServerIndex || 0) + switchIndex) % 2;
  }

  function parseScoreTable(doc = document) {
    const tables = Array.from(doc.querySelectorAll("table"));
    for (const table of tables) {
      const headerCells = Array.from(table.querySelectorAll("thead th")).map((cell) => normalizeText(cell.textContent));
      const bodyRows = Array.from(table.querySelectorAll("tbody tr"))
        .map((row) => Array.from(row.querySelectorAll("td")).map((cell) => normalizeText(cell.textContent)));
      const parsedFromHead = parseScoreTableMatrix([headerCells, ...bodyRows]);
      if (parsedFromHead.setScores.length) {
        return parsedFromHead;
      }

      const matrix = Array.from(table.querySelectorAll("tr"))
        .map((row) => Array.from(row.querySelectorAll("th,td")).map((cell) => normalizeText(cell.textContent)));
      const parsedFromRows = parseScoreTableMatrix(matrix);
      if (parsedFromRows.setScores.length) {
        return parsedFromRows;
      }
    }

    return { players: [], setScores: [] };
  }

  function parseScoreTableMatrix(matrix) {
    const rows = (Array.isArray(matrix) ? matrix : [])
      .map((cells) => (Array.isArray(cells) ? cells : []).map(normalizeText))
      .filter((cells) => cells.some(Boolean));
    if (rows.length < 3) {
      return { players: [], setScores: [] };
    }

    for (let headerIndex = 0; headerIndex < rows.length - 2; headerIndex += 1) {
      const headerCells = rows[headerIndex];
      const teamHeaderIndex = headerCells.findIndex((text) => /^(?:команда|team|игрок|player)$/i.test(text));
      if (teamHeaderIndex < 0) {
        continue;
      }

      const scoreRows = rows
        .slice(headerIndex + 1)
        .filter((cells) => cells.length >= teamHeaderIndex + 2)
        .slice(0, 2);
      if (scoreRows.length < 2) {
        continue;
      }

      const players = scoreRows.map((cells) => cleanName(cells[teamHeaderIndex])).filter(Boolean);
      if (players.length < 2) {
        continue;
      }

      const setLabels = headerCells
        .slice(teamHeaderIndex + 1)
        .map((label, index) => normalizeText(label) || String(index + 1));
      const setScores = setLabels.map((label, index) => {
        const left = parseInteger(scoreRows[0][teamHeaderIndex + 1 + index]);
        const right = parseInteger(scoreRows[1][teamHeaderIndex + 1 + index]);
        return Number.isFinite(left) && Number.isFinite(right)
          ? { set: index + 1, label, left, right }
          : null;
      }).filter(Boolean);

      if (setScores.length) {
        return { players, setScores };
      }
    }

    return { players: [], setScores: [] };
  }

  function parseOddsMarketFromDocument(doc = document, url = location.href, context = {}) {
    if (!doc || !doc.querySelectorAll) {
      return null;
    }

    const rows = [];
    const markets = [];
    for (const table of Array.from(doc.querySelectorAll("table"))) {
      const headerCells = Array.from(table.querySelectorAll("th")).map((cell) => normalizeText(cell.textContent || ""));
      const headerText = normalizeSearchText(headerCells.join(" "));
      if (!/(?:bookmaker|букмекер)/i.test(headerText)) {
        continue;
      }

      const title = detectOddsMarketTitle(table, headerCells);
      const marketText = normalizeSearchText(`${title || ""} ${headerText}`);
      const isMatchResultMarket = /(результат матча|match result)/i.test(marketText);
      const marketRows = [];
      let bookmaker = "";
      for (const row of Array.from(table.querySelectorAll("tr"))) {
        const header = row.querySelector("th");
        const headerTextRaw = normalizeText(header && header.textContent || "");
        if (headerTextRaw && !/^bookmaker$/i.test(headerTextRaw)) {
          bookmaker = headerTextRaw;
        }

        const cells = Array.from(row.querySelectorAll("td"));
        if (cells.length < 3) {
          continue;
        }

        const label = normalizeText(cells[0].textContent || "");
        const phase = parseOddsPhase(label);
        const rawCells = cells.map((cell) => normalizeText(cell.textContent || ""));
        const oddsValues = cells
          .slice(1)
          .filter((cell) => !cell.getAttribute("data-dt") && !/\d{4}-\d{2}-\d{2}T/.test(cell.textContent || ""))
          .map(parseOddsNumber)
          .filter(Number.isFinite);
        if (phase && oddsValues.length >= 2) {
          marketRows.push({
            bookmaker,
            phase,
            label,
            cells: rawCells.slice(0, 8),
            odds: oddsValues.map((value) => roundDecimal(value, 3)),
            date: normalizeText((cells[3] && (cells[3].getAttribute("data-dt") || cells[3].textContent)) || ""),
            dateTs: parseMatchDateTs((cells[3] && (cells[3].getAttribute("data-dt") || cells[3].textContent)) || "")
          });
        }

        if (!isMatchResultMarket) {
          continue;
        }

        const leftOdds = parseOddsNumber(cells[1]);
        const rightOdds = parseOddsNumber(cells[2]);
        if (!phase || !Number.isFinite(leftOdds) || !Number.isFinite(rightOdds)) {
          continue;
        }

        const dateCell = cells[3] || null;
        const date = normalizeText(dateCell && (dateCell.getAttribute("data-dt") || dateCell.textContent) || "");
        rows.push({
          bookmaker,
          phase,
          label,
          leftOdds: roundDecimal(leftOdds, 3),
          rightOdds: roundDecimal(rightOdds, 3),
          date,
          dateTs: parseMatchDateTs(date)
        });
      }

      if (marketRows.length) {
        markets.push({
          key: slugifyOddsMarketTitle(title || headerCells.join(" ")),
          title: title || headerCells.join(" "),
          type: isMatchResultMarket ? "matchResult" : "raw",
          rows: marketRows
        });
      }
    }

    if (!rows.length && !markets.length) {
      return null;
    }

    const opening = aggregateOddsRows(rows, "opening");
    const matchStart = aggregateOddsRows(rows, "matchStart");
    const last = aggregateOddsRows(rows, "last");
    const preferred = opening || matchStart || last || null;
    const preferredSource = opening
      ? "opening"
      : matchStart
        ? "matchStart"
        : last
          ? "last"
          : "";

    return {
      source: "bsportsfan-odds",
      status: preferred ? "ready" : "missing",
      url: getBsportsfanOddsUrl(url) || normalizeUrl(url),
      matchDateTs: Number(context && context.matchDateTs || 0),
      preferredSource,
      preferred,
      opening,
      matchStart,
      last,
      rows,
      markets,
      marketTitles: markets.map((market) => market.title).filter(Boolean)
    };
  }

  function detectOddsMarketTitle(table, headerCells = []) {
    const caption = normalizeText(table.querySelector("caption") && table.querySelector("caption").textContent || "");
    if (caption) {
      return caption;
    }

    const attributeTitle = normalizeText(
      table.getAttribute("data-title")
      || table.getAttribute("aria-label")
      || ""
    );
    if (attributeTitle) {
      return attributeTitle;
    }

    const containers = [
      table.closest(".card, section"),
      table.closest(".table-responsive"),
      table.parentElement,
      table.parentElement && table.parentElement.parentElement
    ].filter((node, index, list) => node && list.indexOf(node) === index);
    for (const heading of containers) {
      const titleNode = heading.querySelector("h1, h2, h3, h4, h5, .card-title, .fw-bold");
      const title = normalizeText(titleNode && titleNode.textContent || "");
      if (title && !/^bookmaker$/i.test(title)) {
        return title;
      }
    }

    const text = headerCells.join(" ");
    const match = text.match(/(?:bookmaker\s*)?(.{1,80}?)(?:\s+начало|\s+opening|\s+last|\s+последн|$)/i);
    return normalizeText(match && match[1] || text).slice(0, 120);
  }

  function slugifyOddsMarketTitle(value) {
    const text = normalizeSearchText(value || "");
    if (!text) {
      return "unknown";
    }
    if (/(результат матча|match result)/i.test(text)) {
      return "matchResult";
    }
    if (/(фора|handicap)/i.test(text)) {
      return "handicap";
    }
    if (/(тотал|total)/i.test(text)) {
      return "total";
    }
    if (/(сет|set)/i.test(text)) {
      return "sets";
    }
    return text.replace(/[^a-zа-я0-9]+/gi, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "unknown";
  }

  function parseOddsPhase(label) {
    const text = normalizeSearchText(label);
    if (!text) {
      return "";
    }
    if (/^(?:последн|last)/i.test(text)) {
      return "last";
    }
    if (/^(?:начало матча|match start|start match)/i.test(text)) {
      return "matchStart";
    }
    if (/^(?:начало|opening|start)$/i.test(text)) {
      return "opening";
    }
    return "";
  }

  function parseOddsNumber(cell) {
    const text = normalizeText(
      cell && (
        cell.getAttribute && (
          cell.getAttribute("data-odds")
          || cell.getAttribute("data-odd")
          || cell.getAttribute("data-price")
          || cell.getAttribute("title")
        )
        || cell.textContent
      )
      || cell
      || ""
    );
    if (!text || text === "-") {
      return null;
    }
    const match = text.replace(",", ".").match(/\b\d+(?:\.\d+)?\b/);
    const value = match ? Number(match[0]) : null;
    return Number.isFinite(value) && value > 1 ? value : null;
  }

  function parseListRowOddsMarket(row, url = "", context = {}) {
    if (!row || !row.querySelectorAll) {
      return null;
    }

    const rowOdds = selectListRowOddsPair(collectListRowOddsCandidates(row));
    if (!rowOdds) {
      return null;
    }

    const rows = [{
      bookmaker: "list-row",
      phase: "opening",
      label: "list row",
      leftOdds: rowOdds[0],
      rightOdds: rowOdds[1],
      date: "",
      dateTs: 0
    }];
    const opening = aggregateOddsRows(rows, "opening");
    return {
      source: "bsportsfan-list-row",
      status: opening ? "ready" : "missing",
      url: normalizeUrl(url || location.href),
      matchDateTs: Number(context && context.matchDateTs || 0),
      preferredSource: opening ? "opening" : "",
      preferred: opening,
      opening,
      matchStart: null,
      last: null,
      rows,
      markets: [{
        key: "matchResult",
        title: "Результат матча",
        type: "matchResult",
        rows: rows.map((item) => ({
          bookmaker: item.bookmaker,
          phase: item.phase,
          label: item.label,
          odds: [item.leftOdds, item.rightOdds]
        }))
      }],
      marketTitles: ["Результат матча"]
    };
  }

  function collectListRowOddsCandidates(row) {
    const candidates = [];
    const seen = new Set();
    const directCells = Array.from(row.children || []).filter((element) => /^(td|th)$/i.test(element && element.tagName || ""));

    const pushCandidate = (element, directIndex, priority) => {
      if (!element || seen.has(element)) {
        return;
      }
      seen.add(element);
      if (isListRowOddsDateElement(element)) {
        return;
      }
      const text = normalizeText(element.textContent || "");
      const value = parseListRowOddsCandidateText(text);
      if (!Number.isFinite(value)) {
        return;
      }
      candidates.push({
        value: roundDecimal(value, 3),
        directIndex,
        priority,
        hasOddsHint: hasListRowOddsHint(element)
      });
    };

    directCells.forEach((cell, index) => {
      pushCandidate(cell, index, 0);
    });

    for (const element of Array.from(row.querySelectorAll("button,a,span,div"))) {
      if (Array.from(element.children || []).some((child) => normalizeText(child.textContent || "") === normalizeText(element.textContent || ""))) {
        continue;
      }
      const cell = element.closest && element.closest("td,th");
      const directIndex = cell ? directCells.indexOf(cell) : -1;
      pushCandidate(element, directIndex, 1);
    }

    return candidates.sort((left, right) => (
      left.priority - right.priority
      || left.directIndex - right.directIndex
      || Number(right.hasOddsHint) - Number(left.hasOddsHint)
    ));
  }

  function parseListRowOddsCandidateText(value) {
    const text = normalizeText(value || "");
    if (!/^\d{1,2}(?:[.,]\d{1,3})$/.test(text)) {
      return null;
    }
    if (/^0\d[.,]\d{1,3}$/.test(text)) {
      return null;
    }
    const number = Number(text.replace(",", "."));
    return Number.isFinite(number) && number > 1 && number <= 20 ? number : null;
  }

  function isListRowOddsDateElement(element) {
    if (!element || !element.closest) {
      return false;
    }
    if (element.closest("[data-dt],time")) {
      return true;
    }
    const attrs = [
      element.getAttribute && element.getAttribute("class"),
      element.getAttribute && element.getAttribute("id"),
      element.getAttribute && element.getAttribute("title"),
      element.getAttribute && element.getAttribute("aria-label")
    ].map((value) => normalizeSearchText(value || "")).join(" ");
    return /\b(?:date|time|datetime|dt|время|дата)\b/i.test(attrs);
  }

  function hasListRowOddsHint(element) {
    let node = element;
    while (node && node.nodeType === 1) {
      const attrs = [
        node.getAttribute && node.getAttribute("class"),
        node.getAttribute && node.getAttribute("id"),
        node.getAttribute && node.getAttribute("data-odd"),
        node.getAttribute && node.getAttribute("data-odds")
      ].map((value) => normalizeSearchText(value || "")).join(" ");
      if (/(?:odd|odds|coef|coeff|kef|price|bet|коэф)/i.test(attrs)) {
        return true;
      }
      if (node === element.ownerDocument.body) {
        break;
      }
      node = node.parentElement;
    }
    return false;
  }

  function selectListRowOddsPair(candidates) {
    const list = Array.isArray(candidates) ? candidates : [];
    const pairs = [];
    for (let leftIndex = 0; leftIndex < list.length - 1; leftIndex += 1) {
      for (let rightIndex = leftIndex + 1; rightIndex < list.length; rightIndex += 1) {
        const left = list[leftIndex];
        const right = list[rightIndex];
        const impliedTotal = (1 / Number(left.value)) + (1 / Number(right.value));
        if (!Number.isFinite(impliedTotal) || impliedTotal < 0.95 || impliedTotal > 1.35) {
          continue;
        }
        const distance = left.directIndex >= 0 && right.directIndex >= 0
          ? Math.abs(left.directIndex - right.directIndex)
          : 10;
        pairs.push({
          odds: [left.value, right.value],
          score: Math.abs(impliedTotal - 1.07)
            + distance * 0.03
            + (left.priority + right.priority) * 0.02
            - (left.hasOddsHint && right.hasOddsHint ? 0.08 : 0)
        });
      }
    }
    const best = pairs.sort((left, right) => left.score - right.score)[0];
    return best ? best.odds : null;
  }

  function aggregateOddsRows(rows, phase) {
    const list = (Array.isArray(rows) ? rows : [])
      .filter((row) => row && row.phase === phase && Number(row.leftOdds) > 1 && Number(row.rightOdds) > 1);
    if (!list.length) {
      return null;
    }

    const leftProbs = [];
    const rightProbs = [];
    for (const row of list) {
      const leftInv = 1 / Number(row.leftOdds);
      const rightInv = 1 / Number(row.rightOdds);
      const total = leftInv + rightInv;
      if (total > 0) {
        leftProbs.push((leftInv / total) * 100);
        rightProbs.push((rightInv / total) * 100);
      }
    }

    const leftProb = median(leftProbs);
    const rightProb = median(rightProbs);
    const leftOdds = median(list.map((row) => Number(row.leftOdds)));
    const rightOdds = median(list.map((row) => Number(row.rightOdds)));
    if (!Number.isFinite(leftProb) || !Number.isFinite(rightProb)) {
      return null;
    }

    const favoriteIndex = leftProb >= rightProb ? 0 : 1;
    const favoriteProb = favoriteIndex === 0 ? leftProb : rightProb;
    const underdogProb = favoriteIndex === 0 ? rightProb : leftProb;
    const favoriteOdds = favoriteIndex === 0 ? leftOdds : rightOdds;
    const underdogOdds = favoriteIndex === 0 ? rightOdds : leftOdds;
    const timestamps = list.map((row) => Number(row.dateTs || 0)).filter((value) => value > 0);

    return {
      phase,
      bookmakers: list.length,
      favoriteIndex,
      leftOdds: roundDecimal(leftOdds, 3),
      rightOdds: roundDecimal(rightOdds, 3),
      leftProb: roundOneDecimal(leftProb),
      rightProb: roundOneDecimal(rightProb),
      favoriteOdds: roundDecimal(favoriteOdds, 3),
      underdogOdds: roundDecimal(underdogOdds, 3),
      favoriteProb: roundOneDecimal(favoriteProb),
      underdogProb: roundOneDecimal(underdogProb),
      probEdge: roundOneDecimal(Math.abs(favoriteProb - underdogProb)),
      oddsEdge: roundDecimal(Math.abs(Number(leftOdds || 0) - Number(rightOdds || 0)), 3),
      firstDateTs: timestamps.length ? Math.min(...timestamps) : 0,
      lastDateTs: timestamps.length ? Math.max(...timestamps) : 0
    };
  }

  function parseHighchartsPointSets(doc = document) {
    const scripts = Array.from(doc.scripts || [])
      .map((script) => script.textContent || "")
      .filter((text) => /\.series\s*=\s*\[/i.test(text));
    const result = [];

    for (const script of scripts) {
      const assignmentRegex = /\b(set\d+)\.series\s*=\s*/gi;
      let match = null;
      while ((match = assignmentRegex.exec(script))) {
        const variableName = match[1];
        const arrayStart = script.indexOf("[", assignmentRegex.lastIndex);
        const arrayLiteral = extractBalanced(script, arrayStart, "[", "]");
        if (!arrayLiteral) {
          continue;
        }

        const setNumber = Number((variableName.match(/\d+/) || [])[0]);
        const series = parseSeriesLiteral(arrayLiteral);
        if (series.length) {
          result.push({
            set: Number.isFinite(setNumber) ? setNumber : result.length + 1,
            series
          });
        }

        assignmentRegex.lastIndex = arrayStart + arrayLiteral.length;
      }
    }

    result.sort((left, right) => Number(left.set || 0) - Number(right.set || 0));
    return result;
  }

  function parseSeriesLiteral(arrayLiteral) {
    const series = [];
    for (const itemLiteral of splitTopLevelObjects(arrayLiteral)) {
      const nameMatch = itemLiteral.match(/['"]?name['"]?\s*:\s*['"]([^'"]+)['"]/i);
      const colorMatch = itemLiteral.match(/['"]?color['"]?\s*:\s*['"]([^'"]+)['"]/i);
      const dataMatch = /['"]?data['"]?\s*:/i.exec(itemLiteral);
      if (!nameMatch || !dataMatch) {
        continue;
      }

      const dataStart = itemLiteral.indexOf("[", dataMatch.index);
      const dataLiteral = extractBalanced(itemLiteral, dataStart, "[", "]");
      if (!dataLiteral) {
        continue;
      }

      series.push({
        name: decodeHtml(normalizeText(nameMatch[1])),
        color: colorMatch ? colorMatch[1] : "",
        points: parseDataPoints(dataLiteral)
      });
    }

    return series;
  }

  function splitTopLevelObjects(arrayLiteral) {
    const items = [];
    for (let index = 0; index < arrayLiteral.length; index += 1) {
      if (arrayLiteral[index] !== "{") {
        continue;
      }

      const objectLiteral = extractBalanced(arrayLiteral, index, "{", "}");
      if (objectLiteral) {
        items.push(objectLiteral);
        index += objectLiteral.length - 1;
      }
    }
    return items;
  }

  function parseDataPoints(dataLiteral) {
    const points = [];
    const pointRegex = /["']?x["']?\s*:\s*(-?\d+(?:\.\d+)?)[\s\S]*?["']?y["']?\s*:\s*(-?\d+(?:\.\d+)?)/gi;
    let match = null;
    while ((match = pointRegex.exec(dataLiteral))) {
      const x = Number(match[1]);
      const y = Number(match[2]);
      if (Number.isFinite(x) && Number.isFinite(y)) {
        points.push({ x, y });
      }
    }

    if (!points.length) {
      const reversedRegex = /["']?y["']?\s*:\s*(-?\d+(?:\.\d+)?)[\s\S]*?["']?x["']?\s*:\s*(-?\d+(?:\.\d+)?)/gi;
      while ((match = reversedRegex.exec(dataLiteral))) {
        const y = Number(match[1]);
        const x = Number(match[2]);
        if (Number.isFinite(x) && Number.isFinite(y)) {
          points.push({ x, y });
        }
      }
    }

    if (!points.length) {
      const pairRegex = /\[\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\]/g;
      while ((match = pairRegex.exec(dataLiteral))) {
        const x = Number(match[1]);
        const y = Number(match[2]);
        if (Number.isFinite(x) && Number.isFinite(y)) {
          points.push({ x, y });
        }
      }
    }

    if (!points.length) {
      const values = dataLiteral.match(/-?\d+(?:\.\d+)?/g) || [];
      values.forEach((value, index) => {
        const y = Number(value);
        if (Number.isFinite(y)) {
          points.push({ x: index + 1, y });
        }
      });
    }

    return points;
  }

  function extractBalanced(source, startIndex, openChar, closeChar) {
    if (startIndex < 0 || source[startIndex] !== openChar) {
      return "";
    }

    let depth = 0;
    let quote = "";
    let escaped = false;
    for (let index = startIndex; index < source.length; index += 1) {
      const char = source[index];
      if (quote) {
        if (escaped) {
          escaped = false;
        } else if (char === "\\") {
          escaped = true;
        } else if (char === quote) {
          quote = "";
        }
        continue;
      }

      if (char === "\"" || char === "'") {
        quote = char;
        continue;
      }

      if (char === openChar) {
        depth += 1;
      } else if (char === closeChar) {
        depth -= 1;
        if (depth === 0) {
          return source.slice(startIndex, index + 1);
        }
      }
    }

    return "";
  }

  function parseListMatches(doc = document, baseUrl = location.href) {
    const seen = new Set();
    const matches = [];
    const tableRows = Array.from(doc.querySelectorAll("tbody tr"))
      .filter((row) => row.querySelector(BSF_MATCH_LINK_SELECTOR));
    const candidates = tableRows.length
      ? tableRows
      : Array.from(doc.querySelectorAll(".card-hover, li"))
        .filter((row) => row && row.querySelector && row.querySelector(BSF_MATCH_LINK_SELECTOR));

    let order = 0;
    for (const element of candidates) {
      const anchor = element.matches && element.matches(BSF_MATCH_LINK_SELECTOR)
        ? element
        : element.querySelector && (
          Array.from(element.querySelectorAll(BSF_MATCH_LINK_SELECTOR))
            .find((candidate) => candidate.classList && candidate.classList.contains("fw-bold"))
          || element.querySelector(BSF_MATCH_LINK_SELECTOR)
          || element.querySelector("a[href]")
        );
      const url = anchor ? normalizeUrl(anchor.href || anchor.getAttribute("href"), baseUrl) : "";
      const textSource = anchor && element === anchor
        ? anchor.closest(".card,.card-hover,tr,li,div") || element
        : element;
      const text = normalizeText(textSource.textContent || "");
      const rowNames = parseMatchRowNames(textSource, baseUrl);
      const names = rowNames.length >= 2 ? rowNames : parseNamesFromText(text);
      const date = extractMatchRowDate(textSource);
      const key = url || names.join("|") || text.slice(0, 80);
      if (!key || seen.has(key)) {
        continue;
      }
      if ((!url && names.length < 2) || (url && isBsportsfanMatchUrl(url) && names.length < 2)) {
        continue;
      }

      const livePointScore = parseListRowLiveCurrentPointScore(textSource, url);
      seen.add(key);
      matches.push({
        url,
        names,
        date,
        dateTs: parseMatchDateTs(date),
        order: order++,
        score: extractMatchRowScore(textSource),
        liveScore: livePointScore ? `${livePointScore.left}-${livePointScore.right}` : "",
        text: text.slice(0, 240)
      });
      if (matches.length >= 80) {
        break;
      }
    }

    return matches;
  }

  function parsePlayerResultMatches(doc = document, baseUrl = location.href) {
    const resultCards = Array.from(doc.querySelectorAll(".card"))
      .filter((card) => /результаты|results/i.test(normalizeText(card.querySelector(".card-title,h3,h2")?.textContent || "")));
    const scopes = resultCards.length ? resultCards : [doc];
    const seen = new Set();
    const matches = [];

    for (const scope of scopes) {
      const rows = Array.from(scope.querySelectorAll(BSF_LIST_MATCH_ROW_SELECTOR))
        .filter((row) => row.querySelector(BSF_MATCH_LINK_SELECTOR));
      for (const row of rows) {
        const matchAnchors = Array.from(row.querySelectorAll(BSF_MATCH_LINK_SELECTOR));
        const scoreAnchor = matchAnchors
          .find((anchor) => parseFinishedScoreParts(anchor && anchor.textContent || ""))
          || matchAnchors[0]
          || null;
        const score = findFinishedPlayerResultRowScore(row, scoreAnchor);
        if (!parseFinishedScoreParts(score)) {
          continue;
        }

        const url = normalizeUrl(scoreAnchor.getAttribute("href") || scoreAnchor.href || "", baseUrl);
        if (!url || seen.has(url)) {
          continue;
        }

        const text = normalizeText(row.textContent || "");
        const playerLinks = parseMatchRowPlayerLinks(row, baseUrl);
        const rowNames = playerLinks.length >= 2
          ? playerLinks.map((link) => link.name)
          : parsePlayerResultRowNames(row, baseUrl);
        const slugNames = parseMatchPlayersFromSlug(url).map(cleanName).filter(isLikelyName);
        const names = rowNames.length >= 2
          ? rowNames.slice(0, 2)
          : slugNames.length >= 2
            ? slugNames.slice(0, 2)
            : parseNamesFromText(text).slice(0, 2);
        const resultBadge = row.querySelector(".badge_W,.badge_L,[class*='badge_W'],[class*='badge_L']");
        const result = parsePlayerResultBadge(resultBadge);
        if (names.length < 2) {
          continue;
        }
        seen.add(url);
        matches.push({
          url,
          names,
          playerLinks,
          date: extractMatchRowDate(row),
          dateTs: parseMatchDateTs(extractMatchRowDate(row)),
          order: matches.length,
          result,
          score,
          text: text.slice(0, 240)
        });
      }
    }

    return matches;
  }

  function findFinishedPlayerResultRowScore(row, preferredAnchor = null) {
    const candidates = [
      preferredAnchor,
      ...Array.from(row && row.querySelectorAll
        ? row.querySelectorAll("td,[data-score],[data-final-score],.fw-bold,strong")
        : [])
    ].filter(Boolean);
    for (const node of candidates) {
      const values = [
        node.getAttribute && node.getAttribute("data-final-score"),
        node.getAttribute && node.getAttribute("data-score"),
        node.textContent
      ];
      for (const value of values) {
        const score = parseFinishedMatchScoreText(value || "");
        if (score) {
          return score;
        }
      }
    }
    return "";
  }

  function parsePlayerResultRowNames(row, baseUrl = location.href) {
    if (!row || !row.querySelectorAll) {
      return [];
    }

    const cells = Array.from(row.querySelectorAll("td"));
    for (const cell of cells) {
      if (
        cell.querySelector("a[href*='/table-tennis/l/'],a[href^='/l/']")
        || cell.querySelector(BSF_MATCH_LINK_SELECTOR)
      ) {
        continue;
      }

      const text = normalizeText(cell.textContent || "");
      if (!/\s+v\s+/.test(text)) {
        continue;
      }

      const names = text.split(/\s+v\s+/).map(cleanName).filter(isLikelyName);
      if (names.length >= 2) {
        return names.slice(0, 2);
      }

      const linkedNames = parseMatchRowPlayerLinks(cell, baseUrl).map((link) => link.name);
      const strongNames = Array.from(cell.querySelectorAll("strong"))
        .map((element) => cleanName(element.textContent || ""))
        .filter(isLikelyName);
      const fallback = strongNames.concat(linkedNames).filter((name, index, list) => list.indexOf(name) === index);
      if (fallback.length >= 2) {
        return fallback.slice(0, 2);
      }
    }

    const linkedNames = parseMatchRowNames(row, baseUrl);
    return linkedNames.length >= 2 ? linkedNames : [];
  }

  function parsePlayerResultBadge(badge) {
    if (!badge) {
      return "";
    }
    const className = String(badge.className || "");
    if (/\bbadge_W\b|badge_W/i.test(className)) {
      return "W";
    }
    if (/\bbadge_L\b|badge_L/i.test(className)) {
      return "L";
    }
    const text = normalizeText(badge.textContent || "").toUpperCase();
    return text === "W" || text === "L" ? text : "";
  }

  function parsePlayerLinks(doc = document, baseUrl = location.href) {
    const seen = new Set();
    const links = [];
    for (const anchor of Array.from(doc.querySelectorAll(BSF_PLAYER_LINK_SELECTOR))) {
      const url = normalizeUrl(anchor.getAttribute("href") || anchor.href || "", baseUrl);
      const name = normalizeText(anchor.textContent || "");
      if (!url || seen.has(url) || !name) {
        continue;
      }

      seen.add(url);
      links.push({ name, url, id: getBsportsfanPlayerId(url) });
    }

    const ownName = parsePlayerPageName(doc, baseUrl);
    if (ownName && isBsportsfanPlayerUrl(baseUrl)) {
      const ownUrl = normalizeUrl(baseUrl);
      if (ownUrl && !seen.has(ownUrl)) {
        links.unshift({ name: ownName, url: ownUrl, id: getBsportsfanPlayerId(ownUrl) });
      }
    }

    return links.slice(0, 20);
  }

  function parseMatchPagePlayers(doc = document, url = location.href, playerLinks = []) {
    if (!isBsportsfanMatchUrl(url)) {
      return [];
    }

    const titleCandidates = [
      normalizeText(doc && doc.title || ""),
      ...Array.from(doc.querySelectorAll("h1,h2,h3,.card-title"))
        .map((node) => normalizeText(node.textContent || ""))
    ];
    for (const text of titleCandidates) {
      const beforeSuffix = text.split(/\s+-\s+/)[0] || text;
      const names = parseNamesFromText(beforeSuffix);
      if (names.length >= 2) {
        return names.slice(0, 2);
      }
    }

    const slugNames = parseMatchPlayersFromSlug(url);
    if (slugNames.length >= 2) {
      return slugNames;
    }

    const linkedNames = Array.from(new Set(
      (Array.isArray(playerLinks) ? playerLinks : [])
        .map((link) => cleanName(link && link.name || ""))
        .filter(isLikelyName)
    ));
    return linkedNames.slice(0, 2);
  }

  function parseMatchPlayersFromSlug(value) {
    const url = parseUrl(value);
    const parts = url ? url.pathname.split("/").filter(Boolean) : [];
    const slug = decodeURIComponent(parts[parts.length - 1] || "");
    if (!slug || !/-vs-/i.test(slug)) {
      return [];
    }

    return slug.split(/-vs-/i)
      .slice(0, 2)
      .map((part) => cleanName(part.replace(/[-_]+/g, " ")))
      .filter(isLikelyName);
  }

  function parsePlayerPageName(doc = document, url = location.href) {
    if (!isBsportsfanPlayerUrl(url)) {
      return "";
    }

    const strongCounts = new Map();
    for (const strong of Array.from(doc.querySelectorAll("tr strong"))) {
      const text = cleanName(strong.textContent || "");
      if (isLikelyName(text)) {
        strongCounts.set(text, (strongCounts.get(text) || 0) + 1);
      }
    }
    const best = Array.from(strongCounts.entries()).sort((left, right) => right[1] - left[1])[0];
    if (best && best[0]) {
      return best[0];
    }

    const heading = Array.from(doc.querySelectorAll("h1,h2,h3,.card-title"))
      .map((node) => cleanName(node.textContent || ""))
      .find(isLikelyName);
    if (heading) {
      return heading;
    }

    return toReadableSlugName(url);
  }

  function parseMatchPageDate(doc = document, url = location.href) {
    if (!isBsportsfanMatchUrl(url)) {
      return { date: "", dateTs: 0 };
    }

    const dateNode = Array.from(doc.querySelectorAll("[data-dt]"))
      .map((node) => normalizeText(node.getAttribute("data-dt") || node.textContent || ""))
      .find(Boolean);
    if (dateNode) {
      return {
        date: dateNode,
        dateTs: parseMatchDateTs(dateNode)
      };
    }

    const text = normalizeText(doc.body && doc.body.innerText || "");
    const iso = text.match(/\b20\d{2}-\d{1,2}-\d{1,2}(?:[ T]\d{1,2}:\d{2}(?::\d{2})?Z?)?/);
    if (iso) {
      return {
        date: iso[0],
        dateTs: parseMatchDateTs(iso[0])
      };
    }

    const slash = text.match(/\b\d{1,2}\/\d{1,2}(?:\/\d{2,4})?\s+\d{1,2}:\d{2}\b/);
    if (slash) {
      return {
        date: slash[0],
        dateTs: parseMatchDateTs(slash[0])
      };
    }

    return { date: "", dateTs: 0 };
  }

  function extractMatchRowDate(element) {
    const dateNode = element && element.querySelector && element.querySelector("[data-dt]");
    return dateNode ? normalizeText(dateNode.getAttribute("data-dt") || dateNode.textContent || "") : "";
  }

  function parseMatchDateTs(value) {
    const text = normalizeText(value);
    if (!text) {
      return 0;
    }

    const direct = Date.parse(text.replace(" ", "T"));
    if (Number.isFinite(direct)) {
      return direct;
    }

    const dotted = text.match(/(\d{1,2})\.(\d{1,2})\.(\d{2,4})(?:\s+(\d{1,2}):(\d{2}))?/);
    if (dotted) {
      const year = Number(dotted[3].length === 2 ? `20${dotted[3]}` : dotted[3]);
      const month = Number(dotted[2]) - 1;
      const day = Number(dotted[1]);
      const hour = Number(dotted[4] || 0);
      const minute = Number(dotted[5] || 0);
      const ts = new Date(year, month, day, hour, minute).getTime();
      return Number.isFinite(ts) ? ts : 0;
    }

    const dashed = text.match(/(\d{4})-(\d{1,2})-(\d{1,2})(?:\s+(\d{1,2}):(\d{2}))?/);
    if (dashed) {
      const ts = new Date(
        Number(dashed[1]),
        Number(dashed[2]) - 1,
        Number(dashed[3]),
        Number(dashed[4] || 0),
        Number(dashed[5] || 0)
      ).getTime();
      return Number.isFinite(ts) ? ts : 0;
    }

    const slashed = text.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?(?:\s+(\d{1,2}):(\d{2}))?/);
    if (slashed) {
      const now = new Date();
      const year = slashed[3]
        ? Number(slashed[3].length === 2 ? `20${slashed[3]}` : slashed[3])
        : now.getFullYear();
      const ts = new Date(
        year,
        Number(slashed[1]) - 1,
        Number(slashed[2]),
        Number(slashed[4] || 0),
        Number(slashed[5] || 0)
      ).getTime();
      return Number.isFinite(ts) ? ts : 0;
    }

    return 0;
  }

  function extractMatchRowScore(element) {
    const completedSetScores = parseListRowLiveCompletedSetScores(element);
    if (completedSetScores.length) {
      const score = inferFinishedMatchScoreFromSetScores(completedSetScores);
      if (score || !hasExplicitFinishedListRowMarker(element)) {
        return score;
      }
      return extractFinishedMatchScoreFromAnchor(element);
    }

    return normalizeMatchRowAnchorScore(element);
  }

  function parseMatchRowPlayerLinks(element, baseUrl = location.href) {
    if (!element || !element.querySelectorAll) {
      return [];
    }
    const links = [];
    const seen = new Set();
    for (const anchor of Array.from(element.querySelectorAll(BSF_PLAYER_LINK_SELECTOR))) {
      const url = normalizeUrl(anchor.getAttribute("href") || anchor.href || "", baseUrl);
      if (!isBsportsfanPlayerUrl(url)) {
        continue;
      }
      const name = cleanName(anchor.textContent || "");
      if (!isLikelyName(name) || seen.has(url)) {
        continue;
      }
      links.push({ name, url, id: getBsportsfanPlayerId(url) });
      seen.add(url);
      if (links.length >= 2) {
        break;
      }
    }
    return links;
  }

  function parseMatchRowNames(element, baseUrl = location.href) {
    return parseMatchRowPlayerLinks(element, baseUrl).map((link) => link.name);
  }

  async function collectPlayerArchive() {
    const currentSnapshot = buildBsportsfanSnapshot("archive");
    window.__liveValueRadarBsportsfanSnapshot = currentSnapshot;
    const archive = await collectPlayerArchiveForSnapshot(currentSnapshot, {
      beforeDateTs: getArchiveCutoffForSnapshot(currentSnapshot),
      emitProgress: true,
      renderProgress: false,
      setCurrentSnapshot: true
    });
    currentSnapshot.playerArchive = archive;
    window.__liveValueRadarBsportsfanSnapshot = currentSnapshot;
    reportStatus(currentSnapshot, true);
    return archive;
  }

  async function collectPlayerArchiveForSnapshot(currentSnapshot, options = {}) {
    const players = Array.isArray(currentSnapshot.players) ? currentSnapshot.players.slice(0, 2) : [];
    if (players.length < 2) {
      throw new Error("Для прогноза открой страницу матча с двумя игроками.");
    }
    const collectionStartedAt = Number(options.collectionStartedAt || 0) || Date.now();
    const requestEntryState = buildInlineForecastEntryState(currentSnapshot, "request");
    const matchesPerPlayer = getArchiveMatchesPerPlayer(options);
    const minimumMatchesPerPlayer = getArchiveMinimumMatchesPerPlayer(options, matchesPerPlayer);
    const forecastMatchesPerPlayer = getArchiveForecastMatchesPerPlayer(options, matchesPerPlayer);
    const scoreHistoryMatchesPerPlayer = getArchiveScoreHistoryMatchesPerPlayer(options, matchesPerPlayer);
    const fetchConcurrency = clamp(parseInteger(options.fetchConcurrency) || 1, 1, MAX_ARCHIVE_FETCH_CONCURRENCY);
    const skipHistoricalPointArchive = Boolean(options.skipHistoricalPointArchive);
    const fetchDelayMs = Number.isFinite(Number(options.fetchDelayMs))
      ? Math.max(0, Number(options.fetchDelayMs))
      : INTERACTIVE_DELAY_MS;

    const notify = (message, archive, total, lines) => {
      if (typeof options.onProgress === "function") {
        options.onProgress(message, archive, total, lines);
      }
      if (options.emitProgress) {
        emitArchiveProgress(message, archive, total, lines);
      }
    };

    const archivePlayers = createArchivePlayersForSnapshot(players, currentSnapshot);

    notify("Ищу прошлые матчи игроков...", {
      players: archivePlayers.map((player) => ({ ...player, matches: [] })),
      fetched: 0,
      skipped: 0
    }, 0, []);

    const collectionPlan = await collectLatestMatchUrlsByPlayer(players, currentSnapshot, options);
    throwIfInlineForecastShouldYield(options, "after-player-pages");
    const candidateUrls = collectionPlan.urls;
    const archive = {
      source: "bsportsfan",
      mode: "player-archive",
      ts: Date.now(),
      requestedAt: Number(options.requestedAt || 0)
        || Number(requestEntryState && requestEntryState.capturedAt || 0)
        || collectionStartedAt,
      collectionStartedAt,
      collectionDeadlineAt: Number(options.deadlineAt || 0) || null,
      requestEntryState,
      cutoffDateTs: Number(options.beforeDateTs || 0),
      matchesPerPlayer,
      minimumMatchesPerPlayer,
      forecastMatchesPerPlayer,
      scoreHistoryMatchesPerPlayer,
      players: archivePlayers,
      candidateCount: candidateUrls.length,
      targetMatchCount: matchesPerPlayer * players.length,
      playerPages: collectionPlan.playerPages,
      league: currentSnapshot.league || null,
      targetOdds: currentSnapshot.oddsMarket || null,
      historicalPointArchiveSkipped: skipHistoricalPointArchive,
      fetched: 0,
      skipped: 0,
      errors: [],
      diagnostics: []
    };
    attachScoreHistoryToArchivePlayers(archive.players, archive.playerPages);
    notify("Найдено кандидатов для сбора...", archive, archive.candidateCount, formatArchiveProgressLines(archive));

    const insufficientProfiles = findInsufficientProfilePages(collectionPlan.playerPages, minimumMatchesPerPlayer);
    if (insufficientProfiles.length) {
      const transientProfiles = insufficientProfiles.filter((page) => (
        String(page && page.errorCode || "") === "bsportsfan-profile-unavailable"
        || isRetryableProfileCollectionError(page && page.error)
      ));
      archive.skipReason = transientProfiles.length
        ? `история игроков временно недоступна, повторяю: ${insufficientProfiles.map((page) => `${page.player || "-"} ${Number(page.matches || 0)}/${minimumMatchesPerPlayer}`).join(", ")}`
        : `пропуск без чтения графиков: ${insufficientProfiles.map((page) => `${page.player || "-"} ${Number(page.matches || 0)}/${minimumMatchesPerPlayer}`).join(", ")}`;
      archive.retryable = transientProfiles.length > 0;
      archive.retryAfterMs = transientProfiles.reduce(
        (maximum, page) => Math.max(maximum, Number(page && page.retryAfterMs || 0) || 0),
        0
      );
      archive.retryBudgetExempt = transientProfiles.some((page) => (
        String(page && page.errorCode || "") === "bsportsfan-session-expired"
        || String(page && page.errorCode || "") === "bsportsfan-profile-unavailable"
        || isBsportsfanProtectionErrorCode(page && page.errorCode)
      ));
      archive.retryReason = transientProfiles.length
        ? `temporary player profile failure: ${transientProfiles.map((page) => `${page.player || "-"}: ${page.error}`).join("; ")}`
        : "";
      archive.skipped += insufficientProfiles.length;
      for (const page of insufficientProfiles) {
        addArchiveDiagnostic(
          archive,
          page.url || "",
          `${page.player || "-"}: в профиле найдено ${Number(page.matches || 0)}/${minimumMatchesPerPlayer} прошлых матчей${page.error ? `; ${page.error}` : ""}`
        );
      }
      archive.forecast = {
        status: "not-ready",
        source: "match-start-history-pbp",
        model: "history-pbp-4factor-start-only",
        modelVersion: MATCH_START_RULE_ID,
        message: archive.skipReason,
        features: {},
        missing: insufficientProfiles.map((page) => ({
          name: page.player || "",
          count: Number(page.matches || 0),
          required: minimumMatchesPerPlayer,
          url: page.url || "",
          error: page.error || ""
        }))
      };
      notify(`Пропускаю матч: ${archive.skipReason}`, archive, archive.candidateCount, formatArchiveProgressLines(archive));
      return archive;
    }

    const seedTargetOdds = archive.targetOdds || null;
    const shouldFetchTargetOdds = options.includeOdds !== false
      && !hasUsableOpeningMoneylineOdds(archive.targetOdds);
    let targetOddsLookup = null;
    if (shouldFetchTargetOdds) {
      notify("Читаю рынок матча...", archive, archive.candidateCount, formatArchiveProgressLines(archive));
      targetOddsLookup = fetchBsportsfanOddsMarket(currentSnapshot.url, {
        matchDateTs: currentSnapshot.matchDateTs,
        deadlineAt: Number(options.deadlineAt || 0),
        requestPriority: "background",
        allowIframe: true
      }).then(
        (market) => ({ market, error: null }),
        (error) => ({ market: null, error })
      );
    }

    const collectCandidate = async (candidate) => {
      const url = typeof candidate === "string" ? candidate : candidate && candidate.url;
      if (!url) {
        return;
      }
      archive.fetched += 1;
      notify(
        `Считываю архив ${archive.fetched}/${candidateUrls.length}: ${formatArchiveCandidateLabel(candidate, url)}`,
        archive,
        archive.candidateCount,
        formatArchiveProgressLines(archive)
      );
      try {
        const matchSnapshot = normalizeMatchUrlKey(url) === normalizeMatchUrlKey(currentSnapshot.url)
          ? currentSnapshot
          : await fetchBsportsfanSnapshot(url);
        addArchiveMatchSnapshot(archive, matchSnapshot, typeof candidate === "object" ? candidate : null);
      } catch (error) {
        archive.errors.push(`${url}: ${stringifyError(error)}`);
        addArchiveDiagnostic(archive, url, stringifyError(error));
      }
      if (fetchDelayMs > 0) {
        await delay(fetchDelayMs);
      }
    };

    if (skipHistoricalPointArchive) {
      archive.mode = "profile-score-history";
      if (shouldCollectCandidatePointProfiles(archive, options)) {
        notify("Проверяю point-профили выбранной пары...", archive, archive.candidateCount, formatArchiveProgressLines(archive));
        try {
          archive.pointProfileSummary = await attachPrematchPointProfiles(
            archive.players,
            collectionPlan.playerPages,
            archive,
            {
              deadlineAt: Number(options.deadlineAt || 0),
              requestPriority: options.requestPriority,
              shouldYield: options.shouldYield
            }
          );
        } catch (error) {
          archive.pointProfileSummary = {
            status: "error",
            error: stringifyError(error),
            errorCode: String(error && error.code || ""),
            retryAfterMs: Math.max(0, Number(error && error.retryAfterMs || 0) || 0)
          };
          addArchiveDiagnostic(archive, currentSnapshot.url || "", `point profiles: ${stringifyError(error)}`);
        }
        const pointMatches = Array.isArray(archive.pointProfileSummary && archive.pointProfileSummary.pointMatches)
          ? archive.pointProfileSummary.pointMatches.map(Number)
          : [];
        if (
          archive.pointProfileSummary.status === "error"
          || Number(archive.pointProfileSummary.readyPlayers || 0) < 2
          || pointMatches.length < 2
          || pointMatches.some((matches) => !Number.isFinite(matches) || matches < 3)
        ) {
          archive.retryable = true;
          archive.retryReason = archive.pointProfileSummary.error
            || `temporary PBP coverage ${pointMatches.join("+") || "0+0"}`;
          archive.retryAfterMs = Math.max(
            0,
            Number(archive.pointProfileSummary.retryAfterMs || 0) || 0
          );
        }
      }
    } else if (fetchConcurrency > 1) {
      await runWithConcurrency(candidateUrls, fetchConcurrency, async (candidate) => {
        if (archive.players.every((player) => player.matches.length >= matchesPerPlayer)) {
          return;
        }
        await collectCandidate(candidate);
      });
    } else {
      for (const candidate of candidateUrls) {
        if (archive.players.every((player) => player.matches.length >= matchesPerPlayer)) {
          break;
        }
        await collectCandidate(candidate);
      }
    }

    finalizeArchivePlayers(archive.players, forecastMatchesPerPlayer);
    notify("Подсчитываю итог по архиву...", archive, archive.candidateCount, formatArchiveProgressLines(archive));
    if (targetOddsLookup) {
      const { market: fetchedTargetOdds, error } = await targetOddsLookup;
      if (!error) {
        archive.targetOdds = fetchedTargetOdds && fetchedTargetOdds.status === "ready"
          ? fetchedTargetOdds
          : seedTargetOdds || fetchedTargetOdds;
        currentSnapshot.oddsMarket = archive.targetOdds;
      } else {
        archive.targetOdds = seedTargetOdds || {
          source: "bsportsfan-odds",
          status: "error",
          url: getBsportsfanOddsUrl(currentSnapshot.url),
          error: stringifyError(error)
        };
        currentSnapshot.oddsMarket = archive.targetOdds;
      }
    }
    archive.forecast = buildArchiveCurrentForecastSummary(archive);
    notify("Подсчет готов", archive, archive.candidateCount, formatArchiveProgressLines(archive));
    return archive;
  }

  function hasUsableOpeningMoneylineOdds(value) {
    const source = value && typeof value === "object" ? value : {};
    const opening = source.opening && typeof source.opening === "object"
      ? source.opening
      : null;
    return Boolean(
      normalizeText(source.status || "").toLowerCase() === "ready"
      && opening
      && Number(opening.leftOdds) > 1
      && Number(opening.rightOdds) > 1
    );
  }

  function getArchiveCutoffForSnapshot(snapshot) {
    if (!snapshot || snapshot.pageType !== "match") {
      return 0;
    }

    const dateTs = Number(snapshot.matchDateTs || 0);
    return Number.isFinite(dateTs) && dateTs > 0 ? dateTs : 0;
  }

  function getArchiveMatchesPerPlayer(options = {}) {
    const value = parseInteger(options.matchesPerPlayer);
    return clamp(value || ARCHIVE_MATCHES_PER_PLAYER, 1, 20);
  }

  function getArchiveMinimumMatchesPerPlayer(options = {}, matchesPerPlayer = ARCHIVE_MATCHES_PER_PLAYER) {
    const value = parseInteger(options.minimumMatchesPerPlayer || options.minMatchesPerPlayer);
    const fallback = Number(matchesPerPlayer || ARCHIVE_MATCHES_PER_PLAYER);
    return clamp(value || fallback, 1, Math.max(1, fallback));
  }

  function getArchiveForecastMatchesPerPlayer(options = {}, collectedMatchesPerPlayer = ARCHIVE_MATCHES_PER_PLAYER) {
    const value = parseInteger(options.forecastMatchesPerPlayer);
    const fallback = Math.min(ARCHIVE_MATCHES_PER_PLAYER, Number(collectedMatchesPerPlayer || ARCHIVE_MATCHES_PER_PLAYER));
    return clamp(value || fallback, 1, Number(collectedMatchesPerPlayer || ARCHIVE_MATCHES_PER_PLAYER));
  }

  function getArchiveScoreHistoryMatchesPerPlayer(options = {}, collectedMatchesPerPlayer = ARCHIVE_MATCHES_PER_PLAYER) {
    const value = parseInteger(options.scoreHistoryMatchesPerPlayer || options.resultMatchesPerPlayer);
    const fallback = Math.max(PROFILE_SCORE_HISTORY_MATCHES, Number(collectedMatchesPerPlayer || ARCHIVE_MATCHES_PER_PLAYER));
    return clamp(value || fallback, 1, 20);
  }

  function formatArchiveCandidateLabel(candidate, fallbackUrl = "") {
    const item = candidate && typeof candidate === "object" ? candidate : {};
    const names = Array.isArray(item.names)
      ? item.names.map(cleanName).filter(isLikelyName).slice(0, 2)
      : [];
    const parts = [];
    if (names.length >= 2) {
      parts.push(names.join(" / "));
    }
    if (item.date) {
      parts.push(normalizeText(item.date));
    }
    const url = normalizeUrl(item.url || fallbackUrl || "");
    if (!parts.length && url) {
      parts.push(shortMatchUrlLabel(url));
    }
    return parts.join(" · ") || "матч";
  }

  function shortMatchUrlLabel(value) {
    const parsed = parseUrl(value);
    if (!parsed) {
      return normalizeText(value).slice(0, 90);
    }
    const parts = parsed.pathname.split("/").filter(Boolean);
    return parts.slice(-2).join("/") || parsed.pathname || parsed.href;
  }

  async function collectArchiveCandidateUrls(players, currentSnapshot, options = {}) {
    const byUrl = new Map();
    addArchiveCandidatesFromDocument(byUrl, document, location.href, players);
    await fetchLinkedPlayerPagesCandidates(byUrl, currentSnapshot.playerLinks, players, options).catch(() => {});
    for (const match of currentSnapshot.matches || []) {
      if (match && match.url) {
        addArchiveCandidate(byUrl, match.url, `${(match.names || []).join(" ")} ${match.text || ""}`, players);
      }
    }

    if (byUrl.size < 8) {
      await fetchListDocumentCandidates(byUrl, players, options).catch(() => {});
    }

    return Array.from(byUrl.values())
      .filter((item) => normalizeUrl(item.url) !== normalizeUrl(currentSnapshot.url))
      .sort((left, right) => right.score - left.score)
      .slice(0, ARCHIVE_MAX_CANDIDATE_URLS)
      .map((item) => item.url);
  }

  function parseListRowLeague(row, baseUrl, rowText = "") {
    const leagueLink = Array.from(row && row.querySelectorAll && row.querySelectorAll("a[href*='/table-tennis/l/']") || [])[0] || null;
    if (leagueLink) {
      const url = normalizeUrl(leagueLink.getAttribute("href") || leagueLink.href || "", baseUrl);
      const parsed = parseUrl(url);
      const id = parsed && (parsed.pathname.match(/\/table-tennis\/l\/(\d+)/i) || [])[1] || "";
      return {
        name: normalizeText(leagueLink.textContent || ""),
        id,
        url
      };
    }

    const text = normalizeText(rowText || row && row.textContent || "");
    const match = text.match(/^(.*?)(?:\s+\d{2}\/\d{2}\s+\d{1,2}:\d{2}\b|\s+\d{1,2}:\d{2}\b)/);
    const rawName = match ? match[1] : "";
    const name = normalizeText(rawName.replace(/^Настольный теннис\s*-\s*/i, ""));
    return {
      name,
      id: "",
      url: ""
    };
  }

  function parseSnapshotLeague(doc, baseUrl, textSample = "") {
    const leagueLink = Array.from(doc && doc.querySelectorAll && doc.querySelectorAll("a[href*='/table-tennis/l/']") || [])[0] || null;
    if (leagueLink) {
      const url = normalizeUrl(leagueLink.getAttribute("href") || leagueLink.href || "", baseUrl);
      const parsed = parseUrl(url);
      const id = parsed && (parsed.pathname.match(/\/table-tennis\/l\/(\d+)/i) || [])[1] || "";
      return {
        name: normalizeText(leagueLink.textContent || ""),
        id,
        url
      };
    }

    const title = normalizeText(doc && doc.title || "");
    const text = normalizeSearchText(`${title} ${textSample || ""}`);
    if (/кубок\s+сетки\s+-\s+женщины/i.test(`${title} ${textSample || ""}`) || text.includes("setka cup women")) {
      return { name: "Кубок Сетки - Женщины", id: "", url: "" };
    }
    if (/элит\s*[-–—]?\s*серия/i.test(title + " " + (textSample || "")) || text.includes("tt elite series")) {
      return { name: "Настольный теннис - Элит-серия", id: "29128", url: "" };
    }
    if (/серия\s+челленджер/i.test(title + " " + (textSample || "")) || text.includes("challenger series")) {
      return { name: "Настольный теннис - Серия Челленджер", id: "", url: "" };
    }
    if (text.includes("тт cup") || text.includes("tt cup")) {
      return { name: "ТТ Cup", id: "", url: "" };
    }
    if (/чехия\s+-?\s*про\s+лига/i.test(`${title} ${textSample || ""}`) || text.includes("czech liga pro")) {
      return { name: "Чехия - Про Лига", id: "", url: "" };
    }
    if (text.includes("кубок сетки") || text.includes("setka cup")) {
      return { name: "Кубок Сетки", id: "", url: "" };
    }
    return null;
  }

  function getPredictionDatasetResultStatus(row) {
    const result = getPredictionDatasetFinalResult(row);
    return normalizeText(row && (row.resultStatus || result && result.status) || "");
  }

  function getPredictionDatasetPrematch(row) {
    if (row && row.prematchSnapshot && typeof row.prematchSnapshot === "object") {
      return row.prematchSnapshot;
    }
    if (row && row.prematch && typeof row.prematch === "object") {
      return row.prematch;
    }
    return null;
  }

  function getPredictionDatasetFinalResult(row) {
    if (row && row.finalResult && typeof row.finalResult === "object") {
      return row.finalResult;
    }
    if (row && row.result && typeof row.result === "object") {
      return row.result;
    }
    return null;
  }

  function getPredictionDatasetPointTimeline(row) {
    if (Array.isArray(row && row.pointByPoint) && row.pointByPoint.length) {
      return row.pointByPoint;
    }
    if (Array.isArray(row && row.pointTimeline)) {
      return row.pointTimeline;
    }
    return [];
  }

  function getPredictionDatasetRecordKind(row) {
    const explicit = normalizeText(row && row.recordKind || "");
    if (explicit) {
      return explicit;
    }
    const prematch = getPredictionDatasetPrematch(row);
    const liveEntries = Array.isArray(row && row.liveEntries) ? row.liveEntries : [];
    const hasPrematchDecision = Boolean(prematch && isPredictionDatasetDecision(prematch.decisionLabel || prematch.action));
    const hasLiveDecision = liveEntries.some((entry) => isPredictionDatasetDecision(entry && (entry.decisionLabel || entry.decision)));
    if (hasPrematchDecision || hasLiveDecision) {
      return "forecasted";
    }
    if (getPredictionDatasetPointTimeline(row).length || Array.isArray(row && row.liveTimeline) && row.liveTimeline.length) {
      return "observed_only";
    }
    if (getPredictionDatasetFinalResult(row)) {
      return "result_only";
    }
    return "empty";
  }

  async function backfillTelegramPredictionResults(dataset, options = {}) {
    const rows = Array.isArray(dataset) ? dataset : [];
    const config = options && typeof options === "object" ? options : {};
    const limit = Math.min(30, Math.max(1, Number(config.limit || 10) || 10));
    const delayMs = Math.max(0, Number(config.delayMs || 150) || 0);
    const verbose = config.verbose !== false;
    const candidates = rows
      .filter(isForecastResultBackfillCandidate)
      .slice(0, limit);
    const summary = {
      candidates: rows.filter(isForecastResultBackfillCandidate).length,
      checked: 0,
      updated: 0,
      alreadyUpdated: 0,
      unresolved: 0,
      reusedStored: 0,
      notFinishedOrNotParsed: 0,
      failed: 0,
      skipped: rows.length - rows.filter(isForecastResultBackfillCandidate).length,
      rows: []
    };

    for (const row of candidates) {
      if (liveSessionRecoveryStarted) {
        summary.stopped = "live-session-recovery";
        break;
      }
      const storedResult = getStoredObservedFinalResultForBackfill(row);
      if (
        !storedResult
        && config.preemptForForecasts !== false
        && summary.checked > 0
        && hasUrgentProductionForecastWork()
      ) {
        summary.stopped = "forecast-priority";
        break;
      }
      const matchUrl = normalizeUrl(row && row.matchUrl || "");
      if (delayMs && summary.checked > 0) {
        await sleep(delayMs);
      }
      try {
        const found = storedResult
          || await fetchTelegramPredictionFinalResult(row, {
            requestPriority: config.requestPriority
          });
        summary.checked += 1;
        if (storedResult) {
          summary.reusedStored += 1;
        }
        if (!found || !found.finalScore) {
          summary.notFinishedOrNotParsed += 1;
          summary.rows.push({
            matchUrl,
            players: Array.isArray(row && row.players) ? row.players.join(" vs ") : "",
            status: "not-finished-or-not-parsed"
          });
          continue;
        }
        const response = await sendRuntimeMessage(buildTelegramPredictionResultUpdateMessage(
          matchUrl,
          found,
          found.source || "result-backfill"
        ));
        const recorded = response && response.datasetRecorded !== false;
        const changed = response && response.datasetChanged === true;
        const resolved = response && response.datasetResolved === true;
        if (recorded && changed && resolved) {
          summary.updated += 1;
        } else if (recorded && resolved) {
          summary.alreadyUpdated += 1;
        } else if (recorded) {
          summary.unresolved += 1;
        } else {
          summary.failed += 1;
        }
        summary.rows.push({
          matchUrl,
          players: found.players.join(" vs "),
          finalScore: found.finalScore,
          setScores: found.setScores.map((score) => `${score.left}-${score.right}`).join(" "),
          status: recorded && changed && resolved
            ? "updated"
            : recorded && resolved
              ? "already-updated"
              : recorded
                ? "result-unresolved"
                : normalizeText(response && response.reason || "update-failed")
        });
      } catch (error) {
        summary.checked += 1;
        summary.failed += 1;
        summary.rows.push({
          matchUrl,
          players: Array.isArray(row && row.players) ? row.players.join(" vs ") : "",
          status: "fetch-or-parse-error",
          error: stringifyError(error)
        });
        if (isBsportsfanProtectionError(error)) {
          summary.stopped = "bsportsfan-protection";
          break;
        }
        const code = normalizeText(error && error.code || "");
        if ([
          "bsportsfan-timeout",
          "bsportsfan-expired",
          "bsportsfan-queue-full",
          "bsportsfan-session-expired"
        ].includes(code)) {
          summary.stopped = code;
          break;
        }
      }
      if (verbose && (summary.checked % 10 === 0 || summary.checked === candidates.length)) {
        console.info("[LVR Telegram] result backfill", {
          checked: summary.checked,
          candidates: candidates.length,
          updated: summary.updated,
          notFinishedOrNotParsed: summary.notFinishedOrNotParsed,
          failed: summary.failed
        });
      }
    }

    return summary;
  }

  function installTelegramPredictionResultAutoBackfill() {
    if (!isBsportsfanTableTennisPage()) {
      return;
    }
    window.setTimeout(() => {
      maybeRunTelegramPredictionResultAutoBackfill("initial").catch((error) => {
        console.warn("[LVR Telegram] auto result backfill failed", error);
      });
    }, isBsportsfanTableTennisResultsPage()
      ? TELEGRAM_RESULT_PAGE_AUTO_BACKFILL_DELAY_MS
      : TELEGRAM_RESULT_AUTO_BACKFILL_INITIAL_DELAY_MS);
    window.setInterval(() => {
      maybeRunTelegramPredictionResultAutoBackfill("interval").catch((error) => {
        console.warn("[LVR Telegram] auto result backfill failed", error);
      });
    }, TELEGRAM_RESULT_AUTO_BACKFILL_INTERVAL_MS);
  }

  async function maybeRunTelegramPredictionResultAutoBackfill(reason = "auto", options = {}) {
    const config = options && typeof options === "object" ? options : {};
    if (visibleChallengeActive) {
      return { running: false, status: "bsportsfan-protection" };
    }
    if (liveSessionRecoveryStarted) {
      return { running: false, status: "live-session-recovery" };
    }
    if (telegramResultAutoBackfillRunning) {
      return {
        ...(telegramResultAutoBackfillLastSummary || {}),
        running: true,
        status: "running"
      };
    }
    if (!config.force && !isBsportsfanTableTennisPage()) {
      return { running: false, status: "not-bsportsfan" };
    }
    if (
      !config.force
      && hasUrgentProductionForecastWork()
    ) {
      return { running: false, status: "forecast-priority" };
    }
    const lease = await sendRuntimeMessage({
      type: "lvr:acquireBsportsfanResultBackfillLease",
      replaceOwnerLease: config.force === true,
      leaseMs: config.force
        ? 2 * 60 * 1000
        : 45 * 1000
    }).catch(() => ({ granted: false }));
    if (!lease || lease.granted !== true) {
      return {
        running: false,
        status: "another-tab-backfill",
        retryAfterMs: Math.max(0, Number(lease && lease.retryAfterMs || 0) || 0)
      };
    }
    const maintenanceLeaseToken = normalizeText(lease.token || "");

    telegramResultAutoBackfillRunning = true;
    const startedAt = Date.now();
    try {
      const initialResponse = await sendRuntimeMessage({ type: "lvr:getTelegramPredictionDataset" });
      let dataset = initialResponse && Array.isArray(initialResponse.dataset)
        ? initialResponse.dataset
        : [];
      let visibleSync = null;
      if (isBsportsfanTableTennisResultsPage()) {
        visibleSync = await syncVisibleTelegramPredictionResults({
          limit: 400,
          verbose: false,
          dataset
        }).catch((error) => ({
          failed: 1,
          error: stringifyError(error)
        }));
      } else if (dataset.some(needsTelegramPredictionResultBackfill)) {
        visibleSync = await fetchAndSyncTelegramPredictionResultsPage({
          limit: 500,
          verbose: false,
          dataset,
          requestPriority: config.force ? "interactive" : "background",
          allowFetchFallback: config.force === true
        }).catch((error) => ({
          failed: 1,
          error: stringifyError(error),
          errorCode: normalizeText(error && error.code || "")
        }));
      }
      if (
        visibleSync
        && Number(visibleSync.failed || 0) > 0
        && isBsportsfanProtectionErrorCode(visibleSync.errorCode)
      ) {
        const errorCode = normalizeText(visibleSync.errorCode || "");
        const liveSessionExpired = errorCode === "bsportsfan-session-expired";
        const recoveryTab = !liveSessionExpired && config.force === true
          ? await openBsportsfanResultsRecoveryTab().catch(() => null)
          : null;
        telegramResultAutoBackfillLastSummary = {
          running: false,
          status: liveSessionExpired
            ? "live-session-recovery"
            : recoveryTab && recoveryTab.opened
              ? "bsportsfan-protection-opened"
              : "bsportsfan-protection",
          stopped: liveSessionExpired
            ? "live-session-recovery"
            : "bsportsfan-protection",
          reason,
          startedAt,
          completedAt: Date.now(),
          visibleSync,
          recoveryTab,
          candidates: 0,
          checked: 0,
          updated: 0,
          failed: 0
        };
        return telegramResultAutoBackfillLastSummary;
      }
      if (visibleSync && visibleSync.stopped === "runtime-unavailable") {
        telegramResultAutoBackfillLastSummary = {
          running: false,
          status: "runtime-unavailable",
          stopped: "runtime-unavailable",
          reason,
          startedAt,
          completedAt: Date.now(),
          visibleSync,
          candidates: 0,
          checked: 0,
          updated: 0,
          failed: Number(visibleSync.failed || 0)
        };
        return telegramResultAutoBackfillLastSummary;
      }
      if (Number(visibleSync && visibleSync.updated || 0) > 0) {
        const refreshed = await sendRuntimeMessage({ type: "lvr:getTelegramPredictionDataset" });
        dataset = refreshed && Array.isArray(refreshed.dataset) ? refreshed.dataset : dataset;
      }

      const now = Date.now();
      const minAgeMs = config.force
        ? 0
        : Math.max(
            TELEGRAM_RESULT_AUTO_BACKFILL_MIN_ROW_AGE_MS,
            Number(config.minAgeMs ?? TELEGRAM_RESULT_AUTO_BACKFILL_MIN_ROW_AGE_MS) || 0
          );
      const requestedLimit = Math.max(
        1,
        Number(config.limit || TELEGRAM_RESULT_AUTO_BACKFILL_LIMIT)
          || TELEGRAM_RESULT_AUTO_BACKFILL_LIMIT
      );
      const networkLimit = Math.min(
        config.force ? 6 : 2,
        config.force
          ? requestedLimit
          : Math.min(TELEGRAM_RESULT_AUTO_BACKFILL_LIMIT, requestedLimit)
      );
      const eligibleCandidates = dataset
        .filter((row) => shouldAutoBackfillTelegramPredictionResult(row, now, minAgeMs, config))
        .sort(compareTelegramPredictionResultBackfillAge);
      const storedCandidates = eligibleCandidates
        .filter((row) => getStoredObservedFinalResultForBackfill(row))
        .slice(0, 20);
      if (
        visibleSync
        && Object.prototype.hasOwnProperty.call(visibleSync, "visibleRows")
      ) {
        const storedSummary = storedCandidates.length
          ? await backfillTelegramPredictionResults(storedCandidates, {
              limit: storedCandidates.length,
              delayMs: 0,
              verbose: false,
              preemptForForecasts: false,
              requestPriority: "background"
            })
          : {
              checked: 0,
              updated: 0,
              alreadyUpdated: 0,
              unresolved: 0,
              notFinishedOrNotParsed: 0,
              failed: 0,
              rows: []
            };
        let recoveryDataset = dataset;
        if (Number(storedSummary.updated || 0) > 0) {
          const refreshed = await sendRuntimeMessage({ type: "lvr:getTelegramPredictionDataset" })
            .catch(() => null);
          recoveryDataset = refreshed && Array.isArray(refreshed.dataset)
            ? refreshed.dataset
            : dataset;
        }
        const recoveryUrls = recoveryDataset
          .filter(isPublishedForecastResultBackfillCandidate)
          .sort((left, right) => (
            getTelegramPredictionDatasetRowCreatedAt(left)
            - getTelegramPredictionDatasetRowCreatedAt(right)
          ))
          .map((row) => normalizeMatchUrlKey(row && row.matchUrl || ""))
          .filter(Boolean);
        const recovery = config.force === true && recoveryUrls.length
          ? await sendRuntimeMessage({
              type: "lvr:startBsportsfanResultRecovery",
              matchUrls: recoveryUrls
            }).catch(() => null)
          : null;
        telegramResultAutoBackfillLastSummary = {
          running: false,
          status: "done",
          reason,
          startedAt,
          completedAt: Date.now(),
          visibleSync,
          candidates: eligibleCandidates.length,
          checked: Number(storedSummary.checked || 0),
          updated: Number(storedSummary.updated || 0),
          alreadyUpdated: Number(storedSummary.alreadyUpdated || 0),
          unresolved: Number(storedSummary.unresolved || 0),
          notFinishedOrNotParsed: Number(storedSummary.notFinishedOrNotParsed || 0),
          failed: Number(storedSummary.failed || 0),
          skipped: Math.max(0, dataset.length - eligibleCandidates.length),
          rows: Array.isArray(storedSummary.rows) ? storedSummary.rows : [],
          recovery
        };
        return telegramResultAutoBackfillLastSummary;
      }
      const storedCandidateKeys = new Set(storedCandidates
        .map((row) => normalizeMatchUrlKey(row && row.matchUrl || ""))
        .filter(Boolean));
      const networkPool = eligibleCandidates
        .filter((row) => !storedCandidateKeys.has(
          normalizeMatchUrlKey(row && row.matchUrl || "")
        ));
      const networkCandidates = selectTelegramPredictionResultBackfillCandidates(
        networkPool,
        networkLimit
      );
      const candidates = [...storedCandidates, ...networkCandidates];

      if (!candidates.length) {
        telegramResultAutoBackfillLastSummary = {
          running: false,
          status: "empty",
          reason,
          startedAt,
          completedAt: Date.now(),
          visibleSync,
          candidates: 0
        };
        return telegramResultAutoBackfillLastSummary;
      }

      const summary = await backfillTelegramPredictionResults(candidates, {
        limit: candidates.length,
        delayMs: Math.max(0, Number(config.delayMs || 200) || 0),
        verbose: false,
        preemptForForecasts: config.force !== true,
        requestPriority: config.force ? "interactive" : "background"
      });
      updateTelegramPredictionResultAutoBackfillRetry(summary);
      telegramResultAutoBackfillLastSummary = {
        running: false,
        status: "done",
        reason,
        startedAt,
        completedAt: Date.now(),
        visibleSync,
        ...summary
      };
      if (summary.updated || summary.failed) {
        console.info("[LVR Telegram] auto result backfill", telegramResultAutoBackfillLastSummary);
      }
      return telegramResultAutoBackfillLastSummary;
    } finally {
      telegramResultAutoBackfillRunning = false;
      if (maintenanceLeaseToken) {
        await sendRuntimeMessage({
          type: "lvr:releaseBsportsfanResultBackfillLease",
          token: maintenanceLeaseToken
        }).catch(() => {});
      }
    }
  }

  function compareTelegramPredictionResultBackfillAge(left, right) {
    const leftCreatedAt = getTelegramPredictionDatasetRowCreatedAt(left);
    const rightCreatedAt = getTelegramPredictionDatasetRowCreatedAt(right);
    return rightCreatedAt - leftCreatedAt
      || normalizeMatchUrlKey(left && left.matchUrl || "")
        .localeCompare(normalizeMatchUrlKey(right && right.matchUrl || ""));
  }

  function selectTelegramPredictionResultBackfillCandidates(rows, limitValue) {
    const list = Array.isArray(rows) ? rows : [];
    const limit = Math.max(0, Number(limitValue || 0) || 0);
    if (!limit || list.length <= limit) {
      return list.slice(0, limit || list.length);
    }
    if (limit === 1) {
      return list.slice(0, 1);
    }
    return [
      ...list.slice(0, limit - 1),
      list[list.length - 1]
    ];
  }

  function shouldAutoBackfillTelegramPredictionResult(row, now = Date.now(), minAgeMs = 0, config = {}) {
    if (!needsTelegramPredictionResultBackfill(row)) {
      return false;
    }
    const recordKind = getPredictionDatasetRecordKind(row);
    if (recordKind !== "forecasted") {
      return false;
    }
    const matchUrl = normalizeUrl(row && row.matchUrl || "");
    const key = normalizeMatchUrlKey(matchUrl);
    if (!key) {
      return false;
    }
    const retryAt = Number(telegramResultAutoBackfillRetryAt.get(key) || 0);
    if (!config.force && config.retryFailed !== true && retryAt && now < retryAt) {
      return false;
    }
    const createdAt = getTelegramPredictionDatasetRowCreatedAt(row);
    if (!config.force && createdAt && now - createdAt < minAgeMs) {
      return false;
    }
    return true;
  }

  function getTelegramPredictionDatasetRowCreatedAt(row) {
    const prematch = getPredictionDatasetPrematch(row);
    const liveEntries = Array.isArray(row && row.liveEntries) ? row.liveEntries : [];
    const pointTimeline = getPredictionDatasetPointTimeline(row);
    return Number(row && (row.createdAt || row.ts) || 0)
      || Number(prematch && (prematch.ts || prematch.createdAt) || 0)
      || Number(liveEntries[0] && (liveEntries[0].ts || liveEntries[0].createdAt) || 0)
      || Number(pointTimeline[0] && (pointTimeline[0].ts || pointTimeline[0].createdAt) || 0)
      || 0;
  }

  function updateTelegramPredictionResultAutoBackfillRetry(summary) {
    const rows = Array.isArray(summary && summary.rows) ? summary.rows : [];
    const now = Date.now();
    for (const row of rows) {
      const key = normalizeMatchUrlKey(row && row.matchUrl || "");
      if (!key) {
        continue;
      }
      const status = normalizeText(row && row.status || "");
      if (status === "updated" || status === "already-updated") {
        telegramResultAutoBackfillRetryAt.delete(key);
      } else if (status === "not-finished-or-not-parsed") {
        setBoundedMapValue(telegramResultAutoBackfillRetryAt, key, now + TELEGRAM_RESULT_AUTO_BACKFILL_RETRY_MS, RUNTIME_STATE_MAX_ENTRIES);
      } else {
        setBoundedMapValue(telegramResultAutoBackfillRetryAt, key, now + TELEGRAM_RESULT_AUTO_BACKFILL_ERROR_RETRY_MS, RUNTIME_STATE_MAX_ENTRIES);
      }
    }
  }

  function hasHistoricalOpeningOdds(row) {
    const prematch = row && (row.prematchSnapshot || row.prematch);
    const markets = [
      prematch && prematch.referenceMoneylineMarket,
      prematch && prematch.moneylineMarket,
      row && row.historicalOpeningMoneyline
    ];
    return markets.some((market) => market
      && normalizeText(market.status || "").toLowerCase() === "ready"
      && normalizeText(market.marketType || "").toLowerCase() === "matchresult"
      && normalizeText(market.quoteSource || market.preferredSource || "").toLowerCase() === "opening"
      && Number(market.leftOdds) > 1
      && Number(market.rightOdds) > 1);
  }

  function getTelegramPredictionHistoricalMatchDateTs(row) {
    const prematch = row && (row.prematchSnapshot || row.prematch);
    const pointTimeline = Array.isArray(row && row.pointTimeline) ? row.pointTimeline : [];
    return Number(row && row.matchDateTs || 0)
      || Number(prematch && prematch.requestEntryState && prematch.requestEntryState.matchDateTs || 0)
      || Number(prematch && prematch.requestedAt || 0)
      || Number(pointTimeline[0] && pointTimeline[0].ts || 0)
      || Number(row && row.createdAt || 0)
      || 0;
  }

  async function runTelegramPredictionOpeningOddsBackfill(options = {}) {
    if (liveSessionRecoveryStarted) {
      return { running: false, status: "live-session-recovery" };
    }
    if (telegramOpeningOddsBackfillRunning) {
      return telegramOpeningOddsBackfillLastSummary || { running: true, status: "running" };
    }
    const lease = await sendRuntimeMessage({
      type: "lvr:acquireBsportsfanResultBackfillLease",
      leaseMs: 5 * 60 * 1000
    }).catch(() => ({ granted: false }));
    if (!lease || lease.granted !== true) {
      return {
        running: false,
        status: "another-tab-maintenance",
        retryAfterMs: Math.max(0, Number(lease && lease.retryAfterMs || 0) || 0)
      };
    }
    const maintenanceLeaseToken = normalizeText(lease.token || "");
    telegramOpeningOddsBackfillRunning = true;
    const startedAt = Date.now();
    const limit = Math.min(20, Math.max(1, Number(options.limit || 20) || 20));
    const delayMs = Math.max(500, Number(options.delayMs || 500) || 0);
    try {
      const response = await sendRuntimeMessage({ type: "lvr:getTelegramPredictionDataset" });
      const dataset = response && Array.isArray(response.dataset) ? response.dataset : [];
      const suppliedCandidates = Array.isArray(options.candidates) ? options.candidates : null;
      const persistToDataset = options.persistToDataset !== false;
      const candidates = (suppliedCandidates || dataset
        .filter((row) => normalizeUrl(row && row.matchUrl || "") && !hasHistoricalOpeningOdds(row)))
        .filter((row) => normalizeUrl(row && row.matchUrl || ""))
        .slice(0, limit);
      const summary = {
        running: false,
        status: candidates.length ? "done" : "empty",
        startedAt,
        completedAt: 0,
        candidates: candidates.length,
        checked: 0,
        updated: 0,
        unavailable: 0,
        failed: 0,
        rows: []
      };
      for (const row of candidates) {
        if (liveSessionRecoveryStarted) {
          summary.stopped = "live-session-recovery";
          break;
        }
        const matchUrl = normalizeUrl(row && row.matchUrl || "");
        try {
          const market = await fetchBsportsfanOddsMarket(matchUrl, {
            matchDateTs: getTelegramPredictionHistoricalMatchDateTs(row),
            requestPriority: "background",
            allowIframe: true
          });
          summary.checked += 1;
          const opening = market && market.opening;
          if (!opening || !(Number(opening.leftOdds) > 1) || !(Number(opening.rightOdds) > 1)) {
            summary.unavailable += 1;
            summary.rows.push({ matchUrl, status: "opening-unavailable" });
          } else {
            const observedAt = Date.now();
            const historicalOpeningMoneyline = {
              status: "ready",
              reason: "historical-opening-odds-backfill",
              marketType: "matchResult",
              quoteSource: "opening",
              preferredSource: "opening",
              leftOdds: Number(opening.leftOdds),
              rightOdds: Number(opening.rightOdds),
              source: normalizeText(market.source || "bsportsfan-odds"),
              sourceUrl: normalizeUrl(market.url || getBsportsfanOddsUrl(matchUrl)),
              observedAt,
              backfilledAt: observedAt,
              retrospective: true,
              executionVerified: false
            };
            const patchResponse = persistToDataset
              ? await sendRuntimeMessage({
                type: "lvr:patchTelegramPredictionHistoricalOpeningOdds",
                quote: {
                  matchUrl,
                  ...historicalOpeningMoneyline
                }
              })
              : { recorded: true };
            if (patchResponse && patchResponse.recorded !== false) {
              summary.updated += 1;
              summary.rows.push({ matchUrl, status: "updated", historicalOpeningMoneyline });
            } else {
              summary.failed += 1;
              summary.rows.push({ matchUrl, status: "record-not-found" });
            }
          }
        } catch (error) {
          summary.checked += 1;
          summary.failed += 1;
          summary.rows.push({ matchUrl, status: "fetch-or-parse-error", error: stringifyError(error) });
          if (isBsportsfanProtectionError(error)) {
            summary.stopped = "bsportsfan-protection";
            break;
          }
        }
        if (delayMs > 0) {
          await delay(delayMs);
        }
      }
      summary.completedAt = Date.now();
      telegramOpeningOddsBackfillLastSummary = summary;
      return summary;
    } finally {
      telegramOpeningOddsBackfillRunning = false;
      if (maintenanceLeaseToken) {
        sendRuntimeMessage({
          type: "lvr:releaseBsportsfanResultBackfillLease",
          token: maintenanceLeaseToken
        }).catch(() => {});
      }
    }
  }

  async function syncVisibleTelegramPredictionResults(options = {}) {
    return syncTelegramPredictionResultsFromDocument(document, {
      ...(options && typeof options === "object" ? options : {}),
      source: "visible-results-sync",
      trustFinishedRows: true
    });
  }

  async function fetchAndSyncTelegramPredictionResultsPage(options = {}) {
    const config = options && typeof options === "object" ? options : {};
    const resultsUrl = normalizeUrl(RESULTS_PATH, location.origin);
    let html = "";
    try {
      html = await loadTelegramPredictionResultsPageInFrame(resultsUrl, {
        deadlineAt: Date.now() + BSPORTSFAN_TEXT_FETCH_TIMEOUT_MS,
        requestPriority: config.requestPriority || "background"
      });
    } catch (error) {
      if (isBsportsfanProtectionError(error)) {
        throw error;
      }
      if (config.allowFetchFallback === false) {
        throw error;
      }
      html = await fetchText(resultsUrl, {
        cacheTtlMs: config.requestPriority === "interactive" ? 1 : 30 * 1000,
        deadlineAt: Date.now() + BSPORTSFAN_TEXT_FETCH_TIMEOUT_MS,
        requestPriority: config.requestPriority || "background"
      });
    }
    const doc = parseHtmlDocument(html);
    if (isBsportsfanDocumentChallenge(doc)) {
      throw createBsportsfanChallengeError(
        "BsportsFan results page returned a security challenge",
        { report: false }
      );
    }
    if (isBsportsfanDocumentLiveSessionExpired(doc)) {
      throw createBsportsfanLiveSessionExpiredError("BsportsFan results page live session expired");
    }
    return syncTelegramPredictionResultsFromDocument(doc, {
      ...config,
      source: "results-page-backfill",
      trustFinishedRows: true
    });
  }

  function openBsportsfanResultsRecoveryTab() {
    return sendRuntimeMessage({
      type: "lvr:openBsportsfanResultsRecovery",
      url: normalizeUrl(RESULTS_PATH, location.origin)
    });
  }

  function loadTelegramPredictionResultsPageInFrame(resultsUrl, options = {}) {
    return new Promise((resolve, reject) => {
      const frame = document.createElement("iframe");
      let settled = false;
      let pollTimer = 0;
      let navigationLeaseToken = "";
      const startedAt = Date.now();
      const timeoutMs = getBoundedOperationTimeoutMs(9000, options.deadlineAt);
      let cancelRuntimeDeadline = () => {};
      const finish = (error, html = "") => {
        if (settled) {
          return;
        }
        settled = true;
        cancelRuntimeDeadline();
        if (pollTimer) {
          window.clearTimeout(pollTimer);
        }
        frame.remove();
        if (navigationLeaseToken) {
          releaseBsportsfanRequestSlot(navigationLeaseToken);
          navigationLeaseToken = "";
        }
        if (error) {
          reject(error);
        } else {
          resolve(html);
        }
      };
      if (timeoutMs <= 0) {
        finish(createDeadlineError("results iframe", 0));
        return;
      }
      cancelRuntimeDeadline = scheduleRuntimeDeadline(timeoutMs, (deadlineError) => {
        finish(deadlineError || new Error(`results iframe timed out after ${timeoutMs} ms`));
      });

      const poll = () => {
        try {
          const doc = frame.contentDocument;
          const win = frame.contentWindow;
          if (!doc) {
            throw new Error("results iframe document empty");
          }
          if (isBsportsfanDocumentLiveSessionExpired(doc)) {
            finish(createBsportsfanLiveSessionExpiredError("BsportsFan results iframe live session expired"));
            return;
          }
          if (isBsportsfanDocumentChallenge(doc)) {
            finish(createBsportsfanChallengeError(
              "BsportsFan results iframe returned a security challenge",
              { report: false }
            ));
            return;
          }
          wakePageInFrame(doc, win);
          const matchRows = Array.from(doc.querySelectorAll("tr,.card-hover,li"))
            .filter((row) => row && row.querySelector && row.querySelector(BSF_MATCH_LINK_SELECTOR));
          const finishedRows = matchRows.filter((row) => {
            const matchUrl = findMatchUrlInRow(row);
            return Boolean(
              extractFinishedMatchScoreFromListRow(row, matchUrl)
              || extractFinishedMatchScoreFromAnchor(row, matchUrl)
            );
          });
          if (
            finishedRows.length
            && doc.readyState === "complete"
            && Date.now() - startedAt >= 1000
          ) {
            finish(null, doc.documentElement && doc.documentElement.outerHTML || "");
            return;
          }
          if (doc.readyState === "complete" && Date.now() - startedAt >= 3500) {
            if (matchRows.length) {
              finish(null, doc.documentElement && doc.documentElement.outerHTML || "");
            } else {
              finish(new Error("results iframe returned no match rows"));
            }
            return;
          }
        } catch (error) {
          if (isBsportsfanProtectionError(error) || Date.now() - startedAt >= timeoutMs) {
            finish(error);
            return;
          }
        }
        pollTimer = window.setTimeout(poll, 250);
      };

      frame.addEventListener("load", () => {
        pollTimer = window.setTimeout(poll, 250);
      }, { once: true });
      frame.style.cssText = "position:fixed;width:1280px;height:900px;left:-2000px;top:0;border:0;opacity:0;pointer-events:none;";
      acquireBsportsfanRequestSlot(resultsUrl, options).then((lease) => {
        const token = normalizeText(lease && lease.token || "");
        if (settled) {
          releaseBsportsfanRequestSlot(token);
          return;
        }
        navigationLeaseToken = token;
        frame.src = resultsUrl;
        (document.body || document.documentElement).appendChild(frame);
        pollTimer = window.setTimeout(poll, 700);
      }).catch((error) => finish(error));
    });
  }

  async function syncTelegramPredictionResultsFromDocument(doc, options = {}) {
    const config = options && typeof options === "object" ? options : {};
    const limit = Math.max(1, Number(config.limit || 300) || 300);
    const verbose = config.verbose !== false;
    const source = normalizeText(config.source || "results-sync");
    const dataset = Array.isArray(config.dataset)
      ? config.dataset
      : [];
    const pendingRowsByMatchKey = new Map(dataset
      .filter(isForecastResultBackfillCandidate)
      .map((row) => {
        const url = row && row.matchUrl || "";
        return [getBsportsfanMatchId(url) || normalizeMatchUrlKey(url), row];
      })
      .filter(([key]) => Boolean(key)));
    const rows = Array.from(doc.querySelectorAll("tr, .card-hover, li"))
      .filter((row) => row && row.querySelector && row.querySelector(BSF_MATCH_LINK_SELECTOR))
      .filter((row) => {
        const url = findMatchUrlInRow(row);
        return pendingRowsByMatchKey.has(getBsportsfanMatchId(url) || normalizeMatchUrlKey(url));
      })
      .slice(0, limit);
    const summary = {
      visibleRows: rows.length,
      checked: 0,
      updated: 0,
      alreadyUpdated: 0,
      unresolved: 0,
      notFinishedOrNotParsed: 0,
      failed: 0,
      rows: []
    };

    for (const row of rows) {
      const matchUrl = normalizeUrl(findMatchUrlInRow(row));
      if (!matchUrl) {
        continue;
      }
      const parsedPlayers = parseListRowPlayers(row).slice(0, 2);
      // A few result layouts expose both names as one concatenated text node.
      // Passing that as one player creates false orientation conflicts. With no
      // complete pair the result updater safely keeps the canonical archive order.
      const players = parsedPlayers.length === 2 ? parsedPlayers : [];
      const playerLinks = alignPlayerLinksToPlayers(
        players,
        parseMatchRowPlayerLinks(row, matchUrl)
      );
      const playerIds = playerLinks.length >= 2
        ? playerLinks.map((link) => String(
            link && (link.id || getBsportsfanPlayerId(link.url)) || ""
          ))
        : [];
      const finalScore = extractFinishedMatchScoreFromListRow(row, matchUrl)
        || (config.trustFinishedRows === true
          ? extractFinishedMatchScoreFromAnchor(row, matchUrl)
          : "");
      if (!finalScore) {
        summary.notFinishedOrNotParsed += 1;
        summary.rows.push({
          matchUrl,
          players: players.join(" vs "),
          status: "not-finished-or-not-parsed"
        });
        continue;
      }
      const completedSetScores = parseListRowLiveCompletedSetScores(row);
      const setScores = completedSetScores.map((score, index) => ({
        set: Number(score && score.set || index + 1),
        left: Number(score && score.left),
        right: Number(score && score.right)
      })).filter((score) => Number.isFinite(score.left) && Number.isFinite(score.right));
      summary.checked += 1;
      try {
        const response = await sendRuntimeMessage({
          type: "lvr:updateTelegramPredictionResult",
          result: {
            matchUrl,
            finalScore,
            players,
            playerIds,
            setScores,
            source
          }
        });
        const recorded = response && response.datasetRecorded !== false;
        const changed = response && response.datasetChanged === true;
        const resolved = response && response.datasetResolved === true;
        if (recorded && changed && resolved) {
          summary.updated += 1;
        } else if (recorded && resolved) {
          summary.alreadyUpdated += 1;
        } else if (recorded) {
          summary.unresolved += 1;
        } else {
          summary.unresolved += 1;
        }
        summary.rows.push({
          matchUrl,
          players: players.join(" vs "),
          finalScore,
          setScores: setScores.map((score) => `${score.left}-${score.right}`).join(" "),
          status: recorded && changed && resolved
            ? "updated"
            : recorded && resolved
              ? "already-updated"
              : recorded
                ? "result-unresolved"
                : normalizeText(response && response.reason || "update-failed")
        });
      } catch (error) {
        summary.failed += 1;
        summary.rows.push({
          matchUrl,
          players: players.join(" vs "),
          finalScore,
          status: "update-error",
          error: stringifyError(error)
        });
        if (isRuntimeMessagingUnavailableError(error)) {
          summary.stopped = "runtime-unavailable";
          break;
        }
      }
    }

    if (verbose) {
      console.info("[LVR Telegram] visible result sync", summary);
    }
    return summary;
  }

  function isRuntimeMessagingUnavailableError(error) {
    return /message port|receiving end|context invalidated|extension context|disconnected?/i
      .test(stringifyError(error));
  }

  function buildTelegramPredictionResultUpdateMessage(matchUrl, found, source) {
    const result = found && typeof found === "object" ? found : {};
    return {
      type: "lvr:updateTelegramPredictionResult",
      result: {
        matchUrl: normalizeMatchUrlKey(matchUrl || ""),
        finalScore: normalizeText(result.finalScore || ""),
        players: Array.isArray(result.players) ? result.players.slice(0, 2) : [],
        playerIds: Array.isArray(result.playerIds)
          ? result.playerIds.slice(0, 2).map((value) => String(value || ""))
          : [],
        setScores: Array.isArray(result.setScores) ? result.setScores : [],
        scoreOrderTrusted: result.scoreOrderTrusted === true,
        scoreOrderEvidence: normalizeText(result.scoreOrderEvidence || ""),
        source: normalizeText(source || "result-backfill")
      }
    };
  }

  function needsTelegramPredictionResultBackfill(row) {
    if (!row || isTelegramPredictionResultResolved(row)) {
      return false;
    }
    const url = normalizeUrl(row.matchUrl || "");
    return Boolean(url && isBsportsfanMatchUrl(url));
  }

  function isForecastResultBackfillCandidate(row) {
    return getPredictionDatasetRecordKind(row) === "forecasted"
      && needsTelegramPredictionResultBackfill(row);
  }

  function isPublishedForecastResultBackfillCandidate(row) {
    const prematch = getPredictionDatasetPrematch(row);
    return isForecastResultBackfillCandidate(row)
      && Boolean(prematch && (prematch.sent === true || prematch.sent === 1));
  }

  function isTelegramPredictionResultResolved(row) {
    const status = normalizeText(getPredictionDatasetResultStatus(row)).toLowerCase();
    if (status !== "hit" && status !== "miss") {
      return false;
    }
    const result = getPredictionDatasetFinalResult(row);
    const score = parseFinishedScoreParts(
      result && result.finalScore
      || row && row.finalScore
      || ""
    );
    return Boolean(
      score
      && Math.max(score.left, score.right) === 3
      && Math.min(score.left, score.right) >= 0
      && Math.min(score.left, score.right) <= 2
    );
  }

  function getStoredObservedFinalResultForBackfill(row) {
    const result = getPredictionDatasetFinalResult(row);
    if (normalizeText(result && result.resultOrientation || "").toLowerCase() === "unresolved") {
      return null;
    }
    const finalScore = normalizeText(
      result && (result.observedFinalScore || result.finalScore)
      || row && row.finalScore
      || ""
    );
    const parsedScore = parseFinishedScoreParts(finalScore);
    const players = Array.isArray(result && result.observedPlayers)
      ? result.observedPlayers.slice(0, 2).map(cleanName).filter(Boolean)
      : [];
    if (
      !parsedScore
      || Math.max(parsedScore.left, parsedScore.right) !== 3
    ) {
      return null;
    }
    const setScores = (Array.isArray(result && result.observedSetScores)
      ? result.observedSetScores
      : Array.isArray(result && result.setScores)
        ? result.setScores
        : [])
      .map((score, index) => ({
        set: Number(score && score.set || index + 1),
        left: Number(score && score.left),
        right: Number(score && score.right)
      }))
      .filter((score) => Number.isFinite(score.left) && Number.isFinite(score.right));
    return {
      matchUrl: normalizeUrl(row && row.matchUrl || ""),
      finalScore: `${parsedScore.left}-${parsedScore.right}`,
      players: players.length === 2 ? players : [],
      playerIds: Array.isArray(result && result.observedPlayerIds)
        ? result.observedPlayerIds.slice(0, 2).map((value) => String(value || ""))
        : [],
      setScores
    };
  }

  function getTelegramPredictionRowPlayerIds(row) {
    const prematch = getPredictionDatasetPrematch(row);
    const features = prematch && prematch.features && typeof prematch.features === "object"
      ? prematch.features
      : row && row.features && typeof row.features === "object"
        ? row.features
        : {};
    const profiles = Array.isArray(features && features.startMatchProfiles)
      ? features.startMatchProfiles.slice(0, 2)
      : [];
    const profileIds = profiles.map((profile) => {
      const match = normalizeText(profile && profile.identityKey || "").match(/^id:(\d+)$/);
      return match ? match[1] : "";
    });
    if (profileIds.length === 2 && profileIds.every(Boolean)) {
      return profileIds;
    }
    return Array.isArray(row && row.playerIds)
      ? row.playerIds.slice(0, 2).map((value) => String(value || ""))
      : [];
  }

  function getTelegramPredictionRowPlayerLinks(row) {
    const players = Array.isArray(row && row.players)
      ? row.players.slice(0, 2).map(cleanName)
      : [];
    const playerIds = getTelegramPredictionRowPlayerIds(row);
    if (players.length < 2 || playerIds.length < 2 || playerIds.some((id) => !id)) {
      return [];
    }
    const matchUrl = parseUrl(row && row.matchUrl || "");
    const origin = matchUrl && matchUrl.origin || location.origin;
    return players.map((name, index) => ({
      name,
      id: playerIds[index],
      url: normalizeUrl(`/table-tennis/t/${playerIds[index]}`, origin)
    }));
  }

  async function fetchTelegramPredictionFinalResult(row, options = {}) {
    const matchResult = await fetchTelegramPredictionFinalResultFromMatchPage(row, options);
    if (matchResult) {
      return matchResult;
    }
    const ageMs = Math.max(0, Date.now() - getTelegramPredictionDatasetRowCreatedAt(row));
    if (ageMs >= TELEGRAM_RESULT_AUTO_BACKFILL_RETRY_MS) {
      const profileResult = await fetchTelegramPredictionFinalResultFromPlayerPages(row, options);
      if (profileResult) {
        return profileResult;
      }
    }
    return null;
  }

  async function fetchTelegramPredictionFinalResultFromMatchPage(row, options = {}) {
    const matchUrl = normalizeUrl(row && row.matchUrl || "");
    if (!matchUrl) {
      return null;
    }
    if (options.allowIframe !== false) {
      try {
        const frameResult = await loadTelegramPredictionFinalResultInFrame(row, {
          ...options,
          deadlineAt: Date.now() + BSPORTSFAN_TEXT_FETCH_TIMEOUT_MS
        });
        if (frameResult) {
          return frameResult;
        }
      } catch (error) {
        if (isBsportsfanProtectionError(error) && !isBsportsfanChallengeError(error)) {
          throw error;
        }
      }
    }
    const html = await fetchText(matchUrl, {
      cacheTtlMs: 1,
      deadlineAt: Date.now() + BSPORTSFAN_TEXT_FETCH_TIMEOUT_MS,
      requestPriority: options.requestPriority || "background"
    });
    const doc = new DOMParser().parseFromString(html, "text/html");
    return parseTelegramPredictionFinalResultDocument(
      doc,
      matchUrl,
      row,
      "match-page-backfill"
    );
  }

  function parseTelegramPredictionFinalResultDocument(doc, matchUrl, row, source) {
    const snapshot = buildBsportsfanSnapshotFromDocument(doc, matchUrl, "telegram-result-backfill");
    if (isBsportsfanChallengeSnapshot(snapshot) || isBsportsfanDocumentChallenge(doc)) {
      throw createBsportsfanChallengeError(
        "BsportsFan result page returned a security challenge",
        { report: false }
      );
    }
    if (isBsportsfanDocumentLiveSessionExpired(doc)) {
      throw createBsportsfanLiveSessionExpiredError("BsportsFan result page live session expired");
    }
    const setScores = uniqueSetScores(snapshot && snapshot.setScores)
      .filter((score) => isCompletedTableTennisSet(score && score.left, score && score.right));
    const finalScore = inferFinishedMatchScoreFromSetScores(setScores)
      || extractExplicitFinishedMatchScoreFromDocument(doc, snapshot, matchUrl);
    if (!finalScore) {
      return null;
    }
    const players = Array.isArray(snapshot && snapshot.players) && snapshot.players.length >= 2
      ? snapshot.players.slice(0, 2)
      : Array.isArray(row && row.players)
        ? row.players.slice(0, 2)
        : [];
    const resultPlayerLinks = alignPlayerLinksToPlayers(
      players,
      Array.isArray(snapshot && snapshot.playerLinks) ? snapshot.playerLinks : []
    );
    return {
      matchUrl,
      finalScore,
      players,
      playerIds: resultPlayerLinks.map((link) => String(
        link && (link.id || getBsportsfanPlayerId(link.url)) || ""
      )),
      setScores,
      scoreOrderTrusted: players.length === 2,
      scoreOrderEvidence: "direct-match-page",
      source: normalizeText(source || "match-page-backfill")
    };
  }

  function loadTelegramPredictionFinalResultInFrame(row, options = {}) {
    const matchUrl = normalizeUrl(row && row.matchUrl || "");
    return new Promise((resolve, reject) => {
      if (!matchUrl) {
        resolve(null);
        return;
      }
      const frame = document.createElement("iframe");
      let settled = false;
      let pollTimer = 0;
      let navigationLeaseToken = "";
      const startedAt = Date.now();
      const timeoutMs = getBoundedOperationTimeoutMs(8000, options.deadlineAt);
      let cancelRuntimeDeadline = () => {};
      const finish = (error, result = null) => {
        if (settled) {
          return;
        }
        settled = true;
        cancelRuntimeDeadline();
        if (pollTimer) {
          window.clearTimeout(pollTimer);
        }
        frame.remove();
        if (navigationLeaseToken) {
          releaseBsportsfanRequestSlot(navigationLeaseToken);
          navigationLeaseToken = "";
        }
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      };
      if (timeoutMs <= 0) {
        finish(createDeadlineError("result iframe", 0));
        return;
      }
      cancelRuntimeDeadline = scheduleRuntimeDeadline(timeoutMs, (deadlineError) => {
        finish(deadlineError || new Error(`result iframe timed out after ${timeoutMs} ms`));
      });

      const poll = () => {
        try {
          const doc = frame.contentDocument;
          const win = frame.contentWindow;
          if (!doc) {
            throw new Error("result iframe document empty");
          }
          if (isBsportsfanDocumentLiveSessionExpired(doc)) {
            finish(createBsportsfanLiveSessionExpiredError("BsportsFan result iframe live session expired"));
            return;
          }
          if (isBsportsfanDocumentChallenge(doc)) {
            finish(createBsportsfanChallengeError(
              "BsportsFan result iframe returned a security challenge",
              { report: false }
            ));
            return;
          }
          wakePageInFrame(doc, win);
          const found = parseTelegramPredictionFinalResultDocument(
            doc,
            matchUrl,
            row,
            "match-page-frame-backfill"
          );
          if (found) {
            finish(null, found);
            return;
          }
          if (
            doc.readyState === "complete"
            && Date.now() - startedAt >= 2500
          ) {
            finish(null, null);
            return;
          }
        } catch (error) {
          if (isBsportsfanProtectionError(error) || Date.now() - startedAt >= timeoutMs) {
            finish(error);
            return;
          }
        }
        pollTimer = window.setTimeout(poll, 250);
      };

      frame.addEventListener("load", () => {
        pollTimer = window.setTimeout(poll, 250);
      }, { once: true });
      frame.style.cssText = "position:fixed;width:1280px;height:900px;left:-2000px;top:0;border:0;opacity:0;pointer-events:none;";
      acquireBsportsfanRequestSlot(matchUrl, {
        deadlineAt: options.deadlineAt,
        requestPriority: options.requestPriority || "background"
      }).then((lease) => {
        const token = normalizeText(lease && lease.token || "");
        if (settled) {
          releaseBsportsfanRequestSlot(token);
          return;
        }
        navigationLeaseToken = token;
        frame.src = matchUrl;
        (document.body || document.documentElement).appendChild(frame);
        pollTimer = window.setTimeout(poll, 700);
      }).catch((error) => finish(error));
    });
  }

  async function fetchTelegramPredictionFinalResultFromPlayerPages(row, options = {}) {
    const matchUrl = normalizeMatchUrlKey(row && row.matchUrl || "");
    const links = getTelegramPredictionRowPlayerLinks(row);
    if (!matchUrl || !links.length) {
      return null;
    }
    for (const link of links) {
      let matches = [];
      try {
        matches = await fetchPlayerResultMatches(link.url, {
          cacheTtlMs: 1,
          deadlineAt: Date.now() + BSPORTSFAN_TEXT_FETCH_TIMEOUT_MS,
          requestPriority: options.requestPriority || "background",
          allowIframe: false
        });
      } catch (error) {
        if (isBsportsfanProtectionError(error)) {
          throw error;
        }
        continue;
      }
      const exact = matches.find((match) => (
        match
        && match.url
        && isSameBsportsfanMatch(match.url, matchUrl)
      ));
      const finalScore = parseFinishedMatchScoreText(exact && exact.score || "");
      if (!exact || !finalScore) {
        continue;
      }
      const players = Array.isArray(exact.names)
        ? exact.names.slice(0, 2).map(cleanName).filter(Boolean)
        : [];
      const playerLinks = alignPlayerLinksToPlayers(
        players,
        Array.isArray(exact.playerLinks) ? exact.playerLinks : []
      );
      if (players.length < 2) {
        continue;
      }
      return {
        matchUrl,
        finalScore,
        players,
        playerIds: playerLinks.length >= 2
          ? playerLinks.map((playerLink) => String(
              playerLink && (playerLink.id || getBsportsfanPlayerId(playerLink.url)) || ""
            ))
          : [],
        setScores: [],
        scoreOrderTrusted: true,
        scoreOrderEvidence: "exact-player-page-match-row",
        source: "player-page-backfill"
      };
    }
    return null;
  }

  function extractExplicitFinishedMatchScoreFromDocument(doc, snapshot, matchUrl) {
    if (
      !doc
      || !doc.querySelectorAll
      || normalizeText(snapshot && snapshot.matchState || "").toLowerCase() !== "finished"
    ) {
      return "";
    }
    const normalizedMatchUrl = normalizeMatchUrlKey(matchUrl);
    const candidates = new Set();
    const selectors = [
      "[data-final-score]",
      "[data-match-score]",
      ".match-score",
      ".final-score",
      ".score-final",
      ".scoreboard [class*='score']",
      BSF_MATCH_LINK_SELECTOR
    ].join(",");
    for (const node of Array.from(doc.querySelectorAll(selectors)).slice(0, 120)) {
      const href = normalizeMatchUrlKey(
        node && node.getAttribute && node.getAttribute("href") || ""
      );
      if (href && normalizedMatchUrl && href !== normalizedMatchUrl) {
        continue;
      }
      const values = [
        node && node.getAttribute && node.getAttribute("data-final-score"),
        node && node.getAttribute && node.getAttribute("data-match-score"),
        node && node.textContent
      ];
      for (const value of values) {
        const score = parseFinishedMatchScoreText(value || "");
        if (score) {
          candidates.add(score);
        }
      }
    }
    return candidates.size === 1 ? Array.from(candidates)[0] : "";
  }

  function sleep(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  function isPredictionDatasetDecision(value) {
    const normalized = normalizeText(value || "").toLowerCase();
    return normalized === "ставим"
      || normalized === "пропуск"
      || normalized === "bet"
      || normalized === "skip"
      || normalized === "sent"
      || normalized === "forecast";
  }

  function extractScoreFromText(text) {
    const match = normalizeText(text).match(/\b([0-5])\s*-\s*([0-5])\b/);
    return match ? `${Number(match[1])}-${Number(match[2])}` : "";
  }

  function enhanceListForecastControls(snapshot) {
    if (!isBsportsfanTableTennisListPage()) {
      return;
    }

    const resultsOnlyPage = isBsportsfanTableTennisResultsPage();
    const rowCandidates = [];
    const listedUrls = new Set();
    for (const [index, row] of Array.from(document.querySelectorAll(BSF_LIST_MATCH_ROW_SELECTOR)).entries()) {
      if (!row || !row.querySelector || !row.querySelector(BSF_MATCH_LINK_SELECTOR)) {
        continue;
      }
      const matchUrl = normalizeMatchUrlKey(findMatchUrlInRow(row));
      if (!matchUrl || listedUrls.has(matchUrl)) {
        continue;
      }
      listedUrls.add(matchUrl);
      const finished = isFinishedListMatchRow(row);
      let blocked = !resultsOnlyPage && !finished && isPrematchTelegramBlockedLeagueName(
        parseListRowLeague(row, location.href, normalizeText(row.textContent || ""))
      );
      const seedSnapshot = !resultsOnlyPage && !finished && !blocked
        ? buildInlineForecastSeedSnapshotFromRow(row, matchUrl)
        : null;
      if (seedSnapshot && isPrematchTelegramBlockedLeagueName(seedSnapshot.league)) {
        blocked = true;
      }
      const entryState = seedSnapshot && !blocked
        ? buildInlineForecastEntryState(seedSnapshot, "transition-scan")
        : null;
      rowCandidates.push({
        row,
        index,
        matchUrl,
        finished,
        blocked,
        seedSnapshot,
        entryState
      });
    }
    const { transitionCandidates, prewarmCandidates } = partitionInlineForecastRowCandidates(
      rowCandidates,
      resultsOnlyPage ? 0 : INLINE_FORECAST_MAX_ROWS
    );
    const activeUrls = new Set();
    let visibleCipWaitingRows = 0;

    // State transitions are deliberately scanned for every visible match. The row cap
    // below protects only the network-heavy history prewarm; a LIVE row must never be
    // hidden behind a long list of waiting matches.
    for (const candidate of transitionCandidates) {
      const { row, matchUrl, finished, blocked, seedSnapshot, entryState } = candidate;
      activeUrls.add(matchUrl);
      maybeUpdateTelegramPredictionResultFromRow(row, matchUrl);

      if (resultsOnlyPage) {
        inlineForecastState.delete(matchUrl);
        inlineForecastSeedState.delete(matchUrl);
        continue;
      }

      if (finished) {
        expirePendingMatchStartForecast(matchUrl, "confirmed-match-finished-row");
        continue;
      }

      if (blocked) {
        inlineForecastState.delete(matchUrl);
        inlineForecastSeedState.delete(matchUrl);
        inlineAutoForecastQueue.delete(matchUrl);
        continue;
      }

      maybeRecordTelegramPredictionPointSnapshotFromRow(row, matchUrl);

      if (seedSnapshot) {
        inlineForecastSeedState.set(matchUrl, seedSnapshot);
        if (seedSnapshot.matchStateEvidence === PREMATCH_VISIBLE_CIP_EVIDENCE) {
          visibleCipWaitingRows += 1;
        }
      }
      const pendingStart = matchStartForecastStates.get(matchUrl);
      if (pendingStart && pendingStart.status === "sent" && seedSnapshot) {
        maybePatchTelegramOpeningOddsFromSeedSnapshot(matchUrl, seedSnapshot);
      }
      if (pendingStart && pendingStart.status === "pending") {
        const observation = classifyMatchStartDeliveryObservation(pendingStart.triggerState, seedSnapshot);
        if (observation.action === "expire") {
          expirePendingMatchStartForecast(matchUrl, observation.reason, pendingStart, observation.deliveryState);
          continue;
        }
      }
      maybeTriggerMatchStartForecast(matchUrl, seedSnapshot, entryState);
    }

    for (const candidate of prewarmCandidates) {
      const { matchUrl, seedSnapshot, entryState } = candidate;
      maybeQueueInlineAutoForecast(matchUrl, {
        suppressTelegram: false,
        seedSnapshot,
        entryState
      });
    }

    for (const [url, state] of inlineForecastState.entries()) {
      if (!activeUrls.has(url) && shouldEvictInactiveInlineForecastState(state)) {
        inlineForecastState.delete(url);
        inlineAutoForecastDone.delete(url);
      }
    }
    for (const url of Array.from(inlineAutoForecastQueue.keys())) {
      if (!activeUrls.has(url)) {
        inlineAutoForecastQueue.delete(url);
      }
    }
    for (const url of Array.from(inlineForecastSeedState.keys())) {
      if (!activeUrls.has(url)) {
        inlineForecastSeedState.delete(url);
      }
    }
    for (const [url, state] of matchStartForecastStates.entries()) {
      if (activeUrls.has(url) || !state) {
        continue;
      }
      // A temporarily missing/re-rendered row is not evidence that the first set
      // ended. Keep pending starts retryable; stale entries may simply be evicted.
      if (shouldEvictInactiveMatchStartForecastState(state)) {
        matchStartForecastStates.delete(url);
      }
    }
    window.__liveValueRadarBsportsfanCipMonitor = {
      ts: Date.now(),
      active: isCipTableTennisListUrl(location.href),
      visibleRows: transitionCandidates.length,
      prewarmRows: prewarmCandidates.length,
      waitingRows: visibleCipWaitingRows,
      forecastQueueSize: inlineAutoForecastQueue.size,
      forecastActiveWorkers: inlineAutoForecastActiveWorkers,
      forecastPreemptions: inlineForecastPreemptionCount,
      navigationProtection: {
        active: Date.now() < bsportsfanNavigationProtectionOpenUntil,
        openUntil: bsportsfanNavigationProtectionOpenUntil,
        reason: bsportsfanNavigationProtectionReason
      },
      forecastStates: summarizeInlineForecastStates(),
      forecastErrors: getRecentInlineForecastErrors(),
      matchStartDetails: getRecentMatchStartDetails(),
      forecastActiveJobs: Array.from(inlineAutoForecastActiveJobs.values()).map((job) => ({
        matchUrl: job && job.matchUrl || "",
        startedAt: Number(job && job.startedAt || 0),
        startAuto: Boolean(job && job.options && job.options.startAuto),
        preemptRequested: Boolean(job && job.preemptRequested)
      })),
      matchStartStates: Object.fromEntries(
        ["pending", "sending", "decided", "sent", "expired"].map((status) => [
          status,
          Array.from(matchStartForecastStates.values())
            .filter((state) => state && state.status === status).length
        ])
      )
    };
  }

  function summarizeInlineForecastStates() {
    const summary = {
      loading: 0,
      ready: 0,
      modelReady: 0,
      modelPass: 0,
      notReady: 0,
      cooling: 0,
      terminal: 0
    };
    const now = Date.now();
    for (const state of inlineForecastState.values()) {
      if (!state) {
        continue;
      }
      if (state.status === "loading") {
        summary.loading += 1;
      } else if (state.status === "ready") {
        summary.ready += 1;
        const forecastStatus = normalizeText(
          state.archive && state.archive.forecast && state.archive.forecast.status || ""
        ).toLowerCase();
        if (forecastStatus === "ready") {
          summary.modelReady += 1;
        } else if (forecastStatus === "pass") {
          summary.modelPass += 1;
        } else {
          summary.notReady += 1;
        }
      } else if (state.status === "error" && state.terminal) {
        summary.terminal += 1;
      } else if (state.status === "error" && Number(state.retryAt || 0) > now) {
        summary.cooling += 1;
      }
    }
    return summary;
  }

  function getRecentInlineForecastErrors(limit = 3) {
    return Array.from(inlineForecastState.entries())
      .filter(([, state]) => state && state.status === "error")
      .sort((left, right) => (
        Number(right[1] && right[1].updatedAt || 0)
        - Number(left[1] && left[1].updatedAt || 0)
      ))
      .slice(0, Math.max(0, Number(limit || 0)))
      .map(([matchUrl, state]) => ({
        matchUrl,
        message: normalizeText(state.message || "").slice(0, 240),
        retryAt: Number(state.retryAt || 0),
        terminal: Boolean(state.terminal)
      }));
  }

  function getRecentMatchStartDetails(limit = 5) {
    const updatedAt = (state) => Number(state && (
      state.decidedAt
      || state.expiredAt
      || state.lastCheckedAt
      || state.triggeredAt
    ) || 0);
    return Array.from(matchStartForecastStates.entries())
      .sort((left, right) => updatedAt(right[1]) - updatedAt(left[1]))
      .slice(0, Math.max(0, Number(limit || 0)))
      .map(([matchUrl, state]) => ({
        matchUrl,
        status: normalizeText(state && state.status || ""),
        retryReason: normalizeText(state && state.retryReason || ""),
        expireReason: normalizeText(state && state.expireReason || ""),
        error: normalizeText(state && state.error || "").slice(0, 240),
        responseReason: normalizeText(state && state.response && state.response.reason || ""),
        updatedAt: updatedAt(state)
      }));
  }

  function partitionInlineForecastRowCandidates(candidates, prewarmLimit = INLINE_FORECAST_MAX_ROWS) {
    const transitionCandidates = Array.isArray(candidates) ? candidates.slice() : [];
    const limit = Math.max(0, Number(prewarmLimit || 0));
    const now = Date.now();
    const prewarmCandidates = transitionCandidates
      .filter((candidate) => candidate
        && !candidate.finished
        && !candidate.blocked
        && candidate.seedSnapshot
        && shouldPrewarmInlineForecastCandidate(candidate, now)
        && needsInlineForecastCandidatePrewarmWork(candidate, now))
      .sort((left, right) => {
        const leftLeaguePriority = getInlineForecastLeaguePrewarmPriority(left);
        const rightLeaguePriority = getInlineForecastLeaguePrewarmPriority(right);
        const leftPriority = getInlineForecastRowPrewarmPriority(left);
        const rightPriority = getInlineForecastRowPrewarmPriority(right);
        const leftMatchDateTs = Number(left && left.entryState && left.entryState.matchDateTs || 0)
          || Number.POSITIVE_INFINITY;
        const rightMatchDateTs = Number(right && right.entryState && right.entryState.matchDateTs || 0)
          || Number.POSITIVE_INFINITY;
        return leftLeaguePriority - rightLeaguePriority
          || leftPriority - rightPriority
          || leftMatchDateTs - rightMatchDateTs
          || Number(left.index || 0) - Number(right.index || 0);
      })
      .slice(0, limit);
    return { transitionCandidates, prewarmCandidates };
  }

  function needsInlineForecastCandidatePrewarmWork(candidate, now = Date.now()) {
    const matchUrl = normalizeMatchUrlKey(candidate && candidate.matchUrl || "");
    if (!matchUrl || inlineAutoForecastDone.has(matchUrl)) {
      return false;
    }
    const state = inlineForecastState.get(matchUrl);
    if (state && state.status === "ready" && state.archive) {
      return false;
    }
    return !isInlineForecastErrorCoolingDown(state, now);
  }

  function getInlineForecastLeaguePrewarmPriority(candidate) {
    return isPrematchTelegramShadowOnlyLeagueName(
      candidate && candidate.seedSnapshot && candidate.seedSnapshot.league
    ) ? 1 : 0;
  }

  function shouldPrewarmInlineForecastCandidate(candidate, now = Date.now()) {
    const state = candidate && candidate.entryState || {};
    if (isMatchStartForecastState(state)) {
      return true;
    }
    const matchDateTs = Number(state.matchDateTs || 0);
    if (isVisibleCipPrematchEntryState(state)) {
      return !(matchDateTs > 0)
        || matchDateTs <= Number(now) + INLINE_FORECAST_PREWARM_LOOKAHEAD_MS;
    }
    return state.mode === "prematch"
      && matchDateTs > 0
      && matchDateTs <= Number(now) + INLINE_FORECAST_PREWARM_LOOKAHEAD_MS;
  }

  function getInlineForecastRowPrewarmPriority(candidate) {
    const state = candidate && candidate.entryState;
    if (isMatchStartForecastState(state)) {
      return 0;
    }
    if (state && state.started && !state.finished) {
      return 1;
    }
    if (state && state.mode === "prematch") {
      return 2;
    }
    return 3;
  }

  function shouldEvictInactiveMatchStartForecastState(state, now = Date.now()) {
    const lastStateAt = Number(state && (state.decidedAt || state.expiredAt || state.triggeredAt) || 0);
    return lastStateAt > 0 && Number(now) - lastStateAt > 2 * 60 * 60 * 1000;
  }

  function shouldEvictInactiveInlineForecastState(state, now = Date.now()) {
    if (!state || typeof state !== "object") {
      return true;
    }
    if (state.status === "loading" && !isInlineForecastLoadingStale(state)) {
      return false;
    }
    const updatedAt = Number(state.updatedAt || 0);
    return !(updatedAt > 0) || Number(now) - updatedAt > 2 * 60 * 60 * 1000;
  }

  function isInlineForecastErrorCoolingDown(state, now = Date.now()) {
    if (!state || state.status !== "error") {
      return false;
    }
    if (state.terminal === true) {
      return true;
    }
    const updatedAt = Number(state && state.updatedAt || 0);
    const retryAt = Number(state && state.retryAt || 0);
    return retryAt > 0
      ? retryAt > Number(now)
      : updatedAt > 0 && Number(now) - updatedAt < INLINE_FORECAST_ERROR_RETRY_MS;
  }

  function updateMatchPageForecastState(snapshot) {
    if (!snapshot || !isBsportsfanMatchUrl(snapshot.url || location.href)) {
      return;
    }

    const matchUrl = normalizeMatchUrlKey(snapshot.url || location.href);
    if (!matchUrl) {
      return;
    }
    if (maybeUpdateTelegramPredictionResultFromMatchPage(snapshot, matchUrl)) {
      return;
    }
    if (isPrematchTelegramBlockedLeagueName(snapshot.league)) {
      inlineForecastState.delete(matchUrl);
      inlineForecastSeedState.delete(matchUrl);
      inlineAutoForecastQueue.delete(matchUrl);
      return;
    }

    const startRoute = buildMatchPageStartForecastRoute(snapshot);
    const entryState = startRoute.entryState;
    const matchStart = startRoute.matchStart;
    inlineForecastSeedState.set(matchUrl, snapshot);
    const pendingStart = matchStartForecastStates.get(matchUrl);
    if (pendingStart && pendingStart.status === "pending") {
      const observation = classifyMatchStartDeliveryObservation(pendingStart.triggerState, snapshot);
      if (observation.action === "expire") {
        expirePendingMatchStartForecast(
          matchUrl,
          observation.reason,
          pendingStart,
          observation.deliveryState
        );
      }
    }
    if (matchStart) {
      maybeQueueInlineAutoForecast(matchUrl, {
        suppressTelegram: false,
        seedSnapshot: snapshot,
        entryState,
        startAuto: true
      });
      maybeTriggerMatchStartForecast(matchUrl, snapshot, entryState);
    }
  }

  function maybeUpdateTelegramPredictionResultFromMatchPage(snapshot, matchUrl) {
    const setScores = uniqueSetScores(snapshot && snapshot.setScores)
      .filter((score) => isCompletedTableTennisSet(score && score.left, score && score.right));
    const finalScore = inferFinishedMatchScoreFromSetScores(setScores)
      || extractExplicitFinishedMatchScoreFromDocument(
        document,
        snapshot,
        matchUrl
      );
    if (!finalScore) {
      scheduleUnresolvedResultRecoveryAdvance(matchUrl);
      return false;
    }

    const parsedPlayers = Array.isArray(snapshot && snapshot.players)
      ? snapshot.players.slice(0, 2).map(cleanName).filter(Boolean)
      : [];
    const players = parsedPlayers.length === 2 ? parsedPlayers : [];
    const playerLinks = alignPlayerLinksToPlayers(
      players,
      Array.isArray(snapshot && snapshot.playerLinks) ? snapshot.playerLinks : []
    );
    const key = `${normalizeMatchUrlKey(matchUrl)}|${finalScore}|visible-match-page`;
    if (telegramResultUpdateState.has(key)) {
      return true;
    }
    addBoundedSetValue(telegramResultUpdateState, key, RUNTIME_STATE_MAX_ENTRIES);
    sendRuntimeMessage({
      type: "lvr:updateTelegramPredictionResult",
      result: {
        matchUrl: normalizeMatchUrlKey(matchUrl),
        finalScore,
        players,
        playerIds: playerLinks.length === 2
          ? playerLinks.map((link) => String(
              link && (link.id || getBsportsfanPlayerId(link.url)) || ""
            ))
          : [],
        setScores,
        scoreOrderTrusted: players.length === 2,
        scoreOrderEvidence: "direct-match-page",
        source: "visible-match-result-recovery"
      }
    }).then((response) => {
      recordTelegramSendDebug("visible-match-result", matchUrl, response);
      if (response && response.datasetRecorded === true && response.datasetResolved === true) {
        return sendRuntimeMessage({
          type: "lvr:advanceBsportsfanResultRecovery",
          matchUrl: normalizeMatchUrlKey(matchUrl)
        }).catch(() => null);
      }
      telegramResultUpdateState.delete(key);
      scheduleUnresolvedResultRecoveryAdvance(matchUrl);
      return null;
    }).catch((error) => {
      telegramResultUpdateState.delete(key);
      recordTelegramSendDebug("visible-match-result", matchUrl, null, error);
      scheduleUnresolvedResultRecoveryAdvance(matchUrl);
    });
    return true;
  }

  function scheduleUnresolvedResultRecoveryAdvance(matchUrl) {
    const url = normalizeMatchUrlKey(matchUrl);
    const key = `result-recovery-fallback:${url}`;
    if (!url || telegramResultUpdateState.has(key)) {
      return;
    }
    addBoundedSetValue(telegramResultUpdateState, key, RUNTIME_STATE_MAX_ENTRIES);
    window.setTimeout(() => {
      sendRuntimeMessage({
        type: "lvr:advanceBsportsfanResultRecovery",
        matchUrl: url
      }).catch(() => null);
    }, 12 * 1000);
  }

  function buildMatchPageStartForecastRoute(snapshot) {
    const entryState = buildInlineForecastEntryState(snapshot, "match-start");
    return {
      entryState,
      matchStart: isMatchStartForecastState(entryState)
    };
  }

  function uniqueSetScores(setScores) {
    const seen = new Set();
    const result = [];
    for (const score of Array.isArray(setScores) ? setScores : []) {
      const setNumber = Number(score && score.set || result.length + 1);
      const left = Number(score && score.left);
      const right = Number(score && score.right);
      if (!Number.isFinite(left) || !Number.isFinite(right)) {
        continue;
      }
      const key = `${setNumber}:${left}-${right}`;
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      result.push({ set: setNumber, left, right });
    }
    return result.sort((left, right) => Number(left.set || 0) - Number(right.set || 0));
  }

  function getSnapshotCompletedSetScores(snapshot) {
    const explicitSetScores = Array.isArray(snapshot && snapshot.setScores) ? snapshot.setScores : [];
    const fallbackSetScores = explicitSetScores.length
      ? []
      : inferSetScoresFromPointSets(snapshot && snapshot.pointSets);
    return uniqueSetScores([...explicitSetScores, ...fallbackSetScores]
      .filter((score) => isCompletedTableTennisSet(score && score.left, score && score.right)));
  }

  function getSnapshotLiveCurrentPointScore(snapshot, completedSetScores = []) {
    const targetSetNumber = (Array.isArray(completedSetScores) ? completedSetScores.length : 0) + 1;
    const explicitPointScore = normalizeLiveCurrentPointScore(
      snapshot && snapshot.currentPointScore,
      targetSetNumber,
      snapshot && snapshot.currentPointScore && snapshot.currentPointScore.source || "snapshot"
    );
    if (explicitPointScore) {
      return explicitPointScore;
    }
    const fromSetScores = getLiveCurrentPointScoreFromSetScores(snapshot && snapshot.setScores, targetSetNumber);
    if (fromSetScores) {
      return fromSetScores;
    }

    const pointSets = Array.isArray(snapshot && snapshot.pointSets) ? snapshot.pointSets : [];
    const pointSet = pointSets.find((set, index) => Number(set && set.set || index + 1) === targetSetNumber)
      || pointSets[targetSetNumber - 1]
      || null;
    const pointScore = getPointSetFinalScore(pointSet);
    return normalizeLiveCurrentPointScore(pointScore, targetSetNumber, "point-graph");
  }

  function getLiveCurrentPointScoreFromSetScores(setScores, targetSetNumber) {
    const target = Number(targetSetNumber);
    const list = uniqueSetScores(setScores);
    const found = list.find((score, index) => Number(score && score.set || index + 1) === target)
      || list[target - 1]
      || null;
    return normalizeLiveCurrentPointScore(found, target, "score-table");
  }

  function maybeUpdateTelegramPredictionResultFromRow(row, matchUrl) {
    const finalScore = extractFinishedMatchScoreFromListRow(row, matchUrl);
    if (!matchUrl || !finalScore) {
      return;
    }
    const url = normalizeMatchUrlKey(matchUrl);
    const resultPlayers = parseListRowPlayers(row).slice(0, 2);
    const resultPlayerLinks = alignPlayerLinksToPlayers(
      resultPlayers,
      parseMatchRowPlayerLinks(row, location.href)
    );
    const completedSetScores = parseListRowLiveCompletedSetScores(row);
    const setScores = completedSetScores.map((score, index) => ({
      set: Number(score && score.set || index + 1),
      left: Number(score && score.left),
      right: Number(score && score.right)
    })).filter((score) => Number.isFinite(score.left) && Number.isFinite(score.right));
    const setScoresKey = setScores.map((score) => `${score.set}:${score.left}-${score.right}`).join(",");
    const key = `${url}|${finalScore}|${setScoresKey}`;
    if (telegramResultUpdateState.has(key)) {
      return;
    }
    addBoundedSetValue(telegramResultUpdateState, key, RUNTIME_STATE_MAX_ENTRIES);
    sendRuntimeMessage({
      type: "lvr:updateTelegramPredictionResult",
      result: {
        matchUrl: url,
        finalScore,
        players: resultPlayers,
        playerIds: resultPlayerLinks.map((link) => String(
          link && (link.id || getBsportsfanPlayerId(link.url)) || ""
        )),
        setScores
      }
    }).then((response) => {
      if (
        response
        && response.datasetRecorded === true
        && response.edited !== true
        && normalizeText(response.reason || "").toLowerCase() === "edit-failed"
      ) {
        window.setTimeout(() => {
          telegramResultUpdateState.delete(key);
        }, TELEGRAM_RESULT_AUTO_BACKFILL_ERROR_RETRY_MS);
      }
      recordTelegramSendDebug("prematch-result", url, response);
    }).catch((error) => {
      if (isTransientTelegramResultUpdateError(error)) {
        telegramResultUpdateState.delete(key);
      }
      recordTelegramSendDebug("prematch-result", url, null, error);
    });
  }

  function isTransientTelegramResultUpdateError(error) {
    const code = normalizeText(error && error.code || "").toLowerCase();
    const message = normalizeText(stringifyError(error)).toLowerCase();
    if (!error || !error.response) {
      return true;
    }
    return [
      "timeout",
      "network-error",
      "temporarily-unavailable",
      "rate-limited"
    ].includes(code)
      || /timeout|timed out|network|failed to fetch|temporar|rate.?limit|too many requests|http 429|http 5\d\d|message port|receiving end|context invalidated|disconnect/i.test(message);
  }

  function maybeRecordTelegramPredictionPointSnapshotFromRow(row, matchUrl) {
    const snapshot = buildTelegramPredictionPointSnapshotFromRow(row, matchUrl);
    if (!snapshot) {
      return;
    }
    const key = snapshot.key;
    if (!key || predictionPointSnapshotDone.has(key)) {
      return;
    }
    setBoundedMapValue(predictionPointSnapshotDone, key, Date.now(), RUNTIME_STATE_MAX_ENTRIES);
    prunePredictionPointSnapshotDone();
    sendRuntimeMessage({
      type: "lvr:recordTelegramPredictionPointSnapshot",
      snapshot
    }).then((response) => {
      if (!response || !response.recorded) {
        predictionPointSnapshotDone.delete(key);
      }
      recordTelegramSendDebug("prediction-point-snapshot", key, response);
    }).catch((error) => {
      predictionPointSnapshotDone.delete(key);
      recordTelegramSendDebug("prediction-point-snapshot", key, null, error);
    });
  }

  function isLateTelegramPredictionPointSnapshot(currentPointScore) {
    if (!currentPointScore) {
      return false;
    }
    const left = Number(currentPointScore.left);
    const right = Number(currentPointScore.right);
    if (!Number.isFinite(left) || !Number.isFinite(right)) {
      return false;
    }
    return Math.max(left, right) >= TELEGRAM_POINT_SNAPSHOT_MIN_SIDE_POINTS
      || left + right >= TELEGRAM_POINT_SNAPSHOT_MIN_TOTAL_POINTS;
  }

  function buildTelegramPredictionPointSnapshotFromRow(row, matchUrl) {
    const url = normalizeUrl(matchUrl || findMatchUrlInRow(row));
    if (!row || !url || isNotStartedListMatchRow(row) || isFinishedListMatchRow(row)) {
      return null;
    }
    const completedScores = parseListRowLiveCompletedSetScores(row);
    const currentPointScore = parseListRowLiveCurrentPointScore(row, url);
    if (!completedScores.length && !currentPointScore) {
      return null;
    }
    const wins = [0, 0];
    for (const score of completedScores) {
      if (Number(score.left) > Number(score.right)) {
        wins[0] += 1;
      } else if (Number(score.right) > Number(score.left)) {
        wins[1] += 1;
      }
    }
    const targetSetNumber = completedScores.length + 1;
    if (targetSetNumber !== 2 && !isLateTelegramPredictionPointSnapshot(currentPointScore)) {
      return null;
    }
    const currentSetScore = currentPointScore ? `${currentPointScore.left}-${currentPointScore.right}` : "";
    const completedSetScores = completedScores.map((score) => `${score.left}-${score.right}`);
    const key = [
      url,
      targetSetNumber,
      `${wins[0]}:${wins[1]}`,
      completedSetScores.join(" "),
      currentSetScore
    ].join("|");
    return {
      key,
      matchUrl: url,
      source: "list-row",
      rawRowText: normalizeText(row && row.textContent || "").slice(0, 1000),
      players: parseListRowPlayers(row).slice(0, 2),
      leagueName: getPrematchTelegramLeagueName(
        parseListRowLeague(row, location.href, normalizeText(row && row.textContent || ""))
      ),
      setState: `${wins[0]}:${wins[1]}`,
      targetSetNumber,
      completedSetScores,
      setScores: completedScores.map((score, index) => ({
        set: Number(score && score.set || index + 1),
        left: Number(score.left),
        right: Number(score.right)
      })).filter((score) => Number.isFinite(score.left) && Number.isFinite(score.right)),
      currentSetScore,
      currentPointScore: currentSetScore,
      currentPointScoreSource: currentPointScore && currentPointScore.source || "",
      currentPointLeftPoints: currentPointScore ? currentPointScore.left : "",
      currentPointRightPoints: currentPointScore ? currentPointScore.right : ""
    };
  }

  function prunePredictionPointSnapshotDone() {
    if (predictionPointSnapshotDone.size <= 2500) {
      return;
    }
    const cutoff = Date.now() - 6 * 60 * 60 * 1000;
    for (const [key, ts] of predictionPointSnapshotDone.entries()) {
      if (Number(ts || 0) < cutoff || predictionPointSnapshotDone.size > 1800) {
        predictionPointSnapshotDone.delete(key);
      }
    }
  }

  function extractFinishedMatchScoreFromListRow(row, matchUrl = "") {
    const inferredScore = inferFinishedMatchScoreFromSetScores(
      parseListRowLiveCompletedSetScores(row)
    );
    if (inferredScore) {
      return inferredScore;
    }
    const anchorScore = extractFinishedMatchScoreFromAnchor(row, matchUrl);
    if (
      anchorScore
      && (
        hasExplicitFinishedListRowMarker(row)
        || isBsportsfanTableTennisResultsPage()
      )
    ) {
      return anchorScore;
    }
    return "";
  }

  function extractFinishedMatchScoreFromAnchor(row, matchUrl = "") {
    const normalizedMatchUrl = normalizeMatchUrlKey(matchUrl || findMatchUrlInRow(row));
    const anchors = getListRowMatchAnchors(row);
    for (const anchor of anchors) {
      const href = normalizeMatchUrlKey(anchor && (anchor.getAttribute && anchor.getAttribute("href") || anchor.href) || "");
      if (normalizedMatchUrl && href && href !== normalizedMatchUrl) {
        continue;
      }
      const score = parseFinishedMatchScoreText(anchor && anchor.textContent || "");
      if (score) {
        return score;
      }
    }

    return "";
  }

  function normalizeMatchRowAnchorScore(element) {
    const scoreAnchor = element && element.querySelector && Array.from(
      element.querySelectorAll(BSF_MATCH_LINK_SELECTOR)
    ).find((anchor) => parseFinishedMatchScoreText(anchor && anchor.textContent || ""))
      || element && element.querySelector && element.querySelector(BSF_MATCH_LINK_SELECTOR);
    return scoreAnchor ? normalizeText(scoreAnchor.textContent || "") : "";
  }

  function parseFinishedMatchScoreText(value) {
    const score = normalizeText(value).match(/^([0-5])\s*[-:]\s*([0-5])$/);
    if (!score) {
      return "";
    }
    const left = Number(score[1]);
    const right = Number(score[2]);
    if (!isLikelyFinishedMatchSetScore(left, right)) {
      return "";
    }
    return `${left}-${right}`;
  }

  function inferFinishedMatchScoreFromSetScores(setScores) {
    const list = (Array.isArray(setScores) ? setScores : [])
      .filter((score) => isCompletedTableTennisSet(score && score.left, score && score.right));
    if (!list.length) {
      return "";
    }
    const left = list.filter((score) => Number(score.left) > Number(score.right)).length;
    const right = list.filter((score) => Number(score.right) > Number(score.left)).length;
    return isLikelyFinishedMatchSetScore(left, right) ? `${left}-${right}` : "";
  }

  function isLikelyFinishedMatchSetScore(left, right) {
    if (!Number.isFinite(left) || !Number.isFinite(right) || left === right) {
      return false;
    }
    return Math.max(left, right) === 3 && Math.min(left, right) >= 0 && Math.min(left, right) <= 2;
  }

  function findMatchUrlInRow(row) {
    const anchor = getListRowMatchAnchors(row)[0] || null;
    return anchor ? normalizeMatchUrlKey(anchor.getAttribute("href") || anchor.href || "") : "";
  }

  function getListRowMatchAnchors(row) {
    if (row && row.querySelectorAll) {
      return Array.from(row.querySelectorAll(BSF_MATCH_LINK_SELECTOR));
    }
    const anchor = row && row.querySelector && row.querySelector(BSF_MATCH_LINK_SELECTOR);
    return anchor ? [anchor] : [];
  }

  function normalizeMatchUrlKey(value) {
    const normalized = normalizeUrl(value);
    const url = parseUrl(normalized);
    if (!url) {
      return "";
    }
    url.hash = "";
    url.search = "";
    url.pathname = url.pathname
      .replace(/^\/rs?\//i, "/table-tennis/r/")
      .replace(/\/table-tennis\/rs\//i, "/table-tennis/r/")
      .replace(/\/+$/, "");
    return url.href.replace(/\/+$/, "");
  }

  function getBsportsfanMatchId(value) {
    const url = parseUrl(value);
    const match = url && url.pathname.match(/\/(?:table-tennis\/)?rs?\/(\d+)/i);
    return match ? match[1] : "";
  }

  function isSameBsportsfanMatch(left, right) {
    const leftId = getBsportsfanMatchId(left);
    const rightId = getBsportsfanMatchId(right);
    return leftId && rightId
      ? leftId === rightId
      : normalizeMatchUrlKey(left) === normalizeMatchUrlKey(right);
  }

  function buildInlineForecastSeedSnapshotFromRow(row, matchUrl, baseUrl = location.href, reason = "inline-list-row") {
    if (!row || !row.querySelectorAll) {
      return null;
    }

    const url = normalizeUrl(matchUrl || findMatchUrlInRow(row), baseUrl);
    const playerLinks = parseMatchRowPlayerLinks(row, baseUrl)
      .slice(0, 2)
      .map((link) => ({
        name: cleanName(link && link.name || ""),
        url: normalizeUrl(link && link.url || "", baseUrl),
        id: link && link.id ? String(link.id) : getBsportsfanPlayerId(link && link.url || "")
      }))
      .filter((link) => isLikelyName(link.name) && isBsportsfanPlayerUrl(link.url));
    const linkNames = playerLinks.map((link) => link.name).filter(isLikelyName);
    const rowNames = parseListRowPlayers(row).map(cleanName).filter(isLikelyName);
    const players = (rowNames.length >= 2 ? rowNames : linkNames).slice(0, 2);
    const alignedPlayerLinks = alignPlayerLinksToPlayers(players, playerLinks);
    if (!url || players.length < 2 || alignedPlayerLinks.length < 2) {
      return null;
    }

    const matchDate = extractMatchRowDate(row);
    const matchDateTs = parseMatchDateTs(matchDate);
    const oddsMarket = parseListRowOddsMarket(row, url, { matchDateTs });
    const setScores = parseListRowSetScores(row);
    const completedSetScores = parseListRowLiveCompletedSetScores(row);
    const currentPointScore = parseListRowLiveCurrentPointScore(row, url);
    const hasLiveScore = completedSetScores.length > 0
      || Boolean(currentPointScore && (Number(currentPointScore.left) > 0 || Number(currentPointScore.right) > 0));
    const hasFinishedMarker = isFinishedListMatchRow(row);
    const hasLiveMarker = isLiveListMatchRow(row);
    const hasPrematchMarker = isNotStartedListMatchRow(row);
    const visibleCipWaiting = isVisibleCipWaitingScore(
      baseUrl,
      completedSetScores,
      currentPointScore,
      hasFinishedMarker,
      hasLiveMarker
    );
    const matchState = hasFinishedMarker
      ? "finished"
      : hasLiveMarker || hasLiveScore
        ? "live"
        : visibleCipWaiting || hasPrematchMarker || Number(matchDateTs || 0) > Date.now()
          ? "prematch"
          : "unknown";
    const matchStateEvidence = hasFinishedMarker
      ? "finished-marker"
      : hasLiveScore
        ? "score"
        : hasLiveMarker
          ? "live-marker"
          : visibleCipWaiting
            ? PREMATCH_VISIBLE_CIP_EVIDENCE
            : hasPrematchMarker
              ? "prematch-marker"
              : matchState === "prematch"
                ? "scheduled-time"
                : "none";
    return {
      source: "bsportsfan",
      reason,
      ts: Date.now(),
      url,
      title: `${players[0]} vs ${players[1]}`,
      matchDate,
      matchDateTs: Number.isFinite(matchDateTs) && matchDateTs > 0 ? matchDateTs : 0,
      pageType: "match",
      players,
      playerLinks: alignedPlayerLinks,
      matchState,
      matchStateSource: visibleCipWaiting ? "cip-list-row" : "list-row",
      matchStateEvidence,
      setScores,
      currentPointScore,
      pointSets: [],
      serveReturn: null,
      oddsMarket,
      matches: [],
      league: parseListRowLeague(row, baseUrl, normalizeText(row.textContent || "")),
      textSample: normalizeText(row.textContent || "")
    };
  }

  function isVisibleCipWaitingScore(
    baseUrl,
    completedSetScores,
    currentPointScore,
    hasFinishedMarker,
    hasLiveMarker
  ) {
    return isCipTableTennisListUrl(baseUrl)
      && !hasFinishedMarker
      && !hasLiveMarker
      && (!Array.isArray(completedSetScores) || completedSetScores.length === 0)
      && Boolean(currentPointScore)
      && Number(currentPointScore && currentPointScore.left) === 0
      && Number(currentPointScore && currentPointScore.right) === 0;
  }

  function buildInlineForecastEntryState(snapshot, phase = "") {
    const source = snapshot && typeof snapshot === "object" ? snapshot : {};
    const capturedAt = Number(source.ts || 0) || Date.now();
    const completedSetScores = getSnapshotCompletedSetScores(source);
    const setWins = [0, 0];
    for (const score of completedSetScores) {
      if (Number(score.left) > Number(score.right)) {
        setWins[0] += 1;
      } else if (Number(score.right) > Number(score.left)) {
        setWins[1] += 1;
      }
    }
    const targetSetNumber = completedSetScores.length + 1;
    const currentPointScore = getSnapshotLiveCurrentPointScore(source, completedSetScores);
    const currentPointTotal = currentPointScore
      ? Number(currentPointScore.left) + Number(currentPointScore.right)
      : null;
    const explicitMode = normalizeText(source.matchState || "").toLowerCase();
    const scoreStarted = completedSetScores.length > 0
      || Boolean(currentPointScore && currentPointTotal > 0);
    const finished = explicitMode === "finished" || Math.max(...setWins) >= 3;
    const mode = finished
      ? "finished"
      : explicitMode === "live" || scoreStarted
        ? "live"
        : explicitMode === "prematch" || Number(source.matchDateTs || 0) > capturedAt
          ? "prematch"
          : "unknown";
    const players = Array.isArray(source.players)
      ? source.players.slice(0, 2).map((player) => cleanName(player && player.name || player || "")).filter(Boolean)
      : [];
    return {
      phase: normalizeText(phase || ""),
      capturedAt,
      source: normalizeText(source.reason || source.source || "snapshot"),
      sourceUrl: normalizeUrl(source.url || ""),
      sourceState: explicitMode,
      sourceStateEvidence: normalizeText(source.matchStateEvidence || source.matchStateSource || ""),
      mode,
      started: mode === "live" || mode === "finished",
      finished: mode === "finished",
      players,
      completedSetScores: completedSetScores.map((score, index) => ({
        set: Number(score && score.set || index + 1),
        left: Number(score.left),
        right: Number(score.right)
      })),
      completedSets: completedSetScores.length,
      setWins,
      setState: `${setWins[0]}:${setWins[1]}`,
      targetSetNumber,
      currentPointKnown: Boolean(currentPointScore),
      currentPointLeftPoints: currentPointScore ? Number(currentPointScore.left) : null,
      currentPointRightPoints: currentPointScore ? Number(currentPointScore.right) : null,
      currentPointTotal,
      currentSetScore: currentPointScore ? `${currentPointScore.left}-${currentPointScore.right}` : "",
      currentPointSource: normalizeText(currentPointScore && currentPointScore.source || ""),
      eitherPlayerHasTwoSets: setWins.some((wins) => wins >= 2),
      matchDateTs: Number(source.matchDateTs || 0) || null
    };
  }

  function isMatchStartForecastState(state) {
    if (!state || typeof state !== "object") {
      return false;
    }
    const evidence = normalizeText(state.sourceStateEvidence || "").toLowerCase();
    return normalizeText(state.mode || "").toLowerCase() === "live"
      && state.started === true
      && state.finished !== true
      && Number(state.completedSets || 0) === 0
      && Number(state.targetSetNumber || 0) === 1
      && ["live-marker", "score"].includes(evidence);
  }

  function cloneMatchStartEntryState(state, phase = "match-start") {
    return state && typeof state === "object"
      ? {
          ...state,
          phase,
          players: Array.isArray(state.players) ? state.players.slice(0, 2) : [],
          completedSetScores: Array.isArray(state.completedSetScores)
            ? state.completedSetScores.map((score) => ({ ...score }))
            : [],
          setWins: Array.isArray(state.setWins) ? state.setWins.slice(0, 2).map(Number) : []
        }
      : null;
  }

  function maybeTriggerMatchStartForecast(matchUrl, seedSnapshot, entryState = null) {
    const url = normalizeMatchUrlKey(matchUrl);
    const observedState = entryState || buildInlineForecastEntryState(seedSnapshot, "match-start");
    if (!url || !isMatchStartForecastState(observedState)) {
      return false;
    }
    let existing = matchStartForecastStates.get(url);
    if (
      existing
      && existing.status === "sending"
      && Date.now() - Number(existing.sendingAt || 0) > RUNTIME_DELIVERY_TIMEOUT_MS + 3000
    ) {
      const recoverySnapshot = buildFreshMatchStartDeliverySnapshot(url);
      const recoveryObservation = classifyMatchStartDeliveryObservation(
        existing.triggerState,
        recoverySnapshot
      );
      if (recoveryObservation.action === "expire") {
        expirePendingMatchStartForecast(
          url,
          recoveryObservation.reason,
          existing,
          recoveryObservation.deliveryState
        );
        return true;
      }
      existing.status = "pending";
      existing.retryReason = "stale-sending-watchdog";
      existing.lastCheckedAt = Date.now();
      setBoundedMapValue(matchStartForecastStates, url, existing, RUNTIME_STATE_MAX_ENTRIES);
    }
    if (existing && ["sending", "decided", "sent", "expired"].includes(existing.status)) {
      return true;
    }
    const state = existing || {
      status: "pending",
      triggerState: cloneMatchStartEntryState(observedState),
      triggeredAt: Date.now()
    };
    setBoundedMapValue(matchStartForecastStates, url, state, RUNTIME_STATE_MAX_ENTRIES);
    let ready = inlineForecastState.get(url);
    if (ready && ready.status === "ready" && !isFreshMatchStartArchiveState(ready)) {
      inlineForecastState.delete(url);
      inlineAutoForecastDone.delete(url);
      ready = null;
    }
    if (!ready || ready.status !== "ready" || !ready.archive) {
      maybeQueueInlineAutoForecast(url, {
        suppressTelegram: false,
        seedSnapshot,
        entryState: observedState,
        startAuto: true
      });
      return true;
    }
    dispatchMatchStartForecast(url, ready.archive, state);
    return true;
  }

  function isFreshMatchStartArchiveState(state, now = Date.now()) {
    const updatedAt = Number(state && state.updatedAt || 0);
    return Boolean(
      state
      && state.status === "ready"
      && state.archive
      && updatedAt > 0
      && Number(now) - updatedAt <= MATCH_START_ARCHIVE_MAX_AGE_MS
    );
  }

  function dispatchMatchStartForecast(matchUrl, archive, state) {
    if (!state || state.status !== "pending" || !archive) {
      return;
    }
    const latestSnapshot = buildFreshMatchStartDeliverySnapshot(matchUrl);
    const observation = classifyMatchStartDeliveryObservation(state.triggerState, latestSnapshot);
    const deliveryState = observation.deliveryState;
    if (observation.action === "retry") {
      state.status = "pending";
      state.retryReason = observation.reason;
      state.lastCheckedAt = Date.now();
      state.lastObservedState = cloneMatchStartEntryState(deliveryState, "match-start-delivery-retry");
      setBoundedMapValue(matchStartForecastStates, matchUrl, state, RUNTIME_STATE_MAX_ENTRIES);
      return;
    }
    if (observation.action === "expire") {
      expirePendingMatchStartForecast(matchUrl, observation.reason, state, deliveryState);
      return;
    }
    const startArchive = {
      ...archive,
      collectionRequestEntryState: archive.requestEntryState || null,
      startEntryState: cloneMatchStartEntryState(state.triggerState),
      deliveryEntryState: cloneMatchStartEntryState(deliveryState, "match-start-delivery"),
      deliveryObservedAt: Number(deliveryState.capturedAt || 0) || Date.now(),
      deliveryMode: "match-start",
      readyAt: Number(archive.readyAt || 0) || Date.now()
    };
    const sendAttemptId = ++matchStartSendAttemptId;
    state.status = "sending";
    state.sendAttemptId = sendAttemptId;
    state.sendingAt = Date.now();
    state.deliveryState = startArchive.deliveryEntryState;
    setBoundedMapValue(matchStartForecastStates, matchUrl, state, RUNTIME_STATE_MAX_ENTRIES);
    raceWithRuntimeDeadline(
      maybeSendInlineTelegramPrediction(matchUrl, startArchive),
      RUNTIME_DELIVERY_TIMEOUT_MS,
      "match-start delivery"
    )
      .then((response) => {
        if (!isCurrentMatchStartSendAttempt(matchUrl, state, sendAttemptId)) {
          return;
        }
        state.status = classifyMatchStartSendResponse(response, deliveryState);
        state.response = response || null;
        if (state.status === "pending") {
          state.retryReason = normalizeText(response && response.reason || "match-start-delivery-expired");
          state.lastCheckedAt = Date.now();
        } else {
          state.decidedAt = Date.now();
        }
        setBoundedMapValue(matchStartForecastStates, matchUrl, state, RUNTIME_STATE_MAX_ENTRIES);
      })
      .catch((error) => {
        if (!isCurrentMatchStartSendAttempt(matchUrl, state, sendAttemptId)) {
          return;
        }
        const latestSnapshot = buildFreshMatchStartDeliverySnapshot(matchUrl);
        const latestObservation = classifyMatchStartDeliveryObservation(
          state.triggerState,
          latestSnapshot
        );
        if (latestObservation.action === "expire") {
          expirePendingMatchStartForecast(
            matchUrl,
            latestObservation.reason,
            state,
            latestObservation.deliveryState
          );
          return;
        }
        state.status = "pending";
        state.error = stringifyError(error);
        state.retryReason = "match-start-delivery-timeout";
        state.lastCheckedAt = Date.now();
        setBoundedMapValue(matchStartForecastStates, matchUrl, state, RUNTIME_STATE_MAX_ENTRIES);
      });
  }

  function isCurrentMatchStartSendAttempt(matchUrl, state, sendAttemptId) {
    const current = matchStartForecastStates.get(normalizeMatchUrlKey(matchUrl));
    return current === state
      && current.status === "sending"
      && Number(current.sendAttemptId || 0) === Number(sendAttemptId);
  }

  function classifyMatchStartSendResponse(response, deliveryState) {
    if (response && response.sent) {
      return "sent";
    }
    const reason = normalizeText(response && response.reason || "");
    if (
      reason === "match-start-delivery-expired"
      && isMatchStartForecastState(deliveryState)
    ) {
      return "pending";
    }
    return isMatchStartForecastState(deliveryState) ? "decided" : "expired";
  }

  function classifyMatchStartDeliveryObservation(triggerState, latestSnapshot) {
    if (!latestSnapshot || typeof latestSnapshot !== "object") {
      return {
        action: "retry",
        reason: "fresh-start-snapshot-missing",
        deliveryState: null
      };
    }
    const deliveryState = buildInlineForecastEntryState(latestSnapshot, "match-start-delivery");
    if (
      deliveryState.finished === true
      || Number(deliveryState.completedSets || 0) > 0
      || Number(deliveryState.targetSetNumber || 0) > 1
    ) {
      return {
        action: "expire",
        reason: deliveryState.finished
          ? "confirmed-match-finished"
          : "confirmed-first-set-completed",
        deliveryState
      };
    }
    if (hasConfirmedMatchStartPlayerConflict(triggerState, deliveryState)) {
      return {
        action: "expire",
        reason: "confirmed-player-conflict",
        deliveryState
      };
    }
    if (!isMatchStartForecastState(deliveryState)) {
      return {
        action: "retry",
        reason: `fresh-start-state-${normalizeText(deliveryState.mode || "unknown").toLowerCase() || "unknown"}`,
        deliveryState
      };
    }
    if (!areSameMatchStartPlayers(triggerState, deliveryState)) {
      return {
        action: "retry",
        reason: "fresh-start-players-incomplete",
        deliveryState
      };
    }
    return {
      action: "dispatch",
      reason: "confirmed-first-set-start",
      deliveryState
    };
  }

  function hasConfirmedMatchStartPlayerConflict(leftState, rightState) {
    const left = Array.isArray(leftState && leftState.players) ? leftState.players.slice(0, 2) : [];
    const right = Array.isArray(rightState && rightState.players) ? rightState.players.slice(0, 2) : [];
    return left.length === 2
      && right.length === 2
      && !areSameMatchStartPlayers(leftState, rightState);
  }

  function expirePendingMatchStartForecast(matchUrl, reason, stateOverride = null, deliveryState = null) {
    const url = normalizeMatchUrlKey(matchUrl);
    const state = stateOverride || matchStartForecastStates.get(url);
    if (!url || !state || !["pending", "sending"].includes(state.status)) {
      return false;
    }
    state.status = "expired";
    state.expiredAt = Date.now();
    state.expireReason = normalizeText(reason || "confirmed-start-window-closed");
    state.deliveryState = cloneMatchStartEntryState(deliveryState, "match-start-expired");
    setBoundedMapValue(matchStartForecastStates, url, state, RUNTIME_STATE_MAX_ENTRIES);
    const storedArchive = inlineForecastState.get(url);
    const archive = storedArchive && storedArchive.archive
      ? storedArchive.archive
      : buildInlineForecastFailureArchive(
          url,
          inlineForecastSeedState.get(url),
          new Error(state.expireReason),
          Number(state.triggeredAt || 0) || Date.now()
        );
    archive.startEntryState = cloneMatchStartEntryState(state.triggerState);
    archive.deliveryEntryState = cloneMatchStartEntryState(
      deliveryState,
      "match-start-expired"
    );
    recordSuppressedInlineTelegramPrediction(url, archive, state.expireReason);
    return true;
  }

  function areSameMatchStartPlayers(leftState, rightState) {
    const left = Array.isArray(leftState && leftState.players) ? leftState.players.slice(0, 2) : [];
    const right = Array.isArray(rightState && rightState.players) ? rightState.players.slice(0, 2) : [];
    return left.length === 2
      && right.length === 2
      && areStrictPlayerNamesEqual(left[0], right[0])
      && areStrictPlayerNamesEqual(left[1], right[1]);
  }

  function buildFreshMatchStartDeliverySnapshot(matchUrl) {
    const key = normalizeMatchUrlKey(matchUrl);
    if (!key) {
      return null;
    }
    if (isCipTableTennisListUrl(location.href)) {
      return buildCurrentCipListRowSnapshot(key);
    }
    if (normalizeMatchUrlKey(location.href) === key && isBsportsfanMatchUrl(location.href)) {
      return buildBsportsfanSnapshot("match-start-delivery-check");
    }
    return null;
  }

  function finalizeInlineForecastDeliveryState(matchUrl, archive, fallbackSnapshot = null) {
    const url = normalizeMatchUrlKey(matchUrl);
    const requestWasVisibleOnCip = isVisibleCipPrematchEntryState(archive && archive.requestEntryState);
    const currentCipSnapshot = requestWasVisibleOnCip
      ? buildCurrentCipListRowSnapshot(url)
      : null;
    const candidates = requestWasVisibleOnCip
      ? [currentCipSnapshot]
      : [
          inlineForecastSeedState.get(url),
          window.__liveValueRadarBsportsfanSnapshot,
          fallbackSnapshot
        ];
    const latestSnapshot = candidates
      .filter((snapshot) => snapshot
        && (!snapshot.url || normalizeMatchUrlKey(snapshot.url) === url))
      .slice()
      .sort((left, right) => Number(right && right.ts || 0) - Number(left && left.ts || 0))[0]
      || (requestWasVisibleOnCip
        ? buildMissingCipListRowSnapshot(url, fallbackSnapshot)
        : fallbackSnapshot || {});
    const readyAt = Date.now();
    const deliveryEntryState = buildInlineForecastEntryState(latestSnapshot, "delivery");
    const observationAgeMs = Math.max(0, readyAt - Number(deliveryEntryState.capturedAt || readyAt));
    if (
      deliveryEntryState.mode === "prematch"
      && deliveryEntryState.sourceStateEvidence === "scheduled-time"
      && Number(deliveryEntryState.matchDateTs || 0) <= readyAt
    ) {
      deliveryEntryState.mode = "unknown";
      deliveryEntryState.started = false;
      deliveryEntryState.sourceStateEvidence = "scheduled-time-expired";
    }
    deliveryEntryState.observationAgeMs = observationAgeMs;
    archive.readyAt = readyAt;
    archive.deliveryObservedAt = Number(deliveryEntryState.capturedAt || 0) || readyAt;
    archive.deliveryEntryState = deliveryEntryState;
    archive.deliveryMode = deliveryEntryState.mode;
    archive.collectionLatencyMs = Math.max(0, readyAt - Number(archive.collectionStartedAt || readyAt));
  }

  function buildCurrentCipListRowSnapshot(matchUrl) {
    if (!isCipTableTennisListUrl(location.href)) {
      return null;
    }
    const key = normalizeMatchUrlKey(matchUrl);
    const row = Array.from(document.querySelectorAll(BSF_LIST_MATCH_ROW_SELECTOR))
      .find((candidate) => normalizeMatchUrlKey(findMatchUrlInRow(candidate)) === key);
    return row
      ? buildInlineForecastSeedSnapshotFromRow(row, matchUrl, location.href, "cip-delivery-check")
      : null;
  }

  function buildMissingCipListRowSnapshot(matchUrl, fallbackSnapshot = null) {
    const fallback = fallbackSnapshot && typeof fallbackSnapshot === "object" ? fallbackSnapshot : {};
    return {
      ...fallback,
      reason: "cip-delivery-check",
      ts: Date.now(),
      url: normalizeUrl(matchUrl),
      matchDateTs: 0,
      matchState: "unknown",
      matchStateSource: "cip-list-row",
      matchStateEvidence: "cip-row-missing",
      setScores: [],
      currentPointScore: null
    };
  }

  function isFinishedListMatchRow(row) {
    return Boolean(extractFinishedMatchScoreFromListRow(row))
      || hasExplicitFinishedListRowMarker(row);
  }

  async function collectInlineForecast(matchUrl, options = {}) {
    const previousState = inlineForecastState.get(matchUrl);
    if (previousState && previousState.status === "loading" && !isInlineForecastLoadingStale(previousState)) {
      return;
    }

    const runId = ++inlineForecastRunId;
    const previousRetryCount = Number(previousState && previousState.retryCount || 0);
    inlineForecastState.set(matchUrl, {
      status: "loading",
      message: "Открываю матч...",
      runId,
      retryCount: previousRetryCount,
      updatedAt: Date.now()
    });
    const collectionStartedAt = Date.now();
    const collectionDeadlineAt = collectionStartedAt + INLINE_FORECAST_COLLECTION_TIMEOUT_MS;
    const requestPriority = getInlineForecastRequestPriority(options);
    try {
      const collection = (async () => {
        throwIfInlineForecastShouldYield(options, "before-seed");
        const matchSnapshot = await resolveInlineForecastSnapshot(matchUrl, options.seedSnapshot, {
          deadlineAt: collectionDeadlineAt,
          requestPriority
        });
        throwIfInlineForecastShouldYield(options, "after-seed");
        const archive = await collectPlayerArchiveForSnapshot(matchSnapshot, {
          beforeDateTs: getArchiveCutoffForSnapshot(matchSnapshot),
          requestedAt: Number(options.requestedAt || options.queuedAt || 0)
            || Number(matchSnapshot && matchSnapshot.ts || 0),
          collectionStartedAt,
          matchesPerPlayer: TREND_MATCHES_PER_PLAYER,
          minimumMatchesPerPlayer: ARCHIVE_MATCHES_PER_PLAYER,
          forecastMatchesPerPlayer: ARCHIVE_MATCHES_PER_PLAYER,
          fetchConcurrency: INLINE_FORECAST_FETCH_CONCURRENCY,
          fetchDelayMs: 0,
          skipHistoricalPointArchive: true,
          collectCandidatePointProfiles: true,
          includeOdds: true,
          emitProgress: true,
          deadlineAt: collectionDeadlineAt,
          requestPriority,
          shouldYield: options.shouldYield
        });
        if (archive && archive.retryable) {
          const error = new Error(archive.retryReason || "temporary profile collection failure");
          error.code = "lvr-retryable-profile-collection";
          error.retryable = true;
          error.retryBudgetExempt = Boolean(archive.retryBudgetExempt);
          error.retryAfterMs = Math.max(
            INLINE_FORECAST_TRANSIENT_RETRY_MS,
            Number(archive.retryAfterMs || 0) || 0
          );
          throw error;
        }
        return { matchSnapshot, archive };
      })();
      const { matchSnapshot, archive } = await raceWithRuntimeDeadline(
        collection,
        Math.max(100, collectionDeadlineAt - Date.now()),
        "match profile collection"
      );
      finalizeInlineForecastDeliveryState(matchUrl, archive, matchSnapshot);
      if (!isInlineForecastRunCurrent(matchUrl, runId)) {
        return;
      }
      inlineForecastState.set(matchUrl, {
        status: "ready",
        archive,
        runId,
        updatedAt: Date.now()
      });
      runInlineForecastSideEffects(matchUrl, archive, options);
    } catch (error) {
      if (!isInlineForecastRunCurrent(matchUrl, runId)) {
        return;
      }
      const archive = buildInlineForecastFailureArchive(matchUrl, options.seedSnapshot, error, collectionStartedAt);
      const retryable = isRetryableInlineForecastError(error);
      const retryBudgetExempt = isInlineForecastRetryBudgetExempt(error);
      const retryCount = retryable && !retryBudgetExempt
        ? previousRetryCount + 1
        : previousRetryCount;
      const terminal = !retryable || (
        !retryBudgetExempt
        && retryCount >= INLINE_FORECAST_MAX_TRANSIENT_ATTEMPTS
      );
      const retryAfterMs = retryable
        ? Math.max(1000, Number(error && error.retryAfterMs || INLINE_FORECAST_TRANSIENT_RETRY_MS))
        : INLINE_FORECAST_ERROR_RETRY_MS;
      const nextState = {
        status: "error",
        message: stringifyError(error),
        archive,
        runId,
        retryable,
        retryBudgetExempt,
        retryCount,
        terminal,
        retryAt: terminal ? Number.POSITIVE_INFINITY : Date.now() + retryAfterMs,
        updatedAt: Date.now()
      };
      inlineForecastState.set(matchUrl, nextState);
      finalizeTerminalMatchStartCollectionFailure(matchUrl, nextState);
      recordTelegramSendDebug("match-start-collection", normalizeMatchUrlKey(matchUrl), {
        ok: false,
        sent: false,
        quiet: true,
        reason: "history-collection-error",
        error: stringifyError(error)
      });
    }
  }

  function isRetryableInlineForecastError(error) {
    const code = String(error && error.code || "");
    return Boolean(error && error.retryable)
      || [
        "lvr-retryable-profile-collection",
        "lvr-runtime-deadline",
        "lvr-forecast-preempted",
        "bsportsfan-session-expired",
        "bsportsfan-challenge",
        "bsportsfan-circuit-open",
        "bsportsfan-timeout",
        "bsportsfan-expired",
        "bsportsfan-rate-limited",
        "bsportsfan-profile-unavailable"
      ].includes(code)
      || /timeout|timed out|challenge|один момент|runtime|network|worker|iframe/i.test(stringifyError(error));
  }

  function isInlineForecastRetryBudgetExempt(error) {
    return Boolean(error && error.retryBudgetExempt)
      || String(error && error.code || "") === "bsportsfan-session-expired"
      || isBsportsfanProtectionErrorCode(error && error.code);
  }

  function finalizeTerminalMatchStartCollectionFailure(matchUrl, forecastState) {
    const url = normalizeMatchUrlKey(matchUrl);
    const state = matchStartForecastStates.get(url);
    if (
      !url
      || !forecastState
      || forecastState.terminal !== true
      || !matchStartTerminalRecoveryAttempted.has(url)
      || !state
      || state.status !== "pending"
    ) {
      return false;
    }
    state.status = "decided";
    state.decidedAt = Date.now();
    state.lastCheckedAt = state.decidedAt;
    state.retryReason = "match-start-profile-collection-terminal";
    state.error = normalizeText(forecastState.message || "profile collection failed");
    state.response = {
      sent: false,
      reason: state.retryReason
    };
    inlineAutoForecastQueue.delete(url);
    setBoundedMapValue(matchStartForecastStates, url, state, RUNTIME_STATE_MAX_ENTRIES);
    return true;
  }

  function isBsportsfanProtectionErrorCode(value) {
    return [
      "bsportsfan-challenge",
      "bsportsfan-circuit-open",
      "bsportsfan-rate-limited",
      "bsportsfan-session-expired"
    ].includes(String(value || ""));
  }

  function getInlineForecastRequestPriority(options = {}) {
    if (options.startAuto) {
      return "critical";
    }
    return "prewarm";
  }

  function throwIfInlineForecastShouldYield(options = {}, phase = "collection") {
    const liveSessionExpired = liveSessionRecoveryStarted;
    const requestedYield = typeof options.shouldYield === "function" && options.shouldYield();
    if (!liveSessionExpired && !requestedYield) {
      return;
    }
    const error = new Error(liveSessionExpired
      ? `live session expired during ${phase}`
      : `forecast collection yielded at ${phase}`);
    error.code = liveSessionExpired
      ? "bsportsfan-session-expired"
      : "lvr-forecast-preempted";
    error.retryable = true;
    error.retryBudgetExempt = liveSessionExpired;
    error.retryAfterMs = liveSessionExpired ? 60 * 1000 : 1000;
    throw error;
  }

  function buildInlineForecastFailureArchive(matchUrl, seedSnapshot, error, collectionStartedAt = Date.now()) {
    const seed = seedSnapshot && typeof seedSnapshot === "object" ? seedSnapshot : {};
    const names = (Array.isArray(seed.players) ? seed.players : [])
      .map((player) => cleanName(player && player.name || player || ""))
      .filter(isLikelyName)
      .slice(0, 2);
    for (const name of parseMatchPlayersFromSlug(matchUrl)) {
      if (names.length >= 2) {
        break;
      }
      if (!names.some((current) => normalizeSearchText(current) === normalizeSearchText(name))) {
        names.push(name);
      }
    }
    while (names.length < 2) {
      names.push(`Игрок ${names.length + 1}`);
    }
    const readyAt = Date.now();
    const requestEntryState = buildInlineForecastEntryState(seed, "request");
    const deliveryEntryState = buildInlineForecastEntryState(seed, "delivery");
    const forecast = {
      status: "not-ready",
      source: "match-start-history-pbp",
      model: "history-pbp-4factor-start-only",
      modelVersion: MATCH_START_RULE_ID,
      message: `сбор данных недоступен: ${stringifyError(error) || "unknown"}`,
      features: {}
    };
    return {
      source: "bsportsfan",
      mode: "fallback",
      requestedAt: Number(seed.ts || 0) || collectionStartedAt,
      collectionStartedAt,
      readyAt,
      collectionLatencyMs: Math.max(0, readyAt - collectionStartedAt),
      requestEntryState,
      deliveryEntryState,
      deliveryObservedAt: Number(deliveryEntryState.capturedAt || 0) || readyAt,
      deliveryMode: deliveryEntryState.mode,
      players: names.map((name) => ({ name, matchCount: 0, scoreHistory: [] })),
      league: seed.league || null,
      targetOdds: seed.oddsMarket || null,
      forecast,
      collectionError: stringifyError(error)
    };
  }

  function isInlineForecastLoadingStale(state) {
    if (!state || state.status !== "loading") {
      return false;
    }
    const updatedAt = Number(state.updatedAt || 0);
    return Number.isFinite(updatedAt)
      && updatedAt > 0
      && Date.now() - updatedAt > INLINE_FORECAST_LOADING_STALE_MS;
  }

  function runInlineForecastSideEffects(matchUrl, archive, options = {}) {
    if (isForecastSuppressedOnCurrentPage()) {
      recordTelegramSendDebug("prematch", normalizeUrl(matchUrl), {
        ok: true,
        sent: false,
        quiet: true,
        reason: "results-page-forecast-disabled"
      });
      return;
    }
    const latestSnapshot = inlineForecastSeedState.get(normalizeMatchUrlKey(matchUrl)) || null;
    const latestState = buildInlineForecastEntryState(latestSnapshot, "match-start-ready");
    const pendingStart = matchStartForecastStates.get(normalizeMatchUrlKey(matchUrl));
    if (pendingStart && pendingStart.status === "pending") {
      dispatchMatchStartForecast(normalizeMatchUrlKey(matchUrl), archive, pendingStart);
      return;
    }
    if (isMatchStartForecastState(latestState)) {
      maybeTriggerMatchStartForecast(matchUrl, latestSnapshot, latestState);
      return;
    }
    recordTelegramSendDebug("match-start-prewarm", normalizeUrl(matchUrl), {
      ok: true,
      sent: false,
      quiet: true,
      reason: "history-prewarmed-waiting-for-match-start"
    });
  }

  function maybeQueueInlineAutoForecast(matchUrl, options = {}) {
    if (liveSessionRecoveryStarted) {
      return;
    }
    const url = normalizeMatchUrlKey(matchUrl);
    const latestSeedSnapshot = inlineForecastSeedState.get(url) || options.seedSnapshot || null;
    const latestEntryState = buildInlineForecastEntryState(latestSeedSnapshot, "queue");
    const storedState = inlineForecastState.get(url);
    const terminalStartRecovery = shouldRetryTerminalForecastAtMatchStart(
      url,
      storedState,
      latestEntryState
    );
    if (isInlineForecastErrorCoolingDown(storedState) && !terminalStartRecovery) {
      return;
    }
    const doneStateUsable = storedState && (
      storedState.status === "ready" && storedState.archive
      || storedState.status === "loading" && !isInlineForecastLoadingStale(storedState)
    );
    if (inlineAutoForecastDone.has(url) && !doneStateUsable) {
      inlineAutoForecastDone.delete(url);
    }
    if (isForecastSuppressedOnCurrentPage()) {
      inlineAutoForecastQueue.delete(url);
      return;
    }
    if (!url || inlineAutoForecastDone.has(url)) return;
    const queuedOptions = inlineAutoForecastQueue.get(url);
    if (queuedOptions) {
      upsertInlineAutoForecastQueue(url, {
        ...options,
        seedSnapshot: latestSeedSnapshot,
        entryState: latestEntryState,
        cipCollect: Boolean(queuedOptions.cipCollect || options.cipCollect),
        startAuto: Boolean(
          queuedOptions.startAuto
          || options.startAuto
          || isMatchStartForecastState(latestEntryState)
        )
      });
      return;
    }

    const state = inlineForecastState.get(url);
    if (state && (
      state.status === "ready" && state.archive
      || state.status === "loading" && !isInlineForecastLoadingStale(state)
    )) {
      return;
    }

    getTelegramSettingsCached().catch(() => ({})).then((telegramSettings) => {
      if (isForecastSuppressedOnCurrentPage()) {
        inlineAutoForecastQueue.delete(url);
        return;
      }
      const seedSnapshot = inlineForecastSeedState.get(url) || options.seedSnapshot || null;
      const entryState = buildInlineForecastEntryState(seedSnapshot, "queue");
      const cipCollect = isCipTableTennisListUrl(location.href) && Boolean(seedSnapshot);
      const prematchSettingsEnabled = Boolean(
        telegramSettings
        && telegramSettings.enabled
        && telegramSettings.autoSend
      );
      const prematchAuto = prematchSettingsEnabled && isVisibleCipPrematchEntryState(entryState);
      const startAuto = prematchSettingsEnabled && Boolean(
        options.startAuto || isMatchStartForecastState(entryState)
      );
      if (!cipCollect && !prematchAuto && !startAuto) {
        recordTelegramSendDebug("prematch", url, {
          ok: true,
          sent: false,
          quiet: true,
          reason: prematchSettingsEnabled ? "prematch-entry-not-eligible" : "telegram-auto-off",
          settings: {
            prematchEnabled: Boolean(telegramSettings && telegramSettings.enabled),
            prematchAutoSend: Boolean(telegramSettings && telegramSettings.autoSend)
          }
        });
        return;
      }
      if (inlineAutoForecastDone.has(url)) {
        return;
      }
      const queuedForecast = {
        suppressTelegram: Boolean(options.suppressTelegram && !startAuto),
        requestedAt: Date.now(),
        seedSnapshot,
        entryState,
        cipCollect,
        startAuto
      };
      if (inlineAutoForecastQueue.has(url)) {
        upsertInlineAutoForecastQueue(url, queuedForecast);
        return;
      }
      const currentState = inlineForecastState.get(url);
      const terminalRecovery = shouldRetryTerminalForecastAtMatchStart(
        url,
        currentState,
        entryState
      );
      if (isInlineForecastErrorCoolingDown(currentState) && !terminalRecovery) {
        return;
      }
      if (terminalRecovery) {
        addBoundedSetValue(
          matchStartTerminalRecoveryAttempted,
          url,
          RUNTIME_STATE_MAX_ENTRIES
        );
        inlineForecastState.delete(url);
        inlineAutoForecastDone.delete(url);
      }
      if (currentState && (
        currentState.status === "ready" && currentState.archive
        || currentState.status === "loading" && !isInlineForecastLoadingStale(currentState)
      )) {
        return;
      }
      upsertInlineAutoForecastQueue(url, queuedForecast);
    }).catch((error) => {
      recordTelegramSendDebug("prematch", url, {
        ok: false,
        sent: false,
        quiet: true,
        reason: "telegram-settings-error",
        error: stringifyError(error)
      });
    });
  }

  function shouldRetryTerminalForecastAtMatchStart(matchUrl, state, entryState) {
    const url = normalizeMatchUrlKey(matchUrl);
    return Boolean(
      url
      && state
      && state.status === "error"
      && state.terminal === true
      && isMatchStartForecastState(entryState)
      && !matchStartTerminalRecoveryAttempted.has(url)
    );
  }

  function mergeInlineForecastQueueOptions(current, incoming) {
    const policy = globalThis.LvrPipelinePolicy;
    if (policy && typeof policy.mergeForecastQueueOptions === "function") {
      return policy.mergeForecastQueueOptions(current, incoming);
    }
    const startAuto = Boolean(current && current.startAuto || incoming && incoming.startAuto);
    return {
      ...(current || {}),
      ...(incoming || {}),
      startAuto,
      suppressTelegram: startAuto
        ? false
        : Boolean(current && current.suppressTelegram && incoming && incoming.suppressTelegram)
    };
  }

  function upsertInlineAutoForecastQueue(matchUrl, incomingOptions = {}) {
    const url = normalizeMatchUrlKey(matchUrl);
    if (!url) {
      return null;
    }
    const currentOptions = inlineAutoForecastQueue.get(url);
    const nextOptions = currentOptions
      ? mergeInlineForecastQueueOptions(currentOptions, incomingOptions)
      : incomingOptions;
    inlineAutoForecastQueue.set(url, nextOptions);
    requestInlineForecastPreemptionForStart(url, nextOptions);
    drainInlineAutoForecastQueue().catch((error) => {
      console.warn("[LVR Telegram] forecast queue scheduling failed", error);
    });
    return nextOptions;
  }

  function requestInlineForecastPreemptionForStart(matchUrl, options = {}) {
    const url = normalizeMatchUrlKey(matchUrl);
    if (!url || !options.startAuto) {
      return false;
    }
    // TT Cup is archive/shadow-only. It must still be calculated, but it cannot
    // interrupt a production Setka/Czech collection that may reach Telegram.
    // Otherwise every TT Cup LIVE transition repeatedly aborts the single
    // forecast worker while the queue keeps production work ranked first.
    if (isPrematchTelegramShadowOnlyLeagueName(
      options.seedSnapshot && options.seedSnapshot.league
    )) {
      return false;
    }
    let requested = false;
    for (const job of inlineAutoForecastActiveJobs.values()) {
      if (
        !job
        || normalizeMatchUrlKey(job.matchUrl) === url
        || job.preemptRequested
        || job.options && job.options.startAuto
      ) {
        continue;
      }
      job.preemptRequested = true;
      job.preemptedBy = url;
      job.preemptRequestedAt = Date.now();
      inlineForecastPreemptionCount += 1;
      requested = true;
    }
    return requested;
  }

  function hasUrgentProductionForecastWork() {
    const isUrgent = (options) => Boolean(
      options
      && options.startAuto
      && !isPrematchTelegramShadowOnlyLeagueName(
        options.seedSnapshot && options.seedSnapshot.league
      )
    );
    return Array.from(inlineAutoForecastQueue.values()).some(isUrgent)
      || Array.from(inlineAutoForecastActiveJobs.values())
        .some((job) => isUrgent(job && job.options));
  }

  function maintainInlineForecastScheduler(now = Date.now()) {
    reconcileInlineForecastScheduler(now);
    if (
      inlineAutoForecastQueue.size
      && inlineAutoForecastActiveJobs.size < INLINE_FORECAST_WORKER_CONCURRENCY
    ) {
      drainInlineAutoForecastQueue().catch((error) => {
        console.warn("[LVR Telegram] forecast watchdog restart failed", error);
      });
    }
  }

  async function drainInlineAutoForecastQueue() {
    if (liveSessionRecoveryStarted) {
      inlineAutoForecastQueue.clear();
      return;
    }
    reconcileInlineForecastScheduler();
    while (
      inlineAutoForecastActiveJobs.size < INLINE_FORECAST_WORKER_CONCURRENCY
      && inlineAutoForecastQueue.size
    ) {
      const entry = takeNextInlineAutoForecastQueueEntry();
      if (!entry) {
        break;
      }
      const jobId = ++inlineAutoForecastJobId;
      const job = {
        id: jobId,
        matchUrl: entry[0],
        options: entry[1] || {},
        preemptRequested: false,
        startedAt: Date.now(),
        deadlineAt: Date.now() + INLINE_FORECAST_WORKER_LEASE_MS
      };
      inlineAutoForecastActiveJobs.set(jobId, job);
      inlineAutoForecastActiveWorkers = inlineAutoForecastActiveJobs.size;
      Promise.resolve()
        .then(() => drainInlineAutoForecastQueueWorker(entry, job))
        .catch((error) => {
          console.warn("[LVR Telegram] forecast worker failed", error);
        })
        .finally(() => {
          if (inlineAutoForecastActiveJobs.get(jobId) === job) {
            inlineAutoForecastActiveJobs.delete(jobId);
          }
          inlineAutoForecastActiveWorkers = inlineAutoForecastActiveJobs.size;
          drainInlineAutoForecastQueue().catch((error) => {
            console.warn("[LVR Telegram] forecast queue restart failed", error);
          });
        });
    }
  }

  async function drainInlineAutoForecastQueueWorker(entry, job = null) {
    if (liveSessionRecoveryStarted) {
      return;
    }
    const matchUrl = entry && entry[0];
    const options = entry && entry[1] || {};
    if (!matchUrl || inlineAutoForecastDone.has(matchUrl)) {
      return;
    }
    if (isForecastSuppressedOnCurrentPage()) {
      return;
    }
    let seedSnapshot = inlineForecastSeedState.get(matchUrl) || options.seedSnapshot || null;
    let entryState = buildInlineForecastEntryState(seedSnapshot, "queue-drain");
    if (options.cipCollect) {
      seedSnapshot = buildCurrentCipListRowSnapshot(matchUrl);
      entryState = buildInlineForecastEntryState(seedSnapshot, "queue-drain");
      if (!seedSnapshot || entryState.finished) {
        return;
      }
      if (
        options.startAuto
        && (
          Number(entryState.completedSets || 0) > 0
          || Number(entryState.targetSetNumber || 0) > 1
        )
      ) {
        expirePendingMatchStartForecast(
          matchUrl,
          "confirmed-first-set-completed-before-collection",
          null,
          entryState
        );
        return;
      }
    } else if (!options.startAuto) {
      return;
    }
    const forecastLease = await sendRuntimeMessage({
      type: "lvr:acquireBsportsfanForecastLease",
      matchUrl,
      leaseMs: INLINE_FORECAST_WORKER_LEASE_MS
    }).catch(() => ({ granted: true, token: "" }));
    if (!forecastLease || forecastLease.granted !== true) {
      return;
    }
    const forecastLeaseToken = normalizeText(forecastLease.token || "");
    try {
      await collectInlineForecast(matchUrl, {
        ...options,
        suppressTelegram: Boolean(options.suppressTelegram),
        seedSnapshot,
        entryState,
        shouldYield: () => Boolean(job && job.preemptRequested)
      });
    } finally {
      if (forecastLeaseToken) {
        sendRuntimeMessage({
          type: "lvr:releaseBsportsfanForecastLease",
          matchUrl,
          token: forecastLeaseToken
        }).catch(() => {});
      }
    }
    const state = inlineForecastState.get(matchUrl);
    if (state && state.status === "ready") {
      addBoundedSetValue(inlineAutoForecastDone, matchUrl, RUNTIME_STATE_MAX_ENTRIES);
    }
  }

  function reconcileInlineForecastScheduler(now = Date.now()) {
    let releasedJobs = 0;
    for (const [jobId, job] of inlineAutoForecastActiveJobs.entries()) {
      if (Number(job && job.deadlineAt || 0) > Number(now)) {
        continue;
      }
      inlineAutoForecastActiveJobs.delete(jobId);
      releasedJobs += 1;
      const matchUrl = normalizeMatchUrlKey(job && job.matchUrl || "");
      const state = inlineForecastState.get(matchUrl);
      if (state && state.status === "loading") {
        const retryCount = Number(state.retryCount || 0) + 1;
        const terminal = retryCount >= INLINE_FORECAST_MAX_TRANSIENT_ATTEMPTS;
        const nextState = {
          status: "error",
          message: "forecast worker lease expired",
          runId: state.runId,
          retryable: true,
          retryBudgetExempt: false,
          retryCount,
          terminal,
          retryAt: terminal
            ? Number.POSITIVE_INFINITY
            : Number(now) + INLINE_FORECAST_TRANSIENT_RETRY_MS,
          updatedAt: Number(now)
        };
        inlineForecastState.set(matchUrl, nextState);
        finalizeTerminalMatchStartCollectionFailure(matchUrl, nextState);
        recordTelegramSendDebug("match-start-collection", matchUrl, {
          ok: false,
          sent: false,
          quiet: true,
          reason: "forecast-worker-lease-expired"
        });
      }
    }
    inlineAutoForecastActiveWorkers = inlineAutoForecastActiveJobs.size;
    return releasedJobs;
  }

  function takeNextInlineAutoForecastQueueEntry() {
    const policy = globalThis.LvrPipelinePolicy;
    const ranked = Array.from(inlineAutoForecastQueue.entries()).map((entry) => {
      const options = entry && entry[1] || {};
      const shadowOnly = isPrematchTelegramShadowOnlyLeagueName(
        options.seedSnapshot && options.seedSnapshot.league
      );
      const rank = policy && typeof policy.buildForecastQueueRank === "function"
        ? policy.buildForecastQueueRank(options, shadowOnly)
        : [
            shadowOnly ? 1 : 0,
            getInlineAutoForecastQueuePriority(options, options.entryState || {}),
            Number(options.entryState && options.entryState.matchDateTs || 0) || Number.POSITIVE_INFINITY,
            Number(options.requestedAt || 0) || Number.POSITIVE_INFINITY
          ];
      return { key: entry[0], entry, rank };
    });
    ranked.sort((left, right) => (
      policy && typeof policy.compareForecastQueueEntries === "function"
        ? policy.compareForecastQueueEntries(left, right)
        : compareInlineForecastQueueRanks(left, right)
    ));
    const selectedEntry = ranked.length ? ranked[0].entry : null;

    if (selectedEntry) {
      inlineAutoForecastQueue.delete(selectedEntry[0]);
    }
    return selectedEntry;
  }

  function compareInlineForecastQueueRanks(left, right) {
    const leftRank = Array.isArray(left && left.rank) ? left.rank : [];
    const rightRank = Array.isArray(right && right.rank) ? right.rank : [];
    for (let index = 0; index < Math.max(leftRank.length, rightRank.length); index += 1) {
      const leftValue = Number.isFinite(Number(leftRank[index]))
        ? Number(leftRank[index])
        : Number.POSITIVE_INFINITY;
      const rightValue = Number.isFinite(Number(rightRank[index]))
        ? Number(rightRank[index])
        : Number.POSITIVE_INFINITY;
      if (leftValue !== rightValue) {
        return leftValue - rightValue;
      }
    }
    return String(left && left.key || "").localeCompare(String(right && right.key || ""));
  }

  function getInlineAutoForecastQueuePriority(options, entryState) {
    if (options.startAuto && entryState.started) {
      return 0;
    }
    if (!entryState.started) {
      if (!options.suppressTelegram) {
        return entryState.mode === "prematch" ? 1 : 2;
      }
      return entryState.mode === "prematch" ? 3 : 4;
    }
    return 5;
  }

  async function getTelegramSettingsCached() {
    if (telegramSettingsCache && Date.now() - telegramSettingsCacheTs < 5000) {
      return telegramSettingsCache;
    }
    if (!telegramSettingsRequest) {
      telegramSettingsRequest = raceWithRuntimeDeadline(
        sendRuntimeMessage({ type: "lvr:getTelegramSettings" }),
        RUNTIME_SETTINGS_TIMEOUT_MS,
        "Telegram settings"
      )
        .then((response) => {
          telegramSettingsCache = response && response.telegramSettings || {};
          telegramSettingsCacheTs = Date.now();
          return telegramSettingsCache;
        })
        .finally(() => {
          telegramSettingsRequest = null;
        });
    }
    return telegramSettingsRequest;
  }

  function isNotStartedListMatchRow(row) {
    const text = getListRowTextWithoutOwnWidgets(row);
    return /\b(?:not\s*started|scheduled|upcoming)\b/i.test(text)
      || /\b(?:не\s*нач|ожида|заплан)\b/i.test(text);
  }

  function isLiveListMatchRow(row) {
    const text = getListRowTextWithoutOwnWidgets(row);
    return /\b(?:live|in\s*play|playing)\b/i.test(text)
      || /\b(?:лайв|прямой\s+эфир|в\s+игре)\b/i.test(text);
  }

  function hasExplicitFinishedListRowMarker(row) {
    const text = getListRowTextWithoutOwnWidgets(row);
    return /\b(?:finished|completed|ended)\b/i.test(text)
      || /\b(?:законч|заверш|итог)\b/i.test(text)
      || /\b[WL]\b/.test(text);
  }

  function parseCompletedSetScoresFromListRow(row) {
    return parseListRowSetScores(row).filter((score) => isCompletedTableTennisSet(score.left, score.right));
  }

  function parseListRowLiveCompletedSetScores(row) {
    const parsedScores = parseCompletedSetScoresFromListRow(row);
    const rowText = getListRowTextWithoutOwnWidgets(row);
    const rowScores = (hasDashSeparatedScore(rowText) ? parseDashSeparatedScores(rowText) : [])
      .filter((score) => isCompletedTableTennisSet(score.left, score.right));
    if (
      rowScores.length
      && rowScores.length < parsedScores.length
      && isRepeatedSetScoreSequence(parsedScores, rowScores)
    ) {
      return rowScores;
    }
    return parsedScores;
  }

  function parseListRowLiveCurrentPointScore(row, matchUrl = "") {
    const normalizedMatchUrl = normalizeMatchUrlKey(matchUrl || findMatchUrlInRow(row));
    for (const anchor of getListRowMatchAnchors(row)) {
      const href = normalizeMatchUrlKey(anchor && (anchor.getAttribute && anchor.getAttribute("href") || anchor.href) || "");
      if (normalizedMatchUrl && href && href !== normalizedMatchUrl) {
        continue;
      }
      const score = parseDashSeparatedScores(anchor && anchor.textContent || "")
        .map((item) => normalizeLiveCurrentPointScore(item, null, "list-anchor"))
        .find(Boolean);
      if (score) {
        return score;
      }
    }
    return null;
  }

  function isRepeatedSetScoreSequence(candidateScores, baseScores) {
    const candidates = Array.isArray(candidateScores) ? candidateScores : [];
    const base = Array.isArray(baseScores) ? baseScores : [];
    if (!base.length || candidates.length <= base.length || candidates.length % base.length !== 0) {
      return false;
    }
    return candidates.every((score, index) => (
      isSameSetScore(score, base[index % base.length])
    ));
  }

  function isSameSetScore(leftScore, rightScore) {
    return Number(leftScore && leftScore.left) === Number(rightScore && rightScore.left)
      && Number(leftScore && leftScore.right) === Number(rightScore && rightScore.right);
  }

  function parseListRowSetScores(row) {
    const rawNodes = Array.from(row && row.querySelectorAll
      ? row.querySelectorAll(".badge, .badge_L, .badge_W, .text-muted, [class*='badge'], [id$='T']")
      : []);
    const nodes = rawNodes.filter((node) => !rawNodes.some((other) => (
      other !== node
      && typeof node.contains === "function"
      && node.contains(other)
    )));
    const nodeScores = nodes
      .map((node) => normalizeText(node && node.textContent || ""))
      .filter(hasDashSeparatedScore)
      .flatMap(parseDashSeparatedScores);
    const rowText = getListRowTextWithoutOwnWidgets(row);
    const rowScores = hasDashSeparatedScore(rowText) ? parseDashSeparatedScores(rowText) : [];
    const nodeCompleted = nodeScores.filter((score) => isCompletedTableTennisSet(score.left, score.right)).length;
    const rowCompleted = rowScores.filter((score) => isCompletedTableTennisSet(score.left, score.right)).length;
    if (rowCompleted > nodeCompleted) {
      return rowScores;
    }
    return nodeScores.length ? nodeScores : rowScores;
  }

  function getListRowTextWithoutOwnWidgets(row) {
    if (!row) {
      return "";
    }

    const rawText = normalizeText(row.textContent || "");
    const cached = listRowTextCache.get(row);
    if (cached && cached.rawText === rawText) {
      return cached.text;
    }

    const normalizedText = rawText;
    listRowTextCache.set(row, { rawText, text: normalizedText });
    return normalizedText;
  }

  function textContentWithoutDescendants(root, ignoredSelector) {
    if (!root || !root.querySelectorAll) {
      return normalizeText(root && root.textContent || "");
    }

    let ignoredNodes = [];
    try {
      ignoredNodes = Array.from(root.querySelectorAll(ignoredSelector || ""));
    } catch (_) {
      ignoredNodes = [];
    }
    if (!ignoredNodes.length) {
      return normalizeText(root.textContent || "");
    }

    if (!document.createTreeWalker || !window.NodeFilter) {
      let text = normalizeText(root.textContent || "");
      for (const node of ignoredNodes) {
        const ignoredText = normalizeText(node && node.textContent || "");
        if (ignoredText) {
          text = normalizeText(text.replace(ignoredText, " "));
        }
      }
      return text;
    }

    const ignored = new Set(ignoredNodes);
    const filter = {
      acceptNode(node) {
        let current = node && node.parentElement;
        while (current && current !== root) {
          if (ignored.has(current)) {
            return window.NodeFilter.FILTER_REJECT;
          }
          current = current.parentElement;
        }
        return window.NodeFilter.FILTER_ACCEPT;
      }
    };
    const walker = document.createTreeWalker(root, window.NodeFilter.SHOW_TEXT, filter);
    const parts = [];
    let node = walker.nextNode();
    while (node) {
      parts.push(node.nodeValue || "");
      node = walker.nextNode();
    }
    return normalizeText(parts.join(" "));
  }

  function parseDashSeparatedScores(source) {
    const scores = [];
    const text = String(source || "").replace(
      /\b(?:\d{4}\s*[-–—]\s*\d{1,2}\s*[-–—]\s*\d{1,2}|\d{1,2}\s*[-–—]\s*\d{1,2}\s*[-–—]\s*\d{2,4})\b/g,
      " "
    );
    const regex = /(\d{1,2})\s*[-–—]\s*(\d{1,2})/g;
    let match;
    while ((match = regex.exec(text))) {
      const left = Number(match[1]);
      const right = Number(match[2]);
      if (!Number.isFinite(left) || !Number.isFinite(right)) {
        continue;
      }
      scores.push({ left, right });
    }
    return scores;
  }

  function normalizeLiveCurrentPointScore(score, setNumber = null, source = "") {
    const left = Number(score && score.left);
    const right = Number(score && score.right);
    if (!isPlausibleLivePointScore(left, right) || isCompletedTableTennisSet(left, right)) {
      return null;
    }
    const set = Number(score && score.set || setNumber || 0);
    return {
      set: Number.isFinite(set) && set > 0 ? set : null,
      left,
      right,
      source
    };
  }

  function isPlausibleLivePointScore(left, right) {
    return Number.isFinite(Number(left))
      && Number.isFinite(Number(right))
      && Number(left) >= 0
      && Number(right) >= 0
      && Number(left) <= 40
      && Number(right) <= 40;
  }

  function hasDashSeparatedScore(value) {
    return /\d{1,2}\s*[-–—]\s*\d{1,2}/.test(normalizeText(value));
  }

  function isCompletedTableTennisSet(left, right) {
    const max = Math.max(Number(left), Number(right));
    const min = Math.min(Number(left), Number(right));
    return Number.isFinite(max)
      && Number.isFinite(min)
      && min >= 0
      && (
        (max === 11 && min <= 9)
        || (min >= 10 && max === min + 2)
      );
  }

  function parseListRowPlayers(row) {
    const cells = Array.from(row.children || []).filter((cell) => /^(td|th)$/i.test(cell.tagName || ""));
    const scoreCellIndex = cells.findIndex((cell) => cell.querySelector && cell.querySelector(BSF_MATCH_LINK_SELECTOR));
    if (scoreCellIndex > 0 && scoreCellIndex < cells.length - 1) {
      const left = cleanListPlayerName(cells[scoreCellIndex - 1]);
      const right = cleanListPlayerName(cells[scoreCellIndex + 1]);
      if (left || right) {
        return [left, right];
      }
    }

    const playerLinks = Array.from(row.querySelectorAll(BSF_PLAYER_LINK_SELECTOR))
      .map((link) => normalizeText(link && link.textContent || ""))
      .filter(Boolean);
    if (playerLinks.length >= 2) {
      return [playerLinks[0] || "", playerLinks[1] || ""];
    }

    const matchUrl = findMatchUrlInRow(row);
    const slugNames = parseMatchPlayersFromSlug(matchUrl);
    return [slugNames[0] || playerLinks[0] || "", slugNames[1] || playerLinks[1] || ""];
  }

  function cleanListPlayerName(node) {
    if (!node) {
      return "";
    }

    return textContentWithoutDescendants(node, `.badge, [class*='badge'], ${BSF_MATCH_LINK_SELECTOR}, .text-muted`)
      .replace(/\b(?:vs?|live|прямой эфир)\b/ig, " ")
      .replace(/\d{1,2}\s*[-:]\s*\d{1,2}/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function maybeSendInlineTelegramPrediction(matchUrl, archive) {
    if (isForecastSuppressedOnCurrentPage()) {
      recordTelegramSendDebug("prematch", normalizeUrl(matchUrl), {
        ok: true,
        sent: false,
        quiet: true,
        reason: "results-page-forecast-disabled"
      });
      return Promise.resolve({ sent: false, reason: "results-page-forecast-disabled" });
    }
    const decision = buildInlineForecastDecision(archive) || {};
    const prediction = buildPrematchTelegramPredictionPayload(matchUrl, archive, decision);
    if (decision.action !== "forecast") {
      const reason = normalizeText(decision.reason || "prematch-not-qualified");
      const recorded = recordTelegramDatasetEvent(matchUrl, {
        prediction,
        outcome: {
          accepted: false,
          sent: false,
          reason
        }
      });
      recordTelegramSendDebug("prematch", normalizeUrl(matchUrl), {
        ok: true,
        sent: false,
        quiet: true,
        reason
      });
      return recorded;
    }
    return sendRuntimeMessage({
      type: "lvr:sendTelegramPrediction",
      prediction
    }).then((response) => {
      recordTelegramSendDebug("prematch", normalizeUrl(matchUrl), response);
      maybeRecoverOpeningOddsAfterSend(matchUrl, prediction, response);
      return response;
    }).catch((error) => {
      recordTelegramSendDebug("prematch", normalizeUrl(matchUrl), null, error);
      throw error;
    });
  }

  function maybeRecoverOpeningOddsAfterSend(matchUrl, prediction, response) {
    if (!response || response.sent !== true) {
      return;
    }
    const existing = prediction && prediction.referenceMoneylineMarket;
    if (
      Number(existing && existing.leftOdds) > 1
      && Number(existing && existing.rightOdds) > 1
    ) {
      return;
    }
    const url = normalizeMatchUrlKey(matchUrl);
    if (!url) {
      return;
    }
    const previous = openingOddsRecoveryDone.get(url);
    if (previous && ["scheduled", "loading", "done", "exhausted"].includes(previous.status)) {
      return;
    }
    scheduleOpeningOddsRecovery(url, 0, OPENING_ODDS_RECOVERY_DELAY_MS);
  }

  function scheduleOpeningOddsRecovery(url, attempt, delayMs) {
    setBoundedMapValue(openingOddsRecoveryDone, url, {
      status: "scheduled",
      attempt,
      updatedAt: Date.now()
    }, RUNTIME_STATE_MAX_ENTRIES);
    window.setTimeout(() => {
      if (liveSessionRecoveryStarted || getBsportsfanNavigationProtectionError()) {
        setBoundedMapValue(openingOddsRecoveryDone, url, {
          status: "exhausted",
          attempt,
          reason: "session-protection",
          updatedAt: Date.now()
        }, RUNTIME_STATE_MAX_ENTRIES);
        return;
      }
      setBoundedMapValue(openingOddsRecoveryDone, url, {
        status: "loading",
        attempt,
        updatedAt: Date.now()
      }, RUNTIME_STATE_MAX_ENTRIES);
      fetchBsportsfanOddsMarket(url, {
        deadlineAt: Date.now() + OPENING_ODDS_RECOVERY_TIMEOUT_MS,
        requestPriority: "background",
        allowIframe: true,
        forceRefresh: true
      }).then((market) => {
        const opening = market && market.opening;
        if (!(Number(opening && opening.leftOdds) > 1) || !(Number(opening && opening.rightOdds) > 1)) {
          if (attempt + 1 < OPENING_ODDS_RECOVERY_MAX_ATTEMPTS) {
            scheduleOpeningOddsRecovery(url, attempt + 1, OPENING_ODDS_RECOVERY_RETRY_DELAY_MS);
          } else {
            setBoundedMapValue(openingOddsRecoveryDone, url, {
              status: "exhausted",
              attempt,
              reason: "opening-unavailable",
              updatedAt: Date.now()
            }, RUNTIME_STATE_MAX_ENTRIES);
          }
          return null;
        }
        return sendRuntimeMessage({
          type: "lvr:patchTelegramPredictionHistoricalOpeningOdds",
          quote: {
            matchUrl: url,
            status: "ready",
            marketType: "matchResult",
            quoteSource: "opening",
            preferredSource: "opening",
            leftOdds: Number(opening.leftOdds),
            rightOdds: Number(opening.rightOdds),
            source: normalizeText(market.source || "bsportsfan-odds"),
            sourceUrl: normalizeUrl(market.url || getBsportsfanOddsUrl(url)),
            observedAt: Date.now()
          }
        }).then((result) => {
          setBoundedMapValue(openingOddsRecoveryDone, url, result && result.recorded
            ? {
                status: "done",
                attempt,
                updatedAt: Date.now()
              }
            : {
                status: "exhausted",
                attempt,
                reason: "prediction-record-missing",
                updatedAt: Date.now()
              }, RUNTIME_STATE_MAX_ENTRIES);
          return result;
        });
      }).catch((error) => {
        recordTelegramSendDebug("opening-odds-recovery", url, null, error);
        if (attempt + 1 < OPENING_ODDS_RECOVERY_MAX_ATTEMPTS && !isBsportsfanProtectionError(error)) {
          scheduleOpeningOddsRecovery(url, attempt + 1, OPENING_ODDS_RECOVERY_RETRY_DELAY_MS);
        } else {
          setBoundedMapValue(openingOddsRecoveryDone, url, {
            status: "exhausted",
            attempt,
            reason: stringifyError(error),
            updatedAt: Date.now()
          }, RUNTIME_STATE_MAX_ENTRIES);
        }
      });
    }, Math.max(0, Number(delayMs || 0)));
  }

  function maybePatchTelegramOpeningOddsFromSeedSnapshot(matchUrl, snapshot) {
    const url = normalizeMatchUrlKey(matchUrl);
    const market = snapshot && snapshot.oddsMarket;
    const opening = market && market.opening;
    const leftOdds = Number(opening && opening.leftOdds);
    const rightOdds = Number(opening && opening.rightOdds);
    if (!url || !(leftOdds > 1) || !(rightOdds > 1)) {
      return;
    }
    const previous = openingOddsRowPatchState.get(url);
    if (
      previous
      && (
        previous.status === "done"
        || previous.status === "pending"
        || Date.now() < Number(previous.retryAt || 0)
      )
    ) {
      return;
    }
    setBoundedMapValue(openingOddsRowPatchState, url, {
      status: "pending",
      updatedAt: Date.now()
    }, RUNTIME_STATE_MAX_ENTRIES);
    sendRuntimeMessage({
      type: "lvr:patchTelegramPredictionHistoricalOpeningOdds",
      quote: {
        matchUrl: url,
        status: "ready",
        marketType: "matchResult",
        quoteSource: "opening",
        preferredSource: "opening",
        leftOdds,
        rightOdds,
        source: normalizeText(market.source || "bsportsfan-list-row"),
        sourceUrl: normalizeUrl(market.url || url),
        observedAt: Date.now()
      }
    }).then((result) => {
      setBoundedMapValue(openingOddsRowPatchState, url, result && result.recorded
        ? {
            status: "done",
            updatedAt: Date.now()
          }
        : {
            status: "retry",
            retryAt: Date.now() + 10 * 1000,
            updatedAt: Date.now()
          }, RUNTIME_STATE_MAX_ENTRIES);
    }).catch(() => {
      setBoundedMapValue(openingOddsRowPatchState, url, {
        status: "retry",
        retryAt: Date.now() + 30 * 1000,
        updatedAt: Date.now()
      }, RUNTIME_STATE_MAX_ENTRIES);
    });
  }

  function recordSuppressedInlineTelegramPrediction(matchUrl, archive, reason) {
    const normalizedReason = normalizeText(reason || "prematch-suppressed");
    recordTelegramSendDebug("match-start-expired", normalizeUrl(matchUrl), {
      ok: true,
      sent: false,
      quiet: true,
      reason: normalizedReason
    });
    return Promise.resolve({
      recorded: false,
      sent: false,
      reason: normalizedReason
    });
  }

  function buildPrematchTelegramPredictionPayload(matchUrl, archive, decision = {}) {
    const players = Array.isArray(archive && archive.players)
      ? archive.players.slice(0, 2).map((player) => player && player.name || "").filter(Boolean)
      : [];
    const sideIndex = decision && (decision.sideIndex === 0 || decision.sideIndex === 1)
      ? decision.sideIndex
      : NaN;
    const predictedSide = sideIndex === 0 || sideIndex === 1 ? sideIndex : null;
    const playerName = decision.playerName || (predictedSide === 0 || predictedSide === 1 ? players[predictedSide] : "") || "";
    const oddsMeaning = decision.oddsMeaning || "none";
    const decisionFeatures = decision.features || {};
    const archivePlayers = Array.isArray(archive && archive.players) ? archive.players.slice(0, 2) : [];
    const freshForm3Scores = ["leftFreshForm3Score", "rightFreshForm3Score"].map((key, index) => (
      finiteNumberOrNull(decisionFeatures[key])
      ?? finiteNumberOrNull(summarizePrematchTwoSetScoreHistory(archivePlayers[index] && archivePlayers[index].scoreHistory).form3Score)
      ?? ""
    ));
    const strengthScores = ["leftStrengthScore", "rightStrengthScore"].map((key) => (
      finiteNumberOrNull(decisionFeatures[key]) ?? ""
    ));
    const requestEntryState = orientInlineForecastEntryState(archive && archive.requestEntryState, predictedSide);
    const startEntryState = orientInlineForecastEntryState(archive && archive.startEntryState, predictedSide);
    const deliveryEntryState = orientInlineForecastEntryState(archive && archive.deliveryEntryState, predictedSide);
    const readyAt = Number(archive && archive.readyAt || 0) || Date.now();
    const noOddsModel = normalizeText(oddsMeaning).toLowerCase() === "none";
    const observedMoneylineMarket = buildSelectedMoneylineMarketSnapshot(
      archive && archive.targetOdds,
      predictedSide,
      readyAt,
      players
    );
    const moneylineMarket = noOddsModel ? null : observedMoneylineMarket;
    const referenceMoneylineMarket = Number(observedMoneylineMarket && observedMoneylineMarket.leftOdds) > 1
      && Number(observedMoneylineMarket && observedMoneylineMarket.rightOdds) > 1
      ? {
          ...observedMoneylineMarket,
          usage: "display-only",
          modelInput: false
        }
      : null;
    const moneylineOdds = Number(moneylineMarket && moneylineMarket.selectedOdds);
    const referenceLeftOdds = Number(referenceMoneylineMarket && referenceMoneylineMarket.leftOdds);
    const referenceRightOdds = Number(referenceMoneylineMarket && referenceMoneylineMarket.rightOdds);
    const referencePlayerOdds = predictedSide === 0
      ? referenceLeftOdds
      : predictedSide === 1
        ? referenceRightOdds
        : NaN;
    const referenceOpponentOdds = predictedSide === 0
      ? referenceRightOdds
      : predictedSide === 1
        ? referenceLeftOdds
        : NaN;
    const leagueName = getPrematchTelegramLeagueName(archive && archive.league || decision.leagueName || "");
    const payloadFeatures = decisionFeatures;
    return {
      matchUrl: normalizeUrl(matchUrl),
      players,
      playerName,
      sideIndex: predictedSide,
      action: decision.action || "",
      decisionAction: decision.action || "",
      source: decision.source || "",
      forecastSource: decision.source || "",
      modelVersion: decision.modelVersion || "",
      signalMode: decision.signalMode || decisionFeatures.startMatchSignalMode || "",
      noMarketCoverage: decision.noMarketCoverage === true,
      coverageRuleId: decision.coverageRuleId || decision.features && decision.features.simpleNoOddsCoverageRuleId || "",
      edge: decision.edge,
      betType: decision.betType || "two_sets",
      oddsMeaning,
      probabilityMeaning: decision.probabilityMeaning || "leader by recent two-set coverage frequency",
      modelProbability: finiteNumberOrNull(decision.probability) ?? "",
      internalScore: finiteNumberOrNull(decision.score) ?? "",
      requestedAt: Number(archive && archive.requestedAt || 0) || "",
      collectionStartedAt: Number(archive && archive.collectionStartedAt || 0) || "",
      readyAt,
      collectionLatencyMs: Number(archive && archive.collectionLatencyMs || 0),
      deliveryObservedAt: Number(archive && archive.deliveryObservedAt || 0) || "",
      deliveryMode: normalizeText(archive && archive.deliveryMode || deliveryEntryState && deliveryEntryState.mode || "unknown"),
      requestEntryState,
      startEntryState,
      deliveryEntryState,
      moneylineMarket,
      referenceMoneylineMarket,
      leftOdds: Number.isFinite(referenceLeftOdds) && referenceLeftOdds > 1
        ? roundDecimal(referenceLeftOdds, 3)
        : "",
      rightOdds: Number.isFinite(referenceRightOdds) && referenceRightOdds > 1
        ? roundDecimal(referenceRightOdds, 3)
        : "",
      playerOdds: Number.isFinite(referencePlayerOdds) && referencePlayerOdds > 1
        ? roundDecimal(referencePlayerOdds, 3)
        : "",
      opponentOdds: Number.isFinite(referenceOpponentOdds) && referenceOpponentOdds > 1
        ? roundDecimal(referenceOpponentOdds, 3)
        : "",
      moneylineOdds: Number.isFinite(moneylineOdds) && moneylineOdds > 1
        ? roundDecimal(moneylineOdds, 3)
        : "",
      referenceOddsMeaning: referenceMoneylineMarket ? "display-only-match-winner" : "none",
      leftFreshForm3Score: freshForm3Scores[0],
      rightFreshForm3Score: freshForm3Scores[1],
      leftStrengthScore: strengthScores[0],
      rightStrengthScore: strengthScores[1],
      playerStrengthScore: predictedSide === 0 || predictedSide === 1 ? strengthScores[predictedSide] : "",
      opponentStrengthScore: predictedSide === 0 || predictedSide === 1 ? strengthScores[predictedSide === 0 ? 1 : 0] : "",
      leagueName,
      features: payloadFeatures,
      audit: buildProductionForecastAudit(archive, {
        ...decision,
        features: payloadFeatures
      })
    };
  }

  function buildProductionForecastAudit(archive, decision) {
    return {
      ts: Date.now(),
      league: archive && archive.league || null,
      decision: {
        action: decision && decision.action || "",
        source: decision && decision.source || "",
        modelVersion: decision && decision.modelVersion || "",
        noMarketCoverage: decision && decision.noMarketCoverage === true,
        playerName: decision && decision.playerName || "",
        sideIndex: decision && decision.sideIndex,
        leagueName: decision && decision.leagueName || getPrematchTelegramLeagueName(archive && archive.league || ""),
        betType: "two_sets",
        oddsMeaning: decision && decision.oddsMeaning || "none",
        probabilityMeaning: decision && decision.probabilityMeaning || "leader by recent two-set coverage frequency",
        modelProbability: finiteNumberOrNull(decision && decision.probability) ?? "",
        internalScore: finiteNumberOrNull(decision && decision.score) ?? "",
        features: decision && decision.features || {}
      }
    };
  }

  function orientInlineForecastEntryState(value, sideIndex) {
    if (!value || typeof value !== "object") {
      return null;
    }
    const selectedSide = sideIndex === 0 || sideIndex === 1 ? sideIndex : null;
    const setWins = Array.isArray(value.setWins) ? value.setWins.slice(0, 2).map(Number) : [];
    const selectedSideSetWins = selectedSide === null || !Number.isFinite(setWins[selectedSide])
      ? null
      : setWins[selectedSide];
    return {
      ...value,
      selectedSideIndex: selectedSide,
      selectedSideSetWins,
      selectedSideAlreadyHasTwoSets: selectedSideSetWins === null ? null : selectedSideSetWins >= 2
    };
  }

  function buildSelectedMoneylineMarketSnapshot(oddsMarket, sideIndex, capturedAt = Date.now(), players = []) {
    const selectedSide = sideIndex === 0 || sideIndex === 1 ? sideIndex : null;
    const source = oddsMarket && typeof oddsMarket === "object" ? oddsMarket : {};
    const observedAt = Number(capturedAt || 0) || Date.now();
    const quoteSource = source.opening && typeof source.opening === "object"
      ? "opening"
      : source.preferred && typeof source.preferred === "object"
        ? normalizeText(source.preferredSource || "preferred")
        : source.matchStart && typeof source.matchStart === "object"
          ? "match-start"
          : source.last && typeof source.last === "object"
            ? "last"
            : "";
    const quote = quoteSource === "opening"
      ? source.opening
      : source.preferred && typeof source.preferred === "object"
        ? source.preferred
        : source.matchStart && typeof source.matchStart === "object"
          ? source.matchStart
          : source.last && typeof source.last === "object"
            ? source.last
            : null;
    const selectedOdds = selectedSide === 0
      ? Number(quote && quote.leftOdds)
      : selectedSide === 1
        ? Number(quote && quote.rightOdds)
        : NaN;
    const leftOdds = Number(quote && quote.leftOdds);
    const rightOdds = Number(quote && quote.rightOdds);
    const ready = selectedSide !== null
      && Number.isFinite(selectedOdds)
      && selectedOdds > 1
      && Number.isFinite(leftOdds)
      && leftOdds > 1
      && Number.isFinite(rightOdds)
      && rightOdds > 1;
    if (!ready) {
      return {
        status: "market-unavailable",
        reason: selectedSide === null
          ? "selected-side-missing"
          : "moneyline-pair-missing",
        marketType: "matchResult",
        selectedSideIndex: selectedSide,
        observedAt,
        source: normalizeText(source.source || ""),
        sourceUrl: normalizeUrl(source.url || ""),
        preferredSource: normalizeText(source.preferredSource || ""),
        quoteSource,
        executionVerified: false
      };
    }

    return {
      status: "ready",
      reason: "match-result-odds-observed",
      marketType: "matchResult",
      selectedSideIndex: selectedSide,
      selectedPlayer: cleanName(Array.isArray(players) ? players[selectedSide] || "" : ""),
      selectedOdds: roundDecimal(selectedOdds, 3),
      leftOdds: roundDecimal(leftOdds, 3),
      rightOdds: roundDecimal(rightOdds, 3),
      observedAt,
      source: normalizeText(source.source || ""),
      sourceUrl: normalizeUrl(source.url || ""),
      preferredSource: normalizeText(source.preferredSource || ""),
      quoteSource,
      executionVerified: false
    };
  }

  function explainMatchStartForecastEligibility(context = {}) {
    if (!isMatchStartForecastState(context && context.startEntryState)) {
      return { accepted: false, reason: "match-start state missing" };
    }
    if (!isMatchStartForecastState(context && context.deliveryEntryState)) {
      return { accepted: false, reason: "match-start collection expired after first set" };
    }
    return { accepted: true, reason: "first set in progress; history-only model" };
  }

  function isStrictPrematchEntryState(state) {
    if (!state || typeof state !== "object") {
      return false;
    }
    const completedSets = finiteNumberOrNull(state.completedSets);
    return normalizeText(state.mode || "").toLowerCase() === "prematch"
      && state.started === false
      && state.finished !== true
      && state.eitherPlayerHasTwoSets !== true
      && (completedSets === null || completedSets === 0);
  }

  function isVisibleCipPrematchEntryState(state) {
    return isStrictPrematchEntryState(state)
      && normalizeText(state && state.sourceStateEvidence || "") === PREMATCH_VISIBLE_CIP_EVIDENCE;
  }

  function buildPrematchTelegramContext(context = {}) {
    const features = context && context.features || {};
    const league = context && context.league || null;
    return {
      league,
      leagueName: getPrematchTelegramLeagueName(
        context && context.leagueName
          || features.leagueName
          || league
      )
    };
  }

  function isPrematchTelegramBlockedLeagueName(value) {
    return classifyPrematchTelegramLeague(value) === "blocked";
  }

  function isPrematchTelegramShadowOnlyLeagueName(value) {
    return classifyPrematchTelegramLeague(value) === "tt-cup-shadow";
  }

  function classifyPrematchTelegramLeague(value) {
    const classifier = globalThis.LvrVerifiedPairRegimeV1
      && globalThis.LvrVerifiedPairRegimeV1.classifyLeague;
    return typeof classifier === "function"
      ? classifier(getPrematchTelegramLeagueName(value))
      : "blocked";
  }

  function getPrematchTelegramLeagueName(value) {
    if (!value) {
      return "";
    }
    if (typeof value === "string") {
      return normalizeText(value);
    }
    if (typeof value === "object") {
      return normalizeText(value.name || value.leagueName || "");
    }
    return "";
  }

  function recordTelegramDatasetEvent(matchUrl, payload = {}) {
    const rawMatchUrl = matchUrl || payload.matchUrl || payload.signal && payload.signal.matchUrl || payload.prediction && payload.prediction.matchUrl || "";
    const record = {
      ...payload,
      kind: "prematch",
      matchUrl: rawMatchUrl ? normalizeUrl(rawMatchUrl) : ""
    };
    return sendRuntimeMessage({
      type: "lvr:recordTelegramPredictionDataset",
      record
    }).catch((error) => {
      recordTelegramSendDebug("prematch-dataset", record.matchUrl || "", {
        ok: false,
        sent: false,
        quiet: true,
        reason: "dataset-record-error",
        error: stringifyError(error)
      });
    });
  }

  function recordTelegramSendDebug(kind, key, response, error = null) {
    const payload = {
      kind,
      key,
      ok: Boolean(response && (response.ok || response.sent)) && !error,
      sent: Boolean(response && response.sent),
      reason: response && response.reason || "",
      error: error ? stringifyError(error) : response && response.error || ""
    };
    const expectedSkip = isExpectedTelegramDebugSkip(payload, response);
    if ((payload.error || !payload.ok) && (!response || !response.quiet || !expectedSkip)) {
      console.warn("[LVR Telegram] send skipped/failed", payload);
    }
  }

  function isExpectedTelegramDebugSkip(payload, response) {
    if (!payload || payload.error) {
      return false;
    }
    if (payload.kind === "prediction-point-snapshot") {
      return Boolean(response);
    }
    if (payload.kind === "prematch-result" && response && response.edited === false) {
      return ["message-not-found", "missing-match-url-or-score", "already-updated"].includes(payload.reason);
    }
    return false;
  }

  async function resolveInlineForecastSnapshot(matchUrl, seedSnapshot = null, options = {}) {
    const url = normalizeMatchUrlKey(matchUrl);
    const storedSeed = inlineForecastSeedState.get(url);
    const usableSeed = isUsableForecastSeedSnapshot(seedSnapshot)
      ? seedSnapshot
      : isUsableForecastSeedSnapshot(storedSeed)
        ? storedSeed
        : null;
    const currentUrl = normalizeMatchUrlKey(location.href);
    if (url && url === currentUrl) {
      const currentSnapshot = buildBsportsfanSnapshot("inline-current");
      if (!isUsableForecastSeedSnapshot(currentSnapshot)) {
        if (usableSeed) {
          return usableSeed;
        }
        throw new Error(describeMissingPlayers(currentSnapshot));
      }
      return currentSnapshot;
    }

    if (usableSeed) {
      return usableSeed;
    }

    const errors = [];
    try {
      const fetchedSnapshot = await fetchBsportsfanPageSnapshot(url, options);
      if (isUsableForecastSeedSnapshot(fetchedSnapshot)) {
        return fetchedSnapshot;
      }
      errors.push(describeMissingPlayers(fetchedSnapshot));
    } catch (error) {
      errors.push(`fetch: ${stringifyError(error)}`);
    }

    throw new Error(errors.filter(Boolean).join("; ") || "Игроки не распознаны");
  }

  function isInlineForecastRunCurrent(matchUrl, runId) {
    const state = inlineForecastState.get(matchUrl);
    return Boolean(state && state.runId === runId && state.status === "loading");
  }

  function evaluateCurrentStartPair(context = {}) {
    const telegramContext = buildPrematchTelegramContext(context);
    const blockedLeague = isPrematchTelegramBlockedLeagueName(telegramContext.leagueName);
    const shadowOnlyLeague = isPrematchTelegramShadowOnlyLeagueName(telegramContext.leagueName);
    const leagueMode = blockedLeague
      ? "blocked"
      : shadowOnlyLeague
        ? "tt-cup-shadow"
        : "production";
    const players = Array.isArray(context && context.players) ? context.players.slice(0, 2) : [];
    const profiles = players.map(buildMatchStartRuleProfile);
    const evaluator = globalThis.LvrStartMatchRule && globalThis.LvrStartMatchRule.evaluate;
    const evaluation = typeof evaluator === "function"
      ? evaluator({ profiles, players: players.map((player) => player && player.name || "") })
      : {
          ruleId: MATCH_START_RULE_ID,
          eligible: false,
          reason: "start-evaluator-missing",
          sideIndex: null,
          scores: [],
          inputHash: ""
        };
    const historySelectedSideIndex = evaluation.sideIndex === 0 || evaluation.sideIndex === 1
      ? evaluation.sideIndex
      : null;
    const livePointCorrectionEvaluator = globalThis.LvrStartMatchRule
      && globalThis.LvrStartMatchRule.applyLivePointDeficitCorrection;
    const livePointCorrection = typeof livePointCorrectionEvaluator === "function"
      ? livePointCorrectionEvaluator({
          selectedSideIndex: historySelectedSideIndex,
          deliveryEntryState: context && context.deliveryEntryState
        })
      : {
          ruleId: "",
          threshold: -4,
          historySideIndex: historySelectedSideIndex,
          finalSideIndex: historySelectedSideIndex,
          applied: false,
          reason: "live-point-correction-missing",
          selectedPointLead: null,
          leftPoints: null,
          rightPoints: null
        };
    const decisionInputHashEvaluator = globalThis.LvrStartMatchRule
      && globalThis.LvrStartMatchRule.fingerprintDecision;
    const decisionInputHash = typeof decisionInputHashEvaluator === "function"
      ? decisionInputHashEvaluator({
          profiles,
          selectedSideIndex: historySelectedSideIndex,
          deliveryEntryState: context && context.deliveryEntryState
        })
      : "";
    const selectedSideIndex = livePointCorrection.finalSideIndex === 0
      || livePointCorrection.finalSideIndex === 1
      ? livePointCorrection.finalSideIndex
      : null;
    const selectedPlayer = selectedSideIndex === null
      ? ""
      : players[selectedSideIndex] && players[selectedSideIndex].name || "";
    const pairRegimeEvaluator = globalThis.LvrVerifiedPairRegimeV1
      && globalThis.LvrVerifiedPairRegimeV1.evaluate;
    const pairRegime = typeof pairRegimeEvaluator === "function"
      ? pairRegimeEvaluator({
          profiles,
          selectedSideIndex: historySelectedSideIndex,
          pointWindowSize: evaluation.pointWindowSize,
          relativeAgreementScore: evaluation.sideCorrection && evaluation.sideCorrection.agreementScore,
          latestPbpReversal: evaluation.sideCorrection && evaluation.sideCorrection.latestReversal,
          leagueName: telegramContext.leagueName
        })
      : {
          protocolId: MATCH_START_PAIR_PROTOCOL.id || "",
          gateId: MATCH_START_PAIR_GATE_ID,
          selectorFormulaId: evaluation.formulaId || "",
          dataReady: false,
          eligible: false,
          formulaAccepted: false,
          moderateAccepted: false,
          signalMode: "rejected",
          accepted: false,
          reason: "production-pbp-filter-missing",
          leagueClass: leagueMode,
          selectedSideIndex: historySelectedSideIndex,
          pointWindowSize: evaluation.pointWindowSize,
          inputHash: "",
          sumWithinLimit: false,
          countsUnequal: false
        };
    const scores = [0, 1].map((index) => evaluation.scores && evaluation.scores[index] || {});
    const histories = players.map((player) => summarizePrematchTwoSetScoreHistory(player && player.scoreHistory));
    const points = players.map((player) => player && player.pointProfile || {});
    return {
      telegramContext,
      blockedLeague,
      shadowOnlyLeague,
      leagueMode,
      players,
      profiles,
      evaluation,
      historySelectedSideIndex,
      livePointCorrection,
      decisionInputHash,
      selectedSideIndex,
      selectedPlayer,
      pairRegime,
      scores,
      histories,
      points
    };
  }

  function buildInlineForecastDecision(context = {}) {
    const {
      telegramContext,
      blockedLeague,
      shadowOnlyLeague,
      leagueMode,
      profiles,
      evaluation,
      historySelectedSideIndex,
      livePointCorrection,
      decisionInputHash,
      selectedSideIndex,
      selectedPlayer,
      pairRegime,
      scores,
      histories,
      points
    } = evaluateCurrentStartPair(context);
    const startEligibility = explainMatchStartForecastEligibility(context);
    const productionPairRegimeAccepted = Boolean(
      pairRegime
      && pairRegime.eligible === true
      && pairRegime.accepted === true
      && pairRegime.selectedSideIndex === historySelectedSideIndex
    );
    const action = !blockedLeague
      && startEligibility.accepted
      && evaluation.eligible
      && selectedPlayer
      && productionPairRegimeAccepted
      && !shadowOnlyLeague
      ? "forecast"
      : "pass";
    const reason = action === "forecast"
      ? pairRegime.reason || evaluation.reason
      : blockedLeague
        ? "лига исключена: " + (telegramContext.leagueName || "blocked")
        : !startEligibility.accepted
          ? startEligibility.reason
        : shadowOnlyLeague && evaluation.eligible
            ? "tt-cup-shadow-only"
            : evaluation.eligible && selectedPlayer && !productionPairRegimeAccepted
              ? pairRegime.reason || "collapse-combination-rejected"
            : !selectedPlayer && evaluation.eligible
              ? "игрок выбранной стороны не распознан"
              : evaluation.reason;
    const features = {
      sideIndex: selectedSideIndex ?? "",
      leagueName: telegramContext.leagueName || "",
      startMatchRuleId: MATCH_START_RULE_ID,
      startMatchAccepted: evaluation.eligible ? 1 : 0,
      startMatchSelectedSideIndex: selectedSideIndex ?? "",
      startMatchHistorySelectedSideIndex: historySelectedSideIndex ?? "",
      startMatchBaseSelectedSideIndex: evaluation.baseSideIndex === 0 || evaluation.baseSideIndex === 1
        ? evaluation.baseSideIndex
        : "",
      startMatchLivePointCorrectionRuleId: livePointCorrection.ruleId || "",
      startMatchLivePointCorrectionApplied: livePointCorrection.applied ? 1 : 0,
      startMatchLivePointCorrectionThreshold: finiteNumberOrNull(livePointCorrection.threshold) ?? "",
      startMatchLivePointCorrectionSelectedLead: finiteNumberOrNull(
        livePointCorrection.selectedPointLead
      ) ?? "",
      startMatchLivePointCorrectionLeftPoints: finiteNumberOrNull(livePointCorrection.leftPoints) ?? "",
      startMatchLivePointCorrectionRightPoints: finiteNumberOrNull(livePointCorrection.rightPoints) ?? "",
      startMatchLivePointCorrectionReason: livePointCorrection.reason || "",
      startMatchSideCorrectionApplied: evaluation.sideCorrection && evaluation.sideCorrection.applied ? 1 : 0,
      startMatchSideCorrectionReason: evaluation.sideCorrection && evaluation.sideCorrection.reason || "",
      startMatchRelativeAgreementScore: finiteNumberOrNull(
        evaluation.sideCorrection && evaluation.sideCorrection.agreementScore
      ) ?? "",
      startMatchLatestPbpReversal: evaluation.sideCorrection && evaluation.sideCorrection.latestReversal ? 1 : 0,
      startMatchInputHash: evaluation.inputHash || "",
      startMatchDecisionInputHash: decisionInputHash,
      startMatchFormulaId: evaluation.formulaId || "",
      startMatchCoverageTier: evaluation.coverageTier || "none",
      startMatchPointWindowSize: finiteNumberOrNull(evaluation.pointWindowSize) ?? "",
      startMatchPairRegimeProtocolId: pairRegime.protocolId || "",
      startMatchPairRegimeGateId: pairRegime.gateId || "",
      startMatchPairRegimeSelectorFormulaId: pairRegime.selectorFormulaId || "",
      startMatchPairRegimeInputHash: pairRegime.inputHash || "",
      startMatchPairRegimeSelectedSideIndex: pairRegime.selectedSideIndex === 0 || pairRegime.selectedSideIndex === 1
        ? pairRegime.selectedSideIndex
        : "",
      startMatchPairRegimePointWindowSize: finiteNumberOrNull(pairRegime.pointWindowSize) ?? "",
      startMatchPairRegimeDataReady: pairRegime.dataReady ? 1 : 0,
      startMatchPairRegimeEligible: pairRegime.eligible ? 1 : 0,
      startMatchPairRegimeFormulaAccepted: pairRegime.formulaAccepted ? 1 : 0,
      startMatchPairRegimeModerateAccepted: pairRegime.moderateAccepted ? 1 : 0,
      startMatchSignalMode: pairRegime.signalMode || "rejected",
      startMatchPairRegimeAccepted: pairRegime.accepted ? 1 : 0,
      startMatchPairRegimeLeftCollapseCount: finiteNumberOrNull(pairRegime.leftCollapseCount) ?? "",
      startMatchPairRegimeRightCollapseCount: finiteNumberOrNull(pairRegime.rightCollapseCount) ?? "",
      startMatchPairRegimeCollapseSum: finiteNumberOrNull(pairRegime.collapseSum) ?? "",
      startMatchPairRegimeCollapseDifference: finiteNumberOrNull(pairRegime.collapseDifference) ?? "",
      startMatchPairRegimeSumWithinLimit: pairRegime.sumWithinLimit ? 1 : 0,
      startMatchPairRegimeCountsUnequal: pairRegime.countsUnequal ? 1 : 0,
      startMatchPairRegimeCollapseAccepted: pairRegime.collapseAccepted ? 1 : 0,
      startMatchPairRegimeSelectedStrengthScore: finiteNumberOrNull(pairRegime.selectedStrengthScore) ?? "",
      startMatchPairRegimeOpponentStrengthScore: finiteNumberOrNull(pairRegime.opponentStrengthScore) ?? "",
      startMatchPairRegimeSelectedStrengthEdge: finiteNumberOrNull(pairRegime.selectedStrengthEdge) ?? "",
      startMatchPairRegimeStrongSelectedStrengthException: pairRegime.strongSelectedStrengthException ? 1 : 0,
      startMatchPairRegimeSelectedHistoryMatches: finiteNumberOrNull(pairRegime.selectedHistoryMatches) ?? "",
      startMatchPairRegimeSelectedHistoryWindowMatches: finiteNumberOrNull(pairRegime.selectedHistoryWindowMatches) ?? "",
      startMatchPairRegimeSelectedHistorySetSharePct: finiteNumberOrNull(pairRegime.selectedHistorySetSharePct) ?? "",
      startMatchPairRegimeSelectedHistoryWindowReady: pairRegime.selectedHistoryWindowReady ? 1 : 0,
      startMatchPairRegimeSelectedHistorySetShareException: pairRegime.selectedHistorySetShareException ? 1 : 0,
      startMatchPairRegimeSelectedFreshForm3Score: finiteNumberOrNull(pairRegime.selectedFreshForm3Score) ?? "",
      startMatchPairRegimeOpponentFreshForm3Score: finiteNumberOrNull(pairRegime.opponentFreshForm3Score) ?? "",
      startMatchPairRegimeSelectedHistory5WindowMatches: finiteNumberOrNull(pairRegime.selectedHistory5WindowMatches) ?? "",
      startMatchPairRegimeOpponentHistory5WindowMatches: finiteNumberOrNull(pairRegime.opponentHistory5WindowMatches) ?? "",
      startMatchPairRegimeSelectedHistory5SetSharePct: finiteNumberOrNull(pairRegime.selectedHistory5SetSharePct) ?? "",
      startMatchPairRegimeOpponentHistory5SetSharePct: finiteNumberOrNull(pairRegime.opponentHistory5SetSharePct) ?? "",
      startMatchPairRegimeSelectedHistory5SetShareEdge: finiteNumberOrNull(pairRegime.selectedHistory5SetShareEdge) ?? "",
      startMatchPairRegimeSelectedHistory8PerformancePct: finiteNumberOrNull(pairRegime.selectedHistory8PerformancePct) ?? "",
      startMatchPairRegimeOpponentHistory8PerformancePct: finiteNumberOrNull(pairRegime.opponentHistory8PerformancePct) ?? "",
      startMatchPairRegimeRelativeHistoryWindowReady: pairRegime.relativeHistoryWindowReady ? 1 : 0,
      startMatchPairRegimeSelectedFreshAtOrAboveHistory8: pairRegime.selectedFreshAtOrAboveHistory8 ? 1 : 0,
      startMatchPairRegimeOpponentFreshAtOrAboveHistory8: pairRegime.opponentFreshAtOrAboveHistory8 ? 1 : 0,
      startMatchPairRegimeRelativeFormSetShareException: pairRegime.relativeFormSetShareException ? 1 : 0,
      startMatchPairRegimeLeagueClass: pairRegime.leagueClass || "",
      startMatchPairRegimeReason: pairRegime.reason || "",
      startMatchProductionGateId: pairRegime.gateId || MATCH_START_PAIR_GATE_ID,
      startMatchProductionAccepted: productionPairRegimeAccepted ? 1 : 0,
      startMatchLeagueMode: leagueMode,
      startMatchLeaguePublishAccepted: leagueMode === "production" && productionPairRegimeAccepted ? 1 : 0,
      startMatchUsesOdds: 0,
      startMatchUsesCurrentScore: 1,
      startMatchProfiles: profiles,
      startMatchLeftStrength: finiteNumberOrNull(scores[0].strength) ?? "",
      startMatchRightStrength: finiteNumberOrNull(scores[1].strength) ?? "",
      startMatchLeftStability: finiteNumberOrNull(scores[0].stability) ?? "",
      startMatchRightStability: finiteNumberOrNull(scores[1].stability) ?? "",
      startMatchLeftForm: finiteNumberOrNull(scores[0].form) ?? "",
      startMatchRightForm: finiteNumberOrNull(scores[1].form) ?? "",
      startMatchLeftHistoryMatches: histories[0].matches,
      startMatchRightHistoryMatches: histories[1].matches,
      startMatchLeftPointMatches: finiteNumberOrNull(points[0].pointMatches) ?? "",
      startMatchRightPointMatches: finiteNumberOrNull(points[1].pointMatches) ?? "",
      leftFreshForm3Score: histories[0].form3Score ?? "",
      rightFreshForm3Score: histories[1].form3Score ?? "",
      leftStrengthScore: finiteNumberOrNull(scores[0].strength) ?? "",
      rightStrengthScore: finiteNumberOrNull(scores[1].strength) ?? "",
      startMatchReason: reason
    };
    return {
      action,
      source: "match-start-history-pbp",
      model: "history-pbp-4factor-start-only",
      modelVersion: MATCH_START_RULE_ID,
      coverageRuleId: MATCH_START_RULE_ID,
      noMarketCoverage: true,
      reason,
      playerName: selectedPlayer,
      sideIndex: selectedSideIndex,
      betType: "two_sets",
      oddsMeaning: "none",
      probabilityMeaning: "comparative history/PBP index; not a calibrated probability",
      probability: "",
      score: selectedSideIndex === null ? "" : finiteNumberOrNull(scores[selectedSideIndex].overall) ?? "",
      leagueName: telegramContext.leagueName,
      signalMode: pairRegime.signalMode || "rejected",
      features
    };
  }

  function buildArchiveCurrentForecastSummary(context = {}) {
    const {
      evaluation,
      selectedSideIndex,
      selectedPlayer,
      pairRegime,
      scores,
      histories
    } = evaluateCurrentStartPair(context);
    const modelReady = Boolean(evaluation.eligible && selectedPlayer && pairRegime.dataReady);
    const qualified = Boolean(modelReady && pairRegime.moderateAccepted);
    const message = !evaluation.eligible
      ? evaluation.reason
      : !selectedPlayer
        ? "Игрок выбранной стороны не распознан."
        : !pairRegime.dataReady
          ? pairRegime.reason
          : qualified
            ? "Боевой фильтр подтверждён."
            : pairRegime.reason;
    return {
      status: qualified ? "ready" : modelReady ? "pass" : "not-ready",
      source: "match-start-history-pbp",
      model: "history-pbp-4factor-start-only",
      modelVersion: MATCH_START_RULE_ID,
      sideIndex: selectedSideIndex,
      player: selectedPlayer,
      label: qualified ? "2+ сета · боевой фильтр" : "Нет сигнала",
      title: qualified
        ? `${selectedPlayer}: выбран текущей моделью и прошёл боевой фильтр`
        : message,
      message,
      features: {
        leftFreshForm3Score: histories[0].form3Score ?? "",
        rightFreshForm3Score: histories[1].form3Score ?? "",
        leftStrengthScore: finiteNumberOrNull(scores[0].strength) ?? "",
        rightStrengthScore: finiteNumberOrNull(scores[1].strength) ?? "",
        pointWindowSize: finiteNumberOrNull(pairRegime.pointWindowSize) ?? "",
        leftCollapseCount: finiteNumberOrNull(pairRegime.leftCollapseCount) ?? "",
        rightCollapseCount: finiteNumberOrNull(pairRegime.rightCollapseCount) ?? "",
        collapseSum: finiteNumberOrNull(pairRegime.collapseSum) ?? "",
        pairRegimeFormulaAccepted: pairRegime.formulaAccepted ? 1 : 0
      }
    };
  }

  function buildMatchStartRuleProfile(player) {
    const history = summarizePrematchTwoSetScoreHistory(player && player.scoreHistory);
    const point = player && player.pointProfile && typeof player.pointProfile === "object"
      ? player.pointProfile
      : {};
    return {
      identityKey: normalizeText(point.playerKey || ""),
      history: {
        matches: history.matches,
        freshForm3Score: history.form3Score,
        latestOwnSets: history.latestOwnSets,
        failureStreak: history.failureStreak,
        windows: history.windows
      },
      point: {
        matches: Number(point.pointMatches || 0),
        latest: point.latest || null,
        windows: point.windows || {}
      }
    };
  }

  function finiteNumberOrNull(value) {
    if (value === null || value === undefined || value === "") {
      return null;
    }
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function summarizePrematchTwoSetScoreHistory(history) {
    const rows = [];
    for (const item of Array.isArray(history) ? history : []) {
      const scoreMatch = String(item && (item.score || item.finalScore) || "").match(/(\d+)\s*-\s*(\d+)/);
      const hasOwnSets = item && item.ownSets !== null && item.ownSets !== undefined && item.ownSets !== "";
      const hasOpponentSets = item && item.opponentSets !== null && item.opponentSets !== undefined && item.opponentSets !== "";
      const score = scoreMatch ? [Number(scoreMatch[1]), Number(scoreMatch[2])] : null;
      const ownSets = hasOwnSets && Number.isFinite(Number(item.ownSets))
        ? Number(item.ownSets)
        : score
          ? Number(score[0])
          : NaN;
      const opponentSets = hasOpponentSets && Number.isFinite(Number(item.opponentSets))
        ? Number(item.opponentSets)
        : score
          ? Number(score[1])
          : NaN;
      if (!Number.isFinite(ownSets) || !Number.isFinite(opponentSets)) {
        continue;
      }
      rows.push({
        ownSets,
        opponentSets,
        failedTwoSets: ownSets < 2,
        tookTwoSets: ownSets >= 2,
        dateTs: Number(item && item.dateTs || 0),
        identityMatched: item && item.identityMatched === true,
        opponentProfileId: String(item && item.opponentProfileId || "")
      });
    }
    const recent = rows.slice(0, 5);
    const windows = Object.fromEntries([8, 5, 3].map((size) => [
      size,
      summarizePrematchScoreWindow(rows.slice(0, size))
    ]));
    const recentOwnSets = recent.map((row) => row.ownSets);
    const meanOwnSets = recentOwnSets.length
      ? recentOwnSets.reduce((sum, value) => sum + value, 0) / recentOwnSets.length
      : null;
    const ownSetsDeviation = meanOwnSets === null
      ? null
      : Math.sqrt(recentOwnSets.reduce(
        (sum, value) => sum + (value - meanOwnSets) ** 2,
        0
      ) / recentOwnSets.length);
    const downsideRms = recentOwnSets.length
      ? Math.sqrt(recentOwnSets.reduce(
        (sum, value) => sum + Math.max(0, 2 - value) ** 2,
        0
      ) / recentOwnSets.length)
      : null;
    let failureStreak = 0;
    for (const row of recent) {
      if (row.tookTwoSets) {
        break;
      }
      failureStreak += 1;
    }
    return {
      matches: rows.length,
      windows,
      tookTwoSetsLast8: windows[8].tookTwo,
      failedTwoSetsLast5: countPrematchTwoSetRecent(rows, 5, "failedTwoSets"),
      tookTwoSetsLast5: countPrematchTwoSetRecent(rows, 5, "tookTwoSets"),
      form3Score: calculateFreshForm3Score(rows),
      latestOwnSets: rows.length ? rows[0].ownSets : null,
      recentOwnSetsLast5: recentOwnSets,
      recentOpponentSetsLast5: recent.map((row) => row.opponentSets),
      recentDateTsLast5: recent.map((row) => row.dateTs),
      recentOpponentProfileIdsLast5: recent.map((row) => row.opponentProfileId),
      identityMatchedLast5: recent.filter((row) => row.identityMatched).length,
      sweepLossesLast5: recentOwnSets.filter((value) => value === 0).length,
      failureStreak,
      setFloorLast5: meanOwnSets === null || ownSetsDeviation === null
        ? null
        : roundDecimal(meanOwnSets - ownSetsDeviation, 4),
      downsideFloorLast5: meanOwnSets === null || downsideRms === null
        ? null
        : roundDecimal(meanOwnSets - downsideRms, 4)
    };
  }

  function summarizePrematchScoreWindow(rows) {
    const list = Array.isArray(rows) ? rows : [];
    const matches = list.length;
    const tookTwo = list.filter((row) => row && row.tookTwoSets).length;
    const sweepLosses = list.filter((row) => Number(row && row.ownSets) === 0).length;
    const oneSetLosses = list.filter((row) => Number(row && row.ownSets) === 1).length;
    const setsFor = list.reduce((sum, row) => sum + Number(row && row.ownSets || 0), 0);
    const setsAgainst = list.reduce((sum, row) => sum + Number(row && row.opponentSets || 0), 0);
    const setTotal = setsFor + setsAgainst;
    const performanceScore = matches
      ? list.reduce((sum, row) => sum + scoreFreshFormRow(row), 0) / matches
      : null;
    return {
      matches,
      tookTwo,
      tookTwoPct: matches ? roundOneDecimal(100 * tookTwo / matches) : null,
      underTwo: matches - tookTwo,
      sweepLosses,
      oneSetLosses,
      setsFor,
      setsAgainst,
      setSharePct: setTotal ? roundOneDecimal(100 * setsFor / setTotal) : null,
      averageOwnSets: matches ? roundDecimal(setsFor / matches, 4) : null,
      performancePct: performanceScore === null ? null : roundOneDecimal(performanceScore)
    };
  }

  function calculateFreshForm3Score(rows) {
    const list = (Array.isArray(rows) ? rows : []).slice(0, FRESH_FORM3_WEIGHTS.length);
    if (!list.length) {
      return null;
    }
    let total = 0;
    let weightTotal = 0;
    for (let index = 0; index < list.length; index += 1) {
      const value = scoreFreshFormRow(list[index]);
      if (!Number.isFinite(value)) {
        continue;
      }
      const weight = Number(FRESH_FORM3_WEIGHTS[index] || 0);
      total += value * weight;
      weightTotal += weight;
    }
    return weightTotal > 0 ? Math.round(total / weightTotal) : null;
  }

  function scoreFreshFormRow(row) {
    const ownSets = Number(row && row.ownSets);
    const opponentSets = Number(row && row.opponentSets);
    if (!Number.isFinite(ownSets) || !Number.isFinite(opponentSets)) {
      return NaN;
    }
    if (ownSets >= 3) {
      return 100;
    }
    if (ownSets === 2) {
      return 75;
    }
    if (ownSets === 1) {
      return 35;
    }
    if (ownSets === 0) {
      return 5;
    }
    return clamp(20 + ownSets * 25 + (ownSets - opponentSets) * 8, 0, 100);
  }

  function countPrematchTwoSetRecent(rows, limit, key) {
    return rows.slice(0, limit).reduce((sum, row) => sum + (row[key] ? 1 : 0), 0);
  }

  async function collectLatestMatchUrlsByPlayer(players, currentSnapshot, options = {}) {
    const result = {
      urls: [],
      playerPages: [],
      fallback: false
    };
    const byUrl = new Map();
    const matchesPerPlayer = getArchiveMatchesPerPlayer(options);
    const scoreHistoryMatchesPerPlayer = getArchiveScoreHistoryMatchesPerPlayer(options, matchesPerPlayer);
    const profileDelayMs = Number.isFinite(Number(options.fetchDelayMs))
      ? Math.max(0, Number(options.fetchDelayMs))
      : 80;

    await runWithConcurrency(players.slice(0, 2), 2, async (playerName) => {
      const link = findPlayerLink(playerName, currentSnapshot.playerLinks);
      if (!link || !link.url) {
        result.playerPages.push({ player: playerName, url: "", matches: 0, error: "Страница игрока не найдена" });
        return;
      }

      try {
        if (!options.silent) {
          emitArchiveProgress(`Открываю страницу игрока: ${playerName}`, {
            players: [],
            fetched: 0,
            skipped: 0
          }, result.urls.length);
        }

        const currentMatchKey = normalizeMatchUrlKey(currentSnapshot.url);
        const availableMatches = (await fetchPlayerResultMatches(link.url, {
          deadlineAt: Number(options.deadlineAt || 0),
          requestPriority: options.requestPriority
        }))
          .filter((match) => match && match.url && isBsportsfanMatchResultUrl(match.url))
          .filter((match) => normalizeMatchUrlKey(match.url) !== currentMatchKey)
          .filter((match) => isArchiveMatchBeforeTarget(match, options.beforeDateTs))
          .filter((match) => scoreArchiveCandidate(match.url, `${(match.names || []).join(" ")} ${match.text || ""}`, [playerName]) > 0)
          .sort(sortMatchesByFreshness);
        const matches = availableMatches.slice(0, matchesPerPlayer);
        const scoreHistory = availableMatches
          .slice(0, scoreHistoryMatchesPerPlayer)
          .map((match) => buildPlayerScoreHistoryItem(playerName, match))
          .filter(Boolean);

        result.playerPages.push({
          player: playerName,
          url: link.url,
          matches: Math.min(matches.length, matchesPerPlayer),
          candidates: availableMatches.length,
          scoreHistoryMatches: scoreHistory.length,
          scoreHistory,
          selected: matches.map((match) => ({
            url: match.url,
            names: Array.isArray(match.names) ? match.names.slice(0, 2) : [],
            date: match.date || "",
            dateTs: Number(match.dateTs || 0),
            result: match.result || "",
            score: match.score || "",
            text: normalizeText(match.text || "").slice(0, 160)
          }))
        });
        for (const match of matches) {
          const owner = {
            name: playerName,
            url: link.url,
            id: getBsportsfanPlayerId(link.url)
          };
          const matchKey = normalizeMatchUrlKey(match.url);
          if (!byUrl.has(matchKey)) {
            byUrl.set(matchKey, {
              url: matchKey,
              date: match.date || "",
              dateTs: Number(match.dateTs || 0),
              names: Array.isArray(match.names) ? match.names.slice(0, 2) : [],
              playerLinks: Array.isArray(match.playerLinks) ? match.playerLinks.slice(0, 2) : [],
              owners: [owner]
            });
          } else {
            const existing = byUrl.get(matchKey);
            if (!Array.isArray(existing.owners)) {
              existing.owners = [];
            }
            if (!existing.owners.some((item) => item && item.id && item.id === owner.id)) {
              existing.owners.push(owner);
            }
          }
        }
      } catch (error) {
        result.playerPages.push({
          player: playerName,
          url: link.url,
          matches: 0,
          error: stringifyError(error),
          errorCode: String(error && error.code || ""),
          retryAfterMs: Math.max(0, Number(error && error.retryAfterMs || 0) || 0)
        });
      }

      if (profileDelayMs > 0) {
        await delay(profileDelayMs);
      }
    });

    result.urls = Array.from(byUrl.values())
      .sort(sortMatchesByFreshness);
    if (result.urls.length) {
      return result;
    }

    if (Number(options.beforeDateTs || 0) > 0) {
      result.fallback = false;
      return result;
    }

    result.fallback = true;
    result.urls = (await collectArchiveCandidateUrls(players, currentSnapshot, options)).slice(0, matchesPerPlayer * 2);
    return result;
  }

  function buildPlayerScoreHistoryItem(playerName, match) {
    const parsedScore = parseFinishedScoreParts(match && match.score || extractScoreFromText(match && match.text || ""));
    if (!parsedScore) {
      return null;
    }

    const names = Array.isArray(match && match.names) ? match.names.slice(0, 2).map(cleanName) : [];
    const sideIndex = findPlayerSideIndex(playerName, names);
    const rawResult = normalizeText(match && match.result || "").toUpperCase();
    let result = rawResult === "W" || rawResult === "L" ? rawResult : "";
    let ownSets = null;
    let opponentSets = null;

    if (result) {
      ownSets = result === "W"
        ? Math.max(parsedScore.left, parsedScore.right)
        : Math.min(parsedScore.left, parsedScore.right);
      opponentSets = result === "W"
        ? Math.min(parsedScore.left, parsedScore.right)
        : Math.max(parsedScore.left, parsedScore.right);
    } else if (sideIndex === 0 || sideIndex === 1) {
      ownSets = sideIndex === 0 ? parsedScore.left : parsedScore.right;
      opponentSets = sideIndex === 0 ? parsedScore.right : parsedScore.left;
      result = ownSets > opponentSets ? "W" : "L";
    }

    if (!result || !Number.isFinite(Number(ownSets)) || !Number.isFinite(Number(opponentSets))) {
      return null;
    }

    const playerLinks = Array.isArray(match && match.playerLinks) ? match.playerLinks.slice(0, 2) : [];
    const opponentSideIndex = sideIndex === 0 ? 1 : sideIndex === 1 ? 0 : -1;
    const opponentName = opponentSideIndex >= 0 ? names[opponentSideIndex] || "" : "";
    const opponentLink = opponentName ? findPlayerLink(opponentName, playerLinks) : null;
    return {
      result,
      score: `${ownSets}-${opponentSets}`,
      ownSets,
      opponentSets,
      date: normalizeText(match && match.date || ""),
      dateTs: Number(match && match.dateTs || 0),
      matchUrl: match && match.url ? normalizeUrl(match.url) : "",
      sideIndex: sideIndex === 0 || sideIndex === 1 ? sideIndex : null,
      identityMatched: sideIndex === 0 || sideIndex === 1,
      opponentName,
      opponentProfileId: getBsportsfanPlayerId(opponentLink && opponentLink.url || "")
    };
  }

  function attachScoreHistoryToArchivePlayers(players, playerPages) {
    const pages = Array.isArray(playerPages) ? playerPages : [];
    for (const player of Array.isArray(players) ? players : []) {
      const page = pages.find((item) => archivePlayerBelongsToOwner(player, {
        name: item && item.player || "",
        url: item && item.url || "",
        id: getBsportsfanPlayerId(item && item.url || "")
      }));
      const scoreHistory = Array.isArray(page && page.scoreHistory)
        ? page.scoreHistory.slice(0, PROFILE_SCORE_HISTORY_MATCHES)
        : [];
      player.scoreHistory = scoreHistory;
    }
  }

  function shouldCollectCandidatePointProfiles(archive, options = {}) {
    if (options.collectCandidatePointProfiles === false) {
      return false;
    }
    const entryState = archive && archive.requestEntryState || {};
    const relevantMatchStart = isMatchStartForecastState(entryState);
    if (!isStrictPrematchEntryState(entryState) && !relevantMatchStart) {
      return false;
    }
    const players = Array.isArray(archive && archive.players) ? archive.players.slice(0, 2) : [];
    return players.length === 2 && players.every((player) => (
      summarizePrematchTwoSetScoreHistory(player && player.scoreHistory).matches >= START_SCORE_HISTORY_MIN_MATCHES
    ));
  }

  async function attachPrematchPointProfiles(players, playerPages, archive, options = {}) {
    ensurePrematchPointCacheLoaded();
    const list = Array.isArray(players) ? players.slice(0, 2) : [];
    const pages = Array.isArray(playerPages) ? playerPages : [];
    const profiles = await Promise.all(list.map(async (player) => {
      const page = pages.find((item) => archivePlayerBelongsToOwner(player, {
        name: item && item.player || "",
        url: item && item.url || "",
        id: getBsportsfanPlayerId(item && item.url || "")
      }));
      try {
        return await getPrematchPointProfile(player, page, options);
      } catch (error) {
        addArchiveDiagnostic(
          archive,
          player && player.profileUrl || "",
          `${player && player.name || "player"} point profile: ${stringifyError(error)}`
        );
        if (isBsportsfanProtectionError(error)) {
          throw error;
        }
        return null;
      }
    }));
    profiles.forEach((profile, index) => {
      if (list[index]) {
        list[index].pointProfile = profile;
      }
    });
    return {
      status: profiles.some(Boolean) ? "ready" : "missing",
      requestedPlayers: list.length,
      readyPlayers: profiles.filter(Boolean).length,
      cacheHits: profiles.filter((profile) => profile && profile.cacheStatus === "hit").length,
      pointMatches: profiles.map((profile) => Number(profile && profile.pointMatches || 0))
    };
  }

  async function getPrematchPointProfile(player, page, options = {}) {
    const candidates = (Array.isArray(page && page.selected) ? page.selected : [])
      .filter((item) => item && item.url)
      .slice(0, PREMATCH_POINT_PROFILE_CANDIDATES);
    if (!player || !candidates.length) {
      return null;
    }
    const cacheKey = getPrematchPointPlayerKey(player);
    const signature = candidates.map((item) => normalizeMatchUrlKey(item.url)).filter(Boolean).join("|");
    if (!cacheKey || !signature) {
      return null;
    }
    const now = Date.now();
    const cached = prematchPointProfileCache.get(cacheKey);
    if (
      cached
      && cached.signature === signature
      && now - Number(cached.capturedAt || 0) <= getPrematchPointProfileCacheTtl(cached.profile)
      && cached.profile
    ) {
      setBoundedMapValue(prematchPointProfileCache, cacheKey, cached, PREMATCH_POINT_PROFILE_CACHE_MAX_ENTRIES);
      return {
        ...cached.profile,
        cacheStatus: "hit",
        cacheAgeMs: Math.max(0, now - Number(cached.capturedAt || now))
      };
    }

    const inFlightKey = `${cacheKey}|${signature}`;
    const existingInFlight = prematchPointProfileInFlight.get(inFlightKey);
    if (
      existingInFlight
      && existingInFlight.promise
      && Date.now() < Number(existingInFlight.deadlineAt || 0)
    ) {
      return existingInFlight.promise;
    }
    if (existingInFlight) {
      prematchPointProfileInFlight.delete(inFlightKey);
    }
    const deadlineAt = normalizeOperationDeadline(
      options.deadlineAt,
      INLINE_FORECAST_COLLECTION_TIMEOUT_MS
    );
    const inFlight = {
      startedAt: Date.now(),
      deadlineAt,
      promise: null
    };
    const promise = buildPrematchPointProfile(player, candidates, signature, {
      deadlineAt,
      requestPriority: options.requestPriority,
      shouldYield: options.shouldYield
    }).then((profile) => {
      if (!profile) {
        return null;
      }
      const entry = { capturedAt: Date.now(), signature, profile };
      setBoundedMapValue(prematchPointProfileCache, cacheKey, entry, PREMATCH_POINT_PROFILE_CACHE_MAX_ENTRIES);
      schedulePrematchPointCachePersist();
      return { ...profile, cacheStatus: "miss", cacheAgeMs: 0 };
    }).finally(() => {
      if (prematchPointProfileInFlight.get(inFlightKey) === inFlight) {
        prematchPointProfileInFlight.delete(inFlightKey);
      }
    });
    inFlight.promise = promise;
    prematchPointProfileInFlight.set(inFlightKey, inFlight);
    return promise;
  }

  function getPrematchPointPlayerKey(player) {
    const id = player && (player.profileId || getBsportsfanPlayerId(player.profileUrl));
    return id ? `id:${id}` : `name:${normalizeSearchText(player && player.name || "")}`;
  }

  function getPrematchPointProfileCacheTtl(profile) {
    return Number(profile && profile.pointMatches || 0) >= PREMATCH_POINT_PROFILE_MATCHES
      ? PREMATCH_POINT_PROFILE_CACHE_TTL_MS
      : PREMATCH_POINT_PROFILE_PARTIAL_CACHE_TTL_MS;
  }

  async function buildPrematchPointProfile(player, candidates, signature, options = {}) {
    const matches = [];
    for (const candidate of candidates) {
      throwIfInlineForecastShouldYield(options, "point-profile");
      const remainingMs = getOperationRemainingMs(options.deadlineAt);
      if (remainingMs <= 250) {
        break;
      }
      if (
        matches.length >= 3
        && remainingMs < PREMATCH_POINT_ENRICH_MIN_REMAINING_MS
      ) {
        break;
      }
      try {
        const compactMatch = await getCompactPrematchPointMatch(candidate.url, options);
        const sideIndex = findCompactPrematchPointMatchSide(compactMatch, player);
        if (sideIndex === 0 || sideIndex === 1) {
          matches.push(compactMatch.sides[sideIndex]);
        }
      } catch (_) {
        // A missing historical chart should not cancel the whole pair.
      }
      // The production rule consumes a common five-match window (or three when
      // five valid charts do not exist). Reading the remaining candidates after
      // five valid charts only delays a first-set decision without changing it.
      if (matches.length >= PREMATCH_POINT_PROFILE_MATCHES) {
        break;
      }
    }
    if (!matches.length) {
      return null;
    }
    return summarizePrematchPointProfile(player, matches, signature);
  }

  async function getCompactPrematchPointMatch(url, options = {}) {
    ensurePrematchPointCacheLoaded();
    const cacheKey = normalizeMatchUrlKey(url);
    const now = Date.now();
    const cached = prematchPointMatchCache.get(cacheKey);
    if (cached && cached.match && now - Number(cached.capturedAt || 0) <= PREMATCH_POINT_MATCH_CACHE_TTL_MS) {
      setBoundedMapValue(prematchPointMatchCache, cacheKey, cached, PREMATCH_POINT_MATCH_CACHE_MAX_ENTRIES);
      return cached.match;
    }
    const existingInFlight = prematchPointMatchInFlight.get(cacheKey);
    if (
      existingInFlight
      && existingInFlight.promise
      && Date.now() < Number(existingInFlight.deadlineAt || 0)
    ) {
      return existingInFlight.promise;
    }
    if (existingInFlight) {
      prematchPointMatchInFlight.delete(cacheKey);
    }
    const deadlineAt = normalizeOperationDeadline(
      options.deadlineAt,
      PREMATCH_POINT_FETCH_TIMEOUT_MS
    );
    const inFlight = {
      startedAt: Date.now(),
      deadlineAt,
      promise: null
    };
    const promise = schedulePrematchPointFetch(async () => {
      throwIfInlineForecastShouldYield(options, "point-fetch");
      const snapshot = await fetchBsportsfanSnapshotUncached(cacheKey, {
        deadlineAt,
        requestPriority: options.requestPriority
      });
      const match = compactPrematchPointMatchSnapshot(snapshot);
      if (!match) {
        throw new Error("point snapshot is incomplete");
      }
      setBoundedMapValue(
        prematchPointMatchCache,
        cacheKey,
        { capturedAt: Date.now(), match },
        PREMATCH_POINT_MATCH_CACHE_MAX_ENTRIES
      );
      return match;
    }, { deadlineAt, priority: options.requestPriority }).finally(() => {
      if (prematchPointMatchInFlight.get(cacheKey) === inFlight) {
        prematchPointMatchInFlight.delete(cacheKey);
      }
    });
    inFlight.promise = promise;
    prematchPointMatchInFlight.set(cacheKey, inFlight);
    return promise;
  }

  function schedulePrematchPointFetch(task, options = {}) {
    return new Promise((resolve, reject) => {
      prematchPointFetchQueue.push({
        task,
        priority: options.priority,
        deadlineAt: normalizeOperationDeadline(
          options.deadlineAt,
          PREMATCH_POINT_FETCH_TIMEOUT_MS
        ),
        resolve,
        reject
      });
      sortPrematchPointFetchQueue();
      drainPrematchPointFetchQueue();
    });
  }

  function sortPrematchPointFetchQueue() {
    const policy = globalThis.LvrPipelinePolicy;
    if (!policy || typeof policy.compareRequestJobs !== "function") {
      return;
    }
    prematchPointFetchQueue.sort(policy.compareRequestJobs);
  }

  function drainPrematchPointFetchQueue() {
    while (prematchPointFetchActive < PREMATCH_POINT_FETCH_CONCURRENCY && prematchPointFetchQueue.length) {
      const job = prematchPointFetchQueue.shift();
      const remainingMs = getOperationRemainingMs(job && job.deadlineAt);
      if (!job || remainingMs <= 0) {
        if (job) {
          job.reject(createDeadlineError("historical point fetch", 0));
        }
        continue;
      }
      prematchPointFetchActive += 1;
      raceWithRuntimeDeadline(
        Promise.resolve().then(job.task),
        Math.min(PREMATCH_POINT_FETCH_TIMEOUT_MS, remainingMs),
        "historical point fetch"
      )
        .then(job.resolve, job.reject)
        .finally(() => {
          prematchPointFetchActive = Math.max(0, prematchPointFetchActive - 1);
          drainPrematchPointFetchQueue();
        });
    }
  }

  function compactPrematchPointMatchSnapshot(snapshot) {
    const players = Array.isArray(snapshot && snapshot.players) ? snapshot.players.slice(0, 2).map(cleanName) : [];
    const playerLinks = alignPlayerLinksToPlayers(
      players,
      Array.isArray(snapshot && snapshot.playerLinks) ? snapshot.playerLinks : []
    );
    const stats = getServeReturnStats(snapshot && snapshot.serveReturn);
    const setScores = (Array.isArray(snapshot && snapshot.setScores) && snapshot.setScores.length
      ? snapshot.setScores
      : inferSetScoresFromPointSets(snapshot && snapshot.pointSets))
      .filter((score) => isCompletedTableTennisSet(score && score.left, score && score.right));
    if (players.length < 2 || playerLinks.length < 2 || stats.length < 2 || !setScores.length) {
      return null;
    }
    const late = summarizePrematchLatePoints(snapshot && snapshot.pointSets);
    const compactPointSets = compactArchivePointSets(snapshot && snapshot.pointSets);
    return {
      matchUrl: normalizeMatchUrlKey(snapshot && snapshot.url || ""),
      players,
      playerIds: [0, 1].map((index) => getBsportsfanPlayerId(playerLinks[index] && playerLinks[index].url || "")),
      sides: [0, 1].map((sideIndex) => compactPrematchPointMatchSide(
        sideIndex,
        stats[sideIndex],
        setScores,
        late[sideIndex],
        summarizeArchiveLateLeads(compactPointSets, setScores, sideIndex)
      ))
    };
  }

  function compactPrematchPointMatchSide(sideIndex, stats, setScores, late, lateLead) {
    const ownScores = setScores.map((score) => Number(sideIndex === 0 ? score.left : score.right));
    const opponentScores = setScores.map((score) => Number(sideIndex === 0 ? score.right : score.left));
    const ownSetWins = ownScores.reduce((sum, value, index) => sum + (value > opponentScores[index] ? 1 : 0), 0);
    const firstSetLost = ownScores.length > 0 && ownScores[0] < opponentScores[0];
    return {
      serveReceiveSum: finiteNumberOrNull(stats && stats.serveReceiveSum),
      pointsRate: finiteNumberOrNull(stats && stats.pointsRate),
      clutchWon: Number(stats && stats.clutchWon || 0),
      clutchTotal: Number(stats && stats.clutchTotal || 0),
      maxLostStreak: Number(stats && stats.maxLostStreak || 0),
      breakClutchWon: Number(stats && stats.breakClutchWon || 0),
      breakClutchTotal: Number(stats && stats.breakClutchTotal || 0),
      comebackWon: Number(stats && stats.comebackWon || 0),
      comebackTotal: Number(stats && stats.comebackTotal || 0),
      collapseCount: Number(stats && stats.collapseCount || 0),
      pointMarginSum: ownScores.reduce((sum, value, index) => sum + value - opponentScores[index], 0),
      setCount: ownScores.length,
      setWins: ownSetWins,
      lateLeadsHeld: Number(lateLead && lateLead.held || 0),
      lateLeadChances: Number(lateLead && lateLead.chances || 0),
      firstSetLost: firstSetLost ? 1 : 0,
      firstSetLossNoTwo: firstSetLost && ownSetWins < 2 ? 1 : 0,
      lateWon: Number(late && late.won || 0),
      lateTotal: Number(late && late.total || 0)
    };
  }

  function summarizePrematchLatePoints(pointSets) {
    const result = [{ won: 0, total: 0 }, { won: 0, total: 0 }];
    for (const set of Array.isArray(pointSets) ? pointSets : []) {
      const pointWinners = buildPointWinnersForSet(set);
      for (const point of Array.isArray(pointWinners && pointWinners.points) ? pointWinners.points : []) {
        const before = Array.isArray(point && point.scoreBefore) ? point.scoreBefore : [];
        const winnerIndex = Number(point && point.winnerIndex);
        if (Math.max(Number(before[0] || 0), Number(before[1] || 0)) < 8 || (winnerIndex !== 0 && winnerIndex !== 1)) {
          continue;
        }
        result[0].total += 1;
        result[1].total += 1;
        result[winnerIndex].won += 1;
      }
    }
    return result;
  }

  function findCompactPrematchPointMatchSide(match, player) {
    if (!match || !player) {
      return null;
    }
    const playerId = String(player.profileId || getBsportsfanPlayerId(player.profileUrl) || "");
    const matchIds = (Array.isArray(match.playerIds) ? match.playerIds : [])
      .slice(0, 2)
      .map((id) => String(id || ""));
    if (playerId) {
      const byId = matchIds.findIndex((id) => id === playerId);
      if (byId === 0 || byId === 1) {
        return byId;
      }
      if (matchIds.length === 2 && matchIds.every(Boolean)) {
        return null;
      }
    }
    const byName = findPlayerSideIndex(player.name || "", Array.isArray(match.players) ? match.players : []);
    return byName === 0 || byName === 1 ? byName : null;
  }

  function summarizePrematchPointProfile(player, matches, signature) {
    const list = (Array.isArray(matches) ? matches : []).slice(0, PREMATCH_POINT_PROFILE_CANDIDATES);
    const latest = summarizePrematchPointWindow(list.slice(0, 1));
    const windows = Object.fromEntries([8, 5, 3].map((size) => [
      size,
      summarizePrematchPointWindow(list.slice(0, size))
    ]));
    return {
      schemaVersion: 4,
      playerKey: getPrematchPointPlayerKey(player),
      signature,
      pointMatches: list.length,
      latest,
      windows
    };
  }

  function summarizePrematchPointWindow(matches) {
    const list = Array.isArray(matches) ? matches : [];
    const weights = buildRecencyWeights(list.length);
    const clutchWon = sumPrematchPointMetric(list, "clutchWon");
    const clutchTotal = sumPrematchPointMetric(list, "clutchTotal");
    const breakClutchWon = sumPrematchPointMetric(list, "breakClutchWon");
    const breakClutchTotal = sumPrematchPointMetric(list, "breakClutchTotal");
    const comebackWon = sumPrematchPointMetric(list, "comebackWon");
    const comebackTotal = sumPrematchPointMetric(list, "comebackTotal");
    const collapseCount = sumPrematchPointMetric(list, "collapseCount");
    const formScore = weightedAverage(list.map((match) => match.serveReceiveSum), weights, 100);
    const pointsScore = weightedAverage(list.map((match) => match.pointsRate), weights, 50);
    const clutchScore = buildRateScore(clutchWon, clutchTotal, 6);
    const breakClutchScore = buildRateScore(breakClutchWon, breakClutchTotal, 5);
    const comebackScore = buildRateScore(comebackWon, comebackTotal, 8);
    const pointMarginSum = sumPrematchPointMetric(list, "pointMarginSum");
    const setCount = sumPrematchPointMetric(list, "setCount");
    const firstSetLosses = sumPrematchPointMetric(list, "firstSetLost");
    const firstSetLossNoTwo = sumPrematchPointMetric(list, "firstSetLossNoTwo");
    const lateWon = sumPrematchPointMetric(list, "lateWon");
    const lateTotal = sumPrematchPointMetric(list, "lateTotal");
    const setWins = sumPrematchPointMetric(list, "setWins");
    const lateLeadsHeld = sumPrematchPointMetric(list, "lateLeadsHeld");
    const lateLeadChances = sumPrematchPointMetric(list, "lateLeadChances");
    return {
      matches: list.length,
      strengthScore: roundOneDecimal(
        (formScore - 100) * 0.45
        + (pointsScore - 50) * 0.45
        + (clutchScore - 50) * 0.2
        + (breakClutchScore - 50) * 0.14
        + (comebackScore - 50) * 0.1
        - collapseCount
      ),
      avgSetPointMargin: setCount ? roundDecimal(pointMarginSum / setCount, 4) : null,
      setSharePct: roundOneDecimal(((setWins + 4) / (setCount + 8)) * 100),
      pointsRate: roundOneDecimal(pointsScore),
      clutchRate: roundOneDecimal(clutchScore),
      maxLostStreak: list.reduce((maximum, match) => Math.max(maximum, Number(match && match.maxLostStreak || 0)), 0),
      closeLeadLostPct: setCount ? roundOneDecimal(100 * collapseCount / setCount) : null,
      latePointRate: lateTotal ? roundOneDecimal((lateWon / lateTotal) * 100) : null,
      lateLeadsHeld,
      lateLeadChances,
      lateLeadHoldPct: roundOneDecimal(((lateLeadsHeld + 2.1) / (lateLeadChances + 3)) * 100),
      firstSetLosses,
      firstSetLossNoTwo,
      firstSetLossNoTwoRate: firstSetLosses ? roundOneDecimal((firstSetLossNoTwo / firstSetLosses) * 100) : null,
      collapseCount,
      collapseRatePct: list.length ? roundOneDecimal(100 * collapseCount / list.length) : null
    };
  }

  function sumPrematchPointMetric(matches, key) {
    return (Array.isArray(matches) ? matches : []).reduce((sum, match) => sum + Number(match && match[key] || 0), 0);
  }

  function ensurePrematchPointCacheLoaded() {
    if (prematchPointCacheLoaded) {
      return;
    }
    prematchPointCacheLoaded = true;
    try {
      const raw = window.localStorage && window.localStorage.getItem(PREMATCH_POINT_CACHE_STORAGE_KEY);
      const stored = raw ? JSON.parse(raw) : null;
      if (Number(stored && stored.version || 0) !== PREMATCH_POINT_CACHE_STORAGE_VERSION) {
        return;
      }
      const now = Date.now();
      for (const [key, entry] of Array.isArray(stored && stored.profiles) ? stored.profiles : []) {
        if (entry && now - Number(entry.capturedAt || 0) <= getPrematchPointProfileCacheTtl(entry.profile)) {
          setBoundedMapValue(prematchPointProfileCache, key, entry, PREMATCH_POINT_PROFILE_CACHE_MAX_ENTRIES);
        }
      }
      for (const [key, entry] of Array.isArray(stored && stored.matches) ? stored.matches : []) {
        if (entry && now - Number(entry.capturedAt || 0) <= PREMATCH_POINT_MATCH_CACHE_TTL_MS) {
          setBoundedMapValue(prematchPointMatchCache, key, entry, PREMATCH_POINT_MATCH_CACHE_MAX_ENTRIES);
        }
      }
    } catch (_) {
      // Cache is optional; malformed page storage must not block forecasts.
    }
  }

  function schedulePrematchPointCachePersist() {
    if (prematchPointCachePersistTimer) {
      return;
    }
    prematchPointCachePersistTimer = window.setTimeout(() => {
      prematchPointCachePersistTimer = 0;
      try {
        if (window.localStorage) {
          window.localStorage.setItem(PREMATCH_POINT_CACHE_STORAGE_KEY, JSON.stringify({
            version: PREMATCH_POINT_CACHE_STORAGE_VERSION,
            profiles: Array.from(prematchPointProfileCache.entries()),
            matches: Array.from(prematchPointMatchCache.entries())
          }));
        }
      } catch (_) {
        // A full localStorage only disables persistence; in-memory cache remains valid.
      }
    }, 1000);
  }

  function parseFinishedScoreParts(score) {
    const match = normalizeText(score).match(/^([0-5])\s*-\s*([0-5])$/);
    if (!match || Number(match[1]) === Number(match[2])) {
      return null;
    }
    return {
      left: Number(match[1]),
      right: Number(match[2])
    };
  }

  function findPlayerLink(playerName, playerLinks) {
    const matches = (Array.isArray(playerLinks) ? playerLinks : [])
      .filter((link) => areStrictPlayerNamesEqual(playerName, link && link.name || ""));
    return matches.length === 1 ? matches[0] : null;
  }

  function alignPlayerLinksToPlayers(players, playerLinks) {
    const names = Array.isArray(players) ? players.slice(0, 2) : [];
    const links = Array.isArray(playerLinks) ? playerLinks : [];
    if (names.length < 2) {
      return [];
    }
    const aligned = names.map((name) => {
      const matches = links.filter((link) => areStrictPlayerNamesEqual(name, link && link.name || ""));
      return matches.length === 1 ? matches[0] : null;
    });
    const ids = aligned.map((link) => String(link && (link.id || getBsportsfanPlayerId(link.url)) || ""));
    if (aligned.some((link) => !link) || ids.some((id) => !id) || ids[0] === ids[1]) {
      return [];
    }
    return aligned;
  }

  function sortMatchesByFreshness(left, right) {
    const leftTs = Number(left && left.dateTs || 0);
    const rightTs = Number(right && right.dateTs || 0);
    if (leftTs !== rightTs) {
      return rightTs - leftTs;
    }
    return Number(left && left.order || 0) - Number(right && right.order || 0);
  }

  function isArchiveMatchBeforeTarget(match, beforeDateTs) {
    const cutoff = Number(beforeDateTs || 0);
    if (!Number.isFinite(cutoff) || cutoff <= 0) {
      return true;
    }

    const ts = Number(match && match.dateTs || 0);
    return Number.isFinite(ts) && ts > 0 && ts < cutoff;
  }

  function findInsufficientProfilePages(playerPages, matchesPerPlayer) {
    const required = Math.max(1, Number(matchesPerPlayer || ARCHIVE_MATCHES_PER_PLAYER));
    const pages = Array.isArray(playerPages) ? playerPages.slice(0, 2) : [];
    if (pages.length < 2) {
      return [
        ...pages,
        ...Array.from({ length: 2 - pages.length }, (_, index) => ({
          player: `#${pages.length + index + 1}`,
          url: "",
          matches: 0,
          error: "Профиль игрока не найден"
        }))
      ];
    }
    return pages.filter((page) => Number(page && page.matches || 0) < required);
  }

  function isRetryableProfileCollectionError(value) {
    const message = normalizeText(value || "");
    return Boolean(message) && /challenge|protection|cooldown|rate.?limit|один момент|just a moment|timeout|timed out|runtime|iframe|network|HTTP|fetch|worker|expired/i.test(message);
  }

  async function fetchListDocumentCandidates(byUrl, players, options = {}) {
    const listUrl = new URL("/cip/table-tennis", location.origin).href;
    const html = await fetchText(listUrl, options);
    const doc = parseHtmlDocument(html);
    addArchiveCandidatesFromDocument(byUrl, doc, listUrl, players);
  }

  async function fetchLinkedPlayerPagesCandidates(byUrl, playerLinks, players, options = {}) {
    const links = (Array.isArray(playerLinks) ? playerLinks : [])
      .filter((link) => link && link.url)
      .slice(0, 2);
    for (const link of links) {
      throwIfInlineForecastShouldYield(options, "fallback-player-page");
      const html = await fetchText(link.url, options);
      const doc = parseHtmlDocument(html);
      addArchiveCandidatesFromDocument(byUrl, doc, link.url, [link.name || "", ...(players || [])].filter(Boolean));
      await delay(80);
    }
  }

  function addArchiveCandidatesFromDocument(byUrl, doc, baseUrl, players) {
    const links = Array.from(doc.querySelectorAll(BSF_MATCH_LINK_SELECTOR));
    for (const link of links) {
      const text = normalizeText(link.textContent || link.closest(".card,.card-hover,tr,li,div")?.textContent || "");
      const url = normalizeUrl(link.getAttribute("href") || link.href || "", baseUrl);
      addArchiveCandidate(byUrl, url, text, players);
    }
  }

  function addArchiveCandidate(byUrl, rawUrl, text, players) {
    const url = normalizeUrl(rawUrl);
    if (!url || byUrl.has(url) || !isBsportsfanMatchResultUrl(url)) {
      return;
    }

    const score = scoreArchiveCandidate(url, text, players);
    if (score <= 0) {
      return;
    }

    byUrl.set(url, { url, score, text });
  }

  function scoreArchiveCandidate(url, text, players) {
    const haystack = normalizeSearchText(`${url} ${text}`);
    let score = 0;
    for (const player of players || []) {
      const aliases = buildNameAliases(player);
      if (aliases.some((alias) => alias && haystack.includes(alias))) {
        score += 10;
      }
    }
    if (isBsportsfanMatchResultUrl(url)) {
      score += 2;
    }
    return score;
  }

  async function fetchBsportsfanSnapshot(url) {
    const cacheKey = normalizeUrl(url);
    if (matchSnapshotCache.has(cacheKey)) {
      return matchSnapshotCache.get(cacheKey);
    }
    const promise = fetchBsportsfanSnapshotUncached(url).catch((error) => {
      matchSnapshotCache.delete(cacheKey);
      throw error;
    });
    setBoundedMapValue(matchSnapshotCache, cacheKey, promise, NETWORK_CACHE_MAX_ENTRIES);
    return promise;
  }

  async function fetchBsportsfanSnapshotUncached(url, options = {}) {
    let frameError = "";
    try {
      const frameSnapshot = await loadBsportsfanSnapshotInFrame(url, options);
      if (isUsableMatchSnapshot(frameSnapshot)) {
        return frameSnapshot;
      }
      frameError = describeMissingGraph(frameSnapshot, null);
    } catch (error) {
      if (isBsportsfanProtectionError(error) && !isBsportsfanChallengeError(error)) {
        throw error;
      }
      frameError = stringifyError(error);
    }

    try {
      const html = await fetchText(url, {
        ...options,
        cacheTtlMs: Math.max(
          Number(options.cacheTtlMs || 0) || 0,
          PREMATCH_POINT_MATCH_CACHE_TTL_MS
        )
      });
      const doc = parseHtmlDocument(html);
      const snapshot = buildBsportsfanSnapshotFromDocument(doc, url, "archive-fetch-fallback");
      if (isBsportsfanChallengeSnapshot(snapshot)) {
        fetchTextCache.delete(normalizeUrl(url));
        throw createBsportsfanChallengeError(describeMissingPlayers(snapshot));
      }
      if (isUsableMatchSnapshot(snapshot)) {
        return snapshot;
      }
      throw new Error(describeMissingGraph(snapshot, doc));
    } catch (error) {
      if (isBsportsfanProtectionError(error)) {
        throw error;
      }
      throw new Error(`iframe ${frameError}; fetch ${stringifyError(error)}`);
    }
  }

  async function fetchBsportsfanPageSnapshot(url, options = {}) {
    const cacheKey = normalizeUrl(url);
    if (seedSnapshotCache.has(cacheKey)) {
      return seedSnapshotCache.get(cacheKey);
    }
    const promise = fetchBsportsfanPageSnapshotUncached(url, options).catch((error) => {
      seedSnapshotCache.delete(cacheKey);
      throw error;
    });
    setBoundedMapValue(seedSnapshotCache, cacheKey, promise, NETWORK_CACHE_MAX_ENTRIES);
    return promise;
  }

  async function fetchBsportsfanPageSnapshotUncached(url, options = {}) {
    let frameError = "";
    try {
      const frameSnapshot = await loadBsportsfanPageSnapshotInFrame(url, options);
      if (isUsableForecastSeedSnapshot(frameSnapshot)) {
        return frameSnapshot;
      }
      frameError = describeMissingPlayers(frameSnapshot);
    } catch (error) {
      if (isBsportsfanProtectionError(error) && !isBsportsfanChallengeError(error)) {
        throw error;
      }
      frameError = stringifyError(error);
    }

    try {
      const html = await fetchText(url, {
        ...options,
        cacheTtlMs: Math.max(
          Number(options.cacheTtlMs || 0) || 0,
          30 * 1000
        )
      });
      const doc = parseHtmlDocument(html);
      const snapshot = buildBsportsfanSeedSnapshotFromDocument(doc, url, "page-fetch-fallback");
      if (isBsportsfanChallengeSnapshot(snapshot)) {
        fetchTextCache.delete(normalizeUrl(url));
        throw createBsportsfanChallengeError(describeMissingPlayers(snapshot));
      }
      if (isUsableForecastSeedSnapshot(snapshot)) {
        return snapshot;
      }
      throw new Error(describeMissingPlayers(snapshot));
    } catch (error) {
      if (isBsportsfanProtectionError(error)) {
        throw error;
      }
      throw new Error(`iframe ${frameError}; fetch ${stringifyError(error)}`);
    }
  }

  async function fetchBsportsfanOddsMarket(url, context = {}) {
    const oddsUrl = getBsportsfanOddsUrl(url);
    if (!oddsUrl) {
      return {
        source: "bsportsfan-odds",
        status: "missing",
        url: "",
        error: "odds url not found"
      };
    }

    if (context && context.forceRefresh === true) {
      oddsMarketCache.delete(oddsUrl);
      oddsMarketNegativeCache.delete(oddsUrl);
    }

    if (oddsMarketCache.has(oddsUrl)) {
      return oddsMarketCache.get(oddsUrl);
    }

    const negativeCache = oddsMarketNegativeCache.get(oddsUrl);
    if (negativeCache && Date.now() < Number(negativeCache.expiresAt || 0)) {
      return negativeCache.market;
    }
    if (negativeCache) {
      oddsMarketNegativeCache.delete(oddsUrl);
    }

    const promise = fetchBsportsfanOddsMarketUncached(oddsUrl, context).then((market) => {
      if (!market || market.status !== "ready") {
        oddsMarketCache.delete(oddsUrl);
        setBoundedMapValue(oddsMarketNegativeCache, oddsUrl, {
          expiresAt: Date.now() + ODDS_MARKET_NEGATIVE_CACHE_MS,
          market
        }, NETWORK_CACHE_MAX_ENTRIES);
      } else {
        oddsMarketNegativeCache.delete(oddsUrl);
      }
      return market;
    }).catch((error) => {
      oddsMarketCache.delete(oddsUrl);
      throw error;
    });
    setBoundedMapValue(oddsMarketCache, oddsUrl, promise, NETWORK_CACHE_MAX_ENTRIES);
    return promise;
  }

  async function fetchBsportsfanOddsMarketUncached(oddsUrl, context = {}) {
    let frameMarket = null;
    if (!context || context.allowIframe !== false) {
      try {
        frameMarket = await loadBsportsfanOddsMarketInFrame(oddsUrl, context);
        if (frameMarket && frameMarket.status === "ready") {
          return {
            ...frameMarket,
            source: "bsportsfan-odds-frame"
          };
        }
      } catch (error) {
        if (isBsportsfanProtectionError(error) && !isBsportsfanChallengeError(error)) {
          throw error;
        }
        frameMarket = {
          source: "bsportsfan-odds-frame",
          status: "error",
          url: oddsUrl,
          matchDateTs: Number(context && context.matchDateTs || 0),
          preferredSource: "",
          preferred: null,
          opening: null,
          matchStart: null,
          last: null,
          rows: [],
          error: stringifyError(error)
        };
      }
    }

    let fetchMarket = null;
    try {
      const html = await fetchText(oddsUrl, {
        ...context,
        allowIframe: false
      });
      const doc = parseHtmlDocument(html);
      fetchMarket = parseOddsMarketFromDocument(doc, oddsUrl, context);
      if (fetchMarket && fetchMarket.status === "ready") {
        return fetchMarket;
      }
    } catch (error) {
      if (isBsportsfanProtectionError(error)) {
        throw error;
      }
      fetchMarket = {
        source: "bsportsfan-odds",
        status: "error",
        url: oddsUrl,
        matchDateTs: Number(context && context.matchDateTs || 0),
        preferredSource: "",
        preferred: null,
        opening: null,
        matchStart: null,
        last: null,
        rows: [],
        error: stringifyError(error)
      };
    }

    if (context && context.allowIframe === false) {
      return fetchMarket || {
        source: "bsportsfan-odds",
        status: "missing",
        url: oddsUrl,
        matchDateTs: Number(context && context.matchDateTs || 0),
        preferredSource: "",
        preferred: null,
        opening: null,
        matchStart: null,
        last: null,
        rows: []
      };
    }
    return frameMarket || fetchMarket || {
      source: "bsportsfan-odds",
      status: "missing",
      url: oddsUrl,
      matchDateTs: Number(context && context.matchDateTs || 0),
      preferredSource: "",
      preferred: null,
      opening: null,
      matchStart: null,
      last: null,
      rows: []
    };
  }

  function loadBsportsfanOddsMarketInFrame(oddsUrl, context = {}) {
    return new Promise((resolve, reject) => {
      const frame = document.createElement("iframe");
      let settled = false;
      let pollTimer = 0;
      const startedAt = Date.now();
      const timeoutMs = getBoundedOperationTimeoutMs(9000, context.deadlineAt);
      let lastMarket = null;
      let cancelRuntimeDeadline = () => {};
      let navigationLeaseToken = "";

      const finish = (error, market) => {
        if (settled) {
          return;
        }
        settled = true;
        cancelRuntimeDeadline();
        if (pollTimer) {
          window.clearTimeout(pollTimer);
        }
        frame.remove();
        if (navigationLeaseToken) {
          releaseBsportsfanRequestSlot(navigationLeaseToken);
          navigationLeaseToken = "";
        }
        if (error) {
          reject(error);
          return;
        }
        resolve(market);
      };
      if (timeoutMs <= 0) {
        finish(createDeadlineError("odds iframe", 0));
        return;
      }
      cancelRuntimeDeadline = scheduleRuntimeDeadline(timeoutMs, (deadlineError) => {
        finish(deadlineError || createDeadlineError("odds iframe", timeoutMs));
      });

      const poll = () => {
        try {
          const doc = frame.contentDocument;
          const win = frame.contentWindow;
          if (!doc) {
            throw new Error("iframe document empty");
          }

          if (isBsportsfanDocumentLiveSessionExpired(doc)) {
            finish(createBsportsfanLiveSessionExpiredError("BsportsFan odds iframe live session expired"));
            return;
          }
          wakePageInFrame(doc, win);
          if (isBsportsfanDocumentChallenge(doc)) {
            finish(createBsportsfanChallengeError(
              "BsportsFan odds iframe returned a security challenge",
              { report: false }
            ));
            return;
          }
          const market = parseOddsMarketFromDocument(doc, oddsUrl, context);
          if (market) {
            lastMarket = market;
          }
          if (market && market.status === "ready") {
            finish(null, market);
            return;
          }

          if (Date.now() - startedAt >= timeoutMs) {
            finish(null, lastMarket || {
              source: "bsportsfan-odds-frame",
              status: "missing",
              url: oddsUrl,
              matchDateTs: Number(context && context.matchDateTs || 0),
              preferredSource: "",
              preferred: null,
              opening: null,
              matchStart: null,
              last: null,
              rows: []
            });
            return;
          }
        } catch (error) {
          if (Date.now() - startedAt >= timeoutMs) {
            finish(error);
            return;
          }
        }

        pollTimer = window.setTimeout(poll, 250);
      };

      frame.addEventListener("load", () => {
        pollTimer = window.setTimeout(poll, 250);
      }, { once: true });
      frame.style.cssText = "position:fixed;width:1280px;height:900px;left:-2000px;top:0;border:0;opacity:0;pointer-events:none;";
      acquireBsportsfanRequestSlot(oddsUrl, {
        deadlineAt: context.deadlineAt,
        requestPriority: context.requestPriority
      }).then((lease) => {
        const token = normalizeText(lease && lease.token || "");
        if (settled) {
          releaseBsportsfanRequestSlot(token);
          return;
        }
        navigationLeaseToken = token;
        frame.src = oddsUrl;
        (document.body || document.documentElement).appendChild(frame);
        pollTimer = window.setTimeout(poll, 700);
      }).catch((error) => finish(error));
    });
  }

  function isUsableMatchSnapshot(snapshot) {
    return Boolean(
      snapshot
      && snapshot.serveReturn
      && Array.isArray(snapshot.serveReturn.stats)
      && snapshot.serveReturn.stats.length >= 2
    );
  }

  function isUsableForecastSeedSnapshot(snapshot) {
    return Boolean(
      snapshot
      && Array.isArray(snapshot.players)
      && snapshot.players.length >= 2
      && Array.isArray(snapshot.playerLinks)
      && snapshot.playerLinks.length >= 2
    );
  }

  function describeMissingPlayers(snapshot) {
    if (isBsportsfanChallengeSnapshot(snapshot)) {
      return "BsportsFan отдал проверочную страницу «Один момент…» вместо матча";
    }
    return `Игроки не распознаны: players ${snapshot && snapshot.players ? snapshot.players.length : 0}, links ${snapshot && snapshot.playerLinks ? snapshot.playerLinks.length : 0}, title ${snapshot && snapshot.title || "-"}`;
  }

  function describeMissingGraph(snapshot, doc) {
    const scripts = doc
      ? Array.from(doc.scripts || []).filter((script) => /series|highcharts|set\d+/i.test(script.textContent || "")).length
      : 0;
    return `График не распознан: sets ${snapshot && snapshot.pointSets ? snapshot.pointSets.length : 0}, scripts ${scripts}, title ${snapshot && snapshot.title || "-"}`;
  }

  async function fetchPlayerResultMatches(url, options = {}) {
    const cacheKey = normalizeUrl(url);
    const cached = playerMatchesCache.get(cacheKey);
    if (
      cached
      && cached.promise
      && Date.now() < Number(cached.deadlineAt || 0)
    ) {
      return cached.promise;
    }
    if (cached && Array.isArray(cached.matches) && Date.now() - Number(cached.ts || 0) <= PLAYER_MATCHES_CACHE_TTL_MS) {
      setBoundedMapValue(playerMatchesCache, cacheKey, cached, NETWORK_CACHE_MAX_ENTRIES);
      return cached.matches;
    }
    if (cached && cached.promise) {
      playerMatchesCache.delete(cacheKey);
    }
    const deadlineAt = normalizeOperationDeadline(
      options.deadlineAt,
      BSPORTSFAN_TEXT_FETCH_TIMEOUT_MS
    );
    const inFlight = {
      ts: Date.now(),
      deadlineAt,
      promise: null
    };
    const promise = fetchPlayerResultMatchesUncached(url, {
      ...options,
      deadlineAt
    })
      .then((matches) => {
        if (playerMatchesCache.get(cacheKey) === inFlight) {
          setBoundedMapValue(
            playerMatchesCache,
            cacheKey,
            { ts: Date.now(), matches },
            NETWORK_CACHE_MAX_ENTRIES
          );
        }
        return matches;
      })
      .catch((error) => {
        if (playerMatchesCache.get(cacheKey) === inFlight) {
          playerMatchesCache.delete(cacheKey);
        }
        throw error;
      });
    inFlight.promise = promise;
    setBoundedMapValue(playerMatchesCache, cacheKey, inFlight, NETWORK_CACHE_MAX_ENTRIES);
    return promise;
  }

  async function fetchPlayerResultMatchesUncached(url, options = {}) {
    let frameError = "";
    if (options.allowIframe !== false) {
      try {
        const frameMatches = await loadPlayerResultMatchesInFrame(url, options);
        if (frameMatches.length) {
          return frameMatches;
        }
        frameError = "results 0";
      } catch (error) {
        if (isBsportsfanProtectionError(error) && !isBsportsfanChallengeError(error)) {
          throw error;
        }
        frameError = stringifyError(error);
      }
    }

    let fetchError = "";
    try {
      const html = await fetchText(url, {
        ...options,
        cacheTtlMs: Math.max(
          Number(options.cacheTtlMs || 0) || 0,
          PLAYER_MATCHES_CACHE_TTL_MS
        )
      });
      const doc = parseHtmlDocument(html);
      const matches = parsePlayerResultMatches(doc, url);
      if (matches.length) {
        return matches;
      }
      const challengeSnapshot = {
        title: normalizeText(doc.title || ""),
        textSample: normalizeText(doc.body && doc.body.textContent || "").slice(0, 500)
      };
      if (isBsportsfanChallengeSnapshot(challengeSnapshot)) {
        throw createBsportsfanChallengeError("BsportsFan player page returned a security challenge");
      }
      fetchError = `results 0, title ${normalizeText(doc.title || "-")}`;
    } catch (error) {
      if (isBsportsfanProtectionError(error)) {
        throw error;
      }
      fetchError = stringifyError(error);
    }

    if (options.allowIframe === false) {
      throw createBsportsfanProfileUnavailableError(`fetch ${fetchError}`);
    }
    throw createBsportsfanProfileUnavailableError(
      `iframe ${frameError || "results 0"}; fetch ${fetchError || "results 0"}`
    );
  }

  function createBsportsfanProfileUnavailableError(message) {
    const error = new Error(`BsportsFan player profile unavailable: ${normalizeText(message || "results 0")}`);
    error.code = "bsportsfan-profile-unavailable";
    error.retryable = true;
    error.retryBudgetExempt = true;
    error.retryAfterMs = INLINE_FORECAST_ERROR_RETRY_MS;
    return error;
  }

  function loadPlayerResultMatchesInFrame(url, options = {}) {
    return new Promise((resolve, reject) => {
      const frame = document.createElement("iframe");
      let settled = false;
      let pollTimer = 0;
      const startedAt = Date.now();
      const timeoutMs = getBoundedOperationTimeoutMs(9000, options.deadlineAt);
      let cancelRuntimeDeadline = () => {};
      let navigationLeaseToken = "";

      const finish = (error, matches) => {
        if (settled) {
          return;
        }
        settled = true;
        cancelRuntimeDeadline();
        if (pollTimer) {
          window.clearTimeout(pollTimer);
        }
        frame.remove();
        if (navigationLeaseToken) {
          releaseBsportsfanRequestSlot(navigationLeaseToken);
          navigationLeaseToken = "";
        }
        if (error) {
          reject(error);
          return;
        }
        resolve(matches || []);
      };
      if (timeoutMs <= 0) {
        finish(createDeadlineError("player results iframe", 0));
        return;
      }
      cancelRuntimeDeadline = scheduleRuntimeDeadline(timeoutMs, (deadlineError) => {
        finish(deadlineError || new Error(`player results timed out after ${timeoutMs} ms`));
      });

      const poll = () => {
        try {
          const doc = frame.contentDocument;
          const win = frame.contentWindow;
          if (!doc) {
            throw new Error("iframe document empty");
          }

          if (isBsportsfanDocumentLiveSessionExpired(doc)) {
            finish(createBsportsfanLiveSessionExpiredError("BsportsFan player iframe live session expired"));
            return;
          }
          wakePageInFrame(doc, win);
          if (isBsportsfanDocumentChallenge(doc)) {
            finish(createBsportsfanChallengeError(
              "BsportsFan player iframe returned a security challenge",
              { report: false }
            ));
            return;
          }
          const matches = parsePlayerResultMatches(doc, url);
          if (matches.length) {
            finish(null, matches);
            return;
          }

          if (Date.now() - startedAt >= timeoutMs) {
            finish(new Error(`results 0, title ${normalizeText(doc.title || "-")}`));
            return;
          }
        } catch (error) {
          if (Date.now() - startedAt >= timeoutMs) {
            finish(error);
            return;
          }
        }

        pollTimer = window.setTimeout(poll, 250);
      };

      frame.addEventListener("load", () => {
        pollTimer = window.setTimeout(poll, 250);
      }, { once: true });
      frame.style.cssText = "position:fixed;width:1280px;height:900px;left:-2000px;top:0;border:0;opacity:0;pointer-events:none;";
      acquireBsportsfanRequestSlot(url, options).then((lease) => {
        const token = normalizeText(lease && lease.token || "");
        if (settled) {
          releaseBsportsfanRequestSlot(token);
          return;
        }
        navigationLeaseToken = token;
        frame.src = url;
        (document.body || document.documentElement).appendChild(frame);
        pollTimer = window.setTimeout(poll, 700);
      }).catch((error) => finish(error));
    });
  }

  function loadBsportsfanSnapshotInFrame(url, options = {}) {
    return new Promise((resolve, reject) => {
      const frame = document.createElement("iframe");
      let settled = false;
      let pollTimer = 0;
      const startedAt = Date.now();
      const timeoutMs = getBoundedOperationTimeoutMs(9000, options.deadlineAt);
      let cancelRuntimeDeadline = () => {};
      let navigationLeaseToken = "";

      const finish = (error, snapshot) => {
        if (settled) {
          return;
        }
        settled = true;
        cancelRuntimeDeadline();
        if (pollTimer) {
          window.clearTimeout(pollTimer);
        }
        frame.remove();
        if (navigationLeaseToken) {
          releaseBsportsfanRequestSlot(navigationLeaseToken);
          navigationLeaseToken = "";
        }
        if (error) {
          reject(error);
          return;
        }
        resolve(snapshot);
      };
      if (timeoutMs <= 0) {
        finish(createDeadlineError("match snapshot iframe", 0));
        return;
      }
      cancelRuntimeDeadline = scheduleRuntimeDeadline(timeoutMs, (deadlineError) => {
        finish(deadlineError || new Error(`match snapshot timed out after ${timeoutMs} ms`));
      });

      const poll = () => {
        try {
          const doc = frame.contentDocument;
          const win = frame.contentWindow;
          if (!doc) {
            throw new Error("iframe document empty");
          }

          if (isBsportsfanDocumentLiveSessionExpired(doc)) {
            finish(createBsportsfanLiveSessionExpiredError("BsportsFan match iframe live session expired"));
            return;
          }
          wakeLazyChartsInFrame(doc, win);
          const snapshot = buildBsportsfanSnapshotFromDocument(doc, url, "archive-frame");
          if (isBsportsfanChallengeSnapshot(snapshot) || isBsportsfanDocumentChallenge(doc)) {
            finish(createBsportsfanChallengeError(
              "BsportsFan match iframe returned a security challenge",
              { report: false }
            ));
            return;
          }
          const usableSnapshot = isUsableMatchSnapshot(snapshot)
            ? snapshot
            : buildRuntimeChartSnapshot(doc, win, url, "archive-frame-runtime");
          if (isUsableMatchSnapshot(usableSnapshot)) {
            finish(null, usableSnapshot);
            return;
          }

          if (Date.now() - startedAt >= timeoutMs) {
            finish(new Error(describeMissingGraph(usableSnapshot || snapshot, doc)));
            return;
          }
        } catch (error) {
          if (Date.now() - startedAt >= timeoutMs) {
            finish(error);
            return;
          }
        }

        pollTimer = window.setTimeout(poll, 250);
      };

      frame.addEventListener("load", () => {
        pollTimer = window.setTimeout(poll, 250);
      }, { once: true });
      frame.style.cssText = "position:fixed;width:1280px;height:900px;left:-2000px;top:0;border:0;opacity:0;pointer-events:none;";
      acquireBsportsfanRequestSlot(url, options).then((lease) => {
        const token = normalizeText(lease && lease.token || "");
        if (settled) {
          releaseBsportsfanRequestSlot(token);
          return;
        }
        navigationLeaseToken = token;
        frame.src = url;
        (document.body || document.documentElement).appendChild(frame);
        pollTimer = window.setTimeout(poll, 700);
      }).catch((error) => finish(error));
    });
  }

  function loadBsportsfanPageSnapshotInFrame(url, options = {}) {
    return new Promise((resolve, reject) => {
      const frame = document.createElement("iframe");
      let settled = false;
      let pollTimer = 0;
      const startedAt = Date.now();
      const timeoutMs = getBoundedOperationTimeoutMs(9000, options.deadlineAt);
      let cancelRuntimeDeadline = () => {};
      let navigationLeaseToken = "";

      const finish = (error, snapshot) => {
        if (settled) {
          return;
        }
        settled = true;
        cancelRuntimeDeadline();
        if (pollTimer) {
          window.clearTimeout(pollTimer);
        }
        frame.remove();
        if (navigationLeaseToken) {
          releaseBsportsfanRequestSlot(navigationLeaseToken);
          navigationLeaseToken = "";
        }
        if (error) {
          reject(error);
          return;
        }
        resolve(snapshot);
      };
      if (timeoutMs <= 0) {
        finish(createDeadlineError("match page iframe", 0));
        return;
      }
      cancelRuntimeDeadline = scheduleRuntimeDeadline(timeoutMs, (deadlineError) => {
        finish(deadlineError || new Error(`match page timed out after ${timeoutMs} ms`));
      });

      const poll = () => {
        try {
          const doc = frame.contentDocument;
          const win = frame.contentWindow;
          if (!doc) {
            throw new Error("iframe document empty");
          }

          if (isBsportsfanDocumentLiveSessionExpired(doc)) {
            finish(createBsportsfanLiveSessionExpiredError("BsportsFan match page iframe live session expired"));
            return;
          }
          wakePageInFrame(doc, win);
          const snapshot = buildBsportsfanSeedSnapshotFromDocument(doc, url, "page-frame");
          if (isBsportsfanChallengeSnapshot(snapshot) || isBsportsfanDocumentChallenge(doc)) {
            finish(createBsportsfanChallengeError(
              "BsportsFan match page iframe returned a security challenge",
              { report: false }
            ));
            return;
          }
          if (isUsableForecastSeedSnapshot(snapshot)) {
            finish(null, snapshot);
            return;
          }

          if (Date.now() - startedAt >= timeoutMs) {
            finish(new Error(describeMissingPlayers(snapshot)));
            return;
          }
        } catch (error) {
          if (Date.now() - startedAt >= timeoutMs) {
            finish(error);
            return;
          }
        }

        pollTimer = window.setTimeout(poll, 250);
      };

      frame.addEventListener("load", () => {
        pollTimer = window.setTimeout(poll, 250);
      }, { once: true });
      frame.style.cssText = "position:fixed;width:1280px;height:900px;left:-2000px;top:0;border:0;opacity:0;pointer-events:none;";
      acquireBsportsfanRequestSlot(url, options).then((lease) => {
        const token = normalizeText(lease && lease.token || "");
        if (settled) {
          releaseBsportsfanRequestSlot(token);
          return;
        }
        navigationLeaseToken = token;
        frame.src = url;
        (document.body || document.documentElement).appendChild(frame);
        pollTimer = window.setTimeout(poll, 700);
      }).catch((error) => finish(error));
    });
  }

  function wakeLazyChartsInFrame(doc, win) {
    try {
      wakePageInFrame(doc, win);
      const chartNode = doc.querySelector(".highcharts-container,[id*='chart'],[class*='chart']");
      if (chartNode && chartNode.scrollIntoView) {
        chartNode.scrollIntoView({ block: "center", inline: "nearest" });
      }
    } catch (_) {
      // Best-effort wake-up for lazy Highcharts blocks inside the hidden iframe.
    }
  }

  function wakePageInFrame(doc, win) {
    if (win && typeof win.scrollTo === "function") {
      win.scrollTo(0, Math.max(doc.body?.scrollHeight || 0, doc.documentElement?.scrollHeight || 0));
      const FrameEvent = win.Event || Event;
      win.dispatchEvent(new FrameEvent("scroll"));
      win.dispatchEvent(new FrameEvent("resize"));
    }
  }

  function buildRuntimeChartSnapshot(doc, win, url, reason) {
    const snapshot = buildBsportsfanSnapshotFromDocument(doc, url, reason);
    const rawPointSets = parseRuntimeHighchartsPointSets(win);
    if (!rawPointSets.length) {
      return snapshot;
    }

    const players = snapshot.players.length >= 2
      ? snapshot.players
      : rawPointSets[0] && rawPointSets[0].series.length >= 2
        ? rawPointSets[0].series.slice(0, 2).map((serie) => serie.name)
        : snapshot.players;
    const pointSets = alignPointSetsToCanonicalPlayers(rawPointSets, players);
    if (!pointSets.length) {
      return snapshot;
    }
    return {
      ...snapshot,
      pointSets,
      setScores: Array.isArray(snapshot.setScores) && snapshot.setScores.length
        ? snapshot.setScores
        : inferSetScoresFromPointSets(pointSets),
      players,
      serveReturn: calculateServeReturnFromPointSets(pointSets, players)
    };
  }

  function parseRuntimeHighchartsPointSets(win) {
    const charts = Array.from(win && win.Highcharts && win.Highcharts.charts || []).filter(Boolean);
    const pointSets = [];

    charts.forEach((chart, index) => {
      const series = Array.from(chart.series || [])
        .filter((serie) => serie && serie.name && Array.isArray(serie.data) && serie.data.length)
        .map((serie) => ({
          name: decodeHtml(normalizeText(serie.name || "")),
          color: serie.color || "",
          points: serie.data.map((point, pointIndex) => ({
            x: Number.isFinite(Number(point.x)) ? Number(point.x) : pointIndex + 1,
            y: Number(point.y)
          })).filter((point) => Number.isFinite(point.y))
        }));

      if (series.length < 2 || !series[0].points.length || !series[1].points.length) {
        return;
      }

      const title = normalizeText(chart.title && chart.title.textStr || chart.renderTo && chart.renderTo.id || "");
      const setMatch = title.match(/set\s*(\d+)|сет\s*(\d+)|(\d+)/i);
      const setNumber = setMatch ? Number(setMatch[1] || setMatch[2] || setMatch[3]) : index + 1;
      pointSets.push({
        set: Number.isFinite(setNumber) ? setNumber : index + 1,
        series
      });
    });

    pointSets.sort((left, right) => Number(left.set || 0) - Number(right.set || 0));
    return pointSets;
  }

  function addArchiveDiagnostic(archive, url, reason) {
    if (!archive || !Array.isArray(archive.diagnostics)) {
      return;
    }

    archive.diagnostics.push({
      url,
      reason: String(reason || "").slice(0, 180)
    });
  }

  function acquireBsportsfanRequestSlot(url, options = {}) {
    const protectionError = getBsportsfanNavigationProtectionError();
    if (protectionError) {
      return Promise.reject(protectionError);
    }
    const deadlineAt = normalizeOperationDeadline(
      options.deadlineAt,
      BSPORTSFAN_TEXT_FETCH_TIMEOUT_MS
    );
    return sendRuntimeMessage({
      type: "lvr:acquireBsportsfanRequestSlot",
      url: normalizeUrl(url),
      deadlineAt,
      priority: options.requestPriority
    });
  }

  function releaseBsportsfanRequestSlot(tokenValue) {
    const token = normalizeText(tokenValue || "");
    if (!token) {
      return;
    }
    sendRuntimeMessage({
      type: "lvr:releaseBsportsfanRequestSlot",
      token
    }).catch(() => {});
  }

  function fetchText(url, options = {}) {
    const cacheKey = normalizeUrl(url);
    const requestedDeadlineAt = normalizeOperationDeadline(
      options.deadlineAt,
      BSPORTSFAN_TEXT_FETCH_TIMEOUT_MS
    );
    const cached = fetchTextCache.get(cacheKey);
    if (
      cached
      && cached.promise
      && Date.now() < Number(cached.deadlineAt || 0)
    ) {
      return cached.promise;
    }
    if (cached) {
      fetchTextCache.delete(cacheKey);
    }
    const entry = {
      startedAt: Date.now(),
      deadlineAt: requestedDeadlineAt,
      promise: null
    };
    const remainingMs = Math.max(100, getOperationRemainingMs(requestedDeadlineAt));
    const promise = raceWithRuntimeDeadline(
      sendRuntimeMessage({
        type: "lvr:fetchBsportsfanText",
        url: cacheKey,
        deadlineAt: requestedDeadlineAt,
        cacheTtlMs: Math.max(0, Number(options.cacheTtlMs || 0) || 0),
        priority: options.requestPriority
      }),
      remainingMs,
      "BsportsFan text fetch"
    ).then((response) => {
      if (!response || typeof response.text !== "string") {
        throw new Error("BsportsFan proxy returned no text");
      }
      return response.text;
    }).catch((error) => {
      if (isBsportsfanLiveSessionExpiredError(error)) {
        beginLiveSessionRecovery(null, "fetch-live-session-expired");
      }
      throw error;
    }).finally(() => {
      if (fetchTextCache.get(cacheKey) === entry) {
        fetchTextCache.delete(cacheKey);
      }
    });
    entry.promise = promise;
    fetchTextCache.set(cacheKey, entry);
    return promise;
  }

  function parseHtmlDocument(html) {
    const parser = new DOMParser();
    return parser.parseFromString(String(html || ""), "text/html");
  }

  function isBsportsfanChallengeSnapshot(snapshot) {
    const title = normalizeSearchText(snapshot && snapshot.title || "");
    const sample = normalizeSearchText(snapshot && snapshot.textSample || "");
    return title.includes("один момент")
      || title.includes("one moment")
      || title.includes("just a moment")
      || sample.includes("один момент")
      || sample.includes("one moment")
      || sample.includes("checking your browser")
      || sample.includes("just a moment")
      || sample.includes("verify you are human")
      || sample.includes("enable javascript and cookies")
      || sample.includes("cf-chl-")
      || sample.includes("turnstile");
  }

  function isBsportsfanDocumentChallenge(doc) {
    return isBsportsfanChallengeSnapshot({
      title: normalizeText(doc && doc.title || ""),
      textSample: normalizeText(doc && doc.body && doc.body.textContent || "").slice(0, 12000)
    });
  }

  function isBsportsfanDocumentLiveSessionExpired(doc) {
    const toast = doc && typeof doc.querySelector === "function"
      ? doc.querySelector("#authToast.show,#authToast.showing")
      : null;
    if (!toast || toast.getAttribute("aria-hidden") === "true") {
      return false;
    }
    const text = normalizeSearchText(toast.textContent || "");
    return Boolean(
      (
        text.includes("security alert")
        && text.includes("live session has expired")
      )
      || text.includes("refresh to reconnect")
    );
  }

  function createBsportsfanLiveSessionExpiredError(message) {
    const error = new Error(String(message || "BsportsFan live session expired"));
    error.code = "bsportsfan-session-expired";
    error.retryAfterMs = 60 * 1000;
    error.retryBudgetExempt = true;
    beginLiveSessionRecovery(null, "iframe-live-session-expired");
    return error;
  }

  function createBsportsfanChallengeError(message, options = {}) {
    const error = new Error(String(message || "BsportsFan returned a security challenge"));
    error.code = "bsportsfan-challenge";
    error.retryAfterMs = BSPORTSFAN_NAVIGATION_PROTECTION_COOLDOWN_MS;
    error.retryBudgetExempt = true;
    if (!options || options.report !== false) {
      bsportsfanNavigationProtectionOpenUntil = Math.max(
        bsportsfanNavigationProtectionOpenUntil,
        Date.now() + BSPORTSFAN_NAVIGATION_PROTECTION_COOLDOWN_MS
      );
      bsportsfanNavigationProtectionReason = error.message;
      reportBsportsfanProtection(error);
    }
    return error;
  }

  function reportBsportsfanProtection(error) {
    sendRuntimeMessage({
      type: "lvr:reportBsportsfanProtection",
      reason: normalizeText(error && error.message || "bsportsfan-challenge"),
      code: normalizeText(error && error.code || "bsportsfan-challenge"),
      status: Number(error && error.status || 0) || 0,
      retryAfterMs: Math.max(
        BSPORTSFAN_NAVIGATION_PROTECTION_COOLDOWN_MS,
        Number(error && error.retryAfterMs || 0) || 0
      ),
      observedAt: Date.now(),
      url: normalizeUrl(location.href)
    }).catch(() => {});
  }

  function getBsportsfanNavigationProtectionError(now = Date.now()) {
    const retryAfterMs = Math.max(0, bsportsfanNavigationProtectionOpenUntil - Number(now || 0));
    if (retryAfterMs <= 0) {
      bsportsfanNavigationProtectionOpenUntil = 0;
      bsportsfanNavigationProtectionReason = "";
      return null;
    }
    const error = new Error(
      `BsportsFan navigation protection cooldown active for ${Math.ceil(retryAfterMs / 1000)}s`
    );
    error.code = "bsportsfan-circuit-open";
    error.retryAfterMs = retryAfterMs;
    error.retryBudgetExempt = true;
    return error;
  }

  function isBsportsfanChallengeError(error) {
    return String(error && error.code || "") === "bsportsfan-challenge"
      || /security challenge|проверочн|один момент|just a moment/i.test(stringifyError(error));
  }

  function isBsportsfanLiveSessionExpiredError(error) {
    return String(error && error.code || "") === "bsportsfan-session-expired"
      || /live session (?:has )?expired|refresh to reconnect/i.test(stringifyError(error));
  }

  function isBsportsfanProtectionError(error) {
    const code = String(error && error.code || "");
    return isBsportsfanChallengeError(error)
      || isBsportsfanLiveSessionExpiredError(error)
      || [
        "bsportsfan-circuit-open",
        "bsportsfan-rate-limited"
      ].includes(code)
      || [403, 429].includes(Number(error && error.status || 0));
  }

  function createArchivePlayersForSnapshot(players, snapshot) {
    return (Array.isArray(players) ? players.slice(0, 2) : [])
      .map((name) => {
        const link = findPlayerLink(name, snapshot && snapshot.playerLinks);
        return createArchivePlayer(name, link && link.url);
      });
  }

  function createArchivePlayer(name, profileUrl = "") {
    const normalizedProfileUrl = normalizeUrl(profileUrl || "");
    return {
      name,
      profileUrl: normalizedProfileUrl,
      profileId: getBsportsfanPlayerId(normalizedProfileUrl),
      matches: [],
      matchCount: 0,
      serveWon: 0,
      serveTotal: 0,
      receiveWon: 0,
      receiveTotal: 0,
      pointsWon: 0,
      pointsTotal: 0,
      serveRate: null,
      receiveRate: null,
      pointsRate: null,
      serveReceiveSum: null,
      formScore: null,
      pointsScore: null,
      clutchWon: 0,
      clutchTotal: 0,
      clutchScore: null,
      breakClutchWon: 0,
      breakClutchTotal: 0,
      breakClutchScore: null,
      comebackWon: 0,
      comebackTotal: 0,
      comebackScore: null,
      setWins: 0,
      maxWonStreak: 0,
      maxLostStreak: 0,
      streakScore: null,
      setMarginScore: null,
      collapsePenalty: 0,
      collapseCount: 0,
      tiebreakSets: 0,
      tiebreakMatches: 0,
      tiebreakSetsPerMatch: 0,
      scoreHistory: [],
      playerScore: null
    };
  }

  function addArchiveMatchSnapshot(archive, matchSnapshot, candidate = null) {
    if (!matchSnapshot) {
      archive.skipped += 1;
      addArchiveDiagnostic(archive, "", "Пустая страница матча");
      return;
    }

    const matchPlayers = Array.isArray(matchSnapshot.players) ? matchSnapshot.players : [];
    const stats = getServeReturnStats(matchSnapshot.serveReturn);
    if (matchPlayers.length < 2 || stats.length < 2) {
      archive.skipped += 1;
      addArchiveDiagnostic(
        archive,
        matchSnapshot.url,
        `Не хватает данных: players ${matchPlayers.length}, stats ${stats.length}, sets ${Array.isArray(matchSnapshot.pointSets) ? matchSnapshot.pointSets.length : 0}`
      );
      return;
    }

    let added = false;
    const compactPointSets = compactArchivePointSets(matchSnapshot.pointSets);
    const matchesPerPlayer = Number(archive.matchesPerPlayer || ARCHIVE_MATCHES_PER_PLAYER);
    archive.players.forEach((archivePlayer) => {
      if (archivePlayer.matches.length >= matchesPerPlayer) {
        return;
      }

      const sideIndex = findArchivePlayerSideIndex(archivePlayer, matchSnapshot, candidate);
      if (sideIndex < 0 || !stats[sideIndex]) {
        return;
      }

      const sideStats = stats[sideIndex];
      const opponentSideIndex = 1 - sideIndex;
      const playerLinks = Array.isArray(matchSnapshot.playerLinks) ? matchSnapshot.playerLinks.slice(0, 2) : [];
      const opponentName = cleanName(matchPlayers[opponentSideIndex] || "");
      const opponentLink = findPlayerLink(opponentName, playerLinks);
      const historicalMatchUrl = matchSnapshot.url || candidate && candidate.url || "";
      added = true;
      const lateLead = summarizeArchiveLateLeads(
        compactPointSets,
        matchSnapshot.setScores,
        sideIndex
      );
      const completedSetScores = (Array.isArray(matchSnapshot.setScores) ? matchSnapshot.setScores : [])
        .filter((set) => isCompletedTableTennisSet(set && set.left, set && set.right));
      const explicitSetWins = completedSetScores.filter((set) => (
        sideIndex === 0 ? Number(set.left) > Number(set.right) : Number(set.right) > Number(set.left)
      )).length;
      archivePlayer.matches.push({
        matchUrl: historicalMatchUrl ? normalizeUrl(historicalMatchUrl) : "",
        dateTs: Number(candidate && candidate.dateTs || matchSnapshot.matchDateTs || 0),
        opponentName,
        opponentProfileId: getBsportsfanPlayerId(opponentLink && opponentLink.url || ""),
        setScores: matchSnapshot.setScores,
        tiebreakSetCount: countTiebreakSets(matchSnapshot.setScores),
        pointSets: compactPointSets,
        sideIndex,
        serveWon: Number(sideStats.serveWon || 0),
        serveTotal: Number(sideStats.serveTotal || 0),
        receiveWon: Number(sideStats.receiveWon || 0),
        receiveTotal: Number(sideStats.receiveTotal || 0),
        pointsWon: Number(sideStats.pointsWon || 0),
        pointsTotal: Number(sideStats.pointsTotal || 0),
        pointsRate: sideStats.pointsRate,
        serveReceiveSum: sideStats.serveReceiveSum,
        setWins: explicitSetWins,
        setCount: completedSetScores.length,
        lateLeadsHeld: lateLead.held,
        lateLeadChances: lateLead.chances,
        maxWonStreak: Number(sideStats.maxWonStreak || 0),
        maxLostStreak: Number(sideStats.maxLostStreak || 0),
        clutchWon: Number(sideStats.clutchWon || 0),
        clutchTotal: Number(sideStats.clutchTotal || 0),
        clutchRate: sideStats.clutchRate,
        breakClutchWon: Number(sideStats.breakClutchWon || 0),
        breakClutchTotal: Number(sideStats.breakClutchTotal || 0),
        breakClutchRate: sideStats.breakClutchRate,
        comebackWon: Number(sideStats.comebackWon || 0),
        comebackTotal: Number(sideStats.comebackTotal || 0),
        comebackRate: sideStats.comebackRate,
        collapseCount: Number(sideStats.collapseCount || 0)
      });
    });

    if (!added) {
      archive.skipped += 1;
      addArchiveDiagnostic(
        archive,
        matchSnapshot.url,
        `Игрок не сопоставился: ${archive.players.map((player) => player.name).join(" / ")} vs ${matchPlayers.slice(0, 2).join(" / ")}`
      );
    }
  }

  function compactArchivePointSets(pointSets) {
    return (Array.isArray(pointSets) ? pointSets : []).map((set, setIndex) => {
      const pointWinners = buildPointWinnersForSet(set);
      const points = pointWinners && Array.isArray(pointWinners.points)
        ? pointWinners.points.map((point) => {
          const winnerIndex = Number(point && point.winnerIndex);
          return {
            scoreBefore: Array.isArray(point && point.scoreBefore) ? point.scoreBefore.slice(0, 2).map((value) => Number(value || 0)) : [0, 0],
            scoreAfter: Array.isArray(point && point.scoreAfter) ? point.scoreAfter.slice(0, 2).map((value) => Number(value || 0)) : [0, 0],
            winnerIndex
          };
        })
        : [];
      return {
        set: Number(set && set.set || setIndex + 1),
        points
      };
    });
  }

  function summarizeArchiveLateLeads(pointSets, setScores, sideIndex) {
    let held = 0;
    let chances = 0;
    const scores = Array.isArray(setScores) ? setScores : [];
    for (const [index, pointSet] of (Array.isArray(pointSets) ? pointSets : []).entries()) {
      const points = Array.isArray(pointSet && pointSet.points) ? pointSet.points : [];
      const hadLateLead = points.some((point) => [point.scoreBefore, point.scoreAfter].some((score) => {
        const own = Number(Array.isArray(score) ? score[sideIndex] : NaN);
        const opponent = Number(Array.isArray(score) ? score[1 - sideIndex] : NaN);
        return Number.isFinite(own) && Number.isFinite(opponent) && own >= 8 && own - opponent >= 2;
      }));
      if (!hadLateLead) continue;
      const setNumber = Number(pointSet && pointSet.set || index + 1);
      const result = scores.find((set, scoreIndex) => Number(set && set.set || scoreIndex + 1) === setNumber);
      const left = Number(result && result.left);
      const right = Number(result && result.right);
      if (!isCompletedTableTennisSet(left, right)) continue;
      chances += 1;
      if (sideIndex === 0 ? left > right : right > left) held += 1;
    }
    return { held, chances };
  }

  function finalizeArchivePlayers(players, forecastMatchesPerPlayer = ARCHIVE_MATCHES_PER_PLAYER) {
    const scoreLimit = clamp(parseInteger(forecastMatchesPerPlayer) || ARCHIVE_MATCHES_PER_PLAYER, 1, 20);
    for (const player of players || []) {
      const scoringMatches = player.matches.slice(0, scoreLimit);
      for (const match of scoringMatches) {
        player.serveWon += Number(match.serveWon || 0);
        player.serveTotal += Number(match.serveTotal || 0);
        player.receiveWon += Number(match.receiveWon || 0);
        player.receiveTotal += Number(match.receiveTotal || 0);
        player.pointsWon += Number(match.pointsWon || 0);
        player.pointsTotal += Number(match.pointsTotal || 0);
        player.clutchWon += Number(match.clutchWon || 0);
        player.clutchTotal += Number(match.clutchTotal || 0);
        player.breakClutchWon += Number(match.breakClutchWon || 0);
        player.breakClutchTotal += Number(match.breakClutchTotal || 0);
        player.comebackWon += Number(match.comebackWon || 0);
        player.comebackTotal += Number(match.comebackTotal || 0);
        player.setWins += Number(match.setWins || 0);
        player.setCount += Number(match.setCount || 0);
        player.lateLeadsHeld += Number(match.lateLeadsHeld || 0);
        player.lateLeadChances += Number(match.lateLeadChances || 0);
        player.collapseCount += Number(match.collapseCount || 0);
        player.tiebreakSets += Number(match.tiebreakSetCount || 0);
        if (Number(match.tiebreakSetCount || 0) > 0) {
          player.tiebreakMatches += 1;
        }
        player.maxWonStreak = Math.max(player.maxWonStreak, Number(match.maxWonStreak || 0));
        player.maxLostStreak = Math.max(player.maxLostStreak, Number(match.maxLostStreak || 0));
      }
      player.matchCount = player.matches.length;
      player.scoredMatchCount = scoringMatches.length;
      player.forecastMatchesPerPlayer = scoreLimit;
      player.serveRate = player.serveTotal ? roundOneDecimal((player.serveWon / player.serveTotal) * 100) : null;
      player.receiveRate = player.receiveTotal ? roundOneDecimal((player.receiveWon / player.receiveTotal) * 100) : null;
      player.pointsRate = player.pointsTotal ? roundOneDecimal((player.pointsWon / player.pointsTotal) * 100) : null;
      player.serveReceiveSum = Number.isFinite(player.serveRate) && Number.isFinite(player.receiveRate)
        ? roundOneDecimal(player.serveRate + player.receiveRate)
        : null;
      const weights = buildRecencyWeights(scoringMatches.length);
      player.formScore = roundOneDecimal(weightedAverage(scoringMatches.map((match) => match.serveReceiveSum), weights, 100));
      player.pointsScore = roundOneDecimal(weightedAverage(scoringMatches.map((match) => match.pointsRate), weights, 50));
      player.clutchScore = roundOneDecimal(buildRateScore(player.clutchWon, player.clutchTotal, 6));
      player.breakClutchScore = roundOneDecimal(buildRateScore(player.breakClutchWon, player.breakClutchTotal, 5));
      player.comebackScore = roundOneDecimal(buildRateScore(player.comebackWon, player.comebackTotal, 8));
      player.setSharePct = roundOneDecimal(
        ((Number(player.setWins || 0) + 4) / (Number(player.setCount || 0) + 8)) * 100
      );
      player.lateLeadHoldPct = roundOneDecimal(
        ((Number(player.lateLeadsHeld || 0) + 2.1) / (Number(player.lateLeadChances || 0) + 3)) * 100
      );
      player.streakScore = roundOneDecimal(average(scoringMatches.map((match) => Number(match.maxWonStreak || 0) - Number(match.maxLostStreak || 0)), 0));
      player.setMarginScore = roundOneDecimal(weightedAverage(scoringMatches.map(getArchiveMatchSetMargin), weights, 0));
      player.collapsePenalty = roundOneDecimal(Number(player.collapseCount || 0));
      player.tiebreakSetsPerMatch = scoringMatches.length
        ? roundOneDecimal(Number(player.tiebreakSets || 0) / scoringMatches.length)
        : 0;
      player.playerScore = roundOneDecimal(
        (Number(player.formScore || 100) - 100) * 0.45
        + (Number(player.pointsScore || 50) - 50) * 0.45
        + (Number(player.clutchScore || 50) - 50) * 0.2
        + (Number(player.breakClutchScore || 50) - 50) * 0.14
        + (Number(player.comebackScore || 50) - 50) * 0.1
        + Number(player.streakScore || 0) * 0.35
        + Number(player.setMarginScore || 0) * 0.8
        - Number(player.collapsePenalty || 0) * 1
      );
    }
  }

  function getArchiveMatchSetMargin(match) {
    const sideIndex = Number(match && match.sideIndex || 0);
    const setScores = Array.isArray(match && match.setScores) ? match.setScores : [];
    let won = 0;
    let lost = 0;
    for (const set of setScores) {
      const left = Number(set && set.left);
      const right = Number(set && set.right);
      if (!Number.isFinite(left) || !Number.isFinite(right) || left === right) {
        continue;
      }
      const sideWon = sideIndex === 0 ? left > right : right > left;
      if (sideWon) {
        won += 1;
      } else {
        lost += 1;
      }
    }
    if (won || lost) {
      return won - lost;
    }
    return Number(match && match.setWins || 0);
  }

  function countTiebreakSets(setScores) {
    return (Array.isArray(setScores) ? setScores : []).filter(isTiebreakSetScore).length;
  }

  function isTiebreakSetScore(setScore) {
    const left = Number(setScore && setScore.left);
    const right = Number(setScore && setScore.right);
    if (!Number.isFinite(left) || !Number.isFinite(right)) {
      return false;
    }
    return left + right > 20;
  }

  function buildRecencyWeights(count) {
    const base = [1, 0.85, 0.7, 0.55, 0.4, 0.32, 0.25, 0.2, 0.16, 0.12];
    const safeCount = clamp(parseInteger(count) || ARCHIVE_MATCHES_PER_PLAYER, 1, 20);
    const weights = [];
    for (let index = 0; index < safeCount; index += 1) {
      weights.push(Number.isFinite(base[index]) ? base[index] : Math.max(0.05, roundOneDecimal(base[base.length - 1] * Math.pow(0.8, index - base.length + 1))));
    }
    return weights;
  }

  function weightedAverage(values, weights, fallback) {
    let total = 0;
    let weightTotal = 0;
    values.forEach((value, index) => {
      const number = Number(value);
      const weight = Number(weights[index] || 0);
      if (Number.isFinite(number) && weight > 0) {
        total += number * weight;
        weightTotal += weight;
      }
    });
    return weightTotal ? total / weightTotal : fallback;
  }

  function average(values, fallback) {
    const list = values.map(Number).filter(Number.isFinite);
    if (!list.length) {
      return fallback;
    }
    return list.reduce((sum, value) => sum + value, 0) / list.length;
  }

  function buildRateScore(won, total, priorTotal) {
    const valueWon = Number(won || 0);
    const valueTotal = Number(total || 0);
    const prior = Number(priorTotal || 0);
    if (valueTotal >= prior) {
      return valueTotal ? (valueWon / valueTotal) * 100 : 50;
    }
    return ((valueWon + prior / 2) / (valueTotal + prior)) * 100;
  }

  function findPlayerSideIndex(playerName, matchPlayers) {
    const matches = (Array.isArray(matchPlayers) ? matchPlayers : [])
      .slice(0, 2)
      .map((name, index) => areStrictPlayerNamesEqual(playerName, name) ? index : -1)
      .filter((index) => index >= 0);
    return matches.length === 1 ? matches[0] : -1;
  }

  function findArchivePlayerSideIndex(archivePlayer, matchSnapshot, candidate) {
    const matchPlayers = Array.isArray(matchSnapshot && matchSnapshot.players) ? matchSnapshot.players : [];
    const playerIds = new Set();
    const ownId = archivePlayer && (archivePlayer.profileId || getBsportsfanPlayerId(archivePlayer.profileUrl));
    if (ownId) {
      playerIds.add(String(ownId));
    }

    for (const owner of Array.isArray(candidate && candidate.owners) ? candidate.owners : []) {
      if (archivePlayerBelongsToOwner(archivePlayer, owner)) {
        const ownerId = owner && (owner.id || getBsportsfanPlayerId(owner.url));
        if (ownerId) {
          playerIds.add(String(ownerId));
        }
      }
    }

    if (!playerIds.size) {
      return -1;
    }

    const links = Array.isArray(matchSnapshot && matchSnapshot.playerLinks)
      ? matchSnapshot.playerLinks.slice(0, 2)
      : [];
    const linkIds = links.map((link) => String(
      link && (link.id || getBsportsfanPlayerId(link.url)) || ""
    ));
    for (let index = 0; index < links.length; index += 1) {
      const id = linkIds[index];
      if (id && playerIds.has(id)) {
        return index;
      }
    }
    if (linkIds.length === 2 && linkIds.every(Boolean)) {
      return -1;
    }
    return findPlayerSideIndex(archivePlayer && archivePlayer.name || "", matchPlayers);
  }

  function archivePlayerBelongsToOwner(archivePlayer, owner) {
    if (!archivePlayer || !owner) {
      return false;
    }
    const playerId = archivePlayer.profileId || getBsportsfanPlayerId(archivePlayer.profileUrl);
    const ownerId = owner.id || getBsportsfanPlayerId(owner.url);
    if (playerId && ownerId) {
      return String(playerId) === String(ownerId);
    }
    return areStrictPlayerNamesEqual(archivePlayer.name || "", owner.name || "");
  }

  function areStrictPlayerNamesEqual(left, right) {
    const leftText = normalizeSearchText(left);
    const rightText = normalizeSearchText(right);
    if (!leftText || !rightText) {
      return false;
    }
    if (leftText === rightText) {
      return true;
    }
    const tokens = (value) => value.split(" ").filter(Boolean).sort().join("|");
    return tokens(leftText) === tokens(rightText);
  }

  function buildNameAliases(name) {
    const text = normalizeSearchText(name);
    const tokens = text.split(" ").filter((token) => token.length >= 2);
    const aliases = new Set([text]);
    if (tokens.length >= 2) {
      aliases.add(tokens.join("-"));
      aliases.add(tokens.slice().reverse().join(" "));
      aliases.add(tokens.slice().reverse().join("-"));
    }
    tokens.forEach((token) => aliases.add(token));
    return Array.from(aliases).filter((alias) => alias.length >= 3);
  }

  function parseNamesFromText(text) {
    const value = normalizeText(text);
    const compact = value
      .replace(/\b(?:Set|Очк|Команда|Тотал|Total|Live|Finished|Закончился)\b/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
    const separators = [
      /\s+(?:-|–|—|vs\.?|против)\s+/i,
      /\s{2,}/
    ];

    for (const separator of separators) {
      const parts = compact.split(separator).map(cleanName).filter(isLikelyName);
      if (parts.length >= 2) {
        return parts.slice(0, 2);
      }
    }

    return [];
  }

  function cleanName(value) {
    return normalizeText(value)
      .replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "")
      .replace(/\b\d{1,2}(?::\d{2})?\b/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function isLikelyName(value) {
    const text = normalizeText(value);
    return Boolean(text)
      && text.length >= 2
      && text.length <= 80
      && /[a-zа-яё]/i.test(text)
      && !/\b(?:table|tennis|настольный|теннис|set|card|score|команда|очк)\b/i.test(text);
  }

  function formatArchiveProgressLines(archive) {
    const target = Number(archive && archive.matchesPerPlayer || ARCHIVE_MATCHES_PER_PLAYER);
    const scoreTarget = Number(archive && archive.scoreHistoryMatchesPerPlayer || PROFILE_SCORE_HISTORY_MATCHES);
    return (archive.players || []).map((player) => (
      `${player.name}: графики ${player.matches.length}/${target}, счет ${Number(player.scoreHistory ? player.scoreHistory.length : 0)}/${scoreTarget}`
    ));
  }

  function reportStatus(snapshot, force) {
    if (!force && Date.now() - lastStatusReportTs < 5000) {
      return;
    }
    lastStatusReportTs = Date.now();
    sendRuntimeMessage({
      type: "lvr:setScanStatus",
      status: {
        message: "bsportsfan parsed",
        candidates: snapshot.matches.length || (snapshot.players.length >= 2 ? 1 : 0),
        sample: [
          snapshot.players.length >= 2
            ? `${snapshot.players[0]} - ${snapshot.players[1]}`
            : `${snapshot.matches.length} matches`
        ],
        bsportsfan: buildStoredStatusSnapshot(snapshot)
      }
    }).catch(() => {});
  }

  function buildStoredStatusSnapshot(snapshot) {
    if (!snapshot) {
      return null;
    }

    const {
      playerArchive,
      ...storedSnapshot
    } = snapshot;

    const cipMonitor = window.__liveValueRadarBsportsfanCipMonitor;
    return {
      ...storedSnapshot,
      cipMonitor: cipMonitor && typeof cipMonitor === "object" ? { ...cipMonitor } : null
    };
  }

  function sendRuntimeMessage(message) {
    return new Promise((resolve, reject) => {
      if (typeof chrome === "undefined" || !chrome.runtime || !chrome.runtime.sendMessage) {
        resolve({});
        return;
      }

      try {
        chrome.runtime.sendMessage(message, (response) => {
          const runtimeError = chrome.runtime.lastError;
          if (runtimeError) {
            reject(new Error(runtimeError.message || "runtime error"));
            return;
          }
          if (response && response.ok === false) {
            const error = new Error(response.error || response.reason || "runtime error");
            error.code = String(response.code || "");
            error.status = Number(response.status || 0) || 0;
            error.retryAfterMs = Math.max(0, Number(response.retryAfterMs || 0) || 0);
            error.response = response;
            reject(error);
            return;
          }
          resolve(response || {});
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  function hasRuntimeMessaging() {
    return typeof chrome !== "undefined"
      && chrome.runtime
      && typeof chrome.runtime.sendMessage === "function";
  }

  function createDeadlineError(label = "operation", delayMs = 0) {
    const timeoutMs = Math.max(0, Number(delayMs || 0) || 0);
    const error = new Error(`${label} timed out after ${timeoutMs} ms`);
    error.code = "lvr-runtime-deadline";
    return error;
  }

  function normalizeOperationDeadline(value, fallbackMs) {
    const deadlineAt = Number(value || 0);
    if (Number.isFinite(deadlineAt) && deadlineAt > 0) {
      return deadlineAt;
    }
    return Date.now() + Math.max(100, Number(fallbackMs || 0) || 0);
  }

  function getOperationRemainingMs(deadlineAt) {
    const value = Number(deadlineAt || 0);
    return Number.isFinite(value) && value > 0
      ? Math.max(0, value - Date.now())
      : Number.POSITIVE_INFINITY;
  }

  function getBoundedOperationTimeoutMs(maximumMs, deadlineAt) {
    const maximum = Math.max(0, Number(maximumMs || 0) || 0);
    const remaining = getOperationRemainingMs(deadlineAt);
    return Number.isFinite(remaining)
      ? Math.max(0, Math.min(maximum, remaining))
      : maximum;
  }

  function raceWithRuntimeDeadline(value, delayMs, label = "operation") {
    const timeoutMs = Math.max(100, Number(delayMs || 0) || 0);
    return new Promise((resolve, reject) => {
      let settled = false;
      const finish = (ok, result) => {
        if (settled) {
          return;
        }
        settled = true;
        cancelDeadline();
        if (ok) {
          resolve(result);
        } else {
          reject(result);
        }
      };
      const cancelDeadline = scheduleRuntimeDeadline(timeoutMs, (runtimeError) => {
        finish(false, runtimeError && runtimeError.code === "lvr-runtime-deadline"
          ? runtimeError
          : createDeadlineError(label, timeoutMs));
      });
      Promise.resolve(value).then(
        (result) => finish(true, result),
        (error) => finish(false, error)
      );
    });
  }

  function scheduleRuntimeDeadline(delayMs, onElapsed) {
    let active = true;
    const timeoutMs = Math.max(100, Number(delayMs || 0) || 0);
    let elapsed = false;
    const fire = (error = null) => {
      if (elapsed || !active) {
        return;
      }
      elapsed = true;
      if (active && typeof onElapsed === "function") {
        onElapsed(error);
      }
    };
    const localTimer = window.setTimeout(() => {
      fire(createDeadlineError("local deadline", timeoutMs));
    }, timeoutMs);
    if (hasRuntimeMessaging()) {
      sendRuntimeMessage({
        type: "lvr:waitForRuntimeDeadline",
        delayMs: timeoutMs
      }).then(() => {
        fire(createDeadlineError("runtime deadline", timeoutMs));
      }).catch((error) => {
        fire(error);
      });
    }
    return () => {
      active = false;
      window.clearTimeout(localTimer);
    };
  }

  function emitArchiveProgress(message, archive, candidatesTotal, lines = []) {
    const players = Array.isArray(archive && archive.players) ? archive.players : [];
    const payload = {
      source: "bsportsfan-progress",
      message,
      candidates: Number.isFinite(Number(candidatesTotal))
        ? Number(candidatesTotal)
        : Number.isFinite(Number(archive && archive.candidateCount))
          ? Number(archive.candidateCount)
          : 0,
      fetched: Number.isFinite(Number(archive && archive.fetched)) ? Number(archive.fetched) : 0,
      skipped: Number.isFinite(Number(archive && archive.skipped)) ? Number(archive.skipped) : 0,
      totalPerPlayer: Number(archive && archive.matchesPerPlayer || ARCHIVE_MATCHES_PER_PLAYER),
      players: players.map((player) => (
        `${player.name}: ${Number(player.matches ? player.matches.length : 0)}/${Number(archive && archive.matchesPerPlayer || ARCHIVE_MATCHES_PER_PLAYER)} графиков, ${Number(player.scoreHistory ? player.scoreHistory.length : 0)}/${Number(archive && archive.scoreHistoryMatchesPerPlayer || PROFILE_SCORE_HISTORY_MATCHES)} счетов`
      )),
      lastErrorCount: Number.isFinite(Number(archive && archive.errors && archive.errors.length))
        ? Number(archive.errors.length)
        : 0,
      details: Array.isArray(lines) && lines.length ? lines : null
    };
    const cipMonitor = window.__liveValueRadarBsportsfanCipMonitor;
    if (cipMonitor && typeof cipMonitor === "object") {
      payload.cipMonitor = { ...cipMonitor };
    }

    sendRuntimeMessage({
      type: "lvr:setScanStatus",
      status: payload
    }).catch(() => {});
  }

  function lastPointValue(points) {
    const point = Array.isArray(points) && points.length ? points[points.length - 1] : null;
    return point && Number.isFinite(Number(point.y)) ? point.y : "";
  }

  function getServeReturnStats(serveReturn) {
    return Array.isArray(serveReturn && serveReturn.stats)
      ? serveReturn.stats
      : Array.isArray(serveReturn && serveReturn.estimate)
        ? serveReturn.estimate
        : [];
  }

  function roundOneDecimal(value) {
    const number = Number(value);
    return Number.isFinite(number) ? Math.round(number * 10) / 10 : null;
  }

  function roundDecimal(value, digits = 2) {
    const number = Number(value);
    const power = Math.pow(10, Math.max(0, Number(digits) || 0));
    return Number.isFinite(number) ? Math.round(number * power) / power : null;
  }

  function median(values) {
    const list = (Array.isArray(values) ? values : [])
      .map(Number)
      .filter(Number.isFinite)
      .sort((left, right) => left - right);
    if (!list.length) {
      return null;
    }
    const middle = Math.floor(list.length / 2);
    return list.length % 2
      ? list[middle]
      : (list[middle - 1] + list[middle]) / 2;
  }

  function clamp(value, min, max) {
    const number = Number(value);
    if (!Number.isFinite(number)) {
      return min;
    }
    return Math.min(max, Math.max(min, number));
  }

  function setBoundedMapValue(map, key, value, limit) {
    if (map.has(key)) {
      map.delete(key);
    }
    map.set(key, value);
    while (map.size > limit) {
      map.delete(map.keys().next().value);
    }
    return value;
  }

  function addBoundedSetValue(set, value, limit) {
    if (set.has(value)) {
      set.delete(value);
    }
    set.add(value);
    while (set.size > limit) {
      set.delete(set.values().next().value);
    }
    return value;
  }

  function normalizeUrl(value, baseUrl = location.origin) {
    try {
      const url = new URL(value, baseUrl || location.origin);
      url.hash = "";
      return url.href;
    } catch (_) {
      return "";
    }
  }

  function parseInteger(value) {
    const match = normalizeText(value).match(/^-?\d+$/);
    return match ? Number(match[0]) : null;
  }

  function isBsportsfanTableTennisPage() {
    return /(^|\.)bsportsfan\.com$/i.test(location.hostname || "")
      && (
        /\/(?:c|cip|ce|cs)\/table[-_]?tennis(?:\/|$)/i.test(location.pathname || "")
        || /\/(?:table-tennis\/)?(?:rs?|t)\/\d+/i.test(location.pathname || "")
      );
  }

  function isBsportsfanTableTennisListPage() {
    return /(^|\.)bsportsfan\.com$/i.test(location.hostname || "")
      && /\/(?:c|cip|ce|cs)\/table[-_]?tennis(?:\/|$)/i.test(location.pathname || "");
  }

  function isCipTableTennisListUrl(value) {
    const url = parseUrl(value);
    const path = normalizeCipTableTennisAutoReloadPath(url && url.pathname);
    return Boolean(url
      && url.protocol === "https:"
      && url.hostname === "ru.bsportsfan.com"
      && [CIP_TABLE_TENNIS_AUTO_RELOAD_PATH, TABLE_TENNIS_CATEGORY_PATH].includes(path));
  }

  function isBsportsfanTableTennisResultsPage(doc = document) {
    return /(^|\.)bsportsfan\.com$/i.test(location.hostname || "")
      && (
        String(location.pathname || "").startsWith(RESULTS_PATH)
        || isBsportsfanTableTennisListPage() && hasActiveBsportsfanResultsTab(doc)
      );
  }

  function isForecastSuppressedOnCurrentPage() {
    return isBsportsfanTableTennisResultsPage();
  }

  function clearInlineForecastQueueForCurrentResultsPage() {
    inlineAutoForecastQueue.clear();
  }

  function hasActiveBsportsfanResultsTab(doc = document) {
    const root = doc && typeof doc.querySelectorAll === "function" ? doc : document;
    const nodes = Array.from(root.querySelectorAll("a,button,[role='tab'],.nav-link,.btn,.btn-group *"));
    return nodes.some((node) => {
      const text = normalizeText(node && (node.textContent || node.innerText || node.getAttribute && node.getAttribute("title") || "") || "");
      if (!/^(?:результаты|results)$/i.test(text)) {
        return false;
      }
      return isActiveBsportsfanTabNode(node);
    });
  }

  function isActiveBsportsfanTabNode(node) {
    if (!node) {
      return false;
    }
    const attr = (name) => node.getAttribute ? normalizeText(node.getAttribute(name) || "") : "";
    const classText = normalizeText(typeof node.className === "string"
      ? node.className
      : node.className && node.className.baseVal || attr("class"));
    if (/\b(?:active|selected|current|btn-primary|primary)\b/i.test(classText)) {
      return true;
    }
    if (/^(?:true|page|step|location|date|time)$/i.test(attr("aria-selected"))
      || /^(?:true|page|step|location|date|time)$/i.test(attr("aria-current"))) {
      return true;
    }
    return Boolean(node.matches && node.matches(".active,.selected,.current,.btn-primary,[aria-selected='true'],[aria-current='page']"));
  }

  function isBsportsfanTableTennisListUrl(value) {
    const url = parseUrl(value);
    return Boolean(url
      && /(^|\.)bsportsfan\.com$/i.test(url.hostname)
      && /\/(?:cip|ce)\/table-tennis(?:\/|$)/i.test(url.pathname));
  }

  function isBsportsfanPlayerUrl(value) {
    const url = parseUrl(value);
    return Boolean(
      url
      && /(^|\.)bsportsfan\.com$/i.test(url.hostname)
      && /\/(?:table-tennis\/)?t\/\d+/i.test(url.pathname)
    );
  }

  function isBsportsfanMatchUrl(value) {
    const url = parseUrl(value);
    return Boolean(
      url
      && /(^|\.)bsportsfan\.com$/i.test(url.hostname)
      && /\/(?:table-tennis\/)?rs?\/\d+/i.test(url.pathname)
    );
  }

  function getBsportsfanPlayerId(value) {
    const url = parseUrl(value);
    const match = url && url.pathname.match(/\/(?:table-tennis\/)?t\/(\d+)/i);
    return match ? match[1] : "";
  }

  function isBsportsfanMatchResultUrl(value) {
    const url = parseUrl(value);
    return Boolean(
      url
      && /(^|\.)bsportsfan\.com$/i.test(url.hostname)
      && /\/(?:table-tennis\/)?r\/\d+/i.test(url.pathname)
    );
  }

  function getBsportsfanOddsUrl(value) {
    const url = parseUrl(value);
    if (!url || !/(^|\.)bsportsfan\.com$/i.test(url.hostname)) {
      return "";
    }
    if (/\/(?:table-tennis\/)?rs\//i.test(url.pathname)) {
      return normalizeUrl(url.href);
    }
    if (/\/table-tennis\/r\//i.test(url.pathname)) {
      url.pathname = url.pathname.replace(/\/table-tennis\/r\//i, "/table-tennis/rs/");
      return normalizeUrl(url.href);
    }
    if (/^\/r\//i.test(url.pathname)) {
      url.pathname = url.pathname.replace(/^\/r\//i, "/rs/");
      return normalizeUrl(url.href);
    }
    return "";
  }

  function parseUrl(value) {
    try {
      return new URL(value, location.origin);
    } catch (_) {
      return null;
    }
  }

  function toReadableSlugName(value) {
    const url = parseUrl(value);
    const slug = url ? decodeURIComponent((url.pathname.split("/").filter(Boolean).pop() || "")) : "";
    return slug
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase())
      .trim();
  }

  function normalizeText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function normalizeSearchText(value) {
    return normalizeText(value)
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ё/g, "е")
      .replace(/[^a-zа-я0-9]+/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function delay(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  async function runWithConcurrency(items, concurrency, worker) {
    const list = Array.isArray(items) ? items : [];
    const limit = clamp(parseInteger(concurrency) || 1, 1, 12);
    let cursor = 0;
    const runners = Array.from({ length: Math.min(limit, list.length) }, async () => {
      while (cursor < list.length) {
        const index = cursor;
        cursor += 1;
        await worker(list[index], index);
      }
    });
    await Promise.all(runners);
  }

  function stringifyError(error) {
    return String(error && error.message ? error.message : error || "");
  }

  function decodeHtml(value) {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = String(value || "");
    return textarea.value;
  }

})();
