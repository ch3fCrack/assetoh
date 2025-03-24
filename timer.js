let timerMinutes = 45;
let secondsRemaining = timerMinutes * 60;
let phase = "main";
let customMinutes = 10;
let customSeconds = 30;

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
        messageElement.textContent = textBanner1Input.value || "Scritta personalizzata per il timer di 45 minuti";
        timerContainer.className = "container main";
        timerContainer.style.backgroundImage = `url('${bgBanner1Input.value || ""}')`;
    } else {
        messageElement.textContent = textBanner2Input.value || "Scritta personalizzata per il timer di 15 minuti";
        timerContainer.className = "container short";
        timerContainer.style.backgroundImage = `url('${bgBanner2Input.value || ""}')`;
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

function setCustomTime() {
    customMinutes = parseInt(document.getElementById('customMinutes').value);
    customSeconds = parseInt(document.getElementById('customSeconds').value);

    const currentDate = new Date();
    const currentMinutes = currentDate.getMinutes();
    const currentSeconds = currentDate.getSeconds();

    let minutesToEvent = customMinutes - currentMinutes;
    let secondsToEvent = customSeconds - currentSeconds;

    if (secondsToEvent < 0) {
        secondsToEvent += 60;
        minutesToEvent--;
    }

    if (minutesToEvent < 0) {
        minutesToEvent += 60;
    }

    secondsRemaining = minutesToEvent * 60 + secondsToEvent;
    timerMinutes = Math.floor(secondsRemaining / 60);
    phase = "main";
    updateMessage();
    saveState();

    alert(`Il timer di 15 minuti partirà alle ${customMinutes}:${customSeconds < 10 ? '0' : ''}${customSeconds}.`);
}

function applyCustomizations() {
    updateMessage();
    saveState();
    alert("Personalizzazioni applicate!");
}

function checkSpecialCondition() {
    const currentDate = new Date();
    const currentMinutes = currentDate.getMinutes();
    const currentSeconds = currentDate.getSeconds();

    if (currentMinutes === customMinutes && currentSeconds === customSeconds) {
        phase = "short";
        timerMinutes = 15;
        secondsRemaining = timerMinutes * 60;
        updateMessage();
        saveState();
    }
}

function timerTick() {
    if (secondsRemaining > 0) {
        secondsRemaining--;
        saveState();
    } else {
        switchPhase();
    }
    updateTimerDisplay();
}

function saveState() {
    const state = {
        phase,
        secondsRemaining,
        timerMinutes,
        customMinutes,
        customSeconds,
        bg1: bgBanner1Input.value,
        text1: textBanner1Input.value,
        bg2: bgBanner2Input.value,
        text2: textBanner2Input.value
    };
    sessionStorage.setItem('timerState', JSON.stringify(state));
}

function copyToOBS() {
    const startTime = Date.now();
    const state = {
        phase,
        initialSeconds: secondsRemaining, // Store initial seconds instead of current
        startTime, // Add start time
        bg1: bgBanner1Input.value,
        text1: encodeURIComponent(textBanner1Input.value),
        bg2: bgBanner2Input.value,
        text2: encodeURIComponent(textBanner2Input.value),
        customMin: document.getElementById('customMinutes').value,
        customSec: document.getElementById('customSeconds').value,
        transparent: true
    };

    // Use file path with spaces properly encoded
    const baseUrl = window.location.origin + '/lunar%20banners.html';
    const queryString = Object.entries(state)
        .filter(([_, value]) => value !== undefined && value !== '')
        .map(([key, value]) => `${key}=${value}`)
        .join('&');

    const obsUrl = `${baseUrl}?${queryString}`;

    // Store initial state in sessionStorage
    sessionStorage.setItem('lunarBannerSettings', JSON.stringify({
        ...state,
        secondsRemaining,
        initialSeconds: secondsRemaining
    }));
    sessionStorage.setItem('lunarBannerStartTime', startTime.toString());

    navigator.clipboard.writeText(obsUrl);
    console.log("URL generato:", obsUrl);
    
    alert(`URL per OBS copiato!\n\nIstruzioni:\n1. Apri OBS Studio\n2. Aggiungi una nuova "Fonte Browser"\n3. Incolla l'URL copiato\n4. Imposta la larghezza e l'altezza come desideri\n5. Attiva "Sfondo trasparente" se necessario`);
}

function initializeFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const savedState = sessionStorage.getItem('timerState');
    
    if (savedState) {
        const state = JSON.parse(savedState);
        phase = state.phase;
        secondsRemaining = state.secondsRemaining;
        timerMinutes = state.timerMinutes;
        customMinutes = state.customMinutes;
        customSeconds = state.customSeconds;
        
        if (state.bg1) bgBanner1Input.value = state.bg1;
        if (state.text1) textBanner1Input.value = state.text1;
        if (state.bg2) bgBanner2Input.value = state.bg2;
        if (state.text2) textBanner2Input.value = state.text2;
    } else {
        if (urlParams.has('phase')) phase = urlParams.get('phase');
        if (urlParams.has('secondsRemaining')) secondsRemaining = parseInt(urlParams.get('secondsRemaining'));
        if (urlParams.has('bg1')) bgBanner1Input.value = urlParams.get('bg1');
        if (urlParams.has('text1')) textBanner1Input.value = decodeURIComponent(urlParams.get('text1'));
        if (urlParams.has('bg2')) bgBanner2Input.value = urlParams.get('bg2');
        if (urlParams.has('text2')) textBanner2Input.value = decodeURIComponent(urlParams.get('text2'));
        if (urlParams.has('customMin')) document.getElementById('customMinutes').value = urlParams.get('customMin');
        if (urlParams.has('customSec')) document.getElementById('customSeconds').value = urlParams.get('customSec');
    }
    
    if (urlParams.has('transparent')) {
        document.body.style.backgroundColor = 'transparent';
        timerContainer.style.backgroundColor = 'rgba(36, 36, 36, 0.7)';
    }
    
    updateMessage();
    updateTimerDisplay();
}

document.addEventListener('DOMContentLoaded', initializeFromURL);

setInterval(() => {
    checkSpecialCondition();
    timerTick();
}, 1000);

updateMessage();
updateTimerDisplay();