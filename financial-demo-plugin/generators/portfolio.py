"""Portfolio and position generation for the financial demo."""

import math
import time
from typing import Dict, List, Optional

import numpy as np

from config import (
    INITIAL_NAV, NUM_STRATEGIES, POSITIONS_PER_STRATEGY, RANDOM_SEED,
)
from models.instruments import (
    COUNTERPARTIES, EQUITY_TICKERS, Instrument, InstrumentType,
)
from models.strategies import STRATEGIES
from models.sectors import GEOGRAPHIES, TICKER_SECTOR_MAP


class PortfolioGenerator:
    """Generates and evolves a realistic multi-strategy portfolio.

    The portfolio is seeded deterministically and evolves with correlated
    market ticks. Each tick applies small price changes drawn from a
    correlated multivariate normal distribution.
    """

    def __init__(self, seed: int = RANDOM_SEED):
        self.rng = np.random.default_rng(seed)
        self.tick_count = 0
        self.nav = float(INITIAL_NAV)
        self.positions: Dict[str, List[Instrument]] = {}
        self.strategy_pnl: Dict[str, float] = {}
        self._build_initial_portfolio()

    def _build_initial_portfolio(self) -> None:
        """Build the initial portfolio across all strategies."""
        for strategy in STRATEGIES:
            positions = []
            allocation = self.nav * strategy.target_allocation_pct / 100.0
            per_position = allocation / POSITIONS_PER_STRATEGY

            for i in range(POSITIONS_PER_STRATEGY):
                ticker = self.rng.choice(EQUITY_TICKERS)
                sector = TICKER_SECTOR_MAP.get(ticker, "Information Technology")
                geo_keys = list(GEOGRAPHIES.keys())
                geo_weights = [GEOGRAPHIES[g]["weight"] for g in geo_keys]
                geography = self.rng.choice(geo_keys, p=geo_weights)

                # Determine instrument type based on strategy.
                inst_types = strategy.instrument_types
                inst_type_str = self.rng.choice(inst_types)
                inst_type = InstrumentType(inst_type_str)

                base_price = 50.0 + self.rng.random() * 450.0
                volatility = 0.15 + self.rng.random() * 0.35
                beta = 0.5 + self.rng.random() * 1.5

                if inst_type in (InstrumentType.OPTION_CALL, InstrumentType.OPTION_PUT):
                    option_price = base_price * 0.03 + self.rng.random() * base_price * 0.07
                    quantity = per_position / (option_price * 100)
                    instrument = Instrument(
                        ticker=ticker,
                        instrument_type=inst_type,
                        sector=sector,
                        geography=geography,
                        quantity=round(quantity),
                        entry_price=round(option_price, 2),
                        current_price=round(option_price, 2),
                        beta=round(beta, 2),
                        volatility=round(volatility, 4),
                        strike=round(base_price * (0.9 + self.rng.random() * 0.2), 2),
                        expiry_days=int(30 + self.rng.random() * 330),
                        counterparty=self.rng.choice(COUNTERPARTIES),
                    )
                elif inst_type == InstrumentType.BOND:
                    bond_price = 90.0 + self.rng.random() * 20.0
                    quantity = per_position / bond_price
                    instrument = Instrument(
                        ticker=f"{ticker}-BOND",
                        instrument_type=inst_type,
                        sector=sector,
                        geography=geography,
                        quantity=round(quantity),
                        entry_price=round(bond_price, 2),
                        current_price=round(bond_price, 2),
                        beta=round(beta * 0.3, 2),
                        volatility=round(volatility * 0.3, 4),
                        duration=round(2.0 + self.rng.random() * 8.0, 1),
                        credit_spread_bps=int(50 + self.rng.random() * 400),
                        counterparty=self.rng.choice(COUNTERPARTIES),
                    )
                elif inst_type in (InstrumentType.FUTURE, InstrumentType.FX_FORWARD, InstrumentType.SWAP):
                    notional = per_position
                    instrument = Instrument(
                        ticker=f"{ticker}-{inst_type.value.upper()[:3]}",
                        instrument_type=inst_type,
                        sector=sector,
                        geography=geography,
                        notional=round(notional, 2),
                        quantity=1.0,
                        entry_price=round(base_price, 2),
                        current_price=round(base_price, 2),
                        beta=round(beta, 2),
                        volatility=round(volatility, 4),
                        counterparty=self.rng.choice(COUNTERPARTIES),
                    )
                elif inst_type == InstrumentType.CDS:
                    instrument = Instrument(
                        ticker=f"{ticker}-CDS",
                        instrument_type=inst_type,
                        sector=sector,
                        geography=geography,
                        notional=round(per_position, 2),
                        quantity=1.0,
                        entry_price=round(50 + self.rng.random() * 200, 2),
                        current_price=round(50 + self.rng.random() * 200, 2),
                        beta=round(beta * 0.5, 2),
                        volatility=round(volatility * 0.5, 4),
                        credit_spread_bps=int(100 + self.rng.random() * 500),
                        counterparty=self.rng.choice(COUNTERPARTIES),
                    )
                else:
                    # Plain equity.
                    quantity = per_position / base_price
                    instrument = Instrument(
                        ticker=ticker,
                        instrument_type=inst_type,
                        sector=sector,
                        geography=geography,
                        quantity=round(quantity),
                        entry_price=round(base_price, 2),
                        current_price=round(base_price, 2),
                        beta=round(beta, 2),
                        volatility=round(volatility, 4),
                    )

                positions.append(instrument)

            self.positions[strategy.code] = positions
            self.strategy_pnl[strategy.code] = 0.0

    def tick(self) -> None:
        """Advance the market by one tick with correlated price changes."""
        self.tick_count += 1

        # Global market factor (correlated driver).
        market_return = self.rng.normal(0.0, 0.002)

        for strategy_code, positions in self.positions.items():
            strat_pnl = 0.0
            for pos in positions:
                # Correlated return: beta * market + idiosyncratic.
                idio = self.rng.normal(0.0, pos.volatility / math.sqrt(252))
                ret = pos.beta * market_return + idio * 0.5

                old_price = pos.current_price
                pos.current_price = round(max(0.01, old_price * (1.0 + ret)), 4)
                strat_pnl += pos.pnl

            self.strategy_pnl[strategy_code] = strat_pnl

        # Update NAV.
        total_mv = sum(
            sum(p.market_value for p in positions)
            for positions in self.positions.values()
        )
        self.nav = total_mv

    def snapshot(self) -> dict:
        """Generate a full portfolio snapshot."""
        strategies = []
        total_long = 0.0
        total_short = 0.0

        for strategy in STRATEGIES:
            positions = self.positions.get(strategy.code, [])
            pos_list = [p.to_dict() for p in positions]
            strat_mv = sum(p.market_value for p in positions)
            strat_pnl = sum(p.pnl for p in positions)

            long_mv = sum(p.market_value for p in positions if p.quantity > 0)
            short_mv = abs(sum(p.market_value for p in positions if p.quantity < 0))
            total_long += long_mv
            total_short += short_mv

            strategies.append({
                "code": strategy.code,
                "name": strategy.name,
                "style": strategy.style,
                "positions": pos_list,
                "position_count": len(pos_list),
                "market_value": round(strat_mv, 2),
                "pnl": round(strat_pnl, 2),
                "pnl_pct": round(strat_pnl / max(strat_mv, 1) * 100, 4),
                "long_exposure": round(long_mv, 2),
                "short_exposure": round(short_mv, 2),
                "net_exposure": round(long_mv - short_mv, 2),
                "gross_exposure": round(long_mv + short_mv, 2),
            })

        return {
            "timestamp_ms": int(time.time() * 1000),
            "tick": self.tick_count,
            "nav": round(self.nav, 2),
            "total_positions": sum(len(p) for p in self.positions.values()),
            "strategies": strategies,
            "long_exposure": round(total_long, 2),
            "short_exposure": round(total_short, 2),
            "net_exposure": round(total_long - total_short, 2),
            "gross_exposure": round(total_long + total_short, 2),
            "leverage": round((total_long + total_short) / max(self.nav, 1), 4),
        }

    def all_positions(self) -> List[Instrument]:
        """Flat list of all positions across strategies."""
        result = []
        for positions in self.positions.values():
            result.extend(positions)
        return result
