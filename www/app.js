/**
 * FLASH EMU PRO - FINAL STABLE MASTER SCRIPT
 * Fixes: Typo corrections, Function scope, and Race-Condition handling.
 * non gay version of app.js, for the purists out there. 
 * ^ joke
 */

// 1. GLOBAL RUFFLE CONFIG (MUST BE AT THE VERY TOP)
window.RufflePlayer = window.RufflePlayer || {};
window.RufflePlayer.config = {
    "allowScriptAccess": true,
    "autoplay": "on",
    "unmuteOverlay": "hidden",
    "letterbox": "on",
    "warnOnUnsupportedContent": false
};

// 2. FAKE FUNCTIONS FOR AXE BOAT / INCREDIBOX
window.saveGA = function(categorie, label) {
    console.log("FLASH_EVENT: " + categorie + " | " + label);
};
window.getHash = function() { return ""; };
window.embedFlashOk = function() { return true; };
window.Platform = window.Platform || {
    isCordova: !!window.cordova,
    isNWJS: typeof window.process === "object" && !!window.process.versions?.nw,
    isBrowser: !window.cordova && !(typeof window.process === "object"),
};

Platform.isDesktop =
    !Platform.isCordova &&
    (Platform.isNWJS ||
        !/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent));

function log(msg) {
    console.log("DEBUG: " + msg + " " + "why is this here and why are you reading it"); 
    const logger = document.getElementById('debug-log');
    if (logger) logger.innerText = msg;
}
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
        .then(() => console.log('SW registered'))
        .catch(e => console.log('SW failed:', e));
}
window.currentPlayer = null;
function wait(ms = 10) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function showLoader(msg, time = 0) {
    let el = document.getElementById('boot-loader');
    if (!el) {
        el = document.createElement('div');
        el.id = 'boot-loader';
        el.style.cssText = `
            position:fixed; inset:0; background:#000;
            display:flex; flex-direction:column;
            justify-content:center; align-items:center;
            z-index:9998; color:#f2711c;
            font-family:sans-serif; gap:12px;
            transition: opacity 0.3s;
        `;
        el.innerHTML = `
            <div style="font-size:28px; font-weight:bold; letter-spacing:0.1em;">BLACKHAT <span>PRO</span></div>
            <div id="boot-loader-msg" style="font-size:14px; opacity:0.7;">Loading...</div>
            <div style="width:200px; height:3px; background:#222; border-radius:2px; overflow:hidden; margin-top:8px;">
                <div id="boot-loader-bar" style="height:100%; width:0%; background:#f2711c; transition:width 0.3s;"></div>
            </div>
        `;
        document.body.appendChild(el);
    }
    const bar = document.getElementById('boot-loader-bar');
    const msgEl = document.getElementById('boot-loader-msg');
    if (msgEl) msgEl.innerText = msg;
    if (bar) {
        bar.style.transition = time > 0 ? `width ${time}ms` : 'width 0.3s';
        if (time > 0) {
            bar.style.width = '0%';
            wait(10).then(() => { bar.style.width = '100%'; });
        }
    }
    return el;
}
function updateLoader(msg, pct, time = 0) {
    const el = document.getElementById('boot-loader');
    if (!el) return;
    const msgEl = document.getElementById('boot-loader-msg');
    const bar = document.getElementById('boot-loader-bar');
    if (msgEl) msgEl.innerText = msg;
    if (bar) {
        bar.style.transition = time > 0 ? `width ${time}ms` : 'width 0.3s';
        bar.style.width = Math.max(0, Math.min(100, pct)) + '%';
    }
}

function hideLoader() {
    const el = document.getElementById('boot-loader');
    if (!el) return;
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 300);
}

// --- ENGINE LOADING SYSTEM ---
async function loadEngine(version) {
    log(`Requesting Engine ${version}...`);
    if (window.currentPlayer) { window.currentPlayer.remove(); window.currentPlayer = null; }
    const oldScript = document.getElementById('ruffle-script');
    if (oldScript) oldScript.remove();

    // Inject a <link rel="preload"> hint so browser fetches it ASAP
    const preload = document.createElement('link');
    preload.rel = 'preload';
    preload.as = 'script';
    preload.href = `engines/${version}/ruffle.js`;
    preload.crossOrigin = 'anonymous';
    document.head.appendChild(preload);

    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.id = 'ruffle-script';
        script.src = `engines/${version}/ruffle.js`;
        script.crossOrigin = 'anonymous'; // required for cache to work cross-origin
        script.onload = () => { log(`Engine ${version} loaded`); resolve(); };
        script.onerror = () => {
            log(`NETWORK ERROR: engines/${version}/ruffle.js not found`);
            reject(new Error(`Failed to load engine ${version}`));
        };
        document.head.appendChild(script);
    });
}


// =====================================================

