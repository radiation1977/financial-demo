"""Tests for channel builder."""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from channels import ChannelBuilder
from config import CHANNELS


def test_build_all_returns_all_channels():
    builder = ChannelBuilder(seed=42)
    payloads = builder.build_all()

    # On tick 1, VaR is computed (tick % 5 == 1).
    for ch in CHANNELS:
        assert ch in payloads, f"Missing channel: {ch}"


def test_var_computed_on_first_tick():
    builder = ChannelBuilder(seed=42)
    payloads = builder.build_all()  # tick 1
    assert "fin.var" in payloads


def test_var_skipped_on_non_matching_tick():
    builder = ChannelBuilder(seed=42)
    builder.build_all()  # tick 1 — VaR computed
    payloads = builder.build_all()  # tick 2 — VaR skipped
    assert "fin.var" not in payloads


def test_portfolio_channel_structure():
    builder = ChannelBuilder(seed=42)
    payloads = builder.build_all()
    portfolio = payloads["fin.portfolio"]

    assert "nav" in portfolio
    assert "strategies" in portfolio
    assert "tick" in portfolio


def test_greeks_channel_structure():
    builder = ChannelBuilder(seed=42)
    payloads = builder.build_all()
    greeks = payloads["fin.greeks"]

    assert "aggregate" in greeks
    assert "option_count" in greeks


def test_compliance_channel_structure():
    builder = ChannelBuilder(seed=42)
    payloads = builder.build_all()
    compliance = payloads["fin.compliance"]

    assert "violations" in compliance
    assert "status" in compliance


def test_exposure_channel_structure():
    builder = ChannelBuilder(seed=42)
    payloads = builder.build_all()
    exposure = payloads["fin.exposure"]

    assert "by_sector" in exposure
    assert "by_geography" in exposure


def test_liquidity_channel_structure():
    builder = ChannelBuilder(seed=42)
    payloads = builder.build_all()
    liquidity = payloads["fin.liquidity"]

    assert "tiers" in liquidity
    assert "tiers_pct" in liquidity


def test_concentration_channel_structure():
    builder = ChannelBuilder(seed=42)
    payloads = builder.build_all()
    conc = payloads["fin.concentration"]

    assert "top_positions" in conc
    assert len(conc["top_positions"]) <= 10


def test_actors_channel_structure():
    builder = ChannelBuilder(seed=42)
    payloads = builder.build_all()
    actors = payloads["fin.actors"]

    assert "generators" in actors
    assert "portfolio" in actors["generators"]


def test_deterministic_output():
    builder1 = ChannelBuilder(seed=99)
    builder2 = ChannelBuilder(seed=99)

    p1 = builder1.build_all()
    p2 = builder2.build_all()

    assert p1["fin.portfolio"]["nav"] == p2["fin.portfolio"]["nav"]
