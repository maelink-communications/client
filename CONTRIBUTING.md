# How to start contributing to the client
Welcome to the contribution guide! We're so glad you've decided to help us on our journey to release, and perhaps more.\
This guide assumes there is either a production or test server up, ***or*** you have a running self-hosted server.
## Prerequisites
- (see below) A copy of **[maelink-communications/server](https://github.com/maelink-communications/server)**
> [!WARNING]
> If you do not have a server active and there is NOT an active production or testing server to connect to, the client will not work, as it will attempt to connect to a nonexistant host.
- This client, of course
- **Electron** (if you want to test the client as a desktop app, and for compiling)
> [!IMPORTANT]
> We may be refactoring the client to use **Tauri** for the desktop app in a future update. Please stay tuned for any updates on that. For the meantime though, we will be using Electron.
- **Node.js**
- And of course, knowledge of HTML, CSS and JS, as well as how to use the aformentioned prerequisites.

> [!NOTE]
> The desktop app will only work on **Windows and Linux.** The client will automatically quit on MacOS due to incompatibility. The web version should work fine, though.

## Spinning the server up
This section is a TODO. There will be a guide in the server repo soon-ish.

## Starting the client
To start the desktop app via Electron, simply `cd` to your client's root directory, and run `npm start`. This should start the desktop app.\
To open it normally via a web browser, just open `auth.html`, and it will hopefully open without problem in your web browser. Janky solution, I know. I'll make it better later. For now, this is what you get.

