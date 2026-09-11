"""Pytest configuration and fixtures."""

import pytest


@pytest.fixture
def mock_settings():
    """Mock settings for testing."""
    from app.core.config import Settings

    return Settings(
        internal_service_token="test-internal-token",
        debug=True,
    )
