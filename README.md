# ResolveRAG Customer Support

ResolveRAG is an AI-powered customer support workspace with a React interface
and a Python support workflow. The backend classifies requests, retrieves
relevant company information, routes requests to a support department, and
stores conversation history in SQLite. Requests that need review are surfaced
for approval.
The interface includes searchable conversation history, an expandable company
knowledge base, profile settings, and a persistent dark-mode toggle.

## Project layout

```text
backend/
  app.py                 FastAPI endpoints and React static-file serving
  workflow.py            LangGraph support workflow
  agents.py              Department support agents
  rag.py                 Company knowledge-base retrieval
  memory.py              SQLite conversation history
  state.py               Workflow state
  cli.py                 Optional terminal interface
  documents/             Company policies, FAQ, pricing, and technical docs
  requirements.txt       Python workflow dependencies
  requirements-web.txt   Web API dependency and base requirements
frontend/
  src/                   React application and styles
  package.json           Frontend dependencies and scripts
memory.db                SQLite conversation history
workflow_diagram.png     Support workflow diagram
```

## Run the web application

Use Python 3.10+ and Node.js 18+.

1. Install the Python and frontend dependencies:

   ```powershell
   python -m pip install -r backend/requirements-web.txt
   cd frontend
   npm install
   npm run build
   cd ..
   ```

2. Start the API and serve the built React app:

   ```powershell
   python -m uvicorn backend.app:api --reload
   ```

3. Open <http://127.0.0.1:8000>.

For frontend development with hot reload, start the FastAPI backend in one
terminal and run `npm run dev` from `frontend` in another. The frontend is
available at <http://localhost:5174/> and Vite proxies `/api` requests to the
backend at `http://127.0.0.1:8000`.

The first backend start may download the Hugging Face sentence-transformer
model used to create the in-memory FAISS index. The backend reads its knowledge
base from `backend/documents/` and its conversation history from `memory.db`.

## Support workflow

1. The customer submits a request in the React workspace.
2. The API classifies the request and routes it through the LangGraph workflow.
3. The RAG pipeline retrieves context from the company documents.
4. The selected department agent prepares a response.
5. Requests requiring review pause for an approval decision.
6. The answer displays the retrieved company information and its source.
7. Completed support conversations are saved to SQLite and shown in recent
   activity.

The workspace has separate Overview, Conversations, and Knowledge base pages.
Approval requests are stored until a reviewer approves or declines them; a
declined request is recorded without running the support workflow.
The API also exposes `/api/health`, `/api/overview`, `/api/conversations`,
`/api/knowledge-base`, and `/api/support`.

## Optional terminal interface

Run the original Rich terminal experience from the repository root:

```powershell
python -m backend.cli
```
