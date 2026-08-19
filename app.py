from workflow import app

from rich.console import Console
from rich.table import Table
from rich.panel import Panel

console = Console()

console.print(
    "\n[bold cyan]AI-Powered Customer Support Automation System[/bold cyan]\n"
)

customer_name = console.input(
    "[bold green]Customer Name: [/bold green]"
)

while True:

    query = console.input(
        "\n[bold yellow]Enter your query: [/bold yellow]"
    )

    if query.lower() == "exit":
        break

    result = app.invoke(
        {
            "customer_name": customer_name,
            "query": query
        }
    )

    if result.get("intent") == "Memory":

        console.print(
            Panel(
                result["final_response"],
                title="Memory Recall",
                border_style="cyan"
            )
        )

        continue

    # ------------------------
    # Summary Table
    # ------------------------

    table = Table(
        title="Support Summary"
    )

    table.add_column("Field")
    table.add_column("Value")

    table.add_row(
        "Customer",
        customer_name
    )

    table.add_row(
        "Department",
        result["department"]
    )

    table.add_row(
        "Approval Required",
        "Yes" if result.get("approval_required") else "No"
    )

    table.add_row(
        "Approved",
        result.get("approval_status", "Yes")
    )

    table.add_row(
        "Knowledge Source",
        result["memory_context"]
    )

    console.print(table)

    # ------------------------
    # RAG Context
    # ------------------------

    console.print(
        Panel(
            result["retrieved_context"],
            title="Retrieved Context (RAG)",
            border_style="blue"
        )
    )

    # ------------------------
    # Final Response
    # ------------------------

    console.print(
        Panel(
            result["final_response"],
            title="Final Response",
            border_style="green"
        )
    )