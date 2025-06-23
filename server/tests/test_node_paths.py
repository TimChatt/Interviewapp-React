import subprocess

def test_node_paths():
    subprocess.check_call(['node', 'client/check_paths.js'])
