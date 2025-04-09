var CONFIG = {
    eventStartMinute: 52,
    eventStartSecond: 25
};

let timerMinutes = 45;
let secondsRemaining = timerMinutes * 60;
let phase = "main";
let lastTickTime = performance.now();
let accumulatedTime = 0;

const timerElement = document.getElementById('timer');
const messageElement = document.getElementById('message');
const timerContainer = document.getElementById('timerContainer');

const textColorInput = document.getElementById('textColor');
const timerColorInput = document.getElementById('timerColor');
const textShadowColorInput = document.getElementById('textShadowColor');
const timerShadowColorInput = document.getElementById('timerShadowColor');
const shadowDistanceXInput = document.getElementById('shadowDistanceX');
const shadowDistanceYInput = document.getElementById('shadowDistanceY');

function updateTimerDisplay() {
    let minutes = Math.floor(secondsRemaining / 60);
    let seconds = secondsRemaining % 60;
    timerElement.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function updateMessage() {
    if (phase === "main") {
        const banner1Text = document.getElementById('banner1Text')?.value || 
                          sessionStorage.getItem('text1') || 
                          "Timer Text 45 min";
        const banner1Url = document.getElementById('banner1Url')?.value || 
                         sessionStorage.getItem('bg1');
                         
        messageElement.textContent = banner1Text;
        timerContainer.className = "container main";
        
        if (banner1Url) {
            timerContainer.style.backgroundImage = `url('${banner1Url}')`;
        } else {
            timerContainer.style.backgroundImage = 'none';
        }
    } else {
        const banner2Text = document.getElementById('banner2Text')?.value || 
                          sessionStorage.getItem('text2') || 
                          "Timer Text 15 min";
        const banner2Url = document.getElementById('banner2Url')?.value || 
                         sessionStorage.getItem('bg2');
                         
        messageElement.textContent = banner2Text;
        timerContainer.className = "container short";
        
        if (banner2Url) {
            timerContainer.style.backgroundImage = `url('${banner2Url}')`;
        } else {
            timerContainer.style.backgroundImage = 'none';
        }
    }
}

function switchPhase() {
    if (phase === "main") {
        phase = "short";
        timerMinutes = 15;
    } else {
        phase = "main";
        timerMinutes = 45;
    }
    secondsRemaining = timerMinutes * 60;
    updateMessage();
    saveState();
}

function applyStyles() {
    const textColor = textColorInput.value;
    const timerColor = timerColorInput.value;
    const textShadowColor = textShadowColorInput.value;
    const timerShadowColor = timerShadowColorInput.value;
    const shadowDistanceX = shadowDistanceXInput.value + 'px';
    const shadowDistanceY = shadowDistanceYInput.value + 'px';

    messageElement.style.color = textColor;
    messageElement.style.textShadow = `${shadowDistanceX} ${shadowDistanceY} ${textShadowColor}`;
    timerElement.style.color = timerColor;
    timerElement.style.textShadow = `${shadowDistanceX} ${shadowDistanceY} ${timerShadowColor}`;
}

function saveState() {
    const state = {
        phase,
        secondsRemaining,
        timerMinutes,
        startTime: Date.now(),
        bg1: document.getElementById('banner1Url')?.value || sessionStorage.getItem('bg1') || '',
        text1: document.getElementById('banner1Text')?.value || sessionStorage.getItem('text1') || '',
        bg2: document.getElementById('banner2Url')?.value || sessionStorage.getItem('bg2') || '',
        text2: document.getElementById('banner2Text')?.value || sessionStorage.getItem('text2') || '',
        eventStartMinute: CONFIG.eventStartMinute,
        eventStartSecond: CONFIG.eventStartSecond,
        textColor: textColorInput.value,
        timerColor: timerColorInput.value,
        textShadowColor: textShadowColorInput.value,
        timerShadowColor: timerShadowColorInput.value,
        shadowDistanceX: shadowDistanceXInput.value,
        shadowDistanceY: shadowDistanceYInput.value
    };
    
    sessionStorage.setItem('timerState', JSON.stringify(state));
}

function copyToOBS() {
    // Ottieni valori attuali
    const currentValues = {
        minute: CONFIG.eventStartMinute,
        second: CONFIG.eventStartSecond,
        bg1: document.getElementById('banner1Url')?.value || sessionStorage.getItem('bg1') || '',
        text1: document.getElementById('banner1Text')?.value || sessionStorage.getItem('text1') || '',
        bg2: document.getElementById('banner2Url')?.value || sessionStorage.getItem('bg2') || '',
        text2: document.getElementById('banner2Text')?.value || sessionStorage.getItem('text2') || '',
        // Assicurati che questi nomi siano esattamente gli stessi di lunar banners.html
        textColor: textColorInput?.value || '#f0f0f0',
        timerColor: timerColorInput?.value || '#ffffff',
        textShadowColor: textShadowColorInput?.value || '#000000',
        timerShadowColor: timerShadowColorInput?.value || '#000000',
        shadowDistanceX: shadowDistanceXInput?.value || '2',
        shadowDistanceY: shadowDistanceYInput?.value || '2',
        timerSize: document.getElementById('timerSize')?.value || '50',
        messageSize: document.getElementById('messageSize')?.value || '30',
        transparent: true,
        showSignature: true
    };

    // Debug per vedere quali valori vengono generati
    console.log("Valori per URL:", currentValues);

    // Costruisci l'URL
    const params = new URLSearchParams();
    Object.entries(currentValues).forEach(([key, value]) => {
        params.set(key, key.includes('text') && typeof value === 'string' ? encodeURIComponent(value) : value);
    });

    // Debug per vedere l'URL completo
    const url = `https://ch3f-nerd-art-asset.netlify.app/lunar%20banners.html?${params.toString()}`;
    console.log('URL generato:', url);
    
    // Copia negli appunti
    navigator.clipboard.writeText(url)
        .then(() => alert('URL per OBS copiato!'))
        .catch(err => {
            console.error('Errore copia URL:', err);
            alert('Errore durante la copia dell\'URL');
        });
}

function initializeTimer() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentSecond = now.getSeconds();
    const currentMs = now.getMilliseconds();

    const currentTimeFromHourStart = (currentMinute * 60 + currentSecond) * 1000 + currentMs;
    const targetTimeFromHourStart = (CONFIG.eventStartMinute * 60 + CONFIG.eventStartSecond) * 1000;

    accumulatedTime = 0;
    lastTickTime = performance.now();

    if (currentTimeFromHourStart < targetTimeFromHourStart) {
        phase = "main";
        secondsRemaining = Math.ceil((targetTimeFromHourStart - currentTimeFromHourStart) / 1000);
    } else {
        phase = "short";
        const timePassedMs = currentTimeFromHourStart - targetTimeFromHourStart;
        const shortTimerMs = 15 * 60 * 1000;
        secondsRemaining = Math.ceil((shortTimerMs - (timePassedMs % shortTimerMs)) / 1000);
    }

    timerMinutes = phase === "main" ? 45 : 15;
    updateMessage();
    updateTimerDisplay();
    saveState();
}

