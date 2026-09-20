import { useMemo, useState } from "react";
import type { ChangeEvent, CSSProperties, FormEvent, ReactNode } from "react";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "./const";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  ArrowLeftRight,
  Bell,
  Bot,
  BriefcaseBusiness,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Command,
  Download,
  FileText,
  Gauge,
  HeartPulse,
  Home,
  LayoutDashboard,
  Menu,
  MessageSquareText,
  MoreHorizontal,
  PackageOpen,
  Pencil,
  PiggyBank,
  Plus,
  Receipt,
  Repeat2,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  UploadCloud,
  Utensils,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const categories = ["Food", "Transport", "Shopping", "Bills", "Entertainment", "Health", "Education", "Housing", "Subscriptions", "Other"];
const categoryColors: Record<string, string> = {
  Food: "#f4a261",
  Transport: "#7c83fd",
  Shopping: "#ff7a90",
  Bills: "#42b883",
  Entertainment: "#e0aaff",
  Health: "#62c5cf",
  Education: "#f2c94c",
  Housing: "#8ab17d",
  Subscriptions: "#f28f3b",
  Other: "#99a1b3",
};

type Page = "dashboard" | "transactions" | "subscriptions" | "budgets" | "goals" | "insights" | "assistant" | "settings";
type TransactionType = "income" | "expense";

type Transaction = {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: TransactionType;
  status: "Completed" | "Pending";
};

type Budget = { id: string; category: string; limit: number; spent: number };
type Goal = { id: string; name: string; target: number; current: number; monthly: number; targetDate: string; accent: string };
type AssistantMessage = { from: "user" | "assistant"; text: string; meta?: string };

const demoTransactions: Transaction[] = [
  { id: "TX-0926-001", date: "2026-09-18", description: "Amazon India", category: "Shopping", amount: 2499, type: "expense", status: "Completed" },
  { id: "TX-0926-002", date: "2026-09-17", description: "Swiggy", category: "Food", amount: 742, type: "expense", status: "Completed" },
  { id: "TX-0926-003", date: "2026-09-16", description: "Salary / Acme Labs", category: "Income", amount: 72500, type: "income", status: "Completed" },
  { id: "TX-0926-004", date: "2026-09-15", description: "Rent — Koramangala", category: "Housing", amount: 18000, type: "expense", status: "Completed" },
  { id: "TX-0926-005", date: "2026-09-14", description: "Uber", category: "Transport", amount: 418, type: "expense", status: "Completed" },
  { id: "TX-0926-006", date: "2026-09-13", description: "Netflix", category: "Subscriptions", amount: 649, type: "expense", status: "Completed" },
  { id: "TX-0926-007", date: "2026-09-12", description: "Electricity Board", category: "Bills", amount: 2140, type: "expense", status: "Completed" },
  { id: "TX-0926-008", date: "2026-09-11", description: "Apollo Pharmacy", category: "Health", amount: 1290, type: "expense", status: "Completed" },
  { id: "TX-0926-009", date: "2026-09-10", description: "Zomato", category: "Food", amount: 860, type: "expense", status: "Completed" },
  { id: "TX-0926-010", date: "2026-09-09", description: "Spotify", category: "Subscriptions", amount: 119, type: "expense", status: "Completed" },
  { id: "TX-0926-011", date: "2026-09-07", description: "Myntra", category: "Shopping", amount: 3280, type: "expense", status: "Completed" },
  { id: "TX-0926-012", date: "2026-09-05", description: "College Fees", category: "Education", amount: 4500, type: "expense", status: "Completed" },
  { id: "TX-0926-013", date: "2026-09-03", description: "YouTube Premium", category: "Subscriptions", amount: 149, type: "expense", status: "Completed" },
  { id: "TX-0926-014", date: "2026-09-02", description: "Ola Cabs", category: "Transport", amount: 386, type: "expense", status: "Completed" },
  { id: "TX-0926-015", date: "2026-09-01", description: "BigBasket", category: "Food", amount: 7638, type: "expense", status: "Completed" },
  { id: "TX-0926-016", date: "2026-09-01", description: "Mobile Recharge", category: "Bills", amount: 610, type: "expense", status: "Completed" },
  { id: "TX-0826-001", date: "2026-08-31", description: "Salary / Acme Labs", category: "Income", amount: 72500, type: "income", status: "Completed" },
  { id: "TX-0826-002", date: "2026-08-29", description: "Rent — Koramangala", category: "Housing", amount: 18000, type: "expense", status: "Completed" },
  { id: "TX-0826-003", date: "2026-08-26", description: "Swiggy", category: "Food", amount: 920, type: "expense", status: "Completed" },
  { id: "TX-0826-004", date: "2026-08-22", description: "Amazon Prime", category: "Subscriptions", amount: 1499, type: "expense", status: "Completed" },
  { id: "TX-0826-005", date: "2026-08-18", description: "BigBasket", category: "Food", amount: 3110, type: "expense", status: "Completed" },
  { id: "TX-0826-006", date: "2026-08-16", description: "Uber", category: "Transport", amount: 680, type: "expense", status: "Completed" },
  { id: "TX-0826-007", date: "2026-08-12", description: "Electricity Board", category: "Bills", amount: 1860, type: "expense", status: "Completed" },
  { id: "TX-0826-008", date: "2026-08-08", description: "BookMyShow", category: "Entertainment", amount: 1480, type: "expense", status: "Completed" },
  { id: "TX-0726-001", date: "2026-07-31", description: "Salary / Acme Labs", category: "Income", amount: 72500, type: "income", status: "Completed" },
  { id: "TX-0726-002", date: "2026-07-30", description: "Rent — Koramangala", category: "Housing", amount: 18000, type: "expense", status: "Completed" },
  { id: "TX-0726-003", date: "2026-07-27", description: "Zomato", category: "Food", amount: 2800, type: "expense", status: "Completed" },
  { id: "TX-0726-004", date: "2026-07-22", description: "Amazon India", category: "Shopping", amount: 5900, type: "expense", status: "Completed" },
  { id: "TX-0726-005", date: "2026-07-18", description: "Spotify", category: "Subscriptions", amount: 119, type: "expense", status: "Completed" },
  { id: "TX-0726-006", date: "2026-07-13", description: "Electricity Board", category: "Bills", amount: 1750, type: "expense", status: "Completed" },
];

const initialBudgets: Budget[] = [
  { id: "food", category: "Food", limit: 8000, spent: 6420 },
  { id: "transport", category: "Transport", limit: 5000, spent: 3240 },
  { id: "entertainment", category: "Entertainment", limit: 3000, spent: 3480 },
  { id: "shopping", category: "Shopping", limit: 7000, spent: 5779 },
];
const initialGoals: Goal[] = [
  { id: "emergency", name: "Emergency Fund", target: 100000, current: 42500, monthly: 8000, targetDate: "Apr 2027", accent: "orange" },
  { id: "laptop", name: "New Laptop", target: 85000, current: 31200, monthly: 6000, targetDate: "Jun 2027", accent: "violet" },
  { id: "travel", name: "Kerala Travel", target: 45000, current: 18400, monthly: 4500, targetDate: "May 2027", accent: "teal" },
];
const subscriptions: { name: string; amount: number; cadence: string; next: string; icon: string; color: string }[] = [];

