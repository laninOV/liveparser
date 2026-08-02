"use strict";

const statusText = document.getElementById("statusText");
const statusMeta = document.getElementById("statusMeta");
const sourceBadge = document.getElementById("sourceBadge");
const details = document.getElementById("details");
const forecastButton = document.getElementById("forecastButton");
const forecastPanel = document.getElementById("forecastPanel");
const forecastWinner = document.getElementById("forecastWinner");
const forecastBars = document.getElementById("forecastBars");
const forecastMeta = document.getElementById("forecastMeta");
const forecastFactors = document.getElementById("forecastFactors");
const telegramStatus = document.getElementById("telegramStatus");
const telegramEnabled = document.getElementById("telegramEnabled");
const telegramBotToken = document.getElementById("telegramBotToken");
const telegramChatId = document.getElementById("telegramChatId");
const telegramAutoSend = document.getElementById("telegramAutoSend");
const telegramSave = document.getElementById("telegramSave");
const telegramTest = document.getElementById("telegramTest");
const archiveStatus = document.getElementById("archiveStatus");
const archiveStats = document.getElementById("archiveStats");
const archiveActionStatus = document.getElementById("archiveActionStatus");
const archiveRefresh = document.getElementById("archiveRefresh");
const archiveDownload = document.getElementById("archiveDownload");
const archiveBackfill = document.getElementById("archiveBackfill");
const archiveOddsBackfill = document.getElementById("archiveOddsBackfill");
const archiveOddsImport = document.getElementById("archiveOddsImport");
const archiveOddsFiles = document.getElementById("archiveOddsFiles");
const archiveStatsPin = document.getElementById("archiveStatsPin");
const archiveClear = document.getElementById("archiveClear");
const extensionReload = document.getElementById("extensionReload");
let collectProgressTimer = 0;
let collectProgressInFlight = false;
let collectProgressSession = 0;
let collectProgressBusy = false;
let archiveDashboardTimer = 0;
let archiveDashboardLoading = false;
let archiveStorageListener = null;
const EXTENSION_RELOAD_PREPARE_TIMEOUT_MS = 1500;

document.addEventListener("DOMContentLoaded", () => {
  forecastButton.addEventListener("click", collectForecast);
  if (telegramSave) {
    telegramSave.addEventListener("click", saveTelegramSettings);
  }
  if (telegramTest) {
    telegramTest.addEventListener("click", testTelegramSettings);
  }
  if (archiveRefresh) {
    archiveRefresh.addEventListener("click", loadArchiveDashboard);
  }
  if (archiveDownload) {
    archiveDownload.addEventListener("click", downloadArchiveDataset);
  }
  if (archiveBackfill) {
    archiveBackfill.addEventListener("click", backfillArchiveResults);
  }
  if (archiveOddsBackfill) {
    archiveOddsBackfill.addEventListener("click", backfillArchiveOpeningOdds);
  }
  if (archiveOddsImport && archiveOddsFiles) {
    archiveOddsImport.addEventListener("click", () => {
      archiveOddsFiles.value = "";
      archiveOddsFiles.click();
    });
    archiveOddsFiles.addEventListener("change", () => {
      backfillArchiveOpeningOddsFromFiles(Array.from(archiveOddsFiles.files || []));
    });
  }
  if (archiveStatsPin) {
    archiveStatsPin.addEventListener("click", updatePinnedStats);
  }
  if (archiveClear) {
    archiveClear.addEventListener("click", clearArchiveDataset);
  }
  if (extensionReload) {
    extensionReload.addEventListener("click", reloadExtension);
  }
  setBadge("готов", "ok");
  setStatus("Готов к расчету", "Открой матч bsportsfan и нажми «Прогноз».");
  if (forecastPanel) {
    forecastPanel.hidden = true;
  }
  renderDetails([]);
  loadTelegramSettings();
  loadArchiveDashboard();
  archiveDashboardTimer = window.setInterval(() => {
    refreshCollectorHeartbeat();
  }, 5000);
  archiveStorageListener = (changes, areaName) => {
    if (areaName === "local" && changes && changes.telegramPredictionDataset) {
      loadArchiveDashboard({ silent: true });
    }
  };
  chrome.storage.onChanged.addListener(archiveStorageListener);
});

window.addEventListener("unload", () => {
  if (archiveDashboardTimer) {
    window.clearInterval(archiveDashboardTimer);
  }
  if (archiveStorageListener) {
    chrome.storage.onChanged.removeListener(archiveStorageListener);
  }
});

async function refreshCollectorHeartbeat() {
  try {
    const response = await sendRuntimeMessage({ type: "lvr:getScanStatus" });
    updateArchiveItem("Сбор сейчас", formatCurrentCollectorStatus(
      response && response.scanStatus || null
    ));
  } catch (_) {
    updateArchiveItem("Сбор сейчас", "расширение не отвечает");
  }
}

async function collectForecast() {
  forecastButton.disabled = true;
  const session = ++collectProgressSession;
  collectProgressInFlight = true;
  setStatus("Собираю прошлые игры игроков...", "Запуск...");
  setStatusDetails([]);
  if (forecastPanel) {
    forecastPanel.hidden = true;
  }
  startProgressPolling();

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) {
      throw new Error("Не нашёл активную вкладку.");
    }

    const response = await collectFromTab(tab, "lvr:collectPlayerArchive");
    if (!response || response.ok === false) {
      throw new Error(response && response.error || "Прогноз не вернул данные.");
    }

    if (collectProgressSession !== session) {
      return;
    }

    if (response.archive) {
      renderPlayerArchive(response.archive);
      return;
    }

    throw new Error("Прогноз не вернул данные.");
  } catch (error) {
    setBadge("ошибка", "warn");
    if (forecastPanel) {
      forecastPanel.hidden = true;
    }
    setStatus("Прогноз не построился", errorMessage(error));
  } finally {
    collectProgressInFlight = false;
    stopProgressPolling();
    forecastButton.disabled = false;
  }
}

async function collectFromTab(tab, type) {
  try {
    return await sendTabMessage(tab.id, { type });
  } catch (error) {
    if (!isBsportsfanUrl(tab.url)) {
      throw error;
    }

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: [
        "src/shared/pipeline-policy.js",
        "src/shared/start-match-rule.js",
        "src/shared/side-correction-guard.js",
        "src/shared/verified-pair-regime-v1.js",
        "src/content/bsportsfan-parser.js"
      ]
    });
    await delay(150);
    return sendTabMessage(tab.id, { type });
  }
}

async function loadTelegramSettings() {
  try {
    const response = await sendRuntimeMessage({ type: "lvr:getTelegramSettings" });
    const settings = response && response.telegramSettings || {};
    if (telegramEnabled) {
      telegramEnabled.checked = Boolean(settings.enabled);
    }
    if (telegramAutoSend) {
      telegramAutoSend.checked = Boolean(settings.autoSend);
    }
    if (telegramBotToken) {
      telegramBotToken.value = "";
      telegramBotToken.placeholder = settings.botToken ? settings.botToken : "123:ABC";
    }
    if (telegramChatId) {
      telegramChatId.value = settings.chatId || "";
    }
    setTelegramStatus(settings.enabled ? "включен" : "выключен");
  } catch (error) {
    setTelegramStatus(errorMessage(error));
  }
}

async function saveTelegramSettings() {
  try {
    if (telegramSave) {
      telegramSave.disabled = true;
    }
    const current = await sendRuntimeMessage({ type: "lvr:getTelegramSettings" }).catch(() => ({ telegramSettings: {} }));
    const currentSettings = current && current.telegramSettings || {};
    const token = telegramBotToken && telegramBotToken.value.trim()
      ? telegramBotToken.value.trim()
      : currentSettings.botToken && !currentSettings.botToken.endsWith("...")
        ? currentSettings.botToken
        : "";
    const response = await sendRuntimeMessage({
      type: "lvr:setTelegramSettings",
      telegramSettings: {
        enabled: telegramEnabled && telegramEnabled.checked,
        autoSend: telegramAutoSend && telegramAutoSend.checked,
        botToken: token,
        chatId: telegramChatId ? telegramChatId.value.trim() : ""
      }
    });
    const settings = response && response.telegramSettings || {};
    if (telegramBotToken) {
      telegramBotToken.value = "";
      telegramBotToken.placeholder = settings.botToken || "123:ABC";
    }
    const statsStatus = formatTelegramStatsUpdateStatus(response && response.statsMessage);
    setTelegramStatus(statsStatus ? `сохранено · ${statsStatus}` : "сохранено");
    return response;
  } catch (error) {
    setTelegramStatus(errorMessage(error));
    return null;
  } finally {
    if (telegramSave) {
      telegramSave.disabled = false;
    }
  }
}

async function testTelegramSettings() {
  try {
    if (telegramTest) {
      telegramTest.disabled = true;
    }
    const saved = await saveTelegramSettings();
    if (!saved) {
      return;
    }
    const response = await sendRuntimeMessage({ type: "lvr:testTelegram" });
    const statsStatus = formatTelegramStatsUpdateStatus(response && response.statsMessage);
    setTelegramStatus(response && response.sent
      ? `тест отправлен${statsStatus ? ` · ${statsStatus}` : ""}`
      : "тест не отправлен");
  } catch (error) {
    setTelegramStatus(errorMessage(error));
  } finally {
    if (telegramTest) {
      telegramTest.disabled = false;
    }
  }
}

