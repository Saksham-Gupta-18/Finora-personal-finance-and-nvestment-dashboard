from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import os
import requests
import uvicorn
import math
from typing import List, Dict, Any, Tuple

API_BASE = os.getenv("NODE_API_BASE", "http://localhost:5000/api")
CLIENT_ORIGIN = os.getenv("CLIENT_ORIGIN", "http://localhost:3000")
DEBUG = os.getenv("DEBUG", "false").lower() == "true"

app = FastAPI(title="Finora Forecast Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[CLIENT_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def group_expenses_by_month(expenses: List[Dict[str, Any]]) -> Dict[str, float]:
    monthly: Dict[str, float] = {}
    for e in expenses:
        try:
            amount = float(e.get("amount", 0))
        except (TypeError, ValueError):
            amount = 0.0
        date_str = str(e.get("date", ""))
        month = date_str[:7] if len(date_str) >= 7 else ""
        if not month:
            continue
        monthly[month] = monthly.get(month, 0.0) + amount
    return dict(sorted(monthly.items()))


@app.get("/forecast")
def forecast(request: Request):
    try:
        # Fetch expenses from Node backend
        headers = {}
        auth = request.headers.get('authorization')
        if auth:
            headers['Authorization'] = auth
        resp = requests.get(f"{API_BASE}/expenses", timeout=10, headers=headers)
        try:
            resp.raise_for_status()
        except Exception as e:
            if DEBUG:
                return {"message": "Unable to fetch data from backend for forecasting.", "status": resp.status_code, "body": resp.text}
            raise e
        data_json = resp.json()
        expenses = data_json if isinstance(data_json, list) else data_json.get("expenses", [])
    except Exception as e:
        if DEBUG:
            return {"message": "Unable to fetch data from backend for forecasting.", "detail": str(e)}
        return {"message": "Unable to fetch data from backend for forecasting."}

    if not expenses or len(expenses) < 2:
        return {"message": "Not enough data to forecast."}

    monthly_map = group_expenses_by_month(expenses)
    months = list(monthly_map.keys())
    values = [monthly_map[m] for m in months]

    if len(values) < 2:
        return {"message": "Not enough data to forecast."}

    # Use last 2 windows of 3 months each when possible, else fallback
    window = 3 if len(values) >= 6 else max(1, len(values) // 2)
    prev_vals = values[-2*window:-window]
    recent_vals = values[-window:]

    if not prev_vals or not recent_vals:
        return {"message": "Not enough data to forecast."}

    previous_avg = sum(prev_vals) / len(prev_vals)
    recent_avg = sum(recent_vals) / len(recent_vals)

    if previous_avg == 0:
        return {"message": "Not enough data to forecast."}

    growth_rate = (recent_avg - previous_avg) / previous_avg
    last_month_expense = recent_avg if recent_avg > 0 else (values[-1] if values else 0)
    forecast_next = last_month_expense * (1 + growth_rate)

    # Clamp to non-negative and round sensibly
    forecast_next = max(0.0, forecast_next)
    forecast_next_rounded = round(forecast_next, 2)

    pct = round(growth_rate * 100, 2)
    arrow = "+" if growth_rate >= 0 else ""
    message = f"Your next month’s expenses are expected to be ₹{int(forecast_next_rounded):,} ({arrow}{pct}% from last month)."

    return {
        "forecast_next_month": forecast_next_rounded,
        "growth_rate": growth_rate,
        "message": message,
        "monthly": [{"month": m, "expense": v} for m, v in monthly_map.items()],
    }


def monthly_goal_contributions(contribs: List[Dict[str, Any]]) -> Dict[str, Dict[str, float]]:
    per_goal: Dict[str, Dict[str, float]] = {}
    for c in contribs:
        gid = str(c.get("goal_id"))
        amount = float(c.get("amount", 0) or 0)
        d = str(c.get("date", ""))
        month = d[:7] if len(d) >= 7 else ""
        if not gid or not month:
            continue
        per_goal.setdefault(gid, {})
        per_goal[gid][month] = per_goal[gid].get(month, 0.0) + amount
    # sort months
    return {gid: dict(sorted(m.items())) for gid, m in per_goal.items()}


def compute_goal_forecast(goal: Dict[str, Any], monthly_series: Dict[str, float]) -> Dict[str, Any]:
    target_amount = float(goal.get("target_amount", 0) or 0)
    current_savings = float(goal.get("current_savings", 0) or 0)
    target_date_str = str(goal.get("target_date", ""))

    values = list(monthly_series.values())
    if not values:
        avg_monthly = 0.0
    else:
        window = min(6, len(values))
        avg_monthly = sum(values[-window:]) / window

    remaining = max(0.0, target_amount - current_savings)
    months_needed = remaining / avg_monthly if avg_monthly > 0 else float("inf")

    # If no historical contributions and no current savings, treat as not enough data
    if len(values) == 0 and current_savings <= 0:
        return {
            "not_enough_data": True,
            "avg_monthly": 0.0,
            "months_needed": None,
            "estimated_completion_date": "",
            "status": "unknown",
            "required_per_month": remaining,
            "completion_probability": 0.0,
            "series": [],
        }

    # estimated completion date
    try:
        from datetime import datetime, timedelta
        if values:
            last_month_key = list(monthly_series.keys())[-1]
            y, m = map(int, last_month_key.split("-"))
            base = datetime(y, m, 1)
        else:
            base = datetime.utcnow().replace(day=1)
        est_date = base
        # add months_needed months
        whole = int(months_needed)
        frac = months_needed - whole
        est_year = est_date.year + (est_date.month - 1 + whole) // 12
        est_month = (est_date.month - 1 + whole) % 12 + 1
        est_date = est_date.replace(year=est_year, month=est_month)
        if frac > 0:
            est_date = est_date + timedelta(days=int(30 * frac))
        est_date_str = est_date.strftime("%Y-%m-%d")
    except Exception:
        est_date_str = ""

    # status vs target date
    status = "unknown"
    if target_date_str:
        try:
            from datetime import datetime
            target_dt = datetime.strptime(target_date_str, "%Y-%m-%d")
            if months_needed == float("inf"):
                status = "behind"
            else:
                # months difference from now to target
                now = datetime.utcnow()
                months_left = (target_dt.year - now.year) * 12 + (target_dt.month - now.month)
                diff = months_needed - months_left
                if diff <= 0:
                    status = "on_track"
                elif diff <= 2:
                    status = "slightly_behind"
                else:
                    status = "behind"
        except Exception:
            status = "unknown"

    # required monthly to meet target
    try:
        from datetime import datetime
        if target_date_str:
            target_dt = datetime.strptime(target_date_str, "%Y-%m-%d")
            now = datetime.utcnow()
            months_left = max(1, (target_dt.year - now.year) * 12 + (target_dt.month - now.month))
            required_per_month = remaining / months_left if months_left > 0 else remaining
        else:
            required_per_month = remaining
    except Exception:
        required_per_month = remaining

    # completion probability (simple ratio)
    try:
        completion_probability = min(1.0, avg_monthly / required_per_month) if required_per_month > 0 else 1.0
    except Exception:
        completion_probability = 0.0

    return {
        "goal_id": goal.get("id"),
        "avg_monthly": round(avg_monthly, 2),
        "months_needed": float("inf") if months_needed == float("inf") else round(months_needed, 2),
        "estimated_completion_date": est_date_str,
        "status": status,
        "required_per_month": round(required_per_month, 2),
        "completion_probability": round(completion_probability * 100, 2),
        "series": [{"month": k, "amount": v} for k, v in monthly_series.items()],
    }


@app.get("/forecast/savings")
def forecast_savings(request: Request):
    try:
        headers = {}
        auth = request.headers.get('authorization')
        if auth:
            headers['Authorization'] = auth
        goals_resp = requests.get(f"{API_BASE}/goals/progress", timeout=10, headers=headers)
        try:
            goals_resp.raise_for_status()
        except Exception as e:
            if DEBUG:
                return {"message": "Unable to fetch data for savings forecast.", "which": "goals/progress", "status": goals_resp.status_code, "body": goals_resp.text}
            raise e
        goals_progress = goals_resp.json().get("progress", [])
        contribs_resp = requests.get(f"{API_BASE}/goals/contributions", timeout=10, headers=headers)
        try:
            contribs_resp.raise_for_status()
        except Exception as e:
            if DEBUG:
                return {"message": "Unable to fetch data for savings forecast.", "which": "goals/contributions", "status": contribs_resp.status_code, "body": contribs_resp.text}
            raise e
        contributions = contribs_resp.json().get("contributions", [])
    except Exception as e:
        if DEBUG:
            return {"message": "Unable to fetch data for savings forecast.", "detail": str(e)}
        return {"message": "Unable to fetch data for savings forecast."}

    per_goal_months = monthly_goal_contributions(contributions)
    results = []
    for g in goals_progress:
        gid = str(g.get("id"))
        monthly_series = per_goal_months.get(gid, {})
        results.append({
            "goal": g,
            "forecast": compute_goal_forecast(g, monthly_series),
        })

    return {"goals": results}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("FORECAST_PORT", "8000")), reload=True)


