import importlib.util

MODULES = [
    "server.main",
    "server.ashbyapi",
    "server.deps",
    "server.openai_client",
    "server.routers.users",
    "server.routers.policies",
]

def test_modules_importable():
    for m in MODULES:
        assert importlib.util.find_spec(m) is not None, f"Cannot import {m}"
