const photoItems = [
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
  {
    id: "outreach-2b",
    src: "IMG_20260325_120315_492.jpg",
    alt: "FOBI outreach photo five",
    caption: "Another moment captured during the FOBI outreach visit.",
  },
];

const videoItems = [
  {
    src: "",
    caption: "Add your first video by placing it in assets/videos and updating script.js.",
  },
];

const SUPABASE_URL = "https://fsxzmnulugyteljsqmqc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzeHptbnVsdWd5dGVsanNxbXFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyMzUyMDMsImV4cCI6MjA5MDgxMTIwM30.SU719V9-_MKugPC6E2b0E7w1oAI55CgOrZWuNdum0_g";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const browserIdKey = "fobi-browser-id";
const browserId = getOrCreateBrowserId();
const cardRefreshers = new Map();
const visitSessionKey = `fobi-visit-recorded:${window.location.pathname}`;

if (window.location.hash) {
  history.replaceState(null, "", window.location.pathname + window.location.search);
}

window.addEventListener("load", () => {
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
});

function createEmptyState(message) {
  const item = document.createElement("article");
  item.className = "empty-state";
  item.innerHTML = `<p>${message}</p>`;
  return item;
}

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleString();
}

function formatLocation(geo) {
  const parts = [geo.city, geo.region, geo.country].filter(Boolean);
  return parts.length ? parts.join(", ") : "Unavailable";
}

function getOrCreateBrowserId() {
  const existing = localStorage.getItem(browserIdKey);
  if (existing) {
    return existing;
  }

  const created = `browser-${crypto.randomUUID()}`;
  localStorage.setItem(browserIdKey, created);
  return created;
}

async function fetchVisitorGeo() {
  try {
    const response = await fetch("https://ipwho.is/");
    const data = await response.json();

    if (!data.success) {
      throw new Error("Geo lookup failed");
    }

    return {
      country: data.country || "",
      region: data.region || "",
      city: data.city || "",
    };
  } catch (error) {
    return {
      country: "",
      region: "",
      city: "",
    };
  }
}

async function recordVisit() {
  const geo = await fetchVisitorGeo();
  const visitorRegion = document.getElementById("visitor-region");

  if (visitorRegion) {
    visitorRegion.textContent = formatLocation(geo);
  }

  if (sessionStorage.getItem(visitSessionKey)) {
    return geo;
  }

  await supabaseClient.from("site_visits").insert({
    browser_id: browserId,
    page_path: window.location.pathname,
    country: geo.country || null,
    region: geo.region || null,
    city: geo.city || null,
  });

  sessionStorage.setItem(visitSessionKey, "true");
  return geo;
}

