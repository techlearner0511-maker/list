const SHOW_CATEGORIES = [
  { id: "kdrama", label: "K-Drama", icon: "✨" },
  { id: "webseries", label: "Web Series", icon: "📺" },
  { id: "movie", label: "Movie", icon: "🎬" },
  { id: "anime", label: "Anime", icon: "🎌" },
  { id: "misc", label: "Misc", icon: "📎" },
];

const TAB_PLACEHOLDER = {
  show: "What are you watching?",
  book: "What book do you want to add?",
};

const catInfo = (id) => SHOW_CATEGORIES.find((c) => c.id === id) || SHOW_CATEGORIES[0];

const form = document.getElementById("add-form");
const nameInput = document.getElementById("name-input");
const categoryInput = document.getElementById("category-input");
const listEl = document.getElementById("item-list");
const emptyState = document.getElementById("empty-state");
const filterPillsEl = document.getElementById("filter-pills");
const warningEl = document.getElementById("storage-warning");
const tabsEl = document.getElementById("tabs");

let items = [];
let activeTab = "show";
let activeFilter = "all";

// --- API calls ---
async function fetchItems() {
  const res = await fetch("/api/items");
  if (!res.ok) throw new Error("Failed to load items");
  return res.json();
}

async function addItem(name, category, type) {
  const res = await fetch("/api/items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, category, type }),
  });
  if (!res.ok) throw new Error("Failed to add item");
  return res.json();
}

async function deleteItem(id) {
  const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
  if (!res.ok && res.status !== 204) throw new Error("Failed to delete item");
}

