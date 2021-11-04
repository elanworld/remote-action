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

function runCmd(cmd, arg, options) {
    let process = childProcess.spawn(cmd, arg, options)
    process.stdout && process.stdout.on('data', function (data) {
        console.log(data.toString())
    });
    process.stderr && process.stderr.on('data', function (data) {
        console.log(data.toString())
    });
}
function writeTimeFile(timeout, timeoutFile) {
    fs.writeFileSync(timeoutFile, timeout.toString(), {
        encoding: "utf-8"
    })
}

function wait(time=1000) {
    let interval = setInterval(() => {clearInterval(interval)}, 1000);
}
const sleep = (delay) => new Promise((resolve, reject) => setTimeout(() => resolve(""), delay))


async function  loop() {
    while (timeout > 0) {
        await sleep(loopTime * 1000)
        let line = fs.readFileSync(timeoutFile, "utf-8");
        timeout = parseInt(line) - loopTime;
        writeTimeFile(timeout, timeoutFile)
        console.log("time limit:", timeout.toString())
        console.log("you can delay by run command echo $time > " + timeoutFile)
        runCmd('bash',[bashPath, 'show'])
    }
}

runCmd('bash',[bashPath], {
    detached: true,
    stdio: "ignore"
})
writeTimeFile(timeout, timeoutFile)
loop().then(() => console.log("finished"))