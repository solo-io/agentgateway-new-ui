import styled from "@emotion/styled";
import { Alert, Button, Input, Spin, Tooltip, Typography } from "antd";
import { Check, CheckCircle, Copy } from "lucide-react";
import { useCallback, useState } from "react";
import { useLLMWizard } from "./LLMWizardContext";

const { Link } = Typography;

const StepTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-base);
  margin: 0 0 var(--spacing-sm) 0;
`;

const StepDescription = styled.p`
  color: var(--color-text-secondary);
  font-size: 14px;
  margin: 0 0 var(--spacing-xl) 0;
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

const StepNumber = styled.div`
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--ant-color-primary, #6941c6);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
`;

const StepContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  font-size: 14px;
  color: var(--color-text-base);
  line-height: 1.6;
`;

const TerminalBlock = styled.code`
  display: inline-block;
  background: #8B8B8B;
  color: #FFFFFF;
  border-radius: var(--border-radius-sm);
  padding: 4px 10px;
  font-family: monospace;
  font-size: 13px;
`;

const CommandWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-top: 2px;
`;

const CopyButton = styled.button`
  flex-shrink: 0;
  background: none;
  border: none;
  cursor: pointer;
  color: #888;
  padding: 2px 4px;
  border-radius: var(--border-radius-sm);
  display: flex;
  align-items: center;

  &:hover {
    color: #d4d4d4;
    background: rgba(255, 255, 255, 0.1);
  }
`;

function CopyableCommand({ children }: { children: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [children]);

  return (
    <CommandWrapper>
      <TerminalBlock>{children}</TerminalBlock>
      <Tooltip title={copied ? "Copied!" : "Copy"}>
        <CopyButton onClick={handleCopy}>
          {copied ? <Check size={14} color="#52c41a" /> : <Copy size={14} />}
        </CopyButton>
      </Tooltip>
    </CommandWrapper>
  );
}

const VerifyRow = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
`;

const SuccessText = styled.span`
  color: var(--color-success, #52c41a);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 14px;
  font-weight: 500;
`;

const Actions = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: var(--spacing-xl);
`;

const StyledInput = styled(Input)`
  width: 100%;
  border: 1px solid #d9d9d9 !important;
`;

function OllamaWalkthrough() {
  const { data, setWalkthroughVerified, updateModelFields } = useLLMWizard();
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    setIsVerifying(true);
    setWalkthroughVerified(false, null);

    try {
      const res = await fetch(`http://${data.modelFields.hostOverride}/api/version`);
      if (res.ok) {
        setWalkthroughVerified(true, null);
      } else {
        setWalkthroughVerified(false, `Ollama responded with status ${res.status}`);
      }
    } catch {
      setWalkthroughVerified(false, "Could not reach Ollama at localhost:11434. Is it running?");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <>
      <StepList>
        <StepRow>
          <StepNumber>1</StepNumber>
          <StepContent>
            <span>Pull a model from the <Link href="https://ollama.com/search" target="_blank" rel="noopener noreferrer">Ollama registry</Link></span>
            <StyledInput 
              value={data.modelFields.model}
              onChange={(e) => updateModelFields({ model: e.target.value })} 
              placeholder="e.g. smallthinker"
            />
            <CopyableCommand>{`ollama pull ${data.modelFields.model}`}</CopyableCommand>
          </StepContent>
        </StepRow>

        <StepRow>
          <StepNumber>2</StepNumber>
          <StepContent>
            Start the server
            <CopyableCommand>ollama serve</CopyableCommand>
          </StepContent>
        </StepRow>

        <StepRow>
          <StepNumber>3</StepNumber>
          <StepContent>
            Set the Ollama target host
            <StyledInput 
              value={data.modelFields.hostOverride} 
              onChange={(e) => updateModelFields({ hostOverride: e.target.value })} 
              placeholder="e.g. localhost:11434"
            />
          </StepContent>
        </StepRow>
      </StepList>

      <VerifyRow>
        <Button type="primary" ghost onClick={handleVerify} disabled={isVerifying}>
          {isVerifying ? <Spin size="small" /> : "Verify Ollama Connection"}
        </Button>
        {data.setupVerified && (
          <SuccessText>
            <CheckCircle size={16} /> Ollama detected
          </SuccessText>
        )}
      </VerifyRow>

      {data.setupVerifyError && (
        <Alert
          type="error"
          message={data.setupVerifyError}
          style={{ marginBottom: "var(--spacing-lg)" }}
        />
      )}
    </>
  );
}

const WALKTHROUGH_CONTENT: Record<string, React.ReactNode> = {
  ollama: <OllamaWalkthrough />,
};

export function SetupStep() {
  const { data, nextStep, previousStep } = useLLMWizard();
  const { selectedWalkthrough, setupVerified: walkthroughVerified } = data;

  const content = selectedWalkthrough
    ? WALKTHROUGH_CONTENT[selectedWalkthrough] ?? (
        <Typography.Text type="secondary">
          No walkthrough available for "{selectedWalkthrough}".
        </Typography.Text>
      )
    : null;

  return (
    <div>
      <StepTitle>Set your model provider</StepTitle>
      <StepDescription>
        Follow the steps below, then verify the connection before continuing.
      </StepDescription>

      {content}

      <Actions>
        <Button onClick={previousStep}>Back</Button>
        <Button type="primary" disabled={!walkthroughVerified} onClick={nextStep}>
          Next
        </Button>
      </Actions>
    </div>
  );
}
