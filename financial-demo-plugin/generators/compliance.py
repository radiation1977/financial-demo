"""Compliance status generation for the financial demo."""

import time
from typing import Dict, List

from config import MAX_COUNTRY_PCT, MAX_LEVERAGE, MAX_SECTOR_PCT, MAX_SINGLE_NAME_PCT
from models.instruments import Instrument


class ComplianceGenerator:
    """Monitors portfolio compliance against investment mandates."""

    def compute(self, positions: List[Instrument], nav: float, leverage: float) -> dict:
        """Check all compliance rules and return violations."""
        violations = []
        warnings = []

        if nav <= 0:
            return {"timestamp_ms": int(time.time() * 1000), "status": "unknown", "violations": [], "warnings": []}

        # Rule 1: Single-name concentration.
        ticker_exposure: Dict[str, float] = {}
        for pos in positions:
            ticker_exposure[pos.ticker] = (
                ticker_exposure.get(pos.ticker, 0.0) + abs(pos.market_value)
            )
        for ticker, exposure in ticker_exposure.items():
            pct = exposure / nav * 100
            if pct > MAX_SINGLE_NAME_PCT:
                violations.append({
                    "rule": "single_name_concentration",
                    "ticker": ticker,
                    "exposure_pct": round(pct, 2),
                    "limit_pct": MAX_SINGLE_NAME_PCT,
                    "severity": "high",
                })
            elif pct > MAX_SINGLE_NAME_PCT * 0.8:
                warnings.append({
                    "rule": "single_name_concentration",
                    "ticker": ticker,
                    "exposure_pct": round(pct, 2),
                    "limit_pct": MAX_SINGLE_NAME_PCT,
                    "severity": "warning",
                })

        # Rule 2: Sector concentration.
        sector_exposure: Dict[str, float] = {}
        for pos in positions:
            sector_exposure[pos.sector] = (
                sector_exposure.get(pos.sector, 0.0) + abs(pos.market_value)
            )
        for sector, exposure in sector_exposure.items():
            pct = exposure / nav * 100
            if pct > MAX_SECTOR_PCT:
                violations.append({
                    "rule": "sector_concentration",
                    "sector": sector,
                    "exposure_pct": round(pct, 2),
                    "limit_pct": MAX_SECTOR_PCT,
                    "severity": "medium",
                })

        # Rule 3: Geography concentration.
        geo_exposure: Dict[str, float] = {}
        for pos in positions:
            geo_exposure[pos.geography] = (
                geo_exposure.get(pos.geography, 0.0) + abs(pos.market_value)
            )
        for geo, exposure in geo_exposure.items():
            pct = exposure / nav * 100
            if pct > MAX_COUNTRY_PCT:
                violations.append({
                    "rule": "geography_concentration",
                    "geography": geo,
                    "exposure_pct": round(pct, 2),
                    "limit_pct": MAX_COUNTRY_PCT,
                    "severity": "medium",
                })

        # Rule 4: Leverage limit.
        if leverage > MAX_LEVERAGE:
            violations.append({
                "rule": "leverage_limit",
                "current_leverage": round(leverage, 4),
                "limit": MAX_LEVERAGE,
                "severity": "critical",
            })
        elif leverage > MAX_LEVERAGE * 0.9:
            warnings.append({
                "rule": "leverage_limit",
                "current_leverage": round(leverage, 4),
                "limit": MAX_LEVERAGE,
                "severity": "warning",
            })

        status = "compliant" if not violations else "breach"
        if status == "compliant" and warnings:
            status = "warning"

        return {
            "timestamp_ms": int(time.time() * 1000),
            "status": status,
            "violation_count": len(violations),
            "warning_count": len(warnings),
            "violations": violations,
            "warnings": warnings,
            "rules_checked": 4,
        }