function money(value: number) {
  return INR.format(value).replace("₹", "₹");
}
function compactMoney(value: number) {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}k`;
  return money(value);
}
function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${date}T12:00:00`));
}
function categorize(description: string) {
  const value = description.toLowerCase();
  if (value.includes("salary") || value.includes("income") || value.includes("credit")) return "Income";
  if (value.includes("netflix") || value.includes("spotify") || value.includes("youtube") || value.includes("prime") || value.includes("hotstar")) return "Subscriptions";
  if (value.includes("swiggy") || value.includes("zomato") || value.includes("bigbasket") || value.includes("food") || value.includes("restaurant")) return "Food";
  if (value.includes("uber") || value.includes("ola") || value.includes("metro") || value.includes("fuel")) return "Transport";
  if (value.includes("amazon") || value.includes("myntra") || value.includes("shopping") || value.includes("flipkart")) return "Shopping";
  if (value.includes("electric") || value.includes("recharge") || value.includes("bill") || value.includes("airtel")) return "Bills";
  if (value.includes("apollo") || value.includes("medical") || value.includes("health")) return "Health";
  if (value.includes("rent") || value.includes("housing")) return "Housing";
  if (value.includes("college") || value.includes("course") || value.includes("education")) return "Education";
  return "Other";
}

async function extractPdfText(file: File) {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
  const buffer = await file.arrayBuffer();
  const document = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
  const pages: string[] = [];
  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber);
    const content = await page.getTextContent();
    pages.push(content.items.map((item) => ("str" in item ? item.str : "")).join(" "));
  }
  return pages.join("\n");
}

function parsePdfTransactions(raw: string): Transaction[] {
  const datePattern = /(\d{1,2}[/-]\d{1,2}[/-](?:\d{2}|\d{4})|\d{1,2}\s+[A-Za-z]{3}\s+\d{4})/;
  return raw.split(/\r?\n|(?=\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\s)/).map((line, index) => {
    const normalized = line.replace(/\s+/g, " ").trim();
    const dateMatch = normalized.match(datePattern);
    const amountMatches = Array.from(normalized.matchAll(/(?:₹|INR)?\s*([\d,]+(?:\.\d{1,2})?)/gi));
    const amountToken = amountMatches.at(-1)?.[1] || "";
    const amount = Math.abs(Number(amountToken.replace(/,/g, "")) || 0);
    if (!dateMatch || !amount || amount < 0.01) return null;
    const description = normalized.slice((dateMatch.index || 0) + dateMatch[0].length).replace(amountToken, "").replace(/\b(?:CR|DR|CREDIT|DEBIT)\b/gi, "").trim() || "Imported PDF transaction";
    const type: TransactionType = /\b(?:CR|CREDIT|SALARY|DEPOSIT|REFUND)\b/i.test(normalized) ? "income" : "expense";
    const rawDate = dateMatch[0].replace(/-/g, "/");
    const parts = rawDate.split(/[\/\s]+/);
    const date = parts.length === 3 && parts[1].length <= 2 ? `${parts[2].length === 2 ? `20${parts[2]}` : parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}` : "2026-09-19";
    return { id: `PDF-${Date.now()}-${index}`, date, description, category: categorize(description), amount, type, status: "Completed" } as Transaction;
  }).filter((item): item is Transaction => Boolean(item));
}

const navItems: { id: Page; label: string; icon: typeof LayoutDashboard; note?: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "transactions", label: "Transactions", icon: ArrowLeftRight },
  { id: "subscriptions", label: "Subscriptions", icon: Repeat2, note: "4" },
  { id: "budgets", label: "Budgets", icon: Gauge },
  { id: "goals", label: "Goals", icon: Target },
  { id: "insights", label: "Insights", icon: TrendingUp },
  { id: "assistant", label: "AI Assistant", icon: Bot },
];

