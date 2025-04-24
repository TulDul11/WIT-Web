//let api_url = 'http://pk8ksokco8soo8ws0ks040s8.172.200.210.83.sslip.io';
let api_url = 'http://localhost:3000';

async function log_out() {
    try {
        const response = await fetch(`${api_url}/logout`, {
            method: 'GET',
            credentials: 'same-origin',
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

function home_screen() {
    window.location.href = './home';
}