// -------------------------------------------------------
// 3. REPLACE initPlayer() with this performance version
//    Has: lazy loading, resolution scale, preload hint,
//    and loading screen integration
// -------------------------------------------------------
async function initPlayer() {
    log("Initializing Player...");
    updateLoader("Loading Flash engine...", 30);

    const engineSelect = document.getElementById('engine-select');
    if (!engineSelect) return;
    const version = engineSelect.value;

    try {
        await loadEngine(version);
        updateLoader("Starting player...", 60);

        let attempts = 0;
        while (!window.RufflePlayer && attempts < 50) {
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        // --- Inside initPlayer() ---
const ruffle = window.RufflePlayer.newest();
        window.currentPlayer = ruffle.createPlayer();


        window.currentPlayer.style.width = '100%';
        window.currentPlayer.style.height = '100%';
        window.currentPlayer.style.maxWidth = '100%';
        window.currentPlayer.style.maxHeight = '100%';
        window.currentPlayer.style.transform = 'none'; // remove the scale transform
        window.currentPlayer.style.transformOrigin = 'center center';
        window.currentPlayer.style.imageRendering = 'pixelated';
      document.getElementById("container").appendChild(window.currentPlayer);
          // Set the internal config directly on the player instance
    window.currentPlayer.config = {
        allowScriptAccess: "always"
    };


        updateLoader("Ready!", 100);
        log(`Player ready. Scale: ${resolutionScale * 100}% | DPR: ${window.devicePixelRatio}`);

    } catch (e) {
        log("CRITICAL ERROR: " + e.message);
        updateLoader("Engine failed: " + e.message, 100);
    }
}


// --- MAIN APP START ---
window.onload = async () => {
    //here cordova ??
    console.log("!!! APP.JS FILE LOADED SUCCESSFULLY !!!");
    console.log("REACHED BEFORE TRY");
            document.getElementById('left-controls').style.display  = 'none';
        document.getElementById('right-controls').style.display = 'none';
        document.getElementById('controls-layer').style.display = 'none';
        if (Platform.isCordova) {
                        document.getElementById('left-controls').style.display  = 'none';
        document.getElementById('right-controls').style.display = 'none';
        document.getElementById('controls-layer').style.display = 'none'
        }
        // add this

    try {
        console.log("INSIDE TRY"); // add this
        let appState = {
            mode: 'joystick', 
            realism: 'off',
            perfMode: 'off',
            theme: 'theme-ruffle',
            mapping: 'wasd'
        };
        // =====================================================
// HEADER SWIPE TO HIDE
// =====================================================
const header = document.getElementById('header');
let swipeStartY = null;
let swipeStartX = null;
let headerHidden = false;

window.addEventListener('pointerdown', (e) => {
    // ignore touches on controls, panels etc
    if (e.target.closest('#settings-panel, #library-panel, #left-controls, #right-controls, #controls-layer')) return;
    swipeStartY = e.clientY;
    swipeStartX = e.clientX;
}, { passive: true });

window.addEventListener('pointerup', (e) => {
    if (swipeStartY === null) return;
    const dy = e.clientY - swipeStartY;
    const dx = Math.abs(e.clientX - swipeStartX);
    swipeStartY = null;
    swipeStartX = null;

    // must be more vertical than horizontal, and at least 40px
    if (Math.abs(dy) < 40 || dx > Math.abs(dy)) return;

    if (dy < 0 && !headerHidden) {
        // swipe UP — hide header
        headerHidden = true;
        header.classList.add('hidden');
    } else if (dy > 0 && headerHidden) {
        // swipe DOWN — show header
        headerHidden = false;
        header.classList.remove('hidden');
    }
}, { passive: true });



        // =====================================================
        // DEVICE DETECTION — before initPlayer so UI is ready
        // =====================================================
     //   const isDesktop = false; 
       //           navigator.maxTouchPoints === 0 && 
        //          !navigator.userAgent.match(/Android|iPhone|iPad|iPod|Mobile/i) &&
        //          window.innerWidth > 600;
/*
const isCordova = !!window.cordova;
const isNWJS = typeof window.process === "object";
const Platform.isDesktop = !isCordova && (isNWJS || !/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent));
        console.log("Platform.isDesktop:", isDesktop, "| ontouchstart:", ('ontouchstart' in window), "| maxTouchPoints:", navigator.maxTouchPoints, "| UA:", navigator.userAgent);
*/
if (Platform.isDesktop) {
    const choice = await new Promise(resolve => {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position:fixed; inset:0; background:rgba(0,0,0,0.85);
            display:flex; flex-direction:column;
            justify-content:center; align-items:center;
            z-index:99999; font-family:sans-serif; color:white; gap:20px;
        `;
        overlay.innerHTML = `
            <div style="font-size:22px; font-weight:bold; color:#f2711c;">🖥️ Desktop Detected</div>
            <div style="font-size:14px; opacity:0.7;">How do you want to play?</div>
            <div style="display:flex; gap:15px; margin-top:10px;">
                <button id="choice-mouse" style="
                    padding:14px 24px; background:#f2711c; color:white;
                    border:none; border-radius:8px; font-size:15px;
                    font-weight:bold; cursor:pointer;">
                    🖱️ Mouse & Keyboard
                </button>
                <button id="choice-touch" style="
                    padding:14px 24px; background:#333; color:white;
                    border:2px solid #f2711c; border-radius:8px; font-size:15px;
                    font-weight:bold; cursor:pointer;">
                    📱 Keep Android Controls
                </button>
            </div>
        `;
        document.body.appendChild(overlay);
        document.getElementById('choice-mouse').onclick = () => { overlay.remove(); resolve('mouse'); };
        document.getElementById('choice-touch').onclick = () => { overlay.remove(); resolve('touch'); };
    });

    if (choice === 'mouse') {
        appState.mode = 'desktop';
        document.getElementById('virtual-cursor').style.display = 'none';
        document.getElementById('left-controls').style.display  = 'none';
        document.getElementById('right-controls').style.display = 'none';
        document.getElementById('controls-layer').style.display = 'none';

    }
    // touch: do nothing, everything stays normal
}


        await initPlayer();

        const settingsPanel = document.getElementById('settings-panel');
        const libraryPanel = document.getElementById('library-panel');
        const cursor = document.getElementById('virtual-cursor');
        const gameList = document.getElementById('game-list');

        // =====================================================
        // KEY HELPERS
        // =====================================================
        function normalizeKey(raw) {
            const k = (raw || '').trim().toLowerCase();
            const map = {
                'space': ' ', 'spacebar': ' ',
                'up': 'ArrowUp', 'down': 'ArrowDown', 'left': 'ArrowLeft', 'right': 'ArrowRight',
                'arrowup': 'ArrowUp', 'arrowdown': 'ArrowDown', 'arrowleft': 'ArrowLeft', 'arrowright': 'ArrowRight',
                'enter': 'Enter', 'return': 'Enter',
                'esc': 'Escape', 'escape': 'Escape',
                'tab': 'Tab', 'shift': 'Shift', 'ctrl': 'Control', 'alt': 'Alt',
                'backspace': 'Backspace', 'delete': 'Delete', 'del': 'Delete',
                'f1':'F1','f2':'F2','f3':'F3','f4':'F4','f5':'F5','f6':'F6',
                'f7':'F7','f8':'F8','f9':'F9','f10':'F10','f11':'F11','f12':'F12',
            };
            return map[k] || raw;
        }

        function keyToCode(key) {
            const map = {
                ' ': 'Space', 'Enter': 'Enter', 'Escape': 'Escape', 'Tab': 'Tab',
                'ArrowUp': 'ArrowUp', 'ArrowDown': 'ArrowDown', 'ArrowLeft': 'ArrowLeft', 'ArrowRight': 'ArrowRight',
                'Shift': 'ShiftLeft', 'Control': 'ControlLeft', 'Alt': 'AltLeft',
                'Backspace': 'Backspace', 'Delete': 'Delete',
                'a':'KeyA','b':'KeyB','c':'KeyC','d':'KeyD','e':'KeyE','f':'KeyF',
                'g':'KeyG','h':'KeyH','i':'KeyI','j':'KeyJ','k':'KeyK','l':'KeyL',
                'm':'KeyM','n':'KeyN','o':'KeyO','p':'KeyP','q':'KeyQ','r':'KeyR',
                's':'KeyS','t':'KeyT','u':'KeyU','v':'KeyV','w':'KeyW','x':'KeyX',
                'y':'KeyY','z':'KeyZ',
                '0':'Digit0','1':'Digit1','2':'Digit2','3':'Digit3','4':'Digit4',
                '5':'Digit5','6':'Digit6','7':'Digit7','8':'Digit8','9':'Digit9'
            };
            return map[key] || ('Key' + key.toUpperCase());
        }

        function keyToKeyCode(key) {
            const map = {
                ' ': 32, 'Enter': 13, 'Escape': 27, 'Tab': 9,
                'Backspace': 8, 'Delete': 46,
                'ArrowLeft': 37, 'ArrowUp': 38, 'ArrowRight': 39, 'ArrowDown': 40,
                'Shift': 16, 'Control': 17, 'Alt': 18,
                'F1':112,'F2':113,'F3':114,'F4':115,'F5':116,'F6':117,
                'F7':118,'F8':119,'F9':120,'F10':121,'F11':122,'F12':123,
                'a':65,'b':66,'c':67,'d':68,'e':69,'f':70,'g':71,'h':72,
                'i':73,'j':74,'k':75,'l':76,'m':77,'n':78,'o':79,'p':80,
                'q':81,'r':82,'s':83,'t':84,'u':85,'v':86,'w':87,'x':88,
                'y':89,'z':90,
                '0':48,'1':49,'2':50,'3':51,'4':52,
                '5':53,'6':54,'7':55,'8':56,'9':57
            };
            return map[key] || 0;
        }

        // =====================================================
        // THE ONE TRUE DISPATCHER
        // =====================================================
        const Dispatcher = {
            getCanvas: () => {
                const p = window.currentPlayer;
                if (!p) return null;
                return (p.shadowRoot) ? p.shadowRoot.querySelector('canvas') : p.querySelector('canvas');
            },

            moveMouse: (x, y) => {
                const canvas = Dispatcher.getCanvas();
                if (!canvas) return;
                const eventOpts = {
                    bubbles: true, cancelable: true, view: window,
                    clientX: x, clientY: y,
                    pointerId: 1, isPrimary: true
                };
                canvas.dispatchEvent(new PointerEvent('pointermove', eventOpts));
                canvas.dispatchEvent(new MouseEvent('mousemove', eventOpts));
            },

            sendClick: (btn, x, y) => {
                const canvas = Dispatcher.getCanvas();
                if (!canvas) return;
                // use cursor position if no explicit x/y
                const cx = x !== undefined ? x : (parseFloat(cursor.style.left) || window.innerWidth / 2);
                const cy = y !== undefined ? y : (parseFloat(cursor.style.top) || window.innerHeight / 2);
                const eventOpts = {
                    bubbles: true, cancelable: true, view: window, button: btn,
                    clientX: cx, clientY: cy,
                    pointerId: 1, isPrimary: true
                };
                canvas.dispatchEvent(new PointerEvent('pointermove', eventOpts));
                canvas.dispatchEvent(new PointerEvent('pointerdown', eventOpts));
                canvas.dispatchEvent(new MouseEvent('mousedown', eventOpts));
                setTimeout(() => {
                    canvas.dispatchEvent(new PointerEvent('pointerup', eventOpts));
                    canvas.dispatchEvent(new MouseEvent('mouseup', eventOpts));
                    canvas.dispatchEvent(new MouseEvent('click', eventOpts));
                }, 60);
            },

            sendKey: (key) => {
                const canvas = Dispatcher.getCanvas();
                if (!canvas) { log("sendKey: No canvas found!"); return; }
                const normalized = normalizeKey(key);
                log(`Key: [${normalized}]`);
                const eventOpts = {
                    key: normalized, code: keyToCode(normalized),
                    keyCode: keyToKeyCode(normalized), which: keyToKeyCode(normalized),
                    bubbles: true, cancelable: true
                };
                canvas.setAttribute('tabindex', '0');
                canvas.focus({ preventScroll: true });
                canvas.dispatchEvent(new KeyboardEvent('keydown', eventOpts));
                document.dispatchEvent(new KeyboardEvent('keydown', eventOpts));
                setTimeout(() => {
                    canvas.dispatchEvent(new KeyboardEvent('keyup', eventOpts));
                    document.dispatchEvent(new KeyboardEvent('keyup', eventOpts));
                }, 150);
            }
        };

        // =====================================================
        // LAYOUT SYSTEM — builds controls from saved layout
        // =====================================================
        const controlsContainer = document.getElementById('controls-layer');

        function buildLayoutControls() {
            controlsContainer.innerHTML = '';

            let layoutData = [];
            try {
                const saved = localStorage.getItem('flash_emu_layout');
                if (saved) layoutData = JSON.parse(saved);
            } catch(e) { log("Layout parse error: " + e.message); }

            if (layoutData.length === 0) {
                log("No layout saved. Go to Layout Editor to add controls.");
                return;
            }

            const isDirect = appState.mode === 'direct';

            layoutData.forEach(item => {
                if (item.type === 'button') {
                    buildButton(item);
                } else if (item.type === 'joystick') {
                    // In direct touch mode, skip mouse-mapped joysticks
                    // because the finger IS the cursor — no joystick needed
                    if (isDirect && item.mapping === 'mouse') {
                        log(`Skipping mouse joystick "${item.name}" (direct mode active)`);
                        return;
                    }
                    buildJoystick(item);
                }
            });

            log(`Layout loaded (${isDirect ? 'direct' : 'joystick'} cursor mode)`);
        }
window.buildLayoutControls = buildLayoutControls;
function buildButton(item) {
    const btn = document.createElement('button');
    btn.innerText = item.name;
    btn.className = 'layout-btn';
    btn.style.left = item.x + '%';
    btn.style.top = item.y + '%';

    const action = item.action || '';
    let holdInterval = null;

    function fireAction() {
        const canvas = Dispatcher.getCanvas();
        navigator.vibrate(50);
        if (action.startsWith('click:')) {
            const btnNum = parseInt(action.split(':')[1]);
            Dispatcher.sendClick(btnNum);

        } else if (action.startsWith('key:')) {
            const key = action.split(':').slice(1).join(':');
            Dispatcher.sendKey(normalizeKey(key));

        } else if (action.startsWith('combo:')) {
            if (!canvas) return;
            canvas.setAttribute('tabindex', '0');
            canvas.focus({ preventScroll: true });

            const payload = action.slice(6); // strip "combo:"

            if (payload.includes('+key:')) {
                // KEY + KEY  e.g. combo:ArrowDown+key:z
                const [raw1, raw2] = payload.split('+key:');
                const n1 = normalizeKey(raw1.trim());
                const n2 = normalizeKey(raw2.trim());
                const o1 = { key:n1, code:keyToCode(n1), keyCode:keyToKeyCode(n1), which:keyToKeyCode(n1), bubbles:true, cancelable:true };
                const o2 = { key:n2, code:keyToCode(n2), keyCode:keyToKeyCode(n2), which:keyToKeyCode(n2), bubbles:true, cancelable:true };
                canvas.dispatchEvent(new KeyboardEvent('keydown', o1));
                document.dispatchEvent(new KeyboardEvent('keydown', o1));
                canvas.dispatchEvent(new KeyboardEvent('keydown', o2));
                document.dispatchEvent(new KeyboardEvent('keydown', o2));
                setTimeout(() => {
                    canvas.dispatchEvent(new KeyboardEvent('keyup', o1));
                    document.dispatchEvent(new KeyboardEvent('keyup', o1));
                    canvas.dispatchEvent(new KeyboardEvent('keyup', o2));
                    document.dispatchEvent(new KeyboardEvent('keyup', o2));
                }, 100);

            } else {
                // KEY + CLICK  e.g. combo:s:0
                const parts = payload.split(':');
                const n = normalizeKey(parts[0].trim());
                const clickBtn = parseInt(parts[1]) || 0;
                const opts = { key:n, code:keyToCode(n), keyCode:keyToKeyCode(n), which:keyToKeyCode(n), bubbles:true, cancelable:true };
                canvas.dispatchEvent(new KeyboardEvent('keydown', opts));
                document.dispatchEvent(new KeyboardEvent('keydown', opts));
                Dispatcher.sendClick(clickBtn);
                setTimeout(() => {
                    canvas.dispatchEvent(new KeyboardEvent('keyup', opts));
                    document.dispatchEvent(new KeyboardEvent('keyup', opts));
                }, 100);
            }

        } else if (!isNaN(parseInt(action))) {
            // legacy: action was just "0", "1", "2"
            Dispatcher.sendClick(parseInt(action));
        }
    }

    // Press: fire immediately + start repeat
    btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        fireAction();
        holdInterval = setInterval(fireAction, 100);
    });

    // Release / leave / cancel: stop repeat
    const stopHold = () => { clearInterval(holdInterval); holdInterval = null; };
    btn.addEventListener('pointerup',     stopHold);
    btn.addEventListener('pointerleave',  stopHold);
    btn.addEventListener('pointercancel', stopHold);

    // Long-press info log
    let infoTimer;
    btn.addEventListener('pointerdown',  () => { infoTimer = setTimeout(() => log(`Button: ${item.name} → ${item.action}`), 800); });
    btn.addEventListener('pointerup',    () => clearTimeout(infoTimer));
    btn.addEventListener('pointerleave', () => clearTimeout(infoTimer));

    controlsContainer.appendChild(btn);
}
function buildJoystick(item) {
    const zone = document.createElement('div');
    zone.className = 'layout-joy-zone';
    zone.style.left = item.x + '%';
    zone.style.top = item.y + '%';
    zone.style.width = item.size + 'px';
    zone.style.height = item.size + 'px';

    const stick = document.createElement('div');
    stick.className = 'layout-joy-stick';
    zone.appendChild(stick);
    controlsContainer.appendChild(zone);

    const keyMaps = {
        wasd:   { up: 'w', down: 's', left: 'a', right: 'd' },
        arrows: { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' }
    };

    let activeKeys = new Set();
    let isDown = false;
    let myPointerId = null; // track ONLY this joystick's finger

    function resetStick() {
        stick.style.left = '50%';
        stick.style.top = '50%';
        stick.style.transform = 'translate(-50%, -50%)';
    }
    resetStick();

    zone.addEventListener('pointerdown', (e) => {
        if (isDown) return; // already tracking a finger, ignore second
        isDown = true;
        myPointerId = e.pointerId;
        zone.setPointerCapture(e.pointerId);
        e.preventDefault();
    });

    zone.addEventListener('pointerup', (e) => {
        if (e.pointerId !== myPointerId) return;
        isDown = false;
        myPointerId = null;
        resetStick();
        if (item.mapping !== 'mouse') {
            activeKeys.forEach(k => Dispatcher.sendKey(k));
            activeKeys.clear();
        }
    });

    zone.addEventListener('pointercancel', (e) => {
        if (e.pointerId !== myPointerId) return;
        isDown = false;
        myPointerId = null;
        resetStick();
        activeKeys.clear();
    });

    zone.addEventListener('pointermove', (e) => {
        if (!isDown || e.pointerId !== myPointerId) return;

        const rect = zone.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const max = rect.width / 2 - 20;
        const lx = dist > max ? (dx / dist) * max : dx;
        const ly = dist > max ? (dy / dist) * max : dy;

        stick.style.left = (50 + (lx / rect.width) * 100) + '%';
        stick.style.top = (50 + (ly / rect.height) * 100) + '%';
        stick.style.transform = 'translate(-50%, -50%)';

        if (item.mapping === 'mouse') {
            let curX = parseFloat(cursor.style.left) || window.innerWidth / 2;
            let curY = parseFloat(cursor.style.top) || window.innerHeight / 2;
            curX = Math.max(0, Math.min(window.innerWidth,  curX + dx * 0.08));
            curY = Math.max(0, Math.min(window.innerHeight, curY + dy * 0.08));
            cursor.style.left = curX + 'px';
            cursor.style.top  = curY + 'px';
            Dispatcher.moveMouse(curX, curY);

        } else {
            const map = keyMaps[item.mapping] || keyMaps.wasd;
            const threshold = 18;
            const newKeys = new Set();
            if (dy < -threshold) newKeys.add(map.up);
            if (dy > threshold)  newKeys.add(map.down);
            if (dx < -threshold) newKeys.add(map.left);
            if (dx > threshold)  newKeys.add(map.right);
            newKeys.forEach(k => { if (!activeKeys.has(k)) Dispatcher.sendKey(k); });
            activeKeys.forEach(k => { if (!newKeys.has(k)) Dispatcher.sendKey(k); });
            activeKeys = newKeys;
        }
    });
}
function closeGame() {
    if (window.currentPlayer) {
        window.currentPlayer.remove();
        window.currentPlayer = null;
    }
    document.getElementById('back-to-app').style.display = 'none';
    document.getElementById('header').classList.remove('hidden'); // Show header
    log("Game closed. Returning to library.");
}

// Attach the click event

function getSWFDimensions() {
}
async function getSWF(url, onProgress = () => {}) {
    console.log("Downloading:", url);

    // Cordova native HTTP — bypasses CORS
    if (Platform.isCordova && window.cordova?.plugin?.http) {
        const res = await new Promise((resolve, reject) => {
            cordova.plugin.http.sendRequest(
                url, { method: "get", responseType: "arraybuffer" }, {},
                resolve, reject
            );
        });
        return new Uint8Array(res.data);
    }

    // Browser/NW.js — plain fetch, no HEAD request
    const res = await fetch(url);
    if (!res.ok) throw new Error("HTTP " + res.status);
    return new Uint8Array(await res.arrayBuffer());
}
// =====================================================
// PERSISTENT SWF CACHE — IndexedDB
// Survives app restarts, works on web AND Cordova
// =====================================================

const SWFCache = {
    db: null,

    async open() {
        if (this.db) return this.db;
        return new Promise((resolve, reject) => {
            const req = indexedDB.open('blackhat-swf-cache', 1);
            req.onupgradeneeded = (e) => {
                e.target.result.createObjectStore('swfs', { keyPath: 'filename' });
            };
            req.onsuccess = (e) => { this.db = e.target.result; resolve(this.db); };
            req.onerror   = () => reject(req.error);
        });
    },

    async save(filename, bytes) {
        const db    = await this.open();
        return new Promise((resolve, reject) => {
            const tx    = db.transaction('swfs', 'readwrite');
            const store = tx.objectStore('swfs');
            const req   = store.put({ filename, bytes, savedAt: Date.now() });
            req.onsuccess = () => resolve();
            req.onerror   = () => reject(req.error);
        });
    },

    async load(filename) {
        const db    = await this.open();
        return new Promise((resolve, reject) => {
            const tx    = db.transaction('swfs', 'readonly');
            const store = tx.objectStore('swfs');
            const req   = store.get(filename);
            req.onsuccess = () => resolve(req.result?.bytes || null);
            req.onerror   = () => reject(req.error);
        });
    },

    async delete(filename) {
        const db    = await this.open();
        return new Promise((resolve, reject) => {
            const tx    = db.transaction('swfs', 'readwrite');
            const store = tx.objectStore('swfs');
            const req   = store.delete(filename);
            req.onsuccess = () => resolve();
            req.onerror   = () => reject(req.error);
        });
    },

    async list() {
        const db    = await this.open();
        return new Promise((resolve, reject) => {
            const tx    = db.transaction('swfs', 'readonly');
            const store = tx.objectStore('swfs');
            const req   = store.getAll();
            req.onsuccess = () => resolve(req.result.map(r => ({
                filename: r.filename,
                sizeMB:   (r.bytes.byteLength / 1024 / 1024).toFixed(1),
                savedAt:  r.savedAt
            })));
            req.onerror = () => reject(req.error);
        });
    },

    async clearAll() {
        const db    = await this.open();
        return new Promise((resolve, reject) => {
            const tx    = db.transaction('swfs', 'readwrite');
            const store = tx.objectStore('swfs');
            const req   = store.clear();
            req.onsuccess = () => resolve();
            req.onerror   = () => reject(req.error);
        });
    }
};
async function loadGameFile(remotePath, title) {
    // Generate a clean filename for the database key
    const filename = remotePath.split('/').pop().replace(/[^a-z0-9.]/gi, '_');
    
    let bytes;

    // 1. TRY LOADING FROM INDEXEDDB CACHE
    updateLoader(`Checking cache...`, 10);
    try {
        bytes = await SWFCache.load(filename);
        if (bytes) {
            log(`Cache Hit: ${title}`);
            updateLoader(`Loading ${title} from local storage...`, 40);
        }
    } catch (e) {
        log("Cache read error: " + e.message);
    }

    // 2. DOWNLOAD IF NOT IN CACHE
    if (!bytes) {
        updateLoader(`Downloading ${title}...`, 20);
        log(`Downloading from: ${remotePath}`);

        try {
            bytes = await getSWF(remotePath, (p) => {
                updateLoader(`Downloading... ${p}%`, p);
            });

            // 3. SAVE TO INDEXEDDB CACHE
            if (bytes) {
                await SWFCache.save(filename, bytes);
                log(`Saved to IndexedDB: ${filename}`);
            }
        } catch (e) {
            throw new Error("Download failed: " + e.message);
        }
    }

    // 4. ENSURE PLAYER IS READY
    if (!window.currentPlayer) {
        log("Initializing Flash Engine...");
        await initPlayer();
    }

    // 5. LOAD INTO FLASH PLAYER
    updateLoader(`Starting ${title}...`, 85);
await window.currentPlayer.load({ 
    data: bytes,
    backgroundColor: "#304469",
    // FIX: Add these three lines inside the load call!
    allowScriptAccess: "always",
    forceSandbox: false,
    parameters: {
        "folder": "app/",
        "lang": "en",
        "check": "true"
    }
});

    // 📏 LETTERBOX FIX
    const dims = getSWFDimensions(bytes);
    if (dims) {
        log(`SWF: ${dims.width}x${dims.height}`);
        if (typeof applyLetterbox === 'function') applyLetterbox(dims.width, dims.height);
    }
}
 // -------------------------------------------------------
// 6. UPDATED loadLibrary — lazy initializes player on first game load
// -------------------------------------------------------
async function loadLibrary() {
    try {
        const response = await fetch('games.json');
        const games = await response.json();
        gameList.innerHTML = "";

        const categories = {};
        games.forEach(game => {
            const cat = game.category || 'Other';
            if (!categories[cat]) categories[cat] = [];
            categories[cat].push(game);
        });

        Object.entries(categories).forEach(([catName, catGames]) => {
            const header = document.createElement('div');
            header.className = 'game-category-header';
            header.innerText = catName;
            gameList.appendChild(header);

            catGames.forEach(game => {
                const card = document.createElement('div');
                card.className = 'game-card';
                card.innerText = game.title;
    card.onclick = async () => {
        if (game.title === "Axe Boat") {
            window.location.href = game.link;
            return;
        }

    libraryPanel.classList.remove('open');
    showLoader(`Loading ${game.title}...`);
    
    // Show the back button


    if (game.version) document.getElementById('engine-select').value = game.version;
    if (!window.currentPlayer || game.version) await initPlayer();

    try {
        if (game.file) {
            // Pass the game object to loadGameFile
            await loadGameFile(game.file, game.title, game);
        }
        log(`Loaded: ${game.title}`);
    } catch(e) { log("Load error: " + e.message); }

    hideLoader();
};
                gameList.appendChild(card);
            });
        });

        log("Library Loaded");
    } catch (e) { log("Lib Error: " + e.message); }
}

        // =====================================================
        // SETTINGS & UI
        // =====================================================
        document.getElementById('library-toggle').onclick = () => libraryPanel.classList.toggle('open');
        document.getElementById('settings-toggle').onclick = () => settingsPanel.classList.add('open');
        document.getElementById('close-settings').onclick = () => settingsPanel.classList.remove('open');
        document.getElementById('engine-select').onchange = async () => { await initPlayer(); };
        document.getElementById('realism-select').onchange = (e) => { appState.realism = e.target.value; };
        document.getElementById('mode-select').onchange = (e) => {
            appState.mode = e.target.value;
            const isDirect = appState.mode === 'direct';
            const isCustom  = appState.mode === 'custom';
            const isJoystick = appState.mode === 'joystick' || appState.mode === 'super';

            // Default left joystick + right buttons: show in joystick/super, hide otherwise
           // document.getElementById('left-controls').style.display  = isJoystick ? 'block' : 'none';
           // document.getElementById('right-controls').style.display = isJoystick ? 'block' : 'none';

            // Custom layout layer: show in custom AND direct mode
            // (direct mode still shows key-buttons and key-joysticks, just skips mouse joystick)
            const showLayer = isCustom || isDirect;
            controlsContainer.style.display = showLayer ? 'block' : 'none';

            // Show/hide the layout editor shortcut buttons
            const customGroup = document.getElementById('custom-layout-group');
            if (customGroup) customGroup.style.display = (isCustom || isDirect) ? 'block' : 'none';

            // Rebuild layout so mouse-joystick filtering applies immediately
            if (showLayer) buildLayoutControls();
        };
        document.getElementById('size-slider').oninput = (e) => {
            document.documentElement.style.setProperty('--btn-size', e.target.value + 'px');
        };
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.onclick = () => { document.body.className = btn.dataset.theme; };
        });
document.getElementById('load-url-btn').onclick = async () => {
    const url = document.getElementById('url-input').value;
    if (!url) return;
    showLoader("Loading from URL...");
    if (!window.currentPlayer) await initPlayer();
    try {
        const res = await fetch(url);
        const buffer = await res.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        await window.currentPlayer.load({ data: bytes });
        const dims = getSWFDimensions(bytes);
        if (dims) applyLetterbox(dims.width, dims.height);
    } catch(e) {
        // CORS fallback — can't read bytes but at least try to play
        await window.currentPlayer.load({ url: url }).catch(() => alert("CORS block"));
    }
    hideLoader();
};;

        // Layout editor button
        document.getElementById('open-editor-btn').onclick = () => {
            window.location.href = 'editor.html';
        };

        // Reload layout button
        document.getElementById('reload-layout-btn').onclick = () => {
            buildLayoutControls();
            settingsPanel.classList.remove('open');
        };

        // Custom button creator (kept for quick use from settings)
        const custType = document.getElementById('cust-type');
        custType.onchange = () => {
            document.getElementById('mouse-options').style.display = custType.value === 'mouse' ? 'block' : 'none';
            document.getElementById('key-options').style.display = custType.value === 'key' ? 'block' : 'none';
            document.getElementById('combo-options').style.display = custType.value === 'combo' ? 'flex' : 'none';
        };
        document.getElementById('add-btn').onclick = () => {
            const name = document.getElementById('cust-name').value || "Btn";
            const type = document.getElementById('cust-type').value;
            const tempItem = {
                id: Date.now(),
                type: 'button',
                name,
                x: 85, y: 50,
                action: type === 'mouse'
                    ? 'click:' + document.getElementById('cust-mouse').value
                    : 'key:' + (document.getElementById('cust-key').value || 'a')
            };
            buildButton(tempItem);
            log(`Quick-added button: ${name}`);
        };

        // Turbo mode
        const perfBtn = document.getElementById('perf-toggle');
        perfBtn.onclick = () => {
            if (appState.perfMode === 'off') {
                appState.perfMode = 'on';
                appState.realism = 'off';
                document.getElementById('realism-select').value = 'off';
                const canvas = Dispatcher.getCanvas();
                if (canvas) canvas.style.imageRendering = 'pixelated';
                perfBtn.innerText = "⚡ Turbo Mode: ON";
                perfBtn.classList.add('turbo-active');
                log("TURBO ON!");
            } else {
                appState.perfMode = 'off';
                perfBtn.innerText = "⚡ Turbo Mode: OFF";
                perfBtn.classList.remove('turbo-active');
                const canvas = Dispatcher.getCanvas();
                if (canvas) canvas.style.imageRendering = 'auto';
                log("Turbo Off.");
            }
        };

        // Direct touch mode
        document.getElementById('game-screen').onpointerdown = (e) => {
            if (appState.mode !== 'direct') return;
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
            if (appState.realism === 'on') Dispatcher.moveMouse(e.clientX, e.clientY);
        };
        document.getElementById('game-screen').onpointermove = (e) => {
            if (appState.mode !== 'direct') return;
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
            if (appState.realism === 'on') Dispatcher.moveMouse(e.clientX, e.clientY);
        };

// File loading
const fileInput = document.getElementById('file-input');
document.getElementById('select-swf-btn').onclick = () => fileInput.click();
fileInput.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    showLoader(`Loading ${file.name}...`);
    if (!window.currentPlayer) await initPlayer();
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    await window.currentPlayer.load({ data: bytes });
    const dims = getSWFDimensions(bytes);
    if (dims) applyLetterbox(dims.width, dims.height);
    hideLoader();
};

// FULLSCREEN
const fsBtn = document.getElementById('fullscreen-btn');

fsBtn.onclick = () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen()
            .then(() => { fsBtn.innerText = '⛷'; })
            .catch(() => {
                // Cordova fallback
                if (window.AndroidFullScreen) AndroidFullScreen.immersiveMode();
            });
    } else {
        document.exitFullscreen()
            .then(() => { fsBtn.innerText = '⛶'; });
    }
};

// sync icon if user exits fullscreen with back button / ESC
document.addEventListener('fullscreenchange', () => {
    fsBtn.innerText = document.fullscreenElement ? '⛷' : '⛶';
});
        // =====================================================
        // BOOT
        // =====================================================
showLoader("Starting up...");

// Lazy load — don't init player on boot, wait for game selection
// Comment out: await initPlayer();
// And add this instead at boot:
updateLoader("Loading library...", 10);
loadLibrary();
buildLayoutControls();
updateLoader("Ready!", 100);
setTimeout(hideLoader, 700); 
initGlobalLibrary();
initGlobalGameLibrary();


log("Ready. All systems active.");
window.buildLayoutControls = buildLayoutControls;// expose for layout library

    } catch (err) {
        log("Boot Error: " + err.message);
        console.error(err);
    }
};
// Global Mocks for Incredibox/Axe Boat
window.saveGA = window.saveGA || function(c, l) { console.log("GA:", c, l); };
window.getHash = window.getHash || function() { return ""; };
window.embedFlashOk = window.embedFlashOk || function() { return true; };