function App() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [showWelcome, setShowWelcome] = useState(true);
  const [page, setPage] = useState<Page>("dashboard");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [assistantMessages, setAssistantMessages] = useState<AssistantMessage[]>([
    { from: "assistant", text: "Connected. I can help you understand your spending, commitments, budgets, and goals using the data currently in FinPilot.", meta: "FINPILOT AI · READY" },
  ]);
  const [importState, setImportState] = useState<"idle" | "processing" | "complete">("idle");
  const [importStats, setImportStats] = useState({ processed: 0, categories: 0, recurring: 0, anomalies: 0 });
  const [toast, setToast] = useState("");

  const current = useMemo(() => transactions.filter((item) => item.date.startsWith("2026-09")), [transactions]);
  const income = current.filter((item) => item.type === "income").reduce((sum, item) => sum + item.amount, 0);
  const expenses = current.filter((item) => item.type === "expense").reduce((sum, item) => sum + item.amount, 0);
  const balance = income - expenses;
  const savingsRate = income ? (balance / income) * 100 : 0;
  const categoryTotals = useMemo(() => {
    return categories.map((category) => ({ name: category, value: current.filter((item) => item.category === category).reduce((sum, item) => sum + item.amount, 0) })).filter((item) => item.value > 0);
  }, [current]);
  const budgetCommitted = budgets.reduce((sum, budget) => sum + budget.spent, 0);
  const budgetLimit = budgets.reduce((sum, budget) => sum + budget.limit, 0);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };

  const navigate = (next: Page) => {
    setPage(next);
    setMobileNavOpen(false);
  };

  const askAssistant = (question: string) => {
    const trimmed = question.trim();
    if (!trimmed) return;
    setAssistantMessages((messages) => [...messages, { from: "user", text: trimmed }]);
    setQuery("");
    window.setTimeout(() => {
      setAssistantMessages((messages) => [...messages, { from: "assistant", text: answerQuestion(trimmed, { expenses, balance, categoryTotals, budgetCommitted, budgetLimit, subscriptions, goals, transactionCount: transactions.length }), meta: "PERSONALIZED RESPONSE" }]);
    }, 360);
  };

  const handlePDF = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImportState("processing");
    setImportStats({ processed: 0, categories: 0, recurring: 0, anomalies: 0 });
    try {
      const raw = await extractPdfText(file);
      const parsed = parsePdfTransactions(raw);
      if (!parsed.length) {
        setImportState("idle");
        notify("No transaction rows found. Please upload a text-based bank statement PDF.");
        return;
      }
      window.setTimeout(() => {
        setTransactions((items) => [...parsed, ...items]);
        setImportStats({ processed: parsed.length, categories: new Set(parsed.map((item) => item.category)).size, recurring: parsed.filter((item) => item.category === "Subscriptions" || item.description.toLowerCase().includes("rent")).length, anomalies: parsed.filter((item) => item.amount > 5000).length });
        setImportState("complete");
        notify(`${parsed.length} transactions extracted from your PDF`);
      }, 700);
    } catch (error) {
      console.error("[PDF import] Failed to extract statement", error);
      setImportState("idle");
      notify("PDF could not be read. Try a text-based statement PDF instead of a scanned image.");
    }
  };

  const handlePageSearch = (event: FormEvent) => {
    event.preventDefault();
    if (query.trim()) {
      navigate("assistant");
      askAssistant(query);
    }
  };

  const displayName = user?.name || "FinPilot user";
  const oauthError = typeof window !== "undefined" && ["invalid_state", "callback_failed"].includes(new URLSearchParams(window.location.search).get("oauthError") || "");
  const handlePrimaryEntry = () => {
    if (isAuthenticated) {
      setShowWelcome(false);
      return;
    }
    startLogin();
  };
  const handleLogout = async () => {
    await logout();
    setShowWelcome(true);
    notify("Signed out of your Manus account");
  };

  if (showWelcome) {
    return <WelcomeScreen onEnter={handlePrimaryEntry} isAuthenticated={isAuthenticated} authLoading={loading} userName={user?.name ?? null} oauthError={oauthError} />;
  }

  // make sure to consider if you need authentication for certain routes
  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNavOpen ? "sidebar-open" : ""}`}>
        <div className="brand-block">
          <div className="brand-mark"><span>FP</span><i /></div>
          <div><div className="brand-name">FINPILOT</div><div className="brand-subtitle">MONEY OPERATIONS</div></div>
          <button className="mobile-close icon-button" onClick={() => setMobileNavOpen(false)} aria-label="Close navigation"><X size={18} /></button>
        </div>
        <div className="system-card">
          <span className="led led-green" />
          <div><div className="micro-label">SYSTEM STATUS</div><strong>{isAuthenticated ? "MANUS CONNECTED" : "AUTH REQUIRED"}</strong></div>
          <span className="system-pulse" />
        </div>
        <nav className="primary-nav" aria-label="Primary navigation">
          <div className="nav-group-label">COMMAND DECK</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return <button key={item.id} className={`nav-item ${page === item.id ? "active" : ""}`} onClick={() => navigate(item.id)}><Icon size={17} strokeWidth={1.8} style={{ display: "grid" }} /><span>{item.label}</span>{item.note && <em>{item.note}</em>}{page === item.id && <ChevronRight size={15} className="nav-chevron" />}</button>;
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="mini-module"><div className="mini-module-top"><span className="micro-label">DATA COVERAGE</span><span className="mono">84%</span></div><div className="thin-progress"><span style={{ width: "84%" }} /></div><p>3 months of activity indexed</p></div>
          <button className="nav-item" onClick={() => navigate("settings")}><Settings2 size={17} strokeWidth={1.8} /><span>Settings</span></button>
          <div className="profile-row"><div className="avatar">{initials(displayName)}</div><div><strong>{displayName}</strong><span>{isAuthenticated ? "MANUS ACCOUNT" : "AUTH REQUIRED"}</span></div><MoreHorizontal size={17} /></div>
        </div>
      </aside>

      {mobileNavOpen && <button className="mobile-scrim" onClick={() => setMobileNavOpen(false)} aria-label="Close menu" />}
      <main className="main-shell">
        <header className="topbar">
          <div className="topbar-leading"><button className="menu-button icon-button" onClick={() => setMobileNavOpen(true)} aria-label="Open navigation"><Menu size={20} /></button><div className="breadcrumb"><span>FINPILOT OS</span><ChevronRight size={14} /><strong>{pageLabel(page)}</strong></div></div>
          <form className="command-bar" onSubmit={handlePageSearch}><Command size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ask FinPilot anything about your money..." aria-label="Ask FinPilot" /><kbd>⌘ K</kbd></form>
          <div className="topbar-actions"><div className="month-pill"><span className="led led-orange" /> SEP 2026</div><button className="icon-button notification-button" aria-label="Notifications" onClick={() => notify("You have 2 fresh observations") }><Bell size={18} /><i>2</i></button><button className="avatar avatar-small" onClick={() => navigate("settings")} aria-label="Open profile settings">{initials(displayName)}</button></div>
        </header>

        <div className="page-content">
          {page === "dashboard" && <DashboardPage income={income} expenses={expenses} balance={balance} savingsRate={savingsRate} categoryTotals={categoryTotals} transactions={transactions} budgets={budgets} onNavigate={navigate} userName={displayName} />}
          {page === "transactions" && <TransactionsPage transactions={transactions} onPDF={handlePDF} importState={importState} importStats={importStats} />}
          {page === "subscriptions" && <SubscriptionsPage />}
          {page === "budgets" && <BudgetsPage budgets={budgets} setBudgets={setBudgets} budgetCommitted={budgetCommitted} budgetLimit={budgetLimit} notify={notify} />}
          {page === "goals" && <GoalsPage goals={goals} setGoals={setGoals} balance={balance} notify={notify} />}
          {page === "insights" && <InsightsPage income={income} expenses={expenses} balance={balance} savingsRate={savingsRate} categoryTotals={categoryTotals} transactions={transactions} onNavigate={navigate} />}
          {page === "assistant" && <AssistantPage messages={assistantMessages} onAsk={askAssistant} userInitials={initials(displayName)} />}
          {page === "settings" && <SettingsPage notify={notify} user={user} isAuthenticated={isAuthenticated} onLogin={startLogin} onLogout={handleLogout} />}
        </div>
        <footer className="safety-footer"><ShieldCheck size={14} /><span>FinPilot provides financial data analysis and decision support. It does not provide investment, tax, legal, or professional financial advice.</span><span className="footer-id">FP-OS / 1.0.0</span></footer>
      </main>
      {toast && <div className="toast"><CheckCircle2 size={17} />{toast}</div>}
    </div>
  );
}

function pageLabel(page: Page) {
  return ({ dashboard: "Dashboard", transactions: "Transactions", subscriptions: "Subscriptions", budgets: "Budgets", goals: "Goals", insights: "Insights", assistant: "AI Assistant", settings: "Settings" })[page];
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() || "").join("") || "FP";
}

function WelcomeScreen({ onEnter, isAuthenticated, authLoading, userName, oauthError }: { onEnter: () => void; isAuthenticated: boolean; authLoading: boolean; userName: string | null; oauthError: boolean }) {
  return <div className="welcome-shell"><div className="welcome-grid" /><div className="welcome-screw screw-a" /><div className="welcome-screw screw-b" /><div className="welcome-content"><div className="welcome-top"><div className="brand-mark large"><span>FP</span><i /></div><span className="micro-label">PERSONAL FINANCE DECISION SUPPORT</span><div className="status-chip"><span className={`led ${isAuthenticated ? "led-green" : "led-orange"}`} /> {isAuthenticated ? `MANUS CONNECTED · ${userName || "ACCOUNT"}` : "MANUS SIGN-IN REQUIRED"}</div></div><div className="welcome-layout"><div className="welcome-copy"><div className="eyebrow"><span className="led led-orange" /> FINPILOT / CONTROL CONSOLE</div><h1>Your Money.<br /><em>One Clear View.</em></h1><p>Connect your Manus account to access your private financial workspace and live data.</p>{oauthError && <div className="oauth-retry-notice"><AlertTriangle size={15} /><span>Your sign-in session expired or was blocked by the browser. Please try Manus sign-in again.</span></div>}<div className="welcome-actions"><button className="mechanical-button primary-button" onClick={onEnter} disabled={authLoading}>{authLoading ? "CHECKING SESSION..." : isAuthenticated ? "OPEN FINPILOT" : "SIGN IN WITH MANUS"} {!authLoading && <ArrowUpRight size={17} />}</button></div><div className="welcome-trust"><ShieldCheck size={15} /><span>{isAuthenticated ? "Signed in securely with Manus OAuth." : "No demo workspace is available. Sign in to continue."}</span></div></div><ControlConsole /></div><div className="welcome-meta"><span>INDIA / INR</span><span>{isAuthenticated ? "OAUTH SESSION ACTIVE" : "AUTHENTICATION REQUIRED"}</span><span>BUILD 2026.09</span></div></div></div>;
}

function ControlConsole() {
  return <div className="console-device"><div className="device-top"><span className="device-brand">FINPILOT OS <small>v1.0</small></span><div className="device-leds"><span className="led led-green" /><span className="led led-orange" /><span className="led led-red" /></div></div><div className="device-screen"><div className="scanlines" /><div className="screen-header"><span>WORKSPACE STATUS</span><strong>READY</strong></div><div className="screen-cash"><span>DATA CONNECTION</span><strong>NOT CONNECTED</strong></div><div className="screen-grid"><div><span>TRANSACTIONS</span><b>—</b></div><div><span>SYNC STATUS</span><b>AUTH REQUIRED</b></div></div><div className="screen-graph"><span className="graph-line g1" /><span className="graph-line g2" /><span className="graph-line g3" /><span className="graph-area" /></div><div className="screen-bottom"><span>PRIVATE WORKSPACE / SECURE</span><span>WAITING FOR SIGN-IN</span></div></div><div className="device-controls"><div className="control-knob" /><div className="control-slots"><span /><span /><span /><span /></div><div className="control-readout"><small>STATUS</small><strong>READY</strong></div><div className="control-button">↗</div></div><div className="device-foot"><span>FP-OS</span><span>PRIVATE FINANCE TERMINAL</span><span>AUTH REQUIRED</span></div></div>;
}

function DashboardPage({ income, expenses, balance, savingsRate, categoryTotals, transactions, budgets, onNavigate, userName }: { income: number; expenses: number; balance: number; savingsRate: number; categoryTotals: { name: string; value: number }[]; transactions: Transaction[]; budgets: Budget[]; onNavigate: (page: Page) => void; userName: string }) {
  const chartData = [{ month: "JUL", income: 72500, expenses: 34288 }, { month: "AUG", income: 72500, expenses: 38769 }, { month: "SEP", income, expenses }];
  return <div className="page-stack page-enter"><PageIntro eyebrow="OVERVIEW / SEPTEMBER 2026" title={`Good evening, ${userName.split(" ")[0]}.`} description="Your financial command center is up to date. Here is the signal in your money this month." actions={<button className="mechanical-button subtle-button" onClick={() => onNavigate("transactions")}><UploadCloud size={16} /> IMPORT DATA</button>} /><div className="metric-grid"><MetricCard label="Total income" value={money(income)} sub="vs ₹72,500 last month" trend="+0.0%" trendType="neutral" icon={<ArrowDownRight size={18} />} /><MetricCard label="Total expenses" value={money(expenses)} sub="vs ₹38,769 last month" trend="+11.6%" trendType="down" icon={<ArrowUpRight size={18} />} /><MetricCard label="Available balance" value={money(balance)} sub="after committed spend" trend="on track" trendType="up" icon={<Wallet size={18} />} /><MetricCard label="Savings rate" value={`${savingsRate.toFixed(1)}%`} sub="target 35.0%" trend="+5.3 pts" trendType="up" icon={<PiggyBank size={18} />} /></div><div className="dashboard-grid top-grid"><section className="panel console-panel"><PanelHeading eyebrow="LIVE FINANCIAL PULSE" title="This month at a glance" action={<span className="live-status"><span className="led led-green" /> LIVE</span>} /><div className="pulse-layout"><div className="pulse-copy"><span className="micro-label">NET CASH FLOW</span><strong>{money(balance)}</strong><p>Your income is covering planned commitments with <b>{money(balance - budgets.reduce((sum, item) => sum + item.spent, 0))}</b> left after budgeted categories.</p><div className="pulse-tags"><span><Check size={12} /> within plan</span><span><Zap size={12} /> 3 goals active</span></div></div><div className="radial-progress" style={{ "--progress": `${Math.min(savingsRate * 2.5, 100)}%` } as CSSProperties}><div><strong>{savingsRate.toFixed(1)}%</strong><span>SAVINGS RATE</span></div></div></div><div className="mini-signal"><div className="signal-bars"><i style={{ height: "28%" }} /><i style={{ height: "44%" }} /><i style={{ height: "37%" }} /><i style={{ height: "62%" }} /><i style={{ height: "48%" }} /><i style={{ height: "78%" }} /><i style={{ height: "70%" }} /><i style={{ height: "92%" }} /></div><div><span className="micro-label">MONEY IN MOTION</span><b>Strong close to the month</b></div><ArrowUpRight size={19} /></div></section><section className="panel trend-panel"><PanelHeading eyebrow="MONTHLY CASH FLOW" title="Income vs expenses" action={<button className="text-button" onClick={() => onNavigate("insights")}>VIEW REPORT <ChevronRight size={14} /></button>} /><div className="chart-legend"><span><i className="legend-dot income-dot" /> Income</span><span><i className="legend-dot expense-dot" /> Expenses</span><span className="chart-scale">INR / MONTH</span></div><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 12, right: 4, left: -20, bottom: 0 }}><defs><linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ff7b6e" stopOpacity={0.26} /><stop offset="100%" stopColor="#ff7b6e" stopOpacity={0} /></linearGradient><linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7c83fd" stopOpacity={0.18} /><stop offset="100%" stopColor="#7c83fd" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="#d5dae2" strokeDasharray="2 6" vertical={false} /><XAxis dataKey="month" tick={{ fontSize: 10, fill: "#7d8796", fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 10, fill: "#7d8796", fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value / 1000}k`} /><Tooltip formatter={(value) => money(Number(value))} contentStyle={{ borderRadius: 10, border: "1px solid #d9dde5", boxShadow: "0 10px 24px #a3b1c633", fontFamily: "JetBrains Mono", fontSize: 11 }} /><Area type="monotone" dataKey="income" stroke="#ff6f61" fill="url(#incomeFill)" strokeWidth={2.5} /><Area type="monotone" dataKey="expenses" stroke="#7c83fd" fill="url(#expenseFill)" strokeWidth={2.5} /></AreaChart></ResponsiveContainer></div><div className="trend-callout"><span className="led led-orange" /><span>Expenses are <b>₹4,511 higher</b> than August. Food and shopping explain most of the movement.</span></div></section></div><div className="dashboard-grid lower-grid"><section className="panel category-panel"><PanelHeading eyebrow="SPENDING MIX" title="Where your money went" action={<button className="text-button" onClick={() => onNavigate("transactions")}>ALL TRANSACTIONS <ChevronRight size={14} /></button>} /><div className="category-layout"><div className="donut-wrap"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={categoryTotals} cx="50%" cy="50%" innerRadius={56} outerRadius={82} paddingAngle={3} dataKey="value" strokeWidth={0}>{categoryTotals.map((entry) => <Cell key={entry.name} fill={categoryColors[entry.name] || categoryColors.Other} />)}</Pie><Tooltip formatter={(value) => money(Number(value))} contentStyle={{ borderRadius: 10, border: "1px solid #d9dde5", fontFamily: "JetBrains Mono", fontSize: 11 }} /></PieChart></ResponsiveContainer><div className="donut-center"><strong>{compactMoney(expenses)}</strong><span>SPENT</span></div></div><div className="category-list">{categoryTotals.slice(0, 5).map((item) => <div className="category-row" key={item.name}><span className="category-name"><i style={{ background: categoryColors[item.name] }} />{item.name}</span><strong>{money(item.value)}</strong><span className="category-percent">{Math.round((item.value / expenses) * 100)}%</span></div>)}</div></div></section><section className="panel anomaly-panel"><PanelHeading eyebrow="ANOMALY MONITOR" title="Unusual spending pattern" action={<AlertTriangle size={18} className="warning-icon" />} /><div className="alert-card"><div className="alert-icon"><AlertTriangle size={18} /></div><div><strong>Shopping is 68% higher</strong><p>Current: <b>{money(categoryTotals.find((item) => item.name === "Shopping")?.value || 0)}</b> · Typical: <b>₹5,010</b></p><span className="delta">+₹3,410 vs usual monthly average</span></div></div><div className="anomaly-foot"><span><span className="led led-orange" /> Pattern review only</span><button className="text-button" onClick={() => onNavigate("insights")}>SEE WHY <ChevronRight size={14} /></button></div></section><section className="panel recent-panel"><PanelHeading eyebrow="LATEST ACTIVITY" title="Recent transactions" action={<button className="text-button" onClick={() => onNavigate("transactions")}>VIEW ALL <ChevronRight size={14} /></button>} /><div className="compact-transactions">{transactions.filter((item) => item.date.startsWith("2026-09")).slice(0, 5).map((item) => <CompactTransaction key={item.id} transaction={item} />)}</div></section></div><div className="dashboard-footer-note"><Sparkles size={15} /><span>FinPilot sees a healthy month-end buffer. Your current path keeps the Emergency Fund goal on track.</span><button className="text-button" onClick={() => onNavigate("goals")}>CHECK GOALS <ChevronRight size={14} /></button></div></div>;
}