function setTelegramStatus(message) {
  if (telegramStatus) {
    telegramStatus.textContent = message || "";
  }
}

async function loadArchiveDashboard(options = {}) {
  if (archiveDashboardLoading) {
    return;
  }
  archiveDashboardLoading = true;
  const silent = options && options.silent === true;
  try {
    if (!silent) {
      setArchiveActionStatus("Обновляю...");
      setArchiveBusy(true);
    }
    const [datasetResponse, pipelineStatus, scanResponse] = await Promise.all([
      sendRuntimeMessage({ type: "lvr:getTelegramPredictionDataset", includeSummary: true }),
      sendRuntimeMessage({ type: "lvr:getTelegramPipelineStatus" }),
      sendRuntimeMessage({ type: "lvr:getScanStatus" }).catch(() => ({ scanStatus: null }))
    ]);
    const rows = Array.isArray(datasetResponse && datasetResponse.dataset) ? datasetResponse.dataset : [];
    const summary = datasetResponse && datasetResponse.summary || {};
    renderArchiveDashboard(rows, summary, pipelineStatus || {}, scanResponse && scanResponse.scanStatus || null);
    if (!silent) {
      setArchiveActionStatus("");
    }
  } catch (error) {
    if (archiveStatus) {
      archiveStatus.textContent = errorMessage(error);
    }
    renderArchiveItems([
      ["Архив", "ошибка"],
      ["Причина", errorMessage(error)]
    ]);
    if (!silent) {
      setArchiveActionStatus("");
    }
  } finally {
    archiveDashboardLoading = false;
    if (!silent) {
      setArchiveBusy(false);
    }
  }
}

function renderArchiveDashboard(rows, summary, pipelineStatus, scanStatus = null) {
  const list = Array.isArray(rows) ? rows : [];
  const bounds = getArchiveTimeBounds(list);
  const resultRows = Number(summary && summary.resultRows || list.filter(hasDatasetFinalResult).length || 0);
  const pairRegimeForward = summary && summary.pairRegimeForward || {};
  const acceptedPair = pairRegimeForward.accepted || {};
  const rejectedPair = pairRegimeForward.rejected || {};
  const processed = Math.max(0, Number(pairRegimeForward.validEligibleRows || 0));
  const latestDecision = summary && summary.latestProductionDecision || null;
  const openingOddsRows = list.filter(hasArchivedOpeningOdds).length;
  if (archiveStatus) {
    archiveStatus.textContent = bounds.startedAt
      ? `пишется с ${formatDateTime(bounds.startedAt)} · обновлён ${formatDateTime(bounds.updatedAt)}`
      : "архив пуст";
  }

  renderArchiveItems([
    ["Сбор сейчас", formatCurrentCollectorStatus(scanStatus)],
    ["Последняя обработка", formatLatestDecision(latestDecision)],
    ["Матчей обработано", processed],
    ["Отправлено", Math.max(0, Number(acceptedPair.sent || 0))],
    ["Отброшено", Math.max(0, Number(rejectedPair.selected || 0))],
    ["Ждут итог", Math.max(0, Number(acceptedPair.pending || 0))],
    ["Игр в архиве", list.length],
    ["Стартовые кэфы", `${openingOddsRows}/${list.length}`],
    ["Всего итогов", resultRows],
    ["Связь с BSportsFan", formatBsportsfanNetworkStatus(pipelineStatus && pipelineStatus.bsportsfanNetwork)]
  ]);
}

function formatLatestDecision(decision) {
  const decidedAt = Number(decision && decision.decisionAt || 0);
  if (!(decidedAt > 0)) {
    return "ещё не было";
  }
  return `${formatClockTime(decidedAt)} · ${decision.sent ? "отправлен" : "отброшен"}`;
}

