/**
 * TypeScript types for AgentGateway log types
 */

export type BaseLogEntry = { 
    id: string;
    timestamp: number;
    status: string;
    duration: number;
};

export type TrafficLogEntry = BaseLogEntry & {
    method: string;
    path: string;
    statusCode: number;
    upstream: string;
    requestSize: number;
    responseSize: number;
};

export type LLMLogEntry = BaseLogEntry & { 
    model: string;
    provider: string;
    inputTokens: number;
    outputTokens: number;
    promptTokens: number;
    completionTokens: number;
};

export type MCPLogEntry = BaseLogEntry & { 
    toolName: string;
    server: string;
    action: string;
    inputSize: number;
    outputSize: number;
};