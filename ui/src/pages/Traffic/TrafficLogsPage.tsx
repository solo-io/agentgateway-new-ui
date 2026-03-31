import styled from "@emotion/styled";
import { useEffect, useState } from "react";
import { SoloLogViewer } from "../../components/LogViewer/SoloLogViewer";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
`;

const MOCK_LOGS_SOURCE = [
  JSON.stringify({ timestamp: "2026-03-31T10:00:01.123Z", level: "INFO",  method: "GET",  path: "/api/v1/health",          status: 200, duration_ms: 12,    source_ip: "10.0.1.15",    user_agent: "kube-probe/1.28" }),
  JSON.stringify({ timestamp: "2026-03-31T10:00:01.456Z", level: "INFO",  method: "POST", path: "/api/v1/chat/completions", status: 200, duration_ms: 1823,  source_ip: "192.168.1.42",  user_agent: "python-requests/2.31.0" }),
  JSON.stringify({ timestamp: "2026-03-31T10:00:02.789Z", level: "WARN",  method: "POST", path: "/api/v1/chat/completions", status: 429, duration_ms: 5,     source_ip: "192.168.1.42",  user_agent: "python-requests/2.31.0" }),
  JSON.stringify({ timestamp: "2026-03-31T10:00:03.012Z", level: "INFO",  method: "GET",  path: "/api/v1/models",           status: 200, duration_ms: 45,    source_ip: "10.0.2.8",      user_agent: "Mozilla/5.0" }),
  JSON.stringify({ timestamp: "2026-03-31T10:00:03.334Z", level: "ERROR", method: "POST", path: "/api/v1/embeddings",       status: 502, duration_ms: 30000, source_ip: "172.16.0.100",  user_agent: "axios/1.6.2" }),
  JSON.stringify({ timestamp: "2026-03-31T10:00:04.567Z", level: "INFO",  method: "POST", path: "/api/v1/chat/completions", status: 200, duration_ms: 2150,  source_ip: "10.0.1.22",     user_agent: "langchain/0.1.0" }),
  JSON.stringify({ timestamp: "2026-03-31T10:00:05.890Z", level: "INFO",  method: "GET",  path: "/api/v1/health",           status: 200, duration_ms: 8,     source_ip: "10.0.1.15",     user_agent: "kube-probe/1.28" }),
  JSON.stringify({ timestamp: "2026-03-31T10:00:06.123Z", level: "INFO",  method: "POST", path: "/api/v1/chat/completions", status: 200, duration_ms: 987,   source_ip: "10.0.3.5",      user_agent: "openai-python/1.12.0" }),
  JSON.stringify({ timestamp: "2026-03-31T10:00:06.456Z", level: "INFO",  method: "GET",  path: "/api/v1/models",           status: 200, duration_ms: 32,    source_ip: "192.168.1.42",  user_agent: "python-requests/2.31.0" }),
  JSON.stringify({ timestamp: "2026-03-31T10:00:07.001Z", level: "WARN",  method: "POST", path: "/api/v1/chat/completions", status: 503, duration_ms: 15002, source_ip: "10.0.2.8",      user_agent: "Mozilla/5.0" }),
  JSON.stringify({ timestamp: "2026-03-31T10:00:07.234Z", level: "INFO",  method: "DELETE", path: "/api/v1/sessions/abc123", status: 204, duration_ms: 18,   source_ip: "10.0.1.22",     user_agent: "langchain/0.1.0" }),
  JSON.stringify({ timestamp: "2026-03-31T10:00:08.567Z", level: "INFO",  method: "POST", path: "/api/v1/chat/completions", status: 200, duration_ms: 3420,  source_ip: "172.16.0.55",   user_agent: "curl/8.4.0" }),
  JSON.stringify({ timestamp: "2026-03-31T10:00:09.890Z", level: "INFO",  method: "GET",  path: "/api/v1/health",           status: 200, duration_ms: 9,     source_ip: "10.0.1.15",     user_agent: "kube-probe/1.28" }),
  JSON.stringify({ timestamp: "2026-03-31T10:00:10.012Z", level: "ERROR", method: "POST", path: "/api/v1/chat/completions", status: 500, duration_ms: 45,    source_ip: "10.0.3.5",      user_agent: "openai-python/1.12.0" }),
  JSON.stringify({ timestamp: "2026-03-31T10:00:10.345Z", level: "INFO",  method: "POST", path: "/api/v1/embeddings",       status: 200, duration_ms: 312,   source_ip: "192.168.1.42",  user_agent: "python-requests/2.31.0" }),
  JSON.stringify({ timestamp: "2026-03-31T10:00:11.678Z", level: "INFO",  method: "PUT",  path: "/api/v1/config/routes",    status: 200, duration_ms: 67,    source_ip: "10.0.0.1",      user_agent: "kubectl/1.29.0" }),
  JSON.stringify({ timestamp: "2026-03-31T10:00:12.001Z", level: "INFO",  method: "POST", path: "/api/v1/chat/completions", status: 200, duration_ms: 1456,  source_ip: "172.16.0.100",  user_agent: "axios/1.6.2" }),
  JSON.stringify({ timestamp: "2026-03-31T10:00:12.234Z", level: "WARN",  method: "GET",  path: "/api/v1/models",           status: 401, duration_ms: 3,     source_ip: "203.0.113.50",  user_agent: "PostmanRuntime/7.36.0" }),
  JSON.stringify({ timestamp: "2026-03-31T10:00:13.567Z", level: "INFO",  method: "GET",  path: "/api/v1/health",           status: 200, duration_ms: 11,    source_ip: "10.0.1.15",     user_agent: "kube-probe/1.28" }),
  JSON.stringify({ timestamp: "2026-03-31T10:00:14.890Z", level: "INFO",  method: "POST", path: "/api/v1/chat/completions", status: 200, duration_ms: 2890,  source_ip: "10.0.1.22",     user_agent: "langchain/0.1.0" }),
  JSON.stringify({ timestamp: "2026-03-31T10:00:15.123Z", level: "INFO",  method: "POST", path: "/api/v1/embeddings",       status: 200, duration_ms: 278,   source_ip: "10.0.3.5",      user_agent: "openai-python/1.12.0" }),
  JSON.stringify({ timestamp: "2026-03-31T10:00:15.456Z", level: "ERROR", method: "POST", path: "/api/v1/chat/completions", status: 504, duration_ms: 60000, source_ip: "172.16.0.55",   user_agent: "curl/8.4.0" }),
  JSON.stringify({ timestamp: "2026-03-31T10:00:16.789Z", level: "INFO",  method: "GET",  path: "/api/v1/sessions",         status: 200, duration_ms: 89,    source_ip: "10.0.2.8",      user_agent: "Mozilla/5.0" }),
  JSON.stringify({ timestamp: "2026-03-31T10:00:17.012Z", level: "INFO",  method: "POST", path: "/api/v1/chat/completions", status: 200, duration_ms: 1102,  source_ip: "192.168.1.42",  user_agent: "python-requests/2.31.0" }),
  JSON.stringify({ timestamp: "2026-03-31T10:00:17.345Z", level: "INFO",  method: "GET",  path: "/api/v1/health",           status: 200, duration_ms: 7,     source_ip: "10.0.1.15",     user_agent: "kube-probe/1.28" }),
  JSON.stringify({ timestamp: "2026-03-31T10:00:18.678Z", level: "WARN",  method: "POST", path: "/api/v1/chat/completions", status: 429, duration_ms: 4,     source_ip: "203.0.113.50",  user_agent: "PostmanRuntime/7.36.0" }),
  JSON.stringify({ timestamp: "2026-03-31T10:00:19.001Z", level: "INFO",  method: "PATCH", path: "/api/v1/agents/agent-7",  status: 200, duration_ms: 34,    source_ip: "10.0.0.1",      user_agent: "kubectl/1.29.0" }),
  JSON.stringify({ timestamp: "2026-03-31T10:00:19.234Z", level: "INFO",  method: "POST", path: "/api/v1/chat/completions", status: 200, duration_ms: 1675,  source_ip: "10.0.3.5",      user_agent: "openai-python/1.12.0" }),
  JSON.stringify({ timestamp: "2026-03-31T10:00:20.567Z", level: "INFO",  method: "POST", path: "/api/v1/embeddings",       status: 200, duration_ms: 445,   source_ip: "10.0.1.22",     user_agent: "langchain/0.1.0" }),
  JSON.stringify({ timestamp: "2026-03-31T10:00:21.890Z", level: "INFO",  method: "GET",  path: "/api/v1/health",           status: 200, duration_ms: 10,    source_ip: "10.0.1.15",     user_agent: "kube-probe/1.28" }),
  JSON.stringify({ timestamp: "2026-03-31T10:00:22.123Z", level: "INFO",  method: "POST", path: "/api/v1/chat/completions", status: 200, duration_ms: 2034,  source_ip: "172.16.0.100",  user_agent: "axios/1.6.2" }),
  JSON.stringify({ timestamp: "2026-03-31T10:00:22.456Z", level: "ERROR", method: "GET",  path: "/api/v1/agents/unknown",   status: 404, duration_ms: 2,     source_ip: "203.0.113.50",  user_agent: "PostmanRuntime/7.36.0" }),
  JSON.stringify({ timestamp: "2026-03-31T10:00:23.789Z", level: "INFO",  method: "POST", path: "/api/v1/chat/completions", status: 200, duration_ms: 1340,  source_ip: "192.168.1.42",  user_agent: "python-requests/2.31.0" }),
  JSON.stringify({ timestamp: "2026-03-31T10:00:24.012Z", level: "INFO",  method: "GET",  path: "/api/v1/models",           status: 200, duration_ms: 38,    source_ip: "10.0.2.8",      user_agent: "Mozilla/5.0" }),
  JSON.stringify({ timestamp: "2026-03-31T10:00:24.345Z", level: "WARN",  method: "POST", path: "/api/v1/embeddings",       status: 503, duration_ms: 10005, source_ip: "172.16.0.55",   user_agent: "curl/8.4.0" }),
  JSON.stringify({ timestamp: "2026-03-31T10:00:25.678Z", level: "INFO",  method: "GET",  path: "/api/v1/health",           status: 200, duration_ms: 9,     source_ip: "10.0.1.15",     user_agent: "kube-probe/1.28" }),
  JSON.stringify({ timestamp: "2026-03-31T10:00:26.001Z", level: "INFO",  method: "POST", path: "/api/v1/chat/completions", status: 200, duration_ms: 2567,  source_ip: "10.0.1.22",     user_agent: "langchain/0.1.0" }),
  JSON.stringify({ timestamp: "2026-03-31T10:00:26.334Z", level: "INFO",  method: "POST", path: "/api/v1/chat/completions", status: 200, duration_ms: 890,   source_ip: "10.0.3.5",      user_agent: "openai-python/1.12.0" }),
  JSON.stringify({ timestamp: "2026-03-31T10:00:27.667Z", level: "INFO",  method: "GET",  path: "/api/v1/sessions/def456",  status: 200, duration_ms: 22,    source_ip: "10.0.2.8",      user_agent: "Mozilla/5.0" }),
  JSON.stringify({ timestamp: "2026-03-31T10:00:28.000Z", level: "INFO",  method: "POST", path: "/api/v1/chat/completions", status: 200, duration_ms: 1789,  source_ip: "172.16.0.100",  user_agent: "axios/1.6.2" }),
];

export const TrafficLogsPage = () => {
  const [mockTrafficLogs, setMockTrafficLogs] = useState<string[]>([]);

  useEffect(() => { 
    let index = 0;
    const interval = setInterval(() => {
      if (index < MOCK_LOGS_SOURCE.length) { 
        setMockTrafficLogs(prev => [...prev, MOCK_LOGS_SOURCE[index]]);
        index++;
      } else { 
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [])

  return (
    <Container>
      <SoloLogViewer 
        data={mockTrafficLogs}
      />
    </Container>
  );
};