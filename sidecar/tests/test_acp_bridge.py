"""
Hermes ACP bridge — guard-rail tests (sidecar layer, no network / no browser).

Covers the F3b invariants:
- execute_prompt emits a deterministic event sequence (started → reasoning → finished)
- the undefined-variable bug (lower_prompt / needs_*) is fixed
- cancel_session aborts a running execution and emits ACP_EXECUTION_CANCELLED
"""

import asyncio
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from acp_client import HermesAcpBridge  # noqa: E402


@pytest.fixture()
def bridge():
    return HermesAcpBridge()


async def collect_events(bridge, session_id, prompt, timeout=10.0):
    events = []

    async def listener(event):
        events.append(event)

    bridge.add_listener(listener)
    await bridge.start_session(name=f"Session-{session_id[-4:]}")
    task = asyncio.create_task(bridge.execute_prompt(session_id, prompt))
    await asyncio.wait_for(task, timeout=timeout)
    return events


def test_execute_prompt_emits_full_sequence(bridge):
    events = asyncio.run(collect_events(bridge, "acp-test-1", "hello there"))
    types = [e["type"] for e in events]
    assert "ACP_EXECUTION_STARTED" in types
    assert "ACP_REASONING_DELTA" in types
    assert "ACP_EXECUTION_FINISHED" in types
    finished = [e for e in events if e["type"] == "ACP_EXECUTION_FINISHED"][0]
    assert finished["status"] == "SUCCESS"
    assert "final_message" in finished


def test_execute_prompt_emits_tool_event_for_inspect(bridge):
    events = asyncio.run(collect_events(bridge, "acp-test-2", "inspect the system status"))
    types = [e["type"] for e in events]
    assert "ACP_TOOL_EXECUTED" in types
    tool = [e for e in events if e["type"] == "ACP_TOOL_EXECUTED"][0]
    assert tool["tool_name"] == "system_scan"


def test_execute_prompt_emits_gate_for_patch(bridge):
    async def scenario():
        events = []

        async def listener(event):
            events.append(event)
            if event["type"] == "ACP_GATE_REQUESTED":
                await bridge.resolve_gate(event["gate"]["request_id"], "ALLOW_ONCE")

        bridge.add_listener(listener)
        await bridge.start_session(name="Session-patch")
        task = asyncio.create_task(bridge.execute_prompt("acp-test-3", "patch the file"))
        await asyncio.wait_for(task, timeout=10.0)
        return events

    events = asyncio.run(scenario())
    types = [e["type"] for e in events]
    assert "ACP_GATE_REQUESTED" in types
    gate = [e for e in events if e["type"] == "ACP_GATE_REQUESTED"][0]
    assert gate["gate"]["risk_level"] == "medium"
    assert "ACP_GATE_RESOLVED" in types


def test_cancel_session_aborts_running_execution(bridge):
    async def scenario():
        events = []

        async def listener(event):
            events.append(event)

        bridge.add_listener(listener)
        await bridge.start_session(name="Session-cancel")
        task = asyncio.create_task(bridge.execute_prompt("acp-cancel-1", "hello there"))
        # Let it start, then cancel mid-flight.
        await asyncio.sleep(0.2)
        await bridge.cancel_session("acp-cancel-1")
        try:
            await asyncio.wait_for(task, timeout=5.0)
        except asyncio.CancelledError:
            pass
        return events

    events = asyncio.run(scenario())
    types = [e["type"] for e in events]
    assert "ACP_EXECUTION_CANCELLED" in types
    assert "ACP_EXECUTION_FINISHED" not in types
