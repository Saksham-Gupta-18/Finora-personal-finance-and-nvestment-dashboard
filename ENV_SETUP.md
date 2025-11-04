# Environment setup for Finora + Forecast Service

## Backend (.env)
Create `backend/.env` with:

```
PORT=5000
CLIENT_ORIGIN=http://localhost:3000
JWT_SECRET=replace_me
DATABASE_URL=postgres://user:pass@localhost:5432/finora
FORECAST_SERVICE_URL=http://localhost:8000/forecast
```

## Forecast Service (.env)
Create `forecast_service/.env` with:

```
FORECAST_PORT=8000
CLIENT_ORIGIN=http://localhost:3000
NODE_API_BASE=http://localhost:5000/api
```

## Frontend
The frontend is already configured to hit the Node backend via `/api` proxy. Ensure your dev server proxies to `http://localhost:5000` or serve frontend from the same domain.

