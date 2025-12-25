from dataclasses import dataclass
from typing import Any

from litestar import Litestar, get
from tortoise import Model


@dataclass()
class Result:
    ok: bool
    data: Any | None = None


class TodoItem(Model):
    # title: fields.
    pass


@get("/healthz")
async def healthz() -> Result:
    return Result(ok=True)


app = Litestar([healthz])
