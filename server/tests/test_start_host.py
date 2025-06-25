from pathlib import Path


def test_start_uses_public_host():
    start_path = Path(__file__).resolve().parents[2] / "start.sh"
    content = start_path.read_text()
    assert "--host 0.0.0.0" in content
