var CONFIG = {
    eventStartMinute: 52,  // L'evento inizia al minuto 52 di ogni ora
    eventStartSecond: 30   // e 30 secondi
};

// Aggiungi queste costanti in cima al file per i background predefiniti
const DEFAULT_BG_GRAVITATIONAL = "https://i.imgur.com/3koyFlo.png";
const DEFAULT_BG_NORMAL = "https://i.imgur.com/3koyFlo.png";

let timerMinutes = 30;    // La fase gravitazionale dura 30 minuti
let secondsRemaining = timerMinutes * 60;
let phase = "gravitational";  // Ora abbiamo "gravitational" e "normal"
let lastTickTime = performance.now();
let accumulatedTime = 0;

const timerElement = document.getElementById('timer');
const messageElement = document.getElementById('message');
const timerContainer = document.getElementById('timerContainer');
const bgBanner1Input = document.getElementById('bgBanner1');
const textBanner1Input = document.getElementById('textBanner1');
const bgBanner2Input = document.getElementById('bgBanner2');
const textBanner2Input = document.getElementById('textBanner2');

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
    if (phase === "gravitational") {
        // Usa esplicitamente il messaggio predefinito se il campo è vuoto
        const customText = textBanner2Input?.value;
        messageElement.textContent = (customText && customText.trim() !== '') ? 
            customText : "Lunar gravity has begun";
        
        timerContainer.className = "container gravitational";
        
        // Usa l'immagine predefinita se non è stato fornito un URL personalizzato
        const bgUrl = bgBanner2Input?.value && bgBanner2Input.value.trim() !== '' ? 
            bgBanner2Input.value : DEFAULT_BG_GRAVITATIONAL;
        timerContainer.style.backgroundImage = `url('${bgUrl}')`;
    } else {
        // Usa esplicitamente il messaggio predefinito se il campo è vuoto
        const customText = textBanner1Input?.value;
        messageElement.textContent = (customText && customText.trim() !== '') ? 
            customText : "Lunar Gravity Is Coming";
            
        timerContainer.className = "container normal";
        
        // Usa l'immagine predefinita se non è stato fornito un URL personalizzato
        const bgUrl = bgBanner1Input?.value && bgBanner1Input.value.trim() !== '' ? 
            bgBanner1Input.value : DEFAULT_BG_NORMAL;
        timerContainer.style.backgroundImage = `url('${bgUrl}')`;
    }
}

function switchPhase() {
    phase = (phase === "gravitational") ? "normal" : "gravitational";
    secondsRemaining = 30 * 60; // Sempre 30 minuti per entrambe le fasi
    updateMessage();
    saveState();
}

