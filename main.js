// deno-lint-ignore-file 
// shut up deno, this is a browser script
// i'm just using deno to lint it because I'm too lazy to set up eslint
console.log("main.js loaded");
document.addEventListener("DOMContentLoaded", async () => {
  console.log("DOM fully loaded – main.js registering events");

  const signupForm = document.getElementById("signupFormElement");
  if (signupForm) {
    signupForm.addEventListener("submit", async function (e) {
      console.log("Signup form submitted");
      e.preventDefault();
      const username = document.getElementById("signupUsername")?.value;
      const password = document.getElementById("signupPassword")?.value;
      console.log("Signup inputs:", username, password);

      try {
        const reg = await fetch("https://1144-2a06-5906-382b-f800-f810-18ad-edd4-de95.ngrok-free.app/", { // replace all localhost links with normal client links in production!
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "reg",
            user: username,
            password: password
          }),
        });
        const data = await reg.json();
        console.log("Signup response:", data);

        if (data.payload && data.payload.token) {
          localStorage.setItem("token", data.payload.token);
          globalThis.location.href = "home.html";
        } else {
          createModal("Oops!", `An error occurred.
            ${reg.status} | ${reg.json() || "No data provided"}`)
        }
      } catch (error) {
        createModal("Oops!", `An error occurred.
          Here's all we could gather: ${error}`)
      }
    });
  } else {
    console.log("Signup form element not found");
  }
  const loginForm = document.getElementById("loginFormElement");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const username = document.getElementById("username")?.value;
      const password = document.getElementById("password")?.value;
      console.log("Attempting to authenticate with", username, password);
      try {
        const response = await fetch(
          "https://1144-2a06-5906-382b-f800-f810-18ad-edd4-de95.ngrok-free.app/",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "auth",
              user: username,
              password: password,
            }),
          },
        );
        const data = await response.json();
        console.log("Auth Response:", data);
        if (data.payload && data.payload.token) {
          localStorage.setItem("token", data.payload.token);
          globalThis.location.href = "home.html";
        } else {
          createModal("Oops!", `An error occurred.
            ${response.status} | ${response.json() || "No data provided"}`)
        }
      } catch (error) {
        createModal("Oops!", `An error occurred.
          Here's all we could gather about it: ${error}`)
      }
    });
  } else {
    console.error("Login form element not found");
  }

  const postForm = document.getElementById("postFormElement");
  if (postForm) {
    postForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      const content = document.getElementById("postContent")?.value;
      const token = localStorage.getItem("token");
      console.log("Post content:", content);

      try {
        const response = await fetch(
          "https://1144-2a06-5906-382b-f800-f810-18ad-edd4-de95.ngrok-free.app/",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "post",
              community: "home",
              p: content,
              token: token,
            }),
          },
        );
        const data = await response.json();
        console.log("Post response:", data);

        if (data.message === "Posted successfully") {
          fetchPosts(token);
        } else {
          createModal("Oops!", `An error occurred while trying to post.
            ${data.status} | ${data.json() || "No data provided"}`)
        }
      } catch (error) {
        createModal("Oops!", `An error occurred while trying to post.
          Here's all we could gather about it: ${error}`)
      } finally {
        document.getElementById("postContent").value = '';
      }
    });
  } else {
    console.error("Post form element not found");
  }

  const logoutButton = document.getElementById("logout");
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      localStorage.removeItem("token");
      localStorage.setItem("redirectAfterLogout", "true");
      globalThis.location.href = "index.html";
    });
  }

  const bubblesButton = document.querySelector(".communities-container");
  if (bubblesButton) {
    bubblesButton.addEventListener("click", () => {
      document.querySelector(".home").style.display = "none";
      document.querySelector(".com").style.display = "block";
    });
  }

  const joinButton = document.getElementById("joinCommunity");
  if (joinButton) {
    joinButton.addEventListener("click", async () => {
      const response = await fetch(
        "https://1144-2a06-5906-382b-f800-f810-18ad-edd4-de95.ngrok-free.app/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "communityJoin",
            name: document.querySelector("#name").value,
            code: document.querySelector("#invitecode").value || null,
            token: token,
          }),
        },
      );
    });
  }

  const createButton = document.getElementById("createButton");
  if (createButton) {
    createButton.addEventListener("click", async () => {
      const response = await fetch(
        "https://1144-2a06-5906-382b-f800-f810-18ad-edd4-de95.ngrok-free.app/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "communityCreate",
            name: document.querySelector("#name2").value,
            code: document.querySelector("#visibility").value == "Public (anyone can join)" ? null : document.querySelector("#invitecode2").value,
            visibility: document.querySelector("#visibility").value == "Public (anyone can join)" ? "public" : "inviteonly",
            token: token,
          }),
        },
      );
    });
  }

  const token = localStorage.getItem("token");
  if (token) {
    fetchPosts(token);
    fetchCommunities(token);
  } else {
    localStorage.removeItem("token");
  }
});

