let api_url = 'http://localhost:3000';

async function log_out() {
    try {
        const response = await fetch(`${api_url}/session/out`, {
            method: 'GET',
            credentials: 'same-origin',
        });
        if (response.status === 200) {
            window.location.href = '/';
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function home_screen() {
    window.location.href = './home.html';
}