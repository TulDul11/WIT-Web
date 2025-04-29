let api_url = 'http://pk8ksokco8soo8ws0ks040s8.172.200.210.83.sslip.io';


/*
Función para vincular el botón de Enter con el botón de inicio de sesión.
*/
document.addEventListener('keydown', function(event) {
    if (event.key == 'Enter') {
        document.getElementById('login_button').click();
    }
});

/*
Función que despliega mensaje de error al entrar a páginas de la aplicación sin haber iniciado sesión.
*/
window.addEventListener('load', () => {
    // Cargamos el mensaje de error.
    const login_error = sessionStorage.getItem('login_error');

    // Si existe mensaje de error, significa que se intentó ingresar a la página web sin haber iniciado sesión.
    if (login_error) {
        const error_text = document.getElementById('error_text');
        const error_symbol = document.getElementById('error_symbol');
        
        error_text.textContent = login_error;
        error_symbol.style.display = 'grid';

        sessionStorage.removeItem('login_error');
    }
});

/*
Función llamada por el botón de inicio de sesión.
Se encarga de la llamada al API para verificar los datos de inicio de sesión.
También hace modificaciones al front-end por UI/UX y prevención de errores.
*/
async function login_auth() {

    // Conseguir todos los elementos UI que serán modificados al empezar inicio de sesión.
    const error_text = document.getElementById('error_text');
    const error_symbol = document.getElementById('error_symbol');
    const user_container = document.getElementById('login_user');
    const password_container = document.getElementById('login_password');
    const login_button = document.getElementById('login_button');
    const login_button_text = document.getElementById('login_button_text');
    const password_toggle_wrapper = document.getElementById('icon_wrapper');
    const login_button_loading_wheel = document.getElementById('login_button_loading_wheel');
    
    // Quitamos cualquier mensaje de error que se haya mostrado (si es que se mostró alguno).
    error_text.textContent = '';
    error_symbol.style.display = 'none';

    // Deshabilitamos ciertas opciones para el usuario para prevenir errores.
    login_button.disabled = true;
    login_button_text.style.display = 'none';
    user_container.disabled = true;
    password_container.disabled = true;
    password_toggle_wrapper.style.display = 'none';

    // Mostramos una rueda de carga que mejora la experiencia de usuario.
    login_button_loading_wheel.style.display = 'inline-block';
    
    // Permitimos 500 segundos de carga para que el usuario sienta que la página si está cargando contenido.
    await new Promise(resolve => setTimeout(resolve, 500));

    // Llamada al API para conseguir respuesta acerca de los datos de usuario.
    try {
        // Llamada
        const response = await fetch(`${api_url}/login_info`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include', // credenciales
            body: JSON.stringify({
                user_id: user_container.value,
                user_password: password_container.value
            })
        });

        // Checa el status de la respuesta.
        // Si hubo un error, mandamos el error y lo desplegamos
        if (!response.ok) {
            const error_data = await response.json();

            error_symbol.style.display = 'grid';
            error_text.textContent = error_data.message;

            return;
        }
        
        const data = await response.json();

        const user_info = {
            user_id: data.user_info.user_id,
            user_role: data.user_info.user_role
        };
        localStorage.setItem('user_info', JSON.stringify(user_info));
        
        // Si no hubo ningún error, podemos pasar a la página de inicio.
        window.location.href = './home';

    } catch (error) {
        console.error('Error:', error);
    } finally {
        // Volvemos a habilitar funciones para el inicio de sesión (en caso de que el usuario no haya podido ingresar).
        login_button.disabled = false;
        login_button_text.style.display = 'inline-block';
        user_container.disabled = false;
        password_container.disabled = false;
        password_toggle_wrapper.style.display = 'flex';

        // Deshabilitamos la rueda de carga.
        login_button_loading_wheel.style.display = 'none';
    }
}

/* 
Función llamada por el botón dentro del cuadro de texto de contraseña para el inicio de sesión.
Se encarga de cambiar el cuadro de texto entre "texto" y "contraseña" para permitir la visibilidad del texto al usuario.
*/
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
