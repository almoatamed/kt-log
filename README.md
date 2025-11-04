# kt-log

A lightweight, configurable logging utility for Node.js applications.  
It supports dynamic configuration loading, colorized console output, and clustering-aware log handling.

---

## 🚀 Features

- **Dynamic Configuration** via `locate-config-kt`
- **Cluster-Aware Logging** (Primary and Worker process detection)
- **Configurable Console Override**
- **Log Coloring**
- **Timestamped Log Output**
- **Customizable Log Levels**

---

## 📦 Installation

```bash
npm install kt-log
# or
yarn add kt-log
```

---

## 🧩 Configuration

`kt-log` automatically loads a configuration file named `log.kt.config.json` using [`locate-config-kt`](https://github.com/almoatamed/locate-config-kt).

### Example Configuration (`log.kt.config.json`)

```json
{
  "hideLogs": false,
  "overrideConsoleLog": true
}
```

| Property | Type | Description |
|-----------|------|-------------|
| **hideLogs** | `boolean` | If `true`, suppresses all log outputs. |
| **overrideConsoleLog** | `boolean` | If `true`, replaces the native `console` methods with `kt-log`'s logger. |

If no configuration file is found, `kt-log` falls back to default behavior (logs are shown, no console override).

---

## ⚙️ Usage

### Example

```ts
import { createLogger, generalLogger } from "kt-log";

const logger = await createLogger({
  name: "Server",
  color: "cyan",
  logLevel: "Info",
  worker: false,
});

logger("Server started successfully!");
logger.warning("Server memory usage is high");
logger.error("Server crashed unexpectedly");

// Use the general logger (shared globally)
generalLogger("This is a general log");
```

### Overriding Console Logs

If your configuration enables `overrideConsoleLog`, you can use native `console` methods directly:

```ts
console.log("This will use kt-log under the hood");
console.warn("Warning through kt-log");
console.error("Error via kt-log");
```

---

## 🧠 Logger API

### `createLogger(options)`

Creates a custom logger instance.

| Option | Type | Description |
|---------|------|-------------|
| **name** | `string` | Identifier for the logger (e.g. `"Server"`). |
| **color** | `"black" | "red" | "green" | "yellow" | "blue" | "magenta" | "cyan" | "white" | "consoleColor"` | Sets the color of log prefixes. |
| **logLevel** | `"Info" | "Warning" | "Error"` | Defines the log severity level (default: `"Info"`). |
| **worker** | `boolean` | Whether logs should appear in worker processes. |

Returns a logger function with the following methods:
- `logger(...msgs: any[])`
- `logger.error(...msgs: any[])`
- `logger.warning(...msgs: any[])`

### `generalLogger`

A preconfigured logger available globally with the name `"General"` and color `"white"`.

### `forceLog`

Direct reference to the original `console.log`, allowing bypass of suppression.

---

## 🎨 Colors

| Color | Escape Code |
|--------|--------------|
| black | `\x1b[30m` |
| red | `\x1b[31m` |
| green | `\x1b[32m` |
| yellow | `\x1b[33m` |
| blue | `\x1b[34m` |
| magenta | `\x1b[35m` |
| cyan | `\x1b[36m` |
| white | `\x1b[37m` |
| consoleColor | `\x1b[0m` |

---

## 🧪 Example Output

```text
---[2025-11-04-13:42:10.512]-[ 24513 ]-[ SERVER ]-[ INFO ]--- Server started successfully!
---[2025-11-04-13:42:11.712]-[ 24513 ]-[ SERVER ]-[ WARNING ]--- Memory usage high!
---[2025-11-04-13:42:12.233]-[ 24513 ]-[ SERVER ]-[ ERROR ]--- Crash detected!
```

---

## 🧩 Dependencies

- [`locate-config-kt`](https://github.com/almoatamed/locate-config-kt) — for configuration discovery
- [`kt-common`](https://github.com/almoatamed/kt-common) — provides `dashDateFormatter`
- Node.js built-in `cluster` module

---

## 📄 License

MIT © Salem Elmotamed