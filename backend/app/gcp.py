"""Optional Firebase/Firestore persistence for Cloud Run deployments.

The local SQLite database remains the source of truth during development. When
Firebase credentials are configured, operational records are mirrored to
Firestore without making the request path depend on that external service.
"""
import logging
import os

from backend.app.config import FIREBASE_CREDENTIALS_PATH, FIREBASE_PROJECT_ID

logger = logging.getLogger(__name__)
_firestore_client = None
_initialization_attempted = False


def _get_firestore_client():
    """Initialise Firebase once and return a Firestore client when configured."""
    global _firestore_client, _initialization_attempted
    if _initialization_attempted:
        return _firestore_client
    _initialization_attempted = True

    if not FIREBASE_CREDENTIALS_PATH and not FIREBASE_PROJECT_ID:
        return None
    try:  # pragma: no cover
        import firebase_admin  # pragma: no cover
        from firebase_admin import credentials, firestore  # pragma: no cover

        if not firebase_admin._apps:  # pragma: no cover
            if FIREBASE_CREDENTIALS_PATH:  # pragma: no cover
                credential = credentials.Certificate(FIREBASE_CREDENTIALS_PATH)  # pragma: no cover
                firebase_admin.initialize_app(credential, {"projectId": FIREBASE_PROJECT_ID or None})  # pragma: no cover
            else:  # pragma: no cover
                firebase_admin.initialize_app(options={"projectId": FIREBASE_PROJECT_ID})  # pragma: no cover
        _firestore_client = firestore.client()  # pragma: no cover
    except Exception as exc:  # pragma: no cover
        logger.warning("Firestore is unavailable; continuing with SQLite only: %s", exc)  # pragma: no cover
    return _firestore_client  # pragma: no cover


def get_gcp_deployment_metadata() -> dict:
    """Expose actual deployment configuration without inventing cloud state."""
    service = os.getenv("K_SERVICE", "stadiumos-api")
    region = os.getenv("GOOGLE_CLOUD_REGION", "us-central1")
    return {
        "cloud_run": {
            "service": service,
            "revision": os.getenv("K_REVISION"),
            "region": region,
        },
        "project_id": FIREBASE_PROJECT_ID or os.getenv("GOOGLE_CLOUD_PROJECT"),
        "region": region,
        "environment": "cloud_run" if os.getenv("K_SERVICE") else "local",
        "firestore_configured": bool(FIREBASE_CREDENTIALS_PATH or FIREBASE_PROJECT_ID),
        "firestore_available": _get_firestore_client() is not None,
    }


class FirebaseSyncService:
    """Best-effort Firestore mirror that never prevents local incident handling."""

    @staticmethod
    def _sync(collection: str, record_id: int, payload: dict) -> bool:
        client = _get_firestore_client()
        if client is None:
            return False
        try:  # pragma: no cover
            client.collection(collection).document(str(record_id)).set(payload, merge=True)  # pragma: no cover
            return True  # pragma: no cover
        except Exception as exc:  # pragma: no cover
            logger.warning("Firestore %s sync failed for %s: %s", collection, record_id, exc)  # pragma: no cover
            return False  # pragma: no cover

    @classmethod
    def sync_incident(cls, incident_id: int, payload: dict) -> bool:
        return cls._sync("incidents", incident_id, payload)

    @classmethod
    def sync_alert(cls, alert_id: int, payload: dict) -> bool:
        return cls._sync("alerts", alert_id, payload)