function formatClockTime(value) {
  const date = new Date(Number(value || 0));
  const pad = (item) => String(item).padStart(2, "0");
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function hasArchivedOpeningOdds(row) {
  const prematch = row && (row.prematchSnapshot || row.prematch) || {};
  return [
    prematch.referenceMoneylineMarket,
    prematch.moneylineMarket,
    row && row.historicalOpeningMoneyline
  ].some(isReadyHistoricalOpeningMarket);
}

function formatCurrentCollectorStatus(scanStatus) {
  const snapshot = scanStatus && scanStatus.bsportsfan || {};
  const recovery = snapshot.sessionRecovery && typeof snapshot.sessionRecovery === "object"
    ? snapshot.sessionRecovery
    : null;
  if (recovery && recovery.active) {
    if (String(recovery.stage || "") === "manual-required") {
      return "остановлено — откройте BSportsFan и восстановите сессию";
    }
    return "восстанавливаю сессию BSportsFan";
  }
  if (
    String(scanStatus && scanStatus.source || "") === "bsportsfan-protection"
    || snapshot.challenge === true
  ) {
    return "проверка безопасности BSportsFan — откройте вкладку сайта";
  }
  const cipMonitor = snapshot.cipMonitor && typeof snapshot.cipMonitor === "object"
    ? snapshot.cipMonitor
    : null;
  const title = String(snapshot.title || "");
  const textSample = String(snapshot.textSample || "");
  if (/404|не\s+найден|not\s+found/i.test(`${title} ${textSample}`)) {
    return "ошибка страницы 404";
  }
  const visibleRows = Array.isArray(snapshot.matches) ? snapshot.matches.length : 0;
  const lastSeenAt = Number(scanStatus && scanStatus.ts || snapshot.ts || 0);
  const ageSeconds = lastSeenAt > 0
    ? Math.max(0, Math.floor((Date.now() - lastSeenAt) / 1000))
    : null;
  if (ageSeconds !== null && ageSeconds > 30) {
    return `нет обновлений ${ageSeconds} сек. — проверьте вкладку BSportsFan`;
  }
  if (cipMonitor && cipMonitor.active) {
    const states = cipMonitor.forecastStates && typeof cipMonitor.forecastStates === "object"
      ? cipMonitor.forecastStates
      : {};
    const failures = Number(states.cooling || 0)
      + Number(states.terminal || 0)
      + Number(states.notReady || 0);
    return `работает · видно ${Number(cipMonitor.visibleRows || visibleRows)} · ждут старта ${Number(cipMonitor.waitingRows || 0)} · ошибок ${failures}`;
  }
  return snapshot.ts ? `список матчей не открыт · видно ${visibleRows}` : "нет данных";
}

function formatBsportsfanNetworkStatus(network) {
  const snapshot = network && typeof network === "object" ? network : {};
  const active = Math.max(0, Number(snapshot.active || 0));
  const queued = Math.max(0, Number(snapshot.queued || 0));
  const metrics = snapshot.metrics && typeof snapshot.metrics === "object" ? snapshot.metrics : {};
  const protectionOpenUntil = Number(snapshot.protectionOpenUntil || 0);
  if (protectionOpenUntil > Date.now()) {
    return `пауза защиты до ${formatDateTime(protectionOpenUntil)} · очередь очищена`;
  }
  return `активно ${active} · ждут ${queued} · объединено ${Number(metrics.coalesced || 0)} · повышено ${Number(metrics.reprioritized || 0)}`;
}

function renderArchiveItems(items) {
  if (!archiveStats) {
    return;
  }
  archiveStats.innerHTML = (Array.isArray(items) ? items : []).map(([label, value]) => (
    `<div class="archive__item" data-archive-label="${escapeHtml(label)}">
      <div class="archive__label">${escapeHtml(label)}</div>
      <div class="archive__value">${escapeHtml(value)}</div>
    </div>`
  )).join("");
}

function updateArchiveItem(label, value) {
  if (!archiveStats) {
    return;
  }
  const item = Array.from(archiveStats.querySelectorAll(".archive__item"))
    .find((node) => node.dataset.archiveLabel === label);
  const output = item && item.querySelector(".archive__value");
  if (output) {
    output.textContent = String(value ?? "");
  }
}

async function downloadArchiveDataset() {
  await withArchiveButton(archiveDownload, async () => {
    const response = await sendRuntimeMessage({
      type: "lvr:getTelegramPredictionDataset",
      includeSummary: true
    });
    const rows = Array.isArray(response && response.dataset) ? response.dataset : [];
    const summary = response && response.summary || null;
    const pointRows = buildArchivePointRows(rows);
    const ruleRows = buildArchiveRuleRows(summary);
    const stamp = Date.now();
    downloadText(
      JSON.stringify({
        source: "bsportsfan",
        mode: "telegram-prediction-dataset",
        createdAt: new Date().toISOString(),
        summary,
        rows
      }, null, 2),
      `bsportsfan-telegram-prediction-dataset-${rows.length}-${stamp}.json`,
      "application/json;charset=utf-8"
    );
    downloadText(
      buildArchiveGamesCsv(rows),
      `bsportsfan-telegram-prediction-games-${rows.length}-${stamp}.csv`,
      "text/csv;charset=utf-8"
    );
    downloadText(
      buildCsvFromObjects(pointRows),
      `bsportsfan-telegram-prediction-points-${pointRows.length}-${stamp}.csv`,
      "text/csv;charset=utf-8"
    );
    downloadText(
      buildCsvFromObjects(ruleRows),
      `bsportsfan-telegram-prediction-rules-${ruleRows.length}-${stamp}.csv`,
      "text/csv;charset=utf-8"
    );
    setArchiveActionStatus(`Скачано: ${rows.length} игр, ${pointRows.length} point snapshots`);
  });
}

async function clearArchiveDataset() {
  if (!confirm("Удалить весь локальный архив прогнозов и PBP? Перед очисткой его можно скачать.")) {
    return;
  }
  await withArchiveButton(archiveClear, async () => {
    const result = await sendRuntimeMessage({ type: "lvr:clearTelegramPredictionDataset" });
    const message = `Архив очищен: ${Number(result && result.rows || 0)} игр`;
    await loadArchiveDashboard();
    setArchiveActionStatus(message);
  });
}

async function backfillArchiveResults() {
  await withArchiveButton(archiveBackfill, async () => {
    const value = await sendTelegramTabAction({
      action: "runResultAutoBackfill",
      limit: 6,
      minAgeMs: 0,
      delayMs: 300
    });
    const summary = value && value.value || value || {};
    if (isBackfillRunning(summary)) {
      setArchiveActionStatus("Досбор итогов уже выполняется...");
      return;
    }
    const status = String(summary.status || "").trim().toLowerCase();
    if (status === "live-session-recovery") {
      setArchiveActionStatus("Сессия BSportsFan переподключается. Повторите через минуту.");
      return;
    }
    if (status === "another-tab-backfill") {
      const seconds = Math.max(1, Math.ceil(Number(summary.retryAfterMs || 0) / 1000));
      setArchiveActionStatus(`Досбор уже идёт в другой вкладке. Повторите через ${seconds} сек.`);
      return;
    }
    if (status === "not-bsportsfan") {
      setArchiveActionStatus("Откройте вкладку BSportsFan и повторите досбор.");
      return;
    }
    if (status === "bsportsfan-protection") {
      setArchiveActionStatus("BSportsFan включил проверку безопасности. Завершите её во вкладке сайта и повторите досбор.");
      return;
    }
    if (status === "bsportsfan-protection-opened") {
      setArchiveActionStatus("Открыта страница результатов BSportsFan. Завершите проверку — после загрузки итоги дособерутся автоматически.");
      return;
    }
    if (status === "runtime-unavailable") {
      setArchiveActionStatus("Страница обновилась во время досбора. После загрузки итоги дособерутся автоматически.");
      return;
    }
    const visible = summary.visibleSync && typeof summary.visibleSync === "object"
      ? summary.visibleSync
      : {};
    const updated = Number(summary.updated || 0) + Number(visible.updated || 0);
    const alreadyUpdated = Number(summary.alreadyUpdated || 0) + Number(visible.alreadyUpdated || 0);
    const checked = Number(summary.checked || 0) + Number(visible.checked || 0);
    const unresolved = Number(summary.unresolved || 0) + Number(visible.unresolved || 0);
    const notReady = Number(summary.notFinishedOrNotParsed || 0)
      + Number(visible.notFinishedOrNotParsed || 0);
    const failed = Number(summary.failed || 0) + Number(visible.failed || 0);
    const stopped = String(summary.stopped || "").trim().toLowerCase();
    const stopMessage = stopped === "forecast-priority"
      ? " Новые матчи получили приоритет — остальные итоги дособерутся следующим запуском."
      : stopped === "bsportsfan-protection"
        ? " BSportsFan включил проверку безопасности — завершите её во вкладке сайта."
      : stopped
        ? " Досбор остановлен из-за недоступности BSportsFan."
        : "";
    const message = `Итоги: добавлено ${updated}, уже были ${alreadyUpdated}, проверено ${checked}, ждут завершения ${notReady}, не распознано ${unresolved}, ошибок ${failed}.${stopMessage}`;
    const recoveryTotal = Math.max(0, Number(summary.recovery && summary.recovery.total || 0));
    const recoveryMessage = summary.recovery && summary.recovery.started
      ? ` Открыта очередь старых итогов: ${recoveryTotal} матчей.`
      : "";
    setArchiveActionStatus(`${message}${recoveryMessage}`);
    await loadArchiveDashboard();
    const statsUpdate = updated > 0
      ? await sendRuntimeMessage({
          type: "lvr:updateTelegramStatsMessage",
          reason: "result-backfill-completed"
        }).catch(() => null)
      : null;
    const pinStatus = formatTelegramStatsUpdateStatus(statsUpdate);
    setArchiveActionStatus(pinStatus
      ? `${message}${recoveryMessage} Закреп: ${pinStatus}.`
      : `${message}${recoveryMessage}`);
  });
}

async function backfillArchiveOpeningOdds() {
  await withArchiveButton(archiveOddsBackfill, async () => {
    const value = await sendTelegramTabAction({
      action: "runOpeningOddsBackfill",
      limit: 20,
      delayMs: 500
    });
    const summary = value && value.value || value || {};
    if (isBackfillRunning(summary)) {
      setArchiveActionStatus("Досбор стартовых кэфов уже выполняется...");
      return;
    }
    const message = `Стартовые кэфы: добавлено ${summary.updated || 0}, проверено ${summary.checked || 0}, недоступно ${summary.unavailable || 0}, ошибок ${summary.failed || 0}`;
    setArchiveActionStatus(message);
    await loadArchiveDashboard();
    setArchiveActionStatus(message);
  });
}

function normalizeOpeningOddsBackfillMatchUrl(value) {
  return String(value || "")
    .replace("/table-tennis/rs/", "/table-tennis/r/")
    .replace(/[?#].*$/, "")
    .replace(/\/+$/, "");
}

function isReadyHistoricalOpeningMarket(market) {
  return Boolean(market
    && String(market.status || "").toLowerCase() === "ready"
    && String(market.marketType || "").toLowerCase() === "matchresult"
    && String(market.quoteSource || market.preferredSource || "").toLowerCase() === "opening"
    && Number(market.leftOdds) > 1
    && Number(market.rightOdds) > 1);
}

function collectOpeningOddsBackfillCandidates(rows) {
  const matches = new Map();
  for (const row of Array.isArray(rows) ? rows : []) {
    const matchUrl = normalizeOpeningOddsBackfillMatchUrl(row && row.matchUrl || "");
    if (!matchUrl) continue;
    const prematch = row && (row.prematchSnapshot || row.prematch);
    const existing = matches.get(matchUrl) || { matchUrl, matchDateTs: 0, hasOpening: false };
    existing.hasOpening = existing.hasOpening
      || isReadyHistoricalOpeningMarket(prematch && prematch.referenceMoneylineMarket)
      || isReadyHistoricalOpeningMarket(prematch && prematch.moneylineMarket)
      || isReadyHistoricalOpeningMarket(row && row.historicalOpeningMoneyline);
    existing.matchDateTs = existing.matchDateTs
      || Number(prematch && prematch.requestEntryState && prematch.requestEntryState.matchDateTs || 0)
      || Number(prematch && prematch.requestedAt || 0)
      || Number(row && row.createdAt || 0)
      || 0;
    matches.set(matchUrl, existing);
  }
  return [...matches.values()]
    .filter((match) => !match.hasOpening)
    .map(({ matchUrl, matchDateTs }) => ({ matchUrl, matchDateTs }));
}

async function backfillArchiveOpeningOddsFromFiles(files) {
  if (!files.length) return;
  await withArchiveButton(archiveOddsImport, async () => {
    const allRows = [];
    for (const file of files) {
      const payload = JSON.parse(await file.text());
      if (Array.isArray(payload && payload.rows)) allRows.push(...payload.rows);
    }
    const candidates = collectOpeningOddsBackfillCandidates(allRows);
    if (!candidates.length) {
      setArchiveActionStatus("Во выбранных файлах нет матчей без стартовых кэфов");
      return;
    }
    const batchSize = 20;
    const resultRows = [];
    let checked = 0;
    let updated = 0;
    let unavailable = 0;
    let failed = 0;
    for (let offset = 0; offset < candidates.length; offset += batchSize) {
      const batch = candidates.slice(offset, offset + batchSize);
      setArchiveActionStatus(`Стартовые кэфы из файлов: ${offset}/${candidates.length}`);
      const value = await sendTelegramTabAction({
        action: "runOpeningOddsBackfill",
        candidates: batch,
        persistToDataset: false,
        limit: batch.length,
        delayMs: 500
      });
      const summary = value && value.value || value || {};
      if (isBackfillRunning(summary)) {
        setArchiveActionStatus("Досбор стартовых кэфов уже выполняется...");
        return;
      }
      checked += Number(summary.checked || 0);
      updated += Number(summary.updated || 0);
      unavailable += Number(summary.unavailable || 0);
      failed += Number(summary.failed || 0);
      resultRows.push(...(Array.isArray(summary.rows) ? summary.rows : []));
    }
    const sidecarRows = resultRows
      .filter((row) => row && row.status === "updated" && row.historicalOpeningMoneyline)
      .map((row) => ({
        matchUrl: normalizeOpeningOddsBackfillMatchUrl(row.matchUrl),
        historicalOpeningMoneyline: row.historicalOpeningMoneyline
      }));
    const stamp = Date.now();
    downloadText(JSON.stringify({
      schemaVersion: 1,
      source: "bsportsfan-opening-odds-sidecar",
      createdAt: new Date().toISOString(),
      inputFiles: files.map((file) => file.name),
      candidates: candidates.length,
      checked,
      updated,
      unavailable,
      failed,
      rows: sidecarRows
    }, null, 2), `bsportsfan-opening-odds-sidecar-${sidecarRows.length}-${stamp}.json`, "application/json;charset=utf-8");
    setArchiveActionStatus(`Sidecar: добавлено ${updated}/${candidates.length}, недоступно ${unavailable}, ошибок ${failed}`);
  });
}

function isBackfillRunning(summary) {
  return Boolean(
    summary
    && (
      summary.running === true
      || String(summary.status || "").trim().toLowerCase() === "running"
    )
  );
}

async function updatePinnedStats() {
  await withArchiveButton(archiveStatsPin, async () => {
    const response = await sendRuntimeMessage({
      type: "lvr:updateTelegramStatsMessage",
      reason: "popup-recreate",
      recreate: true
    });
    const message = formatTelegramStatsUpdateStatus(response) || "Статистика без изменений";
    setArchiveActionStatus(message);
    await loadArchiveDashboard();
    setArchiveActionStatus(message);
  });
}

function formatTelegramStatsUpdateStatus(response) {
  if (!response || typeof response !== "object") {
    return "";
  }
  const created = Number(response.created || 0);
  const edited = Number(response.edited || 0);
  const unchanged = Number(response.unchanged || 0);
  const pinned = Number(response.pinned || 0);
  const errors = (Array.isArray(response.errors) ? response.errors : [])
    .map((item) => String(item || "").trim())
    .filter(Boolean);
  if (created > 0) {
    return pinned > 0
      ? "статистика создана и закреплена"
      : `статистика создана, но не закреплена${errors.length ? `: ${errors[0]}` : ""}`;
  }
  if (edited > 0) {
    return "статистика обновлена";
  }
  if (unchanged > 0) {
    return "статистика без изменений";
  }
  const error = errors[0] || response.error || response.reason || "не создана";
  return `статистика не создана: ${error}`;
}

async function reloadExtension() {
  if (extensionReload) {
    extensionReload.disabled = true;
  }
  setArchiveBusy(true, extensionReload);
  setArchiveActionStatus("Подготавливаю безопасный перезапуск...");
  await Promise.race([
    sendRuntimeMessage({ type: "lvr:prepareExtensionReload" }).catch(() => null),
    delay(EXTENSION_RELOAD_PREPARE_TIMEOUT_MS)
  ]);
  setArchiveActionStatus("Перезапускаю расширение...");
  window.setTimeout(() => {
    chrome.runtime.reload();
  }, 150);
}

async function withArchiveButton(button, action) {
  try {
    if (button) {
      button.disabled = true;
    }
    setArchiveBusy(true, button);
    await action();
  } catch (error) {
    setArchiveActionStatus(errorMessage(error));
  } finally {
    setArchiveBusy(false);
    if (button) {
      button.disabled = false;
    }
  }
}

function setArchiveBusy(busy, exceptButton = null) {
  [
    archiveRefresh,
    archiveDownload,
    archiveBackfill,
    archiveOddsBackfill,
    archiveOddsImport,
    archiveStatsPin,
    archiveClear,
    extensionReload
  ].forEach((button) => {
    if (button && button !== exceptButton) {
      button.disabled = Boolean(busy);
    }
  });
}

function setArchiveActionStatus(message) {
  if (archiveActionStatus) {
    archiveActionStatus.textContent = message || "";
  }
}

async function sendTelegramTabAction(detail) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id || !isBsportsfanUrl(tab.url)) {
    throw new Error("Открой активную вкладку bsportsfan для этой операции.");
  }
  try {
    const response = await sendTabMessage(tab.id, { type: "lvr:telegramAction", detail });
    if (response && response.ok === false) {
      throw new Error(response.error || "tab action error");
    }
    return response || {};
  } catch (error) {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: [
        "src/shared/pipeline-policy.js",
        "src/shared/start-match-rule.js",
        "src/shared/side-correction-guard.js",
        "src/shared/verified-pair-regime-v1.js",
        "src/content/bsportsfan-parser.js"
      ]
    });
    await delay(150);
    const response = await sendTabMessage(tab.id, { type: "lvr:telegramAction", detail });
    if (response && response.ok === false) {
      throw new Error(response.error || "tab action error");
    }
    return response || {};
  }
}