function initializeFromURL() {
    const params = new URLSearchParams(window.location.search);
    const savedState = sessionStorage.getItem('timerState');
    
    if (savedState) {
        const state = JSON.parse(savedState);
        const elapsedSeconds = Math.floor((Date.now() - state.startTime) / 1000);
        
        phase = state.phase;
        secondsRemaining = Math.max(0, state.secondsRemaining - elapsedSeconds);
        timerMinutes = state.timerMinutes;
        CONFIG.eventStartMinute = state.eventStartMinute;
        CONFIG.eventStartSecond = state.eventStartSecond;

        // Salva negli elementi DOM usando ID corretti
        try {
            if (state.bg1) {
                const banner1Url = document.getElementById('banner1Url');
                if (banner1Url) banner1Url.value = state.bg1;
                sessionStorage.setItem('bg1', state.bg1);
            }
            if (state.text1) {
                const banner1Text = document.getElementById('banner1Text');
                if (banner1Text) banner1Text.value = state.text1;
                sessionStorage.setItem('text1', state.text1);
            }
            if (state.bg2) {
                const banner2Url = document.getElementById('banner2Url');
                if (banner2Url) banner2Url.value = state.bg2;
                sessionStorage.setItem('bg2', state.bg2);
            }
            if (state.text2) {
                const banner2Text = document.getElementById('banner2Text');
                if (banner2Text) banner2Text.value = state.text2;
                sessionStorage.setItem('text2', state.text2);
            }
        } catch (e) {
            console.error("Errore caricamento stato:", e);
        }
    } else {
        if (params.has('minute')) CONFIG.eventStartMinute = parseInt(params.get('minute'), 10);
        if (params.has('second')) CONFIG.eventStartSecond = parseInt(params.get('second'), 10);
        initializeTimer();
    }

    // Carica parametri URL usando ID corretti
    try {
        if (params.has('bg1')) {
            const banner1Url = document.getElementById('banner1Url');
            if (banner1Url) banner1Url.value = params.get('bg1');
            sessionStorage.setItem('bg1', params.get('bg1'));
        }
        if (params.has('text1')) {
            const banner1Text = document.getElementById('banner1Text');
            if (banner1Text) banner1Text.value = decodeURIComponent(params.get('text1'));
            sessionStorage.setItem('text1', decodeURIComponent(params.get('text1')));
        }
        if (params.has('bg2')) {
            const banner2Url = document.getElementById('banner2Url');
            if (banner2Url) banner2Url.value = params.get('bg2');
            sessionStorage.setItem('bg2', params.get('bg2'));
        }
        if (params.has('text2')) {
            const banner2Text = document.getElementById('banner2Text');
            if (banner2Text) banner2Text.value = decodeURIComponent(params.get('text2'));
            sessionStorage.setItem('text2', decodeURIComponent(params.get('text2')));
        }
    } catch (e) {
        console.error("Errore caricamento parametri URL:", e);
    }
    
    // Resto del codice esistente
    if (params.has('transparent')) {
        document.body.style.backgroundColor = 'transparent';
        timerContainer.style.backgroundColor = 'rgba(36, 36, 36, 0.7)';
    }
    
    applyStyles();
    updateMessage();
    updateTimerDisplay();
}

