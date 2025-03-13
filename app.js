const API_URL = 'http://localhost:4040';
let currentToken = localStorage.getItem('token');

// UI Elements
const loginBox = document.getElementById('loginBox');
const registerBox = document.getElementById('registerBox');
const mainContent = document.getElementById('mainContent');
const postsFeed = document.getElementById('postsFeed');

// Show Toast Message
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.style.display = 'block';
    setTimeout(() => toast.style.display = 'none', 3000);
}

// API Calls
async function apiCall(type, data = {}) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, ...data })
        });
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        showToast('Error connecting to server', 'error');
    }
}

// Auth Functions
async function login(username, password) {
    const response = await apiCall('auth', { user: username, password });
    if (response.payload?.token) {
        currentToken = response.payload.token;
        localStorage.setItem('token', currentToken);
        showToast('Logged in successfully', 'success');
        showMainContent();
        loadPosts();
    } else {
        showToast(response.message || 'Login failed', 'error');
    }
}

async function register(username, password) {
    const response = await apiCall('reg', { user: username, password });
    if (response.payload?.token) {
        currentToken = response.payload.token;
        localStorage.setItem('token', currentToken);
        showToast('Registered and logged in successfully', 'success');
        showMainContent();
        loadPosts();
    } else {
        showToast(response.message || 'Registration failed', 'error');
    }
}

// Post Functions
async function createPost(content) {
    if (!currentToken) return showToast('Please login first', 'error');
    const response = await apiCall('post', {
        community: 'home',
        p: content,
        token: currentToken
    });
    if (response.status === 200) {
        showToast('Posted successfully', 'success');
        loadPosts();
    } else {
        showToast(response.message || 'Failed to post', 'error');
    }
}

async function loadPosts(offset = 0) {
    const response = await apiCall('fetch', { community: 'home', offset });
    if (response.posts) {
        displayPosts(response.posts);
    }
}

// Community Functions
async function createCommunity(name) {
    if (!currentToken) return showToast('Please login first', 'error');
    const response = await apiCall('communityCreate', { name, token: currentToken });
    if (response.status === 200) {
        showToast('Community created successfully', 'success');
    } else {
        showToast(response.message || 'Failed to create community', 'error');
    }
}

// UI Functions
function showMainContent() {
    loginBox.style.display = 'none';
    registerBox.style.display = 'none';
    mainContent.style.display = 'block';
}

function showLoginBox() {
    loginBox.style.display = 'block';
    registerBox.style.display = 'none';
    mainContent.style.display = 'none';
}

function showRegisterBox() {
    loginBox.style.display = 'none';
    registerBox.style.display = 'block';
    mainContent.style.display = 'none';
}

function displayPosts(posts) {
    postsFeed.innerHTML = posts.map(post => `
        <div class="post">
            <div class="post-header">
                <span class="post-user">${post.u}</span>
                <span class="post-date">${new Date(post.ts).toLocaleString()}</span>
            </div>
            <div class="post-content">${post.p}</div>
        </div>
    `).join('');
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    if (currentToken) {
        showMainContent();
        loadPosts();
    }

    document.getElementById('showRegister').onclick = showRegisterBox;
    document.getElementById('showLogin').onclick = showLoginBox;
    document.getElementById('showMainContent').onclick = showMainContent;

    document.getElementById('loginForm').onsubmit = (e) => {
        e.preventDefault();
        login(
            document.getElementById('loginUsername').value,
            document.getElementById('loginPassword').value
        );
    };

    document.getElementById('registerForm').onsubmit = (e) => {
        e.preventDefault();
        register(
            document.getElementById('regUsername').value,
            document.getElementById('regPassword').value
        );
    };

    document.getElementById('submitPost').onclick = () => {
        const content = document.getElementById('postContent').value;
        if (content) {
            createPost(content);
            document.getElementById('postContent').value = '';
        }
    };

    document.getElementById('createCommunity').onclick = () => {
        const name = document.getElementById('communityName').value;
        if (name) {
            createCommunity(name);
            document.getElementById('communityName').value = '';
        }
    };
});
