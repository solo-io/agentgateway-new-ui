import styled from "@emotion/styled";
import { Button, Form, Input } from "antd";
// import { InputNumber, Spin } from "antd";  // streamableHttp only
import { Cog } from "lucide-react";
// import { CheckCircle } from "lucide-react";  // streamableHttp only
import { useEffect, useState } from "react";
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

// streamableHttp only
// const StyledInputNumber = styled(InputNumber)`
//   width: 100%;
//   border: 1px solid #d9d9d9 !important;
// `;

// streamableHttp only
// const VerifyRow = styled.div`
//   display: flex;
//   align-items: center;
//   gap: var(--spacing-md);
//   margin-top: var(--spacing-lg);
//   margin-bottom: var(--spacing-sm);
// `;

// streamableHttp only
// const SuccessText = styled.span`
//   color: var(--color-success, #52c41a);
//   display: flex;
//   align-items: center;
//   gap: var(--spacing-xs);
//   font-size: 14px;
//   font-weight: 500;
// `;

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
const DEFAULT_ARGS = "-y @modelcontextprotocol/server-everything";
// const DEFAULT_HOST = "localhost";  // streamableHttp only
// const DEFAULT_PORT = 3001;         // streamableHttp only
// const DEFAULT_PATH = "/mcp";       // streamableHttp only

export function ServerConfigStep() {
    const { data, updateServerFields, previousStep } = useMCPWizard();
    // const [isVerifying, setIsVerifying] = useState(false);  // streamableHttp only
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [nameError, setNameError] = useState(true);
    const [form] = Form.useForm();
    const navigate = useNavigate();

    useEffect(() => {
        form.validateFields(["name"]).then(() => setNameError(false)).catch(() => setNameError(true));
    }, [form]);

    // streamableHttp only
    // const hostValue = Form.useWatch("host", form) ?? DEFAULT_HOST;
    // const portValue = Form.useWatch("port", form) ?? DEFAULT_PORT;
    // const pathValue = Form.useWatch("path", form) ?? DEFAULT_PATH;

    // streamableHttp only
    // const handleVerify = async () => {
    //     setIsVerifying(true);
    //     setVerified(false);
    //     try {
    //         await fetch(`http://${hostValue}:${portValue}${pathValue}`, { mode: "no-cors" });
    //         setVerified(true);
    //     } catch {
    //         toast.error(`Could not reach MCP server at ${hostValue}:${portValue}. Is it running?`);
    //         setVerified(false);
    //     } finally {
    //         setIsVerifying(false);
    //     }
    // };

    const handleSubmit = async () => {
        let values;
        try {
            values = await form.validateFields();
        } catch {
            return;
        }

        setIsSubmitting(true);
        try {
            const { name, args } = values;

            const mcpBackend: LocalRouteBackend = {
                mcp: {
                    targets: [{
                        name,
                        stdio: {
                            cmd: "npx",
                            args: [args],
                        },
                        // streamableHttp only:
                        // mcp: { host, port, path },
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
                    args: data.serverFields.args || DEFAULT_ARGS,
                    // streamableHttp only:
                    // host: data.serverFields.host || DEFAULT_HOST,
                    // port: data.serverFields.port || DEFAULT_PORT,
                    // path: data.serverFields.path || DEFAULT_PATH,
                }}
                onValuesChange={(changed) => {
                    updateServerFields(changed);
                    if (changed.name !== undefined) {
                        form.validateFields(["name"]).then(() => setNameError(false)).catch(() => setNameError(true));
                    }
                    // streamableHttp only:
                    // if (changed.host || changed.port || changed.path) { setVerified(false); }
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
                    validateTrigger="onBlur"
                    rules={[
                        { required: true, message: "Server alias is required" },
                        {
                            validator: async (_, value) => {
                                if (!value) return;
                                const config = await fetchConfig();
                                const taken = config.binds?.some((b: any) =>
                                    b.listeners?.some((l: any) =>
                                        l.routes?.some((r: any) =>
                                            r.backends?.some((bk: any) =>
                                                bk.mcp?.targets?.some((t: any) => t.name === value)
                                            )
                                        )
                                    )
                                );
                                if (taken) return Promise.reject("Server alias is already in use");
                            },
                        },
                    ]}
                >
                    <StyledInput placeholder="e.g. server-everything" />
                </FieldFormItem>

                <FieldFormItem
                    name="args"
                    label={
                        <div>
                            <FieldFormTitle>npx Arguments</FieldFormTitle>
                            <FieldFormDescription>Arguments passed to npx to start the MCP server.</FieldFormDescription>
                        </div>
                    }
                    style={{ marginTop: "var(--spacing-md)" }}
                    rules={[{ required: true, message: "npx arguments are required" }]}
                >
                    <StyledInput placeholder="e.g. -y @modelcontextprotocol/server-everything" />
                </FieldFormItem>

                {/* streamableHttp only — uncomment to re-enable host/port/path fields and verify */}
                {/* <FieldFormItem name="host" ...><StyledInput /></FieldFormItem> */}
                {/* <FieldFormItem name="port" ...><StyledInputNumber /></FieldFormItem> */}
                {/* <FieldFormItem name="path" ...><StyledInput /></FieldFormItem> */}
                {/* <VerifyRow>
                    <Button type="primary" ghost onClick={handleVerify} disabled={isVerifying}>
                        {isVerifying ? <Spin size="small" /> : "Verify Connection"}
                    </Button>
                    {data.setupVerified && (
                        <SuccessText><CheckCircle size={16} /> MCP server detected</SuccessText>
                    )}
                </VerifyRow> */}
            </Form>

            <Actions>
                <Button onClick={previousStep}>Back</Button>
                <Button
                    type="primary"
                    onClick={handleSubmit}
                    loading={isSubmitting}
                    disabled={nameError}
                >
                    Create
                </Button>
            </Actions>
        </div>
    );
}
