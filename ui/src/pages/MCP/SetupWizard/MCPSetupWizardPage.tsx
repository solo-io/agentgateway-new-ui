import styled from "@emotion/styled";
import { Card, ConfigProvider, Steps } from "antd";
// import { InstallStep } from "./InstallStep";  // streamableHttp only
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useXdsMode } from "../../../api";
import { MCPWizardProvider, useMCPWizard } from "./MCPWizardContext";
import { SelectServerStep } from "./SelectServerStep";
import { ServerConfigStep } from "./ServerConfigStep";

const PageRoot = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const PageHeader = styled.div`
  padding: var(--spacing-lg) var(--spacing-xl);
  border-bottom: 1px solid var(--color-border);
  border: 1px solid var(--color-border-secondary);
  background: linear-gradient(to right, var(--color-bg-hover) 0%, var(--color-bg-container) 100%);
`;

const PageTitle = styled.h1`
  margin: 0 0 var(--spacing-md) 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-base);
  border-left: 3px solid #6941c6;
  padding-left: var(--spacing-sm);
`;

const StepBody = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  justify-content: center;
  padding: var(--spacing-xl);
`;

const STEP_LABELS = [
    { title: "Server" },
    // { title: "Install" },  // streamableHttp only
    { title: "Configure" },
];

function MCPSetupWizardInner() {
    const { currentStep, stepIndex } = useMCPWizard();

    const stepComponent = {
        selectServer: <SelectServerStep />,
        // install: <InstallStep />,  // streamableHttp only
        config: <ServerConfigStep />,
    }[currentStep];

    return (
        <PageRoot>
            <PageHeader>
                <PageTitle>MCP Setup Wizard</PageTitle>
            </PageHeader>
            <StepBody>
                <Card style={{ width: "100%", maxWidth: 640, "--color-border-secondary": "rgba(0, 0, 0, 0.3)", boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.3)" } as React.CSSProperties}>
                    <ConfigProvider theme={{ token: { colorPrimary: "#6941c6" } }}>
                        <Steps
                            current={stepIndex}
                            items={STEP_LABELS}
                            labelPlacement="vertical"
                            size="small"
                            style={{ marginBottom: "var(--spacing-xl)" }}
                        />
                    </ConfigProvider>
                    {stepComponent}
                </Card>
            </StepBody>
        </PageRoot>
    );
}

export function MCPSetupWizardPage() {
    const navigate = useNavigate();
    const { xdsMode } = useXdsMode();
    useEffect(() => { 
        if (xdsMode) { 
            navigate("/dashboard", { replace: true });
        }
    }, []);
    return (
        <MCPWizardProvider>
            <MCPSetupWizardInner />
        </MCPWizardProvider>
    );
}