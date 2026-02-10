"""Build channel payloads from generator outputs."""

import time
from typing import Any, Dict, List

from generators.portfolio import PortfolioGenerator
from generators.greeks import GreeksGenerator
from generators.pnl import PnLGenerator
from generators.var import VaRGenerator
from generators.compliance import ComplianceGenerator
from generators.exposure import ExposureGenerator


class ChannelBuilder:
    """Orchestrates all generators and builds data channel payloads.

    Each call to build_all() advances the market by one tick and returns
    a dict of channel_name -> payload for pushing to the swarm.
    """

    def __init__(self, seed: int = 42):
        self.portfolio = PortfolioGenerator(seed=seed)
        self.greeks = GreeksGenerator()
        self.pnl = PnLGenerator()
        self.var = VaRGenerator(seed=seed)
        self.compliance = ComplianceGenerator()
        self.exposure = ExposureGenerator()

    def build_all(self) -> Dict[str, Any]:
        """Advance market and build all channel payloads."""
        self.portfolio.tick()
        snapshot = self.portfolio.snapshot()
        all_positions = self.portfolio.all_positions()
        nav = self.portfolio.nav
        tick = self.portfolio.tick_count

        channels = {}

        # 1. Portfolio snapshot.
        channels["fin.portfolio"] = snapshot

        # 2. Greeks.
        channels["fin.greeks"] = self.greeks.compute(all_positions)

        # 3. P&L.
        channels["fin.performance"] = self.pnl.compute(
            self.portfolio.positions, nav, tick
        )

        # 4. VaR (every 5 ticks to save CPU).
        if tick % 5 == 1 or tick == 1:
            channels["fin.var"] = self.var.compute(all_positions, nav)

        # 5. Compliance.
        leverage = snapshot.get("leverage", 0.0)
        channels["fin.compliance"] = self.compliance.compute(
            all_positions, nav, leverage
        )

        # 6. Exposure.
        exp_data = self.exposure.compute(all_positions, nav)
        channels["fin.exposure"] = exp_data

        # 7. Sector exposure (extracted from exposure).
        channels["fin.sector_exposure"] = {
            "timestamp_ms": int(time.time() * 1000),
            "by_sector": exp_data.get("by_sector", {}),
        }

        # 8. Counterparty.
        channels["fin.counterparty"] = {
            "timestamp_ms": int(time.time() * 1000),
            "by_counterparty": exp_data.get("by_counterparty", {}),
        }

        # 9. Concentration.
        channels["fin.concentration"] = {
            "timestamp_ms": int(time.time() * 1000),
            "concentration": exp_data.get("concentration", {}),
            "top_positions": self._top_positions(all_positions, 10),
        }

        # 10. Liquidity.
        channels["fin.liquidity"] = self._build_liquidity(all_positions, nav)

        # 11. Audit feed.
        channels["fin.audit_feed"] = {
            "timestamp_ms": int(time.time() * 1000),
            "tick": tick,
            "event": "market_tick",
            "nav_change_pct": snapshot.get("leverage", 0) * 0.001,
            "positions_updated": len(all_positions),
        }

        # 12. Actors.
        channels["fin.actors"] = self._build_actors()

        return channels

    def _top_positions(self, positions: list, n: int) -> list:
        sorted_pos = sorted(positions, key=lambda p: -abs(p.market_value))
        return [
            {
                "ticker": p.ticker,
                "type": p.instrument_type.value,
                "market_value": round(p.market_value, 2),
                "pnl": round(p.pnl, 2),
                "sector": p.sector,
            }
            for p in sorted_pos[:n]
        ]

    def _build_liquidity(self, positions: list, nav: float) -> dict:
        # Categorize positions by assumed liquidity tier.
        tiers = {"highly_liquid": 0, "liquid": 0, "less_liquid": 0, "illiquid": 0}
        for pos in positions:
            mv = abs(pos.market_value)
            itype = pos.instrument_type.value
            if itype in ("equity",):
                tiers["highly_liquid"] += mv
            elif itype in ("option_call", "option_put", "future"):
                tiers["liquid"] += mv
            elif itype in ("bond", "fx_forward"):
                tiers["less_liquid"] += mv
            else:
                tiers["illiquid"] += mv

        return {
            "timestamp_ms": int(time.time() * 1000),
            "tiers": {k: round(v, 2) for k, v in tiers.items()},
            "tiers_pct": {
                k: round(v / max(nav, 1) * 100, 2) for k, v in tiers.items()
            },
            "days_to_liquidate_95pct": 3,  # simplified estimate
        }

    def _build_actors(self) -> dict:
        return {
            "timestamp_ms": int(time.time() * 1000),
            "active_strategies": list(self.portfolio.positions.keys()),
            "generators": [
                "portfolio", "greeks", "pnl", "var",
                "compliance", "exposure",
            ],
        }
