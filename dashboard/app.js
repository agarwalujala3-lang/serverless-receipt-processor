const FILTERS = ["ALL", "AUTO_APPROVED", "NEEDS_REVIEW", "DUPLICATE"];
const POLL_INTERVAL_MS = 2500;
const MAX_POLL_ATTEMPTS = 30;
const HOW_IT_WORKS = [
  {
    eyebrow: "Flip Card 01",
    frontTitle: "Upload Receipts",
    frontBody: "Send PDFs or images into the pipeline directly from the browser.",
    backTitle: "Signed Intake",
    backBody:
      "The console requests a presigned S3 upload URL, so the file goes straight into the intake bucket instead of through a web server.",
  },
  {
    eyebrow: "Flip Card 02",
    frontTitle: "AI Extraction",
    frontBody: "Vendor, totals, dates, and lines are read automatically from each receipt.",
    backTitle: "Textract AnalyzeExpense",
    backBody:
      "The backend uses Textract to convert unstructured receipt files into structured finance records for dashboards and exports.",
  },
  {
    eyebrow: "Flip Card 03",
    frontTitle: "Quality Gate",
    frontBody: "Confidence checks and duplicate detection decide if a receipt can auto-flow.",
    backTitle: "Trust Layer",
    backBody:
      "Low-confidence or duplicate receipts are routed into review states before they can affect spend reporting.",
  },
  {
    eyebrow: "Flip Card 04",
    frontTitle: "Operator Surface",
    frontBody: "Upload, live status, analytics, and review queue all live in the same product view.",
    backTitle: "Why It Feels Complete",
    backBody:
      "This turns the project from a hidden backend demo into a tool both non-technical and technical users can understand quickly.",
  },
];
const FALLBACK_DASHBOARD = {
  summary: {
    receiptCount: 18,
    totalSpend: 4826.48,
    averageConfidence: 91.4,
    duplicateCount: 2,
    needsReviewCount: 4,
    autoApprovedCount: 14,
  },
  categoryBreakdown: [
    { label: "Travel", amount: 1620.9, share: 33.6 },
    { label: "Food & Dining", amount: 1182.44, share: 24.5 },
    { label: "Retail", amount: 954.17, share: 19.8 },
    { label: "Office Supplies", amount: 612.37, share: 12.7 },
    { label: "Utilities", amount: 456.6, share: 9.4 },
  ],
  topVendors: [
    { vendor: "Amazon", amount: 954.17, share: 19.8 },
    { vendor: "SkyRoute Travels", amount: 842.6, share: 17.5 },
    { vendor: "Mellu Trading Pty Ltd", amount: 694.12, share: 14.4 },
    { vendor: "Urban Brew Cafe", amount: 512.41, share: 10.6 },
  ],
  monthlyTrend: [
    { month: "2026-01", amount: 1186.25, count: 4 },
    { month: "2026-02", amount: 1464.48, count: 5 },
    { month: "2026-03", amount: 2175.75, count: 9 },
  ],
  reviewQueue: [
    {
      receiptId: "rcpt-104",
      vendor: "Metro Medical",
      category: "Medical",
      totalAmount: "88.40",
      reviewStatus: "NEEDS_REVIEW",
      reasons: [
        "Confidence score 78.30 is below threshold 85.00.",
        "No line items were detected from the receipt.",
      ],
    },
    {
      receiptId: "rcpt-109",
      vendor: "Amazon",
      category: "Retail",
      totalAmount: "241.99",
      reviewStatus: "DUPLICATE",
      reasons: ["Potential duplicate of rcpt-083."],
    },
    {
      receiptId: "rcpt-114",
      vendor: "Unknown Vendor",
      category: "Uncategorized",
      totalAmount: "0.00",
      reviewStatus: "NEEDS_REVIEW",
      reasons: [
        "Vendor could not be identified confidently.",
        "Total amount is missing or invalid.",
      ],
    },
  ],
  workflow: [
    {
      step: "01",
      title: "Smart Intake",
      description:
        "Receipts are uploaded to Amazon S3 with uploader metadata for downstream ownership and alerts.",
    },
    {
      step: "02",
      title: "AI Extraction",
      description: "Lambda uses Textract AnalyzeExpense to capture totals, vendor, date, and line items.",
    },
    {
      step: "03",
      title: "Quality Gates",
      description:
        "Confidence thresholds, duplicate keys, and missing-field checks assign auto-approve or review states.",
    },
    {
      step: "04",
      title: "Ops Storage",
      description:
        "DynamoDB stores analytics-ready receipt records for dashboards, export workflows, and review actions.",
    },
    {
      step: "05",
      title: "Action Layer",
      description: "API endpoints and exports turn the pipeline into an operator-facing product surface.",
    },
  ],
  heroHeadline:
    "Low-confidence and duplicate receipts are intercepted before they distort finance reporting.",
  receipts: [
    {
      receiptId: "rcpt-118",
      vendor: "SkyRoute Travels",
      category: "Travel",
      reviewStatus: "AUTO_APPROVED",
      totalAmount: "384.50",
      confidenceScore: "96.2",
      expenseMonth: "2026-03",
      uploadedBy: "finance@receiptpulse.dev",
    },
    {
      receiptId: "rcpt-117",
      vendor: "Urban Brew Cafe",
      category: "Food & Dining",
      reviewStatus: "AUTO_APPROVED",
      totalAmount: "63.20",
      confidenceScore: "94.1",
      expenseMonth: "2026-03",
      uploadedBy: "ops@receiptpulse.dev",
    },
    {
      receiptId: "rcpt-116",
      vendor: "Amazon",
      category: "Retail",
      reviewStatus: "AUTO_APPROVED",
      totalAmount: "241.99",
      confidenceScore: "92.7",
      expenseMonth: "2026-03",
      uploadedBy: "procurement@receiptpulse.dev",
    },
    {
      receiptId: "rcpt-115",
      vendor: "OfficeVerse",
      category: "Office Supplies",
      reviewStatus: "AUTO_APPROVED",
      totalAmount: "126.75",
      confidenceScore: "90.3",
      expenseMonth: "2026-03",
      uploadedBy: "ops@receiptpulse.dev",
    },
    {
      receiptId: "rcpt-114",
      vendor: "Unknown Vendor",
      category: "Uncategorized",
      reviewStatus: "NEEDS_REVIEW",
      totalAmount: "0.00",
      confidenceScore: "71.1",
      expenseMonth: "2026-03",
      uploadedBy: "finance@receiptpulse.dev",
    },
    {
      receiptId: "rcpt-113",
      vendor: "Mellu Trading Pty Ltd",
      category: "Retail",
      reviewStatus: "AUTO_APPROVED",
      totalAmount: "322.37",
      confidenceScore: "93.9",
      expenseMonth: "2026-03",
      uploadedBy: "ops@receiptpulse.dev",
    },
    {
      receiptId: "rcpt-112",
      vendor: "Cloud Telecom",
      category: "Utilities",
      reviewStatus: "AUTO_APPROVED",
      totalAmount: "178.80",
      confidenceScore: "95.0",
      expenseMonth: "2026-03",
      uploadedBy: "infra@receiptpulse.dev",
    },
    {
      receiptId: "rcpt-111",
      vendor: "CityCab",
      category: "Travel",
      reviewStatus: "AUTO_APPROVED",
      totalAmount: "58.45",
      confidenceScore: "93.0",
      expenseMonth: "2026-03",
      uploadedBy: "ops@receiptpulse.dev",
    },
    {
      receiptId: "rcpt-110",
      vendor: "Metro Medical",
      category: "Medical",
      reviewStatus: "NEEDS_REVIEW",
      totalAmount: "88.40",
      confidenceScore: "78.3",
      expenseMonth: "2026-03",
      uploadedBy: "hr@receiptpulse.dev",
    },
    {
      receiptId: "rcpt-109",
      vendor: "Amazon",
      category: "Retail",
      reviewStatus: "DUPLICATE",
      totalAmount: "241.99",
      confidenceScore: "91.2",
      expenseMonth: "2026-02",
      uploadedBy: "procurement@receiptpulse.dev",
    },
    {
      receiptId: "rcpt-108",
      vendor: "Urban Brew Cafe",
      category: "Food & Dining",
      reviewStatus: "AUTO_APPROVED",
      totalAmount: "49.60",
      confidenceScore: "96.4",
      expenseMonth: "2026-02",
      uploadedBy: "marketing@receiptpulse.dev",
    },
    {
      receiptId: "rcpt-107",
      vendor: "SkyRoute Travels",
      category: "Travel",
      reviewStatus: "AUTO_APPROVED",
      totalAmount: "399.65",
      confidenceScore: "95.7",
      expenseMonth: "2026-02",
      uploadedBy: "finance@receiptpulse.dev",
    },
  ],
};

