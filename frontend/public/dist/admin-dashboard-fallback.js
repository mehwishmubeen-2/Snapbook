const root = document.getElementById("root");

const renderCard = (photographer) => {
  const status = photographer.status || "pending";
  const name = photographer.name || photographer.companyName || "Unnamed photographer";
  const email = photographer.email || "No email";
  const description = photographer.bio || photographer.description || photographer.about || "No description provided.";
  const seoTitle = photographer.seoTitle || "";
  const seoDescription = photographer.seoDescription || "";
  const portfolio = Array.isArray(photographer.portfolio) ? photographer.portfolio : [];

  return `
    <div class="admin-card" data-id="${photographer._id}">
      <h2>${name}</h2>
      <p><strong>Status:</strong> ${status}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p>${description}</p>

      <div class="admin-actions">
        <button data-action="approve" data-id="${photographer._id}">Approve</button>
        <button data-action="reject" data-id="${photographer._id}">Reject</button>
        <button data-action="seo" data-id="${photographer._id}">Edit SEO</button>
        <button data-action="portfolio" data-id="${photographer._id}">Edit Portfolio</button>
      </div>

      <div class="admin-secondary">
        <div><strong>SEO title:</strong> ${seoTitle || "<i>empty</i>"}</div>
        <div><strong>SEO description:</strong> ${seoDescription || "<i>empty</i>"}</div>
        <div><strong>Portfolio:</strong> ${portfolio.length ? portfolio.map((item) => `<div>${item}</div>`).join("") : "<i>no items</i>"}</div>
      </div>
    </div>
  `;
};

const showMessage = (title, message) => {
  if (!root) return;
  root.innerHTML = `
    <div class="admin-message">
      <h1>${title}</h1>
      <p>${message}</p>
    </div>
  `;
};

const getToken = () => {
  return localStorage.getItem("token") || localStorage.getItem("authToken") || sessionStorage.getItem("token");
};

const apiRequest = async (url, method = "GET", body = null) => {
  const token = getToken();
  if (!token) throw new Error("Missing admin auth token");

  console.debug("Admin API request:", method, url, body);

  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : null,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `${response.status} ${response.statusText}`);
  }

  return response.json();
};

const loadPhotographers = async () => {
  try {
    const data = await apiRequest("/api/admin/photographers");
    if (!Array.isArray(data)) {
      showMessage("Admin API returned unexpected data", JSON.stringify(data, null, 2));
      return;
    }

    if (data.length === 0) {
      showMessage("No photographer requests found", "There are currently no photographers to review.");
      return;
    }

    root.innerHTML = `
      <div class="admin-dashboard">
        <h1>Pending Photographer Requests</h1>
        <div id="photographer-list" class="admin-grid">
          ${data.map((photographer) => renderCard(photographer)).join("")}
        </div>
      </div>
    `;
  } catch (error) {
    showMessage("Error loading admin data", error.message);
  }
};

const openForm = async (id, type) => {
  const photographer = document.querySelector(`.admin-card[data-id="${id}"]`);
  if (!photographer) return;

  const existing = document.querySelector(".admin-inline-form");
  if (existing) existing.remove();

  const form = document.createElement("div");
  form.className = "admin-inline-form";
  form.innerHTML = `<div class="admin-inline-form-inner"><h3>${type === "seo" ? "Edit SEO" : "Edit Portfolio"}</h3><div class="admin-form-placeholder">Loading...</div></div>`;
  photographer.appendChild(form);

  try {
    const data = await apiRequest(`/api/admin/photographers/${id}`);
    const p = data.photographer || data;

    if (type === "seo") {
      const seoTitle = p.seoTitle || "";
      const seoDescription = p.seoDescription || "";
      const seoKeywords = p.seoKeywords || "";

      form.innerHTML = `
        <div class="admin-inline-form-inner">
          <h3>Edit SEO</h3>
          <label>SEO Title</label>
          <input name="seoTitle" type="text" value="${escapeHtml(seoTitle)}" />
          <label>SEO Description</label>
          <textarea name="seoDescription">${escapeHtml(seoDescription)}</textarea>
          <label>SEO Keywords (comma separated)</label>
          <input name="seoKeywords" type="text" value="${escapeHtml(seoKeywords)}" />
          <div class="admin-inline-actions">
            <button data-submit="seo" data-id="${id}">Save</button>
            <button data-cancel>Cancel</button>
          </div>
        </div>
      `;
      return;
    }

    if (type === "portfolio") {
      const portfolio = Array.isArray(p.portfolio) ? p.portfolio.map(i => i.url || i).filter(Boolean) : [];
      form.innerHTML = `
        <div class="admin-inline-form-inner">
          <h3>Edit Portfolio</h3>
          <label>Portfolio items (one per line)</label>
          <textarea name="portfolio">${escapeHtml(portfolio.join("\n"))}</textarea>
          <div class="admin-inline-actions">
            <button data-submit="portfolio" data-id="${id}">Save</button>
            <button data-cancel>Cancel</button>
          </div>
        </div>
      `;
      return;
    }
  } catch (err) {
    form.innerHTML = `<div class="admin-inline-form-inner"><h3>${type === "seo" ? "Edit SEO" : "Edit Portfolio"}</h3><div class="admin-form-error">Failed to load values: ${escapeHtml(err.message || err)}</div><div class="admin-inline-actions"><button data-cancel>Close</button></div></div>`;
    return;
  }
};