function startProgressPolling() {
  if (collectProgressTimer) {
    return;
  }

  let latest = 0;
  const tick = async () => {
    if (!collectProgressInFlight || collectProgressBusy) {
      return;
    }

    collectProgressBusy = true;
    try {
      const payload = await sendRuntimeMessage({ type: "lvr:getScanStatus" });
      const status = payload && payload.scanStatus;
      if (!status || status.source !== "bsportsfan-progress") {
        return;
      }

      if (Number(status.ts) <= latest) {
        return;
      }
      latest = Number(status.ts) || Date.now();

      const players = Array.isArray(status.players) ? status.players.filter(Boolean) : [];
      const meta = buildProgressMeta(status);
      setStatus(status.message || "Сбор...", meta);
      setStatusDetails(players.length ? players : ["Собираю статистику..."]);
    } catch (_) {
      // keep polling silently; background may temporarily be unavailable
    } finally {
      collectProgressBusy = false;
    }
  };

  collectProgressTimer = window.setInterval(tick, 650);
  tick();
}

function stopProgressPolling() {
  if (collectProgressTimer) {
    window.clearInterval(collectProgressTimer);
  }
  collectProgressTimer = 0;
}

function buildProgressMeta(status) {
  const parts = [];
  if (Number.isFinite(Number(status.fetched))) {
    if (Number.isFinite(Number(status.candidates))) {
      parts.push(`прочитано ${status.fetched}/${status.candidates}`);
    } else {
      parts.push(`прочитано ${status.fetched}`);
    }
  }
  if (Number.isFinite(Number(status.skipped))) {
    parts.push(`пропущено ${status.skipped}`);
  }
  if (Number.isFinite(Number(status.totalPerPlayer))) {
    parts.push(`цель ${status.totalPerPlayer} матчей`);
  }
  return parts.join(" · ");
}

function setStatusDetails(lines) {
  renderDetails(lines);
}

function renderPlayerArchive(archive) {
  const forecast = buildCurrentForecastView(archive);
  const isReady = forecast.status === "ready";
  const isTtCupWithoutTelegram = forecast.status === "shadow";
  setBadge(isReady ? "прогноз" : isTtCupWithoutTelegram ? "без отправки" : "пропуск", isReady ? "ok" : "warn");
  setStatus(
    forecast.label,
    forecast.title
  );
  renderForecastPanel(forecast, archive);
  renderDetails(formatPlayerArchiveLines(archive));
}

function renderForecastPanel(forecast, archive) {
  const players = Array.isArray(archive && archive.players) ? archive.players : [];
  const leftName = players[0] && players[0].name ? players[0].name : "#1";
  const rightName = players[1] && players[1].name ? players[1].name : "#2";
  const scores = Array.isArray(forecast && forecast.scores) ? forecast.scores : [];
  const pair = forecast && forecast.pair || {};
  if (!forecastPanel || !forecast || scores.length !== 2) {
    if (forecastPanel) {
      forecastPanel.hidden = true;
    }
    return;
  }

  forecastPanel.hidden = false;
  forecastWinner.textContent = forecast.status === "ready"
    ? `2+ сета: ${forecast.player}`
    : forecast.status === "shadow"
      ? `Расчёт без отправки: ${forecast.player}`
      : forecast.status === "blocked"
        ? "Лига не допущена"
        : `Выбран ${forecast.player}, но боевой фильтр не пройден`;
  forecastBars.innerHTML = [
    `<div class="forecast__bar">
      <div class="forecast__bar-label">
        <span>${escapeHtml(leftName)}</span>
        <span class="forecast__bar-value ${forecast.sideIndex === 0 ? "forecast__bar-value--winner" : ""}">${formatScoreTriple(scores[0])}</span>
      </div>
    </div>`,
    `<div class="forecast__bar">
      <div class="forecast__bar-label">
        <span>${escapeHtml(rightName)}</span>
        <span class="forecast__bar-value ${forecast.sideIndex === 1 ? "forecast__bar-value--winner" : ""}">${formatScoreTriple(scores[1])}</span>
      </div>
    </div>`
  ].join("");

  forecastMeta.textContent = "Сила / стабильность / форма";
  const filterStatus = pair.dataReady !== true
    ? "не хватает данных"
    : pair.accepted
      ? "пройден"
      : "не пройден";
  const decisionSource = pair.marketSideOverrideApplied
    ? "сильный фаворит по стартовым кэфам"
    : pair.marketSalvageAccepted && !pair.moderateAccepted
      ? "история подтверждена стартовыми кэфами"
      : "история и PBP";
  const marketStatus = pair.marketReady
    ? `${formatOptionalNumber(pair.marketLeftOdds)} · ${formatOptionalNumber(pair.marketRightOdds)}`
    : "нет — используется PBP";
  forecastFactors.innerHTML = [
    `<div class="forecast__factor"><span>Боевой фильтр</span><strong>${filterStatus}</strong></div>`,
    `<div class="forecast__factor"><span>Решение</span><strong>${escapeHtml(decisionSource)}</strong></div>`,
    `<div class="forecast__factor"><span>Стартовые кэфы</span><strong>${escapeHtml(marketStatus)}</strong></div>`
  ].join("");
}

