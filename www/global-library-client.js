// =====================================================
// GLOBAL LAYOUT LIBRARY — add to app.js
// Change this to your void.vip server URL
// =====================================================
const LIBRARY_SERVER = 'https://anikthedev-offical-blackhat-games.hf.space';

// =====================================================
// Call this once in your boot section
// =====================================================
function initGlobalLibrary() {
    const btn = document.getElementById('global-library-btn');
    if (btn) btn.onclick = openGlobalLibrary;
}

// =====================================================
// OPEN GLOBAL LIBRARY PANEL
// =====================================================
async function openGlobalLibrary() {
    // build the panel
    let panel = document.getElementById('global-library-panel');
    if (!panel) {
        panel = document.createElement('div');
        panel.id = 'global-library-panel';
        panel.style.cssText = `
            position: fixed; inset: 0;
            background: rgba(0,0,0,0.92);
            z-index: 99999;
            display: flex; flex-direction: column;
            font-family: sans-serif; color: white;
            overflow: hidden;
        `;
        panel.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;
                        padding:16px 20px; border-bottom:1px solid #2a2a2a; background:#0f0f0f;">
                <div style="font-weight:bold; font-size:16px; color:#f2711c;">🌐 Global Layout Library</div>
                <button id="close-global-library" style="background:none; border:none; color:#888;
                    font-size:20px; cursor:pointer; padding:4px 8px;">✕</button>
            </div>
            <div style="padding:12px 16px; border-bottom:1px solid #1a1a1a; display:flex; gap:8px;">
                <input id="lib-search" type="text" placeholder="Search by game or layout name..."
                    style="flex:1; background:#1a1a1a; border:1px solid #333; color:white;
                           padding:8px 12px; border-radius:6px; font-size:13px; outline:none;">
                <button id="lib-submit-btn" style="background:#f2711c; color:white; border:none;
                    padding:8px 14px; border-radius:6px; font-weight:bold; cursor:pointer; font-size:13px;">
                    + Submit Mine
                </button>
            </div>
            <div id="lib-list" style="flex:1; overflow-y:auto; padding:12px 16px;">
                <div style="text-align:center; opacity:0.5; padding:40px;">Loading...</div>
            </div>
        `;
        document.body.appendChild(panel);

        document.getElementById('close-global-library').onclick = () => panel.remove();
        document.getElementById('lib-submit-btn').onclick = openSubmitForm;
        document.getElementById('lib-search').oninput = (e) => filterLibrary(e.target.value);
    }

    panel.style.display = 'flex';
    await fetchLayouts();
}

let allLayouts = [];

async function fetchLayouts() {
    const list = document.getElementById('lib-list');
    try {
        const res  = await fetch(`${LIBRARY_SERVER}/layouts`);
        const data = await res.json();
        allLayouts = data.layouts || [];
        renderLibraryList(allLayouts);
    } catch(e) {
        list.innerHTML = `<div style="text-align:center; color:#f44336; padding:40px;">
            Failed to load library.<br><small>${e.message}</small>
        </div>`;
    }
}

function renderLibraryList(layouts) {
    const list = document.getElementById('lib-list');
    if (layouts.length === 0) {
        list.innerHTML = `<div style="text-align:center; opacity:0.5; padding:40px;">No layouts found.</div>`;
        return;
    }

    list.innerHTML = layouts.map(l => `
        <div class="lib-card" data-id="${l.id}" style="
            background:#161616; border:1px solid #2a2a2a; border-radius:8px;
            padding:14px 16px; margin-bottom:10px; cursor:pointer;
            transition: border-color 0.15s;
        " onmouseover="this.style.borderColor='#f2711c'" onmouseout="this.style.borderColor='#2a2a2a'">
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div>
                    <div style="font-weight:bold; font-size:14px; margin-bottom:4px;">${escHtml(l.name)}</div>
                    <div style="font-size:12px; color:#f2711c; margin-bottom:6px;">🎮 ${escHtml(l.game)}</div>
                    <div style="font-size:11px; color:#666;">
                        by ${escHtml(l.author)} &nbsp;·&nbsp;
                        ${l.buttons} btn &nbsp;·&nbsp;
                        ${l.joysticks} joy &nbsp;·&nbsp;
                        ⬇ ${l.downloads}
                    </div>
                </div>
                <button onclick="downloadLayout('${l.id}', event)" style="
                    background:#f2711c; color:white; border:none;
                    padding:8px 14px; border-radius:6px; font-weight:bold;
                    cursor:pointer; font-size:12px; flex-shrink:0; margin-left:12px;
                ">Download</button>
            </div>
        </div>
    `).join('');
}

function filterLibrary(query) {
    const q = query.toLowerCase();
    const filtered = allLayouts.filter(l =>
        l.name.toLowerCase().includes(q) ||
        l.game.toLowerCase().includes(q) ||
        l.author.toLowerCase().includes(q)
    );
    renderLibraryList(filtered);
}

// =====================================================
// DOWNLOAD A LAYOUT
// =====================================================
async function downloadLayout(id, e) {
    e.stopPropagation();
    const btn = e.target;
    btn.innerText = '...';

    try {
        const res = await fetch(`${LIBRARY_SERVER}/layouts/${id}`);
        const data = await res.json();
        if (!data.ok) throw new Error(data.error);

        // Decode the layout from Base64
        const layout = JSON.parse(atob(data.layout.base64));
        
        // Save to local device
        localStorage.setItem('flash_emu_layout', JSON.stringify(layout));

        // UI refresh (switches engine to custom mode)
        const modeSelect = document.getElementById('mode-select');
        if (modeSelect) {
            modeSelect.value = 'custom';
            modeSelect.dispatchEvent(new Event('change'));
        }
        if (window.buildLayoutControls) window.buildLayoutControls();

        btn.innerText = '✅';
        btn.style.background = '#4caf50';
        setTimeout(() => {
            btn.innerText = 'Download';
            btn.style.background = '#f2711c';
        }, 2000);

        log(`Imported: ${data.layout.name}`);
    } catch(err) {
        btn.innerText = '❌';
        alert('Download failed: ' + err.message);
    }
}


// =====================================================
// SUBMIT YOUR OWN LAYOUT
// =====================================================
function openSubmitForm() {
    // get current layout from localStorage
    const saved = localStorage.getItem('flash_emu_layout');
    if (!saved) {
        alert('No layout saved! Create a layout in the Layout Editor first.');
        return;
    }

    let layoutData;
    try { layoutData = JSON.parse(saved); }
    catch(e) { alert('Layout data is invalid.'); return; }

    // build form overlay
    const form = document.createElement('div');
    form.id = 'submit-form-overlay';
    form.style.cssText = `
        position: fixed; inset: 0;
        background: rgba(0,0,0,0.95);
        z-index: 100000;
        display: flex; flex-direction: column;
        justify-content: center; align-items: center;
        font-family: sans-serif; color: white;
        padding: 20px;
    `;
    form.innerHTML = `
        <div style="width:100%; max-width:380px; background:#161616;
                    border:1px solid #2a2a2a; border-radius:12px; padding:24px;">
            <div style="font-size:18px; font-weight:bold; color:#f2711c; margin-bottom:20px;">
                📤 Submit Your Layout
            </div>

            <div style="margin-bottom:14px;">
                <label style="display:block; font-size:11px; color:#888; margin-bottom:6px; text-transform:uppercase; letter-spacing:0.1em;">Layout Name</label>
                <input id="submit-name" type="text" placeholder="e.g. Wolverine Tokyo Setup"
                    style="width:100%; background:#0f0f0f; border:1px solid #333; color:white;
                           padding:10px; border-radius:6px; font-size:14px; outline:none; box-sizing:border-box;">
            </div>

            <div style="margin-bottom:14px;">
                <label style="display:block; font-size:11px; color:#888; margin-bottom:6px; text-transform:uppercase; letter-spacing:0.1em;">Your Name</label>
                <input id="submit-author" type="text" placeholder="e.g. Mustakim"
                    style="width:100%; background:#0f0f0f; border:1px solid #333; color:white;
                           padding:10px; border-radius:6px; font-size:14px; outline:none; box-sizing:border-box;">
            </div>

            <div style="margin-bottom:20px;">
                <label style="display:block; font-size:11px; color:#888; margin-bottom:6px; text-transform:uppercase; letter-spacing:0.1em;">Game It's For</label>
                <input id="submit-game" type="text" placeholder="e.g. Wolverine Tokyo Fury"
                    style="width:100%; background:#0f0f0f; border:1px solid #333; color:white;
                           padding:10px; border-radius:6px; font-size:14px; outline:none; box-sizing:border-box;">
            </div>

            <div style="font-size:11px; color:#555; margin-bottom:16px;">
                Submitting layout with ${layoutData.length} items
                (${layoutData.filter(i=>i.type==='button').length} buttons,
                ${layoutData.filter(i=>i.type==='joystick').length} joysticks)
            </div>

            <div style="display:flex; gap:10px;">
                <button id="submit-cancel" style="flex:1; background:#222; color:#888;
                    border:1px solid #333; padding:12px; border-radius:6px; cursor:pointer;">
                    Cancel
                </button>
                <button id="submit-confirm" style="flex:2; background:#f2711c; color:white;
                    border:none; padding:12px; border-radius:6px; font-weight:bold; cursor:pointer;">
                    Submit Layout
                </button>
            </div>

            <div id="submit-status" style="margin-top:12px; font-size:12px; text-align:center; min-height:16px;"></div>
        </div>
    `;
    document.body.appendChild(form);

    document.getElementById('submit-cancel').onclick = () => form.remove();
    document.getElementById('submit-confirm').onclick = async () => {
        const name   = document.getElementById('submit-name').value.trim();
        const author = document.getElementById('submit-author').value.trim();
        const game   = document.getElementById('submit-game').value.trim();
        const status = document.getElementById('submit-status');
        const btn    = document.getElementById('submit-confirm');

        if (!name || !author || !game) {
            status.style.color = '#f44336';
            status.innerText = 'Please fill in all fields.';
            return;
        }

        btn.innerText = 'Submitting...';
        btn.disabled = true;
        status.style.color = '#888';
        status.innerText = 'Sending...';

        try {
            const res = await fetch(`${LIBRARY_SERVER}/layouts/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, author, game, data: layoutData })
            });
            const data = await res.json();

            if (!data.ok) throw new Error(data.error);

            status.style.color = '#4caf50';
            status.innerText = '✅ Submitted! Thanks ' + author + '!';
            btn.innerText = 'Done!';

            setTimeout(() => {
                form.remove();
                fetchLayouts(); // refresh the list
            }, 1500);

        } catch(err) {
            status.style.color = '#f44336';
            status.innerText = '❌ Failed: ' + err.message;
            btn.innerText = 'Submit Layout';
            btn.disabled = false;
        }
    };
}

function escHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
