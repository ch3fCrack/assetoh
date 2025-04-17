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
        textColor: textColorInput.value,
        timerColor: timerColorInput.value,
        textShadowColor: textShadowColorInput.value,
        timerShadowColor: timerShadowColorInput.value,
        shadowDistanceX: shadowDistanceXInput.value,
        shadowDistanceY: shadowDistanceYInput.value
    };

    const baseUrl = window.location.origin + '/lunar%20banners.html';
    const queryString = Object.entries(state)
        .filter(([_, value]) => value !== undefined && value !== '')
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
            applyStyles();
            saveState();
            alert('Customizations applied!');
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