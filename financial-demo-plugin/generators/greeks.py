"""Options Greeks generation for the financial demo."""

import math
import time
from typing import List

import numpy as np

from models.instruments import Instrument, InstrumentType


def _norm_cdf(x: float) -> float:
    """Standard normal CDF approximation."""
    return 0.5 * (1.0 + math.erf(x / math.sqrt(2.0)))


def _bs_greeks(
    spot: float,
    strike: float,
    vol: float,
    tte: float,  # time to expiry in years
    r: float = 0.05,
    is_call: bool = True,
) -> dict:
    """Black-Scholes Greeks for a European option."""
    if tte <= 0 or vol <= 0 or strike <= 0 or spot <= 0:
        return {"delta": 0, "gamma": 0, "vega": 0, "theta": 0, "rho": 0}

    sqrt_t = math.sqrt(tte)
    d1 = (math.log(spot / strike) + (r + 0.5 * vol ** 2) * tte) / (vol * sqrt_t)
    d2 = d1 - vol * sqrt_t

    nd1 = _norm_cdf(d1)
    nd2 = _norm_cdf(d2)
    npd1 = math.exp(-0.5 * d1 ** 2) / math.sqrt(2.0 * math.pi)

    if is_call:
        delta = nd1
        theta = (-(spot * npd1 * vol) / (2 * sqrt_t)
                 - r * strike * math.exp(-r * tte) * nd2) / 365.0
        rho = strike * tte * math.exp(-r * tte) * nd2 / 100.0
    else:
        delta = nd1 - 1.0
        theta = (-(spot * npd1 * vol) / (2 * sqrt_t)
                 + r * strike * math.exp(-r * tte) * _norm_cdf(-d2)) / 365.0
        rho = -strike * tte * math.exp(-r * tte) * _norm_cdf(-d2) / 100.0

    gamma = npd1 / (spot * vol * sqrt_t)
    vega = spot * npd1 * sqrt_t / 100.0

    return {
        "delta": round(delta, 6),
        "gamma": round(gamma, 6),
        "vega": round(vega, 6),
        "theta": round(theta, 6),
        "rho": round(rho, 6),
    }


class GreeksGenerator:
    """Generates Greeks for all option positions in the portfolio."""

    def __init__(self, risk_free_rate: float = 0.05):
        self.r = risk_free_rate

    def compute(self, positions: List[Instrument]) -> dict:
        """Compute aggregate and per-position Greeks."""
        option_greeks = []
        agg = {"delta": 0.0, "gamma": 0.0, "vega": 0.0, "theta": 0.0, "rho": 0.0}

        for pos in positions:
            if pos.instrument_type not in (InstrumentType.OPTION_CALL, InstrumentType.OPTION_PUT):
                continue
            if pos.strike is None or pos.expiry_days is None:
                continue

            is_call = pos.instrument_type == InstrumentType.OPTION_CALL
            tte = pos.expiry_days / 365.0
            # Use underlying price estimate from strike.
            spot_est = pos.strike * (1.0 + (pos.current_price / max(pos.strike * 0.05, 1.0) - 0.5) * 0.1)

            greeks = _bs_greeks(spot_est, pos.strike, pos.volatility, tte, self.r, is_call)

            # Scale by position size.
            multiplier = abs(pos.quantity) * 100  # options contract multiplier
            scaled = {k: v * multiplier for k, v in greeks.items()}

            for k in agg:
                agg[k] += scaled[k]

            option_greeks.append({
                "ticker": pos.ticker,
                "type": pos.instrument_type.value,
                "strike": pos.strike,
                "expiry_days": pos.expiry_days,
                "quantity": pos.quantity,
                "spot_est": round(spot_est, 2),
                "iv": round(pos.volatility, 4),
                **{k: round(v, 4) for k, v in greeks.items()},
                **{f"scaled_{k}": round(v, 2) for k, v in scaled.items()},
            })

        return {
            "timestamp_ms": int(time.time() * 1000),
            "option_count": len(option_greeks),
            "aggregate": {k: round(v, 2) for k, v in agg.items()},
            "positions": option_greeks,
        }
