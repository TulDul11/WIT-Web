//let api_url = 'http://pk8ksokco8soo8ws0ks040s8.172.200.210.83.sslip.io';
let api_url = 'http://localhost:3000';

document.addEventListener('keydown', function(event) {
    if (event.key == 'Enter') {
        document.getElementById('login_button').click();
    }
});

async function login_auth() {

    const error_text = document.getElementById('error_text');
    const error_symbol = document.getElementById('error_symbol');

    const user_container = document.getElementById('login_user');
    const password_container = document.getElementById('login_password');
    const login_button = document.getElementById('login_button');
    const login_button_text = document.getElementById('login_button_text');
    const login_button_loading_wheel = document.getElementById('login_button_loading_wheel');
    const password_toggle_wrapper = document.getElementById('icon_wrapper');

    error_text.textContent = '';
    error_symbol.style.display = 'none';

    login_button.disabled = true;
    login_button_text.style.display = 'none';
    user_container.disabled = true;
    password_container.disabled = true;
    login_button_loading_wheel.style.display = 'inline-block';
    password_toggle_wrapper.style.display = 'none';

    await new Promise(resolve => setTimeout(resolve, 500));

    try {
        const response = await fetch(`${api_url}/login_info`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                user_id: user_container.value,
                user_password: password_container.value
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
    } finally {
        login_button.disabled = false;
        login_button_text.style.display = 'inline-block';
        user_container.disabled = false;
        password_container.disabled = false;
        login_button_loading_wheel.style.display = 'none';
        password_toggle_wrapper.style.display = 'flex';
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