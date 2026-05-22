// =====================================================
// THE WORLD — UNIFIED CLIENT (Games, Layouts, Chat, Auth)
// =====================================================

const WORLD_API = 'https://anikthedev-offical-blackhat-games.hf.space';
let user = JSON.parse(localStorage.getItem('bh_user')) || null;
let currentTab = 'games';

// FIX: Define resolutionScale so engine doesn't crash
if (typeof resolutionScale === 'undefined') window.resolutionScale = window.devicePixelRatio || 1;

// This replaces initGlobalLibrary in your app.js boot
function initTheWorld() {
    const btn = document.getElementById('the-world-btn');
    if (btn) btn.onclick = openWorld;
}

// Global reference so app.js doesn't error
window.initGlobalLibrary = initTheWorld; 

function openWorld() {
    let panel = document.getElementById('world-panel');
    if (!panel) {
        panel = document.createElement('div');
        panel.id = 'world-panel';
        panel.style.cssText = `position:fixed; inset:0; background:rgba(0,0,0,0.98); z-index:99999; display:flex; flex-direction:column; font-family:sans-serif; color:white;`;
        document.body.appendChild(panel);
    }
    renderUI();
}

function switchTab(tab) { currentTab = tab; renderUI(); }

async function renderUI() {
    const panel = document.getElementById('world-panel');
    panel.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:15px; background:#111; border-bottom:1px solid #222;">
            <div style="color:#f2711c; font-weight:bold; font-size:20px;">🌎 THE WORLD</div>
            <button onclick="document.getElementById('world-panel').remove()" style="background:none; border:none; color:#666; font-size:24px; cursor:pointer;">✕</button>
        </div>
        <div style="display:flex; background:#181818; border-bottom:1px solid #222;">
            ${['games', 'layouts', 'chat', 'profile'].map(tab => `
                <button onclick="switchTab('${tab}')" style="flex:1; padding:15px; background:none; border:none; color:${currentTab === tab ? '#f2711c' : '#888'}; font-weight:bold; cursor:pointer; border-bottom: 2px solid ${currentTab === tab ? '#f2711c' : 'transparent'};">
                    ${tab.toUpperCase()}
                </button>
            `).join('')}
        </div>
        <div id="world-content" style="flex:1; overflow-y:auto; padding:20px;">Loading...</div>
    `;
    
    const content = document.getElementById('world-content');
    if (currentTab === 'games') renderGamesTab(content);
    if (currentTab === 'layouts') renderLayoutsTab(content);
    if (currentTab === 'chat') renderChatTab(content);
    if (currentTab === 'profile') renderProfileTab(content);
}

// --- 1. GAMES ---
async function renderGamesTab(el) {
    try {
        const res = await fetch(`${WORLD_API}/games`);
        const json = await res.json();
        const games = json.games || []; // Fix for the .map error
        
        el.innerHTML = `
            <div style="display:flex; gap:10px; margin-bottom:20px;">
                <input id="game-search" placeholder="Search games..." style="flex:1; padding:10px; background:#111; border:1px solid #333; color:white; border-radius:5px;">
                <button onclick="openGameSubmitForm()" style="background:#f2711c; border:none; color:white; padding:10px 15px; border-radius:5px; font-weight:bold; cursor:pointer;">+ SUBMIT</button>
            </div>
            <div id="game-list-inner">
                ${games.map(g => `
                    <div style="background:#1a1a1a; border:1px solid #333; padding:15px; border-radius:10px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
                        <div><strong>${g.title}</strong><br><small style="color:#666;">by ${g.author}</small></div>
                        <button onclick="downloadGame('${g.id}', event)" style="background:#f2711c; border:none; color:white; padding:8px 15px; border-radius:5px; cursor:pointer; font-weight:bold;">PLAY</button>
                    </div>
                `).join('')}
            </div>
        `;
    } catch(e) { el.innerHTML = "Error loading games."; }
}

// --- 2. LAYOUTS ---
async function renderLayoutsTab(el) {
    try {
        const res = await fetch(`${WORLD_API}/layouts`);
        const json = await res.json();
        const layouts = json.layouts || []; // Fix for the .map error
        
        el.innerHTML = `
            <div style="display:flex; gap:10px; margin-bottom:20px;">
                <input placeholder="Search layouts..." style="flex:1; padding:10px; background:#111; border:1px solid #333; color:white; border-radius:5px;">
                <button onclick="openSubmitForm()" style="background:#f2711c; border:none; color:white; padding:10px 15px; border-radius:5px; font-weight:bold; cursor:pointer;">+ SHARE MINE</button>
            </div>
            ${layouts.map(l => `
                <div style="background:#1a1a1a; border:1px solid #333; padding:15px; border-radius:10px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
                    <div><strong>${l.name}</strong><br><small style="color:#666;">for ${l.game} by ${l.author}</small></div>
                    <button onclick="downloadLayout('${l.id}', event)" style="background:#333; border:1px solid #f2711c; color:white; padding:8px 15px; border-radius:5px; cursor:pointer; font-weight:bold;">GET</button>
                </div>
            `).join('')}
        `;
    } catch(e) { el.innerHTML = "Error loading layouts."; }
}

// --- 3. CHAT ---
async function renderChatTab(el) {
    el.innerHTML = `
        <div id="chat-msgs" style="height:60vh; overflow-y:auto; margin-bottom:15px; background:#050505; padding:10px; border-radius:10px; display:flex; flex-direction:column-reverse;"></div>
        <div style="display:flex; gap:10px;">
            <input id="msg-input" placeholder="Type message..." style="flex:1; padding:12px; background:#111; border:1px solid #333; color:white; border-radius:5px;">
            <button onclick="sendMsg()" style="background:#f2711c; color:white; border:none; padding:10px 20px; border-radius:5px; font-weight:bold;">SEND</button>
        </div>`;
    
    const res = await fetch(`${WORLD_API}/chat`);
    const json = await res.json();
    document.getElementById('chat-msgs').innerHTML = json.messages.map(m => `
        <div style="margin-bottom:10px;"><b style="color:#f2711c;">${m.username}:</b> <span style="color:#ddd;">${m.text}</span></div>
    `).join('');
}

async function sendMsg() {
    if (!user) return alert("Please Login first!");
    const text = document.getElementById('msg-input').value;
    if(!text) return;
    await fetch(`${WORLD_API}/chat/send`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({username: user.username, text}) });
    renderChatTab(document.getElementById('world-content'));
}

// --- 4. PROFILE ---
function renderProfileTab(el) {
    if (user) {
        el.innerHTML = `
            <div style="text-align:center; padding-top:50px;">
                <div style="font-size:50px;">😎</div>
                <h2>${user.username}</h2>
                <button onclick="logout()" style="background:#333; color:white; padding:10px 20px; border:none; border-radius:5px; cursor:pointer;">Logout</button>
            </div>`;
    } else {
        el.innerHTML = `
            <div style="max-width:300px; margin: 20px auto; text-align:center;">
                <h3>Join The World</h3>
                <input id="u" placeholder="Username" style="width:100%; padding:10px; margin-bottom:10px; background:#111; border:1px solid #333; color:white; border-radius:5px;">
                <input id="p" type="password" placeholder="Secret Key" style="width:100%; padding:10px; margin-bottom:10px; background:#111; border:1px solid #333; color:white; border-radius:5px;">
                <button onclick="auth('login')" style="width:100%; padding:10px; background:#f2711c; border:none; color:white; font-weight:bold; cursor:pointer; border-radius:5px; margin-bottom:10px;">LOGIN</button>
                <button onclick="auth('signup')" style="width:100%; padding:10px; background:#333; border:none; color:white; font-weight:bold; cursor:pointer; border-radius:5px;">CREATE ACCOUNT</button>
            </div>`;
    }
}

async function auth(mode) {
    const username = document.getElementById('u').value;
    const key = document.getElementById('p').value;
    const res = await fetch(`${WORLD_API}/auth/access`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({username, key, mode}) });
    const json = await res.json();
    if (json.ok) { user = json.user; localStorage.setItem('bh_user', JSON.stringify(user)); renderUI(); } else alert(json.error);
}

function logout() { localStorage.removeItem('bh_user'); user = null; renderUI(); }