import pytest

@pytest.mark.usefixtures("setup")
class TestGoogle:

    def test_navigate_to_google(self):
        self.driver.get("https://www.google.com")
        assert "Google" in self.driver.title