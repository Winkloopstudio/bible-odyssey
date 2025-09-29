/* ----------------- Data ----------------- */
const VERSES = [
  "Psalm 139:14 — I am wonderfully made!",
  "Philippians 4:4 — Rejoice in the Lord always!",
  "Joshua 1:9 — Be strong and brave!",
  "Psalm 118:24 — This is the day the Lord has made; let us be glad!",
  "Matthew 19:14 — Let the children come to me."
];


const STORIES = [
  { id:"creation", name:"Creation", ref:"Genesis 1–2", art:"images/creation.png", levels:3, video:"videos/creation.mp4", autoComplete:true },
  { id:"noah", name:"Noah’s Ark", ref:"Genesis 6–9", art:"images/noah.png", levels:3,  video:"videos/noah.mp4" },
  { id:"david", name:"David & Goliath", ref:"1 Samuel 17", art:"images/david.png", levels:3,  video:"videos/david.mp4" },
  { id:"daniel", name:"Daniel & Lions", ref:"Daniel 6", art:"images/daniel.png", levels:3 },
  { id:"jonah", name:"Jonah & Fish", ref:"Jonah 1–2", art:"images/jonah.png", levels:3 },
  { id:"nativity", name:"Birth of Jesus", ref:"Luke 2", art:"images/nativity.png", levels:3 },
  { id:"miracles", name:"Jesus’ Miracles", ref:"Gospels", art:"images/miracles.png", levels:3 },
  { id:"samaritan", name:"Good Samaritan", ref:"Luke 10", art:"images/samaritan.png", levels:3 },
  { id:"easter", name:"Easter Story", ref:"Luke 23–24", art:"images/easter.png", levels:3 }
];


/* -------------- State / Progress -------------- */
const KEY = "b33_kids_progress_v1";
const progress = JSON.parse(localStorage.getItem(KEY) || "{}");
/* progress format: { storyId: { clearedLevels: n } } */

/* -------------- Utilities -------------- */
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));
const save = () => localStorage.setItem(KEY, JSON.stringify(progress));

/* -------------- Splash -> App -------------- */
// Outer splash1 → splash2
setTimeout(() => {
  document.getElementById("splash1").classList.add("hidden");
  document.getElementById("splash2").classList.remove("hidden");

  // Inner splash2 → app
  setTimeout(() => {
    document.getElementById("splash2").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");
    document.querySelector("nav.bottom").classList.remove("hidden");

    // ✅ Update streak + bonus here
    updateStreak();
    updateProfileUI();
  }, 2500);   // splash2 stays for 2.5s
}, 2000);     // splash1 stays for 2s


/* -------------- Ticker -------------- */
let vi = 0;
const tickerSpan = document.querySelector(".ticker span");

function showVerse() {
  tickerSpan.innerText = VERSES[vi % VERSES.length];
  vi++;

  // Reset any old animation
  tickerSpan.style.transition = "none";
  tickerSpan.style.transform = "translateX(100%)";

  // Force browser to reflow so transition restarts clean
  void tickerSpan.offsetWidth;

  // Calculate scroll distance
  const distance = tickerSpan.offsetWidth + tickerSpan.parentElement.offsetWidth;
  const duration = distance / 50; // speed = 25px/s (adjust as needed)

  // Animate leftwards
  tickerSpan.style.transition = `transform ${duration}s linear`;
  tickerSpan.style.transform = `translateX(-${tickerSpan.offsetWidth}px)`;

  // When done, schedule next verse
  setTimeout(showVerse, duration * 1000 + 1000); // +1s pause
}

showVerse();


/* -------------- Story Carousel Render -------------- */
let activeStory = STORIES[0].id;
function storyUnlocked(idx){
  if(idx===0) return true;
  const prev = STORIES[idx-1];
  const p = progress[prev.id]?.clearedLevels || 0;
  return p >= prev.levels; // finish previous story to unlock next
}
function renderStories(){
  const wrap = $("#storyStrip");
  wrap.innerHTML = "";
  STORIES.forEach((s, i)=>{
    const unlocked = storyUnlocked(i);
    const p = progress[s.id]?.clearedLevels || 0;

    const card = document.createElement("article");
    card.className = "book";
   card.innerHTML = `
  <div class="art">
    <img src="${s.art}" alt="${s.name}" style="width:100%;height:100%;object-fit:cover;">
  </div>
  <div class="cap">
    <div class="tag">📖 ${s.name}</div>
    <div style="font-size:12px;color:#765">${s.ref}</div>
    <button class="pill" ${!unlocked?"disabled":""} data-open="${s.id}">
      ${unlocked? (p>=s.levels? "Replay":"Open Book") : "Locked"}
    </button>
  </div>
  ${!unlocked? `<div class="lock"><div class="badge">🔒 Finish prior story</div></div>`:""}
`;

    wrap.appendChild(card);
  });
}
renderStories();

/* -------------- Level Grid Render -------------- */
let currentStoryIdx = 0;
function openStoryById(id){
  const idx = STORIES.findIndex(s=>s.id===id);
  if(idx<0) return;
  currentStoryIdx = idx;
  activeStory = id;
  const s = STORIES[idx];
  $(".section-title").textContent = `Select Level – ${s.name}`;
  renderLevels();
  document.querySelectorAll('.pill').forEach(b=>{
    if(b.dataset.open===id) b.textContent = "Open Book";
  });
}
function levelUnlocked(storyIdx, levelNum){
  if(!storyUnlocked(storyIdx)) return false;
  const s = STORIES[storyIdx];
  const cleared = progress[s.id]?.clearedLevels || 0;
  return levelNum <= cleared + 1;
}
function renderLevels(){
  const grid = $("#levelGrid");
  const s = STORIES[currentStoryIdx];
  const cleared = progress[s.id]?.clearedLevels || 0;
  grid.innerHTML = "";

  for(let i=1;i<=s.levels;i++){
    const card = document.createElement("div");
    card.className = "level-card";

    // --- Labeling logic ---
   let label;
if (i === 1) {
  label = `${s.name}<br><small>Story</small>`;
} else {
  label = `${s.name}<br><small>Game ${i-1}</small>`;
}


    card.innerHTML = `
      <div class="level-thumb" style="background:url('${s.art}') center/cover no-repeat;"></div>
      <div class="level-foot">
        <span class="level-badge">${label}</span>
        <button class="big-btn playBtn" data-lvl="${i}">
          ${i === 1 ? "Read ▶" : "Play ▶"}
        </button>
      </div>
      ${!levelUnlocked(currentStoryIdx,i)? 
  `<div class="lock-card"><span>Clear Game ${i-1} first</span></div>`:""}
    `;
    grid.appendChild(card);
  }
}

openStoryById(activeStory);

