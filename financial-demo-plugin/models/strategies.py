"""Strategy definitions for the financial demo."""

from dataclasses import dataclass
from typing import List


@dataclass
class Strategy:
    """A trading strategy within the fund."""
    name: str
    code: str
    description: str
    target_allocation_pct: float
    instrument_types: List[str]
    style: str  # "long_only", "long_short", "market_neutral", "volatility", "macro"


STRATEGIES = [
    Strategy(
        name="Global Equity Long/Short",
        code="GELS",
        description="Fundamental long/short equity across developed markets",
        target_allocation_pct=30.0,
        instrument_types=["equity", "option_call", "option_put"],
        style="long_short",
    ),
    Strategy(
        name="Systematic Macro",
        code="SMAC",
        description="Trend-following across rates, FX, and commodities",
        target_allocation_pct=20.0,
        instrument_types=["future", "fx_forward", "swap"],
        style="macro",
    ),
    Strategy(
        name="Volatility Arbitrage",
        code="VARB",
        description="Relative value in implied vs realized volatility",
        target_allocation_pct=15.0,
        instrument_types=["option_call", "option_put", "future"],
        style="volatility",
    ),
    Strategy(
        name="Credit Relative Value",
        code="CRDV",
        description="Investment-grade and high-yield credit spread trading",
        target_allocation_pct=15.0,
        instrument_types=["bond", "cds", "swap"],
        style="long_short",
    ),
    Strategy(
        name="Event Driven",
        code="EVNT",
        description="Merger arb, special situations, and activist positions",
        target_allocation_pct=12.0,
        instrument_types=["equity", "option_call"],
        style="long_short",
    ),
    Strategy(
        name="Statistical Arbitrage",
        code="STAT",
        description="Mean-reversion and momentum factor strategies",
        target_allocation_pct=8.0,
        instrument_types=["equity"],
        style="market_neutral",
    ),
]
