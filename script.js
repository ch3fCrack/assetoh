// Caricamento delle GIF
const gifContainer = document.getElementById("gifContainer");
const gifList = Array.from({ length: 9 }, (_, i) => `gifs/gif${i + 1}.gif`); // modifica il numeri di gif caricate 
if (gifContainer) {
    gifList.forEach(gif => {
        const div = document.createElement("div");
        div.classList.add("asset");
        div.innerHTML = `
            <img src="${gif}" alt="GIF ${gif}">
            <button onclick="copyToOBS('${gif}')">Copy for OBS</button>
        `;
        gifContainer.appendChild(div);
    });
}

function copyToOBS(gifPath) {
    // URL base del sito su Netlify o GitHub Pages
    const baseUrl = "https://ch3f-nerd-art-asset.netlify.app/"; // Sostituiscilo con il tuo vero dominio
    const obsUrl = baseUrl + gifPath;

    navigator.clipboard.writeText(obsUrl).then(() => {
        alert("URL copiato per OBS: " + obsUrl);
    });
}

// Caricamento dei Banners
const bannerContainer = document.getElementById("bannerContainer");
const bannerList = Array.from({ length: 60 }, (_, i) => `banners/banner${i + 1}.png`);
const googleDriveUrl = "https://drive.google.com/drive/folders/1fKT6w6J248944ZQ41t_WE_RoqW9YRwwW?usp=sharing";

if (bannerContainer) {
    bannerList.forEach(banner => {
        const div = document.createElement("div");
        div.classList.add("asset");
        div.innerHTML = `<img src="${banner}" alt="Banner ${banner}">`;
        bannerContainer.appendChild(div);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const passwordSection = document.getElementById("password-section");
    const protectedContent = document.getElementById("protected-content");
    const errorMessage = document.getElementById("error-message");

    const correctPassword = "nuggets"; // Cambia la password qui

    window.checkPassword = function () {
        const userInput = document.getElementById("passwordInput").value;
        
        if (userInput === correctPassword) {
            passwordSection.style.display = "none";
            protectedContent.style.display = "block";
            loadPrivateBanners();
        } else {
            errorMessage.style.display = "block";
        }
    };
    passwordInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            checkPassword();
        }
    });
    function loadPrivateBanners() {
        const privateBannerContainer = document.getElementById("privateBannerContainer");
        const privateBannerList = Array.from({ length: 1 }, (_, i) => `banners/private/private-banner${i + 1}.png`);

        privateBannerList.forEach(banner => {
            const div = document.createElement("div");
            div.classList.add("asset");
            div.innerHTML = `<img src="${banner}" alt="Banner ${banner}">`;
            privateBannerContainer.appendChild(div);
        });
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const paypalButton = document.getElementById("copyPaypal");
    
    if (paypalButton) {
        paypalButton.addEventListener("click", () => {
            const paypalEmail = "Ch3fcrack2@outlook.it"; // Sostituiscilo con la tua vera email di PayPal
            navigator.clipboard.writeText(paypalEmail).then(() => {
                alert("PayPal email copied: " + paypalEmail);
            });
        });
    }
});