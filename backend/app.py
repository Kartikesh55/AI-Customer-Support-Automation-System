from pathlib import Path
from typing import Literal, Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from .memory import (
    decline_request,
    get_conversations,
    get_dashboard_data,
    get_request,
    save_memory,
)
from .rag import DOCUMENTS_DIR
from .workflow import app as support_workflow
from .workflow import approval_node, classify_intent

ROOT_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = ROOT_DIR / "frontend"
DIST_DIR = FRONTEND_DIR / "dist"

api = FastAPI(
    title="ResolveRAG",
    description="Customer support automation workspace",
    version="1.0.0",
)

api.mount("/assets", StaticFiles(directory=DIST_DIR / "assets"), name="assets")


class SupportRequest(BaseModel):
    customer_name: str = Field(min_length=1, max_length=100)
    query: str = Field(min_length=1, max_length=2000)
    approval_status: Optional[Literal["Approved", "Declined"]] = None
    request_id: Optional[int] = Field(default=None, gt=0)


@api.get("/")
def home() -> FileResponse:
    return FileResponse(DIST_DIR / "index.html")


@api.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@api.get("/api/overview")
def overview() -> dict:
    return get_dashboard_data()


@api.get("/api/conversations")
def conversations(limit: int = Query(default=100, ge=1, le=500)) -> dict:
    return {"conversations": get_conversations(limit)}


@api.get("/api/knowledge-base")
def knowledge_base() -> dict[str, list[dict[str, str]]]:
    documents = [
        ("company_policy.txt", "Company policy", "Policies"),
        ("faq.txt", "Frequently asked questions", "Account"),
        ("pricing_guide.txt", "Pricing guide", "Billing & plans"),
        ("technical_manual.txt", "Technical manual", "Technical"),
    ]
    return {
        "documents": [
            {
                "id": filename.removesuffix(".txt"),
                "title": title,
                "category": category,
                "content": (DOCUMENTS_DIR / filename).read_text(encoding="utf-8"),
            }
            for filename, title, category in documents
        ]
    }


@api.post("/api/support")
def handle_support_request(request: SupportRequest) -> dict:
    customer_name = request.customer_name.strip()
    query = request.query.strip()
    if not customer_name or not query:
        raise HTTPException(
            status_code=422,
            detail="Customer name and message are required.",
        )

    state = {"customer_name": customer_name, "query": query}
    intent = classify_intent(state)["intent"]
    approval_required = approval_node(state)["approval_required"]

    if request.request_id is None and request.approval_status is not None:
        raise HTTPException(
            status_code=422,
            detail="An approval decision requires a pending request ID.",
        )
    if request.request_id is not None and request.approval_status is None:
        raise HTTPException(
            status_code=422,
            detail="A pending request ID requires an approval decision.",
        )
    if request.request_id is None and approval_required:
        request_id = save_memory(
            customer_name=customer_name,
            query=query,
            intent=intent,
            status="pending_approval",
            approval_required=True,
        )
        return {
            "status": "needs_approval",
            "intent": intent,
            "approval_required": True,
            "request_id": request_id,
            "message": "This request needs supervisor approval before it can be processed.",
        }

    if request.request_id is not None:
        pending_request = get_request(request.request_id)
        if (
            pending_request is None
            or pending_request["customer_name"] != customer_name
            or pending_request["query"] != query
        ):
            raise HTTPException(status_code=404, detail="Pending support request not found.")
        if pending_request["status"] != "pending_approval":
            raise HTTPException(
                status_code=409,
                detail="This request has already received an approval decision.",
            )
        if request.approval_status == "Declined":
            if not decline_request(request.request_id, customer_name, query):
                raise HTTPException(
                    status_code=409,
                    detail="This request has already received an approval decision.",
                )
            return {
                "status": "declined",
                "intent": intent,
                "approval_required": True,
                "approval_status": "Declined",
                "request_id": request.request_id,
                "message": "Approval was declined. No request was submitted or processed.",
                "retrieved_context": "",
                "memory_context": "",
            }

    try:
        result = support_workflow.invoke(
            {
                **state,
                "approval_status": request.approval_status or "",
                "request_id": request.request_id,
            }
        )
    except ValueError as error:
        if request.request_id is not None:
            raise HTTPException(status_code=409, detail=str(error)) from error
        raise
    return {
        "status": "completed",
        "intent": result.get("intent", intent),
        "department": result.get("department"),
        "approval_required": result.get("approval_required", approval_required),
        "approval_status": result.get("approval_status"),
        "request_id": result.get("request_id"),
        "message": result.get("final_response", ""),
        "retrieved_context": result.get("retrieved_context", ""),
        "memory_context": result.get("memory_context", ""),
    }


api.mount("/", StaticFiles(directory=DIST_DIR, html=True), name="frontend")
