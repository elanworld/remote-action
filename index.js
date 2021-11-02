const core = require('@actions/core');
const github = require('@actions/github');
const childProcess = require('child_process');

let process = childProcess.spawn('bash',['entrypoint.sh'])

process.stdout.on('data', function(data) {
    console.log(data.toString())
});
process.stderr.on('data', function(data) {
    console.log('error: ' + data)
});