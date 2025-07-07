const buildInfo = {
    buildDate: "07.07.25",
    codename: "belfast"
};

const serverAddress = "http://0.0.0.0:6060";
const serverWS = "ws://0.0.0.0:8080";

buildInfo.message = "This is a very early build of maelink.<br>" +
                   "For testing and development purposes only.<br><br>" +
                   `Current build date: ${buildInfo.buildDate} | codename ${buildInfo.codename}`;

if (document.getElementById('build-info')) {
    document.getElementById('build-info').innerHTML = buildInfo.message;
}