const elements = {
  cursorOrb: document.querySelector("#cursorOrb"),
  cursorRing: document.querySelector("#cursorRing"),
  metricsGrid: document.querySelector("#metricsGrid"),
  categoryChart: document.querySelector("#categoryChart"),
  vendorList: document.querySelector("#vendorList"),
  workflowTrack: document.querySelector("#workflowTrack"),
  queueList: document.querySelector("#queueList"),
  trendBars: document.querySelector("#trendBars"),
  receiptsBody: document.querySelector("#receiptsBody"),
  filterRow: document.querySelector("#filterRow"),
  modeBadge: document.querySelector("#modeBadge"),
  statusNote: document.querySelector("#statusNote"),
  riskHeadline: document.querySelector("#riskHeadline"),
  opsStrip: document.querySelector("#opsStrip"),
  spotlightKicker: document.querySelector("#spotlightKicker"),
  spotlightTitle: document.querySelector("#spotlightTitle"),
  spotlightNarrative: document.querySelector("#spotlightNarrative"),
  spotlightFacts: document.querySelector("#spotlightFacts"),
  flipGrid: document.querySelector("#flipGrid"),
  uploadForm: document.querySelector("#uploadForm"),
  fileInput: document.querySelector("#fileInput"),
  dropzone: document.querySelector("#dropzone"),
  fileMeta: document.querySelector("#fileMeta"),
  uploadName: document.querySelector("#uploadName"),
  uploadEmail: document.querySelector("#uploadEmail"),
  uploadSubmit: document.querySelector("#uploadSubmit"),
  uploadTimeline: document.querySelector("#uploadTimeline"),
  uploadMessage: document.querySelector("#uploadMessage"),
};

