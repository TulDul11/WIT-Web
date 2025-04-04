window.addEventListener('load', (event) => {
    const user_role_text = document.getElementById('nav_role');

    user_info = JSON.parse(sessionStorage.getItem('user_info'));
    user_id = user_info.user_id;
    let user_role;

    if (user_info.user_role == 'alumno') {
        /* -> Deployment */
        //fetch_url = `http://pk8ksokco8soo8ws0ks040s8.172.200.210.83.sslip.io/user_home/${user_id}/alumnos`
        /* -> Local development */
        fetch_url = `http://localhost:3000/user_home/${user_id}/alumnos`;
        user_role = 'Alumno';
    } else if (user_info.user_role == 'profesor') {
        /* -> Deployment */
        //fetch_url = `http://pk8ksokco8soo8ws0ks040s8.172.200.210.83.sslip.io/user_home/${user_id}/profesores`
        /* -> Local development */
        fetch_url = `http://localhost:3000/user_home/${user_id}/profesores`;
        user_role = 'Profesor';
    }
    fetch(fetch_url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.apellido) {
                    user_role_text.textContent = user_role + ' ' + data.nombre + ' ' + data.apellido;
                } else {
                    user_role_text.textContent = user_role + ' ' + data.nombre;
                }
            })
            .catch(error =>
                console.error('Error: ', error)
            )
})