from app.services.instagram.base import InstagramAccountData, InstagramStatsData, ProviderConfigurationError


class MetaInstagramProvider:
    def __init__(self, app_id: str | None = None, app_secret: str | None = None, redirect_uri: str | None = None) -> None:
        self.app_id = app_id
        self.app_secret = app_secret
        self.redirect_uri = redirect_uri

    def _ensure_configured(self) -> None:
        if not self.app_id or not self.app_secret or not self.redirect_uri:
            raise ProviderConfigurationError(
                "Meta Instagram provider requires app_id, app_secret, and redirect_uri from an approved Meta app."
            )

    def get_login_url(self, state: str) -> str:
        self._ensure_configured()
        raise NotImplementedError("Meta login URL generation must be connected to the approved Meta OAuth app.")

    async def exchange_code(self, code: str) -> str:
        self._ensure_configured()
        raise NotImplementedError("Meta code exchange must call the Meta Graph API token endpoint.")

    async def fetch_account(self, access_token: str) -> InstagramAccountData:
        self._ensure_configured()
        raise NotImplementedError("Meta account fetch must call the Instagram professional account Graph API.")

    async def fetch_stats(self, access_token: str) -> InstagramStatsData:
        self._ensure_configured()
        raise NotImplementedError("Meta stat fetch must aggregate media insights from the Meta Graph API.")
