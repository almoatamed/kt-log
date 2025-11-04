import cluster from "cluster";
import { getConfig } from "locate-config-kt";
import { dashDateFormatter } from "kt-common";

export type LoggingConfig = {
    hideLogs: (() => boolean) | boolean;
    overrideConsoleLog?: (() => boolean) | boolean;
};

const loadConfig = async (): Promise<LoggingConfig> => {
    const defaultLog: LoggingConfig = {
        hideLogs: () => false,
        overrideConsoleLog: () => false,
    };

    const log = await getConfig({
        configFileNameWithExtension: "log.kt.config.json",
    });
    if (log) {
        return JSON.parse(log.toString());
    } else {
        return defaultLog;
    }
};

let loggingConfig: LoggingConfig = {
    hideLogs: false,
    overrideConsoleLog: false,
};

loadConfig().then((config) => {
    loggingConfig = config;
});

export const forceLog = console.log;

const isValue = (v?: (() => boolean) | boolean) => {
    if (typeof v == "function") {
        return v();
    }
    return !!v;
};

if (isValue(loggingConfig.hideLogs)) {
    console.log = () => {};
    console.warn = () => {};
    console.info = () => {};
    console.trace = () => {};
}
export const colors = {
    black: "\x1b[30m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",
    consoleColor: "\x1b[0m",
};

type LoggerProps = {
    logLevel: LogLevel;
    logAsWorker: boolean;
    name: string;
    color: LogColor;
};

const Logger = function (options: LoggerProps) {
    let time = "";
    function updateTime() {
        time = dashDateFormatter(new Date(), {
            getDate: true,
            getTime: true,
            getMilliseconds: true,
            dateFormat: "yyyy-mm-dd",
            rtl: false,
        });
    }
    const logger = function (...msgs: any[]) {
        if (isValue(loggingConfig.hideLogs)) {
            return;
        }

        if (cluster.isPrimary || options.logAsWorker) {
            if (!msgs[0]) {
                forceLog();
                return;
            }
            updateTime();
            const consoleLog = `${colors[options.color]}---[${time}]-[ ${process.pid} ]-[ ${String(
                options.name
            ).toUpperCase()} ]-[ ${String(options.logLevel).toUpperCase()} ]---${colors.consoleColor}`;
            forceLog(consoleLog, ...msgs);
        }
    };

    logger.error = function (...msgs: any[]) {
        if (cluster.isPrimary || options.logAsWorker) {
            if (!msgs[0]) {
                forceLog();
                return;
            }

            updateTime();
            const consoleLog = `${colors[options.color]}---[${time}]-[ ${process.pid} ]-[ ${String(
                options.name
            ).toUpperCase()} ]-[ ERROR ]---${colors.consoleColor}`;
            forceLog(consoleLog, ...msgs);
        }
    };
    logger.warning = function (...msgs: any[]) {
        if (isValue(loggingConfig.hideLogs)) {
            return;
        }
        if (!msgs[0]) {
            forceLog();
            return;
        }

        if (cluster.isPrimary || options.logAsWorker) {
            updateTime();
            const consoleLog = `${colors[options.color]}---[${time}]-[ ${process.pid} ]-[ ${String(
                options.name
            ).toUpperCase()} ]-[ WARNING ]---${colors.consoleColor}`;
            forceLog(consoleLog, ...msgs);
        }
    };
    return logger;
};

type LogColor = "black" | "red" | "green" | "yellow" | "blue" | "magenta" | "cyan" | "white" | "consoleColor";
type LogLevel = "Info" | "Warning" | "Error";
export async function createLogger({
    color,
    logLevel = "Info",
    name,
    worker,
}: {
    name: string;
    color: LogColor;
    logLevel: LogLevel;
    worker: boolean;
}) {
    if (!logLevel) {
        logLevel = "Info";
    }
    name = name.toUpperCase();
    const logger = Logger({ name, logLevel, logAsWorker: worker, color });
    return logger;
}

export const generalLogger = Logger({
    color: "white",
    logAsWorker: true,
    logLevel: "Info",
    name: "General",
});

if (isValue(loggingConfig.overrideConsoleLog)) {
    console.log = generalLogger;
    console.warn = generalLogger.warning;
    console.error = generalLogger.error;
}
