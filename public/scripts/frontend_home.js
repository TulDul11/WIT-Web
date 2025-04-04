let api_url = 'http://localhost:3000';

window.addEventListener('load', async (event) => {
    try {
        const response = await fetch(`${api_url}/session/in`, {
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
        
        const user_role_text = document.getElementById('nav_role');
        user_role_text.textContent = user_role;
        const card_name = document.getElementById('card_name');

        if (data.apellido) {
            card_name.innerHTML = data.nombre + ' ' + data.apellido;
        } else {
            card_name.innerHTML = data.nombre
        }

    } catch (error) {
        console.error('Error:', error);
    }
    
    if (user_role == 'Alumno') {
        const alumno_body = document.getElementById('alumno_body');
        alumno_body.style.display = 'flex';
        set_up_alumno(role_table, user_id)
    } else {
        const profesor_body = document.getElementById('profesor_body');
        profesor_body.style.display = 'flex';
        set_up_profesor(role_table, user_id)
    }
}

async function set_up_alumno(user_role, user_id) {
    try {
        const response = await fetch(`${api_url}/courses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_role: user_role,
                user_id: user_id
            })
        });

        if (!response.ok) {
            if (response.status === 404) {
                user_role_text.textContent = 'No esta inscrito en ningun curso';
            }
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        
        const alumno_cursos = document.getElementById('alumno_cursos');

        for (let curso of data.course_data) {
            let carta_curso = `<div class="card" style="width: 18rem; background-color: #ffffff; border-radius: 0.5rem; box-shadow: 0 0 12px rgba(1, 28, 44, 0.3), 0 0 22px rgba(0, 163, 255, 0.2);">
                    <a href="your_target_page.html" style="text-decoration: none; color: inherit;">
                        <img class="card-img-top" src="../images/educacion.png" alt="Card image cap"
                            style="height: 8rem; object-fit: cover; border-top-left-radius: 0.5rem; border-top-right-radius: 0.5rem;">
                        <div class="card-body" style="height: 7rem; padding: 0.5rem;">
                            <h9 class="card-title" style="font-size: 1rem; font-weight: bold; font-family: Arial, sans-serif; margin-bottom: 0.2rem;">${curso[0].nombre}</h9>
                            <h15 class="card-code" style="font-size: 0.625rem; margin-bottom: 0.2rem; display: block;">${curso[0].cod}</h15>
                            <small class="card-text" style="font-size: 0.75rem; margin: 0.3rem 0 0.8rem;">${curso[0].descripcion}</small>
                        </div>
                    </a>
                </div>`
            alumno_cursos.innerHTML += carta_curso;
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

async function set_up_profesor(user_role, user_id) {
    try {
        const response = await fetch(`${api_url}/courses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_role: user_role,
                user_id: user_id
            })
        });

        if (!response.ok) {
            if (response.status === 404) {
                user_role_text.textContent = 'No da ningun curso';
            }
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        
        const profesor_cursos = document.getElementById('profesor_cursos');

        for (let curso of data.course_data) {
            let carta_curso = `<div class="card" style="width: 18rem; background-color: #ffffff; border-radius: 0.5rem; box-shadow: 0 0 12px rgba(1, 28, 44, 0.3), 0 0 22px rgba(0, 163, 255, 0.2);">
                    <a href="your_target_page.html" style="text-decoration: none; color: inherit;">
                        <img class="card-img-top" src="../images/educacion.png" alt="Card image cap"
                            style="height: 8rem; object-fit: cover; border-top-left-radius: 0.5rem; border-top-right-radius: 0.5rem;">
                        <div class="card-body" style="height: 7rem; padding: 0.5rem;">
                            <h9 class="card-title" style="font-size: 1rem; font-weight: bold; font-family: Arial, sans-serif; margin-bottom: 0.2rem;">${curso[0].nombre}</h9>
                            <h15 class="card-code" style="font-size: 0.625rem; margin-bottom: 0.2rem; display: block;">${curso[0].cod}</h15>
                            <small class="card-text" style="font-size: 0.75rem; margin: 0.3rem 0 0.8rem;">${curso[0].descripcion}</small>
                        </div>
                    </a>
                </div>`
            profesor_cursos.innerHTML += carta_curso;
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

function home_screen() {
    location.reload();
}

async function log_out() {
    try {
        const response = await fetch(`${api_url}/session/out`, {
            method: 'GET',
            credentials: 'same-origin',
        });
        if (response.status === 200) {
            window.location.href = '/';
        }
    } catch (error) {
        console.error('Error:', error);
    }
}