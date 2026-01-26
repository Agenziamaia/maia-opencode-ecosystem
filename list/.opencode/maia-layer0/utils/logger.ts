type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  [key: string]: unknown;
}

function formatLog(level: LogLevel, message: string, context?: LogContext): string {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` ${JSON.stringify(context)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
}

export function logInfo(message: string, context?: LogContext): void {
  console.log(formatLog('info', message, context));
}

export function logWarn(message: string, context?: LogContext): void {
  console.warn(formatLog('warn', message, context));
}

export function logError(message: string, context?: LogContext): void {
  console.error(formatLog('error', message, context));
}

export function logDebug(message: string, context?: LogContext): void {
  if (process.env.NODE_ENV === 'development' || process.env.DEBUG) {
    console.debug(formatLog('debug', message, context));
  }
}
