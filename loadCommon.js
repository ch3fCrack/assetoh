async function loadHeader() {
    const response = await fetch('header.html');
    const html = await response.text();
    document.querySelector('body').insertAdjacentHTML('afterbegin', html);
}