let ws;
let reconnectInterval;
let pendingAction = null;
let instanceName = null;
window.instanceName = instanceName;
window.ws = ws;
window.hideSkeletonPosts = false;

function showToast(message) {
    const toast = document.getElementById('loading-toast');
    if (toast) {
        toast.querySelector('span').textContent = message;
        toast.style.display = 'block';
        setTimeout(() => toast.classList.add('show'), 10);
    }
}

function hideToast() {
    const toast = document.getElementById('loading-toast');
    if (toast) {
        toast.classList.remove('show');
        setTimeout(() => toast.style.display = 'none', 300);
    }
}

function showSkeletonPosts() {
    window.hideSkeletonPosts = false;
    const skeletons = document.querySelectorAll('.skeleton-post');
    skeletons.forEach(skeleton => skeleton.classList.remove('hidden'));
}

window.showSkeletonPosts = showSkeletonPosts;


function connect() {
    if (!ws) {
        ws = new WebSocket(serverWS);
        window.ws = ws;
    }

    showToast('Loading feed...');

    ws.onopen = () => {
        if (reconnectInterval) {
            clearInterval(reconnectInterval);
            reconnectInterval = null;
        }
        const existingError = document.querySelector('.error-message');
        if (existingError) existingError.remove();

        hideToast();
        const downtimeScreen = document.getElementById('downtime-screen');
        if (downtimeScreen) {
            downtimeScreen.classList.remove('show');
            setTimeout(() => downtimeScreen.style.display = 'none', 200);
        }
        showSkeletonPosts();
    };

    ws.onerror = () => {
        function hideSkeletonPosts() {
            window.hideSkeletonPosts = true;
            const skeletons = document.querySelectorAll('.skeleton-post');
            skeletons.forEach(skeleton => skeleton.classList.add('hidden'));
        }

        hideToast();
        const downtimeScreen = document.getElementById('downtime-screen');
        if (downtimeScreen) {
            downtimeScreen.style.display = 'flex';
            setTimeout(() => downtimeScreen.classList.add('show'), 10);
            hideSkeletonPosts();
        } else {
            showError(`cannotConnect`);
        }
        startReconnection();
    };

    ws.onclose = () => {
        startReconnection();
    };


    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.cmd === 'welcome') {
            if (data.instance_name) {
                instanceName = data.instance_name;
                window.instanceName = instanceName;
            }
            ws.send(JSON.stringify({
                cmd: 'client_info',
                client: "maelink_gen2-electron",
                version: "prealpha_220825"
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
        window.ws = ws;
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
        pswd: md5(password.value)
    }));
}

async function logMaelink(username, password) {
    if (!username.value || !password.value) {
        showErrorNorm("Please enter a username and password.");
        return;
    }


    if (!ws) {
        ws = new WebSocket(serverWS);
        window.ws = ws;
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
        pswd: md5(password.value)
    }));
}

function startReconnection() {
    if (reconnectInterval) return;

    reconnectInterval = setInterval(() => {
        if (ws && (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN)) {
            return;
        }

        instanceName = null;
        window.instanceName = instanceName;
        ws = new WebSocket(serverWS);
        window.ws = ws;

        ws.onopen = () => {
            clearInterval(reconnectInterval);
            reconnectInterval = null;
            const existingError = document.querySelector('.error-message');
            if (existingError) existingError.remove();

            const downtimeScreen = document.getElementById('downtime-screen');
            if (downtimeScreen) {
                downtimeScreen.classList.remove('show');
                setTimeout(() => downtimeScreen.style.display = 'none', 200);
            }
            showSkeletonPosts();
        };

        ws.onerror = () => { };
        ws.onclose = () => { };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.cmd === 'welcome') {
                if (data.instance_name) {
                    instanceName = data.instance_name;
                    window.instanceName = instanceName;
                }
                ws.send(JSON.stringify({
                    cmd: 'client_info',
                    client: "maelink_gen2-electron",
                    version: "prealpha_220825"
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
        };
    }, 5000);
}
