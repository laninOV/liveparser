#!/usr/bin/env python3
"""Chronological, leakage-safe research for the 2+ sets side selector."""

import json
import math
import os
import statistics


ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ARCHIVE = os.path.join(
    ROOT,
    "exports",
    "bsportsfan-combined-2026-07-31",
    "combined-dataset-1247.json",
)
LIVE = "/tmp/current-telegram-dataset-now.json"
PRODUCTION_LEAGUES = {"Кубок Сетки", "Чехия - Про Лига"}
CURRENT_PROTOCOL = "start-moderate-z0-v10-2026-07-31"


def finite(value):
    if value is None or value == "":
        return None
    try:
        value = float(value)
    except (TypeError, ValueError):
        return None
    return value if math.isfinite(value) else None


def score_pair(value):
    try:
        left, right = str(value or "").split("-", 1)
        return int(left), int(right)
    except (TypeError, ValueError):
        return None


def prematch(row):
    return row.get("prematchSnapshot") or row.get("prematch") or {}


def features(row):
    return prematch(row).get("features") or {}


def league(row):
    return row.get("leagueName") or prematch(row).get("leagueName") or ""


def decision_at(row):
    source = prematch(row)
    return int(
        finite(source.get("finalDecisionAt"))
        or finite(source.get("ts"))
        or finite(source.get("readyAt"))
        or finite(source.get("requestedAt"))
        or finite(row.get("createdAt"))
        or 0
    )


def market(row):
    source = prematch(row)
    item = (
        source.get("referenceMoneylineMarket")
        or source.get("moneylineMarket")
        or row.get("historicalOpeningMoneyline")
        or {}
    )
    left = finite(item.get("leftOdds"))
    right = finite(item.get("rightOdds"))
    observed_at = finite(item.get("observedAt"))
    decided_at = decision_at(row)
    status = str(item.get("status") or "").strip().lower()
    market_type = str(item.get("marketType") or "").replace("-", "").lower()
    quote_source = str(item.get("quoteSource") or item.get("preferredSource") or "").strip().lower()
    retrospective = item.get("retrospective") is True or bool(item.get("backfilledAt"))
    if (
        status != "ready"
        or market_type != "matchresult"
        or quote_source != "opening"
        or retrospective
        or not observed_at
        or not decided_at
        or observed_at > decided_at
    ):
        return None, None
    return (left, right) if left and right and left > 1 and right > 1 else (None, None)


def side_value(profile, path):
    value = profile
    for key in path.split("."):
        if not isinstance(value, dict):
            return None
        value = value.get(key)
    return finite(value)


PATHS = {
    "latest_sets": "history.latestOwnSets",
    "failure_streak": "history.failureStreak",
    "fresh_form": "history.freshForm3Score",
    "h3_took2": "history.windows.3.tookTwoPct",
    "h3_setshare": "history.windows.3.setSharePct",
    "h3_perf": "history.windows.3.performancePct",
    "h5_took2": "history.windows.5.tookTwoPct",
    "h5_setshare": "history.windows.5.setSharePct",
    "h5_perf": "history.windows.5.performancePct",
    "h8_took2": "history.windows.8.tookTwoPct",
    "h8_setshare": "history.windows.8.setSharePct",
    "h8_perf": "history.windows.8.performancePct",
    "pl_strength": "point.latest.strengthScore",
    "pl_margin": "point.latest.avgSetPointMargin",
    "pl_points": "point.latest.pointsRate",
    "pl_setshare": "point.latest.setSharePct",
    "pl_collapse": "point.latest.collapseCount",
    "p3_strength": "point.windows.3.strengthScore",
    "p3_margin": "point.windows.3.avgSetPointMargin",
    "p3_points": "point.windows.3.pointsRate",
    "p3_setshare": "point.windows.3.setSharePct",
    "p3_collapse": "point.windows.3.collapseRatePct",
    "p5_strength": "point.windows.5.strengthScore",
    "p5_margin": "point.windows.5.avgSetPointMargin",
    "p5_points": "point.windows.5.pointsRate",
    "p5_setshare": "point.windows.5.setSharePct",
    "p5_collapse": "point.windows.5.collapseRatePct",
    "p5_close_lost": "point.windows.5.closeLeadLostPct",
    "p5_late_hold": "point.windows.5.lateLeadHoldPct",
    "p5_late_points": "point.windows.5.latePointRate",
    "p5_max_streak": "point.windows.5.maxLostStreak",
}