let dashboardData = null;
let activeFilter = "ALL";
let apiBase = "";
let uploadState = {
  phase: "idle",
  stage: "slot",
  message: "Select a receipt and trigger the pipeline.",
  objectKey: "",
  receipt: null,
  startedAt: 0,
  durationMs: null,
};

function cloneDashboardState(source) {
  return JSON.parse(JSON.stringify(source));
}

async function loadDashboard() {
  apiBase =
    new URLSearchParams(window.location.search).get("api") ||
    window.RECEIPTPULSE_CONFIG?.apiBaseUrl ||
    "";
  dashboardData = cloneDashboardState(FALLBACK_DASHBOARD);
  renderDashboard();

  if (apiBase) {
    elements.modeBadge.textContent = "Syncing";
    elements.statusNote.textContent =
      "Console is ready. Pulling live AWS data in the background.";

    try {
      await refreshLiveSnapshot();
      elements.modeBadge.textContent = "Live API";
      elements.statusNote.textContent = "Connected to live AWS receipt data.";
      return;
    } catch (error) {
      console.error("Live API mode failed, falling back to demo data.", error);
      elements.modeBadge.textContent = "Instant Preview";
      elements.statusNote.textContent =
        "Live API is warming up, so the console is staying on its built-in preview state.";
      return;
    }
  }

  elements.modeBadge.textContent = "Demo Dataset";
  elements.statusNote.textContent =
    "Live API is not configured yet, so the console is running from its built-in preview state.";
}

function mapReceipt(receipt) {
  return {
    receiptId: receipt.receiptId || receipt.receipt_id || "receipt",
    vendor: receipt.vendor || "Unknown Vendor",
    category: receipt.category || "Uncategorized",
    reviewStatus: receipt.reviewStatus || receipt.review_status || "UNKNOWN",
    totalAmount: receipt.totalAmount || receipt.total_amount || "0.00",
    confidenceScore: receipt.confidenceScore || receipt.confidence_score || "0.00",
    expenseMonth: receipt.expenseMonth || receipt.expense_month || "--",
    uploadedBy: receipt.uploadedBy || receipt.uploaded_by || "ops@receiptpulse.dev",
    fileName: receipt.fileName || receipt.file_name || "receipt",
    objectKey: receipt.objectKey || receipt.key || "",
    currencySymbol: receipt.currencySymbol || receipt.currency_symbol || "$",
    itemCount: Number(receipt.itemCount || receipt.item_count || 0),
    duplicateOf: receipt.duplicateOf || receipt.duplicate_of || "",
    reviewReasons: receipt.reviewReasons || receipt.review_reasons || [],
  };
}

function adaptApiPayload(analytics, receipts) {
  return {
    generatedAt: analytics.generatedAt || new Date().toISOString(),
    summary: analytics.summary || {
      receiptCount: 0,
      totalSpend: 0,
      averageConfidence: 0,
      duplicateCount: 0,
      needsReviewCount: 0,
      autoApprovedCount: 0,
    },
    categoryBreakdown: (analytics.categoryBreakdown || []).map((item) => ({
      label: item.label,
      amount: item.amount,
      share: item.share,
    })),
    topVendors: (analytics.topVendors || []).map((item) => ({
      vendor: item.vendor,
      amount: item.amount,
      share: item.share,
    })),
    monthlyTrend: analytics.monthlyTrend || [],
    reviewQueue: (analytics.reviewQueue || []).map((receipt) => ({
      receiptId: receipt.receiptId || receipt.receipt_id || "receipt",
      vendor: receipt.vendor || "Unknown Vendor",
      category: receipt.category || "Uncategorized",
      totalAmount: receipt.totalAmount || receipt.total_amount || "0.00",
      reviewStatus: receipt.reviewStatus || receipt.review_status || "UNKNOWN",
      reasons: receipt.reasons || [],
    })),
    receipts: receipts.map(mapReceipt),
    workflow: [
      {
        step: "01",
        title: "Intake",
        description: "Receipts land in S3 and metadata captures uploader ownership.",
      },
      {
        step: "02",
        title: "Extraction",
        description: "Textract AnalyzeExpense parses totals, vendor, dates, and line items.",
      },
      {
        step: "03",
        title: "Quality Gate",
        description: "Confidence scoring and duplicate detection assign review status.",
      },
      {
        step: "04",
        title: "Persistence",
        description: "Structured records are stored in DynamoDB with analytics-ready fields.",
      },
      {
        step: "05",
        title: "Ops Layer",
        description: "API endpoints power dashboards, exports, and review updates.",
      },
    ],
    heroHeadline:
      "Low-confidence or duplicate receipts are surfaced before they become accounting noise.",
  };
}