/* -------------- Events: open story from pill -------------- */
document.addEventListener("click", (e)=>{
  const t = e.target;

  // open story
if(t.matches("[data-open]")){
  const id = t.getAttribute("data-open");
  const idx = STORIES.findIndex(s=>s.id===id);
  if(storyUnlocked(idx)) {
    openStorybook(id); // open storybook first
  }
}


  // play level
// play level
if(t.classList.contains("playBtn")){
  const lvl = Number(t.dataset.lvl);
  if(!levelUnlocked(currentStoryIdx,lvl)) return;

  if(lvl === 1){
    // 📖 open the storybook instead of a game
    openStorybook(activeStory);
  } else {
    startGame(lvl);
  }
}


});

/* ----------------- Storybook Logic ----------------- */
let storyPages = [];
let currentPage = 0;

function openStorybook(storyId) {
  activeStory = storyId;
  currentStoryIdx = STORIES.findIndex(st => st.id === storyId);
  const s = STORIES[currentStoryIdx];
  if (!s) return;

  // Check for intro video
  if (s.video && !progress[s.id]?.videoPlayed) {
    playStoryVideo(s.video, () => {
      progress[s.id] = { ...progress[s.id], videoPlayed: true };
      save();
      showStoryPages(storyId);
    });
  } else {
    showStoryPages(storyId);
  }
}

// 👉 Move your page logic into its own helper
function showStoryPages(storyId) {
  const s = STORIES[currentStoryIdx];

if (s.video) {
  $("#replayRibbon").classList.remove("hidden");
} else {
  $("#replayRibbon").classList.add("hidden");
}

  if (storyId === "creation") {
    storyPages = [
      { text: "In the beginning, God created the heavens and the earth.", art: "images/creation1.png" },
      { text: "Day 1 — God said, 'Let there be light!' And there was light. He called the light 'Day' and the darkness 'Night.'", art: "images/creation2.png" },
      { text: "Day 2 — God made the sky above and the waters below.", art: "images/creation3.png" },
      { text: "Day 3 — God gathered the waters to make seas, and dry land appeared. Plants and trees grew.", art: "images/creation4.png" },
      { text: "Day 4 — God made the sun to shine by day, and the moon and stars to shine at night.", art: "images/creation5.png" },
      { text: "Day 5 — God filled the sky with birds and the sea with fish.", art: "images/creation6.png" },
      { text: "Day 6 — God made the animals on the land. Then God made Adam and Eve.", art: "images/creation7.png" },
      { text: "Day 7 — God rested. He blessed this day as special.", art: "images/creation8.png" }
    ];
  } else if (storyId === "noah") {
    storyPages = [
      { text: "God saw the world was full of sin, but Noah found favor with God.", art: "images/noah1.png" },
      { text: "God told Noah to build a great Ark to save his family and the animals.", art: "images/noah2.png" },
      { text: "Noah and his sons worked hard, building the Ark just as God commanded.", art: "images/noah3.png" },
      { text: "Two of every kind of animal came to the Ark — lions, elephants, birds, and more!", art: "images/noah4.png" },
      { text: "Rain poured for 40 days and 40 nights. The whole earth was covered with water.", art: "images/noah5.png" },
      { text: "The Ark floated safely on the waters, carrying Noah, his family, and the animals.", art: "images/noah6.png" },
      { text: "At last, the rain stopped, and the Ark rested on the mountains of Ararat.", art: "images/noah7.png" },
      { text: "God placed a rainbow in the sky as a promise never to flood the whole earth again.", art: "images/noah8.png" }
    ];
    } else if (storyId === "david") {
    storyPages = [
      { text: "The Israelites were afraid of a giant named Goliath.", art: "images/david1.png" },
      { text: "Goliath shouted, 'Send someone to fight me!' every day.", art: "images/david2.png" },
      { text: "Young David came to bring food to his brothers at the battle.", art: "images/david3.png" },
      { text: "David trusted God and said, 'I will fight the giant!'", art: "images/david4.png" },
      { text: "King Saul gave David armor, but it was too heavy.", art: "images/david5.png" },
      { text: "David took only his sling and five smooth stones.", art: "images/david6.png" },
      { text: "David said, 'The Lord will help me!' and slung a stone at Goliath.", art: "images/david7.png" },
      { text: "The giant fell, and God gave victory to His people!", art: "images/david8.png" }
    ];
  } else if (storyId === "daniel") {
    storyPages = [
      { text: "Daniel prayed to God every day, even when others said not to.", art: "images/daniel1.png" },
      { text: "The king’s helpers tricked him into making a law: no praying!", art: "images/daniel2.png" },
      { text: "Daniel still prayed, and they told the king.", art: "images/daniel3.png" },
      { text: "The king was sad, but Daniel was thrown into a lions’ den.", art: "images/daniel4.png" },
      { text: "That night, the king could not sleep.", art: "images/daniel5.png" },
      { text: "God sent an angel to shut the lions’ mouths.", art: "images/daniel6.png" },
      { text: "In the morning, Daniel was safe!", art: "images/daniel7.png" },
      { text: "The king praised God, who rescued Daniel.", art: "images/daniel8.png" }
    ];
  } else if (storyId === "jonah") {
    storyPages = [
      { text: "God told Jonah to go preach in Nineveh.", art: "images/jonah1.png" },
      { text: "Jonah ran away and boarded a ship.", art: "images/jonah2.png" },
      { text: "A big storm came, and the sailors were afraid.", art: "images/jonah3.png" },
      { text: "Jonah said, 'Throw me into the sea and it will calm.'", art: "images/jonah4.png" },
      { text: "A giant fish swallowed Jonah!", art: "images/jonah5.png" },
      { text: "Inside the fish, Jonah prayed to God.", art: "images/jonah6.png" },
      { text: "After three days, the fish spit Jonah onto dry land.", art: "images/jonah7.png" },
      { text: "Jonah obeyed God and went to Nineveh.", art: "images/jonah8.png" }
    ];
  } else if (storyId === "nativity") {
    storyPages = [
      { text: "An angel told Mary she would have a baby — God’s Son!", art: "images/nativity1.png" },
      { text: "Joseph was told in a dream to care for Mary and the child.", art: "images/nativity2.png" },
      { text: "They traveled to Bethlehem, but there was no room in the inn.", art: "images/nativity3.png" },
      { text: "Jesus was born in a stable, laid in a manger.", art: "images/nativity4.png" },
      { text: "Angels sang, 'Glory to God in the highest!'", art: "images/nativity5.png" },
      { text: "Shepherds ran to see baby Jesus.", art: "images/nativity6.png" },
      { text: "Wise men followed a star and brought gifts.", art: "images/nativity7.png" },
      { text: "Jesus, the Savior, was born for the world!", art: "images/nativity8.png" }
    ];
  } else if (storyId === "miracles") {
    storyPages = [
      { text: "Jesus healed the sick and gave sight to the blind.", art: "images/miracles1.png" },
      { text: "He calmed a storm with just His words.", art: "images/miracles2.png" },
      { text: "He fed 5,000 people with five loaves and two fish.", art: "images/miracles3.png" },
      { text: "A woman touched His cloak, and she was healed.", art: "images/miracles4.png" },
      { text: "He walked on water to reach His friends.", art: "images/miracles5.png" },
      { text: "Jesus even raised Lazarus from the dead!", art: "images/miracles6.png" },
      { text: "People saw His power and praised God.", art: "images/miracles7.png" },
      { text: "Jesus’ miracles showed His love and authority.", art: "images/miracles8.png" }
    ];
  } else if (storyId === "samaritan") {
    storyPages = [
      { text: "Jesus told a story about loving others.", art: "images/samaritan1.png" },
      { text: "A man was hurt by robbers on the road.", art: "images/samaritan2.png" },
      { text: "A priest walked by but did not help.", art: "images/samaritan3.png" },
      { text: "A Levite also passed and did nothing.", art: "images/samaritan4.png" },
      { text: "A Samaritan stopped and cared for him.", art: "images/samaritan5.png" },
      { text: "He bandaged his wounds and took him to an inn.", art: "images/samaritan6.png" },
      { text: "Jesus said, 'Be like the good Samaritan. Love your neighbor.'", art: "images/samaritan7.png" },
      { text: "We show love by helping others in need.", art: "images/samaritan8.png" }
    ];
  } else if (storyId === "easter") {
    storyPages = [
      { text: "Jesus was arrested though He had done no wrong.", art: "images/easter1.png" },
      { text: "He carried a cross to Calvary.", art: "images/easter2.png" },
      { text: "Soldiers placed a crown of thorns on His head.", art: "images/easter3.png" },
      { text: "Jesus died on the cross to save us from sin.", art: "images/easter4.png" },
      { text: "His friends placed Him in a tomb.", art: "images/easter5.png" },
      { text: "On the third day, the stone was rolled away!", art: "images/easter6.png" },
      { text: "Jesus was alive — He rose from the dead!", art: "images/easter7.png" },
      { text: "Because of Jesus, we have hope forever.", art: "images/easter8.png" }
    ];
} else {
    storyPages = [{ text: s.name, art: s.art }];
  }

  currentPage = 0;
  renderStoryPage();
showView("#storybookView");

}


