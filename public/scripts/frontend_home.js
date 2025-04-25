window.addEventListener('load', (event) => {
    const welcome_text = document.getElementById('greeting_text');

    user_info = JSON.parse(sessionStorage.getItem('user_info'));
    user_id = user_info.user_id;

    if (user_info.user_role == 'alumno') {
        /* -> Deployment */
        // fetch_url = `http://pk8ksokco8soo8ws0ks040s8.172.200.210.83.sslip.io/user_home/${user_id}/alumnos`
        /* -> Local development */
         fetch_url = `http://localhost:3000/user_home/${user_id}/alumnos`
    } else if (user_info.user_role == 'profesor') 
        {
        /* -> Deployment */
        // fetch_url = `http://pk8ksokco8soo8ws0ks040s8.172.200.210.83.sslip.io/user_home/${user_id}/profesores`
        /* -> Local development */
         fetch_url = `http://localhost:3000/user_home/${user_id}/profesores`  
        }

         fetch(fetch_url)
                 .then(response => {
                     if (!response.ok) {
                         throw new Error(`Error: ${response.status}`);
                     }
                     return response.json();  }) .then(data => {
                        if (data.apellido) {
                            welcome_text.textContent = "Hola, " + data.nombre + ' ' + data.apellido;
                        } else {
                            welcome_text.textContent = "Hola, " + data.nombre;
                        }  })
                        .catch(error =>
                            console.error('Error: ', error)
                        )
            })

    function toggleMenu(icon) 
    {
        let menu = icon.nextElementSibling; // Encuentra el menú al lado de la imagen
        menu.style.display = (menu.style.display === "block") ? "none" : "block";
    }
 
    function openSideMenu() {
        const side_menu = document.getElementById('side_menu');
        const bg_overlay = document.getElementById('background_overlay');
        side_menu.classList.add('active');
        bg_overlay.classList.add('active')
    }
 
    function closeSideMenu() {
            const side_menu = document.getElementById('side_menu');
            const bg_overlay = document.getElementById('background_overlay');
            side_menu.classList.remove('active');
            bg_overlay.classList.remove('active');
    }

    function homeScreen() 
    {
                closeSideMenu();
    }
 
    function logOut() {
        sessionStorage.removeItem('userInfo');
        alert("Cerrando sesión...");
        window.location.href = `/`;
    }

    document.addEventListener("DOMContentLoaded", function () {
        const filterInput = document.getElementById("filterInput");
    
        if (filterInput) {
            filterInput.addEventListener("keyup", function () {
                const filterValue = filterInput.value.toLowerCase();
                
                // Selecciona solo las tarjetas que NO tienen la clase 'mask-custom'
                const courseCards = document.querySelectorAll(".card:not(.mask-custom)");
    
                courseCards.forEach(card => {
                    const title = card.querySelector(".card-title");
                    const code = card.querySelector(".card-code");
                    const content = card.querySelector(".card-text");
    
                    const combinedText = [
                        title?.textContent || "",
                        code?.textContent || "",
                        content?.textContent || ""
                    ].join(" ").toLowerCase();
    
                    if (combinedText.includes(filterValue)) {
                        card.style.display = "";
                    } else {
                        card.style.display = "none";
                    }
                });
            });
        }
    });
    
    