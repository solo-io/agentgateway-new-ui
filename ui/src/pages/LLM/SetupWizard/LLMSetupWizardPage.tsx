import styled from "@emotion/styled";
import { Steps } from "antd";
import { LLMWizardProvider, useLLMWizard } from "./LLMWizardContext";
import { ModelConfigStep } from "./ModelConfigStep";
import { PortStep } from "./PortStep";
import { SelectModelStep } from "./SelectModelStep";
import { WalkthroughStep } from "./WalkthroughStep";

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

const StepContent = styled.div`
    width: 100%;
    max-width: 640px;
`;

const STEP_LABELS = [
    { title: "Port" },
    { title: "Model Type" },
    { title: "Setup" },
    { title: "Configure" },
];

function LLMSetupWizardInner() { 
    const { currentStep, stepIndex } = useLLMWizard();

    const stepComponent = { 
        port: <PortStep />,
        selectModel: <SelectModelStep />,
        walkthrough: <WalkthroughStep />,
        modelConfig: <ModelConfigStep />,
    }[currentStep];

    return (
        <PageRoot>
            <PageHeader>
                <PageTitle>LLM Setup</PageTitle>
                <Steps
                    current={stepIndex}
                    items={STEP_LABELS}
                    size="small"
                />
            </PageHeader>
            <StepBody>
                <StepContent>
                    {stepComponent}
                </StepContent>
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