function adaptSnapshotPayload(snapshot) {
  const adapted = adaptApiPayload(snapshot.analytics || {}, snapshot.receipts || []);
  adapted.generatedAt = snapshot.generatedAt || new Date().toISOString();
  return adapted;
}

function renderDashboard() {
  renderOpsStrip();
  renderUploadTimeline();
  renderSpotlight();
  renderFlipCards();
  renderMetrics();
  renderCategoryChart();
  renderVendors();
  renderWorkflow();
  renderQueue();
  renderTrend();
  renderFilters();
  renderReceipts();
  elements.riskHeadline.textContent = dashboardData.heroHeadline;
  bindInteractiveFX();
}

function renderOpsStrip() {
  if (!elements.opsStrip) {
    return;
  }

  const summary = dashboardData.summary || {};
  const total = Math.max(Number(summary.receiptCount || 0), 1);
  const cards = [
    {
      label: "Auto-approval rate",
      value: `${Math.round((Number(summary.autoApprovedCount || 0) / total) * 100)}%`,
      detail: `${summary.autoApprovedCount || 0} receipts cleared the pipeline automatically.`,
    },
    {
      label: "Review pressure",
      value: `${Math.round((Number(summary.needsReviewCount || 0) / total) * 100)}%`,
      detail: `${summary.needsReviewCount || 0} receipts need manual attention.`,
    },
    {
      label: "Duplicate guard",
      value: `${summary.duplicateCount || 0}`,
      detail: "Potential repeats were caught before they affected reporting.",
    },
    {
      label: "Snapshot freshness",
      value: formatFreshness(dashboardData.generatedAt),
      detail: "How fresh the visible live data is right now.",
    },
    {
      label: "Last pipeline cycle",
      value: formatProcessingDuration(uploadState.durationMs),
      detail:
        uploadState.phase === "success"
          ? "Measured from secure upload to the receipt appearing in the console."
          : "Duration appears after the next live receipt is processed end to end.",
    },
    {
      label: "Upload desk",
      value: formatUploadPhase(uploadState.phase),
      detail: uploadState.message,
    },
  ];

  elements.opsStrip.innerHTML = cards
    .map(
      (card) => `
        <article class="panel ops-card">
          <p class="eyebrow">${card.label}</p>
          <strong>${card.value}</strong>
          <span>${card.detail}</span>
        </article>
      `
    )
    .join("");
}

function renderUploadTimeline() {
  if (!elements.uploadTimeline) {
    return;
  }

  const steps = [
    ["slot", "Secure Upload Slot", "Create a signed S3 upload session."],
    ["transfer", "S3 Intake Transfer", "Move the file into the intake bucket."],
    ["textract", "AI Extraction", "Read vendor, total, date, and line items."],
    ["quality", "Quality Rules", "Run confidence checks and duplicate detection."],
    ["stored", "Stored In Console", "Show the processed receipt in the live dashboard."],
  ];
  const order = steps.map((step) => step[0]);
  const activeIndex =
    uploadState.phase === "idle"
      ? -1
      : uploadState.phase === "success"
        ? order.length - 1
        : Math.max(order.indexOf(uploadState.stage || "slot"), 0);

  elements.uploadTimeline.innerHTML = steps
    .map(([id, title, detail], index) => {
      let tone = "pending";
      if (index < activeIndex || uploadState.phase === "success") {
        tone = "done";
      } else if (index === activeIndex && uploadState.phase !== "idle") {
        tone = uploadState.phase === "error" ? "error" : "active";
      }

      return `
        <article class="timeline-step timeline-${tone}">
          <span class="timeline-dot">${index + 1}</span>
          <div>
            <strong>${title}</strong>
            <p>${detail}</p>
          </div>
        </article>
      `;
    })
    .join("");

  elements.uploadMessage.textContent = uploadState.message;
  if (elements.uploadSubmit) {
    const busy = ["preparing", "uploading", "processing"].includes(uploadState.phase);
    elements.uploadSubmit.disabled = busy;
    elements.uploadSubmit.textContent = busy ? "Processing Receipt..." : "Upload And Process";
  }
}

