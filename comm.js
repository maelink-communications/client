let ws;

function connect() {
    if (!ws) {
        ws = new WebSocket(serverWS);
    }
    ws.onerror = () => {
        showError(`cannotConnect`);
    }
    return;
}

async function joinMaelink(username, password) {
    if (!ws) {
        ws = new WebSocket(serverWS);
    }
    
    async function waitForWebSocket() {
        return new Promise((resolve) => {
            const interval = setInterval(() => {
                if (ws && ws.readyState === WebSocket.OPEN) {
                    clearInterval(interval);
                    resolve();
                }
            }, 100);
        });
    }
    
    await waitForWebSocket();
    console.log("WebSocket is open, sending signup request...");
    
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
}

async function logMaelink(username, password) {
    if (!ws) {
        ws = new WebSocket(serverWS);
    }
    async function waitForWebSocket() {
        return new Promise((resolve) => {
            const interval = setInterval(() => {
                if (ws && ws.readyState === WebSocket.OPEN) {
                    clearInterval(interval);
                    resolve();
                }
            }, 100);
        });
    }
    await waitForWebSocket();
    console.log("WebSocket is open, sending login request...");

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
}
