import cluster from "cluster";
import { getConfigPath, MaybePromise, valueOf } from "locate-config-kt";
import { dashDateFormatter } from "kt-common";

export type LoggingConfig = {
    hideAllLogs?: MaybePromise<boolean>;
    hideErrors?: MaybePromise<boolean>;
    hideWarnings?: MaybePromise<boolean>;
    hideInfo?: MaybePromise<boolean>;
    hideTrace?: MaybePromise<boolean>;
    hideDebug?: MaybePromise<boolean>;
    overrideConsoleLog?: MaybePromise<boolean>;
};

let cachedConfig: LoggingConfig | null = null;

export const loadConfig = async (): Promise<LoggingConfig> => {
    if (cachedConfig) {
        return cachedConfig;
    }

    const defaultConfig: LoggingConfig = {};

    const configPath = await getConfigPath({
        configFileNameWithExtension: "logger.kt.config.ts",
    });

    if (configPath) {
        cachedConfig = (await import(configPath)).default as LoggingConfig;
        return cachedConfig;
    }
    cachedConfig = defaultConfig;
    return cachedConfig;
};

const getHideAllLogs = async () => {
    const config = await loadConfig();
    return (await valueOf(config.hideAllLogs)) ?? false;
};
let hideAllLogs = false;
getHideAllLogs().then((v) => {
    hideAllLogs = v;
});
const getHideErrors = async () => {
    const config = await loadConfig();
    return (await valueOf(config.hideErrors)) ?? false;
};
let hideErrors = false;
getHideErrors().then((v) => {
    hideErrors = v;
});

const getHideInfo = async () => {
    const config = await loadConfig();
    return (await valueOf(config.hideInfo)) ?? false;
};
let hideInfo = false;
getHideInfo().then((v) => {
    hideInfo = v;
});

const getHideWarnings = async () => {
    const config = await loadConfig();
    return (await valueOf(config.hideWarnings)) ?? false;
};
let hideWarnings = false;
getHideWarnings().then((v) => {
    hideWarnings = v;
});

const getHideDebug = async () => {
    const config = await loadConfig();
    return (await valueOf(config.hideDebug)) ?? false;
};
let hideDebug = false;
getHideDebug().then((v) => {
    hideDebug = v;
});

const getHideTrace = async () => {
    const config = await loadConfig();
    return (await valueOf(config.hideTrace)) ?? false;
};
let hideTrace = false;
getHideTrace().then((v) => {
    hideTrace = v;
});

const getOverrideConsoleLog = async () => {
    const config = await loadConfig();
    return (await valueOf(config.overrideConsoleLog)) ?? false;
};
let overrideConsoleLog = false;
getOverrideConsoleLog().then((v) => {
    overrideConsoleLog = v;
});

export const forceLog = hideAllLogs ? () => {} : console.log;
if (hideAllLogs || hideInfo) console.log = () => {};
if (hideAllLogs || hideDebug) console.debug = () => {};
if (hideAllLogs || hideWarnings) console.warn = () => {};
if (hideAllLogs || hideErrors) console.error = () => {};
if (hideAllLogs || hideTrace) console.trace = () => {};

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
        if (hideAllLogs || hideInfo) {
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
        if (hideAllLogs || hideErrors) {
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
            ).toUpperCase()} ]-[ ERROR ]---${colors.consoleColor}`;
            forceLog(consoleLog, ...msgs);
        }
    };
    logger.warning = function (...msgs: any[]) {
        if (hideAllLogs || hideWarnings) {
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
            ).toUpperCase()} ]-[ WARNING ]---${colors.consoleColor}`;
            forceLog(consoleLog, ...msgs);
        }
    };
    return logger;
};

export type LogColor = "black" | "red" | "green" | "yellow" | "blue" | "magenta" | "cyan" | "white" | "consoleColor";
export type LogLevel = "Info" | "Warning" | "Error";
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

if (overrideConsoleLog) {
    console.log = generalLogger;
    console.warn = generalLogger.warning;
    console.error = generalLogger.error;
}