function renderStoryPage() {
  const storyArt = $("#storyArt");
  const storyText = $("#storyText");

  // Exit animation
  storyArt.classList.add("page-exit-active");
  storyText.classList.add("page-exit-active");

  setTimeout(() => {
    // Update content
    const page = storyPages[currentPage];
    storyArt.src = page.art;
    storyText.innerHTML = highlightText(page.text, activeStory);


    // Reset and add enter animations (while keeping base style!)
    storyArt.className = "page-enter-active";
    storyText.className = "storybook-text page-enter-active";

    // Cleanup after animation
    setTimeout(() => {
      storyArt.className = "";
      storyText.className = "storybook-text"; // keep base style
    }, 600);

    // --- Dots ---
    const dots = $("#pageDots");
    dots.innerHTML = "";
    storyPages.forEach((_, i) => {
      const dot = document.createElement("span");
      if (i === currentPage) dot.classList.add("active");
      dots.appendChild(dot);
    });

    // --- Buttons ---
    $("#prevPage").disabled = currentPage === 0;
    $("#nextPage").textContent =
      currentPage === storyPages.length - 1 ? "Play ▶" : "Next ➡";
  }, 200);
}


// Buttons
$("#prevPage").addEventListener("click", () => {
  if (currentPage > 0) {
    currentPage--;
    renderStoryPage();
  }
});
$("#nextPage").addEventListener("click", () => {
  if (currentPage < storyPages.length - 1) {
    currentPage++;
    renderStoryPage();
  } else {
    // Launch mini-game after last page
    $("#storybookView").classList.add("hidden");
    startGame(1); // Example: start level 1
  }
});

// Close story handler
$("#closeRibbon").addEventListener("click", () => {
  $("#storybookView").classList.add("hidden");
  $("#homeView").classList.remove("hidden");
});


 // Replay video button handler
$("#replayRibbon").addEventListener("click", () => {
  const s = STORIES[currentStoryIdx];
  if (s.video) {
    playStoryVideo(s.video, () => {
      // don’t overwrite progress, just return to pages
      showStoryPages(s.id);
    });
  }
});

 let currentLevel = 1;
let gameTimer = null; // track active timer

/* -------------- Game Flow (placeholder mini-game) -------------- */
function startGame(level) {
  // 🔄 Reset old state
  if (gameTimer) {
    clearTimeout(gameTimer);
    gameTimer = null;
  }

  currentLevel = level;
  const s = STORIES[currentStoryIdx];

  $("#hudTitle").textContent = `${s.name} — Level ${String(level).padStart(2,"0")}`;
  $("#game").style.display = "flex";
  document.body.style.overflow = "hidden";

  // Clear stage each time
  $(".game-stage").innerHTML = "";

  // ✅ Creation story levels
  if (s.id === "creation") {
    if (level === 1 && s.autoComplete) {
      endGameAndRecord();   // auto-finish if just story reading
      return;
    }
    else if (level === 2) {
      // Day 1: Light/Dark
      startCreationGame1();
      return;
    }
   else if (level === 3) {
  startCreationPuzzle(false);  // false = hard (3x3), true = easy (2x2)
  return;
}

  }
  // ⏳ Default fallback (placeholder mini-game)
  gameTimer = setTimeout(endGameAndRecord, 10000);
}


  // Creation Game 1
function startCreationGame1() {
  $(".game-stage").innerHTML = `
    <div id="creationGame1">
      <h2>Day 1 — Light & Darkness</h2>
      <p class="instructions">Tap to bring the light into the world!</p>
      <div id="lightDarkArea">
        <div id="sun">☀️</div>
        <div id="moon">🌙</div>
        <div id="stars">✨✨✨</div>
      </div>
      <div class="progress-wrap">
        <div id="progressBar" class="progress-bar"></div>
      </div>
    </div>
  `;

  let progress = 0;
  const area = $("#lightDarkArea");
  const bar = $("#progressBar");
  const sun = $("#sun");
  const moon = $("#moon");
  const stars = $("#stars");

  // initial states
  sun.style.opacity = 0;
  moon.style.opacity = 1;
  stars.style.opacity = 1;
  bar.style.width = "0%";

  area.addEventListener("click", (e) => {
    // Update progress
    progress = Math.min(progress + 4, 100);
    bar.style.width = progress + "%";

    const ratio = progress / 100;

    // Background shift: night → day
    const night = [0, 0, 30];
    const day = [135, 206, 235];
    const r = Math.round(night[0] + (day[0] - night[0]) * ratio);
    const g = Math.round(night[1] + (day[1] - night[1]) * ratio);
    const b = Math.round(night[2] + (day[2] - night[2]) * ratio);
    area.style.background = `rgb(${r},${g},${b})`;

    // Fade moon & stars
    stars.style.opacity = 1 - ratio;
    moon.style.opacity = 1 - ratio;

    // Sun glow in
    sun.style.opacity = ratio;
    sun.style.transform = `translate(-50%, -50%) scale(${0.6 + ratio * 0.6})`;

    // Tap sparkles
    for (let i = 0; i < 3; i++) {
      const sp = document.createElement("div");
      sp.textContent = ["✨","🌟","💫"][Math.floor(Math.random()*3)];
      sp.className = "sparkle";
      sp.style.left = (e.offsetX + Math.random()*20-10) + "px";
      sp.style.top = (e.offsetY + Math.random()*20-10) + "px";
      area.appendChild(sp);
      setTimeout(() => sp.remove(), 1000);
    }

    // Wiggle feedback
    area.style.transform = "scale(1.02)";
    setTimeout(() => { area.style.transform = "scale(1)"; }, 120);

    // Win condition
    if (progress >= 100) {
      setTimeout(() => {
        launchConfettiSparkles();
        endGameAndRecord();
      }, 800);
    }
  });
}

