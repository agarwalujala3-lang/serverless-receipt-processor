const FILTERS = ["ALL", "AUTO_APPROVED", "NEEDS_REVIEW", "DUPLICATE"];
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
};

let dashboardData = null;
let activeFilter = "ALL";

function cloneDashboardState(source) {
  return JSON.parse(JSON.stringify(source));
}

async function loadDashboard() {
  const apiBase =
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
      const snapshotResponse = await fetch(`${apiBase.replace(/\/$/, "")}/snapshot`, {
        cache: "no-store",
      });
      if (!snapshotResponse.ok) {
        throw new Error(`Snapshot request failed with status ${snapshotResponse.status}`);
      }
      const snapshotPayload = await snapshotResponse.json();
      dashboardData = adaptSnapshotPayload(snapshotPayload);
      elements.modeBadge.textContent = "Live API";
      elements.statusNote.textContent = "Connected to live AWS receipt data.";
      renderDashboard();
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

function adaptApiPayload(analytics, receipts) {
  return {
    summary: analytics.summary,
    categoryBreakdown: analytics.categoryBreakdown.map((item) => ({
      label: item.label,
      amount: item.amount,
      share: item.share,
    })),
    topVendors: analytics.topVendors.map((item) => ({
      vendor: item.vendor,
      amount: item.amount,
      share: item.share,
    })),
    monthlyTrend: analytics.monthlyTrend,
    reviewQueue: analytics.reviewQueue,
    receipts: receipts.map((receipt) => ({
      receiptId: receipt.receipt_id,
      vendor: receipt.vendor,
      category: receipt.category,
      reviewStatus: receipt.review_status,
      totalAmount: receipt.total_amount,
      confidenceScore: receipt.confidence_score,
      expenseMonth: receipt.expense_month,
      uploadedBy: receipt.uploaded_by,
    })),
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
  return adaptApiPayload(snapshot.analytics || {}, snapshot.receipts || []);
}

function renderDashboard() {
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

  elements.receiptsBody.innerHTML = rows
    .map(
      (receipt) => `
        <tr>
          <td>
            <div class="receipt-line">
              <strong>${receipt.receiptId}</strong>
              <span class="muted">${receipt.uploadedBy || "ops@receiptpulse.dev"}</span>
            </div>
          </td>
          <td>${receipt.vendor}</td>
          <td>${receipt.category}</td>
          <td>
            <span class="status-tag status-${receipt.reviewStatus.toLowerCase().replace(/_/g, "-")}">
              ${formatLabel(receipt.reviewStatus)}
            </span>
          </td>
          <td>$${Number(receipt.totalAmount).toFixed(2)}</td>
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
    case "Needs Review":
      return "Receipts flagged for low confidence or missing key data.";
    case "Duplicate Signals":
      return "Potential repeats detected before finance books them twice.";
    default:
      return "";
  }
}

function formatLabel(value) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function bindInteractiveFX() {
  bindGlowTargets();
  observeRevealTargets();
}

function bindGlowTargets() {
  document
    .querySelectorAll(".panel, .glass-card, .vendor-row, .queue-item, .workflow-node, .metric-card")
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
    ".panel, .glass-card, .vendor-row, .queue-item, .workflow-node, .metric-card"
  );

  targets.forEach((target) => {
    target.classList.remove("reveal-ready");
    target.classList.add("is-visible");
  });
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

initCursorFX();
loadDashboard().catch((error) => {
  console.error("Unable to load dashboard.", error);
});
