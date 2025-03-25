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
const timerColorInput = document.getElementById('timerColor');
const messageColorInput = document.getElementById('messageColor');

function updateTimerDisplay() {
    let minutes = Math.floor(secondsRemaining / 60);
    let seconds = secondsRemaining % 60;
    timerElement.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function updateMessage() {
    if (phase === "main") {
        messageElement.textContent = textBanner1Input.value || "Timer di 45 minuti";
        timerContainer.className = "container main";
        timerContainer.style.backgroundImage = `url('${bgBanner1Input.value || ""}')`;
    } else {
        messageElement.textContent = textBanner2Input.value || "Timer di 15 minuti";
        timerContainer.className = "container short";
        timerContainer.style.backgroundImage = `url('${bgBanner2Input.value || ""}')`;
    }
    
    // Apply current colors
    timerElement.style.color = timerColorInput.value;
    messageElement.style.color = messageColorInput.value;
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
        const elapsedMinutes = Math.abs(minutesToEvent);
        const elapsedSeconds = Math.abs(secondsToEvent);
        phase = "short";
        timerMinutes = 15 - elapsedMinutes;
        secondsRemaining = timerMinutes * 60 - elapsedSeconds;

        if (secondsRemaining < 0) {
            secondsRemaining = 0;
        }

        updateMessage();
        updateTimerDisplay();
        saveState();

        alert(`Il timer di 15 minuti è già iniziato e mancano ${Math.floor(secondsRemaining / 60)}:${secondsRemaining % 60 < 10 ? '0' : ''}${secondsRemaining % 60}.`);
        return;
    }

    secondsRemaining = minutesToEvent * 60 + secondsToEvent;
    timerMinutes = Math.floor(secondsRemaining / 60);
    phase = "main";
    updateMessage();
    updateTimerDisplay();
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
        text2: textBanner2Input.value,
        timerColor: timerColorInput.value,
        messageColor: messageColorInput.value
    };
    sessionStorage.setItem('timerState', JSON.stringify(state));
}

function copyToOBS() {
    const startTime = Date.now();
    const state = {
        phase,
        initialSeconds: secondsRemaining,
        startTime,
        bg1: bgBanner1Input.value,
        text1: encodeURIComponent(textBanner1Input.value),
        bg2: bgBanner2Input.value,
        text2: encodeURIComponent(textBanner2Input.value),
        customMin: document.getElementById('customMinutes').value,
        customSec: document.getElementById('customSeconds').value,
        timerColor: timerColorInput.value,
        messageColor: messageColorInput.value,
        transparent: true
    };

    const baseUrl = window.location.origin + '/lunar%20banners.html';
    const queryString = Object.entries(state)
        .filter(([_, value]) => value !== undefined && value !== '')
        .map(([key, value]) => `${key}=${value}`)
        .join('&');

    const obsUrl = `${baseUrl}?${queryString}`;

    sessionStorage.setItem('lunarBannerSettings', JSON.stringify({
        ...state,
        secondsRemaining,
        initialSeconds: secondsRemaining
    }));
    sessionStorage.setItem('lunarBannerStartTime', startTime.toString());

    navigator.clipboard.writeText(obsUrl);
    alert(`URL per OBS copiato!`);
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
        if (state.timerColor) timerColorInput.value = state.timerColor;
        if (state.messageColor) messageColorInput.value = state.messageColor;
    } else {
        if (urlParams.has('phase')) phase = urlParams.get('phase');
        if (urlParams.has('secondsRemaining')) secondsRemaining = parseInt(urlParams.get('secondsRemaining'));
        if (urlParams.has('bg1')) bgBanner1Input.value = urlParams.get('bg1');
        if (urlParams.has('text1')) textBanner1Input.value = decodeURIComponent(urlParams.get('text1'));
        if (urlParams.has('bg2')) bgBanner2Input.value = urlParams.get('bg2');
        if (urlParams.has('text2')) textBanner2Input.value = decodeURIComponent(urlParams.get('text2'));
        if (urlParams.has('customMin')) document.getElementById('customMinutes').value = urlParams.get('customMin');
        if (urlParams.has('customSec')) document.getElementById('customSeconds').value = urlParams.get('customSec');
        if (urlParams.has('timerColor')) timerColorInput.value = urlParams.get('timerColor');
        if (urlParams.has('messageColor')) messageColorInput.value = urlParams.get('messageColor');
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