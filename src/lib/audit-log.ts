
import { AuditLog, AuditLogInput } from './types';

let logIdCounter = 0;

export function createAuditLog(logInput: AuditLogInput): AuditLog {
    logIdCounter += 1;
    return {
        id: `log-${Date.now()}-${logIdCounter}`,
        timestamp: new Date().toISOString(),
        ...logInput,
    };
}

    