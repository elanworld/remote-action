import os from 'os'
import childProcess from 'child_process'
import StreamZip from 'node-stream-zip'
import path from 'path'

const request = require('request')
const fs = require('fs')


function runCmd(cmd: string, arg: readonly string[], options: childProcess.SpawnOptionsWithoutStdio) {
    let process = childProcess.spawn(cmd, arg, options)
    process.stdout && process.stdout.on('data', function (data) {
        console.log(data.toString())
    })
    process.stderr && process.stderr.on('data', function (data) {
        console.log(data.toString())
    })
    return process
}

function syncProcess(fun: (resolve: (value: unknown | PromiseLike<unknown>) => void) => void) {
    return new Promise((resolve) => {
        fun(resolve)
    })
}

function unzip(file: string, out: string, func: () => void) {
    let zip = new StreamZip({
        file: file,
        storeEntries: true
    })
    if (!fs.existsSync(out)) {
        fs.mkdirSync(out, {recursive: true}, () => {
        })
    }
    zip.on('ready', () => {
        zip.extract(null, out, (err, num) => {
            console.log(err ? err : `Extracted ${num} entries`)
            zip.close()
            func()
        })
    })
}


function downloadFile(uri: string, filename: string, callback: () => void) {
    let stream = fs.createWriteStream(filename)
    request(uri).pipe(stream).on('close', callback)

}

function writeFile(timeout: any, timeoutFile: string) {
    fs.writeFileSync(timeoutFile, timeout.toString(), {
        encoding: 'utf-8'
    })
}

function sleep(delay: number) {
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve(''), delay)
    })
}

async function startNgrok(token: string, localPort: number) {
    let workDirectory = path.join(os.homedir(), 'cache-work')
    let fileUrl: string = '';
    if (os.platform() === 'linux') {
        fileUrl = 'https://bin.equinox.io/c/4VmDzA7iaHb/ngrok-stable-linux-386.zip'
    }
    if (os.platform() === 'win32') {
        fileUrl = 'https://bin.equinox.io/c/4VmDzA7iaHb/ngrok-stable-windows-amd64.zip'
    }
    if (os.platform() === 'darwin') {
        fileUrl = 'https://bin.equinox.io/c/4VmDzA7iaHb/ngrok-stable-darwin-amd64.zip'
    }
    const dirName = 'ngrok-stable'
    const filename = dirName + '.zip'
    if (!fs.existsSync(workDirectory)) {
        fs.mkdirSync(workDirectory, {recursive: true}, () => {
        })
    }
    process.chdir(workDirectory)
    if (fs.existsSync(filename)) {
        console.log('file exists:' + filename)
    }else {
        await syncProcess(resolve => downloadFile(fileUrl, filename, () => resolve('')))
    }
    if (!fs.existsSync(dirName)) {
        await syncProcess(resolve => unzip(filename, dirName, ()=>resolve('')))
        process.chdir(dirName)
    } else {
        process.chdir(dirName)
    }
    let logFile = '.ngrok.log';
    if (fs.existsSync(logFile)) {
        fs.rmSync(logFile)
    }
    let frcExe = './ngrok';
    if (os.platform() === 'win32') {
        frcExe = 'ngrok.exe';
    } else {
        childProcess.execSync('chmod 777 ngrok')
    }
    childProcess.execSync(frcExe + ' authtoken ' + token);
    return runCmd(frcExe, ['tcp', String(localPort), '--log', logFile], {})
}

function changePasswd(passwd: string) {
    if (os.platform() === 'linux') {
        console.log(childProcess.execSync('sudo passwd -d $USER').toString());
        let chpasswd = childProcess.spawn('passwd')
        chpasswd.stdin.write(passwd +'\n' + passwd +'\n')
        chpasswd.stdin.end()
        // add public key auth
        childProcess.execSync("sudo sed -i -e 's#\\#StrictModes yes#StrictModes no#' /etc/ssh/sshd_config")
        childProcess.execSync('sudo systemctl restart ssh')
    } else if (os.platform() === 'win32') {
        let user = process.env.USERNAME;
        childProcess.execSync('net user ' + user + ' ' + passwd)
        childProcess.execSync("wmic /namespace:\\\\root\\cimv2\\terminalservices path win32_terminalservicesetting where (__CLASS != \"\") call setallowtsconnections 1")
        childProcess.execSync("wmic /namespace:\\\\root\\cimv2\\terminalservices path win32_tsgeneralsetting where (TerminalName ='RDP-Tcp') call setuserauthenticationrequired 0")
        childProcess.execSync("reg add \"HKLM\\SYSTEM\\CurrentControlSet\\Control\\Terminal Server\" /v fSingleSessionPerUser /t REG_DWORD /d 0 /f")
    }else {
        let userAdd = path.resolve(__dirname, 'useradd.sh');
        childProcess.execSync('export USER=virtual')
        childProcess.execSync('chmod 777 ' + userAdd)
        childProcess.execSync('sudo ' + userAdd +' virtual ' + passwd)
    }
}

async function loop(timeout: number, loopTime: number, fileSave: string, func:  ()=> void) {
    writeFile(timeout, fileSave)
    while (timeout > 0) {
        await sleep(loopTime * 1000)
        let line = fs.readFileSync(fileSave, 'utf-8')
        timeout = parseInt(line) - loopTime
        console.log('time limit:', timeout.toString())
        console.log('you can change it by run command: echo $second > ' + fileSave)
        console.log('====================================')
        writeFile(timeout, fileSave)
        func()
    }
}


async function main() {
    let token = process.env['INPUT_NGROK_TOKEN']
    let passwd = process.env['INPUT_USER_PASSWD'] as string
    let forwardPort = process.env['INPUT_FORWARD_PORT'] as unknown as number
    let timeout = (process.env['INPUT_TIME_LIMIT'] || 600) as number
    let loopTime = 20
    if (!token) {
        throw new Error('please set NGROK_TOKEN')
    }
    let ngrokProcess = await startNgrok(token, forwardPort)
    changePasswd(passwd)
    await loop(timeout, loopTime, path.join(os.homedir(), 'timeLimit'), () => {
        let lines = fs.readFileSync('.ngrok.log');
        let match = lines.toString().match('.*url=tcp://(.*):(.*)');
        let username = os.userInfo().username;
        if (os.platform() === 'darwin') {
            username = 'virtual'
        }
        console.log('Connect command:', 'ssh ' + username + '@' + match[1] + ' -p ' + match[2]);
    })
    ngrokProcess.kill('SIGINT')
}


main()

export {downloadFile, unzip, sleep, runCmd}