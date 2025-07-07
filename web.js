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

const loginForm = `
    <div class="center content">
        <h2>Hello!</h2>
        <p>Pick up right where you left off.</p>
        <input id="userInput" placeholder="Username" type="text" autocomplete="nope">
        <input id="passInput" placeholder="Password" type="password" autocomplete="new-password">
        <button id="loginButton">Login</button>
        <a class="textclar" href="#" id="to-signup">Don't have an account yet?</a>
    </div>
`;

const signupForm = `
    <div class="center content">
        <h2>Welcome!</h2>
        <p>Joining maelink is just a few clicks away.</p>
        <input id="userInput" placeholder="Username" type="text" autocomplete="nope">
        <input id="passInput" placeholder="Password" type="password" autocomplete="new-password">
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

function showError(reason) {
    const existingError = document.querySelector('.error-message');
    if (existingError) existingError.remove();
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    
    if (reason === 'userExists') {
        errorDiv.textContent = 'This username is already taken. Please choose a different one.';
    } else {
        errorDiv.textContent = `Error: ${reason}`;
    }
    
    document.body.appendChild(errorDiv);
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('modal')) {
        showLogin();
    }
});