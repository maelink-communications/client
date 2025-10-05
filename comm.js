let ws;
let reconnectInterval;
let pendingAction = null;
let instanceName = null;
window.instanceName = instanceName;
window.ws = ws;
window.skeletonsHidden = false;

function showToast(message) {
    const toast = document.getElementById('loading-toast');
    if (toast) {
        toast.querySelector('span').textContent = message;
        toast.style.display = 'block';
        requestAnimationFrame(() => toast.classList.add('show'));
    }
}

function hideToast() {
    const toast = document.getElementById('loading-toast');
    if (toast) {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.style.display = 'none';
        }, 300);
    }
}

function showSkeletonPosts() {
    window.skeletonsHidden = false;
    const skeletons = document.querySelectorAll('.skeleton-post');
    skeletons.forEach(skeleton => {
        skeleton.classList.remove('hidden');
        skeleton.style.display = '';
        skeleton.style.transition = 'opacity 0.5s ease';
    });
}

function hideSkeletonPosts() {
    window.skeletonsHidden = true;
    const skeletons = Array.from(document.querySelectorAll('.skeleton-post'));
    skeletons.forEach(skeleton => {
        skeleton.style.transition = 'opacity 0.5s ease';

        requestAnimationFrame(() => {
            skeleton.style.opacity = '0';
        });
        const onTransitionEnd = (e) => {
            if (e.propertyName === 'opacity') {
                skeleton.style.display = 'none';
                skeleton.classList.add('hidden');
                skeleton.removeEventListener('transitionend', onTransitionEnd);
            }
        };
        skeleton.addEventListener('transitionend', onTransitionEnd);

        setTimeout(() => {
            if (skeleton.style.opacity === '0' && skeleton.style.display !== 'none') {
                skeleton.style.display = 'none';
                skeleton.classList.add('hidden');
                skeleton.removeEventListener('transitionend', onTransitionEnd);
            }
        }, 700);
    });
}

window.hideSkeletonPosts = hideSkeletonPosts;

async function fetchFeed() {
    try {
        const url = `${serverAddress.replace(/\/$/, '')}/api/feed`;
        const res = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!res.ok) {
            console.warn('Failed to fetch feed:', res.status);
            return false;
        }

        const body = await res.json();
        const postsRaw = body.posts || body.posts?.posts || body || [];
        const postsArray = Array.isArray(postsRaw) ? postsRaw : (postsRaw.posts || []);

        const mapped = (postsArray || []).map(p => ({
            id: p.uuid || p.ts || null,
            avatar: p.avatar || 'assets/img/default-avatar.png',
            display_name: p.display_name || p.displayName || p.display || p.user || p.name || null,
            name: p.user || p.user || p.author || p.name || null,
            content: p.content || p.p || '',
            timestamp: p.timestamp || Date.now(),
            debug: { source: 'rest' }
        }));

        if (typeof renderPosts === 'function') {
            renderPosts(mapped);
        }
        return true;
    } catch (e) {
        console.error('Error fetching feed:', e);
        return false;
    }
}

async function createPost(content) {
    if (!content || !content.trim()) return { success: false, reason: 'empty' };
    showToast('Posting...');
    try {
        const token = localStorage.getItem('session_token');
        const url = `${serverAddress.replace(/\/$/, '')}/api/feed`;
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'token': token || ''
            },
            body: JSON.stringify({ content })
        });

        hideToast();
        if (res.status === 401 || res.status === 403) {
            localStorage.removeItem('session_token');
            localStorage.removeItem('username');
            window.location.href = 'auth.html';
            return { success: false, reason: 'auth' };
        }

        if (!res.ok) {
            const text = await res.text();
            console.warn('Post failed', res.status, text);
            return { success: false, reason: 'server', status: res.status, body: text };
        }

        await fetchFeed();
        return { success: true };
    } catch (e) {
        hideToast();
        console.error('Error creating post:', e);
        return { success: false, reason: 'network' };
    }
}

