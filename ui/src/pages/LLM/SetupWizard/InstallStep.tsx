import styled from "@emotion/styled";
import { Button, Typography } from "antd";
import { Download } from "lucide-react";
import { useLLMWizard } from "./LLMWizardContext";

const { Link } = Typography;

const StepTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-base);
  margin: 0 0 var(--spacing-sm) 0;
`;

const StepList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin: 0 0 var(--spacing-xl) 0;
`;

const StepRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  background: var(--color-bg-elevated, #fafafa);
  border: 1px solid var(--color-border);
  border-left: 3px solid var(--ant-color-primary, #6941c6);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md) var(--spacing-lg);
`;

const StepContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  font-size: 14px;
  color: var(--color-text-base);
  line-height: 1.6;
`;

const Actions = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: var(--spacing-xl);
`;

function OllamaInstall() {
  return (
    // TODO: replace this with direct install script for macOS/Linux/Windows platforms?
    <>
      <StepList>
        <StepRow>
          <StepContent>
            <span>Download and install Ollama from <Link href="https://ollama.com/download" target="_blank" rel="noopener noreferrer">ollama.com/download</Link></span>
          </StepContent>
        </StepRow>
      </StepList>
    </>
  );
}

const WALKTHROUGH_CONTENT: Record<string, React.ReactNode> = {
  ollama: <OllamaInstall />,
};

export function InstallStep() {
  const { data, nextStep, previousStep } = useLLMWizard();
  const { selectedWalkthrough } = data;

  const content = selectedWalkthrough
    ? WALKTHROUGH_CONTENT[selectedWalkthrough] ?? (
        <Typography.Text type="secondary">
          No walkthrough available for "{selectedWalkthrough}".
        </Typography.Text>
      )
    : null;

  return (
    <div>
      <StepTitle>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} >
          <Download size={20} />
          Install Ollama
        </div>
      </StepTitle>

      {content}

      <Actions>
        <Button onClick={previousStep}>Back</Button>
        <Button type="primary" onClick={nextStep}>
          Next
        </Button>
      </Actions>
    </div>
  );
}