FEATURE_SETS = {
    "compact6": [
        "latest_sets", "h3_setshare", "h5_took2", "fresh_form",
        "pl_strength", "p5_strength",
    ],
    "balanced10": [
        "latest_sets", "fresh_form", "h3_setshare", "h5_took2",
        "h5_setshare", "pl_strength", "p5_strength", "p5_margin",
        "p5_points", "p5_collapse",
    ],
    "robust16": [
        "latest_sets", "failure_streak", "fresh_form", "h3_took2",
        "h3_setshare", "h5_took2", "h5_setshare", "h8_took2",
        "h8_setshare", "pl_strength", "p3_strength", "p5_strength",
        "p5_margin", "p5_points", "p5_collapse", "p5_close_lost",
    ],
}


def make_record(row, source):
    current_features = features(row)
    profiles = current_features.get("startMatchProfiles")
    final = row.get("finalResult") or row.get("result") or {}
    score = score_pair(final.get("finalScore") or row.get("finalScore"))
    if (
        league(row) not in PRODUCTION_LEAGUES
        or not isinstance(profiles, list)
        or len(profiles) != 2
        or not score
        or final.get("resultOrientation") not in (None, "", "same", "reversed", "same-trusted-match-page")
    ):
        return None
    identity_keys = [str(profile.get("identityKey") or "") for profile in profiles]
    if (
        len(set(identity_keys)) != 2
        or not all(key.startswith("id:") and key[3:].isdigit() for key in identity_keys)
    ):
        return None
    selector_paths = (
        "point.latest.strengthScore",
        "history.windows.3.setSharePct",
        "history.latestOwnSets",
        "history.freshForm3Score",
    )
    if any(side_value(profile, path) is None for profile in profiles for path in selector_paths):
        return None
    point_window = None
    for size in (5, 3):
        if all(
            (side_value(profile, f"point.windows.{size}.matches") or 0) >= size
            and side_value(profile, f"point.windows.{size}.avgSetPointMargin") is not None
            and side_value(profile, f"point.windows.{size}.closeLeadLostPct") is not None
            for profile in profiles
        ):
            point_window = size
            break
    if point_window is None:
        return None
    settled_at = int(finite(final.get("settledAt")) or finite(row.get("settledAt")) or 0)
    decided_at = decision_at(row)
    if settled_at and decided_at and settled_at <= decided_at:
        return None
    diffs = {}
    missing = {}
    for name, path in PATHS.items():
        if name.startswith("p5_") and point_window == 3:
            path = path.replace("point.windows.5.", "point.windows.3.")
        left = side_value(profiles[0], path)
        right = side_value(profiles[1], path)
        diffs[name] = 0.0 if left is None or right is None else left - right
        missing[name] = int(left is None or right is None)
    left_odds, right_odds = market(row)
    odds_edge = 0.0
    if left_odds and right_odds:
        odds_edge = math.log(right_odds / left_odds)
    return {
        "url": row.get("matchUrl") or "",
        "source": source,
        "time": decided_at,
        "settled_at": settled_at,
        "league": league(row),
        "score": score,
        "left_success": score[0] >= 2,
        "right_success": score[1] >= 2,
        "decisive": min(score) < 2,
        "left_wins_decisive": score[0] >= 2,
        "diffs": diffs,
        "missing": missing,
        "odds_edge": odds_edge,
        "odds_ready": bool(left_odds and right_odds),
        "profiles": profiles,
        "point_window": point_window,
    }


def selected_hit(record, side):
    return record["left_success"] if side == 0 else record["right_success"]


def z0_side(record):
    return 0 if fixed_score(record, "z0") >= 0 else 1


def legacy_side(record):
    return 0 if fixed_score(record, "legacy4") >= 0 else 1


def market_side(record):
    if not record["odds_ready"]:
        return None
    if abs(record["odds_edge"]) <= 1e-9:
        return None
    return 0 if record["odds_edge"] >= 0 else 1


def market_favorite_probability(record):
    if market_side(record) is None:
        return None
    edge = abs(record["odds_edge"])
    return 1 / (1 + math.exp(-edge))


def strong_market_side(record, minimum=0.60):
    probability = market_favorite_probability(record)
    return market_side(record) if probability is not None and probability >= minimum else None


