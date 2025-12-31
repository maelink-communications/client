// SET BUILD INFO HERE

const buildInfo = {
    buildDate: "31.12.25"
};

const serverAddress = "https://server.maelink.net/"; // REST API server
const serverWS = "wss://server.maelink.net/"; // WebSocket server
function updateBuildInfo() {
    const currentInstanceName = window.instanceName || "Instance name could not be resolved.";
    if (window.ws && window.ws.readyState === WebSocket.OPEN) {
        buildInfo.message = "This version of maelink is still in development.<br>" +
            "If you find any bugs or want to contribute, don't hesitate to drop by our GitHub repos!<br><br>" +
            `Current build date: ${buildInfo.buildDate}<br>` +
            `Connected to ${currentInstanceName}`;
    } else {
        buildInfo.message = "This version of maelink is still in development.<br>" +
            "If you find any bugs or want to contribute, don't hesitate to drop by our GitHub repos!<br><br>" +
            `Current build date: ${buildInfo.buildDate}<br>` +
            `You are not connected to a server.`;
    }
    if (document.getElementById('build-info')) {
        document.getElementById('build-info').innerHTML = buildInfo.message;
    }
}

updateBuildInfo();

setInterval(updateBuildInfo, 100);