function rotateSignatures() {
    const signatures = [
        "Created by Ch3f_nerd_art",
        "Ch3f_nerd_art が制作",
        "由 Ch3f_nerd_art 创作"
    ];
    const signatureElement = document.querySelector('.signature');
    if (!signatureElement) return;

    let currentIndex = 0;
    setInterval(() => {
        signatureElement.style.opacity = '0';
        setTimeout(() => {
            signatureElement.textContent = signatures[currentIndex];
            signatureElement.style.opacity = '1';
            currentIndex = (currentIndex + 1) % signatures.length;
        }, 500);
    }, 30000);
}

function timerTick() {
    const currentTime = performance.now();
    const elapsedTime = currentTime - lastTickTime;
    lastTickTime = currentTime;
    
    accumulatedTime += elapsedTime;
    
    while (accumulatedTime >= 1000) {
        accumulatedTime -= 1000;
        if (secondsRemaining > 0) {
            secondsRemaining--;
        } else {
            switchPhase();
        }
    }
    
    updateTimerDisplay();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('input[type="number"]');
    if (inputs.length > 0) {
        document.getElementById('setTimeBtn')?.addEventListener('click', function() {
            const minute = parseInt(document.getElementById('minuteInput').value, 10);
            const second = parseInt(document.getElementById('secondInput').value, 10);

            if (minute < 0 || minute > 59 || second < 0 || second > 59) {
                alert('Inserisci valori validi (0-59) per minuti e secondi.');
                return;
            }

            CONFIG.eventStartMinute = minute;
            CONFIG.eventStartSecond = second;
            initializeTimer();
        });

        document.getElementById('defaultBtn')?.addEventListener('click', function() {
            document.getElementById('minuteInput').value = '52';
            document.getElementById('secondInput').value = '25';
            CONFIG.eventStartMinute = 52;
            CONFIG.eventStartSecond = 25;
            initializeTimer();
        });

        document.getElementById('applyCustomizationsBtn')?.addEventListener('click', function() {
            try {
                // Ottieni valori correnti
                const banner1Text = document.getElementById('banner1Text')?.value;
                const banner1Url = document.getElementById('banner1Url')?.value;
                const banner2Text = document.getElementById('banner2Text')?.value;
                const banner2Url = document.getElementById('banner2Url')?.value;
                
                // Salva nel sessionStorage
                if (banner1Text) sessionStorage.setItem('text1', banner1Text);
                if (banner1Url) sessionStorage.setItem('bg1', banner1Url);
                if (banner2Text) sessionStorage.setItem('text2', banner2Text);
                if (banner2Url) sessionStorage.setItem('bg2', banner2Url);
                
                // Aggiorna interfaccia e stato
                updateMessage();
                applyStyles();
                saveState();
                alert('Modifiche applicate con successo!');
            } catch (e) {
                console.error("Errore applicazione modifiche:", e);
                alert('Errore durante l\'applicazione delle modifiche');
            }
        });

        document.getElementById('copyToOBSBtn')?.addEventListener('click', copyToOBS);

        textColorInput.addEventListener('input', applyStyles);
        timerColorInput.addEventListener('input', applyStyles);
        textShadowColorInput.addEventListener('input', applyStyles);
        timerShadowColorInput.addEventListener('input', applyStyles);
        shadowDistanceXInput.addEventListener('input', applyStyles);
        shadowDistanceYInput.addEventListener('input', applyStyles);
    }

    initializeFromURL();
    rotateSignatures();
});

// Avvia il timer con maggiore precisione
setInterval(timerTick, 100);