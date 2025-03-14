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
        const reg = await fetch("http://localhost:4040", {
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
        const response = await fetch("http://localhost:4040", {
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
        localStorage.setItem("token", data.payload.token)
        globalThis.location.href = "home.html";
      } catch (error) {
        console.error("Authentication error:", error);
      }
    });
  } else {
    console.error("Login form element not found");
  }
});

async function fetchPosts(token) {
  const fetchposts = await fetch("http://localhost:4040", {
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
}