// Generate stars
function generateStars(count = 40) {
  const area = document.getElementById("lightDarkArea");
  const container = document.getElementById("stars");
  container.innerHTML = "";
  
  for (let i = 0; i < count; i++) {
    const star = document.createElement("span");
    star.textContent = "✦";
    star.className = "star";
    
    // Pixel-based placement keeps stars inside visible bounds
    star.style.top = Math.random() * area.clientHeight + "px";
    star.style.left = Math.random() * area.clientWidth + "px";
    
    star.style.fontSize = (8 + Math.random() * 12) + "px";
    star.style.animationDuration = (1.5 + Math.random() * 2) + "s";
    container.appendChild(star);
  }
}
generateStars();



function launchConfettiSparkles() {
  for (let i = 0; i < 20; i++) {
    const conf = document.createElement("div");
    conf.textContent = "✨";
    conf.style.position = "fixed";
    conf.style.left = Math.random() * window.innerWidth + "px";
    conf.style.top = "-20px";
    conf.style.fontSize = "20px";
    conf.style.transition = "transform 2s ease, opacity 2s ease";
    document.body.appendChild(conf);

    requestAnimationFrame(() => {
      conf.style.transform = `translateY(${window.innerHeight+100}px) rotate(${Math.random()*720}deg)`;
      conf.style.opacity = "0";
    });

    setTimeout(()=>conf.remove(), 2200);
  }
}



$("#replayLevel").addEventListener("click", () => {
  $("#levelComplete").style.display = "none";

  const s = STORIES[currentStoryIdx];

  if (currentLevel === 1) {
    // 👉 Replay storybook instead of jumping back into the game
    $("#game").style.display = "none";
    document.body.style.overflow = "";
    showStoryPages(s.id);
  } else {
    // 👉 Normal replay of game levels
    $("#game").style.display = "none";
    void $("#game").offsetWidth; // force reflow
    startGame(currentLevel);
  }
});



$("#nextLevel").addEventListener("click", () => {
  const s = STORIES[currentStoryIdx];
  if (currentLevel < s.levels) {
    $("#levelComplete").style.display = "none";
    startGame(currentLevel + 1);
  } else {
    $("#levelComplete").style.display = "none";
    $("#game").style.display = "none";
    document.body.style.overflow = "";
    renderStories();
    renderLevels();
  }
});

$("#homeBtn").addEventListener("click", () => {
  $("#levelComplete").style.display = "none";
  $("#game").style.display = "none";
  document.body.style.overflow = "";

  // ✅ make sure home screen is visible again
  $("#homeView").classList.remove("hidden");
  $("#storybookView").classList.add("hidden");

  // ✅ refresh progress so cleared levels show up
  renderStories();
  renderLevels();
});




/* Pause overlay */
const showPause = (v)=> $("#pauseOverlay").style.display = v?"flex":"none";
$("#pauseBtn").addEventListener("click", ()=> showPause(true));
$("#closePause").addEventListener("click", ()=> showPause(false));
$("#goHome").addEventListener("click", ()=>{
  showPause(false);
  $("#game").style.display="none";
  document.body.style.overflow="";
});
$("#quitBtn").addEventListener("click", ()=>{
  showPause(false);
  $("#game").style.display="none";
  document.body.style.overflow="";
});


/* -------------- Keyboard helpers for quick testing -------------- */
document.addEventListener("keydown", (e)=>{
  if(e.key==="Escape"){ showPause(true); }
});

/* attach handlers to dynamic items */
document.addEventListener("click",(e)=>{
  if(e.target.id==="toggleSfx"){ e.target.classList.toggle("ghost"); }
  if(e.target.id==="toggleBgm"){ e.target.classList.toggle("ghost"); }
  if(e.target.id==="helpBtn"){ alert("Help: finish each story’s levels to unlock the next book."); }
});

  // Global keywords across all stories
const HIGHLIGHTS_GLOBAL = {
  "God": "hl-god",
  "Lord": "hl-god",
  "Jesus": "hl-jesus",
  "Christ": "hl-jesus",
  "Holy Spirit": "hl-spirit",
  "Light": "hl-light",
  "Heaven": "hl-heaven",
  "Earth": "hl-earth",
  "Love": "hl-love",
  "Faith": "hl-faith",
  "Pray": "hl-pray",
  "Forgive": "hl-forgive",
  "Sin": "hl-sin"
};

// Story-specific keywords
const HIGHLIGHTS_STORY = {
  creation: {
    "Adam": "hl-person",
    "Eve": "hl-person",
    "Day": "hl-light",
    "Night": "hl-dark",
    "waters": "hl-water",
    "sky": "hl-sky"
  },
  noah: {
    "Noah": "hl-person",
    "Ark": "hl-object",
    "Flood": "hl-water",
    "Rainbow": "hl-promise",
    "Animal": "hl-person"
  },
  david: {
    "David": "hl-person",
    "Goliath": "hl-enemy",
    "King Saul": "hl-person",
    "stone": "hl-object",
    "sling": "hl-object"
  },
  daniel: {
    "Daniel": "hl-person",
    "King": "hl-person",
    "law": "hl-object",
    "lions": "hl-enemy",
    "angel": "hl-spirit"
  },
  jonah: {
    "Jonah": "hl-person",
    "Nineveh": "hl-object",
    "ship": "hl-object",
    "storm": "hl-water",
    "fish": "hl-object",
    "prayed": "hl-pray"
  },
  nativity: {
    "Mary": "hl-person",
    "Joseph": "hl-person",
    "Jesus": "hl-jesus",
    "angel": "hl-spirit",
    "Bethlehem": "hl-earth",
    "Shepherds": "hl-person",
    "Wise men": "hl-person",
    "star": "hl-light"
  },
  miracles: {
    "Jesus": "hl-jesus",
    "blind": "hl-dark",
    "storm": "hl-water",
    "loaves": "hl-object",
    "fish": "hl-object",
    "Lazarus": "hl-person",
    "healed": "hl-faith"
  },
  samaritan: {
    "Jesus": "hl-jesus",
    "Samaritan": "hl-person",
    "priest": "hl-person",
    "Levite": "hl-person",
    "neighbor": "hl-love",
    "love": "hl-love"
  },
  easter: {
    "Jesus": "hl-jesus",
    "cross": "hl-object",
    "Calvary": "hl-earth",
    "crown": "hl-object",
    "thorns": "hl-object",
    "tomb": "hl-object",
    "stone": "hl-object",
    "alive": "hl-light",
    "hope": "hl-faith"
  }
};


  function highlightText(text, storyId) {
  let highlighted = text;

  // Apply global highlights
  for (const [word, cls] of Object.entries(HIGHLIGHTS_GLOBAL)) {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    highlighted = highlighted.replace(regex, `<span class="${cls}">${word}</span>`);
  }

  // Apply story-specific highlights
  if (HIGHLIGHTS_STORY[storyId]) {
    for (const [word, cls] of Object.entries(HIGHLIGHTS_STORY[storyId])) {
      const regex = new RegExp(`\\b${word}\\b`, "gi");
      highlighted = highlighted.replace(regex, `<span class="${cls}">${word}</span>`);
    }
  }

  return highlighted;
}

    // video handling
  function playStoryVideo(src, onFinish) {
  const overlay = $("#videoOverlay");
  const video = $("#storyVideo");

  overlay.classList.remove("hidden");
  video.src = src;
  video.play();

  // When finished, close and run callback
  video.onended = () => {
    overlay.classList.add("hidden");
    onFinish();
  };

  // Skip button
  $("#skipVideo").onclick = () => {
    video.pause();
    overlay.classList.add("hidden");
    onFinish();
  };
}