function buildCurrentForecastView(archive) {
  const players = Array.isArray(archive && archive.players) ? archive.players.slice(0, 2) : [];
  const selector = globalThis.LvrStartMatchRule;
  const pairRule = globalThis.LvrVerifiedPairRegimeV1;
  if (players.length !== 2 || !selector || !pairRule) {
    return {
      status: "not-ready",
      label: "Прогноз не готов",
      title: "Не хватает игроков или актуального модуля расчёта.",
      scores: []
    };
  }

  const profiles = players.map(buildPopupStartProfile);
  const selection = selector.evaluate({
    profiles,
    players: players.map((player) => player && player.name || "")
  });
  if (!selection || !selection.eligible || (selection.sideIndex !== 0 && selection.sideIndex !== 1)) {
    return {
      status: "not-ready",
      label: "Прогноз не готов",
      title: formatSelectorReason(selection && selection.reason),
      scores: Array.isArray(selection && selection.scores) ? selection.scores : []
    };
  }

  const leagueName = getArchiveLeagueName(archive && archive.league);
  const decisionAt = Date.now();
  const moneylineMarket = buildPopupOpeningMoneylineMarket(
    archive && archive.targetOdds,
    decisionAt
  );
  const pair = pairRule.evaluate({
    profiles,
    selectedSideIndex: selection.sideIndex,
    pointWindowSize: selection.pointWindowSize,
    relativeAgreementScore: selection.sideCorrection && selection.sideCorrection.agreementScore,
    latestPbpReversal: selection.sideCorrection && selection.sideCorrection.latestReversal,
    leagueName,
    moneylineMarket,
    decisionAt
  });
  const finalSideIndex = pair.selectedSideIndex === 0
    || pair.selectedSideIndex === 1
    ? pair.selectedSideIndex
    : selection.sideIndex;
  const formulaAccepted = pair && (
    pair.moderateAccepted === true || pair.marketSalvageAccepted === true
  );
  const productionAccepted = pair && pair.accepted === true;
  const shadowAccepted = formulaAccepted && pair && pair.shadowOnly === true;
  const player = players[finalSideIndex] && players[finalSideIndex].name || `#${finalSideIndex + 1}`;
  const label = productionAccepted
    ? "Прогноз · боевой фильтр"
    : shadowAccepted
      ? "TT Cup · расчёт без отправки"
      : pair && pair.leagueClass === "blocked"
        ? "Лига не допущена"
        : "Нет сигнала";
  const title = productionAccepted
    ? `${player} должен взять минимум два сета`
    : shadowAccepted
      ? `${player} прошёл фильтр, но Telegram для TT Cup выключен`
      : pair && pair.leagueClass === "blocked"
        ? `Лига не входит в разрешённый список: ${leagueName || "не определена"}`
        : `${player} выбран моделью, но не прошёл боевой фильтр`;
  return {
    status: productionAccepted
      ? "ready"
      : shadowAccepted
        ? "shadow"
        : pair && pair.leagueClass === "blocked"
          ? "blocked"
          : "pass",
    label,
    title,
    player,
    sideIndex: finalSideIndex,
    scores: selection.scores,
    pair
  };
}

function buildPopupOpeningMoneylineMarket(value, decisionAt) {
  const source = value && typeof value === "object" ? value : {};
  if (source.retrospective === true || Number(source.backfilledAt || 0) > 0) {
    return null;
  }
  const opening = source.opening && typeof source.opening === "object"
    ? source.opening
    : null;
  const leftOdds = Number(opening && opening.leftOdds);
  const rightOdds = Number(opening && opening.rightOdds);
  if (!(leftOdds > 1) || !(rightOdds > 1)) {
    return null;
  }
  return {
    status: "ready",
    marketType: "matchResult",
    quoteSource: "opening",
    usage: "model-input",
    modelInput: true,
    retrospective: false,
    leftOdds,
    rightOdds,
    observedAt: decisionAt
  };
}

function buildPopupStartProfile(player) {
  const history = summarizePopupScoreHistory(player && player.scoreHistory);
  const point = player && player.pointProfile && typeof player.pointProfile === "object"
    ? player.pointProfile
    : {};
  return {
    identityKey: String(point.playerKey || ""),
    history: {
      matches: history.matches,
      freshForm3Score: history.freshForm3Score,
      windows: history.windows
    },
    point: {
      matches: Number(point.pointMatches || 0),
      latest: point.latest || null,
      windows: point.windows || {}
    }
  };
}

function summarizePopupScoreHistory(history) {
  const rows = (Array.isArray(history) ? history : []).flatMap((item) => {
    const scoreMatch = String(item && (item.score || item.finalScore) || "").match(/(\d+)\s*-\s*(\d+)/);
    const ownSets = finiteOrNull(item && item.ownSets) ?? (scoreMatch ? Number(scoreMatch[1]) : null);
    const opponentSets = finiteOrNull(item && item.opponentSets) ?? (scoreMatch ? Number(scoreMatch[2]) : null);
    return ownSets === null || opponentSets === null ? [] : [{ ownSets, opponentSets }];
  });
  const windows = Object.fromEntries([8, 5, 3].map((size) => [
    size,
    summarizePopupScoreWindow(rows.slice(0, size))
  ]));
  const weights = [0.5, 0.3, 0.2];
  const freshRows = rows.slice(0, weights.length);
  const weightTotal = freshRows.reduce((sum, _, index) => sum + weights[index], 0);
  const freshForm3Score = weightTotal
    ? Math.round(freshRows.reduce((sum, row, index) => sum + popupFreshFormScore(row) * weights[index], 0) / weightTotal)
    : null;
  return { matches: rows.length, windows, freshForm3Score };
}

function summarizePopupScoreWindow(rows) {
  const list = Array.isArray(rows) ? rows : [];
  const matches = list.length;
  const tookTwo = list.filter((row) => row.ownSets >= 2).length;
  const sweepLosses = list.filter((row) => row.ownSets === 0).length;
  const oneSetLosses = list.filter((row) => row.ownSets === 1).length;
  const setsFor = list.reduce((sum, row) => sum + row.ownSets, 0);
  const setsAgainst = list.reduce((sum, row) => sum + row.opponentSets, 0);
  const totalSets = setsFor + setsAgainst;
  const performance = matches
    ? list.reduce((sum, row) => sum + popupFreshFormScore(row), 0) / matches
    : null;
  return {
    matches,
    tookTwo,
    tookTwoPct: matches ? roundOneDecimal(100 * tookTwo / matches) : null,
    sweepLosses,
    oneSetLosses,
    setSharePct: totalSets ? roundOneDecimal(100 * setsFor / totalSets) : null,
    performancePct: performance === null ? null : roundOneDecimal(performance)
  };
}

function popupFreshFormScore(row) {
  const ownSets = Number(row && row.ownSets);
  const opponentSets = Number(row && row.opponentSets);
  if (ownSets >= 3) return 100;
  if (ownSets === 2) return 75;
  if (ownSets === 1) return 35;
  if (ownSets === 0) return 5;
  return Math.min(100, Math.max(0, 20 + ownSets * 25 + (ownSets - opponentSets) * 8));
}

function formatScoreTriple(score) {
  return [score && score.strength, score && score.stability, score && score.form]
    .map(formatOptionalNumber)
    .join(" / ");
}

function formatOptionalNumber(value) {
  const number = finiteOrNull(value);
  return number === null ? "—" : formatCompactNumber(number);
}

function formatSelectorReason(reason) {
  const labels = {
    "start-player-identity-incomplete": "Не удалось подтвердить личности обоих игроков.",
    "start-profile-incomplete": "Не хватает истории или PBP для текущей модели.",
    "start-profile-tie": "Модель не смогла выбрать сторону."
  };
  return labels[String(reason || "")] || "Расчёт текущей модели не готов.";
}

function getArchiveLeagueName(value) {
  if (typeof value === "string") return value.trim();
  return value && typeof value === "object"
    ? String(value.name || value.leagueName || "").trim()
    : "";
}

function formatPlayerArchiveLines(archive) {
  const players = Array.isArray(archive && archive.players) ? archive.players : [];
  const lines = [];
  const leagueName = getArchiveLeagueName(archive && archive.league);
  if (leagueName) lines.push(`Лига: ${leagueName}`);
  lines.push(`История: ${players.map((player) => `${player.name} ${Array.isArray(player.scoreHistory) ? player.scoreHistory.length : 0}`).join(" / ")}`);
  lines.push(`PBP: ${players.map((player) => `${player.name} ${Number(player && player.pointProfile && player.pointProfile.pointMatches || 0)}`).join(" / ")}`);
  const odds = getArchiveDisplayOdds(archive && archive.targetOdds);
  if (odds) {
    lines.push(`Кэфы на победу: ${players[0] && players[0].name || "#1"} ${odds.left} · ${players[1] && players[1].name || "#2"} ${odds.right}`);
  }
  if (archive && (Array.isArray(archive.errors) && archive.errors.length || Array.isArray(archive.diagnostics) && archive.diagnostics.length)) {
    const diagnostics = Array.isArray(archive.diagnostics) ? archive.diagnostics : [];
    lines.push(`Ошибок сбора: ${diagnostics.length || archive.errors.length}`);
    diagnostics.slice(0, 3).forEach((item) => {
      if (item && item.reason) {
        lines.push(`Причина: ${item.reason}`);
      }
    });
  }
  return lines;
}

function getArchiveDisplayOdds(value) {
  const source = value && typeof value === "object" ? value : {};
  const quote = source.opening || source.preferred || source.matchStart || source.last || null;
  const left = Number(quote && quote.leftOdds);
  const right = Number(quote && quote.rightOdds);
  return left > 1 && right > 1 ? { left, right } : null;
}

