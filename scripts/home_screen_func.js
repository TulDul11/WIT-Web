window.addEventListener('DOMContentLoaded', function() {
    const greeting_text = document.getElementById('greeting_text');

    const userInfo = JSON.parse(this.sessionStorage.getItem('userInfo'));
    const user = userInfo.user;

    if (user) {
        greeting_text.textContent = user; 
    }
});

function openSideMenu() {
    const side_menu = document.getElementById('side_menu');
    const bg_overlay = document.getElementById('background_overlay');
    side_menu.classList.add('active');
    bg_overlay.classList.add('active')
}

function closeSideMenu() {
    const side_menu = document.getElementById('side_menu');
    const bg_overlay = document.getElementById('background_overlay');
    side_menu.classList.remove('active');
    bg_overlay.classList.remove('active');
}

function homeScreen() {
    window.location.href = `../templates/home.html`;
}

function logOut() {
    sessionStorage.removeItem('userInfo');
    window.location.href = `../templates/index.html`;
}