function renderSpotlight() {
  if (!elements.spotlightTitle) {
    return;
  }

  const receipt = uploadState.receipt || dashboardData.receipts[0];
  if (!receipt) {
    elements.spotlightKicker.textContent = "Latest extraction";
    elements.spotlightTitle.textContent = "Waiting for a processed receipt.";
    elements.spotlightNarrative.textContent =
      "Upload a receipt to watch the extracted result and routing decision appear here.";
    elements.spotlightFacts.innerHTML = "";
    return;
  }

  elements.spotlightKicker.textContent = uploadState.receipt
    ? "Freshly processed upload"
    : "Most recent live receipt";
  elements.spotlightTitle.textContent = `${receipt.vendor} - ${formatLabel(receipt.reviewStatus)}`;
  elements.spotlightNarrative.textContent = buildSpotlightNarrative(receipt);

  const facts = [
    ["Total", `${receipt.currencySymbol || "$"}${Number(receipt.totalAmount || 0).toFixed(2)}`],
    ["Confidence", `${Number(receipt.confidenceScore || 0).toFixed(1)}%`],
    ["Category", receipt.category],
    ["Month", receipt.expenseMonth],
    ["Items", `${receipt.itemCount || 0}`],
    ["Process Time", formatProcessingDuration(uploadState.durationMs)],
    ["Operator", receipt.uploadedBy || "ops@receiptpulse.dev"],
    ["File", receipt.fileName || "receipt"],
    ["Duplicate Of", receipt.duplicateOf || "No prior match"],
  ];

  elements.spotlightFacts.innerHTML = facts
    .map(
      ([label, value]) => `
        <article class="spotlight-stat">
          <span>${label}</span>
          <strong>${value}</strong>
        </article>
      `
    )
    .join("");
}

function renderFlipCards() {
  if (!elements.flipGrid) {
    return;
  }

  elements.flipGrid.innerHTML = HOW_IT_WORKS.map(
    (card) => `
      <button class="flip-card" type="button">
        <span class="flip-card-inner">
          <span class="flip-card-face flip-card-front">
            <span class="mini-label">${card.eyebrow}</span>
            <strong>${card.frontTitle}</strong>
            <p>${card.frontBody}</p>
            <span class="flip-cta">Click to flip</span>
          </span>
          <span class="flip-card-face flip-card-back">
            <span class="mini-label">${card.eyebrow}</span>
            <strong>${card.backTitle}</strong>
            <p>${card.backBody}</p>
            <span class="flip-cta">Tap again to return</span>
          </span>
        </span>
      </button>
    `
  ).join("");

  elements.flipGrid.querySelectorAll(".flip-card").forEach((card) => {
    if (card.dataset.bound === "true") {
      return;
    }
    card.dataset.bound = "true";
    card.addEventListener("click", () => {
      card.classList.toggle("is-flipped");
    });
  });
}

function renderMetrics() {
  const metrics = [
    {
      label: "Receipts Processed",
      value: dashboardData.summary.receiptCount,
      suffix: "",
    },
    {
      label: "Total Spend Mapped",
      value: dashboardData.summary.totalSpend,
      prefix: "$",
      decimals: 2,
    },
    {
      label: "Average Confidence",
      value: dashboardData.summary.averageConfidence,
      suffix: "%",
      decimals: 1,
    },
    {
      label: "Auto Approved",
      value: dashboardData.summary.autoApprovedCount,
      suffix: "",
    },
    {
      label: "Needs Review",
      value: dashboardData.summary.needsReviewCount,
      suffix: "",
    },
    {
      label: "Duplicate Signals",
      value: dashboardData.summary.duplicateCount,
      suffix: "",
    },
  ];

  elements.metricsGrid.innerHTML = metrics
    .map(
      (metric) => `
        <article class="panel metric-card">
          <p class="eyebrow">${metric.label}</p>
          <strong data-counter="${metric.value}" data-prefix="${metric.prefix || ""}" data-suffix="${metric.suffix || ""}" data-decimals="${metric.decimals || 0}">
            ${metric.prefix || ""}0${metric.suffix || ""}
          </strong>
          <span>${metricDescription(metric.label)}</span>
        </article>
      `
    )
    .join("");

  animateCounters();
}

function renderCategoryChart() {
  if (!dashboardData.categoryBreakdown.length) {
    elements.categoryChart.innerHTML =
      '<p class="muted">No category data is available yet.</p>';
    return;
  }

  const maxAmount = Math.max(...dashboardData.categoryBreakdown.map((item) => item.amount), 1);
  elements.categoryChart.innerHTML = dashboardData.categoryBreakdown
    .map(
      (item) => `
        <div class="chart-row">
          <div class="chart-meta">
            <strong>${item.label}</strong>
            <span class="muted">$${Number(item.amount).toFixed(2)} - ${item.share}%</span>
          </div>
          <div class="bar-track">
            <div class="bar-fill" style="width:${(item.amount / maxAmount) * 100}%"></div>
          </div>
        </div>
      `
    )
    .join("");
}

function renderVendors() {
  if (!dashboardData.topVendors.length) {
    elements.vendorList.innerHTML =
      '<p class="muted">Vendor concentration appears once receipts are processed.</p>';
    return;
  }

  elements.vendorList.innerHTML = dashboardData.topVendors
    .map(
      (vendor) => `
        <div class="vendor-row">
          <div class="vendor-meta">
            <strong>${vendor.vendor}</strong>
            <span class="vendor-share">${vendor.share}% of spend</span>
          </div>
          <div class="bar-track">
            <div class="bar-fill" style="width:${vendor.share}%"></div>
          </div>
          <span class="muted">$${Number(vendor.amount).toFixed(2)}</span>
        </div>
      `
    )
    .join("");
}

