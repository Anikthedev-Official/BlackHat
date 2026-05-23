// =====================================================
// THE WORLD — MASTER CLIENT V6 (SECURE & STABLE)
// No Supabase SDK needed on client side.
// =====================================================

const WORLD_API = 'https://anikthedev-offical-blackhat-games.hf.space';
let user = JSON.parse(localStorage.getItem('bh_user')) || null;
let currentTab = 'games';
let chatMode = 'global';
let chatTarget = null;
let isEditMode = false;

// --- 1. BOOT FIXES (Run these first so app.js doesn't crash) ---
if (typeof window.resolutionScale === 'undefined') window.resolutionScale = window.devicePixelRatio || 1;

window.initTheWorld = () => { 
    const btn = document.getElementById('the-world-btn');
    if (btn) btn.onclick = openWorld; 
};
window.initGlobalLibrary = window.initTheWorld;
window.initGlobalGameLibrary = window.initTheWorld;

// Auto-run init just in case
setTimeout(window.initTheWorld, 100);

// Fallbacks
if (typeof showLoader !== 'function') window.showLoader = (m) => console.log(m);
if (typeof updateLoader !== 'function') window.updateLoader = (m, p) => console.log(m, p);
if (typeof hideLoader !== 'function') window.hideLoader = () => {};

// --- 2. CORE UI ---
function openWorld() {
    let panel = document.getElementById('world-panel');
    if (!panel) {
        panel = document.createElement('div');
        panel.id = 'world-panel';
        panel.style.cssText = `position:fixed; inset:0; background:rgba(10,10,10,0.98); z-index:99999; display:flex; flex-direction:column; font-family:sans-serif; color:white;`;
        document.body.appendChild(panel);
    }
    panel.style.display = 'flex';
    renderUI();
}

function switchTab(t) { currentTab = t; isEditMode = false; renderUI(); }

