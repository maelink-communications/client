console.log("main.js loaded");
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded – main.js registering events");

  const signupForm = document.getElementById("signupFormElement");
  if (signupForm) {
    signupForm.addEventListener("submit", async function (e) {
      console.log("Signup form submitted"); // Debug line
      e.preventDefault();
      const username = document.getElementById("signupUsername")?.value;
      const password = document.getElementById("signupPassword")?.value;
      const code = document.getElementById("code")?.value;
      console.log("Signup inputs:", username, password, code); // Debug line

      try {
        const reg = await fetch("https://maelink-http.derpygamer2142.com/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "reg",
            user: username,
            password: password,
            code: code,
          }),
        });
        const data = await reg.json();
        console.log("Signup response:", data);

        if (data.payload && data.payload.token) {
          localStorage.setItem("token", data.payload.token);
          globalThis.location.href = "home.html";
      } else {
          alert("Registration failed");
      }
      } catch (error) {
        console.error("Signup error:", error);
      }
    });
  } else {
    console.error("Signup form element not found");
  }
  const loginForm = document.getElementById("loginFormElement");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const username = document.getElementById("username")?.value;
      const password = document.getElementById("password")?.value;
      console.log("Attempting to authenticate with", username, password);
      try {
        const response = await fetch("https://maelink-http.derpygamer2142.com/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "auth",
            user: username,
            password: password,
          }),
        });
        const data = await response.json();
        console.log("Auth Response:", data);
        if (data.payload && data.payload.token) {
          localStorage.setItem("token", data.payload.token);
          globalThis.location.href = "home.html";
      } else {
          alert("Authentication failed");
      }
      } catch (error) {
        console.error("Authentication error:", error);
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
      console.log("Post content:", content); // Debug line

      try {
        const response = await fetch("https://maelink-http.derpygamer2142.com/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "post",
            community: "home",
            p: content,
            token: token,
          }),
        });
        const data = await response.json();
        console.log("Post response:", data);

        if (data.message === "Posted successfully") {
          fetchPosts(token);
        } else {
          alert("Posting failed");
        }
      } catch (error) {
        console.error("Post error:", error);
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

  const token = localStorage.getItem("token");
    if (token) {
        fetchPosts(token);
    } else {
        localStorage.removeItem("token");
    }
});

async function fetchPosts(token) {
  try {
    const fetchposts = await fetch("https://maelink-http.derpygamer2142.com/", {
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
    data.posts.forEach((post) => {
      const postElement = document.createElement("div");
      postElement.className = "post";
      postElement.innerHTML = `
        <p>${post.u}</p>
        <p>${post.p}</p>
        <p>${new Date(post.ts).toLocaleString()}</p>
      `;
      postsContainer.appendChild(postElement);
    });
  } catch (error) {
    console.error("Fetch posts error:", error);
  }
}

document.querySelector(".user-icon").addEventListener("click", function () {
  const dropdown = this.querySelector(".dropdown");
  dropdown.style.display = dropdown.style.display === "block"
    ? "none"
    : "block";
});

if (localStorage.getItem("redirectAfterLogout") === "true" && globalThis.location.pathname !== "/index.html" && globalThis.location.pathname !== "/signup.html") {
  localStorage.removeItem("redirectAfterLogout");
  globalThis.location.href = "index.html";
}