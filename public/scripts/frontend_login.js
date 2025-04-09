// let api_url = 'http://pk8ksokco8soo8ws0ks040s8.172.200.210.83.sslip.io';
let api_url = 'http://localhost:3000'

async function login_auth() {
    
    const user_id = document.getElementById('login_user').value;
    const user_password = document.getElementById('login_password').value;

    const error_text = document.getElementById('error_text');
    const error_symbol = document.getElementById('error_symbol');

    error_text.textContent = '';
    error_symbol.display = 'none';

    try {
        const response = await fetch(`${api_url}/login_info`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                user_id: user_id,
                user_password: user_password
            })
        });

        if (!response.ok) {
            if (response.status === 404) {
                error_text.textContent = 'Usuario no encontrado';
            } else if (response.status === 401) {
                error_text.textContent = 'Contraseña incorrecta';
            } else if (response.status === 399) {
                error_text.textContent = 'Se requiere tanto el usuario como la contraseña.';
            } else {
                error_text.textContent = 'Error al iniciar sesión. Intente más tarde.';
            }
            error_symbol.style.display = 'grid';
            throw new Error(`Error: ${response.status}`);
        }
        
        window.location.href = './home';

    } catch (error) {
        console.error('Error:', error);
    }
}

function password_toggling() {
    let passwordInput = document.getElementById("login_password");
    let toggle_icon = document.getElementById("password_toggle");

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        toggle_icon.classList.remove("fa-eye");
        toggle_icon.classList.add("fa-eye-slash");
    } else {
        passwordInput.type = "password";
        toggle_icon.classList.remove("fa-eye-slash");
        toggle_icon.classList.add("fa-eye");
    }
}