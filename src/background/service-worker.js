"use strict";

if (typeof importScripts === "function") {
  importScripts(
    "../shared/table-tennis-sources.js",
    "../shared/pipeline-policy.js",
    "../shared/start-match-rule.js",
    "../shared/verified-pair-regime-v1.js"
  );
}

const DB_NAME = "live-value-radar";
const DB_VERSION = 15;
const STORE_PREDICTION_POINTS = "predictionPoints";
const INDEXEDDB_OPEN_TIMEOUT_MS = 5000;
const STORAGE_MAINTENANCE_INTERVAL_MS = 60000;
const TELEGRAM_SETTINGS_KEY = "telegramSettings";
const TELEGRAM_SENT_KEY = "telegramSentPredictions";
const TELEGRAM_AUDIT_KEY = "telegramPredictionAudit";
const TELEGRAM_PREDICTION_DATASET_KEY = "telegramPredictionDataset";
const TELEGRAM_PREDICTION_DATASET_STORAGE_VERSION_KEY = "telegramPredictionDatasetStorageVersion";
const TELEGRAM_PREDICTION_DATASET_STORAGE_VERSION = 9;
const LEGACY_TELEGRAM_STORAGE_KEYS = [
  "telegramLiveSettings",
  "telegramLiveSentSignals",
  "telegramLiveLastDelivery",
  "telegramCalibrationJournal",
  "telegramCalibrationCleanupVersion",
  "telegramStartSideGuardDecisionSnapshots"
];
const TECHNICAL_START_EXPIRY_ARTIFACT_CLEANUP_AFTER_TS = 1785054645618;
const EXTENSION_RUNTIME_VERSION_KEY = "extensionRuntimeVersion";
const EXTENSION_FORCE_TAB_RELOAD_KEY = "extensionForceTabReload";
const TELEGRAM_MESSAGE_REFS_KEY = "telegramPredictionMessages";
const TELEGRAM_STATS_REFS_KEY = "telegramStatsMessages";
const TELEGRAM_SENT_TTL_MS = 48 * 60 * 60 * 1000;
const TELEGRAM_MESSAGE_REFS_TTL_MS = 14 * 24 * 60 * 60 * 1000;
const TELEGRAM_AUDIT_LIMIT = 200;
const TELEGRAM_PREDICTION_DATASET_LIMIT = 10000;
const TELEGRAM_PREDICTION_POINT_TIMELINE_LIMIT = 350;
const TELEGRAM_MESSAGE_REFS_LIMIT = 1200;
const TELEGRAM_STATS_REFS_LIMIT = 20;
const TELEGRAM_STATS_UPDATE_MIN_INTERVAL_MS = 10 * 60 * 1000;
const TELEGRAM_STATS_REFRESH_DEBOUNCE_MS = 750;
const TELEGRAM_SEND_MAX_ATTEMPTS = 5;
const TELEGRAM_SEND_RETRY_BASE_MS = 1000;
const TELEGRAM_SEND_RETRY_MAX_MS = 60000;
const TELEGRAM_SEND_TIMEOUT_MS = 20000;
const TELEGRAM_PREDICTION_SEND_CONCURRENCY = 2;
const TELEGRAM_RESULT_EDIT_MAX_ATTEMPTS = 1;
const TELEGRAM_RESULT_EDIT_TIMEOUT_MS = 6000;
const TELEGRAM_RESULT_EDIT_RETRY_BASE_MS = 30 * 1000;
const TELEGRAM_RESULT_EDIT_RETRY_MAX_MS = 10 * 60 * 1000;
const TELEGRAM_STATS_EDIT_MAX_ATTEMPTS = 2;
const TELEGRAM_STATS_EDIT_TIMEOUT_MS = 8000;
const TELEGRAM_MATCH_START_RULE_ID = String(
  globalThis.LvrStartMatchRule && globalThis.LvrStartMatchRule.RULE_ID || ""
);
const TELEGRAM_START_PAIR_REGIME_PROTOCOL = globalThis.LvrVerifiedPairRegimeV1
  && globalThis.LvrVerifiedPairRegimeV1.PROTOCOL || {};
const TELEGRAM_START_PAIR_REGIME_PROTOCOL_ID = String(
  TELEGRAM_START_PAIR_REGIME_PROTOCOL.id || ""
);
const TELEGRAM_START_PAIR_REGIME_PRODUCTION_GATE_ID = String(
  TELEGRAM_START_PAIR_REGIME_PROTOCOL.gateId || ""
);
const TELEGRAM_STATS_COMPATIBLE_START_RULE_IDS = new Set([
  TELEGRAM_MATCH_START_RULE_ID
]);
const TELEGRAM_STATS_COMPATIBLE_PAIR_PROTOCOL_IDS = new Set([
  TELEGRAM_START_PAIR_REGIME_PROTOCOL_ID
]);
const TELEGRAM_MATCH_START_DELIVERY_MAX_AGE_MS = 20000;
const BSPORTSFAN_PROXY_FETCH_TIMEOUT_MS = 12 * 1000;
const BSPORTSFAN_PROXY_FETCH_MAX_CHARS = 5 * 1024 * 1024;
const BSPORTSFAN_PROXY_FETCH_CONCURRENCY = 1;
const BSPORTSFAN_PROXY_FETCH_MIN_INTERVAL_MS = 5000;
const BSPORTSFAN_PROXY_FETCH_QUEUE_MAX = 64;
const TABLE_TENNIS_PROTECTION_COOLDOWN_MS = 30 * 60 * 1000;
const TABLE_TENNIS_REQUEST_RETRY_MS = 60 * 1000;
const BSPORTSFAN_PROXY_CACHE_DEFAULT_TTL_MS = 30 * 1000;
const BSPORTSFAN_PROXY_CACHE_MAX_TTL_MS = 10 * 60 * 1000;
const BSPORTSFAN_PROXY_CACHE_MAX_ENTRIES = 48;
const LEGACY_BSPORTSFAN_PROXY_PROTECTION_STORAGE_KEY = "bsportsfanProtectionState";
const BSPORTSFAN_ATTENTION_NOTIFICATION_KEY = "bsportsfanAttentionNotification";
const BSPORTSFAN_ATTENTION_NOTIFICATION_TTL_MS = 60 * 60 * 1000;
const BSPORTSFAN_ATTENTION_CONFIRMATION_DELAY_MS = 15 * 1000;
const TABLE_TENNIS_MANUAL_PROTECTION_PAUSE_MS = 6 * 60 * 60 * 1000;
const TABLE_TENNIS_HEALTH_ALARM_NAME = "lvr-bsportsfan-health";
const TABLE_TENNIS_HEALTH_STALE_MS = 2 * 60 * 1000;
const TABLE_TENNIS_PROGRESS_STALE_MS = 3 * 60 * 1000;
const TABLE_TENNIS_HEALTH_RELOAD_COOLDOWN_MS = 15 * 60 * 1000;
const TABLE_TENNIS_PROTECTED_RECHECK_INTERVAL_MS = 15 * 60 * 1000;
const TABLE_TENNIS_HEALTH_WATCHDOG_STORAGE_KEY = "bsportsfanHealthWatchdog";
const BSPORTSFAN_NAVIGATION_LEASE_STORAGE_KEY = "bsportsfanNavigationLeaseState";
const BSPORTSFAN_FORECAST_LEASES_STORAGE_KEY = "bsportsfanForecastLeases";
const BSPORTSFAN_MAINTENANCE_LEASE_STORAGE_KEY = "bsportsfanMaintenanceLease";
const LEGACY_BSPORTSFAN_RESULT_RECOVERY_STORAGE_KEY = "bsportsfanResultRecoveryState";
const BSPORTSFAN_RESULT_BACKFILL_LEASE_MAX_MS = 12 * 60 * 1000;
const BSPORTSFAN_NAVIGATION_LEASE_MAX_MS = 25 * 1000;
const BSPORTSFAN_FORECAST_LEASE_MAX_MS = 130 * 1000;
const BSPORTSFAN_TAB_RELOAD_INTERVAL_MS = 2500;
const TABLE_TENNIS_SOURCE_STATE_KEY = "tableTennisSourceStateV1";
const TABLE_TENNIS_SOURCE_FAILURE_COOLDOWN_MS = 30 * 60 * 1000;
const TABLE_TENNIS_ENDPOINT_BLOCKED_CODE = "table-tennis-endpoint-blocked";
const TABLE_TENNIS_ENDPOINT_BLOCKED_RETRY_MS = 5 * 60 * 1000;
const TABLE_TENNIS_SOURCE_API = globalThis.LvrTableTennisSources;
const TABLE_TENNIS_SOURCE_ORIGINS = TABLE_TENNIS_SOURCE_API.ORIGINS;
const TABLE_TENNIS_SOURCE_IDS = TABLE_TENNIS_SOURCE_API.SOURCE_IDS;
const TABLE_TENNIS_TAB_URL_PATTERNS = TABLE_TENNIS_SOURCE_API.TAB_URL_PATTERNS;
const getTableTennisDataSourceId = TABLE_TENNIS_SOURCE_API.getSourceId;
const isSupportedTableTennisDataHostname = TABLE_TENNIS_SOURCE_API.isSupportedHostname;
const TABLE_TENNIS_COLLECTOR_LEASE_STORAGE_KEY = "tableTennisCollectorLeaseV1";
const TABLE_TENNIS_COLLECTOR_LEASE_MS = 90 * 1000;
const RUNTIME_DEADLINE_MAX_MS = 3 * 60 * 1000;
const DEFAULT_TELEGRAM_SETTINGS = {
  enabled: false,
  autoSend: false,
  botToken: "",
  chatId: ""
};

let bootstrapPromise = null;
let lastMaintenanceTs = 0;
let maintenancePromise = null;
let telegramMatchStartSendActive = 0;
const telegramMatchStartSendQueue = [];
const telegramMatchStartSendInFlight = new Map();
const telegramMatchStartSendActiveIdentities = new Set();
const telegramMatchStartSendIdleWaiters = new Set();
let telegramSentMutationChain = Promise.resolve();
let telegramAuditMutationChain = Promise.resolve();
let telegramMessageRefsMutationChain = Promise.resolve();
let telegramPredictionResultUpdateChain = Promise.resolve();
let telegramResultEditRetryNextCheckAt = 0;
let telegramResultEditRetryInFlight = null;
let telegramStatsRefreshChain = Promise.resolve();
let telegramStatsRefreshPending = null;
let telegramPredictionDatasetMutationChain = Promise.resolve();
const bsportsfanProxyFetchQueue = [];
const bsportsfanProxyActiveJobs = new Set();
const bsportsfanProxyFetchInFlight = new Map();
const bsportsfanProxyResponseCache = new Map();
let bsportsfanProxyFetchActive = 0;
let bsportsfanProxyFetchLastStartedAt = 0;
const tableTennisSourceLastStartedAt = Object.fromEntries(
  TABLE_TENNIS_SOURCE_IDS.map((sourceId) => [sourceId, 0])
);
let bsportsfanProxyFetchDrainTimer = 0;
let bsportsfanProxyFetchSequence = 0;
const bsportsfanProxyFetchMetrics = {
  enqueued: 0,
  completed: 0,
  failed: 0,
  expired: 0,
  dropped: 0,
  cacheHits: 0,
  coalesced: 0,
  reprioritized: 0,
  peakQueued: 0
};
let tableTennisProtectionStateLoaded = false;
let tableTennisProtectionStatePromise = null;
const tableTennisProtectionCircuits = Object.fromEntries(
  TABLE_TENNIS_SOURCE_IDS.map((sourceId) => [sourceId, { openUntil: 0, reason: "" }])
);
let bsportsfanResultBackfillLeaseUntil = 0;
let bsportsfanResultBackfillLeaseOwner = "";
let bsportsfanResultBackfillLeaseToken = "";
let bsportsfanNavigationLeaseToken = "";
let bsportsfanNavigationLeaseUntil = 0;
let bsportsfanNavigationLeaseOwner = "";
let bsportsfanNavigationLeaseSourceId = "";
let bsportsfanNavigationLeaseTimer = 0;
const bsportsfanForecastLeases = new Map();
let bsportsfanForecastLeasesLoaded = false;
let bsportsfanForecastLeasesLoadPromise = null;
let bsportsfanForecastLeaseMutationChain = Promise.resolve();
let tableTennisSourceStateCache = null;
let tableTennisSourceStateMutationChain = Promise.resolve();
let tableTennisCollectorLeaseMutationChain = Promise.resolve();
let tableTennisCollectorLeaseCache = null;
let tableTennisCollectorLeaseLoaded = false;
let tableTennisCollectorLeaseLoadPromise = null;
let tableTennisScanStatusMutationChain = Promise.resolve();
let tableTennisHealthWatchdogInFlight = null;
const runtimeDeadlineWaiters = new Map();
let bsportsfanAttentionNotificationChain = Promise.resolve();

chrome.runtime.onInstalled.addListener(() => {
  ensureBootstrapStorage().catch(() => {});
  ensureTableTennisHealthAlarm();
});

if (chrome.runtime.onStartup && typeof chrome.runtime.onStartup.addListener === "function") {
  chrome.runtime.onStartup.addListener(() => {
    ensureTableTennisHealthAlarm();
  });
}

if (chrome.alarms && chrome.alarms.onAlarm) {
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm && alarm.name === TABLE_TENNIS_HEALTH_ALARM_NAME) {
      runTableTennisHealthWatchdog().catch(() => {});
      schedulePendingTelegramPredictionResultEditRetry();
    }
  });
}

if (chrome.tabs && chrome.tabs.onRemoved) {
  chrome.tabs.onRemoved.addListener((tabId) => {
    releaseTableTennisTabRuntimeOwnership(tabId, "tab-removed").catch(() => {});
  });
}

if (chrome.tabs && chrome.tabs.onUpdated) {
  chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo && changeInfo.status === "loading") {
      cancelRuntimeDeadlinesForOwner(`tab:${tabId}`, "tab-loading");
    }
    if (
      changeInfo
      && typeof changeInfo.url === "string"
      && !isTableTennisCollectorTabUrl(changeInfo.url)
    ) {
      releaseTableTennisCollectorLeaseForTab(tabId, "collector-navigated").catch(() => {});
    }
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const bootstrapIndependent = isBootstrapIndependentMessage(message);
  const responsePromise = bootstrapIndependent
    ? handleMessage(message, sender)
    : ensureBootstrapStorage().then(() => handleMessage(message, sender));
  Promise.resolve(responsePromise)
    .then((response) => sendResponse({ ok: true, ...response }))
    .catch((error) => sendResponse({
      ok: false,
      error: String(error && error.message ? error.message : error),
      code: String(error && error.code || ""),
      status: Number(error && error.status || 0) || 0,
      sourceId: normalizeTelegramText(error && error.sourceId || ""),
      retryAfterMs: Math.max(0, Number(error && error.retryAfterMs || 0) || 0),
      endpointBlocked: error && error.endpointBlocked === true
    }));

  return true;
});

ensureBootstrapStorage().catch(() => {});
ensureTableTennisHealthAlarm();

function ensureTableTennisHealthAlarm() {
  if (!chrome.alarms || typeof chrome.alarms.create !== "function") {
    return;
  }
  try {
    chrome.alarms.create(TABLE_TENNIS_HEALTH_ALARM_NAME, {
      delayInMinutes: 1,
      periodInMinutes: 1
    });
  } catch (_) {
    // The parser remains usable when alarms are unavailable.
  }
}

function runTableTennisHealthWatchdog(now = Date.now()) {
  if (tableTennisHealthWatchdogInFlight) {
    return tableTennisHealthWatchdogInFlight;
  }
  const operation = runTableTennisHealthWatchdogNow(now).finally(() => {
    if (tableTennisHealthWatchdogInFlight === operation) {
      tableTennisHealthWatchdogInFlight = null;
    }
  });
  tableTennisHealthWatchdogInFlight = operation;
  return operation;
}

async function runTableTennisHealthWatchdogNow(now = Date.now()) {
  await ensureTableTennisProtectionStateLoaded();
  const storage = await chrome.storage.local.get({
    scanStatus: null,
    [TABLE_TENNIS_HEALTH_WATCHDOG_STORAGE_KEY]: null
  });
  const scanStatus = storage.scanStatus && typeof storage.scanStatus === "object"
    ? storage.scanStatus
    : null;
  const previous = storage[TABLE_TENNIS_HEALTH_WATCHDOG_STORAGE_KEY]
    && typeof storage[TABLE_TENNIS_HEALTH_WATCHDOG_STORAGE_KEY] === "object"
    ? storage[TABLE_TENNIS_HEALTH_WATCHDOG_STORAGE_KEY]
    : {};
  await reconcileTableTennisSourceHealthFromScanStatus(scanStatus, now).catch(() => {});
  const protectionErrors = Object.fromEntries(TABLE_TENNIS_SOURCE_IDS.map((sourceId) => [
    sourceId,
    getTableTennisProtectionCircuitError(sourceId, now)
  ]));
  const allSourcesProtected = TABLE_TENNIS_SOURCE_IDS.every((sourceId) => (
    Boolean(protectionErrors[sourceId])
  ));
  if (allSourcesProtected) {
    const sourceState = await getTableTennisSourceState().catch(() => null);
    const lastFailureAt = Math.max(0, ...TABLE_TENNIS_SOURCE_IDS.map((sourceId) => Number(
      sourceState && sourceState.sources && sourceState.sources[sourceId]
        && sourceState.sources[sourceId].lastFailureAt || 0
    )));
    const lastProtectedProbeAt = Number(previous.lastProtectedProbeAt || 0);
    if (
      now - Math.max(lastFailureAt, lastProtectedProbeAt)
        < TABLE_TENNIS_PROTECTED_RECHECK_INTERVAL_MS
    ) {
      return { reloaded: false, reason: "protection-active" };
    }
  }
  const heartbeatAt = Number(scanStatus && scanStatus.ts || 0);
  const heartbeatStale = !(heartbeatAt > 0) || now - heartbeatAt >= TABLE_TENNIS_HEALTH_STALE_MS;
  const progress = summarizeTableTennisCollectorProgress(scanStatus, now);
  const progressChanged = progress.signature !== normalizeTelegramText(previous.progressSignature || "");
  const progressObservedAt = progressChanged
    ? now
    : Number(previous.progressObservedAt || 0) || now;
  if (!heartbeatStale && (!progress.active || now - progressObservedAt < TABLE_TENNIS_PROGRESS_STALE_MS)) {
    await chrome.storage.local.set({
      [TABLE_TENNIS_HEALTH_WATCHDOG_STORAGE_KEY]: {
        ...previous,
        progressSignature: progress.signature,
        progressObservedAt,
        heartbeatAt,
        activeWork: progress.active,
        updatedAt: now
      }
    });
    return {
      reloaded: false,
      reason: progress.active ? "collector-progressing" : "heartbeat-healthy"
    };
  }
  const statusSourceId = normalizeTelegramText(
    scanStatus && scanStatus.bsportsfan && scanStatus.bsportsfan.dataSource
    || scanStatus && scanStatus.bsportsfan && scanStatus.bsportsfan.cipMonitor
      && scanStatus.bsportsfan.cipMonitor.sourceId
    || ""
  );
  const reloadBySource = previous.reloadBySource && typeof previous.reloadBySource === "object"
    ? previous.reloadBySource
    : {};
  if (!chrome.tabs || typeof chrome.tabs.query !== "function") {
    return { reloaded: false, reason: "tabs-unavailable" };
  }
  const tabs = await chrome.tabs.query({
    url: TABLE_TENNIS_TAB_URL_PATTERNS
  }).catch(() => []);
  const lastFocusedActiveTabs = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true
  }).catch(() => []);
  const lastFocusedActiveTabIds = new Set(
    (Array.isArray(lastFocusedActiveTabs) ? lastFocusedActiveTabs : [])
      .map((tab) => Number(tab && tab.id))
      .filter(Number.isInteger)
  );
  const sourceState = await getTableTennisSourceState().catch(() => (
    createDefaultTableTennisSourceState()
  ));
  const preferredSourceId = TABLE_TENNIS_SOURCE_ORIGINS[sourceState.activeSourceId]
    ? sourceState.activeSourceId
    : statusSourceId;
  const allCandidates = (Array.isArray(tabs) ? tabs : [])
    .filter((tab) => Number.isInteger(tab && tab.id))
    .sort((left, right) => {
      const listRank = (tab) => /\/(?:cip|c)\/table-tennis\/?(?:[?#]|$)/i.test(String(tab && tab.url || "")) ? 0 : 1;
      const focusedRank = (tab) => lastFocusedActiveTabIds.has(Number(tab && tab.id)) ? 0 : 1;
      const sourceRank = (tab) => getTableTennisDataSourceId(tab && tab.url || "") === preferredSourceId ? 0 : 1;
      return listRank(left) - listRank(right)
        || focusedRank(left) - focusedRank(right)
        || sourceRank(left) - sourceRank(right)
        || Number(Boolean(right && right.active)) - Number(Boolean(left && left.active));
    });
  const candidates = allSourcesProtected
    ? allCandidates
    : allCandidates.filter((tab) => {
        const sourceId = getTableTennisDataSourceId(tab && tab.url || "");
        return Boolean(sourceId && !protectionErrors[sourceId]);
      });
  const collectorLease = await getTableTennisCollectorLease().catch(() => null);
  const leaderTabId = Number(collectorLease && collectorLease.tabId);
  const tab = candidates.find((candidate) => (
    Number.isInteger(leaderTabId) && candidate.id === leaderTabId
  )) || candidates[0];
  if (!tab || typeof chrome.tabs.reload !== "function") {
    return { reloaded: false, reason: "bsportsfan-tab-missing" };
  }
  const reloadSourceId = getTableTennisDataSourceId(tab.url || "") || statusSourceId || "unknown";
  const lastReloadAt = Number(reloadBySource[reloadSourceId] || 0);
  if (lastReloadAt > 0 && now - lastReloadAt < TABLE_TENNIS_HEALTH_RELOAD_COOLDOWN_MS) {
    return { reloaded: false, reason: "reload-cooldown", sourceId: reloadSourceId };
  }
  await chrome.storage.local.set({
    [TABLE_TENNIS_HEALTH_WATCHDOG_STORAGE_KEY]: {
      lastReloadAt: now,
      reloadBySource: {
        ...reloadBySource,
        [reloadSourceId]: now
      },
      tabId: tab.id,
      heartbeatAt,
      progressSignature: progress.signature,
      progressObservedAt: now,
      activeWork: progress.active,
      lastProtectedProbeAt: allSourcesProtected
        ? now
        : Number(previous.lastProtectedProbeAt || 0),
      updatedAt: now
    }
  });
  await chrome.tabs.reload(tab.id);
  return {
    reloaded: true,
    tabId: tab.id,
    reason: allSourcesProtected
      ? "protected-source-revalidation"
      : heartbeatStale
        ? "heartbeat-stalled"
        : "collector-progress-stalled",
    heartbeatAgeMs: heartbeatAt > 0 ? now - heartbeatAt : null
  };
}

function summarizeTableTennisCollectorProgress(scanStatus, now = Date.now()) {
  const monitor = scanStatus && scanStatus.bsportsfan
    && scanStatus.bsportsfan.cipMonitor
    && typeof scanStatus.bsportsfan.cipMonitor === "object"
    ? scanStatus.bsportsfan.cipMonitor
    : {};
  const forecastStates = monitor.forecastStates && typeof monitor.forecastStates === "object"
    ? monitor.forecastStates
    : {};
  const matchStartStates = monitor.matchStartStates && typeof monitor.matchStartStates === "object"
    ? monitor.matchStartStates
    : {};
  const activeJobs = Array.isArray(monitor.forecastActiveJobs)
    ? monitor.forecastActiveJobs.map((job) => normalizeTelegramText(
        job && (job.matchUrl || job.url) || job || ""
      )).filter(Boolean).sort()
    : [];
  const errors = Array.isArray(monitor.forecastErrors) ? monitor.forecastErrors : [];
  const prewarmRows = Math.max(0, Number(monitor.prewarmRows || 0));
  const overdueCooling = errors.some((error) => (
    error && error.terminal !== true
    && Number.isFinite(Number(error.retryAt))
    && Number(error.retryAt) > 0
    && Number(error.retryAt) + 60 * 1000 <= now
  ));
  const active = activeJobs.length > 0
    || prewarmRows > 0
    || Number(monitor.forecastActiveWorkers || 0) > 0
    || Number(monitor.forecastQueueSize || 0) > 0
    || Number(forecastStates.loading || 0) > 0
    || Number(matchStartStates.pending || 0) > 0
    || Number(matchStartStates.sending || 0) > 0
    || overdueCooling;
  const details = Array.isArray(monitor.matchStartDetails)
    ? monitor.matchStartDetails.map((item) => [
        normalizeTelegramText(item && item.matchUrl || ""),
        normalizeTelegramText(item && item.status || ""),
        Number(item && item.updatedAt || 0)
      ])
    : [];
  return {
    active,
    signature: JSON.stringify([
      activeJobs,
      prewarmRows,
      Number(monitor.forecastActiveWorkers || 0),
      Number(monitor.forecastQueueSize || 0),
      Number(forecastStates.loading || 0),
      Number(forecastStates.cooling || 0),
      Number(forecastStates.ready || 0),
      Number(forecastStates.modelReady || 0),
      Number(forecastStates.modelPass || 0),
      Number(forecastStates.terminal || 0),
      Number(matchStartStates.pending || 0),
      Number(matchStartStates.sending || 0),
      Number(matchStartStates.sent || 0),
      Number(matchStartStates.decided || 0),
      Number(matchStartStates.expired || 0),
      Number(scanStatus && scanStatus.fetched || 0),
      Number(scanStatus && scanStatus.skipped || 0),
      Number(scanStatus && scanStatus.lastErrorCount || 0),
      overdueCooling,
      details
    ])
  };
}

function isBootstrapIndependentMessage(message) {
  return Boolean(message && [
    "lvr:fetchBsportsfanText",
    "lvr:acquireBsportsfanRequestSlot",
    "lvr:releaseBsportsfanRequestSlot",
    "lvr:reportBsportsfanProtection",
    "lvr:reportBsportsfanHealthy",
    "lvr:claimTableTennisCollector",
    "lvr:getTableTennisCollector",
    "lvr:notifyBsportsfanAttention",
    "lvr:prepareBsportsfanLiveSessionRecovery",
    "lvr:acquireBsportsfanForecastLease",
    "lvr:releaseBsportsfanForecastLease",
    "lvr:acquireBsportsfanResultBackfillLease",
    "lvr:releaseBsportsfanResultBackfillLease",
    "lvr:waitForRuntimeDeadline",
    "lvr:cancelRuntimeDeadline"
  ].includes(message.type));
}

function ensureBootstrapStorage() {
  if (!bootstrapPromise) {
    bootstrapPromise = bootstrapStorage().catch((error) => {
      console.warn("[Prematch Forecast] Bootstrap failed", error);
      bootstrapPromise = null;
      throw error;
    });
  }

  return bootstrapPromise;
}

function getRuntimeDeadlineKey(message, sender) {
  const deadlineId = normalizeTelegramText(message && message.deadlineId || "");
  return deadlineId ? `${getBsportsfanRequestOwner(sender)}|${deadlineId}` : "";
}

function waitForRuntimeDeadline(message, sender) {
  validateBsportsfanProxySender(sender);
  const key = getRuntimeDeadlineKey(message, sender);
  if (!key) {
    return Promise.resolve({ elapsed: false, reason: "deadline-id-missing" });
  }
  const timeoutMs = Math.min(
    RUNTIME_DEADLINE_MAX_MS,
    Math.max(100, Number(message.timeoutMs || 0) || 100)
  );
  const existing = runtimeDeadlineWaiters.get(key);
  if (existing) {
    clearTimeout(existing.timer);
    existing.resolve({ elapsed: false, cancelled: true, reason: "deadline-replaced" });
    runtimeDeadlineWaiters.delete(key);
  }
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      runtimeDeadlineWaiters.delete(key);
      resolve({ elapsed: true, deadlineId: normalizeTelegramText(message.deadlineId || "") });
    }, timeoutMs);
    runtimeDeadlineWaiters.set(key, { timer, resolve });
  });
}

function cancelRuntimeDeadline(message, sender) {
  validateBsportsfanProxySender(sender);
  const key = getRuntimeDeadlineKey(message, sender);
  const waiter = key ? runtimeDeadlineWaiters.get(key) : null;
  if (!waiter) {
    return { cancelled: false, reason: "deadline-not-found" };
  }
  clearTimeout(waiter.timer);
  runtimeDeadlineWaiters.delete(key);
  waiter.resolve({
    elapsed: false,
    cancelled: true,
    deadlineId: normalizeTelegramText(message.deadlineId || "")
  });
  return { cancelled: true };
}

function cancelRuntimeDeadlinesForOwner(ownerValue, reason = "owner-released") {
  const owner = normalizeTelegramText(ownerValue || "");
  if (!owner) {
    return 0;
  }
  let cancelled = 0;
  for (const [key, waiter] of runtimeDeadlineWaiters.entries()) {
    if (!key.startsWith(`${owner}|`)) {
      continue;
    }
    clearTimeout(waiter.timer);
    runtimeDeadlineWaiters.delete(key);
    waiter.resolve({ elapsed: false, cancelled: true, reason });
    cancelled += 1;
  }
  return cancelled;
}

async function handleMessage(message, sender = null) {
  if (!message || typeof message.type !== "string") {
    return {};
  }

  if (message.type === "lvr:setScanStatus") {
    return updateTableTennisScanStatus(message.status, sender);
  }

  if (message.type === "lvr:getScanStatus") {
    const { scanStatus } = await chrome.storage.local.get({ scanStatus: null });
    return { scanStatus };
  }

  if (message.type === "lvr:waitForRuntimeDeadline") {
    return waitForRuntimeDeadline(message, sender);
  }

  if (message.type === "lvr:cancelRuntimeDeadline") {
    return cancelRuntimeDeadline(message, sender);
  }

  if (message.type === "lvr:claimTableTennisCollector") {
    validateBsportsfanProxySender(sender);
    return claimTableTennisCollectorLease(sender, message.url, {
      allowActiveTabTakeover: message.allowActiveTabTakeover === true,
      documentNonce: message.documentNonce,
      documentStartedAt: message.documentStartedAt
    });
  }

  if (message.type === "lvr:getTableTennisCollector") {
    validateBsportsfanProxySender(sender);
    const lease = await getTableTennisCollectorLease().catch(() => null);
    return { collector: lease };
  }

  if (message.type === "lvr:fetchBsportsfanText") {
    return fetchBsportsfanTextShared(message.url, {
      cacheTtlMs: message.cacheTtlMs,
      deadlineAt: message.deadlineAt,
      priority: message.priority,
      sender
    });
  }

  if (message.type === "lvr:acquireBsportsfanRequestSlot") {
    const requestUrl = validateBsportsfanProxyRequest(message.url, sender);
    const sourceId = getTableTennisDataSourceId(requestUrl.href);
    await ensureTableTennisProtectionStateLoaded();
    throwIfTableTennisProtectionCircuitOpen(sourceId);
    return scheduleBsportsfanProxyFetch(
      () => grantBsportsfanNavigationLease(message.deadlineAt, sender, sourceId),
      message.deadlineAt,
      {
        priority: message.priority,
        kind: "navigation-slot",
        sourceId,
        owner: getBsportsfanRequestOwner(sender)
      }
    );
  }

  if (message.type === "lvr:releaseBsportsfanRequestSlot") {
    return releaseBsportsfanNavigationLease(message.token);
  }

  if (message.type === "lvr:reportBsportsfanProtection") {
    validateBsportsfanProxySender(sender);
    await ensureTableTennisProtectionStateLoaded();
    const pageSourceId = getTableTennisDataSourceId(
      message.url || sender && sender.url || ""
    );
    const collectorConfirmed = Boolean(
      await getConfirmedTableTennisCollectorLease(sender, pageSourceId, message)
    );
    if (message.visibleFailure !== true || !pageSourceId || !collectorConfirmed) {
      const sourceState = await getTableTennisSourceState();
      return {
        reported: false,
        reason: collectorConfirmed
          ? "non-visible-source-failure"
          : "non-collector-source-failure",
        ...buildTableTennisSourceRoute(sourceState, {
          currentSourceId: pageSourceId
        })
      };
    }
    const failureObservedAt = Math.min(
      Date.now(),
      Math.max(0, Number(message.observedAt || 0) || Date.now())
    );
    const stateBeforeFailure = await getTableTennisSourceState();
    if (
      failureObservedAt
      < Number(stateBeforeFailure.sources[pageSourceId].lastHealthyAt || 0)
    ) {
      return {
        reported: false,
        reason: "stale-visible-source-failure",
        ...buildTableTennisSourceRoute(stateBeforeFailure, {
          currentSourceId: pageSourceId
        })
      };
    }
    const manualRequired = message.manualRequired === true;
    const rateLimited = Number(message.status || 0) === 429
      || normalizeTelegramText(message.code || "") === "bsportsfan-rate-limited";
    const sessionExpired = normalizeTelegramText(message.code || "") === "bsportsfan-session-expired";
    const minimumCooldownMs = manualRequired
      ? TABLE_TENNIS_MANUAL_PROTECTION_PAUSE_MS
      : rateLimited
        ? TABLE_TENNIS_REQUEST_RETRY_MS
        : sessionExpired
          ? 5 * 60 * 1000
          : TABLE_TENNIS_PROTECTION_COOLDOWN_MS;
    const maximumCooldownMs = manualRequired
      ? TABLE_TENNIS_MANUAL_PROTECTION_PAUSE_MS
      : rateLimited
        ? 5 * 60 * 1000
        : sessionExpired
          ? 5 * 60 * 1000
          : 30 * 60 * 1000;
    const requestedCooldownMs = Math.min(
      maximumCooldownMs,
      Math.max(
        minimumCooldownMs,
        Number(message.retryAfterMs || 0) || 0
      )
    );
    const sourceId = pageSourceId;
    const transition = await openTableTennisProtectionCircuit(
      normalizeTelegramText(message.reason || message.code || "bsportsfan-challenge"),
      requestedCooldownMs,
      sourceId,
      failureObservedAt
    );
    const sourceState = transition.state;
    if (!transition.applied) {
      return {
        reported: false,
        reason: "stale-visible-source-failure",
        ...buildTableTennisSourceRoute(sourceState, {
          currentSourceId: pageSourceId
        })
      };
    }
    scheduleTelegramStatsRefresh("collector-protection", {
      createMissing: false,
      force: false
    });
    return {
      reported: true,
      retryAfterMs: Math.max(0, getTableTennisSourceProtectionOpenUntil(sourceId) - Date.now()),
      ...buildTableTennisSourceRoute(sourceState, {
        currentSourceId: pageSourceId
      })
    };
  }

  if (message.type === "lvr:notifyBsportsfanAttention") {
    return notifyBsportsfanAttention(message, sender);
  }

  if (message.type === "lvr:reportBsportsfanHealthy") {
    validateBsportsfanProxySender(sender);
    await ensureTableTennisProtectionStateLoaded();
    const sourceId = getTableTennisDataSourceId(
      message.url || sender && sender.url || ""
    );
    const collectorConfirmed = Boolean(
      sourceId && await getConfirmedTableTennisCollectorLease(sender, sourceId, message)
    );
    if (!collectorConfirmed) {
      const sourceState = await getTableTennisSourceState();
      return {
        healthy: false,
        accepted: false,
        cleared: false,
        reason: "non-collector-health-report",
        ...buildTableTennisSourceRoute(sourceState, {
          currentSourceId: sourceId
        })
      };
    }
    const currentSourceState = await getTableTennisSourceState();
    const currentSource = sourceId && currentSourceState.sources[sourceId] || {};
    const healthObservedAt = Math.min(
      Date.now(),
      Math.max(0, Number(message.observedAt || 0) || Date.now())
    );
    if (healthObservedAt < Number(currentSource.lastFailureAt || 0)) {
      return {
        healthy: false,
        accepted: false,
        cleared: false,
        reason: "stale-collector-health-report",
        ...buildTableTennisSourceRoute(currentSourceState, {
          currentSourceId: sourceId
        })
      };
    }
    const transition = await markTableTennisSourceHealthy(sourceId, {
      observedAt: healthObservedAt
    });
    const sourceState = transition.state;
    if (!transition.applied) {
      return {
        healthy: false,
        accepted: false,
        cleared: false,
        reason: "stale-collector-health-report",
        ...buildTableTennisSourceRoute(sourceState, {
          currentSourceId: sourceId
        })
      };
    }
    const cleared = transition.changed;
    if (cleared) {
      await chrome.storage.local.remove(BSPORTSFAN_ATTENTION_NOTIFICATION_KEY).catch(() => {});
    }
    if (cleared) {
      scheduleTelegramStatsRefresh("collector-healthy", {
        createMissing: false,
        force: false
      });
    }
    return {
      healthy: true,
      accepted: true,
      cleared,
      ...buildTableTennisSourceRoute(sourceState, {
        currentSourceId: sourceId
      })
    };
  }

  if (message.type === "lvr:prepareBsportsfanLiveSessionRecovery") {
    return prepareBsportsfanLiveSessionRecovery(sender, message);
  }

  if (message.type === "lvr:acquireBsportsfanForecastLease") {
    const matchUrl = normalizeTelegramMatchKey(message.matchUrl || "");
    if (!matchUrl) {
      return { granted: false, reason: "match-url-missing" };
    }
    if (message.requireCollector === true) {
      const sourceId = getTableTennisDataSourceId(sender && sender.url || "");
      const collectorConfirmed = Boolean(
        sourceId
        && await getConfirmedTableTennisCollectorLease(sender, sourceId, message)
      );
      if (!collectorConfirmed) {
        return { granted: false, reason: "stale-forecast-collector" };
      }
    }
    return mutateBsportsfanForecastLeases(async () => {
      const matchIdentity = getTelegramMatchIdentityKey(matchUrl);
      const now = Date.now();
      pruneBsportsfanForecastLeases(now);
      const existing = bsportsfanForecastLeases.get(matchIdentity);
      const owner = getBsportsfanRequestOwner(sender);
      const requestedSourceId = getTableTennisDataSourceId(
        matchUrl || sender && sender.url || ""
      );
      const requestedDocumentId = normalizeTelegramText(sender && sender.documentId || "");
      const requestedDocumentNonce = normalizeTelegramText(message.documentNonce || "");
      const sameOwnerTakeover = existing
        && isSameBsportsfanRequestOwner(existing.owner, owner)
        && (
          !normalizeTelegramText(existing.sourceId || "")
          || normalizeTelegramText(existing.sourceId || "") !== requestedSourceId
          || Boolean(
            requestedDocumentId
            && normalizeTelegramText(existing.documentId || "")
            && normalizeTelegramText(existing.documentId || "") !== requestedDocumentId
          )
          || Boolean(
            requestedDocumentNonce
            && normalizeTelegramText(existing.documentNonce || "")
            && normalizeTelegramText(existing.documentNonce || "") !== requestedDocumentNonce
          )
        );
      if (
        existing
        && Number(existing.leaseUntil || 0) > now
        && !sameOwnerTakeover
      ) {
        return {
          granted: false,
          reason: "another-tab-forecast",
          retryAfterMs: Number(existing.leaseUntil || 0) - now
        };
      }
      const leaseMs = Math.min(
        BSPORTSFAN_FORECAST_LEASE_MAX_MS,
        Math.max(5000, Number(message.leaseMs || 0) || BSPORTSFAN_FORECAST_LEASE_MAX_MS)
      );
      const token = createBsportsfanLeaseToken("forecast");
      const leaseUntil = now + leaseMs;
      const generation = Math.max(0, Number(existing && existing.generation || 0)) + 1;
      bsportsfanForecastLeases.set(matchIdentity, {
        token,
        leaseUntil,
        owner,
        sourceId: requestedSourceId,
        documentId: requestedDocumentId,
        documentNonce: requestedDocumentNonce,
        generation
      });
      await persistBsportsfanForecastLeases();
      return {
        granted: true,
        token,
        leaseUntil,
        sourceId: requestedSourceId,
        generation,
        takeover: Boolean(sameOwnerTakeover)
      };
    });
  }

  if (message.type === "lvr:releaseBsportsfanForecastLease") {
    const matchUrl = normalizeTelegramMatchKey(message.matchUrl || "");
    const matchIdentity = getTelegramMatchIdentityKey(matchUrl);
    const token = normalizeTelegramText(message.token || "");
    return mutateBsportsfanForecastLeases(async () => {
      const existing = matchIdentity ? bsportsfanForecastLeases.get(matchIdentity) : null;
      if (existing && token && token === existing.token) {
        bsportsfanForecastLeases.delete(matchIdentity);
        await persistBsportsfanForecastLeases();
        return { released: true };
      }
      return { released: false, reason: "lease-token-mismatch" };
    });
  }

  if (message.type === "lvr:acquireBsportsfanResultBackfillLease") {
    await ensureTableTennisProtectionStateLoaded();
    if (message.requireCollector === true) {
      const sourceId = getTableTennisDataSourceId(sender && sender.url || "");
      const collectorConfirmed = Boolean(
        sourceId
        && await getConfirmedTableTennisCollectorLease(sender, sourceId, message)
      );
      if (!collectorConfirmed) {
        return { granted: false, reason: "non-collector-backfill" };
      }
    }
    const now = Date.now();
    const requestedLeaseMs = Math.max(1000, Number(message.leaseMs || 0) || 0);
    const leaseMs = Math.min(BSPORTSFAN_RESULT_BACKFILL_LEASE_MAX_MS, requestedLeaseMs);
    const owner = getBsportsfanRequestOwner(sender);
    const mayReplaceOwnerLease = message.replaceOwnerLease === true
      && isSameBsportsfanRequestOwner(bsportsfanResultBackfillLeaseOwner, owner);
    if (bsportsfanResultBackfillLeaseUntil > now && !mayReplaceOwnerLease) {
      return {
        granted: false,
        retryAfterMs: bsportsfanResultBackfillLeaseUntil - now
      };
    }
    const nextLeaseOwner = owner;
    const nextLeaseUntil = now + leaseMs;
    const nextLeaseToken = createBsportsfanLeaseToken("maintenance");
    const sessionStorage = chrome.storage && chrome.storage.session;
    if (!sessionStorage || typeof sessionStorage.set !== "function") {
      return { granted: false, reason: "maintenance-lease-storage-unavailable" };
    }
    try {
      await sessionStorage.set({
        [BSPORTSFAN_MAINTENANCE_LEASE_STORAGE_KEY]: {
          owner: nextLeaseOwner,
          token: nextLeaseToken,
          leaseUntil: nextLeaseUntil
        }
      });
    } catch (_) {
      return { granted: false, reason: "maintenance-lease-persist-failed" };
    }
    bsportsfanResultBackfillLeaseOwner = nextLeaseOwner;
    bsportsfanResultBackfillLeaseUntil = nextLeaseUntil;
    bsportsfanResultBackfillLeaseToken = nextLeaseToken;
    return {
      granted: true,
      leaseUntil: bsportsfanResultBackfillLeaseUntil,
      token: bsportsfanResultBackfillLeaseToken
    };
  }

  if (message.type === "lvr:releaseBsportsfanResultBackfillLease") {
    await ensureTableTennisProtectionStateLoaded();
    const token = normalizeTelegramText(message.token || "");
    if (token && token === bsportsfanResultBackfillLeaseToken) {
      bsportsfanResultBackfillLeaseUntil = 0;
      bsportsfanResultBackfillLeaseOwner = "";
      bsportsfanResultBackfillLeaseToken = "";
      const sessionStorage = chrome.storage && chrome.storage.session;
      if (sessionStorage && typeof sessionStorage.remove === "function") {
        await sessionStorage.remove(BSPORTSFAN_MAINTENANCE_LEASE_STORAGE_KEY);
      }
      return { released: true };
    }
    return { released: false, reason: "lease-token-mismatch" };
  }

  if (message.type === "lvr:prepareExtensionReload") {
    await clearBsportsfanTransientRuntimeState(true);
    await chrome.storage.local.set({ [EXTENSION_FORCE_TAB_RELOAD_KEY]: true });
    await flushTelegramPredictionPointSnapshots();
    return { prepared: true };
  }

  if (message.type === "lvr:getTelegramSettings") {
    return { telegramSettings: redactTelegramSettings(await getTelegramSettings()) };
  }

  if (message.type === "lvr:setTelegramSettings") {
    const rawTelegramSettings = message.telegramSettings || {};
    await validateSuppliedTelegramBotToken(rawTelegramSettings);
    const telegramSettings = sanitizeTelegramSettings(rawTelegramSettings, await getTelegramSettings());
    await chrome.storage.local.set({ [TELEGRAM_SETTINGS_KEY]: telegramSettings });
    const statsMessage = telegramSettings.enabled && telegramSettings.botToken && telegramSettings.chatId
      ? await updateTelegramStatsMessage("prematch-settings-saved", { force: true }).catch((error) => ({
        updated: false,
        reason: "stats-update-error",
        error: stringifyError(error)
      }))
      : null;
    return { telegramSettings: redactTelegramSettings(telegramSettings), statsMessage };
  }

  if (message.type === "lvr:sendTelegramPrediction") {
    if (message.requireCollector === true) {
      const sourceId = getTableTennisDataSourceId(sender && sender.url || "");
      const collectorConfirmed = Boolean(
        sourceId
        && await getConfirmedTableTennisCollectorLease(sender, sourceId, message)
      );
      if (!collectorConfirmed) {
        return {
          sent: false,
          accepted: false,
          reason: "stale-prediction-collector"
        };
      }
    }
    return sendTelegramPrediction(message.prediction || {}, {
      requireCollector: message.requireCollector === true,
      sender,
      identity: message
    });
  }

  if (message.type === "lvr:updateTelegramPredictionResult") {
    if (message.requireCollector === true) {
      const sourceId = getTableTennisDataSourceId(sender && sender.url || "");
      const collectorConfirmed = Boolean(
        sourceId
        && await getConfirmedTableTennisCollectorLease(sender, sourceId, message)
      );
      if (!collectorConfirmed) {
        return {
          edited: false,
          datasetRecorded: false,
          reason: "stale-result-collector"
        };
      }
    }
    return updateTelegramPredictionResult(message.result || {});
  }

  if (message.type === "lvr:recordTelegramPredictionPointSnapshot") {
    const record = await saveTelegramPredictionDatasetPointSnapshot(message.snapshot || message.pointSnapshot || {});
    return { recorded: Boolean(record), record };
  }

  if (message.type === "lvr:recordTelegramPredictionDataset") {
    const rawRecord = message.record || message.entry || {};
    const datasetRecord = await saveTelegramPredictionDatasetFromRecord(rawRecord);
    const statsMessage = datasetRecord
      ? scheduleTelegramStatsRefresh("match-processed", { force: true })
      : null;
    return {
      recorded: Boolean(datasetRecord),
      record: datasetRecord,
      datasetRecord,
      statsMessage
    };
  }

  if (message.type === "lvr:patchTelegramPredictionHistoricalOpeningOdds") {
    const record = await saveTelegramPredictionDatasetHistoricalOpeningOdds(message.quote || message.market || {});
    return { recorded: Boolean(record), record };
  }

  if (message.type === "lvr:getTelegramPredictionDataset") {
    await flushTelegramPredictionPointSnapshots();
    const dataset = await readTelegramPredictionDataset();
    return {
      dataset,
      summary: message.includeSummary === true ? summarizeTelegramStatsRows(dataset) : null
    };
  }

  if (message.type === "lvr:clearTelegramPredictionDataset") {
    const cleared = await clearTelegramPredictionDataset();
    const statsMessage = await updateTelegramStatsMessage("archive-cleared", { force: true })
      .catch((error) => ({
        updated: false,
        reason: "stats-update-error",
        error: stringifyError(error)
      }));
    return { ...cleared, statsMessage };
  }

  if (message.type === "lvr:updateTelegramStatsMessage") {
    return updateTelegramStatsMessage(message.reason || "manual", {
      force: true,
      recreate: message.recreate === true
    });
  }

  if (message.type === "lvr:getTelegramPipelineStatus") {
    return getTelegramPipelineStatus();
  }

  if (message.type === "lvr:testTelegram") {
    const telegramSettings = await getTelegramSettings();
    const sent = await sendTelegramMessage("Тест: Telegram прогнозов подключен.", telegramSettings);
    const statsMessage = await updateTelegramStatsMessage("prematch-test", { force: true }).catch((error) => ({
      updated: false,
      reason: "stats-update-error",
      error: stringifyError(error)
    }));
    return { sent, statsMessage };
  }

  return {};
}

function updateTableTennisScanStatus(statusValue, sender) {
  const operation = tableTennisScanStatusMutationChain
    .catch(() => {})
    .then(async () => {
      validateBsportsfanProxySender(sender);
      const incoming = statusValue && typeof statusValue === "object"
        ? statusValue
        : {};
      const incomingSnapshot = incoming.bsportsfan && typeof incoming.bsportsfan === "object"
        ? incoming.bsportsfan
        : {};
      const senderSourceId = getTableTennisDataSourceId(
        incomingSnapshot.url
        || sender && sender.url
        || ""
      );
      const collectorLease = senderSourceId
        ? await getConfirmedTableTennisCollectorLease(sender, senderSourceId, incoming)
        : null;
      if (!collectorLease) {
        return {
          ignored: true,
          reason: "non-collector-scan-status"
        };
      }

      const now = Date.now();
      const observedAt = Math.min(
        now,
        Math.max(
          0,
          Number(incoming.observedAt || incomingSnapshot.ts || incomingSnapshot.observedAt || 0)
            || now
        )
      );
      const stored = await chrome.storage.local.get({ scanStatus: null });
      const previous = stored.scanStatus && typeof stored.scanStatus === "object"
        ? stored.scanStatus
        : {};
      const statusKind = normalizeTableTennisScanStatusKind(incoming);
      const previousCollector = previous.collector && typeof previous.collector === "object"
        ? previous.collector
        : {};
      const sameCollector = Number(previousCollector.tabId) === Number(collectorLease.tabId)
        && normalizeTelegramText(previousCollector.sourceId || "") === senderSourceId
        && normalizeTelegramText(previousCollector.leaseToken || "")
          === normalizeTelegramText(collectorLease.token || "")
        && normalizeTelegramText(previousCollector.documentNonce || "")
          === normalizeTelegramText(collectorLease.documentNonce || "");
      const previousObservedAt = Math.max(
        0,
        Number(
          previous.observedAt
          || previous.bsportsfan && previous.bsportsfan.ts
          || previous.bsportsfan && previous.bsportsfan.observedAt
          || 0
        ) || 0
      );
      const previousStatusKind = normalizeTableTennisScanStatusKind(previous);
      if (
        sameCollector
        && (
          observedAt < previousObservedAt
          || observedAt === previousObservedAt
            && getTableTennisScanStatusPrecedence(statusKind)
              < getTableTennisScanStatusPrecedence(previousStatusKind)
        )
      ) {
        return {
          ignored: true,
          reason: "stale-scan-status",
          observedAt,
          previousObservedAt
        };
      }

      const previousSnapshot = sameCollector
        && previous.bsportsfan
        && typeof previous.bsportsfan === "object"
        ? previous.bsportsfan
        : {};
      const mergedSnapshot = statusKind === "snapshot"
        ? { ...incomingSnapshot }
        : { ...previousSnapshot, ...incomingSnapshot };
      mergedSnapshot.dataSource = senderSourceId;
      mergedSnapshot.url = normalizeTelegramText(
        incomingSnapshot.url || sender && sender.url || previousSnapshot.url || ""
      );
      mergedSnapshot.ts = observedAt;

      const status = {
        ...(sameCollector ? previous : {}),
        ...incoming,
        source: "table-tennis",
        statusKind,
        observedAt,
        bsportsfan: mergedSnapshot,
        collector: {
          tabId: Number(collectorLease.tabId),
          sourceId: senderSourceId,
          leaseToken: normalizeTelegramText(collectorLease.token || ""),
          documentNonce: normalizeTelegramText(collectorLease.documentNonce || ""),
          leaseUpdatedAt: Number(collectorLease.updatedAt || 0)
        },
        ts: now
      };
      await chrome.storage.local.set({ scanStatus: status });
      const sourceHealth = await reconcileTableTennisSourceHealthFromScanStatus(status)
        .catch(() => ({ cleared: false, sourceId: "" }));
      return { status, sourceHealth };
    });
  tableTennisScanStatusMutationChain = operation.then(() => undefined, () => undefined);
  return operation.then((result) => {
    if (!result || result.ignored !== true) {
      schedulePendingTelegramPredictionResultEditRetry();
    }
    return result;
  });
}

function normalizeTableTennisScanStatusKind(value) {
  const status = value && typeof value === "object" ? value : {};
  const explicit = normalizeTelegramText(status.statusKind || "").toLowerCase();
  if (["snapshot", "progress", "protection", "recovery"].includes(explicit)) {
    return explicit;
  }
  const source = normalizeTelegramText(status.source || "").toLowerCase();
  const snapshot = status.bsportsfan && typeof status.bsportsfan === "object"
    ? status.bsportsfan
    : {};
  if (source.includes("progress")) return "progress";
  if (snapshot.challenge === true) return "protection";
  if (snapshot.sessionRecovery && snapshot.sessionRecovery.active === true) return "recovery";
  return "snapshot";
}

function getTableTennisScanStatusPrecedence(kindValue) {
  const kind = normalizeTelegramText(kindValue || "").toLowerCase();
  return {
    progress: 0,
    recovery: 1,
    protection: 2,
    snapshot: 3
  }[kind] ?? 0;
}

function schedulePendingTelegramPredictionResultEditRetry() {
  if (telegramResultEditRetryInFlight) {
    return telegramResultEditRetryInFlight;
  }
  const operation = Promise.resolve()
    .then(() => maybeRetryPendingTelegramPredictionResultEdit())
    .catch((error) => ({
      retried: false,
      reason: "retry-error",
      error: stringifyError(error)
    }))
    .finally(() => {
      if (telegramResultEditRetryInFlight === operation) {
        telegramResultEditRetryInFlight = null;
      }
    });
  telegramResultEditRetryInFlight = operation;
  return operation;
}

async function clearBsportsfanTransientRuntimeState(clearProtection = false) {
  await bsportsfanForecastLeaseMutationChain.catch(() => {});
  releaseBsportsfanNavigationLease(bsportsfanNavigationLeaseToken, true);
  bsportsfanResultBackfillLeaseUntil = 0;
  bsportsfanResultBackfillLeaseOwner = "";
  bsportsfanResultBackfillLeaseToken = "";
  bsportsfanForecastLeases.clear();
  bsportsfanProxyResponseCache.clear();
  tableTennisCollectorLeaseCache = null;
  tableTennisCollectorLeaseLoaded = false;
  tableTennisCollectorLeaseLoadPromise = null;
  if (clearProtection) {
    for (const circuit of Object.values(tableTennisProtectionCircuits)) {
      circuit.openUntil = 0;
      circuit.reason = "";
    }
    await resetTableTennisSourceState();
  }
  const sessionStorage = chrome.storage && chrome.storage.session;
  if (sessionStorage && typeof sessionStorage.remove === "function") {
    const stored = typeof sessionStorage.get === "function"
      ? await sessionStorage.get({
          [LEGACY_BSPORTSFAN_RESULT_RECOVERY_STORAGE_KEY]: null
        }).catch(() => ({}))
      : {};
    const legacyCrawlerTabId = Number(
      stored
      && stored[LEGACY_BSPORTSFAN_RESULT_RECOVERY_STORAGE_KEY]
      && stored[LEGACY_BSPORTSFAN_RESULT_RECOVERY_STORAGE_KEY].tabId
    );
    const keys = [
      BSPORTSFAN_NAVIGATION_LEASE_STORAGE_KEY,
      BSPORTSFAN_FORECAST_LEASES_STORAGE_KEY,
      BSPORTSFAN_MAINTENANCE_LEASE_STORAGE_KEY,
      LEGACY_BSPORTSFAN_RESULT_RECOVERY_STORAGE_KEY,
      TABLE_TENNIS_COLLECTOR_LEASE_STORAGE_KEY
    ];
    if (clearProtection) {
      keys.push(LEGACY_BSPORTSFAN_PROXY_PROTECTION_STORAGE_KEY);
    }
    await sessionStorage.remove(keys);
    if (
      Number.isInteger(legacyCrawlerTabId)
      && legacyCrawlerTabId > 0
      && chrome.tabs
      && typeof chrome.tabs.remove === "function"
    ) {
      await chrome.tabs.remove(legacyCrawlerTabId).catch(() => {});
    }
  }
  if (clearProtection) {
    await chrome.storage.local.remove(BSPORTSFAN_ATTENTION_NOTIFICATION_KEY).catch(() => {});
  }
}

async function fetchBsportsfanTextShared(value, options = {}) {
  const requestUrl = validateBsportsfanProxyRequest(value, options.sender);
  const sourceId = getTableTennisDataSourceId(requestUrl.href);
  await ensureTableTennisProtectionStateLoaded();
  throwIfTableTennisProtectionCircuitOpen(sourceId);

  const cacheKey = normalizeBsportsfanProxyCacheKey(value);
  const now = Date.now();
  const cached = bsportsfanProxyResponseCache.get(cacheKey);
  if (cached && Number(cached.expiresAt || 0) > now && cached.response) {
    bsportsfanProxyResponseCache.delete(cacheKey);
    bsportsfanProxyResponseCache.set(cacheKey, cached);
    bsportsfanProxyFetchMetrics.cacheHits += 1;
    return {
      ...cached.response,
      cached: true
    };
  }
  if (cached) {
    bsportsfanProxyResponseCache.delete(cacheKey);
  }

  const existing = bsportsfanProxyFetchInFlight.get(cacheKey);
  if (existing) {
    bsportsfanProxyFetchMetrics.coalesced += 1;
    if (reprioritizeBsportsfanProxyFetchJob(existing.job, options.priority, options.deadlineAt)) {
      bsportsfanProxyFetchMetrics.reprioritized += 1;
    }
    return existing.promise;
  }

  const requestedCacheTtlMs = Number(options.cacheTtlMs);
  const cacheTtlMs = Math.min(
    BSPORTSFAN_PROXY_CACHE_MAX_TTL_MS,
    Math.max(
      0,
      Number.isFinite(requestedCacheTtlMs) && requestedCacheTtlMs > 0
        ? requestedCacheTtlMs
        : BSPORTSFAN_PROXY_CACHE_DEFAULT_TTL_MS
    )
  );
  const scheduled = enqueueBsportsfanProxyFetch(
    (externalSignal) => fetchBsportsfanText(value, {
      deadlineAt: options.deadlineAt,
      sender: options.sender,
      priority: options.priority,
      externalSignal
    }),
    options.deadlineAt,
    {
      priority: options.priority,
      kind: "fetch-text",
      sourceId,
      cacheKey,
      owner: getBsportsfanRequestOwner(options.sender)
    }
  );
  const inFlightEntry = {
    promise: null,
    job: scheduled.job
  };
  const request = scheduled.promise.then((response) => {
    if (cacheTtlMs > 0 && !getTableTennisProtectionCircuitError(sourceId)) {
      setBsportsfanProxyResponseCache(cacheKey, response, cacheTtlMs);
    }
    return response;
  }).finally(() => {
    if (bsportsfanProxyFetchInFlight.get(cacheKey) === inFlightEntry) {
      bsportsfanProxyFetchInFlight.delete(cacheKey);
    }
  });
  inFlightEntry.promise = request;
  bsportsfanProxyFetchInFlight.set(cacheKey, inFlightEntry);
  return request;
}

function scheduleBsportsfanProxyFetch(task, deadlineAtValue, options = {}) {
  return enqueueBsportsfanProxyFetch(task, deadlineAtValue, options).promise;
}

function enqueueBsportsfanProxyFetch(task, deadlineAtValue, options = {}) {
  const requestedDeadlineAt = Number(deadlineAtValue || 0);
  const deadlineAt = Number.isFinite(requestedDeadlineAt) && requestedDeadlineAt > 0
    ? requestedDeadlineAt
    : Date.now() + BSPORTSFAN_PROXY_FETCH_TIMEOUT_MS;
  const job = {
    task,
    deadlineAt,
    priority: normalizeBsportsfanRequestPriority(options.priority),
    kind: String(options.kind || "request"),
    sourceId: TABLE_TENNIS_SOURCE_ORIGINS[options.sourceId]
      ? options.sourceId
      : getTableTennisDataSourceId(options.cacheKey),
    cacheKey: String(options.cacheKey || ""),
    owner: normalizeTelegramText(options.owner || ""),
    sequence: ++bsportsfanProxyFetchSequence,
    state: "queued",
    abortController: new AbortController(),
    resolve: null,
    reject: null
  };
  const promise = new Promise((resolve, reject) => {
    job.resolve = resolve;
    job.reject = reject;
    pruneExpiredBsportsfanProxyFetchJobs();
    if (!makeRoomForBsportsfanProxyFetchJob(job)) {
      job.state = "dropped";
      bsportsfanProxyFetchMetrics.dropped += 1;
      reject(createServiceWorkerError(
        "BsportsFan request queue is full",
        "bsportsfan-queue-full"
      ));
      return;
    }
    bsportsfanProxyFetchQueue.push(job);
    sortBsportsfanProxyFetchQueue();
    bsportsfanProxyFetchMetrics.enqueued += 1;
    bsportsfanProxyFetchMetrics.peakQueued = Math.max(
      bsportsfanProxyFetchMetrics.peakQueued,
      bsportsfanProxyFetchQueue.length
    );
    drainBsportsfanProxyFetchQueue();
  });
  return { promise, job };
}

function normalizeBsportsfanRequestPriority(value) {
  const policy = globalThis.LvrPipelinePolicy;
  return policy && typeof policy.normalizeRequestPriority === "function"
    ? policy.normalizeRequestPriority(value)
    : Math.max(0, Math.min(4, Number.isFinite(Number(value)) ? Number(value) : 2));
}

function getBsportsfanRequestIntervalMs(priority) {
  const normalized = normalizeBsportsfanRequestPriority(priority);
  if (normalized <= 0) return BSPORTSFAN_PROXY_FETCH_MIN_INTERVAL_MS;
  if (normalized === 1) return 7500;
  if (normalized === 2) return 10000;
  if (normalized === 3) return 15000;
  return 20000;
}

function compareBsportsfanProxyFetchJobs(left, right) {
  const policy = globalThis.LvrPipelinePolicy;
  if (policy && typeof policy.compareRequestJobs === "function") {
    return policy.compareRequestJobs(left, right);
  }
  return normalizeBsportsfanRequestPriority(left && left.priority)
    - normalizeBsportsfanRequestPriority(right && right.priority)
    || Number(left && left.deadlineAt || 0) - Number(right && right.deadlineAt || 0)
    || Number(left && left.sequence || 0) - Number(right && right.sequence || 0);
}

function sortBsportsfanProxyFetchQueue() {
  bsportsfanProxyFetchQueue.sort(compareBsportsfanProxyFetchJobs);
}

function reprioritizeBsportsfanProxyFetchJob(job, priority, deadlineAt) {
  if (!job || job.state !== "queued") {
    return false;
  }
  const policy = globalThis.LvrPipelinePolicy;
  const changed = policy && typeof policy.mergeRequestJobUrgency === "function"
    ? policy.mergeRequestJobUrgency(job, priority, deadlineAt)
    : false;
  if (changed) {
    sortBsportsfanProxyFetchQueue();
    drainBsportsfanProxyFetchQueue();
  }
  return changed;
}

function pruneExpiredBsportsfanProxyFetchJobs(now = Date.now()) {
  for (let index = bsportsfanProxyFetchQueue.length - 1; index >= 0; index -= 1) {
    const job = bsportsfanProxyFetchQueue[index];
    if (job && Number(job.deadlineAt || 0) > Number(now)) {
      continue;
    }
    bsportsfanProxyFetchQueue.splice(index, 1);
    if (job) {
      job.state = "expired";
      bsportsfanProxyFetchMetrics.expired += 1;
      job.reject(createServiceWorkerError(
        "BsportsFan request expired in queue",
        "bsportsfan-expired"
      ));
    }
  }
}

function makeRoomForBsportsfanProxyFetchJob(incoming) {
  if (bsportsfanProxyFetchQueue.length < BSPORTSFAN_PROXY_FETCH_QUEUE_MAX) {
    return true;
  }
  sortBsportsfanProxyFetchQueue();
  const worst = bsportsfanProxyFetchQueue[bsportsfanProxyFetchQueue.length - 1];
  if (!worst || compareBsportsfanProxyFetchJobs(incoming, worst) >= 0) {
    return false;
  }
  bsportsfanProxyFetchQueue.pop();
  worst.state = "dropped";
  bsportsfanProxyFetchMetrics.dropped += 1;
  worst.reject(createServiceWorkerError(
    "BsportsFan background request displaced by a more urgent match",
    "bsportsfan-preempted"
  ));
  return true;
}

function createBsportsfanLeaseToken(prefix = "lease") {
  const randomPart = globalThis.crypto && typeof globalThis.crypto.randomUUID === "function"
    ? globalThis.crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${randomPart}`;
}

function getBsportsfanRequestOwner(sender) {
  if (Number.isInteger(sender && sender.tab && sender.tab.id)) {
    return `tab:${sender.tab.id}`;
  }
  const documentId = normalizeTelegramText(sender && sender.documentId || "");
  if (documentId) {
    return `document:${documentId}`;
  }
  return normalizeTelegramText(sender && sender.url || "unknown");
}

function isSameBsportsfanRequestOwner(leftValue, rightValue) {
  const normalizeOwner = (value) => {
    const text = normalizeTelegramText(value || "");
    return /^\d+$/.test(text) ? `tab:${text}` : text;
  };
  const left = normalizeOwner(leftValue);
  const right = normalizeOwner(rightValue);
  return Boolean(left && right && left === right);
}

function notifyBsportsfanAttention(value = {}, sender = null) {
  validateBsportsfanProxySender(sender);
  const operation = bsportsfanAttentionNotificationChain
    .catch(() => {})
    .then(() => notifyBsportsfanAttentionNow(value, sender));
  bsportsfanAttentionNotificationChain = operation.then(() => undefined, () => undefined);
  return operation;
}

function areAllTableTennisSourcesUnavailable(sourceState, now = Date.now()) {
  return TABLE_TENNIS_SOURCE_IDS.every((sourceId) => {
    const source = sourceState && sourceState.sources && sourceState.sources[sourceId] || {};
    return Number(source.cooldownUntil || 0) > now
      && normalizeTelegramText(source.lastObservationKind || "") === "failure";
  });
}

async function notifyBsportsfanAttentionNow(value = {}, sender = null) {
  await new Promise((resolve) => setTimeout(resolve, BSPORTSFAN_ATTENTION_CONFIRMATION_DELAY_MS));
  const sourceId = getTableTennisDataSourceId(
    value.url || sender && sender.url || ""
  );
  const collectorConfirmed = Boolean(
    sourceId
    && await getConfirmedTableTennisCollectorLease(sender, sourceId, value)
  );
  if (!collectorConfirmed) {
    return { notified: false, reason: "stale-collector-notification" };
  }
  await ensureTableTennisProtectionStateLoaded();
  const now = Date.now();
  const kind = normalizeTelegramText(value.kind || value.code || "security-challenge");
  const stored = await chrome.storage.local.get({
    [BSPORTSFAN_ATTENTION_NOTIFICATION_KEY]: null,
    scanStatus: null
  });
  await reconcileTableTennisSourceHealthFromScanStatus(stored.scanStatus, now).catch(() => {});
  const sourceState = await getTableTennisSourceState();
  const allUnavailable = areAllTableTennisSourcesUnavailable(sourceState, now);
  if (!allUnavailable) {
    await chrome.storage.local.remove(BSPORTSFAN_ATTENTION_NOTIFICATION_KEY).catch(() => {});
    return {
      notified: false,
      reason: "healthy-source-available"
    };
  }

  const previous = stored && stored[BSPORTSFAN_ATTENTION_NOTIFICATION_KEY];
  const previousAt = Number(previous && previous.notifiedAt || 0);
  if (previousAt > 0 && now - previousAt < BSPORTSFAN_ATTENTION_NOTIFICATION_TTL_MS) {
    return {
      notified: false,
      reason: "notification-cooldown",
      retryAfterMs: BSPORTSFAN_ATTENTION_NOTIFICATION_TTL_MS - (now - previousAt)
    };
  }

  const settings = await getTelegramSettings();
  if (!settings.enabled || !settings.botToken || !settings.chatId) {
    return { notified: false, reason: "telegram-disabled" };
  }
  const latestStored = await chrome.storage.local.get({ scanStatus: null });
  await reconcileTableTennisSourceHealthFromScanStatus(latestStored.scanStatus).catch(() => {});
  const latestSourceState = await getTableTennisSourceState();
  if (!areAllTableTennisSourcesUnavailable(latestSourceState)) {
    await chrome.storage.local.remove(BSPORTSFAN_ATTENTION_NOTIFICATION_KEY).catch(() => {});
    return {
      notified: false,
      reason: "source-recovered-before-notification"
    };
  }
  const sessionExpired = kind === "session-expired";
  const text = sessionExpired
    ? [
        "🟠 <b>BSportsFan временно недоступен</b>",
        "Автоматическое повторное подключение уже включено.",
        "Если сбор не восстановится, проверьте открытую вкладку сайта."
      ].join("\n")
    : [
        "🔴 <b>BSportsFan временно недоступен</b>",
        "Расширение остановило запросы и повторит подключение автоматически.",
        "Ручное действие потребуется только если сайт продолжит показывать CAPTCHA."
      ].join("\n");
  const result = await sendTelegramMessage(text, settings);
  await chrome.storage.local.set({
    [BSPORTSFAN_ATTENTION_NOTIFICATION_KEY]: {
      kind,
      notifiedAt: Date.now(),
      observedAt: Number(value.observedAt || 0) || now
    }
  });
  return { notified: true, result };
}

async function prepareBsportsfanLiveSessionRecovery(sender, value = {}) {
  validateBsportsfanProxySender(sender);
  const owner = getBsportsfanRequestOwner(sender);
  const sourceId = getTableTennisDataSourceId(sender && sender.url || "");
  const collectorConfirmed = Boolean(
    sourceId && await getConfirmedTableTennisCollectorLease(sender, sourceId, value)
  );
  if (!collectorConfirmed) {
    return {
      prepared: false,
      reason: "non-collector-session-recovery",
      owner
    };
  }
  await Promise.all([
    ensureTableTennisProtectionStateLoaded(),
    ensureBsportsfanForecastLeasesLoaded()
  ]);

  for (const key of Array.from(bsportsfanProxyResponseCache.keys())) {
    if (getTableTennisDataSourceId(key) === sourceId) {
      bsportsfanProxyResponseCache.delete(key);
    }
  }
  const sessionError = createServiceWorkerError(
    "BsportsFan live session expired",
    "bsportsfan-session-expired"
  );
  sessionError.retryAfterMs = 0;
  const queuedBefore = bsportsfanProxyFetchQueue.length;
  const hadNavigationLease = Boolean(
    bsportsfanNavigationLeaseToken
    && (!bsportsfanNavigationLeaseSourceId || bsportsfanNavigationLeaseSourceId === sourceId)
  );
  await openTableTennisProtectionCircuit(
    "bsportsfan-session-recovery",
    5 * 60 * 1000,
    sourceId
  );

  let activeCancelled = 0;
  for (const job of bsportsfanProxyActiveJobs) {
    if (
      job
      && normalizeTelegramText(job.sourceId || "") === sourceId
      && job.abortController
      && !job.abortController.signal.aborted
    ) {
      job.abortController.abort(sessionError);
      activeCancelled += 1;
    }
  }

  const navigationReleased = hadNavigationLease && !bsportsfanNavigationLeaseToken;

  let forecastLeasesReleased = 0;
  for (const [matchIdentity, lease] of bsportsfanForecastLeases.entries()) {
    if (isSameBsportsfanRequestOwner(lease && lease.owner, owner)) {
      bsportsfanForecastLeases.delete(matchIdentity);
      forecastLeasesReleased += 1;
    }
  }

  let maintenanceReleased = false;
  if (
    bsportsfanResultBackfillLeaseToken
    && isSameBsportsfanRequestOwner(bsportsfanResultBackfillLeaseOwner, owner)
  ) {
    bsportsfanResultBackfillLeaseUntil = 0;
    bsportsfanResultBackfillLeaseOwner = "";
    bsportsfanResultBackfillLeaseToken = "";
    maintenanceReleased = true;
  }

  const sessionStorage = chrome.storage && chrome.storage.session;
  const persistenceTasks = [persistBsportsfanForecastLeases()];
  if (sessionStorage && typeof sessionStorage.remove === "function") {
    const keys = [];
    if (navigationReleased) {
      keys.push(BSPORTSFAN_NAVIGATION_LEASE_STORAGE_KEY);
    }
    if (maintenanceReleased) {
      keys.push(BSPORTSFAN_MAINTENANCE_LEASE_STORAGE_KEY);
    }
    if (keys.length) {
      persistenceTasks.push(sessionStorage.remove(keys));
    }
  }
  await Promise.allSettled(persistenceTasks);
  drainBsportsfanProxyFetchQueue();
  return {
    prepared: true,
    owner,
    queuedCancelled: Math.max(0, queuedBefore - bsportsfanProxyFetchQueue.length),
    activeCancelled,
    navigationReleased,
    forecastLeasesReleased,
    maintenanceReleased
  };
}

function pruneBsportsfanForecastLeases(now = Date.now()) {
  for (const [key, lease] of bsportsfanForecastLeases.entries()) {
    if (Number(lease && lease.leaseUntil || 0) <= Number(now)) {
      bsportsfanForecastLeases.delete(key);
    }
  }
}

async function ensureBsportsfanForecastLeasesLoaded() {
  if (bsportsfanForecastLeasesLoaded) {
    return;
  }
  if (bsportsfanForecastLeasesLoadPromise) {
    return bsportsfanForecastLeasesLoadPromise;
  }
  const sessionStorage = chrome.storage && chrome.storage.session;
  if (!sessionStorage || typeof sessionStorage.get !== "function") {
    bsportsfanForecastLeasesLoaded = true;
    return;
  }
  bsportsfanForecastLeasesLoadPromise = sessionStorage.get({
    [BSPORTSFAN_FORECAST_LEASES_STORAGE_KEY]: {}
  }).then((stored) => {
    const raw = stored && stored[BSPORTSFAN_FORECAST_LEASES_STORAGE_KEY];
    for (const [key, lease] of Object.entries(raw && typeof raw === "object" ? raw : {})) {
      const token = normalizeTelegramText(lease && lease.token || "");
      const leaseUntil = Number(lease && lease.leaseUntil || 0);
      if (key && token && leaseUntil > Date.now()) {
        bsportsfanForecastLeases.set(key, {
          token,
          leaseUntil,
          owner: normalizeTelegramText(lease && lease.owner || ""),
          sourceId: normalizeTelegramText(lease && lease.sourceId || ""),
          documentId: normalizeTelegramText(lease && lease.documentId || ""),
          documentNonce: normalizeTelegramText(lease && lease.documentNonce || ""),
          generation: Math.max(0, Number(lease && lease.generation || 0) || 0)
        });
      }
    }
    pruneBsportsfanForecastLeases();
    bsportsfanForecastLeasesLoaded = true;
  }).finally(() => {
    bsportsfanForecastLeasesLoadPromise = null;
  });
  return bsportsfanForecastLeasesLoadPromise;
}

async function persistBsportsfanForecastLeases() {
  const sessionStorage = chrome.storage && chrome.storage.session;
  if (!sessionStorage || typeof sessionStorage.set !== "function") {
    throw createServiceWorkerError(
      "Forecast lease storage is unavailable",
      "forecast-lease-storage-unavailable"
    );
  }
  pruneBsportsfanForecastLeases();
  await sessionStorage.set({
    [BSPORTSFAN_FORECAST_LEASES_STORAGE_KEY]: Object.fromEntries(bsportsfanForecastLeases)
  });
}

function mutateBsportsfanForecastLeases(mutator) {
  const operation = bsportsfanForecastLeaseMutationChain
    .catch(() => {})
    .then(async () => {
      await ensureBsportsfanForecastLeasesLoaded();
      const previous = new Map(bsportsfanForecastLeases);
      try {
        return await mutator();
      } catch (error) {
        bsportsfanForecastLeases.clear();
        for (const [key, lease] of previous.entries()) {
          bsportsfanForecastLeases.set(key, lease);
        }
        throw error;
      }
    });
  bsportsfanForecastLeaseMutationChain = operation.then(() => undefined, () => undefined);
  return operation;
}

async function grantBsportsfanNavigationLease(deadlineAtValue, sender = null, sourceId = "") {
  const now = Date.now();
  const requestedDeadlineAt = Number(deadlineAtValue || 0);
  const hardUntil = Number.isFinite(requestedDeadlineAt) && requestedDeadlineAt > now
    ? requestedDeadlineAt
    : now + BSPORTSFAN_NAVIGATION_LEASE_MAX_MS;
  const nextToken = createBsportsfanLeaseToken("navigation");
  const nextOwner = getBsportsfanRequestOwner(sender);
  const nextSourceId = TABLE_TENNIS_SOURCE_ORIGINS[sourceId]
    ? sourceId
    : getTableTennisDataSourceId(sender && sender.url || "") || "bsportsfan";
  const nextLeaseUntil = Math.min(
    hardUntil,
    now + BSPORTSFAN_NAVIGATION_LEASE_MAX_MS
  );
  const sessionStorage = chrome.storage && chrome.storage.session;
  if (!sessionStorage || typeof sessionStorage.set !== "function") {
    throw createServiceWorkerError(
      "Navigation lease storage is unavailable",
      "navigation-lease-storage-unavailable"
    );
  }
  try {
    await sessionStorage.set({
      [BSPORTSFAN_NAVIGATION_LEASE_STORAGE_KEY]: {
        token: nextToken,
        owner: nextOwner,
        sourceId: nextSourceId,
        leaseUntil: nextLeaseUntil,
        updatedAt: now
      }
    });
  } catch (error) {
    const persistenceError = createServiceWorkerError(
      "Navigation lease could not be persisted",
      "navigation-lease-persist-failed"
    );
    persistenceError.cause = error;
    throw persistenceError;
  }
  bsportsfanNavigationLeaseToken = nextToken;
  bsportsfanNavigationLeaseOwner = nextOwner;
  bsportsfanNavigationLeaseSourceId = nextSourceId;
  bsportsfanNavigationLeaseUntil = nextLeaseUntil;
  scheduleBsportsfanNavigationLeaseExpiry();
  return {
    granted: true,
    grantedAt: now,
    leaseUntil: bsportsfanNavigationLeaseUntil,
    token: bsportsfanNavigationLeaseToken,
    sourceId: bsportsfanNavigationLeaseSourceId
  };
}

function scheduleBsportsfanNavigationLeaseExpiry() {
  if (bsportsfanNavigationLeaseTimer) {
    clearTimeout(bsportsfanNavigationLeaseTimer);
    bsportsfanNavigationLeaseTimer = 0;
  }
  const delayMs = Math.max(0, bsportsfanNavigationLeaseUntil - Date.now());
  if (!bsportsfanNavigationLeaseToken || delayMs <= 0) {
    releaseBsportsfanNavigationLease(bsportsfanNavigationLeaseToken, true);
    return;
  }
  bsportsfanNavigationLeaseTimer = setTimeout(() => {
    bsportsfanNavigationLeaseTimer = 0;
    releaseBsportsfanNavigationLease(bsportsfanNavigationLeaseToken, true);
  }, delayMs);
}

function releaseBsportsfanNavigationLease(tokenValue, force = false) {
  const token = normalizeTelegramText(tokenValue || "");
  if (!force && (!token || token !== bsportsfanNavigationLeaseToken)) {
    return { released: false, reason: "lease-token-mismatch" };
  }
  const hadLease = Boolean(bsportsfanNavigationLeaseToken);
  bsportsfanNavigationLeaseToken = "";
  bsportsfanNavigationLeaseUntil = 0;
  bsportsfanNavigationLeaseOwner = "";
  bsportsfanNavigationLeaseSourceId = "";
  if (bsportsfanNavigationLeaseTimer) {
    clearTimeout(bsportsfanNavigationLeaseTimer);
    bsportsfanNavigationLeaseTimer = 0;
  }
  const sessionStorage = chrome.storage && chrome.storage.session;
  if (sessionStorage && typeof sessionStorage.remove === "function") {
    sessionStorage.remove(BSPORTSFAN_NAVIGATION_LEASE_STORAGE_KEY).catch(() => {});
  }
  if (hadLease) {
    drainBsportsfanProxyFetchQueue();
  }
  return { released: hadLease };
}

function isBsportsfanNavigationLeaseActive(now = Date.now()) {
  if (!bsportsfanNavigationLeaseToken) {
    return false;
  }
  if (Number(bsportsfanNavigationLeaseUntil || 0) > Number(now)) {
    return true;
  }
  releaseBsportsfanNavigationLease(bsportsfanNavigationLeaseToken, true);
  return false;
}

function drainBsportsfanProxyFetchQueue() {
  if (bsportsfanProxyFetchDrainTimer) {
    clearTimeout(bsportsfanProxyFetchDrainTimer);
    bsportsfanProxyFetchDrainTimer = 0;
  }
  pruneExpiredBsportsfanProxyFetchJobs();
  if (isBsportsfanNavigationLeaseActive()) {
    return;
  }
  while (
    bsportsfanProxyFetchActive < BSPORTSFAN_PROXY_FETCH_CONCURRENCY
    && bsportsfanProxyFetchQueue.length
  ) {
    const now = Date.now();
    let selectedIndex = -1;
    let minimumWaitMs = Number.POSITIVE_INFINITY;
    for (let index = 0; index < bsportsfanProxyFetchQueue.length;) {
      const candidate = bsportsfanProxyFetchQueue[index];
      if (!candidate || now >= Number(candidate.deadlineAt || 0)) {
        bsportsfanProxyFetchQueue.splice(index, 1);
        if (candidate) {
          candidate.state = "expired";
          bsportsfanProxyFetchMetrics.expired += 1;
          candidate.reject(createServiceWorkerError(
            "BsportsFan request expired in queue",
            "bsportsfan-expired"
          ));
        }
        continue;
      }
      const candidateSourceId = TABLE_TENNIS_SOURCE_ORIGINS[candidate.sourceId]
        ? candidate.sourceId
        : "bsportsfan";
      const circuitError = getTableTennisProtectionCircuitError(candidateSourceId, now);
      if (circuitError) {
        bsportsfanProxyFetchQueue.splice(index, 1);
        candidate.state = "failed";
        bsportsfanProxyFetchMetrics.failed += 1;
        candidate.reject(circuitError);
        continue;
      }
      const waitMs = Math.max(
        0,
        Number(tableTennisSourceLastStartedAt[candidateSourceId] || 0)
          + getBsportsfanRequestIntervalMs(candidate.priority)
          - now
      );
      if (waitMs <= 0) {
        selectedIndex = index;
        break;
      }
      if (now + waitMs >= Number(candidate.deadlineAt || 0)) {
        bsportsfanProxyFetchQueue.splice(index, 1);
        candidate.state = "expired";
        bsportsfanProxyFetchMetrics.expired += 1;
        candidate.reject(createServiceWorkerError(
          "BsportsFan request expired while rate limited",
          "bsportsfan-expired"
        ));
        continue;
      }
      minimumWaitMs = Math.min(minimumWaitMs, waitMs);
      index += 1;
    }
    if (selectedIndex < 0) {
      if (Number.isFinite(minimumWaitMs)) {
        bsportsfanProxyFetchDrainTimer = setTimeout(() => {
          bsportsfanProxyFetchDrainTimer = 0;
          drainBsportsfanProxyFetchQueue();
        }, minimumWaitMs);
      }
      return;
    }
    const job = bsportsfanProxyFetchQueue.splice(selectedIndex, 1)[0];
    const sourceId = TABLE_TENNIS_SOURCE_ORIGINS[job.sourceId]
      ? job.sourceId
      : "bsportsfan";
    job.state = "active";
    bsportsfanProxyActiveJobs.add(job);
    bsportsfanProxyFetchActive += 1;
    bsportsfanProxyFetchLastStartedAt = Date.now();
    tableTennisSourceLastStartedAt[sourceId] = bsportsfanProxyFetchLastStartedAt;
    Promise.resolve()
      .then(() => job.task(job.abortController.signal))
      .then(
        (value) => {
          job.state = "completed";
          bsportsfanProxyFetchMetrics.completed += 1;
          job.resolve(value);
        },
        (error) => {
          job.state = "failed";
          bsportsfanProxyFetchMetrics.failed += 1;
          job.reject(error);
        }
      )
      .finally(() => {
        bsportsfanProxyActiveJobs.delete(job);
        bsportsfanProxyFetchActive = Math.max(0, bsportsfanProxyFetchActive - 1);
        drainBsportsfanProxyFetchQueue();
      });
  }
}

function rejectQueuedBsportsfanProxyFetches(error, predicate = null) {
  const rejected = [];
  const retained = [];
  for (const job of bsportsfanProxyFetchQueue.splice(0)) {
    if (typeof predicate === "function" && !predicate(job)) {
      retained.push(job);
    } else {
      rejected.push(job);
    }
  }
  bsportsfanProxyFetchQueue.push(...retained);
  sortBsportsfanProxyFetchQueue();
  for (const job of rejected) {
    job.state = "failed";
    bsportsfanProxyFetchMetrics.failed += 1;
    job.reject(cloneBsportsfanProtectionError(error));
  }
}

function cancelBsportsfanProxyJobsForOwner(ownerValue, reason = "request-owner-released") {
  const owner = normalizeTelegramText(ownerValue || "");
  if (!owner) {
    return { queued: 0, active: 0 };
  }
  const error = createServiceWorkerError(
    "Table-tennis request owner is no longer active",
    normalizeTelegramText(reason || "request-owner-released")
  );
  const queuedBefore = bsportsfanProxyFetchQueue.length;
  rejectQueuedBsportsfanProxyFetches(
    error,
    (job) => isSameBsportsfanRequestOwner(job && job.owner, owner)
  );
  let active = 0;
  for (const job of bsportsfanProxyActiveJobs) {
    if (
      isSameBsportsfanRequestOwner(job && job.owner, owner)
      && job.abortController
      && !job.abortController.signal.aborted
    ) {
      job.abortController.abort(error);
      active += 1;
    }
  }
  return {
    queued: Math.max(0, queuedBefore - bsportsfanProxyFetchQueue.length),
    active
  };
}

function normalizeBsportsfanProxyCacheKey(value) {
  try {
    const url = new URL(String(value || ""));
    url.hash = "";
    return url.href;
  } catch (_) {
    return String(value || "");
  }
}

function setBsportsfanProxyResponseCache(cacheKey, response, ttlMs) {
  if (!cacheKey || !response || typeof response.text !== "string") {
    return;
  }
  bsportsfanProxyResponseCache.delete(cacheKey);
  bsportsfanProxyResponseCache.set(cacheKey, {
    response: {
      text: response.text,
      status: response.status,
      finalUrl: response.finalUrl
    },
    expiresAt: Date.now() + Math.max(0, Number(ttlMs || 0))
  });
  while (bsportsfanProxyResponseCache.size > BSPORTSFAN_PROXY_CACHE_MAX_ENTRIES) {
    const oldestKey = bsportsfanProxyResponseCache.keys().next().value;
    if (!oldestKey) {
      break;
    }
    bsportsfanProxyResponseCache.delete(oldestKey);
  }
}

async function ensureTableTennisProtectionStateLoaded() {
  if (tableTennisProtectionStateLoaded) {
    return;
  }
  if (tableTennisProtectionStatePromise) {
    return tableTennisProtectionStatePromise;
  }
  const sessionStorage = chrome.storage && chrome.storage.session;
  const sessionStatePromise = sessionStorage && typeof sessionStorage.get === "function"
    ? sessionStorage.get({
        [BSPORTSFAN_NAVIGATION_LEASE_STORAGE_KEY]: null,
        [BSPORTSFAN_MAINTENANCE_LEASE_STORAGE_KEY]: null
      })
    : Promise.resolve({});
  tableTennisProtectionStatePromise = Promise.all([
    sessionStatePromise,
    getTableTennisSourceState()
  ]).then(([stored, sourceState]) => {
    for (const sourceId of Object.keys(tableTennisProtectionCircuits)) {
      const source = sourceState && sourceState.sources && sourceState.sources[sourceId] || {};
      const circuit = tableTennisProtectionCircuits[sourceId];
      circuit.openUntil = Math.max(0, Number(source.cooldownUntil || 0) || 0);
      circuit.reason = normalizeTelegramText(source.reason || "");
    }
    if (sessionStorage && typeof sessionStorage.remove === "function") {
      sessionStorage.remove(LEGACY_BSPORTSFAN_PROXY_PROTECTION_STORAGE_KEY).catch(() => {});
    }
    const navigationState = stored && stored[BSPORTSFAN_NAVIGATION_LEASE_STORAGE_KEY];
    if (Number(navigationState && navigationState.leaseUntil || 0) > Date.now()) {
      bsportsfanNavigationLeaseToken = normalizeTelegramText(navigationState.token || "");
      bsportsfanNavigationLeaseOwner = normalizeTelegramText(navigationState.owner || "");
      bsportsfanNavigationLeaseSourceId = normalizeTelegramText(navigationState.sourceId || "");
      bsportsfanNavigationLeaseUntil = Number(navigationState.leaseUntil || 0);
      if (bsportsfanNavigationLeaseToken) {
        scheduleBsportsfanNavigationLeaseExpiry();
      }
    }
    const maintenanceState = stored && stored[BSPORTSFAN_MAINTENANCE_LEASE_STORAGE_KEY];
    if (Number(maintenanceState && maintenanceState.leaseUntil || 0) > Date.now()) {
      bsportsfanResultBackfillLeaseOwner = normalizeTelegramText(maintenanceState.owner || "");
      bsportsfanResultBackfillLeaseToken = normalizeTelegramText(maintenanceState.token || "");
      bsportsfanResultBackfillLeaseUntil = Number(maintenanceState.leaseUntil || 0);
    }
    tableTennisProtectionStateLoaded = true;
  }).finally(() => {
    tableTennisProtectionStatePromise = null;
  });
  return tableTennisProtectionStatePromise;
}

async function openTableTennisProtectionCircuit(
  reason,
  cooldownMs = TABLE_TENNIS_PROTECTION_COOLDOWN_MS,
  sourceId = "bsportsfan",
  observedAt = Date.now()
) {
  const now = Date.now();
  const openUntil = now + Math.max(
    1000,
    Number(cooldownMs || TABLE_TENNIS_PROTECTION_COOLDOWN_MS)
      || TABLE_TENNIS_PROTECTION_COOLDOWN_MS
  );
  const normalizedSourceId = TABLE_TENNIS_SOURCE_ORIGINS[sourceId]
    ? sourceId
    : "bsportsfan";
  return markTableTennisSourceFailure(normalizedSourceId, {
    reason,
    retryAfterMs: Math.max(0, openUntil - now),
    observedAt
  });
}

function throwIfTableTennisProtectionCircuitOpen(sourceId = "bsportsfan") {
  const error = getTableTennisProtectionCircuitError(sourceId);
  if (error) {
    throw error;
  }
}

function getTableTennisSourceProtectionOpenUntil(sourceId) {
  const normalizedSourceId = TABLE_TENNIS_SOURCE_ORIGINS[sourceId]
    ? sourceId
    : "bsportsfan";
  return Number(tableTennisProtectionCircuits[normalizedSourceId].openUntil || 0);
}

function getTableTennisProtectionCircuitError(sourceId = "bsportsfan", now = Date.now()) {
  const normalizedSourceId = TABLE_TENNIS_SOURCE_ORIGINS[sourceId]
    ? sourceId
    : "bsportsfan";
  const retryAfterMs = Math.max(
    0,
    getTableTennisSourceProtectionOpenUntil(normalizedSourceId) - Number(now)
  );
  if (retryAfterMs <= 0) {
    const circuit = tableTennisProtectionCircuits[normalizedSourceId];
    circuit.openUntil = 0;
    circuit.reason = "";
    return null;
  }
  const error = createServiceWorkerError(
    `BSportsFan protection cooldown active for ${Math.ceil(retryAfterMs / 1000)}s`,
    "bsportsfan-circuit-open"
  );
  error.sourceId = normalizedSourceId;
  error.retryAfterMs = retryAfterMs;
  error.endpointBlocked = true;
  error.retryBudgetExempt = true;
  return error;
}

function cloneBsportsfanProtectionError(source) {
  const error = createServiceWorkerError(
    source && source.message || "BsportsFan protection cooldown active",
    source && source.code || "bsportsfan-circuit-open"
  );
  error.status = Number(source && source.status || 0) || 0;
  error.retryAfterMs = Math.max(0, Number(source && source.retryAfterMs || 0) || 0);
  error.sourceId = normalizeTelegramText(source && source.sourceId || "");
  error.endpointBlocked = source && source.endpointBlocked === true;
  error.retryBudgetExempt = source && source.retryBudgetExempt === true;
  return error;
}

async function fetchBsportsfanText(value, options = {}) {
  const url = validateBsportsfanProxyRequest(value, options.sender);
  const sourceId = getTableTennisDataSourceId(url.href) || "bsportsfan";
  throwIfTableTennisProtectionCircuitOpen(sourceId);

  const requestedDeadlineAt = Number(options.deadlineAt || 0);
  const deadlineAt = Number.isFinite(requestedDeadlineAt) && requestedDeadlineAt > 0
    ? requestedDeadlineAt
    : Date.now() + BSPORTSFAN_PROXY_FETCH_TIMEOUT_MS;
  const remainingMs = Math.min(
    BSPORTSFAN_PROXY_FETCH_TIMEOUT_MS,
    Math.max(0, deadlineAt - Date.now())
  );
  if (remainingMs <= 0) {
    throw createServiceWorkerError("BsportsFan request deadline expired", "bsportsfan-expired");
  }
  const controller = new AbortController();
  const externalSignal = options.externalSignal;
  const abortFromExternal = () => {
    const reason = externalSignal && externalSignal.reason;
    controller.abort(reason instanceof Error
      ? reason
      : createServiceWorkerError("BsportsFan request cancelled", "bsportsfan-cancelled"));
  };
  if (externalSignal && externalSignal.aborted) {
    abortFromExternal();
  } else if (externalSignal && typeof externalSignal.addEventListener === "function") {
    externalSignal.addEventListener("abort", abortFromExternal, { once: true });
  }
  const timeoutId = setTimeout(() => {
    controller.abort(createServiceWorkerError(
      `network timeout after ${remainingMs} ms`,
      "bsportsfan-timeout"
    ));
  }, remainingMs);
  try {
    const response = await fetch(url.href, {
      credentials: "include",
      cache: "no-store",
      redirect: "follow",
      signal: controller.signal
    });
    if (!response || !response.ok) {
      const status = Number(response && response.status || 0);
      const protectionResponse = status === 403 || status === 429;
      const error = createServiceWorkerError(
        `HTTP ${status}`,
        protectionResponse
          ? TABLE_TENNIS_ENDPOINT_BLOCKED_CODE
          : "bsportsfan-http"
      );
      error.status = status;
      if (protectionResponse) {
        // A blocked auxiliary profile/PBP request does not prove that the
        // visible live page is unavailable. Keep the healthy collector page
        // open and let the request retry after a short endpoint cooldown.
        error.endpointBlocked = true;
        error.retryAfterMs = TABLE_TENNIS_ENDPOINT_BLOCKED_RETRY_MS;
      }
      throw error;
    }
    const finalUrl = validateBsportsfanProxyFinalUrl(response.url || url.href);
    const text = await readBoundedBsportsfanResponseText(response);
    if (isBsportsfanChallengeResponse(response, text)) {
      const error = createServiceWorkerError(
        "Table-tennis endpoint returned a security challenge",
        TABLE_TENNIS_ENDPOINT_BLOCKED_CODE
      );
      error.status = Number(response.status || 0) || 0;
      error.endpointBlocked = true;
      error.retryAfterMs = TABLE_TENNIS_ENDPOINT_BLOCKED_RETRY_MS;
      throw error;
    }
    if (isBsportsfanLiveSessionExpiredResponse(text)) {
      const error = createServiceWorkerError(
        "BsportsFan live session expired",
        "bsportsfan-session-expired"
      );
      error.status = Number(response.status || 0) || 0;
      error.endpointBlocked = true;
      error.retryAfterMs = TABLE_TENNIS_ENDPOINT_BLOCKED_RETRY_MS;
      throw error;
    }
    return {
      text,
      status: response.status,
      finalUrl
    };
  } catch (error) {
    if (controller.signal.aborted && !error.code) {
      const timeoutError = createServiceWorkerError(
        `network timeout after ${remainingMs} ms`,
        "bsportsfan-timeout"
      );
      timeoutError.sourceId = sourceId;
      throw timeoutError;
    }
    if (error && !error.sourceId) {
      error.sourceId = sourceId;
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
    if (externalSignal && typeof externalSignal.removeEventListener === "function") {
      externalSignal.removeEventListener("abort", abortFromExternal);
    }
  }
}

function isBsportsfanLiveSessionExpiredResponse(value) {
  const text = String(value || "").toLowerCase();
  const toastTag = text.match(/<[^>]+\bid\s*=\s*["']authtoast["'][^>]*>/i);
  return Boolean(
    toastTag
    && /\bclass\s*=\s*["'][^"']*\bshow(?:ing)?\b[^"']*["']/i.test(toastTag[0])
    && !/\baria-hidden\s*=\s*["']true["']/i.test(toastTag[0])
    && !/\bstyle\s*=\s*["'][^"']*(?:display\s*:\s*none|visibility\s*:\s*hidden|opacity\s*:\s*0(?:\D|$))[^"']*["']/i.test(toastTag[0])
    && (
      text.includes("your live session has expired")
      || text.includes("refresh to reconnect")
    )
  );
}

function createDefaultTableTennisSourceState() {
  const createSource = () => ({
    cooldownUntil: 0,
    failureCount: 0,
    lastFailureAt: 0,
    lastHealthyAt: 0,
    lastObservationAt: 0,
    lastObservationKind: "",
    reason: ""
  });
  return {
    version: 2,
    activeSourceId: TABLE_TENNIS_SOURCE_IDS[0] || "",
    updatedAt: 0,
    sources: Object.fromEntries(
      TABLE_TENNIS_SOURCE_IDS.map((sourceId) => [sourceId, createSource()])
    )
  };
}

function normalizeTableTennisSourceState(value) {
  const defaults = createDefaultTableTennisSourceState();
  const raw = value && typeof value === "object" ? value : {};
  const normalizeSource = (sourceId) => {
    const source = raw.sources && raw.sources[sourceId];
    const lastFailureAt = Math.max(0, Number(source && source.lastFailureAt || 0) || 0);
    const lastHealthyAt = Math.max(0, Number(source && source.lastHealthyAt || 0) || 0);
    const cooldownUntil = Math.max(0, Number(source && source.cooldownUntil || 0) || 0);
    const reason = normalizeTelegramText(source && source.reason || "");
    const explicitObservationKind = normalizeTelegramText(
      source && source.lastObservationKind || ""
    ).toLowerCase();
    const inferredObservationKind = lastHealthyAt > lastFailureAt
      ? "healthy"
      : lastFailureAt > lastHealthyAt
        ? "failure"
        : lastHealthyAt > 0
          ? cooldownUntil > Date.now() && reason
            ? "failure"
            : "healthy"
        : "";
    return {
      cooldownUntil,
      failureCount: Math.max(0, Math.min(100, Number(source && source.failureCount || 0) || 0)),
      lastFailureAt,
      lastHealthyAt,
      lastObservationAt: Math.max(
        lastFailureAt,
        lastHealthyAt,
        Math.max(0, Number(source && source.lastObservationAt || 0) || 0)
      ),
      lastObservationKind: ["failure", "healthy"].includes(explicitObservationKind)
        ? explicitObservationKind
        : inferredObservationKind,
      reason
    };
  };
  const activeSourceId = TABLE_TENNIS_SOURCE_ORIGINS[raw.activeSourceId]
    ? raw.activeSourceId
    : defaults.activeSourceId;
  return {
    version: 2,
    activeSourceId,
    updatedAt: Math.max(0, Number(raw.updatedAt || 0) || 0),
    sources: Object.fromEntries(
      TABLE_TENNIS_SOURCE_IDS.map((sourceId) => [sourceId, normalizeSource(sourceId)])
    )
  };
}

async function loadTableTennisSourceState() {
  if (tableTennisSourceStateCache) {
    return normalizeTableTennisSourceState(tableTennisSourceStateCache);
  }
  const stored = await chrome.storage.local.get({
    [TABLE_TENNIS_SOURCE_STATE_KEY]: null
  });
  tableTennisSourceStateCache = normalizeTableTennisSourceState(
    stored && stored[TABLE_TENNIS_SOURCE_STATE_KEY]
  );
  return normalizeTableTennisSourceState(tableTennisSourceStateCache);
}

async function getTableTennisSourceState() {
  await tableTennisSourceStateMutationChain.catch(() => {});
  return loadTableTennisSourceState();
}

function mutateTableTennisSourceState(mutator) {
  const operation = tableTennisSourceStateMutationChain
    .catch(() => {})
    .then(async () => {
      const current = normalizeTableTennisSourceState(
        await loadTableTennisSourceState()
      );
      const working = normalizeTableTennisSourceState(current);
      const changed = normalizeTableTennisSourceState(
        typeof mutator === "function" ? mutator(working) : working
      );
      if (JSON.stringify(changed) === JSON.stringify(current)) {
        return current;
      }
      changed.updatedAt = Date.now();
      await chrome.storage.local.set({
        [TABLE_TENNIS_SOURCE_STATE_KEY]: changed
      });
      tableTennisSourceStateCache = changed;
      return normalizeTableTennisSourceState(changed);
    });
  tableTennisSourceStateMutationChain = operation.then(() => undefined, () => undefined);
  return operation;
}

function resetTableTennisSourceState() {
  return mutateTableTennisSourceState(() => createDefaultTableTennisSourceState());
}

function markTableTennisSourceFailure(sourceId, options = {}) {
  if (!TABLE_TENNIS_SOURCE_ORIGINS[sourceId]) {
    return getTableTennisSourceState().then((state) => ({ state, applied: false, changed: false }));
  }
  const now = Date.now();
  const observedAt = Math.min(
    now,
    Math.max(0, Number(options.observedAt || 0) || now)
  );
  const retryAfterMs = Math.max(
    60 * 1000,
    Number(options.retryAfterMs || 0) || TABLE_TENNIS_SOURCE_FAILURE_COOLDOWN_MS
  );
  let applied = false;
  let changed = false;
  return mutateTableTennisSourceState((state) => {
    const source = state.sources[sourceId];
    if (!shouldApplyTableTennisSourceObservation(source, observedAt, "failure")) {
      return state;
    }
    applied = true;
    changed = Number(source.cooldownUntil || 0) < now + retryAfterMs
      || Number(source.lastFailureAt || 0) < observedAt
      || normalizeTelegramText(source.reason || "")
        !== normalizeTelegramText(options.reason || "source-unavailable");
    source.cooldownUntil = Math.max(source.cooldownUntil, now + retryAfterMs);
    if (observedAt > Number(source.lastFailureAt || 0)) {
      source.failureCount = Math.min(100, source.failureCount + 1);
    }
    source.lastFailureAt = Math.max(Number(source.lastFailureAt || 0), observedAt);
    source.lastObservationAt = observedAt;
    source.lastObservationKind = "failure";
    source.reason = normalizeTelegramText(options.reason || "source-unavailable");
    return state;
  }).then((state) => {
    if (applied) {
      applyTableTennisSourceFailureEffects(sourceId, state.sources[sourceId]);
    }
    return { state, applied, changed };
  });
}

function markTableTennisSourceHealthy(sourceId, options = {}) {
  if (!TABLE_TENNIS_SOURCE_ORIGINS[sourceId]) {
    return getTableTennisSourceState().then((state) => ({ state, applied: false, changed: false }));
  }
  const now = Date.now();
  const observedAt = Math.min(
    now,
    Math.max(0, Number(options.observedAt || 0) || now)
  );
  let applied = false;
  let changed = false;
  return mutateTableTennisSourceState((state) => {
    const source = state.sources[sourceId];
    if (!shouldApplyTableTennisSourceObservation(source, observedAt, "healthy")) {
      return state;
    }
    applied = true;
    changed = Number(source.cooldownUntil || 0) > 0
      || Number(source.lastFailureAt || 0) > Number(source.lastHealthyAt || 0)
      || Boolean(source.reason)
      || Boolean(
        tableTennisProtectionCircuits[sourceId].openUntil
        || tableTennisProtectionCircuits[sourceId].reason
      );
    source.cooldownUntil = 0;
    source.failureCount = 0;
    source.lastHealthyAt = Math.max(Number(source.lastHealthyAt || 0), observedAt);
    source.lastObservationAt = observedAt;
    source.lastObservationKind = "healthy";
    source.reason = "";
    return state;
  }).then((state) => {
    if (applied) {
      const circuit = tableTennisProtectionCircuits[sourceId];
      circuit.openUntil = 0;
      circuit.reason = "";
      if (changed) {
        drainBsportsfanProxyFetchQueue();
      }
    }
    return { state, applied, changed };
  });
}

function shouldApplyTableTennisSourceObservation(sourceValue, observedAt, kind) {
  const source = sourceValue && typeof sourceValue === "object" ? sourceValue : {};
  const previousAt = Math.max(
    Number(source.lastObservationAt || 0),
    Number(source.lastFailureAt || 0),
    Number(source.lastHealthyAt || 0)
  );
  const previousKind = normalizeTelegramText(source.lastObservationKind || "").toLowerCase();
  if (observedAt > previousAt) {
    return true;
  }
  if (observedAt < previousAt || previousKind === kind) {
    return false;
  }
  // A full, visible collector snapshot is stronger evidence than an async
  // failure callback observed in the same millisecond.
  return kind === "healthy";
}

function applyTableTennisSourceFailureEffects(sourceId, sourceValue) {
  const source = sourceValue && typeof sourceValue === "object" ? sourceValue : {};
  const circuit = tableTennisProtectionCircuits[sourceId];
  circuit.openUntil = Math.max(
    Number(circuit.openUntil || 0),
    Number(source.cooldownUntil || 0)
  );
  circuit.reason = normalizeTelegramText(source.reason || "source-unavailable");
  for (const key of Array.from(bsportsfanProxyResponseCache.keys())) {
    if (getTableTennisDataSourceId(key) === sourceId) {
      bsportsfanProxyResponseCache.delete(key);
    }
  }
  if (
    bsportsfanNavigationLeaseToken
    && (!bsportsfanNavigationLeaseSourceId || bsportsfanNavigationLeaseSourceId === sourceId)
  ) {
    releaseBsportsfanNavigationLease(bsportsfanNavigationLeaseToken, true);
  }
  const error = getTableTennisProtectionCircuitError(sourceId);
  if (!error) {
    return;
  }
  for (const job of bsportsfanProxyActiveJobs) {
    if (
      normalizeTelegramText(job && job.sourceId || "") === sourceId
      && job.abortController
      && !job.abortController.signal.aborted
    ) {
      job.abortController.abort(cloneBsportsfanProtectionError(error));
    }
  }
  rejectQueuedBsportsfanProxyFetches(
    error,
    (job) => normalizeTelegramText(job && job.sourceId || "") === sourceId
  );
}

async function markTableTennisSourceActive(sourceId) {
  if (!TABLE_TENNIS_SOURCE_ORIGINS[sourceId]) {
    return getTableTennisSourceState();
  }
  const current = await getTableTennisSourceState();
  if (current.activeSourceId === sourceId) {
    return current;
  }
  return mutateTableTennisSourceState((state) => {
    state.activeSourceId = sourceId;
    return state;
  });
}

function getHealthyTableTennisScanSourceId(scanStatus, sourceState, now = Date.now()) {
  const status = scanStatus && typeof scanStatus === "object" ? scanStatus : {};
  const statusKind = normalizeTelegramText(status.statusKind || "").toLowerCase();
  const heartbeatAt = Math.max(0, Number(status.ts || 0) || 0);
  if (
    (statusKind && statusKind !== "snapshot")
    ||
    normalizeTelegramText(status.source || "").toLowerCase() !== "table-tennis"
    || !(heartbeatAt > 0)
    || now - heartbeatAt > TABLE_TENNIS_HEALTH_STALE_MS
  ) {
    return "";
  }
  const snapshot = status.bsportsfan && typeof status.bsportsfan === "object"
    ? status.bsportsfan
    : {};
  const observedAt = Math.max(0, Number(snapshot.ts || heartbeatAt) || heartbeatAt);
  const recovery = snapshot.sessionRecovery && typeof snapshot.sessionRecovery === "object"
    ? snapshot.sessionRecovery
    : {};
  const monitor = snapshot.cipMonitor && typeof snapshot.cipMonitor === "object"
    ? snapshot.cipMonitor
    : {};
  if (
    snapshot.challenge === true
    || recovery.active === true
    || monitor.active !== true
  ) {
    return "";
  }
  const sourceId = getTableTennisDataSourceId(snapshot.url || "")
    || (TABLE_TENNIS_SOURCE_ORIGINS[snapshot.dataSource] ? snapshot.dataSource : "")
    || (TABLE_TENNIS_SOURCE_ORIGINS[monitor.sourceId] ? monitor.sourceId : "");
  if (!sourceId) {
    return "";
  }
  const source = sourceState && sourceState.sources && sourceState.sources[sourceId] || {};
  return observedAt >= Number(source.lastFailureAt || 0) ? sourceId : "";
}

async function reconcileTableTennisSourceHealthFromScanStatus(scanStatus, now = Date.now()) {
  await ensureTableTennisProtectionStateLoaded();
  const collectorLease = await getTableTennisCollectorLease().catch(() => null);
  const recordedCollector = scanStatus && typeof scanStatus.collector === "object"
    ? scanStatus.collector
    : {};
  if (
    !collectorLease
    || Number(recordedCollector.tabId) !== Number(collectorLease.tabId)
    || normalizeTelegramText(recordedCollector.sourceId || "")
      !== normalizeTelegramText(collectorLease.sourceId || "")
    || normalizeTelegramText(recordedCollector.leaseToken || "")
      !== normalizeTelegramText(collectorLease.token || "")
    || normalizeTelegramText(recordedCollector.documentNonce || "")
      !== normalizeTelegramText(collectorLease.documentNonce || "")
  ) {
    return { cleared: false, sourceId: "" };
  }
  const sourceState = await getTableTennisSourceState();
  const sourceId = getHealthyTableTennisScanSourceId(scanStatus, sourceState, now);
  if (!sourceId) {
    return { cleared: false, sourceId: "" };
  }
  const source = sourceState.sources[sourceId] || {};
  const needsRecovery = Number(source.cooldownUntil || 0) > now
    || Number(source.lastFailureAt || 0) > Number(source.lastHealthyAt || 0)
    || getTableTennisSourceProtectionOpenUntil(sourceId) > now;
  if (!needsRecovery) {
    return { cleared: false, sourceId };
  }
  const healthObservedAt = Math.max(
    0,
    Number(
      scanStatus && scanStatus.bsportsfan && scanStatus.bsportsfan.ts
      || scanStatus && scanStatus.observedAt
      || now
    ) || now
  );
  const transition = await markTableTennisSourceHealthy(sourceId, {
    observedAt: healthObservedAt
  });
  if (!transition.applied) {
    return { cleared: false, sourceId };
  }
  await chrome.storage.local.remove(BSPORTSFAN_ATTENTION_NOTIFICATION_KEY).catch(() => {});
  return {
    cleared: transition.changed,
    circuitCleared: transition.changed,
    sourceId
  };
}

function buildTableTennisSourceRoute(stateValue, options = {}) {
  const state = normalizeTableTennisSourceState(stateValue);
  const now = Date.now();
  const available = (sourceId) => Number(
    state.sources[sourceId] && state.sources[sourceId].cooldownUntil || 0
  ) <= now;
  const currentSourceId = TABLE_TENNIS_SOURCE_ORIGINS[options.currentSourceId]
    ? options.currentSourceId
    : "";
  const candidates = TABLE_TENNIS_SOURCE_API.buildCandidateSourceIds(
    currentSourceId,
    state.activeSourceId
  );
  const targetSourceId = candidates.find(available) || "";
  const retryAt = targetSourceId
    ? 0
    : Math.min(...Object.values(state.sources)
        .map((source) => Number(source && source.cooldownUntil || 0))
        .filter((value) => value > now));
  return {
    activeSourceId: targetSourceId || state.activeSourceId,
    currentSourceId,
    targetSourceId,
    targetOrigin: TABLE_TENNIS_SOURCE_ORIGINS[targetSourceId] || "",
    shouldSwitch: Boolean(targetSourceId && currentSourceId && targetSourceId !== currentSourceId),
    allUnavailable: !targetSourceId,
    retryAt: Number.isFinite(retryAt) ? retryAt : 0,
    sources: Object.fromEntries(TABLE_TENNIS_SOURCE_IDS.map((sourceId) => [
      sourceId,
      { ...state.sources[sourceId] }
    ]))
  };
}

async function loadTableTennisCollectorLease() {
  if (tableTennisCollectorLeaseLoaded) {
    return tableTennisCollectorLeaseCache;
  }
  if (tableTennisCollectorLeaseLoadPromise) {
    return tableTennisCollectorLeaseLoadPromise;
  }
  const sessionStorage = chrome.storage && chrome.storage.session;
  tableTennisCollectorLeaseLoadPromise = (
    sessionStorage && typeof sessionStorage.get === "function"
      ? sessionStorage.get({ [TABLE_TENNIS_COLLECTOR_LEASE_STORAGE_KEY]: null })
      : Promise.resolve({})
  ).then((stored) => {
    const lease = stored && stored[TABLE_TENNIS_COLLECTOR_LEASE_STORAGE_KEY];
    tableTennisCollectorLeaseCache = lease && Number(lease.leaseUntil || 0) > Date.now()
      ? lease
      : null;
    tableTennisCollectorLeaseLoaded = true;
    return tableTennisCollectorLeaseCache;
  }).finally(() => {
    tableTennisCollectorLeaseLoadPromise = null;
  });
  return tableTennisCollectorLeaseLoadPromise;
}

function isTableTennisCollectorTabUrl(value, sourceId = "") {
  try {
    const url = new URL(String(value || ""));
    return isSupportedTableTennisDataHostname(url.hostname)
      && /^\/(?:cip|c)\/table-tennis\/?(?:[?#]|$)/i.test(url.pathname)
      && (!sourceId || getTableTennisDataSourceId(url.href) === sourceId);
  } catch (_) {
    return false;
  }
}

function claimTableTennisCollectorLease(sender, value, options = {}) {
  const operation = tableTennisCollectorLeaseMutationChain
    .catch(() => {})
    .then(async () => {
      const sessionStorage = chrome.storage && chrome.storage.session;
      const owner = getBsportsfanRequestOwner(sender);
      const tabId = Number.isInteger(sender && sender.tab && sender.tab.id)
        ? sender.tab.id
        : null;
      const sourceId = getTableTennisDataSourceId(value || sender && sender.url || "");
      const now = Date.now();
      const documentId = normalizeTelegramText(sender && sender.documentId || "");
      const documentNonce = normalizeTelegramText(options.documentNonce || "");
      const documentStartedAt = Math.min(
        now,
        Math.max(0, Number(options.documentStartedAt || 0) || now)
      );
      const existing = await loadTableTennisCollectorLease();
      let existingActive = existing
        && Number(existing.leaseUntil || 0) > now
        && normalizeTelegramText(existing.owner || "");
      if (
        existingActive
        && Number.isInteger(Number(existing.tabId))
        && chrome.tabs
        && typeof chrome.tabs.get === "function"
      ) {
        const existingTab = await chrome.tabs.get(Number(existing.tabId)).catch(() => null);
        const existingSource = normalizeTelegramText(existing.sourceId || "");
        if (!existingTab || !isTableTennisCollectorTabUrl(existingTab.url, existingSource)) {
          existingActive = false;
        }
      }
      const existingSourceId = getTableTennisDataSourceId(
        existing && existing.sourceId || ""
      ) || normalizeTelegramText(existing && existing.sourceId || "");
      const sameOwner = Boolean(existingActive && isSameBsportsfanRequestOwner(existing.owner, owner));
      const sameDocument = sameOwner && Boolean(
        documentNonce
        && normalizeTelegramText(existing && existing.documentNonce || "") === documentNonce
      );
      if (
        sameOwner
        && !sameDocument
        && Number(existing && existing.documentStartedAt || 0) > documentStartedAt
      ) {
        return {
          leader: false,
          reason: "stale-collector-document",
          owner,
          sourceId: existingSourceId,
          tabId,
          retryAfterMs: Math.max(0, Number(existing.leaseUntil || 0) - now)
        };
      }
      const activeTabTakeoverCandidate = Boolean(
        options.allowActiveTabTakeover === true
        && sender && sender.tab && sender.tab.active === true
        && sourceId
        && existingActive
        && !sameOwner
      );
      let activeTabTakeover = activeTabTakeoverCandidate;
      if (
        activeTabTakeoverCandidate
        && chrome.tabs
        && typeof chrome.tabs.query === "function"
      ) {
        const focusedTabs = await chrome.tabs.query({
          active: true,
          lastFocusedWindow: true
        }).catch(() => []);
        activeTabTakeover = (Array.isArray(focusedTabs) ? focusedTabs : [])
          .some((tab) => Number(tab && tab.id) === tabId);
      }
      if (
        existingActive
        && !sameOwner
        && !activeTabTakeover
      ) {
        return {
          leader: false,
          owner: normalizeTelegramText(existing.owner || ""),
          sourceId: normalizeTelegramText(existing.sourceId || ""),
          tabId: Number.isInteger(Number(existing.tabId)) ? Number(existing.tabId) : null,
          retryAfterMs: Math.max(0, Number(existing.leaseUntil || 0) - now)
        };
      }
      const lease = {
        token: sameDocument && normalizeTelegramText(existing && existing.token || "")
          ? normalizeTelegramText(existing.token)
          : createBsportsfanLeaseToken("collector"),
        owner,
        sourceId,
        tabId,
        documentId,
        documentNonce,
        documentStartedAt,
        leaseUntil: now + TABLE_TENNIS_COLLECTOR_LEASE_MS,
        updatedAt: now
      };
      if (!sessionStorage || typeof sessionStorage.set !== "function") {
        throw createServiceWorkerError(
          "Collector lease storage is unavailable",
          "collector-lease-storage-unavailable"
        );
      }
      try {
        await sessionStorage.set({
          [TABLE_TENNIS_COLLECTOR_LEASE_STORAGE_KEY]: lease
        });
      } catch (error) {
        const persistenceError = createServiceWorkerError(
          "Collector lease could not be persisted",
          "collector-lease-persist-failed"
        );
        persistenceError.cause = error;
        throw persistenceError;
      }
      tableTennisCollectorLeaseCache = lease;
      tableTennisCollectorLeaseLoaded = true;
      if (
        activeTabTakeover
        && Number.isInteger(Number(existing && existing.tabId))
        && Number(existing.tabId) !== tabId
        && chrome.tabs
        && typeof chrome.tabs.sendMessage === "function"
      ) {
        await chrome.tabs.sendMessage(Number(existing.tabId), {
          type: "lvr:tableTennisCollectorLeaseRevoked",
          revokedToken: normalizeTelegramText(existing && existing.token || ""),
          replacementTabId: tabId,
          replacementSourceId: sourceId
        }).catch(() => {});
      }
      if (activeTabTakeover || (sameOwner && !sameDocument)) {
        const replacedOwner = normalizeTelegramText(existing && existing.owner || "");
        cancelBsportsfanProxyJobsForOwner(replacedOwner, "collector-owner-replaced");
        if (isSameBsportsfanRequestOwner(bsportsfanNavigationLeaseOwner, replacedOwner)) {
          releaseBsportsfanNavigationLease(bsportsfanNavigationLeaseToken, true);
        }
        if (isSameBsportsfanRequestOwner(bsportsfanResultBackfillLeaseOwner, replacedOwner)) {
          bsportsfanResultBackfillLeaseUntil = 0;
          bsportsfanResultBackfillLeaseOwner = "";
          bsportsfanResultBackfillLeaseToken = "";
          if (sessionStorage && typeof sessionStorage.remove === "function") {
            await sessionStorage.remove(BSPORTSFAN_MAINTENANCE_LEASE_STORAGE_KEY)
              .catch(() => {});
          }
        }
        await mutateBsportsfanForecastLeases(async () => {
          let released = false;
          for (const [key, forecastLease] of bsportsfanForecastLeases.entries()) {
            if (isSameBsportsfanRequestOwner(forecastLease && forecastLease.owner, replacedOwner)) {
              bsportsfanForecastLeases.delete(key);
              released = true;
            }
          }
          if (released) {
            await persistBsportsfanForecastLeases();
          }
          return released;
        }).catch(() => false);
      }
      await markTableTennisSourceActive(sourceId).catch(() => {});
      return {
        leader: true,
        ...lease
      };
    });
  tableTennisCollectorLeaseMutationChain = operation.then(() => undefined, () => undefined);
  return operation;
}

async function getTableTennisCollectorLease() {
  await tableTennisCollectorLeaseMutationChain.catch(() => {});
  const lease = await loadTableTennisCollectorLease();
  if (lease && Number(lease.leaseUntil || 0) > Date.now()) {
    return lease;
  }
  tableTennisCollectorLeaseCache = null;
  const sessionStorage = chrome.storage && chrome.storage.session;
  if (sessionStorage && typeof sessionStorage.remove === "function") {
    sessionStorage.remove(TABLE_TENNIS_COLLECTOR_LEASE_STORAGE_KEY).catch(() => {});
  }
  return null;
}

function releaseTableTennisCollectorLeaseForTab(tabIdValue, reason = "collector-released") {
  const tabId = Number(tabIdValue);
  if (!Number.isInteger(tabId)) {
    return Promise.resolve({ released: false, reason: "tab-id-invalid" });
  }
  const operation = tableTennisCollectorLeaseMutationChain
    .catch(() => {})
    .then(async () => {
      const lease = await loadTableTennisCollectorLease().catch(() => null);
      if (!lease || Number(lease.tabId) !== tabId) {
        return { released: false, reason: "different-collector" };
      }
      tableTennisCollectorLeaseCache = null;
      tableTennisCollectorLeaseLoaded = true;
      const sessionStorage = chrome.storage && chrome.storage.session;
      if (sessionStorage && typeof sessionStorage.remove === "function") {
        await sessionStorage.remove(TABLE_TENNIS_COLLECTOR_LEASE_STORAGE_KEY)
          .catch(() => {});
      }
      return {
        released: true,
        reason,
        tabId,
        sourceId: normalizeTelegramText(lease.sourceId || "")
      };
    });
  tableTennisCollectorLeaseMutationChain = operation.then(() => undefined, () => undefined);
  return operation;
}

async function releaseTableTennisTabRuntimeOwnership(tabIdValue, reason = "tab-released") {
  const tabId = Number(tabIdValue);
  if (!Number.isInteger(tabId)) {
    return { released: false, reason: "tab-id-invalid" };
  }
  const owner = `tab:${tabId}`;
  cancelRuntimeDeadlinesForOwner(owner, reason);
  cancelBsportsfanProxyJobsForOwner(owner, reason);
  const collector = await releaseTableTennisCollectorLeaseForTab(tabId, reason)
    .catch(() => ({ released: false }));
  if (isSameBsportsfanRequestOwner(bsportsfanNavigationLeaseOwner, owner)) {
    releaseBsportsfanNavigationLease(bsportsfanNavigationLeaseToken, true);
  }
  if (isSameBsportsfanRequestOwner(bsportsfanResultBackfillLeaseOwner, owner)) {
    bsportsfanResultBackfillLeaseUntil = 0;
    bsportsfanResultBackfillLeaseOwner = "";
    bsportsfanResultBackfillLeaseToken = "";
    const sessionStorage = chrome.storage && chrome.storage.session;
    if (sessionStorage && typeof sessionStorage.remove === "function") {
      await sessionStorage.remove(BSPORTSFAN_MAINTENANCE_LEASE_STORAGE_KEY)
        .catch(() => {});
    }
  }
  await mutateBsportsfanForecastLeases(async () => {
    let changed = false;
    for (const [key, lease] of bsportsfanForecastLeases.entries()) {
      if (isSameBsportsfanRequestOwner(lease && lease.owner, owner)) {
        bsportsfanForecastLeases.delete(key);
        changed = true;
      }
    }
    if (changed) {
      await persistBsportsfanForecastLeases();
    }
    return changed;
  }).catch(() => false);
  return { released: Boolean(collector.released), tabId, reason };
}

async function getConfirmedTableTennisCollectorLease(sender, sourceId = "", identity = {}) {
  const lease = await getTableTennisCollectorLease().catch(() => null);
  const senderTabId = Number(sender && sender.tab && sender.tab.id);
  const senderSourceId = TABLE_TENNIS_SOURCE_ORIGINS[sourceId]
    ? sourceId
    : getTableTennisDataSourceId(sender && sender.url || "");
  const senderDocumentId = normalizeTelegramText(sender && sender.documentId || "");
  const claimedLeaseToken = normalizeTelegramText(
    identity && identity.collectorLeaseToken || ""
  );
  const claimedDocumentNonce = normalizeTelegramText(
    identity && identity.documentNonce || ""
  );
  if (
    !lease
    || !Number.isInteger(senderTabId)
    || Number(lease.tabId) !== senderTabId
    || normalizeTelegramText(lease.sourceId || "") !== senderSourceId
    || !isTableTennisCollectorTabUrl(sender && sender.url || "", senderSourceId)
    || !claimedLeaseToken
    || claimedLeaseToken !== normalizeTelegramText(lease.token || "")
    || !claimedDocumentNonce
    || claimedDocumentNonce !== normalizeTelegramText(lease.documentNonce || "")
    || (
      normalizeTelegramText(lease.documentId || "")
      && senderDocumentId
      && normalizeTelegramText(lease.documentId || "") !== senderDocumentId
    )
  ) {
    return null;
  }
  return lease;
}

function validateBsportsfanProxyRequest(value, sender) {
  let url;
  try {
    url = new URL(String(value || ""));
  } catch (_) {
    throw new Error("invalid BsportsFan URL");
  }
  const hostname = url.hostname.toLowerCase();
  if (
    url.protocol !== "https:"
    || !isSupportedTableTennisDataHostname(hostname)
    || url.username
    || url.password
    || !isAllowedBsportsfanProxyPath(url.pathname)
  ) {
    throw new Error("BsportsFan proxy URL is not allowed");
  }
  validateBsportsfanProxySender(sender);
  return url;
}

function isAllowedBsportsfanProxyPath(pathname) {
  const path = String(pathname || "");
  return /^\/(?:cip|c|ce)\/table-tennis(?:\/|$)/i.test(path)
    || /^\/(?:table-tennis\/)?(?:r|rs|t|p|l)\/(?:\d+)(?:\/|$)/i.test(path);
}

function validateBsportsfanProxySender(sender) {
  const senderUrl = String(sender && sender.url || "");
  if (!senderUrl) {
    return;
  }
  let parsed;
  try {
    parsed = new URL(senderUrl);
  } catch (_) {
    throw createServiceWorkerError("invalid extension message sender", "bsportsfan-sender");
  }
  if (parsed.protocol === "chrome-extension:") {
    return;
  }
  const hostname = parsed.hostname.toLowerCase();
  if (
    parsed.protocol !== "https:"
    || !isSupportedTableTennisDataHostname(hostname)
  ) {
    throw createServiceWorkerError("untrusted BsportsFan proxy sender", "bsportsfan-sender");
  }
}

function validateBsportsfanProxyFinalUrl(value) {
  let url;
  try {
    url = new URL(String(value || ""));
  } catch (_) {
    throw createServiceWorkerError("invalid BsportsFan redirect", "bsportsfan-redirect");
  }
  const hostname = url.hostname.toLowerCase();
  if (
    url.protocol !== "https:"
    || !isSupportedTableTennisDataHostname(hostname)
    || !isAllowedBsportsfanProxyPath(url.pathname)
  ) {
    throw createServiceWorkerError("BsportsFan redirected outside the allowed route", "bsportsfan-redirect");
  }
  return url.href;
}

async function readBoundedBsportsfanResponseText(response) {
  const contentLength = Number(response && response.headers && response.headers.get
    ? response.headers.get("content-length")
    : 0);
  if (Number.isFinite(contentLength) && contentLength > BSPORTSFAN_PROXY_FETCH_MAX_CHARS) {
    throw createServiceWorkerError("BsportsFan response is too large", "bsportsfan-too-large");
  }
  if (!response || !response.body || typeof response.body.getReader !== "function") {
    const text = await response.text();
    if (text.length > BSPORTSFAN_PROXY_FETCH_MAX_CHARS) {
      throw createServiceWorkerError("BsportsFan response is too large", "bsportsfan-too-large");
    }
    return text;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let decodedChars = 0;
  let text = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      const chunk = decoder.decode(value, { stream: true });
      decodedChars += chunk.length;
      if (decodedChars > BSPORTSFAN_PROXY_FETCH_MAX_CHARS) {
        throw createServiceWorkerError("BsportsFan response is too large", "bsportsfan-too-large");
      }
      text += chunk;
    }
    text += decoder.decode();
    if (text.length > BSPORTSFAN_PROXY_FETCH_MAX_CHARS) {
      throw createServiceWorkerError("BsportsFan response is too large", "bsportsfan-too-large");
    }
    return text;
  } catch (error) {
    if (typeof reader.cancel === "function") {
      await reader.cancel().catch(() => {});
    }
    throw error;
  }
}

function isBsportsfanChallengeResponse(response, text) {
  const mitigated = String(response && response.headers && response.headers.get
    ? response.headers.get("cf-mitigated")
    : "").toLowerCase();
  if (mitigated === "challenge") {
    return true;
  }
  const sample = String(text || "").slice(0, 12000).toLowerCase();
  const title = (sample.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || "";
  const titleChallenge = [
    "один момент",
    "one moment",
    "just a moment"
  ].some((signature) => title.includes(signature));
  if (titleChallenge) {
    return true;
  }
  const strongChallengeText = [
    "один момент",
    "one moment",
    "just a moment",
    "checking your browser",
    "verify you are human",
    "enable javascript and cookies"
  ].some((signature) => sample.includes(signature));
  const structuralChallenge = [
    "cf-chl-",
    "challenges.cloudflare.com",
    "turnstile"
  ].some((signature) => sample.includes(signature));
  const recognizableTableTennisContent = /\bhref\s*=\s*["'][^"']*\/(?:table-tennis\/)?(?:r|t)\/\d+/i.test(sample);
  return (strongChallengeText || structuralChallenge)
    && !recognizableTableTennisContent;
}

function createServiceWorkerError(message, code) {
  const error = new Error(String(message || "service worker error"));
  error.code = String(code || "");
  return error;
}

async function bootstrapStorage() {
  const {
    telegramPredictionDatasetStorageVersion,
    extensionRuntimeVersion,
    extensionForceTabReload
  } = await chrome.storage.local.get({
    [TELEGRAM_PREDICTION_DATASET_STORAGE_VERSION_KEY]: 0,
    [EXTENSION_RUNTIME_VERSION_KEY]: "",
    [EXTENSION_FORCE_TAB_RELOAD_KEY]: false
  });

  await chrome.storage.local.remove(LEGACY_TELEGRAM_STORAGE_KEYS);
  const db = await openDb();
  db.close();
  if (telegramPredictionDatasetStorageVersion !== TELEGRAM_PREDICTION_DATASET_STORAGE_VERSION) {
    await migrateTelegramPredictionDatasetStorage();
  }

  const currentRuntimeVersion = typeof chrome.runtime.getManifest === "function"
    ? String(chrome.runtime.getManifest().version || "")
    : "";
  if (
    extensionForceTabReload === true
    || (
      currentRuntimeVersion
      && String(extensionRuntimeVersion || "") !== currentRuntimeVersion
    )
  ) {
    await clearBsportsfanTransientRuntimeState(true);
  }
  const extensionUpgraded = await reloadBsportsfanTabsAfterExtensionUpgrade(
    extensionRuntimeVersion,
    extensionForceTabReload === true
  );
  if (extensionForceTabReload === true) {
    await chrome.storage.local.remove(EXTENSION_FORCE_TAB_RELOAD_KEY);
  }
  const telegramSettings = await getTelegramSettings();
  if (telegramSettings.enabled && telegramSettings.botToken && telegramSettings.chatId) {
    scheduleTelegramStatsRefresh("service-start", { force: extensionUpgraded });
  }
}

async function reloadBsportsfanTabsAfterExtensionUpgrade(previousVersion, force = false) {
  const currentVersion = typeof chrome.runtime.getManifest === "function"
    ? String(chrome.runtime.getManifest().version || "")
    : "";
  if (!currentVersion || (!force && String(previousVersion || "") === currentVersion)) {
    return false;
  }
  await chrome.storage.local.set({ [EXTENSION_RUNTIME_VERSION_KEY]: currentVersion });
  if (!chrome.tabs || typeof chrome.tabs.query !== "function" || typeof chrome.tabs.reload !== "function") {
    return true;
  }
  const tabs = await chrome.tabs.query({
    url: TABLE_TENNIS_TAB_URL_PATTERNS
  }).catch(() => []);
  const reloadableTabs = (Array.isArray(tabs) ? tabs : [])
    .filter((tab) => Number.isInteger(tab && tab.id))
    .sort((left, right) => Number(Boolean(right && right.active)) - Number(Boolean(left && left.active)));
  for (const [index, tab] of reloadableTabs.entries()) {
    if (index > 0) {
      await new Promise((resolve) => setTimeout(resolve, BSPORTSFAN_TAB_RELOAD_INTERVAL_MS));
    }
    await chrome.tabs.reload(tab.id).catch(() => {});
  }
  return true;
}

async function getTelegramSettings() {
  const value = await chrome.storage.local.get({ [TELEGRAM_SETTINGS_KEY]: DEFAULT_TELEGRAM_SETTINGS });
  return sanitizeTelegramSettings(value[TELEGRAM_SETTINGS_KEY] || {});
}

function sanitizeTelegramSettings(rawSettings, previousSettings = null) {
  const source = rawSettings || {};
  const previous = previousSettings || {};
  const hasBotToken = Object.prototype.hasOwnProperty.call(source, "botToken");
  return {
    enabled: Boolean(source.enabled),
    autoSend: Boolean(source.autoSend),
    botToken: hasBotToken && String(source.botToken || "").trim()
      ? String(source.botToken || "").trim()
      : String(previous.botToken || "").trim(),
    chatId: String(source.chatId || "").trim()
  };
}

async function validateSuppliedTelegramBotToken(rawSettings) {
  const token = String(rawSettings && rawSettings.botToken || "").trim();
  if (!token) {
    return null;
  }
  const validation = await validateTelegramBotToken(token);
  if (!validation.valid) {
    throw new Error("Telegram bot token недействителен: " + (validation.reason || "Unauthorized"));
  }
  return validation;
}

async function validateTelegramBotToken(token) {
  const controller = typeof AbortController === "function" ? new AbortController() : null;
  const timeoutId = controller
    ? setTimeout(() => controller.abort(), TELEGRAM_SEND_TIMEOUT_MS)
    : 0;
  try {
    const response = await fetch(
      "https://api.telegram.org/bot" + String(token || "").trim() + "/getMe",
      { signal: controller && controller.signal }
    );
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload || payload.ok === false) {
      return {
        valid: false,
        reason: normalizeTelegramText(payload && payload.description || response.status || "validation-failed")
      };
    }
    return {
      valid: true,
      id: Number(payload.result && payload.result.id || 0) || null,
      username: normalizeTelegramText(payload.result && payload.result.username || ""),
      name: normalizeTelegramText(payload.result && payload.result.first_name || "")
    };
  } catch (error) {
    return { valid: false, reason: stringifyError(error) || "validation-failed" };
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

function redactTelegramSettings(settings) {
  const safe = sanitizeTelegramSettings(settings);
  return {
    ...safe,
    botToken: safe.botToken ? `${safe.botToken.slice(0, 8)}...` : ""
  };
}

function sendTelegramPrediction(prediction, options = {}) {
  const receipt = captureTelegramPredictionReceipt(prediction);
  if (options.requireCollector === true) {
    receipt.collectorGuard = {
      requireCollector: true,
      sender: options.sender || null,
      identity: options.identity || null
    };
  }
  const identity = getTelegramMatchIdentityKey(receipt.prediction.matchUrl || "")
    || receipt.prediction.matchUrl
    || `receipt:${receipt.receivedAt}`;
  const queued = telegramMatchStartSendQueue.find((job) => job && job.identity === identity);
  if (queued) {
    queued.receipt = receipt;
    return queued.task;
  }
  let resolveTask;
  let rejectTask;
  const task = new Promise((resolve, reject) => {
    resolveTask = resolve;
    rejectTask = reject;
  });
  telegramMatchStartSendInFlight.set(identity, task);
  telegramMatchStartSendQueue.push({
    identity,
    receipt,
    resolve: resolveTask,
    reject: rejectTask,
    task
  });
  drainTelegramPredictionSendQueue();
  return task;
}

function drainTelegramPredictionSendQueue() {
  while (
    telegramMatchStartSendActive < TELEGRAM_PREDICTION_SEND_CONCURRENCY
    && telegramMatchStartSendQueue.length
  ) {
    const jobIndex = telegramMatchStartSendQueue.findIndex((candidate) => (
      candidate && !telegramMatchStartSendActiveIdentities.has(candidate.identity)
    ));
    if (jobIndex < 0) {
      break;
    }
    const [job] = telegramMatchStartSendQueue.splice(jobIndex, 1);
    telegramMatchStartSendActive += 1;
    telegramMatchStartSendActiveIdentities.add(job.identity);
    Promise.resolve()
      .then(() => sendTelegramPredictionNow(job.receipt.prediction, job.receipt))
      .then(job.resolve, job.reject)
      .finally(() => {
        telegramMatchStartSendActive = Math.max(0, telegramMatchStartSendActive - 1);
        telegramMatchStartSendActiveIdentities.delete(job.identity);
        if (telegramMatchStartSendInFlight.get(job.identity) === job.task) {
          telegramMatchStartSendInFlight.delete(job.identity);
        }
        drainTelegramPredictionSendQueue();
        if (!telegramMatchStartSendActive && !telegramMatchStartSendQueue.length) {
          for (const resolve of telegramMatchStartSendIdleWaiters) {
            resolve();
          }
          telegramMatchStartSendIdleWaiters.clear();
        }
      });
  }
}

function waitForTelegramPredictionSendIdle() {
  if (!telegramMatchStartSendActive && !telegramMatchStartSendQueue.length) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    telegramMatchStartSendIdleWaiters.add(resolve);
  });
}

function captureTelegramPredictionReceipt(prediction) {
  const source = prediction && typeof prediction === "object" ? prediction : {};
  const matchUrl = normalizeTelegramMatchKey(source.matchUrl || "");
  const normalizedPrediction = { ...source, matchUrl };
  const receivedAt = Date.now();
  const acceptance = matchUrl
    ? validateTelegramPrematchPrediction(normalizedPrediction)
    : { accepted: false, reason: "missing-match-url" };
  const deliveryAt = Number(
    normalizedPrediction.deliveryEntryState && normalizedPrediction.deliveryEntryState.capturedAt
    || normalizedPrediction.deliveryObservedAt
    || 0
  );
  const deadlineAt = acceptance.accepted && acceptance.ruleId === TELEGRAM_MATCH_START_RULE_ID && deliveryAt > 0
    ? deliveryAt + TELEGRAM_MATCH_START_DELIVERY_MAX_AGE_MS
    : 0;
  return {
    prediction: normalizedPrediction,
    acceptance,
    receivedAt,
    deadlineAt
  };
}

async function sendTelegramPredictionNow(prediction, receipt = null) {
  const source = prediction && typeof prediction === "object" ? prediction : {};
  const matchUrl = normalizeTelegramMatchKey(source.matchUrl || "");
  prediction = { ...source, matchUrl };
  if (!matchUrl) {
    return { sent: false, reason: "missing-match-url" };
  }
  const collectorGuard = receipt && receipt.collectorGuard;
  if (collectorGuard && collectorGuard.requireCollector === true) {
    const guardSender = collectorGuard.sender;
    const sourceId = getTableTennisDataSourceId(guardSender && guardSender.url || "");
    const collectorConfirmed = Boolean(
      sourceId
      && await getConfirmedTableTennisCollectorLease(
        guardSender,
        sourceId,
        collectorGuard.identity || {}
      )
    );
    if (!collectorConfirmed) {
      return {
        sent: false,
        accepted: false,
        reason: "stale-prediction-collector",
        matchUrl
      };
    }
  }

  const acceptance = receipt && receipt.acceptance
    ? receipt.acceptance
    : validateTelegramPrematchPrediction(prediction);
  if (!acceptance.accepted) {
    const outcome = {
      accepted: false,
      sent: false,
      reason: acceptance.reason
    };
    await Promise.all([
      saveTelegramPredictionAudit(prediction, matchUrl, outcome),
      saveTelegramPredictionDatasetFromPrediction(prediction, matchUrl, outcome)
    ]);
    return { sent: false, accepted: false, reason: acceptance.reason, matchUrl };
  }

  const deliveryDeadlineAt = Number(receipt && receipt.deadlineAt || 0);
  if (isTelegramDeliveryDeadlineExpired(deliveryDeadlineAt)) {
    return recordExpiredTelegramPredictionDelivery(prediction, matchUrl, acceptance);
  }

  const settings = await getTelegramSettings();
  if (!settings.enabled || !settings.botToken || !settings.chatId) {
    const outcome = {
      accepted: true,
      sent: false,
      reason: "telegram-disabled",
      gateReason: acceptance.reason
    };
    await saveTelegramPredictionDatasetFromPrediction(prediction, matchUrl, outcome);
    return { sent: false, accepted: true, reason: "telegram-disabled", matchUrl };
  }

  const sentMap = await getTelegramSentMap();
  const deliveryKey = buildTelegramDeliveryKey(
    settings,
    `${getTelegramMatchIdentityKey(matchUrl)}|prematch-bet`
  );
  const duplicateDeliveryKey = findRecentTelegramMatchDeliveryKey(
    sentMap,
    settings,
    matchUrl,
    "prematch-bet"
  );
  if (duplicateDeliveryKey) {
    const openingMarket = getTelegramReferenceMoneylineMarket(prediction);
    const labelRepair = await (
      openingMarket
        ? updateTelegramPredictionMessageOpeningOdds(matchUrl, openingMarket)
        : repairTelegramPredictionMoneylineLabel(duplicateDeliveryKey, settings)
    ).catch((error) => ({
      edited: false,
      error: stringifyError(error)
    }));
    const outcome = {
      accepted: acceptance.accepted,
      sent: false,
      reason: "duplicate",
      gateReason: acceptance.reason
    };
    await saveTelegramPredictionDatasetFromPrediction(prediction, matchUrl, outcome);
    return { sent: false, reason: "duplicate", labelRepair };
  }

  const text = formatTelegramPredictionMessage(prediction);
  if (isTelegramDeliveryDeadlineExpired(deliveryDeadlineAt)) {
    return recordExpiredTelegramPredictionDelivery(prediction, matchUrl, acceptance);
  }
  let sendResult = null;
  try {
    sendResult = await sendTelegramMessage(text, settings, {
      captureMessages: true,
      deadlineAt: deliveryDeadlineAt,
      deadlineReason: "match-start-delivery-expired"
    });
  } catch (error) {
    const message = stringifyError(error);
    const deadlineExpired = normalizeTelegramText(error && error.code || "") === "match-start-delivery-expired";
    const reason = deadlineExpired ? "match-start-delivery-expired" : "telegram-send-error";
    const outcome = {
      accepted: acceptance.accepted,
      sent: false,
      reason,
      gateReason: acceptance.reason,
      error: message
    };
    await Promise.all([
      saveTelegramPredictionAudit(prediction, matchUrl, outcome),
      saveTelegramPredictionDatasetFromPrediction(prediction, matchUrl, outcome)
    ]);
    return {
      ok: false,
      sent: false,
      accepted: acceptance.accepted,
      reason,
      error: message,
      matchUrl
    };
  }
  const sent = Boolean(sendResult && sendResult.sent);
  const telegramMessages = sendResult && Array.isArray(sendResult.messages) ? sendResult.messages : [];
  const telegramErrors = sendResult && Array.isArray(sendResult.errors) ? sendResult.errors.map(normalizeTelegramText).filter(Boolean) : [];
  const partial = Boolean(sendResult && sendResult.partial || telegramErrors.length);
  const outcome = {
    accepted: true,
    sent,
    reason: sent
      ? partial ? "sent-partial" : "sent"
      : "send-returned-false",
    gateReason: acceptance.reason,
    error: telegramErrors.join("; "),
    telegramMessages,
    telegramText: text
  };
  const auditPromise = Promise.all([
    saveTelegramPredictionAudit(prediction, matchUrl, outcome),
    saveTelegramPredictionDatasetFromPrediction(prediction, matchUrl, outcome)
  ]);
  if (!sent) {
    await auditPromise;
    return {
      ok: false,
      sent: false,
      reason: "send-returned-false",
      matchUrl,
      telegramMessages: telegramMessages.length
    };
  }

  await Promise.all([
    recordTelegramSentDelivery(deliveryKey),
    saveTelegramPredictionMessageRef(deliveryKey, matchUrl, prediction, text, telegramMessages, {
      accepted: true,
      gateReason: acceptance.reason
    }),
    auditPromise
  ]);
  const statsMessage = scheduleTelegramStatsRefresh(
    "prediction-sent",
    { force: true }
  );
  return {
    sent: true,
    accepted: acceptance.accepted,
    reason: outcome.reason,
    partial,
    errors: telegramErrors,
    matchUrl,
    telegramMessages: telegramMessages.length,
    statsMessage
  };
}

function scheduleTelegramStatsRefresh(reason, options = {}) {
  if (telegramStatsRefreshPending) {
    telegramStatsRefreshPending.reason = normalizeTelegramText(reason || telegramStatsRefreshPending.reason);
    telegramStatsRefreshPending.createMissing = Boolean(
      telegramStatsRefreshPending.createMissing
      || options.createMissing !== false
    );
    telegramStatsRefreshPending.force = Boolean(
      telegramStatsRefreshPending.force
      || options.force === true
    );
    return { scheduled: true, coalesced: true };
  }

  telegramStatsRefreshPending = {
    reason: normalizeTelegramText(reason || "prediction-sent"),
    createMissing: options.createMissing !== false,
    force: options.force === true
  };
  const task = telegramStatsRefreshChain
    .catch(() => {})
    .then(async () => {
      await new Promise((resolve) => setTimeout(resolve, TELEGRAM_STATS_REFRESH_DEBOUNCE_MS));
      const pending = telegramStatsRefreshPending;
      telegramStatsRefreshPending = null;
      if (!pending) {
        return { updated: false, reason: "stats-refresh-empty" };
      }
      return updateTelegramStatsMessageNow(pending.reason, {
        createMissing: pending.createMissing,
        force: pending.force
      });
    });
  telegramStatsRefreshChain = task.catch((error) => {
    console.warn("[Prematch Forecast] Deferred stats refresh failed", error);
    return {
      updated: false,
      reason: "stats-update-error",
      error: stringifyError(error)
    };
  });
  return { scheduled: true, coalesced: false };
}

function isTelegramDeliveryDeadlineExpired(deadlineAt) {
  const value = Number(deadlineAt || 0);
  return value > 0 && Date.now() >= value;
}

async function recordExpiredTelegramPredictionDelivery(prediction, matchUrl, acceptance) {
  const outcome = {
    accepted: true,
    sent: false,
    reason: "match-start-delivery-expired",
    gateReason: acceptance && acceptance.reason || ""
  };
  await Promise.all([
    saveTelegramPredictionAudit(prediction, matchUrl, outcome),
    saveTelegramPredictionDatasetFromPrediction(prediction, matchUrl, outcome)
  ]);
  return {
    sent: false,
    accepted: true,
    reason: outcome.reason,
    matchUrl
  };
}

function isTelegramSetTimelineLine(value) {
  const text = normalizeTelegramText(value);
  return /^(?:1️⃣|2️⃣|3️⃣|4️⃣|5️⃣)\s*:/u.test(text)
    || /^Сет\s+\d+\s*(?::|\s+(?:итог|прогноз):)/i.test(text)
    || /^(?:✅|❌|🟢|🔴)\s*Сет\s+\d+\s*:/i.test(text);
}

async function saveTelegramPredictionDatasetFromPrediction(prediction, matchUrlValue, outcome = {}) {
  const source = prediction && typeof prediction === "object" ? prediction : {};
  const matchUrl = normalizeTelegramMatchKey(matchUrlValue || source.matchUrl || "");
  if (!matchUrl) {
    return null;
  }
  const players = Array.isArray(source.players) ? source.players.slice(0, 2).map(normalizeTelegramText).filter(Boolean) : [];
  const sideIndex = sanitizeCalibrationSideIndex(source.sideIndex !== undefined ? source.sideIndex : source.predictedIndex);
  const prematchSnapshot = buildTelegramPredictionDatasetPrematch(source, matchUrl, outcome);
  const updated = await updateTelegramPredictionDatasetMatch(matchUrl, (record) => {
    const canonicalPrematch = selectTelegramPredictionDatasetPrematch(
      record && (record.prematch || record.prematchSnapshot),
      prematchSnapshot
    );
    return {
      ...record,
      players: players.length ? players : record.players || [],
      playerName: normalizeTelegramText(source.playerName || record.playerName || ""),
      sideIndex: sideIndex !== null ? sideIndex : record.sideIndex ?? null,
      leagueName: normalizeTelegramText(canonicalPrematch.leagueName || record.leagueName || ""),
      prematchSnapshot: canonicalPrematch,
      prematch: canonicalPrematch,
      events: appendTelegramPredictionDatasetEvent(record.events, {
        ts: Date.now(),
        kind: "prematch",
        action: prematchSnapshot.action,
        decisionAction: prematchSnapshot.decisionAction,
        decisionLabel: prematchSnapshot.decisionLabel,
        accepted: prematchSnapshot.accepted,
        sent: prematchSnapshot.sent,
        reason: prematchSnapshot.reason,
        gateReason: prematchSnapshot.gateReason,
        modelVersion: prematchSnapshot.modelVersion,
        coverageRuleId: prematchSnapshot.coverageRuleId,
        deliveryMode: prematchSnapshot.deliveryMode,
        deliveryObservedAt: prematchSnapshot.deliveryObservedAt,
        entrySetState: prematchSnapshot.deliveryEntryState && prematchSnapshot.deliveryEntryState.setState,
        entryTargetSetNumber: prematchSnapshot.deliveryEntryState && prematchSnapshot.deliveryEntryState.targetSetNumber
      })
    };
  });
  return updated;
}

function selectTelegramPredictionDatasetPrematch(existing, incoming) {
  const current = existing && typeof existing === "object" ? existing : null;
  const next = incoming && typeof incoming === "object" ? incoming : null;
  if (!current) {
    return next || {};
  }
  if (!next) {
    return current;
  }
  const currentSent = current.sent === true || current.sent === 1;
  const nextSent = next.sent === true || next.sent === 1;
  return currentSent && !nextSent ? current : next;
}

async function saveTelegramPredictionDatasetFromRecord(record) {
  const source = record && typeof record === "object" ? record : {};
  if (!source.prediction) {
    return null;
  }
  const outcome = source.outcome && typeof source.outcome === "object" ? source.outcome : source;
  return saveTelegramPredictionDatasetFromPrediction(
    source.prediction,
    source.matchUrl || source.prediction && source.prediction.matchUrl || "",
    outcome
  );
}

async function saveTelegramPredictionDatasetPointSnapshot(snapshot) {
  const source = snapshot && typeof snapshot === "object" ? snapshot : {};
  const matchUrl = normalizeTelegramMatchKey(source.matchUrl || "");
  if (!matchUrl) {
    return null;
  }
  const entry = buildTelegramPredictionDatasetPointSnapshot(source);
  if (!entry) {
    return null;
  }
  const result = await enqueueTelegramPredictionDatasetMutation(async () => {
    const pointsByMatch = new Map([
      [matchUrl, {
        entries: [entry],
        players: Array.isArray(entry.players) ? entry.players : [],
        updatedAt: Number(entry.ts || 0) || Date.now()
      }]
    ]);
    return upsertTelegramPredictionPointBatches(pointsByMatch);
  });
  scheduleStorageMaintenance().catch(() => {});
  return {
    matchUrl,
    key: entry.key,
    recorded: true,
    result
  };
}

async function flushTelegramPredictionPointSnapshots() {
  await telegramPredictionDatasetMutationChain.catch(() => {});
  return { flushed: 0, matches: 0, durable: true };
}

async function clearTelegramPredictionDataset() {
  await Promise.all([
    waitForTelegramPredictionSendIdle(),
    telegramPredictionResultUpdateChain.catch(() => {}),
    telegramAuditMutationChain.catch(() => {})
  ]);
  const clearedMessageRefs = await mutateTelegramPredictionMessageRefs(async (refs) => {
    const count = Object.keys(refs).length;
    for (const key of Object.keys(refs)) {
      delete refs[key];
    }
    return count;
  });
  return enqueueTelegramPredictionDatasetMutation(async () => {
    const [value, pointRecords] = await Promise.all([
      chrome.storage.local.get({ [TELEGRAM_PREDICTION_DATASET_KEY]: [] }),
      readTelegramPredictionPointRecords()
    ]);
    const rows = Array.isArray(value[TELEGRAM_PREDICTION_DATASET_KEY])
      ? value[TELEGRAM_PREDICTION_DATASET_KEY].length
      : 0;
    await Promise.all([
      chrome.storage.local.set({
        [TELEGRAM_PREDICTION_DATASET_KEY]: [],
        [TELEGRAM_PREDICTION_DATASET_STORAGE_VERSION_KEY]: TELEGRAM_PREDICTION_DATASET_STORAGE_VERSION
      }),
      clearTelegramPredictionPointRecords()
    ]);
    return {
      cleared: true,
      rows,
      pointRecords: pointRecords.length,
      messageRefs: clearedMessageRefs
    };
  });
}

async function upsertTelegramPredictionPointBatches(pointsByMatch) {
  const batches = pointsByMatch instanceof Map
    ? Array.from(pointsByMatch.entries()).filter(([matchUrl, batch]) => (
      normalizeTelegramMatchKey(matchUrl || "")
      && batch
      && Array.isArray(batch.entries)
      && batch.entries.length
    ))
    : [];
  if (!batches.length) {
    return { flushed: 0, matches: 0 };
  }

  const db = await openDb();
  try {
    if (!db.objectStoreNames.contains(STORE_PREDICTION_POINTS)) {
      throw new Error("Prediction point store is unavailable");
    }
    await new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_PREDICTION_POINTS, "readwrite");
      const store = transaction.objectStore(STORE_PREDICTION_POINTS);

      for (const [matchUrl, batch] of batches) {
        const normalizedUrl = normalizeTelegramMatchKey(matchUrl || "");
        const request = store.get(normalizedUrl);
        request.onsuccess = () => {
          try {
            store.put(buildTelegramPredictionPointRecord(request.result, normalizedUrl, batch));
          } catch (error) {
            transaction.abort();
            reject(error);
          }
        };
      }

      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error || new Error("Prediction point transaction aborted"));
    });
  } finally {
    db.close();
  }

  return {
    flushed: batches.reduce((total, [, batch]) => total + batch.entries.length, 0),
    matches: batches.length
  };
}

function buildTelegramPredictionPointRecord(existingRecord, matchUrl, batch) {
  const existing = existingRecord && typeof existingRecord === "object" ? existingRecord : {};
  const incoming = Array.isArray(batch && batch.entries)
    ? batch.entries
      .map((entry) => compactTelegramPredictionDatasetValue(entry))
      .filter((entry) => entry && typeof entry === "object")
      .sort((left, right) => Number(left.ts || 0) - Number(right.ts || 0))
    : [];
  let pointTimeline = Array.isArray(existing.pointTimeline)
    ? existing.pointTimeline.slice()
    : Array.isArray(existing.pointByPoint)
      ? existing.pointByPoint.slice()
      : [];
  let nextPointIndex = pointTimeline.reduce((maximum, entry) => {
    const pointIndex = finitePredictionDatasetNumber(entry && entry.pointIndex);
    return pointIndex === undefined ? maximum : Math.max(maximum, pointIndex);
  }, 0);
  let players = Array.isArray(batch && batch.players) && batch.players.length
    ? batch.players.slice(0, 2).map(normalizeTelegramText).filter(Boolean)
    : Array.isArray(existing.players)
      ? existing.players.slice(0, 2).map(normalizeTelegramText).filter(Boolean)
      : [];

  for (const entry of incoming) {
    const key = getTelegramPredictionPointEntryKey(entry);
    const previous = pointTimeline.find(
      (item) => getTelegramPredictionPointEntryKey(item) === key
    );
    const previousIndex = finitePredictionDatasetNumber(previous && previous.pointIndex);
    if (previousIndex === undefined) {
      nextPointIndex += 1;
    }
    const pointEntry = {
      ...entry,
      key,
      pointIndex: previousIndex === undefined ? nextPointIndex : previousIndex
    };
    pointTimeline = upsertTelegramPredictionDatasetArrayItem(
      pointTimeline,
      pointEntry,
      key,
      TELEGRAM_PREDICTION_POINT_TIMELINE_LIMIT
    );
    if (Array.isArray(pointEntry.players) && pointEntry.players.length) {
      players = pointEntry.players.slice(0, 2).map(normalizeTelegramText).filter(Boolean);
    }
  }

  const pointTimes = pointTimeline.map((entry) => Number(entry && entry.ts || 0)).filter(Number.isFinite);
  const createdAt = Number(existing.createdAt || batch && batch.createdAt || 0)
    || (pointTimes.length ? Math.min(...pointTimes) : Date.now());
  const updatedAt = Math.max(
    Number(existing.updatedAt || 0),
    Number(batch && batch.updatedAt || 0),
    ...(pointTimes.length ? pointTimes : [createdAt])
  );
  return compactTelegramPredictionDatasetValue({
    schemaVersion: 1,
    source: "bsportsfan",
    matchUrl,
    players,
    pointTimeline,
    createdAt,
    updatedAt
  });
}

function getTelegramPredictionPointEntryKey(entry) {
  const source = entry && typeof entry === "object" ? entry : {};
  const explicit = normalizeTelegramText(source.key || "");
  if (explicit) {
    return explicit;
  }
  return [
    Number(source.ts || 0),
    Number(source.targetSetNumber || 0),
    normalizeTelegramText(source.setState || ""),
    normalizeTelegramText(source.currentSetScore || ""),
    Array.isArray(source.completedSetScores) ? source.completedSetScores.join(" ") : ""
  ].join("|");
}

async function saveTelegramPredictionDatasetHistoricalOpeningOdds(value) {
  const source = value && typeof value === "object" ? value : {};
  const matchUrl = normalizeTelegramMatchKey(source.matchUrl || "");
  const leftOdds = finitePredictionDatasetNumber(source.leftOdds);
  const rightOdds = finitePredictionDatasetNumber(source.rightOdds);
  const quoteSource = normalizeTelegramText(source.quoteSource || source.preferredSource || "").toLowerCase();
  if (!matchUrl || !(leftOdds > 1) || !(rightOdds > 1) || quoteSource !== "opening") {
    return null;
  }
  const backfilledAt = Date.now();
  const historicalOpeningMoneyline = compactTelegramPredictionDatasetValue({
    status: "ready",
    reason: "historical-opening-odds-backfill",
    marketType: "matchResult",
    quoteSource: "opening",
    preferredSource: "opening",
    leftOdds,
    rightOdds,
    source: normalizeTelegramText(source.source || "bsportsfan-odds"),
    sourceUrl: normalizeTelegramText(source.sourceUrl || source.url || "").replace(/[?#].*$/, ""),
    observedAt: finitePredictionDatasetNumber(source.observedAt) || backfilledAt,
    backfilledAt,
    retrospective: true,
    executionVerified: false
  });
  const record = await updateTelegramPredictionDatasetMatch(matchUrl, (record) => ({
    ...record,
    historicalOpeningMoneyline,
    events: appendTelegramPredictionDatasetEvent(record.events, {
      ts: backfilledAt,
      kind: "historical_opening_odds",
      leftOdds,
      rightOdds,
      retrospective: true,
      executionVerified: false
    })
  }), { createIfMissing: false });
  if (record) {
    await updateTelegramPredictionMessageOpeningOdds(
      matchUrl,
      historicalOpeningMoneyline
    ).catch(() => null);
  }
  return record;
}

async function updateTelegramPredictionMessageOpeningOdds(matchUrlValue, market) {
  const matchUrl = normalizeTelegramMatchKey(matchUrlValue || "");
  const leftOdds = finiteAuditNumber(market && market.leftOdds);
  const rightOdds = finiteAuditNumber(market && market.rightOdds);
  if (!matchUrl || !(leftOdds > 1) || !(rightOdds > 1)) {
    return { edited: false, reason: "opening-odds-missing" };
  }
  return mutateTelegramPredictionMessageRefs(async (refs) => {
  const matching = Object.entries(refs)
    .filter(([, ref]) => ref && isSameTelegramMatch(ref.matchUrl, matchUrl));
  if (!matching.length) {
    return { edited: false, reason: "message-ref-missing" };
  }
  const settings = await getTelegramSettings();
  let edited = 0;
  for (const [key, ref] of matching) {
    const players = Array.isArray(ref.players)
      ? ref.players.slice(0, 2).map(normalizeTelegramText).filter(Boolean)
      : [];
    if (players.length < 2) {
      continue;
    }
    const referenceMoneylineMarket = {
      status: "ready",
      marketType: "matchResult",
      quoteSource: "opening",
      leftOdds,
      rightOdds,
      usage: "display-only",
      modelInput: false
    };
    const matchLine = formatTelegramPredictionMatchLine({
      ...ref,
      players,
      referenceMoneylineMarket
    }, players, normalizeTelegramText(ref.playerName || ""));
    const nextText = normalizeTelegramMessageText(ref.text || "")
      .split("\n")
      .filter((line) => !isTelegramPredictionTechnicalMetricLine(line))
      .map((line) => /^🆚\s*/.test(normalizeTelegramText(line)) ? matchLine : line)
      .join("\n");
    if (!matchLine || !nextText || normalizeTelegramMessageText(ref.text) === nextText) {
      continue;
    }
    const messages = sanitizeTelegramMessageRefs(ref.messages);
    let refEdited = 0;
    if (settings.enabled && settings.botToken) {
      for (const message of messages) {
        const response = await editTelegramMessageText(nextText, settings, message);
        if (response.edited || /message is not modified/i.test(response.reason || "")) {
          refEdited += 1;
        }
      }
    }
    const sideIndex = sanitizeCalibrationSideIndex(ref.sideIndex);
    refs[key] = {
      ...ref,
      text: refEdited > 0 ? nextText : ref.text,
      leftOdds,
      rightOdds,
      playerOdds: sideIndex === 0 ? leftOdds : sideIndex === 1 ? rightOdds : null,
      opponentOdds: sideIndex === 0 ? rightOdds : sideIndex === 1 ? leftOdds : null,
      referenceMoneylineMarket,
      referenceOddsMeaning: "display-only-match-winner",
      openingOddsEditPending: refEdited === 0,
      editedAt: refEdited > 0 ? Date.now() : Number(ref.editedAt || 0)
    };
    if (refEdited > 0) {
      edited += refEdited;
    }
  }
  return {
    edited: edited > 0,
    messages: edited,
    referencesUpdated: matching.length
  };
  });
}

function hydrateTelegramPredictionRefOpeningOdds(ref, datasetRecord) {
  const source = ref && typeof ref === "object" ? ref : {};
  if (getTelegramReferenceMoneylineMarket(source)) {
    return source;
  }
  const record = datasetRecord && typeof datasetRecord === "object" ? datasetRecord : {};
  const prematch = record.prematch || record.prematchSnapshot || {};
  const market = [
    record.historicalOpeningMoneyline,
    prematch.referenceMoneylineMarket,
    prematch.moneylineMarket
  ].find((candidate) => (
    candidate
    && finiteAuditNumber(candidate.leftOdds) > 1
    && finiteAuditNumber(candidate.rightOdds) > 1
    && normalizeTelegramText(
      candidate.quoteSource || candidate.preferredSource || ""
    ).toLowerCase() === "opening"
  ));
  if (!market) {
    return source;
  }

  const refPlayers = Array.isArray(source.players)
    ? source.players.slice(0, 2).map(normalizeTelegramText).filter(Boolean)
    : [];
  const recordPlayers = Array.isArray(record.players) && record.players.length >= 2
    ? record.players.slice(0, 2).map(normalizeTelegramText).filter(Boolean)
    : Array.isArray(prematch.players)
      ? prematch.players.slice(0, 2).map(normalizeTelegramText).filter(Boolean)
      : [];
  let reversed = false;
  if (refPlayers.length >= 2 && recordPlayers.length >= 2) {
    const sameOrder = areTelegramNamesSame(refPlayers[0], recordPlayers[0])
      && areTelegramNamesSame(refPlayers[1], recordPlayers[1]);
    const reverseOrder = areTelegramNamesSame(refPlayers[0], recordPlayers[1])
      && areTelegramNamesSame(refPlayers[1], recordPlayers[0]);
    if (!sameOrder && !reverseOrder) {
      return source;
    }
    reversed = reverseOrder;
  }

  const marketLeftOdds = finiteAuditNumber(market.leftOdds);
  const marketRightOdds = finiteAuditNumber(market.rightOdds);
  const leftOdds = reversed ? marketRightOdds : marketLeftOdds;
  const rightOdds = reversed ? marketLeftOdds : marketRightOdds;
  const sideIndex = sanitizeCalibrationSideIndex(source.sideIndex);
  return {
    ...source,
    leftOdds,
    rightOdds,
    playerOdds: sideIndex === 0 ? leftOdds : sideIndex === 1 ? rightOdds : source.playerOdds,
    opponentOdds: sideIndex === 0 ? rightOdds : sideIndex === 1 ? leftOdds : source.opponentOdds,
    referenceMoneylineMarket: {
      status: "ready",
      marketType: "matchResult",
      quoteSource: "opening",
      leftOdds,
      rightOdds,
      usage: "display-only",
      modelInput: false
    },
    referenceOddsMeaning: "display-only-match-winner"
  };
}

function restoreTelegramPredictionOpeningOddsInText(text, ref) {
  const players = Array.isArray(ref && ref.players)
    ? ref.players.slice(0, 2).map(normalizeTelegramText).filter(Boolean)
    : [];
  if (players.length < 2) {
    return normalizeTelegramMessageText(text || "");
  }
  const hasOdds = Boolean(getTelegramReferenceMoneylineMarket(ref))
    || finiteAuditNumber(ref && ref.leftOdds) > 1
    && finiteAuditNumber(ref && ref.rightOdds) > 1;
  if (!hasOdds) {
    return normalizeTelegramMessageText(text || "");
  }
  const matchLine = formatTelegramPredictionMatchLine(
    { ...ref, players },
    players,
    normalizeTelegramText(ref && ref.playerName || "")
  );
  if (!matchLine) {
    return normalizeTelegramMessageText(text || "");
  }
  return normalizeTelegramMessageText(text || "")
    .split("\n")
    .map((line) => /^🆚\s*/.test(normalizeTelegramText(line)) ? matchLine : line)
    .join("\n");
}

async function updateTelegramPredictionDatasetResult(matchUrlValue, finalScoreValue, result = {}) {
  const matchUrl = normalizeTelegramMatchKey(matchUrlValue || result && result.matchUrl || "");
  const finalScore = normalizeTelegramFinalScore(finalScoreValue || result && result.finalScore || "");
  if (!matchUrl || !finalScore) {
    return null;
  }
  const source = result && typeof result === "object" ? result : {};
  const shouldCreate = source.createDatasetIfMissing === true;
  let changed = false;
  const updated = await updateTelegramPredictionDatasetMatch(matchUrl, (record) => {
    const prematch = record && (record.prematchSnapshot || record.prematch);
    const prematchPlayers = Array.isArray(prematch && prematch.players)
      ? prematch.players.slice(0, 2).map(normalizeTelegramText).filter(Boolean)
      : [];
    const recordPlayers = Array.isArray(record && record.players)
      ? record.players.slice(0, 2).map(normalizeTelegramText).filter(Boolean)
      : [];
    const sourceRecordPlayers = Array.isArray(source.recordPlayers)
      ? source.recordPlayers.slice(0, 2).map(normalizeTelegramText).filter(Boolean)
      : [];
    const players = prematchPlayers.length
      ? prematchPlayers
      : recordPlayers.length
        ? recordPlayers
        : sourceRecordPlayers.length
          ? sourceRecordPlayers
          : Array.isArray(source.players)
            ? source.players.slice(0, 2).map(normalizeTelegramText).filter(Boolean)
          : [];
    const prematchSideIndex = sanitizeCalibrationSideIndex(prematch && prematch.sideIndex);
    const recordSideIndex = sanitizeCalibrationSideIndex(record && record.sideIndex);
    const sourceSideIndex = sanitizeCalibrationSideIndex(source.sideIndex);
    const existingPlayerIds = getTelegramDatasetRecordPlayerIds(record);
    const sourceRecordPlayerIds = Array.isArray(source.recordPlayerIds)
      ? source.recordPlayerIds.slice(0, 2).map(normalizeTelegramText)
      : [];
    const nextRecord = {
      ...record,
      players: players.length ? players : record.players || [],
      playerIds: existingPlayerIds.some(Boolean)
        ? existingPlayerIds
        : sourceRecordPlayerIds,
      playerName: normalizeTelegramText(prematch && prematch.playerName || record.playerName || source.playerName || ""),
      sideIndex: prematchSideIndex !== null
        ? prematchSideIndex
        : recordSideIndex !== null
          ? recordSideIndex
          : sourceSideIndex
    };
    const resultEntry = buildTelegramPredictionDatasetResult(nextRecord, finalScore, source);
    const existingResult = getTelegramPredictionDatasetResult(record);
    const existingResolved = isResolvedTelegramPredictionDatasetResult(existingResult);
    const incomingResolved = isResolvedTelegramPredictionDatasetResult(resultEntry);
    if (existingResolved && !incomingResolved) {
      return record;
    }
    if (
      existingResolved
      && incomingResolved
      && (
        normalizeTelegramFinalScore(existingResult.finalScore || "") !== normalizeTelegramFinalScore(resultEntry.finalScore || "")
        || normalizeTelegramText(existingResult.status || "") !== normalizeTelegramText(resultEntry.status || "")
      )
    ) {
      return record;
    }
    if (
      existingResolved
      && incomingResolved
      && normalizeTelegramFinalScore(existingResult.finalScore || "") === normalizeTelegramFinalScore(resultEntry.finalScore || "")
      && normalizeTelegramText(existingResult.status || "") === normalizeTelegramText(resultEntry.status || "")
      && normalizeTelegramText(existingResult.resultOrientation || "") === normalizeTelegramText(resultEntry.resultOrientation || "")
    ) {
      return record;
    }
    if (
      !existingResolved
      && !incomingResolved
      && normalizeTelegramFinalScore(existingResult && existingResult.observedFinalScore || "") === normalizeTelegramFinalScore(resultEntry.observedFinalScore || "")
      && normalizeTelegramText(existingResult && existingResult.resultOrientation || "") === normalizeTelegramText(resultEntry.resultOrientation || "")
      && JSON.stringify(existingResult && existingResult.observedPlayers || []) === JSON.stringify(resultEntry.observedPlayers || [])
    ) {
      return record;
    }
    changed = true;
    const eventTs = Number(resultEntry.settledAt || resultEntry.observedAt || 0) || Date.now();
    return {
      ...nextRecord,
      actualScore: resultEntry.finalScore,
      finalScore: resultEntry.finalScore,
      resultStatus: resultEntry.status,
      targetTookTwoSets: resultEntry.targetTookTwoSets,
      settledAt: resultEntry.settledAt,
      finalResult: resultEntry,
      result: resultEntry,
      events: appendTelegramPredictionDatasetEvent(record.events, {
        ts: eventTs,
        kind: "result",
        finalScore: resultEntry.finalScore,
        status: resultEntry.status,
        ownSets: resultEntry.ownSets
      })
    };
  }, { createIfMissing: shouldCreate ? true : false });
  return {
    record: updated,
    changed: Boolean(updated && changed),
    resolved: isResolvedTelegramPredictionDatasetResult(
      updated && getTelegramPredictionDatasetResult(updated)
    )
  };
}

async function migrateTelegramPredictionDatasetStorage() {
  return enqueueTelegramPredictionDatasetMutation(async () => {
    const value = await chrome.storage.local.get({ [TELEGRAM_PREDICTION_DATASET_KEY]: [] });
    const current = Array.isArray(value[TELEGRAM_PREDICTION_DATASET_KEY])
      ? value[TELEGRAM_PREDICTION_DATASET_KEY]
      : [];
    const pointsByMatch = new Map();
    for (const record of current) {
      const matchUrl = normalizeTelegramMatchKey(record && record.matchUrl || "");
      const pointTimeline = getTelegramPredictionPointTimeline(record);
      if (!matchUrl || !pointTimeline.length) {
        continue;
      }
      const batch = pointsByMatch.get(matchUrl) || {
        entries: [],
        players: [],
        createdAt: 0,
        updatedAt: 0
      };
      batch.entries.push(...pointTimeline);
      if (Array.isArray(record.players) && record.players.length) {
        batch.players = record.players.slice(0, 2);
      }
      batch.createdAt = Number(batch.createdAt || record.createdAt || 0);
      batch.updatedAt = Math.max(
        Number(batch.updatedAt || 0),
        Number(record.updatedAt || record.createdAt || 0)
      );
      pointsByMatch.set(matchUrl, batch);
    }
    await upsertTelegramPredictionPointBatches(pointsByMatch);
    const compactedCandidates = current
      .filter((record) => record && typeof record === "object")
      .map(compactTelegramPredictionDatasetBaseRecord);
    const technicalArtifactMatchUrls = new Set(
      compactedCandidates
        .filter(isTechnicalMatchStartExpiryArtifact)
        .map((record) => normalizeTelegramMatchKey(record && record.matchUrl || ""))
        .filter(Boolean)
    );
    const compacted = retainTelegramPairRegimeForwardCohorts(compactedCandidates
      .filter((record) => !technicalArtifactMatchUrls.has(
        normalizeTelegramMatchKey(record && record.matchUrl || "")
      ))
      .filter(shouldPersistTelegramPredictionDatasetBaseRecord));
    await Promise.all([
      chrome.storage.local.set({
        [TELEGRAM_PREDICTION_DATASET_KEY]: compacted,
        [TELEGRAM_PREDICTION_DATASET_STORAGE_VERSION_KEY]: TELEGRAM_PREDICTION_DATASET_STORAGE_VERSION
      }),
      deleteTelegramPredictionPointRecords(technicalArtifactMatchUrls)
    ]);
    return {
      migrated: true,
      rows: compacted.length,
      technicalArtifactsRemoved: technicalArtifactMatchUrls.size
    };
  });
}

function retainTelegramPairRegimeForwardCohorts(rows, limit = TELEGRAM_PREDICTION_DATASET_LIMIT) {
  const list = Array.isArray(rows) ? rows.filter(Boolean) : [];
  const capacity = Math.max(1, Number(limit || TELEGRAM_PREDICTION_DATASET_LIMIT));
  const pairTargetEligible = Number(
    globalThis.LvrVerifiedPairRegimeV1
      && globalThis.LvrVerifiedPairRegimeV1.PROTOCOL
      && globalThis.LvrVerifiedPairRegimeV1.PROTOCOL.targetEligible
      || 300
  );
  const pinned = new Set();

  for (const leagueMode of ["production", "tt-cup-shadow"]) {
    const tagged = list
      .map((row) => {
        const prematch = row && (row.prematchSnapshot || row.prematch);
        const features = {
          ...(prematch && prematch.audit && prematch.audit.decision
            && prematch.audit.decision.features || {}),
          ...(prematch && prematch.features || {})
        };
        if (
          readTelegramPrematchFeatureText(features.startMatchPairRegimeProtocolId)
            !== TELEGRAM_START_PAIR_REGIME_PROTOCOL_ID
          || readTelegramPrematchFeatureText(features.startMatchLeagueMode) !== leagueMode
          || Number(features.startMatchPairRegimeDataReady) !== 1
        ) {
          return null;
        }
        return {
          row,
          decisionAt: getTelegramPrematchDecisionAt(prematch, row),
          matchUrl: normalizeTelegramMatchKey(row && row.matchUrl || prematch && prematch.matchUrl || "")
        };
      })
      .filter(Boolean)
      .sort((left, right) => (
        left.decisionAt - right.decisionAt
        || left.matchUrl.localeCompare(right.matchUrl)
      ));

    for (const item of tagged.slice(0, pairTargetEligible)) {
      pinned.add(item.row);
    }
  }

  const recentCapacity = Math.max(0, capacity - pinned.size);
  const recent = new Set(
    list.filter((row) => !pinned.has(row)).slice(0, recentCapacity)
  );
  return list.filter((row) => pinned.has(row) || recent.has(row));
}

function isTechnicalMatchStartExpiryArtifact(record) {
  if (
    !record
    || Number(record.createdAt || 0) < TECHNICAL_START_EXPIRY_ARTIFACT_CLEANUP_AFTER_TS
    || normalizeTelegramText(record.playerName || "")
    || Number(record.hasPrematchDecision || 0) === 1
  ) {
    return false;
  }
  const prematch = record.prematchSnapshot || record.prematch || null;
  if (isTelegramPredictionDatasetPrematchDecision(prematch)) {
    return false;
  }
  return (Array.isArray(record.events) ? record.events : []).some((event) => (
    event
    && normalizeTelegramText(event.kind || "").toLowerCase() === "prematch"
    && normalizeTelegramText(event.reason || "") === "confirmed-first-set-completed"
    && (event.accepted === false || event.accepted === 0)
    && (event.sent === false || event.sent === 0)
  ));
}

async function readTelegramPredictionDataset() {
  const [value, pointRecords] = await Promise.all([
    chrome.storage.local.get({ [TELEGRAM_PREDICTION_DATASET_KEY]: [] }),
    readTelegramPredictionPointRecords()
  ]);
  const baseRecords = Array.isArray(value[TELEGRAM_PREDICTION_DATASET_KEY])
    ? value[TELEGRAM_PREDICTION_DATASET_KEY]
    : [];
  return retainTelegramPairRegimeForwardCohorts(
    mergeTelegramPredictionDatasetPointRecords(baseRecords, pointRecords)
  );
}

function mergeTelegramPredictionDatasetPointRecords(baseRecords, pointRecords) {
  const pointsByMatch = new Map();
  for (const pointRecord of Array.isArray(pointRecords) ? pointRecords : []) {
    const matchUrl = normalizeTelegramMatchKey(pointRecord && pointRecord.matchUrl || "");
    if (matchUrl) {
      const matchIdentity = getTelegramMatchIdentityKey(matchUrl);
      const existingPointRecord = pointsByMatch.get(matchIdentity) || null;
      pointsByMatch.set(
        matchIdentity,
        existingPointRecord
          ? buildTelegramPredictionPointRecord(existingPointRecord, existingPointRecord.matchUrl || matchUrl, {
            entries: getTelegramPredictionPointTimeline(pointRecord),
            players: pointRecord.players,
            createdAt: pointRecord.createdAt,
            updatedAt: pointRecord.updatedAt
          })
          : pointRecord
      );
    }
  }
  const merged = [];
  const seen = new Set();
  const identityRecords = mergeTelegramPredictionDatasetIdentityRecords(baseRecords);
  for (const rawRecord of identityRecords) {
    const matchUrl = normalizeTelegramMatchKey(rawRecord && rawRecord.matchUrl || "");
    const matchIdentity = getTelegramMatchIdentityKey(matchUrl);
    if (!matchUrl || seen.has(matchIdentity)) {
      continue;
    }
    const storedPoints = pointsByMatch.get(matchIdentity) || null;
    const legacyPoints = getTelegramPredictionPointTimeline(rawRecord);
    const pointRecord = legacyPoints.length
      ? buildTelegramPredictionPointRecord(storedPoints, matchUrl, {
        entries: legacyPoints,
        players: rawRecord.players,
        createdAt: rawRecord.createdAt,
        updatedAt: rawRecord.updatedAt
      })
      : storedPoints;
    const rawPrematch = rawRecord.prematchSnapshot && typeof rawRecord.prematchSnapshot === "object"
      ? rawRecord.prematchSnapshot
      : rawRecord.prematch && typeof rawRecord.prematch === "object"
        ? rawRecord.prematch
        : null;
    const rawResult = rawRecord.finalResult && typeof rawRecord.finalResult === "object"
      ? rawRecord.finalResult
      : rawRecord.result && typeof rawRecord.result === "object"
        ? rawRecord.result
        : null;
    merged.push(hydrateTelegramPredictionDatasetRecord({
      ...rawRecord,
      prematchSnapshot: rawPrematch,
      finalResult: rawResult,
      players: Array.isArray(rawRecord.players) && rawRecord.players.length
        ? rawRecord.players
        : pointRecord && pointRecord.players || [],
      pointTimeline: pointRecord && Array.isArray(pointRecord.pointTimeline)
        ? pointRecord.pointTimeline
        : legacyPoints,
      createdAt: Number(rawRecord.createdAt || pointRecord && pointRecord.createdAt || 0) || Date.now(),
      updatedAt: Math.max(
        Number(rawRecord.updatedAt || rawRecord.createdAt || 0),
        Number(pointRecord && pointRecord.updatedAt || 0)
      )
    }));
    seen.add(matchIdentity);
    pointsByMatch.delete(matchIdentity);
  }

  for (const pointRecord of pointsByMatch.values()) {
    const matchUrl = normalizeTelegramMatchKey(pointRecord && pointRecord.matchUrl || "");
    if (!matchUrl) {
      continue;
    }
    merged.push(hydrateTelegramPredictionDatasetRecord({
      ...createTelegramPredictionDatasetRecord(matchUrl),
      players: Array.isArray(pointRecord.players) ? pointRecord.players : [],
      pointTimeline: Array.isArray(pointRecord.pointTimeline) ? pointRecord.pointTimeline : [],
      createdAt: Number(pointRecord.createdAt || 0) || Date.now(),
      updatedAt: Number(pointRecord.updatedAt || pointRecord.createdAt || 0) || Date.now()
    }));
  }

  return merged
    .filter(Boolean)
    .sort((left, right) => (
      Number(right && (right.updatedAt || right.createdAt) || 0)
      - Number(left && (left.updatedAt || left.createdAt) || 0)
    ));
}

function mergeTelegramPredictionDatasetIdentityRecords(records) {
  const byIdentity = new Map();
  const order = [];
  for (const rawRecord of Array.isArray(records) ? records : []) {
    const matchIdentity = getTelegramMatchIdentityKey(rawRecord && rawRecord.matchUrl || "");
    if (!matchIdentity) {
      continue;
    }
    if (!byIdentity.has(matchIdentity)) {
      byIdentity.set(matchIdentity, rawRecord);
      order.push(matchIdentity);
      continue;
    }
    byIdentity.set(
      matchIdentity,
      mergeTelegramPredictionDatasetIdentityRecord(byIdentity.get(matchIdentity), rawRecord)
    );
  }
  return order.map((matchIdentity) => byIdentity.get(matchIdentity)).filter(Boolean);
}

function mergeTelegramPredictionDatasetIdentityRecord(primaryValue, secondaryValue) {
  const primary = primaryValue && typeof primaryValue === "object" ? primaryValue : {};
  const secondary = secondaryValue && typeof secondaryValue === "object" ? secondaryValue : {};
  const primaryPrematch = primary.prematchSnapshot && typeof primary.prematchSnapshot === "object"
    ? primary.prematchSnapshot
    : primary.prematch && typeof primary.prematch === "object"
      ? primary.prematch
      : null;
  const secondaryPrematch = secondary.prematchSnapshot && typeof secondary.prematchSnapshot === "object"
    ? secondary.prematchSnapshot
    : secondary.prematch && typeof secondary.prematch === "object"
      ? secondary.prematch
      : null;
  const primarySent = primaryPrematch && (primaryPrematch.sent === true || primaryPrematch.sent === 1);
  const secondarySent = secondaryPrematch && (secondaryPrematch.sent === true || secondaryPrematch.sent === 1);
  const prematch = secondarySent && !primarySent
    ? secondaryPrematch
    : primaryPrematch || secondaryPrematch;
  const primaryResult = primary.finalResult && typeof primary.finalResult === "object"
    ? primary.finalResult
    : primary.result && typeof primary.result === "object"
      ? primary.result
      : null;
  const secondaryResult = secondary.finalResult && typeof secondary.finalResult === "object"
    ? secondary.finalResult
    : secondary.result && typeof secondary.result === "object"
      ? secondary.result
      : null;
  const finalResult = selectBestTelegramPredictionDatasetResult(primaryResult, secondaryResult);
  const createdTimes = [primary.createdAt, secondary.createdAt]
    .map(Number)
    .filter((value) => Number.isFinite(value) && value > 0);
  return {
    ...secondary,
    ...primary,
    matchUrl: normalizeTelegramMatchKey(primary.matchUrl || secondary.matchUrl || ""),
    players: Array.isArray(primary.players) && primary.players.length
      ? primary.players
      : secondary.players,
    playerName: normalizeTelegramText(
      prematch && prematch.playerName || primary.playerName || secondary.playerName || ""
    ),
    sideIndex: sanitizeCalibrationSideIndex(
      prematch && prematch.sideIndex !== undefined
        ? prematch.sideIndex
        : primary.sideIndex !== undefined
          ? primary.sideIndex
          : secondary.sideIndex
    ),
    prematchSnapshot: prematch,
    prematch,
    finalResult,
    result: finalResult,
    actualScore: normalizeTelegramFinalScore(finalResult && finalResult.finalScore || primary.actualScore || secondary.actualScore || ""),
    finalScore: normalizeTelegramFinalScore(finalResult && finalResult.finalScore || primary.finalScore || secondary.finalScore || ""),
    resultStatus: normalizeTelegramText(finalResult && finalResult.status || primary.resultStatus || secondary.resultStatus || ""),
    settledAt: Number(finalResult && finalResult.settledAt || primary.settledAt || secondary.settledAt || 0) || 0,
    pointTimeline: mergeTelegramPredictionDatasetIdentityArray(
      primary.pointTimeline || primary.pointByPoint,
      secondary.pointTimeline || secondary.pointByPoint,
      TELEGRAM_PREDICTION_POINT_TIMELINE_LIMIT
    ),
    events: mergeTelegramPredictionDatasetIdentityArray(primary.events, secondary.events, 120),
    createdAt: createdTimes.length ? Math.min(...createdTimes) : Date.now(),
    updatedAt: Math.max(
      Number(primary.updatedAt || primary.createdAt || 0),
      Number(secondary.updatedAt || secondary.createdAt || 0)
    )
  };
}

function selectBestTelegramPredictionDatasetResult(primary, secondary) {
  const first = primary && typeof primary === "object" ? primary : null;
  const second = secondary && typeof secondary === "object" ? secondary : null;
  const firstResolved = isResolvedTelegramPredictionDatasetResult(first);
  const secondResolved = isResolvedTelegramPredictionDatasetResult(second);
  if (firstResolved !== secondResolved) {
    return firstResolved ? first : second;
  }
  if (!first) {
    return second;
  }
  if (!second) {
    return first;
  }
  return Number(second.settledAt || second.observedAt || 0) > Number(first.settledAt || first.observedAt || 0)
    ? second
    : first;
}

function isResolvedTelegramPredictionDatasetResult(result) {
  const status = normalizeTelegramText(result && result.status || "").toLowerCase();
  return Boolean(
    /^(?:hit|miss)$/.test(status)
    && parseTelegramFinalScore(result && result.finalScore || "")
  );
}

function mergeTelegramPredictionDatasetIdentityArray(primaryValue, secondaryValue, limit) {
  const result = [];
  const seen = new Set();
  for (const item of [
    ...(Array.isArray(primaryValue) ? primaryValue : []),
    ...(Array.isArray(secondaryValue) ? secondaryValue : [])
  ]) {
    if (!item || typeof item !== "object") {
      continue;
    }
    const identity = normalizeTelegramText(item.key || [
      item.kind,
      item.ts,
      item.action,
      item.decision,
      item.targetSetNumber,
      item.setState,
      item.currentSetScore
    ].join("|"));
    if (identity && seen.has(identity)) {
      continue;
    }
    if (identity) {
      seen.add(identity);
    }
    result.push(item);
    if (result.length >= Math.max(1, Number(limit || 20))) {
      break;
    }
  }
  return result;
}

function getTelegramPredictionPointTimeline(record) {
  if (Array.isArray(record && record.pointTimeline)) {
    return record.pointTimeline;
  }
  return Array.isArray(record && record.pointByPoint) ? record.pointByPoint : [];
}

function compactTelegramPredictionDatasetBaseRecord(record) {
  if (!record || typeof record !== "object") {
    return null;
  }
  const withoutPoints = { ...record };
  delete withoutPoints.pointTimeline;
  delete withoutPoints.pointByPoint;
  delete withoutPoints.hasPointByPoint;
  const compacted = compactTelegramPredictionDatasetRecord(withoutPoints);
  const {
    pointTimeline: _pointTimeline,
    pointByPoint: _pointByPoint,
    hasPointByPoint: _hasPointByPoint,
    ...baseRecord
  } = compacted;
  return baseRecord;
}

function shouldPersistTelegramPredictionDatasetBaseRecord(record) {
  return Boolean(record && normalizeTelegramText(record.recordKind || "") !== "empty");
}

function getTelegramPredictionDatasetResult(row) {
  if (row && row.finalResult && typeof row.finalResult === "object") {
    return row.finalResult;
  }
  if (row && row.result && typeof row.result === "object") {
    return row.result;
  }
  return null;
}

function enqueueTelegramPredictionDatasetMutation(worker) {
  const task = telegramPredictionDatasetMutationChain
    .catch(() => {})
    .then(worker);
  telegramPredictionDatasetMutationChain = task.catch(() => {});
  return task;
}

function createTelegramPredictionDatasetRecord(matchUrl) {
  return {
    schemaVersion: 1,
    source: "bsportsfan",
    matchUrl: normalizeTelegramMatchKey(matchUrl || ""),
    createdAt: Date.now(),
    players: [],
    playerName: "",
    sideIndex: null,
    prematchSnapshot: null,
    pointTimeline: [],
    finalResult: null,
    events: []
  };
}

async function updateTelegramPredictionDatasetMatch(matchUrl, updater, options = {}) {
  return enqueueTelegramPredictionDatasetMutation(
    () => updateTelegramPredictionDatasetMatchNow(matchUrl, updater, options)
  );
}

async function updateTelegramPredictionDatasetMatchNow(matchUrl, updater, options = {}) {
  const normalizedUrl = normalizeTelegramMatchKey(matchUrl || "");
  if (!normalizedUrl || typeof updater !== "function") {
    return null;
  }
  const matchIdentity = getTelegramMatchIdentityKey(normalizedUrl);
  const value = await chrome.storage.local.get({ [TELEGRAM_PREDICTION_DATASET_KEY]: [] });
  const current = Array.isArray(value[TELEGRAM_PREDICTION_DATASET_KEY]) ? value[TELEGRAM_PREDICTION_DATASET_KEY] : [];
  const existing = current.find(
    (item) => item && getTelegramMatchIdentityKey(item.matchUrl || "") === matchIdentity
  );
  if (!existing && options.createIfMissing === false) {
    return null;
  }
  const base = existing || createTelegramPredictionDatasetRecord(normalizedUrl);
  const candidate = updater(base);
  if (!candidate || candidate === base) {
    return base;
  }
  const updated = compactTelegramPredictionDatasetBaseRecord({
    ...candidate,
    schemaVersion: 1,
    source: "bsportsfan",
    matchUrl: normalizedUrl,
    createdAt: Number(base.createdAt || 0) || Date.now(),
    updatedAt: Date.now()
  });
  const next = retainTelegramPairRegimeForwardCohorts([
    updated,
    ...current.filter(
      (item) => item && getTelegramMatchIdentityKey(item.matchUrl || "") !== matchIdentity
    )
  ]);
  await chrome.storage.local.set({ [TELEGRAM_PREDICTION_DATASET_KEY]: next });
  return updated;
}

function buildTelegramPredictionDatasetPrematch(prediction, matchUrl, outcome = {}) {
  const source = prediction && typeof prediction === "object" ? prediction : {};
  const players = Array.isArray(source.players) ? source.players.slice(0, 2).map(normalizeTelegramText).filter(Boolean) : [];
  const sideIndex = sanitizeCalibrationSideIndex(source.sideIndex !== undefined ? source.sideIndex : source.predictedIndex);
  const opponentIndex = sideIndex === 0 ? 1 : sideIndex === 1 ? 0 : null;
  const detailsFeatures = source.audit && source.audit.decision && source.audit.decision.features || {};
  const features = sanitizeCalibrationFeatureMap({
    ...detailsFeatures,
    ...(source.features || {})
  });
  const entryPointTotal = finitePredictionDatasetNumber(
    source.deliveryEntryState && source.deliveryEntryState.currentPointTotal
  );
  const entryLeftPoints = finitePredictionDatasetNumber(
    source.deliveryEntryState && source.deliveryEntryState.currentPointLeftPoints
  );
  const entryRightPoints = finitePredictionDatasetNumber(
    source.deliveryEntryState && source.deliveryEntryState.currentPointRightPoints
  );
  if (entryPointTotal !== null) {
    features.startMatchEntryPointTotal = entryPointTotal;
    features.startMatchEntryBucket = classifyTelegramMatchStartEntryBucket(entryPointTotal);
  }
  if (sideIndex !== null && entryLeftPoints !== null && entryRightPoints !== null) {
    features.startMatchEntrySelectedPointLead = sideIndex === 0
      ? entryLeftPoints - entryRightPoints
      : entryRightPoints - entryLeftPoints;
  }
  const leftFreshForm3Score = finitePredictionDatasetNumber(source.leftFreshForm3Score);
  const rightFreshForm3Score = finitePredictionDatasetNumber(source.rightFreshForm3Score);
  const leftStrengthScore = finitePredictionDatasetNumber(source.leftStrengthScore);
  const rightStrengthScore = finitePredictionDatasetNumber(source.rightStrengthScore);
  const playerFreshForm3Score = sideIndex === 0 ? leftFreshForm3Score : sideIndex === 1 ? rightFreshForm3Score : null;
  const opponentFreshForm3Score = opponentIndex === 0 ? leftFreshForm3Score : opponentIndex === 1 ? rightFreshForm3Score : null;
  const playerStrengthScore = sideIndex === 0 ? leftStrengthScore : sideIndex === 1 ? rightStrengthScore : null;
  const opponentStrengthScore = opponentIndex === 0 ? leftStrengthScore : opponentIndex === 1 ? rightStrengthScore : null;
  const accepted = normalizeCalibrationBoolean(outcome.accepted);
  const action = buildTelegramCalibrationAction(outcome);
  const decisionAction = readTelegramPrematchFeatureText(
    source.audit && source.audit.decision && source.audit.decision.action,
    source.decisionAction,
    source.action
  ).toLowerCase();
  const confirmedMatchStart = isTelegramMatchStartState(source.startEntryState)
    && isTelegramMatchStartState(source.deliveryEntryState);
  const modelForecast = decisionAction === "forecast" || decisionAction === "bet";
  const modelPass = decisionAction === "pass" || decisionAction === "skip";
  const gateReason = normalizeTelegramText(outcome.gateReason || outcome.acceptanceReason || "");
  const outcomeReason = normalizeTelegramText(outcome.reason || "");
  const noMarketCoverage = source.noMarketCoverage === true || Number(features.noMarketCoverage) === 1;
  const hideMarketOdds = noMarketCoverage || normalizeTelegramText(source.oddsMeaning || "").toLowerCase() === "none";
  return compactTelegramPredictionDatasetValue({
    ts: Date.now(),
    kind: "prematch_start",
    matchUrl,
    action,
    decisionAction,
    decisionLabel: modelForecast
      ? "СТАВИМ"
      : modelPass && confirmedMatchStart
        ? "ПРОПУСК"
        : "",
    accepted,
    sent: normalizeCalibrationBoolean(outcome.sent),
    reason: outcomeReason,
    outcomeReason,
    gateReason,
    players,
    playerName: normalizeTelegramText(source.playerName || ""),
    opponentName: opponentIndex === 0 || opponentIndex === 1 ? players[opponentIndex] || "" : "",
    sideIndex,
    leagueName: readTelegramPrematchFeatureText(
      source.leagueName,
      features.leagueName,
      source.audit && source.audit.league && source.audit.league.name
    ),
    signalMode: readTelegramPrematchFeatureText(
      source.signalMode,
      features.startMatchSignalMode
    ),
    decisionSource: normalizeTelegramText(source.source || source.forecastSource || source.audit && source.audit.decision && source.audit.decision.source || ""),
    modelVersion: normalizeTelegramText(source.modelVersion || source.audit && source.audit.decision && source.audit.decision.modelVersion || ""),
    coverageRuleId: normalizeTelegramText(source.coverageRuleId || features.simpleNoOddsCoverageRuleId || ""),
    betType: normalizeTelegramText(source.betType || ""),
    probabilityMeaning: normalizeTelegramText(source.probabilityMeaning || ""),
    oddsMeaning: normalizeTelegramText(source.oddsMeaning || ""),
    referenceOddsMeaning: normalizeTelegramText(source.referenceOddsMeaning || ""),
    noMarketCoverage,
    requestedAt: finitePredictionDatasetNumber(source.requestedAt),
    collectionStartedAt: finitePredictionDatasetNumber(source.collectionStartedAt),
    readyAt: finitePredictionDatasetNumber(source.readyAt),
    finalDecisionAt: finitePredictionDatasetNumber(
      source.finalDecisionAt
      || source.audit && source.audit.decision && source.audit.decision.finalDecisionAt
    ),
    collectionLatencyMs: finitePredictionDatasetNumber(source.collectionLatencyMs),
    deliveryObservedAt: finitePredictionDatasetNumber(source.deliveryObservedAt),
    deliveryMode: normalizeTelegramText(source.deliveryMode || source.deliveryEntryState && source.deliveryEntryState.mode || ""),
    requestEntryState: compactTelegramPredictionDatasetValue(source.requestEntryState || null),
    startEntryState: compactTelegramPredictionDatasetValue(source.startEntryState || null),
    deliveryEntryState: compactTelegramPredictionDatasetValue(source.deliveryEntryState || null),
    moneylineMarket: compactTelegramPredictionDatasetValue(source.moneylineMarket || null),
    referenceMoneylineMarket: compactTelegramPredictionDatasetValue(source.referenceMoneylineMarket || null),
    moneylineOdds: finitePredictionDatasetNumber(getTelegramMoneylineOdds(source)),
    market: hideMarketOdds ? undefined : compactTelegramPredictionDatasetValue({
      playerOdds: finitePredictionDatasetNumber(source.playerOdds || source.marketOdds || source.marketFavoriteOdds),
      opponentOdds: finitePredictionDatasetNumber(source.opponentOdds),
      leftOdds: finitePredictionDatasetNumber(source.leftOdds),
      rightOdds: finitePredictionDatasetNumber(source.rightOdds),
      marketOdds: finitePredictionDatasetNumber(source.marketOdds),
      marketEdge: finitePredictionDatasetNumber(source.marketEdge),
      marketFavorite: normalizeTelegramText(source.marketFavorite || ""),
      marketFavoriteOdds: finitePredictionDatasetNumber(source.marketFavoriteOdds)
    }),
    factors: compactTelegramPredictionDatasetValue({
      leftFreshForm3Score,
      rightFreshForm3Score,
      playerFreshForm3Score,
      opponentFreshForm3Score,
      freshForm3Edge: subtractCalibrationNumbers(playerFreshForm3Score, opponentFreshForm3Score),
      leftStrengthScore,
      rightStrengthScore,
      playerStrengthScore,
      opponentStrengthScore,
      strengthEdge: subtractCalibrationNumbers(playerStrengthScore, opponentStrengthScore)
    }),
    features,
    trendLines: sanitizeTelegramTextList(source.trendLines, 12),
    internalFactors: sanitizeTelegramTextList(source.internalFactors, 30),
    audit: compactCalibrationValue(source.audit || null, 6),
    telegramMessages: countCalibrationTelegramMessages(outcome.telegramMessages),
    messageRefs: sanitizeTelegramMessageRefs(outcome.telegramMessages),
    telegramText: normalizeTelegramMessageText(outcome.telegramText || "")
  });
}

function classifyTelegramMatchStartEntryBucket(pointTotal) {
  const value = Number(pointTotal);
  if (!Number.isFinite(value) || value < 0) {
    return "unknown";
  }
  if (value <= 2) {
    return "start-0-2";
  }
  if (value <= 6) {
    return "early-3-6";
  }
  if (value <= 10) {
    return "middle-7-10";
  }
  return "late-11-plus";
}

function buildTelegramPredictionDatasetPointSnapshot(snapshot) {
  const source = snapshot && typeof snapshot === "object" ? snapshot : {};
  const completedSetScores = Array.isArray(source.completedSetScores)
    ? source.completedSetScores.map(normalizeTelegramText).filter(Boolean).slice(0, 5)
    : [];
  const currentSetScore = normalizeTelegramText(source.currentSetScore || source.currentPointScore || "");
  const setState = normalizeTelegramText(source.setState || source.currentSetState || "");
  const targetSetNumber = finitePredictionDatasetNumber(source.targetSetNumber) || completedSetScores.length + 1;
  const players = Array.isArray(source.players) ? source.players.slice(0, 2).map(normalizeTelegramText).filter(Boolean) : [];
  if (!completedSetScores.length && !currentSetScore && !setState) {
    return null;
  }
  const key = normalizeTelegramText(source.key || [
    targetSetNumber,
    setState,
    completedSetScores.join(" "),
    currentSetScore
  ].join("|"));
  return compactTelegramPredictionDatasetValue({
    key,
    ts: Date.now(),
    source: normalizeTelegramText(source.source || ""),
    rawRowText: normalizeTelegramText(source.rawRowText || ""),
    players,
    leagueName: normalizeTelegramText(source.leagueName || ""),
    setState,
    targetSetNumber,
    completedSetScores,
    currentSetScore,
    currentPointScoreSource: normalizeTelegramText(source.currentPointScoreSource || source.currentSetScoreSource || ""),
    currentPointLeftPoints: finitePredictionDatasetNumber(source.currentPointLeftPoints),
    currentPointRightPoints: finitePredictionDatasetNumber(source.currentPointRightPoints),
    currentPointOwnPoints: finitePredictionDatasetNumber(source.currentPointOwnPoints),
    currentPointOpponentPoints: finitePredictionDatasetNumber(source.currentPointOpponentPoints),
    setScores: compactCalibrationValue(source.setScores || [], 4)
  });
}

function finitePredictionDatasetNumber(value) {
  if (value === null || value === undefined || value === "") {
    return undefined;
  }
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

function buildTelegramPredictionDatasetResult(record, finalScore, result = {}) {
  const source = result && typeof result === "object" ? result : {};
  const observedScore = parseTelegramFinalScore(finalScore);
  const recordPlayers = Array.isArray(record && record.players)
    ? record.players.slice(0, 2).map(normalizeTelegramText).filter(Boolean)
    : [];
  const observedPlayers = Array.isArray(source.players)
    ? source.players.slice(0, 2).map(normalizeTelegramText).filter(Boolean)
    : [];
  const observedPlayerIds = Array.isArray(source.playerIds)
    ? source.playerIds.slice(0, 2).map(normalizeTelegramText)
    : [];
  const alignment = alignTelegramDatasetResultToRecord(record, observedScore, source);
  const score = alignment.score;
  const canonicalFinalScore = score ? `${score.left}-${score.right}` : "";
  const recordSideIndex = sanitizeCalibrationSideIndex(record && record.sideIndex);
  const sourceSideIndex = sanitizeCalibrationSideIndex(source.sideIndex);
  const sideIndex = recordSideIndex !== null ? recordSideIndex : sourceSideIndex;
  const ownSets = score && (sideIndex === 0 || sideIndex === 1)
    ? sideIndex === 0 ? score.left : score.right
    : null;
  const status = ownSets === null ? "" : Number(ownSets) >= 2 ? "hit" : "miss";
  const observedAt = Date.now();
  const observedSetScores = compactCalibrationValue(source.setScores || [], 4);
  const canonicalSetScores = score
    ? orientTelegramResultSetScores(source.setScores, alignment.orientation)
    : [];
  return compactTelegramPredictionDatasetValue({
    finalScore: canonicalFinalScore,
    observedFinalScore: normalizeTelegramFinalScore(finalScore),
    players: recordPlayers.length ? recordPlayers : observedPlayers,
    observedPlayers,
    observedPlayerIds,
    resultOrientation: alignment.orientation,
    scoreOrderTrusted: source.scoreOrderTrusted === true,
    scoreOrderEvidence: normalizeTelegramText(source.scoreOrderEvidence || ""),
    resultSource: normalizeTelegramText(source.source || ""),
    setScores: compactCalibrationValue(canonicalSetScores, 4),
    observedSetScores,
    ownSets,
    status,
    targetTookTwoSets: ownSets === null ? null : Number(ownSets) >= 2,
    observedAt,
    settledAt: status ? observedAt : 0
  });
}

function orientTelegramResultSetScores(value, orientation) {
  const list = Array.isArray(value) ? value : [];
  const reversed = normalizeTelegramText(orientation || "") === "reversed";
  return list.map((item, index) => {
    if (!item || typeof item !== "object") {
      return item;
    }
    const left = Number(item.left);
    const right = Number(item.right);
    if (!Number.isFinite(left) || !Number.isFinite(right)) {
      return { ...item };
    }
    return {
      ...item,
      set: Number(item.set || index + 1),
      left: reversed ? right : left,
      right: reversed ? left : right
    };
  });
}

function alignTelegramDatasetResultToRecord(record, score, result = {}) {
  if (!score) {
    return { score: null, orientation: "score-missing" };
  }
  const recordPlayers = Array.isArray(record && record.players)
    ? record.players.slice(0, 2).map(normalizeTelegramText).filter(Boolean)
    : [];
  const observedPlayers = Array.isArray(result && result.players)
    ? result.players.slice(0, 2).map(normalizeTelegramText).filter(Boolean)
    : [];
  const hasObservedPlayerEvidence = Array.isArray(result && result.players)
    && result.players.slice(0, 2).some((value) => normalizeTelegramText(value));
  if (!hasObservedPlayerEvidence) {
    return { score, orientation: "order-assumed" };
  }
  if (recordPlayers.length < 2 || observedPlayers.length < 2) {
    return { score: null, orientation: "unresolved" };
  }
  // The score columns and visible names belong to the same finished row.
  // BSportsFan sometimes leaves stale profile links there, so exact unique names
  // are stronger evidence than player IDs when the two disagree.
  const nameMapping = recordPlayers.map((name) => {
    const nameMatches = observedPlayers
      .map((candidate, index) => areTelegramNamesSame(name, candidate) ? index : -1)
      .filter((index) => index >= 0);
    return nameMatches.length === 1 ? nameMatches[0] : -1;
  });
  if (nameMapping[0] === 0 && nameMapping[1] === 1) {
    return { score, orientation: "same" };
  }
  if (nameMapping[0] === 1 && nameMapping[1] === 0) {
    return {
      score: { left: score.right, right: score.left },
      orientation: "reversed"
    };
  }
  const recordIds = getTelegramDatasetRecordPlayerIds(record);
  const observedIds = Array.isArray(result && result.playerIds)
    ? result.playerIds.slice(0, 2).map((value) => normalizeTelegramText(value))
    : [];
  const hasCompleteObservedIds = observedIds.length === 2 && observedIds.every(Boolean);
  const hasCompleteRecordIds = recordIds.length === 2 && recordIds.every(Boolean);
  const idMapping = hasCompleteObservedIds && hasCompleteRecordIds
    ? recordIds.map((id) => {
      const matches = observedIds
        .map((candidate, index) => candidate === id ? index : -1)
        .filter((index) => index >= 0);
      return matches.length === 1 ? matches[0] : -1;
    })
    : [];
  if (idMapping[0] === 0 && idMapping[1] === 1) {
    return { score, orientation: "same" };
  }
  if (idMapping[0] === 1 && idMapping[1] === 0) {
    return {
      score: { left: score.right, right: score.left },
      orientation: "reversed"
    };
  }

  const scoreOrderEvidence = normalizeTelegramText(result && result.scoreOrderEvidence || "").toLowerCase();
  const trustedScoreOrder = result && result.scoreOrderTrusted === true
    && [
      "direct-match-page",
      "exact-player-page-match-row",
      "exact-result-row-match-link"
    ].includes(scoreOrderEvidence)
    && isSameTelegramMatch(record && record.matchUrl, result && result.matchUrl);
  if (trustedScoreOrder) {
    return { score, orientation: "same-trusted-match-page" };
  }

  return { score: null, orientation: "unresolved" };
}

function getTelegramDatasetRecordPlayerIds(record) {
  const prematch = record && (record.prematchSnapshot || record.prematch) || {};
  const directFeatures = record && record.features && typeof record.features === "object"
    ? record.features
    : {};
  const features = prematch.features && typeof prematch.features === "object"
    ? prematch.features
    : directFeatures;
  const profiles = Array.isArray(features.startMatchProfiles)
    ? features.startMatchProfiles.slice(0, 2)
    : [];
  if (profiles.length === 2) {
    const profileIds = profiles.map((profile) => {
      const match = normalizeTelegramText(profile && profile.identityKey || "").match(/^id:(\d+)$/);
      return match ? match[1] : "";
    });
    if (profileIds.some(Boolean)) {
      return profileIds;
    }
  }
  return Array.isArray(record && record.playerIds)
    ? record.playerIds.slice(0, 2).map(normalizeTelegramText)
    : [];
}

function upsertTelegramPredictionDatasetArrayItem(items, item, key, limit) {
  const list = Array.isArray(items) ? items : [];
  const safeKey = normalizeTelegramText(key || item && item.key || "");
  return [
    item,
    ...list.filter((existing) => normalizeTelegramText(existing && existing.key || "") !== safeKey)
  ].slice(0, Math.max(1, Number(limit || 20)));
}

function appendTelegramPredictionDatasetEvent(events, event, limit = 120) {
  return [
    compactTelegramPredictionDatasetValue(event),
    ...(Array.isArray(events) ? events : [])
  ].filter((item) => item && Object.keys(item).length).slice(0, Math.max(1, Number(limit || 120)));
}

function compactTelegramPredictionDatasetRecord(record) {
  const value = compactTelegramPredictionDatasetValue(record);
  const {
    prematch: legacyPrematch,
    pointByPoint: legacyPointByPoint,
    result: legacyResult,
    liveTimeline: _legacyLiveTimeline,
    liveEntries: _legacyLiveEntries,
    hasLiveDecision: _legacyHasLiveDecision,
    ...canonicalValue
  } = value;
  const events = Array.isArray(value.events) ? value.events : [];
  const storedPrematch = value.prematchSnapshot && typeof value.prematchSnapshot === "object"
    ? value.prematchSnapshot
    : legacyPrematch && typeof legacyPrematch === "object"
      ? legacyPrematch
      : null;
  const restoredPrematch = restoreTelegramSentPrematchFromEvents(storedPrematch, events);
  const prematch = compactTelegramPredictionDatasetPrematch(restoredPrematch);
  const pointByPoint = Array.isArray(legacyPointByPoint)
    ? legacyPointByPoint
    : Array.isArray(value.pointTimeline)
      ? value.pointTimeline
      : [];
  const pointTimeline = Array.isArray(value.pointTimeline) ? value.pointTimeline : pointByPoint;
  const finalResult = value.finalResult && typeof value.finalResult === "object"
    ? value.finalResult
    : legacyResult && typeof legacyResult === "object"
      ? legacyResult
      : null;
  const hasPrematchDecision = isTelegramPredictionDatasetPrematchDecision(prematch);
  const hasFinalResult = Boolean(finalResult && normalizeTelegramFinalScore(finalResult.finalScore || value.finalScore || ""));
  const recordKind = hasPrematchDecision
    ? "forecasted"
    : pointByPoint.length || pointTimeline.length
      ? "observed_only"
      : hasFinalResult
        ? "result_only"
        : "empty";
  const prematchPlayers = Array.isArray(prematch && prematch.players)
    ? prematch.players.slice(0, 2).map(normalizeTelegramText).filter(Boolean)
    : [];
  const prematchSideIndex = sanitizeCalibrationSideIndex(prematch && prematch.sideIndex);
  const prematchPlayerName = normalizeTelegramText(prematch && prematch.playerName || "");
  const parsedFinalScore = parseTelegramFinalScore(
    finalResult && finalResult.finalScore
      || canonicalValue.finalScore
      || canonicalValue.actualScore
      || ""
  );
  const canonicalOwnSets = prematchSideIndex === null || !parsedFinalScore
    ? null
    : prematchSideIndex === 0
      ? parsedFinalScore.left
      : parsedFinalScore.right;
  const canonicalResultStatus = canonicalOwnSets === null
    ? normalizeTelegramText(canonicalValue.resultStatus || finalResult && finalResult.status || "")
    : canonicalOwnSets >= 2
      ? "hit"
      : "miss";
  const canonicalFinalResult = finalResult
    ? {
      ...finalResult,
      ownSets: canonicalOwnSets === null ? finalResult.ownSets : canonicalOwnSets,
      status: canonicalResultStatus,
      targetTookTwoSets: canonicalOwnSets === null
        ? finalResult.targetTookTwoSets
        : canonicalOwnSets >= 2
    }
    : finalResult;
  return {
    ...canonicalValue,
    players: prematchPlayers.length ? prematchPlayers : canonicalValue.players || [],
    playerName: prematchPlayerName || canonicalValue.playerName || "",
    sideIndex: prematchSideIndex !== null ? prematchSideIndex : canonicalValue.sideIndex ?? null,
    resultStatus: canonicalResultStatus,
    targetTookTwoSets: canonicalOwnSets === null
      ? canonicalValue.targetTookTwoSets
      : canonicalOwnSets >= 2,
    recordKind,
    hasPrematchSnapshot: prematch ? 1 : 0,
    hasPrematchDecision: hasPrematchDecision ? 1 : 0,
    hasPointByPoint: pointTimeline.length ? 1 : 0,
    hasFinalResult: hasFinalResult ? 1 : 0,
    prematchSnapshot: prematch,
    pointTimeline,
    finalResult: canonicalFinalResult,
    events
  };
}

function compactTelegramPredictionDatasetPrematch(prematch) {
  if (!prematch || typeof prematch !== "object") {
    return prematch;
  }
  const {
    rawPrediction: _legacyRawPrediction,
    auditDecisionFeatures: _legacyAuditDecisionFeatures,
    ...canonicalPrematch
  } = prematch;
  const currentFeatures = sanitizeCalibrationFeatureMap(canonicalPrematch.features);
  const audit = canonicalPrematch.audit && typeof canonicalPrematch.audit === "object"
    ? canonicalPrematch.audit
    : null;
  const decision = audit && audit.decision && typeof audit.decision === "object"
    ? audit.decision
    : null;
  if (!decision || !Object.prototype.hasOwnProperty.call(decision, "features")) {
    return {
      ...canonicalPrematch,
      features: currentFeatures
    };
  }
  const {
    features: _legacyDecisionFeatures,
    ...canonicalDecision
  } = decision;
  return {
    ...canonicalPrematch,
    features: currentFeatures,
    audit: {
      ...audit,
      decision: canonicalDecision
    }
  };
}

function restoreTelegramSentPrematchFromEvents(prematch, events) {
  if (!prematch || prematch.sent === true || prematch.sent === 1) {
    return prematch;
  }
  const sentEvent = (Array.isArray(events) ? events : []).find((event) => event
    && normalizeTelegramText(event.kind || "").toLowerCase() === "prematch"
    && (event.sent === true || event.sent === 1));
  if (!sentEvent) {
    return prematch;
  }
  return {
    ...prematch,
    ts: Number(sentEvent.ts || 0) || prematch.ts,
    action: normalizeTelegramText(sentEvent.action || prematch.action || ""),
    decisionAction: normalizeTelegramText(sentEvent.decisionAction || prematch.decisionAction || ""),
    decisionLabel: normalizeTelegramText(sentEvent.decisionLabel || prematch.decisionLabel || ""),
    accepted: typeof sentEvent.accepted === "boolean" ? sentEvent.accepted : prematch.accepted,
    sent: true,
    reason: normalizeTelegramText(sentEvent.reason || prematch.reason || ""),
    gateReason: normalizeTelegramText(sentEvent.gateReason || prematch.gateReason || ""),
    modelVersion: normalizeTelegramText(sentEvent.modelVersion || prematch.modelVersion || ""),
    coverageRuleId: normalizeTelegramText(sentEvent.coverageRuleId || prematch.coverageRuleId || ""),
    deliveryMode: normalizeTelegramText(sentEvent.deliveryMode || prematch.deliveryMode || ""),
    deliveryObservedAt: Number(sentEvent.deliveryObservedAt || 0) || prematch.deliveryObservedAt
  };
}

function isTelegramPredictionDatasetDecision(value) {
  const normalized = normalizeTelegramText(value || "").toLowerCase();
  return normalized === "ставим"
    || normalized === "пропуск"
    || normalized === "bet"
    || normalized === "skip"
    || normalized === "sent"
    || normalized === "forecast";
}

function isTelegramPredictionDatasetPrematchDecision(prematch) {
  if (!prematch || !isTelegramPredictionDatasetDecision(prematch.decisionLabel || prematch.action)) {
    return false;
  }
  if (
    prematch.sent === true
    || prematch.sent === 1
    || prematch.accepted === true
    || prematch.accepted === 1
  ) {
    return true;
  }
  const prediction = prematch.rawPrediction && typeof prematch.rawPrediction === "object"
    ? prematch.rawPrediction
    : prematch;
  const hasConfirmedMatchStart = isTelegramMatchStartState(prediction.startEntryState)
    && isTelegramMatchStartState(prediction.deliveryEntryState);
  return hasConfirmedMatchStart;
}

function hydrateTelegramPredictionDatasetRows(rows) {
  return (Array.isArray(rows) ? rows : [])
    .map(hydrateTelegramPredictionDatasetRecord)
    .filter(Boolean);
}

function hydrateTelegramPredictionDatasetRecord(record) {
  if (!record || typeof record !== "object") {
    return null;
  }
  const result = record.finalResult && typeof record.finalResult === "object"
    ? record.finalResult
    : record.result && typeof record.result === "object"
      ? record.result
      : null;
  const finalScore = normalizeTelegramFinalScore(record.finalScore || record.actualScore || result && result.finalScore || "");
  if (!finalScore) {
    return compactTelegramPredictionDatasetRecord(record);
  }
  return compactTelegramPredictionDatasetRecord({
    ...record,
    actualScore: finalScore,
    finalScore,
    resultStatus: normalizeTelegramText(record.resultStatus || result && result.status || ""),
    targetTookTwoSets: record.targetTookTwoSets !== undefined
      ? record.targetTookTwoSets
      : result && result.targetTookTwoSets,
    settledAt: record.settledAt || result && result.settledAt,
    finalResult: {
      ...(result || {}),
      finalScore
    },
    result: {
      ...(result || {}),
      finalScore
    }
  });
}

function compactTelegramPredictionDatasetValue(value) {
  if (value === null || value === undefined || value === "") {
    return value === null ? null : undefined;
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    return normalizeTelegramText(value);
  }
  if (Array.isArray(value)) {
    return value
      .map(compactTelegramPredictionDatasetValue)
      .filter((item) => item !== undefined && item !== "");
  }
  if (typeof value === "object") {
    const result = {};
    for (const [key, item] of Object.entries(value)) {
      const compact = compactTelegramPredictionDatasetValue(item);
      if (compact === undefined || compact === "") {
        continue;
      }
      if (Array.isArray(compact) && !compact.length) {
        continue;
      }
      if (compact && typeof compact === "object" && !Array.isArray(compact) && !Object.keys(compact).length) {
        continue;
      }
      result[key] = compact;
    }
    return result;
  }
  return undefined;
}

function buildTelegramCalibrationAction(outcome = {}) {
  const accepted = normalizeCalibrationBoolean(outcome.accepted);
  const sent = normalizeCalibrationBoolean(outcome.sent);
  if (sent === true) {
    return "sent";
  }
  if (accepted === false) {
    return "skip";
  }
  if (accepted === true) {
    return "accepted-not-sent";
  }
  return normalizeTelegramText(outcome.action || "observed") || "observed";
}

function normalizeCalibrationBoolean(value) {
  return value === undefined || value === null || value === "" ? null : Boolean(value);
}

function sanitizeCalibrationSideIndex(value) {
  const number = Number(value);
  return number === 0 || number === 1 ? number : null;
}

function countCalibrationTelegramMessages(value) {
  if (Array.isArray(value)) {
    return value.length;
  }
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : 0;
}

function subtractCalibrationNumbers(left, right) {
  return left !== null && right !== null ? Math.round((Number(left) - Number(right)) * 1000) / 1000 : null;
}

function sanitizeCalibrationFeatureMap(features) {
  const source = features && typeof features === "object" ? features : {};
  const result = {};
  for (const [key, value] of Object.entries(source)) {
    if (
      !key
      || typeof value === "function"
      || value === null
      || value === undefined
    ) {
      continue;
    }
    const safeKey = String(key).slice(0, 80);
    if (
      /^(?:prematchStrategy|prematchStability)/.test(safeKey)
      || /^startMatch(?:Shadow|Quality|EventRisk|OddsShadow|CoreMargin|LeagueAudit)/.test(safeKey)
    ) {
      continue;
    }
    if (typeof value === "number") {
      if (Number.isFinite(value)) {
        result[safeKey] = value;
      }
      continue;
    }
    if (typeof value === "boolean") {
      result[safeKey] = value ? 1 : 0;
      continue;
    }
    if (typeof value === "string") {
      const text = normalizeTelegramText(value);
      if (text) {
        result[safeKey] = text.slice(0, 240);
      }
      continue;
    }
    if (safeKey === "startMatchProfiles" && value && typeof value === "object") {
      result[safeKey] = compactCalibrationValue(value, 7);
      continue;
    }
    if (
      safeKey === "startMatchPairRegimeMarketSnapshot"
      && value
      && typeof value === "object"
    ) {
      result[safeKey] = compactCalibrationValue(value, 3);
      continue;
    }
    const number = finiteAuditNumber(value);
    if (number !== null) {
      result[safeKey] = number;
    }
  }
  return result;
}

function compactCalibrationValue(value, depth = 4) {
  if (value === null || value === undefined || depth < 0) {
    return null;
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    return normalizeTelegramText(value).slice(0, 500);
  }
  if (Array.isArray(value)) {
    return value
      .slice(0, 30)
      .map((item) => compactCalibrationValue(item, depth - 1))
      .filter((item) => item !== null && item !== "" && item !== undefined);
  }
  if (typeof value === "object") {
    const result = {};
    for (const [key, item] of Object.entries(value).slice(0, 80)) {
      if (typeof item === "function") {
        continue;
      }
      const compact = compactCalibrationValue(item, depth - 1);
      if (compact !== null && compact !== "" && compact !== undefined) {
        result[String(key).slice(0, 80)] = compact;
      }
    }
    return result;
  }
  return null;
}

async function saveTelegramPredictionAudit(prediction, matchUrl, outcome = {}) {
  const audit = {
    ts: Date.now(),
    matchUrl,
    accepted: outcome.accepted === undefined ? null : Boolean(outcome.accepted),
    sent: outcome.sent === undefined ? null : Boolean(outcome.sent),
    reason: normalizeTelegramText(outcome.reason || ""),
    gateReason: normalizeTelegramText(outcome.gateReason || ""),
    error: normalizeTelegramText(outcome.error || ""),
    telegramMessages: Array.isArray(outcome.telegramMessages)
      ? outcome.telegramMessages.map(sanitizeTelegramMessageRef).filter(Boolean)
      : [],
    players: Array.isArray(prediction.players) ? prediction.players.slice(0, 2) : [],
    playerName: normalizeTelegramText(prediction.playerName || ""),
    source: normalizeTelegramText(prediction.source || prediction.forecastSource || ""),
    modelVersion: normalizeTelegramText(prediction.modelVersion || ""),
    coverageRuleId: normalizeTelegramText(prediction.coverageRuleId || ""),
    signalMode: readTelegramPrematchFeatureText(
      prediction.signalMode,
      prediction.features && prediction.features.startMatchSignalMode
    ),
    oddsMeaning: normalizeTelegramText(prediction.oddsMeaning || ""),
    edge: finiteAuditNumber(prediction.edge),
    marketEdge: finiteAuditNumber(prediction.marketEdge),
    marketFavorite: normalizeTelegramText(prediction.marketFavorite || ""),
    marketFavoriteOdds: finiteAuditNumber(prediction.marketFavoriteOdds),
    modelProbability: finiteAuditNumber(normalizeTelegramPercent(
      prediction.modelProbability !== undefined ? prediction.modelProbability : prediction.internalScore
    )),
    probabilityMeaning: normalizeTelegramText(prediction.probabilityMeaning || ""),
    playerOdds: finiteAuditNumber(prediction.playerOdds),
    opponentOdds: finiteAuditNumber(prediction.opponentOdds),
    leftOdds: finiteAuditNumber(prediction.leftOdds),
    rightOdds: finiteAuditNumber(prediction.rightOdds),
    leagueName: readTelegramPrematchFeatureText(
      prediction.leagueName,
      prediction.features && prediction.features.leagueName,
      prediction.audit && prediction.audit.decision && prediction.audit.decision.leagueName,
      prediction.audit && prediction.audit.league && prediction.audit.league.name
    ),
    features: sanitizeTelegramPredictionFeatures(prediction.features),
    internalScore: finiteAuditNumber(prediction.internalScore),
    freshForm3Score: prediction.freshForm3Score !== null && prediction.freshForm3Score !== undefined && prediction.freshForm3Score !== ""
      ? finiteAuditNumber(prediction.freshForm3Score)
      : null,
    leftFreshForm3Score: prediction.leftFreshForm3Score !== null && prediction.leftFreshForm3Score !== undefined && prediction.leftFreshForm3Score !== ""
      ? finiteAuditNumber(prediction.leftFreshForm3Score)
      : null,
    rightFreshForm3Score: prediction.rightFreshForm3Score !== null && prediction.rightFreshForm3Score !== undefined && prediction.rightFreshForm3Score !== ""
      ? finiteAuditNumber(prediction.rightFreshForm3Score)
      : null,
    leftStrengthScore: prediction.leftStrengthScore !== null && prediction.leftStrengthScore !== undefined && prediction.leftStrengthScore !== ""
      ? finiteAuditNumber(prediction.leftStrengthScore)
      : null,
    rightStrengthScore: prediction.rightStrengthScore !== null && prediction.rightStrengthScore !== undefined && prediction.rightStrengthScore !== ""
      ? finiteAuditNumber(prediction.rightStrengthScore)
      : null,
    playerStrengthScore: prediction.playerStrengthScore !== null && prediction.playerStrengthScore !== undefined && prediction.playerStrengthScore !== ""
      ? finiteAuditNumber(prediction.playerStrengthScore)
      : null,
    opponentStrengthScore: prediction.opponentStrengthScore !== null && prediction.opponentStrengthScore !== undefined && prediction.opponentStrengthScore !== ""
      ? finiteAuditNumber(prediction.opponentStrengthScore)
      : null,
    internalFactors: Array.isArray(prediction.internalFactors) ? prediction.internalFactors.slice(0, 20) : [],
    trendLines: sanitizeTelegramTextList(prediction.trendLines, 6),
    details: prediction.audit || null
  };
  const operation = telegramAuditMutationChain
    .catch(() => {})
    .then(async () => {
      const value = await chrome.storage.local.get({ [TELEGRAM_AUDIT_KEY]: [] });
      const current = Array.isArray(value[TELEGRAM_AUDIT_KEY]) ? value[TELEGRAM_AUDIT_KEY] : [];
      await chrome.storage.local.set({
        [TELEGRAM_AUDIT_KEY]: [
          audit,
          ...current.filter((item) => item && item.matchUrl !== matchUrl)
        ].slice(0, TELEGRAM_AUDIT_LIMIT)
      });
      return audit;
    });
  telegramAuditMutationChain = operation.then(() => undefined, () => undefined);
  return operation;
}

function validateTelegramPrematchPrediction(prediction) {
  const detailsFeatures = prediction && prediction.audit && prediction.audit.decision && prediction.audit.decision.features || {};
  const features = prediction && prediction.features || {};
  const leagueName = readTelegramPrematchFeatureText(
    prediction && prediction.leagueName,
    features.leagueName,
    detailsFeatures.leagueName,
    prediction && prediction.audit && prediction.audit.decision && prediction.audit.decision.leagueName,
    prediction && prediction.audit && prediction.audit.league && prediction.audit.league.name
  );
  if (isTelegramPrematchBlockedLeagueName(leagueName)) {
    return { accepted: false, reason: "prematch-league-not-allowed" };
  }
  if (isTelegramPrematchShadowOnlyLeagueName(leagueName)) {
    return { accepted: false, reason: "tt-cup-shadow-only" };
  }
  const matchStart = validateTelegramMatchStartPrediction(
    prediction,
    features,
    detailsFeatures
  );
  if (matchStart.applies) {
    return matchStart;
  }
  return { accepted: false, reason: "match-start-rule-not-used" };
}

function validateTelegramMatchStartPrediction(source, features = {}, detailsFeatures = {}) {
  const ruleId = readTelegramPrematchFeatureText(
    source && source.coverageRuleId,
    source && source.modelVersion,
    features.startMatchRuleId,
    detailsFeatures.startMatchRuleId
  );
  if (ruleId !== TELEGRAM_MATCH_START_RULE_ID) {
    return { applies: false, accepted: false, reason: "match-start-rule-not-used" };
  }
  if (!isTelegramMatchStartState(source && source.startEntryState)) {
    return { applies: true, accepted: false, reason: "match-start-trigger-invalid" };
  }
  if (!isTelegramMatchStartState(source && source.deliveryEntryState)) {
    return { applies: true, accepted: false, reason: "match-start-delivery-expired" };
  }
  const stateValidation = validateTelegramMatchStartStateContinuity(source);
  if (!stateValidation.accepted) {
    return { applies: true, accepted: false, reason: stateValidation.reason };
  }
  const action = readTelegramPrematchFeatureText(
    source && source.audit && source.audit.decision && source.audit.decision.action,
    source && source.decisionAction,
    source && source.action
  ).toLowerCase();
  if (
    normalizeTelegramText(source && source.oddsMeaning || "").toLowerCase()
      !== "optional-prematch-market-consensus"
    || Number(features.startMatchUsesCurrentScore) !== 0
  ) {
    return { applies: true, accepted: false, reason: "match-start-forbidden-input" };
  }

  const startApi = globalThis.LvrStartMatchRule;
  const pairApi = globalThis.LvrVerifiedPairRegimeV1;
  const startEvaluator = startApi && startApi.evaluate;
  const pairEvaluator = pairApi && pairApi.evaluate;
  const profiles = features.startMatchProfiles || detailsFeatures.startMatchProfiles;
  const players = Array.isArray(source && source.players)
    ? source.players.slice(0, 2).map(normalizeTelegramText)
    : [];
  if (
    typeof startEvaluator !== "function"
    || typeof pairEvaluator !== "function"
    || !Array.isArray(profiles)
    || profiles.length !== 2
    || players.length !== 2
  ) {
    return { applies: true, accepted: false, reason: "match-start-profile-missing" };
  }

  const evaluation = startEvaluator({ profiles, players });
  const leagueName = readTelegramPrematchFeatureText(
    source && source.leagueName,
    features.leagueName,
    detailsFeatures.leagueName,
    source && source.audit && source.audit.decision && source.audit.decision.leagueName,
    source && source.audit && source.audit.league && source.audit.league.name
  );
  const decisionAt = Number(
    source && source.finalDecisionAt
    || source && source.audit && source.audit.decision && source.audit.decision.finalDecisionAt
    || 0
  );
  const pairRegime = pairEvaluator({
    profiles,
    selectedSideIndex: evaluation.sideIndex,
    pointWindowSize: evaluation.pointWindowSize,
    relativeAgreementScore: evaluation.sideCorrection && evaluation.sideCorrection.agreementScore,
    latestPbpReversal: evaluation.sideCorrection && evaluation.sideCorrection.latestReversal,
    leagueName,
    moneylineMarket: source && source.referenceMoneylineMarket || null,
    decisionAt,
    z0Score: evaluation.z0Score
  });
  const expectedSide = pairRegime.selectedSideIndex;
  const decisionInputHash = pairRegime.inputHash;
  const readText = (key) => readTelegramPrematchFeatureText(features[key], detailsFeatures[key]);
  const readNumber = (key) => readTelegramPrematchFeatureNumber(features[key], detailsFeatures[key]);
  const storedSide = readTelegramPrematchFeatureNumber(
    features.startMatchSelectedSideIndex,
    detailsFeatures.startMatchSelectedSideIndex,
    source && source.sideIndex
  );
  const sourceSide = sanitizeCalibrationSideIndex(source && source.sideIndex);
  const playerName = normalizeTelegramText(source && source.playerName || "");
  const frozenMarket = source && source.referenceMoneylineMarket
    && typeof source.referenceMoneylineMarket === "object"
    ? source.referenceMoneylineMarket
    : null;
  const storedMarketSnapshot = features.startMatchPairRegimeMarketSnapshot
    || detailsFeatures.startMatchPairRegimeMarketSnapshot
    || null;
  const marketSalvageMinimum = Number(
    pairApi && pairApi.THRESHOLDS
    && pairApi.THRESHOLDS.marketSalvageFavoriteProbabilityMinimum
  );
  const marketOverrideMinimum = Number(
    pairApi && pairApi.THRESHOLDS
    && pairApi.THRESHOLDS.marketSideOverrideFavoriteProbabilityMinimum
  );
  const expectedMarketSalvage = Boolean(
    pairRegime.marketReady
    && pairRegime.marketFavoriteSideIndex === pairRegime.baseSelectedSideIndex
    && Number(pairRegime.marketFavoriteProbability) >= marketSalvageMinimum
  );
  const expectedMarketOverride = Boolean(
    pairRegime.marketReady
    && (pairRegime.marketFavoriteSideIndex === 0 || pairRegime.marketFavoriteSideIndex === 1)
    && pairRegime.marketFavoriteSideIndex !== pairRegime.baseSelectedSideIndex
    && Number(pairRegime.marketFavoriteProbability) >= marketOverrideMinimum
  );

  if (
    !evaluation.eligible
    || evaluation.inputHash !== readText("startMatchInputHash")
    || decisionInputHash !== readText("startMatchDecisionInputHash")
    || evaluation.formulaId !== readText("startMatchFormulaId")
    || !telegramPairRegimeOptionalNumbersEqual(
      readNumber("startMatchZ0Score"),
      evaluation.z0Score
    )
    || !telegramPairRegimeOptionalNumbersEqual(
      readNumber("startMatchZ0LeftP"),
      evaluation.z0Inputs && evaluation.z0Inputs[0] && evaluation.z0Inputs[0].latestStrengthScore
    )
    || !telegramPairRegimeOptionalNumbersEqual(
      readNumber("startMatchZ0RightP"),
      evaluation.z0Inputs && evaluation.z0Inputs[1] && evaluation.z0Inputs[1].latestStrengthScore
    )
    || !telegramPairRegimeOptionalNumbersEqual(
      readNumber("startMatchZ0LeftS3"),
      evaluation.z0Inputs && evaluation.z0Inputs[0] && evaluation.z0Inputs[0].history3SetSharePct
    )
    || !telegramPairRegimeOptionalNumbersEqual(
      readNumber("startMatchZ0RightS3"),
      evaluation.z0Inputs && evaluation.z0Inputs[1] && evaluation.z0Inputs[1].history3SetSharePct
    )
    || !telegramPairRegimeOptionalNumbersEqual(
      readNumber("startMatchZ0LeftL"),
      evaluation.z0Inputs && evaluation.z0Inputs[0] && evaluation.z0Inputs[0].latestOwnSets
    )
    || !telegramPairRegimeOptionalNumbersEqual(
      readNumber("startMatchZ0RightL"),
      evaluation.z0Inputs && evaluation.z0Inputs[1] && evaluation.z0Inputs[1].latestOwnSets
    )
    || !telegramPairRegimeOptionalNumbersEqual(
      readNumber("startMatchZ0LeftF3"),
      evaluation.z0Inputs && evaluation.z0Inputs[0] && evaluation.z0Inputs[0].freshForm3Score
    )
    || !telegramPairRegimeOptionalNumbersEqual(
      readNumber("startMatchZ0RightF3"),
      evaluation.z0Inputs && evaluation.z0Inputs[1] && evaluation.z0Inputs[1].freshForm3Score
    )
    || evaluation.coverageTier !== readText("startMatchCoverageTier")
    || expectedSide !== storedSide
    || sourceSide !== storedSide
    || storedSide !== 0 && storedSide !== 1
    || !areTelegramNamesSame(playerName, players[storedSide] || "")
    || readNumber("startMatchHistorySelectedSideIndex") !== evaluation.sideIndex
    || readNumber("startMatchBaseSelectedSideIndex") !== evaluation.sideIndex
    || readText("startMatchDecisionInputHash") !== pairRegime.inputHash
    || !(decisionAt > 0)
    || decisionAt > Date.now() + 2000
    || Number(features.startMatchAccepted) !== 1
    || !isTelegramPrematchProductionLeagueName(leagueName)
    || readText("startMatchLeagueMode") !== "production"
    || !pairApi.PROTOCOL
    || pairApi.PROTOCOL.id !== TELEGRAM_START_PAIR_REGIME_PROTOCOL_ID
    || pairApi.PROTOCOL.gateId !== TELEGRAM_START_PAIR_REGIME_PRODUCTION_GATE_ID
    || pairApi.PROTOCOL.selectorFormulaId !== evaluation.formulaId
    || pairRegime.protocolId !== TELEGRAM_START_PAIR_REGIME_PROTOCOL_ID
    || pairRegime.gateId !== TELEGRAM_START_PAIR_REGIME_PRODUCTION_GATE_ID
    || pairRegime.selectorFormulaId !== evaluation.formulaId
    || pairRegime.baseSelectedSideIndex !== evaluation.sideIndex
    || !["setka", "czech"].includes(pairRegime.leagueClass)
    || readText("startMatchProductionGateId") !== TELEGRAM_START_PAIR_REGIME_PRODUCTION_GATE_ID
    || readText("startMatchPairRegimeProtocolId") !== pairRegime.protocolId
    || readText("startMatchPairRegimeGateId") !== pairRegime.gateId
    || readText("startMatchPairRegimeSelectorFormulaId") !== pairRegime.selectorFormulaId
    || readText("startMatchPairRegimeInputHash") !== pairRegime.inputHash
    || readText("startMatchPairRegimeLeagueClass") !== pairRegime.leagueClass
    || readText("startMatchPairRegimeReason") !== pairRegime.reason
    || readNumber("startMatchPairRegimeSelectedSideIndex") !== pairRegime.selectedSideIndex
    || readNumber("startMatchPairRegimeBaseSelectedSideIndex") !== pairRegime.baseSelectedSideIndex
    || readNumber("startMatchPairRegimeMarketReady") !== (pairRegime.marketReady ? 1 : 0)
    || readText("startMatchPairRegimeMarketReason") !== pairRegime.marketReason
    || readText("startMatchPairRegimeMarketType") !== pairRegime.marketType
    || readText("startMatchPairRegimeMarketQuoteSource") !== pairRegime.marketQuoteSource
    || !telegramPairRegimeOptionalNumbersEqual(
      readNumber("startMatchPairRegimeMarketObservedAt"),
      pairRegime.marketObservedAt
    )
    || !telegramPairRegimeOptionalNumbersEqual(
      readNumber("startMatchPairRegimeMarketDecisionAt"),
      pairRegime.marketDecisionAt
    )
    || !telegramPairRegimeOptionalNumbersEqual(
      readNumber("startMatchPairRegimeMarketLeftOdds"),
      pairRegime.marketLeftOdds
    )
    || !telegramPairRegimeOptionalNumbersEqual(
      readNumber("startMatchPairRegimeMarketRightOdds"),
      pairRegime.marketRightOdds
    )
    || !telegramPairRegimeOptionalNumbersEqual(
      readNumber("startMatchPairRegimeMarketLeftImpliedProbability"),
      pairRegime.marketLeftImpliedProbability
    )
    || !telegramPairRegimeOptionalNumbersEqual(
      readNumber("startMatchPairRegimeMarketRightImpliedProbability"),
      pairRegime.marketRightImpliedProbability
    )
    || !telegramPairRegimeOptionalNumbersEqual(
      readNumber("startMatchPairRegimeMarketFavoriteSideIndex"),
      pairRegime.marketFavoriteSideIndex
    )
    || !telegramPairRegimeOptionalNumbersEqual(
      readNumber("startMatchPairRegimeMarketFavoriteProbability"),
      pairRegime.marketFavoriteProbability
    )
    || readNumber("startMatchPairRegimeMarketSideOverrideApplied")
      !== (pairRegime.marketSideOverrideApplied ? 1 : 0)
    || readNumber("startMatchPairRegimeMarketSalvageAccepted")
      !== (pairRegime.marketSalvageAccepted ? 1 : 0)
    || pairRegime.marketSalvageAccepted !== expectedMarketSalvage
    || pairRegime.marketSideOverrideApplied !== expectedMarketOverride
    || !telegramPairRegimeMarketSnapshotsEqual(
      storedMarketSnapshot,
      pairRegime.marketSnapshot
    )
    || !isTelegramPairRegimeFrozenMarketValid(
      frozenMarket,
      pairRegime,
      decisionAt
    )
    || !telegramPairRegimeOptionalNumbersEqual(
      readNumber("startMatchPairRegimePointWindowSize"),
      pairRegime.pointWindowSize
    )
    || readNumber("startMatchPairRegimeDataReady") !== (pairRegime.dataReady ? 1 : 0)
    || readNumber("startMatchPairRegimeEligible") !== (pairRegime.eligible ? 1 : 0)
    || readNumber("startMatchPairRegimeFormulaAccepted") !== (pairRegime.formulaAccepted ? 1 : 0)
    || readNumber("startMatchPairRegimeModerateAccepted") !== (pairRegime.moderateAccepted ? 1 : 0)
    || readNumber("startMatchPairRegimeQualityInputsReady") !== (pairRegime.qualityInputsReady ? 1 : 0)
    || !telegramPairRegimeOptionalNumbersEqual(
      readNumber("startMatchPairRegimeAbsoluteZ0Score"),
      pairRegime.absoluteZ0Score
    )
    || readNumber("startMatchPairRegimePointCollectionComplete")
      !== (pairRegime.pointCollectionComplete ? 1 : 0)
    || readNumber("startMatchPairRegimeIncompleteThreeMatchCollectionRejected")
      !== (pairRegime.incompleteThreeMatchCollectionRejected ? 1 : 0)
    || readNumber("startMatchPairRegimeLowZ0ConfidenceRejected")
      !== (pairRegime.lowZ0ConfidenceRejected ? 1 : 0)
    || readNumber("startMatchPairRegimeQualityAccepted") !== (pairRegime.qualityAccepted ? 1 : 0)
    || readText("startMatchSignalMode") !== pairRegime.signalMode
    || readNumber("startMatchPairRegimeAccepted") !== (pairRegime.accepted ? 1 : 0)
    || !telegramPairRegimeOptionalNumbersEqual(
      readNumber("startMatchPairRegimeLeftCollapseCount"),
      pairRegime.leftCollapseCount
    )
    || !telegramPairRegimeOptionalNumbersEqual(
      readNumber("startMatchPairRegimeRightCollapseCount"),
      pairRegime.rightCollapseCount
    )
    || !telegramPairRegimeOptionalNumbersEqual(
      readNumber("startMatchPairRegimeCollapseSum"),
      pairRegime.collapseSum
    )
    || !telegramPairRegimeOptionalNumbersEqual(
      readNumber("startMatchPairRegimeCollapseDifference"),
      pairRegime.collapseDifference
    )
    || readNumber("startMatchPairRegimeSumWithinLimit") !== (pairRegime.sumWithinLimit ? 1 : 0)
    || readNumber("startMatchPairRegimeCountsUnequal") !== (pairRegime.countsUnequal ? 1 : 0)
    || readNumber("startMatchPairRegimeCollapseAccepted") !== (pairRegime.collapseAccepted ? 1 : 0)
    || !telegramPairRegimeOptionalNumbersEqual(
      readNumber("startMatchPairRegimeSelectedStrengthScore"),
      pairRegime.selectedStrengthScore
    )
    || !telegramPairRegimeOptionalNumbersEqual(
      readNumber("startMatchPairRegimeOpponentStrengthScore"),
      pairRegime.opponentStrengthScore
    )
    || !telegramPairRegimeOptionalNumbersEqual(
      readNumber("startMatchPairRegimeSelectedStrengthEdge"),
      pairRegime.selectedStrengthEdge
    )
    || readNumber("startMatchPairRegimeStrongSelectedStrengthException")
      !== (pairRegime.strongSelectedStrengthException ? 1 : 0)
    || !telegramPairRegimeOptionalNumbersEqual(
      readNumber("startMatchPairRegimeSelectedHistoryMatches"),
      pairRegime.selectedHistoryMatches
    )
    || !telegramPairRegimeOptionalNumbersEqual(
      readNumber("startMatchPairRegimeSelectedHistoryWindowMatches"),
      pairRegime.selectedHistoryWindowMatches
    )
    || !telegramPairRegimeOptionalNumbersEqual(
      readNumber("startMatchPairRegimeSelectedHistorySetSharePct"),
      pairRegime.selectedHistorySetSharePct
    )
    || readNumber("startMatchPairRegimeSelectedHistoryWindowReady")
      !== (pairRegime.selectedHistoryWindowReady ? 1 : 0)
    || readNumber("startMatchPairRegimeSelectedHistorySetShareException")
      !== (pairRegime.selectedHistorySetShareException ? 1 : 0)
    || !telegramPairRegimeOptionalNumbersEqual(
      readNumber("startMatchPairRegimeSelectedFreshForm3Score"),
      pairRegime.selectedFreshForm3Score
    )
    || !telegramPairRegimeOptionalNumbersEqual(
      readNumber("startMatchPairRegimeOpponentFreshForm3Score"),
      pairRegime.opponentFreshForm3Score
    )
    || !telegramPairRegimeOptionalNumbersEqual(
      readNumber("startMatchPairRegimeSelectedHistory5WindowMatches"),
      pairRegime.selectedHistory5WindowMatches
    )
    || !telegramPairRegimeOptionalNumbersEqual(
      readNumber("startMatchPairRegimeOpponentHistory5WindowMatches"),
      pairRegime.opponentHistory5WindowMatches
    )
    || !telegramPairRegimeOptionalNumbersEqual(
      readNumber("startMatchPairRegimeSelectedHistory5SetSharePct"),
      pairRegime.selectedHistory5SetSharePct
    )
    || !telegramPairRegimeOptionalNumbersEqual(
      readNumber("startMatchPairRegimeOpponentHistory5SetSharePct"),
      pairRegime.opponentHistory5SetSharePct
    )
    || !telegramPairRegimeOptionalNumbersEqual(
      readNumber("startMatchPairRegimeSelectedHistory5SetShareEdge"),
      pairRegime.selectedHistory5SetShareEdge
    )
    || !telegramPairRegimeOptionalNumbersEqual(
      readNumber("startMatchPairRegimeSelectedHistory8PerformancePct"),
      pairRegime.selectedHistory8PerformancePct
    )
    || !telegramPairRegimeOptionalNumbersEqual(
      readNumber("startMatchPairRegimeOpponentHistory8PerformancePct"),
      pairRegime.opponentHistory8PerformancePct
    )
    || readNumber("startMatchPairRegimeRelativeHistoryWindowReady")
      !== (pairRegime.relativeHistoryWindowReady ? 1 : 0)
    || readNumber("startMatchPairRegimeSelectedFreshAtOrAboveHistory8")
      !== (pairRegime.selectedFreshAtOrAboveHistory8 ? 1 : 0)
    || readNumber("startMatchPairRegimeOpponentFreshAtOrAboveHistory8")
      !== (pairRegime.opponentFreshAtOrAboveHistory8 ? 1 : 0)
    || readNumber("startMatchPairRegimeRelativeFormSetShareException")
      !== (pairRegime.relativeFormSetShareException ? 1 : 0)
    || readNumber("startMatchProductionAccepted") !== (pairRegime.accepted ? 1 : 0)
    || readNumber("startMatchLeaguePublishAccepted") !== (pairRegime.accepted ? 1 : 0)
    || readNumber("startMatchUsesOdds") !== (pairRegime.marketReady ? 1 : 0)
  ) {
    return { applies: true, accepted: false, reason: "match-start-pair-regime-mismatch" };
  }

  const expectedAction = pairRegime.accepted ? "forecast" : "pass";
  if (action !== expectedAction) {
    return { applies: true, accepted: false, reason: "match-start-action-mismatch" };
  }
  if (!pairRegime.accepted) {
    return {
      applies: true,
      accepted: false,
      reason: pairRegime.reason || "collapse-combination-rejected",
      ruleId: TELEGRAM_MATCH_START_RULE_ID,
      selectedSideIndex: storedSide,
      inputHash: evaluation.inputHash,
      pairRegimeInputHash: pairRegime.inputHash
    };
  }
  return {
    applies: true,
    accepted: true,
    reason: "accepted-match-start-production-gate",
    ruleId: TELEGRAM_MATCH_START_RULE_ID,
    selectedSideIndex: storedSide,
    inputHash: evaluation.inputHash,
    pairRegimeInputHash: pairRegime.inputHash
  };
}

function telegramPairRegimeOptionalNumbersEqual(left, right) {
  const leftMissing = left === null || left === undefined || left === "" || Number.isNaN(left);
  const rightMissing = right === null || right === undefined || right === "" || Number.isNaN(right);
  if (leftMissing || rightMissing) {
    return leftMissing && rightMissing;
  }
  const leftNumber = Number(left);
  const rightNumber = Number(right);
  const leftFinite = Number.isFinite(leftNumber);
  const rightFinite = Number.isFinite(rightNumber);
  if (!leftFinite || !rightFinite) {
    return !leftFinite && !rightFinite;
  }
  return Math.abs(leftNumber - rightNumber) <= 1e-6;
}

function telegramPairRegimeMarketSnapshotsEqual(stored, expected) {
  if (!stored || typeof stored !== "object" || !expected || typeof expected !== "object") {
    return !stored && !expected;
  }
  return normalizeTelegramText(stored.status || "") === normalizeTelegramText(expected.status || "")
    && normalizeTelegramText(stored.marketType || "") === normalizeTelegramText(expected.marketType || "")
    && normalizeTelegramText(stored.quoteSource || "") === normalizeTelegramText(expected.quoteSource || "")
    && telegramPairRegimeOptionalNumbersEqual(stored.observedAt, expected.observedAt)
    && telegramPairRegimeOptionalNumbersEqual(stored.decisionAt, expected.decisionAt)
    && telegramPairRegimeOptionalNumbersEqual(stored.leftOdds, expected.leftOdds)
    && telegramPairRegimeOptionalNumbersEqual(stored.rightOdds, expected.rightOdds);
}

function isTelegramPairRegimeFrozenMarketValid(market, pairRegime, decisionAt) {
  if (!pairRegime || pairRegime.marketReady !== true) {
    return !market;
  }
  if (!market || typeof market !== "object") {
    return false;
  }
  const observedAt = Number(market.observedAt || 0);
  const leftOdds = Number(market.leftOdds);
  const rightOdds = Number(market.rightOdds);
  return normalizeTelegramText(market.status || "").toLowerCase() === "ready"
    && normalizeTelegramText(market.marketType || "").toLowerCase() === "matchresult"
    && normalizeTelegramText(market.quoteSource || market.preferredSource || "").toLowerCase()
      === "opening"
    && market.retrospective !== true
    && leftOdds > 1
    && rightOdds > 1
    && observedAt > 0
    && observedAt <= Number(decisionAt || 0)
    && telegramPairRegimeOptionalNumbersEqual(pairRegime.marketObservedAt, observedAt)
    && telegramPairRegimeOptionalNumbersEqual(pairRegime.marketDecisionAt, Number(decisionAt || 0))
    && telegramPairRegimeOptionalNumbersEqual(pairRegime.marketLeftOdds, leftOdds)
    && telegramPairRegimeOptionalNumbersEqual(pairRegime.marketRightOdds, rightOdds);
}

function telegramPairRegimeMarketFeaturesMatch(
  features,
  detailsFeatures,
  frozenMarket,
  pairRegime,
  decisionAt
) {
  const primary = features && typeof features === "object" ? features : {};
  const fallback = detailsFeatures && typeof detailsFeatures === "object" ? detailsFeatures : {};
  const readText = (key) => readTelegramPrematchFeatureText(primary[key], fallback[key]);
  const readNumber = (key) => readTelegramPrematchFeatureNumber(primary[key], fallback[key]);
  const storedSnapshot = primary.startMatchPairRegimeMarketSnapshot
    || fallback.startMatchPairRegimeMarketSnapshot
    || null;
  const thresholds = globalThis.LvrVerifiedPairRegimeV1
    && globalThis.LvrVerifiedPairRegimeV1.THRESHOLDS || {};
  const salvageMinimum = Number(thresholds.marketSalvageFavoriteProbabilityMinimum);
  const overrideMinimum = Number(thresholds.marketSideOverrideFavoriteProbabilityMinimum);
  const expectedSalvage = Boolean(
    pairRegime.marketReady
    && pairRegime.marketFavoriteSideIndex === pairRegime.baseSelectedSideIndex
    && Number(pairRegime.marketFavoriteProbability) >= salvageMinimum
  );
  const expectedOverride = Boolean(
    pairRegime.marketReady
    && (pairRegime.marketFavoriteSideIndex === 0 || pairRegime.marketFavoriteSideIndex === 1)
    && pairRegime.marketFavoriteSideIndex !== pairRegime.baseSelectedSideIndex
    && Number(pairRegime.marketFavoriteProbability) >= overrideMinimum
  );
  return readNumber("startMatchPairRegimeMarketReady") === (pairRegime.marketReady ? 1 : 0)
    && readText("startMatchPairRegimeMarketReason") === pairRegime.marketReason
    && readText("startMatchPairRegimeMarketType") === pairRegime.marketType
    && readText("startMatchPairRegimeMarketQuoteSource") === pairRegime.marketQuoteSource
    && telegramPairRegimeOptionalNumbersEqual(
      readNumber("startMatchPairRegimeMarketObservedAt"),
      pairRegime.marketObservedAt
    )
    && telegramPairRegimeOptionalNumbersEqual(
      readNumber("startMatchPairRegimeMarketDecisionAt"),
      pairRegime.marketDecisionAt
    )
    && telegramPairRegimeOptionalNumbersEqual(
      readNumber("startMatchPairRegimeMarketLeftOdds"),
      pairRegime.marketLeftOdds
    )
    && telegramPairRegimeOptionalNumbersEqual(
      readNumber("startMatchPairRegimeMarketRightOdds"),
      pairRegime.marketRightOdds
    )
    && telegramPairRegimeOptionalNumbersEqual(
      readNumber("startMatchPairRegimeMarketLeftImpliedProbability"),
      pairRegime.marketLeftImpliedProbability
    )
    && telegramPairRegimeOptionalNumbersEqual(
      readNumber("startMatchPairRegimeMarketRightImpliedProbability"),
      pairRegime.marketRightImpliedProbability
    )
    && telegramPairRegimeOptionalNumbersEqual(
      readNumber("startMatchPairRegimeMarketFavoriteSideIndex"),
      pairRegime.marketFavoriteSideIndex
    )
    && telegramPairRegimeOptionalNumbersEqual(
      readNumber("startMatchPairRegimeMarketFavoriteProbability"),
      pairRegime.marketFavoriteProbability
    )
    && readNumber("startMatchPairRegimeMarketSideOverrideApplied")
      === (pairRegime.marketSideOverrideApplied ? 1 : 0)
    && readNumber("startMatchPairRegimeMarketSalvageAccepted")
      === (pairRegime.marketSalvageAccepted ? 1 : 0)
    && pairRegime.marketSalvageAccepted === expectedSalvage
    && pairRegime.marketSideOverrideApplied === expectedOverride
    && telegramPairRegimeMarketSnapshotsEqual(storedSnapshot, pairRegime.marketSnapshot)
    && isTelegramPairRegimeFrozenMarketValid(frozenMarket, pairRegime, decisionAt);
}

function validateTelegramMatchStartStateContinuity(source) {
  const trigger = source && source.startEntryState || {};
  const delivery = source && source.deliveryEntryState || {};
  const matchUrl = normalizeTelegramMatchKey(source && source.matchUrl || "");
  const triggerUrl = normalizeTelegramMatchKey(trigger.sourceUrl || "");
  const deliveryUrl = normalizeTelegramMatchKey(delivery.sourceUrl || "");
  if (
    !matchUrl
    || !isSameTelegramMatch(triggerUrl, matchUrl)
    || !isSameTelegramMatch(deliveryUrl, matchUrl)
  ) {
    return { accepted: false, reason: "match-start-state-url-mismatch" };
  }
  const players = Array.isArray(source && source.players)
    ? source.players.slice(0, 2).map(normalizeTelegramText)
    : [];
  const triggerPlayers = Array.isArray(trigger.players)
    ? trigger.players.slice(0, 2).map(normalizeTelegramText)
    : [];
  const deliveryPlayers = Array.isArray(delivery.players)
    ? delivery.players.slice(0, 2).map(normalizeTelegramText)
    : [];
  if (
    players.length !== 2
    || triggerPlayers.length !== 2
    || deliveryPlayers.length !== 2
    || !players.every((name, index) => (
      areTelegramNamesSame(name, triggerPlayers[index])
      && areTelegramNamesSame(name, deliveryPlayers[index])
    ))
  ) {
    return { accepted: false, reason: "match-start-state-player-mismatch" };
  }
  const triggerAt = Number(trigger.capturedAt || 0);
  const deliveryAt = Number(delivery.capturedAt || source && source.deliveryObservedAt || 0);
  const now = Date.now();
  if (
    !(triggerAt > 0)
    || !(deliveryAt >= triggerAt)
    || deliveryAt > now + 2000
    || now - deliveryAt > TELEGRAM_MATCH_START_DELIVERY_MAX_AGE_MS
  ) {
    return { accepted: false, reason: "match-start-state-stale" };
  }
  return { accepted: true, reason: "match-start-state-continuous" };
}

function isTelegramMatchStartState(state) {
  if (!state || typeof state !== "object") {
    return false;
  }
  const evidence = normalizeTelegramText(state.sourceStateEvidence || "").toLowerCase();
  return normalizeTelegramText(state.mode || "").toLowerCase() === "live"
    && state.started === true
    && state.finished !== true
    && Number(state.completedSets || 0) === 0
    && Number(state.targetSetNumber || 0) === 1
    && ["live-marker", "score"].includes(evidence);
}

function readTelegramPrematchFeatureNumber(...values) {
  for (const value of values) {
    if (value === null || value === undefined || value === "") {
      continue;
    }
    if (typeof value !== "number" && typeof value !== "string") {
      continue;
    }
    if (typeof value === "string" && !value.trim()) {
      continue;
    }
    const number = Number(value);
    if (Number.isFinite(number)) {
      return number;
    }
  }
  return NaN;
}

function readTelegramPrematchFeatureText(...values) {
  for (const value of values) {
    if (value && typeof value === "object") {
      const text = normalizeTelegramText(value.name || value.leagueName || "");
      if (text) {
        return text;
      }
      continue;
    }
    const text = normalizeTelegramText(value || "");
    if (text) {
      return text;
    }
  }
  return "";
}

function isTelegramPrematchBlockedLeagueName(value) {
  return classifyTelegramPrematchLeague(value) === "blocked";
}

function isTelegramPrematchShadowOnlyLeagueName(value) {
  return classifyTelegramPrematchLeague(value) === "tt-cup-shadow";
}

function isTelegramPrematchProductionLeagueName(value) {
  return ["setka", "czech"].includes(classifyTelegramPrematchLeague(value));
}

function classifyTelegramPrematchLeague(value) {
  const classifier = globalThis.LvrVerifiedPairRegimeV1
    && globalThis.LvrVerifiedPairRegimeV1.classifyLeague;
  return typeof classifier === "function" ? classifier(value) : "blocked";
}

function sanitizeTelegramPredictionFeatures(features) {
  const source = features && typeof features === "object" ? features : {};
  const result = {};
  for (const key of [
    "sideIndex",
    "noMarketCoverage",
    "leftFreshForm3Score",
    "rightFreshForm3Score",
    "leftStrengthScore",
    "rightStrengthScore",
    "startMatchAccepted",
    "startMatchSelectedSideIndex",
    "startMatchHistorySelectedSideIndex",
    "startMatchBaseSelectedSideIndex",
    "startMatchZ0Score",
    "startMatchZ0LeftP",
    "startMatchZ0RightP",
    "startMatchZ0LeftS3",
    "startMatchZ0RightS3",
    "startMatchZ0LeftL",
    "startMatchZ0RightL",
    "startMatchZ0LeftF3",
    "startMatchZ0RightF3",
    "startMatchLegacySelectedSideIndex",
    "startMatchLegacyRawScoreDelta",
    "startMatchLivePointCorrectionApplied",
    "startMatchLivePointCorrectionThreshold",
    "startMatchLivePointCorrectionSelectedLead",
    "startMatchLivePointCorrectionLeftPoints",
    "startMatchLivePointCorrectionRightPoints",
    "startMatchSideCorrectionApplied",
    "startMatchRelativeAgreementScore",
    "startMatchLatestPbpReversal",
    "startMatchPairRegimeSelectedSideIndex",
    "startMatchPairRegimeBaseSelectedSideIndex",
    "startMatchPairRegimePointWindowSize",
    "startMatchPairRegimeDataReady",
    "startMatchPairRegimeEligible",
    "startMatchPairRegimeFormulaAccepted",
    "startMatchPairRegimeModerateAccepted",
    "startMatchPairRegimeQualityInputsReady",
    "startMatchPairRegimeAbsoluteZ0Score",
    "startMatchPairRegimePointCollectionComplete",
    "startMatchPairRegimeIncompleteThreeMatchCollectionRejected",
    "startMatchPairRegimeLowZ0ConfidenceRejected",
    "startMatchPairRegimeQualityAccepted",
    "startMatchPairRegimeAccepted",
    "startMatchPairRegimeLeftCollapseCount",
    "startMatchPairRegimeRightCollapseCount",
    "startMatchPairRegimeCollapseSum",
    "startMatchPairRegimeCollapseDifference",
    "startMatchPairRegimeSumWithinLimit",
    "startMatchPairRegimeCountsUnequal",
    "startMatchPairRegimeCollapseAccepted",
    "startMatchPairRegimeSelectedStrengthScore",
    "startMatchPairRegimeOpponentStrengthScore",
    "startMatchPairRegimeSelectedStrengthEdge",
    "startMatchPairRegimeStrongSelectedStrengthException",
    "startMatchPairRegimeSelectedHistoryMatches",
    "startMatchPairRegimeSelectedHistoryWindowMatches",
    "startMatchPairRegimeSelectedHistorySetSharePct",
    "startMatchPairRegimeSelectedHistoryWindowReady",
    "startMatchPairRegimeSelectedHistorySetShareException",
    "startMatchPairRegimeSelectedFreshForm3Score",
    "startMatchPairRegimeOpponentFreshForm3Score",
    "startMatchPairRegimeSelectedHistory5WindowMatches",
    "startMatchPairRegimeOpponentHistory5WindowMatches",
    "startMatchPairRegimeSelectedHistory5SetSharePct",
    "startMatchPairRegimeOpponentHistory5SetSharePct",
    "startMatchPairRegimeSelectedHistory5SetShareEdge",
    "startMatchPairRegimeSelectedHistory8PerformancePct",
    "startMatchPairRegimeOpponentHistory8PerformancePct",
    "startMatchPairRegimeRelativeHistoryWindowReady",
    "startMatchPairRegimeSelectedFreshAtOrAboveHistory8",
    "startMatchPairRegimeOpponentFreshAtOrAboveHistory8",
    "startMatchPairRegimeRelativeFormSetShareException",
    "startMatchPairRegimeMarketReady",
    "startMatchPairRegimeMarketObservedAt",
    "startMatchPairRegimeMarketDecisionAt",
    "startMatchPairRegimeMarketLeftOdds",
    "startMatchPairRegimeMarketRightOdds",
    "startMatchPairRegimeMarketLeftImpliedProbability",
    "startMatchPairRegimeMarketRightImpliedProbability",
    "startMatchPairRegimeMarketFavoriteSideIndex",
    "startMatchPairRegimeMarketFavoriteProbability",
    "startMatchPairRegimeMarketSideOverrideApplied",
    "startMatchPairRegimeMarketSalvageAccepted",
    "startMatchProductionAccepted",
    "startMatchLeaguePublishAccepted",
    "startMatchEntryPointTotal",
    "startMatchEntrySelectedPointLead",
    "startMatchPointWindowSize",
    "startMatchUsesOdds",
    "startMatchUsesCurrentScore",
    "startMatchLeftStrength",
    "startMatchRightStrength",
    "startMatchLeftStability",
    "startMatchRightStability",
    "startMatchLeftForm",
    "startMatchRightForm",
    "startMatchLeftHistoryMatches",
    "startMatchRightHistoryMatches",
    "startMatchLeftPointMatches",
    "startMatchRightPointMatches"
  ]) {
    if (
      source[key] === null
      || source[key] === undefined
      || typeof source[key] === "string" && !source[key].trim()
    ) {
      continue;
    }
    const value = finiteAuditNumber(source[key]);
    if (value !== null) {
      result[key] = value;
    }
  }
  for (const key of [
    "leagueName",
    "startMatchRuleId",
    "startMatchFormulaId",
    "startMatchInputHash",
    "startMatchDecisionInputHash",
    "startMatchSideCorrectionReason",
    "startMatchLivePointCorrectionRuleId",
    "startMatchLivePointCorrectionReason",
    "startMatchPairRegimeProtocolId",
    "startMatchPairRegimeGateId",
    "startMatchPairRegimeSelectorFormulaId",
    "startMatchPairRegimeInputHash",
    "startMatchPairRegimeLeagueClass",
    "startMatchPairRegimeReason",
    "startMatchPairRegimeMarketReason",
    "startMatchPairRegimeMarketType",
    "startMatchPairRegimeMarketQuoteSource",
    "startMatchSignalMode",
    "startMatchProductionGateId",
    "startMatchLeagueMode",
    "startMatchEntryBucket",
    "startMatchCoverageTier",
    "startMatchReason"
  ]) {
    const value = readTelegramPrematchFeatureText(source[key]);
    if (value) {
      result[key] = value;
    }
  }
  if (source.startMatchProfiles && typeof source.startMatchProfiles === "object") {
    result.startMatchProfiles = compactCalibrationValue(source.startMatchProfiles, 7);
  }
  if (
    source.startMatchPairRegimeMarketSnapshot
    && typeof source.startMatchPairRegimeMarketSnapshot === "object"
  ) {
    result.startMatchPairRegimeMarketSnapshot = compactCalibrationValue(
      source.startMatchPairRegimeMarketSnapshot,
      3
    );
  }
  return result;
}

function normalizeTelegramPercent(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return NaN;
  }
  return number <= 1 ? number * 100 : number;
}

function finiteAuditNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

async function getTelegramSentMap() {
  const value = await chrome.storage.local.get({ [TELEGRAM_SENT_KEY]: {} });
  return pruneTelegramSentMap(value[TELEGRAM_SENT_KEY] || {});
}

function recordTelegramSentDelivery(deliveryKeyValue) {
  const deliveryKey = normalizeTelegramText(deliveryKeyValue || "");
  if (!deliveryKey) {
    return Promise.resolve(false);
  }
  const operation = telegramSentMutationChain
    .catch(() => {})
    .then(async () => {
      const sentMap = await getTelegramSentMap();
      sentMap[deliveryKey] = Date.now();
      await chrome.storage.local.set({
        [TELEGRAM_SENT_KEY]: pruneTelegramSentMap(sentMap)
      });
      return true;
    });
  telegramSentMutationChain = operation.then(() => undefined, () => undefined);
  return operation;
}

function pruneTelegramSentMap(map) {
  const now = Date.now();
  const next = {};
  for (const [key, value] of Object.entries(map || {})) {
    const ts = Number(value || 0);
    if (key && ts > 0 && now - ts < TELEGRAM_SENT_TTL_MS) {
      next[key] = ts;
    }
  }
  return next;
}

function buildTelegramDeliveryKey(settings, baseKey) {
  const safeSettings = sanitizeTelegramSettings(settings || {});
  const tokenPart = safeSettings.botToken ? safeSettings.botToken.slice(0, 12) : "";
  const chatPart = parseTelegramChatIds(safeSettings.chatId).join(",");
  return [tokenPart, chatPart, baseKey].filter(Boolean).join("|");
}

function findRecentTelegramMatchDeliveryKey(sentMap, settings, matchUrl, deliverySuffix) {
  const now = Date.now();
  const matchIdentity = getTelegramMatchIdentityKey(matchUrl);
  const suffix = normalizeTelegramText(deliverySuffix || "");
  if (!matchIdentity || !suffix) {
    return "";
  }

  const canonicalKey = buildTelegramDeliveryKey(settings, `${matchIdentity}|${suffix}`);
  if (
    sentMap[canonicalKey]
    && now - Number(sentMap[canonicalKey] || 0) < TELEGRAM_SENT_TTL_MS
  ) {
    return canonicalKey;
  }

  const settingsPrefix = buildTelegramDeliveryKey(settings, "");
  const numericMatchId = matchIdentity.startsWith("bsf-match:")
    ? matchIdentity.slice("bsf-match:".length)
    : "";
  for (const [key, value] of Object.entries(sentMap || {})) {
    const timestamp = Number(value || 0);
    if (
      !key
      || timestamp <= 0
      || now - timestamp >= TELEGRAM_SENT_TTL_MS
      || settingsPrefix && !key.startsWith(`${settingsPrefix}|`)
      || !key.endsWith(`|${suffix}`)
    ) {
      continue;
    }
    if (
      numericMatchId
        ? new RegExp(`/table-tennis/r(?:s)?/${numericMatchId}(?:/|\\|)`, "i").test(key)
        : key.includes(`${normalizeTelegramMatchKey(matchUrl)}|${suffix}`)
    ) {
      return key;
    }
  }
  return "";
}

async function sendTelegramMessage(text, settings, options = {}) {
  const safeSettings = sanitizeTelegramSettings(settings || {});
  const chatIds = parseTelegramChatIds(safeSettings.chatId);
  if (!safeSettings.botToken || !chatIds.length) {
    throw new Error("Telegram bot token/chat id are empty");
  }

  const deadlineAt = Number(options && options.deadlineAt || 0);
  const deadlineReason = normalizeTelegramText(options && options.deadlineReason || "telegram-delivery-deadline-expired");
  if (isTelegramDeliveryDeadlineExpired(deadlineAt)) {
    throw createTelegramDeliveryDeadlineError(deadlineReason);
  }
  const messages = [];
  const errors = [];
  const results = await Promise.all(chatIds.map((chatId) => (
    sendTelegramMessageToChat(text, safeSettings, chatId, {
      deadlineAt,
      deadlineReason
    })
  )));
  for (const result of results) {
    if (result.message) {
      messages.push(result.message);
    } else if (result.error) {
      errors.push(result.error);
    }
  }

  if (errors.length && !messages.length) {
    if (errors.includes(deadlineReason)) {
      throw createTelegramDeliveryDeadlineError(deadlineReason);
    }
    throw new Error(errors.join("; "));
  }
  if (options && options.captureMessages) {
    return {
      sent: true,
      messages,
      partial: errors.length > 0,
      errors
    };
  }
  return errors.length ? { sent: true, partial: true, errors } : true;
}

function createTelegramDeliveryDeadlineError(reason) {
  const code = normalizeTelegramText(reason || "telegram-delivery-deadline-expired");
  const error = new Error(code);
  error.code = code;
  return error;
}

async function sendTelegramMessageToChat(text, settings, chatId, options = {}) {
  const deadlineAt = Number(options && options.deadlineAt || 0);
  const deadlineReason = normalizeTelegramText(options && options.deadlineReason || "telegram-delivery-deadline-expired");
  let lastError = `Telegram send failed for ${chatId}`;
  for (let attempt = 0; attempt < TELEGRAM_SEND_MAX_ATTEMPTS; attempt += 1) {
    if (isTelegramDeliveryDeadlineExpired(deadlineAt)) {
      return { message: null, error: deadlineReason, deadlineExpired: true };
    }
    let response = null;
    let payload = null;
    const controller = typeof AbortController === "function" ? new AbortController() : null;
    const remainingMs = deadlineAt > 0 ? Math.max(0, deadlineAt - Date.now()) : Infinity;
    const requestTimeoutMs = Number.isFinite(remainingMs)
      ? Math.min(TELEGRAM_SEND_TIMEOUT_MS, Math.max(1, remainingMs))
      : TELEGRAM_SEND_TIMEOUT_MS;
    const timeoutId = controller
      ? setTimeout(() => controller.abort(), requestTimeoutMs)
      : 0;
    try {
      response = await fetch(`https://api.telegram.org/bot${settings.botToken}/sendMessage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "HTML",
          disable_web_page_preview: false
        }),
        signal: controller && controller.signal
      });
      payload = await response.json().catch(() => null);
      if (response.ok && payload && payload.ok !== false) {
        const message = sanitizeTelegramMessageRef({
          chatId: payload && payload.result && payload.result.chat && payload.result.chat.id || chatId,
          messageId: payload && payload.result && payload.result.message_id
        });
        return message
          ? { message, error: "" }
          : { message: null, error: `Telegram send failed for ${chatId}: missing message_id` };
      }
      lastError = `Telegram send failed for ${chatId}: ${payload && payload.description || response.status}`;
      if (!isTelegramSendRetryableStatus(response.status)) {
        break;
      }
    } catch (error) {
      lastError = `Telegram send failed for ${chatId}: ${stringifyError(error)}`;
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }

    if (isTelegramDeliveryDeadlineExpired(deadlineAt)) {
      return { message: null, error: deadlineReason, deadlineExpired: true };
    }
    if (attempt + 1 >= TELEGRAM_SEND_MAX_ATTEMPTS) {
      break;
    }
    const retryDelayMs = getTelegramSendRetryDelayMs(attempt, payload);
    if (deadlineAt > 0 && Date.now() + retryDelayMs >= deadlineAt) {
      return { message: null, error: deadlineReason, deadlineExpired: true };
    }
    await waitForTelegramRetry(retryDelayMs);
  }
  return { message: null, error: lastError };
}

function isTelegramSendRetryableStatus(status) {
  const code = Number(status || 0);
  return code === 0 || code === 408 || code === 425 || code === 429 || code >= 500;
}

function getTelegramSendRetryDelayMs(attempt, payload) {
  const retryAfterSeconds = Number(payload && payload.parameters && payload.parameters.retry_after || 0);
  const retryAfterMs = Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0
    ? retryAfterSeconds * 1000
    : 0;
  const backoffMs = TELEGRAM_SEND_RETRY_BASE_MS * (2 ** Math.max(0, Number(attempt || 0)));
  return Math.min(TELEGRAM_SEND_RETRY_MAX_MS, Math.max(retryAfterMs, backoffMs));
}

function waitForTelegramRetry(delayMs) {
  return new Promise((resolve) => setTimeout(resolve, Math.max(0, Number(delayMs || 0))));
}

async function editTelegramMessageText(text, settings, messageRef, options = {}) {
  const safeSettings = sanitizeTelegramSettings(settings || {});
  const ref = sanitizeTelegramMessageRef(messageRef);
  if (!safeSettings.botToken || !ref) {
    return { edited: false, reason: "missing-message-ref" };
  }
  const requestedMaxAttempts = Number(options && options.maxAttempts);
  const maxAttempts = Number.isFinite(requestedMaxAttempts) && requestedMaxAttempts > 0
    ? Math.max(1, Math.floor(requestedMaxAttempts))
    : TELEGRAM_SEND_MAX_ATTEMPTS;
  const requestedTimeoutMs = Number(options && options.timeoutMs);
  const timeoutMs = Number.isFinite(requestedTimeoutMs) && requestedTimeoutMs > 0
    ? Math.max(1, Math.floor(requestedTimeoutMs))
    : TELEGRAM_SEND_TIMEOUT_MS;
  let lastError = "Telegram edit failed";
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    let response = null;
    let payload = null;
    const controller = typeof AbortController === "function" ? new AbortController() : null;
    const timeoutId = controller
      ? setTimeout(() => controller.abort(), timeoutMs)
      : 0;
    try {
      response = await fetch(`https://api.telegram.org/bot${safeSettings.botToken}/editMessageText`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chat_id: ref.chatId,
          message_id: ref.messageId,
          text,
          parse_mode: "HTML",
          disable_web_page_preview: false
        }),
        signal: controller && controller.signal
      });
      payload = await response.json().catch(() => null);
      if (response.ok && payload && payload.ok !== false) {
        return { edited: true };
      }
      lastError = payload && payload.description || String(response.status);
      if (!isTelegramSendRetryableStatus(response.status)) {
        break;
      }
    } catch (error) {
      lastError = stringifyError(error) || "Telegram edit failed";
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
    if (attempt + 1 < maxAttempts) {
      await waitForTelegramRetry(getTelegramSendRetryDelayMs(attempt, payload));
    }
  }
  return { edited: false, reason: lastError };
}

async function pinTelegramMessage(settings, messageRef) {
  const safeSettings = sanitizeTelegramSettings(settings || {});
  const ref = sanitizeTelegramMessageRef(messageRef);
  if (!safeSettings.botToken || !ref) {
    return { pinned: false, reason: "missing-message-ref" };
  }
  let lastError = "Telegram pin failed";
  for (let attempt = 0; attempt < TELEGRAM_SEND_MAX_ATTEMPTS; attempt += 1) {
    let response = null;
    let payload = null;
    const controller = typeof AbortController === "function" ? new AbortController() : null;
    const timeoutId = controller
      ? setTimeout(() => controller.abort(), TELEGRAM_SEND_TIMEOUT_MS)
      : 0;
    try {
      response = await fetch(`https://api.telegram.org/bot${safeSettings.botToken}/pinChatMessage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chat_id: ref.chatId,
          message_id: ref.messageId,
          disable_notification: true
        }),
        signal: controller && controller.signal
      });
      payload = await response.json().catch(() => null);
      if (response.ok && payload && payload.ok !== false) {
        return { pinned: true };
      }
      lastError = payload && payload.description || String(response.status);
      if (!isTelegramSendRetryableStatus(response.status)) {
        break;
      }
    } catch (error) {
      lastError = stringifyError(error) || "Telegram pin failed";
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
    if (attempt + 1 < TELEGRAM_SEND_MAX_ATTEMPTS) {
      await waitForTelegramRetry(getTelegramSendRetryDelayMs(attempt, payload));
    }
  }
  return { pinned: false, reason: lastError };
}

async function callTelegramMessageAction(method, settings, messageRef) {
  const safeSettings = sanitizeTelegramSettings(settings || {});
  const ref = sanitizeTelegramMessageRef(messageRef);
  if (!safeSettings.botToken || !ref) {
    return { ok: false, reason: "missing-message-ref" };
  }
  try {
    const response = await fetch(
      "https://api.telegram.org/bot" + safeSettings.botToken + "/" + method,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: ref.chatId,
          message_id: ref.messageId
        })
      }
    );
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload || payload.ok === false) {
      return {
        ok: false,
        reason: normalizeTelegramText(payload && payload.description || response.status || "telegram-action-failed")
      };
    }
    return { ok: true };
  } catch (error) {
    return { ok: false, reason: stringifyError(error) || "telegram-action-failed" };
  }
}

async function removeStaleTelegramStatsMessage(settings, messageRef) {
  const deleted = await callTelegramMessageAction("deleteMessage", settings, messageRef);
  if (deleted.ok) {
    return { removed: true, deleted: true, unpinned: true };
  }
  if (isTelegramMessageMissingError(deleted.reason)) {
    return { removed: true, deleted: false, unpinned: false, missing: true };
  }
  if (/too many requests|retry after/i.test(deleted.reason || "")) {
    return { removed: false, deleted: false, unpinned: false, reason: deleted.reason };
  }
  const unpinned = await callTelegramMessageAction("unpinChatMessage", settings, messageRef);
  if (isTelegramMessageMissingError(unpinned.reason)) {
    return { removed: true, deleted: false, unpinned: false, missing: true };
  }
  return {
    removed: unpinned.ok,
    deleted: false,
    unpinned: unpinned.ok,
    reason: unpinned.ok ? deleted.reason : [deleted.reason, unpinned.reason].filter(Boolean).join("; ")
  };
}

async function getTelegramPinnedStatsMessage(settings, chatId) {
  const safeSettings = sanitizeTelegramSettings(settings || {});
  const safeChatId = normalizeTelegramText(chatId);
  if (!safeSettings.botToken || !safeChatId) {
    return null;
  }
  try {
    const response = await fetch(
      "https://api.telegram.org/bot" + safeSettings.botToken + "/getChat",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: safeChatId })
      }
    );
    const payload = await response.json().catch(() => null);
    const pinnedMessage = response.ok && payload && payload.ok !== false
      ? payload.result && payload.result.pinned_message
      : null;
    const pinnedText = normalizeTelegramText(pinnedMessage && (pinnedMessage.text || pinnedMessage.caption) || "");
    if (!/^📌\s*(?:LVR статистика|Статистика ставок|Статистика прогнозов)(?:\s|$)/i.test(pinnedText)) {
      return null;
    }
    return sanitizeTelegramMessageRef({
      chatId: pinnedMessage && pinnedMessage.chat && pinnedMessage.chat.id || safeChatId,
      messageId: pinnedMessage && pinnedMessage.message_id
    });
  } catch (_) {
    return null;
  }
}

async function ensureTelegramStatsMessagePinned(settings, messageRef, alreadyPinned = false) {
  if (alreadyPinned) {
    return { pinned: true, reason: "already-pinned" };
  }
  try {
    return await pinTelegramMessage(settings, messageRef);
  } catch (error) {
    return { pinned: false, reason: stringifyError(error) };
  }
}

function isTelegramMessageMissingError(reason) {
  return /message (?:to (?:edit|pin|delete|unpin) )?not found|message_id_invalid|message id invalid/i
    .test(normalizeTelegramText(reason || ""));
}

async function recreateTelegramStatsMessageTarget(target, previous, text, reason) {
  let sendResult = null;
  try {
    sendResult = await sendTelegramMessage(text, target.settings, { captureMessages: true });
  } catch (error) {
    return {
      ref: null,
      result: {
        key: target.key,
        edited: false,
        sent: false,
        recreated: false,
        reason: "stats-recreate-send-failed",
        error: stringifyError(error)
      }
    };
  }

  const messages = sendResult && Array.isArray(sendResult.messages)
    ? sendResult.messages.map(sanitizeTelegramMessageRef).filter(Boolean)
    : [];
  if (!messages.length) {
    return {
      ref: null,
      result: {
        key: target.key,
        edited: false,
        sent: false,
        recreated: false,
        reason: "stats-recreate-send-returned-empty"
      }
    };
  }

  const pinResults = [];
  for (const message of messages) {
    pinResults.push(await ensureTelegramStatsMessagePinned(target.settings, message));
  }
  const pinned = pinResults.some((item) => item && item.pinned);
  const pinErrors = pinResults
    .filter((item) => item && !item.pinned)
    .map((item) => item.reason || "pin-failed")
    .slice(-3);
  if (!pinned) {
    for (const message of messages) {
      await removeStaleTelegramStatsMessage(target.settings, message).catch(() => null);
    }
    return {
      ref: null,
      result: {
        key: target.key,
        edited: false,
        sent: false,
        recreated: false,
        pinned: false,
        reason: "stats-recreate-pin-failed",
        pinErrors
      }
    };
  }

  const previousMessages = Array.isArray(previous && previous.messages)
    ? previous.messages.map(sanitizeTelegramMessageRef).filter(Boolean)
    : [];
  const cleanupErrors = [];
  for (const message of previousMessages) {
    const removal = await removeStaleTelegramStatsMessage(target.settings, message);
    if (!removal.removed) {
      cleanupErrors.push(removal.reason || "old-stats-message-cleanup-failed");
    }
  }
  const ref = {
    ts: Date.now(),
    source: "stats",
    settingsKind: target.settingsKind,
    chatId: target.chatId,
    text,
    lastReason: normalizeTelegramText(reason),
    messages,
    pinned: true,
    lastError: "",
    pinErrors: []
  };
  return {
    ref,
    result: {
      key: target.key,
      edited: false,
      sent: true,
      recreated: true,
      pinned: true,
      messages: messages.length,
      pinErrors: [],
      cleanupErrors
    }
  };
}

function updateTelegramStatsMessage(reason = "update", options = {}) {
  const task = telegramStatsRefreshChain
    .catch(() => {})
    .then(() => updateTelegramStatsMessageNow(reason, options));
  telegramStatsRefreshChain = task.catch((error) => {
    console.warn("[Prematch Forecast] Stats refresh failed", error);
    return {
      updated: false,
      reason: "stats-update-error",
      error: stringifyError(error)
    };
  });
  return task;
}

async function updateTelegramStatsMessageNow(reason = "update", options = {}) {
  const refs = await getTelegramStatsMessageRefs();
  const allTargets = await getTelegramStatsTargets();
  const targets = allTargets
    .filter((target) => options.createMissing === false ? Boolean(refs[target.key]) : true);
  if (!targets.length) {
    const legacyCleanup = await cleanupLegacyTelegramStatsMessages(refs, allTargets);
    if (legacyCleanup.changed) {
      await chrome.storage.local.set({ [TELEGRAM_STATS_REFS_KEY]: pruneTelegramStatsMessageRefs(refs) });
    }
    return {
      updated: false,
      reason: options.createMissing === false ? "stats-message-not-created" : "telegram-disabled",
      summary: null,
      legacyCleanup
    };
  }
  const throttle = getTelegramStatsUpdateThrottle(targets, refs, options);
  if (throttle.throttled) {
    return {
      updated: false,
      reason: "stats-throttled",
      summary: null,
      throttleMs: throttle.throttleMs,
      nextUpdateInMs: throttle.nextUpdateInMs,
      lastUpdatedAt: throttle.lastUpdatedAt,
      legacyCleanup: { changed: false, skipped: true, reason: "stats-throttled" }
    };
  }
  const summary = await buildTelegramStatsSummary();
  const text = formatTelegramStatsMessage(summary, reason);
  const results = [];
  for (const target of targets) {
    let previous = refs[target.key] || null;
    if (!previous) {
      const pinnedMessage = await getTelegramPinnedStatsMessage(target.settings, target.chatId);
      if (pinnedMessage) {
        previous = {
          ts: 0,
          source: "stats",
          settingsKind: target.settingsKind,
          chatId: target.chatId,
          text: "",
          lastReason: "adopted-pinned-stats",
          messages: [pinnedMessage],
          pinned: true,
          pinErrors: []
        };
        refs[target.key] = previous;
      }
    }
    if (options.recreate) {
      const recreated = await recreateTelegramStatsMessageTarget(target, previous, text, reason);
      if (recreated.ref) {
        refs[target.key] = recreated.ref;
      }
      results.push(recreated.result);
      continue;
    }
    const previousMessages = Array.isArray(previous && previous.messages)
      ? previous.messages.map(sanitizeTelegramMessageRef).filter(Boolean)
      : [];
    const previousMessage = previousMessages[0] || null;
    let previousMessageMissing = false;
    if (!options.force && previousMessage && normalizeTelegramMessageText(previous.text) === normalizeTelegramMessageText(text)) {
      const pinResult = await ensureTelegramStatsMessagePinned(
        target.settings,
        previousMessage,
        false
      );
      if (!pinResult.pinned && isTelegramMessageMissingError(pinResult.reason)) {
        delete refs[target.key];
        previousMessageMissing = true;
      } else {
        refs[target.key] = {
          ...previous,
          pinned: pinResult.pinned,
          lastError: "",
          pinErrors: pinResult.pinned ? [] : [pinResult.reason || "pin-failed"]
        };
        results.push({
          key: target.key,
          edited: false,
          sent: false,
          unchanged: true,
          pinned: pinResult.pinned,
          messages: previousMessages.length,
          pinErrors: refs[target.key].pinErrors
        });
        continue;
      }
    }
    if (previousMessage && !previousMessageMissing) {
      const edited = await editTelegramMessageText(text, target.settings, previousMessage, {
        maxAttempts: TELEGRAM_STATS_EDIT_MAX_ATTEMPTS,
        timeoutMs: TELEGRAM_STATS_EDIT_TIMEOUT_MS
      });
      if (edited.edited) {
        const pinResult = await ensureTelegramStatsMessagePinned(
          target.settings,
          previousMessage,
          previous && previous.pinned === true && !options.force
        );
        refs[target.key] = {
          ...previous,
          ts: Date.now(),
          text,
          lastReason: normalizeTelegramText(reason),
          messages: previousMessages,
          pinned: pinResult.pinned,
          lastError: "",
          pinErrors: pinResult.pinned ? [] : [pinResult.reason || "pin-failed"]
        };
        results.push({
          key: target.key,
          edited: true,
          sent: false,
          pinned: pinResult.pinned,
          messages: previousMessages.length,
          pinErrors: refs[target.key].pinErrors
        });
        continue;
      }
      if (/message is not modified|message not modified/i.test(edited.reason || "")) {
        const pinResult = await ensureTelegramStatsMessagePinned(
          target.settings,
          previousMessage,
          previous && previous.pinned === true && !options.force
        );
        refs[target.key] = {
          ...previous,
          pinned: pinResult.pinned,
          lastError: "",
          pinErrors: pinResult.pinned ? [] : [pinResult.reason || "pin-failed"]
        };
        results.push({
          key: target.key,
          edited: false,
          sent: false,
          unchanged: true,
          pinned: pinResult.pinned,
          messages: previousMessages.length,
          pinErrors: refs[target.key].pinErrors
        });
        continue;
      }
      if (!isTelegramMessageMissingError(edited.reason)) {
        refs[target.key] = {
          ...previous,
          ts: Date.now(),
          text: previous.text || "",
          lastReason: normalizeTelegramText(reason),
          lastError: edited.reason || "edit-failed",
          messages: previousMessages
        };
        results.push({ key: target.key, edited: false, sent: false, reason: edited.reason || "edit-failed" });
        continue;
      }
      delete refs[target.key];
    }

    let sendResult = null;
    try {
      sendResult = await sendTelegramMessage(text, target.settings, { captureMessages: true });
    } catch (error) {
      results.push({
        key: target.key,
        edited: false,
        sent: false,
        reason: "stats-send-failed",
        error: stringifyError(error)
      });
      continue;
    }
    const messages = sendResult && Array.isArray(sendResult.messages)
      ? sendResult.messages.map(sanitizeTelegramMessageRef).filter(Boolean)
      : [];
    const pinResults = [];
    for (const message of messages) {
      pinResults.push(await ensureTelegramStatsMessagePinned(target.settings, message));
    }
    refs[target.key] = {
      ts: Date.now(),
      source: "stats",
      settingsKind: target.settingsKind,
      chatId: target.chatId,
      text,
      lastReason: normalizeTelegramText(reason),
      messages,
      pinned: pinResults.some((item) => item && item.pinned),
      pinErrors: pinResults.filter((item) => item && !item.pinned).map((item) => item.reason || "pin-failed").slice(-3)
    };
    results.push({
      key: target.key,
      edited: false,
      sent: messages.length > 0,
      pinned: refs[target.key].pinned,
      messages: messages.length,
      pinErrors: refs[target.key].pinErrors
    });
  }
  const activeUpdated = results.some((item) => item && (item.sent || item.edited || item.unchanged));
  const legacyCleanup = activeUpdated
    ? await cleanupLegacyTelegramStatsMessages(refs, allTargets)
    : { changed: false, skipped: true, reason: "active-stats-update-failed", errors: [] };
  await chrome.storage.local.set({ [TELEGRAM_STATS_REFS_KEY]: pruneTelegramStatsMessageRefs(refs) });
  const created = results.filter((item) => item && item.sent).length;
  const edited = results.filter((item) => item && item.edited).length;
  const unchanged = results.filter((item) => item && item.unchanged).length;
  const pinned = results.filter((item) => item && item.pinned).length;
  const errors = results.flatMap((item) => [
    item && item.error,
    ...(Array.isArray(item && item.pinErrors) ? item.pinErrors : []),
    ...(Array.isArray(item && item.cleanupErrors) ? item.cleanupErrors : [])
  ]).map(normalizeTelegramText).filter(Boolean);
  const updated = created + edited + unchanged > 0;
  return {
    updated,
    reason: updated ? reason : "stats-update-failed",
    summary,
    targets: results.length,
    created,
    edited,
    unchanged,
    pinned,
    errors,
    legacyCleanup,
    results
  };
}

function getTelegramStatsUpdateThrottle(targets, refs, options = {}) {
  const minInterval = Number.isFinite(Number(options.minIntervalMs))
    ? Math.max(0, Number(options.minIntervalMs))
    : TELEGRAM_STATS_UPDATE_MIN_INTERVAL_MS;
  if (options.force || minInterval <= 0) {
    return { throttled: false, throttleMs: minInterval, nextUpdateInMs: 0, lastUpdatedAt: 0 };
  }
  const targetRefs = (Array.isArray(targets) ? targets : [])
    .map((target) => target && refs && refs[target.key])
    .filter(Boolean);
  if (!targetRefs.length || targetRefs.length < (Array.isArray(targets) ? targets.length : 0)) {
    return { throttled: false, throttleMs: minInterval, nextUpdateInMs: 0, lastUpdatedAt: 0 };
  }
  const lastUpdatedAt = targetRefs.reduce((best, ref) => Math.max(
    best,
    Number(ref && (ref.ts || ref.editedAt) || 0) || 0
  ), 0);
  const elapsed = Date.now() - lastUpdatedAt;
  if (lastUpdatedAt > 0 && elapsed >= 0 && elapsed < minInterval) {
    return {
      throttled: true,
      throttleMs: minInterval,
      nextUpdateInMs: minInterval - elapsed,
      lastUpdatedAt
    };
  }
  return { throttled: false, throttleMs: minInterval, nextUpdateInMs: 0, lastUpdatedAt };
}

async function cleanupLegacyTelegramStatsMessages(refs, currentTargets) {
  const safeRefs = refs && typeof refs === "object" ? refs : {};
  const safeTargets = Array.isArray(currentTargets) ? currentTargets : [];
  const activeKeys = new Set(safeTargets
    .map((target) => normalizeTelegramText(target && target.key || ""))
    .filter(Boolean));
  const prematchSettings = await getTelegramSettings();
  const cleanupSettings = [
    { settingsKind: "prematch", settings: prematchSettings }
  ].filter((item) => item.settings && item.settings.botToken);
  const result = {
    changed: false,
    refsRemoved: 0,
    messagesDeleted: 0,
    messagesUnpinned: 0,
    orphanPinsRemoved: 0,
    errors: []
  };

  for (const [key, ref] of Object.entries(safeRefs)) {
    if (activeKeys.has(key)) {
      continue;
    }
    const settingsKind = normalizeTelegramText(ref && ref.settingsKind || "");
    const owner = cleanupSettings.find((item) => key.startsWith(item.settings.botToken.slice(0, 12) + "|"))
      || (!key.includes("|")
        ? cleanupSettings.find((item) => item.settingsKind === settingsKind)
        : null);
    if (!owner) {
      continue;
    }

    const messages = Array.isArray(ref && ref.messages)
      ? ref.messages.map(sanitizeTelegramMessageRef).filter(Boolean)
      : [];
    let cleaned = 0;
    for (const message of messages) {
      const removal = await removeStaleTelegramStatsMessage(owner.settings, message);
      if (removal.removed) {
        cleaned += 1;
        if (removal.deleted) {
          result.messagesDeleted += 1;
        } else if (removal.unpinned) {
          result.messagesUnpinned += 1;
        }
      } else {
        result.errors.push(removal.reason || "legacy-stats-cleanup-failed");
      }
    }
    if (!messages.length || cleaned === messages.length) {
      delete safeRefs[key];
      result.changed = true;
      result.refsRemoved += 1;
    }
  }
  result.errors = result.errors.map(normalizeTelegramText).filter(Boolean).slice(-5);
  return result;
}

async function getTelegramStatsTargets() {
  const prematchSettings = await getTelegramSettings();
  const result = [];
  const seen = new Set();
  const addSettings = (settings, settingsKind) => {
    const safe = sanitizeTelegramSettings(settings || {});
    if (!safe.enabled || !safe.botToken) {
      return;
    }
    const chatIds = parseTelegramChatIds(safe.chatId);
    for (const chatId of chatIds) {
      const targetSettings = { ...safe, chatId };
      const key = buildTelegramStatsMessageKey(targetSettings, settingsKind);
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      result.push({ key, chatId, settingsKind, settings: targetSettings });
    }
  };
  addSettings(prematchSettings, "prematch");
  return result;
}

function buildTelegramStatsMessageKey(settings, settingsKind) {
  const safe = sanitizeTelegramSettings(settings || {});
  return [
    safe.botToken ? safe.botToken.slice(0, 12) : "",
    normalizeTelegramText(safe.chatId),
    normalizeTelegramText(settingsKind || "telegram"),
    "stats"
  ].filter(Boolean).join("|");
}

async function getTelegramStatsMessageRefs() {
  const value = await chrome.storage.local.get({ [TELEGRAM_STATS_REFS_KEY]: {} });
  return pruneTelegramStatsMessageRefs(value[TELEGRAM_STATS_REFS_KEY] || {});
}

function pruneTelegramStatsMessageRefs(map) {
  const entries = Object.entries(map && typeof map === "object" ? map : {})
    .filter(([, value]) => value && Array.isArray(value.messages) && value.messages.some(sanitizeTelegramMessageRef))
    .sort((left, right) => Number(right[1] && right[1].ts || 0) - Number(left[1] && left[1].ts || 0))
    .slice(0, TELEGRAM_STATS_REFS_LIMIT);
  return Object.fromEntries(entries);
}

async function buildTelegramStatsSummary() {
  await Promise.all([
    flushTelegramPredictionPointSnapshots(),
    ensureTableTennisProtectionStateLoaded()
  ]);
  const [rows, storage] = await Promise.all([
    readTelegramPredictionDataset(),
    chrome.storage.local.get({ scanStatus: null })
  ]);
  const summary = summarizeTelegramStatsRows(rows);
  summary.collectorHealth = buildTelegramCollectorHealth(storage.scanStatus);
  return summary;
}

function buildTelegramCollectorHealth(scanStatus, now = Date.now()) {
  const safeStatus = scanStatus && typeof scanStatus === "object" ? scanStatus : {};
  const bsportsfan = safeStatus.bsportsfan && typeof safeStatus.bsportsfan === "object"
    ? safeStatus.bsportsfan
    : {};
  const recovery = bsportsfan.sessionRecovery && typeof bsportsfan.sessionRecovery === "object"
    ? bsportsfan.sessionRecovery
    : {};
  const statusKind = normalizeTelegramText(safeStatus.statusKind || "").toLowerCase();
  if (
    recovery.manual === true
    || normalizeTelegramText(recovery.stage || "").toLowerCase() === "manual-required"
  ) {
    return {
      state: "manual",
      text: "🔴 Сбор: откройте BSportsFan и пройдите проверку"
    };
  }
  if (statusKind === "protection" || bsportsfan.challenge === true) {
    const currentSourceId = getTableTennisDataSourceId(bsportsfan.url || "") || "bsportsfan";
    const retryAt = Number(
      bsportsfan.autoRetryAt
      || getTableTennisSourceProtectionOpenUntil(currentSourceId)
      || 0
    );
    return {
      state: "challenge",
      text: retryAt > now
        ? `⏸ Сбор: проверка сайта · автоповтор в ${formatTelegramStatsTime(retryAt)}`
        : "🔄 Сбор: повторно подключается к источнику"
    };
  }
  const bsportsfanRetryAt = getTableTennisSourceProtectionOpenUntil("bsportsfan");
  if (bsportsfanRetryAt > now) {
    return {
      state: "cooldown",
      text: `⏸ Сбор: BSportsFan на паузе до ${formatTelegramStatsTime(bsportsfanRetryAt)}`
    };
  }
  const heartbeatAt = Number(safeStatus.ts || 0);
  if (!(heartbeatAt > 0) || now - heartbeatAt >= TABLE_TENNIS_HEALTH_STALE_MS) {
    return {
      state: "stale",
      text: "⚠️ Сбор: нет ответа, включено автовосстановление"
    };
  }
  const monitor = bsportsfan.cipMonitor && typeof bsportsfan.cipMonitor === "object"
    ? bsportsfan.cipMonitor
    : {};
  const visible = Math.max(0, Number(monitor.visibleRows || 0));
  const waiting = Math.max(0, Number(monitor.waitingRows || 0));
  const queue = Math.max(0, Number(monitor.forecastQueueSize || 0));
  const workers = Math.max(0, Number(monitor.forecastActiveWorkers || 0));
  if (queue > 0 || workers > 0) {
    return {
      state: "processing",
      text: `🔄 Сбор: работает · видно ${visible} · в обработке ${queue + workers}`
    };
  }
  return {
    state: "healthy",
    text: `🟢 Сбор: работает · видно ${visible} · ждут старта ${waiting}`
  };
}

function summarizeTelegramStatsRows(rows) {
  const list = Array.isArray(rows) ? rows : [];
  const summary = {
    updatedAt: Date.now(),
    rows: list.length,
    forecastRows: 0,
    forecastResultRows: 0,
    sentPrematchRows: 0,
    sentPrematchResultRows: 0,
    pendingSentPrematchRows: 0,
    observedOnlyRows: 0,
    observedOnlyResultRows: 0,
    resultRows: 0,
    pendingForecastRows: 0,
    pointSnapshots: 0,
    latestProductionDecision: null,
    sentProductionStart: buildTelegramStatsBucket()
  };

  for (const row of list) {
    const recordKind = normalizeTelegramText(row && row.recordKind || "");
    if (recordKind === "forecasted") {
      summary.forecastRows += 1;
    } else if (recordKind === "observed_only") {
      summary.observedOnlyRows += 1;
    }

    const resultStatus = getTelegramStatsResultStatus(row);
    if (resultStatus) {
      summary.resultRows += 1;
      if (recordKind === "forecasted") {
        summary.forecastResultRows += 1;
      } else if (recordKind === "observed_only") {
        summary.observedOnlyResultRows += 1;
      }
    } else if (recordKind === "forecasted") {
      summary.pendingForecastRows += 1;
    }

    const pointTimeline = Array.isArray(row && row.pointTimeline)
      ? row.pointTimeline
      : Array.isArray(row && row.pointByPoint)
        ? row.pointByPoint
        : [];
    summary.pointSnapshots += pointTimeline.length;

    const prematch = row && (row.prematch || row.prematchSnapshot);
    if (!isCompatibleProductionStartStatsPrematch(prematch, row)) {
      continue;
    }
    const prematchResultStatus = getTelegramStatsPrematchResultStatus(row, prematch);
    const sent = prematch.sent === true || prematch.sent === 1;
    const decisionAt = getTelegramPrematchDecisionAt(prematch, row);
    if (
      decisionAt > 0
      && (
        !summary.latestProductionDecision
        || decisionAt > Number(summary.latestProductionDecision.decisionAt || 0)
      )
    ) {
      summary.latestProductionDecision = {
        decisionAt,
        sent
      };
    }
    if (sent) {
      summary.sentPrematchRows += 1;
      if (prematchResultStatus === "hit" || prematchResultStatus === "miss") {
        summary.sentPrematchResultRows += 1;
      } else {
        summary.pendingSentPrematchRows += 1;
      }
    }
    addTelegramStatsDecision(
      summary.sentProductionStart,
      sent ? "forecast" : "skip",
      prematchResultStatus,
      sent
    );
  }

  finishTelegramStatsBucket(summary.sentProductionStart);
  summary.pairRegimeForward = summarizeTelegramStartPairRegimeRows(list, "production");
  summary.pairRegimeTtCupShadow = summarizeTelegramStartPairRegimeRows(list, "tt-cup-shadow");
  return summary;
}

function summarizeTelegramStartPairRegimeRows(rows, leagueScope = "production") {
  const protocol = globalThis.LvrVerifiedPairRegimeV1
    && globalThis.LvrVerifiedPairRegimeV1.PROTOCOL || {};
  const targetEligible = Number(protocol.targetEligible || 300);
  const minimumReviewSettled = Number(protocol.minimumReviewSettled || 150);
  const candidates = [];
  const invalidReasonCounts = {};
  let observedTaggedRows = 0;
  let invalidTaggedRows = 0;
  let ineligibleTaggedRows = 0;

  for (const row of Array.isArray(rows) ? rows : []) {
    const parsed = parseTelegramStartPairRegimeRow(row);
    if (!parsed || parsed.leagueMode !== leagueScope) continue;
    observedTaggedRows += 1;
    if (!parsed.valid) {
      invalidTaggedRows += 1;
      invalidReasonCounts[parsed.reason] = Number(invalidReasonCounts[parsed.reason] || 0) + 1;
      continue;
    }
    if (!parsed.eligible) {
      ineligibleTaggedRows += 1;
      continue;
    }
    candidates.push(parsed);
  }

  candidates.sort(compareTelegramPairRegimeDecisionOrder);
  const cohort = candidates.slice(0, targetEligible);
  const baseline = buildTelegramPairRegimeStatsBucket();
  const accepted = buildTelegramPairRegimeStatsBucket();
  const published = buildTelegramPairRegimeStatsBucket();
  const rejected = buildTelegramPairRegimeStatsBucket();
  const sumWithinLimit = buildTelegramPairRegimeStatsBucket();
  const countsUnequal = buildTelegramPairRegimeStatsBucket();
  const collapseAccepted = buildTelegramPairRegimeStatsBucket();
  const strongSelectedStrengthException = buildTelegramPairRegimeStatsBucket();
  const selectedHistorySetShareException = buildTelegramPairRegimeStatsBucket();
  const relativeFormSetShareException = buildTelegramPairRegimeStatsBucket();
  const incompleteThreeMatchCollectionRejected = buildTelegramPairRegimeStatsBucket();
  const lowZ0ConfidenceRejected = buildTelegramPairRegimeStatsBucket();
  for (const candidate of cohort) {
    addTelegramPairRegimeStatsBucket(baseline, candidate);
    addTelegramPairRegimeStatsBucket(
      candidate.pairAccepted ? accepted : rejected,
      candidate
    );
    if (candidate.pairAccepted && candidate.sent) {
      addTelegramPairRegimeStatsBucket(published, candidate);
    }
    if (candidate.sumWithinLimit) addTelegramPairRegimeStatsBucket(sumWithinLimit, candidate);
    if (candidate.countsUnequal) addTelegramPairRegimeStatsBucket(countsUnequal, candidate);
    if (candidate.collapseAccepted) addTelegramPairRegimeStatsBucket(collapseAccepted, candidate);
    if (candidate.incompleteThreeMatchCollectionRejected) {
      addTelegramPairRegimeStatsBucket(incompleteThreeMatchCollectionRejected, candidate);
    }
    if (candidate.lowZ0ConfidenceRejected) {
      addTelegramPairRegimeStatsBucket(lowZ0ConfidenceRejected, candidate);
    }
    if (!candidate.collapseAccepted && candidate.strongSelectedStrengthException) {
      addTelegramPairRegimeStatsBucket(strongSelectedStrengthException, candidate);
    }
    if (
      !candidate.collapseAccepted
      && !candidate.strongSelectedStrengthException
      && candidate.selectedHistorySetShareException
    ) {
      addTelegramPairRegimeStatsBucket(selectedHistorySetShareException, candidate);
    }
    if (
      !candidate.collapseAccepted
      && !candidate.strongSelectedStrengthException
      && !candidate.selectedHistorySetShareException
      && candidate.relativeFormSetShareException
    ) {
      addTelegramPairRegimeStatsBucket(relativeFormSetShareException, candidate);
    }
  }
  for (const bucket of [
    baseline,
    accepted,
    published,
    rejected,
    sumWithinLimit,
    countsUnequal,
    collapseAccepted,
    strongSelectedStrengthException,
    selectedHistorySetShareException,
    relativeFormSetShareException,
    incompleteThreeMatchCollectionRejected,
    lowZ0ConfidenceRejected
  ]) {
    finishTelegramPairRegimeStatsBucket(bucket, cohort.length);
  }

  const cohortLocked = candidates.length >= targetEligible;
  const status = cohortLocked && baseline.settled === targetEligible
    ? "complete"
    : baseline.settled >= minimumReviewSettled
      ? "interim-review-only"
      : cohortLocked
        ? "awaiting-final-settlement"
        : "collecting";
  return {
    protocolId: protocol.id || TELEGRAM_START_PAIR_REGIME_PROTOCOL_ID,
    gateId: protocol.gateId || TELEGRAM_START_PAIR_REGIME_PRODUCTION_GATE_ID,
    registeredAt: normalizeTelegramText(protocol.registeredAt || "2026-07-28T00:00:00Z"),
    leagueScope,
    targetEligible,
    targetCohortSize: targetEligible,
    minimumReviewSettled,
    status,
    observedTaggedRows,
    validEligibleRows: candidates.length,
    ineligibleTaggedRows,
    invalidTaggedRows,
    invalidReasonCounts,
    cohortLocked,
    cohortSize: cohort.length,
    overflowEligibleRows: Math.max(0, candidates.length - cohort.length),
    baseline,
    accepted,
    published,
    rejected,
    sumWithinLimit,
    countsUnequal,
    collapseAccepted,
    strongSelectedStrengthException,
    selectedHistorySetShareException,
    relativeFormSetShareException,
    incompleteThreeMatchCollectionRejected,
    lowZ0ConfidenceRejected
  };
}

function parseTelegramStartPairRegimeRow(row) {
  const prematch = row && (row.prematchSnapshot || row.prematch);
  if (!prematch || typeof prematch !== "object") return null;
  const features = {
    ...(prematch.audit && prematch.audit.decision && prematch.audit.decision.features || {}),
    ...(prematch.features || {})
  };
  const storedProtocolId = readTelegramPrematchFeatureText(features.startMatchPairRegimeProtocolId);
  const storedGateId = readTelegramPrematchFeatureText(features.startMatchProductionGateId);
  if (
    storedProtocolId !== TELEGRAM_START_PAIR_REGIME_PROTOCOL_ID
    || storedGateId !== TELEGRAM_START_PAIR_REGIME_PRODUCTION_GATE_ID
  ) {
    return null;
  }

  const leagueName = readTelegramPrematchFeatureText(
    prematch.leagueName,
    features.leagueName,
    row && row.leagueName,
    prematch.audit && prematch.audit.league && prematch.audit.league.name
  );
  const leagueMode = readTelegramPrematchFeatureText(features.startMatchLeagueMode);
  const base = {
    eligible: false,
    valid: false,
    reason: "",
    matchUrl: normalizeTelegramMatchKey(row && row.matchUrl || prematch.matchUrl || ""),
    decisionAt: getTelegramPrematchDecisionAt(prematch, row),
    sent: prematch.sent === true || prematch.sent === 1,
    resultStatus: getTelegramStatsPrematchResultStatus(row, prematch),
    leagueName,
    leagueMode,
    pairAccepted: false,
    sumWithinLimit: false,
    countsUnequal: false,
    collapseAccepted: false,
    strongSelectedStrengthException: false,
    selectedHistorySetShareException: false,
    relativeFormSetShareException: false,
    qualityAccepted: false,
    incompleteThreeMatchCollectionRejected: false,
    lowZ0ConfidenceRejected: false
  };
  if (!["production", "tt-cup-shadow"].includes(leagueMode)) {
    return { ...base, reason: "pair-regime-league-mode-invalid" };
  }
  if (!base.matchUrl || !(base.decisionAt > 0)) {
    return { ...base, reason: "pair-regime-order-key-missing" };
  }
  if (!isTelegramResearchDecisionBeforeSettlement(base.decisionAt, row)) {
    return { ...base, reason: "pair-regime-decision-not-before-settlement" };
  }

  const startApi = globalThis.LvrStartMatchRule;
  const pairApi = globalThis.LvrVerifiedPairRegimeV1;
  const profiles = features.startMatchProfiles;
  const players = Array.isArray(prematch.players)
    ? prematch.players.slice(0, 2).map(normalizeTelegramText)
    : [];
  if (
    !startApi
    || typeof startApi.evaluate !== "function"
    || !pairApi
    || typeof pairApi.evaluate !== "function"
    || !Array.isArray(profiles)
    || profiles.length !== 2
    || players.length !== 2
  ) {
    return { ...base, reason: "pair-regime-profiles-missing" };
  }
  const evaluation = startApi.evaluate({ profiles, players });
  const pairRegime = pairApi.evaluate({
    profiles,
    selectedSideIndex: evaluation.sideIndex,
    pointWindowSize: evaluation.pointWindowSize,
    relativeAgreementScore: evaluation.sideCorrection && evaluation.sideCorrection.agreementScore,
    latestPbpReversal: evaluation.sideCorrection && evaluation.sideCorrection.latestReversal,
    leagueName,
    moneylineMarket: prematch.referenceMoneylineMarket || null,
    decisionAt: base.decisionAt,
    z0Score: evaluation.z0Score
  });
  const decisionInputHash = pairRegime.inputHash;
  const expectedSide = pairRegime.selectedSideIndex;
  base.eligible = pairRegime.dataReady === true;
  base.pairAccepted = pairRegime.qualityAccepted === true
    && (
      pairRegime.moderateAccepted === true
      || pairRegime.marketSalvageAccepted === true
    );
  base.signalMode = pairRegime.signalMode;
  base.sumWithinLimit = pairRegime.sumWithinLimit === true;
  base.countsUnequal = pairRegime.countsUnequal === true;
  base.collapseAccepted = pairRegime.collapseAccepted === true;
  base.strongSelectedStrengthException = pairRegime.strongSelectedStrengthException === true;
  base.selectedHistorySetShareException = pairRegime.selectedHistorySetShareException === true;
  base.relativeFormSetShareException = pairRegime.relativeFormSetShareException === true;
  base.qualityAccepted = pairRegime.qualityAccepted === true;
  base.incompleteThreeMatchCollectionRejected = pairRegime.incompleteThreeMatchCollectionRejected === true;
  base.lowZ0ConfidenceRejected = pairRegime.lowZ0ConfidenceRejected === true;
  const expectedMode = pairRegime.shadowOnly ? "tt-cup-shadow" : "production";
  const storedSide = sanitizeCalibrationSideIndex(prematch.sideIndex);
  const decisionAction = readTelegramPrematchFeatureText(
    prematch.decisionAction,
    prematch.action
  ).toLowerCase();
  const expectedAction = leagueMode === "production" && pairRegime.accepted
    ? "forecast"
    : "pass";
  const valid = Boolean(
    evaluation.eligible
    && expectedMode === leagueMode
    && storedSide === expectedSide
    && readTelegramPrematchFeatureNumber(features.startMatchSelectedSideIndex) === expectedSide
    && readTelegramPrematchFeatureNumber(features.startMatchHistorySelectedSideIndex)
      === evaluation.sideIndex
    && readTelegramPrematchFeatureNumber(features.startMatchBaseSelectedSideIndex)
      === evaluation.sideIndex
    && areTelegramNamesSame(prematch.playerName, players[expectedSide] || "")
    && readTelegramPrematchFeatureText(features.startMatchInputHash) === evaluation.inputHash
    && readTelegramPrematchFeatureText(features.startMatchDecisionInputHash)
      === decisionInputHash
    && readTelegramPrematchFeatureText(features.startMatchFormulaId) === evaluation.formulaId
    && storedProtocolId === pairRegime.protocolId
    && readTelegramPrematchFeatureText(features.startMatchPairRegimeGateId) === pairRegime.gateId
    && readTelegramPrematchFeatureText(features.startMatchPairRegimeSelectorFormulaId)
      === pairRegime.selectorFormulaId
    && readTelegramPrematchFeatureText(features.startMatchPairRegimeInputHash)
      === pairRegime.inputHash
    && readTelegramPrematchFeatureText(features.startMatchPairRegimeLeagueClass)
      === pairRegime.leagueClass
    && readTelegramPrematchFeatureText(features.startMatchPairRegimeReason)
      === pairRegime.reason
    && readTelegramPrematchFeatureNumber(features.startMatchPairRegimeSelectedSideIndex)
      === pairRegime.selectedSideIndex
    && readTelegramPrematchFeatureNumber(features.startMatchPairRegimeBaseSelectedSideIndex)
      === pairRegime.baseSelectedSideIndex
    && telegramPairRegimeMarketFeaturesMatch(
      features,
      {},
      prematch.referenceMoneylineMarket || null,
      pairRegime,
      base.decisionAt
    )
    && readTelegramPrematchFeatureNumber(features.startMatchPairRegimePointWindowSize)
      === pairRegime.pointWindowSize
    && readTelegramPrematchFeatureNumber(features.startMatchPairRegimeDataReady)
      === (pairRegime.dataReady ? 1 : 0)
    && readTelegramPrematchFeatureNumber(features.startMatchPairRegimeEligible)
      === (pairRegime.eligible ? 1 : 0)
    && readTelegramPrematchFeatureNumber(features.startMatchPairRegimeFormulaAccepted)
      === (pairRegime.formulaAccepted ? 1 : 0)
    && readTelegramPrematchFeatureNumber(features.startMatchPairRegimeModerateAccepted)
      === (pairRegime.moderateAccepted ? 1 : 0)
    && readTelegramPrematchFeatureNumber(features.startMatchPairRegimeQualityInputsReady)
      === (pairRegime.qualityInputsReady ? 1 : 0)
    && telegramPairRegimeOptionalNumbersEqual(
      readTelegramPrematchFeatureNumber(features.startMatchPairRegimeAbsoluteZ0Score),
      pairRegime.absoluteZ0Score
    )
    && readTelegramPrematchFeatureNumber(features.startMatchPairRegimePointCollectionComplete)
      === (pairRegime.pointCollectionComplete ? 1 : 0)
    && readTelegramPrematchFeatureNumber(features.startMatchPairRegimeIncompleteThreeMatchCollectionRejected)
      === (pairRegime.incompleteThreeMatchCollectionRejected ? 1 : 0)
    && readTelegramPrematchFeatureNumber(features.startMatchPairRegimeLowZ0ConfidenceRejected)
      === (pairRegime.lowZ0ConfidenceRejected ? 1 : 0)
    && readTelegramPrematchFeatureNumber(features.startMatchPairRegimeQualityAccepted)
      === (pairRegime.qualityAccepted ? 1 : 0)
    && readTelegramPrematchFeatureText(features.startMatchSignalMode) === pairRegime.signalMode
    && readTelegramPrematchFeatureNumber(features.startMatchPairRegimeAccepted)
      === (pairRegime.accepted ? 1 : 0)
    && telegramPairRegimeOptionalNumbersEqual(
      readTelegramPrematchFeatureNumber(features.startMatchPairRegimeLeftCollapseCount),
      pairRegime.leftCollapseCount
    )
    && telegramPairRegimeOptionalNumbersEqual(
      readTelegramPrematchFeatureNumber(features.startMatchPairRegimeRightCollapseCount),
      pairRegime.rightCollapseCount
    )
    && telegramPairRegimeOptionalNumbersEqual(
      readTelegramPrematchFeatureNumber(features.startMatchPairRegimeCollapseSum),
      pairRegime.collapseSum
    )
    && telegramPairRegimeOptionalNumbersEqual(
      readTelegramPrematchFeatureNumber(features.startMatchPairRegimeCollapseDifference),
      pairRegime.collapseDifference
    )
    && readTelegramPrematchFeatureNumber(features.startMatchPairRegimeSumWithinLimit)
      === (pairRegime.sumWithinLimit ? 1 : 0)
    && readTelegramPrematchFeatureNumber(features.startMatchPairRegimeCountsUnequal)
      === (pairRegime.countsUnequal ? 1 : 0)
    && readTelegramPrematchFeatureNumber(features.startMatchPairRegimeCollapseAccepted)
      === (pairRegime.collapseAccepted ? 1 : 0)
    && telegramPairRegimeOptionalNumbersEqual(
      readTelegramPrematchFeatureNumber(features.startMatchPairRegimeSelectedStrengthScore),
      pairRegime.selectedStrengthScore
    )
    && telegramPairRegimeOptionalNumbersEqual(
      readTelegramPrematchFeatureNumber(features.startMatchPairRegimeOpponentStrengthScore),
      pairRegime.opponentStrengthScore
    )
    && telegramPairRegimeOptionalNumbersEqual(
      readTelegramPrematchFeatureNumber(features.startMatchPairRegimeSelectedStrengthEdge),
      pairRegime.selectedStrengthEdge
    )
    && readTelegramPrematchFeatureNumber(features.startMatchPairRegimeStrongSelectedStrengthException)
      === (pairRegime.strongSelectedStrengthException ? 1 : 0)
    && telegramPairRegimeOptionalNumbersEqual(
      readTelegramPrematchFeatureNumber(features.startMatchPairRegimeSelectedHistoryMatches),
      pairRegime.selectedHistoryMatches
    )
    && telegramPairRegimeOptionalNumbersEqual(
      readTelegramPrematchFeatureNumber(features.startMatchPairRegimeSelectedHistoryWindowMatches),
      pairRegime.selectedHistoryWindowMatches
    )
    && telegramPairRegimeOptionalNumbersEqual(
      readTelegramPrematchFeatureNumber(features.startMatchPairRegimeSelectedHistorySetSharePct),
      pairRegime.selectedHistorySetSharePct
    )
    && readTelegramPrematchFeatureNumber(features.startMatchPairRegimeSelectedHistoryWindowReady)
      === (pairRegime.selectedHistoryWindowReady ? 1 : 0)
    && readTelegramPrematchFeatureNumber(features.startMatchPairRegimeSelectedHistorySetShareException)
      === (pairRegime.selectedHistorySetShareException ? 1 : 0)
    && telegramPairRegimeOptionalNumbersEqual(
      readTelegramPrematchFeatureNumber(features.startMatchPairRegimeSelectedFreshForm3Score),
      pairRegime.selectedFreshForm3Score
    )
    && telegramPairRegimeOptionalNumbersEqual(
      readTelegramPrematchFeatureNumber(features.startMatchPairRegimeOpponentFreshForm3Score),
      pairRegime.opponentFreshForm3Score
    )
    && telegramPairRegimeOptionalNumbersEqual(
      readTelegramPrematchFeatureNumber(features.startMatchPairRegimeSelectedHistory5WindowMatches),
      pairRegime.selectedHistory5WindowMatches
    )
    && telegramPairRegimeOptionalNumbersEqual(
      readTelegramPrematchFeatureNumber(features.startMatchPairRegimeOpponentHistory5WindowMatches),
      pairRegime.opponentHistory5WindowMatches
    )
    && telegramPairRegimeOptionalNumbersEqual(
      readTelegramPrematchFeatureNumber(features.startMatchPairRegimeSelectedHistory5SetSharePct),
      pairRegime.selectedHistory5SetSharePct
    )
    && telegramPairRegimeOptionalNumbersEqual(
      readTelegramPrematchFeatureNumber(features.startMatchPairRegimeOpponentHistory5SetSharePct),
      pairRegime.opponentHistory5SetSharePct
    )
    && telegramPairRegimeOptionalNumbersEqual(
      readTelegramPrematchFeatureNumber(features.startMatchPairRegimeSelectedHistory5SetShareEdge),
      pairRegime.selectedHistory5SetShareEdge
    )
    && telegramPairRegimeOptionalNumbersEqual(
      readTelegramPrematchFeatureNumber(features.startMatchPairRegimeSelectedHistory8PerformancePct),
      pairRegime.selectedHistory8PerformancePct
    )
    && telegramPairRegimeOptionalNumbersEqual(
      readTelegramPrematchFeatureNumber(features.startMatchPairRegimeOpponentHistory8PerformancePct),
      pairRegime.opponentHistory8PerformancePct
    )
    && readTelegramPrematchFeatureNumber(features.startMatchPairRegimeRelativeHistoryWindowReady)
      === (pairRegime.relativeHistoryWindowReady ? 1 : 0)
    && readTelegramPrematchFeatureNumber(features.startMatchPairRegimeSelectedFreshAtOrAboveHistory8)
      === (pairRegime.selectedFreshAtOrAboveHistory8 ? 1 : 0)
    && readTelegramPrematchFeatureNumber(features.startMatchPairRegimeOpponentFreshAtOrAboveHistory8)
      === (pairRegime.opponentFreshAtOrAboveHistory8 ? 1 : 0)
    && readTelegramPrematchFeatureNumber(features.startMatchPairRegimeRelativeFormSetShareException)
      === (pairRegime.relativeFormSetShareException ? 1 : 0)
    && storedGateId === TELEGRAM_START_PAIR_REGIME_PRODUCTION_GATE_ID
    && readTelegramPrematchFeatureNumber(features.startMatchProductionAccepted)
      === (leagueMode === "production" && pairRegime.accepted ? 1 : 0)
    && readTelegramPrematchFeatureNumber(features.startMatchLeaguePublishAccepted)
      === (leagueMode === "production" && pairRegime.accepted ? 1 : 0)
    && normalizeTelegramText(prematch.oddsMeaning || "").toLowerCase()
      === "optional-prematch-market-consensus"
    && readTelegramPrematchFeatureNumber(features.startMatchUsesOdds)
      === (pairRegime.marketReady ? 1 : 0)
    && readTelegramPrematchFeatureNumber(features.startMatchUsesCurrentScore) === 0
    && decisionAction === expectedAction
    && (!base.sent || expectedAction === "forecast")
  );
  return valid
    ? { ...base, valid: true }
    : { ...base, reason: "pair-regime-recalculation-mismatch" };
}

function getTelegramStatsPrematchRuleId(prematch) {
  const features = {
    ...(prematch && prematch.audit && prematch.audit.decision
      && prematch.audit.decision.features || {}),
    ...(prematch && prematch.features || {})
  };
  return readTelegramPrematchFeatureText(
    prematch && prematch.coverageRuleId,
    prematch && prematch.modelVersion,
    features.startMatchRuleId
  );
}

function isCompatibleProductionStartStatsPrematch(prematch, row = null) {
  if (!prematch || !TELEGRAM_STATS_COMPATIBLE_START_RULE_IDS.has(
    getTelegramStatsPrematchRuleId(prematch)
  )) {
    return false;
  }
  const features = {
    ...(prematch.audit && prematch.audit.decision
      && prematch.audit.decision.features || {}),
    ...(prematch.features || {})
  };
  const action = readTelegramPrematchFeatureText(
    prematch.decisionAction,
    prematch.action,
    prematch.decisionLabel
  ).toLowerCase();
  const protocolId = readTelegramPrematchFeatureText(
    features.startMatchPairRegimeProtocolId
  );
  const leagueName = readTelegramPrematchFeatureText(
    prematch.leagueName,
    features.leagueName,
    row && row.leagueName,
    prematch.audit && prematch.audit.league && prematch.audit.league.name
  );
  const decisionAt = getTelegramPrematchDecisionAt(prematch, row);
  return ["forecast", "sent", "pass", "skip", "ставим", "пропуск"].includes(action)
    && TELEGRAM_STATS_COMPATIBLE_PAIR_PROTOCOL_IDS.has(protocolId)
    && readTelegramPrematchFeatureText(features.startMatchLeagueMode) === "production"
    && isTelegramPrematchProductionLeagueName(leagueName)
    && readTelegramPrematchFeatureNumber(features.startMatchPairRegimeDataReady) === 1
    && decisionAt > 0
    && isTelegramResearchDecisionBeforeSettlement(decisionAt, row);
}

function calculateTelegramWilsonLowerBound(wins, total, z = 1.96) {
  const count = Number(total);
  if (!Number.isFinite(count) || count <= 0) {
    return 0;
  }
  const probability = Math.max(0, Math.min(1, Number(wins || 0) / count));
  const zSquared = z * z;
  const denominator = 1 + zSquared / count;
  const center = probability + zSquared / (2 * count);
  const margin = z * Math.sqrt(
    probability * (1 - probability) / count
    + zSquared / (4 * count * count)
  );
  return Math.max(0, (center - margin) / denominator);
}

function compareTelegramPairRegimeDecisionOrder(left, right) {
  return Number(left && left.decisionAt || 0) - Number(right && right.decisionAt || 0)
    || normalizeTelegramText(left && left.matchUrl || "")
      .localeCompare(normalizeTelegramText(right && right.matchUrl || ""));
}

function buildTelegramPairRegimeStatsBucket() {
  return {
    selected: 0,
    sent: 0,
    pending: 0,
    settled: 0,
    wins: 0,
    losses: 0,
    hit: "0/0",
    hitRatePct: "",
    coveragePct: "",
    settledCoveragePct: "",
    deliveryPct: "",
    wilsonLowerPct: ""
  };
}

function addTelegramPairRegimeStatsBucket(bucket, candidate) {
  bucket.selected += 1;
  if (candidate.sent) {
    bucket.sent += 1;
  }
  if (candidate.resultStatus === "hit" || candidate.resultStatus === "miss") {
    bucket.settled += 1;
    if (candidate.resultStatus === "hit") {
      bucket.wins += 1;
    } else {
      bucket.losses += 1;
    }
  } else {
    bucket.pending += 1;
  }
}

function finishTelegramPairRegimeStatsBucket(bucket, cohortSize) {
  const denominator = Math.max(0, Number(cohortSize || 0));
  bucket.hit = `${bucket.wins}/${bucket.settled}`;
  bucket.hitRatePct = bucket.settled
    ? roundTelegramStatsPct((bucket.wins / bucket.settled) * 100)
    : "";
  bucket.coveragePct = denominator
    ? roundTelegramStatsPct((bucket.selected / denominator) * 100)
    : "";
  bucket.settledCoveragePct = denominator
    ? roundTelegramStatsPct((bucket.settled / denominator) * 100)
    : "";
  bucket.deliveryPct = bucket.selected
    ? roundTelegramStatsPct((bucket.sent / bucket.selected) * 100)
    : "";
  bucket.wilsonLowerPct = bucket.settled
    ? roundTelegramStatsPct(calculateTelegramWilsonLowerBound(bucket.wins, bucket.settled) * 100)
    : "";
}

function buildTelegramStatsBucket() {
  return {
    signals: 0,
    sent: 0,
    bet: 0,
    skip: 0,
    skipSettled: 0,
    skipPending: 0,
    falseSkips: 0,
    correctSkips: 0,
    falseSkipRatePct: "",
    settled: 0,
    wins: 0,
    losses: 0,
    hit: "0/0",
    hitRatePct: "",
    coveragePct: "",
    wilsonLowerPct: ""
  };
}

function addTelegramStatsDecision(bucket, decision, resultStatus, sent) {
  const normalized = normalizeTelegramText(decision || "").toLowerCase();
  const isBet = normalized === "ставим" || normalized === "bet" || normalized === "sent" || normalized === "forecast";
  const isSkip = normalized === "пропуск" || normalized === "skip";
  if (!isBet && !isSkip) {
    return;
  }
  bucket.signals += 1;
  if (sent === true || sent === 1) {
    bucket.sent += 1;
  }
  if (isBet) {
    bucket.bet += 1;
    if (resultStatus === "hit" || resultStatus === "miss") {
      bucket.settled += 1;
      if (resultStatus === "hit") {
        bucket.wins += 1;
      } else {
        bucket.losses += 1;
      }
    }
  } else {
    bucket.skip += 1;
    if (resultStatus === "hit" || resultStatus === "miss") {
      bucket.skipSettled += 1;
      if (resultStatus === "hit") {
        bucket.falseSkips += 1;
      } else {
        bucket.correctSkips += 1;
      }
    } else {
      bucket.skipPending += 1;
    }
  }
}

function finishTelegramStatsBucket(bucket) {
  bucket.hit = `${bucket.wins}/${bucket.settled}`;
  bucket.hitRatePct = bucket.settled ? roundTelegramStatsPct((bucket.wins / bucket.settled) * 100) : "";
  bucket.coveragePct = bucket.signals ? roundTelegramStatsPct((bucket.bet / bucket.signals) * 100) : "";
  bucket.wilsonLowerPct = bucket.settled
    ? roundTelegramStatsPct(calculateTelegramWilsonLowerBound(bucket.wins, bucket.settled) * 100)
    : "";
  bucket.falseSkipRatePct = bucket.skipSettled
    ? roundTelegramStatsPct((bucket.falseSkips / bucket.skipSettled) * 100)
    : "";
}

function getTelegramStatsResultStatus(row) {
  const result = getTelegramPredictionDatasetResult(row);
  return normalizeTelegramText(row && (row.resultStatus || result && result.status) || "");
}

function getTelegramPrematchDecisionAt(prematch, row = null) {
  const explicit = Number(
    prematch && prematch.finalDecisionAt
    || prematch && prematch.audit && prematch.audit.decision
      && prematch.audit.decision.finalDecisionAt
    || 0
  );
  if (explicit > 0) return explicit;
  return Math.max(
    Number(prematch && prematch.readyAt || 0),
    Number(prematch && prematch.deliveryObservedAt || 0),
    Number(prematch && prematch.deliveryEntryState && prematch.deliveryEntryState.capturedAt || 0),
    Number(prematch && prematch.ts || 0),
    Number(prematch && prematch.requestedAt || 0),
    Number(row && row.createdAt || 0)
  );
}

function getTelegramPredictionSettledAt(row) {
  const result = getTelegramPredictionDatasetResult(row) || {};
  return Number(
    row && row.settledAt
    || result.settledAt
    || 0
  );
}

function isTelegramResearchDecisionBeforeSettlement(decisionAt, row) {
  const settledAt = getTelegramPredictionSettledAt(row);
  return !(settledAt > 0) || Number(decisionAt || 0) < settledAt;
}

function getTelegramStatsPrematchResultStatus(row, prematch) {
  const sideIndex = sanitizeCalibrationSideIndex(prematch && prematch.sideIndex);
  const result = getTelegramPredictionDatasetResult(row) || {};
  const finalScore = parseTelegramFinalScore(
    result.finalScore || row && (row.finalScore || row.actualScore) || ""
  );
  if (sideIndex === null || !finalScore) {
    return getTelegramStatsResultStatus(row);
  }
  const ownSets = sideIndex === 0 ? finalScore.left : finalScore.right;
  return ownSets >= 2 ? "hit" : "miss";
}

function formatTelegramStatsMessage(summary) {
  const safe = summary && typeof summary === "object" ? summary : {};
  const production = safe.sentProductionStart || buildTelegramStatsBucket();
  const productionPair = safe.pairRegimeForward || null;
  const ttCupPair = safe.pairRegimeTtCupShadow || null;
  const lines = [
    "📌 <b>Статистика прогнозов</b>",
    `Обновлено: ${escapeTelegramHtml(formatTelegramStatsTime(safe.updatedAt))}`,
    "",
    ...formatTelegramSimpleProductionLines(
      production,
      productionPair,
      safe.latestProductionDecision,
      safe.collectorHealth
    )
  ];
  const ttCupLines = formatTelegramSimplePairLines(ttCupPair);
  if (ttCupLines.length) {
    lines.push("", ...ttCupLines);
  }
  return lines.join("\n");
}

function formatTelegramSimpleProductionLines(bucket, pairSummary, latestDecision = null, collectorHealth = null) {
  const safe = bucket && typeof bucket === "object" ? bucket : buildTelegramStatsBucket();
  const pair = pairSummary && typeof pairSummary === "object" ? pairSummary : {};
  const published = Math.max(0, Number(safe.bet || 0));
  const total = Math.max(
    published,
    Number(pair.validEligibleRows || 0),
    Number(safe.signals || 0)
  );
  const settled = Math.max(0, Number(safe.settled || 0));
  const wins = Math.max(0, Number(safe.wins || 0));
  const losses = Math.max(0, Number(safe.losses || 0));
  const pending = Math.max(0, published - settled);
  const rejected = Math.max(0, total - published);
  const coveragePct = total
    ? roundTelegramStatsPct((published / total) * 100)
    : 0;
  const latestAt = Number(latestDecision && latestDecision.decisionAt || 0);
  const latestLine = latestAt > 0
    ? `🕒 Последняя обработка: <b>${escapeTelegramHtml(formatTelegramStatsTime(latestAt))}</b> · ${latestDecision.sent ? "сигнал отправлен" : "матч отброшен"}`
    : "🕒 Последняя обработка: <b>ещё не было</b>";
  const collectorLine = collectorHealth && normalizeTelegramText(collectorHealth.text || "")
    ? escapeTelegramHtml(collectorHealth.text)
    : "⚠️ Сбор: состояние пока неизвестно";
  return [
    "🏆 <b>Кубок Сетки + Чехия</b>",
    `⚙️ Обработано: <b>${formatTelegramStatsMetric(total)}</b> · отправлено: <b>${formatTelegramStatsMetric(published)}</b> · отброшено: <b>${formatTelegramStatsMetric(rejected)}</b>`,
    latestLine,
    collectorLine,
    `Сигналы: <b>${formatTelegramStatsMetric(published)}</b> из ${formatTelegramStatsMetric(total)} матчей (${formatTelegramStatsMetric(coveragePct)}%)`,
    `✅ Победы: <b>${formatTelegramStatsMetric(wins)}</b> · ❌ Поражения: <b>${formatTelegramStatsMetric(losses)}</b> · ⏳ Ожидают: <b>${formatTelegramStatsMetric(pending)}</b>`,
    `🎯 Проходимость: <b>${formatTelegramSimpleHitRate(wins, settled, safe.hitRatePct)}</b>`
  ];
}

function formatTelegramSimplePairLines(summary) {
  const safe = summary && typeof summary === "object" ? summary : null;
  if (!safe || Number(safe.observedTaggedRows || 0) === 0) return [];
  const accepted = safe.accepted || buildTelegramPairRegimeStatsBucket();
  const total = Math.max(0, Number(safe.cohortSize || 0));
  const selected = Math.max(0, Number(accepted.selected || 0));
  const settled = Math.max(0, Number(accepted.settled || 0));
  const wins = Math.max(0, Number(accepted.wins || 0));
  const losses = Math.max(0, Number(accepted.losses || 0));
  const pending = Math.max(0, selected - settled);
  const coveragePct = total
    ? roundTelegramStatsPct((selected / total) * 100)
    : 0;
  return [
    "🧪 <b>TT Cup · без отправки</b>",
    `Отобрано: <b>${formatTelegramStatsMetric(selected)}</b> из ${formatTelegramStatsMetric(total)} матчей (${formatTelegramStatsMetric(coveragePct)}%)`,
    `✅ Победы: <b>${formatTelegramStatsMetric(wins)}</b> · ❌ Поражения: <b>${formatTelegramStatsMetric(losses)}</b> · ⏳ Ожидают: <b>${formatTelegramStatsMetric(pending)}</b>`,
    `🎯 Проходимость: <b>${formatTelegramSimpleHitRate(wins, settled, accepted.hitRatePct)}</b>`
  ];
}

function formatTelegramSimpleHitRate(wins, settled, hitRatePct) {
  return Number(settled || 0) > 0
    ? `${formatTelegramStatsMetric(wins)}/${formatTelegramStatsMetric(settled)} (${formatTelegramStatsMetric(hitRatePct)}%)`
    : "пока нет результатов";
}

function formatTelegramStatsMetric(value, fallback = 0) {
  const safe = value === null || value === undefined || value === "" ? fallback : value;
  return escapeTelegramHtml(String(safe));
}

function formatTelegramStatsTime(value) {
  const date = new Date(Number(value || 0) || Date.now());
  const pad = (item) => String(item).padStart(2, "0");
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function roundTelegramStatsPct(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.round(number * 10) / 10 : "";
}

function sanitizeTelegramMessageRef(value) {
  const source = value && typeof value === "object" ? value : {};
  const chatId = normalizeTelegramText(source.chatId !== undefined ? source.chatId : source.chat_id);
  const messageId = Number(source.messageId !== undefined ? source.messageId : source.message_id);
  if (!chatId || !Number.isFinite(messageId) || messageId <= 0) {
    return null;
  }
  return {
    chatId,
    messageId
  };
}

function sanitizeTelegramMessageRefs(value) {
  return (Array.isArray(value) ? value : [])
    .map(sanitizeTelegramMessageRef)
    .filter(Boolean);
}

function mutateTelegramPredictionMessageRefs(mutator) {
  const operation = telegramMessageRefsMutationChain
    .catch(() => {})
    .then(async () => {
      const refs = await getTelegramPredictionMessageRefs();
      const result = await mutator(refs);
      await chrome.storage.local.set({
        [TELEGRAM_MESSAGE_REFS_KEY]: pruneTelegramPredictionMessageRefs(refs)
      });
      return result;
    });
  telegramMessageRefsMutationChain = operation.then(() => undefined, () => undefined);
  return operation;
}

async function saveTelegramPredictionMessageRef(deliveryKey, matchUrl, prediction, text, messages, options = {}) {
  return mutateTelegramPredictionMessageRefs(async (refs) => {
  const players = Array.isArray(prediction && prediction.players)
    ? prediction.players.slice(0, 2).map(normalizeTelegramText).filter(Boolean)
    : [];
  const sideIndex = getTelegramPredictionSideIndex(
    prediction,
    players,
    normalizeTelegramText(prediction && prediction.playerName || "")
  );
  const features = prediction && prediction.features && typeof prediction.features === "object" ? prediction.features : {};
  const noMarketCoverage = prediction && prediction.noMarketCoverage === true || Number(features.noMarketCoverage) === 1;
  const oddsMeaning = normalizeTelegramText(prediction && prediction.oddsMeaning || "");
  const hideMarketOdds = noMarketCoverage || oddsMeaning.toLowerCase() === "none";
  const moneylineMarket = prediction && prediction.moneylineMarket && typeof prediction.moneylineMarket === "object"
    ? prediction.moneylineMarket
    : {};
  const referenceMoneylineMarket = getTelegramReferenceMoneylineMarket(prediction);
  const hasReferenceMoneyline = Boolean(referenceMoneylineMarket);
  refs[deliveryKey] = {
    ts: Date.now(),
    source: normalizeTelegramText(options.source || "prematch"),
    settingsKind: normalizeTelegramText(options.settingsKind || "prematch"),
    matchUrl: normalizeTelegramMatchKey(matchUrl),
    text: normalizeTelegramMessageText(text),
    playerName: normalizeTelegramText(prediction && prediction.playerName || ""),
    sideIndex: sideIndex === 0 || sideIndex === 1 ? sideIndex : null,
    probability: normalizeTelegramPercentScore(prediction && (prediction.decisionScore ?? prediction.probability ?? prediction.modelProbability)),
    players,
    playerIds: getTelegramDatasetRecordPlayerIds(prediction),
    playerOdds: hideMarketOdds ? null : finiteAuditNumber(prediction && prediction.playerOdds),
    opponentOdds: hideMarketOdds ? null : finiteAuditNumber(prediction && prediction.opponentOdds),
    leftOdds: hasReferenceMoneyline
      ? referenceMoneylineMarket.leftOdds
      : hideMarketOdds ? null : finiteAuditNumber(prediction && prediction.leftOdds) || finiteAuditNumber(moneylineMarket.leftOdds),
    rightOdds: hasReferenceMoneyline
      ? referenceMoneylineMarket.rightOdds
      : hideMarketOdds ? null : finiteAuditNumber(prediction && prediction.rightOdds) || finiteAuditNumber(moneylineMarket.rightOdds),
    moneylineOdds: getTelegramMoneylineOdds(prediction) || null,
    referenceMoneylineMarket: compactCalibrationValue(referenceMoneylineMarket, 3),
    noMarketCoverage,
    oddsMeaning,
    referenceOddsMeaning: normalizeTelegramText(prediction && prediction.referenceOddsMeaning || ""),
    prematchAccepted: typeof options.accepted === "boolean" ? options.accepted : null,
    gateReason: normalizeTelegramText(options.gateReason || ""),
    coverageRuleId: normalizeTelegramText(prediction && prediction.coverageRuleId || features.simpleNoOddsCoverageRuleId || ""),
    signalMode: readTelegramPrematchFeatureText(
      prediction && prediction.signalMode,
      features.startMatchSignalMode
    ),
    prematchOpeningMoneylineVerified: normalizeTelegramText(moneylineMarket.status || "").toLowerCase() === "ready"
      && normalizeTelegramText(moneylineMarket.marketType || "").toLowerCase() === "matchresult"
      && normalizeTelegramText(moneylineMarket.quoteSource || "").toLowerCase() === "opening"
      && finiteAuditNumber(moneylineMarket.leftOdds) > 1
      && finiteAuditNumber(moneylineMarket.rightOdds) > 1,
    leftFreshForm3Score: prediction && prediction.leftFreshForm3Score !== null && prediction.leftFreshForm3Score !== undefined && prediction.leftFreshForm3Score !== ""
      ? finiteAuditNumber(prediction.leftFreshForm3Score)
      : null,
    rightFreshForm3Score: prediction && prediction.rightFreshForm3Score !== null && prediction.rightFreshForm3Score !== undefined && prediction.rightFreshForm3Score !== ""
      ? finiteAuditNumber(prediction.rightFreshForm3Score)
      : null,
    leftStrengthScore: prediction && prediction.leftStrengthScore !== null && prediction.leftStrengthScore !== undefined && prediction.leftStrengthScore !== ""
      ? finiteAuditNumber(prediction.leftStrengthScore)
      : null,
    rightStrengthScore: prediction && prediction.rightStrengthScore !== null && prediction.rightStrengthScore !== undefined && prediction.rightStrengthScore !== ""
      ? finiteAuditNumber(prediction.rightStrengthScore)
      : null,
    messages: (Array.isArray(messages) ? messages : []).map(sanitizeTelegramMessageRef).filter(Boolean),
    finalScore: "",
    resultStatus: "",
    editedAt: 0
  };
    return refs[deliveryKey];
  });
}

async function repairTelegramPredictionMoneylineLabel(deliveryKey, settings) {
  return mutateTelegramPredictionMessageRefs(async (refs) => {
  const ref = refs[deliveryKey];
  if (!ref) {
    return { edited: false, reason: "message-ref-missing" };
  }
  const currentText = normalizeTelegramMessageText(ref.text || "");
  const repairedText = currentText
    .split("\n")
    .filter((line) => !isTelegramPredictionTechnicalMetricLine(line))
    .map(normalizeTelegramMoneylineOddsLabel)
    .join("\n");
  if (!currentText || repairedText === currentText) {
    return { edited: false, reason: "label-current" };
  }
  const messages = sanitizeTelegramMessageRefs(ref.messages);
  if (!messages.length) {
    return { edited: false, reason: "telegram-message-missing" };
  }

  let edited = 0;
  const errors = [];
  for (const message of messages) {
    const response = await editTelegramMessageText(repairedText, settings, message);
    if (response.edited) {
      edited += 1;
    } else {
      errors.push(response.reason || "edit-failed");
    }
  }
  if (edited > 0) {
    refs[deliveryKey] = {
      ...ref,
      text: repairedText,
      editedAt: Date.now()
    };
  }
  return {
    edited: edited > 0,
    messages: edited,
    errors
  };
  });
}

function updateTelegramPredictionResult(result) {
  const task = telegramPredictionResultUpdateChain
    .catch(() => {})
    .then(() => updateTelegramPredictionResultNow(result));
  telegramPredictionResultUpdateChain = task.catch(() => {});
  return task;
}

async function updateTelegramPredictionResultNow(result) {
  const matchUrl = normalizeTelegramMatchKey(result && result.matchUrl || "");
  const finalScore = normalizeTelegramFinalScore(result && result.finalScore || "");
  if (!matchUrl || !finalScore) {
    return { edited: false, reason: "missing-match-url-or-score" };
  }

  return mutateTelegramPredictionMessageRefs(async (refs) => {
  let matching = Object.entries(refs)
    .filter(([, ref]) => ref && isSameTelegramMatch(ref.matchUrl, matchUrl));
  if (!matching.length) {
    matching = await getTelegramPredictionMessageRefsFromDataset(matchUrl);
  }
  if (!matching.length) {
    const datasetOutcome = await updateTelegramPredictionDatasetResult(matchUrl, finalScore, result || {});
    const datasetRecord = datasetOutcome && datasetOutcome.record;
    const statsMessage = datasetOutcome && datasetOutcome.changed && datasetOutcome.resolved
      ? scheduleTelegramStatsRefresh("result-recorded", {
        createMissing: true,
        force: true
      })
      : null;
    return {
      edited: false,
      reason: datasetRecord ? "dataset-only" : "irrelevant-match",
      terminal: !datasetRecord,
      matchUrl,
      finalScore,
      datasetRecorded: Boolean(datasetRecord),
      datasetChanged: Boolean(datasetOutcome && datasetOutcome.changed),
      datasetResolved: Boolean(datasetOutcome && datasetOutcome.resolved),
      statsMessage
    };
  }

  const fallbackRef = matching.map(([, ref]) => ref).find(Boolean) || {};
  const resultPlayers = Array.isArray(result && result.players)
    ? result.players.slice(0, 2).map(normalizeTelegramText).filter(Boolean)
    : [];
  const fallbackPlayers = Array.isArray(fallbackRef && fallbackRef.players)
    ? fallbackRef.players.slice(0, 2).map(normalizeTelegramText).filter(Boolean)
    : [];
  const datasetResult = {
    ...(result || {}),
    matchUrl,
    finalScore,
    players: resultPlayers.length ? resultPlayers : fallbackPlayers,
    recordPlayers: fallbackPlayers,
    recordPlayerIds: Array.isArray(fallbackRef && fallbackRef.playerIds)
      ? fallbackRef.playerIds.slice(0, 2).map(normalizeTelegramText)
      : [],
    playerName: normalizeTelegramText(fallbackRef && fallbackRef.playerName || result && result.playerName || ""),
    sideIndex: sanitizeCalibrationSideIndex(fallbackRef && fallbackRef.sideIndex) !== null
      ? fallbackRef.sideIndex
      : result && result.sideIndex,
    createDatasetIfMissing: true
  };
  const datasetOutcome = await updateTelegramPredictionDatasetResult(matchUrl, finalScore, datasetResult);
  const datasetRecord = datasetOutcome && datasetOutcome.record;
  const shouldUpdateStats = Boolean(
    datasetOutcome
    && datasetOutcome.changed
    && datasetOutcome.resolved
  );
  const statsMessage = shouldUpdateStats
    ? scheduleTelegramStatsRefresh("result-updated", {
      createMissing: true,
      force: true
    })
    : null;

  let edited = 0;
  let alreadyUpdated = 0;
  const errors = [];
  const settings = await getTelegramSettings();
  for (const [key, ref] of matching) {
    const hydratedRef = hydrateTelegramPredictionRefOpeningOdds(ref, datasetRecord);
    const resultInfo = buildTelegramPredictionResultInfo(hydratedRef, finalScore, result || {});
    const existingResolved = isResolvedTelegramPredictionMessageRef(hydratedRef);
    const incomingResolved = isResolvedTelegramPredictionResultInfo(resultInfo);
    if (existingResolved && !incomingResolved) {
      alreadyUpdated += 1;
      continue;
    }
    if (
      existingResolved
      && incomingResolved
      && (
        normalizeTelegramFinalScore(hydratedRef.finalScore || "") !== normalizeTelegramFinalScore(resultInfo.finalScore || "")
        || normalizeTelegramText(hydratedRef.resultStatus || "") !== normalizeTelegramText(resultInfo.status || "")
      )
    ) {
      alreadyUpdated += 1;
      continue;
    }
    const messageFinalScore = normalizeTelegramFinalScore(resultInfo.finalScore || finalScore);
    const currentText = restoreTelegramPredictionOpeningOddsInText(
      hydratedRef.text,
      hydratedRef
    );
    const nextText = formatTelegramPredictionResultMessage(currentText, messageFinalScore, resultInfo);
    const resultStatus = normalizeTelegramText(resultInfo.status || "");
    if (
      normalizeTelegramFinalScore(hydratedRef.observedFinalScore || hydratedRef.finalScore) === finalScore
      && normalizeTelegramText(hydratedRef.resultOrientation || "") === normalizeTelegramText(resultInfo.resultOrientation || "")
      && normalizeTelegramText(hydratedRef.resultStatus || "") === resultStatus
      && normalizeTelegramMessageText(hydratedRef.text) === normalizeTelegramMessageText(nextText)
    ) {
      alreadyUpdated += 1;
      continue;
    }
    const messages = Array.isArray(hydratedRef.messages) ? hydratedRef.messages : [];
    let refEdited = 0;
    const refErrors = [];
    if (!settings.enabled || !settings.botToken) {
      refErrors.push("telegram-disabled");
    }
    if (!messages.length) {
      refErrors.push("missing-message-ref");
    }
    if (!refErrors.length) {
      for (const message of messages) {
        const response = await editTelegramMessageText(nextText, settings, message, {
          maxAttempts: TELEGRAM_RESULT_EDIT_MAX_ATTEMPTS,
          timeoutMs: TELEGRAM_RESULT_EDIT_TIMEOUT_MS
        });
        if (response.edited) {
          refEdited += 1;
          edited += 1;
        } else {
          refErrors.push(response.reason || "edit-failed");
        }
      }
    }
    errors.push(...refErrors);
    const isAlreadyUpdated = refErrors.length > 0
      && refErrors.every((reason) => /message is not modified|message not modified/i.test(reason));
    if (isAlreadyUpdated) {
      alreadyUpdated += 1;
    }
    refs[key] = refEdited > 0 || isAlreadyUpdated
      ? {
        ...hydratedRef,
        text: nextText,
        finalScore: normalizeTelegramFinalScore(resultInfo.finalScore || ""),
        observedFinalScore: finalScore,
        resultOrientation: normalizeTelegramText(resultInfo.resultOrientation || ""),
        resultStatus,
        editedAt: Date.now(),
        editErrors: refErrors.slice(-5),
        pendingResultEdit: null
      }
      : {
        ...hydratedRef,
        editErrors: refErrors.slice(-5),
        pendingResultEdit: {
          text: nextText,
          finalScore: messageFinalScore,
          observedFinalScore: finalScore,
          resultOrientation: normalizeTelegramText(resultInfo.resultOrientation || ""),
          resultStatus,
          attempts: Number(
            hydratedRef
            && hydratedRef.pendingResultEdit
            && hydratedRef.pendingResultEdit.attempts
            || 0
          ),
          retryAt: Date.now() + TELEGRAM_RESULT_EDIT_RETRY_BASE_MS,
          updatedAt: Date.now()
        }
      };
    if (refs[key] && refs[key].pendingResultEdit) {
      const pendingRetryAt = Number(refs[key].pendingResultEdit.retryAt || 0);
      telegramResultEditRetryNextCheckAt = telegramResultEditRetryNextCheckAt > 0
        ? Math.min(telegramResultEditRetryNextCheckAt, pendingRetryAt)
        : pendingRetryAt;
    }
  }
  const hasBlockingSettingsError = errors.some((reason) => /telegram-disabled/i.test(reason));
  const hasRealEditError = errors.some((reason) => !/message is not modified|message not modified/i.test(reason));
  return {
    edited: edited > 0,
    editedMessages: edited,
    alreadyUpdated,
    reason: edited > 0
      ? "edited"
      : alreadyUpdated > 0 && !hasRealEditError
        ? "already-updated"
        : hasBlockingSettingsError
          ? "telegram-disabled"
          : "edit-failed",
    errors,
    matchUrl,
    finalScore,
    datasetRecorded: Boolean(datasetRecord),
    datasetChanged: Boolean(datasetOutcome && datasetOutcome.changed),
    datasetResolved: Boolean(datasetOutcome && datasetOutcome.resolved),
    datasetRecordKind: datasetRecord && datasetRecord.recordKind || "",
    statsMessage
  };
  });
}

function maybeRetryPendingTelegramPredictionResultEdit() {
  const now = Date.now();
  if (now < telegramResultEditRetryNextCheckAt) {
    return Promise.resolve({
      retried: false,
      reason: "retry-cooldown",
      retryAfterMs: telegramResultEditRetryNextCheckAt - now
    });
  }
  const task = telegramPredictionResultUpdateChain
    .catch(() => {})
    .then(() => retryPendingTelegramPredictionResultEditNow());
  telegramPredictionResultUpdateChain = task.catch(() => {});
  return task;
}

async function retryPendingTelegramPredictionResultEditNow() {
  const now = Date.now();
  return mutateTelegramPredictionMessageRefs(async (refs) => {
  const pendingEntries = Object.entries(refs)
    .filter(([, ref]) => ref && ref.pendingResultEdit && typeof ref.pendingResultEdit === "object")
    .sort((left, right) => (
      Number(left[1].pendingResultEdit.retryAt || 0)
      - Number(right[1].pendingResultEdit.retryAt || 0)
    ));
  const legacyEntries = pendingEntries.length
    ? []
    : Object.entries(refs)
      .filter(([, ref]) => {
        const errors = Array.isArray(ref && ref.editErrors) ? ref.editErrors : [];
        return ref
          && !ref.pendingResultEdit
          && isResolvedTelegramPredictionMessageRef(ref)
          && sanitizeTelegramMessageRefs(ref.messages).length > 0
          && normalizeTelegramMessageText(ref.text || "")
          && errors.some((error) => (
            !/message is not modified|message not modified/i.test(String(error || ""))
          ));
      })
      .sort((left, right) => Number(right[1] && right[1].ts || 0) - Number(left[1] && left[1].ts || 0));
  const selectedEntry = pendingEntries[0] || legacyEntries[0] || null;
  const legacyRetry = !pendingEntries.length && Boolean(selectedEntry);
  if (!selectedEntry) {
    telegramResultEditRetryNextCheckAt = now + TELEGRAM_RESULT_EDIT_RETRY_MAX_MS;
    return { retried: false, reason: "no-pending-result-edits" };
  }

  const nextRetryAt = legacyRetry
    ? 0
    : Number(selectedEntry[1].pendingResultEdit.retryAt || 0);
  if (nextRetryAt > now) {
    telegramResultEditRetryNextCheckAt = nextRetryAt;
    return {
      retried: false,
      reason: "pending-result-edit-not-due",
      retryAfterMs: nextRetryAt - now
    };
  }

  const settings = await getTelegramSettings();
  if (!settings.enabled || !settings.botToken) {
    telegramResultEditRetryNextCheckAt = now + TELEGRAM_RESULT_EDIT_RETRY_MAX_MS;
    return { retried: false, reason: "telegram-disabled" };
  }

  const [key, ref] = selectedEntry;
  const pending = legacyRetry
    ? {
      text: normalizeTelegramMessageText(ref.text || ""),
      finalScore: normalizeTelegramFinalScore(ref.finalScore || ""),
      observedFinalScore: normalizeTelegramFinalScore(ref.observedFinalScore || ref.finalScore || ""),
      resultOrientation: normalizeTelegramText(ref.resultOrientation || ""),
      resultStatus: normalizeTelegramText(ref.resultStatus || ""),
      attempts: 0,
      retryAt: 0,
      updatedAt: 0,
      legacyRetry: true
    }
    : ref.pendingResultEdit;
  const messages = sanitizeTelegramMessageRefs(ref.messages);
  const errors = [];
  let edited = 0;
  for (const message of messages) {
    const response = await editTelegramMessageText(pending.text, settings, message, {
      maxAttempts: TELEGRAM_RESULT_EDIT_MAX_ATTEMPTS,
      timeoutMs: TELEGRAM_RESULT_EDIT_TIMEOUT_MS
    });
    if (response.edited || /message is not modified|message not modified/i.test(response.reason || "")) {
      edited += 1;
    } else {
      errors.push(response.reason || "edit-failed");
    }
  }

  const retrySucceeded = messages.length > 0
    && !errors.length
    && edited === messages.length;
  let refPatch;
  if (retrySucceeded) {
    refPatch = {
      text: normalizeTelegramMessageText(pending.text || ref.text || ""),
      finalScore: normalizeTelegramFinalScore(pending.finalScore || ""),
      observedFinalScore: normalizeTelegramFinalScore(pending.observedFinalScore || ""),
      resultOrientation: normalizeTelegramText(pending.resultOrientation || ""),
      resultStatus: normalizeTelegramText(pending.resultStatus || ""),
      editedAt: now,
      editErrors: [],
      pendingResultEdit: null
    };
    telegramResultEditRetryNextCheckAt = now + TELEGRAM_RESULT_EDIT_RETRY_BASE_MS;
  } else {
    const attempts = Number(pending.attempts || 0) + 1;
    const retryDelayMs = Math.min(
      TELEGRAM_RESULT_EDIT_RETRY_MAX_MS,
      TELEGRAM_RESULT_EDIT_RETRY_BASE_MS * (2 ** Math.min(attempts, 4))
    );
    refPatch = {
      editErrors: (errors.length ? errors : ["missing-message-ref"]).slice(-5),
      pendingResultEdit: {
        ...pending,
        attempts,
        retryAt: now + retryDelayMs,
        updatedAt: now
      }
    };
    telegramResultEditRetryNextCheckAt = now + retryDelayMs;
  }

  const latestRefs = refs;
  const latestRef = latestRefs[key];
  const latestPending = latestRef && latestRef.pendingResultEdit;
  const pendingIsCurrent = legacyRetry
    ? Boolean(
      latestRef
      && !latestPending
      && normalizeTelegramMessageText(latestRef.text || "")
        === normalizeTelegramMessageText(pending.text || "")
      && normalizeTelegramFinalScore(latestRef.finalScore || "")
        === normalizeTelegramFinalScore(pending.finalScore || "")
    )
    : Boolean(
      latestPending
      && Number(latestPending.updatedAt || 0) === Number(pending.updatedAt || 0)
      && normalizeTelegramMessageText(latestPending.text || "")
        === normalizeTelegramMessageText(pending.text || "")
    );
  if (!pendingIsCurrent) {
    telegramResultEditRetryNextCheckAt = now + TELEGRAM_RESULT_EDIT_RETRY_BASE_MS;
    return {
      retried: true,
      edited: false,
      reason: "pending-result-edit-changed",
      messages: edited,
      errors
    };
  }
  latestRefs[key] = {
    ...latestRef,
    ...refPatch
  };
  return {
    retried: true,
    edited: retrySucceeded,
    messages: edited,
    errors
  };
  });
}

function isResolvedTelegramPredictionMessageRef(ref) {
  const status = normalizeTelegramText(ref && ref.resultStatus || "").toLowerCase();
  return Boolean(
    /^(?:hit|miss|skip-would-hit|skip-correct)$/.test(status)
    && parseTelegramFinalScore(ref && ref.finalScore || "")
  );
}

function isResolvedTelegramPredictionResultInfo(resultInfo) {
  const status = normalizeTelegramText(resultInfo && resultInfo.status || "").toLowerCase();
  return Boolean(
    /^(?:hit|miss|skip-would-hit|skip-correct)$/.test(status)
    && parseTelegramFinalScore(resultInfo && resultInfo.finalScore || "")
  );
}

async function getTelegramPredictionMessageRefs() {
  const value = await chrome.storage.local.get({ [TELEGRAM_MESSAGE_REFS_KEY]: {} });
  return pruneTelegramPredictionMessageRefs(value[TELEGRAM_MESSAGE_REFS_KEY] || {});
}

async function getTelegramPredictionMessageRefsFromDataset(matchUrlValue) {
  const matchUrl = normalizeTelegramMatchKey(matchUrlValue || "");
  if (!matchUrl) {
    return [];
  }
  const value = await chrome.storage.local.get({ [TELEGRAM_PREDICTION_DATASET_KEY]: [] });
  const rows = hydrateTelegramPredictionDatasetRows(
    mergeTelegramPredictionDatasetIdentityRecords(
      Array.isArray(value[TELEGRAM_PREDICTION_DATASET_KEY]) ? value[TELEGRAM_PREDICTION_DATASET_KEY] : []
    )
  );
  const row = rows.find((item) => item && isSameTelegramMatch(item.matchUrl, matchUrl));
  if (!row) {
    return [];
  }
  const players = Array.isArray(row.players) ? row.players.slice(0, 2).map(normalizeTelegramText).filter(Boolean) : [];
  const playerIds = getTelegramDatasetRecordPlayerIds(row);
  const result = [];
  const addFromSource = (source, settingsKind, sourceKind) => {
    const item = source && typeof source === "object" ? source : null;
    if (!item) {
      return;
    }
    const messages = sanitizeTelegramMessageRefs(item.messageRefs || item.telegramMessages || item.messages);
    const text = normalizeTelegramMessageText(item.telegramText || item.text || "");
    if (!messages.length || !text) {
      return;
    }
    const sideIndex = sanitizeCalibrationSideIndex(item.sideIndex !== undefined ? item.sideIndex : row.sideIndex);
    const key = [
      "dataset-ref",
      normalizeTelegramText(settingsKind || "prematch"),
      normalizeTelegramText(sourceKind || ""),
      matchUrl,
      result.length
    ].filter((part) => part !== "").join("|");
    result.push([key, {
      ts: Number(item.ts || row.updatedAt || row.createdAt || 0) || Date.now(),
      source: normalizeTelegramText(sourceKind || settingsKind || ""),
      settingsKind: normalizeTelegramText(settingsKind || "prematch"),
      matchUrl,
      text,
      playerName: normalizeTelegramText(item.playerName || row.playerName || ""),
      sideIndex: sideIndex === 0 || sideIndex === 1 ? sideIndex : null,
      prematchAccepted: typeof item.accepted === "boolean" ? item.accepted : null,
      players: Array.isArray(item.players) && item.players.length
        ? item.players.slice(0, 2).map(normalizeTelegramText).filter(Boolean)
        : players,
      playerIds: Array.isArray(item.playerIds) && item.playerIds.length
        ? item.playerIds.slice(0, 2).map(normalizeTelegramText)
        : playerIds,
      messages,
      finalScore: "",
      resultStatus: "",
      editedAt: 0
    }]);
  };
  addFromSource(row.prematch || row.prematchSnapshot, "prematch", "prematch");
  return result;
}

async function getTelegramPipelineStatus() {
  const [
    settings,
    storage,
    sourceState
  ] = await Promise.all([
    getTelegramSettings(),
    chrome.storage.local.get({
      [TELEGRAM_SENT_KEY]: {},
      [TELEGRAM_AUDIT_KEY]: [],
      [TELEGRAM_MESSAGE_REFS_KEY]: {},
      [TELEGRAM_STATS_REFS_KEY]: {}
    }),
    getTableTennisSourceState()
  ]);
  const sentMap = pruneTelegramSentMap(storage[TELEGRAM_SENT_KEY] || {});
  const audit = Array.isArray(storage[TELEGRAM_AUDIT_KEY]) ? storage[TELEGRAM_AUDIT_KEY] : [];
  const refs = pruneTelegramPredictionMessageRefs(storage[TELEGRAM_MESSAGE_REFS_KEY] || {});
  const statsRefs = pruneTelegramStatsMessageRefs(storage[TELEGRAM_STATS_REFS_KEY] || {});
  const recentMessageRefs = Object.values(refs)
    .sort((left, right) => Number(right && right.ts || 0) - Number(left && left.ts || 0))
    .slice(0, 8)
    .map((ref) => ({
      ts: Number(ref && ref.ts || 0),
      source: normalizeTelegramText(ref && ref.source || ""),
      settingsKind: normalizeTelegramText(ref && ref.settingsKind || ""),
      matchUrl: normalizeTelegramText(ref && ref.matchUrl || ""),
      playerName: normalizeTelegramText(ref && ref.playerName || ""),
      messages: Array.isArray(ref && ref.messages) ? ref.messages.map(sanitizeTelegramMessageRef).filter(Boolean) : [],
      resultStatus: normalizeTelegramText(ref && ref.resultStatus || ""),
      finalScore: normalizeTelegramText(ref && ref.finalScore || "")
    }));

  return {
    prematch: summarizeTelegramPipelineSettings(settings),
    tableTennisNetwork: {
      active: bsportsfanProxyFetchActive,
      queued: bsportsfanProxyFetchQueue.length,
      inFlightUrls: bsportsfanProxyFetchInFlight.size,
      protectionOpenUntil: Number(
        sourceState.sources.bsportsfan
        && sourceState.sources.bsportsfan.cooldownUntil || 0
      ) > Date.now()
        ? Number(sourceState.sources.bsportsfan.cooldownUntil || 0)
        : 0,
      protectionReason: "",
      activeSourceId: sourceState.activeSourceId,
      sources: sourceState.sources,
      queuedByPriority: summarizeBsportsfanProxyQueuePriorities(),
      metrics: { ...bsportsfanProxyFetchMetrics }
    },
    sentPredictions: Object.keys(sentMap).length,
    auditCount: audit.length,
    lastAudit: audit[0] || null,
    recentAudit: audit.slice(0, 8),
    messageRefCount: Object.keys(refs).length,
    recentMessageRefs,
    statsMessageCount: Object.keys(statsRefs).length,
    statsMessages: Object.values(statsRefs)
      .sort((left, right) => Number(right && right.ts || 0) - Number(left && left.ts || 0))
      .slice(0, 4)
      .map((ref) => ({
        ts: Number(ref && ref.ts || 0),
        settingsKind: normalizeTelegramText(ref && ref.settingsKind || ""),
        chatId: normalizeTelegramText(ref && ref.chatId || ""),
        pinned: Boolean(ref && ref.pinned),
        pinErrors: Array.isArray(ref && ref.pinErrors) ? ref.pinErrors.slice(0, 3) : [],
        lastReason: normalizeTelegramText(ref && ref.lastReason || "")
      }))
  };
}

function summarizeBsportsfanProxyQueuePriorities() {
  const policy = globalThis.LvrPipelinePolicy;
  const summary = {};
  for (const job of bsportsfanProxyFetchQueue) {
    const name = policy && typeof policy.getRequestPriorityName === "function"
      ? policy.getRequestPriorityName(job && job.priority)
      : String(normalizeBsportsfanRequestPriority(job && job.priority));
    summary[name] = Number(summary[name] || 0) + 1;
  }
  return summary;
}

function summarizeTelegramPipelineSettings(settings) {
  const safe = sanitizeTelegramSettings(settings || {});
  const chatIds = parseTelegramChatIds(safe.chatId);
  return {
    enabled: safe.enabled,
    autoSend: safe.autoSend,
    hasBotToken: Boolean(safe.botToken),
    hasChatId: Boolean(chatIds.length),
    chatCount: chatIds.length,
    botToken: safe.botToken ? `${safe.botToken.slice(0, 8)}...` : "",
    chatId: safe.chatId
  };
}

function pruneTelegramPredictionMessageRefs(map) {
  const now = Date.now();
  const entries = Object.entries(map && typeof map === "object" ? map : {})
    .filter(([, value]) => value && now - Number(value.ts || 0) < TELEGRAM_MESSAGE_REFS_TTL_MS)
    .sort((left, right) => Number(right[1] && right[1].ts || 0) - Number(left[1] && left[1].ts || 0))
    .slice(0, TELEGRAM_MESSAGE_REFS_LIMIT);
  return Object.fromEntries(entries);
}

function normalizeTelegramMatchKey(value) {
  const text = normalizeTelegramText(value);
  try {
    const url = new URL(text);
    url.hash = "";
    url.search = "";
    url.pathname = url.pathname
      .replace(/^\/rs?\//i, "/table-tennis/r/")
      .replace(/\/table-tennis\/rs\//i, "/table-tennis/r/")
      .replace(/\/+$/, "");
    return url.href.replace(/\/+$/, "");
  } catch (_) {
    return text
      .replace(/^\/rs?\//i, "/table-tennis/r/")
      .replace("/table-tennis/rs/", "/table-tennis/r/")
      .replace(/[?#].*$/, "")
      .replace(/\/+$/, "");
  }
}

function getTelegramMatchIdentityKey(value) {
  const matchUrl = normalizeTelegramMatchKey(value);
  const numericMatch = matchUrl.match(/\/table-tennis\/r\/(\d+)(?:\/|$)/i);
  return numericMatch ? `bsf-match:${numericMatch[1]}` : matchUrl;
}

function isSameTelegramMatch(left, right) {
  const leftIdentity = getTelegramMatchIdentityKey(left);
  return Boolean(leftIdentity && leftIdentity === getTelegramMatchIdentityKey(right));
}

function normalizeTelegramFinalScore(value) {
  const score = parseTelegramFinalScore(value);
  return score ? `${score.left}-${score.right}` : "";
}

function parseTelegramFinalScore(value) {
  const match = normalizeTelegramText(value).match(/\b([0-5])\s*[-:]\s*([0-5])\b/);
  if (!match) {
    return null;
  }
  const left = Number(match[1]);
  const right = Number(match[2]);
  if (!isTelegramFinishedMatchSetScore(left, right)) {
    return null;
  }
  return { left, right };
}

function isTelegramFinishedMatchSetScore(left, right) {
  if (!Number.isFinite(left) || !Number.isFinite(right) || left === right) {
    return false;
  }
  return Math.max(left, right) === 3 && Math.min(left, right) >= 0 && Math.min(left, right) <= 2;
}

function formatTelegramPredictionResultMessage(text, finalScore, resultInfo = {}) {
  const lines = normalizeTelegramMessageText(text)
    .replace(/<b><i>(.*?)<\/i><\/b>/g, "<b>$1</b>")
    .split("\n");
  const resultIndex = lines.findIndex((line) => {
    const text = normalizeTelegramText(line);
    return /^🏁\s*(?:✅|❌)?\s*Итог:/i.test(text)
      || /^🎯\s*Прогноз:/i.test(text)
      || /^(?:✅|❌|🟢|🔴)\s*Сет\s+\d+\s*:/i.test(text);
  });
  const baseLines = (resultIndex >= 0 ? lines.slice(0, resultIndex) : lines)
    .filter((line) => (
      !isTelegramSetTimelineLine(line)
      && !isTelegramSkipOutcomeLine(line)
      && !isTelegramUnresolvedResultLine(line)
      && !isTelegramPredictionTechnicalMetricLine(line)
    ))
    .map(normalizeTelegramMoneylineOddsLabel);
  const linkLines = lines.filter(isTelegramMatchLinkLine);
  const base = baseLines
    .filter((line) => !isTelegramMatchLinkLine(line))
    .join("\n")
    .trim();
  const icon = normalizeTelegramText(resultInfo.icon || "");
  const iconText = icon ? `${escapeTelegramHtml(icon)} ` : "";
  const detailLines = sanitizeTelegramTextList(resultInfo.detailLines, 8)
    .map((line) => escapeTelegramHtml(line));
  const resultLine = finalScore ? `🏁 ${iconText}Итог: ${escapeTelegramHtml(finalScore)}` : "";
  return [base, ...detailLines, resultLine, ...linkLines].filter(Boolean).join("\n");
}

function isTelegramMatchLinkLine(line) {
  return /^🔗\s*/.test(normalizeTelegramText(line));
}

function normalizeTelegramMoneylineOddsLabel(line) {
  return String(line || "").replace(
    /^(\s*💰\s*)Кэф\s+\+1[.,]5\s+ФС\s*:/i,
    "$1Кэф на победу:"
  );
}

function isTelegramSkipOutcomeLine(line) {
  return /^(?:✅\s*Пропуск оправдан|⚠️\s*Пропуск (?:не оправдался|лишний))(?=\s|:|$)/i.test(normalizeTelegramText(line));
}

function isTelegramUnresolvedResultLine(line) {
  return /^⚠️\s*Порядок игроков в результате не подтверждён/i.test(normalizeTelegramText(line));
}

function isTelegramPredictionTechnicalMetricLine(line) {
  return /^(?:💪\s*Сила|🛡\s*Стабильность|🔥\s*Форма)\s*:/i.test(normalizeTelegramText(line));
}

function buildTelegramPredictionResultInfo(ref, finalScore, result = {}) {
  const observedScore = parseTelegramFinalScore(finalScore);
  const alignment = alignTelegramDatasetResultToRecord(ref, observedScore, result);
  const score = alignment.score;
  const canonicalFinalScore = score ? `${score.left}-${score.right}` : "";
  const playerName = normalizeTelegramText(ref && ref.playerName || "");
  const refPlayers = Array.isArray(ref && ref.players)
    ? ref.players.slice(0, 2).map(normalizeTelegramText).filter(Boolean)
    : [];
  if (observedScore && !score) {
    return {
      status: "",
      icon: "",
      detail: "",
      detailLines: ["⚠️ Порядок игроков в результате не подтверждён — исход не оценён"],
      ownSets: null,
      finalScore: "",
      observedFinalScore: normalizeTelegramFinalScore(finalScore),
      resultOrientation: alignment.orientation
    };
  }
  const explicitSideIndex = sanitizeCalibrationSideIndex(ref && ref.sideIndex);
  const refSideIndex = findTelegramPlayerSideIndex(playerName, refPlayers);
  const sideIndex = explicitSideIndex !== null ? explicitSideIndex : refSideIndex;
  if (sideIndex !== 0 && sideIndex !== 1) {
    return {
      status: "",
      icon: "",
      detail: "",
      ownSets: null,
      finalScore: canonicalFinalScore,
      observedFinalScore: normalizeTelegramFinalScore(finalScore),
      resultOrientation: alignment.orientation
    };
  }
  const ownSets = score ? sideIndex === 0 ? score.left : score.right : null;
  const hit = Number(ownSets) >= 2;
  if (score && isTelegramSkippedPredictionRef(ref)) {
    const playerLabel = playerName || "Игрок";
    return {
      status: hit ? "skip-would-hit" : "skip-correct",
      icon: "",
      detail: "",
      detailLines: [hit
        ? `⚠️ Пропуск не оправдался: ${playerLabel} взял 2+ сета`
        : `✅ Пропуск оправдан: ${playerLabel} не взял 2+ сета`],
      ownSets,
      finalScore: canonicalFinalScore,
      observedFinalScore: normalizeTelegramFinalScore(finalScore),
      resultOrientation: alignment.orientation
    };
  }
  return {
    status: score ? hit ? "hit" : "miss" : "",
    icon: score ? hit ? "✅" : "❌" : "",
    detail: "",
    detailLines: [],
    ownSets,
    finalScore: canonicalFinalScore,
    observedFinalScore: normalizeTelegramFinalScore(finalScore),
    resultOrientation: alignment.orientation
  };
}

function isTelegramSkippedPredictionRef(ref) {
  return Boolean(ref && ref.prematchAccepted === false);
}

function findTelegramPlayerSideIndex(playerName, players) {
  const list = Array.isArray(players) ? players.slice(0, 2) : [];
  for (let index = 0; index < list.length; index += 1) {
    if (areTelegramNamesSame(playerName, list[index])) {
      return index;
    }
  }
  return -1;
}

function normalizeTelegramMessageText(value) {
  return String(value || "")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[ \t\f\v]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function sanitizeTelegramTextList(value, limit) {
  const seen = new Set();
  const result = [];
  for (const item of Array.isArray(value) ? value : []) {
    const text = normalizeTelegramText(item);
    if (!text || seen.has(text)) {
      continue;
    }
    seen.add(text);
    result.push(text);
    if (result.length >= Math.max(1, Number(limit || 1))) {
      break;
    }
  }
  return result;
}

function parseTelegramChatIds(value) {
  return Array.from(new Set(
    String(value || "")
      .split(/[\s,;]+/)
      .map((item) => item.trim())
      .filter(Boolean)
  ));
}

function formatTelegramPredictionMessage(prediction) {
  const players = Array.isArray(prediction.players) ? prediction.players.slice(0, 2) : [];
  const playerName = normalizeTelegramText(prediction.playerName || "");
  const matchUrl = normalizeTelegramText(prediction.matchUrl || "");
  const matchLine = players.length >= 2
    ? formatTelegramPredictionMatchLine(prediction, players, playerName)
    : escapeTelegramHtml(normalizeTelegramText(prediction.match || ""));
  const isMatchStart = normalizeTelegramText(prediction && prediction.modelVersion || "") === TELEGRAM_MATCH_START_RULE_ID;
  const matchStartTitle = "🏓 ПРОГНОЗ · 2+ СЕТА";
  const lines = [
    isMatchStart ? matchStartTitle : "🏓 +1.5 ФС / 2+ сета",
    matchLine,
    isMatchStart ? "" : formatTelegramMoneylineOddsLine(prediction),
    matchUrl ? `🔗 <a href="${escapeTelegramHtml(matchUrl)}">Открыть матч</a>` : ""
  ].filter(Boolean);
  return lines.join("\n");
}

function formatTelegramBoldItalicName(name) {
  const text = normalizeTelegramText(name);
  return text ? `<b>${escapeTelegramHtml(text)}</b>` : "";
}

function formatTelegramPredictionMatchLine(prediction, players, playerName) {
  const predictedSideIndex = getTelegramPredictionSideIndex(prediction, players, playerName);
  const referenceMoneylineMarket = getTelegramReferenceMoneylineMarket(prediction);
  const matchup = players.slice(0, 2)
    .map((name, index) => {
      const sideOdds = index === 0
        ? referenceMoneylineMarket && referenceMoneylineMarket.leftOdds || prediction.leftOdds
        : referenceMoneylineMarket && referenceMoneylineMarket.rightOdds || prediction.rightOdds;
      const fallbackOdds = index === predictedSideIndex
        ? prediction.playerOdds || prediction.marketOdds || prediction.marketFavoriteOdds
        : prediction.opponentOdds;
      const odds = formatTelegramOdds(sideOdds || fallbackOdds);
      const namePart = index === predictedSideIndex
        ? formatTelegramBoldItalicName(name)
        : escapeTelegramHtml(name);
      return odds ? `${namePart} (кэф ${escapeTelegramHtml(odds)})` : namePart;
    })
    .join(" vs ");
  return matchup ? `🆚 ${matchup}` : "";
}

function getTelegramReferenceMoneylineMarket(source) {
  const market = source && source.referenceMoneylineMarket && typeof source.referenceMoneylineMarket === "object"
    ? source.referenceMoneylineMarket
    : null;
  const leftOdds = finiteAuditNumber(market && market.leftOdds);
  const rightOdds = finiteAuditNumber(market && market.rightOdds);
  if (!(leftOdds > 1) || !(rightOdds > 1)) {
    return null;
  }
  return {
    ...market,
    leftOdds,
    rightOdds
  };
}

function getTelegramPredictionSideIndex(prediction, players, playerName) {
  const explicit = readTelegramPrematchFeatureNumber(
    prediction && prediction.sideIndex,
    prediction && prediction.predictedIndex
  );
  if (explicit === 0 || explicit === 1) {
    return explicit;
  }
  return findTelegramPlayerSideIndex(playerName, players);
}

function areTelegramNamesSame(left, right) {
  return normalizeTelegramText(left).toLowerCase() === normalizeTelegramText(right).toLowerCase();
}

function formatTelegramOdds(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 1) {
    return "";
  }
  return String(Math.round(number * 1000) / 1000);
}

function getTelegramMoneylineOdds(source) {
  const value = source && typeof source === "object" ? source : {};
  const market = value.moneylineMarket && typeof value.moneylineMarket === "object"
    ? value.moneylineMarket
    : {};
  const directCandidates = [
    value.moneylineOdds,
    normalizeTelegramText(market.marketType).toLowerCase() === "matchresult" ? market.selectedOdds : null,
    // Builds through 0.10.92 stored this match-winner quote under a misleading key.
    value.targetTwoSetOdds
  ];
  for (const candidate of directCandidates) {
    const odds = Number(candidate);
    if (Number.isFinite(odds) && odds > 1) {
      return odds;
    }
  }

  return null;
}

function formatTelegramMoneylineOddsLine(source) {
  const odds = formatTelegramOdds(getTelegramMoneylineOdds(source));
  return odds ? "💰 Кэф на победу: <b>" + escapeTelegramHtml(odds) + "</b>" : "";
}

function normalizeTelegramPercentScore(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return 0;
  }
  return number <= 1 ? number * 100 : number;
}

function normalizeTelegramText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function escapeTelegramHtml(value) {
  return normalizeTelegramText(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    let settled = false;
    const finish = (error, db = null) => {
      if (settled) {
        if (db) {
          db.close();
        }
        return;
      }
      settled = true;
      clearTimeout(timeoutId);
      if (error) {
        reject(error);
      } else {
        resolve(db);
      }
    };
    const timeoutId = setTimeout(() => {
      finish(new Error(`IndexedDB open timed out after ${INDEXEDDB_OPEN_TIMEOUT_MS} ms`));
    }, INDEXEDDB_OPEN_TIMEOUT_MS);

    request.onupgradeneeded = () => {
      const db = request.result;

      ["ticks", "signals", "baselines", "paperLogs", "predictionShadows", "externalProfiles"].forEach((storeName) => {
        if (db.objectStoreNames.contains(storeName)) {
          db.deleteObjectStore(storeName);
        }
      });

      if (!db.objectStoreNames.contains(STORE_PREDICTION_POINTS)) {
        const predictionPoints = db.createObjectStore(STORE_PREDICTION_POINTS, { keyPath: "matchUrl" });
        predictionPoints.createIndex("updatedAt", "updatedAt", { unique: false });
      }
    };

    request.onsuccess = () => finish(null, request.result);
    request.onerror = () => finish(request.error || new Error("IndexedDB open failed"));
    request.onblocked = () => finish(new Error("IndexedDB open blocked by another extension context"));
  });
}

async function readTelegramPredictionPointRecords() {
  const db = await openDb();
  try {
    if (!db.objectStoreNames.contains(STORE_PREDICTION_POINTS)) {
      return [];
    }
    return await new Promise((resolve, reject) => {
      const request = db.transaction(STORE_PREDICTION_POINTS, "readonly")
        .objectStore(STORE_PREDICTION_POINTS)
        .getAll();
      request.onsuccess = () => resolve(Array.isArray(request.result) ? request.result : []);
      request.onerror = () => reject(request.error);
    });
  } finally {
    db.close();
  }
}

async function deleteTelegramPredictionPointRecords(matchUrls) {
  const urls = Array.from(matchUrls || []).map(normalizeTelegramMatchKey).filter(Boolean);
  if (!urls.length) {
    return;
  }
  const db = await openDb();
  try {
    if (!db.objectStoreNames.contains(STORE_PREDICTION_POINTS)) {
      return;
    }
    await new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_PREDICTION_POINTS, "readwrite");
      const store = transaction.objectStore(STORE_PREDICTION_POINTS);
      for (const matchUrl of urls) {
        store.delete(matchUrl);
      }
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error || new Error("Prediction point delete aborted"));
    });
  } finally {
    db.close();
  }
}

async function clearTelegramPredictionPointRecords() {
  const db = await openDb();
  try {
    if (!db.objectStoreNames.contains(STORE_PREDICTION_POINTS)) {
      return;
    }
    await new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_PREDICTION_POINTS, "readwrite");
      transaction.objectStore(STORE_PREDICTION_POINTS).clear();
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error || new Error("Prediction point clear aborted"));
    });
  } finally {
    db.close();
  }
}

function countStore(db, storeName) {
  if (!db.objectStoreNames.contains(storeName)) {
    return Promise.resolve(0);
  }

  return new Promise((resolve, reject) => {
    const request = db.transaction(storeName, "readonly").objectStore(storeName).count();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function scheduleStorageMaintenance(force = false) {
  const now = Date.now();
  if (!force && now - lastMaintenanceTs < STORAGE_MAINTENANCE_INTERVAL_MS) {
    return false;
  }

  if (maintenancePromise) {
    return maintenancePromise;
  }

  lastMaintenanceTs = now;
  maintenancePromise = runStorageMaintenance()
    .catch((error) => {
      console.warn("[Prematch Forecast] Storage maintenance failed", error);
      return false;
    })
    .finally(() => {
      maintenancePromise = null;
    });

  return maintenancePromise;
}

async function runStorageMaintenance() {
  await trimStore(STORE_PREDICTION_POINTS, TELEGRAM_PREDICTION_DATASET_LIMIT, "updatedAt");
  return true;
}

async function trimStore(storeName, maxRecords, indexName = "ts") {
  const db = await openDb();
  const count = await countStore(db, storeName);
  if (count <= maxRecords) {
    db.close();
    return;
  }

  await new Promise((resolve, reject) => {
    let toDelete = count - maxRecords;
    const transaction = db.transaction(storeName, "readwrite");
    const index = transaction.objectStore(storeName).index(indexName);
    const request = index.openCursor();

    request.onsuccess = () => {
      const cursor = request.result;
      if (!cursor || toDelete <= 0) {
        return;
      }

      cursor.delete();
      toDelete -= 1;
      cursor.continue();
    };

    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
  });

  db.close();
}

function stringifyError(error) {
  return String(error && error.message ? error.message : error);
}
