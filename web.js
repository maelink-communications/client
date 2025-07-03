let compactSidebar = false
let currentPage = "home"

function updateSidebar() {
    document.getElementById(currentPage).setAttribute("class", "active")
}

function toggleSidebar() {
    if (compactSidebar == true) {
        compactSidebar = false;
    } else {
        compactSidebar = true;
    }

    sidebar = document.getElementById("sidebar")
    if (compactSidebar == true) {
        sidebar.innerHTML = `
            <img onclick="toggleSidebar()" id="maelink-icon" class="sidebar-full" src="assets/img/icon.svg" alt="">
            <img class="sidebar-full" id="home" src="assets/img/home.svg">
            <img class="sidebar-full" src="assets/img/bubbles.svg">
            <img class="sidebar-full" src="assets/img/inbox.svg">
            <style>
                :root {
                    --sidebar-width: 56px;
                }

                .sidebar-full {
                    margin: calc(var(--spacing) * 2);
                    margin-inline: auto;
                }

                #maelink-icon {
                    margin:var(--spacing);
                    margin-inline: auto;
                }

                .active {
                    padding: 4px;
                    border-radius: var(--size);
                }
            </style>
            <div class="sidebar-bottom" id="sidebar-bottom">
                <img id="profile-icon" src="https://avatars.githubusercontent.com/u/80485413?v=4" alt="">
            </div>
        `
    } else {
        sidebar.innerHTML = `
            <img onclick="toggleSidebar()" id="maelink-icon" class="sidebar-full" src="assets/img/icon.svg" alt="">
            <a class="active">Home</a>
            <a>Bubbles</a>
            <a>Messages</a>
            <style>
                :root {
                    --sidebar-width: 192px;
                }
            </style>
            <div class="sidebar-bottom" id="sidebar-bottom">
                <img id="profile-icon" src="https://avatars.githubusercontent.com/u/80485413?v=4" alt="">
                <img onclick="location.replace('settings.html')" id="settings-icon" src="assets/img/settings.svg" alt="">
            </div>
        `
    }
    updateSidebar();
}

// Window management
document.getElementById('close-button').addEventListener('click', () => {
    window.api.sendWindowControl('close');
});

document.getElementById('max-button').addEventListener('click', () => {
    window.api.sendWindowControl('maximize');
});

document.getElementById('min-button').addEventListener('click', () => {
    window.api.sendWindowControl('minimize');
});

if (window.api?.isElectron) {
    console.log("Electron");
} else {
    console.log("Browser");
    document.getElementById("titlebar").setAttribute("style", "display: none")
}

toggleSidebar()