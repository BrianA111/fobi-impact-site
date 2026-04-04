const photoItems = [
  {
    id: "outreach-2b",
    src: "IMG_20260325_120315_492.jpg",
    alt: "FOBI outreach photo five",
    caption: "Another moment captured during the FOBI outreach visit.",
  },
  {
    id: "outreach-1",
    src: "IMG_20260325_101536_320.jpg",
    alt: "FOBI outreach photo one",
    caption: "A moment from the FOBI health outreach visit.",
  },
  {
    id: "outreach-2",
    src: "IMG_20260325_104646_893.jpg",
    alt: "FOBI outreach photo two",
    caption: "Support, care, and presence during the outreach project.",
  },
];

const videoItems = [
  {
    src: "",
    caption: "Coming soon!",
  },
];

// Supabase Configuration
const SUPABASE_URL = "https://fsxzmnulugyteljsqmqc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzeHptbnVsdWd5dGVsanNxbXFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyMzUyMDMsImV4cCI6MjA5MDgxMTIwM30.SU719V9-_MKugPC6E2b0E7w1oAI55CgOrZWuNdum0_g";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const browserIdKey = "fobi-browser-id";
const browserId = getOrCreateBrowserId();
const cardRefreshers = new Map();
const visitSessionKey = `fobi-visit-recorded:${window.location.pathname}`;

// Utility: Remove hash from URL on load
if (window.location.hash) {
  history.replaceState(null, "", window.location.pathname + window.location.search);
}

window.addEventListener("load", () => {
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
});

// --- UI HELPER FUNCTIONS ---

function createEmptyState(message) {
  const item = document.createElement("article");
  item.className = "empty-state";
  item.innerHTML = `<p>${message}</p>`;
  return item;
}

function preventEasyImageSaving() {
  document.querySelectorAll("img").forEach((img) => {
    img.setAttribute("draggable", "false");
    img.addEventListener("dragstart", (event) => event.preventDefault());
    img.addEventListener("contextmenu", (event) => event.preventDefault());
  });
}

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleString();
}

function getOrCreateBrowserId() {
  let id = localStorage.getItem(browserIdKey);
  if (!id) {
    id = `browser-${crypto.randomUUID()}`;
    localStorage.setItem(browserIdKey, id);
  }
  return id;
}

// --- VISITOR TRACKING ---

async function fetchVisitorGeo() {
  try {
    const response = await fetch("https://ipwho.is/");
    const data = await response.json();
    return {
      country: data.country || "Unknown",
      region: data.region || "Unknown",
      city: data.city || "Unknown",
    };
  } catch (error) {
    return { country: "", region: "", city: "" };
  }
}

async function recordVisit() {
  if (sessionStorage.getItem(visitSessionKey)) return;
  
  const geo = await fetchVisitorGeo();
  await supabaseClient.from("site_visits").insert({
    browser_id: browserId,
    page_path: window.location.pathname,
    country: geo.country,
    region: geo.region,
    city: geo.city,
  });

  sessionStorage.setItem(visitSessionKey, "true");
}

async function loadVisitorStats() {
  const visitCountEl = document.getElementById("visit-count");
  const { count } = await supabaseClient.from("site_visits").select("*", { count: "exact", head: true });
  if (visitCountEl) visitCountEl.textContent = String(count || 0);
}

// --- GALLERY LOGIC (LIKES & COMMENTS) ---

async function fetchLikeCount(itemId) {
  const { count } = await supabaseClient.from("gallery_likes").select("*", { count: "exact", head: true }).eq("item_id", itemId);
  return count || 0;
}

async function fetchHasLiked(itemId) {
  const { data } = await supabaseClient.from("gallery_likes").select("item_id").eq("item_id", itemId).eq("browser_id", browserId).maybeSingle();
  return !!data;
}

async function fetchComments(itemId) {
  const { data } = await supabaseClient.from("gallery_comments").select("*").eq("item_id", itemId).order("created_at", { ascending: false });
  return data || [];
}

