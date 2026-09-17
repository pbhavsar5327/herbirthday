// ============================================================
// EDIT ME: your song. Rename the title and drop the matching
// file into the /music folder next to this page.
// ============================================================
const TRACKS = [
  { title: 'Our Song', src: 'music/track1.mp3' },
];

// ---------- Slide navigation ----------
const slides = Array.from(document.querySelectorAll('.slide'));
const dotsWrap = document.getElementById('dots');
let current = 0;

slides.forEach((_, i) => {
  const d = document.createElement('div');
  d.className = 'dot' + (i === 0 ? ' active' : '');
  d.addEventListener('click', () => goTo(i));
  dotsWrap.appendChild(d);
});
const dotEls = Array.from(dotsWrap.children);

function goTo(i){
  if(i < 0 || i >= slides.length) return;
  slides[current].classList.remove('active');
  dotEls[current].classList.remove('active');
  current = i;
  slides[current].classList.add('active');
  dotEls[current].classList.add('active');
  document.getElementById('prevBtn').disabled = current === 0;
  document.getElementById('nextBtn').disabled = current === slides.length - 1;
}

document.getElementById('nextBtn').addEventListener('click', () => goTo(current + 1));
document.getElementById('prevBtn').addEventListener('click', () => goTo(current - 1));
document.getElementById('restartBtn').addEventListener('click', () => goTo(0));
document.getElementById('prevBtn').disabled = true;

document.addEventListener('keydown', (e) => {
  if(e.key === 'ArrowDown' || e.key === 'ArrowRight') goTo(current + 1);
  if(e.key === 'ArrowUp' || e.key === 'ArrowLeft') goTo(current - 1);
});

// touch swipe
let touchStartY = 0;
document.addEventListener('touchstart', e => touchStartY = e.touches[0].clientY);
document.addEventListener('touchend', e => {
  const dy = touchStartY - e.changedTouches[0].clientY;
  if(Math.abs(dy) > 50){ dy > 0 ? goTo(current+1) : goTo(current-1); }
});

// scroll wheel (debounced)
let wheelLock = false;
document.addEventListener('wheel', e => {
  if(wheelLock) return;
  wheelLock = true;
  if(e.deltaY > 20) goTo(current + 1);
  else if(e.deltaY < -20) goTo(current - 1);
  setTimeout(() => wheelLock = false, 700);
}, { passive:true });

// ---------- Cute rotating note on the cover ----------
const sweetLines = [
  'my favourite person',
  'my happy place',
  'my forever yes',
  'the best part of my day',
  'still my favourite hello'
];
let sweetIdx = 0;
const sweetLineEl = document.getElementById('sweetLine');
setInterval(() => {
  sweetIdx = (sweetIdx + 1) % sweetLines.length;
  sweetLineEl.style.opacity = 0;
  setTimeout(() => {
    sweetLineEl.textContent = sweetLines[sweetIdx];
    sweetLineEl.style.opacity = 1;
  }, 400);
}, 2600);

// ---------- Heart Gallery ----------

// Images are now directly added in index.html.
// No JavaScript is required to generate the collage.
// If an image is missing, show a flower emoji instead.


// ---------- Bunting flags ----------
const buntingColors = ['#F6CBD6','#DAD0F0','#C7E9DA','#FBE0C4','#F6CBD6','#DAD0F0','#C7E9DA'];
const bunting = document.getElementById('bunting');
buntingColors.forEach(c => {
  const f = document.createElement('div');
  f.className = 'flag';
  f.style.background = c;
  bunting.appendChild(f);
});

// ---------- Floating petals ----------
const petalWrap = document.getElementById('petals');
const petalEmojis = ['🌸','💮','🌷','💗'];
for(let i=0;i<14;i++){
  const p = document.createElement('div');
  p.className = 'petal';
  p.textContent = petalEmojis[i % petalEmojis.length];
  p.style.left = Math.random()*100 + 'vw';
  p.style.animationDuration = (9 + Math.random()*10) + 's';
  p.style.animationDelay = (Math.random()*10) + 's';
  p.style.fontSize = (14 + Math.random()*14) + 'px';
  petalWrap.appendChild(p);
}

// ---------- Confetti burst ----------
document.getElementById('confettiBtn').addEventListener('click', () => {
  const emojis = ['💗','🌸','✨','💜','🎀'];
  for(let i=0;i<40;i++){
    const c = document.createElement('div');
    c.className = 'confetti-piece';
    c.textContent = emojis[Math.floor(Math.random()*emojis.length)];
    c.style.left = Math.random()*100 + 'vw';
    c.style.animationDuration = (1.8 + Math.random()*1.4) + 's';
    c.style.animationDelay = (Math.random()*0.6) + 's';
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 3200);
  }
});

