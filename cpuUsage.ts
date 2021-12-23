import os from 'os-utils';

class CpuUser {
    int32Array: Int32Array;
    alive: boolean;

    constructor() {
        this.alive = true
        let sharedArrayBuffer = new SharedArrayBuffer(16);
        this.int32Array = new Int32Array(sharedArrayBuffer);
    }

    cpuUsage() {
        return new Promise(resolve => {
            os.cpuUsage((callback: unknown) => {
                resolve(callback);
            })
        });
    }

    // use async wait to keep program serial run
    async main() {
        while (this.alive) {
            Atomics.wait(this.int32Array, 0, 0, 1000)
            let use = await this.cpuUsage() as number;
            if (use < 0.3) {
                for (let date = new Date(); date.valueOf() + 10000 > new Date().valueOf();) {
                }
            }
        }
    }
}

export default CpuUser