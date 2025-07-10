let ws;

let pendingAction = null;

function connect() {
    if (!ws) {
        ws = new WebSocket(serverWS);
    }
    ws.onerror = () => {
        showError(`cannotConnect`);
    }
    
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.cmd === 'welcome') {
            ws.send(JSON.stringify({
                cmd: 'client_info',
                client: "maelink_gen2-electron"
            }));
        } else if (data.error) {
            showError(data.reason);
        } else {
            if (pendingAction === 'login' || pendingAction === 'register') {
                if (pendingAction === 'login') {
                    localStorage.setItem('username', data.user);
                    localStorage.setItem('session_token', data.token);
                }
                window.location.href = 'client.html';
                pendingAction = null;
            }
        }
    }
}

async function joinMaelink(username, password) {
    if (!username.value || !password.value) {
        showErrorNorm("Please enter a username and password.");
        return;
    }

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
    
    pendingAction = 'register';
    ws.send(JSON.stringify({
        cmd: 'reg',
        user: username.value,
        pswd: password.value
    }));
}

async function logMaelink(username, password) {
    if (!username.value || !password.value) {
        showErrorNorm("Please enter a username and password.");
        return;
    }


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

    pendingAction = 'login';
    ws.send(JSON.stringify({
        cmd: 'login_pswd',
        user: username.value,
        pswd: password.value
    }));
}
