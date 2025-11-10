import connectToDatabase from "./db";
import Log, { LogLevel } from "./models/Log";

export interface LogOptions {
  level?: LogLevel;
  action: string;
  details: string;
  userId?: string;
  userName?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

// create a log entry in database
// returns the log id or empty string if it fails
export async function createLog(options: LogOptions): Promise<string> {
  try {
    await connectToDatabase();

    const logEntry = await Log.create({
      level: options.level || "info",
      action: options.action,
      details: options.details,
      userId: options.userId,
      userName: options.userName,
      ipAddress: options.ipAddress,
      userAgent: options.userAgent,
      metadata: options.metadata || {},
      timestamp: new Date(),
    });

    return (logEntry._id as any).toString();
  } catch (error) {
    console.error("Failed to create log entry:", error);
    // dont throw errors to prevent logging from breaking the app
    return "";
  }
}

// log an info level event
export async function logInfo(
  action: string,
  details: string,
  options?: Partial<LogOptions>
): Promise<void> {
  await createLog({
    level: "info",
    action,
    details,
    ...options,
  });
}

// log a warning event
export async function logWarning(
  action: string,
  details: string,
  options?: Partial<LogOptions>
): Promise<void> {
  await createLog({
    level: "warning",
    action,
    details,
    ...options,
  });
}

// log an error event
export async function logError(
  action: string,
  details: string,
  options?: Partial<LogOptions>
): Promise<void> {
  await createLog({
    level: "error",
    action,
    details,
    ...options,
  });
}

// log a critical event (oh no!)
export async function logCritical(
  action: string,
  details: string,
  options?: Partial<LogOptions>
): Promise<void> {
  await createLog({
    level: "critical",
    action,
    details,
    ...options,
  });
}

// helper to get client ip from headers
export function getClientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}

// helper to get user agent from headers
export function getUserAgent(headers: Headers): string {
  return headers.get("user-agent") || "unknown";
}

// create a log from a nextjs request
// automatically grabs ip and user agent
export async function logFromRequest(
  request: Request,
  action: string,
  details: string,
  options?: Partial<LogOptions>
): Promise<void> {
  await createLog({
    action,
    details,
    ipAddress: getClientIp(request.headers),
    userAgent: getUserAgent(request.headers),
    ...options,
  });
}
