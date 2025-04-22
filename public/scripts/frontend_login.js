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
        })
        .then(response => {
            if (!response.ok) {
                if (response.status === 404) {
                    error_text.textContent = 'Error: Usuario no encontrado';
                } else if (response.status === 401) {
                    error_text.textContent = 'Contraseña incorrecta';
                } else {
                    error_text.textContent = 'Error: Problema con el servidor. Intente más tarde.';
                }
                throw new Error(`Error: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const user_info = {
                user_id: data.user_info.user_id,
                user_role: data.user_info.user_role
            };
            sessionStorage.setItem('user_info', JSON.stringify(user_info));
            window.location.href = './home.html';
        })
        .catch(error => {
            console.error('Error: ', error);
        });
        /* -> Local development */
        /*
        fetch(`http://localhost:3000/login_info/${user_id}`)
            .then(response => {
                if (!response.ok) {
                    if (response.status === 404) {
                        error_text.textContent = 'Error: Usuario no encontrado';
                    } else {
                        error_text.textContent = 'Error: Hubo problemas consiguiendo los datos. Intente más tarde.';
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
                }
            })
            .catch(error =>
                console.error('Error: ', error)
            )
        */
    }
}