"""Tests for decomposition engine."""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from generators.portfolio import PortfolioGenerator
from decomposition import DecompositionEngine
from models.strategies import STRATEGIES


def _make_engine():
    portfolio = PortfolioGenerator(seed=42)
    portfolio.tick()
    return DecompositionEngine(portfolio)


def test_decompose_by_strategy_top_level():
    engine = _make_engine()
    result = engine.handle_query("fin.portfolio", {"axis": "strategy"})

    assert "children" in result
    assert result["axis"] == "strategy"
    assert len(result["children"]) == len(STRATEGIES)
    for child in result["children"]:
        assert "key" in child
        assert "market_value" in child
        assert "pnl" in child
        assert child["drillable"] is True


def test_decompose_by_strategy_drill_into():
    engine = _make_engine()
    code = STRATEGIES[0].code
    result = engine.handle_query("fin.portfolio", {
        "axis": "strategy",
        "filter": code,
    })

    assert result["axis"] == "strategy"
    assert result["filter"] == code
    assert "positions" in result
    assert result["count"] > 0


def test_decompose_by_strategy_deeper_drill():
    engine = _make_engine()
    code = STRATEGIES[0].code
    result = engine.handle_query("fin.portfolio", {
        "axis": "strategy",
        "filter": code,
        "depth": 2,
    })

    # At depth 2, should decompose strategy by sector.
    assert "children" in result


def test_decompose_by_sector_top_level():
    engine = _make_engine()
    result = engine.handle_query("fin.portfolio", {"axis": "sector"})

    assert "children" in result
    assert result["axis"] == "sector"
    assert len(result["children"]) > 0


def test_decompose_by_sector_drill_into():
    engine = _make_engine()
    # First get sectors.
    top = engine.handle_query("fin.portfolio", {"axis": "sector"})
    sector_key = top["children"][0]["key"]

    result = engine.handle_query("fin.portfolio", {
        "axis": "sector",
        "filter": sector_key,
    })
    assert result["filter"] == sector_key
    assert "positions" in result


def test_decompose_by_geography():
    engine = _make_engine()
    result = engine.handle_query("fin.portfolio", {"axis": "geography"})

    assert "children" in result
    assert result["axis"] == "geography"
    assert len(result["children"]) > 0


def test_decompose_by_instrument_type():
    engine = _make_engine()
    result = engine.handle_query("fin.portfolio", {"axis": "instrument_type"})

    assert "children" in result
    assert result["axis"] == "instrument_type"
    assert len(result["children"]) > 0


def test_decompose_by_counterparty():
    engine = _make_engine()
    result = engine.handle_query("fin.portfolio", {"axis": "counterparty"})

    assert "children" in result
    assert result["axis"] == "counterparty"


def test_unknown_axis():
    engine = _make_engine()
    result = engine.handle_query("fin.portfolio", {"axis": "foobar"})
    assert "error" in result


def test_default_axis_is_strategy():
    engine = _make_engine()
    result = engine.handle_query("fin.portfolio", {})
    assert result["axis"] == "strategy"


def test_strategy_not_found():
    engine = _make_engine()
    result = engine.handle_query("fin.portfolio", {
        "axis": "strategy",
        "filter": "NONEXISTENT",
    })
    assert "error" in result