def pair_gate(record, selected_side):
    profiles = record["profiles"]
    size = record["point_window"]
    point = [profiles[index]["point"]["windows"][str(size)] for index in (0, 1)]
    history = [profiles[index]["history"] for index in (0, 1)]
    collapse = [finite(item.get("collapseCount")) for item in point]
    strength = [finite(item.get("strengthScore")) for item in point]
    collapse_accepted = sum(collapse) <= 4 and abs(collapse[0] - collapse[1]) >= 1
    opponent = 1 - selected_side
    strong_exception = strength[selected_side] - strength[opponent] >= 15
    h8 = [item["windows"]["8"] for item in history]
    history_exception = finite(h8[selected_side].get("setSharePct")) >= 61.5
    h5 = [item["windows"]["5"] for item in history]
    relative_exception = (
        finite(history[selected_side].get("freshForm3Score"))
            >= finite(h8[selected_side].get("performancePct"))
        and finite(history[opponent].get("freshForm3Score"))
            >= finite(h8[opponent].get("performancePct"))
        and finite(h5[selected_side].get("setSharePct"))
            - finite(h5[opponent].get("setSharePct")) >= 10
    )
    formula = collapse_accepted or strong_exception or history_exception or relative_exception

    def vote(left, right, lower=False):
        if abs(left - right) <= 1e-9:
            return 0.5
        return 1 if (left < right if lower else left > right) else 0

    agreement = sum((
        vote(finite(h5[selected_side].get("tookTwo")), finite(h5[opponent].get("tookTwo"))),
        vote(
            finite(history[selected_side].get("freshForm3Score")),
            finite(history[opponent].get("freshForm3Score")),
        ),
        vote(
            finite(point[selected_side].get("avgSetPointMargin")),
            finite(point[opponent].get("avgSetPointMargin")),
        ),
        vote(
            finite(point[selected_side].get("closeLeadLostPct")),
            finite(point[opponent].get("closeLeadLostPct")),
            True,
        ),
    ))
    return formula and not (collapse_accepted and agreement == 2.5)


def adaptive_ab_decisions(rows, window_size=10):
    """Choose A/Z0 or B/legacy from disagreements settled before each decision."""
    decisions = []
    disagreement_ledger = []
    for row in sorted(rows, key=lambda item: (item["time"], item["url"])):
        a_side = z0_side(row)
        b_side = legacy_side(row)
        available = [
            item for item in disagreement_ledger
            if item["settled_at"] and item["settled_at"] < row["time"]
        ]
        recent = sorted(
            available,
            key=lambda item: (item["settled_at"], item["time"], item["url"]),
        )[-window_size:]
        pair_sum = sum(item["outcome"] for item in recent)
        side = b_side if a_side != b_side and pair_sum < 0 else a_side
        decisions.append((row, side, pair_sum, len(recent)))
        if a_side != b_side:
            a_hit = selected_hit(row, a_side)
            b_hit = selected_hit(row, b_side)
            outcome = 0 if a_hit == b_hit else 1 if a_hit else -1
            disagreement_ledger.append({
                "settled_at": row["settled_at"],
                "time": row["time"],
                "url": row["url"],
                "outcome": outcome,
            })
    return decisions


def decision_metric(decisions, denominator=None):
    wins = sum(selected_hit(row, side) for row, side, *_ in decisions)
    total = len(decisions)
    base = total if denominator is None else denominator
    decisive = [(row, side) for row, side, *_ in decisions if row["decisive"]]
    decisive_wins = sum(selected_hit(row, side) for row, side in decisive)
    return {
        "selected": total,
        "wins": wins,
        "accuracy": 100 * wins / total if total else 0,
        "coverage": 100 * total / base if base else 0,
        "decisive": len(decisive),
        "decisive_accuracy": 100 * decisive_wins / len(decisive) if decisive else 0,
    }


def static_decisions(rows, side_fn, gate_fn=lambda row, side: True):
    decisions = []
    for row in rows:
        side = side_fn(row)
        if side in (0, 1) and gate_fn(row, side):
            decisions.append((row, side))
    return decisions


def current_plus_market_strategy(rows, side_minimum=0.60, salvage_minimum=0.55):
    def side_fn(row):
        market = strong_market_side(row, side_minimum)
        return market if market is not None else z0_side(row)

    def gate_fn(row, side):
        base_side = z0_side(row)
        market = market_side(row)
        probability = market_favorite_probability(row)
        return pair_gate(row, base_side) or (
            market is not None
            and probability >= salvage_minimum
            and base_side == market
        )

    return static_decisions(rows, side_fn, gate_fn)


def production_v2_strategy(rows, side_minimum=0.60, salvage_minimum=0.55):
    def side_fn(row):
        favorite = strong_market_side(row, side_minimum)
        return favorite if favorite is not None else z0_side(row)

    def gate_fn(row, side):
        base_side = z0_side(row)
        favorite = market_side(row)
        probability = market_favorite_probability(row)
        candidate = pair_gate(row, base_side) or (
            favorite is not None
            and probability >= salvage_minimum
            and base_side == favorite
        )
        consensus = favorite is None or side == favorite
        return candidate and consensus

    return static_decisions(rows, side_fn, gate_fn)


