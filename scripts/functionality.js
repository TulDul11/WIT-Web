function login() {
    const user_id = document.getElementById("userid_input").value;
    const user_password = document.getElementById("password_input").value;

    console.log("User ID: ", user_id);
    console.log("Password: ", user_password);

    /* 
    AGREGAR VALIDACION DE USUARIO Y CONTRASEÑA CON BASE DE DATOS
    Usuario, Contraseña -> Tipo de usuario (Alumno, Profesor, Administrador) -> Pantalla de respectivo usuario
    */

    /* 
    Eliminar siguiente codigo despues de agregar validacion mencionada arriba.
    La logica del codigo de validacion deberia ser similar al del codigo de abajo.
    */
    if (user_id == "A01236010" && user_password == "123") {
        window.location.href = "../templates/start_admin.html";
    } else if (user_id == "A01234693" && user_password == "456") {
        window.location.href = "../templates/start_profesor.html";
    } else if (user_id == "A01236034" && user_password == "789") {
        window.location.href = "../templates/alumno_home.html";
    } else if (!user_id && !user_password ) {
        // Agregar texto de error que el usuario y contraseña esta vacio
        console.log("User and Password empty");
    } else if (!user_password) {
        // Agregar texto de error que la contraseña esta vacio
        console.log("Password empty");
    } else if (!user_id) {
        // Agregar texto de error que el usuario esta vacio
        console.log("User empty");
    } else {
        // Agregar texto de error que el usuario o contraseña esta incorrecta
        console.log("User or Password wrong");
    }
}