function renderDetails(lines) {
  const list = (Array.isArray(lines) ? lines : []).filter(Boolean);
  details.hidden = list.length === 0;
  details.innerHTML = list.map((line) => (
    `<div class="details__row">${escapeHtml(line)}</div>`
  )).join("");
}

function getArchiveTimeBounds(rows) {
  const timestamps = (Array.isArray(rows) ? rows : [])
    .flatMap((row) => [
      row && row.createdAt,
      row && row.updatedAt,
      row && row.settledAt,
      row && row.prematch && row.prematch.ts,
      row && row.prematchSnapshot && row.prematchSnapshot.ts,
      row && row.finalResult && row.finalResult.settledAt,
      ...(Array.isArray(row && row.pointTimeline) ? row.pointTimeline.map((entry) => entry && entry.ts) : [])
    ])
    .map((value) => Number(value || 0))
    .filter((value) => Number.isFinite(value) && value > 0);
  return {
    startedAt: timestamps.length ? Math.min(...timestamps) : 0,
    updatedAt: timestamps.length ? Math.max(...timestamps) : 0
  };
}

function hasDatasetFinalResult(row) {
  return Boolean(row && (
    row.finalResult
    || row.result
    || row.finalScore
    || row.actualScore
    || row.resultStatus === "hit"
    || row.resultStatus === "miss"
  ));
}

function countPointSnapshots(rows) {
  return (Array.isArray(rows) ? rows : []).reduce((total, row) => {
    const points = Array.isArray(row && row.pointTimeline)
      ? row.pointTimeline
      : Array.isArray(row && row.pointByPoint)
        ? row.pointByPoint
        : [];
    return total + points.length;
  }, 0);
}

function formatStatsHit(bucket) {
  const hit = bucket && bucket.hit ? bucket.hit : "0/0";
  return bucket && bucket.hitRatePct !== "" && bucket.hitRatePct !== undefined
    ? `${hit} (${bucket.hitRatePct}%)`
    : hit;
}

function formatPairCohortStatus(summary) {
  const safe = summary && typeof summary === "object" ? summary : {};
  const cohort = Math.max(0, Number(safe.cohortSize || 0));
  const settled = Math.max(0, Number(safe.baseline && safe.baseline.settled || 0));
  const invalid = Math.max(0, Number(safe.invalidTaggedRows || 0));
  const invalidText = invalid ? ` · невалидно ${invalid}` : "";
  return `в проде · наблюдение ${cohort} · закрыто ${settled}${invalidText}`;
}

function formatPairCohortBucket(bucket, cohortSize) {
  const safe = bucket && typeof bucket === "object" ? bucket : {};
  const selected = Math.max(0, Number(safe.selected || 0));
  const cohort = Math.max(0, Number(cohortSize || 0));
  const coverage = safe.coveragePct !== "" && safe.coveragePct !== undefined
    ? ` (${formatCompactNumber(safe.coveragePct)}%)`
    : "";
  return `${formatStatsHit(safe)} · отбор ${selected}/${cohort}${coverage}`;
}

function formatTelegramDeliveryStatus(value) {
  if (!value || typeof value !== "object") {
    return "-";
  }
  const reason = String(value.reason || "").trim();
  const labels = {
    sent: "отправлено",
    "sent-partial": "отправлено частично",
    duplicate: "дубликат",
    "telegram-disabled": "Telegram выключен",
    "match-start-trigger-invalid": "не подтверждён старт матча",
    "match-start-delivery-expired": "первый сет уже закончился",
    "match-start-state-stale": "снимок старта устарел",
    "match-start-profile-missing": "не хватает истории/PBP",
    "match-start-decision-mismatch": "решение не прошло повторную проверку",
    "match-start-pair-regime-mismatch": "решение PBP-фильтра не прошло повторную проверку",
    "match-start-action-mismatch": "действие прогноза не совпало",
    "collapse-combination-qualified": "PBP-фильтр пройден",
    "collapse-combination-rejected": "PBP-фильтр не пройден",
    "production-collapse-qualified": "пройдена базовая PBP-комбинация",
    "production-strength-exception-qualified": "возвращён по PBP Strength",
    "production-history-share-exception-qualified": "возвращён по стабильности сетов",
    "production-relative-form-exception-qualified": "возвращён по форме и сетам",
    "production-market-consensus-salvage-qualified": "возвращён по подтверждению стартовыми кэфами",
    "production-combination-rejected": "боевой фильтр не пройден",
    "collapse-profiles-missing": "не хватает профилей игроков",
    "collapse-selected-side-missing": "не выбрана сторона прогноза",
    "collapse-common-window-missing": "нет общего PBP-окна",
    "collapse-metrics-missing": "не хватает PBP для фильтра",
    "collapse-league-blocked": "лига не разрешена",
    "production-pbp-filter-missing": "модуль PBP-фильтра не загрузился",
    "accepted-match-start-production-gate": "прогноз принят боевым фильтром",
    "tt-cup-shadow-only": "TT Cup сохранён, Telegram выключен",
    "verified-pair-regimes-rejected": "старый PBP-фильтр не пройден",
    "verified-pair-profiles-missing": "не хватает профилей игроков",
    "verified-pair-selected-side-missing": "не выбрана сторона прогноза",
    "verified-pair-common-window-missing": "нет общего PBP-окна",
    "verified-pair-metrics-missing": "не хватает PBP для фильтра",
    "verified-pair-league-blocked": "лига не разрешена",
    "verified-pair-regime-qualified": "старый PBP-фильтр пройден"
  };
  const status = value.sent === true || value.edited === true
    ? value.edited === true ? "обновлено" : "отправлено"
    : labels[reason] || reason || "не отправлено";
  return `${status} · ${formatDateTime(value.ts)}`;
}

