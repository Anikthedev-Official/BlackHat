// =====================================================
// THE WORLD — MASTER CLIENT V9 (FIXED & UNIFIED)
// =====================================================

let WORLD_API = 'https://anikthedev-offical-blackhat-games.hf.space';
let user = JSON.parse(localStorage.getItem('bh_user')) || null;
let currentTab = 'games';
let authMode = 'login';
let chatMode = 'global';
let chatTarget = null;
let isEditMode = false;

window.ActivateDebugMode = (url = 'http://localhost:7860') => {
    WORLD_API = url;
    console.log(`ActivateDebugMode(): now using ${WORLD_API}`);
    alert(`Debug mode active:\nAPI endpoint set to ${WORLD_API}`);
};

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
    try {
        const res = await fetch(`${WORLD_API}/games`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        
        el.innerHTML = `<button onclick="openGameSubmitForm()" style="width:100%; padding:12px; background:#f2711c; border:none; color:white; margin-bottom:15px; border-radius:8px; font-weight:bold;">+ SUBMIT SWF</button>` +
        (data.games || []).map(g => `
            <div style="background:#111; border:1px solid #222; padding:15px; border-radius:10px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
                <div style="min-width:0;">
                    <b style="font-size:15px;">${g.title}</b><br>
                    <small style="color:#555;">by ${g.author} • ${g.category}</small>
                </div>
                <div style="display:flex; gap:8px; align-items:center;">
                    <button onclick='downloadGlobalGame("${g.id}", ${JSON.stringify(g.title)})' style="background:#f2711c; color:white; border:none; padding:8px 18px; border-radius:5px; font-weight:bold; cursor:pointer;">PLAY</button>
                    ${user?.username === g.author ? `<button onclick='editGame(${JSON.stringify(g.id)}, ${JSON.stringify(g.title)}, ${JSON.stringify(g.category)})' style="background:#444; color:white; border:none; padding:8px 18px; border-radius:5px; font-weight:bold; cursor:pointer;">EDIT</button><button onclick='deleteGame(${JSON.stringify(g.id)})' style="background:#900; color:white; border:none; padding:8px 18px; border-radius:5px; font-weight:bold; cursor:pointer;">DEL</button>` : ''}
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('renderGames failed', error);
        el.innerHTML = `<div style="padding:20px; text-align:center; color:#f2711c;">Could not load games from ${WORLD_API}.<br>${error.message}</div>`;
    }
}

window.downloadGlobalGame = async (id, title) => {
    document.getElementById('world-panel').style.display = 'none';
    const fileUrl = `${WORLD_API}/games/file/${id}`;
    if (window.loadGameFile) {
        await window.loadGameFile(fileUrl, title);
    } else {
        showLoader(`Downloading And Starting ${title}...`,1050);
        if (!window.currentPlayer) await initPlayer();
        await window.currentPlayer.load({ url: fileUrl });
        hideLoader();
    }
};

// --- 4. LAYOUTS TAB ---
async function renderLayouts(el) {
    try {
        const res = await fetch(`${WORLD_API}/layouts`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        el.innerHTML = `<button onclick="openLayoutSubmitForm()" style="width:100%; padding:12px; background:#333; color:white; border:1px solid #f2711c; margin-bottom:15px; border-radius:8px; font-weight:bold;">+ SHARE CURRENT LAYOUT</button>` +
        (data.layouts || []).map(l => `
            <div style="background:#111; border:1px solid #222; padding:15px; border-radius:10px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
                <div><b>${l.name}</b><br><small style="color:#555;">for ${l.game} by ${l.author}</small></div>
                <div style="display:flex; gap:8px; align-items:center;">
                    <button onclick="importLayout('${l.id}')" style="background:#333; color:white; border:1px solid #f2711c; padding:8px 15px; border-radius:6px; font-weight:bold; cursor:pointer;">GET</button>
                    ${user?.username === l.author ? `<button onclick="editLayout(${JSON.stringify(l.id)}, ${JSON.stringify(l.name)}, ${JSON.stringify(l.game)})" style="background:#444; color:white; border:none; padding:8px 15px; border-radius:6px; font-weight:bold; cursor:pointer;">EDIT</button><button onclick="deleteLayout('${l.id}')" style="background:#900; color:white; border:none; padding:8px 15px; border-radius:6px; font-weight:bold; cursor:pointer;">DEL</button>` : ''}
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('renderLayouts failed', error);
        el.innerHTML = `<div style="padding:20px; text-align:center; color:#f2711c;">Could not load layouts from ${WORLD_API}.<br>${error.message}</div>`;
    }
}

window.importLayout = async (id) => {
    const res = await fetch(`${WORLD_API}/layouts/${id}`);
    const data = await res.json();
    localStorage.setItem('flash_emu_layout', JSON.stringify(JSON.parse(atob(data.layout.base64))));
    if (window.buildLayoutControls) window.buildLayoutControls();
    alert("Layout Applied!");
    document.getElementById('world-panel').style.display = 'none';
};

window.editGame = async (id, currentTitle, currentCategory) => {
    if (!user) return alert('Login first.');
    const title = prompt('Game title:', currentTitle);
    if (title === null) return;
    const category = prompt('Category:', currentCategory);
    if (category === null) return;

    const res = await fetch(`${WORLD_API}/games/${id}`, {
        method: 'PUT',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ username: user.username, title, category })
    });
    const data = await res.json();
    if (!data.ok) return alert(data.error || 'Could not update game.');
    alert('Game updated');
    renderUI();
};

