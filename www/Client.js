// =====================================================
// THE WORLD — MASTER CLIENT V9 (FIXED & UNIFIED)
// =====================================================

const WORLD_API = 'https://anikthedev-offical-blackhat-games.hf.space';
let user = JSON.parse(localStorage.getItem('bh_user')) || null;
let currentTab = 'games';
let authMode = 'login';
let chatMode = 'global';
let chatTarget = null;
let isEditMode = false;

// --- 1. BOOT COMPATIBILITY (Fixed ReferenceErrors) ---
if (typeof window.resolutionScale === 'undefined') window.resolutionScale = window.devicePixelRatio || 1;

window.initTheWorld = () => { 
    const btn = document.getElementById('the-world-btn');
    if (btn) btn.onclick = openWorld; 
};
window.initGlobalLibrary = window.initTheWorld;
window.initGlobalGameLibrary = window.initTheWorld;

window.switchTab = (t) => { 
    currentTab = t; 
    isEditMode = false; 
    renderUI(); 
};

window.logoutWorld = () => { 
    localStorage.removeItem('bh_user'); 
    user = null; 
    location.reload(); 
};

// Fallback UI Helpers
if (typeof showLoader !== 'function') window.showLoader = (m) => console.log(m);
if (typeof updateLoader !== 'function') window.updateLoader = (m, p) => console.log(m, p);
if (typeof hideLoader !== 'function') window.hideLoader = () => {};

// --- 2. CORE UI MANAGER ---
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

