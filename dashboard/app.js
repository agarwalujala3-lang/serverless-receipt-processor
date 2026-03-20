const DATA_URL = "./data/demo-dashboard.json";
const FILTERS = ["ALL", "AUTO_APPROVED", "NEEDS_REVIEW", "DUPLICATE"];

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
let revealObserver = null;

async function loadDashboard() {
  const apiBase =
    new URLSearchParams(window.location.search).get("api") ||
    window.RECEIPTPULSE_CONFIG?.apiBaseUrl ||
    "";

  const demoPromise = fetch(DATA_URL).then((response) => response.json());

  if (apiBase) {
    elements.modeBadge.textContent = "Syncing";
    elements.statusNote.textContent = "Loading dashboard instantly, then replacing it with live AWS data.";

    try {
      dashboardData = await demoPromise;
      renderDashboard();

      const snapshotResponse = await fetch(`${apiBase.replace(/\/$/, "")}/snapshot`);
      const snapshotPayload = await snapshotResponse.json();
      dashboardData = adaptSnapshotPayload(snapshotPayload);
      elements.modeBadge.textContent = "Live API";
      elements.statusNote.textContent = "Connected to live AWS receipt data.";
      renderDashboard();
      return;
    } catch (error) {
      console.error("Live API mode failed, falling back to demo data.", error);
      if (!dashboardData) {
        dashboardData = await demoPromise;
        renderDashboard();
      }
      elements.modeBadge.textContent = "Demo Dataset";
      elements.statusNote.textContent = "Live API was slow or unavailable, so the dashboard stayed on demo data.";
      return;
    }
  }

  dashboardData = await demoPromise;
  elements.modeBadge.textContent = "Demo Dataset";
  elements.statusNote.textContent = "Live API is not configured yet, showing the dashboard demo dataset.";
  renderDashboard();
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
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const targets = document.querySelectorAll(
    ".panel, .glass-card, .vendor-row, .queue-item, .workflow-node, .metric-card"
  );

  if (reduceMotion) {
    targets.forEach((target) => {
      target.classList.remove("reveal-ready");
      target.classList.add("is-visible");
    });
    return;
  }

  if (!revealObserver) {
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 }
    );
  }

  targets.forEach((target) => {
    if (target.dataset.revealBound === "true") {
      return;
    }

    target.dataset.revealBound = "true";
    target.classList.add("reveal-ready");
    revealObserver.observe(target);
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
