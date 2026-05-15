// =====================================================
// LAYOUT LIBRARY — drop this into your app.js
// All base64 strings are properly generated (not hand-written)
// =====================================================

const LAYOUT_LIBRARY = [
    {
        name: "🕹️ Classic (Joystick + L/R)",
        desc: "Left joystick moves mouse, two click buttons on right",
        base64: "W3siaWQiOjEsInR5cGUiOiJqb3lzdGljayIsIm5hbWUiOiJNb3ZlIiwieCI6MTMsInkiOjc2LCJzaXplIjoxMzAsIm1hcHBpbmciOiJ3YXNkIn0seyJpZCI6MiwidHlwZSI6ImJ1dHRvbiIsIm5hbWUiOiJMIiwieCI6OTAsInkiOjgwLCJhY3Rpb24iOiJjbGljazowIn0seyJpZCI6MywidHlwZSI6ImJ1dHRvbiIsIm5hbWUiOiJSIiwieCI6ODAsInkiOjgwLCJhY3Rpb24iOiJjbGljazoyIn1d"
    },
    {
        name: "⌨️ WASD Buttons",
        desc: "W/A/S/D key buttons in diamond layout, no joystick",
        base64: "W3siaWQiOjEsInR5cGUiOiJidXR0b24iLCJuYW1lIjoiVyIsIngiOjEzLCJ5IjoxMywiYWN0aW9uIjoia2V5OncifSx7ImlkIjoyLCJ0eXBlIjoiYnV0dG9uIiwibmFtZSI6IkEiLCJ4Ijo2LCJ5IjoyMi4zLCJhY3Rpb24iOiJrZXk6YSJ9LHsiaWQiOjMsInR5cGUiOiJidXR0b24iLCJuYW1lIjoiUyIsIngiOjEzLCJ5IjozMSwiYWN0aW9uIjoia2V5OnMifSx7ImlkIjo0LCJ0eXBlIjoiYnV0dG9uIiwibmFtZSI6IkQiLCJ4IjoyMCwieSI6MjIuMywiYWN0aW9uIjoia2V5OmQifV0="
    },
    {
        name: "🏹 Arrow Key Buttons",
        desc: "Up/Down/Left/Right buttons in diamond layout",
        base64: "W3siaWQiOjEsInR5cGUiOiJidXR0b24iLCJuYW1lIjoiVXAiLCJ4IjoxMywieSI6MTMsImFjdGlvbiI6ImtleTpBcnJvd1VwIn0seyJpZCI6MiwidHlwZSI6ImJ1dHRvbiIsIm5hbWUiOiJMZWZ0IiwieCI6NiwieSI6MjIuMywiYWN0aW9uIjoia2V5OkFycm93TGVmdCJ9LHsiaWQiOjMsInR5cGUiOiJidXR0b24iLCJuYW1lIjoiRG93biIsIngiOjEzLCJ5IjozMSwiYWN0aW9uIjoia2V5OkFycm93RG93biJ9LHsiaWQiOjQsInR5cGUiOiJidXR0b24iLCJuYW1lIjoiUmlnaHQiLCJ4IjoyMCwieSI6MjIuMywiYWN0aW9uIjoia2V5OkFycm93UmlnaHQifV0="
    },
    {
        name: "🎯 Shooter (Joystick + Shoot)",
        desc: "Left joystick for movement, right side has shoot + alt fire",
        base64: "W3siaWQiOjEsInR5cGUiOiJqb3lzdGljayIsIm5hbWUiOiJNb3ZlIiwieCI6MTMsInkiOjcwLCJzaXplIjoxMzAsIm1hcHBpbmciOiJ3YXNkIn0seyJpZCI6MiwidHlwZSI6ImJ1dHRvbiIsIm5hbWUiOiJTaG9vdCIsIngiOjg1LCJ5Ijo3NSwiYWN0aW9uIjoiY2xpY2s6MCJ9LHsiaWQiOjMsInR5cGUiOiJidXR0b24iLCJuYW1lIjoiQWx0IiwieCI6OTMsInkiOjYwLCJhY3Rpb24iOiJjbGljazoyIn1d"
    },
    {
        name: "🎮 Full WASD + L/R + Joystick",
        desc: "WASD keys top-left, arrow joystick bottom-left, L/R clicks right",
        base64: "W3siaWQiOjEsInR5cGUiOiJidXR0b24iLCJuYW1lIjoiTCIsIngiOjkxLCJ5Ijo4NSwiYWN0aW9uIjoiY2xpY2s6MCJ9LHsiaWQiOjIsInR5cGUiOiJidXR0b24iLCJuYW1lIjoiUiIsIngiOjgwLCJ5Ijo4NSwiYWN0aW9uIjoiY2xpY2s6MiJ9LHsiaWQiOjMsInR5cGUiOiJidXR0b24iLCJuYW1lIjoiVyIsIngiOjEzLCJ5IjoxMywiYWN0aW9uIjoia2V5OncifSx7ImlkIjo0LCJ0eXBlIjoiYnV0dG9uIiwibmFtZSI6IkEiLCJ4Ijo2LCJ5IjoyMi4zLCJhY3Rpb24iOiJrZXk6YSJ9LHsiaWQiOjUsInR5cGUiOiJidXR0b24iLCJuYW1lIjoiUyIsIngiOjEzLCJ5IjozMSwiYWN0aW9uIjoia2V5OnMifSx7ImlkIjo2LCJ0eXBlIjoiYnV0dG9uIiwibmFtZSI6IkQiLCJ4IjoyMCwieSI6MjIuMywiYWN0aW9uIjoia2V5OmQifSx7ImlkIjo3LCJ0eXBlIjoiam95c3RpY2siLCJuYW1lIjoiSm95c3RpY2siLCJ4IjoxMywieSI6NzYsInNpemUiOjEzMCwibWFwcGluZyI6ImFycm93cyJ9XQ=="
    },
    {
        name: "🏃 Platformer (Joystick + Jump/Run/Attack)",
        desc: "Arrow joystick left, Jump + Run + Attack buttons right",
        base64: "W3siaWQiOjEsInR5cGUiOiJqb3lzdGljayIsIm5hbWUiOiJNb3ZlIiwieCI6MTMsInkiOjc2LCJzaXplIjoxMzAsIm1hcHBpbmciOiJhcnJvd3MifSx7ImlkIjoyLCJ0eXBlIjoiYnV0dG9uIiwibmFtZSI6Ikp1bXAiLCJ4Ijo4NSwieSI6NzAsImFjdGlvbiI6ImtleTpBcnJvd1VwIn0seyJpZCI6MywidHlwZSI6ImJ1dHRvbiIsIm5hbWUiOiJSdW4iLCJ4Ijo3NSwieSI6ODIsImFjdGlvbiI6ImtleTogIn0seyJpZCI6NCwidHlwZSI6ImJ1dHRvbiIsIm5hbWUiOiJBdGsiLCJ4Ijo5MywieSI6NjAsImFjdGlvbiI6ImtleTp6In1d"
    },
    {
        name: "Platformer 2 (FPA, Wolverine Tokyo Fury)",
        desc: "Custom layout for Platformer games",
        base64: "W3siaWQiOjEsInR5cGUiOiJidXR0b24iLCJuYW1lIjoi4qyG77iPIiwieCI6MTMsInkiOjcyLCJhY3Rpb24iOiJrZXk6QXJyb3dVcCJ9LHsiaWQiOjIsInR5cGUiOiJidXR0b24iLCJuYW1lIjoi4qyF77iPIiwieCI6NiwieSI6ODEuMywiYWN0aW9uIjoia2V5OkFycm93TGVmdCJ9LHsiaWQiOjMsInR5cGUiOiJidXR0b24iLCJuYW1lIjoi4qyH77iPIiwieCI6MTMsInkiOjkwLCJhY3Rpb24iOiJrZXk6QXJyb3dEb3duIn0seyJpZCI6NCwidHlwZSI6ImJ1dHRvbiIsIm5hbWUiOiLinqHvuI8iLCJ4IjoyMCwieSI6ODEuMywiYWN0aW9uIjoia2V5OkFycm93UmlnaHQifSx7ImlkIjoxNzc4MzE4Njg4ODk4LjA5ODEsInR5cGUiOiJidXR0b24iLCJuYW1lIjoiSnVtcCIsIngiOjg2LCJ5Ijo4MSwiYWN0aW9uIjoia2V5OnMifSx7ImlkIjoxNzc4MzE4ODc1MDA4LjQ1MjQsInR5cGUiOiJidXR0b24iLCJuYW1lIjoiQXR0YWNrIiwieCI6OTUsInkiOjgxLCJhY3Rpb24iOiJrZXk6YSJ9LHsiaWQiOjE3NzgzMTk3MjQ3ODkuMDU5MywidHlwZSI6ImpveXN0aWNrIiwibmFtZSI6IiIsIngiOjksInkiOjQ0LCJzaXplIjo3OSwibWFwcGluZyI6Im1vdXNlIn1d"
        },
    {
        name: "Platformer 3 (Like Red Ball)",
        desc: "Custom layout for Red Ball and similar games",
        base64: "W3siaWQiOjEsInR5cGUiOiJidXR0b24iLCJuYW1lIjoi4qyG77iPIiwieCI6MTMsInkiOjcyLCJhY3Rpb24iOiJrZXk6QXJyb3dVcCJ9LHsiaWQiOjIsInR5cGUiOiJidXR0b24iLCJuYW1lIjoi4qyF77iPIiwieCI6NiwieSI6ODEuMywiYWN0aW9uIjoia2V5OkFycm93TGVmdCJ9LHsiaWQiOjMsInR5cGUiOiJidXR0b24iLCJuYW1lIjoi4qyH77iPIiwieCI6MTMsInkiOjkwLCJhY3Rpb24iOiJrZXk6QXJyb3dEb3duIn0seyJpZCI6NCwidHlwZSI6ImJ1dHRvbiIsIm5hbWUiOiLinqHvuI8iLCJ4IjoyMCwieSI6ODEuMywiYWN0aW9uIjoia2V5OkFycm93UmlnaHQifSx7ImlkIjoxNzc4MzE4Njg4ODk4LjA5ODEsInR5cGUiOiJidXR0b24iLCJuYW1lIjoiSnVtcCIsIngiOjkzLCJ5Ijo4MSwiYWN0aW9uIjoia2V5OnNwYWNlIn0seyJpZCI6MTc3ODMxOTcyNDc4OS4wNTkzLCJ0eXBlIjoiam95c3RpY2siLCJuYW1lIjoiIiwieCI6OSwieSI6NDQsInNpemUiOjc5LCJtYXBwaW5nIjoibW91c2UifV0="
    }
    ];

