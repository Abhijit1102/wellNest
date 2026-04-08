from datetime import datetime, timezone, timedelta
from tzlocal import get_localzone

def get_iso_timestamp(dt: datetime = None) -> str:
    """Returns an ISO 8601 string. Default is 'now' in UTC."""
    if dt is None:
        dt = datetime.now(timezone.utc)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.isoformat(timespec='seconds').replace("+00:00", "Z")

def get_iso_date_before(days: int) -> str:
    """Calculates 'x' days ago and returns it as an ISO string."""
    past_date = datetime.now(timezone.utc) - timedelta(days=days)
    return get_iso_timestamp(past_date)

# ------------------------------
# TIMEZONE
# ------------------------------
def get_timezone() -> str:
    try:
        return str(get_localzone())
    except Exception as e:
        print(e)
        return "UTC"
