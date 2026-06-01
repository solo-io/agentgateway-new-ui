import styled from "@emotion/styled";
import { Button, Drawer } from "antd";
import { Edit2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { LocalConfig } from "../../api/types";
import { useTrafficHierarchy } from "../../components/TrafficHierarchy";
import type { BindNode } from "../../components/TrafficHierarchy/hooks/useTrafficHierarchy";
import { ConfigEditor } from "../ConfigEditor/ConfigEditor";

// Styles
const PageRoot = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px);
  overflow-y: auto;
  padding: var(--spacing-xl);
  gap: var(--spacing-xl);
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
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

const ModelGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-lg);
`;

const ModelCard = styled.div`
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
  background: var(--color-bg-container);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const ModelName = styled.div`
  font-weight: 600;
  font-size: 15px;
  color: var(--color-text-base);
`;

const ModelMeta = styled.div`
  font-size: 13px;
  color: var(--color-text-secondary);
`;

const CardActions = styled.div`
  display: flex;
  gap: var(--spacing-sm);
  margin-top: auto;
`;

// Types
interface AIModelInfo {
    name: string;
    providerKey: string;
    model: string;
    hostOverride: string | null;
    port: number;
    bindNode: BindNode;
}

// Helpers


function extractAIModels(bindNodes: BindNode[]): AIModelInfo[] {
    const results: AIModelInfo[] = [];
    for (const bindNode of bindNodes) {
      for (const listenerNode of bindNode.listeners) {
        for (const routeNode of listenerNode.routes) {
          for (const backendNode of routeNode.backends) {
            const raw = backendNode.backend as Record<string, unknown>;
            if ("ai" in raw) {
              const ai = raw.ai as Record<string, unknown>;
              const provider = ai.provider as Record<string, unknown> | undefined;
              const providerKey = provider ? Object.keys(provider)[0] : "unknown";
              const providerVal = provider?.[providerKey] as Record<string, unknown> | undefined;
              results.push({
                name: (ai.name as string) ?? "unnamed",
                providerKey,
                model: (providerVal?.model as string) ?? "",
                hostOverride: (ai.hostOverride as string) ?? null,
                port: bindNode.bind.port,
                bindNode,
              });
            }
          }
        }
      }
    }
    return results;
  }
  
  function makeConfigFilter(port: number) {
    return {
      extract: (config: LocalConfig) => {
        const bind = (config.binds ?? []).find((b) => b.port === port);
        return bind ?? {};
      },
      merge: (full: LocalConfig, edited: unknown) => {
        const binds = (full.binds ?? []).map((b) =>
          b.port === port ? (edited as typeof b) : b
        );
        return { ...full, binds };
      },
    };
  }

// Main Component
export function LLMOverviewPage() { 
    const hierarchy = useTrafficHierarchy();
    const navigate = useNavigate();
    const [drawerModel, setDrawerModel] = useState<AIModelInfo | null>(null);

    const models = extractAIModels(hierarchy.binds);

    // Group ports for display, show unique ports that have AI backends
    const ports = [...new Set(models.map((m) => m.port))];

    const hasAIBackends = useMemo(
        () =>
          hierarchy.binds.some((bind) =>
            bind.listeners.some((listener) =>
              listener.routes.some((route) =>
                route.backends.some((b) => "ai" in (b.backend as Record<string, unknown>))
              )
            )
          ),
        [hierarchy.binds],
      );
      
    
    useEffect(() => {
        if (!hierarchy.isLoading && !hierarchy.error && !hasAIBackends) { 
            navigate("/llm-setup-wizard", { replace: true })
        }
    }, [hierarchy.isLoading, hierarchy.error, hasAIBackends, navigate]);

    return (
        <PageRoot>
            <PageHeader>
                <div>
                    <PageTitle>LLM Overview</PageTitle>
                    {ports.length > 0 && (
                        <PortRow>
                        Gateway port{ports.length > 1 ? "s" : ""}:{" "}
                        {ports.map((p) => (
                            <span key={p}>
                            <PortValue>{p}</PortValue>
                            <Button
                                type="text"
                                size="small"
                                icon={<Edit2 size={13} />}
                                onClick={() => navigate(`/llm-configuration`)}
                            />
                            </span>
                        ))}
                        </PortRow>
                    )}
                </div>
                <Button
                    type="primary"
                    onClick={() => navigate("/llm-setup")}
                >
                    Add Model
                </Button>
            </PageHeader>

            <div>
                <SectionTitle>Models</SectionTitle>
                <ModelGrid>
                    {models.map((m, i) => (
                        <ModelCard key={i}>
                            <ModelName>{m.name}</ModelName>
                            <ModelMeta>{m.providerKey} / {m.model}</ModelMeta>
                            {m.hostOverride && (
                                <ModelMeta>Host: {m.hostOverride}</ModelMeta>
                            )}
                            <CardActions>
                                <Button
                                    size="small"
                                    onClick={() => navigate("/llm-playground")}
                                >
                                    Open Playground
                                </Button>
                                <Button
                                    size="small"
                                    onClick={() => setDrawerModel(m)}
                                >
                                    View Config
                                </Button>
                            </CardActions>
                        </ModelCard>
                    ))}
                </ModelGrid>
            </div>

            <Drawer
                title={drawerModel ? `Config - ${drawerModel.name}` : "Config"}
                open={drawerModel !== null}
                onClose={() => setDrawerModel(null)}
                width={720}
                destroyOnHidden
            >
                {drawerModel && (
                    <ConfigEditor 
                        onClose={() => setDrawerModel(null)}
                        configFilter={makeConfigFilter(drawerModel.port)}
                    />
                )}
            </Drawer>
        </PageRoot>
    );
}