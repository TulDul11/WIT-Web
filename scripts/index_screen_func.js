function login() {
    const user_id = document.getElementById("userid_input").value;
    const user_password = document.getElementById("password_input").value;

    const error_message_text = document.getElementById("login_error_message");

    error_message_text.textContent = ""

    console.log("User ID: ", user_id);  /* Borrar despues de debugging*/
    console.log("Password: ", user_password); /* Borrar despues de debugging*/

    /* 
    AGREGAR VALIDACION DE USUARIO Y CONTRASEÑA CON BASE DE DATOS
    Usuario, Contraseña -> Tipo de usuario (Alumno, Profesor, Administrador) -> Pantalla de respectivo usuario

    Codigo de abajo es parte de la validacion de que los campos de texto no este vacios.
    if (!user_id && !user_password ) {
        error_message_text.textContent = "Error: Se requiere llenar los campos de usuario y contraseña.";
        console.log("User and Password empty"); -- > Borrar despues de debugging
    } else if (!user_password) {
        error_message_text.textContent = "Error: Se requiere llenar el campo de contraseña.";
        console.log("Password empty");  -- > Borrar despues de debugging
    } else if (!user_id) {
        error_message_text.textContent = "Error: Se requiere llenar el campo de usario.";
        console.log("User empty"); -- > Borrar despues de debugging
    } else {
        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userID })
            });

            const data = await response.json();

            if (data.success) {
                const userInfo = {
                    user: user_id
                };
                sessionStorage.setItem('userInfo', JSON.stringify(userInfo));
                window.location.href = `../templates/home.html`;
            } else {
                error_message_text.textContent = "Error: Usuario o contraseña incorrecta."
                console.log("User or Password wrong");
            }
        } catch (error) {
            console.error("Error iniciando sesión:", error);
            error_message_text.textContent = "Error iniciando sesión. Prueba más tarde"
    }
    */

    /* 
    Eliminar siguiente codigo despues de agregar validacion mencionada arriba.
    La logica del codigo de validacion deberia ser similar al del codigo de abajo.
    */
    if (!user_id && !user_password ) {
        error_message_text.textContent = "Error: Se requiere llenar los campos de usuario y contraseña."
        console.log("User and Password empty");
    } else if (!user_password) {
        error_message_text.textContent = "Error: Se requiere llenar el campo de contraseña."
        console.log("Password empty");
    } else if (!user_id) {
        error_message_text.textContent = "Error: Se requiere llenar el campo de usario."
        console.log("User empty");
    } else if (user_id == "A01236010" && user_password == "1234") {
        const userInfo = {
            user: user_id,
            role: 'admin',
            password: user_password
        };
        sessionStorage.setItem('userInfo', JSON.stringify(userInfo));
        window.location.href = `../templates/home.html`;
    } else if (user_id == "A01234693" && user_password == "1234") {
        const userInfo = {
            user: user_id,
            role: 'profesor',
            password: user_password
        };
        sessionStorage.setItem('userInfo', JSON.stringify(userInfo));
        window.location.href = `../templates/home.html`;
    } else if (user_id == "A01236034" && user_password == "1234") {
        const userInfo = {
            user: user_id,
            role: 'alumno',
            password: user_password
        };
        sessionStorage.setItem('userInfo', JSON.stringify(userInfo));
        window.location.href = `../templates/home.html`;
    } else {
        error_message_text.textContent = "Error: Usuario o contraseña incorrecta."
        console.log("User or Password wrong");
    }    
}