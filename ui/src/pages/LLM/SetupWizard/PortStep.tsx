import styled from "@emotion/styled";
import { Button, Form, InputNumber } from "antd";
import { useLLMWizard } from "./LLMWizardContext";

const StepTitle = styled.h2`
    font-size: 20px;
    font-weight: 600;
    color: var(--color-text-base);
    margin: 0 0 var(--spacing-md) 0;
`;

const StepDescription = styled.p`
    color: var(--color-text-secondary);
    font-size: 14px;
    margin: 0 0 var(--spacing-xl) 0;
`;

const StyledInputNumber = styled(InputNumber)`
  width: 100%;
  border: 1px solid #d9d9d9 !important;

  &:hover,
  &:focus-within {
    border-color: transparent !important;
  }
`;

const Actions = styled.div`
    display: flex;
    justify-content: flex-end;
    margin-top: var(--spacing-xl);
`;

export function PortStep() { 
    const { data, setPort, nextStep } = useLLMWizard();
    const [form] = Form.useForm();

    const DEFAULT_PORT = 8621;

    const handleNext = async () => { 
        try { 
            const values = await form.validateFields();
            setPort(values.port);
            nextStep();
        } catch { 
            // validation failed, antd shows inline errors
        }
    };

    return (
        <div>
            <StepTitle>Where do you want agentgateway to listen on?</StepTitle>
            <StepDescription>
                Set the local port where agentgateway will listen for traffic.
            </StepDescription>

            <Form form={form} layout="vertical" initialValues={{ port: data.port ?? DEFAULT_PORT }}>
                <Form.Item
                    name="port"
                    label="Port"
                    rules={[
                        { required: true, message: "Port is required" },
                        { type: "number", min: 1, max: 65535, message: "Port must be between 1 and 65535" }
                    ]}
                >
                    <StyledInputNumber
                        placeholder="e.g. 8080"
                        min={1}
                        max={65535}
                        precision={0}
                    />
                </Form.Item>

                <Actions>
                    <Button type="primary" onClick={handleNext}>
                        Next
                    </Button>
                </Actions>
            </Form>
        </div>
    );
}