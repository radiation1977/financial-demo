"""Tests for VaR generation."""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from generators.var import VaRGenerator
from generators.portfolio import PortfolioGenerator


def test_var_computation():
    portfolio = PortfolioGenerator(seed=42)
    portfolio.tick()
    positions = portfolio.all_positions()
    nav = portfolio.nav

    var_gen = VaRGenerator(seed=42)
    result = var_gen.compute(positions, nav)

    assert "horizons" in result
    assert "1d" in result["horizons"]
    assert "10d" in result["horizons"]
    assert "95%" in result["horizons"]["1d"]
    assert "99%" in result["horizons"]["1d"]

    # VaR should be positive (it's a loss measure).
    var_95 = result["horizons"]["1d"]["95%"]["var"]
    var_99 = result["horizons"]["1d"]["99%"]["var"]
    assert var_99 >= var_95, "99% VaR should be >= 95% VaR"

    # CVaR should be >= VaR.
    cvar_95 = result["horizons"]["1d"]["95%"]["cvar"]
    assert cvar_95 >= var_95, "CVaR should be >= VaR"


def test_var_with_empty_positions():
    var_gen = VaRGenerator(seed=42)
    result = var_gen.compute([], 1_000_000)
    assert result["simulations"] == 0


def test_var_component_by_sector():
    portfolio = PortfolioGenerator(seed=42)
    portfolio.tick()
    positions = portfolio.all_positions()
    nav = portfolio.nav

    var_gen = VaRGenerator(seed=42)
    result = var_gen.compute(positions, nav)

    assert "component_var" in result
    assert len(result["component_var"]) > 0


def test_var_distribution_stats():
    portfolio = PortfolioGenerator(seed=42)
    portfolio.tick()
    positions = portfolio.all_positions()

    var_gen = VaRGenerator(seed=42)
    result = var_gen.compute(positions, portfolio.nav)

    dist = result["horizons"]["1d"]["distribution"]
    assert "mean" in dist
    assert "std" in dist
    assert dist["std"] > 0
    assert "skew" in dist
    assert "kurtosis" in dist
