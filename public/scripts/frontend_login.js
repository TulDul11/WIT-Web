function login_auth() {
    const user_id = document.getElementById('login_user').value;
    const user_password = document.getElementById('login_password').value;

    const error_text = document.getElementById('error_message');

    /* Re-add API connection */

    /* Log-in testing functionality */
    if (!user_id && !user_password) {
        error_text.textContent = 'Error: Se requiere llenar los campos de usuario y contraseña.'
    } else if (!user_id) {
        error_text.textContent = 'Error: Se requiere llenar el campo de usuario.'
    } else if (!user_password) {
        error_text.textContent = 'Error: Se requiere llenar el campo de contraseña.'
    } else {
        data = {
            'User': user_id,
            'Password': user_password
        }
        sessionStorage.setItem('user_information', JSON.stringify(data));
        window.location.href = './home.html';
    }
}