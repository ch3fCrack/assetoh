var CONFIG = {
    eventStartMinute: 52,
    eventStartSecond: 25
};

let timerMinutes = 45;
let secondsRemaining = timerMinutes * 60;
let phase = "main";

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
        messageElement.textContent = textBanner1Input.value || "Timer di 45 minuti";
        timerContainer.className = "container main";
        timerContainer.style.backgroundImage = `url('${bgBanner1Input.value || ""}')`;
    } else {
        messageElement.textContent = textBanner2Input.value || "Timer di 15 minuti";
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

function saveState() {
    const state = {
        phase,
        secondsRemaining,
        timerMinutes,
        startTime: Date.now(),
        bg1: bgBanner1Input.value,
        text1: textBanner1Input.value,
        bg2: bgBanner2Input.value,
        text2: textBanner2Input.value,
        eventStartMinute: CONFIG.eventStartMinute,
        eventStartSecond: CONFIG.eventStartSecond
    };
    sessionStorage.setItem('timerState', JSON.stringify(state));
}

function copyToOBS() {
    const state = {
        minute: CONFIG.eventStartMinute,
        second: CONFIG.eventStartSecond,
        bg1: bgBanner1Input.value,
        text1: encodeURIComponent(textBanner1Input.value),
        bg2: bgBanner2Input.value,
        text2: encodeURIComponent(textBanner2Input.value),
        phase,
        transparent: true,
        startTime: Date.now()
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

        if (state.bg1) bgBanner1Input.value = state.bg1;
        if (state.text1) textBanner1Input.value = state.text1;
        if (state.bg2) bgBanner2Input.value = state.bg2;
        if (state.text2) textBanner2Input.value = state.text2;
    } else {
        if (params.has('minute')) CONFIG.eventStartMinute = parseInt(params.get('minute'), 10);
        if (params.has('second')) CONFIG.eventStartSecond = parseInt(params.get('second'), 10);
        initializeTimer();
    }

    if (params.has('bg1')) bgBanner1Input.value = params.get('bg1');
    if (params.has('text1')) textBanner1Input.value = decodeURIComponent(params.get('text1'));
    if (params.has('bg2')) bgBanner2Input.value = params.get('bg2');
    if (params.has('text2')) textBanner2Input.value = decodeURIComponent(params.get('text2'));
    
    if (params.has('transparent')) {
        document.body.style.backgroundColor = 'transparent';
        timerContainer.style.backgroundColor = 'rgba(36, 36, 36, 0.7)';
    }

    updateMessage();
    updateTimerDisplay();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('setTimeBtn').addEventListener('click', function() {
        const minute = parseInt(document.getElementById('minuteInput').value, 10);
        const second = parseInt(document.getElementById('secondInput').value, 10);
        
        CONFIG.eventStartMinute = minute;
        CONFIG.eventStartSecond = second;
        initializeTimer();
    });

    document.getElementById('defaultBtn').addEventListener('click', function() {
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
    });

    document.getElementById('copyToOBSBtn').addEventListener('click', copyToOBS);

    initializeFromURL();
});

function initializeTimer() {
    const now = new Date();
    let targetTime = new Date();
    targetTime.setMinutes(CONFIG.eventStartMinute);
    targetTime.setSeconds(CONFIG.eventStartSecond);
    targetTime.setMilliseconds(0);

    if (targetTime < now) {
        const diffMs = now - targetTime;
        const diffSec = Math.floor(diffMs / 1000);
        const shortTimerSec = 15 * 60;
        secondsRemaining = shortTimerSec - (diffSec % shortTimerSec);
        phase = "short";
    } else {
        const diffMs = targetTime - now;
        secondsRemaining = Math.floor(diffMs / 1000);
        phase = "main";
    }

    updateMessage();
    updateTimerDisplay();
    saveState();
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

setInterval(timerTick, 1000);