const core = require('@actions/core');
const github = require('@actions/github');
const childProcess = require('child_process');
const os = require('os');
const path = require('path');
const fs = require('fs');


let timeoutFile = path.join(os.homedir(),"timeLimit");
let timeout = 600
let loopTime = 30
let bashPath = '/home/runner/work/_actions/elanworld/remote-action/master/entrypoint.sh'

function runCmd(cmd, arg) {
    let process = childProcess.spawn(cmd, arg)
    process.stdout.on('data', function (data) {
        console.log(data.toString())
    });
    process.stderr.on('data', function (data) {
        console.log(data.toString())
    });
}
function writeTime(timeout, timeoutFile) {
    fs.writeFile(timeoutFile, timeout.toString(), "utf-8",() => {})
}

function wait(time=1000) {
    let interval = setInterval(() => {clearInterval(interval)}, 1000);
}
const sleep = (delay) => new Promise((resolve, reject) => setTimeout(() => resolve(""), delay))

runCmd('bash',[bashPath])
writeTime(timeout, timeoutFile)

async function  loop() {
    while (timeout > 0) {
        await sleep(loopTime * 1000)
        fs.readFile(timeoutFile, "utf-8", (err, data) => {
            timeout = parseInt(data.toString())
        })
        timeout = timeout - loopTime;
        writeTime(timeout, timeoutFile)
        console.log(timeout.toString())
        runCmd('bash',[bashPath, 'show'])
    }
}

loop()