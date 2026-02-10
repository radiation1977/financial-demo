"""P&L generation for the financial demo."""

import time
from typing import Dict, List

from models.instruments import Instrument
from models.strategies import STRATEGIES


class PnLGenerator:
    """Generates P&L attribution across strategies, sectors, and instruments."""

    def __init__(self):
        self.daily_pnl_history: List[dict] = []
        self.cumulative_pnl = 0.0

    def compute(
        self,
        positions: Dict[str, List[Instrument]],
        nav: float,
        tick: int,
    ) -> dict:
        """Compute P&L breakdown."""
        strategy_pnl = {}
        sector_pnl: Dict[str, float] = {}
        instrument_type_pnl: Dict[str, float] = {}
        total_pnl = 0.0

        for strategy in STRATEGIES:
            strat_positions = positions.get(strategy.code, [])
            strat_pnl = sum(p.pnl for p in strat_positions)
            strategy_pnl[strategy.code] = {
                "name": strategy.name,
                "pnl": round(strat_pnl, 2),
                "pnl_pct": round(strat_pnl / max(nav, 1) * 100, 4),
                "position_count": len(strat_positions),
                "winners": sum(1 for p in strat_positions if p.pnl > 0),
                "losers": sum(1 for p in strat_positions if p.pnl < 0),
            }
            total_pnl += strat_pnl

            for pos in strat_positions:
                sector_pnl[pos.sector] = sector_pnl.get(pos.sector, 0.0) + pos.pnl
                key = pos.instrument_type.value
                instrument_type_pnl[key] = instrument_type_pnl.get(key, 0.0) + pos.pnl

        self.cumulative_pnl += total_pnl

        snapshot = {
            "tick_pnl": round(total_pnl, 2),
            "tick_pnl_pct": round(total_pnl / max(nav, 1) * 100, 4),
        }
        self.daily_pnl_history.append(snapshot)
        if len(self.daily_pnl_history) > 500:
            self.daily_pnl_history = self.daily_pnl_history[-500:]

        return {
            "timestamp_ms": int(time.time() * 1000),
            "tick": tick,
            "total_pnl": round(total_pnl, 2),
            "total_pnl_pct": round(total_pnl / max(nav, 1) * 100, 4),
            "cumulative_pnl": round(self.cumulative_pnl, 2),
            "cumulative_pnl_pct": round(self.cumulative_pnl / max(nav, 1) * 100, 4),
            "by_strategy": strategy_pnl,
            "by_sector": {k: round(v, 2) for k, v in sorted(sector_pnl.items(), key=lambda x: -abs(x[1]))},
            "by_instrument_type": {k: round(v, 2) for k, v in instrument_type_pnl.items()},
            "recent_history": self.daily_pnl_history[-20:],
        }
