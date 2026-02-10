"""Decomposition tree logic for drill-down queries.

When the dashboard sends a DataChannelQuery to a fin.* channel, the plugin
responds with a decomposition tree that breaks down the data by:
- strategy -> positions
- sector -> positions
- geography -> positions
"""

from typing import Any, Dict, List, Optional

from generators.portfolio import PortfolioGenerator
from models.strategies import STRATEGIES


class DecompositionEngine:
    """Handles drill-down queries from the dashboard.

    Supports decomposition axes: "strategy", "sector", "geography",
    "instrument_type", "counterparty".
    """

    def __init__(self, portfolio: PortfolioGenerator):
        self.portfolio = portfolio

    def handle_query(self, channel: str, query: dict) -> dict:
        """Route a query to the appropriate decomposition handler."""
        axis = query.get("axis", "strategy")
        depth = query.get("depth", 1)
        filter_key = query.get("filter", None)

        all_positions = self.portfolio.all_positions()

        if axis == "strategy":
            return self._decompose_by_strategy(all_positions, filter_key, depth)
        elif axis == "sector":
            return self._decompose_by_sector(all_positions, filter_key, depth)
        elif axis == "geography":
            return self._decompose_by_geography(all_positions, filter_key, depth)
        elif axis == "instrument_type":
            return self._decompose_by_instrument_type(all_positions, filter_key)
        elif axis == "counterparty":
            return self._decompose_by_counterparty(all_positions, filter_key)
        else:
            return {"error": f"unknown decomposition axis: {axis}"}

    def _decompose_by_strategy(
        self,
        positions: list,
        filter_key: Optional[str],
        depth: int,
    ) -> dict:
        if filter_key:
            # Drill into a specific strategy.
            strat_positions = self.portfolio.positions.get(filter_key, [])
            if not strat_positions:
                return {"error": f"strategy '{filter_key}' not found"}

            if depth > 1:
                # Further decompose by sector.
                return self._group_positions(
                    strat_positions, lambda p: p.sector, f"strategy/{filter_key}"
                )

            return {
                "axis": "strategy",
                "filter": filter_key,
                "positions": [p.to_dict() for p in strat_positions],
                "count": len(strat_positions),
                "market_value": round(sum(p.market_value for p in strat_positions), 2),
                "pnl": round(sum(p.pnl for p in strat_positions), 2),
            }

        # Top-level: group by strategy.
        children = []
        for strategy in STRATEGIES:
            strat_positions = self.portfolio.positions.get(strategy.code, [])
            mv = sum(p.market_value for p in strat_positions)
            pnl = sum(p.pnl for p in strat_positions)
            children.append({
                "key": strategy.code,
                "label": strategy.name,
                "market_value": round(mv, 2),
                "pnl": round(pnl, 2),
                "position_count": len(strat_positions),
                "drillable": True,
            })

        return {
            "axis": "strategy",
            "children": children,
            "total_market_value": round(sum(c["market_value"] for c in children), 2),
        }

    def _decompose_by_sector(
        self,
        positions: list,
        filter_key: Optional[str],
        depth: int,
    ) -> dict:
        if filter_key:
            sector_pos = [p for p in positions if p.sector == filter_key]
            return {
                "axis": "sector",
                "filter": filter_key,
                "positions": [p.to_dict() for p in sector_pos],
                "count": len(sector_pos),
                "market_value": round(sum(p.market_value for p in sector_pos), 2),
                "pnl": round(sum(p.pnl for p in sector_pos), 2),
            }

        return self._group_positions(positions, lambda p: p.sector, "sector")

    def _decompose_by_geography(
        self,
        positions: list,
        filter_key: Optional[str],
        depth: int,
    ) -> dict:
        if filter_key:
            geo_pos = [p for p in positions if p.geography == filter_key]
            return {
                "axis": "geography",
                "filter": filter_key,
                "positions": [p.to_dict() for p in geo_pos],
                "count": len(geo_pos),
                "market_value": round(sum(p.market_value for p in geo_pos), 2),
                "pnl": round(sum(p.pnl for p in geo_pos), 2),
            }

        return self._group_positions(positions, lambda p: p.geography, "geography")

    def _decompose_by_instrument_type(
        self, positions: list, filter_key: Optional[str]
    ) -> dict:
        if filter_key:
            type_pos = [p for p in positions if p.instrument_type.value == filter_key]
            return {
                "axis": "instrument_type",
                "filter": filter_key,
                "positions": [p.to_dict() for p in type_pos],
                "count": len(type_pos),
            }

        return self._group_positions(
            positions, lambda p: p.instrument_type.value, "instrument_type"
        )

    def _decompose_by_counterparty(
        self, positions: list, filter_key: Optional[str]
    ) -> dict:
        cp_positions = [p for p in positions if p.counterparty]
        if filter_key:
            cp_pos = [p for p in cp_positions if p.counterparty == filter_key]
            return {
                "axis": "counterparty",
                "filter": filter_key,
                "positions": [p.to_dict() for p in cp_pos],
                "count": len(cp_pos),
            }

        return self._group_positions(
            cp_positions, lambda p: p.counterparty or "unknown", "counterparty"
        )

    @staticmethod
    def _group_positions(positions: list, key_fn, axis_name: str) -> dict:
        groups: Dict[str, list] = {}
        for pos in positions:
            key = key_fn(pos)
            groups.setdefault(key, []).append(pos)

        children = []
        for key, group in sorted(groups.items()):
            mv = sum(p.market_value for p in group)
            pnl = sum(p.pnl for p in group)
            children.append({
                "key": key,
                "label": key,
                "market_value": round(mv, 2),
                "pnl": round(pnl, 2),
                "position_count": len(group),
                "drillable": True,
            })

        return {
            "axis": axis_name,
            "children": sorted(children, key=lambda c: -abs(c["market_value"])),
            "total_market_value": round(sum(c["market_value"] for c in children), 2),
        }