function applyStyles() {
    console.log("Applying styles..."); // Debug
    const textColor = textColorInput.value;
    const timerColor = timerColorInput.value;
    const textShadowColor = textShadowColorInput.value;
    const timerShadowColor = timerShadowColorInput.value;
    const shadowDistanceX = shadowDistanceXInput.value + 'px';
    const shadowDistanceY = shadowDistanceYInput.value + 'px';

    console.log("Text color:", textColor); // Debug
    console.log("Timer color:", timerColor); // Debug

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
        bg1: bgBanner1Input?.value,
        text1: textBanner1Input?.value,
        bg2: bgBanner2Input?.value,
        text2: textBanner2Input?.value,
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
    // Definiamo i banner predefiniti da usare quando non specificati dall'utente
    const DEFAULT_BG_GRAVITATIONAL = "https://i.imgur.com/3koyFlo.png";
    const DEFAULT_BG_NORMAL = "https://i.imgur.com/3koyFlo.png";

    const state = {
        minute: CONFIG.eventStartMinute,
        second: CONFIG.eventStartSecond,
        bg1: bgBanner1Input?.value || DEFAULT_BG_NORMAL,
        text1: encodeURIComponent(textBanner1Input?.value || 'Lunar Gravity Is Coming'),
        bg2: bgBanner2Input?.value || DEFAULT_BG_GRAVITATIONAL,
        text2: encodeURIComponent(textBanner2Input?.value || 'Lunar gravity has begun'),
        phase,
        transparent: true,
        startTime: Date.now(),
        showSignature: true,
        textColor: textColorInput.value,
        timerColor: timerColorInput.value,
        textShadowColor: textShadowColorInput.value,
        timerShadowColor: timerShadowColorInput.value,
        shadowDistanceX: shadowDistanceXInput.value,
        shadowDistanceY: shadowDistanceYInput.value
    };

    const baseUrl = window.location.origin + '/lunar%20banners.html';
    const queryString = Object.entries(state)
        .filter(([key, value]) => value !== undefined)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
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
    
    // Calcola i minuti totali dall'inizio dell'ora
    const minutesFromHourStart = currentMinute;
    const secondsFromHourStart = currentSecond;
    const totalSecondsFromHourStart = minutesFromHourStart * 60 + secondsFromHourStart;
    
    // Calcola quando inizia la fase gravitazionale in secondi dall'inizio dell'ora
    const gravitationalPhaseStartInSeconds = CONFIG.eventStartMinute * 60 + CONFIG.eventStartSecond;
    
    // Determina in quale fase siamo
    let secondsUntilPhaseChange;
    
    if (totalSecondsFromHourStart >= gravitationalPhaseStartInSeconds) {
        // Siamo dopo il minuto 52:30, quindi siamo nella fase gravitazionale
        phase = "gravitational";
        
        // Calcola i secondi rimanenti in questa fase gravitazionale
        // La fase dura 30 minuti ma dobbiamo considerare che può proseguire nell'ora successiva
        const gravitationalPhaseEndInSeconds = gravitationalPhaseStartInSeconds + 30 * 60;
        
        if (gravitationalPhaseEndInSeconds <= 3600) {
            // La fase finisce nella stessa ora
            secondsUntilPhaseChange = gravitationalPhaseEndInSeconds - totalSecondsFromHourStart;
        } else {
            // La fase finisce nell'ora successiva
            secondsUntilPhaseChange = (3600 - totalSecondsFromHourStart) + (gravitationalPhaseEndInSeconds - 3600);
        }
    } else {
        // Siamo prima del minuto 52:30
        // Dobbiamo determinare se siamo nella fase normale o ancora nella fase gravitazionale dell'ora precedente
        const gravitationalPhaseEndInSecondsFromPreviousHour = gravitationalPhaseStartInSeconds + 30 * 60 - 3600;
        
        if (totalSecondsFromHourStart < gravitationalPhaseEndInSecondsFromPreviousHour) {
            // Siamo ancora nella fase gravitazionale dell'ora precedente
            phase = "gravitational";
            secondsUntilPhaseChange = gravitationalPhaseEndInSecondsFromPreviousHour - totalSecondsFromHourStart;
        } else {
            // Siamo nella fase normale
            phase = "normal";
            secondsUntilPhaseChange = gravitationalPhaseStartInSeconds - totalSecondsFromHourStart;
        }
    }
    
    secondsRemaining = secondsUntilPhaseChange;
    
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

        textColorInput.value = state.textColor || '#f0f0f0';
        timerColorInput.value = state.timerColor || '#ffffff';
        textShadowColorInput.value = state.textShadowColor || '#000000';
        timerShadowColorInput.value = state.timerShadowColor || '#000000';
        shadowDistanceXInput.value = state.shadowDistanceX || '2';
        shadowDistanceYInput.value = state.shadowDistanceY || '2';

    } else {
        // Se non ci sono stati salvati, inizializza in base all'URL o i valori predefiniti
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
    applyStyles();
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
            CONFIG.eventStartMinute = parseInt(document.getElementById('minuteInput').value) || 52;
            CONFIG.eventStartSecond = parseInt(document.getElementById('secondInput').value) || 30;
            initializeTimer();
            alert(`Timer impostato al minuto ${CONFIG.eventStartMinute}:${CONFIG.eventStartSecond} di ogni ora`);
        });

        document.getElementById('defaultBtn')?.addEventListener('click', function() {
            document.getElementById('minuteInput').value = '52';
            document.getElementById('secondInput').value = '30';
            CONFIG.eventStartMinute = 52;
            CONFIG.eventStartSecond = 30;
            initializeTimer();
        });

        document.getElementById('applyCustomizationsBtn')?.addEventListener('click', function() {
            console.log("Applying customizations..."); // Debug
            updateMessage();
            applyStyles();
            saveState();
        });

        document.getElementById('copyToOBSBtn')?.addEventListener('click', copyToOBS);

        // Gestire gli input per i colori e le ombre
        textColorInput.addEventListener('input', applyStyles);
        timerColorInput.addEventListener('input', applyStyles);
        textShadowColorInput.addEventListener('input', applyStyles);
        timerShadowColorInput.addEventListener('input', applyStyles);
        shadowDistanceXInput.addEventListener('input', applyStyles);
        shadowDistanceYInput.addEventListener('input', applyStyles);
    }

    // Aggiorna i suggerimenti di testo predefiniti per i campi di input
    if (textBanner1Input) textBanner1Input.placeholder = "Lunar Gravity Is Coming";
    if (textBanner2Input) textBanner2Input.placeholder = "Lunar gravity has begun";

    // Aggiorna esplicitamente l'anteprima all'inizializzazione
    initializeFromURL();
    rotateSignatures();
    
    // Forza un aggiornamento dell'anteprima
    updateMessage();
    applyStyles();
    
    // Aggiungi ascoltatori di eventi per l'anteprima in tempo reale
    setupLivePreview();
});

// Aggiungi questo alla fine del tuo file timer.js
function setupLivePreview() {
    // Aggiorna l'anteprima quando cambia qualsiasi input
    const allInputs = [
        bgBanner1Input, textBanner1Input,
        bgBanner2Input, textBanner2Input,
        textColorInput, timerColorInput,
        textShadowColorInput, timerShadowColorInput,
        shadowDistanceXInput, shadowDistanceYInput
    ];
    
    allInputs.forEach(input => {
        if (input) {
            input.addEventListener('input', function() {
                updateMessage();
                applyStyles();
            });
        }
    });
}

// Avvia il timer con maggiore precisione
setInterval(timerTick, 100);

// Nuovo codice per il ripristino dei messaggi predefiniti
document.getElementById('resetDefaultMessagesBtn')?.addEventListener('click', function() {
    // Pulisci i campi di input
    if (textBanner1Input) textBanner1Input.value = '';
    if (textBanner2Input) textBanner2Input.value = '';
    
    // Aggiorna l'anteprima
    updateMessage();
    alert('Messaggi predefiniti ripristinati');
});