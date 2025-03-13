async function login() {
    const user_id = document.getElementById("userid_input").value;
    const user_password = document.getElementById("password_input").value;

    const error_message_text = document.getElementById("login_error_message");

    error_message_text.textContent = ""

    if (!user_id && !user_password ) {
        error_message_text.textContent = "Error: Se requiere llenar los campos de usuario y contraseña.";
        console.log("User and Password empty");
    } else if (!user_password) {
        error_message_text.textContent = "Error: Se requiere llenar el campo de contraseña.";
        console.log("Password empty"); 
    } else if (!user_id) {
        error_message_text.textContent = "Error: Se requiere llenar el campo de usario.";
        console.log("User empty");
    } else {
        fetch('http://localhost:3001/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userID: user_id,
                userPassword: user_password
            })
        })
        .then(response => {
            if (!response.ok) {
                error_message_text.textContent = "Error: Hubo un problema al conectar con el servidor.";
                console.error("Error consiguiendo datos:", error);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                sessionStorage.setItem('userInfo', JSON.stringify(data.data[0]));
                window.location.href = `../templates/home.html`;
            } else {
                error_message_text.textContent = "Error: Usuario o contraseña incorrecta.";
                console.log("Incorrect user or password");
            }
        })
        .catch(error => {
            error_message_text.textContent = "Error: Hubo un problema al conectar con el servidor.";
            console.error("Error consiguiendo datos:", error);
        });
    }
}