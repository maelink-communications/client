// SET BUILD INFO HERE

const buildInfo = {
    buildDate: "23.03.26"
};

const serverAddress = "http://localhost:6000/"; // REST API server
const serverWS = "ws://localhost:6001/"; // WebSocket server
function updateBuildInfo() {
    const currentInstanceName = window.instanceName || "Instance name could not be resolved.";
    if (window.ws && window.ws.readyState === WebSocket.OPEN) {
        buildInfo.message = "This version of Promenade is still in VERY EARLY development.<br>" +
            "If you find any bugs or want to contribute, don't hesitate to drop by our GitHub repository.<br><br>" +
            `Current build date: ${buildInfo.buildDate}<br>` +
            `Connected to ${currentInstanceName}`;
    } else {
        buildInfo.message = "This version of Promenade is still in VERY EARLY development.<br>" +
            "If you find any bugs or want to contribute, don't hesitate to drop by our GitHub repository.<br><br>" +
            `Current build date: ${buildInfo.buildDate}<br>` +
            `You are not connected to a server.`;
    }
    if (document.getElementById('build-info')) {
        document.getElementById('build-info').innerHTML = buildInfo.message;
    }
}

updateBuildInfo();

setInterval(updateBuildInfo, 100);
