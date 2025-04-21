// let api_url = 'http://pk8ksokco8soo8ws0ks040s8.172.200.210.83.sslip.io';
let api_url = 'http://localhost:3000';

window.addEventListener('load', async () => {
    let user_role;
    let data;
    const course_code_text = document.getElementById('course_code');
    const user_role_text = document.getElementById('nav_role');
    try {
        const response = await fetch(`${api_url}/user_home`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        if (!response.ok) {
            if (response.status === 404) {
                user_role_text.textContent = 'Usuario no encontrado';
            } else if (response.status === 401) {
                window.location.href = '/';
            }
            return;
        }

        data = await response.json();
    } catch (error) {
        console.error('Error:', error);
    }

    user_role = data.user_role == 'alumno' ? 'Alumno' : 'Profesor';
    user_role_text.textContent = user_role;

    const urlParams = new URLSearchParams(window.location.search);
    const courseCode = urlParams.get('code');
    course_code_text.textContent = courseCode;

    if (user_role == 'Alumno') {
        const alumno_body = document.getElementById('alumno_body');
        alumno_body.style.display = 'flex';
        set_up_alumno('alumnos', data.user_id, courseCode)
    } else {
        const profesor_body = document.getElementById('profesor_body');
        profesor_body.style.display = 'flex';
        set_up_profesor('profesores', data.user_id)
    }

})

async function set_up_alumno(user_role, user_id, cod) {
    try {      
        const response = await fetch(`${api_url}/user_courses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                user_role: user_role,
                user_id: user_id,
                cod: cod
            })
        });

        if (!response.ok) {
            if (response.status === 404) {
                const course_code_text = document.getElementById('course_code');
                const alumno_body = document.getElementById('alumno_body');
                course_code_text.textContent = 'No esta inscrito en este curso';
                alumno_body.style.display = 'none';
            }
            throw new Error(`Error: ${response.status}`);
        }else{
            const data = await response.json();
        
            const alumno_curso = document.getElementById('alumno_curso');

            curso = data.course_data[0];

            let carta_curso = `<div class="card p-4" style="width: 90%;margin-inline: auto;">
                        <p id="course_title" class="fw-bold mb-4" style="font-size: 2rem;">${curso[0].nombre}</p>
                        <div class="row align-items-center">
                            <div class="col-md-6 mb-4 mb-md-0">
                                <h5 class="fw-bold">${curso[0].nombre}</h5>
                                <p>
                                    ${curso[0].descripcion_det}
                                </p>
                            </div>
                            <div class="col-md-6 text-center">
                                <img src="./images/lavadora.png" class="img-fluid rounded" style="max-width: 80%; max-height: 450px;" alt="Lavadora" />
                            </div>
                        </div>
            
                        <p class="fw-bold fs-5 mb-2">Progreso del curso:</p>
                        <div class="progress">
                            <div class="progress-bar progress-bar-animated bg-warning" role="progressbar" style="width: 50%" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100">50%</div>
                        </div>
                    </div>`
            
            alumno_curso.innerHTML += carta_curso;
        }
        

    } catch (error) {
        console.error('Error:', error);
    }
}

async function log_out() {
    try {
        const response = await fetch(`${api_url}/logout`, {
            method: 'GET',
            credentials: 'include',
        });
        if (!response.ok) {
            if (response.status === 500) {
                console.error('Cerrar sesión fallida.');
            }
        } else {
            window.location.href = '/';
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function home_screen() {
    window.location.href = './home';
}

async function log_out() {
    try {
        const response = await fetch(`${api_url}/logout`, {
            method: 'GET',
            credentials: 'include',
        });
        if (!response.ok) {
            if (response.status === 500) {
                console.error('Cerrar sesión fallida.');
            }
        } else {
            window.location.href = '/';
        }
    } catch (error) {
        console.error('Error:', error);
    }
}