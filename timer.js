var CONFIG = {
    eventStartMinute: 52,
    eventStartSecond: 25,
    // Add default style settings
    timerColor: "#ffffff",
    messageColor: "#ffffff",
    shadowColor: "#000000",
    shadowSize: "2",
    shadowBlur: "4",
    timerSize: "48",    // nuova proprietà
    messageSize: "24"   // nuova proprietà
};

function applyStyles() {
    const shadowStyle = `${CONFIG.shadowSize}px ${CONFIG.shadowSize}px ${CONFIG.shadowBlur}px ${CONFIG.shadowColor}`;
    
    if (timerElement) {
        timerElement.style.color = CONFIG.timerColor;
        timerElement.style.textShadow = shadowStyle;
        timerElement.style.fontSize = `${CONFIG.timerSize}px`;
    }
    
    if (messageElement) {
        messageElement.style.color = CONFIG.messageColor;
        messageElement.style.textShadow = shadowStyle;
        messageElement.style.fontSize = `${CONFIG.messageSize}px`;
    }
}

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
        eventStartSecond: CONFIG.eventStartSecond,
        // Add style settings
        timerColor: CONFIG.timerColor,
        messageColor: CONFIG.messageColor,
        shadowColor: CONFIG.shadowColor,
        shadowSize: CONFIG.shadowSize,
        shadowBlur: CONFIG.shadowBlur,
        timerSize: CONFIG.timerSize,
        messageSize: CONFIG.messageSize
    };
    sessionStorage.setItem('timerState', JSON.stringify(state));
}

function copyToOBS() {
    const state = {
        minute: CONFIG.eventStartMinute,
        second: CONFIG.eventStartSecond,
        bg1: bgBanner1Input?.value,
        text1: encodeURIComponent(textBanner1Input?.value || ''),
        bg2: bgBanner2Input?.value,
        text2: encodeURIComponent(textBanner2Input?.value || ''),
        timerColor: CONFIG.timerColor,
        messageColor: CONFIG.messageColor,
        shadowColor: CONFIG.shadowColor,
        shadowSize: CONFIG.shadowSize,
        shadowBlur: CONFIG.shadowBlur,
        timerSize: CONFIG.timerSize,
        messageSize: CONFIG.messageSize,
        phase,
        transparent: true,
        showSignature: true
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

// Update the initializeFromURL function to ensure styles are applied

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
    
    // Load style parameters from URL
    if (params.has('timerColor')) CONFIG.timerColor = params.get('timerColor');
    if (params.has('messageColor')) CONFIG.messageColor = params.get('messageColor');
    if (params.has('shadowColor')) CONFIG.shadowColor = params.get('shadowColor');
    if (params.has('shadowSize')) CONFIG.shadowSize = params.get('shadowSize');
    if (params.has('shadowBlur')) CONFIG.shadowBlur = params.get('shadowBlur');
    if (params.has('timerSize')) CONFIG.timerSize = params.get('timerSize');
    if (params.has('messageSize')) CONFIG.messageSize = params.get('messageSize');
    
    applyStyles(); // Make sure this is called
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

        document.getElementById('applyCustomizationsBtn')?.addEventListener('click', function() {
            updateMessage();
            saveState();
            alert('Customizations applied!');
        });

        document.getElementById('copyToOBSBtn')?.addEventListener('click', copyToOBS);

        // Add new style control listeners
        document.getElementById('timerColor')?.addEventListener('change', function(e) {
            CONFIG.timerColor = e.target.value;
            applyStyles();
            saveState();
        });

        document.getElementById('messageColor')?.addEventListener('change', function(e) {
            CONFIG.messageColor = e.target.value;
            applyStyles();
            saveState();
        });

        document.getElementById('shadowColor')?.addEventListener('change', function(e) {
            CONFIG.shadowColor = e.target.value;
            applyStyles();
            saveState();
        });

        document.getElementById('shadowSize')?.addEventListener('input', function(e) {
            CONFIG.shadowSize = e.target.value;
            applyStyles();
            saveState();
        });

        document.getElementById('shadowBlur')?.addEventListener('input', function(e) {
            CONFIG.shadowBlur = e.target.value;
            applyStyles();
            saveState();
        });

        // Font size control listeners
        document.getElementById('timerSize')?.addEventListener('input', function(e) {
            CONFIG.timerSize = e.target.value;
            document.getElementById('timerSizeValue').textContent = `${e.target.value}px`;
            applyStyles();
            saveState();
        });

        document.getElementById('messageSize')?.addEventListener('input', function(e) {
            CONFIG.messageSize = e.target.value;
            document.getElementById('messageSizeValue').textContent = `${e.target.value}px`;
            applyStyles();
            saveState();
        });

        // Initialize style controls with saved values
        const savedState = sessionStorage.getItem('timerState');
        if (savedState) {
            const state = JSON.parse(savedState);
            document.getElementById('timerColor').value = state.timerColor || '#ffffff';
            document.getElementById('messageColor').value = state.messageColor || '#ffffff';
            document.getElementById('shadowColor').value = state.shadowColor || '#000000';
            document.getElementById('shadowSize').value = state.shadowSize || '2';
            document.getElementById('shadowBlur').value = state.shadowBlur || '4';
            if (document.getElementById('timerSize')) {
                document.getElementById('timerSize').value = state.timerSize || '48';
                document.getElementById('timerSizeValue').textContent = `${state.timerSize || '48'}px`;
            }
            if (document.getElementById('messageSize')) {
                document.getElementById('messageSize').value = state.messageSize || '24';
                document.getElementById('messageSizeValue').textContent = `${state.messageSize || '24'}px`;
            }
        }
    }

    initializeFromURL();
    rotateSignatures();
});

// Avvia il timer con maggiore precisione
setInterval(timerTick, 100);