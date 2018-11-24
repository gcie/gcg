export class Logger {

    constructor(private silent: boolean) { }
    
    log(...messages: string[]) {
        if(!this.silent) {
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