function PageIntro({ eyebrow, title, description, actions }: { eyebrow: string; title: string; description: string; actions?: ReactNode }) {
  return <div className="page-intro"><div><div className="eyebrow"><span className="led led-orange" /> {eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{actions && <div className="intro-actions">{actions}</div>}</div>;
}
function PanelHeading({ eyebrow, title, action }: { eyebrow: string; title: string; action?: ReactNode }) {
  return <div className="panel-heading"><div><div className="micro-label">{eyebrow}</div><h2>{title}</h2></div>{action}</div>;
}
function MetricCard({ label, value, sub, trend, trendType, icon }: { label: string; value: string; sub: string; trend: string; trendType: "up" | "down" | "neutral"; icon: ReactNode }) {
  return <div className="metric-card"><div className="metric-top"><span className="micro-label">{label}</span><span className="metric-icon">{icon}</span></div><div className="metric-value">{value}</div><div className="metric-bottom"><span>{sub}</span><b className={`trend ${trendType}`}><span>{trendType === "down" ? "↗" : trendType === "up" ? "↗" : "→"}</span>{trend}</b></div></div>;
}
function CompactTransaction({ transaction }: { transaction: Transaction }) {
  return <div className="compact-transaction"><div className={`merchant-icon merchant-${transaction.category.toLowerCase()}`}>{transaction.category === "Food" ? <Utensils size={15} /> : transaction.category === "Shopping" ? <ShoppingBag size={15} /> : transaction.category === "Housing" ? <Home size={15} /> : transaction.type === "income" ? <BriefcaseBusiness size={15} /> : <Receipt size={15} />}</div><div className="transaction-name"><strong>{transaction.description}</strong><span>{transaction.category} · {formatDate(transaction.date)}</span></div><strong className={transaction.type === "income" ? "income-text" : "expense-text"}>{transaction.type === "income" ? "+" : "−"}{money(transaction.amount)}</strong></div>;
}

function TransactionsPage({ transactions, onPDF, importState, importStats }: { transactions: Transaction[]; onPDF: (event: ChangeEvent<HTMLInputElement>) => void; importState: "idle" | "processing" | "complete"; importStats: { processed: number; categories: number; recurring: number; anomalies: number } }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All categories");
  const [type, setType] = useState("All types");
  const filtered = transactions.filter((item) => `${item.description} ${item.category}`.toLowerCase().includes(search.toLowerCase()) && (category === "All categories" || item.category === category) && (type === "All types" || item.type === type));
  return <div className="page-stack page-enter"><PageIntro eyebrow="DATA / TRANSACTION LEDGER" title="Your money, itemized." description="Search, filter, and import the raw activity behind every insight." actions={<label className="mechanical-button primary-button upload-button"><UploadCloud size={16} /> IMPORT PDF<input type="file" accept=".pdf,application/pdf" onChange={onPDF} /></label>} />{importState !== "idle" && <ImportStatus state={importState} stats={importStats} />}{importState === "idle" && <div className="import-strip"><div className="import-icon"><FileText size={22} /></div><div><strong>Import financial data</strong><span>Upload a text-based PDF statement and let FinPilot extract transactions automatically.</span></div><div className="import-format"><span className="led led-green" /> PDF READY</div><label className="mechanical-button secondary-button upload-button">CHOOSE PDF<input type="file" accept=".pdf,application/pdf" onChange={onPDF} /></label></div>}<section className="panel ledger-panel"><div className="ledger-toolbar"><div className="input-shell search-shell"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search merchant or description..." /></div><div className="filter-group"><SlidersHorizontal size={15} /><select value={category} onChange={(event) => setCategory(event.target.value)}><option>All categories</option>{categories.concat(["Income"]).map((item) => <option key={item}>{item}</option>)}</select><select value={type} onChange={(event) => setType(event.target.value)}><option>All types</option><option value="income">Income</option><option value="expense">Expense</option></select></div><span className="record-count">{filtered.length} RECORDS</span></div><div className="table-wrap"><table><thead><tr><th>DATE</th><th>DESCRIPTION</th><th>CATEGORY</th><th>AMOUNT</th><th>TYPE</th><th>STATUS</th><th /></tr></thead><tbody>{filtered.map((item) => <tr key={item.id}><td className="mono muted-cell">{formatDate(item.date)}</td><td><div className="table-merchant"><span className="merchant-icon small"><Receipt size={14} /></span><div><strong>{item.description}</strong><span className="mono muted-cell">{item.id}</span></div></div></td><td><span className="category-pill"><i style={{ background: categoryColors[item.category] || "#99a1b3" }} />{item.category}</span></td><td className={`mono amount-cell ${item.type === "income" ? "income-text" : ""}`}>{item.type === "income" ? "+" : "−"}{money(item.amount)}</td><td><span className={`type-label ${item.type}`}>{item.type === "income" ? "Income" : "Expense"}</span></td><td><span className="status-label"><CheckCircle2 size={13} /> {item.status}</span></td><td><button className="icon-button tiny" aria-label={`More options for ${item.description}`}><MoreHorizontal size={16} /></button></td></tr>)}</tbody></table>{filtered.length === 0 && <EmptyState icon={<PackageOpen size={24} />} title="No transactions match" copy="Try changing your filters or import a statement to begin." />}</div></section></div>;
}
function ImportStatus({ state, stats }: { state: "processing" | "complete"; stats: { processed: number; categories: number; recurring: number; anomalies: number } }) {
  const steps = ["SCANNING TRANSACTIONS", "CLASSIFYING EXPENSES", "DETECTING RECURRING PAYMENTS", "UPDATING FINANCIAL PROFILE"];
  return <section className={`panel import-status ${state}`}><div className="import-status-head"><div><div className="micro-label">IMPORT PIPELINE / LOCAL PROCESS</div><h2>{state === "processing" ? "Scanning your statement..." : "Import complete"}</h2></div>{state === "processing" ? <span className="processing-chip"><span className="spinner" /> PROCESSING</span> : <span className="complete-chip"><CheckCircle2 size={15} /> COMPLETE</span>}</div>{state === "processing" ? <div className="processing-steps">{steps.map((step, index) => <div key={step} className="processing-step"><span className={index < 2 ? "step-check active" : "step-check"}>{index < 2 ? <Check size={11} /> : index + 1}</span><span>{step}</span><i /></div>)}</div> : <div className="import-results">{[[stats.processed, "TRANSACTIONS PROCESSED"], [stats.categories, "CATEGORIES DETECTED"], [stats.recurring, "RECURRING PAYMENTS"], [stats.anomalies, "PATTERNS TO REVIEW"]].map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}</div>}</section>;
}

function SubscriptionsPage() {
  if (subscriptions.length === 0) {
    return <div className="page-stack page-enter"><PageIntro eyebrow="RECURRING / COMMITMENTS" title="Know what is coming next." description="FinPilot will detect repeated merchants, amounts, and billing rhythms after you connect or import financial data." actions={<button className="mechanical-button secondary-button" disabled><Download size={16} /> EXPORT VIEW</button>} /><section className="panel"><EmptyState icon={<Repeat2 size={24} />} title="No recurring payments detected" copy="Connect a financial source or import transactions to identify subscriptions and upcoming obligations." /></section></div>;
  }
  const total = subscriptions.slice(0, 3).reduce((sum, item) => sum + item.amount, 0) + Math.round(subscriptions[3].amount / 12);
  return <div className="page-stack page-enter"><PageIntro eyebrow="RECURRING / COMMITMENTS" title="Know what is coming next." description="FinPilot detected repeated merchants, amounts, and billing rhythms across your imported history." actions={<button className="mechanical-button secondary-button"><Download size={16} /> EXPORT VIEW</button>} /><div className="commitment-banner panel"><div className="commitment-value"><span className="micro-label">ESTIMATED RECURRING MONTHLY COMMITMENTS</span><strong>{money(total)}</strong><span className="commitment-note"><span className="led led-green" /> Based on 4 detected patterns</span></div><div className="commitment-visual"><div className="commitment-bars"><i style={{ height: "42%" }} /><i style={{ height: "65%" }} /><i style={{ height: "52%" }} /><i style={{ height: "81%" }} /><i style={{ height: "69%" }} /><i style={{ height: "92%" }} /></div><span>JUL — SEP</span></div></div><section className="subscription-section"><div className="section-head-row"><div><div className="micro-label">DETECTED SERVICES</div><h2>Subscriptions</h2></div><span className="section-counter">04 ACTIVE</span></div><div className="subscription-grid">{subscriptions.map((subscription) => <div className="subscription-card panel" key={subscription.name}><div className="subscription-top"><div className="service-logo" style={{ background: subscription.color }}>{subscription.icon}</div><button className="icon-button tiny"><MoreHorizontal size={17} /></button></div><div className="subscription-name">{subscription.name}</div><div className="subscription-amount">{money(subscription.amount)}<span>{subscription.cadence}</span></div><div className="subscription-bottom"><div><span className="micro-label">NEXT PAYMENT</span><strong>{subscription.next}</strong></div><span className="recurring-badge"><Repeat2 size={12} /> RECURRING</span></div></div>)}</div></section><section className="panel obligations-panel"><PanelHeading eyebrow="UPCOMING OBLIGATIONS" title="The next financial events" action={<CalendarClock size={19} />} /><div className="obligation-list"><Obligation date="24 SEP" label="Netflix" meta="Subscription · auto debit" amount="₹649" /><Obligation date="28 SEP" label="Spotify" meta="Subscription · auto debit" amount="₹119" /><Obligation date="01 OCT" label="Rent — Koramangala" meta="Housing · recurring" amount="₹18,000" /><Obligation date="03 OCT" label="YouTube Premium" meta="Subscription · auto debit" amount="₹149" /></div></section><div className="info-strip"><ShieldCheck size={16} /><span>Recurring detection is based on repeated merchant, amount, and timing patterns. It is an awareness signal, not a fraud determination.</span></div></div>;
}
function Obligation({ date, label, meta, amount }: { date: string; label: string; meta: string; amount: string }) {
  return <div className="obligation-row"><div className="date-stamp"><span className="led led-orange" />{date}</div><div className="obligation-main"><strong>{label}</strong><span>{meta}</span></div><strong className="mono">{amount}</strong><button className="icon-button tiny"><ChevronRight size={16} /></button></div>;
}

function BudgetsPage({ budgets, setBudgets, budgetCommitted, budgetLimit, notify }: { budgets: Budget[]; setBudgets: React.Dispatch<React.SetStateAction<Budget[]>>; budgetCommitted: number; budgetLimit: number; notify: (message: string) => void }) {
  const [draft, setDraft] = useState({ category: "Travel", limit: "4000" });
  const addBudget = (event: FormEvent) => { event.preventDefault(); if (!draft.category || !Number(draft.limit)) return; setBudgets((items) => [...items, { id: `${draft.category}-${Date.now()}`, category: draft.category, limit: Number(draft.limit), spent: 0 }]); setDraft({ category: "Travel", limit: "4000" }); notify("Budget added to this month"); };
  return <div className="page-stack page-enter"><PageIntro eyebrow="CONTROL / MONTHLY BUDGETS" title="Give every rupee a job." description="Keep a pulse on committed spend and see where there is still room to move." actions={<button className="mechanical-button primary-button" onClick={() => document.getElementById("new-budget")?.scrollIntoView({ behavior: "smooth" })}><Plus size={16} /> NEW BUDGET</button>} /><div className="budget-summary panel"><div><div className="micro-label">MONTHLY COMMITMENT</div><div className="budget-summary-value"><strong>{money(budgetCommitted)}</strong><span>of {money(budgetLimit)}</span></div><div className="wide-progress"><span style={{ width: `${Math.min((budgetCommitted / budgetLimit) * 100, 100)}%` }} /></div><p>{Math.round((budgetCommitted / budgetLimit) * 100)}% committed across {budgets.length} active envelopes.</p></div><div className="budget-summary-side"><div className="summary-ring"><strong>{money(Math.max(budgetLimit - budgetCommitted, 0))}</strong><span>REMAINING</span></div><div><span className="micro-label">SIGNAL</span><strong className="summary-good"><span className="led led-green" /> ON TRACK</strong></div></div></div><div className="budget-grid">{budgets.map((budget) => <BudgetCard key={budget.id} budget={budget} onDelete={() => { setBudgets((items) => items.filter((item) => item.id !== budget.id)); notify("Budget removed"); }} />)}</div><section className="panel new-budget-panel" id="new-budget"><PanelHeading eyebrow="CONFIGURE ENVELOPE" title="Create a new budget" action={<SlidersHorizontal size={18} />} /><form className="budget-form" onSubmit={addBudget}><label><span>CATEGORY</span><input value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })} placeholder="e.g. Wellness" /></label><label><span>MONTHLY LIMIT</span><input type="number" value={draft.limit} onChange={(event) => setDraft({ ...draft, limit: event.target.value })} /></label><button className="mechanical-button primary-button" type="submit"><Plus size={16} /> ADD ENVELOPE</button></form></section></div>;
}
function BudgetCard({ budget, onDelete }: { budget: Budget; onDelete: () => void }) {
  const percentage = (budget.spent / budget.limit) * 100;
  const status = percentage > 100 ? "OVER BUDGET" : percentage > 80 ? "NEAR LIMIT" : "ON TRACK";
  return <div className="budget-card panel"><div className="budget-card-top"><div className="budget-category"><span className="category-square" style={{ background: categoryColors[budget.category] || "#7c83fd" }} />{budget.category}</div><button className="icon-button tiny" onClick={onDelete} aria-label={`Remove ${budget.category} budget`}><Trash2 size={15} /></button></div><div className="budget-amounts"><strong>{money(budget.spent)}</strong><span>of {money(budget.limit)}</span></div><div className="wide-progress budget-progress"><span className={percentage > 100 ? "over" : percentage > 80 ? "near" : ""} style={{ width: `${Math.min(percentage, 100)}%` }} /></div><div className="budget-card-foot"><span className={`budget-status ${status.toLowerCase().replace(" ", "-")}`}><i />{status}</span><strong className="mono">{budget.spent > budget.limit ? `+${money(budget.spent - budget.limit)}` : money(budget.limit - budget.spent)} <small>{budget.spent > budget.limit ? "over" : "left"}</small></strong></div></div>;
}

