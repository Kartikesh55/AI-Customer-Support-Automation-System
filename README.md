# AI-Powered Customer Support Automation System

## Project Overview

The **AI-Powered Customer Support Automation System** is an intelligent customer support application developed using **LangGraph**, **LangChain**, **FAISS**, and **SQLite**.

The system automates the handling of customer support requests by identifying the user's intent, routing the query to the appropriate support department, retrieving relevant information from company documents using Retrieval-Augmented Generation (RAG), maintaining customer interaction history using SQLite memory, and supporting human approval for high-risk requests.

---

# Features

* Intent Classification
* Agent Routing using LangGraph
* Sales Support Agent
* Technical Support Agent
* Billing Support Agent
* Account Support Agent
* Retrieval-Augmented Generation (RAG)
* FAISS Vector Search
* HuggingFace Embeddings
* SQLite-based Conversation Memory
* Human-in-the-Loop Approval
* Supervisor Agent
* Final Response Generation
* Rich Terminal UI

---

# Technologies Used

* Python 3.x
* LangGraph
* LangChain
* FAISS Vector Database
* HuggingFace Embeddings
* SQLite
* Rich

---

# Project Structure

```text
Customer Support Automation System/
│
├── app.py
├── workflow.py
├── agents.py
├── rag.py
├── memory.py
├── state.py
├── requirements.txt
├── README.md
├── memory.db
│
├── documents/
│   ├── company_policy.txt
│   ├── pricing_guide.txt
│   ├── technical_manual.txt
│   └── faq.txt
│
├── screenshots/
│
└── workflow_diagram.png

# Workflow

1. Customer enters a support query.
2. Intent Classification identifies the query category.
3. LangGraph routes the request to the appropriate support department.
4. Relevant company documents are retrieved using the RAG pipeline.
5. The selected support agent prepares a response.
6. High-risk requests are sent for human approval.
7. Customer queries are stored in SQLite memory.
8. Previous interactions can be recalled from memory.
9. The Supervisor Agent generates the final customer response.

---

# Human-in-the-Loop Requests

The following requests require supervisor approval:

- Refund Requests
- Subscription Cancellation
- Account Closure
- Compensation Requests
- Management Escalation

---

# Knowledge Base Documents

The RAG pipeline retrieves information from:

- Company Policy
- Pricing Guide
- Technical Manual
- FAQ Document

The documents are stored in the `documents/` directory.

---

# RAG Pipeline

The system uses Retrieval-Augmented Generation to retrieve relevant information from the knowledge base.

The process is:

```text
Company Documents
      ↓
Document Loading
       ↓
Text Splitting
       ↓
HuggingFace Embeddings
       ↓
FAISS Vector Store
       ↓
Relevant Context Retrieval
       ↓
Support Agent

Future Improvements: 
LLM-based Intent Classification
Web-based User Interface
Email Notification Support
Multi-user Authentication
Cloud Database Integration
Live Customer Support Dashboard
CRM Integration
External Ticketing System Integration

Author:
Kartikesh