import styled from "@emotion/styled";
import { Button, Tabs, Typography } from "antd";
import { Check, Copy, Download } from "lucide-react";
import { useCallback, useState } from "react";
import { useMCPWizard } from "./MCPWizardContext";

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

const StyledTabs = styled(Tabs)`
  .ant-tabs-tab {
    color: var(--color-text-secondary);
  }
  .ant-tabs-tab-active .ant-tabs-tab-btn {
    color: var(--color-text-base) !important;
  }
`;

const TabContentBorder = styled.div`
  border: 1px solid var(--color-border-base);
  border-radius: var(--border-radius-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  margin-top: -1px;
`;

const Actions = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: var(--spacing-xl);
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

function ServerEverythingInstall() {
    return (
        <StepList>
            <StepRow>
              <StepNumber>1</StepNumber>
              <StepContent>
                <span>Install npx for your operating system</span>
                <StyledTabs
                  type="card"
                  size="small"
                  defaultActiveKey="windows"
                  items={[
                    {
                      key: "windows",
                      label: "Windows",
                      children: (
                        <TabContentBorder>
                          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-xs)" }}>
                            <span>Download the Windows Installer directly from the offical <Link href="https://nodejs.org/en/download" target="_blank" rel="noopener noreferrer">Node.js website.</Link></span>
                            <span>Run the .msi file and follow the setup wizard defaults.</span>
                          </div>
                        </TabContentBorder>
                      )
                    },
                    {
                      key: "macos",
                      label: "MacOS",
                      children: <CopyableCommand>brew install node</CopyableCommand>
                    },
                    {
                      key: "linux",
                      label: "Linux",
                      children: <CopyableCommand>sudo apt update && sudo apt install nodejs npm -y</CopyableCommand>,
                    },
                  ]}
                />
              </StepContent>
            </StepRow>
            <StepRow>
              <StepNumber>2</StepNumber>
              <StepContent>
                <div>
                  Re-open your terminal and verify the npx install
                  <CopyableCommand>npx --version</CopyableCommand>
                </div>
              </StepContent>
            </StepRow>
            <StepRow>
                <StepNumber>3</StepNumber>
                <StepContent>
                    <span>
                        Run{" "}
                        <Link
                            href="https://www.npmjs.com/package/@modelcontextprotocol/server-everything"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            @modelcontextprotocol/server-everything
                        </Link>
                        {" "} using
                    </span>
                    <CopyableCommand>npx -y @modelcontextprotocol/server-everything streamableHttp</CopyableCommand>
                </StepContent>
            </StepRow>
        </StepList>
    );
}

const PROVIDER_CONTENT: Record<string, React.ReactNode> = {
    "server-everything": <ServerEverythingInstall />,
};

export function InstallStep() {
    const { data, nextStep, previousStep } = useMCPWizard();
    const content = PROVIDER_CONTENT[data.selectedServer ?? ""] ?? null;

    return (
        <div>
            <StepTitle>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Download size={20} />
                Install MCP server
              </div>
            </StepTitle>
            {content}
            <Actions>
                <Button onClick={previousStep}>Back</Button>
                <Button type="primary" onClick={nextStep}>Next</Button>
            </Actions>
        </div>
    );
}