function GoalsPage({ goals, setGoals, balance, notify }: { goals: Goal[]; setGoals: React.Dispatch<React.SetStateAction<Goal[]>>; balance: number; notify: (message: string) => void }) {
  const [draft, setDraft] = useState({ name: "", target: "", current: "", monthly: "8000" });
  const addGoal = (event: FormEvent) => { event.preventDefault(); if (!draft.name || !Number(draft.target)) return; setGoals((items) => [...items, { id: `goal-${Date.now()}`, name: draft.name, target: Number(draft.target), current: Number(draft.current) || 0, monthly: Number(draft.monthly) || 0, targetDate: "TBD", accent: "orange" }]); setDraft({ name: "", target: "", current: "", monthly: "8000" }); notify("Goal added to your plan"); };
  return <div className="page-stack page-enter"><PageIntro eyebrow="DIRECTION / FINANCIAL GOALS" title="Make progress visible." description="Goals translate today’s surplus into a future you can see and measure." actions={<button className="mechanical-button primary-button" onClick={() => document.getElementById("new-goal")?.scrollIntoView({ behavior: "smooth" })}><Plus size={16} /> NEW GOAL</button>} /><div className="goal-highlight panel"><div><div className="micro-label">GOAL IMPACT ANALYSIS</div><h2>Your current spending leaves <em>{money(balance)}</em> of monthly capacity.</h2><p>If you reduce discretionary spending by <b>₹2,000/month</b>, your Emergency Fund could be reached approximately <b>2 months earlier</b>.</p></div><div className="impact-metric"><span className="led led-green" /><strong>+2 MO</strong><span>EARLIER COMPLETION</span></div></div><div className="goal-grid">{goals.map((goal) => <GoalCard key={goal.id} goal={goal} onDelete={() => { setGoals((items) => items.filter((item) => item.id !== goal.id)); notify("Goal removed"); }} />)}</div><section className="panel new-budget-panel" id="new-goal"><PanelHeading eyebrow="DEFINE A TARGET" title="Create a new goal" action={<Target size={18} />} /><form className="goal-form" onSubmit={addGoal}><label><span>GOAL NAME</span><input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="e.g. Home office" /></label><label><span>TARGET AMOUNT</span><input type="number" value={draft.target} onChange={(event) => setDraft({ ...draft, target: event.target.value })} placeholder="₹ 50,000" /></label><label><span>CURRENT SAVINGS</span><input type="number" value={draft.current} onChange={(event) => setDraft({ ...draft, current: event.target.value })} placeholder="₹ 0" /></label><label><span>MONTHLY CONTRIBUTION</span><input type="number" value={draft.monthly} onChange={(event) => setDraft({ ...draft, monthly: event.target.value })} /></label><button className="mechanical-button primary-button" type="submit"><Plus size={16} /> ADD GOAL</button></form></section></div>;
}
function GoalCard({ goal, onDelete }: { goal: Goal; onDelete: () => void }) {
  const percentage = Math.min((goal.current / goal.target) * 100, 100);
  return <div className={`goal-card panel goal-${goal.accent}`}><div className="goal-card-top"><div className="goal-symbol"><Target size={18} /></div><button className="icon-button tiny" onClick={onDelete} aria-label={`Remove ${goal.name}`}><Trash2 size={15} /></button></div><div className="goal-name">{goal.name}</div><div className="goal-target"><span>TARGET</span><strong>{money(goal.target)}</strong></div><div className="goal-progress-row"><div className="circle-progress"><svg viewBox="0 0 42 42"><circle className="circle-track" cx="21" cy="21" r="17" /><circle className="circle-value" cx="21" cy="21" r="17" strokeDasharray={`${percentage} ${100 - percentage}`} /></svg><strong>{percentage.toFixed(1)}%</strong></div><div><span className="micro-label">CURRENT SAVINGS</span><strong className="goal-current">{money(goal.current)}</strong><span className="goal-contribution">+{money(goal.monthly)} / month</span></div></div><div className="goal-card-foot"><span>EST. COMPLETION</span><strong>{goal.targetDate}</strong></div></div>;
}

