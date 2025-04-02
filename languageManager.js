let currentLang = localStorage.getItem('preferredLanguage') || 'en';

function updatePageLanguage() {
    document.documentElement.lang = currentLang;
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[currentLang] && translations[currentLang][key]) {
            element.textContent = translations[currentLang][key];
        }
    });

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === currentLang);
    });
}

function initializeLanguage() {
    const languageSelector = document.createElement('div');
    languageSelector.className = 'language-selector';
    languageSelector.innerHTML = `
        <button class="lang-btn" data-lang="en" title="English"></button>
        <button class="lang-btn" data-lang="jp" title="日本語"></button>
        <button class="lang-btn" data-lang="cn" title="中文"></button>
        <button class="lang-btn" data-lang="it" title="Italiano"></button>
        <button class="lang-btn" data-lang="fr" title="Français"></button>
        <button class="lang-btn" data-lang="de" title="Deutsch"></button>
        <button class="lang-btn" data-lang="es" title="Español"></button>
        <button class="lang-btn" data-lang="pt" title="Português"></button>
    `;

    document.body.insertAdjacentElement('afterbegin', languageSelector);

    // Add event listeners to language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentLang = btn.getAttribute('data-lang');
            localStorage.setItem('preferredLanguage', currentLang);
            updatePageLanguage();
        });
    });

    updatePageLanguage();
}

document.addEventListener('DOMContentLoaded', initializeLanguage);