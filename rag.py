from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings

documents = []

files = [
    "documents/pricing_guide.txt",
    "documents/company_policy.txt",
    "documents/technical_manual.txt",
    "documents/faq.txt"
]

# Load documents and store source information
for file in files:

    loader = TextLoader(file)

    docs = loader.load()

    for doc in docs:
        doc.metadata["source"] = file

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
        return "No relevant information found."

    doc = docs[0]

    source = doc.metadata["source"].split("/")[-1].replace(".txt", "")

    return {
        "source": source,
        "context": doc.page_content
    }