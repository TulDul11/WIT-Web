function login_auth() {
    const user_id = document.getElementById('login_user').value;
    const user_password = document.getElementById('login_password').value;
    const error_text = document.getElementById('error_message');

    if (!user_id && !user_password) {
        error_text.textContent = 'Error: Se requiere llenar los campos de usuario y contraseña.';
    } else if (!user_id) {
        error_text.textContent = 'Error: Se requiere llenar el campo de usuario.';
    } else if (!user_password) {
        error_text.textContent = 'Error: Se requiere llenar el campo de contraseña.';
    } else {
        fetch(`http://pk8ksokco8soo8ws0ks040s8.172.200.210.83.sslip.io/login_info`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
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
        
        const data = await response.json();

        // Guardar user_info en localStorage para que Unity pueda leerlo desde PlayerPrefs
        const user_info = {
            user_id: data.user_info.user_id,
            user_role: data.user_info.user_role
        };
        localStorage.setItem('user_info', JSON.stringify(user_info));
        
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