function toggleMenu(icon) {
    let menu = icon.nextElementSibling; // Encuentra el menú al lado de la imagen
    menu.style.display = (menu.style.display === "block") ? "none" : "block";
}

function editCard() {
    alert("Editar tarjeta");
}

function deleteCard(button) {
    let card = button.closest(".card"); // Encuentra la tarjeta más cercana al botón
    if (card) {
        card.remove(); // Elimina la tarjeta del DOM
    }
}



function openSideMenu() {
    document.getElementById('side_menu').classList.add('active');
    document.getElementById('background_overlay').classList.add('active');
}

function closeSideMenu() {
    document.getElementById('side_menu').classList.remove('active');
    document.getElementById('background_overlay').classList.remove('active');
}

function logout() {
    alert("Cerrando sesión...");
    // Aquí puedes redirigir a la página de logout o hacer otras acciones


}

function createCourseForm() {
    // Verifica si ya existe un formulario activo
    const existingForm = document.getElementById("formContainer");
    if (existingForm.style.display === "block") {
        alert("Ya hay un formulario activo.");
        return;
    }

    // Mostrar el formulario
    existingForm.style.display = "block";

    // Agregar contenido al formulario
    existingForm.innerHTML = `
        <label for="courseName">Nombre del curso:</label>
        <input type="text" id="courseName" placeholder="Escribe el nombre del curso">
        <button onclick="addCourseCard()">Confirmar</button>
    `;
}

function addCourseCard() {
    const courseName = document.getElementById("courseName").value.trim();
    if (courseName) {
        // Crear una nueva tarjeta
        const cardContainer = document.querySelector(".card_container");
        const newCard = document.createElement("div");
        newCard.classList.add("card");

        // Contenido de la nueva tarjeta
        newCard.innerHTML = `
            <div class="card-header">
                <img src="../images/vertical_dots.png" class="edit-icon" onclick="toggleMenu(this)">
                <div class="edit-options">
                    <button onclick="editCard()">Editar</button>
                    <button onclick="deleteCard(this)">Borrar</button>
                </div>
            </div>
            <img src="../images/azul.png">
            <div class="card-content">
                <h3>${courseName}</h3> <!-- Aquí se coloca el nombre del curso -->
            </div>
        `;

        // Agregar la tarjeta al contenedor
        cardContainer.appendChild(newCard);

        // Limpiar y ocultar el formulario
        const formContainer = document.getElementById("formContainer");
        formContainer.style.display = "none";
        formContainer.innerHTML = "";

        alert(`Curso "${courseName}" agregado exitosamente.`);
    } else {
        alert("Por favor, ingresa un nombre para el curso.");
    }
}