function InsightsPage({ income, expenses, balance, savingsRate, categoryTotals, transactions, onNavigate }: { income: number; expenses: number; balance: number; savingsRate: number; categoryTotals: { name: string; value: number }[]; transactions: Transaction[]; onNavigate: (page: Page) => void }) {
  const topCategories = [...categoryTotals].sort((a, b) => b.value - a.value).slice(0, 3);
  return <div className="page-stack page-enter"><PageIntro eyebrow="REPORT / MONTHLY SUMMARY" title="September 2026 financial report" description="A clear, neutral readout of the patterns inside your money this month." actions={<button className="mechanical-button secondary-button" onClick={() => window.print()}><Download size={16} /> PRINT SUMMARY</button>} /><div className="report-hero panel"><div><span className="micro-label">NET CASH FLOW</span><strong>+₹29,220</strong><p>Positive cash flow with a savings rate above your 35% target.</p></div><div className="report-hero-stats"><div><span>INCOME</span><strong>₹72,500</strong></div><div><span>EXPENSES</span><strong>{money(expenses)}</strong></div><div><span>SAVINGS RATE</span><strong>40.3%</strong></div></div></div><div className="report-grid"><section className="panel report-section"><PanelHeading eyebrow="01 / SPENDING ORDER" title="Top spending categories" action={<TrendingUp size={18} />} /><div className="rank-list">{topCategories.map((item, index) => <div className="rank-row" key={item.name}><span className="rank-number">0{index + 1}</span><div className="rank-label"><strong>{item.name}</strong><div className="rank-bar"><span style={{ width: `${(item.value / topCategories[0].value) * 100}%`, background: categoryColors[item.name] }} /></div></div><strong className="mono">{money(item.value)}</strong></div>)}</div><p className="section-disclaimer">Ordered by amount only. This is not a recommendation.</p></section><section className="panel report-section"><PanelHeading eyebrow="02 / KEY OBSERVATIONS" title="What changed" action={<Sparkles size={18} />} /><ul className="observation-list"><li><span className="observation-dot orange" />Food spending increased compared with August.</li><li><span className="observation-dot violet" />Four recurring payment patterns are active.</li><li><span className="observation-dot red" />Entertainment is currently over its monthly limit.</li><li><span className="observation-dot green" />Emergency-fund contribution remains on track.</li></ul></section><section className="panel report-section action-section"><PanelHeading eyebrow="03 / NEXT MOVES" title="Action items" action={<CheckCircle2 size={18} />} /><div className="action-list"><button onClick={() => onNavigate("subscriptions")}><span>01</span><strong>Review recurring subscriptions</strong><ChevronRight size={16} /></button><button onClick={() => onNavigate("budgets")}><span>02</span><strong>Monitor entertainment spending</strong><ChevronRight size={16} /></button><button onClick={() => onNavigate("goals")}><span>03</span><strong>Maintain planned goal contribution</strong><ChevronRight size={16} /></button></div></section></div><div className="report-data-foot"><span><FileText size={15} /> SOURCE: {transactions.length} LOCAL TRANSACTIONS</span><span><Clock3 size={15} /> LAST SYNC: 19 SEP 2026, 20:04</span><span><ShieldCheck size={15} /> AWARENESS MODE</span></div></div>;
}

