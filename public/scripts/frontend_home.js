let api_url = 'http://localhost:3000';

window.addEventListener('load', async (event) => {
    try {
        const response = await fetch(`${api_url}/session`, {
            method: 'GET',
            credentials: 'same-origin',
        });
        if (response.status === 401) {
            window.location.href = '/';
        } else {
            load_home()
        }
    } catch (error) {
        console.error('Error:', error);
        window.location.href = '/';
    }
})

async function load_home() {
    const user_role_text = document.getElementById('nav_role');

    user_info = JSON.parse(sessionStorage.getItem('user_info'));

    user_id = user_info.user_id;
    let role_table = user_info.user_role == 'alumno' ? 'alumnos' : 'profesores';
    let user_role = user_info.user_role == 'alumno' ? 'Alumno' : 'Profesor';

    try {
        const response = await fetch(`${api_url}/user_home`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: user_id,
                role_table: role_table
            })
        });

        if (!response.ok) {
            if (response.status === 404) {
                user_role_text.textContent = 'Usuario no encontrado';
            }
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        if (data.apellido) {
            user_role_text.textContent = user_role + ' ' + data.nombre + ' ' + data.apellido;
        } else {
            user_role_text.textContent = user_role + ' ' + data.nombre;
        }

    } catch (error) {
        console.error('Error:', error);
    }
}


function home_screen() {
    location.reload();
}