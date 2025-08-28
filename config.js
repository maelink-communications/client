// SET BUILD INFO HERE
// REMOVE ALL VALUES RELATED TO PRERELEASE WHEN PREPARING FOR PROD!

const buildInfo = {
    buildDate: "24.08.25"
};

const serverAddress = "http://127.0.0.1:6060"; // REST API server
const serverWS = "ws://127.0.0.1:8080"; // WebSocket server
function updateBuildInfo() {
    const currentInstanceName = window.instanceName || "[instanceName could not be resolved]";
    if (window.ws && window.ws.readyState === WebSocket.OPEN) {
        buildInfo.message = "This is a prerelease build of maelink.<br>" + // COMMENT THIS OUT IN PRODUCTION!
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