async function fetchPosts(token) {
  try {
    const fetchposts = await fetch("https://1144-2a06-5906-382b-f800-f810-18ad-edd4-de95.ngrok-free.app/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "fetch",
        community: "home",
        offset: 0,
        token: token,
      }),
    });
    const data = await fetchposts.json();
    console.log(data);
    const postsContainer = document.getElementById("postsContainer");
    postsContainer.innerHTML = "";
    const postIds = []; // Array to store post IDs
    data.posts.forEach((post) => {
      postIds.push(post.id); // Store the post ID
      const postElement = document.createElement("div");
      postElement.className = "post";
      postElement.dataset.postId = post.id; // Store post ID as a data attribute
      postElement.innerHTML = `
        <img src="static/defaultuser.png" alt="User Icon" class="user-img" style="height: 40px; width: 40px; border-radius: 50%; margin-right: 10px;">
        <div>
          <p class="post-tag">//<span class="username">${post.u}</span></p>
          <div class="post-content">${sanitize(post.p)}</div>
          <p class="post-timestamp">${new Date(Number(post.ts)).toLocaleString()}</p>
        </div>
        `;
      postElement.addEventListener("click", () => {
        // Redirect to post.html with the post ID as a query parameter
        globalThis.location.href = `post.html?id=${post.id}`;
      });
      postsContainer.appendChild(postElement);
    });
    localStorage.setItem("postIds", JSON.stringify(postIds)); // Store post IDs in localStorage
  } catch (error) {
    createModal("Oops!", `An error occurred while trying to fetch posts.
      Here's all we could gather about it: ${error}`)
  }
}

async function fetchCommunities(token) {
  try {
    const fetchposts = await fetch("https://1144-2a06-5906-382b-f800-f810-18ad-edd4-de95.ngrok-free.app/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "communityFetch",
        token: token,
      }),
    });
    const publix = await fetch("https://1144-2a06-5906-382b-f800-f810-18ad-edd4-de95.ngrok-free.app/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "communityFetchPublic",
        token: token,
      }),
    });
    const data = await fetchposts.json();
    const data2 = await publix.json();
    console.log(data);
    const postsContainer = document.getElementById("communitiesContainer");
    postsContainer.innerHTML = "";
    const postIds = [];
    data.communities.forEach((community) => {
      postIds.push(community.id);
      const postElement = document.createElement("div");
      postElement.className = "post";
      postElement.dataset.postId = community.id;
      postElement.innerHTML = `
        <img src="${community.icon}" alt="Bubble icon" class="user-img" style="height: 40px; width: 40px; border-radius: 50%; margin-right: 10px;">
        <div>
          <p class="post-tag">&<span class="username">${community.name}</span></p>
          <div class="post-content">${community.members.length} members</div>
          <p class="post-timestamp">Created at ${new Date(Number(community.created)).toLocaleString()}</p>
        </div>
        `;
      postElement.addEventListener("click", () => {
        globalThis.location.href = `bubble.html?id=${community.id}`;
      });
      postsContainer.appendChild(postElement);
    });
    data2.communities.forEach((community) => {
      const postElement = document.createElement("div");
      postElement.className = "post";
      postElement.dataset.postId = community.id;
      postElement.innerHTML = `
        <img src="${community.icon}" alt="Bubble icon" class="user-img" style="height: 40px; width: 40px; border-radius: 50%; margin-right: 10px;">
        <div>
          <p class="post-tag">&<span class="username">${community.name}</span></p>
          <div class="post-content">${community.members.length} members</div>
          <p class="post-timestamp">Created at ${new Date(Number(community.created)).toLocaleString()}</p>
        </div>
        `;
      postElement.addEventListener("click", () => {
        globalThis.location.href = `bubble.html?id=${community.id}`;
      });
      postsContainer.appendChild(postElement);
    });
  } catch (error) {
    createModal("Oops!", `An error occurred.
      Here's all we could gather about it: ${error}`)
  }
}

