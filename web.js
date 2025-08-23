let compactSidebar = false
let currentPage = "home"

function updateSidebar() {
    if (document.getElementById(currentPage)) {
        document.getElementById(currentPage).setAttribute("class", "active");
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    if (!sidebar) return;

    if (compactSidebar == true) {
        compactSidebar = false;
        sidebar.style.width = "var(--sidebar-width)";
        sidebar.classList.remove('compact');
        sidebar.classList.add('extended');
    } else {
        compactSidebar = true;
        sidebar.style.width = "56px";
        sidebar.classList.remove('extended');
        sidebar.classList.add('compact');
    }

}

if (document.getElementById('close-button')) {
    document.getElementById('close-button').addEventListener('click', () => {
        window.api.sendWindowControl('close');
    });
}
if (document.getElementById('max-button')) {
    document.getElementById('max-button').addEventListener('click', () => {
        window.api.sendWindowControl('maximize');
    });
}
if (document.getElementById('min-button')) {
    document.getElementById('min-button').addEventListener('click', () => {
        window.api.sendWindowControl('minimize');
    });
}

if (window.api?.isElectron) {
    console.log("Electron");
} else {
    console.log("Browser");
    const tb = document.querySelector(".titlebar");
    if (tb) tb.setAttribute("style", "display: none; opacity: 0%;");
}

if (document.getElementById("sidebar")) {
    toggleSidebar();
}

let connectionCheckInterval;
let connectionAttempts = 0;

function showLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    const downtimeScreen = document.getElementById('downtime-screen');
    if (loadingScreen) loadingScreen.style.display = 'flex';
    if (downtimeScreen) downtimeScreen.style.display = 'none';
}

function showDowntimeScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    const downtimeScreen = document.getElementById('downtime-screen');
    if (loadingScreen) loadingScreen.style.display = 'none';
    if (downtimeScreen) downtimeScreen.style.display = 'flex';
}

function hideAllScreens() {
    const loadingScreen = document.getElementById('loading-screen');
    const downtimeScreen = document.getElementById('downtime-screen');
    if (loadingScreen) loadingScreen.style.display = 'none';
    if (downtimeScreen) downtimeScreen.style.display = 'none';
}

function checkConnection() {
    if (window.ws && window.ws.readyState === WebSocket.OPEN) {
        hideAllScreens();
        connectionAttempts = 0;
    } else if (window.ws && window.ws.readyState === WebSocket.CONNECTING) {
        showLoadingScreen();
    } else {
        connectionAttempts++;
        if (connectionAttempts > 5) {
            showDowntimeScreen();
        } else {
            showLoadingScreen();
        }
    }
}

if (document.getElementById('loading-screen')) {
    showLoadingScreen();
    connectionCheckInterval = setInterval(checkConnection, 500);
}