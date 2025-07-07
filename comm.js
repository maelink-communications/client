async function joinMaelink(username, password) {
    const ws = new WebSocket(serverWS);
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