// =====================================================
// BLACKHAT PRO — TABLE ONLY CLIENT (NO CHUNKING)
// =====================================================

const GAME_LIBRARY_SERVER = 'https://anikthedev-offical-blackhat-games.hf.space'; 

let allGames = [];
let activeCategory = 'All';

// Helpers
if (typeof showLoader !== 'function') window.showLoader = (msg) => console.log("LOADER:", msg);
if (typeof hideLoader !== 'function') window.hideLoader = () => {};
if (typeof log !== 'function') window.log = (msg) => console.log("LOG:", msg);

function initGlobalGameLibrary() {
    const btn = document.getElementById('global-games-btn');
    if (btn) btn.onclick = openGlobalGameLibrary;
}

async function openGlobalGameLibrary() {
    let panel = document.getElementById('global-games-panel');
    if (!panel) {
        panel = document.createElement('div');
        panel.id = 'global-games-panel';
        panel.style.cssText = `position:fixed; inset:0; background:rgba(0,0,0,0.95); z-index:99999; display:flex; flex-direction:column; font-family:sans-serif; color:white; overflow:hidden;`;
        panel.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:14px 18px; border-bottom:1px solid #1e1e1e; background:#0a0a0a; flex-shrink:0;">
                <div style="font-weight:bold; font-size:15px; color:#f2711c;">🌐 Global Game Library</div>
                <div style="display:flex; gap:8px; align-items:center;">
                    <button id="gg-submit-btn" style="background:#f2711c; color:white; border:none; padding:7px 14px; border-radius:6px; font-weight:bold; cursor:pointer; font-size:12px;">+ Submit Game</button>
                    <button onclick="this.closest('#global-games-panel').remove()" style="background:none; border:none; color:#666; font-size:22px; cursor:pointer;">✕</button>
                </div>
            </div>
            <div style="padding:10px 16px; border-bottom:1px solid #1a1a1a; flex-shrink:0;">
                <input id="gg-search" type="text" placeholder="Search games..." style="width:100%; background:#161616; border:1px solid #2a2a2a; color:white; padding:8px 12px; border-radius:6px; font-size:13px; outline:none;">
            </div>
            <div id="gg-list" style="flex:1; overflow-y:auto; padding:12px 16px;"></div>
        `;
        document.body.appendChild(panel);
        document.getElementById('gg-submit-btn').onclick = openGameSubmitForm;
    }
    await fetchGames();
}

async function fetchGames() {
    const res = await fetch(`${GAME_LIBRARY_SERVER}/games`);
    const data = await res.json();
    allGames = data.games || [];
    const list = document.getElementById('gg-list');
    list.innerHTML = allGames.map(g => `
        <div style="background:#111; border:1px solid #222; padding:15px; margin-bottom:10px; border-radius:8px; display:flex; justify-content:space-between;">
            <div><b>${g.title}</b><br><small>${g.author} | ${g.category}</small></div>
            <button onclick="downloadGame('${g.id}', event)" style="background:#f2711c; color:white; border:none; padding:8px 15px; border-radius:6px; cursor:pointer;">▶ Play</button>
        </div>
    `).join('');
}

// PLAY: Decodes Base64 from database
// =====================================================
// GLOBAL GAME LIBRARY — CACHING VERSION
// =====================================================

async function downloadGame(id, e) {
    const btn = e.target;
    btn.innerText = '...';
    btn.disabled = true;

    try {
        // Fetch metadata to get the title and URL
        const res = await fetch(`${GAME_LIBRARY_SERVER}/games/${id}`);
        const data = await res.json();
        const game = data.game;

        document.getElementById('global-games-panel')?.remove();
        showLoader(`Preparing ${game.title}...`);

        // Determine source URL (direct SWF data or external URL)
        // If your server uses the /games/file/:id route, use that as the path
        const sourcePath = game.type === 'swf' 
            ? `${GAME_LIBRARY_SERVER}/games/file/${id}` 
            : game.url;

        // Reuse the master load function
        await loadGameFile(sourcePath, game.title);

        hideLoader();
        btn.innerText = '▶ Play';
        btn.disabled = false;
    } catch (err) {
        alert("Global Load Failed: " + err.message);
        hideLoader();
        btn.innerText = '▶ Play';
        btn.disabled = false;
    }
}

// SUBMIT: Sends one single Base64 request
function openGameSubmitForm() {
    const form = document.createElement('div');
    form.id = 'gg-submit-overlay';
    form.style.cssText = `position:fixed; inset:0; background:rgba(0,0,0,0.97); z-index:100001; display:flex; justify-content:center; align-items:center;`;
    form.innerHTML = `
        <div style="width:100%; max-width:350px; background:#111; border:1px solid #222; padding:25px; border-radius:12px;">
            <h3 style="color:#f2711c; margin-top:0;">🎮 Submit Game</h3>
            <input id="gg-s-title" placeholder="Title" style="width:100%; padding:10px; margin-bottom:10px; background:#000; color:white; border:1px solid #333;">
            <input id="gg-s-author" placeholder="Author" style="width:100%; padding:10px; margin-bottom:10px; background:#000; color:white; border:1px solid #333;">
            <input id="gg-s-category" placeholder="Category" style="width:100%; padding:10px; margin-bottom:10px; background:#000; color:white; border:1px solid #333;">
            <select id="gg-s-type" onchange="document.getElementById('gg-url-row').style.display = this.value==='url'?'block':'none'; document.getElementById('gg-swf-row').style.display = this.value==='swf'?'block':'none';" style="width:100%; padding:10px; margin-bottom:10px;">
                <option value="url">URL Link</option>
                <option value="swf">Upload SWF</option>
            </select>
            <div id="gg-url-row"><input id="gg-s-url" placeholder="https://..." style="width:100%; padding:10px; margin-bottom:10px;"></div>
            <div id="gg-swf-row" style="display:none;"><input id="gg-s-file" type="file" accept=".swf"></div>
            <div id="gg-s-status" style="font-size:12px; margin-bottom:10px; color:#888;"></div>
            <button onclick="submitGame()" id="gg-s-confirm" style="width:100%; padding:12px; background:#f2711c; border:none; color:white; font-weight:bold; cursor:pointer;">Submit</button>
            <button onclick="this.parentElement.parentElement.remove()" style="width:100%; background:none; border:none; color:#555; margin-top:10px; cursor:pointer;">Cancel</button>
        </div>
    `;
    document.body.appendChild(form);
}

async function submitGame() {
    const btn = document.getElementById('gg-s-confirm');
    const status = document.getElementById('gg-s-status');
    const type = document.getElementById('gg-s-type').value;
    btn.disabled = true;

    try {
        let base64 = null;
        if (type === 'swf') {
            const file = document.getElementById('gg-s-file').files[0];
            if (!file) throw new Error("Select file");
            status.innerText = "⏳ Converting to Base64...";
            base64 = await new Promise(r => { const rd = new FileReader(); rd.onloadend = () => r(rd.result.split(',')[1]); rd.readAsDataURL(file); });
        }

        status.innerText = "🚀 Uploading to database...";
        const res = await fetch(`${GAME_LIBRARY_SERVER}/games/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: document.getElementById('gg-s-title').value,
                author: document.getElementById('gg-s-author').value,
                category: document.getElementById('gg-s-category').value,
                type: type,
                swf_url: base64,
                url: document.getElementById('gg-s-url')?.value,
                engine: 'v2026'
            })
        });

        if (!res.ok) throw new Error("Server rejected upload. File might be too large.");
        status.innerText = "✅ Success!";
        setTimeout(() => location.reload(), 1500);
    } catch (e) {
        status.innerText = "❌ " + e.message;
        btn.disabled = false;
    }
}