def odds_consensus_strategy(rows):
    return static_decisions(
        rows,
        z0_side,
        lambda row, side: market_side(row) is None or market_side(row) == side,
    )


def load_records():
    archive = json.load(open(ARCHIVE, encoding="utf-8"))["rows"]
    records = [make_record(row, "archive") for row in archive]
    records = [row for row in records if row]
    live_records = []
    if os.path.exists(LIVE):
        live = json.load(open(LIVE, encoding="utf-8"))
        for row in live:
            current_features = features(row)
            if (
                current_features.get("startMatchPairRegimeProtocolId") == CURRENT_PROTOCOL
                and current_features.get("startMatchLeagueMode") == "production"
                and current_features.get("startMatchPairRegimeDataReady") == 1
            ):
                item = make_record(row, "live")
                if item:
                    live_records.append(item)
    existing = {row["url"] for row in records}
    live_records = [row for row in live_records if row["url"] not in existing]
    return sorted(records, key=lambda row: (row["time"], row["url"])), sorted(
        live_records, key=lambda row: (row["time"], row["url"])
    )


def fixed_score(record, name):
    d = record["diffs"]
    if name == "z0":
        return 8 * d["pl_strength"] + d["h3_setshare"] + 24 * d["latest_sets"]
    if name == "legacy4":
        return (
            0.1002743765830373 * (d["h5_took2"] / 20)
            + 0.003852714357521356 * d["fresh_form"]
            + 0.05273093422356286 * d["p5_margin"]
            - 0.015092056832786465 * d["p5_close_lost"]
        )
    if name == "market":
        return record["odds_edge"]
    raise KeyError(name)


def vector(record, names, include_odds=False):
    values = [record["diffs"][name] for name in names]
    if include_odds:
        values.append(record["odds_edge"])
    return values


def fit_scaler(rows, names, include_odds=False):
    vectors = [vector(row, names, include_odds) for row in rows]
    width = len(vectors[0])
    means = [statistics.fmean(item[index] for item in vectors) for index in range(width)]
    scales = []
    for index in range(width):
        scale = math.sqrt(statistics.fmean((item[index] - means[index]) ** 2 for item in vectors))
        scales.append(scale if scale > 1e-9 else 1.0)
    return means, scales


def scaled_vector(record, names, scaler, include_odds=False):
    means, scales = scaler
    return [(value - means[index]) / scales[index] for index, value in enumerate(
        vector(record, names, include_odds)
    )]


def train_logistic(rows, names, penalty, include_odds=False):
    decisive = [row for row in rows if row["decisive"]]
    scaler = fit_scaler(decisive, names, include_odds)
    vectors = [scaled_vector(row, names, scaler, include_odds) for row in decisive]
    targets = [1.0 if row["left_wins_decisive"] else 0.0 for row in decisive]
    weights = [0.0] * len(vectors[0])
    rate = 0.08
    for step in range(1200):
        gradient = [0.0] * len(weights)
        for values, target in zip(vectors, targets):
            raw = max(-30, min(30, sum(weight * value for weight, value in zip(weights, values))))
            probability = 1 / (1 + math.exp(-raw))
            for index, value in enumerate(values):
                gradient[index] += (probability - target) * value
        for index, weight in enumerate(weights):
            gradient[index] = gradient[index] / len(vectors) + penalty * weight / len(vectors)
            weights[index] -= rate * gradient[index]
        if step in (400, 800):
            rate *= 0.35
    return {"names": names, "scaler": scaler, "weights": weights, "odds": include_odds}


def model_score(model, row):
    values = scaled_vector(row, model["names"], model["scaler"], model["odds"])
    return sum(weight * value for weight, value in zip(model["weights"], values))


def quantile(values, fraction):
    ordered = sorted(values)
    if not ordered:
        return 0.0
    position = min(len(ordered) - 1, max(0, round(fraction * (len(ordered) - 1))))
    return ordered[position]


def metric(rows, scorer, threshold=0.0, require_odds=False):
    decisions = []
    for row in rows:
        if require_odds and not row["odds_ready"]:
            continue
        score = scorer(row)
        if abs(score) < threshold:
            continue
        selected = 0 if score >= 0 else 1
        hit = row["left_success"] if selected == 0 else row["right_success"]
        decisions.append((hit, row["decisive"], score, row))
    wins = sum(item[0] for item in decisions)
    decisive = [item for item in decisions if item[1]]
    decisive_wins = sum(item[0] for item in decisive)
    return {
        "selected": len(decisions),
        "wins": wins,
        "accuracy": 100 * wins / len(decisions) if decisions else 0,
        "coverage": 100 * len(decisions) / len(rows) if rows else 0,
        "decisive": len(decisive),
        "decisive_accuracy": 100 * decisive_wins / len(decisive) if decisive else 0,
    }