// =====================================================
// Call this once during setup to wire up the library UI
// Requires: buildLayoutControls() to be in scope in app.js
// =====================================================
function initLayoutLibrary() {
    const select = document.getElementById('layout-library-select');
    const loadBtn = document.getElementById('layout-library-load');
    const descEl = document.getElementById('layout-library-desc');

    if (!select) return;

    // Populate dropdown
    LAYOUT_LIBRARY.forEach((preset, i) => {
        const opt = document.createElement('option');
        opt.value = i;
        opt.innerText = preset.name;
        select.appendChild(opt);
    });

    // Update description on selection change
    select.onchange = () => {
        const preset = LAYOUT_LIBRARY[parseInt(select.value)];
        if (preset && descEl) descEl.innerText = preset.desc;
    };
    if (descEl && LAYOUT_LIBRARY[0]) descEl.innerText = LAYOUT_LIBRARY[0].desc;

    loadBtn.onclick = () => {
        const preset = LAYOUT_LIBRARY[parseInt(select.value)];
        if (!preset) return;
        try {
            const json = atob(preset.base64);
            const parsed = JSON.parse(json);
            localStorage.setItem('flash_emu_layout', JSON.stringify(parsed));
            buildLayoutControls();

            // Auto-switch to custom mode
            const modeSelect = document.getElementById('mode-select');
            if (modeSelect) {
                modeSelect.value = 'custom';
                modeSelect.dispatchEvent(new Event('change'));
            }

            loadBtn.innerText = '✅ Loaded!';
            setTimeout(() => loadBtn.innerText = '▶ Load Preset', 1500);
            log(`Loaded preset: ${preset.name}`);
        } catch(e) {
            log("Library load error: " + e.message);
            alert("Failed to load preset: " + e.message);
        }
    };
}