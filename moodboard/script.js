// Simple client-side scaffold for Moodboard + Trends demo
// Admin creds configurable here:
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'admin';

// --- Simple view handling
const views = {
  login: document.getElementById('view-login'),
  dashboard: document.getElementById('view-dashboard'),
  editor: document.getElementById('view-editor'),
  branding: document.getElementById('view-branding')
};

const setView = (name) => {
  Object.values(views).forEach(v => v.classList.add('hidden'));
  views[name].classList.remove('hidden');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll(`.nav-btn[data-view="${name}"]`).forEach(b=>b.classList.add('active'));
  window.scrollTo(0,0);
};

// NAV
document.querySelectorAll('[data-view]').forEach(btn=>{
  btn.addEventListener('click', ()=> setView(btn.getAttribute('data-view')));
});
document.getElementById('nav-logo').addEventListener('click', ()=> setView('dashboard'));
document.getElementById('logout').addEventListener('click', ()=>{
  localStorage.removeItem('mb_auth');
  setView('login');
});

// Show admin creds hint
document.getElementById('admin-cred').textContent = `${ADMIN_USER} / ${ADMIN_PASS}`;

// --- Login
document.getElementById('login-form').addEventListener('submit', (e)=>{
  e.preventDefault();
  const u = document.getElementById('username').value.trim();
  const p = document.getElementById('password').value.trim();
  if(u === ADMIN_USER && p === ADMIN_PASS){
    localStorage.setItem('mb_auth', '1');
    setView('dashboard');
  } else {
    alert('Invalid credentials. Use admin credentials shown below or change them in script.js');
  }
});

// Auto-login if already authenticated
if(localStorage.getItem('mb_auth')) setView('dashboard'); else setView('login');

// --- Dark mode
const root = document.documentElement;
const themeToggle = document.getElementById('theme-toggle');
const applyTheme = (dark) => {
  document.body.classList.toggle('dark', dark);
  localStorage.setItem('mb_theme', dark ? 'dark' : 'light');
};
const current = localStorage.getItem('mb_theme') || 'dark';
applyTheme(current === 'dark');
themeToggle.addEventListener('click', ()=> applyTheme(!document.body.classList.contains('dark')));

// --- Moodboard editor logic
const moodboard = document.getElementById('moodboard');
const fileInput = document.getElementById('file-input');
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');
const unsplashKeyInput = document.getElementById('unsplash-key');

const createItem = (src) => {
  const item = document.createElement('div');
  item.className = 'mood-item';
  item.draggable = true;

  const img = document.createElement('img');
  img.src = src;
  img.loading = 'lazy';
  item.appendChild(img);

  const rem = document.createElement('button');
  rem.className = 'remove';
  rem.textContent = '✕';
  rem.onclick = () => item.remove();
  item.appendChild(rem);

  item.addEventListener('dragstart', (ev)=>{
    ev.dataTransfer.setData('text/plain', src);
  });

  moodboard.appendChild(item);
};

moodboard.addEventListener('drop', (ev)=>{
  ev.preventDefault();
  const data = ev.dataTransfer.getData('text/plain');
  if(data) createItem(data);
});

// file upload
fileInput.addEventListener('change', (e)=>{
  const f = e.target.files[0];
  if(!f) return;
  const reader = new FileReader();
  reader.onload = (ev)=>{
    createItem(ev.target.result);
  };
  reader.readAsDataURL(f);
  fileInput.value = '';
});

