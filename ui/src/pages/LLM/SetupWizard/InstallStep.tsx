import styled from "@emotion/styled";
import { Button, Tabs, Typography } from "antd";
import { Check, Copy, Download } from "lucide-react";
import { useCallback, useState } from "react";
import { LinuxLogo, MacLogo, WindowsLogo } from "../../../assets/logos";
import { detectPlatform } from "../../../utils/platform";
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

const StyledTabs = styled(Tabs)`
  display: flex;
  align-items: center;
  .ant-tabs-tab {
    color: var(--color-text-secondary);
    width: 100px !important;
    justify-content: center;
    background-color: transparent !important;
    border-bottom: none !important;
    padding: 5px 0 !important;
  }
  .ant-tabs-tab-active .ant-tabs-tab-btn {
    color: var(--color-text-base) !important;
  }
  .ant-tabs-tab-active { 
    background-color: #f0f0f0 !important;
  }
`;

const TerminalBlock = styled.code`
  display: inline-block;
  background: #8b8b8b;
  color: #ffffff;
  border-radius: var(--border-radius-sm);
  border: none;
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
    background: rgba(0, 0, 0, 0.06);
  }
`;

const Actions = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: var(--spacing-xl);
`;

const TabContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
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
          <CopyButton onClick={handleCopy}>
              {copied ? <Check size={14} color="#52c41a" /> : <Copy size={14} />}
          </CopyButton>
      </CommandWrapper>
  );
}

function OllamaInstall() {
  const platform = detectPlatform();

  return (
    <>
      <StepList>
        <StepRow>
          <StepContent>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              <StyledTabs
                  type="card"
                  size="small"
                  defaultActiveKey={platform}
                  items={[
                    {
                      key: "macos",
                      label: (
                        <TabContainer>
                          <MacLogo />
                          macOS
                        </TabContainer>
                      ),
                      children: <CopyableCommand>curl -fsSL https://ollama.com/install.sh | sh</CopyableCommand>
                    },
                    {
                      key: "linux",
                      label: (
                        <TabContainer>
                          <LinuxLogo />
                          Linux
                        </TabContainer>
                      ),
                      children: <CopyableCommand>curl -fsSL https://ollama.com/install.sh | sh</CopyableCommand>,
                    },
                    {
                      key: "windows",
                      label: (
                        <TabContainer>
                          <WindowsLogo />
                          Windows
                        </TabContainer>
                      ),
                      children: <CopyableCommand>irm https://ollama.com/install.ps1 | iex</CopyableCommand>,
                    },
                  ]}
                />
              <span>Or, download and install Ollama from the offical <Link href="https://ollama.com/download" target="_blank" rel="noopener noreferrer">ollama.com/download</Link> website.</span>
            </div>
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