async function renderUI() {
    const panel = document.getElementById('world-panel');
    panel.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:15px; background:#111; border-bottom:1px solid #222;">
            <b style="color:#f2711c; font-size:18px;">🌎 THE WORLD</b>
            <button onclick="document.getElementById('world-panel').style.display='none'" style="background:none; border:none; color:#666; font-size:24px; cursor:pointer;">✕</button>
        </div>
        <div style="display:flex; background:#161616; border-bottom:1px solid #222;">
            ${['games', 'layouts', 'chat', 'profile'].map(t => `<button onclick="switchTab('${t}')" style="flex:1; padding:15px; background:none; border:none; color:${currentTab===t?'#f2711c':'#666'}; font-weight:bold; cursor:pointer;">${t.toUpperCase()}</button>`).join('')}
        </div>
        <div id="world-content" style="flex:1; overflow-y:auto; padding:20px;"></div>
    `;
    const el = document.getElementById('world-content');
    if (currentTab === 'games') renderGames(el);
    else if (currentTab === 'layouts') renderLayouts(el);
    else if (currentTab === 'chat') renderChat(el);
    else if (currentTab === 'profile') renderProfile(el);
}

// --- 3. GAMES & PLAY ---
async function renderGames(el) {
    el.innerHTML = 'Loading...';
    const res = await fetch(`${WORLD_API}/games`);
    const data = await res.json();
    el.innerHTML = `<button onclick="openGameSubmitForm()" style="width:100%; padding:12px; background:#f2711c; border:none; color:white; margin-bottom:15px; border-radius:8px; font-weight:bold;">+ SUBMIT GAME</button>` +
    (data.games || []).map(g => `<div style="background:#111; border:1px solid #222; padding:15px; margin-bottom:10px; border-radius:10px; display:flex; justify-content:space-between; align-items:center;">
        <div><b>${g.title}</b><br><small style="color:#555;">by ${g.author}</small></div>
        <button onclick="downloadGame('${g.id}', '${g.title.replace(/'/g, "")}')" style="background:#f2711c; color:white; border:none; padding:8px 15px; border-radius:5px; font-weight:bold;">PLAY</button>
    </div>`).join('');
}

async function downloadGame(id, title) {
    document.getElementById('world-panel').style.display = 'none';
    const fileUrl = `${WORLD_API}/games/file/${id}`;
    if (window.loadGameFile) await window.loadGameFile(fileUrl, title);
    else {
        showLoader("Loading...");
        if (!window.currentPlayer) await initPlayer();
        await window.currentPlayer.load({ url: fileUrl });
        hideLoader();
    }
}

// --- 4. LAYOUTS ---
async function renderLayouts(el) {
    const res = await fetch(`${WORLD_API}/layouts`);
    const data = await res.json();
    el.innerHTML = `<button onclick="openLayoutSubmitForm()" style="width:100%; padding:12px; background:#333; color:white; border:1px solid #f2711c; margin-bottom:15px; border-radius:8px; font-weight:bold;">+ SHARE MY CONTROLS</button>` +
    (data.layouts || []).map(l => `<div style="background:#111; border:1px solid #222; padding:15px; border-radius:12px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
        <div><b>${l.name}</b><br><small style="color:#555;">for ${l.game} by ${l.author}</small></div>
        <button onclick="importLayout('${l.id}')" style="background:#333; color:white; border:1px solid #f2711c; padding:8px 15px; border-radius:5px;">GET</button>
    </div>`).join('');
}

async function importLayout(id) {
    const res = await fetch(`${WORLD_API}/layouts/${id}`);
    const data = await res.json();
    localStorage.setItem('flash_emu_layout', JSON.stringify(JSON.parse(atob(data.layout.base64))));
    if (window.buildLayoutControls) window.buildLayoutControls();
    alert("Applied!");
}

// --- 5. CHAT (Global & Private) ---
// --- 5. CHAT (Global & Private Master) ---
async function renderChat(el) {
    // 1. Setup the Tab Navigation
    el.innerHTML = `
        <div style="display:flex; gap:10px; margin-bottom:15px;">
            <button onclick="chatMode='global'; renderChat(document.getElementById('world-content'))" style="flex:1; padding:10px; background:${chatMode==='global'?'#f2711c':'#222'}; border:none; color:white; border-radius:6px; font-weight:bold; cursor:pointer;">GLOBAL</button>
            <button onclick="chatMode='private'; renderChat(document.getElementById('world-content'))" style="flex:1; padding:10px; background:${chatMode==='private'?'#f2711c':'#222'}; border:none; color:white; border-radius:6px; font-weight:bold; cursor:pointer;">PRIVATE</button>
        </div>
        <div id="chat-sub-content"></div>`;
    
    const sub = document.getElementById('chat-sub-content');

    // 2. GLOBAL MODE
    if (chatMode === 'global') {
        sub.innerHTML = `
            <div id="chat-msgs" style="height:55vh; overflow-y:auto; display:flex; flex-direction:column-reverse; background:black; padding:15px; border-radius:10px; border:1px solid #222; margin-bottom:10px;"></div>
            <div style="display:flex; gap:10px;">
                <input id="chat-in" placeholder="Type a message..." style="flex:1; padding:12px; background:#111; color:white; border:1px solid #333; border-radius:8px;">
                <button onclick="sendMsg('global')" style="background:#f2711c; color:white; border:none; padding:10px 20px; border-radius:8px; font-weight:bold;">SEND</button>
            </div>`;
        
        try {
            const res = await fetch(`${WORLD_API}/chat`);
            const d = await res.json();
            document.getElementById('chat-msgs').innerHTML = d.messages.map(m => `
                <div style="margin-bottom:10px;">
                    <b style="color:#f2711c; cursor:pointer;" onclick="chatTarget='${m.username}'; chatMode='private'; renderUI();">${m.username}:</b> 
                    <span style="color:#ddd;">${m.text}</span>
                </div>`).join('');
        } catch(e) { sub.innerHTML = "Failed to load chat."; }

    // 3. PRIVATE MODE
    } else {
        if (!user) {
            sub.innerHTML = `<div style="text-align:center; padding:40px; opacity:0.5;">Please login to use Private DMs.</div>`;
            return;
        }

        if (chatTarget) {
            // VIEW: Chatting with someone
            sub.innerHTML = `
                <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">
                    <button onclick="chatTarget=null; renderUI();" style="background:#333; color:white; border:none; padding:5px 12px; border-radius:5px; cursor:pointer;">← Back</button>
                    <b>${chatTarget}</b>
                </div>
                <div id="chat-msgs" style="height:50vh; overflow-y:auto; background:black; padding:15px; border-radius:10px; border:1px solid #222; margin-bottom:10px; display:flex; flex-direction:column;"></div>
                <div style="display:flex; gap:10px;">
                    <input id="chat-in" placeholder="Send private message..." style="flex:1; padding:12px; background:#111; color:white; border:1px solid #333; border-radius:8px;">
                    <button onclick="sendMsg('private')" style="background:#f2711c; color:white; border:none; padding:10px 20px; border-radius:8px; font-weight:bold;">SEND</button>
                </div>`;
            
            const res = await fetch(`${WORLD_API}/chat/private/${user.username}/${chatTarget}`);
            const d = await res.json();
            document.getElementById('chat-msgs').innerHTML = (d.messages || []).map(m => `
                <div style="text-align:${m.sender === user.username ? 'right' : 'left'}; margin-bottom:12px;">
                    <span style="background:${m.sender === user.username ? '#f2711c' : '#222'}; padding:8px 15px; border-radius:12px; display:inline-block; max-width:80%;">${m.text}</span>
                </div>`).join('');
            const box = document.getElementById('chat-msgs'); box.scrollTop = box.scrollHeight;

        } else {
            // VIEW: Search and Inbox
            sub.innerHTML = `
                <div style="margin-bottom:20px;">
                    <input oninput="searchU(this.value)" placeholder="🔍 Search users to add/chat..." style="width:100%; padding:12px; background:#111; border:1px solid #333; color:white; border-radius:8px; box-sizing:border-box;">
                    <div id="s-res" style="margin-top:10px;"></div>
                </div>
                <h4 style="color:#555; font-size:11px; letter-spacing:1px; margin-bottom:10px;">RECENT CONVERSATIONS</h4>
                <div id="inbox-list"></div>`;
            
            const res = await fetch(`${WORLD_API}/chat/inbox/${user.username}`);
            const d = await res.json();
            document.getElementById('inbox-list').innerHTML = (d.contacts || []).map(c => `
                <div onclick="chatTarget='${c}'; renderUI();" style="padding:15px; background:#111; border:1px solid #222; border-radius:10px; margin-bottom:8px; cursor:pointer; font-weight:bold;">👤 ${c}</div>
            `).join('') || '<p style="color:#333; text-align:center; padding:20px;">No messages yet.</p>';
        }
    }
}

// --- HELPER: SEARCH FUNCTION (Must be outside renderChat) ---
async function searchU(q) {
    const resEl = document.getElementById('s-res');
    if (!resEl) return;
    if (q.length < 2) { resEl.innerHTML = ''; return; }

    try {
        const res = await fetch(`${WORLD_API}/users/search?q=${q}`);
        const d = await res.json();
        resEl.innerHTML = d.users.map(u => `
            <div style="background:#1a1a1a; border:1px solid #333; padding:10px; border-radius:8px; margin-bottom:5px; display:flex; justify-content:space-between; align-items:center;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <img src="${u.avatar_url || 'https://api.dicebear.com/7.x/pixel-art/svg?seed='+u.username}" style="width:30px; height:30px; border-radius:50%; object-fit:cover;">
                    <b>${u.username}</b>
                </div>
                <div style="display:flex; gap:5px;">
                    <button onclick="chatTarget='${u.username}'; chatMode='private'; renderUI();" style="background:#333; color:white; border:none; padding:6px 12px; border-radius:4px; font-size:11px; cursor:pointer;">DM</button>
                    <button onclick="sendFriendReq('${u.username}')" style="background:#f2711c; color:white; border:none; padding:6px 12px; border-radius:4px; font-size:11px; font-weight:bold; cursor:pointer;">+ ADD</button>
                </div>
            </div>`).join('');
    } catch (e) { console.error("Search failed", e); }
}

// --- HELPER: SEND MESSAGE ---
async function sendMsg(type) {
    const input = document.getElementById('chat-in');
    const text = input.value.trim();
    if (!user || !text) return;

    const body = type === 'global' 
        ? { username: user.username, text } 
        : { sender: user.username, receiver: chatTarget, text };

    const endpoint = type === 'global' ? '/chat/send' : '/chat/private/send';

    await fetch(`${WORLD_API}${endpoint}`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(body) 
    });
    
    input.value = '';
    renderUI();
}



async function sendMsg(type) {
    const text = document.getElementById('chat-in').value;
    if (!user || !text) return;
    const body = type === 'global' ? { username: user.username, text } : { sender: user.username, receiver: chatTarget, text };
    await fetch(`${WORLD_API}/chat/${type==='global'?'send':'private/send'}`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) });
    document.getElementById('chat-in').value = '';
    renderUI();
}

// --- 6. PROFILE LOGIC (FIXED) ---

async function renderProfile(el) {
    // If user is not logged in, show the login form
    if (!user) {
        renderLoginUI(el);
        return;
    }

    el.innerHTML = '<p style="text-align:center; opacity:0.5;">Loading profile...</p>';

    try {
        // Fetch Friends and Requests
        const res = await fetch(`${WORLD_API}/friends/data/${user.username}`);
        const data = await res.json();
        const allFriends = data.friends || [];

        const pending = allFriends.filter(f => f.receiver === user.username && f.status === 'pending');
        const accepted = allFriends.filter(f => f.status === 'accepted');

        if (isEditMode) {
            // --- EDIT MODE VIEW ---
            el.innerHTML = `
                <div style="text-align:center;">
                    <h3 style="color:#f2711c;">EDIT PROFILE</h3>
                    <img src="${user.avatar_url || 'https://api.dicebear.com/7.x/pixel-art/svg?seed='+user.username}" style="width:100px; height:100px; border-radius:50%; opacity:0.5;">
                    <button onclick="openAvatarEditor()" style="display:block; margin: 10px auto; background:#f2711c; color:white; border:none; padding:8px 15px; border-radius:5px; cursor:pointer;">Change Photo</button>
                    <textarea id="edit-bio" placeholder="Write a bio..." style="width:100%; height:80px; background:#111; color:white; border:1px solid #333; border-radius:8px; padding:10px; margin-top:20px; box-sizing:border-box;">${user.bio || ''}</textarea>
                    <button onclick="saveProfile()" style="width:100%; background:#f2711c; color:white; padding:15px; border:none; font-weight:bold; margin-top:10px; border-radius:8px; width:100%; cursor:pointer;">SAVE CHANGES</button>
                    <button onclick="isEditMode=false; renderUI();" style="background:none; border:none; color:#555; margin-top:10px; cursor:pointer;">Cancel</button>
                </div>`;
        } else {
            // --- NORMAL PROFILE VIEW ---
            el.innerHTML = `
                <div style="text-align:center; padding-bottom:20px;">
                    <img src="${user.avatar_url || 'https://api.dicebear.com/7.x/pixel-art/svg?seed='+user.username}" style="width:100px; height:100px; border-radius:50%; border:2px solid #f2711c; object-fit:cover; margin-bottom:10px;">
                    <h2 style="margin:0;">${user.username}</h2>
                    <p style="color:#666; font-size:14px; margin-bottom:15px;">${user.bio || 'No bio yet.'}</p>
                    <button onclick="isEditMode=true; renderUI();" style="background:#222; color:#f2711c; border:1px solid #f2711c; padding:8px 20px; border-radius:20px; font-size:12px; font-weight:bold; cursor:pointer;">EDIT PROFILE</button>
                </div>

                <div style="background:#111; padding:15px; border-radius:12px; border:1px solid #222; margin-bottom:15px;">
                    <h4 style="margin:0 0 10px; color:#f2711c; font-size:11px;">REQUESTS (${pending.length})</h4>
                    ${pending.map(p => `
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                            <span>${p.sender}</span>
                            <button onclick="respondFriend('${p.sender}', 'accepted')" style="background:#4caf50; color:white; border:none; padding:5px 10px; border-radius:5px; cursor:pointer;">ACCEPT</button>
                        </div>
                    `).join('') || '<p style="color:#333; font-size:12px; margin:0;">No new requests.</p>'}
                </div>

                <div style="background:#111; padding:15px; border-radius:12px; border:1px solid #222;">
                    <h4 style="margin:0 0 10px; color:#f2711c; font-size:11px;">FRIENDS (${accepted.length})</h4>
                    ${accepted.map(f => {
                        const fn = f.sender === user.username ? f.receiver : f.sender;
                        return `<div onclick="chatTarget='${fn}'; chatMode='private'; renderUI();" style="padding:10px; background:#181818; border-radius:8px; margin-bottom:5px; cursor:pointer; font-weight:bold; display:flex; justify-content:space-between;"><span>👤 ${fn}</span> <small style="color:#444;">CHAT</small></div>`;
                    }).join('') || '<p style="color:#333; font-size:12px; margin:0;">No friends yet.</p>'}
                </div>
                
                <button onclick="logoutWorld()" style="margin-top:30px; background:none; border:none; color:#444; text-decoration:underline; font-size:12px; cursor:pointer; width:100%;">Sign Out</button>
            `;
        }
    } catch (err) {
        // If the backend fails (404), we still show the profile
        el.innerHTML = `<div style="text-align:center;"><h2>${user.username}</h2><p>Error loading friends.</p><button onclick="logoutWorld()">Logout</button></div>`;
    }
}

// --- MISSING FUNCTION: THE LOGIN UI ---
function renderLoginUI(el) {
    el.innerHTML = `
        <div style="max-width:320px; margin: 40px auto; text-align:center; background:rgba(255,255,255,0.02); padding:30px; border-radius:20px; border:1px solid #111;">
            <h2 style="color:#f2711c; margin-top:0;">${authMode === 'login' ? 'Welcome Back' : 'Create Identity'}</h2>
            <p style="font-size:12px; color:#555; margin-bottom:25px;">Enter your credentials to access the world.</p>
            
            <input id="u-login" placeholder="Username" style="width:100%; padding:14px; margin-bottom:12px; background:#000; border:1px solid #222; color:white; border-radius:10px; box-sizing:border-box;">
            <input id="p-login" type="password" placeholder="Secret Key" style="width:100%; padding:14px; margin-bottom:20px; background:#000; border:1px solid #222; color:white; border-radius:10px; box-sizing:border-box;">
            
            <button onclick="handleAuth()" style="width:100%; padding:14px; background:#f2711c; color:white; font-weight:bold; border:none; border-radius:10px; cursor:pointer;">${authMode.toUpperCase()}</button>
            
            <p style="font-size:13px; color:#f2711c; margin-top:20px; cursor:pointer; opacity:0.8;" onclick="authMode='${authMode==='login'?'signup':'login'}'; renderUI();">
                ${authMode === 'login' ? "New here? Create account" : "Already have an account? Login"}
            </p>
        </div>`;
}

// --- RESPOND TO FRIEND REQ ---
async function respondFriend(sender, action) {
    await fetch(`${WORLD_API}/friends/respond`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ sender, receiver: user.username, action })
    });
    renderUI(); // Refresh the tab
}
async function auth(mode) {
    const username = document.getElementById('u-in').value;
    const key = document.getElementById('p-in').value;
    const res = await fetch(`${WORLD_API}/auth/access`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({username, key, mode}) });
    const data = await res.json();
    if(data.ok) { user = data.user; localStorage.setItem('bh_user', JSON.stringify(user)); renderUI(); } else alert(data.error);
}

async function saveP() {
    const bio = document.getElementById('ebio').value;
    await fetch(`${WORLD_API}/user/update-profile`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({username: user.username, bio, avatar_url: user.avatar_url}) });
    user.bio = bio; localStorage.setItem('bh_user', JSON.stringify(user)); isEditMode = false; renderUI();
}

// --- 7. AVATAR EDITOR & SUBMISSIONS ---
function openAvatarEditor() {
    if (!user) return alert("Login first");

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = e => {
        const reader = new FileReader();
        reader.onload = () => {
            const div = document.createElement('div');
            div.style.cssText = `position:fixed; inset:0; background:black; z-index:1000005; padding:20px; display:flex; flex-direction:column; align-items:center;`;
            div.innerHTML = `
                <div style="flex:1; width:100%; overflow:hidden; display:flex; justify-content:center;">
                    <img id="crop-img" src="${reader.result}" style="max-width:100%;">
                </div>
                <div style="display:flex; gap:10px; width:100%; max-width:400px; margin-top:15px;">
                    <button id="cancel-av" style="flex:1; padding:15px; background:#333; color:white; border:none; border-radius:8px; cursor:pointer;">CANCEL</button>
                    <button id="save-av" style="flex:2; padding:15px; background:#f2711c; color:white; font-weight:bold; border:none; border-radius:8px; cursor:pointer;">SAVE PHOTO</button>
                </div>
            `;
            document.body.appendChild(div);

            const cropper = new Cropper(document.getElementById('crop-img'), { aspectRatio: 1, viewMode: 1 });

            document.getElementById('cancel-av').onclick = () => div.remove();

            document.getElementById('save-av').onclick = async () => {
                const btn = document.getElementById('save-av');
                btn.innerText = "SAVING..."; btn.disabled = true;

                // Create a 150x150 square version of the photo
                const canvas = cropper.getCroppedCanvas({ width: 150, height: 150 });
                const base64 = canvas.toDataURL('image/jpeg', 0.7); // Compressed to stay small

                try {
                    const res = await fetch(`${WORLD_API}/user/upload-avatar`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username: user.username, image: base64 })
                    });

                    const data = await res.json();
                    if (data.ok) {
                        user.avatar_url = base64;
                        localStorage.setItem('bh_user', JSON.stringify(user));
                        location.reload(); // Refresh to see the new pic
                    } else {
                        alert("Fail: " + data.error);
                        btn.disabled = false; btn.innerText = "SAVE PHOTO";
                    }
                } catch (err) {
                    alert("Connection error");
                    btn.disabled = false;
                }
            };
        };
        reader.readAsDataURL(e.target.files[0]);
    };
    input.click();
}

function openGameSubmitForm() {
    const div = document.createElement('div');
    div.style.cssText = `position:fixed; inset:0; background:rgba(0,0,0,0.9); z-index:1000001; display:flex; justify-content:center; align-items:center;`;
    div.innerHTML = `<div style="background:#111; padding:25px; border:1px solid #f2711c; width:300px; border-radius:15px;">
        <h3>Submit Game</h3>
        <input id="st" placeholder="Title" style="width:100%; padding:12px; margin-bottom:10px; background:black; color:white; border:1px solid #333; border-radius:8px; box-sizing:border-box;">
        <input id="sc" placeholder="Category" style="width:100%; padding:12px; margin-bottom:10px; background:black; color:white; border:1px solid #333; border-radius:8px; box-sizing:border-box;">
        <input type="file" id="sf" accept=".swf" style="margin-bottom:15px; color:#555;">
        <div id="status-txt" style="font-size:12px; color:#f2711c; margin-bottom:10px; text-align:center;">Ready</div>
        <button onclick="doSubG()" id="sb-btn" style="width:100%; padding:12px; background:#f2711c; color:white; font-weight:bold; border:none; border-radius:8px; cursor:pointer; width:100%;">UPLOAD</button>
        <button onclick="this.closest('div').parentElement.remove()" style="width:100%; background:none; color:#444; border:none; margin-top:10px; cursor:pointer;">Cancel</button>
    </div>`;
    document.body.appendChild(div);
}

async function doSubG() {
    const title = document.getElementById('st').value;
    const file = document.getElementById('sf').files[0];
    const status = document.getElementById('status-txt');
    if(!title || !file) return;
    document.getElementById('sb-btn').disabled = true;
    status.innerText = "Uploading...";
    const reader = new FileReader();
    reader.onload = async () => {
        const swf_url = reader.result.split(',')[1];
        await fetch(`${WORLD_API}/games/submit`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({title, author:user.username, category:document.getElementById('sc').value, swf_url}) });
        location.reload();
    };
    reader.readAsDataURL(file);
}

function openLayoutSubmitForm() {
    const saved = localStorage.getItem('flash_emu_layout');
    const name = prompt("Layout Name:");
    const game = prompt("Game Name:");
    if(!name || !game) return;
    fetch(`${WORLD_API}/layouts/submit`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({name, author:user.username, game, data:JSON.parse(saved)}) }).then(() => alert("Shared!"));
}
// --- 2. SEND FRIEND REQUEST FUNCTION ---
async function sendFriendReq(target) {
    if (!user) return alert("Login first");
    if (target === user.username) return alert("Can't add yourself");

    const res = await fetch(`${WORLD_API}/friends/request`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ sender: user.username, receiver: target })
    });
    const data = await res.json();
    if (data.ok) alert("Request Sent to " + target);
    else alert("Request already pending");
}