async function renderUI() {
    const panel = document.getElementById('world-panel');
    panel.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:15px; background:#111; border-bottom:1px solid #222;">
            <b style="color:#f2711c; font-size:18px; letter-spacing:1px;">🌎 THE WORLD</b>
            <button onclick="document.getElementById('world-panel').style.display='none'" style="background:none; border:none; color:#666; font-size:26px; cursor:pointer;">✕</button>
        </div>
        <div style="display:flex; background:#161616; border-bottom:1px solid #222;">
            ${['games', 'layouts', 'chat', 'profile'].map(t => `
                <button onclick="switchTab('${t}')" style="flex:1; padding:15px; background:none; border:none; color:${currentTab===t?'#f2711c':'#666'}; font-weight:bold; cursor:pointer; border-bottom: 2px solid ${currentTab===t?'#f2711c':'transparent'};">
                    ${t.toUpperCase()}
                </button>
            `).join('')}
        </div>
        <div id="world-content" style="flex:1; overflow-y:auto; padding:20px;"></div>
    `;
    const el = document.getElementById('world-content');
    if (currentTab === 'games') renderGames(el);
    else if (currentTab === 'layouts') renderLayouts(el);
    else if (currentTab === 'chat') renderChat(el);
    else if (currentTab === 'profile') renderProfile(el);
}

// --- 3. GAMES TAB ---
async function renderGames(el) {
    el.innerHTML = '<p style="text-align:center; opacity:0.5;">Connecting to vault...</p>';
    const res = await fetch(`${WORLD_API}/games`);
    const data = await res.json();
    
    el.innerHTML = `<button onclick="openGameSubmitForm()" style="width:100%; padding:12px; background:#f2711c; border:none; color:white; margin-bottom:15px; border-radius:8px; font-weight:bold;">+ SUBMIT SWF</button>` +
    (data.games || []).map(g => `
        <div style="background:#111; border:1px solid #222; padding:15px; border-radius:10px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
            <div style="min-width:0;">
                <b style="font-size:15px;">${g.title}</b><br>
                <small style="color:#555;">by ${g.author} • ${g.category}</small>
            </div>
            <button onclick="downloadGlobalGame('${g.id}', '${g.title.replace(/'/g, "")}')" style="background:#f2711c; color:white; border:none; padding:8px 18px; border-radius:5px; font-weight:bold; cursor:pointer;">PLAY</button>
        </div>
    `).join('');
}

window.downloadGlobalGame = async (id, title) => {
    document.getElementById('world-panel').style.display = 'none';
    const fileUrl = `${WORLD_API}/games/file/${id}`;
    if (window.loadGameFile) {
        await window.loadGameFile(fileUrl, title);
    } else {
        showLoader(`Streaming ${title}...`);
        if (!window.currentPlayer) await initPlayer();
        await window.currentPlayer.load({ url: fileUrl });
        hideLoader();
    }
};

// --- 4. LAYOUTS TAB ---
async function renderLayouts(el) {
    const res = await fetch(`${WORLD_API}/layouts`);
    const data = await res.json();
    el.innerHTML = `<button onclick="openLayoutSubmitForm()" style="width:100%; padding:12px; background:#333; color:white; border:1px solid #f2711c; margin-bottom:15px; border-radius:8px; font-weight:bold;">+ SHARE CURRENT LAYOUT</button>` +
    (data.layouts || []).map(l => `
        <div style="background:#111; border:1px solid #222; padding:15px; border-radius:10px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
            <div><b>${l.name}</b><br><small style="color:#555;">for ${l.game} by ${l.author}</small></div>
            <button onclick="importLayout('${l.id}')" style="background:#333; color:white; border:1px solid #f2711c; padding:8px 15px; border-radius:6px; font-weight:bold; cursor:pointer;">GET</button>
        </div>
    `).join('');
}

window.importLayout = async (id) => {
    const res = await fetch(`${WORLD_API}/layouts/${id}`);
    const data = await res.json();
    localStorage.setItem('flash_emu_layout', JSON.stringify(JSON.parse(atob(data.layout.base64))));
    if (window.buildLayoutControls) window.buildLayoutControls();
    alert("Layout Applied!");
    document.getElementById('world-panel').style.display = 'none';
};

// --- 5. CHAT SYSTEM ---
async function renderChat(el) {
    el.innerHTML = `
        <div style="display:flex; gap:10px; margin-bottom:15px;">
            <button onclick="chatMode='global'; renderChat(document.getElementById('world-content'))" style="flex:1; padding:10px; background:${chatMode==='global'?'#f2711c':'#222'}; border:none; color:white; border-radius:6px; font-weight:bold; cursor:pointer;">GLOBAL</button>
            <button onclick="chatMode='private'; renderChat(document.getElementById('world-content'))" style="flex:1; padding:10px; background:${chatMode==='private'?'#f2711c':'#222'}; border:none; color:white; border-radius:6px; font-weight:bold; cursor:pointer;">PRIVATE</button>
        </div>
        <div id="chat-sub-content"></div>`;
    
    const sub = document.getElementById('chat-sub-content');
    if (chatMode === 'global') {
        sub.innerHTML = `<div id="chat-msgs" style="height:55vh; overflow-y:auto; display:flex; flex-direction:column-reverse; background:black; padding:15px; border-radius:10px; border:1px solid #222; margin-bottom:10px;"></div>
        <div style="display:flex; gap:10px;"><input id="chat-in" placeholder="Say something..." style="flex:1; padding:12px; background:#111; color:white; border:1px solid #333; border-radius:8px;"><button onclick="sendWorldMsg('global')" style="background:#f2711c; color:white; border:none; padding:10px 20px; border-radius:8px; font-weight:bold;">SEND</button></div>`;
        const res = await fetch(`${WORLD_API}/chat`);
        const d = await res.json();
        document.getElementById('chat-msgs').innerHTML = d.messages.map(m => `<div><b style="color:#f2711c; cursor:pointer;" onclick="chatTarget='${m.username}'; chatMode='private'; renderUI();">${m.username}:</b> ${m.text}</div>`).join('');
    } else {
        if (!user) return sub.innerHTML = '<p style="text-align:center; padding:20px;">Login to use Private Chat.</p>';
        if (chatTarget) {
            sub.innerHTML = `<div style="display:flex; gap:10px; margin-bottom:10px;"><button onclick="chatTarget=null; renderUI();" style="background:#333; color:white; border:none; padding:5px 12px; border-radius:5px;">← Back</button><b>Chat with ${chatTarget}</b></div>
            <div id="chat-msgs" style="height:50vh; overflow-y:auto; background:black; padding:15px; border-radius:10px; border:1px solid #222; margin-bottom:10px;"></div>
            <div style="display:flex; gap:10px;"><input id="chat-in" style="flex:1; padding:12px; background:#111; color:white; border:1px solid #333; border-radius:8px;"><button onclick="sendWorldMsg('private')" style="background:#f2711c; color:white; border:none; padding:10px 20px; border-radius:8px;">SEND</button></div>`;
            const res = await fetch(`${WORLD_API}/chat/private/${user.username}/${chatTarget}`);
            const d = await res.json();
            document.getElementById('chat-msgs').innerHTML = d.messages.map(m => `<div style="text-align:${m.sender===user.username?'right':'left'}; margin-bottom:8px;"><span style="background:${m.sender===user.username?'#f2711c':'#222'}; padding:8px 12px; border-radius:10px; display:inline-block;">${m.text}</span></div>`).join('');
        } else {
            sub.innerHTML = `<input oninput="searchU(this.value)" placeholder="Search user..." style="width:100%; padding:12px; background:#111; color:white; border:1px solid #333; border-radius:8px;"><div id="s-res" style="margin-top:10px;"></div>
            <h4 style="color:#444; margin-top:20px;">INBOX</h4><div id="inbox-list"></div>`;
            const res = await fetch(`${WORLD_API}/chat/inbox/${user.username}`);
            const d = await res.json();
            document.getElementById('inbox-list').innerHTML = d.contacts.map(c => `<div onclick="chatTarget='${c}'; renderUI();" style="padding:15px; background:#111; border:1px solid #222; border-radius:8px; margin-bottom:8px; cursor:pointer;">👤 ${c}</div>`).join('') || 'Empty';
        }
    }
}

window.searchU = async (q) => {
    if(q.length<2) return;
    const res = await fetch(`${WORLD_API}/users/search?q=${q}`);
    const d = await res.json();
    document.getElementById('s-res').innerHTML = d.users.map(u => `
        <div style="padding:10px; background:#111; border-bottom:1px solid #222; display:flex; justify-content:space-between; align-items:center;">
            <span>👤 ${u.username}</span>
            <div>
                <button onclick="chatTarget='${u.username}'; renderUI();" style="background:#333; color:white; border:none; padding:5px 10px; border-radius:4px;">DM</button>
                <button onclick="sendFriendReq('${u.username}')" style="background:#f2711c; color:white; border:none; padding:5px 10px; border-radius:4px; margin-left:5px;">+ ADD</button>
            </div>
        </div>`).join('');
};

window.sendWorldMsg = async (type) => {
    const text = document.getElementById('chat-in').value;
    if (!user || !text) return;
    const body = type === 'global' ? { username: user.username, text } : { sender: user.username, receiver: chatTarget, text };
    const endpoint = type === 'global' ? '/chat/send' : '/chat/private/send';
    await fetch(`${WORLD_API}${endpoint}`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) });
    document.getElementById('chat-in').value = '';
    renderUI();
};

window.sendFriendReq = async (target) => {
    await fetch(`${WORLD_API}/friends/request`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({sender: user.username, receiver: target}) });
    alert("Request Sent!");
};

// --- 6. PROFILE TAB ---
async function renderProfile(el) {
    if (!user) {
        el.innerHTML = `<div style="max-width:300px; margin:40px auto; text-align:center;">
            <h2 style="color:#f2711c;">${authMode==='login'?'Login':'Signup'}</h2>
            <input id="u-in" placeholder="Username" style="width:100%; padding:12px; margin-bottom:10px; background:#111; color:white; border:1px solid #333; border-radius:8px;">
            <input id="p-in" type="password" placeholder="Key" style="width:100%; padding:12px; margin-bottom:15px; background:#111; color:white; border:1px solid #333; border-radius:8px;">
            <button onclick="handleAuth()" style="width:100%; padding:12px; background:#f2711c; color:white; font-weight:bold; border:none; border-radius:8px;">${authMode.toUpperCase()}</button>
            <p onclick="authMode=(authMode==='login'?'signup':'login'); renderUI();" style="margin-top:15px; color:#666; cursor:pointer; text-decoration:underline;">${authMode==='login'?'Signup':'Login'}</p>
        </div>`;
        return;
    }

    const res = await fetch(`${WORLD_API}/friends/data/${user.username}`);
    const d = await res.json();
    const pending = d.friends.filter(f => f.receiver === user.username && f.status === 'pending');
    const friends = d.friends.filter(f => f.status === 'accepted');

    if (isEditMode) {
        el.innerHTML = `<div style="text-align:center;">
            <h3>EDIT PROFILE</h3>
            <img src="${user.avatar_url || 'https://api.dicebear.com/7.x/pixel-art/svg?seed='+user.username}" style="width:80px; height:80px; border-radius:50%; opacity:0.5;">
            <button onclick="openAvatarEditor()" style="display:block; margin:10px auto;">Change Photo</button>
            <textarea id="ebio" style="width:100%; height:80px; background:#111; color:white; padding:10px; border-radius:8px; box-sizing:border-box;">${user.bio || ''}</textarea>
            <button onclick="saveProfileChanges()" style="width:100%; padding:15px; background:#f2711c; color:white; font-weight:bold; border:none; border-radius:8px; margin-top:10px;">SAVE</button>
        </div>`;
    } else {
        el.innerHTML = `
            <div style="text-align:center;">
                <img src="${user.avatar_url || 'https://api.dicebear.com/7.x/pixel-art/svg?seed='+user.username}" style="width:100px; height:100px; border-radius:50%; border:2px solid #f2711c; object-fit:cover;">
                <h2>${user.username}</h2>
                <p style="color:#666;">${user.bio || 'No bio yet.'}</p>
                <button onclick="isEditMode=true; renderUI();" style="padding:5px 15px; border-radius:20px; background:#222; color:#f2711c; border:1px solid #f2711c; cursor:pointer;">EDIT PROFILE</button>
            </div>
            <div style="margin-top:20px; background:#111; padding:15px; border-radius:10px;">
                <h4 style="color:#f2711c; margin:0 0 10px;">REQUESTS (${pending.length})</h4>
                ${pending.map(p => `<div style="display:flex; justify-content:space-between; margin-bottom:8px;"><span>${p.sender}</span> <button onclick="respondReq('${p.sender}', 'accepted')" style="background:#4caf50; color:white; border:none; padding:4px 10px; border-radius:5px;">Accept</button></div>`).join('') || 'None'}
            </div>
            <div style="margin-top:20px; background:#111; padding:15px; border-radius:10px;">
                <h4 style="color:#f2711c; margin:0 0 10px;">FRIENDS</h4>
                ${friends.map(f => {
                    const fn = f.sender === user.username ? f.receiver : f.sender;
                    return `<div onclick="chatTarget='${fn}'; chatMode='private'; renderUI();" style="padding:10px; background:#181818; border-radius:8px; margin-bottom:5px; cursor:pointer;">👤 ${fn}</div>`;
                }).join('') || 'None'}
            </div>
            <button onclick="logoutWorld()" style="margin-top:30px; background:none; border:none; color:#444; text-decoration:underline; width:100%;">Logout</button>
        `;
    }
}

window.handleAuth = async () => {
    const username = document.getElementById('u-in').value;
    const key = document.getElementById('p-in').value;
    const res = await fetch(`${WORLD_API}/auth/access`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({username, key, mode: authMode}) });
    const data = await res.json();
    if(data.ok) { user = data.user; localStorage.setItem('bh_user', JSON.stringify(user)); renderUI(); } else alert(data.error);
};

window.saveProfileChanges = async () => {
    const bio = document.getElementById('ebio').value;
    await fetch(`${WORLD_API}/user/update-profile`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({username: user.username, bio, avatar_url: user.avatar_url}) });
    user.bio = bio; localStorage.setItem('bh_user', JSON.stringify(user)); isEditMode = false; renderUI();
};

window.respondReq = async (sender, action) => {
    await fetch(`${WORLD_API}/friends/respond`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({sender, receiver: user.username, action}) });
    renderUI();
};

// --- 7. SUBMISSIONS & AVATAR EDITOR ---
window.openAvatarEditor = () => {
    const input = document.createElement('input'); input.type = 'file';
    input.onchange = e => {
        const reader = new FileReader();
        reader.onload = () => {
            const div = document.createElement('div');
            div.style.cssText = `position:fixed; inset:0; background:black; z-index:1000005; padding:20px; display:flex; flex-direction:column; align-items:center;`;
            div.innerHTML = `<div style="flex:1; overflow:hidden;"><img id="crop-img" src="${reader.result}" style="max-width:100%;"></div><button id="save-av" style="width:100%; padding:15px; background:#f2711c; color:white; font-weight:bold; border:none; margin-top:10px; border-radius:8px; cursor:pointer;">SAVE PHOTO</button>`;
            document.body.appendChild(div);
            const cropper = new Cropper(document.getElementById('crop-img'), { aspectRatio: 1 });
            document.getElementById('save-av').onclick = async () => {
                const canvas = cropper.getCroppedCanvas({width: 150, height: 150});
                const base64 = canvas.toDataURL('image/jpeg', 0.8);
                const res = await fetch(`${WORLD_API}/user/upload-avatar`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({username: user.username, image: base64}) });
                const data = await res.json();
                if (data.ok) { user.avatar_url = base64; localStorage.setItem('bh_user', JSON.stringify(user)); location.reload(); }
            };
        };
        reader.readAsDataURL(e.target.files[0]);
    };
    input.click();
};

window.openGameSubmitForm = () => {
    const div = document.createElement('div');
    div.id = 'g-sub';
    div.style.cssText = `position:fixed; inset:0; background:rgba(0,0,0,0.9); z-index:1000001; display:flex; justify-content:center; align-items:center;`;
    div.innerHTML = `<div style="background:#111; padding:25px; border:1px solid #f2711c; width:300px; border-radius:15px;">
        <h3 style="margin-top:0;">Submit Game</h3>
        <input id="st" placeholder="Title" style="width:100%; padding:12px; margin-bottom:10px; background:black; color:white; border:1px solid #333; border-radius:8px; box-sizing:border-box;">
        <input id="sc" placeholder="Category" style="width:100%; padding:12px; margin-bottom:10px; background:black; color:white; border:1px solid #333; border-radius:8px; box-sizing:border-box;">
        <input type="file" id="sf" accept=".swf" style="margin-bottom:15px; color:#555;">
        <div id="status-txt" style="font-size:12px; color:#f2711c; margin-bottom:10px; text-align:center;">Ready</div>
        <button onclick="doSubG()" id="sb-btn" style="width:100%; padding:12px; background:#f2711c; color:white; font-weight:bold; border:none; border-radius:8px; cursor:pointer; width:100%;">UPLOAD</button>
        <button onclick="document.getElementById('g-sub').remove()" style="width:100%; background:none; color:#444; border:none; margin-top:10px; cursor:pointer;">Cancel</button>
    </div>`;
    document.body.appendChild(div);
};

window.doSubG = async () => {
    const title = document.getElementById('st').value;
    const file = document.getElementById('sf').files[0];
    const status = document.getElementById('status-txt');
    if(!title || !file) return alert("Fill all fields");
    document.getElementById('sb-btn').disabled = true;
    status.innerText = "Encoding...";
    const reader = new FileReader();
    reader.onload = async () => {
        const swf_url = reader.result.split(',')[1];
        await fetch(`${WORLD_API}/games/submit`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({title, author:user.username, category:document.getElementById('sc').value, swf_url}) });
        location.reload();
    };
    reader.readAsDataURL(file);
};

window.openLayoutSubmitForm = () => {
    if(!user) return alert("Login first");
    const saved = localStorage.getItem('flash_emu_layout');
    const name = prompt("Layout Name:");
    const game = prompt("Game Name:");
    if(!name || !game) return;
    fetch(`${WORLD_API}/layouts/submit`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({name, author:user.username, game, data:JSON.parse(saved)}) }).then(() => alert("Shared!"));
};