"""Exposure metrics generation for the financial demo."""

import time
from typing import Dict, List

from models.instruments import Instrument
from models.sectors import GEOGRAPHIES


class ExposureGenerator:
    """Generates multi-dimensional exposure metrics."""

    def compute(self, positions: List[Instrument], nav: float) -> dict:
        """Compute exposure breakdowns by multiple dimensions."""
        if nav <= 0:
            return {"timestamp_ms": int(time.time() * 1000), "nav": 0}

        # By sector.
        sector_long: Dict[str, float] = {}
        sector_short: Dict[str, float] = {}
        for pos in positions:
            mv = pos.market_value
            if mv >= 0:
                sector_long[pos.sector] = sector_long.get(pos.sector, 0.0) + mv
            else:
                sector_short[pos.sector] = sector_short.get(pos.sector, 0.0) + abs(mv)

        sector_exposure = {}
        all_sectors = set(list(sector_long.keys()) + list(sector_short.keys()))
        for sector in sorted(all_sectors):
            l = sector_long.get(sector, 0.0)
            s = sector_short.get(sector, 0.0)
            sector_exposure[sector] = {
                "long": round(l, 2),
                "short": round(s, 2),
                "net": round(l - s, 2),
                "gross": round(l + s, 2),
                "net_pct": round((l - s) / nav * 100, 2),
                "gross_pct": round((l + s) / nav * 100, 2),
            }

        # By geography.
        geo_exposure_map: Dict[str, float] = {}
        for pos in positions:
            geo_exposure_map[pos.geography] = (
                geo_exposure_map.get(pos.geography, 0.0) + abs(pos.market_value)
            )
        geo_exposure = {
            geo: {
                "exposure": round(exp, 2),
                "pct": round(exp / nav * 100, 2),
            }
            for geo, exp in sorted(geo_exposure_map.items(), key=lambda x: -x[1])
        }

        # By currency.
        currency_exposure: Dict[str, float] = {}
        for pos in positions:
            currency_exposure[pos.currency] = (
                currency_exposure.get(pos.currency, 0.0) + abs(pos.market_value)
            )

        # By instrument type.
        inst_type_exposure: Dict[str, float] = {}
        for pos in positions:
            key = pos.instrument_type.value
            inst_type_exposure[key] = inst_type_exposure.get(key, 0.0) + abs(pos.market_value)

        # Counterparty exposure.
        cp_exposure: Dict[str, float] = {}
        for pos in positions:
            if pos.counterparty:
                cp_exposure[pos.counterparty] = (
                    cp_exposure.get(pos.counterparty, 0.0) + abs(pos.market_value)
                )

        # Concentration metrics.
        all_exposures = [abs(p.market_value) for p in positions]
        all_exposures.sort(reverse=True)
        top_10 = sum(all_exposures[:10]) if len(all_exposures) >= 10 else sum(all_exposures)
        hhi = sum((e / nav * 100) ** 2 for e in all_exposures) if nav > 0 else 0

        return {
            "timestamp_ms": int(time.time() * 1000),
            "nav": round(nav, 2),
            "by_sector": sector_exposure,
            "by_geography": geo_exposure,
            "by_currency": {k: round(v, 2) for k, v in currency_exposure.items()},
            "by_instrument_type": {k: round(v, 2) for k, v in inst_type_exposure.items()},
            "by_counterparty": {k: round(v, 2) for k, v in sorted(cp_exposure.items(), key=lambda x: -x[1])},
            "concentration": {
                "top_10_pct": round(top_10 / nav * 100, 2),
                "hhi": round(hhi, 4),
                "position_count": len(positions),
            },
        }
