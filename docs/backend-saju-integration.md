# Backend Saju Integration

The app calls the local Next route `POST /api/saju` for manseryeok/saju data.
That route proxies to the MYUNG.ai backend when `MYUNG_BACKEND_API_BASE_URL` is set.
If the backend is unset, unreachable, or returns a non-2xx response, the route falls back to the existing local calculator.

## Backend Contract

The current backend repository exposes:

- `POST /api/v1/home/bootstrap`
- `GET /api/v1/home/charts/:chartId`
- `GET /api/v1/home/charts/:chartId/pillars`
- `GET /api/v1/home/charts/:chartId/elements`
- `GET /api/v1/home/charts/:chartId/ten-gods`
- `GET /api/v1/home/charts/:chartId/strength`
- `GET /api/v1/home/charts/:chartId/useful-gods`
- `GET /api/v1/home/charts/:chartId/luck/current`
- `GET /api/v1/home/charts/:chartId/interpretations`

The frontend currently uses only `POST /api/v1/home/bootstrap`.

Request body:

```json
{
  "nickname": "MYUNG",
  "birthDate": "1999-08-14",
  "birthTime": "13:42",
  "timezone": "Asia/Seoul",
  "calendarInputType": "SOLAR"
}
```

The backend DTO currently expects uppercase `SOLAR` or `LUNAR`. The checked-in OpenAPI YAML lists lowercase `solar` and `lunar`, so the frontend follows the implementation rather than the YAML until the backend contract is reconciled.

## Local Experiment

Set this in `.env.local`:

```bash
MYUNG_BACKEND_API_BASE_URL=http://localhost:3001
```

Then run the frontend and backend. The response header `x-myung-saju-source` is `backend` when the backend was used and `local` when the fallback handled the request.