// Open info panel
document.querySelector("#openInfo").addEventListener("click", () => {
  document.querySelector("#infoPanel").classList.remove("hidden");
});

// Close info panel
document.querySelector("#closeInfo").addEventListener("click", () => {
  document.querySelector("#infoPanel").classList.add("hidden");
});



// Accordion toggle logic
$$(".accordion-header").forEach(header => {
  header.addEventListener("click", () => {
    const body = header.nextElementSibling;

    // Toggle body open/close
    body.classList.toggle("open");

    // Update arrow icon at the end of header text
    if (body.classList.contains("open")) {
      header.innerHTML = header.innerHTML.replace("▼", "▲");
    } else {
      header.innerHTML = header.innerHTML.replace("▲", "▼");
    }
  });
});

/* -------- Profile System -------- */
const PROFILE_KEY = "b33_kids_profile";
let profile = JSON.parse(localStorage.getItem(PROFILE_KEY) || 
  '{"character":"peter","stars":0,"streak":0,"gamesPlayed":0,"storiesCompleted":0,"booksPlayed":[]}'
);

function saveProfile(){ localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); }

const CHARACTER_INFO = {
  peter: {
    name: "Peter",
    bio: "Peter was a fisherman whom Jesus called to follow Him. Though he denied Jesus three times, he later became a bold leader in the early Church."
  },
  jesus: {
    name: "Jesus",
    bio: "Jesus Christ is the Son of God, Savior of the world. He taught with love, healed the sick, and gave His life for us."
  },
  paul: {
    name: "Paul",
    bio: "Paul spread the Gospel across the Roman world. He wrote many letters that are now books of the New Testament."
  },
  noah: {
    name: "Noah",
    bio: "Noah was faithful to God and built an Ark to save his family and animals from the flood."
  },
  david: {
    name: "David",
    bio: "David defeated Goliath with a sling and became king of Israel. He wrote many of the Psalms."
  },
  mary: {
    name: "Mary",
    bio: "Mary, the mother of Jesus, trusted God and humbly accepted His plan to bring the Savior into the world."
  },

  // ✨ NEW disciples
  james: {
    name: "James",
    bio: "James, the son of Zebedee, was one of the first disciples called by Jesus. He boldly preached the Gospel."
  },
  andrew: {
    name: "Andrew",
    bio: "Andrew, Peter’s brother, was a fisherman who left everything to follow Jesus and bring others to Him."
  },
  thomas: {
    name: "Thomas",
    bio: "Thomas, one of the twelve disciples, doubted Jesus’ resurrection until he saw Him with his own eyes."
  },
  bartholomew: {
    name: "Bartholomew",
    bio: "Bartholomew (also called Nathanael) was known for his honesty and his faithful witness to Jesus."
  },
  philip: {
    name: "Philip",
    bio: "Philip brought Nathanael to Jesus and helped spread the good news with boldness and faith."
  },
  john: {
    name: "John",
    bio: "John, the beloved disciple, wrote the Gospel of John and Revelation, and emphasized God’s love."
  },
    esther: { name:"Esther", bio:"Esther was a courageous queen who saved her people by standing before the king and revealing the plot against the Jews." },
  deborah: { name:"Deborah", bio:"Deborah was a prophetess and judge of Israel. She showed wisdom, courage, and led her people to victory." },
  ruth: { name:"Ruth", bio:"Ruth was faithful to her mother-in-law Naomi and trusted God. She became the great-grandmother of King David." }
};


  
function updateProfileUI(){
  const map = { 
    peter: "Peter", jesus: "Jesus", paul: "Paul",
    noah: "Noah", david: "David", mary: "Mother Mary"
  };
  $("#profileAvatar").src = `images/avatar-${profile.character}.png`;
  $("#profileName").textContent = map[profile.character] || "Adventurer";
  $("#profileStars").textContent = `⭐ ${profile.stars} Stars`;

  // Progress bar (steady climb toward big goal)
  const STAR_GOAL = 100;
  const percent = Math.min((profile.stars / STAR_GOAL) * 100, 100);
 animateProgressBar(percent);


  // Update reward text
  const nextGoal = STAR_GOAL;
  document.querySelector("#nextRewardText").textContent =
    profile.stars >= STAR_GOAL
      ? "🎉 You reached the reward milestone!"
      : `Next reward at ${nextGoal} stars`;

  // Stats
  $("#favStory").textContent = `📖 Favorite Story: ${profile.lastStory || "None yet"}`;
  $("#gamesPlayed").textContent = `🎮 Games Played: ${profile.gamesPlayed || 0}`;

  // Character bio
  if (CHARACTER_INFO[profile.character]) {
    $("#profileBio").innerHTML = `
      <h4>About ${CHARACTER_INFO[profile.character].name}</h4>
      <p>${CHARACTER_INFO[profile.character].bio}</p>
    `;
  }

  // HUD and extras
  updateStarHUD();
  renderStreak();
  renderBadges();
}

  // Milestone data
const MILESTONES = [
  { stars: 10, icon:"🎖", label:"Bright Beginner", reward:"Badge" },
  { stars: 25, icon:"📖", label:"Fun Fact", reward:"Bible Fact Unlock" },
  { stars: 50, icon:"🏅", label:"Faithful Learner", reward:"Badge" },
  { stars: 75, icon:"🌈", label:"Rainbow Promise", reward:"Special Theme" },
  { stars: 100, icon:"🎉", label:"Bible Heroes Celebration", reward:"Big Reward" }
];

  
// Bible Fun Facts (unlocked by milestones)
const FUN_FACTS = [
  "The Bible is the best-selling book of all time, with over 5 billion copies distributed.",
  "Psalm 119 is the longest chapter in the Bible, with 176 verses.",
  "Jesus used parables — simple stories — to explain deep truths.",
  "There are 66 books in the Bible, written by over 40 authors."
];