async function patchItem(id, fields) {
  const res = await fetch(`/api/items/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(fields),
  });
  if (!res.ok) throw new Error("Failed to update item");
  return res.json();
}

async function persistReorder(ids) {
  const res = await fetch("/api/items/reorder", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  });
  if (!res.ok) throw new Error("Failed to reorder items");
}

// --- Rendering ---
function renderCategoryOptions() {
  if (activeTab === "book") {
    categoryInput.classList.add("hidden");
    categoryInput.innerHTML = "";
  } else {
    categoryInput.classList.remove("hidden");
    categoryInput.innerHTML = SHOW_CATEGORIES.map(
      (c) => `<option value="${c.id}">${c.label}</option>`
    ).join("");
  }
}

function renderPills() {
  if (activeTab === "book") {
    filterPillsEl.innerHTML = "";
    filterPillsEl.classList.add("hidden");
    return;
  }
  filterPillsEl.classList.remove("hidden");

  const inTab = items.filter((i) => (i.type || "show") === "show");
  const counts = { all: inTab.length };
  SHOW_CATEGORIES.forEach((c) => {
    counts[c.id] = inTab.filter((i) => i.category === c.id).length;
  });

  const pills = [{ id: "all", label: "All" }, ...SHOW_CATEGORIES];

  filterPillsEl.innerHTML = pills
    .map(
      (c) => `
      <button class="pill ${activeFilter === c.id ? "active" : ""}" data-filter="${c.id}">
        ${c.label} (${counts[c.id]})
      </button>
    `
    )
    .join("");

  filterPillsEl.querySelectorAll(".pill").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeFilter = btn.dataset.filter;
      render();
    });
  });
}

function renderShowList() {
  const inTab = items.filter((i) => (i.type || "show") === "show");
  const visible =
    activeFilter === "all" ? inTab : inTab.filter((i) => i.category === activeFilter);

  if (visible.length === 0) {
    listEl.innerHTML = "";
    emptyState.classList.remove("hidden");
    emptyState.querySelector("p").textContent =
      inTab.length === 0
        ? "Nothing on your watchlist yet. Add your first one above."
        : "Nothing in this category yet.";
    return;
  }

  emptyState.classList.add("hidden");

  listEl.innerHTML = visible
    .map((item) => {
      const info = catInfo(item.category);
      return `
        <li class="item-row" data-id="${item.id}">
          <div class="item-info">
            <div class="item-icon">${info.icon}</div>
            <div class="item-text">
              <div class="item-name">${escapeHtml(item.name)}</div>
              <div class="item-category cat-${info.id}">${info.label}</div>
            </div>
          </div>
          <button class="delete-btn" data-action="delete" aria-label="Delete ${escapeHtml(item.name)}">🗑</button>
        </li>
      `;
    })
    .join("");

  attachShowHandlers();
}

function renderBookList() {
  const inTab = items
    .filter((i) => i.type === "book")
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

  if (inTab.length === 0) {
    listEl.innerHTML = "";
    emptyState.classList.remove("hidden");
    emptyState.querySelector("p").textContent =
      "Your reading list is empty. Add your first book above.";
    return;
  }

  emptyState.classList.add("hidden");

  listEl.innerHTML = inTab
    .map((item, idx) => {
      const purchasedClass = item.purchased ? "purchased" : "";
      const purchasedLabel = item.purchased ? "✓ Purchased" : "Mark purchased";
      return `
        <li class="item-row book-row ${purchasedClass}" data-id="${item.id}">
          <div class="item-info">
            <div class="reorder-btns">
              <button class="order-btn" data-action="up" ${idx === 0 ? "disabled" : ""} aria-label="Move up">▲</button>
              <button class="order-btn" data-action="down" ${idx === inTab.length - 1 ? "disabled" : ""} aria-label="Move down">▼</button>
            </div>
            <div class="item-text">
              <div class="item-name">${escapeHtml(item.name)}</div>
              <button class="purchased-tag" data-action="purchased">${purchasedLabel}</button>
            </div>
          </div>
          <button class="delete-btn read-btn" data-action="read" aria-label="Mark ${escapeHtml(item.name)} as read">✓ Read</button>
        </li>
      `;
    })
    .join("");

  attachBookHandlers(inTab);
}

function attachShowHandlers() {
  listEl.querySelectorAll('[data-action="delete"]').forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.closest(".item-row").dataset.id;
      try {
        await deleteItem(id);
        items = items.filter((i) => i.id !== id);
        render();
      } catch (err) {
        showWarning();
      }
    });
  });
}

function attachBookHandlers(orderedBooks) {
  listEl.querySelectorAll('[data-action="read"]').forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.closest(".item-row").dataset.id;
      try {
        await deleteItem(id);
        items = items.filter((i) => i.id !== id);
        render();
      } catch (err) {
        showWarning();
      }
    });
  });

  listEl.querySelectorAll('[data-action="purchased"]').forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.closest(".item-row").dataset.id;
      const item = items.find((i) => i.id === id);
      const nextPurchased = !item.purchased;
      item.purchased = nextPurchased;
      render();
      try {
        await patchItem(id, { purchased: nextPurchased });
      } catch (err) {
        item.purchased = !nextPurchased;
        render();
        showWarning();
      }
    });
  });

  listEl.querySelectorAll('[data-action="up"], [data-action="down"]').forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.closest(".item-row").dataset.id;
      const dir = e.target.dataset.action;
      const idx = orderedBooks.findIndex((b) => b.id === id);
      const swapIdx = dir === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= orderedBooks.length) return;

      const newOrder = [...orderedBooks];
      [newOrder[idx], newOrder[swapIdx]] = [newOrder[swapIdx], newOrder[idx]];
      newOrder.forEach((b, i) => (b.position = i));
      render();

      try {
        await persistReorder(newOrder.map((b) => b.id));
      } catch (err) {
        showWarning();
      }
    });
  });
}

function renderTabs() {
  tabsEl.querySelectorAll(".tab").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === activeTab);
  });
  nameInput.placeholder = TAB_PLACEHOLDER[activeTab];
}

function render() {
  renderTabs();
  renderCategoryOptions();
  renderPills();
  if (activeTab === "show") {
    renderShowList();
  } else {
    renderBookList();
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function showWarning() {
  warningEl.classList.remove("hidden");
}

// --- Init ---
async function init() {
  try {
    items = await fetchItems();
  } catch (err) {
    items = [];
    showWarning();
  }
  render();
}

tabsEl.querySelectorAll(".tab").forEach((btn) => {
  btn.addEventListener("click", () => {
    activeTab = btn.dataset.tab;
    activeFilter = "all";
    render();
  });
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = nameInput.value.trim();
  if (!name) return;
  const category = activeTab === "show" ? categoryInput.value : "";

  try {
    const newItem = await addItem(name, category, activeTab);
    items.unshift(newItem);
    nameInput.value = "";
    render();
  } catch (err) {
    showWarning();
  }
});

init();
