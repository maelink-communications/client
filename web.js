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