def show(name, result):
    print(
        f"{name:30s} {result['wins']:3d}/{result['selected']:<3d} "
        f"acc={result['accuracy']:5.1f}% cov={result['coverage']:5.1f}% "
        f"dec={result['decisive_accuracy']:5.1f}%/{result['decisive']}"
    )


def main():
    archive, live = load_records()
    first = int(len(archive) * 0.60)
    second = int(len(archive) * 0.80)
    train, validation, test = archive[:first], archive[first:second], archive[second:]
    print("DATA", {"archive": len(archive), "train": len(train), "validation": len(validation), "test": len(test), "live": len(live)})
    print("RANGES", train[0]["time"], train[-1]["time"], validation[-1]["time"], test[-1]["time"])
    for fixed in ("z0", "legacy4"):
        print("\nFIXED", fixed)
        for title, rows in (("train", train), ("validation", validation), ("test", test), ("live", live)):
            show(title, metric(rows, lambda row, key=fixed: fixed_score(row, key)))

    print("\nCAUSAL PRODUCTION CANDIDATES")
    periods = (("train", train), ("validation", validation), ("test", test), ("live", live))
    for title, builder in (
        ("z0-all", lambda rows: static_decisions(rows, z0_side)),
        ("market60-side-all", lambda rows: static_decisions(
            rows,
            lambda row: strong_market_side(row, 0.60)
                if strong_market_side(row, 0.60) is not None else z0_side(row),
        )),
        ("current-gate", lambda rows: static_decisions(rows, z0_side, pair_gate)),
        ("current+market-salvage", current_plus_market_strategy),
        ("production-v2", production_v2_strategy),
        ("odds-consensus", odds_consensus_strategy),
    ):
        print("\n", title)
        for period, rows in periods:
            show(period, decision_metric(builder(rows), len(rows)))

    print("\nADAPTIVE A/B, CONTINUOUS CAUSAL LEDGER")
    combined = sorted(archive + live, key=lambda row: (row["time"], row["url"]))
    for window in (3, 5, 10):
        decisions = adaptive_ab_decisions(combined, window)
        print("\nwindow", window)
        for period, rows in periods:
            urls = {row["url"] for row in rows}
            subset = [item for item in decisions if item[0]["url"] in urls]
            show(period, decision_metric(subset, len(rows)))
    print("\nMARKET READY ONLY")
    for title, rows in (("train", train), ("validation", validation), ("test", test), ("live", live)):
        show(title, metric(rows, lambda row: fixed_score(row, "market"), require_odds=True))

    candidates = []
    for set_name, names in FEATURE_SETS.items():
        for include_odds in (False, True):
            for penalty in (0.3, 1.0, 3.0, 10.0, 30.0):
                model = train_logistic(train, names, penalty, include_odds)
                validation_result = metric(validation, lambda row, item=model: model_score(item, row))
                candidates.append((validation_result["accuracy"], validation_result["decisive_accuracy"], set_name, include_odds, penalty, model))
    candidates.sort(key=lambda item: (item[0], item[1]), reverse=True)
    print("\nTOP VALIDATION MODELS")
    for candidate in candidates[:10]:
        _, _, set_name, include_odds, penalty, model = candidate
        print("\n", set_name, "odds", include_odds, "penalty", penalty)
        for title, rows in (("train", train), ("validation", validation), ("test", test), ("live", live)):
            show(title, metric(rows, lambda row, item=model: model_score(item, row)))
        labels = list(model["names"]) + (["odds_edge"] if include_odds else [])
        print("weights", dict(zip(labels, [round(value, 4) for value in model["weights"]])))

    best = candidates[0][-1]
    print("\nBEST CONFIDENCE CUTS (threshold fixed from train quantiles)")
    train_confidence = [abs(model_score(best, row)) for row in train]
    for cut in (0.0, 0.05, 0.10, 0.15, 0.20, 0.25, 0.30):
        threshold = quantile(train_confidence, cut) if cut else 0.0
        print("\ncut", cut, "threshold", round(threshold, 5))
        for title, rows in (("validation", validation), ("test", test), ("live", live)):
            show(title, metric(rows, lambda row, item=best: model_score(item, row), threshold))


if __name__ == "__main__":
    main()
