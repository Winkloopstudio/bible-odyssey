// script.js - Bible Odyssey

/* Verse rotation */
const verses = [
  "The Lord is my shepherd; I shall not want. – Psalm 23:1",
  "Trust in the Lord with all your heart. – Proverbs 3:5",
  "I can do all things through Christ. – Philippians 4:13",
  "Your word is a lamp to my feet. – Psalm 119:105"
];
let verseIndex = 0;
function rotateVerse() {
  const banner = document.getElementById("verse-banner");
  banner.textContent = verses[verseIndex];
  verseIndex = (verseIndex + 1) % verses.length;
}
setInterval(rotateVerse, 5000);
rotateVerse();

/* Stories */
const stories = [
  { title: "Creation", text: "God made the heavens and the earth—light, sky, land, plants, stars, animals, and people. God’s world is good!" },
  { title: "Noah's Ark", text: "Noah obeyed God and built an ark. God kept Noah’s family and the animals safe through the flood. God keeps His promises." },
  { title: "David & Goliath", text: "David trusted God and defeated the giant Goliath with a sling. With faith, even little ones can do big things." },
  { title: "Daniel in the Lions' Den", text: "Daniel prayed to God and was protected from the lions. God watches over those who trust Him." },
  { title: "Jonah & the Big Fish", text: "Jonah ran away, but God showed mercy. When we turn back to God, He forgives and guides us." },
  { title: "Birth of Jesus", text: "Jesus was born in Bethlehem—good news of great joy for everyone. God sent His Son because He loves us." },
  { title: "Jesus' Miracles", text: "Jesus healed the sick, calmed storms, and fed the hungry. Nothing is impossible for Him." },
  { title: "The Good Samaritan", text: "Jesus taught us to love our neighbor—help others, even when it’s hard." },
  { title: "The Easter Story", text: "Jesus died for our sins and rose again. He is alive! We can have new life in Him." }
];
const LS_KEY = "bibleOdysseyProgress";
let progress = Number(localStorage.getItem(LS_KEY) || 0);
let currentStoryIndex = 0;

function saveProgress(nextIndex) {
  progress = nextIndex;
  localStorage.setItem(LS_KEY, String(progress));
  renderStories();
  showToast("Progress saved!");
}

function openStorySelect() {
  document.getElementById("story-select").classList.remove("hidden");
  renderStories();
}
function closeStorySelect() { document.getElementById("story-select").classList.add("hidden"); }

function renderStories() {
  const list = document.getElementById("story-list");
  list.innerHTML = "";
  stories.forEach((story, idx) => {
    const btn = document.createElement("button");
    btn.className = "story-btn btn-primary";
    btn.textContent = story.title;
    const locked = idx > progress;
    if (locked) {
      btn.dataset.locked = "true";
      btn.disabled = true;
    } else {
      btn.removeAttribute("data-locked");
      btn.onclick = () => playStory(idx);
    }
    if (idx < progress) btn.classList.add("done");
    list.appendChild(btn);
  });
}

function playStory(index) {
  currentStoryIndex = index;
  document.getElementById("story-title").textContent = stories[index].title;
  document.getElementById("story-text").textContent  = stories[index].text;
  document.getElementById("story-select").classList.add("hidden");
  document.getElementById("story-page").classList.remove("hidden");
}

function nextPage() {
  const atLast = currentStoryIndex >= stories.length - 1;
  if (!atLast && currentStoryIndex === progress) saveProgress(progress + 1);
  else if (atLast) showToast("All stories completed!");
  else showToast("Story viewed.");
  closeStoryPage(); openStorySelect();
}
function closeStoryPage() { document.getElementById("story-page").classList.add("hidden"); }

/* Settings */
function openSettings() { document.getElementById("settings-panel").classList.remove("hidden"); }
function closeSettings() { document.getElementById("settings-panel").classList.add("hidden"); }
function comingSoon() { showToast("Journey Mode — Coming Soon!"); }

document.getElementById("font-size").addEventListener("change", (e) => {
  const size = e.target.value;
  if (size === "small")  document.body.style.fontSize = "14px";
  if (size === "medium") document.body.style.fontSize = "16px";
  if (size === "large")  document.body.style.fontSize = "20px";
});
document.getElementById("sound-toggle").addEventListener("change", (e) => {
  console.log(e.target.checked ? "Sound ON" : "Sound OFF");
});

/* Toast */
let toastTimer = null;
function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 1400);
}

/* Interactive Clouds with clamped dragging */
document.querySelectorAll('.cloud').forEach(cloud => {
  let dragging = false;
  let offsetX = 0, offsetY = 0;

  // Mouse
  cloud.addEventListener('mousedown', e => {
    dragging = true;
    offsetX = e.offsetX;
    offsetY = e.offsetY;
    cloud.style.cursor = "grabbing";
    cloud.style.animation = "none"; // pause float
  });
  document.addEventListener('mouseup', () => {
    if (dragging) {
      dragging = false;
      cloud.style.cursor = "grab";
      cloud.style.animation = "float 25s linear infinite"; // resume float
    }
  });
  document.addEventListener('mousemove', e => {
    if (dragging) {
      e.preventDefault();
      const maxX = window.innerWidth - cloud.offsetWidth;
      const maxY = window.innerHeight - cloud.offsetHeight;
      let x = e.clientX - offsetX;
      let y = e.clientY - offsetY;
      x = Math.max(0, Math.min(x, maxX));
      y = Math.max(0, Math.min(y, maxY));
      cloud.style.left = x + "px";
      cloud.style.top  = y + "px";
    }
  });

  // Touch
  cloud.addEventListener('touchstart', e => {
    dragging = true;
    const touch = e.touches[0];
    offsetX = touch.clientX - cloud.getBoundingClientRect().left;
    offsetY = touch.clientY - cloud.getBoundingClientRect().top;
    cloud.style.animation = "none";
  });
  document.addEventListener('touchend', () => {
    if (dragging) {
      dragging = false;
      cloud.style.animation = "float 25s linear infinite";
    }
  });
  document.addEventListener('touchmove', e => {
    if (dragging) {
      e.preventDefault();
      const touch = e.touches[0];
      const maxX = window.innerWidth - cloud.offsetWidth;
      const maxY = window.innerHeight - cloud.offsetHeight;
      let x = touch.clientX - offsetX;
      let y = touch.clientY - offsetY;
      x = Math.max(0, Math.min(x, maxX));
      y = Math.max(0, Math.min(y, maxY));
      cloud.style.left = x + "px";
      cloud.style.top  = y + "px";
    }
  }, { passive: false });
});
