import styled from "@emotion/styled";
import { App, Button, Dropdown, InputNumber, Tag, Tooltip } from "antd";
import { Check, Edit2, EllipsisVertical, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { useConfig } from "../../api";
import { fetchConfig, updateConfig } from "../../api/config";
import { useTrafficHierarchy } from "../../components/TrafficHierarchy";
import type { BindNode } from "../../components/TrafficHierarchy/hooks/useTrafficHierarchy";

const PageRoot = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px);
  overflow-y: auto;
  padding: var(--spacing-xl);
  gap: var(--spacing-xl);
`;

const PageTitle = styled.h1`
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-base);
`;

const PortRow = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: 14px;
  color: var(--color-text-secondary);
`;

const PortValue = styled.span`
  font-weight: 600;
  color: var(--color-text-base);
`;

const SectionTitle = styled.h2`
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-base);
  margin: 0 0 var(--spacing-md) 0;
`;

const ServersSection = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
`;

const ServerGridScroll = styled.div`
  max-height: calc(100vh - 260px);
  overflow-y: auto;
`;

const ServerGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-lg);
`;

const ServerCard = styled.div`
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
  background: var(--color-bg-container);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  border: 1px solid rgba(0, 0, 0, 0.3);
`;

const ServerName = styled.div`
  font-weight: 600;
  font-size: 15px;
  color: var(--color-text-base);
`;

const ServerMeta = styled.div`
  font-size: 13px;
  color: var(--color-text-secondary);
`;

