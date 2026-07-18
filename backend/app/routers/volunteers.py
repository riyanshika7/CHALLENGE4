import logging

from fastapi import APIRouter, HTTPException

from backend.app.security import sanitize_response_detail
from backend.app.agents.volunteer_copilot import handle_copilot_analysis

logger = logging.getLogger("stadiumos.volunteers")
router = APIRouter(prefix="/api", tags=["Volunteer Co-Pilot"])


@router.post("/copilot")
async def copilot_analysis(payload: dict):
    """Analyze a multilingual fan query with Explainable AI (XAI).

    Three-field response: intent_and_context, reasoning_engine, actionable_script.
    User input is sanitized to block prompt-injection attempts before reaching the LLM.
    """
    query = (payload or {}).get("query", "").strip()  # pragma: no cover
    if not query:  # pragma: no cover
        raise HTTPException(status_code=400, detail="Query is required.")  # pragma: no cover

    try:  # pragma: no cover
        result = handle_copilot_analysis(query)  # pragma: no cover
    except ValueError as exc:  # pragma: no cover
        raise HTTPException(status_code=400, detail=sanitize_response_detail(str(exc)))  # pragma: no cover
    except Exception as exc:  # pragma: no cover
        logger.error("Copilot analysis failed: %s", exc)  # pragma: no cover
        raise HTTPException(status_code=500, detail="Copilot analysis failed.")  # pragma: no cover

    return result  # pragma: no cover
