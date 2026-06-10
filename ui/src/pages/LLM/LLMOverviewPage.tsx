import { DeleteOutlined } from "@ant-design/icons";
import styled from "@emotion/styled";
import { App, Button, Dropdown, Empty, InputNumber, Tag, Tooltip } from "antd";
import { Check, Edit2, EllipsisVertical, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { useConfig } from "../../api";
import { fetchConfig, updateConfig } from "../../api/config";
import { deleteLLM, removeLLMModelByIndex } from "../../api/crud";
import { useLLMConfig, useXdsMode } from "../../api/hooks";
import { PROVIDER_COLORS } from "./Playground/constants";
import { extractModels } from "./Playground/extractModels";
import type { PlaygroundModel } from "./Playground/types";

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

const ModelsSection = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
`;

const ModelGridScroll = styled.div`
  max-height: calc(100vh - 260px);
  overflow-y: auto;
`;

const ModelGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-lg);
`;

const ModelCard = styled.div`
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
  background: var(--color-bg-container);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  border: 1px solid rgba(0, 0, 0, 0.3);
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

// Main Component
export function LLMOverviewPage() {
    const { modal } = App.useApp();
    const { data: fullConfig, mutate } = useConfig();
    const { data: llmConfig, isLoading, error } = useLLMConfig();
    const navigate = useNavigate();
    const location = useLocation();
    const { xdsMode } = useXdsMode();

    const [isEditingPort, setIsEditingPort] = useState(false);
    const [editPortValue, setEditPortValue] = useState<number | null>(null);
    const [isSavingPort, setIsSavingPort] = useState(false);

    const models: PlaygroundModel[] = xdsMode
        ? extractModels(fullConfig)
        : ((llmConfig as any)?.models ?? []).map((m: any) => ({
              label: m.name ?? "unnamed",
              defaultModel: m.params?.model ?? "",
              provider: m.provider ?? "unknown",
              baseUrl: `http://localhost:${(llmConfig as any)?.port ?? 3000}`,
          }));

    const port: number | null = (llmConfig as any)?.port ?? null;

    const handlePortEditStart = () => {
        setIsEditingPort(true);
        setEditPortValue(port);
    };

    const handlePortEditCancel = () => {
        setIsEditingPort(false);
        setEditPortValue(null);
    };

    const handlePortEditSave = async () => {
        if (editPortValue === null) return;
        setIsSavingPort(true);
        try {
            const config = await fetchConfig();
            if (config.llm) (config.llm as any).port = editPortValue;
            await updateConfig(config);
            await mutate();
            setIsEditingPort(false);
            setEditPortValue(null);
        } catch (err: any) {
            toast.error(err.message ?? "Failed to update port");
        } finally {
            setIsSavingPort(false);
        }
    };

    const handleDeleteModel = async (index: number) => {
        try {
            if (models.length === 1) {
                await deleteLLM();
            } else {
                await removeLLMModelByIndex(index);
            }
            await mutate();
            if (models.length === 1) {
                navigate("/llm-setup-wizard", { replace: true });
            }
        } catch (err: any) {
            toast.error(err.message ?? "Failed to delete model");
        }
    };

    useEffect(() => {
        const skipRedirect = (location.state as { skipWizardRedirect?: boolean } | null)?.skipWizardRedirect || xdsMode;
        if (!isLoading && !error && models.length === 0 && !skipRedirect) {
            navigate("/llm-setup-wizard", { replace: true });
        }
    }, [isLoading, error, models.length, navigate, location.state]);

    return (
        <PageRoot>
            <PageHeader>
                <div>
                    <PageTitle>LLM Configuration</PageTitle>
                    {port !== null && (
                        <PortRow>
                            agentgateway exposed port:{" "}
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                                {isEditingPort ? (
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
                                        <PortValue><PillTag color="blue">{port}</PillTag></PortValue>
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
                </div>
                {!xdsMode && (
                  <Button
                      type="primary"
                      onClick={() => navigate("/llm-setup-wizard")}
                  >
                      Add Model
                  </Button>
                )}
            </PageHeader>

            <ModelsSection>
                {models.length === 0 && (
                  <div style={{ textAlign: "center", padding: 60 }}>
                    <Empty description="No models configured. Add an LLM configuration to get started." />
                  </div>
                )}
                {models.length > 0 && (
                  <>
                    <SectionTitle>Models</SectionTitle>
                    <ModelGridScroll>
                        <ModelGrid>
                            {models.map((m, i) => (
                                <ModelCard key={i}>
                                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                                        <ModelName>{m.label}</ModelName>
                                        {!xdsMode && (
                                          <Dropdown
                                            menu={{
                                              items: [
                                                {
                                                  key: "delete",
                                                  label: "Delete",
                                                  icon: <DeleteOutlined />,
                                                  onClick: () => modal.confirm({
                                                    title: "Delete Model?",
                                                    content: <span>Are you sure you want to delete <b>{m.label}</b>?</span>,
                                                    okText: "Delete",
                                                    okButtonProps: { danger: true },
                                                    onOk: () => handleDeleteModel(i),
                                                  }),
                                                },
                                              ],
                                            }}
                                            trigger={["click"]}
                                          >
                                            <EllipsisVertical size={15} style={{ cursor: "pointer" }} />
                                          </Dropdown>
                                        )}
                                    </div>
                                    <ModelMeta>
                                      <PillTag color={PROVIDER_COLORS[m.provider]}>
                                        {m.provider}
                                      </PillTag>
                                      {" "}
                                      <PillTag color="gold">{m.defaultModel}</PillTag>
                                    </ModelMeta>
                                    <ModelMeta>Host: <b>{m.baseUrl}</b></ModelMeta>
                                    <CardActions>
                                        <Button
                                            size="small"
                                            onClick={() => navigate(`/llm-playground?modelName=${encodeURIComponent(xdsMode ? m.defaultModel : m.label)}`)}
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
                                </ModelCard>
                            ))}
                        </ModelGrid>
                    </ModelGridScroll>
                  </>
                )}
            </ModelsSection>
        </PageRoot>
    );
}