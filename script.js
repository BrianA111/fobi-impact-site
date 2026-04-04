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
const blockedTerms = [
  "asshole",
  "bastard",
  "bitch",
  "bullshit",
  "damn",
  "dick",
  "fuck",
  "fucking",
  "idiot",
  "motherfucker",
  "nigga",
  "nigger",
  "piss",
  "shit",
  "slut",
  "stupid",
  "whore",
];
const countryOptions = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Antigua and Barbuda",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cabo Verde",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czechia",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "DR Congo",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Eswatini",
  "Ethiopia",
  "Fiji",
  "Finland",
  "France",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Grenada",
  "Guatemala",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Honduras",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Micronesia",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "North Korea",
  "North Macedonia",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Palestine",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Rwanda",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Vincent and the Grenadines",
  "Samoa",
  "San Marino",
  "Sao Tome and Principe",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "South Korea",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Timor-Leste",
  "Togo",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Vatican City",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe",
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

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function censorMatch(match) {
  if (match.length <= 2) {
    return "*".repeat(match.length);
  }

  return `${match[0]}${"*".repeat(match.length - 2)}${match.at(-1)}`;
}

function censorProfanity(value) {
  let sanitized = value;

  blockedTerms.forEach((term) => {
    const matcher = new RegExp(`\\b${term}\\b`, "gi");
    sanitized = sanitized.replace(matcher, (match) => censorMatch(match));
  });

  return sanitized;
}

function normalizeForModeration(value) {
  return value
    .toLowerCase()
    .replaceAll("@", "a")
    .replaceAll("4", "a")
    .replaceAll("3", "e")
    .replaceAll("1", "i")
    .replaceAll("!", "i")
    .replaceAll("0", "o")
    .replaceAll("$", "s")
    .replaceAll("5", "s")
    .replaceAll("7", "t")
    .replace(/[^a-z]/g, "");
}

function containsBlockedTerm(value) {
  const normalized = normalizeForModeration(value);
  return blockedTerms.some((term) => normalized.includes(term.replace(/[^a-z]/gi, "").toLowerCase()));
}

function sanitizeCommentField(value) {
  return censorProfanity(value.trim());
}

function buildCountryOptionsMarkup() {
  return countryOptions
    .slice()
    .sort((a, b) => a.localeCompare(b))
    .map((country) => `<option value="${escapeHtml(country)}">${escapeHtml(country)}</option>`)
    .join("");
}

