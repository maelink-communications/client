let serverAddress = "http://0.0.0.0:6060"
let compactSidebar = false
let currentPage = "home"

async function joinMaelink(username, password) {
    fetch(serverAddress, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            cmd: "reg",
            user: username,
            pswd: password 
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
    })
    .catch(error => {
        console.error('Error:', error);
    });
};

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
    } else {
        compactSidebar = true;
    }

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

const loginForm = `
    <div class="center content">
        <h2>Hello!</h2>
        <p>Pick up right where you left off.</p>
        <input id="userInput" placeholder="Username" type="text">
        <input id="passInput" placeholder="Password" type="password">
        <button id="loginButton">Login</button>
        <a class="textclar" href="#" id="to-signup">Don't have an account yet?</a>
    </div>
`;

const signupForm = `
    <div class="center content">
        <h2>Welcome!</h2>
        <p>Joining maelink is just a few clicks away.</p>
        <input id="userInput" placeholder="Username" type="text">
        <input id="passInput" placeholder="Password" type="password">
        <button id="signupButton" onclick="joinMaelink(document.getElementById('userInput'), document.getElementById('passInput'));">Join</button>
        <a class="textclar" href="#" id="to-login">Already have an account?</a>
    </div>
`;

function showLogin() {
    document.getElementById('modal').innerHTML = loginForm;
    document.getElementById('to-signup').onclick = showSignup;
}

function showSignup() {
    document.getElementById('modal').innerHTML = signupForm;
    document.getElementById('to-login').onclick = showLogin;
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('modal')) {
        showLogin();
    }
});