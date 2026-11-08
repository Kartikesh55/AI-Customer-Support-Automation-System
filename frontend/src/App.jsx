import { useCallback, useEffect, useState } from "react";
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Bot,
  Check,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  CircleHelp,
  CircleUserRound,
  Clock3,
  FileText,
  Headphones,
  Inbox,
  LifeBuoy,
  LoaderCircle,
  Menu,
  MessageCircle,
  Moon,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Sun,
  Users,
  X,
} from "lucide-react";

const suggestions = [
  { title: "Explore plans", detail: "Compare pricing and features", icon: Sparkles, query: "What plans and pricing do you offer?" },
  { title: "Troubleshoot an issue", detail: "Get technical help", icon: LifeBuoy, query: "My application is crashing. How can I fix it?" },
  { title: "Billing question", detail: "Payments, invoices, refunds", icon: FileText, query: "I have a question about my latest invoice." },
];

const navigation = [
  { label: "Overview", icon: Inbox },
  { label: "Conversations", icon: MessageCircle },
  { label: "Knowledge base", icon: FileText },
];

function initials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "G";
}

function timeAgo(id, count) {
  if (!id) return "Just now";
  const ago = Math.max(0, count - id);
  if (ago === 0) return "Just now";
  if (ago === 1) return "1 request ago";
  return `${ago} requests ago`;
}

