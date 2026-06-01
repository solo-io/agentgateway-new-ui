import styled from "@emotion/styled";
import { Button, Form, Input } from "antd";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { createListener, createRoute } from "../../../api/crud";
import type { AIProvider, LocalRouteBackend } from "../../../config";
import { useLLMWizard } from "./LLMWizardContext";

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

const Actions = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: var(--spacing-xl);
`;

const StyledInput = styled(Input)`
  width: 100%;
  border: 1px solid #d9d9d9 !important;
`;

const LISTENER_NAME = "llm-listener";
const ROUTE_NAME = "llm-route";

const PROVIDER_OPTIONS = [
  { label: "OpenAI", value: "openAI" },
];

export function ModelConfigStep() { 
    const { data, updateModelFields, previousStep } = useLLMWizard();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const DEFAULT_MODEL_ALIAS = "my-ollama-smallthinker";

    useEffect(() => {
        form.setFieldValue("name", data.modelFields.name || DEFAULT_MODEL_ALIAS);
    }, []);

    const handleSubmit = async () => { 
        let values;
        try {
            values = await form.validateFields();
        } catch { 
            return;
        }

        setIsSubmitting(true);
        try { 
            const { name, provider, model, hostOverride } = values;
            await createListener(data.port!, { 
                name: LISTENER_NAME,
                protocol: "HTTP",
            });

            const aiBackend: LocalRouteBackend = { 
                ai: { 
                    name,
                    provider: { [provider]: { model }} as AIProvider,
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
                These settings will be used to connect your gateway to the model.
            </StepDescription>

            <Form
                form={form}
                layout="vertical"
                initialValues={{ name: data.modelFields.name || DEFAULT_MODEL_ALIAS }}
                onValuesChange={(changed) => updateModelFields(changed)}
            >
                <Form.Item
                    name="name"
                    label="Model Alias"
                    rules={[{ required: true, message: "Model Alias is required"}]}
                >
                    <StyledInput placeholder="e.g. my-ollama-model" />
                </Form.Item>

                {/* <Form.Item
                    name="model"
                    label="Model Name"
                    rules={[{ required: true, message: "Model Name is required" }]}
                >
                    <Input placeholder="e.g. smallthinker" />
                </Form.Item>

                <Form.Item
                    name="hostOverride"
                    label="Host Override"
                    rules={[{ required: true, message: "Host Override is required"}]}
                >
                    <Input placeholder="e.g. localhost:11434" />
                </Form.Item> */}
            </Form>

            <Actions>
                <Button onClick={previousStep}>Back</Button>
                <Button type="primary" onClick={handleSubmit} loading={isSubmitting}>
                    Create
                </Button>
            </Actions>
        </div>
    );
}