from pydantic import BaseModel


class PageParams(BaseModel):
    limit: int = 50
    offset: int = 0


def clamp_page(limit: int, offset: int) -> PageParams:
    return PageParams(limit=max(1, min(limit, 100)), offset=max(0, offset))