function AssistantPage({ messages, onAsk, userInitials }: { messages: AssistantMessage[]; onAsk: (question: string) => void; userInitials: string }) {
  const [draft, setDraft] = useState("");
  const questions = ["Where did I spend the most this month?", "Which subscriptions am I paying for?", "What expenses increased compared with last month?", "How much of my budget is committed?", "How is my spending affecting my emergency fund?"];
  const submit = (event: FormEvent) => { event.preventDefault(); if (draft.trim()) { onAsk(draft); setDraft(""); } };
  return <div className="page-stack page-enter assistant-page"><PageIntro eyebrow="INTELLIGENCE / NATURAL LANGUAGE" title="Ask your money anything." description="A decision-support console grounded in the financial data currently connected to FinPilot." actions={<span className="assistant-status"><span className="led led-green" /> FINANCIAL DATA CONNECTED</span>} /><div className="assistant-layout"><section className="panel chat-panel"><div className="chat-header"><div className="ai-orb"><Bot size={19} /></div><div><strong>FINPILOT AI</strong><span>LOCAL DATA REASONING / READY</span></div><span className="chat-encrypted"><ShieldCheck size={13} /> PRIVATE</span></div><div className="chat-stream">{messages.map((message, index) => <div className={`chat-message ${message.from}`} key={`${message.text}-${index}`}><div className="message-avatar">{message.from === "assistant" ? <Bot size={15} /> : userInitials}</div><div className="message-bubble"><span>{message.text}</span>{message.meta && <small>{message.meta}</small>}</div></div>)}</div><form className="chat-input" onSubmit={submit}><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Ask about spending, budgets, or goals..." aria-label="Ask a question" /><button className="send-button" type="submit" aria-label="Send question"><Send size={17} /></button></form></section><aside className="assistant-aside"><div className="panel suggested-panel"><div className="micro-label">TRY A COMMAND</div><h2>Suggested questions</h2><div className="suggested-list">{questions.map((question) => <button key={question} onClick={() => onAsk(question)}>{question}<ChevronRight size={15} /></button>)}</div></div><div className="panel assistant-safety"><ShieldCheck size={18} /><div><strong>Decision support only</strong><p>FinPilot helps you understand the data you provide. It does not advise on investments, tax, loans, or financial products.</p></div></div></aside></div></div>;
}
function SettingsPage({ notify, user, isAuthenticated, onLogin, onLogout }: { notify: (message: string) => void; user: { name: string | null; email: string | null; openId: string } | null; isAuthenticated: boolean; onLogin: () => void; onLogout: () => void }) {
  const [notifications, setNotifications] = useState(true);
  const displayName = user?.name || "FinPilot user";
  return <div className="page-stack page-enter"><PageIntro eyebrow="SYSTEM / PROFILE CONFIGURATION" title="Tune your control console." description="Manage how FinPilot presents your private financial signal." actions={<span className="settings-id">{isAuthenticated ? "MANUS OAUTH / ACTIVE" : "AUTHENTICATION REQUIRED"}</span>} /><div className="settings-grid"><section className="panel settings-profile"><div className="large-avatar">{initials(displayName)}</div><div><div className="micro-label">PRIMARY PROFILE</div><h2>{displayName}</h2><p>{isAuthenticated ? user?.email || "Authenticated Manus account" : "Sign in with Manus to access your private workspace"}</p></div>{isAuthenticated ? <button className="mechanical-button secondary-button" onClick={onLogout}><LogOutIcon /> SIGN OUT</button> : <button className="mechanical-button primary-button" onClick={onLogin}><ShieldCheck size={15} /> SIGN IN WITH MANUS</button>}</section><section className="panel settings-section"><PanelHeading eyebrow="PREFERENCES" title="Display and alerts" action={<Settings2 size={18} />} /><SettingToggle label="Pattern notifications" description="Show a signal when spending differs from your typical rhythm." checked={notifications} onChange={() => setNotifications(!notifications)} /><SettingToggle label="Compact ledger view" description="Use denser rows in the transaction table." checked={false} onChange={() => notify("Compact view preference noted")} /></section><section className="panel settings-section"><PanelHeading eyebrow="DATA & SAFETY" title="Workspace connection" action={<ShieldCheck size={18} />} /><div className="settings-row"><div><strong>Identity connection</strong><span>{isAuthenticated ? `Manus OAuth session · ${user?.openId.slice(0, 10)}…` : "No Manus session connected"}</span></div><span className={isAuthenticated ? "complete-chip" : "settings-id"}>{isAuthenticated ? <><CheckCircle2 size={14} /> CONNECTED</> : "REQUIRED"}</span></div><div className="settings-row"><div><strong>Transaction source</strong><span>No financial data connected yet. Import a PDF statement or connect a supported provider.</span></div><span className="mono">NOT CONNECTED</span></div><div className="settings-row"><div><strong>Currency</strong><span>Indian Rupee (₹) · en-IN formatting</span></div><span className="mono">INR</span></div></section></div></div>;
}
function LogOutIcon() { return <ArrowLeftRight size={15} />; }
function SettingToggle({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: () => void }) {
  return <div className="setting-row"><div><strong>{label}</strong><span>{description}</span></div><button className={`toggle ${checked ? "checked" : ""}`} onClick={onChange} aria-pressed={checked}><span /></button></div>;
}
function EmptyState({ icon, title, copy }: { icon: ReactNode; title: string; copy: string }) { return <div className="empty-state">{icon}<strong>{title}</strong><span>{copy}</span></div>; }

