import styled from "@emotion/styled";
import { Card, ConfigProvider, Steps } from "antd";
import { InstallStep } from "./InstallStep";
import { LLMWizardProvider, useLLMWizard } from "./LLMWizardContext";
import { ModelConfigStep } from "./ModelConfigStep";
import { PortStep } from "./PortStep";
import { SelectModelStep } from "./SelectModelStep";
import { SetupStep } from "./SetupStep";

const PageRoot = styled.div`
  display: flex;
  flex-direction: column;
  height: calc()(100vh - 64px);
  overflow: hidden;
`;

const PageHeader = styled.div`
    padding: var(--spacing-lg) var(--spacing-xl);
    border-bottom: 1px solid var(--color-border);
    background: var(--color-bg-layout);
`;

const PageTitle = styled.h1`
    margin: 0 0 var(--spacing-md) 0;
    font-size: 24px;
    font-weight: 600;
    color: var(--color-text-base);
`;

const StepBody = styled.div`
    flex: 1;
    overflow-y: auto;
    display: flex;
    justify-content: center;
    padding: var(--spacing-xl);  
`;


const STEP_LABELS = [
    { title: "Model Type" },
    { title: "Install" },
    { title: "Setup" },
    { title: "Configure" },
];

function LLMSetupWizardInner() {
    const { currentStep, stepIndex } = useLLMWizard();
    const isPreStep = currentStep === "port";

    const stepComponent = {
        port: <PortStep />,
        selectModel: <SelectModelStep />,
        install: <InstallStep />,
        setup: <SetupStep />,
        modelConfig: <ModelConfigStep />,
    }[currentStep];

    return (
        <PageRoot>
            <PageHeader>
                <PageTitle>LLM Setup Wizard</PageTitle>
            </PageHeader>
            <StepBody>
                <Card style={{ width: "100%", maxWidth: 640 }}>
                    {!isPreStep && (
                        <ConfigProvider theme={{ token: { colorPrimary: "#6941c6" } }}>
                            <Steps
                                current={stepIndex - 1}
                                items={STEP_LABELS}
                                labelPlacement="vertical"
                                size="small"
                                style={{ marginBottom: "var(--spacing-xl)" }}
                            />
                        </ConfigProvider>
                    )}
                    {stepComponent}
                </Card>
            </StepBody>
        </PageRoot>
    );
}

export function LLMSetupWizardPage() { 
    return (
        <LLMWizardProvider>
            <LLMSetupWizardInner />
        </LLMWizardProvider>
    );
}