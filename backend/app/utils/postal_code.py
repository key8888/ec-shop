import httpx


async def lookup_postal_code(postal_code: str) -> dict | None:
    normalized = postal_code.replace("-", "").replace(" ", "")
    if len(normalized) != 7 or not normalized.isdigit():
        return None

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(
                f"https://zipcloud.ibsnet.co.jp/api/search?zipcode={normalized}"
            )
            response.raise_for_status()
            data = response.json()

            if data.get("status") != 200 or not data.get("results"):
                return None

            result = data["results"][0]
            return {
                "prefecture": result.get("address1", ""),
                "city": result.get("address2", ""),
                "address1": result.get("address3", ""),
            }
    except (httpx.HTTPError, httpx.TimeoutException):
        return None