function answerQuestion(question: string, context: { expenses: number; balance: number; categoryTotals: { name: string; value: number }[]; budgetCommitted: number; budgetLimit: number; subscriptions: typeof subscriptions; goals: Goal[]; transactionCount: number }) {
  const normalized = question.toLowerCase().replace(/[!?.,]/g, "").trim();
  const top = [...context.categoryTotals].sort((a, b) => b.value - a.value)[0];
  const isGreeting = /^(hi|hello|hey|good|good morning|good evening|how are you|how it helps|how does this help)$/.test(normalized);
  if (isGreeting) return `I can work with your connected FinPilot data. I can find your biggest spending area, summarize recurring payments, check budget usage, or explain how spending affects your goals. What would you like to understand first?`;
  if (!context.transactionCount) {
    if (normalized.includes("help") || normalized.includes("what can") || normalized.includes("how")) return "I can help once your data is available. Upload a bank-statement PDF from Transactions, then ask me to find spending patterns, recurring payments, budget pressure, or goal progress.";
    return "I don’t have transaction data to analyze yet, so I don’t want to invent an answer. Upload a bank-statement PDF from Transactions, or tell me whether you want help with spending, subscriptions, budgets, or goals.";
  }
  if (normalized.includes("most") || normalized.includes("largest") || normalized.includes("spend")) {
    if (!top) return "I don’t have categorized expenses for this period yet. Import a bank-statement PDF and I’ll identify the largest spending areas.";
    const share = context.expenses ? Math.round((top.value / context.expenses) * 100) : 0;
    return `Your largest spending category is ${top.name} at ${money(top.value)}, about ${share}% of the ${money(context.expenses)} total. I can also break that category down by transaction if you want.`;
  }
  if (normalized.includes("subscription") || normalized.includes("recurring")) {
    if (!context.subscriptions.length) return "I haven’t detected recurring payments yet. I can check for repeated merchants and amounts after you import a longer statement history.";
    const commitment = context.subscriptions.reduce((sum, item) => sum + item.amount, 0);
    return `I found ${context.subscriptions.length} recurring payment${context.subscriptions.length === 1 ? "" : "s"}, totaling about ${money(commitment)} across the records currently loaded. Ask me to list them if you want the merchant-by-merchant view.`;
  }
  if (normalized.includes("increase") || normalized.includes("compare") || normalized.includes("august") || normalized.includes("last month")) return "I can compare months when the imported statement history includes both periods. At the moment, I only have the currently loaded transactions, so I won’t estimate a month-over-month change.";
  if (normalized.includes("budget") || normalized.includes("committed")) {
    if (!context.budgetLimit) return "You don’t have an active budget yet. Open Budgets to create an envelope, then I can track committed spend and remaining room for you.";
    return `${money(context.budgetCommitted)} of your ${money(context.budgetLimit)} active budget is committed, or ${Math.round((context.budgetCommitted / context.budgetLimit) * 100)}%. I can help you decide which category to review next.`;
  }
  if (normalized.includes("save") || normalized.includes("emergency") || normalized.includes("goal")) {
    if (!context.goals.length) return "You don’t have a financial goal configured yet. Open Goals to add one, and I can relate your current cash flow to its progress.";
    return `Your current period cash flow is ${money(context.balance)} across the loaded transactions. I can compare that with a specific goal if you tell me which goal you want to review.`;
  }
  return `I’m not sure which part of your finances you mean by “${question}”. Do you want help with spending, recurring payments, budgets, or goals?`;
}

export default App;
