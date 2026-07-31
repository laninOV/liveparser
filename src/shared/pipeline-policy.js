(function installLvrPipelinePolicy(root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  if (root && typeof root === "object") {
    root.LvrPipelinePolicy = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function createLvrPipelinePolicy() {
  "use strict";

  const REQUEST_PRIORITY = Object.freeze({
    critical: 0,
    interactive: 1,
    prewarm: 2,
    background: 3,
    maintenance: 4
  });
  const REQUEST_PRIORITY_NAMES = Object.freeze(
    Object.fromEntries(Object.entries(REQUEST_PRIORITY).map(([name, value]) => [value, name]))
  );
  function normalizeRequestPriority(value, fallback = REQUEST_PRIORITY.prewarm) {
    if (Number.isFinite(Number(value))) {
      return clampPriority(Number(value));
    }
    const raw = String(value || "").trim().toLowerCase();
    if (Object.prototype.hasOwnProperty.call(REQUEST_PRIORITY, raw)) {
      return REQUEST_PRIORITY[raw];
    }
    return clampPriority(Number(fallback));
  }

  function clampPriority(value) {
    if (!Number.isFinite(value)) {
      return REQUEST_PRIORITY.prewarm;
    }
    return Math.max(REQUEST_PRIORITY.critical, Math.min(REQUEST_PRIORITY.maintenance, Math.trunc(value)));
  }

  function getRequestPriorityName(value) {
    return REQUEST_PRIORITY_NAMES[normalizeRequestPriority(value)] || "prewarm";
  }

  function compareRequestJobs(left, right) {
    return normalizeRequestPriority(left && left.priority)
      - normalizeRequestPriority(right && right.priority)
      || normalizePositiveNumber(left && left.deadlineAt, Number.POSITIVE_INFINITY)
        - normalizePositiveNumber(right && right.deadlineAt, Number.POSITIVE_INFINITY)
      || normalizePositiveNumber(left && left.sequence, Number.POSITIVE_INFINITY)
        - normalizePositiveNumber(right && right.sequence, Number.POSITIVE_INFINITY);
  }

  function mergeRequestJobUrgency(job, priority, deadlineAt) {
    if (!job || typeof job !== "object") {
      return false;
    }
    const nextPriority = Math.min(
      normalizeRequestPriority(job.priority),
      normalizeRequestPriority(priority)
    );
    const currentDeadline = normalizePositiveNumber(job.deadlineAt, Number.POSITIVE_INFINITY);
    const incomingDeadline = normalizePositiveNumber(deadlineAt, Number.POSITIVE_INFINITY);
    const nextDeadline = Math.min(currentDeadline, incomingDeadline);
    const changed = nextPriority !== job.priority || nextDeadline !== currentDeadline;
    job.priority = nextPriority;
    if (Number.isFinite(nextDeadline)) {
      job.deadlineAt = nextDeadline;
    }
    return changed;
  }

  function buildForecastQueueRank(options = {}, shadowOnly = false) {
    const state = options.entryState && typeof options.entryState === "object"
      ? options.entryState
      : {};
    const started = Boolean(state.started);
    let stage = 5;
    if (options.startAuto && started) {
      stage = 0;
    } else if (!started && !options.suppressTelegram) {
      stage = state.mode === "prematch" ? 1 : 2;
    } else if (!started) {
      stage = state.mode === "prematch" ? 3 : 4;
    }
    return [
      shadowOnly ? 1 : 0,
      stage,
      normalizePositiveNumber(state.matchDateTs, Number.POSITIVE_INFINITY),
      normalizePositiveNumber(options.requestedAt, Number.POSITIVE_INFINITY)
    ];
  }

  function compareForecastQueueEntries(left, right) {
    const leftRank = Array.isArray(left && left.rank) ? left.rank : [];
    const rightRank = Array.isArray(right && right.rank) ? right.rank : [];
    const length = Math.max(leftRank.length, rightRank.length);
    for (let index = 0; index < length; index += 1) {
      const difference = normalizeRankValue(leftRank[index]) - normalizeRankValue(rightRank[index]);
      if (difference) {
        return difference;
      }
    }
    return String(left && left.key || "").localeCompare(String(right && right.key || ""));
  }

  function mergeForecastQueueOptions(current = {}, incoming = {}) {
    const startAuto = Boolean(current.startAuto || incoming.startAuto);
    const currentRequestedAt = normalizePositiveNumber(current.requestedAt, 0);
    const incomingRequestedAt = normalizePositiveNumber(incoming.requestedAt, 0);
    const requestedAt = currentRequestedAt && incomingRequestedAt
      ? Math.min(currentRequestedAt, incomingRequestedAt)
      : currentRequestedAt || incomingRequestedAt || Date.now();
    return {
      ...current,
      ...incoming,
      requestedAt,
      seedSnapshot: incoming.seedSnapshot || current.seedSnapshot || null,
      entryState: incoming.entryState || current.entryState || null,
      cipCollect: Boolean(current.cipCollect || incoming.cipCollect),
      startAuto,
      suppressTelegram: startAuto
        ? false
        : Boolean(current.suppressTelegram && incoming.suppressTelegram)
    };
  }

  function normalizePositiveNumber(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) && number > 0 ? number : fallback;
  }

  function normalizeRankValue(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : Number.POSITIVE_INFINITY;
  }

  return Object.freeze({
    REQUEST_PRIORITY,
    normalizeRequestPriority,
    getRequestPriorityName,
    compareRequestJobs,
    mergeRequestJobUrgency,
    buildForecastQueueRank,
    compareForecastQueueEntries,
    mergeForecastQueueOptions
  });
});