function summarizeTopLocations(rows) {
  const counts = rows.reduce((acc, row) => {
    const country = row.country || "Unknown";
    acc[country] = (acc[country] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([country, count]) => `${country} (${count})`)
    .join(", ");
}

async function loadVisitorStats() {
  const visitCountEl = document.getElementById("visit-count");
  const topLocationsEl = document.getElementById("top-locations");

  const [{ count }, { data }] = await Promise.all([
    supabaseClient.from("site_visits").select("*", { count: "exact", head: true }),
    supabaseClient.from("site_visits").select("country"),
  ]);

  if (visitCountEl) {
    visitCountEl.textContent = String(count || 0);
  }

  if (topLocationsEl) {
    topLocationsEl.textContent = data?.length ? summarizeTopLocations(data) : "No data yet";
  }
}

async function fetchLikeCount(itemId) {
  const { count, error } = await supabaseClient
    .from("gallery_likes")
    .select("*", { count: "exact", head: true })
    .eq("item_id", itemId);

  if (error) {
    return 0;
  }

  return count || 0;
}

async function fetchHasLiked(itemId) {
  const { data, error } = await supabaseClient
    .from("gallery_likes")
    .select("item_id")
    .eq("item_id", itemId)
    .eq("browser_id", browserId)
    .maybeSingle();

  if (error) {
    return false;
  }

  return Boolean(data);
}

async function fetchComments(itemId) {
  const { data, error } = await supabaseClient
    .from("gallery_comments")
    .select("id, comment_text, created_at, browser_id")
    .eq("item_id", itemId)
    .order("created_at", { ascending: false });

  if (error) {
    return [];
  }

  return data || [];
}

function renderCommentList(container, comments) {
  container.innerHTML = "";

  if (!comments.length) {
    container.innerHTML = `<p class="comment-empty">No comments yet.</p>`;
    return;
  }

  comments.forEach((comment) => {
    const commentEl = document.createElement("article");
    commentEl.className = "comment-item";
    const canDelete = comment.browser_id === browserId;
    commentEl.innerHTML = `
      <div class="comment-item-top">
        <p>${comment.comment_text}</p>
        ${canDelete ? `<button class="comment-delete" type="button" data-comment-id="${comment.id}" aria-label="Delete comment">Delete</button>` : ""}
      </div>
      <span class="comment-time">${formatDate(comment.created_at)}</span>
    `;
    container.appendChild(commentEl);
  });

  container.querySelectorAll(".comment-delete").forEach((button) => {
    button.addEventListener("click", async () => {
      const commentId = Number(button.dataset.commentId);
      button.disabled = true;
      await supabaseClient
        .from("gallery_comments")
        .delete()
        .eq("id", commentId)
        .eq("browser_id", browserId);

      const itemId = comments.find((comment) => comment.id === commentId)?.item_id;
      if (itemId) {
        cardRefreshers.get(itemId)?.();
      }
    });
  });
}

function buildPhotoCard(item) {
  const article = document.createElement("article");
  article.className = "media-item";
  article.innerHTML = `
    <figure>
      <img src="${item.src}" alt="${item.alt}">
      <figcaption class="media-caption">
        <p>${item.caption}</p>
        <div class="gallery-actions">
          <button class="gallery-action like-button" type="button" aria-label="Like this photo"></button>
          <button class="gallery-action comment-toggle" type="button" aria-expanded="false" aria-controls="comment-box-${item.id}">
            <span class="comment-icon" aria-hidden="true">...</span>
            <span>Comment</span>
          </button>
        </div>
        <div class="comment-box hidden" id="comment-box-${item.id}">
          <form class="comment-form">
            <label class="sr-only" for="comment-${item.id}">Write a comment</label>
            <textarea id="comment-${item.id}" name="comment" placeholder="Write a comment..."></textarea>
            <button type="submit">Post</button>
          </form>
          <div class="comment-list" aria-live="polite"></div>
        </div>
      </figcaption>
    </figure>
  `;

  const likeButton = article.querySelector(".like-button");
  const commentToggle = article.querySelector(".comment-toggle");
  const commentBox = article.querySelector(".comment-box");
  const commentForm = article.querySelector(".comment-form");
  const commentInput = article.querySelector("textarea");
  const commentList = article.querySelector(".comment-list");

  async function refreshCardState() {
    const [likes, liked, comments] = await Promise.all([
      fetchLikeCount(item.id),
      fetchHasLiked(item.id),
      fetchComments(item.id),
    ]);

    likeButton.classList.toggle("active", liked);
    likeButton.textContent = liked ? `Liked (${likes})` : `Like (${likes})`;
    const commentsWithItem = comments.map((comment) => ({ ...comment, item_id: item.id }));
    renderCommentList(commentList, commentsWithItem);
  }

  cardRefreshers.set(item.id, refreshCardState);
  refreshCardState();

  likeButton.addEventListener("click", async () => {
    likeButton.disabled = true;

    const liked = await fetchHasLiked(item.id);

    if (liked) {
      await supabaseClient
        .from("gallery_likes")
        .delete()
        .eq("item_id", item.id)
        .eq("browser_id", browserId);
    } else {
      await supabaseClient
        .from("gallery_likes")
        .insert({ item_id: item.id, browser_id: browserId });
    }

    await refreshCardState();
    likeButton.disabled = false;
  });

  commentToggle.addEventListener("click", () => {
    const isHidden = commentBox.classList.toggle("hidden");
    commentToggle.setAttribute("aria-expanded", String(!isHidden));
    if (!isHidden) {
      commentInput.focus();
    }
  });

  commentForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = commentInput.value.trim();
    if (!text) {
      return;
    }

    commentForm.querySelector("button").disabled = true;

    supabaseClient
      .from("gallery_comments")
      .insert({
        item_id: item.id,
        browser_id: browserId,
        comment_text: text,
      })
      .then(async () => {
        commentInput.value = "";
        await refreshCardState();
        commentForm.querySelector("button").disabled = false;
      });
  });

  return article;
}

function setupRealtime() {
  supabaseClient
    .channel("gallery-live-updates")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "gallery_likes" },
      (payload) => {
        const itemId = payload.new?.item_id || payload.old?.item_id;
        cardRefreshers.get(itemId)?.();
      }
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "gallery_comments" },
      (payload) => {
        const itemId = payload.new?.item_id || payload.old?.item_id;
        cardRefreshers.get(itemId)?.();
      }
    )
    .subscribe();
}

function renderPhotos() {
  const panel = document.getElementById("photos-panel");
  const validPhotos = photoItems.filter((item) => item.src.trim() !== "");

  if (!validPhotos.length) {
    panel.appendChild(createEmptyState("No photos added yet. Update the photoItems list in script.js."));
    return;
  }

  validPhotos.forEach((item) => {
    panel.appendChild(buildPhotoCard(item));
  });
}

function renderVideos() {
  const panel = document.getElementById("videos-panel");
  const validVideos = videoItems.filter((item) => item.src.trim() !== "");

  if (!validVideos.length) {
    panel.appendChild(createEmptyState("No videos added yet. Update the videoItems list in script.js."));
    return;
  }

  validVideos.forEach((item) => {
    const article = document.createElement("article");
    article.className = "media-item";
    article.innerHTML = `
      <figure>
        <video controls preload="metadata">
          <source src="${item.src}">
          Your browser does not support the video tag.
        </video>
        <figcaption>${item.caption}</figcaption>
      </figure>
    `;
    panel.appendChild(article);
  });
}

function setupTabs() {
  const buttons = document.querySelectorAll(".tab-button");
  const photoPanel = document.getElementById("photos-panel");
  const videoPanel = document.getElementById("videos-panel");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const isPhotos = button.dataset.tab === "photos";

      buttons.forEach((item) => {
        const active = item === button;
        item.classList.toggle("active", active);
        item.setAttribute("aria-selected", String(active));
      });

      photoPanel.classList.toggle("hidden", !isPhotos);
      videoPanel.classList.toggle("hidden", isPhotos);
    });
  });
}

renderPhotos();
renderVideos();
setupTabs();
setupRealtime();
recordVisit().then(() => loadVisitorStats());
