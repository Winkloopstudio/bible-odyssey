// script.js - Bible Odyssey

/* Verse rotation */
const shortVerses = [
  "God is love — 1 Jn 4:8",
  "Rejoice always — 1 Th 5:16",
  "Pray continually — 1 Th 5:17"
];

const mediumVerses = [
  "Trust in the Lord — Prov 3:5",
  "The Lord is my shepherd — Ps 23:1",
  "Be strong and courageous — Josh 1:9"
];

const longVerses = [
  "I can do all things through Christ — Phil 4:13",
  "Your word is a lamp to my feet — Ps 119:105",
  "The Lord bless you and keep you — Num 6:24"
];

// Assign verses to clouds based on size
document.querySelectorAll('.cloud').forEach(cloud => {
  let verse = "";
  if (cloud.classList.contains("cloud-small")) {
    verse = shortVerses[Math.floor(Math.random() * shortVerses.length)];
  } else if (cloud.classList.contains("cloud-medium")) {
    verse = mediumVerses[Math.floor(Math.random() * mediumVerses.length)];
  } else {
    verse = longVerses[Math.floor(Math.random() * longVerses.length)];
  }
  cloud.querySelector('.cloud-verse').textContent = verse;
});

/* Stories */
const stories = [
  { title: "Creation", text: "God made the heavens and the earth—light, sky, land, plants, stars, animals, and people. God's world is good!" },
  { title: "Noah's Ark", text: "Noah obeyed God and built an ark. God kept Noah's family and the animals safe through the flood. God keeps His promises." },
  { title: "David & Goliath", text: "David trusted God and defeated the giant Goliath with a sling. With faith, even little ones can do big things." },
  { title: "Daniel in the Lions' Den", text: "Daniel prayed to God and was protected from the lions. God watches over those who trust Him." },
  { title: "Jonah & the Big Fish", text: "Jonah ran away, but God showed mercy. When we turn back to God, He forgives and guides us." },
  { title: "Birth of Jesus", text: "Jesus was born in Bethlehem—good news of great joy for everyone. God sent His Son because He loves us." },
  { title: "Jesus' Miracles", text: "Jesus healed the sick, calmed storms, and fed the hungry. Nothing is impossible for Him." },
  { title: "The Good Samaritan", text: "Jesus taught us to love our neighbor—help others, even when it's hard." },
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

/* Interactive Clouds with clamped dragging - FIXED VERSION */
document.querySelectorAll('.cloud').forEach(cloud => {
  let dragging = false;
  let offsetX = 0, offsetY = 0;
  let currentCloud = null; // Track which cloud is being dragged

  // Mouse events - attached directly to each cloud
  cloud.addEventListener('mousedown', e => {
    dragging = true;
    currentCloud = cloud;
    offsetX = e.offsetX;
    offsetY = e.offsetY;
    cloud.style.cursor = "grabbing";
    cloud.style.animation = "none"; // pause float
    e.stopPropagation(); // Prevent event bubbling
  });

  // Touch events - attached directly to each cloud  
  cloud.addEventListener('touchstart', e => {
    dragging = true;
    currentCloud = cloud;
    const touch = e.touches[0];
    offsetX = touch.clientX - cloud.getBoundingClientRect().left;
    offsetY = touch.clientY - cloud.getBoundingClientRect().top;
    cloud.style.animation = "none";
    e.stopPropagation(); // Prevent event bubbling
  });
});

// Global mouse/touch handlers - but with proper cloud checking
document.addEventListener('mouseup', (e) => {
  document.querySelectorAll('.cloud').forEach(cloud => {
    cloud.style.cursor = "grab";
    cloud.style.animation = "float 25s linear infinite";
  });
  // Reset all dragging states
  dragging = false;
  currentCloud = null;
});

document.addEventListener('mousemove', e => {
  // Only process if we're actually dragging a cloud
  if (!dragging || !currentCloud) return;
  
  // Check if we're dragging over a panel - if so, stop dragging
  if (e.target.closest('.panel')) {
    dragging = false;
    currentCloud = null;
    return;
  }

  e.preventDefault();
  const maxX = window.innerWidth - currentCloud.offsetWidth;
  const maxY = window.innerHeight - currentCloud.offsetHeight;
  let x = e.clientX - offsetX;
  let y = e.clientY - offsetY;
  x = Math.max(0, Math.min(x, maxX));
  y = Math.max(0, Math.min(y, maxY));
  currentCloud.style.left = x + "px";
  currentCloud.style.top  = y + "px";
});

document.addEventListener('touchend', () => {
  document.querySelectorAll('.cloud').forEach(cloud => {
    cloud.style.animation = "float 25s linear infinite";
  });
  // Reset all dragging states
  dragging = false;
  currentCloud = null;
});

document.addEventListener('touchmove', e => {
  // Only process if we're actually dragging a cloud
  if (!dragging || !currentCloud) return;
  
  // Check if we're dragging over a panel - if so, stop dragging
  if (e.target.closest('.panel')) {
    dragging = false;
    currentCloud = null;
    return;
  }

  e.preventDefault();
  const touch = e.touches[0];
  const maxX = window.innerWidth - currentCloud.offsetWidth;
  const maxY = window.innerHeight - currentCloud.offsetHeight;
  let x = touch.clientX - offsetX;
  let y = touch.clientY - offsetY;
  x = Math.max(0, Math.min(x, maxX));
  y = Math.max(0, Math.min(y, maxY));
  currentCloud.style.left = x + "px";
  currentCloud.style.top  = y + "px";
}, { passive: false });

// Bible mascot click event
const mascot = document.getElementById("bible-mascot");
const mouth = document.getElementById("mascot-mouth");
const verseBubble = document.getElementById("verse-bubble");

const verses = [
  "Be kind to one another — Eph 4:32",
  "Trust in the Lord — Prov 3:5",
  "I can do all things — Phil 4:13"
];

mascot.addEventListener("click", () => {
  // show verse bubble
  const verse = verses[Math.floor(Math.random() * verses.length)];
  verseBubble.textContent = verse;
  verseBubble.classList.remove("hidden");

  // animate smile
  mouth.setAttribute("d", "M55 105 Q70 130 85 105"); // big smile
  setTimeout(() => {
    mouth.setAttribute("d", "M55 105 Q70 120 85 105"); // return to normal
  }, 1200);
});

// Additional fix: Reset dragging state when panels open/close
const originalOpenStorySelect = openStorySelect;
const originalOpenSettings = openSettings;

openStorySelect = function() {
  dragging = false;
  currentCloud = null;
  originalOpenStorySelect();
};

openSettings = function() {
  dragging = false;
  currentCloud = null;
  originalOpenSettings();
};
// Continue button logic
function continueStory() {
  if (progress > 0) {
    playStory(progress - 1);
  } else {
    openStorySelect();
  }
}

window.addEventListener("DOMContentLoaded", () => {
  if (progress > 0) {
    document.getElementById("continue-container").style.display = "block";
  }
});

function pauseDrift(cloud) {
  cloud.style.animationPlayState = "paused, running";
}
function resumeDrift(cloud) {
  cloud.style.animationPlayState = "running, running";
}