const CardActions = styled.div`
  display: flex;
  gap: var(--spacing-sm);
  margin-top: auto;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const EditIconButton = styled(Button)`
  && {
    color: var(--color-text-tertiary, #999);
    &:hover {
      color: var(--color-text-base) !important;
      background: var(--color-bg-elevated, rgba(0,0,0,0.06)) !important;
    }
  }
`;

const PillTag = styled(Tag)`
  && {
    border-radius: 10px !important;
    margin: 0;
    padding: 0 8px;
  }
`;

const BadgeRow = styled.div`
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
`;

const PORT_COLORS = ["blue", "purple", "cyan", "orange", "geekblue", "magenta", "gold"];
const TYPE_COLORS: Record<string, string> = {
    stdio: "volcano",
    sse: "cyan",
    mcp: "geekblue",
    openapi: "gold",
    unknown: "default",
};

function getPortColor(port: number, ports: number[]): string { 
    const idx = ports.indexOf(port);
    return PORT_COLORS[idx % PORT_COLORS.length];
}

interface MCPTargetInfo {
    name: string;
    type: "stdio" | "sse" | "mcp" | "openapi" | "unknown";
    endpoint: string;
    statefulMode: "stateful" | "stateless" | undefined;
    port: number;
    bindNode: BindNode;
}

function deriveTypeAndEndpoint(target: Record<string, unknown>): {
    type: MCPTargetInfo["type"];
    endpoint: string;
} {
    if ("stdio" in target) {
        const stdio = target.stdio as Record<string, unknown>;
        return { type: "stdio", endpoint: String(stdio.cmd ?? "") };
    }
    if ("sse" in target) {
        const sse = target.sse as Record<string, unknown>;
        const hostPort = [sse.host, sse.port].filter(Boolean).join(":");
        const path = sse.path ? String(sse.path) : "";
        return { type: "sse", endpoint: hostPort + path };
    }
    if ("mcp" in target) {
        const mcp = target.mcp as Record<string, unknown>;
        const hostPort = [mcp.host, mcp.port].filter(Boolean).join(":");
        const path = mcp.path ? String(mcp.path) : "";
        return { type: "mcp", endpoint: hostPort + path };
    }
    if ("openapi" in target) {
        const openapi = target.openapi as Record<string, unknown>;
        const hostPort = [openapi.host, openapi.port].filter(Boolean).join(":");
        return { type: "openapi", endpoint: hostPort };
    }
    return { type: "unknown", endpoint: "" };
}

function extractMCPTargets(bindNodes: BindNode[]): MCPTargetInfo[] {
    const results: MCPTargetInfo[] = [];
    for (const bindNode of bindNodes) {
        for (const listenerNode of bindNode.listeners) {
            for (const routeNode of listenerNode.routes) {
                for (const backendNode of routeNode.backends) {
                    const raw = backendNode.backend as Record<string, unknown>;
                    if ("mcp" in raw) {
                        const mcp = raw.mcp as Record<string, unknown>;
                        const targets = Array.isArray(mcp.targets) ? mcp.targets : [];
                        const statefulMode = mcp.statefulMode as MCPTargetInfo["statefulMode"];
                        for (const target of targets) {
                            const t = target as Record<string, unknown>;
                            const { type, endpoint } = deriveTypeAndEndpoint(t);
                            results.push({
                                name: String(t.name ?? "unnamed"),
                                type,
                                endpoint,
                                statefulMode,
                                port: bindNode.bind.port,
                                bindNode,
                            });
                        }
                    }
                }
            }
        }
    }
    return results;
}

export function MCPOverviewPage() {
    const { modal } = App.useApp();
    const { mutate } = useConfig();
    const hierarchy = useTrafficHierarchy();
    const navigate = useNavigate();
    const location = useLocation();
    const [editingPort, setEditingPort] = useState<number | null>(null);
    const [editPortValue, setEditPortValue] = useState<number | null>(null);
    const [isSavingPort, setIsSavingPort] = useState(false);

    const handlePortEditStart = (port: number) => {
        setEditingPort(port);
        setEditPortValue(port);
    };

    const handlePortEditCancel = () => {
        setEditingPort(null);
        setEditPortValue(null);
    };

    const handlePortEditSave = async (oldPort: number) => {
        if (editPortValue === null) return;
        setIsSavingPort(true);
        try {
            const config = await fetchConfig();
            const bind = (config.binds ?? []).find((b) => b.port === oldPort);
            if (bind) bind.port = editPortValue;
            await updateConfig(config);
            setEditingPort(null);
            setEditPortValue(null);
        } catch (err: any) {
            toast.error(err.message ?? "Failed to update port");
        } finally {
            setIsSavingPort(false);
        }
    };

    const handleDeleteServer = async (t: MCPTargetInfo) => {
        try {
            const config = await fetchConfig();
            for (const bind of config.binds ?? []) {
                if (bind.port !== t.port) continue;
                for (const listener of bind.listeners ?? []) {
                    for (const route of listener.routes ?? []) {
                        route.backends = (route.backends ?? []).filter((b: any) => {
                            if (!b || !("mcp" in b)) return true;
                            b.mcp.targets = (b.mcp.targets ?? []).filter((tgt: any) => tgt.name !== t.name);
                            return (b.mcp.targets?.length ?? 0) > 0;
                        });
                    }
                    listener.routes = (listener.routes ?? []).filter(
                        (r: any) => (r.backends?.length ?? 0) > 0
                    );
                }
                bind.listeners = (bind.listeners ?? []).filter(
                    (l: any) => (l.routes?.length ?? 0) > 0
                );
            }
            config.binds = (config.binds ?? []).filter(
                (b: any) => (b.listeners?.length ?? 0) > 0
            );
            await updateConfig(config);
            await mutate();
            if (targets.length === 1) {
                navigate("/mcp-setup-wizard", { replace: true });
            }
        } catch (err: any) {
            toast.error(err.message ?? "Failed to delete server");
        }
    };

    const targets = extractMCPTargets(hierarchy.binds);
    const ports = [...new Set(targets.map((t) => t.port))];

    const hasMCPBackends = useMemo(
        () =>
            hierarchy.binds.some((bind) =>
                bind.listeners.some((listener) =>
                    listener.routes.some((route) =>
                        route.backends.some((b) => "mcp" in (b.backend as Record<string, unknown>))
                    )
                )
            ),
        [hierarchy.binds]
    );

    useEffect(() => {
        const skipRedirect = (location.state as { skipWizardRedirect?: boolean } | null)?.skipWizardRedirect;
        if (!hierarchy.isLoading && !hierarchy.error && !hasMCPBackends && !skipRedirect) {
            navigate("/mcp-setup-wizard", { replace: true });
        }
    }, [hierarchy.isLoading, hierarchy.error, hasMCPBackends, navigate, location.state]);

    return (
        <PageRoot>
            <PageHeader>
                <div>
                    <PageTitle>MCP Configuration</PageTitle>
                    {ports.length > 0 && (
                        <PortRow>
                            agentgateway exposed port{ports.length > 1 ? "s" : ""}:{" "}
                            {ports.map((p) => (
                                <span key={p} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                                    {editingPort === p ? (
                                        <>
                                            <InputNumber
                                                size="small"
                                                min={1}
                                                max={65535}
                                                precision={0}
                                                value={editPortValue}
                                                onChange={(v) => setEditPortValue(v)}
                                                style={{ width: 90 }}
                                                autoFocus
                                                onPressEnter={() => handlePortEditSave(p)}
                                            />
                                            <Button
                                                type="text"
                                                size="small"
                                                icon={<Check size={13} color="var(--color-success)" strokeWidth={4} />}
                                                loading={isSavingPort}
                                                onClick={() => handlePortEditSave(p)}
                                            />
                                            <Button
                                                type="text"
                                                size="small"
                                                icon={<X size={13} color="var(--color-error)" strokeWidth={4} />}
                                                onClick={handlePortEditCancel}
                                                disabled={isSavingPort}
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <PortValue>
                                                <PillTag color={getPortColor(p, ports)}>{p}</PillTag>
                                            </PortValue>
                                            <Tooltip title="Edit">
                                                <EditIconButton
                                                    type="text"
                                                    size="small"
                                                    icon={<Edit2 size={15} />}
                                                    onClick={() => handlePortEditStart(p)}
                                                />
                                            </Tooltip>
                                        </>
                                    )}
                                </span>
                            ))}
                        </PortRow>
                    )}
                </div>
                <Button
                    type="primary"
                    onClick={() => navigate("/mcp-setup-wizard")}
                >
                    Add MCP Server
                </Button>
            </PageHeader>

            <ServersSection>
                <SectionTitle>MCP Servers</SectionTitle>
                <ServerGridScroll>
                    <ServerGrid>
                        {targets.map((t, i) => (
                            <ServerCard key={i}>
                                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                                    <ServerName>{t.name}</ServerName>
                                    <PillTag color={getPortColor(t.port, ports)}>:{t.port}</PillTag>
                                    <Dropdown
                                      menu={{
                                        items: [
                                          {
                                            key: "delete",
                                            label: <span style={{ color: "#ff4d4f" }}>Delete</span>,
                                            onClick: () => modal.confirm({
                                              title: "Delete MCP Server",
                                              content: `Are you sure you want to delete "${t.name}"?`,
                                              okText: "Delete",
                                              okButtonProps: { danger: true },
                                              onOk: () => handleDeleteServer(t),
                                            }),
                                          },
                                        ],
                                      }}
                                      trigger={["click"]}
                                    >
                                      <EllipsisVertical size={15} style={{ cursor: "pointer" }} />
                                    </Dropdown>
                                </div>
                                <BadgeRow>
                                    <PillTag color={TYPE_COLORS[t.type]}>{t.type}</PillTag>
                                    <PillTag color={t.statefulMode === "stateful" ? "green" : "default"}>
                                        {t.statefulMode ?? "stateless"}
                                    </PillTag>
                                </BadgeRow>
                                {t.endpoint && <ServerMeta>Server Endpoint: <b>{t.endpoint}</b></ServerMeta>}
                                <CardActions>
                                    <Button 
                                        size="small"
                                        onClick={() => navigate(`/mcp-playground?label=${t.name}`)}
                                    >
                                        Open Playground
                                    </Button>
                                    <Button
                                        size="small"
                                        onClick={() => navigate("/traffic-configuration/editor")}
                                    >
                                        Raw Editor
                                    </Button>
                                </CardActions>
                            </ServerCard>
                        ))}
                    </ServerGrid>
                </ServerGridScroll>
            </ServersSection>
        </PageRoot>
    );
}