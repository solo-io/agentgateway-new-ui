import styled from "@emotion/styled";
import { Button, Form, Input, InputNumber, Spin } from "antd";
import { CheckCircle, Cog } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { mutate } from "swr";
import { fetchConfig, updateConfig } from "../../../api/config";
import { findBindByPort } from "../../../api/helpers";
import type { LocalBind } from "../../../api/types";
import type { LocalRouteBackend } from "../../../config";
import { useMCPWizard } from "./MCPWizardContext";

const StepTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-base);
  margin: 0 0 var(--spacing-sm) 0;
`;

const StyledInput = styled(Input)`
  width: 100%;
  border: 1px solid #d9d9d9 !important;
`;

const StyledInputNumber = styled(InputNumber)`
  width: 100%;
  border: 1px solid #d9d9d9 !important;
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

const FieldFormItem = styled(Form.Item)`
  .ant-form-item-label > label {
    align-items: baseline;
  }
`;

const FieldFormTitle = styled.div`
  font-weight: 600;
`

const FieldFormDescription = styled.div`
  color: var(--color-text-tertiary);
  font-size: 12px;
  font-style: italic;
  margin: 0 0 var(--spacing-xs) 0;
`;

const LISTENER_NAME = "mcp-listener";
const ROUTE_NAME = "mcp-route";
const DEFAULT_NAME = "server-everything";
const DEFAULT_HOST = "localhost";
const DEFAULT_PORT = 3001;
const DEFAULT_PATH = "/mcp";

export function ServerConfigStep() {
    const { data, updateServerFields, setVerified, previousStep } = useMCPWizard();
    const [isVerifying, setIsVerifying] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const hostValue = Form.useWatch("host", form) ?? DEFAULT_HOST;
    const portValue = Form.useWatch("port", form) ?? DEFAULT_PORT;
    const pathValue = Form.useWatch("path", form) ?? DEFAULT_PATH;

    const handleVerify = async () => {
        setIsVerifying(true);
        setVerified(false);
        try {
            await fetch(`http://${hostValue}:${portValue}${pathValue}`, { mode: "no-cors" });
            setVerified(true);
        } catch {
            toast.error(`Could not reach MCP server at ${hostValue}:${portValue}. Is it running?`);
            setVerified(false);
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
            const { name, host, port, path } = values;

            const mcpBackend: LocalRouteBackend = {
                mcp: {
                    targets: [{
                        name,
                        mcp: { host, port, path },
                    }],
                    statefulMode: "stateful",
                },
            };

            const listener = {
                name: LISTENER_NAME,
                protocol: "HTTP" as const,
                routes: [{
                    name: ROUTE_NAME,
                    backends: [mcpBackend],
                    policies: {
                        cors: {
                            allowOrigins: ["*"],
                            allowMethods: ["GET", "POST", "OPTIONS", "DELETE"],
                            allowHeaders: ["*"],
                        },
                    },
                }],
            };

            const config = await fetchConfig();
            let bind = findBindByPort(config.binds || [], data.port!);
            if (!bind) {
                const newBind: LocalBind = { port: data.port!, listeners: [listener] };
                if (!config.binds) config.binds = [];
                config.binds.push(newBind);
            } else {
                if (!bind.listeners) bind.listeners = [];
                bind.listeners.push(listener);
            }
            await updateConfig(config);
            await mutate("/config");

            toast.success("MCP configuration created");
            navigate("/mcp-configuration");
        } catch (err: any) {
            toast.error(err.message ?? "Failed to create MCP configuration");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <StepTitle>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Cog size={20} />
                    Configure your MCP server
                </div>
            </StepTitle>

            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    name: data.serverFields.name || DEFAULT_NAME,
                    host: data.serverFields.host || DEFAULT_HOST,
                    port: data.serverFields.port || DEFAULT_PORT,
                    path: data.serverFields.path || DEFAULT_PATH,
                }}
                onValuesChange={(changed) => {
                    updateServerFields(changed);
                    if (changed.host || changed.port || changed.path) {
                        setVerified(false);
                    }
                }}
            >
                <FieldFormItem
                    name="name"
                    label={
                        <div>
                            <FieldFormTitle>Server Alias</FieldFormTitle>
                            <FieldFormDescription>A name used to identify this MCP server.</FieldFormDescription>
                        </div>
                    }
                    rules={[{ required: true, message: "Server alias is required" }]}
                >
                    <StyledInput placeholder="e.g. server-everything" />
                </FieldFormItem>

                <FieldFormItem
                    name="host"
                    label={
                        <div>
                            <FieldFormTitle>Host</FieldFormTitle>
                            <FieldFormDescription>Address where MCP server is listening (default: localhost).</FieldFormDescription>
                        </div>
                    }
                    style={{ marginTop: "var(--spacing-md)" }}
                    rules={[{ required: true, message: "Host is required" }]}
                >
                    <StyledInput placeholder="e.g. localhost" />
                </FieldFormItem>

                <FieldFormItem
                    name="port"
                    label={
                        <div>
                            <FieldFormTitle>Port</FieldFormTitle>
                            <FieldFormDescription>Port where MCP server is listening (default: 3001).</FieldFormDescription>
                        </div>
                    }
                    style={{ marginTop: "var(--spacing-md)" }}
                    rules={[{ required: true, message: "Port is required" }]}
                >
                    <StyledInputNumber min={1} max={65535} precision={0} placeholder="e.g. 3001" />
                </FieldFormItem>

                <FieldFormItem
                    name="path"
                    label={
                        <div>
                            <FieldFormTitle>Path</FieldFormTitle>
                            <FieldFormDescription>Endpoint path for MCP server (default: /mcp).</FieldFormDescription>
                        </div>
                    }
                    style={{ marginTop: "var(--spacing-md)" }}
                    rules={[{ required: true, message: "Path is required" }]}
                >
                    <StyledInput placeholder="e.g. /mcp" />
                </FieldFormItem>

                <VerifyRow>
                    <Button type="primary" ghost onClick={handleVerify} disabled={isVerifying}>
                        {isVerifying ? <Spin size="small" /> : "Verify Connection"}
                    </Button>
                    {data.setupVerified && (
                        <SuccessText>
                            <CheckCircle size={16} /> MCP server detected
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