const BADGES = [
  { id:"ark", icon:"🛶", label:"Ark Builder", desc:"Play 10 games.", unlock:p=>p.gamesPlayed >= 10 },
  { id:"giant", icon:"🪨", label:"Giant Slayer", desc:"Earn 50 stars.", unlock:p=>p.stars >= 50 },
  { id:"faithful", icon:"🤝", label:"Faithful Friend", desc:"Play 7 days in a row.", unlock:p=>p.streak >= 7 },

  // NEW ONES
  { id:"bookworm", icon:"📚", label:"Bookworm", desc:"Finish 3 different stories.", unlock:p=>(p.storiesCompleted || 0) >= 3 },
  { id:"worldtraveler", icon:"🌍", label:"World Traveler", desc:"Play stories from 5 different books of the Bible.", unlock:p=>(p.booksPlayed?.length || 0) >= 5 },
  { id:"sharpshooter", icon:"🏹", label:"Sharpshooter", desc:"Defeat Goliath in David’s story.", unlock:p=>p.lastStory === "David & Goliath" },
  { id:"rainbow", icon:"🌈", label:"Rainbow Keeper", desc:"Finish Noah’s Ark story.", unlock:p=>p.lastStory === "Noah’s Ark" }
];
  
// Render stars screen
function updateStarsScreen(){
  // Total stars
  $("#starsTotal").textContent = `⭐ ${profile.stars} Stars`;

  // Build milestones
  const track = $("#rewardTrack");
  track.innerHTML = "";
MILESTONES.forEach(m=>{
  const unlocked = profile.stars >= m.stars;
  const div = document.createElement("div");
  div.className = "milestone " + (unlocked ? "unlocked" : "locked");
  div.innerHTML = `
    <div class="icon">${m.icon}</div>
    <p><strong>${m.stars} Stars</strong></p>
    <small>${m.label}</small>
  `;

  // 🎉 Trigger confetti when you land exactly on this milestone
  if (profile.stars === m.stars) {
    launchConfettiStars();
  }

div.addEventListener("click", ()=>{
  if (unlocked) {
    showRewardModal("🎉 " + m.label, `Reward: ${m.reward}`, m.icon);
  } else {
    showRewardModal("🔒 Locked", `Reach ${m.stars} stars to unlock.`, "❌");
  }
});
track.appendChild(div);
});



  // Daily bonus text
  const today = new Date().toDateString();
  if (profile.lastPlayed === today) {
    $("#dailyBonusText").textContent = "✅ You already collected today's bonus!";
  } else {
    $("#dailyBonusText").textContent = "🎁 Log in today to earn +1 bonus star!";
  }


  // Achievements summary (show same badges here for context)
  const ach = $("#starsAchievements");
  ach.innerHTML = "";
  BADGES.forEach(b=>{
    const unlocked = b.unlock(profile);
    const badge = document.createElement("div");
badge.className = "badge " + (unlocked ? "unlocked" : "locked");
badge.textContent = b.icon;

// ✅ Add modal click here
badge.addEventListener("click", ()=>{
  $("#badgeModal").style.display = "flex";
  $("#badgeModalIcon").textContent = b.icon;
  $("#badgeModalTitle").textContent = b.label;
  $("#badgeModalDesc").textContent = unlocked
    ? `✅ Unlocked! ${b.label} earned by completing: ${b.desc || "special milestone"}.`
    : `🔒 Locked — ${b.desc || "Earn this badge by playing more."}`;
});

ach.appendChild(badge);

  });

  // Fun fact unlock
  if(profile.stars >= 25){
    const fact = FUN_FACTS[Math.floor(Math.random()*FUN_FACTS.length)];
    $("#funFactText").textContent = fact;
  } else {
    $("#funFactText").textContent = "Earn 25 stars to unlock your first fun fact!";
  }
}


function highlightActiveAvatar() {
  $$(".avatarOption").forEach(btn=>{
    btn.classList.toggle("active", btn.dataset.char === profile.character);
  });
}




function updateStarHUD(){
  if ($("#hudStars")) {
    $("#hudStars").textContent = `⭐ ${profile.stars}`;
  }
}

  function setActiveNav(id) {
  document.querySelectorAll("nav.bottom button").forEach(b => 
    b.classList.remove("active")
  );
  document.querySelector(`[data-nav='${id}']`).classList.add("active");
}

  
// HOME button
document.querySelector("[data-nav='home']").addEventListener("click",()=>{
  setActiveNav("home");
  showView("#homeView");
  renderStories();
  renderLevels();
});

// GAMES
document.querySelector("[data-nav='games']").addEventListener("click",()=>{
  setActiveNav("games");
  showView("#gamesView");
  renderGames();
});
  
// STARS button
document.querySelector("[data-nav='ach']").addEventListener("click",()=>{
  setActiveNav("ach");
  showView("#starsView");
  updateStarsScreen();
});

// PROFILE button
document.querySelector("[data-nav='profile']").addEventListener("click",()=>{
  setActiveNav("profile");
  showView("#profilePanel");
  updateProfileUI();
});


// STORE button
document.querySelector("[data-nav='shop']").addEventListener("click",()=>{
  setActiveNav("shop");
  showView("#storeView");
  renderStore();
});






// Avatar choice
$$(".avatarOption").forEach(opt=>{
  opt.addEventListener("click",()=>{
    profile.character = opt.dataset.char;
    saveProfile();
    updateProfileUI();

    // highlight active
    $$(".avatarOption").forEach(o=>o.classList.remove("active"));
    opt.classList.add("active");

    $("#avatarOverlay").style.display="none";
  });
});

  // Open avatar modal
$("#changeAvatarBtn").addEventListener("click",()=>{
  renderAvatars();
  $("#avatarOverlay").style.display="flex";
});



  // Close avatar modal
  $("#closeAvatarOverlay").addEventListener("click",()=>{
    $("#avatarOverlay").style.display="none";
  });




/* -------- Add Stars on Level Complete -------- */
function endGameAndRecord() {
  const s = STORIES[currentStoryIdx];
  const cleared = progress[s.id]?.clearedLevels || 0;
  progress[s.id] = { clearedLevels: Math.max(cleared, currentLevel) };
  save();

  // ⭐ Reward stars
  profile.stars += 1;

  profile.gamesPlayed = (profile.gamesPlayed || 0) + 1;
  profile.lastStory = s.name;

  // ✅ Increment completed stories/books if this was the last level
  if (currentLevel === s.levels) {
    profile.storiesCompleted = (profile.storiesCompleted || 0) + 1;
    if (!profile.booksPlayed.includes(s.id)) {
      profile.booksPlayed.push(s.id);
    }
  }

  saveProfile();
  updateProfileUI();

  // 🎉 Show new toddler-friendly overlay
  showLevelComplete(
    `Great job finishing ${s.name} — Level ${String(currentLevel).padStart(2,"0")}!`
  );
}