// simple Unsplash search (client-side). For production, proxy the key server-side.
async function unsplashSearch(q, key){
  if(!q) return [];
  const k = key || '';
  try{
    const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&per_page=20`, {
      headers: { Authorization: 'Client-ID ' + k }
    });
    if(!res.ok) {
      console.warn('Unsplash failed', res.status);
      return [];
    }
    const j = await res.json();
    return j.results || [];
  }catch(e){
    console.error(e);
    return [];
  }
}

document.getElementById('search-unsplash').addEventListener('click', async ()=>{
  const q = searchInput.value.trim();
  searchResults.innerHTML = '<div class="small-note">Searching...</div>';
  const key = unsplashKeyInput.value.trim();
  const data = await unsplashSearch(q, key);
  searchResults.innerHTML = '';
  if(data.length===0){ searchResults.innerHTML = '<div class="muted">No results — check key or query.</div>'; return; }
  data.forEach(img=>{
    const el = document.createElement('img');
    el.src = img.urls small || img.urls.thumb || img.urls.small;
  });
});


// better rendering of results with click-to-add
document.getElementById('search-unsplash').addEventListener('click', async ()=>{
  const q = searchInput.value.trim();
  if(!q){ searchResults.innerHTML = '<div class="muted">Enter search term</div>'; return; }
  searchResults.innerHTML = '<div class="small-note">Searching Unsplash...</div>';
  const key = unsplashKeyInput.value.trim();
  const items = await unsplashSearch(q, key);
  searchResults.innerHTML = '';
  if(items.length===0){ searchResults.innerHTML = '<div class="muted">No images — try adding an Unsplash key in the input above.</div>'; return; }
  items.forEach(im=>{
    const img = document.createElement('img');
    img.src = im.urls.small;
    img.title = im.alt_description || '';
    img.onclick = ()=> createItem(im.urls.regular);
    searchResults.appendChild(img);
  });
});

// make moodboard items draggable between positions
moodboard.addEventListener('dragstart', (e)=>{
  if(e.target.classList.contains('mood-item')){
    e.dataTransfer.setData('text/html', e.target.outerHTML);
    e.dataTransfer.effectAllowed = 'move';
    e._dragEl = e.target;
  }
});
moodboard.addEventListener('dragover', (e)=> e.preventDefault());
moodboard.addEventListener('drop', (e)=>{
  e.preventDefault();
  const html = e.dataTransfer.getData('text/html');
  const dragEl = e._dragEl;
  const target = e.target.closest('.mood-item');
  if(dragEl && target && dragEl !== target){
    moodboard.insertBefore(dragEl, target.nextSibling);
  } else if(html && !e._dragEl){
    // external image dropped (data URL)
    const div = document.createElement('div');
    div.innerHTML = html;
    const newEl = div.firstChild;
    moodboard.appendChild(newEl);
  }
});

// clear board
document.getElementById('clear-board').addEventListener('click', ()=> moodboard.innerHTML = '<div class="drop-hint">Drag images here or click images to add</div>');

// Create quick board
document.getElementById('create-board').addEventListener('click', ()=>{
  const name = prompt('Moodboard name');
  if(!name) return;
  const node = document.createElement('div');
  node.className = 'card';
  node.innerHTML = `<strong>${name}</strong><div class="small-note">Click to open</div>`;
  node.onclick = ()=> setView('editor');
  document.getElementById('boards').appendChild(node);
});

// --- Export PDF & PPTX
document.getElementById('export-pdf').addEventListener('click', async ()=>{
  // remove drop hint if exists
  const hint = document.querySelector('.drop-hint'); if(hint) hint.style.display='none';
  const el = document.getElementById('moodboard');
  const canvas = await html2canvas(el, { scale: 2, useCORS: true });
  const imgData = canvas.toDataURL('image/png');
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width, canvas.height] });
  pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
  pdf.save('moodboard.pdf');
});

document.getElementById('export-ppt').addEventListener('click', async ()=>{
  const el = document.getElementById('moodboard');
  const canvas = await html2canvas(el, { scale: 1, useCORS: true });
  const imgData = canvas.toDataURL('image/png');
  const pptx = new PptxGenJS();
  const slide = pptx.addSlide();
  slide.addImage({ data: imgData, x:0.5, y:0.5, w:9, h:5 });
  pptx.writeFile({ fileName: 'moodboard.pptx' });
});

// Branding kit interactions
document.getElementById('add-swatch').addEventListener('click', ()=>{
  const color = prompt('Enter hex color (eg: #1a73e8)');
  if(!color) return;
  const sw = document.createElement('div');
  sw.className = 'swatch';
  sw.textContent = color;
  sw.style.background = color;
  document.getElementById('brand-colors').appendChild(sw);
});

document.getElementById('logo-upload').addEventListener('change', (e)=>{
  const f = e.target.files[0];
  if(!f) return;
  const reader = new FileReader();
  reader.onload = (ev)=> {
    const p = document.getElementById('logo-preview');
    p.innerHTML = '<img src="'+ev.target.result+'" style="max-width:160px;max-height:80px" />';
  };
  reader.readAsDataURL(f);
});


// ====== LOGIN HANDLER ======
document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    // Configurable credentials
    const adminUser = "admin";
    const adminPass = "admin";

    if (username === adminUser && password === adminPass) {
        document.getElementById("loginPage").style.display = "none";
        document.getElementById("appPage").style.display = "block";
    } else {
        alert("Invalid username or password.");
    }
});

// ====== DARK MODE TOGGLE ======
const darkModeToggle = document.getElementById("darkModeToggle");
darkModeToggle.addEventListener("click", function () {
    document.body.classList.toggle("dark");

    // Store preference
    if (document.body.classList.contains("dark")) {
        localStorage.setItem("theme", "dark");
    } else {
        localStorage.setItem("theme", "light");
    }
});

// Apply stored theme on load
window.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark");
    }
});


// helpful console message
console.log('Moodboard Trends demo loaded. Edit ADMIN_USER and ADMIN_PASS at top of script.js. Unsplash: add your key in the editor view to search directly. For production, proxy the unsplash key server-side.');
