"""Value-at-Risk calculation for the financial demo."""

import math
import time
from typing import List

import numpy as np

from config import VAR_CONFIDENCE_LEVELS, VAR_HORIZON_DAYS, VAR_NUM_SIMULATIONS
from models.instruments import Instrument


class VaRGenerator:
    """Monte Carlo Value-at-Risk engine.

    Uses parametric VaR with position-level volatility and beta estimates
    to simulate portfolio P&L distributions.
    """

    def __init__(self, seed: int = 42):
        self.rng = np.random.default_rng(seed + 100)

    def compute(self, positions: List[Instrument], nav: float) -> dict:
        """Compute VaR at multiple confidence levels and horizons."""
        if not positions or nav <= 0:
            return self._empty_result()

        # Build position vectors.
        n = len(positions)
        weights = np.array([p.market_value / max(nav, 1) for p in positions])
        vols = np.array([p.volatility for p in positions])
        betas = np.array([p.beta for p in positions])

        results = {}

        for horizon in VAR_HORIZON_DAYS:
            horizon_results = {}
            sqrt_h = math.sqrt(horizon)

            # Generate correlated returns via single-factor model.
            market_shocks = self.rng.normal(0, 1, VAR_NUM_SIMULATIONS)
            idio_shocks = self.rng.normal(0, 1, (VAR_NUM_SIMULATIONS, n))

            # Portfolio P&L for each simulation.
            pnl_sims = np.zeros(VAR_NUM_SIMULATIONS)
            for i in range(VAR_NUM_SIMULATIONS):
                returns = (betas * market_shocks[i] * 0.01 * sqrt_h
                           + vols * idio_shocks[i] * 0.5 * sqrt_h / math.sqrt(252))
                pnl_sims[i] = np.sum(weights * returns) * nav

            # Sort for percentile extraction.
            pnl_sorted = np.sort(pnl_sims)

            for confidence in VAR_CONFIDENCE_LEVELS:
                idx = int((1 - confidence) * VAR_NUM_SIMULATIONS)
                var_value = -pnl_sorted[max(idx, 0)]
                # CVaR (Expected Shortfall): mean of losses beyond VaR.
                cvar_value = -np.mean(pnl_sorted[:max(idx, 1)])

                key = f"{confidence:.0%}"
                horizon_results[key] = {
                    "var": round(float(var_value), 2),
                    "var_pct": round(float(var_value / nav * 100), 4),
                    "cvar": round(float(cvar_value), 2),
                    "cvar_pct": round(float(cvar_value / nav * 100), 4),
                }

            # Distribution stats.
            horizon_results["distribution"] = {
                "mean": round(float(np.mean(pnl_sims)), 2),
                "std": round(float(np.std(pnl_sims)), 2),
                "skew": round(float(self._skewness(pnl_sims)), 4),
                "kurtosis": round(float(self._kurtosis(pnl_sims)), 4),
                "min": round(float(np.min(pnl_sims)), 2),
                "max": round(float(np.max(pnl_sims)), 2),
            }

            results[f"{horizon}d"] = horizon_results

        # Component VaR by strategy.
        component_var = self._component_var(positions, nav)

        return {
            "timestamp_ms": int(time.time() * 1000),
            "nav": round(nav, 2),
            "simulations": VAR_NUM_SIMULATIONS,
            "horizons": results,
            "component_var": component_var,
        }

    def _component_var(self, positions: List[Instrument], nav: float) -> dict:
        """Approximate component VaR by sector."""
        sector_var: dict = {}
        for pos in positions:
            contrib = abs(pos.market_value) * pos.volatility / math.sqrt(252)
            sector_var[pos.sector] = sector_var.get(pos.sector, 0.0) + contrib

        return {k: round(v, 2) for k, v in sorted(sector_var.items(), key=lambda x: -x[1])}

    @staticmethod
    def _skewness(data: np.ndarray) -> float:
        n = len(data)
        if n < 3:
            return 0.0
        mean = np.mean(data)
        std = np.std(data)
        if std == 0:
            return 0.0
        return float(np.mean(((data - mean) / std) ** 3))

    @staticmethod
    def _kurtosis(data: np.ndarray) -> float:
        n = len(data)
        if n < 4:
            return 0.0
        mean = np.mean(data)
        std = np.std(data)
        if std == 0:
            return 0.0
        return float(np.mean(((data - mean) / std) ** 4) - 3.0)

    def _empty_result(self) -> dict:
        return {
            "timestamp_ms": int(time.time() * 1000),
            "nav": 0,
            "simulations": 0,
            "horizons": {},
            "component_var": {},
        }