// ============================================================
// Music player — full playlist with prev / next / seek
// ============================================================
const audio = document.getElementById('bgAudio');
const playerPill = document.getElementById('playerPill');
const playerPanel = document.getElementById('playerPanel');
const trackTitleEl = document.getElementById('trackTitle');
const playPauseBtn = document.getElementById('playPauseBtn');
const prevTrackBtn = document.getElementById('prevTrackBtn');
const nextTrackBtn = document.getElementById('nextTrackBtn');
const progressTrack = document.getElementById('progressTrack');
const progressFill = document.getElementById('progressFill');
const curTimeEl = document.getElementById('curTime');
const durTimeEl = document.getElementById('durTime');
const playlistEl = document.getElementById('playlist');

let trackIndex = 0;
let isPlaying = false;

function formatTime(sec){
  if(!isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function renderPlaylist(){
  playlistEl.innerHTML = '';
  TRACKS.forEach((t, i) => {
    const item = document.createElement('div');
    item.className = 'playlist-item' + (i === trackIndex ? ' active' : '');
    item.innerHTML = `<span class="note">${i === trackIndex && isPlaying ? '🎵' : '♪'}</span><span>${t.title}</span>`;
    item.addEventListener('click', () => loadTrack(i, true));
    playlistEl.appendChild(item);
  });
}

function loadTrack(i, autoplay){
  trackIndex = (i + TRACKS.length) % TRACKS.length;
  audio.src = TRACKS[trackIndex].src;
  trackTitleEl.textContent = TRACKS[trackIndex].title;
  progressFill.style.width = '0%';
  curTimeEl.textContent = '0:00';
  durTimeEl.textContent = '0:00';
  renderPlaylist();
  if(autoplay){
    audio.play().then(() => { isPlaying = true; updatePlayIcon(); renderPlaylist(); })
      .catch(() => { isPlaying = false; updatePlayIcon(); });
  }
}

function updatePlayIcon(){
  playPauseBtn.textContent = isPlaying ? '⏸' : '▶';
  playerPill.classList.toggle('playing', isPlaying);
}

playPauseBtn.addEventListener('click', () => {
  if(!audio.src){ loadTrack(0, true); return; }
  if(isPlaying){
    audio.pause();
    isPlaying = false;
  } else {
    audio.play().then(() => { isPlaying = true; updatePlayIcon(); }).catch(()=>{});
  }
  updatePlayIcon();
  renderPlaylist();
});

prevTrackBtn.addEventListener('click', () => loadTrack(trackIndex - 1, true));
nextTrackBtn.addEventListener('click', () => loadTrack(trackIndex + 1, true));

audio.addEventListener('timeupdate', () => {
  if(audio.duration){
    progressFill.style.width = (audio.currentTime / audio.duration * 100) + '%';
    curTimeEl.textContent = formatTime(audio.currentTime);
  }
});
audio.addEventListener('loadedmetadata', () => {
  durTimeEl.textContent = formatTime(audio.duration);
});
audio.addEventListener('ended', () => loadTrack(trackIndex + 1, true));

progressTrack.addEventListener('click', (e) => {
  if(!audio.duration) return;
  const rect = progressTrack.getBoundingClientRect();
  const pct = (e.clientX - rect.left) / rect.width;
  audio.currentTime = pct * audio.duration;
});

playerPill.addEventListener('click', () => {
  const willOpen = !playerPanel.classList.contains('open');
  playerPanel.classList.toggle('open');
  if(willOpen && !audio.src){ loadTrack(0, false); }
});

// initialise titles/playlist without autoplaying (autoplay is blocked until a gesture anyway)
trackTitleEl.textContent = TRACKS[0].title;
renderPlaylist();

// single-song mode: no point showing skip controls or a one-item list
if(TRACKS.length <= 1){
  prevTrackBtn.style.display = 'none';
  nextTrackBtn.style.display = 'none';
  playlistEl.style.display = 'none';
  audio.loop = true;
}

const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const closeLightbox = document.getElementById("closeLightbox");

document.querySelectorAll(".heart-img").forEach(img=>{

    img.addEventListener("click",()=>{

        lightbox.style.display="flex";
        lightboxImg.src=img.src;

    });

});

closeLightbox.onclick=()=>{

    lightbox.style.display="none";

};

lightbox.onclick=(e)=>{

    if(e.target===lightbox){

        lightbox.style.display="none";

    }

};