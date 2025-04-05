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
const bgBanner1Input = document.getElementById('bgBanner1');
const textBanner1Input = document.getElementById('textBanner1');
const bgBanner2Input = document.getElementById('bgBanner2');
const textBanner2Input = document.getElementById('textBanner2');

// Get appearance input elements
const timerColor = document.getElementById('timerColor');
const messageColor = document.getElementById('messageColor');
const shadowColor = document.getElementById('shadowColor');
const shadowSize = document.getElementById('shadowSize');
const shadowBlur = document.getElementById('shadowBlur');

function updateTimerDisplay() {
    let minutes = Math.floor(secondsRemaining / 60);
    let seconds = secondsRemaining % 60;
    timerElement.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function updateMessage() {
    if (phase === "main") {
        messageElement.textContent = textBanner1Input?.value || "Timer Text 45 min";
        timerContainer.className = "container main";
        if (bgBanner1Input?.value) {
            timerContainer.style.backgroundImage = `url('${bgBanner1Input.value}')`;
        }
    } else {
        messageElement.textContent = textBanner2Input?.value || "Timer Text 15 min";
        timerContainer.className = "container short";
        if (bgBanner2Input?.value) {
            timerContainer.style.backgroundImage = `url('${bgBanner2Input.value}')`;
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

function saveState() {
    const state = {
        phase,
        secondsRemaining,
        timerMinutes,
        startTime: Date.now(),
        bg1: bgBanner1Input?.value,
        text1: textBanner1Input?.value,
        bg2: bgBanner2Input?.value,
        text2: textBanner2Input?.value,
        eventStartMinute: CONFIG.eventStartMinute,
        eventStartSecond: CONFIG.eventStartSecond
    };
    sessionStorage.setItem('timerState', JSON.stringify(state));
}

function copyToOBS() {
    // Raccogli le impostazioni di aspetto
    const appearanceSettings = {
        timerColor: timerColor.value,
        messageColor: messageColor.value,
        shadowColor: shadowColor.value,
        shadowSize: shadowSize.value,
        shadowBlur: shadowBlur.value
    };

    const state = {
        minute: CONFIG.eventStartMinute,
        second: CONFIG.eventStartSecond,
        bg1: bgBanner1Input?.value,
        text1: encodeURIComponent(textBanner1Input?.value || ''),
        bg2: bgBanner2Input?.value,
        text2: encodeURIComponent(textBanner2Input?.value || ''),
        phase,
        transparent: true,
        startTime: Date.now(),
        showSignature: true,
        appearance: encodeURIComponent(JSON.stringify(appearanceSettings)) // Aggiungi le impostazioni di aspetto
    };

    const baseUrl = window.location.origin + '/lunar%20banners.html';
    const queryString = Object.entries(state)
        .filter(([_, value]) => value !== undefined && value !== '')
        .map(([key, value]) => `${key}=${value}`)
        .join('&');

    const obsUrl = `${baseUrl}?${queryString}`;
    navigator.clipboard.writeText(obsUrl);
    alert(`URL per OBS copiato!`);
}

function initializeTimer() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentSecond = now.getSeconds();
    const currentMs = now.getMilliseconds();

    // Calcola il tempo preciso dall'inizio dell'ora corrente
    const currentTimeFromHourStart = (currentMinute * 60 + currentSecond) * 1000 + currentMs;
    const targetTimeFromHourStart = (CONFIG.eventStartMinute * 60 + CONFIG.eventStartSecond) * 1000;

    // Reset accumulatori
    accumulatedTime = 0;
    lastTickTime = performance.now();

    if (currentTimeFromHourStart < targetTimeFromHourStart) {
        // Siamo prima del target in questa ora
        phase = "main";
        secondsRemaining = Math.ceil((targetTimeFromHourStart - currentTimeFromHourStart) / 1000);
    } else {
        // Siamo dopo il target
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

        if (bgBanner1Input && state.bg1) bgBanner1Input.value = state.bg1;
        if (textBanner1Input && state.text1) textBanner1Input.value = state.text1;
        if (bgBanner2Input && state.bg2) bgBanner2Input.value = state.bg2;
        if (textBanner2Input && state.text2) textBanner2Input.value = state.text2;
    } else {
        if (params.has('minute')) CONFIG.eventStartMinute = parseInt(params.get('minute'), 10);
        if (params.has('second')) CONFIG.eventStartSecond = parseInt(params.get('second'), 10);
        initializeTimer();
    }

    if (params.has('bg1') && bgBanner1Input) bgBanner1Input.value = params.get('bg1');
    if (params.has('text1') && textBanner1Input) textBanner1Input.value = decodeURIComponent(params.get('text1'));
    if (params.has('bg2') && bgBanner2Input) bgBanner2Input.value = params.get('bg2');
    if (params.has('text2') && textBanner2Input) textBanner2Input.value = decodeURIComponent(params.get('text2'));
    
    if (params.has('transparent')) {
        document.body.style.backgroundColor = 'transparent';
        timerContainer.style.backgroundColor = 'rgba(36, 36, 36, 0.7)';
    }
    const signature = document.querySelector('.signature');
    if (signature) {
        signature.style.display = params.get('showSignature') === 'true' ? 'block' : 'none';
    }
    updateMessage();
    updateTimerDisplay();
}

// Function to update text appearance
function updateTextAppearance() {
    const timer = document.getElementById('timer');
    const message = document.getElementById('message');
    const shadowStyle = `${shadowSize.value}px ${shadowSize.value}px ${shadowBlur.value}px ${shadowColor.value}`;
    
    timer.style.color = timerColor.value;
    timer.style.textShadow = shadowStyle;
    
    message.style.color = messageColor.value;
    message.style.textShadow = shadowStyle;
}

// Add event listeners for appearance inputs
timerColor.addEventListener('input', updateTextAppearance);
messageColor.addEventListener('input', updateTextAppearance);
shadowColor.addEventListener('input', updateTextAppearance);
shadowSize.addEventListener('input', updateTextAppearance);
shadowBlur.addEventListener('input', updateTextAppearance);

// Save appearance settings in localStorage
function saveAppearanceSettings() {
    const settings = {
        timerColor: timerColor.value,
        messageColor: messageColor.value,
        shadowColor: shadowColor.value,
        shadowSize: shadowSize.value,
        shadowBlur: shadowBlur.value
    };
    localStorage.setItem('appearanceSettings', JSON.stringify(settings));
}

// Load appearance settings from localStorage
function loadAppearanceSettings() {
    const settings = JSON.parse(localStorage.getItem('appearanceSettings'));
    if (settings) {
        timerColor.value = settings.timerColor;
        messageColor.value = settings.messageColor;
        shadowColor.value = settings.shadowColor;
        shadowSize.value = settings.shadowSize;
        shadowBlur.value = settings.shadowBlur;
        updateTextAppearance();
    }
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
    const deltaTime = currentTime - lastTickTime;
    lastTickTime = currentTime;
    
    accumulatedTime += deltaTime;
    
    while (accumulatedTime >= 1000) {
        if (secondsRemaining > 0) {
            secondsRemaining--;
            saveState();
        } else {
            switchPhase();
        }
        accumulatedTime -= 1000;
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

        document.getElementById('applyCustomizationsBtn').addEventListener('click', function() {
            updateMessage();
            saveState();
            alert('Customizations applied!');
            saveAppearanceSettings();
            
            // Aggiungi le impostazioni di aspetto all'URL
            const appearanceSettings = {
                timerColor: document.getElementById('timerColor').value,
                messageColor: document.getElementById('messageColor').value,
                shadowColor: document.getElementById('shadowColor').value,
                shadowSize: document.getElementById('shadowSize').value,
                shadowBlur: document.getElementById('shadowBlur').value
            };

            // Aggiungi i parametri all'URL
            let url = 'lunar banners.html?';
            if (banner1Url) url += `bg1=${encodeURIComponent(banner1Url)}&`;
            if (banner1Text) url += `text1=${encodeURIComponent(banner1Text)}&`;
            if (banner2Url) url += `bg2=${encodeURIComponent(banner2Url)}&`;
            if (banner2Text) url += `text2=${encodeURIComponent(banner2Text)}&`;
            if (minuteInput.value) url += `minute=${minuteInput.value}&`;
            if (secondInput.value) url += `second=${secondInput.value}&`;
            
            // Aggiungi le impostazioni di aspetto
            url += `appearance=${encodeURIComponent(JSON.stringify(appearanceSettings))}`;

            // Copia l'URL negli appunti
            navigator.clipboard.writeText(url).then(() => {
                showNotification('urlCopied');
            });
        });

        document.getElementById('copyToOBSBtn')?.addEventListener('click', copyToOBS);
    }

    initializeFromURL();
    rotateSignatures();
});

// Load settings when page loads
window.addEventListener('load', loadAppearanceSettings);

// Avvia il timer con maggiore precisione
setInterval(timerTick, 100);

document.getElementById('copyToOBSBtn').addEventListener('click', function() {
    // Salva le impostazioni correnti
    const appearanceSettings = {
        timerColor: timerColor.value,
        messageColor: messageColor.value,
        shadowColor: shadowColor.value,
        shadowSize: shadowSize.value,
        shadowBlur: shadowBlur.value
    };

    // Aggiungi i parametri delle personalizzazioni all'URL
    const url = new URL(window.location.href);
    url.searchParams.set('appearance', JSON.stringify(appearanceSettings));
    
    // Copia l'URL negli appunti
    navigator.clipboard.writeText(url.toString()).then(() => {
        showNotification('urlCopied');
    });
});

// Funzione per caricare le impostazioni dall'URL quando la pagina si carica
function loadSettingsFromUrl() {
    const url = new URL(window.location.href);
    const appearanceParam = url.searchParams.get('appearance');
    
    if (appearanceParam) {
        try {
            const settings = JSON.parse(appearanceParam);
            timerColor.value = settings.timerColor;
            messageColor.value = settings.messageColor;
            shadowColor.value = settings.shadowColor;
            shadowSize.value = settings.shadowSize;
            shadowBlur.value = settings.shadowBlur;
            updateTextAppearance();
        } catch (e) {
            console.error('Error loading appearance settings from URL:', e);
        }
    }
}

// Carica le impostazioni quando la pagina si apre
window.addEventListener('load', loadSettingsFromUrl);