function sanitize(string) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    "/": '&#x2F;',
  };
  const reg = /[&<>"'/]/g;
  return string.replace(reg, (match) => map[match]).replace(/\n/g, '<br>');
}

async function fetchIndividualPost(id, token) {
  try {
    const response = await fetch("https://1144-2a06-5906-382b-f800-f810-18ad-edd4-de95.ngrok-free.app/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "fetchIndividual",
        id: id,
        token: token,
      }),
    });
    const data = await response.json();
    console.log("Individual Post Data:", data);
    return data;
  } catch (error) {
    createModal("Oops!", `An error occurred while trying to fetch the requested post.
      Here's all we could gather about it: ${error}`)
    return null;
  }
}

document.querySelector(".user-icon").addEventListener("click", function () {
  const dropdown = this.querySelector(".dropdown");
  dropdown.style.display = dropdown.style.display === "block"
    ? "none"
    : "block";
});

if (
  localStorage.getItem("redirectAfterLogout") === "true" &&
  globalThis.location.pathname !== "/index.html" &&
  globalThis.location.pathname !== "/signup.html"
) {
  localStorage.removeItem("redirectAfterLogout");
  globalThis.location.href = "index.html";
}

let modalResponse = null; // Global variable to track modal responses

function createModal(title, description, buttons = []) {
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  overlay.style.zIndex = "1000";
  overlay.style.display = "flex";
  overlay.style.justifyContent = "center";
  overlay.style.alignItems = "center";
  overlay.style.opacity = "0";
  overlay.style.transition = "opacity 0.3s ease-in-out";

  const modal = document.createElement("div");
  modal.style.backgroundColor = "#232323";
  modal.style.padding = "20px";
  modal.style.borderRadius = "8px";
  modal.style.textAlign = "center";
  modal.style.position = "relative";
  modal.style.maxWidth = "400px";
  modal.style.width = "90%";

  const closeButton = document.createElement("img");
  closeButton.src = "static/x.png";
  closeButton.alt = "Close";
  closeButton.style.position = "absolute";
  closeButton.style.top = "10px";
  closeButton.style.right = "10px";
  closeButton.style.cursor = "pointer";
  closeButton.style.width = "20px";
  closeButton.style.height = "20px";
  closeButton.addEventListener("click", () => {
    overlay.style.opacity = "0";
    setTimeout(() => {
      document.body.removeChild(overlay);
    }, 300);
  });

  const modalTitle = document.createElement("h2");
  modalTitle.textContent = title;
  modalTitle.style.textAlign = "left";

  const modalDescription = document.createElement("p");
  modalDescription.textContent = description;
  modalDescription.style.color = "#ffffff";
  modalDescription.style.fontStyle = "italic";
  modalDescription.style.textAlign = "left";

  const buttonContainer = document.createElement("div");
  buttonContainer.style.marginTop = "20px";
  buttonContainer.style.display = "flex";
  buttonContainer.style.justifyContent = "center";
  buttonContainer.style.gap = "10px";

  buttons.forEach((button) => {
    const btn = document.createElement("button");
    btn.textContent = button.label;
    btn.style.padding = "10px 20px";
    btn.style.border = "none";
    btn.style.borderRadius = "5px";
    btn.style.cursor = "pointer";
    btn.style.backgroundColor = button.color || "#007BFF";
    btn.style.color = "#fff";
    btn.addEventListener("click", () => {
      modalResponse = button.action || null;
      overlay.style.opacity = "0";
      setTimeout(() => {
        document.body.removeChild(overlay);
      }, 300);
    });
    buttonContainer.appendChild(btn);
  });

  modal.appendChild(closeButton);
  modal.appendChild(modalTitle);
  modal.appendChild(modalDescription);
  if (buttons.length > 0) modal.appendChild(buttonContainer);

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  setTimeout(() => {
    overlay.style.opacity = "1";
  }, 50);
}

// Example usage:
// createModal("Confirm Action", "Are you sure?", [
//   { label: "Yes", action: "yes", color: "green" },
//   { label: "No", action: "no", color: "red" },
// ]);
// console.log(modalResponse); // Check the response after modal closes
