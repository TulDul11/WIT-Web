window.addEventListener('load', (event) => {
    const welcome_text = document.getElementById('greeting_text');

    user_info = JSON.parse(sessionStorage.getItem('user_info'));
    user_id = user_info.user_id;

    if (user_info.user_role == 'alumno') {
        fetch(`http://localhost:3000/user_home/${user_id}/alumnos`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.apellido) {
                    welcome_text.textContent = "Hola, " + data.nombre + ' ' + data.apellido;
                } else {
                    welcome_text.textContent = "Hola, " + data.nombre;
                }
            })
            .catch(error =>
                console.error('Error: ', error)
            )
    } else if (user_info.user_role == 'profesor') {
        fetch(`http://localhost:3000/user_home/${user_id}/profesores`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.apellido) {
                    welcome_text.textContent = "Hello " + data.nombre + ' ' + data.apellido;
                } else {
                    welcome_text.textContent = "Hello " + data.nombre;
                }
            })
            .catch(error =>
                console.error('Error: ', error)
            )
    }
})