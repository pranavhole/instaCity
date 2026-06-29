import json

import httpx
import pytest

from app.services.instagram.apify_provider import ApifyInstagramProvider
from app.services.instagram.base import ProviderConfigurationError


@pytest.mark.asyncio
async def test_apify_provider_runs_scraper_and_maps_posts_to_profile_snapshot() -> None:
    requests: list[httpx.Request] = []

    def handler(request: httpx.Request) -> httpx.Response:
        requests.append(request)
        assert request.method == "POST"
        assert request.url.host == "api.apify.com"
        assert request.url.path == "/v2/acts/apify~instagram-scraper/run-sync-get-dataset-items"
        assert request.url.params["token"] == "apify-token"
        assert request.url.params["clean"] == "true"
        assert request.url.params["format"] == "json"
        assert request.url.params["timeout"] == "120"
        payload = json.loads(request.content.decode())
        assert payload["directUrls"] == ["https://www.instagram.com/humansofny/"]
        assert payload["searchType"] == "hashtag"
        assert payload["searchLimit"] == 10
        if payload["resultsType"] == "details":
            assert payload["resultsLimit"] == 1
            return httpx.Response(
                201,
                json=[
                    {
                        "id": "profile-242777241",
                        "username": "humansofny",
                        "profilePicUrl": "https://cdn.example.com/detail-profile.jpg",
                        "followersCount": 12500000,
                        "followsCount": 200,
                        "postsCount": 7900,
                    }
                ],
            )

        assert payload["resultsType"] == "posts"
        assert payload["resultsLimit"] == 100
        return httpx.Response(
            201,
            json=[
                {
                    "ownerUsername": "humansofny",
                    "ownerProfilePicUrl": "https://cdn.example.com/profile.jpg",
                    "type": "Image",
                    "shortCode": "AAA111",
                    "url": "https://www.instagram.com/p/AAA111/",
                    "displayUrl": "https://cdn.example.com/aaa.jpg",
                    "likesCount": 100,
                    "commentsCount": 10,
                    "videoViewCount": 0,
                    "timestamp": "2026-06-01T10:00:00.000Z",
                    "caption": "first post",
                },
                {
                    "ownerId": "242777241",
                    "ownerUsername": "humansofny",
                    "ownerProfilePicUrl": "https://cdn.example.com/profile.jpg",
                    "type": "Video",
                    "shortCode": "BBB222",
                    "url": "https://www.instagram.com/p/BBB222/",
                    "displayUrl": "https://cdn.example.com/bbb.jpg",
                    "likesCount": 300,
                    "commentsCount": 40,
                    "videoViewCount": 12000,
                    "timestamp": "2026-06-02T10:00:00.000Z",
                    "caption": "viral post",
                },
            ],
        )

    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as client:
        provider = ApifyInstagramProvider(api_token="apify-token", http_client=client)
        snapshot = await provider.fetch_public_profile("@humansofny")

    assert len(requests) == 2
    assert snapshot.account.instagram_user_id == "profile-242777241"
    assert snapshot.account.username == "humansofny"
    assert snapshot.account.profile_picture_url == "https://cdn.example.com/detail-profile.jpg"
    assert snapshot.account.account_type == "APIFY_PUBLIC"
    assert snapshot.stats.followers_count == 12500000
    assert snapshot.stats.follows_count == 200
    assert snapshot.stats.media_count == 7900
    assert snapshot.stats.avg_likes == 200
    assert snapshot.stats.avg_comments == 25
    assert snapshot.stats.avg_views == 6000
    assert snapshot.stats.reels_count == 1
    assert snapshot.stats.top_post_image_url == "https://cdn.example.com/bbb.jpg"
    assert snapshot.stats.top_post_url == "https://www.instagram.com/p/BBB222/"
    assert [post.shortcode for post in snapshot.posts] == ["AAA111", "BBB222"]


@pytest.mark.asyncio
async def test_apify_provider_requires_api_token() -> None:
    provider = ApifyInstagramProvider(api_token=None)

    with pytest.raises(ProviderConfigurationError, match="APIFY_API_TOKEN"):
        await provider.fetch_public_profile("humansofny")


