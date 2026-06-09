import styled from "@emotion/styled";
import { App, Button, Dropdown, InputNumber, Tag, Tooltip } from "antd";
import { Check, Edit2, EllipsisVertical, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { useConfig } from "../../api";
import { fetchConfig, updateConfig } from "../../api/config";

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

const TYPE_COLORS: Record<string, string> = {
    stdio: "volcano",
    sse: "cyan",
    mcp: "geekblue",
    openapi: "gold",
    unknown: "default",
};

interface MCPTargetInfo {
    name: string;
    type: "stdio" | "sse" | "mcp" | "openapi" | "unknown";
    endpoint: string;
    statefulMode: "stateful" | "stateless" | undefined;
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

function extractMCPTargets(rawTargets: Record<string, unknown>[], statefulMode: MCPTargetInfo["statefulMode"]): MCPTargetInfo[] {
    return rawTargets.map((t) => {
        const { type, endpoint } = deriveTypeAndEndpoint(t);
        return {
            name: String(t.name ?? "unnamed"),
            type,
            endpoint,
            statefulMode,
        };
    });
}

export function MCPOverviewPage() {
    const { modal } = App.useApp();
    const { data: config, isLoading: configLoading, mutate } = useConfig();
    const navigate = useNavigate();
    const location = useLocation();
    const [editingPort, setEditingPort] = useState(false);
    const [editPortValue, setEditPortValue] = useState<number | null>(null);
    const [isSavingPort, setIsSavingPort] = useState(false);
    const [isSavingStatefulMode, setIsSavingStatefulMode] = useState(false);

    const mcpPort = config?.mcp?.port ?? null;
    const rawTargets = (config?.mcp?.targets ?? []) as Record<string, unknown>[];
    const statefulMode = config?.mcp?.statefulMode as MCPTargetInfo["statefulMode"];
    const targets = extractMCPTargets(rawTargets, statefulMode);
    const hasMCPTargets = targets.length > 0;

    const handlePortEditStart = () => {
        setEditingPort(true);
        setEditPortValue(mcpPort);
    };

    const handlePortEditCancel = () => {
        setEditingPort(false);
        setEditPortValue(null);
    };

    const handlePortEditSave = async () => {
        if (editPortValue === null) return;
        setIsSavingPort(true);
        try {
            const cfg = await fetchConfig();
            if (cfg.mcp) cfg.mcp.port = editPortValue;
            await updateConfig(cfg);
            await mutate();
            setEditingPort(false);
            setEditPortValue(null);
        } catch (err: any) {
            toast.error(err.message ?? "Failed to update port");
        } finally {
            setIsSavingPort(false);
        }
    };

    const handleStatefulModeChange = async (mode: "stateful" | "stateless") => {
        setIsSavingStatefulMode(true);
        try {
            const cfg = await fetchConfig();
            if (cfg.mcp) cfg.mcp.statefulMode = mode;
            await updateConfig(cfg);
            await mutate();
        } catch (err: any) {
            toast.error(err.message ?? "Failed to update stateful mode");
        } finally {
            setIsSavingStatefulMode(false);
        }
    };

    const handleDeleteServer = async (t: MCPTargetInfo) => {
        try {
            const cfg = await fetchConfig();
            if (cfg.mcp) {
                const remaining = (cfg.mcp.targets ?? []).filter((tgt: any) => tgt.name !== t.name);
                if (remaining.length === 0) {
                    cfg.mcp = null;
                } else {
                    cfg.mcp.targets = remaining;
                }
            }
            await updateConfig(cfg);
            await mutate();
            if (targets.length === 1) {
                navigate("/mcp-setup-wizard", { replace: true });
            }
        } catch (err: any) {
            toast.error(err.message ?? "Failed to delete server");
        }
    };

    useEffect(() => {
        const skipRedirect = (location.state as { skipWizardRedirect?: boolean } | null)?.skipWizardRedirect;
        if (!configLoading && !hasMCPTargets && !skipRedirect) {
            navigate("/mcp-setup-wizard", { replace: true });
        }
    }, [configLoading, hasMCPTargets, navigate, location.state]);

    return (
        <PageRoot>
            <PageHeader>
                <div>
                    <PageTitle>MCP Configuration</PageTitle>
                    {mcpPort !== null && (
                        <PortRow>
                            agentgateway exposed port:{" "}
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                                {editingPort ? (
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
                                            onPressEnter={handlePortEditSave}
                                        />
                                        <Button
                                            type="text"
                                            size="small"
                                            icon={<Check size={13} color="var(--color-success)" strokeWidth={4} />}
                                            loading={isSavingPort}
                                            onClick={handlePortEditSave}
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
                                            <PillTag color="blue">{mcpPort}</PillTag>
                                        </PortValue>
                                        <Tooltip title="Edit">
                                            <EditIconButton
                                                type="text"
                                                size="small"
                                                icon={<Edit2 size={15} />}
                                                onClick={handlePortEditStart}
                                            />
                                        </Tooltip>
                                    </>
                                )}
                            </span>
                        </PortRow>
                    )}
                    {config?.mcp && (
                        <PortRow style={{ marginTop: 4 }}>
                            stateful mode:{" "}
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                                <Dropdown
                                    trigger={["click"]}
                                    menu={{
                                        items: [
                                            { key: "stateful", label: "stateful" },
                                            { key: "stateless", label: "stateless" },
                                        ],
                                        selectedKeys: [statefulMode ?? "stateful"],
                                        onClick: ({ key }) => handleStatefulModeChange(key as "stateful" | "stateless"),
                                    }}
                                >
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
                                        <PillTag color={statefulMode === "stateless" ? "default" : "green"}>
                                            {statefulMode ?? "stateful"}
                                        </PillTag>
                                        <EditIconButton
                                            type="text"
                                            size="small"
                                            icon={<Edit2 size={15} />}
                                        />
                                    </span>
                                </Dropdown>
                            </span>
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