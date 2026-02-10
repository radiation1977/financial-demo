"""Instrument types and definitions for the financial demo."""

from enum import Enum
from dataclasses import dataclass, field
from typing import Optional


class InstrumentType(Enum):
    EQUITY = "equity"
    OPTION_CALL = "option_call"
    OPTION_PUT = "option_put"
    FUTURE = "future"
    BOND = "bond"
    FX_FORWARD = "fx_forward"
    SWAP = "swap"
    CDS = "cds"


@dataclass
class Instrument:
    """A single financial instrument."""
    ticker: str
    instrument_type: InstrumentType
    sector: str
    geography: str
    currency: str = "USD"
    notional: float = 0.0
    quantity: float = 0.0
    entry_price: float = 0.0
    current_price: float = 0.0
    beta: float = 1.0
    volatility: float = 0.20
    # Options-specific
    strike: Optional[float] = None
    expiry_days: Optional[int] = None
    # Bond-specific
    duration: Optional[float] = None
    credit_spread_bps: Optional[int] = None
    counterparty: Optional[str] = None

    @property
    def market_value(self) -> float:
        if self.instrument_type in (InstrumentType.OPTION_CALL, InstrumentType.OPTION_PUT):
            return self.current_price * self.quantity * 100
        return self.current_price * self.quantity

    @property
    def pnl(self) -> float:
        if self.instrument_type in (InstrumentType.OPTION_CALL, InstrumentType.OPTION_PUT):
            return (self.current_price - self.entry_price) * self.quantity * 100
        return (self.current_price - self.entry_price) * self.quantity

    @property
    def pnl_pct(self) -> float:
        if self.entry_price == 0:
            return 0.0
        return (self.current_price / self.entry_price - 1.0) * 100.0

    def to_dict(self) -> dict:
        return {
            "ticker": self.ticker,
            "type": self.instrument_type.value,
            "sector": self.sector,
            "geography": self.geography,
            "currency": self.currency,
            "quantity": self.quantity,
            "entry_price": round(self.entry_price, 4),
            "current_price": round(self.current_price, 4),
            "market_value": round(self.market_value, 2),
            "pnl": round(self.pnl, 2),
            "pnl_pct": round(self.pnl_pct, 4),
            "beta": self.beta,
            "volatility": round(self.volatility, 4),
            "counterparty": self.counterparty,
        }


# Ticker universe for position generation.
EQUITY_TICKERS = [
    "AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA", "BRK.B",
    "JPM", "V", "UNH", "JNJ", "XOM", "PG", "MA", "HD", "CVX", "MRK",
    "ABBV", "LLY", "PEP", "KO", "COST", "AVGO", "TMO", "MCD", "WMT",
    "ACN", "CSCO", "ABT", "DHR", "NEE", "LIN", "PM", "TXN", "RTX",
    "LOW", "BMY", "UNP", "SPGI", "HON", "INTC", "QCOM", "COP", "AMAT",
]

COUNTERPARTIES = [
    "Goldman Sachs", "Morgan Stanley", "JP Morgan", "Citadel",
    "Bank of America", "UBS", "Deutsche Bank", "Barclays",
    "Credit Suisse", "BNP Paribas",
]
