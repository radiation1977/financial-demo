#!/usr/bin/env python3
"""Financial Demo Plugin — Entry point.

Connects to the Cambrian Swarm plugin host, registers with trait
"CubeFaceProvider", then enters a loop that:
  1. Ticks the market simulation every MARKET_TICK_INTERVAL_S seconds.
  2. Pushes all 12 data channels to the swarm.
  3. Handles DataChannelQuery messages for decomposition drill-downs.
"""

import os
import sys
import time
import json
import threading
import logging

# Ensure the plugin root is on sys.path.
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from lib.swarm_client import SwarmConnection, SwarmError
from config import (
    SWARM_SOCKET, PLUGIN_NAME, PLUGIN_VERSION, PLUGIN_TRAITS,
    MARKET_TICK_INTERVAL_S, RANDOM_SEED, CHANNELS,
)
from channels import ChannelBuilder
from decomposition import DecompositionEngine

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
log = logging.getLogger("financial-demo")


def main():
    socket_path = os.environ.get("SWARM_SOCKET", SWARM_SOCKET)
    log.info("Connecting to swarm at %s", socket_path)

    try:
        conn = SwarmConnection.unix(socket_path)
    except Exception as e:
        log.error("Failed to connect: %s", e)
        sys.exit(1)

    # Register with the swarm.
    try:
        resp = conn.register(PLUGIN_NAME, PLUGIN_VERSION, PLUGIN_TRAITS, [])
        plugin_id = resp["plugin_id"]
        node_id = resp["node_id"]
        log.info("Registered as %s on node %s", plugin_id, node_id)
    except SwarmError as e:
        log.error("Registration failed: %s", e)
        conn.close()
        sys.exit(1)

    # Wait for Start message.
    try:
        start_msg = conn.recv_message()
        if start_msg.get("type") == "StartReq":
            conn.send_message({
                "type": "StartResp",
                "payload": {"success": True, "error": ""},
            })
            log.info("Started successfully")
        else:
            log.warning("Expected StartReq, got %s", start_msg.get("type"))
    except SwarmError as e:
        log.error("Start handshake failed: %s", e)
        conn.close()
        sys.exit(1)

    # Build generators.
    builder = ChannelBuilder(seed=RANDOM_SEED)
    decomp = DecompositionEngine(builder.portfolio)

    # Start the query handler in a background thread.
    query_thread = threading.Thread(
        target=_query_loop,
        args=(conn, decomp),
        daemon=True,
    )
    # Note: we don't start query_thread here because the connection is
    # single-threaded. Instead, we interleave query handling with ticks.

    log.info("Entering market tick loop (interval=%.1fs, channels=%d)",
             MARKET_TICK_INTERVAL_S, len(CHANNELS))

    tick = 0
    try:
        while True:
            tick += 1
            start = time.monotonic()

            # Build all channel payloads.
            channel_payloads = builder.build_all()

            # Push each channel to the swarm.
            for channel_name, payload in channel_payloads.items():
                try:
                    conn.push_channel(channel_name, payload)
                except SwarmError as e:
                    log.warning("Failed to push %s: %s", channel_name, e)

            elapsed = time.monotonic() - start
            if tick % 10 == 0:
                log.info(
                    "Tick %d: pushed %d channels in %.1fms, NAV=$%.0f",
                    tick,
                    len(channel_payloads),
                    elapsed * 1000,
                    builder.portfolio.nav,
                )

            # Sleep until next tick.
            sleep_time = max(0, MARKET_TICK_INTERVAL_S - elapsed)
            if sleep_time > 0:
                time.sleep(sleep_time)

    except KeyboardInterrupt:
        log.info("Shutting down")
    except SwarmError as e:
        log.error("Connection error: %s", e)
    finally:
        conn.close()


def _query_loop(conn: SwarmConnection, decomp: DecompositionEngine):
    """Handle incoming DataChannelQuery messages (blocking loop)."""
    def handle_query(query: dict) -> dict:
        channel = query.get("channel", "")
        return decomp.handle_query(channel, query.get("query", {}))

    try:
        conn.on_channel_query("fin.portfolio", handle_query)
    except SwarmError:
        pass


if __name__ == "__main__":
    main()
