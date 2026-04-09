/**
 * LLM metrics
 */
export const mockTokenUsageByModelData = [
    {
      label: "gpt-4",
      value: 300,
      color: '#9554d8',
      tooltipData: [
        {
          title: "Model",
          rows: [
            { value: "gpt-4" },
          ],
        },
        {
          title: "Token Usage",
          rows: [
            { label: "Input Tokens", value: 100 },
            { label: "Output Tokens", value: 200 },
            { label: "Total Tokens", value: 300 },
          ],
        },
        {
          title: "Request Count",
          rows: [
            { value: 50 },
          ],
        },
      ],
    },
    {
      label: 'gpt-3.5-turbo',
      value: 400,
      color: '#5434C7',
      tooltipData: [
        {
          title: "Model",
          rows: [
            { value: "gpt-3.5-turbo" },
          ],
        },
        {
          title: "Token Usage",
          rows: [
            { label: "Input Tokens", value: 150 },
            { label: "Output Tokens", value: 250 },
            { label: "Total Tokens", value: 400 },
          ],
        },
        {
          title: "Request Count",
          rows: [
            { value: 100 },
          ],
        },
      ],
    },
  ];
  
  export const mockRequestThroughputLabels = ['2026-03-31', '2026-04-01', '2026-04-02', '2026-04-03', '2026-04-04', '2026-04-05', '2026-04-06']; 
  export const mockRequestThroughputDataset = [
    {
      label: 'Request Throughput',
      data: [0, 0, 150, 250, 0, 350, 400],
      borderColor: '#9554d8',
    },
  ];
  
  export const legacyData = { 
    labels: ["p50", "p75", "p90", "p95", "p99"],
    datasets: [{
      label: "Latency (ms)",
      data: [12, 18, 35, 52, 120],
      backgroundColor: "#9554d8",
    }],
  };
  
  export const mockPerModelLatencyLabels = ['gpt-4', 'gpt-3.5-turbo'];
  export const mockPerModelLatencyDatasets = [
    { label: 'p50', data: [18, 12], backgroundColor: '#9554d8' },
    { label: 'p90', data: [45, 28], backgroundColor: '#5434C7' },
    { label: 'p99', data: [130, 75], backgroundColor: '#3a238a' },
  ];
  
  export const mockPerModelThroughputLabels = ['2026-03-31', '2026-04-01', '2026-04-02', '2026-04-03', '2026-04-04', '2026-04-05', '2026-04-06'];
  export const mockPerModelThroughputDatasets = [
    { label: 'gpt-4', data: [0, 0, 80, 120, 0, 200, 210], borderColor: '#9554d8' },
    { label: 'gpt-3.5-turbo', data: [0, 0, 70, 130, 0, 150, 190], borderColor: '#5434C7' },
  ];
  
  export const errorRateData = {
    labels: ["12:00", "12:05", "12:10", "12:15", "12:20"],
    datasets: [
        { label: "gpt-4", data: [0.02, 0.05, 0.03, 0.08, 0.04], borderColor: "#9554d8" },
        { label: "gpt-3.5-turbo", data: [0.01, 0.01, 0.02, 0.01, 0.03], borderColor: "#5434C7" },
    ]
  };

/**
 * MCP metrics
 */
export const mockToolCallCountsData = [
  { label: "fetch", value: 350, color: '#9554d8', tooltipData: [{ title: "Call Count", rows: [{ value: 350}]}] },
  { label: "get_weather", value: 280, color: '#5434C7', tooltipData: [{ title: "Call Count", rows: [{ value: 280}]}] },
  { label: "execute_command", value: 195, color: '#3a238a', tooltipData: [{ title: "Call Count", rows: [{ value: 195}]}]  },
  { label: "get_stock_price", value: 142, color: '#7c3aed', tooltipData: [{ title: "Call Count", rows: [{ value: 142}]}] },
];
  