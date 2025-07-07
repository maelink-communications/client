const buildInfo = {
    buildDate: "07.07.25",
    codename: "belfast"
};

buildInfo.message = "This is a very early build of maelink.<br>" +
                   "For testing and development purposes only.<br><br>" +
                   `Current build date: ${buildInfo.buildDate} | codename ${buildInfo.codename}`;

    document.getElementById('build-info').innerHTML = buildInfo.message;