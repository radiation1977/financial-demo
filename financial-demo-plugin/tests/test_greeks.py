"""Tests for Greeks generation."""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from generators.greeks import GreeksGenerator, _bs_greeks
from generators.portfolio import PortfolioGenerator
from models.instruments import Instrument, InstrumentType


def test_bs_greeks_call():
    greeks = _bs_greeks(spot=100, strike=100, vol=0.20, tte=1.0, r=0.05, is_call=True)
    assert 0.5 < greeks["delta"] < 0.8  # ATM call delta ~ 0.55-0.65
    assert greeks["gamma"] > 0
    assert greeks["vega"] > 0
    assert greeks["theta"] < 0  # time decay is negative


def test_bs_greeks_put():
    greeks = _bs_greeks(spot=100, strike=100, vol=0.20, tte=1.0, r=0.05, is_call=False)
    assert -0.3 > greeks["delta"] > -0.8  # ATM put delta ~ -0.35 to -0.55
    assert greeks["gamma"] > 0
    assert greeks["vega"] > 0


def test_bs_greeks_edge_cases():
    # Zero time to expiry.
    greeks = _bs_greeks(spot=100, strike=100, vol=0.20, tte=0, r=0.05, is_call=True)
    assert greeks["delta"] == 0

    # Zero volatility.
    greeks = _bs_greeks(spot=100, strike=100, vol=0, tte=1.0, r=0.05, is_call=True)
    assert greeks["delta"] == 0


def test_greeks_generator_with_portfolio():
    gen = PortfolioGenerator(seed=42)
    gen.tick()
    positions = gen.all_positions()

    greeks_gen = GreeksGenerator()
    result = greeks_gen.compute(positions)

    assert "aggregate" in result
    assert "positions" in result
    assert result["option_count"] >= 0
    assert "delta" in result["aggregate"]
    assert "gamma" in result["aggregate"]
    assert "vega" in result["aggregate"]


def test_greeks_ignores_non_options():
    positions = [
        Instrument(
            ticker="AAPL",
            instrument_type=InstrumentType.EQUITY,
            sector="IT",
            geography="US",
            quantity=100,
            entry_price=150.0,
            current_price=155.0,
        ),
    ]
    gen = GreeksGenerator()
    result = gen.compute(positions)
    assert result["option_count"] == 0
    assert result["aggregate"]["delta"] == 0