function initComposer() {
    const textarea = document.getElementById('composer-text');
    const submit = document.getElementById('composer-submit');
    const cancel = document.getElementById('composer-cancel');
    const composer = document.getElementById('composer');

    if (!textarea || !submit || !cancel || !composer) return;

    composer.classList.add('compact');
    const actions = composer.querySelector('.composer-actions');
    if (actions) {
        actions.style.display = 'none';
        actions.setAttribute('aria-hidden', 'true');
        const buttons = actions.querySelectorAll('button');
        buttons.forEach(b => b.tabIndex = -1);
    }

    submit.addEventListener('click', async () => {
        const content = textarea.value;
        submit.disabled = true;
        submit.textContent = 'Posting...';
        const result = await createPost(content);
        submit.disabled = false;
        submit.textContent = 'Post';
        if (result.success) {
            textarea.value = '';
            composer.classList.remove('expanded');
            composer.classList.add('compact');
        } else {
            showError('Could not post: ' + (result.reason || 'unknown'));
        }
    });

    cancel.addEventListener('click', () => {
        textarea.value = '';
        composer.classList.remove('expanded');
        composer.classList.add('compact');
        // hide actions when collapsing
        const actions = composer.querySelector('.composer-actions');
        if (actions) {
            actions.style.display = 'none';
            actions.setAttribute('aria-hidden', 'true');
            const buttons = actions.querySelectorAll('button');
            buttons.forEach(b => b.tabIndex = -1);
        }
    });

    composer.addEventListener('click', (e) => {
        if (e.target && (e.target.id === 'composer-submit' || e.target.id === 'composer-cancel')) return;
        composer.classList.remove('compact');
        composer.classList.add('expanded');
        // show actions when expanded
        const actions = composer.querySelector('.composer-actions');
        if (actions) {
            actions.style.display = '';
            actions.removeAttribute('aria-hidden');
            const buttons = actions.querySelectorAll('button');
            buttons.forEach(b => b.tabIndex = 0);
        }
        textarea.focus();
    });

    textarea.addEventListener('focus', () => {
        composer.classList.remove('compact');
        composer.classList.add('expanded');
        // show actions when focused/expanded
        const actions = composer.querySelector('.composer-actions');
        if (actions) {
            actions.style.display = '';
            actions.removeAttribute('aria-hidden');
            const buttons = actions.querySelectorAll('button');
            buttons.forEach(b => b.tabIndex = 0);
        }
    });

    textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            textarea.blur();
            composer.classList.remove('expanded');
            composer.classList.add('compact');
            // hide actions when collapsing
            const actions = composer.querySelector('.composer-actions');
            if (actions) {
                actions.style.display = 'none';
                actions.setAttribute('aria-hidden', 'true');
                const buttons = actions.querySelectorAll('button');
                buttons.forEach(b => b.tabIndex = -1);
            }
        }
    });

    const resizer = document.getElementById('composer-resizer');
    if (resizer) {
        let startY = 0;
        let startHeight = 0;
        let rafId = null;
        let targetHeight = null;

        const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

        const applyHeight = (h) => {
            const actions = composer.querySelector('.composer-actions');
            const actionsHeight = actions ? actions.getBoundingClientRect().height + 24 : 64;
            const minH = Math.max(64, Math.ceil(actionsHeight + 80));
            const maxH = 920;
            composer.style.transition = 'none';
            composer.style.maxHeight = clamp(h, minH, maxH) + 'px';
        };

        const onPointerMove = (ev) => {
            targetHeight = startHeight + (ev.clientY - startY);
            if (rafId) return;
            rafId = requestAnimationFrame(() => {
                applyHeight(targetHeight);
                rafId = null;
            });
        };

        const onPointerUp = () => {
            if (rafId) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
            composer.style.transition = '';
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
            // do not adjust main-content padding; composer is sticky at top so feed stays below
        };

        resizer.addEventListener('pointerdown', (ev) => {
            ev.preventDefault();
            startY = ev.clientY;
            composer.classList.remove('compact');
            composer.classList.add('expanded');
            startHeight = composer.getBoundingClientRect().height;
            targetHeight = startHeight;
            window.addEventListener('pointermove', onPointerMove, { passive: true });
            window.addEventListener('pointerup', onPointerUp, { passive: true });
        });
    }
}

function connect() {
    if (!ws) {
        ws = new WebSocket(serverWS);
        window.ws = ws;
    }

    showToast('Loading...');

    ws.onopen = () => {
        if (reconnectInterval) {
            clearInterval(reconnectInterval);
            reconnectInterval = null;
        }
        const existingError = document.querySelector('.error-message');
        if (existingError) existingError.remove();

        const downtimeScreen = document.getElementById('downtime-screen');
        if (downtimeScreen) {
            downtimeScreen.classList.remove('show');
            setTimeout(() => downtimeScreen.style.display = 'none', 200);
        }

        fetchFeed().then(success => {
            hideToast();
            if (success) {
                hideSkeletonPosts();
            } else {
                showError(`fetchFailed`);
            }
        }).catch(() => {
            hideToast();
        });
    };

    ws.onerror = () => {
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
                version: "prealpha_051025"
            }));
        } else if (data.error) {
            showError(data.reason);
            console.error('Authentication error:', data);
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

async function joinMaelink(username, password, code) {
    if (!username.value || !password.value || !code.value) {
        showErrorNorm("Please enter all required credentials.");
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
        pswd: md5(password.value),
        code: code.value
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

            fetchFeed().then(success => {
                showSkeletonPosts();
                if (success) hideSkeletonPosts();
            }).catch(() => {
                showError(`fetchFailed`);
            });
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
                    version: "prealpha_051025"
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
