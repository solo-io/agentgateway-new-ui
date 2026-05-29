import styled from "@emotion/styled";
import { Alert, Button, Space, Spin, Typography } from "antd";
import { CheckCircle } from "lucide-react";
import { useState } from "react";
import { useLLMWizard } from "./LLMWizardContext";

const { Text, Link } = Typography;

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

const Instructions = styled.ol`
  padding-left: var(--spacing-lg);
  color: var(--color-text-base);
  font-size: 14px;
  line-height: 2;
  margin: 0 0 var(--spacing-xl) 0;
`;

const CodeBlock = styled.code`
  display: inline-block;
  background: var(--color-bg-code, #f5f5f5);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  padding: 2px 8px;
  font-family: monospace;
  font-size: 13px;
`;

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
`;

const Actions = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: var(--spacing-xl);
`;

// Ollama-specific content

function OllamaWalkthrough() { 
    const { data, setWalkthroughVerified } = useLLMWizard();
    const [isVerifying, setIsVerifying] = useState(false);

    const handleVerify = async () => { 
        setIsVerifying(true);
        setWalkthroughVerified(false, null);

        try {
            const res = await fetch("http://localhost:11434/api/version");
            if (res.ok) { 
                setWalkthroughVerified(true, null);
            } else { 
                setWalkthroughVerified(false, `Ollama responded with status ${res.status}`);
            }
        } catch { 
            setWalkthroughVerified(false, "Could not reach Ollama at localhost:11434.  Is it running?");
        } finally { 
            setIsVerifying(false);
        }
    };

    return (
        <>
            <Instructions>
                <li>
                    Install Ollama from{" "}
                    <Link href="https://ollama.com/download" target="_blank" rel="noopener noreferrer">
                        ollama.com
                    </Link>
                </li>
                <li>
                    Pull a model: <CodeBlock>ollama pull smallthinker</CodeBlock>
                </li>
                <li>
                    Start the server: <CodeBlock>ollama serve</CodeBlock>
                </li>
            </Instructions>

            <VerifyRow>
                <Button onClick={handleVerify} disabled={isVerifying}>
                    {isVerifying ? <Spin size="small" /> : "Verify Ollama is Running"}
                </Button>
                {data.walkthroughVerified && (
                    <SuccessText>
                        <CheckCircle size={16} /> Ollama detected
                    </SuccessText>
                )}
            </VerifyRow>

            {data.walkthroughVerifyError && (
                <Alert 
                    type="error"
                    message={data.walkthroughVerifyError}
                    style={{ marginBottom: "var(--spacing-lg)"}}
                />
            )}
        </>
    );
}

// Walkthrough shell

const WALKTHROUGH_CONTENT: Record<string, React.ReactNode> = { 
    ollama: <OllamaWalkthrough />,
};

export function WalkthroughStep() { 
    const { data, nextStep, previousStep } = useLLMWizard();
    const { selectedWalkthrough, walkthroughVerified } = data;

    const content = selectedWalkthrough 
        ? WALKTHROUGH_CONTENT[selectedWalkthrough] ?? (
            <Text type="secondary">No walkthrough available for "${selectedWalkthrough}".</Text>
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