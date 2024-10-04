class Logger {
    info(tag: string, log: string) {
        console.log(`%cINFO -- [JiraBFF|${tag}] -- ${log}`, 'background: #222; color: #bada55');
    }
    error(tag: string, log: string) {
        console.log(`%cERROR -- [JiraBFF|${tag}] -- ${log}`, 'background: #fff; color: #ff0000');
    }
}

export const logger = new Logger();
