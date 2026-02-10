"""GICS sectors and geography definitions."""

GICS_SECTORS = {
    "Information Technology": {"weight": 0.28, "tickers": ["AAPL", "MSFT", "NVDA", "AVGO", "CSCO", "INTC", "QCOM", "AMAT", "TXN", "ACN"]},
    "Health Care": {"weight": 0.13, "tickers": ["UNH", "JNJ", "LLY", "ABBV", "MRK", "TMO", "ABT", "DHR", "BMY"]},
    "Financials": {"weight": 0.13, "tickers": ["JPM", "V", "MA", "BRK.B", "SPGI"]},
    "Consumer Discretionary": {"weight": 0.10, "tickers": ["AMZN", "TSLA", "HD", "MCD", "LOW"]},
    "Communication Services": {"weight": 0.09, "tickers": ["GOOGL", "META"]},
    "Industrials": {"weight": 0.08, "tickers": ["HON", "UNP", "RTX"]},
    "Consumer Staples": {"weight": 0.07, "tickers": ["PG", "PEP", "KO", "COST", "WMT", "PM"]},
    "Energy": {"weight": 0.05, "tickers": ["XOM", "CVX", "COP"]},
    "Utilities": {"weight": 0.03, "tickers": ["NEE"]},
    "Materials": {"weight": 0.03, "tickers": ["LIN"]},
    "Real Estate": {"weight": 0.01, "tickers": []},
}

GEOGRAPHIES = {
    "North America": {"weight": 0.60, "countries": ["US", "CA"]},
    "Europe": {"weight": 0.22, "countries": ["GB", "DE", "FR", "CH", "NL"]},
    "Asia Pacific": {"weight": 0.15, "countries": ["JP", "AU", "HK", "SG"]},
    "Emerging Markets": {"weight": 0.03, "countries": ["CN", "IN", "BR", "KR"]},
}

# Map tickers to sectors for fast lookup.
TICKER_SECTOR_MAP = {}
for sector, data in GICS_SECTORS.items():
    for ticker in data["tickers"]:
        TICKER_SECTOR_MAP[ticker] = sector
