window.addEventListener('DOMContentLoaded', function() {
    const greeting_text = document.getElementById('greeting_text');

    const userInfo = JSON.parse(this.sessionStorage.getItem('userInfo'));
    const user = userInfo.user;

    if (user) {
        greeting_text.textContent = "Bienvenido, " + user; 
    }
});