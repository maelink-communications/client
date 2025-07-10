const buildInfo = {
    buildDate: "10.07.25",
    codename: "belfast"
};

const serverAddress = "http://0.0.0.0:6060";
const serverWS = "ws://0.0.0.0:8080";

buildInfo.message = "This is a prerelease build of maelink.<br>" +
                   "Not to be used in production.<br><br>" +
                   `Current build date: ${buildInfo.buildDate} | codename ${buildInfo.codename}`;

if (document.getElementById('build-info')) {
    document.getElementById('build-info').innerHTML = buildInfo.message;
}