function renderWorkflow() {
  elements.workflowTrack.innerHTML = dashboardData.workflow
    .map(
      (node) => `
        <article class="workflow-node">
          <span class="workflow-step">${node.step}</span>
          <h4>${node.title}</h4>
          <p>${node.description}</p>
        </article>
      `
    )
    .join("");
}

function renderQueue() {
  if (!dashboardData.reviewQueue.length) {
    elements.queueList.innerHTML = '<p class="muted">No receipts are waiting for review.</p>';
    return;
  }

  elements.queueList.innerHTML = dashboardData.reviewQueue
    .map(
      (receipt) => `
        <article class="queue-item">
          <div class="queue-header">
            <strong>${receipt.vendor}</strong>
            <span class="status-tag status-${receipt.reviewStatus.toLowerCase().replace(/_/g, "-")}">${formatLabel(receipt.reviewStatus)}</span>
          </div>
          <div class="receipt-line">
            <span>${receipt.category}</span>
            <span>$${Number(receipt.totalAmount).toFixed(2)}</span>
          </div>
          <ul class="reason-list">
            ${receipt.reasons.map((reason) => `<li>${reason}</li>`).join("")}
          </ul>
        </article>
      `
    )
    .join("");
}

function renderTrend() {
  if (!dashboardData.monthlyTrend.length) {
    elements.trendBars.innerHTML =
      '<p class="muted">Monthly throughput appears once receipts reach storage.</p>';
    return;
  }

  const maxAmount = Math.max(...dashboardData.monthlyTrend.map((item) => item.amount), 1);
  elements.trendBars.innerHTML = dashboardData.monthlyTrend
    .map(
      (item) => `
        <div class="trend-bar">
          <div class="trend-meta">
            <strong>${item.month}</strong>
            <span class="muted">$${Number(item.amount).toFixed(2)} - ${item.count} receipts</span>
          </div>
          <div class="trend-track">
            <div class="trend-fill" style="width:${(item.amount / maxAmount) * 100}%"></div>
          </div>
        </div>
      `
    )
    .join("");
}

function renderFilters() {
  elements.filterRow.innerHTML = FILTERS.map(
    (filter) => `
      <button type="button" class="filter-chip ${filter === activeFilter ? "active" : ""}" data-filter="${filter}">
        ${formatLabel(filter)}
      </button>
    `
  ).join("");

  elements.filterRow.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter;
      renderFilters();
      renderReceipts();
    });
  });
}

function renderReceipts() {
  const rows = dashboardData.receipts.filter((receipt) =>
    activeFilter === "ALL" ? true : receipt.reviewStatus === activeFilter
  );

  if (!rows.length) {
    elements.receiptsBody.innerHTML =
      '<tr><td colspan="7" class="muted receipt-empty">No receipts match this filter.</td></tr>';
    return;
  }

  const latestId = uploadState.receipt?.receiptId || "";

  elements.receiptsBody.innerHTML = rows
    .map(
      (receipt) => `
        <tr class="${receipt.receiptId === latestId ? "receipt-highlight-row" : ""}">
          <td>
            <div class="receipt-stack">
              <strong>${receipt.receiptId}</strong>
              <span class="muted">${receipt.fileName || receipt.uploadedBy || "ops@receiptpulse.dev"}</span>
            </div>
          </td>
          <td>${receipt.vendor}</td>
          <td>${receipt.category}</td>
          <td>
            <span class="status-tag status-${receipt.reviewStatus.toLowerCase().replace(/_/g, "-")}">
              ${formatLabel(receipt.reviewStatus)}
            </span>
          </td>
          <td>${receipt.currencySymbol || "$"}${Number(receipt.totalAmount).toFixed(2)}</td>
          <td>${Number(receipt.confidenceScore).toFixed(1)}%</td>
          <td>${receipt.expenseMonth}</td>
        </tr>
      `
    )
    .join("");
}

function animateCounters() {
  const counters = document.querySelectorAll("[data-counter]");
  counters.forEach((counter) => {
    const target = Number(counter.dataset.counter);
    const prefix = counter.dataset.prefix || "";
    const suffix = counter.dataset.suffix || "";
    const decimals = Number(counter.dataset.decimals || 0);
    const duration = 900;
    const start = performance.now();

    const update = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      const current = target * eased;
      counter.textContent = `${prefix}${current.toFixed(decimals)}${suffix}`;
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };

    requestAnimationFrame(update);
  });
}

function metricDescription(label) {
  switch (label) {
    case "Receipts Processed":
      return "Multi-file ingestion with analytics-ready enrichment fields.";
    case "Total Spend Mapped":
      return "Structured totals available for exports and dashboards.";
    case "Average Confidence":
      return "Textract-derived score used for review routing.";
    case "Auto Approved":
      return "Receipts that cleared the rule engine without manual review.";
    case "Needs Review":
      return "Receipts flagged for low confidence or missing key data.";
    case "Duplicate Signals":
      return "Potential repeats detected before finance books them twice.";
    default:
      return "";
  }
}

