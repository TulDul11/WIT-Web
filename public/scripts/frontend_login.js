function login_auth() {
    const user_id = document.getElementById('login_user').value;
    const user_password = document.getElementById('login_password').value;

    const error_text = document.getElementById('error_text');
    const error_symbol = document.getElementById('error_symbol');

    if (!user_id && !user_password) {
        error_text.textContent = 'Se requiere llenar los campos de usuario y contraseña.';
        error_symbol.style.display = 'grid';
    } else if (!user_id) {
        error_text.textContent = 'Se requiere llenar el campo de usuario.';
        error_symbol.style.display = 'grid';
    } else if (!user_password) {
        error_text.textContent = 'Se requiere llenar el campo de contraseña.';
        error_symbol.style.display = 'grid';
    } else {
        error_text.textContent = '';
        error_symbol.style.display = 'none';
        /* -> Deployment */
        /*
        fetch(`http://pk8ksokco8soo8ws0ks040s8.172.200.210.83.sslip.io/login_info/${user_id}`)
            .then(response => {
                if (!response.ok) {
                    if (response.status === 404) {
                        error_text.textContent = 'Usuario no encontrado';
                        error_symbol.style.display = 'grid';
                    } else {
                        error_text.textContent = 'Error: Hubo problemas consiguiendo los datos. Intente más tarde.';
                        error_symbol.style.display = 'grid';
                    }
                    throw new Error(`Error: ${response.status}`);
                }
                return response.json(); 
            })
            .then(data => {
                if (data.contrasena === user_password) {
                    

                    const user_info = {
                        'user_id': user_id,
                        'user_role': data.rol
                    }
                    sessionStorage.setItem('user_info', JSON.stringify(user_info));
                    window.location.href = './home.html';
                } else {
                    error_text.textContent = 'Contraseña incorrecta';
                    error_symbol.style.display = 'grid';
                }
            })
            .catch(error => {
                console.error('Error: ', error);
                error_text.textContent = 'Error: Hubo problemas consiguiendo los datos. Intente más tarde.';
                error_symbol.style.display = 'grid';
            })
        */
        /* -> Local development */
        fetch(`http://localhost:3000/login_info/${user_id}`)
            .then(response => {
                if (!response.ok) {
                    if (response.status === 404) {
                        error_text.textContent = 'Usuario no encontrado';
                        error_symbol.style.display = 'grid';
                    } else {
                        error_text.textContent = 'Error: Hubo problemas consiguiendo los datos. Intente más tarde.';
                        error_symbol.style.display = 'grid';
                    }
                    throw new Error(`Error: ${response.status}`);
                }
                return response.json(); 
            })
            .then(data => {
                if (data.contrasena === user_password) {
                    const user_info = {
                        'user_id': user_id,
                        'user_role': data.rol
                    }
                    sessionStorage.setItem('user_info', JSON.stringify(user_info));
                    window.location.href = './home.html';
                } else {
                    error_text.textContent = 'Contraseña incorrecta';
                    error_symbol.style.display = 'grid';
                }
            })
            .catch(error => {
                console.error('Error: ', error);
                error_text.textContent = 'Error: Hubo problemas consiguiendo los datos. Intente más tarde.';
                error_symbol.style.display = 'grid';
            })
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