// helper to escape inserted values
function escapeHtml(s) {
  if (!s) return "";
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

const attachEvents = () => {
  root.addEventListener("click", async (event) => {
    const target = event.target;
    const action = target.dataset.action;
    const id = target.dataset.id;

    // handle inline form submit/cancel
    const submit = target.dataset.submit;
    const cancel = target.dataset.cancel !== undefined;

    if (submit && id) {
      const form = target.closest(".admin-inline-form");
      if (!form) return;

      const seoTitle = form.querySelector("input[name='seoTitle']")?.value;
      const seoDescription = form.querySelector("textarea[name='seoDescription']")?.value;
      const seoKeywords = form.querySelector("input[name='seoKeywords']")?.value;
      const portfolioText = form.querySelector("textarea[name='portfolio']")?.value;

      try {
        console.debug("Submitting inline form", submit, id);
        if (submit === "seo") {
          // validation: require non-empty title and description
          if (!seoTitle || !seoTitle.trim() || !seoDescription || !seoDescription.trim()) {
            showMessage("Validation error", "Please provide both SEO title and SEO description.");
            return;
          }
          await apiRequest(`/api/admin/photographers/${id}/seo`, "PATCH", {
            seoTitle: seoTitle.trim(),
            seoDescription: seoDescription.trim(),
            seoKeywords: seoKeywords ? seoKeywords.split(',').map(k => k.trim()).filter(Boolean) : [],
          });
        } else if (submit === "portfolio") {
          const portfolio = portfolioText
            .split("\n")
            .map((item) => item.trim())
            .filter(Boolean)
            .map((url) => ({ url }));
          await apiRequest(`/api/admin/photographers/${id}/portfolio`, "PATCH", {
            portfolio,
          });
        }
        await loadPhotographers();
      } catch (error) {
        console.error("Save failed", error);
        showMessage("Save failed", error.message || error);
      }
      return;
    }

    if (cancel) {
      const inline = document.querySelector(".admin-inline-form");
      if (inline) inline.remove();
      return;
    }

    if (!action || !id) return;

    try {
      console.debug("Admin action clicked", action, id);
      // show temporary processing indicator
      const photographerCard = document.querySelector(`.admin-card[data-id="${id}"]`);
      if (photographerCard) {
        const processing = document.createElement("div");
        processing.className = "admin-processing";
        processing.textContent = `${action}…`;
        photographerCard.appendChild(processing);
      }

      if (action === "approve") {
        await apiRequest(`/api/admin/photographers/${id}/approve`, "PATCH");
        await loadPhotographers();
      } else if (action === "reject") {
        await apiRequest(`/api/admin/photographers/${id}/reject`, "PATCH");
        await loadPhotographers();
      } else if (action === "seo" || action === "portfolio") {
        openForm(id, action);
      }
    } catch (error) {
      console.error("Action failed", error);
      showMessage("Action failed", error.message || error);
    }
  });
};

attachEvents();
loadPhotographers();