function buildSpotlightNarrative(receipt) {
  const reasons = receipt.reviewReasons?.length
    ? ` Review reasons: ${receipt.reviewReasons.join(" ")}`
    : "";
  return `${receipt.vendor} was classified as ${receipt.category} with a ${Number(
    receipt.confidenceScore || 0
  ).toFixed(1)}% confidence score and routed to ${formatLabel(
    receipt.reviewStatus
  ).toLowerCase()}.${reasons}`;
}

function formatLabel(value) {
  return String(value || "")
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatUploadPhase(phase) {
  if (phase === "preparing") return "Securing";
  if (phase === "uploading") return "Uploading";
  if (phase === "processing") return "Processing";
  if (phase === "success") return "Complete";
  if (phase === "error") return "Needs Retry";
  return "Ready";
}

function formatFreshness(isoString) {
  const stamp = new Date(isoString).getTime();
  if (!stamp) {
    return "Unknown";
  }

  const diffMinutes = Math.max(0, Math.round((Date.now() - stamp) / 60000));
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes === 1) return "1 minute ago";
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
  return `${Math.round(diffMinutes / 60)} hours ago`;
}

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatProcessingDuration(durationMs) {
  if (!durationMs || durationMs < 1) {
    return "Pending";
  }

  if (durationMs < 1000) {
    return `${Math.round(durationMs)} ms`;
  }

  return `${(durationMs / 1000).toFixed(1)} s`;
}

function guessContentType(file) {
  if (file.type) return file.type;
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf")) return "application/pdf";
  if (name.endsWith(".png")) return "image/png";
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";
  return "application/octet-stream";
}

function isSupportedFile(file) {
  return ["application/pdf", "image/png", "image/jpeg"].includes(guessContentType(file));
}

function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function bindInteractiveFX() {
  bindGlowTargets();
  observeRevealTargets();
}

function bindGlowTargets() {
  document
    .querySelectorAll(
      ".panel, .glass-card, .vendor-row, .queue-item, .workflow-node, .metric-card, .ops-card, .spotlight-stat, .flip-card, .timeline-step, .dropzone"
    )
    .forEach((element) => {
      if (element.dataset.fxBound === "true") {
        return;
      }

      element.dataset.fxBound = "true";

      element.addEventListener("pointermove", (event) => {
        const bounds = element.getBoundingClientRect();
        const glowX = ((event.clientX - bounds.left) / bounds.width) * 100;
        const glowY = ((event.clientY - bounds.top) / bounds.height) * 100;
        element.style.setProperty("--glow-x", `${glowX}%`);
        element.style.setProperty("--glow-y", `${glowY}%`);
      });

      element.addEventListener("pointerenter", () => {
        element.classList.add("is-hovered");
        document.body.classList.add("cursor-hover");
      });

      element.addEventListener("pointerleave", () => {
        element.classList.remove("is-hovered");
        document.body.classList.remove("cursor-hover");
      });
    });
}

function observeRevealTargets() {
  const targets = document.querySelectorAll(
    ".panel, .glass-card, .vendor-row, .queue-item, .workflow-node, .metric-card, .ops-card, .spotlight-stat, .flip-card, .timeline-step"
  );

  targets.forEach((target) => {
    target.classList.remove("reveal-ready");
    target.classList.add("is-visible");
  });
}

function bindUploadControls() {
  if (!elements.uploadForm || elements.uploadForm.dataset.bound === "true") {
    return;
  }

  elements.uploadForm.dataset.bound = "true";

  elements.fileInput.addEventListener("change", () => {
    const file = elements.fileInput.files[0] || null;
    elements.fileMeta.textContent = file
      ? `${file.name} - ${formatFileSize(file.size)} - ready for upload`
      : "No receipt selected yet.";
  });

  elements.uploadForm.addEventListener("submit", handleUpload);

  ["dragenter", "dragover"].forEach((eventName) => {
    elements.dropzone.addEventListener(eventName, (event) => {
      event.preventDefault();
      elements.dropzone.classList.add("is-dragging");
    });
  });

  ["dragleave", "drop"].forEach((eventName) => {
    elements.dropzone.addEventListener(eventName, (event) => {
      event.preventDefault();
      elements.dropzone.classList.remove("is-dragging");
    });
  });

  elements.dropzone.addEventListener("drop", (event) => {
    const file = event.dataTransfer?.files?.[0] || null;
    if (!file) {
      return;
    }

    if (typeof DataTransfer !== "undefined") {
      const transfer = new DataTransfer();
      transfer.items.add(file);
      elements.fileInput.files = transfer.files;
    }

    elements.fileMeta.textContent = `${file.name} - ${formatFileSize(file.size)} - ready for upload`;
  });
}

