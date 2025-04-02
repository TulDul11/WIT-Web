function login_auth() {
    const user_id = document.getElementById('login_user').value;
    const user_password = document.getElementById('login_password').value;

    const error_text = document.getElementById('error_message');

    if (!user_id && !user_password) {
        error_text.textContent = 'Error: Se requiere llenar los campos de usuario y contraseña.'
    } else if (!user_id) {
        error_text.textContent = 'Error: Se requiere llenar el campo de usuario.'
    } else if (!user_password) {
        error_text.textContent = 'Error: Se requiere llenar el campo de contraseña.'
    } else {
        fetch(`http://localhost:3000/login_info/${user_id}`)
            .then(response => {
                if (!response.ok) {
                    if (response.status === 404) {
                        error_text.textContent = 'Error: Usuario no encontrado';
                    } else {
                        error_text.textContent = 'Error: Hubo problemas consiguiendo los datos. Intenté más tarde.';
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
    }
}