function buildArchiveGamesCsv(rows) {
  const currentProtocol = globalThis.LvrVerifiedPairRegimeV1
    && globalThis.LvrVerifiedPairRegimeV1.PROTOCOL || {};
  const currentProtocolId = String(currentProtocol.id || "");
  const currentGateId = String(currentProtocol.gateId || "");
  const keys = [
    "matchUrl",
    "recordKind",
    "createdAt",
    "players",
    "leftPlayer",
    "rightPlayer",
    "leftWinOdds",
    "rightWinOdds",
    "winOddsSource",
    "winOddsObservedAt",
    "protocolId",
    "gateId",
    "selectorInputHash",
    "decisionInputHash",
    "selectorFormulaId",
    "z0Score",
    "z0LeftP",
    "z0RightP",
    "z0LeftS3",
    "z0RightS3",
    "z0LeftL",
    "z0RightL",
    "z0LeftF3",
    "z0RightF3",
    "legacySelectedSideIndex",
    "legacyRawScoreDelta",
    "signalMode",
    "pbpFilterAccepted",
    "pbpPointWindow",
    "pairBaseSelectedSideIndex",
    "marketReady",
    "marketReason",
    "marketFavoriteSideIndex",
    "marketFavoriteProbability",
    "marketSideOverrideApplied",
    "marketSalvageAccepted",
    "baseSelectedSideIndex",
    "historySelectedSideIndex",
    "selectedSideIndex",
    "sideGuardRuleId",
    "sideGuardHistorySideIndex",
    "sideGuardBaseSideIndex",
    "sideGuardSelectedSideIndex",
    "sideGuardSelectedSource",
    "sideGuardSidesDisagree",
    "sideGuardWindowSize",
    "sideGuardQualifyingSettled",
    "sideGuardPairOutcomes",
    "sideGuardPairSum",
    "sideGuardReason",
    "sideGuardInputHash",
    "sideGuardStateCutoffAt",
    "sideGuardStateThroughSettledAt",
    "sideGuardStateHash",
    "sideGuardStateSource",
    "sideGuardStateSourceCount",
    "finalDecisionAt",
    "historySideCorrectionApplied",
    "historySideCorrectionReason",
    "relativeAgreementScore",
    "latestPbpReversal",
    "livePointCorrectionRuleId",
    "livePointCorrectionApplied",
    "livePointCorrectionThreshold",
    "livePointCorrectionSelectedLead",
    "livePointCorrectionLeftPoints",
    "livePointCorrectionRightPoints",
    "livePointCorrectionReason",
    "leftCollapseCount",
    "rightCollapseCount",
    "collapseSum",
    "collapseDifference",
    "collapseSumWithinLimit",
    "collapseCountsUnequal",
    "collapseAccepted",
    "selectedStrengthScore",
    "opponentStrengthScore",
    "selectedStrengthEdge",
    "strongSelectedStrengthException",
    "selectedHistoryMatches",
    "selectedHistorySetSharePct",
    "selectedHistorySetShareException",
    "selectedFreshForm3Score",
    "opponentFreshForm3Score",
    "selectedHistory5WindowMatches",
    "opponentHistory5WindowMatches",
    "selectedHistory5SetSharePct",
    "opponentHistory5SetSharePct",
    "selectedHistory5SetShareEdge",
    "selectedHistory8PerformancePct",
    "opponentHistory8PerformancePct",
    "relativeHistoryWindowReady",
    "selectedFreshAtOrAboveHistory8",
    "opponentFreshAtOrAboveHistory8",
    "relativeFormSetShareException",
    "decision",
    "sent",
    "finalScore",
    "resultStatus",
    "pointSnapshots"
  ];
  const lines = [keys.map(csvCell).join(",")];
  for (const row of Array.isArray(rows) ? rows : []) {
    const prematch = row && (row.prematch || row.prematchSnapshot) || {};
    const features = {
      ...(prematch.audit && prematch.audit.decision && prematch.audit.decision.features || {}),
      ...(prematch.features || {})
    };
    const protocolId = String(features.startMatchPairRegimeProtocolId || "");
    const pairGateId = String(features.startMatchPairRegimeGateId || "");
    const productionGateId = String(features.startMatchProductionGateId || "");
    const gateId = pairGateId || productionGateId;
    const storedGateIds = [pairGateId, productionGateId].filter(Boolean);
    const isCurrentCollapseGate = protocolId === currentProtocolId
      && storedGateIds.length > 0
      && storedGateIds.every((value) => value === currentGateId);
    const finalResult = row && (row.finalResult || row.result) || {};
    const players = Array.isArray(row && row.players) ? row.players.slice(0, 2) : [];
    const winOdds = row && row.historicalOpeningMoneyline
      || prematch.referenceMoneylineMarket
      || prematch.moneylineMarket
      || {};
    const points = Array.isArray(row && row.pointTimeline)
      ? row.pointTimeline
      : Array.isArray(row && row.pointByPoint)
        ? row.pointByPoint
        : [];
    const values = {
      matchUrl: row && row.matchUrl || "",
      recordKind: row && row.recordKind || "",
      createdAt: formatDateTime(row && row.createdAt),
      players: players.join(" vs "),
      leftPlayer: players[0] || "",
      rightPlayer: players[1] || "",
      leftWinOdds: Number(winOdds.leftOdds) > 1 ? Number(winOdds.leftOdds) : "",
      rightWinOdds: Number(winOdds.rightOdds) > 1 ? Number(winOdds.rightOdds) : "",
      winOddsSource: winOdds.source || winOdds.quoteSource || winOdds.preferredSource || "",
      winOddsObservedAt: formatDateTime(winOdds.observedAt),
      protocolId,
      gateId,
      selectorInputHash: features.startMatchInputHash || "",
      decisionInputHash: features.startMatchDecisionInputHash || "",
      selectorFormulaId: features.startMatchFormulaId || "",
      z0Score: features.startMatchZ0Score ?? "",
      z0LeftP: features.startMatchZ0LeftP ?? "",
      z0RightP: features.startMatchZ0RightP ?? "",
      z0LeftS3: features.startMatchZ0LeftS3 ?? "",
      z0RightS3: features.startMatchZ0RightS3 ?? "",
      z0LeftL: features.startMatchZ0LeftL ?? "",
      z0RightL: features.startMatchZ0RightL ?? "",
      z0LeftF3: features.startMatchZ0LeftF3 ?? "",
      z0RightF3: features.startMatchZ0RightF3 ?? "",
      legacySelectedSideIndex: features.startMatchLegacySelectedSideIndex ?? "",
      legacyRawScoreDelta: features.startMatchLegacyRawScoreDelta ?? "",
      signalMode: features.startMatchSignalMode || prematch.signalMode || "",
      pbpFilterAccepted: isCurrentCollapseGate ? features.startMatchPairRegimeModerateAccepted ?? "" : "",
      pbpPointWindow: isCurrentCollapseGate ? features.startMatchPairRegimePointWindowSize ?? "" : "",
      pairBaseSelectedSideIndex: isCurrentCollapseGate
        ? features.startMatchPairRegimeBaseSelectedSideIndex ?? ""
        : "",
      marketReady: isCurrentCollapseGate ? features.startMatchPairRegimeMarketReady ?? "" : "",
      marketReason: isCurrentCollapseGate ? features.startMatchPairRegimeMarketReason || "" : "",
      marketFavoriteSideIndex: isCurrentCollapseGate
        ? features.startMatchPairRegimeMarketFavoriteSideIndex ?? ""
        : "",
      marketFavoriteProbability: isCurrentCollapseGate
        ? features.startMatchPairRegimeMarketFavoriteProbability ?? ""
        : "",
      marketSideOverrideApplied: isCurrentCollapseGate
        ? features.startMatchPairRegimeMarketSideOverrideApplied ?? ""
        : "",
      marketSalvageAccepted: isCurrentCollapseGate
        ? features.startMatchPairRegimeMarketSalvageAccepted ?? ""
        : "",
      baseSelectedSideIndex: features.startMatchBaseSelectedSideIndex ?? "",
      historySelectedSideIndex: features.startMatchHistorySelectedSideIndex ?? "",
      selectedSideIndex: features.startMatchSelectedSideIndex
        ?? prematch.sideIndex
        ?? (row && row.sideIndex)
        ?? "",
      sideGuardRuleId: features.startMatchSideGuardRuleId || "",
      sideGuardHistorySideIndex: features.startMatchSideGuardHistorySideIndex ?? "",
      sideGuardBaseSideIndex: features.startMatchSideGuardBaseSideIndex ?? "",
      sideGuardSelectedSideIndex: features.startMatchSideGuardSelectedSideIndex ?? "",
      sideGuardSelectedSource: features.startMatchSideGuardSelectedSource || "",
      sideGuardSidesDisagree: features.startMatchSideGuardSidesDisagree ?? "",
      sideGuardWindowSize: features.startMatchSideGuardWindowSize ?? "",
      sideGuardQualifyingSettled: features.startMatchSideGuardQualifyingSettled ?? "",
      sideGuardPairOutcomes: Array.isArray(features.startMatchSideGuardPairOutcomes)
        ? JSON.stringify(features.startMatchSideGuardPairOutcomes)
        : "",
      sideGuardPairSum: features.startMatchSideGuardPairSum ?? "",
      sideGuardReason: features.startMatchSideGuardReason || "",
      sideGuardInputHash: features.startMatchSideGuardInputHash || "",
      sideGuardStateCutoffAt: formatDateTime(features.startMatchSideGuardStateCutoffAt),
      sideGuardStateThroughSettledAt: formatDateTime(
        features.startMatchSideGuardStateThroughSettledAt
      ),
      sideGuardStateHash: features.startMatchSideGuardStateHash || "",
      sideGuardStateSource: features.startMatchSideGuardStateSource || "",
      sideGuardStateSourceCount: features.startMatchSideGuardStateSourceCount ?? "",
      finalDecisionAt: formatDateTime(prematch.finalDecisionAt),
      historySideCorrectionApplied: features.startMatchSideCorrectionApplied ?? "",
      historySideCorrectionReason: features.startMatchSideCorrectionReason ?? "",
      relativeAgreementScore: features.startMatchRelativeAgreementScore ?? "",
      latestPbpReversal: features.startMatchLatestPbpReversal ?? "",
      livePointCorrectionRuleId: features.startMatchLivePointCorrectionRuleId || "",
      livePointCorrectionApplied: features.startMatchLivePointCorrectionApplied ?? "",
      livePointCorrectionThreshold: features.startMatchLivePointCorrectionThreshold ?? "",
      livePointCorrectionSelectedLead: features.startMatchLivePointCorrectionSelectedLead ?? "",
      livePointCorrectionLeftPoints: features.startMatchLivePointCorrectionLeftPoints ?? "",
      livePointCorrectionRightPoints: features.startMatchLivePointCorrectionRightPoints ?? "",
      livePointCorrectionReason: features.startMatchLivePointCorrectionReason || "",
      leftCollapseCount: isCurrentCollapseGate ? features.startMatchPairRegimeLeftCollapseCount ?? "" : "",
      rightCollapseCount: isCurrentCollapseGate ? features.startMatchPairRegimeRightCollapseCount ?? "" : "",
      collapseSum: isCurrentCollapseGate ? features.startMatchPairRegimeCollapseSum ?? "" : "",
      collapseDifference: isCurrentCollapseGate ? features.startMatchPairRegimeCollapseDifference ?? "" : "",
      collapseSumWithinLimit: isCurrentCollapseGate ? features.startMatchPairRegimeSumWithinLimit ?? "" : "",
      collapseCountsUnequal: isCurrentCollapseGate ? features.startMatchPairRegimeCountsUnequal ?? "" : "",
      collapseAccepted: isCurrentCollapseGate ? features.startMatchPairRegimeCollapseAccepted ?? "" : "",
      selectedStrengthScore: isCurrentCollapseGate ? features.startMatchPairRegimeSelectedStrengthScore ?? "" : "",
      opponentStrengthScore: isCurrentCollapseGate ? features.startMatchPairRegimeOpponentStrengthScore ?? "" : "",
      selectedStrengthEdge: isCurrentCollapseGate ? features.startMatchPairRegimeSelectedStrengthEdge ?? "" : "",
      strongSelectedStrengthException: isCurrentCollapseGate ? features.startMatchPairRegimeStrongSelectedStrengthException ?? "" : "",
      selectedHistoryMatches: isCurrentCollapseGate ? features.startMatchPairRegimeSelectedHistoryMatches ?? "" : "",
      selectedHistorySetSharePct: isCurrentCollapseGate ? features.startMatchPairRegimeSelectedHistorySetSharePct ?? "" : "",
      selectedHistorySetShareException: isCurrentCollapseGate ? features.startMatchPairRegimeSelectedHistorySetShareException ?? "" : "",
      selectedFreshForm3Score: isCurrentCollapseGate ? features.startMatchPairRegimeSelectedFreshForm3Score ?? "" : "",
      opponentFreshForm3Score: isCurrentCollapseGate ? features.startMatchPairRegimeOpponentFreshForm3Score ?? "" : "",
      selectedHistory5WindowMatches: isCurrentCollapseGate ? features.startMatchPairRegimeSelectedHistory5WindowMatches ?? "" : "",
      opponentHistory5WindowMatches: isCurrentCollapseGate ? features.startMatchPairRegimeOpponentHistory5WindowMatches ?? "" : "",
      selectedHistory5SetSharePct: isCurrentCollapseGate ? features.startMatchPairRegimeSelectedHistory5SetSharePct ?? "" : "",
      opponentHistory5SetSharePct: isCurrentCollapseGate ? features.startMatchPairRegimeOpponentHistory5SetSharePct ?? "" : "",
      selectedHistory5SetShareEdge: isCurrentCollapseGate ? features.startMatchPairRegimeSelectedHistory5SetShareEdge ?? "" : "",
      selectedHistory8PerformancePct: isCurrentCollapseGate ? features.startMatchPairRegimeSelectedHistory8PerformancePct ?? "" : "",
      opponentHistory8PerformancePct: isCurrentCollapseGate ? features.startMatchPairRegimeOpponentHistory8PerformancePct ?? "" : "",
      relativeHistoryWindowReady: isCurrentCollapseGate ? features.startMatchPairRegimeRelativeHistoryWindowReady ?? "" : "",
      selectedFreshAtOrAboveHistory8: isCurrentCollapseGate ? features.startMatchPairRegimeSelectedFreshAtOrAboveHistory8 ?? "" : "",
      opponentFreshAtOrAboveHistory8: isCurrentCollapseGate ? features.startMatchPairRegimeOpponentFreshAtOrAboveHistory8 ?? "" : "",
      relativeFormSetShareException: isCurrentCollapseGate ? features.startMatchPairRegimeRelativeFormSetShareException ?? "" : "",
      decision: prematch.decisionLabel || prematch.action || "",
      sent: prematch.sent === true || prematch.sent === 1 ? 1 : 0,
      finalScore: row && (row.finalScore || row.actualScore) || finalResult.finalScore || "",
      resultStatus: row && row.resultStatus || finalResult.status || "",
      pointSnapshots: points.length
    };
    lines.push(keys.map((key) => csvCell(values[key])).join(","));
  }
  return lines.join("\n");
}

