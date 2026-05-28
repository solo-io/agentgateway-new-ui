import type { RJSFSchema, UiSchema } from "@rjsf/utils";
import type { LocalLLMConfig } from "../../../config";

export const schema: RJSFSchema = {
  type: "object",
  additionalProperties: true,
  properties: {
    models: {
      type: "array",
      title: "Models",
      minItems: 1,
      description: "Add at least one model to route requests through.",
      items: {
        type: "object",
        required: ["name", "provider"],
        additionalProperties: true,
        properties: {
          provider: {
            type: "string",
            title: "Provider",
            enum: ["openAI", "gemini", "vertex", "anthropic", "bedrock", "azure"],
            default: "openAI",
          },
          name: {
            type: "string",
            title: "Model Name",
            description: "The model name your clients will request (e.g. gpt-4, claude-3-opus).",
          },
          params: {
            type: "object",
            title: "Credentials",
            additionalProperties: true,
            properties: {
              apiKey: {
                type: "string",
                title: "API Key",
              },
              model: {
                type: "string",
                title: "Provider Model Name",
                description: "Override the model name sent to the provider if different from above.",
              },
              hostOverride: {
                type: "string",
                title: "Host Override",
                description: "Override the upstream host for this provider.",
              },
              pathOverride: {
                type: "string",
                title: "Path Override",
                description: "Override the upstream path for this provider.",
              },
            },
          },
        },
      },
    },
    port: {
      type: "number",
      title: "Gateway Port (optional)",
    },
  },
};

export const uiSchema: UiSchema = {
  "ui:title": "",
  "ui:order": ["models", "port"],
  models: {
    items: {
      "ui:order": ["provider", "name", "params", "*"],
      provider: {
        "ui:widget": "select",
      },
      name: {
        "ui:placeholder": "gpt-4",
      },
      params: {
        "ui:title": "Credentials",
        apiKey: {
          "ui:widget": "password",
          "ui:placeholder": "sk-...",
        },
        model: {
          "ui:placeholder": "gpt-4-turbo",
        },
        hostOverride: {
          "ui:placeholder": "localhost:11434",
        },
        pathOverride: {
          "ui:placeholder": "/v1",
        },
      },
    },
  },
  port: {
    "ui:placeholder": "e.g. 3000",
    "ui:help": "The port Agentgateway will listen on for OpenAI-compatible requests (e.g. /v1/chat/completions). Point your AI clients to http://localhost:<port>. Leave empty to use the main gateway port.",
  },
};

export const defaultValues: Partial<LocalLLMConfig> = {
  models: [],
};

/**
 * Type guard to validate data matches LocalLLMConfig
 */
export function isLocalLLMConfig(data: unknown): data is LocalLLMConfig {
  return (
    typeof data === "object" &&
    data !== null
  );
}

/**
 * Transform function - no transformation needed
 */
export function transformBeforeSubmit(data: unknown): unknown {
  return data;
}
