let ws;

async function joinMaelink(username, password) {
    if (!ws) {
        ws = new WebSocket(serverWS);
    }
    ws.onopen = () => {
        ws.send(JSON.stringify({
            cmd: 'reg',
            user: username.value,
            pswd: password.value
        }));
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.error) {
                showError(data.reason);
            } else {
                window.location.href = 'client.html';
            }
        }
    };
}

async function logMaelink(username, password) {
    if (!ws) {
        ws = new WebSocket(serverWS);
    }
    ws.onopen = () => {
        ws.send(JSON.stringify({
            cmd: 'login_pswd',
            user: username.value,
            pswd: password.value
        }));
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.error) {
                showError(data.reason);
            } else {
                localStorage.setItem('username', username.value);
                localStorage.setItem('session_token', data.token);
                window.location.href = 'client.html';
            }
        }
    };
}