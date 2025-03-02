// Caricamento delle GIF da GitHub
const gifContainer = document.getElementById("gifContainer");
const cdnBase = "https://cdn.jsdelivr.net/gh/ch3fCrack/assetoh2.0@main/";
const gifList = [
    "gifs/gif1.gif",
    "gifs/gif2.gif",
    "gifs/gif3.gif",
    "gifs/gif4.gif",
    "gifs/gif5.gif",
    "gifs/gif6.gif",
    "gifs/gif7.gif",
    "gifs/gif8.gif",
    "gifs/gif9.gif"
];
if (gifContainer) {
    gifList.forEach(gif => {
        const div = document.createElement("div");
        div.classList.add("asset");
        const fullUrl = githubRawBase + gif;
        div.innerHTML = `
            <img src="${fullUrl}" alt="GIF ${gif}">
            <button onclick="copyToOBS('${fullUrl}')">Copy for OBS</button>
        `;
        gifContainer.appendChild(div);
    });
}

function copyToOBS(gifUrl) {
    navigator.clipboard.writeText(gifUrl).then(() => {
        alert("URL copied for OBS: " + gifUrl);
    });
}

// Caricamento dei Banners
const bannerContainer = document.getElementById("bannerContainer");
const bannerList = Array.from({ length: 0 }, (_, i) => `banners/banner${i + 1}.png`);
const googleDriveUrl = "https://drive.google.com/drive/folders/1fKT6w6J248944ZQ41t_WE_RoqW9YRwwW?usp=sharing";

if (bannerContainer) {
    bannerList.forEach(banner => {
        const div = document.createElement("div");
        div.classList.add("asset");
        div.innerHTML = `<img src="${banner}" alt="Banner ${banner}">`;
        bannerContainer.appendChild(div);
    });
}

// Password protection
document.addEventListener("DOMContentLoaded", () => {
    const passwordSection = document.getElementById("password-section");
    const protectedContent = document.getElementById("protected-content");
    const errorMessage = document.getElementById("error-message");

    const correctPassword = "nuggets";

    window.checkPassword = function () {
        const passwordInput = document.getElementById("password-input");
        if (passwordInput.value === correctPassword) {
            passwordSection.style.display = "none";
            protectedContent.style.display = "block";
            errorMessage.style.display = "none";
        } else {
            errorMessage.style.display = "block";
            passwordInput.value = "";
        }
    };
});