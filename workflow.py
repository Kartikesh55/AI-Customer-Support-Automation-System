from langgraph.graph import StateGraph, END

from state import CustomerSupportState

from agents import (
    sales_agent,
    technical_agent,
    billing_agent,
    account_agent
)

from rag import retrieve_context

from memory import (
    get_previous_issue,
    save_memory
)

# -------------------------
# Intent Classification
# -------------------------

def classify_intent(state):

    query = state["query"].lower()

    if any(
    phrase in query
    for phrase in [
        "previous issue",
        "previous support issue",
        "last issue",
        "earlier issue"
    ]
    ):
        return {"intent": "Memory"}

    elif any(word in query for word in ["price", "pricing", "plan"]):
        return {"intent": "Sales"}

    elif any(word in query for word in
             ["crash", "error", "installation", "login"]):
        return {"intent": "Technical"}

    elif any(word in query for word in
             ["refund", "invoice", "payment", "billing"]):
        return {"intent": "Billing"}

    else:
        return {"intent": "Account"}


# -------------------------
# Memory Node
# -------------------------

def memory_node(state):

    previous = get_previous_issue(
        state["customer_name"]
    )

    return {
        "final_response":
        f"Your previous support issue was:\n{previous}"
    }


# -------------------------
# RAG Node
# -------------------------

def rag_node(state):

    rag = retrieve_context(state["query"])

    return {
        "retrieved_context": rag["context"],
        "memory_context": rag["source"]
    }


# -------------------------
# Routing Functions
# -------------------------

def classifier_router(state):
    return state["intent"]


def approval_router(state):

    if state["approval_required"]:
        return "human"

    return "supervisor"


# -------------------------
# Approval Check
# -------------------------

def approval_node(state):

    query = state["query"].lower()

    risky = any(
        keyword in query
        for keyword in [
            "refund",
            "cancel",
            "closure",
            "compensation",
            "management"
        ]
    )

    return {
        "approval_required": risky
    }


# -------------------------
# Human Approval
# -------------------------

from rich.console import Console
from rich.panel import Panel

console = Console()

# Human Approval Agent
def human_node(state):

    console.print(
        Panel(
            "[bold red]Supervisor Approval Required[/bold red]",
            title="Human-in-the-Loop",
            border_style="red"
        )
    )

    choice = console.input(
        "[bold yellow]Approve? (yes/no): [/bold yellow]"
    )

    return {
        "approval_status": choice
    }

# -------------------------
# Supervisor
# -------------------------

# Supervisor Agent
def supervisor_node(state):

    approval = ""

    if state.get("approval_required"):
        approval = f"Approval Status: {state['approval_status']}\n\n"

    return {
        "final_response":
        f"""Department: {state['department']}

{approval}{state['agent_response']}
"""
    }

# -------------------------
# Save Memory
# -------------------------

def save_node(state):

    save_memory(
        state["customer_name"],
        state["query"]
    )

    return {}


# -------------------------
# Build Graph
# -------------------------

graph = StateGraph(CustomerSupportState)

graph.add_node("classifier", classify_intent)
graph.add_node("memory", memory_node)
graph.add_node("rag", rag_node)

graph.add_node("sales", sales_agent)
graph.add_node("technical", technical_agent)
graph.add_node("billing", billing_agent)
graph.add_node("account", account_agent)

graph.add_node("approval", approval_node)
graph.add_node("human", human_node)
graph.add_node("supervisor", supervisor_node)
graph.add_node("save", save_node)

graph.set_entry_point("classifier")

# Classifier Routing

graph.add_conditional_edges(
    "classifier",
    classifier_router,
    {
        "Memory": "memory",
        "Sales": "rag",
        "Technical": "rag",
        "Billing": "rag",
        "Account": "rag"
    }
)

# RAG -> ALL DEPARTMENTS
# LangGraph executes all outgoing edges.
# Agent chosen based on intent.

def sales_route(state):
    if state["intent"] == "Sales":
        return sales_agent(state)
    return {}

def technical_route(state):
    if state["intent"] == "Technical":
        return technical_agent(state)
    return {}

def billing_route(state):
    if state["intent"] == "Billing":
        return billing_agent(state)
    return {}

def account_route(state):
    if state["intent"] == "Account":
        return account_agent(state)
    return {}

graph.add_node("sales_route", sales_route)
graph.add_node("technical_route", technical_route)
graph.add_node("billing_route", billing_route)
graph.add_node("account_route", account_route)

graph.add_edge("rag", "sales_route")
graph.add_edge("rag", "technical_route")
graph.add_edge("rag", "billing_route")
graph.add_edge("rag", "account_route")

graph.add_edge("sales_route", "approval")
graph.add_edge("technical_route", "approval")
graph.add_edge("billing_route", "approval")
graph.add_edge("account_route", "approval")

# Approval Routing

graph.add_conditional_edges(
    "approval",
    approval_router,
    {
        "human": "human",
        "supervisor": "supervisor"
    }
)

graph.add_edge("human", "supervisor")
graph.add_edge("supervisor", "save")

graph.add_edge("save", END)
graph.add_edge("memory", END)

app = graph.compile()