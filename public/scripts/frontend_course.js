let api_url = 'http://pk8ksokco8soo8ws0ks040s8.172.200.210.83.sslip.io';

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