window.addEventListener('DOMContentLoaded', function() {
    const greeting_text = document.getElementById('greeting_text');

    const urlParameters = new URLSearchParams(window.location.search);
    const user = urlParameters.get('user');

    if (user) {
        greeting_text.textContent = "Welcome, " + user; 
    }
});

function logout() {
    window.location.href = "../templates/index.html";
}