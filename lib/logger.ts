export type LogLevel = 'error' | 'warn' | 'info' | 'debug'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: Record<string, any>
  error?: {
    message: string
    stack?: string
  }
}

class Logger {
  private logs: LogEntry[] = []
  private maxLogs = 1000

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    error?: Error
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error: error ? {
        message: error.message,
        stack: error.stack,
      } : undefined,
    }
  }

  private log(entry: LogEntry) {
    // Store in memory (in production, this would go to a logging service)
    this.logs.push(entry)
    
    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }

    // Console output with formatting
    const logMessage = `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}`
    
    switch (entry.level) {
      case 'error':
        console.error(logMessage, entry.context, entry.error)
        break
      case 'warn':
        console.warn(logMessage, entry.context)
        break
      case 'info':
        console.info(logMessage, entry.context)
        break
      case 'debug':
        console.debug(logMessage, entry.context)
        break
    }
  }

  error(message: string, context?: Record<string, any>, error?: Error) {
    const entry = this.createLogEntry('error', message, context, error)
    this.log(entry)
  }

  warn(message: string, context?: Record<string, any>) {
    const entry = this.createLogEntry('warn', message, context)
    this.log(entry)
  }

  info(message: string, context?: Record<string, any>) {
    const entry = this.createLogEntry('info', message, context)
    this.log(entry)
  }

  debug(message: string, context?: Record<string, any>) {
    if (process.env.NODE_ENV === 'development') {
      const entry = this.createLogEntry('debug', message, context)
      this.log(entry)
    }
  }

  getRecentLogs(count: number = 50): LogEntry[] {
    return this.logs.slice(-count)
  }

  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level === level)
  }
}

export const logger = new Logger()