window.deleteGame = async (id) => {
    if (!user) return alert('Login first.');
    if (!confirm('Delete this game?')) return;
    const res = await fetch(`${WORLD_API}/games/${id}`, {
        method: 'DELETE',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ username: user.username })
    });
    const data = await res.json();
    if (!data.ok) return alert(data.error || 'Could not delete game.');
    alert('Game deleted');
    renderUI();
};

window.editLayout = async (id, currentName, currentGame) => {
    if (!user) return alert('Login first.');
    const name = prompt('Layout name:', currentName);
    if (name === null) return;
    const game = prompt('Game name:', currentGame);
    if (game === null) return;

    const res = await fetch(`${WORLD_API}/layouts/${id}`, {
        method: 'PUT',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ username: user.username, name, game })
    });
    const data = await res.json();
    if (!data.ok) return alert(data.error || 'Could not update layout.');
    alert('Layout updated');
    renderUI();
};

window.deleteLayout = async (id) => {
    if (!user) return alert('Login first.');
    if (!confirm('Delete this layout?')) return;
    const res = await fetch(`${WORLD_API}/layouts/${id}`, {
        method: 'DELETE',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ username: user.username })
    });
    const data = await res.json();
    if (!data.ok) return alert(data.error || 'Could not delete layout.');
    alert('Layout deleted');
    renderUI();
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
        try {
            const res = await fetch(`${WORLD_API}/chat`);
            const d = await res.json();
            if (!res.ok || !Array.isArray(d.messages)) throw new Error(d.error || 'Unable to load chat');
            document.getElementById('chat-msgs').innerHTML = d.messages.map(m => `
                <div style="display:flex; gap:10px; margin-bottom:12px; align-items:flex-start;">
                    <img src="${m.avatar_url || 'https://api.dicebear.com/7.x/pixel-art/svg?seed=' + m.username}" 
                         onclick="viewUserProfile('${m.username}')"
                         style="width:35px; height:35px; border-radius:50%; border:1px solid #333; cursor:pointer; object-fit:cover;">
                    <div style="flex:1;">
                        <b style="color:#f2711c; font-size:13px; cursor:pointer;" onclick="viewUserProfile('${m.username}')">${m.username}</b>
                        <div style="color:#ddd; font-size:14px; margin-top:2px;">${m.text}</div>
                    </div>
                </div>
            `).join('');
        } catch (e) {
            console.error('Global chat load failed', e);
            document.getElementById('chat-msgs').innerHTML = `<div style="color:#f2711c;">Unable to load global chat. ${e.message}</div>`;
        }
    } else {
        if (!user) return sub.innerHTML = '<p style="text-align:center; padding:20px;">Login to use Private Chat.</p>';
        if (chatTarget) {
            sub.innerHTML = `<div style="display:flex; gap:10px; margin-bottom:10px;"><button onclick="chatTarget=null; renderUI();" style="background:#333; color:white; border:none; padding:5px 12px; border-radius:5px;">← Back</button><b>Chat with ${chatTarget}</b></div>
            <div id="chat-msgs" style="height:50vh; overflow-y:auto; background:black; padding:15px; border-radius:10px; border:1px solid #222; margin-bottom:10px;"></div>
            <div style="display:flex; gap:10px;"><input id="chat-in" style="flex:1; padding:12px; background:#111; color:white; border:1px solid #333; border-radius:8px;"><button onclick="sendWorldMsg('private')" style="background:#f2711c; color:white; border:none; padding:10px 20px; border-radius:8px;">SEND</button></div>`;
            try {
                const res = await fetch(`${WORLD_API}/chat/private/${user.username}/${chatTarget}`);
                const d = await res.json();
                if (!res.ok || !Array.isArray(d.messages)) throw new Error(d.error || 'Unable to load private chat');
                document.getElementById('chat-msgs').innerHTML = d.messages.map(m => {
                    const isMe = m.sender === user.username;
                    const avatar = isMe ? user.avatar_url || 'https://api.dicebear.com/7.x/pixel-art/svg?seed=' + user.username : 'https://api.dicebear.com/7.x/pixel-art/svg?seed=' + m.sender;
                    return `
                        <div style="display:flex; flex-direction:${isMe ? 'row-reverse' : 'row'}; gap:8px; margin-bottom:12px; align-items:flex-start;">
                            <img src="${avatar}" onclick="viewUserProfile('${m.sender}')" style="width:30px; height:30px; border-radius:50%; cursor:pointer; object-fit:cover;">
                            <span style="background:${isMe ? '#f2711c' : '#222'}; color:${isMe ? '#111' : '#ddd'}; padding:8px 12px; border-radius:12px; max-width:70%; font-size:14px; display:inline-block;">
                                ${m.text}
                            </span>
                        </div>
                    `;
                }).join('');
            } catch (e) {
                console.error('Private chat load failed', e);
                document.getElementById('chat-msgs').innerHTML = `<div style="color:#f2711c;">Unable to load private chat. ${e.message}</div>`;
            }
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
                ${u.username === user.username ? '<button disabled style="background:#444; color:#888; border:none; padding:5px 10px; border-radius:4px;">YOU</button>' : `<button onclick="chatTarget='${u.username}'; renderUI();" style="background:#333; color:white; border:none; padding:5px 10px; border-radius:4px;">DM</button>`}
                <button onclick="sendFriendReq('${u.username}')" style="background:#f2711c; color:white; border:none; padding:5px 10px; border-radius:4px; margin-left:5px;">+ ADD</button>
            </div>
        </div>`).join('');
};

window.sendWorldMsg = async (type) => {
    const text = document.getElementById('chat-in').value;
    if (!user || !text) return;
    if (type === 'private' && chatTarget === user.username) return alert('You cannot DM yourself.');
    const body = type === 'global' ? { username: user.username, text } : { sender: user.username, receiver: chatTarget, text };
    const endpoint = type === 'global' ? '/chat/send' : '/chat/private/send';
    const res = await fetch(`${WORLD_API}${endpoint}`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) });
    const data = await res.json();
    if (!data.ok) return alert(data.error || 'Could not send message.');
    document.getElementById('chat-in').value = '';
    renderUI();
};

window.sendFriendReq = async (target) => {
    if (!user) return alert("Login first.");
    if (target === user.username) return alert("You cannot send a friend request to yourself.");
    const res = await fetch(`${WORLD_API}/friends/request`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({sender: user.username, receiver: target}) });
    const data = await res.json();
    if (!data.ok) return alert(data.error || "Could not send request.");
    alert("Request Sent!");
};

// --- VIEW PUBLIC PROFILE ---
window.viewUserProfile = async (username) => {
    showLoader(`Loading ${username}'s profile...`);
    try {
        const res = await fetch(`${WORLD_API}/user/profile/${username}`);
        const data = await res.json();
        hideLoader();

        if (!data.ok) return alert("User not found");
        const p = data.profile;

        const div = document.createElement('div');
        div.id = 'public-profile-overlay';
        div.style.cssText = `position:fixed; inset:0; background:rgba(0,0,0,0.95); z-index:1000006; display:flex; justify-content:center; align-items:center; padding:20px;`;
        div.innerHTML = `
            <div style="background:#111; border:1px solid #f2711c; padding:30px; border-radius:20px; width:100%; max-width:320px; text-align:center; color:white;">
                <img src="${p.avatar_url || 'https://api.dicebear.com/7.x/pixel-art/svg?seed='+p.username}" style="width:120px; height:120px; border-radius:50%; border:3px solid #f2711c; object-fit:cover; margin-bottom:15px;">
                <h2 style="margin:0;">${p.username}</h2>
                <p style="color:#888; font-size:14px; margin:10px 0 20px;">${p.bio || 'This hacker has no bio.'}</p>
                
                <div style="display:flex; gap:10px;">
                    ${p.username === user?.username ? `<button disabled style="flex:1; padding:12px; background:#444; color:#888; border:none; border-radius:8px; font-weight:bold;">YOU</button>` : `<button onclick="chatTarget='${p.username}'; chatMode='private'; renderUI(); document.getElementById('public-profile-overlay').remove();" style="flex:1; padding:12px; background:#333; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:bold;">MESSAGE</button>`}
                    ${p.username === user?.username ? `<button disabled style="flex:1; padding:12px; background:#444; color:#888; border:none; border-radius:8px; font-weight:bold;">+ ADD</button>` : `<button onclick="sendFriendReq('${p.username}'); document.getElementById('public-profile-overlay').remove();" style="flex:1; padding:12px; background:#f2711c; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:bold;">+ ADD</button>`}
                </div>
                
                <button onclick="this.parentElement.parentElement.remove()" style="margin-top:20px; background:none; border:none; color:#444; cursor:pointer;">Close</button>
            </div>
        `;
        document.body.appendChild(div);
    } catch (e) {
        hideLoader();
        alert("Could not load profile.");
    }
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
    const res = await fetch(`${WORLD_API}/user/update-profile`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({username: user.username, bio, avatar_url: user.avatar_url}) });
    const data = await res.json();
    if (!data.ok) return alert(data.error || 'Could not save profile.');
    user.bio = bio;
    localStorage.setItem('bh_user', JSON.stringify(user));
    isEditMode = false;
    renderUI();
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