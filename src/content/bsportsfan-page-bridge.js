(function installLiveValueRadarBsportsfanPageBridge() {
  "use strict";

  const BRIDGE_VERSION = "bsf-prematch-runtime-v6";
  if (window.__lvrBsportsfanPageBridgeInstalled === BRIDGE_VERSION) {
    return;
  }
  window.__lvrBsportsfanPageBridgeInstalled = BRIDGE_VERSION;

  window.addEventListener("lvr:getBsportsfanRuntimePointSets", (event) => {
    const request = parseDetail(event && event.detail);
    const payload = {
      id: String(request.id || ""),
      url: location.href,
      source: "page-bridge-highcharts",
      ts: Date.now(),
      pointSets: collectRuntimePointSets()
    };
    window.dispatchEvent(new CustomEvent("lvr:bsportsfanRuntimePointSetsResult", {
      detail: JSON.stringify(payload)
    }));
  });

  window.dispatchEvent(new CustomEvent("lvr:bsportsfanRuntimeBridgeReady", {
    detail: JSON.stringify({
      version: BRIDGE_VERSION,
      url: location.href,
      ts: Date.now()
    })
  }));

  function parseDetail(detail) {
    if (typeof detail !== "string") {
      return detail && typeof detail === "object" ? detail : {};
    }
    try {
      return JSON.parse(detail);
    } catch (_) {
      return {};
    }
  }

  function collectRuntimePointSets() {
    const charts = Array.from(window.Highcharts && window.Highcharts.charts || []).filter(Boolean);
    const pointSets = [];
    charts.forEach((chart, index) => {
      const series = Array.from(chart.series || [])
        .filter((item) => item && item.name && Array.isArray(item.data) && item.data.length)
        .map((item) => ({
          name: normalizeText(item.name),
          color: normalizeText(item.color),
          points: item.data.map((point, pointIndex) => ({
            x: Number.isFinite(Number(point && point.x)) ? Number(point.x) : pointIndex + 1,
            y: Number(point && point.y)
          })).filter((point) => Number.isFinite(point.y))
        }))
        .filter((item) => item.points.length);
      if (series.length < 2) {
        return;
      }
      const title = normalizeText(chart.title && chart.title.textStr || chart.renderTo && chart.renderTo.id);
      const setMatch = title.match(/set\s*(\d+)|сет\s*(\d+)|(\d+)/i);
      const setNumber = setMatch ? Number(setMatch[1] || setMatch[2] || setMatch[3]) : index + 1;
      pointSets.push({
        set: Number.isFinite(setNumber) ? setNumber : index + 1,
        series
      });
    });
    return pointSets.sort((left, right) => Number(left.set || 0) - Number(right.set || 0));
  }

  function normalizeText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }
})();