function renderBadges(){
  const grid = $("#badgeGrid");
  grid.innerHTML = "";
  BADGES.forEach(b=>{
    const unlocked = b.unlock(profile);
    const div = document.createElement("div");
    div.className = "badge " + (unlocked ? "unlocked" : "locked");
    div.innerHTML = `${b.icon}`;
    div.title = b.label;

    // On click → show modal
    div.addEventListener("click", ()=>{
      $("#badgeModal").style.display = "flex";
      $("#badgeModalIcon").textContent = b.icon;
      $("#badgeModalTitle").textContent = b.label;
      $("#badgeModalDesc").textContent = unlocked
        ? `✅ Unlocked! ${b.label} earned by completing: ${b.desc || "special milestone"}.`
        : `🔒 Locked — ${b.desc || "Earn this badge by playing more."}`;
    });

    grid.appendChild(div);
  });
}

  $("#closeBadgeModal").addEventListener("click", ()=>{
  $("#badgeModal").style.display = "none";
});



function updateStreak(){
  const today = new Date().toDateString();
  const last = profile.lastPlayed || null;

  if (last !== today) {
    if (last) {
      const diff = (new Date(today) - new Date(last)) / (1000*60*60*24);
      if (diff === 1) {
        profile.streak = (profile.streak || 0) + 1;
      } else {
        profile.streak = 1;
      }
    } else {
      profile.streak = 1;
    }

    // Award daily login bonus ⭐
    profile.stars += 1;
    profile.lastPlayed = today;

    saveProfile();
    updateProfileUI();
  }
}

  

function renderStreak(){
  $("#streakText").textContent = `🔥 Current Streak: ${profile.streak||0} days`;
}

function showView(id){
  // Hide all views
  ["#homeView","#starsView","#profilePanel","#storybookView","#storeView","#gamesView"].forEach(sel=>{
    if($(sel)) $(sel).classList.add("hidden");
  });
  // Hide game separately
  $("#game").style.display = "none";

  // Show the one we asked for
  $(id).classList.remove("hidden");
}



  function launchConfettiStars() {
  for (let i = 0; i < 40; i++) {
    const conf = document.createElement("div");
    conf.textContent = "⭐";
    conf.style.position = "fixed";
    conf.style.left = Math.random() * window.innerWidth + "px";
    conf.style.top = "-20px";
    conf.style.fontSize = "20px";
    conf.style.transition = "transform 2s ease, opacity 2s ease";
    document.body.appendChild(conf);

    requestAnimationFrame(() => {
      conf.style.transform = `translateY(${window.innerHeight + 100}px) rotate(${Math.random()*720}deg)`;
      conf.style.opacity = "0";
    });

    setTimeout(()=>conf.remove(), 2200);
  }
}

function showRewardModal(title, desc, icon) {
  $("#rewardModalTitle").textContent = title;
  $("#rewardModalDesc").textContent = desc;
  $("#rewardModalIcon").textContent = icon || "🎁";
  $("#rewardModal").style.display = "flex";
}

$("#closeRewardModal").addEventListener("click", ()=>{
  $("#rewardModal").style.display = "none";
});

function animateProgressBar(newPercent) {
  const bar = $("#starProgressBar");
  const current = parseFloat(bar.style.width) || 0;
  let progress = current;

  const step = () => {
    progress += (newPercent - progress) * 0.1; // ease towards target
    bar.style.width = progress + "%";

    if (Math.abs(progress - newPercent) > 0.5) {
      requestAnimationFrame(step);
    } else {
      // ✅ Snap to final value
      bar.style.width = newPercent + "%";

      // ✨ Trigger sparkle animation
      bar.classList.add("sparkle");
      setTimeout(() => bar.classList.remove("sparkle"), 1200);
    }
  };

  requestAnimationFrame(step);
}




  function renderGames(){
  const grid = $("#gamesGrid");
  grid.innerHTML = "";

  STORIES.forEach((s,i)=>{
    const cleared = progress[s.id]?.clearedLevels || 0;
    const unlocked = cleared >= s.levels; // fully beat the story
    const card = document.createElement("div");
    card.className = "level-card";

    card.innerHTML = `
      <div class="level-thumb" style="background:url('${s.art}') center/cover no-repeat;"></div>
      <div class="level-foot">
        <span class="level-badge">${s.name}</span>
        <button class="big-btn playStoryGame" data-story="${s.id}" ${!unlocked ? "disabled" : ""}>
          ${unlocked ? "Play Game" : "Locked"}
        </button>
      </div>
    `;
    grid.appendChild(card);
  });

    
  // Game BUtton
  $$(".playStoryGame").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const id = btn.dataset.story;
      const idx = STORIES.findIndex(s=>s.id===id);
      if(idx>=0) {
        currentStoryIdx = idx;
        startGame(1); // launch its game directly
      }
    });
  });
}
// end render games

  // Example store catalog
const STORE_ITEMS = [
  { id:"theme1", icon:"🌅", name:"Sunrise Theme", price:10, desc:"A bright morning app theme." },
  { id:"theme2", icon:"🌈", name:"Rainbow Theme", price:20, desc:"Colorful rainbow background." },
  { id:"avatar_moses", icon:"🧔", name:"Avatar: Moses", price:15, desc:"Unlock Moses as your profile avatar." },
  { id:"avatar_esther", icon:"👑", name:"Avatar: Esther", price:15, desc:"Unlock Esther as your profile avatar." },
  { id:"factpack", icon:"📖", name:"Fun Facts Pack", price:15, desc:"Unlock 5 bonus Bible fun facts." },
  { id:"quiz", icon:"❓", name:"Bible Quiz Mode", price:25, desc:"Play a quiz mini-game to test your Bible knowledge." },
  { id:"disciples", icon:"👥", name:"Disciples Pack", price:50, desc:"Unlock new disciple avatars!" },
  { id:"women", icon:"👩‍🦰", name:"Women of the Bible Pack", price:50, desc:"Unlock Esther, Deborah, and Ruth as avatars." },
  { id:"coloring", icon:"🖌️", name:"Coloring Pages", price:20, desc:"Unlock printable and digital Bible coloring pages." },
  { id:"stickerbook", icon:"🌟", name:"Sticker Book", price:30, desc:"Collect stickers and decorate Bible scenes." },
  { id:"goldcross", icon:"✝️", name:"Golden Cross Trophy", price:100, desc:"A special one-time item to show off your faith journey!" }
];


