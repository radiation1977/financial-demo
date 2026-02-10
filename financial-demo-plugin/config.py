"""Plugin configuration constants for the financial demo."""

# Swarm connection
SWARM_SOCKET = "/tmp/cambrian/plugins/financial-demo.sock"
PLUGIN_NAME = "financial-demo"
PLUGIN_VERSION = "1.0.0"
PLUGIN_TRAITS = ["CubeFaceProvider"]

# Market simulation
MARKET_TICK_INTERVAL_S = 3.0
RANDOM_SEED = 42

# Data channels
CHANNELS = [
    "fin.portfolio",
    "fin.greeks",
    "fin.var",
    "fin.compliance",
    "fin.exposure",
    "fin.performance",
    "fin.concentration",
    "fin.counterparty",
    "fin.sector_exposure",
    "fin.liquidity",
    "fin.audit_feed",
    "fin.actors",
]

# Portfolio sizing
NUM_STRATEGIES = 6
POSITIONS_PER_STRATEGY = 15
INITIAL_NAV = 2_500_000_000  # $2.5B AUM

# VaR parameters
VAR_CONFIDENCE_LEVELS = [0.95, 0.99]
VAR_HORIZON_DAYS = [1, 10]
VAR_NUM_SIMULATIONS = 10_000

# Compliance thresholds
MAX_SINGLE_NAME_PCT = 5.0
MAX_SECTOR_PCT = 25.0
MAX_COUNTRY_PCT = 30.0
MAX_LEVERAGE = 2.0
