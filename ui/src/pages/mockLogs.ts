import type { LLMLogEntry, MCPLogEntry, TrafficLogEntry } from "../api/logTypes";

export const mockTrafficLogs: TrafficLogEntry[] = [
    {
        id: "1",
        timestamp: 1717000000,
        status: "success",
        duration: 100,
        method: "GET",
        path: "/api/v1/traffic",
        statusCode: 200,
        upstream: "https://api.example.com",
        requestSize: 100,
        responseSize: 100,
    },
    {
        id: "2",
        timestamp: 1717000000,
        status: "success",
        duration: 100,
        method: "POST",
        path: "/api/v1/traffic",
        statusCode: 200,
        upstream: "https://api.example.com",
        requestSize: 100,
        responseSize: 100,
    }
];

export const mockLLMLogs: LLMLogEntry[] = [
    {
        id: "3",
        timestamp: 1717000000,
        status: "success",
        duration: 100,
        model: "gpt-3.5-turbo",
        provider: "openai",
        inputTokens: 100,
        outputTokens: 100,
        promptTokens: 100,
        completionTokens: 100,
    },
    {
        id: "4",
        timestamp: 1717000000,
        status: "success",
        duration: 100,
        model: "gpt-4",
        provider: "openai",
        inputTokens: 100,
        outputTokens: 100,
        promptTokens: 100,
        completionTokens: 100,
    },
];

export const mockMCPLogs: MCPLogEntry[] = [
    {
        id: "5",
        timestamp: 1717000000,
        status: "success",
        duration: 100,
        toolName: "mcp-server",
        server: "https://api.example.com",
        action: "call",
        inputSize: 100,
        outputSize: 100,
    },
    {
        id: "6",
        timestamp: 1717000000,
        status: "success",
        duration: 100,
        toolName: "mcp-server",
        server: "https://api.example.com",
        action: "call",
        inputSize: 100,
        outputSize: 100,
    },
];