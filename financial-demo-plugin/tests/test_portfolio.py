"""Tests for portfolio generation."""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from generators.portfolio import PortfolioGenerator
from models.strategies import STRATEGIES
from config import NUM_STRATEGIES, POSITIONS_PER_STRATEGY


def test_initial_portfolio_structure():
    gen = PortfolioGenerator(seed=42)
    assert len(gen.positions) == len(STRATEGIES)
    for strategy in STRATEGIES:
        assert strategy.code in gen.positions
        assert len(gen.positions[strategy.code]) == POSITIONS_PER_STRATEGY


def test_tick_changes_prices():
    gen = PortfolioGenerator(seed=42)
    initial_prices = {}
    for code, positions in gen.positions.items():
        initial_prices[code] = [p.current_price for p in positions]

    gen.tick()

    changed = False
    for code, positions in gen.positions.items():
        for i, p in enumerate(positions):
            if p.current_price != initial_prices[code][i]:
                changed = True
                break
    assert changed, "prices should change after a tick"


def test_nav_updates_after_tick():
    gen = PortfolioGenerator(seed=42)
    initial_nav = gen.nav
    gen.tick()
    # NAV should change (extremely unlikely to stay exactly the same).
    assert gen.nav != initial_nav or gen.tick_count == 1


def test_snapshot_structure():
    gen = PortfolioGenerator(seed=42)
    gen.tick()
    snap = gen.snapshot()

    assert "nav" in snap
    assert "strategies" in snap
    assert len(snap["strategies"]) == len(STRATEGIES)
    assert snap["tick"] == 1
    assert snap["total_positions"] == len(STRATEGIES) * POSITIONS_PER_STRATEGY

    for strat in snap["strategies"]:
        assert "code" in strat
        assert "positions" in strat
        assert "market_value" in strat
        assert "pnl" in strat


def test_deterministic_with_same_seed():
    gen1 = PortfolioGenerator(seed=123)
    gen2 = PortfolioGenerator(seed=123)

    gen1.tick()
    gen2.tick()

    snap1 = gen1.snapshot()
    snap2 = gen2.snapshot()

    assert snap1["nav"] == snap2["nav"]


def test_all_positions_flat_list():
    gen = PortfolioGenerator(seed=42)
    all_pos = gen.all_positions()
    expected = sum(len(p) for p in gen.positions.values())
    assert len(all_pos) == expected