function renderStore(){
  const grid = $("#storeGrid");
  grid.innerHTML = "";

  STORE_ITEMS.forEach(item=>{
    const owned = profile.storeItems?.includes(item.id);
    const affordable = profile.stars >= item.price;

    const div = document.createElement("div");
    div.className = "store-item";

    div.innerHTML = `
      <div class="store-thumb">${item.icon}</div>
      <div class="store-foot">
        <strong>${item.name}</strong>
        <p style="font-size:13px; color:#555;">${item.desc}</p>
        <div class="store-price">⭐ ${item.price} Stars</div>
        <button class="store-btn" ${owned?"disabled":(!affordable?"disabled":"")} 
          data-item="${item.id}">
          ${owned ? "Owned" : affordable ? "Buy" : "Need Stars"}
        </button>
      </div>
    `;
    grid.appendChild(div);
  });

  // Hook up buy buttons
  $$(".store-btn").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const id = btn.dataset.item;
      buyItem(id);
    });
  });
}

function buyItem(id){
  const item = STORE_ITEMS.find(i=>i.id===id);
  if(!item) return;

  if(profile.stars >= item.price && !(profile.storeItems||[]).includes(id)){
    profile.stars -= item.price;
    profile.storeItems = profile.storeItems || [];
    profile.storeItems.push(id);
    saveProfile();
    updateProfileUI();
    renderStore();
    alert(`✅ You bought ${item.name}!`);
  }
}
// end render store
  const ALL_AVATARS = [
  { id:"peter", name:"Peter", img:"images/avatar-peter.png", pack:"base" },
  { id:"jesus", name:"Jesus", img:"images/avatar-jesus.png", pack:"base" },
  { id:"paul", name:"Paul", img:"images/avatar-paul.png", pack:"base" },
  { id:"noah", name:"Noah", img:"images/avatar-noah.png", pack:"base" },
  { id:"david", name:"David", img:"images/avatar-david.png", pack:"base" },
  { id:"mary", name:"Mary", img:"images/avatar-mary.png", pack:"base" },

  // new disciples pack
  { id:"james", name:"James", img:"images/avatar-james.png", pack:"disciples" },
  { id:"andrew", name:"Andrew", img:"images/avatar-andrew.png", pack:"disciples" },
  { id:"thomas", name:"Thomas", img:"images/avatar-thomas.png", pack:"disciples" },
  { id:"bartholomew", name:"Bartholomew", img:"images/avatar-bartholomew.png", pack:"disciples" },
  { id:"philip", name:"Philip", img:"images/avatar-philip.png", pack:"disciples" },
  { id:"john", name:"John", img:"images/avatar-john.png", pack:"disciples" },

      // women of the bible pack
  { id:"esther", name:"Esther", img:"images/avatar-esther.png", pack:"women" },
  { id:"deborah", name:"Deborah", img:"images/avatar-deborah.png", pack:"women" },
  { id:"ruth", name:"Ruth", img:"images/avatar-ruth.png", pack:"women" }
];

 function renderAvatars(){
  const container = $("#avatarGrid");
  container.innerHTML = "";
  ALL_AVATARS.forEach(a=>{
    const unlocked = a.pack==="base" || (profile.storeItems||[]).includes(a.pack);
    const div = document.createElement("div");
    div.className = "avatarOption" + (unlocked ? "" : " locked");
    div.dataset.char = a.id;
    div.innerHTML = `
      <img src="${a.img}" alt="${a.name}">
      <span>${a.name}</span>
    `;
    if(unlocked){
      div.addEventListener("click",()=>{
        profile.character = a.id;
        saveProfile();
        updateProfileUI();
        highlightActiveAvatar();
        $("#avatarOverlay").style.display="none";
      });
    }
    container.appendChild(div);
  });
  highlightActiveAvatar();
}

// end render avatars

  function showLevelComplete(message) {
  const overlay = document.getElementById("levelComplete");
  document.getElementById("levelCompleteMsg").textContent = message;
  overlay.style.display = "flex";

  // Countdown for Next button
  let timeLeft = 15;
  const countdown = document.getElementById("nextCountdown");
  countdown.textContent = `(${timeLeft})`;

  const timer = setInterval(() => {
    timeLeft--;
    countdown.textContent = `(${timeLeft})`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      document.getElementById("nextLevel").click(); // auto next
    }
  }, 1000);
}

function startCreationPuzzle(easyMode = false) {
  $(".game-stage").innerHTML = `
    <div id="puzzleGame">
      <h2>Day 3 — Land & Seas</h2>
      <p class="instructions">Tap two tiles to swap them and complete the picture!</p>
      <div id="puzzleGrid" class="puzzle-grid"></div>
      <button id="toggleModeBtn" class="big-btn">Switch to ${easyMode ? "Hard (3x3)" : "Easy (2x2)"} Mode</button>
    </div>
  `;

  const grid = document.getElementById("puzzleGrid");
  const size = easyMode ? 2 : 3; // 2x2 for easy, 3x3 for hard
  let tiles = [];

  // 🔑 Set grid layout
  grid.style.gridTemplateColumns = `repeat(${size}, 90px)`;
  grid.style.gridTemplateRows = `repeat(${size}, 90px)`;

  // ✅ Use Day 3 story art (creation4.png) as puzzle image
  const puzzleImage = "images/creation4.png";

  // Build tiles
  for (let i = 0; i < size * size; i++) {
    const tile = document.createElement("div");
    tile.className = "puzzle-tile";
    tile.dataset.index = i;

    const row = Math.floor(i / size);
    const col = i % size;
    tile.style.backgroundImage = `url('${puzzleImage}')`;
    tile.style.backgroundSize = `${size * 100}% ${size * 100}%`;
    tile.style.backgroundPosition = `${(-col * 100)}% ${(-row * 100)}%`;
    tile.style.backgroundColor = "#eee"; // fallback if image missing

    tiles.push(tile);
  }

  // Shuffle tiles
  for (let i = tiles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
  }

  // Render shuffled tiles
  tiles.forEach(tile => grid.appendChild(tile));

  // Swap logic
  let firstTile = null;
  grid.addEventListener("click", (e) => {
    const tile = e.target.closest(".puzzle-tile");
    if (!tile) return;

    if (!firstTile) {
      firstTile = tile;
      tile.classList.add("selected");
    } else {
      const temp = tile.style.backgroundPosition;
      tile.style.backgroundPosition = firstTile.style.backgroundPosition;
      firstTile.style.backgroundPosition = temp;

      firstTile.classList.remove("selected");
      firstTile = null;

      // Win check
      if (checkPuzzleSolved(grid, size)) {
        setTimeout(() => {
          launchConfettiSparkles();
          endGameAndRecord();
        }, 500);
      }
    }
  });

  // Toggle easy/hard button
  document.getElementById("toggleModeBtn").addEventListener("click", () => {
    startCreationPuzzle(!easyMode);
  });
}

function checkPuzzleSolved(grid, size) {
  const tiles = [...grid.children];
  return tiles.every((tile, idx) =>
    tile.style.backgroundPosition ===
    `${-(idx % size) * 100}% ${-(Math.floor(idx / size)) * 100}%`
  );
}