function PageIntro({ eyebrow, title, description, count }) {
  return (
    <section className="inner-page-intro">
      <div>
        <div className="eyebrow"><span className="eyebrow-sparkle">✳</span> {eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {count != null && <span className="page-count">{count}</span>}
    </section>
  );
}

function ConversationsPage({ items, query, onQueryChange, selected, onSelect, onContinue, error }) {
  const filteredItems = items.filter((item) =>
    `${item.customer_name || ""} ${item.query || ""}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <>
      <PageIntro
        eyebrow="YOUR SUPPORT HISTORY"
        title="Conversations"
        description="A clear view of the questions you and your customers have brought to support."
        count={`${items.length} ${items.length === 1 ? "request" : "requests"}`}
      />
      <section className="conversations-page-card">
        <div className="list-toolbar">
          <div><h2>All conversations</h2><p>Select a request to see its details.</p></div>
          <label className="list-search"><Search size={15} /><input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Search conversations" aria-label="Search conversations" /></label>
        </div>
        {error ? (
          <div className="page-empty-state"><CircleHelp size={18} /><strong>Conversations unavailable</strong><span>{error}</span></div>
        ) : filteredItems.length ? (
          <div className="conversation-list">
            {filteredItems.map((item) => (
              <button className={`conversation-list-row ${selected?.id === item.id ? "conversation-list-row-active" : ""}`} key={item.id} onClick={() => onSelect(item)}>
                <span className="activity-icon"><MessageCircle size={15} /></span>
                <span className="conversation-list-copy"><strong>{item.query}</strong><small>{item.customer_name || "Guest"} <span>·</span> Support request</small></span>
                <span className={`status-badge status-${item.status || "completed"}`}><span /> {item.status === "pending_approval" ? "Needs approval" : item.status === "declined" ? "Declined" : "Answered"}</span>
                <ChevronRight className="conversation-chevron" size={16} />
              </button>
            ))}
          </div>
        ) : (
          <div className="page-empty-state"><span className="empty-activity-icon"><Inbox size={18} /></span><strong>{query ? "No matching conversations" : "No conversations yet"}</strong><span>{query ? "Try another name or search term." : "Completed support requests will appear here."}</span></div>
        )}
      </section>
      {selected && (
        <section className="conversation-detail-card" aria-live="polite">
          <div className="detail-heading"><span className="card-kicker">REQUEST DETAILS</span><span className={`status-badge status-${selected.status || "completed"}`}><span /> {selected.status === "pending_approval" ? "Needs approval" : selected.status === "declined" ? "Declined" : "Answered"}</span></div>
          <h2>{selected.query}</h2>
          <p>Submitted by <strong>{selected.customer_name || "Guest"}</strong> <span>·</span> Conversation #{selected.id}</p>
          {selected.status === "pending_approval" ? (
            <p className="conversation-outcome">Waiting for an approval decision.</p>
          ) : selected.status === "declined" ? (
            <p className="conversation-outcome">Approval was declined. No request was submitted or processed.</p>
          ) : (
            <>
              {selected.retrieved_context && <div className="answer-section"><span className="answer-label"><Sparkles size={13} /> KNOWLEDGE BASE ANSWER</span><div className="answer-content">{selected.retrieved_context}</div><span className="answer-source">Source: {(selected.memory_context || "company knowledge base").replaceAll("_", " ")}</span></div>}
              {selected.response && <div className="agent-note"><span className="card-kicker">SUPPORT TEAM</span><div>{selected.response}</div></div>}
              <button className="send-button" onClick={() => onContinue(selected)}>Ask a follow-up <ArrowRight size={14} /></button>
            </>
          )}
        </section>
      )}
    </>
  );
}

function KnowledgeBasePage({ documents, search, onSearchChange, error }) {
  const [expandedId, setExpandedId] = useState(null);
  const matchingDocuments = documents.filter((document) =>
    `${document.title} ${document.category} ${document.content}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <PageIntro
        eyebrow="COMPANY KNOWLEDGE"
        title="Knowledge base"
        description="The trusted guides our support team uses to find helpful, accurate answers."
        count={`${documents.length} ${documents.length === 1 ? "guide" : "guides"}`}
      />
      <section className="knowledge-page-card">
        <div className="list-toolbar">
          <div><h2>Company guides</h2><p>Browse the information used to answer support questions.</p></div>
          <label className="list-search"><Search size={15} /><input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search the knowledge base" aria-label="Search the knowledge base" /></label>
        </div>
        {error ? (
          <div className="page-empty-state"><CircleHelp size={18} /><strong>Knowledge base unavailable</strong><span>{error}</span></div>
        ) : matchingDocuments.length ? (
          <div className="knowledge-list">
            {matchingDocuments.map((document) => {
              const isExpanded = expandedId === document.id;
              return (
                <article className={`knowledge-item ${isExpanded ? "knowledge-item-open" : ""}`} key={document.id}>
                  <button className="knowledge-item-toggle" aria-expanded={isExpanded} onClick={() => setExpandedId(isExpanded ? null : document.id)}>
                    <span className="knowledge-icon"><BookOpen size={17} /></span>
                    <span className="knowledge-item-copy"><strong>{document.title}</strong><small>{document.category}</small></span>
                    <ChevronDown className={isExpanded ? "knowledge-chevron knowledge-chevron-open" : "knowledge-chevron"} size={17} />
                  </button>
                  {isExpanded && <div className="knowledge-content">{document.content}</div>}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="page-empty-state"><span className="empty-activity-icon"><Search size={17} /></span><strong>No matching guides</strong><span>Try a different search term.</span></div>
        )}
      </section>
      <div className="knowledge-tip"><Sparkles size={16} /><span><strong>Answers grounded in your knowledge.</strong> When you ask a question, ResolveRAG searches these guides for relevant information.</span></div>
    </>
  );
}

function GlobalSearchDialog({
  open,
  query,
  onQueryChange,
  conversations,
  documents,
  error,
  onClose,
  onSelectConversation,
  onSelectDocument,
}) {
  if (!open) return null;
  const searchTerm = query.trim().toLowerCase();
  const results = [
    ...(searchTerm ? conversations
      .filter((item) => `${item.customer_name || ""} ${item.query || ""}`.toLowerCase().includes(searchTerm))
      .map((item) => ({ type: "conversation", id: item.id, title: item.query, detail: `${item.customer_name || "Guest"} · Conversation`, item })) : []),
    ...(searchTerm ? documents
      .filter((item) => `${item.title} ${item.category} ${item.content}`.toLowerCase().includes(searchTerm))
      .map((item) => ({ type: "document", id: item.id, title: item.title, detail: `${item.category} · Knowledge base`, item })) : []),
  ].slice(0, 10);

  return (
    <div className="dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="global-search-dialog" role="dialog" aria-modal="true" aria-labelledby="global-search-title">
        <div className="global-search-input-row"><Search size={18} /><input autoFocus value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Search conversations and guides..." aria-label="Search conversations and guides" /><button className="icon-button" onClick={onClose} aria-label="Close search"><X size={17} /></button></div>
        <h2 id="global-search-title" className="sr-only">Search ResolveRAG</h2>
        <div className="global-search-results">
          {error ? <div className="search-empty"><CircleHelp size={17} /><span>{error}</span></div> : results.length ? results.map((result) => (
            <button className="global-search-result" key={`${result.type}-${result.id}`} onClick={() => result.type === "conversation" ? onSelectConversation(result.item) : onSelectDocument(result.item)}>
              <span className={result.type === "conversation" ? "search-result-icon" : "search-result-icon search-result-document"}>{result.type === "conversation" ? <MessageCircle size={16} /> : <BookOpen size={16} />}</span>
              <span><strong>{result.title}</strong><small>{result.detail}</small></span>
              <ArrowRight size={14} className="search-result-arrow" />
            </button>
          )) : <div className="search-empty"><Search size={17} /><span>{searchTerm ? "No matching conversations or guides." : "Start typing to search your workspace."}</span></div>}
        </div>
        <div className="global-search-footer"><span><kbd>Esc</kbd> to close</span><span>ResolveRAG search</span></div>
      </section>
    </div>
  );
}

function ProfilePopover({ customerName, onNameChange, darkMode, onToggleTheme, onClose }) {
  return (
    <section className="profile-popover" aria-label="Profile and appearance settings">
      <div className="profile-popover-heading"><span className="profile-popover-icon"><CircleUserRound size={17} /></span><span><strong>Your profile</strong><small>Personalize your support workspace</small></span></div>
      <label className="profile-name-label" htmlFor="profile-name">DISPLAY NAME</label>
      <input id="profile-name" className="profile-name-input" value={customerName} onChange={(event) => onNameChange(event.target.value)} placeholder="Your name" maxLength={100} />
      <div className="profile-theme-row"><span className="profile-theme-icon">{darkMode ? <Moon size={16} /> : <Sun size={16} />}</span><span><strong>Dark mode</strong><small>{darkMode ? "On" : "Off"}</small></span><button className={`theme-switch ${darkMode ? "theme-switch-on" : ""}`} role="switch" aria-checked={darkMode} aria-label="Toggle dark mode" onClick={onToggleTheme}><span /></button></div>
      <button className="profile-done-button" onClick={onClose}>Done</button>
    </section>
  );
}

function App() {
  const [overview, setOverview] = useState({ total_requests: 0, unique_customers: 0, recent_queries: [] });
  const [conversationItems, setConversationItems] = useState([]);
  const [conversationsError, setConversationsError] = useState("");
  const [knowledgeDocuments, setKnowledgeDocuments] = useState([]);
  const [knowledgeError, setKnowledgeError] = useState("");
  const [apiOnline, setApiOnline] = useState(null);
  const [customerName, setCustomerName] = useState(() => localStorage.getItem("resolverag-customer-name") || "");
  const [message, setMessage] = useState("");
  const [activeNav, setActiveNav] = useState("Overview");
  const [conversationSearch, setConversationSearch] = useState("");
  const [knowledgeSearch, setKnowledgeSearch] = useState("");
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [approval, setApproval] = useState(null);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("resolverag-theme") === "dark");
  const [searchOpen, setSearchOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [globalSearchError, setGlobalSearchError] = useState("");
  const [profileAnchor, setProfileAnchor] = useState(null);

  const loadOverview = useCallback(async () => {
    try {
      const result = await fetch("/api/overview");
      if (!result.ok) throw new Error("Could not load support activity.");
      setOverview(await result.json());
      setApiOnline(true);
    } catch (issue) {
      setApiOnline(false);
      setError(issue.message || "Could not connect to the support server.");
    }
  }, []);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  useEffect(() => {
    localStorage.setItem("resolverag-theme", darkMode ? "dark" : "light");
    document.documentElement.style.colorScheme = darkMode ? "dark" : "light";
    document.querySelector('meta[name="theme-color"]')?.setAttribute(
      "content",
      darkMode ? "#11131a" : "#f6f7fb",
    );
  }, [darkMode]);

  useEffect(() => {
    if (customerName.trim()) localStorage.setItem("resolverag-customer-name", customerName.trim());
    else localStorage.removeItem("resolverag-customer-name");
  }, [customerName]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSearchOpen(false);
        setProfileAnchor(null);
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openSearch();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  useEffect(() => {
    if (activeNav !== "Knowledge base") return;
    let active = true;
    fetch("/api/knowledge-base")
      .then(async (result) => {
        const data = await result.json();
        if (!result.ok) throw new Error(data.detail || "Could not load the knowledge base.");
        return data;
      })
      .then((data) => {
        if (active) {
          setKnowledgeDocuments(data.documents || []);
          setKnowledgeError("");
        }
      })
      .catch((issue) => {
        if (active) setKnowledgeError(issue.message || "Could not load the knowledge base.");
      });
    return () => { active = false; };
  }, [activeNav]);

  useEffect(() => {
    if (activeNav !== "Conversations") return;
    let active = true;
    fetch("/api/conversations?limit=100")
      .then(async (result) => {
        const data = await result.json();
        if (!result.ok) throw new Error(data.detail || "Could not load conversations.");
        return data;
      })
      .then((data) => {
        if (active) {
          setConversationItems(data.conversations || []);
          setConversationsError("");
        }
      })
      .catch((issue) => {
        if (active) setConversationsError(issue.message || "Could not load conversations.");
      });
    return () => { active = false; };
  }, [activeNav]);

  const sendRequest = async (approvalStatus = null, requestId = null, queryOverride = null) => {
    const submittedQuery = queryOverride ?? message;
    if (!customerName.trim() || !submittedQuery.trim()) {
      setError("Add your name and a message to get started.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: customerName.trim(),
          query: submittedQuery.trim(),
          approval_status: approvalStatus,
          request_id: requestId,
        }),
      });
      const data = await result.json();
      if (!result.ok) throw new Error(data.detail?.[0]?.msg || data.detail || "Your request could not be completed.");
      if (data.error) throw new Error(data.error);
      if (data.status === "needs_approval") {
        setApproval({ query: submittedQuery.trim(), intent: data.intent, requestId: data.request_id });
        await loadOverview();
      } else {
        if (!data.message?.trim()) throw new Error("The support service returned an empty answer. Please try again.");
        setResponse(data);
        setApproval(null);
        setMessage("");
        setError("");
        setActiveNav("Overview");
        await loadOverview();
      }
    } catch (issue) {
      setError(issue.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const startQuestion = (query) => {
    setMessage(query);
    setResponse(null);
    setApproval(null);
    setError("");
    setActiveNav("Overview");
    requestAnimationFrame(() => document.getElementById("message-composer")?.focus());
  };

  const startSuggestion = startQuestion;

  const selectConversation = (item) => {
    setCustomerName(item.customer_name || "");
    setMessage(item.query || "");
    setResponse(null);
    setApproval(null);
    setError("");
    setActiveNav("Overview");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openSearch = async () => {
    setSearchOpen(true);
    setGlobalSearch("");
    setGlobalSearchError("");
    setProfileAnchor(null);
    try {
      const [conversationResult, knowledgeResult] = await Promise.all([
        fetch("/api/conversations?limit=100"),
        fetch("/api/knowledge-base"),
      ]);
      if (!conversationResult.ok || !knowledgeResult.ok) throw new Error("Could not load workspace search data.");
      const [conversationData, knowledgeData] = await Promise.all([
        conversationResult.json(),
        knowledgeResult.json(),
      ]);
      setConversationItems(conversationData.conversations || []);
      setKnowledgeDocuments(knowledgeData.documents || []);
    } catch (issue) {
      setGlobalSearchError(issue.message || "Could not load workspace search data.");
    }
  };

  const selectSearchConversation = (item) => {
    setConversationItems((items) => items.some((entry) => entry.id === item.id) ? items : [item, ...items]);
    setSelectedConversation(item);
    setActiveNav("Conversations");
    setSearchOpen(false);
  };

  const selectSearchDocument = (item) => {
    setKnowledgeDocuments((items) => items.some((entry) => entry.id === item.id) ? items : [item, ...items]);
    setKnowledgeSearch(item.title);
    setActiveNav("Knowledge base");
    setSearchOpen(false);
  };

  const navContent = activeNav === "Knowledge base"
    ? {
        eyebrow: "YOUR ANSWER, ALREADY HERE",
        title: "A little less searching.",
        description: "Our AI assistant looks through your company’s knowledge base to find a helpful answer for every question.",
        action: "Ask a question",
        icon: FileText,
      }
    : activeNav === "Conversations"
      ? {
          eyebrow: "EVERY CUSTOMER, HEARD",
          title: "Keep the conversation going.",
          description: "Pick up right where customers left off. Their recent questions are all in one place.",
          action: "Start a conversation",
          icon: MessageCircle,
        }
      : {
          eyebrow: "A BETTER KIND OF SUPPORT",
          title: "How can we help today?",
          description: "Tell us what’s on your mind. The right specialist is already on it.",
          action: "Start a conversation",
          icon: Sparkles,
        };

  return (
    <div className={`app-shell ${darkMode ? "theme-dark" : ""}`}>
      {mobileMenuOpen && <button className="sidebar-backdrop" aria-label="Close navigation" onClick={() => setMobileMenuOpen(false)} />}
      <aside className={`sidebar ${mobileMenuOpen ? "sidebar-open" : ""}`}>
        <button className="brand" onClick={() => { setActiveNav("Overview"); setMobileMenuOpen(false); }}>
          <span className="brand-symbol"><Sparkles size={17} strokeWidth={2.2} /></span>
          <span className="brand-wordmark">ResolveRAG<span>.</span></span>
        </button>

        <div className="workspace-picker">
          <div className="workspace-avatar">R</div>
          <span className="workspace-copy"><strong>ResolveRAG</strong><small>Support workspace</small></span>
          <ChevronDown size={15} className="muted-icon" />
        </div>

        <div className="sidebar-label">WORKSPACE</div>
        <nav className="primary-nav" aria-label="Main navigation">
          {navigation.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={`nav-item ${activeNav === label ? "nav-item-active" : ""}`}
              onClick={() => { setActiveNav(label); setMobileMenuOpen(false); }}
            >
              <Icon size={17} strokeWidth={1.8} />
              <span>{label}</span>
              {label === "Conversations" && overview.total_requests > 0 && <span className="nav-count">{overview.total_requests}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-label recent-label">RECENT</div>
        <div className="sidebar-recent">
          {overview.recent_queries.slice(0, 4).map((item) => (
            <button className="recent-link" key={item.id} onClick={() => { selectConversation(item); setMobileMenuOpen(false); }}>
              <span className="recent-dot" />
              <span>{item.query}</span>
            </button>
          ))}
          {overview.recent_queries.length === 0 && <p className="empty-sidebar">Your conversations will appear here.</p>}
        </div>

        <div className="sidebar-bottom">
          <button className="sidebar-help" onClick={() => startQuestion("I need help using ResolveRAG.")}>
            <span className="help-icon"><CircleHelp size={17} /></span>
            <div><strong>Need a hand?</strong><span>We’re always here for you.</span></div>
            <ArrowUpRight size={14} className="help-arrow" />
          </button>
          <div className="profile-card">
            <div className="profile-avatar">{initials(customerName)}</div>
            <div className="profile-copy"><strong>{customerName.trim() || "Your profile"}</strong><span>Customer account</span></div>
            <button className="icon-button profile-menu" aria-label="Profile options" aria-expanded={profileAnchor === "sidebar"} onClick={() => setProfileAnchor(profileAnchor === "sidebar" ? null : "sidebar")}><Menu size={17} /></button>
          </div>
          {profileAnchor === "sidebar" && <ProfilePopover customerName={customerName} onNameChange={setCustomerName} darkMode={darkMode} onToggleTheme={() => setDarkMode((value) => !value)} onClose={() => setProfileAnchor(null)} />}
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb"><button className="mobile-menu-button" onClick={() => setMobileMenuOpen(true)} aria-label="Open navigation"><Menu size={20} /></button><span>Workspace</span><span className="breadcrumb-slash">/</span><strong>{activeNav}</strong></div>
          <div className="topbar-actions">
            <span className={`availability ${apiOnline === false ? "availability-offline" : ""}`}><span /> {apiOnline === null ? "Connecting to support" : apiOnline ? "All systems operational" : "Support connection unavailable"}</span>
            <button className="top-icon-button theme-toggle-button" aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"} title={darkMode ? "Switch to light mode" : "Switch to dark mode"} aria-pressed={darkMode} onClick={() => setDarkMode((value) => !value)}>{darkMode ? <Sun size={17} /> : <Moon size={17} />}</button>
            <button className="top-icon-button" aria-label="Search workspace" title="Search (Ctrl+K)" onClick={openSearch}><Search size={17} /></button>
            <button className="top-avatar" title={customerName || "Your profile"} aria-label="Open profile and appearance settings" aria-expanded={profileAnchor === "top"} onClick={() => setProfileAnchor(profileAnchor === "top" ? null : "top")}>{initials(customerName)}</button>
            {profileAnchor === "top" && <ProfilePopover customerName={customerName} onNameChange={setCustomerName} darkMode={darkMode} onToggleTheme={() => setDarkMode((value) => !value)} onClose={() => setProfileAnchor(null)} />}
          </div>
        </header>

        <div className="page-content">
          {activeNav === "Overview" ? (
            <>
          <section className="welcome-row">
            <div>
              <div className="eyebrow"><span className="eyebrow-sparkle">✳</span> {navContent.eyebrow}</div>
              <h1>{customerName.trim() ? `Good to have you here, ${customerName.trim().split(/\s+/)[0]}.` : navContent.title}</h1>
              <p className="welcome-subtitle">{customerName.trim() ? "Whatever you need, let’s figure it out together." : navContent.description}</p>
            </div>
            <div className="welcome-decoration" aria-hidden="true"><div className="decoration-orbit orbit-one" /><div className="decoration-orbit orbit-two" /><div className="decoration-star">✳</div><div className="decoration-sparkle">✦</div><div className="decoration-dot" /></div>
          </section>

          <section className="stats-grid" aria-label="Support overview">
            <article className="stat-card">
              <div className="stat-top"><span className="stat-icon stat-violet"><MessageCircle size={17} /></span><span className="stat-note">All time</span></div>
              <div className="stat-value">{overview.total_requests.toLocaleString()}</div>
              <div className="stat-label">Conversations</div>
              <div className="stat-foot"><span className="stat-foot-dot violet-dot" /> Requests handled so far</div>
              <div className="stat-sparkline sparkline-violet"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
            </article>
            <article className="stat-card">
              <div className="stat-top"><span className="stat-icon stat-teal"><Users size={17} /></span><span className="stat-note">Across all conversations</span></div>
              <div className="stat-value">{overview.unique_customers.toLocaleString()}</div>
              <div className="stat-label">People helped</div>
              <div className="stat-foot"><span className="stat-foot-dot teal-dot" /> Every interaction matters</div>
              <div className="stat-sparkline sparkline-teal"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
            </article>
            <article className="stat-card status-stat">
              <div className="stat-top"><span className="stat-icon stat-green"><ShieldCheck size={17} /></span><span className="live-pill"><span /> LIVE</span></div>
              <div className="status-headline">Here for you<span>.</span></div>
              <div className="stat-label">Support is ready</div>
              <div className="stat-foot"><span className="stat-foot-dot green-dot" /> AI + human review</div>
              <div className="status-decoration"><div /><div /><div /><div /><div /><div /><div /></div>
            </article>
          </section>

          <section className="workspace-grid">
            <div className="conversation-card">
              <div className="card-heading">
                <div><span className="card-kicker">{activeNav === "Overview" ? "YOUR SUPPORT DESK" : activeNav.toUpperCase()}</span><h2>{activeNav === "Overview" ? "Let’s get this sorted." : navContent.action}</h2><p>Tell us a little more and we’ll take it from here.</p></div>
                <span className="card-heading-icon"><navContent.icon size={19} /></span>
              </div>

              {response ? (
                <div className="response-panel" aria-live="polite">
                  <div className="response-header"><span className="response-bot"><Bot size={17} /></span><div><strong>Your support specialist</strong><span>{response.intent === "Memory" ? "Conversation memory" : `${response.department || response.intent} team`} <span className="response-separator">·</span> Just now</span></div><span className={`response-resolved ${response.status === "declined" ? "response-declined" : ""}`}>{response.status === "declined" ? <X size={14} /> : <CheckCircle2 size={14} />} {response.status === "declined" ? "Not submitted" : "Replied"}</span></div>
                  {response.retrieved_context ? (
                    <>
                      <div className="answer-section"><span className="answer-label"><Sparkles size={13} /> KNOWLEDGE BASE ANSWER</span><div className="answer-content">{response.retrieved_context}</div><span className="answer-source">Source: {(response.memory_context || "company knowledge base").replaceAll("_", " ")}</span></div>
                      <div className="agent-note"><span className="card-kicker">SUPPORT TEAM</span><div>{response.message}</div></div>
                    </>
                  ) : <div className="response-message">{response.message}</div>}
                  <button className="new-question-button" onClick={() => { setResponse(null); setActiveNav("Overview"); }}><Plus size={15} /> Ask another question</button>
                </div>
              ) : approval ? (
                <div className="approval-panel" aria-live="polite">
                  <div className="approval-icon"><ShieldCheck size={20} /></div>
                  <div className="approval-copy"><strong>A quick review before we proceed</strong><p>This {approval.intent.toLowerCase()} request needs supervisor approval. Would you like us to submit it for review?</p></div>
                  <div className="approval-actions"><button className="approval-yes" onClick={() => sendRequest("Approved", approval.requestId, approval.query)} disabled={loading}>{loading ? <LoaderCircle size={15} className="spin" /> : <Check size={15} />} Submit for approval</button><button className="approval-no" onClick={() => sendRequest("Declined", approval.requestId, approval.query)} disabled={loading}>No thanks</button></div>
                </div>
              ) : (
                <>
                  <div className="identity-row">
                    <label className="field-label" htmlFor="customer-name">YOUR NAME</label>
                    <div className="name-input-wrap"><Users size={15} /><input id="customer-name" value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="What should we call you?" maxLength={100} /></div>
                  </div>
                  <label className="field-label message-label" htmlFor="message-composer">WHAT CAN WE HELP WITH?</label>
                  <div className="composer-wrap"><textarea id="message-composer" value={message} onChange={(event) => setMessage(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); sendRequest(); } }} placeholder="Share what’s on your mind..." maxLength={2000} rows={4} /><div className="composer-footer"><span><span className="composer-lock">⌑</span> Your conversation stays private</span><span>{message.length} / 2,000</span></div></div>
                  {error && <div className="error-message" role="alert"><CircleHelp size={15} /> {error}</div>}
                  <div className="submit-row"><span className="response-time"><Clock3 size={14} /> Usually replies in a few seconds</span><button className="send-button" onClick={() => sendRequest()} disabled={loading}>{loading ? <>Working on it <LoaderCircle size={15} className="spin" /></> : <>Send message <Send size={14} /></>}</button></div>
                </>
              )}
            </div>

            <aside className="side-panel">
              <div className="side-panel-heading"><span className="card-kicker">A GOOD PLACE TO START</span><span className="sparkle-small"><Sparkles size={15} /></span></div>
              <h3>Not sure what to ask?</h3>
              <p className="side-panel-intro">A few things we’re great at helping with.</p>
              <div className="suggestion-list">
                {suggestions.map(({ title, detail, icon: Icon, query }, index) => (
                  <button className="suggestion-item" key={title} onClick={() => startSuggestion(query)}>
                    <span className={`suggestion-icon suggestion-${index}`}><Icon size={16} /></span><span className="suggestion-copy"><strong>{title}</strong><small>{detail}</small></span><ArrowRight size={15} className="suggestion-arrow" />
                  </button>
                ))}
              </div>
              <div className="privacy-note"><span className="privacy-icon"><ShieldCheck size={16} /></span><span><strong>Your data stays yours.</strong><small>Conversations are securely stored so we can give you more personal support.</small></span></div>
            </aside>
          </section>

          <section className="activity-section">
            <div className="activity-heading"><div><span className="card-kicker">THE LATEST</span><h2>Recent conversations</h2></div><button className="view-all-button" onClick={() => setActiveNav("Conversations")}>View all <ArrowRight size={14} /></button></div>
            {overview.recent_queries.length > 0 ? (
              <div className="activity-table">
                <div className="activity-table-head"><span>CONVERSATION</span><span>CUSTOMER</span><span>STATUS</span><span>UPDATED</span><span /></div>
                {overview.recent_queries.slice(0, 5).map((item) => (
                  <button className="activity-row" key={item.id} onClick={() => selectConversation(item)}>
                    <span className="activity-question"><span className="activity-icon"><ArrowDownLeft size={15} /></span><span><strong>{item.query}</strong><small>Support request</small></span></span>
                    <span className="activity-customer"><span className="customer-avatar">{initials(item.customer_name)}</span>{item.customer_name || "Guest"}</span>
                    <span><span className={`status-badge status-${item.status || "completed"}`}><span /> {item.status === "pending_approval" ? "Needs approval" : item.status === "declined" ? "Declined" : "Answered"}</span></span>
                    <span className="activity-time">{timeAgo(item.id, overview.total_requests)}</span>
                    <span className="row-arrow"><ArrowRight size={15} /></span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="empty-activity"><span className="empty-activity-icon"><Headphones size={19} /></span><div><strong>A fresh start.</strong><span>Your conversations will show up here once you get in touch.</span></div><button onClick={() => document.getElementById("customer-name")?.focus()}>Say hello <ArrowRight size={14} /></button></div>
            )}
          </section>

          <footer className="page-footer"><span>Made for people, powered by a little AI <span className="footer-heart">♥</span></span><span>ResolveRAG <span className="footer-divider">·</span> A brighter way forward</span></footer>
            </>
          ) : activeNav === "Conversations" ? (
            <ConversationsPage
              items={conversationItems}
              query={conversationSearch}
              onQueryChange={setConversationSearch}
              selected={selectedConversation}
              onSelect={setSelectedConversation}
              onContinue={(item) => { setSelectedConversation(null); selectConversation(item); }}
              error={conversationsError}
            />
          ) : (
            <KnowledgeBasePage
              documents={knowledgeDocuments}
              search={knowledgeSearch}
              onSearchChange={setKnowledgeSearch}
              error={knowledgeError}
            />
          )}
        </div>
      </main>
      <GlobalSearchDialog
        open={searchOpen}
        query={globalSearch}
        onQueryChange={setGlobalSearch}
        conversations={conversationItems}
        documents={knowledgeDocuments}
        error={globalSearchError}
        onClose={() => setSearchOpen(false)}
        onSelectConversation={selectSearchConversation}
        onSelectDocument={selectSearchDocument}
      />
      {loading && <div className="sr-only" aria-live="polite">Your support request is being processed.</div>}
    </div>
  );
}

export default App;