async function handleUpload(event) {
  event.preventDefault();

  if (!apiBase) {
    setUploadState("error", "slot", "Live API is not configured, so uploads cannot run here.");
    return;
  }

  const file = elements.fileInput.files[0];
  if (!file) {
    setUploadState("error", "slot", "Choose a receipt file first.");
    return;
  }

  if (!isSupportedFile(file)) {
    setUploadState("error", "slot", "Use a PDF, PNG, JPG, or JPEG receipt.");
    return;
  }

  const uploaderName = elements.uploadName.value.trim() || "Finance Desk";
  const uploaderEmail = elements.uploadEmail.value.trim() || "ops@receiptpulse.dev";

  try {
    uploadState = {
      ...uploadState,
      objectKey: "",
      receipt: null,
      startedAt: Date.now(),
      durationMs: null,
    };
    setUploadState("preparing", "slot", "Requesting a secure upload slot from the API.");

    const session = await requestUploadSession(file, uploaderName, uploaderEmail);
    uploadState.objectKey = session.objectKey;

    setUploadState("uploading", "transfer", "Uploading the receipt into the S3 intake bucket.");
    await uploadToS3(session, file);

    setUploadState("processing", "textract", "Receipt uploaded. AI extraction is running.");
    const processedReceipt = await pollUntilProcessed(
      session.objectKey,
      session.pollAfterMs || POLL_INTERVAL_MS
    );

    uploadState.receipt = processedReceipt;
    uploadState.durationMs = Math.max(0, Date.now() - uploadState.startedAt);
    setUploadState("success", "stored", "Receipt processed and added to the console.");
    await refreshLiveSnapshot();
  } catch (error) {
    console.error("Upload failed.", error);
    setUploadState("error", uploadState.stage || "transfer", error.message || "Upload failed.");
  }
}

async function requestUploadSession(file, uploaderName, uploaderEmail) {
  const response = await fetch(`${apiBase.replace(/\/$/, "")}/uploads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileName: file.name,
      contentType: guessContentType(file),
      uploaderName,
      uploaderEmail,
    }),
  });

  if (!response.ok) {
    throw new Error(`Unable to create upload session (${response.status}).`);
  }

  return response.json();
}

async function uploadToS3(session, file) {
  const headers = new Headers();
  Object.entries(session.headers || {}).forEach(([key, value]) => headers.set(key, value));
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", guessContentType(file));
  }

  const response = await fetch(session.uploadUrl, {
    method: "PUT",
    headers,
    body: file,
  });

  if (!response.ok) {
    throw new Error(`Upload to S3 failed (${response.status}).`);
  }
}

async function pollUntilProcessed(objectKey, firstDelay) {
  let lastMessage = "Receipt is still processing.";

  for (let attempt = 1; attempt <= MAX_POLL_ATTEMPTS; attempt += 1) {
    await sleep(attempt === 1 ? firstDelay : POLL_INTERVAL_MS);

    const response = await fetch(
      `${apiBase.replace(/\/$/, "")}/uploads/status?key=${encodeURIComponent(objectKey)}`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      throw new Error(`Status polling failed (${response.status}).`);
    }

    const payload = await response.json();
    lastMessage = payload.message || lastMessage;

    if (payload.status === "PROCESSED" && payload.receipt) {
      return mapReceipt(payload.receipt);
    }

    const stage = payload.stage === "stored" ? "quality" : payload.stage || "textract";
    setUploadState("processing", stage, lastMessage);
  }

  throw new Error(lastMessage);
}

async function refreshLiveSnapshot() {
  const snapshotResponse = await fetch(`${apiBase.replace(/\/$/, "")}/snapshot`, {
    cache: "no-store",
  });
  if (!snapshotResponse.ok) {
    throw new Error(`Snapshot request failed with status ${snapshotResponse.status}`);
  }

  const snapshotPayload = await snapshotResponse.json();
  dashboardData = adaptSnapshotPayload(snapshotPayload);

  if (uploadState.receipt?.objectKey) {
    const matched = dashboardData.receipts.find(
      (receipt) => receipt.objectKey === uploadState.receipt.objectKey
    );
    if (matched) {
      uploadState.receipt = matched;
    }
  }

  renderDashboard();
}

function setUploadState(phase, stage, message) {
  uploadState = {
    ...uploadState,
    phase,
    stage,
    message,
  };
  renderOpsStrip();
  renderUploadTimeline();
  renderSpotlight();
}

function initCursorFX() {
  if (!window.matchMedia("(pointer:fine)").matches) {
    return;
  }

  const { cursorOrb, cursorRing } = elements;
  if (!cursorOrb || !cursorRing) {
    return;
  }

  document.body.classList.add("cursor-active");

  let pointerX = window.innerWidth / 2;
  let pointerY = window.innerHeight / 2;
  let ringX = pointerX;
  let ringY = pointerY;

  document.addEventListener("pointermove", (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
    cursorOrb.style.transform = `translate(${pointerX}px, ${pointerY}px)`;
  });

  document.addEventListener("pointerdown", () => {
    document.body.classList.add("cursor-hover");
  });

  document.addEventListener("pointerup", () => {
    document.body.classList.remove("cursor-hover");
  });

  const tick = () => {
    ringX += (pointerX - ringX) * 0.18;
    ringY += (pointerY - ringY) * 0.18;
    cursorRing.style.transform = `translate(${ringX}px, ${ringY}px)`;
    requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}

bindUploadControls();
initCursorFX();
loadDashboard().catch((error) => {
  console.error("Unable to load dashboard.", error);
});
