const buildInfo = {
    buildDate: "23.08.25"
};

const serverAddress = "http://127.0.0.1:6060";
const serverWS = "ws://127.0.0.1:8080";
function updateBuildInfo() {
    const currentInstanceName = window.instanceName || "[instanceName could not be resolved]";
    if (window.ws && window.ws.readyState === WebSocket.OPEN) {
        buildInfo.message = "This is a prerelease build of maelink.<br>" +
            "Not to be used in production.<br><br>" +
            `Current build date: ${buildInfo.buildDate}<br>` +
            `Connected to ${currentInstanceName}`;
    } else {
        buildInfo.message = "This is a prerelease build of maelink.<br>" +
            "Not to be used in production.<br><br>" +
            `Current build date: ${buildInfo.buildDate}<br>` +
            `You are not connected to a server.`;
    }
    if (document.getElementById('build-info')) {
        document.getElementById('build-info').innerHTML = buildInfo.message;
    }
}

updateBuildInfo();

setInterval(updateBuildInfo, 100);