function renderCommentList(container, comments, itemId) {
  container.innerHTML = comments.length ? "" : `<p class="comment-empty">No comments yet.</p>`;
  comments.forEach((comment) => {
    const div = document.createElement("div");
    div.className = "comment-item";
    const isOwner = comment.browser_id === browserId;
    div.innerHTML = `
      <p>${comment.comment_text}</p>
      <small>${formatDate(comment.created_at)}</small>
      ${isOwner ? `<button class="delete-btn" data-id="${comment.id}">Delete</button>` : ""}
    `;
    container.appendChild(div);
  });

  container.querySelectorAll(".delete-btn").forEach(btn => {
    btn.onclick = async () => {
      await supabaseClient.from("gallery_comments").delete().eq("id", btn.dataset.id);
      cardRefreshers.get(itemId)?.();
    };
  });
}

function buildPhotoCard(item) {
  const article = document.createElement("article");
  article.className = "media-item";
  article.innerHTML = `
    <figure>
      <img src="${item.src}" alt="${item.alt}">
      <figcaption>
        <p>${item.caption}</p>
        <div class="gallery-actions">
          <button class="like-btn" id="like-${item.id}">Like</button>
          <button class="comment-toggle">Comment</button>
        </div>
        <div class="comment-section hidden">
          <form class="comment-form">
            <textarea placeholder="Add a comment..." required></textarea>
            <button type="submit">Post</button>
          </form>
          <div class="comment-list"></div>
        </div>
      </figcaption>
    </figure>
  `;

  const likeBtn = article.querySelector(".like-btn");
  const commentSection = article.querySelector(".comment-section");
  const commentForm = article.querySelector(".comment-form");

  const refresh = async () => {
    const [count, liked, comments] = await Promise.all([fetchLikeCount(item.id), fetchHasLiked(item.id), fetchComments(item.id)]);
    likeBtn.textContent = `${liked ? "Liked" : "Like"} (${count})`;
    likeBtn.classList.toggle("active", liked);
    renderCommentList(article.querySelector(".comment-list"), comments, item.id);
  };

  cardRefreshers.set(item.id, refresh);
  refresh();

  likeBtn.onclick = async () => {
    const liked = await fetchHasLiked(item.id);
    if (liked) {
      await supabaseClient.from("gallery_likes").delete().eq("item_id", item.id).eq("browser_id", browserId);
    } else {
      await supabaseClient.from("gallery_likes").insert({ item_id: item.id, browser_id: browserId });
    }
    refresh();
  };

  article.querySelector(".comment-toggle").onclick = () => commentSection.classList.toggle("hidden");

  commentForm.onsubmit = async (e) => {
    e.preventDefault();
    const text = commentForm.querySelector("textarea").value;
    await supabaseClient.from("gallery_comments").insert({ item_id: item.id, browser_id: browserId, comment_text: text });
    commentForm.reset();
    refresh();
  };

  return article;
}

// --- CORE RENDERERS ---

function renderPhotos() {
  const panel = document.getElementById("photos-panel");
  photoItems.forEach(item => panel.appendChild(buildPhotoCard(item)));
}

function renderVideos() {
  const panel = document.getElementById("videos-panel");
  const validVideos = videoItems.filter(v => v.src !== "");
  if (!validVideos.length) {
    panel.appendChild(createEmptyState("No videos yet – coming soon!"));
    return;
  }
}

// --- NAVIGATION & TABS ---

function setupTabs() {
  const tabs = document.querySelectorAll(".tab-button");
  tabs.forEach(btn => {
    btn.onclick = () => {
      tabs.forEach(t => t.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById("photos-panel").classList.toggle("hidden", btn.dataset.tab !== "photos");
      document.getElementById("videos-panel").classList.toggle("hidden", btn.dataset.tab !== "videos");
    };
  });
}

// MATCHED TO YOUR HTML: .menu-toggle and #primary-navigation
function setupMobileNav() {
  const menuBtn = document.querySelector(".menu-toggle");
  const navMenu = document.getElementById("primary-navigation");

  if (menuBtn && navMenu) {
    menuBtn.addEventListener("click", () => {
      const expanded = menuBtn.getAttribute("aria-expanded") === "true";
      menuBtn.setAttribute("aria-expanded", !expanded);
      navMenu.classList.toggle("active");
    });

    // Close menu when a link is clicked
    navMenu.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("active");
        menuBtn.setAttribute("aria-expanded", "false");
      });
    });
  }
}

// --- INITIALIZE ---
document.addEventListener("DOMContentLoaded", () => {
  renderPhotos();
  renderVideos();
  setupTabs();
  setupMobileNav();
  preventEasyImageSaving();
  recordVisit().then(loadVisitorStats);
});
