from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from pathlib import Path

documents = []

DOCUMENTS_DIR = Path(__file__).resolve().parent / "documents"

files = [
    DOCUMENTS_DIR / "pricing_guide.txt",
    DOCUMENTS_DIR / "company_policy.txt",
    DOCUMENTS_DIR / "technical_manual.txt",
    DOCUMENTS_DIR / "faq.txt"
]

# Load documents and store source information
for file in files:

    loader = TextLoader(str(file))

    docs = loader.load()

    for doc in docs:
        doc.metadata["source"] = str(file)

    documents.extend(docs)

# Split documents
splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50
)

chunks = splitter.split_documents(documents)

# Create embeddings
embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

# Create vector store
vectorstore = FAISS.from_documents(
    chunks,
    embeddings
)

# Return only the most relevant chunk
retriever = vectorstore.as_retriever(
    search_kwargs={"k": 1}
)

def retrieve_context(query):

    docs = retriever.invoke(query)

    if not docs:
        return {
            "source": "unknown",
            "context": "No relevant information found."
        }

    doc = docs[0]

    source = Path(doc.metadata["source"]).stem

    return {
        "source": source,
        "context": doc.page_content
    }