@pytest.mark.asyncio
async def test_apify_provider_accepts_full_profile_url() -> None:
    seen_direct_urls: list[list[str]] = []

    def handler(request: httpx.Request) -> httpx.Response:
        seen_direct_urls.append(json.loads(request.content.decode())["directUrls"])
        results_type = json.loads(request.content.decode())["resultsType"]
        if results_type == "details":
            return httpx.Response(201, json=[{"username": "nasa", "followersCount": 100}])
        return httpx.Response(
            201,
            json=[
                {
                    "ownerUsername": "nasa",
                    "shortCode": "NASA1",
                    "displayUrl": "https://cdn.example.com/nasa.jpg",
                    "likesCount": 10,
                    "commentsCount": 1,
                }
            ],
        )

    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as client:
        provider = ApifyInstagramProvider(api_token="apify-token", http_client=client)
        await provider.fetch_public_profile("https://www.instagram.com/nasa/")

    assert seen_direct_urls == [["https://www.instagram.com/nasa/"], ["https://www.instagram.com/nasa/"]]


@pytest.mark.asyncio
async def test_apify_provider_uses_latest_posts_from_profile_details_without_posts_scrape() -> None:
    requests: list[dict] = []

    def handler(request: httpx.Request) -> httpx.Response:
        payload = json.loads(request.content.decode())
        requests.append(payload)
        assert payload["resultsType"] == "details"
        return httpx.Response(
            201,
            json=[
                {
                    "id": "nasa-profile",
                    "username": "nasa",
                    "profilePicUrl": "https://cdn.example.com/nasa-profile.jpg",
                    "followersCount": 95000000,
                    "followsCount": 80,
                    "postsCount": 4000,
                    "latestPosts": [
                        {
                            "shortCode": "NASA1",
                            "url": "https://www.instagram.com/p/NASA1/",
                            "displayUrl": "https://cdn.example.com/nasa-1.jpg",
                            "likesCount": 1000,
                            "commentsCount": 50,
                        },
                        {
                            "shortCode": "NASA2",
                            "url": "https://www.instagram.com/p/NASA2/",
                            "displayUrl": "https://cdn.example.com/nasa-2.jpg",
                            "likesCount": 3000,
                            "commentsCount": 150,
                        },
                    ],
                }
            ],
        )

    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as client:
        provider = ApifyInstagramProvider(api_token="apify-token", http_client=client)
        snapshot = await provider.fetch_public_profile("nasa")

    assert [request["resultsType"] for request in requests] == ["details"]
    assert snapshot.account.username == "nasa"
    assert snapshot.stats.followers_count == 95000000
    assert snapshot.stats.avg_likes == 2000
    assert snapshot.stats.avg_comments == 100
    assert snapshot.stats.top_post_url == "https://www.instagram.com/p/NASA2/"


@pytest.mark.asyncio
async def test_apify_provider_retries_posts_with_smaller_limit_after_actor_timeout() -> None:
    post_limits: list[int] = []

    def handler(request: httpx.Request) -> httpx.Response:
        payload = json.loads(request.content.decode())
        if payload["resultsType"] == "details":
            return httpx.Response(
                201,
                json=[
                    {
                        "id": "nasa-profile",
                        "username": "nasa",
                        "followersCount": 95000000,
                        "postsCount": 4000,
                    }
                ],
            )

        post_limits.append(payload["resultsLimit"])
        if payload["resultsLimit"] == 100:
            return httpx.Response(
                400,
                json={
                    "error": {
                        "message": "Actor run did not succeed (run ID: abc, status: TIMED-OUT)."
                    }
                },
            )
        return httpx.Response(
            201,
            json=[
                {
                    "ownerUsername": "nasa",
                    "shortCode": "NASA1",
                    "displayUrl": "https://cdn.example.com/nasa.jpg",
                    "likesCount": 1000,
                    "commentsCount": 50,
                }
            ],
        )

    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as client:
        provider = ApifyInstagramProvider(api_token="apify-token", http_client=client)
        snapshot = await provider.fetch_public_profile("nasa")

    assert post_limits == [100, 12]
    assert snapshot.account.username == "nasa"
    assert snapshot.stats.followers_count == 95000000
    assert snapshot.stats.avg_likes == 1000
    assert snapshot.stats.avg_comments == 50


@pytest.mark.asyncio
async def test_apify_provider_rejects_error_only_dataset_items() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(
            201,
            json=[
                {
                    "inputUrl": "https://www.instagram.com/private_profile/",
                    "url": "https://www.instagram.com/private_profile/",
                    "error": "profile_unavailable",
                    "errorDescription": "Profile data could not be loaded",
                }
            ],
        )

    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as client:
        provider = ApifyInstagramProvider(api_token="apify-token", http_client=client)
        with pytest.raises(ProviderConfigurationError, match="Profile data could not be loaded"):
            await provider.fetch_public_profile("private_profile")
