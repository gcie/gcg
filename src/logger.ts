import minimist from 'minimist';

export class Logger {

    constructor(private args: minimist.ParsedArgs) { }
    
    log(...messages: string[]) {
        if(this.args.log) {
            console.log(...messages);
        }
    }

    error(...messages: string[]) {
        console.error(...messages);
    }

    callback(message: string, success?: Function, failure?: Function) {
        return (err?: NodeJS.ErrnoException) => {
            if(err) {
                this.error(err.message);
                if(failure) {
                    failure();
                }
            } else {
                this.log(message);
                if(success) {
                    success();
                }
            }
        }
    }
}