function buildArchivePointRows(rows) {
  const result = [];
  for (const row of Array.isArray(rows) ? rows : []) {
    const points = Array.isArray(row && row.pointTimeline)
      ? row.pointTimeline
      : Array.isArray(row && row.pointByPoint)
        ? row.pointByPoint
        : [];
    const players = Array.isArray(row && row.players) ? row.players.slice(0, 2).join(" vs ") : "";
    const finalResult = row && (row.finalResult || row.result) || {};
    for (const [index, point] of points.entries()) {
      result.push({
        matchUrl: row && row.matchUrl || "",
        recordKind: row && row.recordKind || "",
        players,
        pointIndex: point && point.pointIndex || index + 1,
        ts: point && point.ts || "",
        source: point && point.source || "",
        setState: point && point.setState || "",
        targetSetNumber: point && point.targetSetNumber || "",
        completedSetScores: Array.isArray(point && point.completedSetScores) ? point.completedSetScores.join(" ") : "",
        currentSetScore: point && point.currentSetScore || "",
        currentPointLeftPoints: point && point.currentPointLeftPoints !== undefined ? point.currentPointLeftPoints : "",
        currentPointRightPoints: point && point.currentPointRightPoints !== undefined ? point.currentPointRightPoints : "",
        currentPointScoreSource: point && point.currentPointScoreSource || "",
        rawRowText: point && point.rawRowText || "",
        finalScore: row && (row.finalScore || row.actualScore) || finalResult.finalScore || "",
        resultStatus: row && row.resultStatus || finalResult.status || ""
      });
    }
  }
  return result;
}

function buildArchiveRuleRows(summary) {
  const pairRegime = summary && summary.pairRegimeForward || {};
  const pairRegimeTt = summary && summary.pairRegimeTtCupShadow || {};
  const pairRegimeRows = [
    ["forward_model_baseline", pairRegime, pairRegime.baseline, "all technically eligible Setka/Czech matches"],
    ["forward_production_model", pairRegime, pairRegime.accepted, "Z0/PBP with causal opening-market side override and market-backed recovery; Setka/Czech Telegram ON"],
    ["forward_rejected_model", pairRegime, pairRegime.rejected, "rejected by both the PBP fallback and causal opening-market confirmation"],
    ["forward_collapse_sum_lte_4", pairRegime, pairRegime.sumWithinLimit, "collapse sum <= 4"],
    ["forward_collapse_counts_unequal", pairRegime, pairRegime.countsUnequal, "collapse counts unequal"],
    ["forward_strength_recovery", pairRegime, pairRegime.strongSelectedStrengthException, "recovered outside the collapse gate by selected raw PBP strength edge >= 15"],
    ["forward_history_share_recovery", pairRegime, pairRegime.selectedHistorySetShareException, "recovered outside earlier branches by selected eight-match set share >= 61.5%"],
    ["forward_relative_form_recovery", pairRegime, pairRegime.relativeFormSetShareException, "recovered outside earlier branches when both players are at or above their own eight-match performance and the selected player leads five-match set share by >= 10 points"],
    ["forward_tt_cup_model", pairRegimeTt, pairRegimeTt.accepted, "use the same prematch model; TT Cup calculate/save/statistics ON, Telegram OFF"]
  ].filter(([, , bucket]) => bucket && typeof bucket === "object")
    .map(([scope, cohort, bucket, rule]) => ({
      scope,
      rule,
      protocolId: cohort.protocolId || "",
      gateId: cohort.gateId || "",
      telegramEnabled: cohort.leagueScope === "tt-cup-shadow" ? 0 : 1,
      cohortStatus: cohort.status || "",
      cohortLocked: cohort.cohortLocked ? 1 : 0,
      targetCohortSize: cohort.targetEligible || 300,
      observed: cohort.cohortSize,
      observedTaggedRows: cohort.observedTaggedRows,
      seenEligible: cohort.validEligibleRows,
      pending: bucket.pending,
      matched: bucket.selected,
      sent: bucket.sent,
      settled: bucket.settled,
      uniqueMatches: bucket.selected,
      wins: bucket.wins,
      losses: bucket.losses,
      hit: bucket.hit,
      hitRatePct: bucket.hitRatePct,
      wilsonLowerPct: bucket.wilsonLowerPct,
      coveragePct: bucket.coveragePct,
      eligibleCoveragePct: bucket.coveragePct
    }));
  return pairRegimeRows;
}

function buildCsvFromObjects(rows) {
  const list = Array.isArray(rows) ? rows : [];
  const keys = [];
  for (const row of list) {
    for (const key of Object.keys(row || {})) {
      if (!keys.includes(key)) {
        keys.push(key);
      }
    }
  }
  if (!keys.length) {
    return "";
  }
  return [
    keys.map(csvCell).join(","),
    ...list.map((row) => keys.map((key) => csvCell(row && row[key])).join(","))
  ].join("\n");
}

function downloadText(text, filename, type) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  window.setTimeout(() => {
    URL.revokeObjectURL(url);
    anchor.remove();
  }, 1000);
}

function csvCell(value) {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, "\"\"")}"` : text;
}

function setStatus(message, meta) {
  statusText.textContent = message || "";
  statusMeta.textContent = meta || "";
}

function setBadge(text, variant) {
  sourceBadge.textContent = text || "";
  sourceBadge.className = `badge${variant ? ` badge--${variant}` : ""}`;
}

function sendTabMessage(tabId, message) {
  return new Promise((resolve, reject) => {
    let settled = false;
    const timeoutId = window.setTimeout(() => {
      if (settled) {
        return;
      }
      settled = true;
      reject(new Error("Операция во вкладке BSportsFan превысила 120 секунд и была освобождена."));
    }, 120 * 1000);
    chrome.tabs.sendMessage(tabId, message, (response) => {
      const runtimeError = chrome.runtime.lastError;
      if (settled) {
        return;
      }
      settled = true;
      window.clearTimeout(timeoutId);
      if (runtimeError) {
        reject(new Error(runtimeError.message || "tab runtime error"));
        return;
      }
      resolve(response || {});
    });
  });
}

function sendRuntimeMessage(message) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      const runtimeError = chrome.runtime.lastError;
      if (runtimeError) {
        reject(new Error(runtimeError.message || "runtime error"));
        return;
      }
      if (response && response.ok === false) {
        reject(new Error(response.error || "runtime error"));
        return;
      }
      resolve(response || {});
    });
  });
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isBsportsfanUrl(value) {
  try {
    const url = new URL(value || "");
    return /(^|\.)(?:bsportsfan|betsapi)\.com$/i.test(url.hostname);
  } catch (_) {
    return false;
  }
}

function finiteOrNull(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function formatCompactNumber(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return "0";
  }
  return Number.isInteger(number) ? String(number) : String(roundOneDecimal(number));
}

function roundOneDecimal(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.round(number * 10) / 10 : null;
}

function formatDateTime(value) {
  const timestamp = Number(value || 0);
  if (!Number.isFinite(timestamp) || timestamp <= 0) {
    return "-";
  }
  const date = new Date(timestamp);
  const now = new Date();
  const pad = (item) => String(item).padStart(2, "0");
  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear() === now.getFullYear() ? "" : `.${date.getFullYear()}`;
  return `${day}.${month}${year} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function errorMessage(error) {
  return String(error && error.message ? error.message : error || "");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
