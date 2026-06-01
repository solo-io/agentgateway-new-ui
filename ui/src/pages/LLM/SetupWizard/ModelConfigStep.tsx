import styled from "@emotion/styled";
import { Button, Form, Input, Spin, Tooltip, Typography } from "antd";
import { Check, CheckCircle, Copy } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { createListener, createRoute } from "../../../api/crud";
import type { AIProvider, LocalRouteBackend } from "../../../config";
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

const FieldDescription = styled.p`
  color: var(--color-text-secondary);
  font-size: 12px;
  margin: 0 0 var(--spacing-xs) 0;
`;

const StyledInput = styled(Input)`
  width: 100%;
  border: 1px solid #d9d9d9 !important;
`;

const TerminalBlock = styled.code`
  display: inline-block;
  background: #8b8b8b;
  color: #ffffff;
  border-radius: var(--border-radius-sm);
  padding: 4px 10px;
  font-family: monospace;
  font-size: 13px;
`;

const CommandWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-xs);
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

const CommandStepList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  margin-top: var(--spacing-xs);
`;

const CommandStepRow = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  background: var(--color-bg-elevated, #fafafa);
  border: 1px solid var(--color-border);
  border-left: 3px solid var(--ant-color-primary, #6941c6);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-sm) var(--spacing-md);
`;

const CommandStepNumber = styled.div`
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--ant-color-primary, #6941c6);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
`;

const VerifyRow = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
  margin-bottom: var(--spacing-sm);
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

const LISTENER_NAME = "llm-listener";
const ROUTE_NAME = "llm-route";
const DEFAULT_MODEL_ALIAS = "my-ollama-smallthinker";
const DEFAULT_HOST = "localhost:11434";
const DEFAULT_MODEL = "smallthinker";

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

export function ModelConfigStep() {
  const { data, updateModelFields, setWalkthroughVerified, previousStep } = useLLMWizard();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const modelValue = Form.useWatch("model", form) ?? data.modelFields.model ?? DEFAULT_MODEL;
  const hostValue = Form.useWatch("hostOverride", form) ?? data.modelFields.hostOverride ?? DEFAULT_HOST;

  useEffect(() => {
    form.setFieldsValue({
      name: data.modelFields.name || DEFAULT_MODEL_ALIAS,
      model: data.modelFields.model || DEFAULT_MODEL,
      hostOverride: data.modelFields.hostOverride || DEFAULT_HOST,
    });
  }, []);

  const handleVerify = async () => {
    setIsVerifying(true);
    setWalkthroughVerified(false, null);

    try {
      const res = await fetch(`http://${hostValue}/api/version`);
      if (res.ok) {
        setWalkthroughVerified(true, null);
      } else {
        const msg = `Ollama responded with status ${res.status}`;
        setWalkthroughVerified(false, msg);
        toast.error(msg);
      }
    } catch {
      const msg = `Could not reach Ollama at ${hostValue}. Is it running?`;
      setWalkthroughVerified(false, msg);
      toast.error(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async () => {
    let values;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }

    setIsSubmitting(true);
    try {
      const { name, model, hostOverride } = values;
      await createListener(data.port!, {
        name: LISTENER_NAME,
        protocol: "HTTP",
      });

      const aiBackend: LocalRouteBackend = {
        ai: {
          name,
          provider: { openAI: { model } } as AIProvider,
          hostOverride,
        },
      };

      await createRoute(data.port!, LISTENER_NAME, {
        name: ROUTE_NAME,
        backends: [aiBackend],
        policies: {
          cors: {
            allowOrigins: ["*"],
            allowMethods: ["GET", "POST", "OPTIONS"],
            allowHeaders: ["*"],
          },
        },
      });

      toast.success("LLM configuration created");
      navigate(`/llm-configuration`);
    } catch (err: any) {
      toast.error(err.message ?? "Failed to create LLM configuration");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <StepTitle>Configure your model</StepTitle>
      <StepDescription>
        These settings will be used to connect agentgateway to your model.
      </StepDescription>

      <Form
        form={form}
        layout="vertical"
        onValuesChange={(changed) => {
          updateModelFields(changed);
          if (changed.hostOverride || changed.model) {
            setWalkthroughVerified(false, null);
          }
        }}
      >
        <Form.Item
          name="name"
          label="Model Alias"
          rules={[{ required: true, message: "Model Alias is required" }]}
        >
          <StyledInput placeholder="e.g. my-ollama-smallthinker" />
        </Form.Item>
        <FieldDescription>A name that can be used to refer to this particular model.</FieldDescription>

        <Form.Item
          name="model"
          label="Model Name"
          style={{ marginTop: "var(--spacing-md)" }}
          rules={[{ required: true, message: "Model Name is required" }]}
        >
          <StyledInput placeholder="e.g. smallthinker" />
        </Form.Item>
        <FieldDescription>
          <span>Browse available models on the <Link href="https://ollama.com/search" target="_blank" rel="noopener noreferrer">Ollama registry</Link> — copy the model name from the tag list and run:</span>
        </FieldDescription>
        <CommandStepList>
          <CommandStepRow>
            <CommandStepNumber>1</CommandStepNumber>
            <CopyableCommand>{`ollama pull ${modelValue || DEFAULT_MODEL}`}</CopyableCommand>
          </CommandStepRow>
          <CommandStepRow>
            <CommandStepNumber>2</CommandStepNumber>
            <CopyableCommand>ollama serve</CopyableCommand>
          </CommandStepRow>
        </CommandStepList>

        <Form.Item
          name="hostOverride"
          label="Ollama Host"
          style={{ marginTop: "var(--spacing-lg)" }}
          rules={[{ required: true, message: "Ollama host is required" }]}
        >
          <StyledInput placeholder="e.g. localhost:11434" />
        </Form.Item>
        <FieldDescription>Address where Ollama is serving (default: localhost:11434).</FieldDescription>

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

      </Form>

      <Actions>
        <Button onClick={previousStep}>Back</Button>
        <Button
          type="primary"
          onClick={handleSubmit}
          loading={isSubmitting}
          disabled={!data.setupVerified}
        >
          Create
        </Button>
      </Actions>
    </div>
  );
}
