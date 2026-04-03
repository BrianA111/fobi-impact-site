const photoItems = [
  {
    id: "outreach-1",
    src: "assets/images/IMG_20260325_101536_320.jpg",
    alt: "FOBI outreach photo one",
    caption: "A moment from the FOBI health outreach visit.",
  },
  {
    id: "outreach-2",
    src: "assets/images/IMG_20260325_104646_893.jpg",
    alt: "FOBI outreach photo two",
    caption: "Support, care, and presence during the outreach project.",
  },
  {
    id: "outreach-2b",
    src: "assets/images/IMG_20260325_120315_492.jpg",
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

const storagePrefix = "fobi-gallery";

function getLikeCount(itemId) {
  return Number(localStorage.getItem(`${storagePrefix}-likes-${itemId}`) || "0");
}

function setLikeCount(itemId, count) {
  localStorage.setItem(`${storagePrefix}-likes-${itemId}`, String(count));
}

function hasLiked(itemId) {
  return localStorage.getItem(`${storagePrefix}-liked-${itemId}`) === "true";
}

function setLiked(itemId, liked) {
  localStorage.setItem(`${storagePrefix}-liked-${itemId}`, String(liked));
}

function getStoredComments(itemId) {
  try {
    return JSON.parse(localStorage.getItem(`${storagePrefix}-comments-${itemId}`)) || [];
  } catch (error) {
    return [];
  }
}

function saveComments(itemId, comments) {
  localStorage.setItem(`${storagePrefix}-comments-${itemId}`, JSON.stringify(comments));
}

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleString();
}

function renderCommentList(container, itemId) {
  const comments = getStoredComments(itemId);
  container.innerHTML = "";

  if (!comments.length) {
    container.innerHTML = `<p class="comment-empty">No comments yet.</p>`;
    return;
  }

  comments.forEach((comment) => {
    const commentEl = document.createElement("article");
    commentEl.className = "comment-item";
    commentEl.innerHTML = `
      <p>${comment.text}</p>
      <span class="comment-time">${formatDate(comment.createdAt)}</span>
    `;
    container.appendChild(commentEl);
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

  function updateLikeButton() {
    const likes = getLikeCount(item.id);
    const liked = hasLiked(item.id);
    likeButton.classList.toggle("active", liked);
    likeButton.textContent = liked ? `Liked (${likes})` : `Like (${likes})`;
  }

  updateLikeButton();
  renderCommentList(commentList, item.id);

  likeButton.addEventListener("click", () => {
    const liked = hasLiked(item.id);
    const likes = getLikeCount(item.id);
    const nextLikes = liked ? Math.max(0, likes - 1) : likes + 1;
    setLikeCount(item.id, nextLikes);
    setLiked(item.id, !liked);
    updateLikeButton();
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

    const comments = getStoredComments(item.id);
    comments.unshift({ text, createdAt: Date.now() });
    saveComments(item.id, comments);
    commentInput.value = "";
    renderCommentList(commentList, item.id);
  });

  return article;
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
