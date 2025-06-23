import os

def test_frontend_path():
    path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'client_build')
    assert os.path.basename(path) == 'client_build'