function formatLocation(geo) {
  const city = geo.city?.trim();
  const region = geo.region?.trim();
  const country = geo.country?.trim();

  if (city && region && country) {
    return `${city}, ${region}, ${country}`;
  }

  if (region && country) {
    return `${region}, ${country}`;
  }

  if (country) {
    return country;
  }

  return "Unavailable";
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
    const response = await fetch("/api/geo", {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Geo endpoint failed: ${response.status}`);
    }

    const geo = await response.json();

    return {
      country: geo.country?.trim() || "Unavailable",
      region: geo.region?.trim() || "Unavailable",
      city: geo.city?.trim() || "",
    };
  } catch (error) {
    return {
      country: "Unavailable",
      region: "Unavailable",
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

const commentPayloadPrefix = "__FOBI_COMMENT__";

function serializeCommentPayload(payload) {
  return `${commentPayloadPrefix}${JSON.stringify(payload)}`;
}

function parseCommentPayload(rawComment) {
  if (!rawComment.startsWith(commentPayloadPrefix)) {
    return {
      firstName: "",
      lastName: "",
      country: "",
      message: rawComment,
    };
  }

  try {
    const parsed = JSON.parse(rawComment.slice(commentPayloadPrefix.length));
    return {
      firstName: parsed.firstName || "",
      lastName: parsed.lastName || "",
      country: parsed.country || "",
      message: parsed.message || "",
    };
  } catch (error) {
    return {
      firstName: "",
      lastName: "",
      country: "",
      message: rawComment,
    };
  }
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
    const parsedComment = parseCommentPayload(comment.comment_text);
    const commenterName = `${sanitizeCommentField(parsedComment.firstName)} ${sanitizeCommentField(parsedComment.lastName)}`.trim();
    const commentMeta = [commenterName, sanitizeCommentField(parsedComment.country)].filter(Boolean).join(" • ");
    const safeMessage = escapeHtml(censorProfanity(parsedComment.message));
    commentEl.innerHTML = `
      <div class="comment-item-top">
        <div class="comment-copy">
          ${commentMeta ? `<p class="comment-author">${escapeHtml(commentMeta)}</p>` : ""}
          <p>${safeMessage}</p>
        </div>
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
      <img src="${item.src}" alt="${item.alt}" draggable="false">
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
            <div class="comment-form-grid">
              <div>
                <label class="sr-only" for="comment-first-name-${item.id}">First name</label>
                <input id="comment-first-name-${item.id}" name="firstName" type="text" placeholder="First name" autocomplete="given-name" required>
              </div>
              <div>
                <label class="sr-only" for="comment-last-name-${item.id}">Last name</label>
                <input id="comment-last-name-${item.id}" name="lastName" type="text" placeholder="Last name" autocomplete="family-name" required>
              </div>
            </div>
            <div>
              <label class="sr-only" for="comment-country-${item.id}">Country</label>
              <select id="comment-country-${item.id}" name="country" required>
                <option value="">Select country</option>
                ${buildCountryOptionsMarkup()}
              </select>
            </div>
            <label class="sr-only" for="comment-${item.id}">Write a comment</label>
            <textarea id="comment-${item.id}" name="comment" placeholder="Write a comment..." required></textarea>
            <p class="comment-error hidden" aria-live="polite"></p>
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
  const firstNameInput = article.querySelector('[name="firstName"]');
  const lastNameInput = article.querySelector('[name="lastName"]');
  const countryInput = article.querySelector('[name="country"]');
  const commentInput = article.querySelector("textarea");
  const commentList = article.querySelector(".comment-list");
  const commentError = article.querySelector(".comment-error");
  const commentSubmitButton = commentForm.querySelector("button");

  async function refreshCardState() {
    const [likes, liked, comments] = await Promise.all([
      fetchLikeCount(item.id),
      fetchHasLiked(item.id),
      fetchComments(item.id),
    ]);

    likeButton.classList.toggle("active", liked);
    likeButton.textContent = liked ? `Liked (${likes})` : `Like (${likes})`;
    likeButton.disabled = false;
    likeButton.removeAttribute("aria-disabled");
    likeButton.title = liked ? "Unlike this photo" : "Like this photo";
    const commentsWithItem = comments.map((comment) => ({ ...comment, item_id: item.id }));
    renderCommentList(commentList, commentsWithItem);
  }

  cardRefreshers.set(item.id, refreshCardState);
  refreshCardState().catch(() => {
    likeButton.textContent = "Like";
    renderCommentList(commentList, []);
  });

  likeButton.addEventListener("click", async () => {
    try {
      likeButton.disabled = true;

      const liked = await fetchHasLiked(item.id);

      if (liked) {
        await supabaseClient
          .from("gallery_likes")
          .delete()
          .eq("item_id", item.id)
          .eq("browser_id", browserId);
      } else {
        const { error } = await supabaseClient
          .from("gallery_likes")
          .insert({ item_id: item.id, browser_id: browserId });

        if (error && error.code !== "23505") {
          throw error;
        }
      }

      await refreshCardState();
    } catch (error) {
      console.error("Like toggle failed", error);
      likeButton.disabled = false;
    }
  });

  commentToggle.addEventListener("click", () => {
    const isHidden = commentBox.classList.toggle("hidden");
    commentToggle.setAttribute("aria-expanded", String(!isHidden));
    if (!isHidden) {
      firstNameInput.focus();
    }
  });

  [firstNameInput, lastNameInput, commentInput].forEach((field) => {
    field.addEventListener("input", () => {
      commentError.textContent = "";
      commentError.classList.add("hidden");
      const cursorPosition = field.selectionStart;
      const censoredValue = censorProfanity(field.value);

      if (field.value !== censoredValue) {
        field.value = censoredValue;
        if (typeof cursorPosition === "number") {
          field.setSelectionRange(cursorPosition, cursorPosition);
        }
      }
    });
  });

  countryInput.addEventListener("change", () => {
    commentError.textContent = "";
    commentError.classList.add("hidden");
  });

  commentForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const firstName = sanitizeCommentField(firstNameInput.value);
    const lastName = sanitizeCommentField(lastNameInput.value);
    const country = countryInput.value.trim();
    const text = sanitizeCommentField(commentInput.value);
    if (!firstName || !lastName || !country || !text) {
      commentError.textContent = "Please fill in every field before posting.";
      commentError.classList.remove("hidden");
      commentForm.reportValidity();
      return;
    }

    if (!countryOptions.includes(country)) {
      commentError.textContent = "Please choose a valid country from the list.";
      commentError.classList.remove("hidden");
      return;
    }

    if ([firstName, lastName, country, text].some((value) => containsBlockedTerm(value))) {
      commentError.textContent = "Please remove inappropriate language before posting.";
      commentError.classList.remove("hidden");
      return;
    }

    firstNameInput.value = firstName;
    lastNameInput.value = lastName;
    commentInput.value = text;
    commentSubmitButton.disabled = true;

    supabaseClient
      .from("gallery_comments")
      .insert({
        item_id: item.id,
        browser_id: browserId,
        comment_text: serializeCommentPayload({
          firstName,
          lastName,
          country,
          message: text,
        }),
      })
      .then(async () => {
        firstNameInput.value = "";
        lastNameInput.value = "";
        countryInput.value = "";
        commentInput.value = "";
        await refreshCardState();
        commentSubmitButton.disabled = false;
      })
      .catch((error) => {
        console.error("Comment post failed", error);
        commentSubmitButton.disabled = false;
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
    panel.appendChild(createEmptyState("No video yet coming soon!!"));
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

function setupMobileNav() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav-links");
  const navWrapper = document.querySelector(".nav");

  if (!toggle || !nav || !navWrapper) {
    return;
  }

  function setMenuState(open) {
    nav.classList.toggle("nav-links-open", open);
    toggle.classList.toggle("nav-toggle-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
  }

  toggle.addEventListener("click", () => {
    const open = !nav.classList.contains("nav-links-open");
    setMenuState(open);
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      setMenuState(false);
    });
  });

  document.addEventListener("click", (event) => {
    if (!navWrapper.contains(event.target)) {
      setMenuState(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setMenuState(false);
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 640) {
      setMenuState(false);
    }
  });
}

function setupDesktopNavFab() {
  const toggle = document.querySelector(".desktop-nav-fab");
  const panel = document.querySelector(".desktop-nav-panel");

  if (!toggle || !panel) {
    return;
  }

  function setPanelState(open) {
    panel.classList.toggle("desktop-nav-panel-open", open);
    toggle.classList.toggle("desktop-nav-fab-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close quick navigation" : "Open quick navigation");
  }

  toggle.addEventListener("click", () => {
    const open = !panel.classList.contains("desktop-nav-panel-open");
    setPanelState(open);
  });

  panel.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      setPanelState(false);
    });
  });

  document.addEventListener("click", (event) => {
    if (!toggle.contains(event.target) && !panel.contains(event.target)) {
      setPanelState(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setPanelState(false);
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth <= 640) {
      setPanelState(false);
    }
  });
}

renderPhotos();
renderVideos();
setupTabs();
setupMobileNav();
setupDesktopNavFab();
setupRealtime();
recordVisit().then(() => loadVisitorStats());
preventEasyImageSaving();
