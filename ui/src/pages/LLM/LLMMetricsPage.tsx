import styled from "@emotion/styled";
import { Card } from "antd";
import { CircleSlash, Send, TriangleAlert } from "lucide-react";
import { BarChart } from "../../components/Charts/BarChart";
import { HorizontalBarChart } from "../../components/Charts/HorizontalBarChart";
import { LineChart } from "../../components/Charts/LineChart";

/**
 * Styling
 */
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: var(--spacing-lg);
  width: 100%;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
`
const StatisticCard = styled(Card)`
  flex: 1;
  border-color: var(--color-border-secondary);
  
  .ant-card-body {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: var(--spacing-lg);
  }
`;

const StatisticContent = styled.div`
  display: flex;
  flex-direction: column;
  text-align: left;
`;

const StatisticCardTitle = styled.h3`
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  margin: 0;
`

const StatisticCardValue = styled.div`
  color: var(--color-text-base);
  font-size: 24px;
  font-weight: 600;
  margin: 0;
`;

const StyledIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  
  width: 50px;
  height: 50px;

  border-radius: 50%;
  box-shadow: 0px 1px 8px 0px rgba(255,255,255,0.2);
  background: var(--color-bg-spotlight);
  color: var(--color-text-base);
`;

/**
 * Mock data (TODO: reorganize this)
 */
const mockTokenUsageByModelData = [
  {
    label: "gpt-4",
    value: 100,
    color: '#9554d8',
    inputTokens: 100,
    outputTokens: 200,
    totalTokens: 300,
    requestCount: 50,
  },
  {
    label: 'gpt-3.5-turbo',
    value: 150,
    color: '#5434C7',
    inputTokens: 150,
    outputTokens: 250,
    totalTokens: 400,
    requestCount: 75,
  },
];

const mockRequestThroughputLabels = ['2026-03-31', '2026-04-01', '2026-04-02', '2026-04-03', '2026-04-04', '2026-04-05', '2026-04-06']; 
const mockRequestThroughputDataset = [
  {
    label: 'Request Throughput',
    data: [0, 0, 150, 250, 0, 350, 400],
    borderColor: '#9554d8',
  },
];

const legacyData = { 
  labels: ["p50", "p75", "p90", "p95", "p99"],
  datasets: [{
    label: "Latency (ms)",
    data: [12, 18, 35, 52, 120],
    backgroundColor: "#9554d8",
  }],
};

const mockPerModelLatencyLabels = ['gpt-4', 'gpt-3.5-turbo'];
const mockPerModelLatencyDatasets = [
  { label: 'p50', data: [18, 12], backgroundColor: '#9554d8' },
  { label: 'p90', data: [45, 28], backgroundColor: '#5434C7' },
  { label: 'p99', data: [130, 75], backgroundColor: '#3a238a' },
];

const mockPerModelThroughputLabels = ['2026-03-31', '2026-04-01', '2026-04-02', '2026-04-03', '2026-04-04', '2026-04-05', '2026-04-06'];
const mockPerModelThroughputDatasets = [
  { label: 'gpt-4', data: [0, 0, 80, 120, 0, 200, 210], borderColor: '#9554d8' },
  { label: 'gpt-3.5-turbo', data: [0, 0, 70, 130, 0, 150, 190], borderColor: '#5434C7' },
];

const errorRateData = {
  labels: ["12:00", "12:05", "12:10", "12:15", "12:20"],
  datasets: [
      { label: "gpt-4", data: [0.02, 0.05, 0.03, 0.08, 0.04], borderColor: "#9554d8" },
      { label: "gpt-3.5-turbo", data: [0.01, 0.01, 0.02, 0.01, 0.03], borderColor: "#5434C7" },
  ]
};

/**
 * Metrics:
 * - Token usage
 * - Request throughput
 * - Latency percentiles
 * - Error rates
 * - Per-model analytics
 */

/**
 * Component
 */
export const LLMMetricsPage = () => (
  <Container>

    <div>
      Filter and time range (TODO)
    </div>

    <Row>
      <StatisticCard>
        <StyledIcon>
          <TriangleAlert size={28} />
        </StyledIcon>
        <StatisticContent>
          <StatisticCardTitle>Global Error Rate</StatisticCardTitle>
          <StatisticCardValue>0%</StatisticCardValue>
        </StatisticContent>
      </StatisticCard>
      <StatisticCard>
        <StyledIcon>
          <Send size={28} />
        </StyledIcon>
        <StatisticContent>
          <StatisticCardTitle>Total Requests</StatisticCardTitle>
          <StatisticCardValue>7</StatisticCardValue>
        </StatisticContent>
      </StatisticCard>
      <StatisticCard>
        <StyledIcon>
          <CircleSlash size={28} />
        </StyledIcon>
        <StatisticContent>
          <StatisticCardTitle>Tokens Used</StatisticCardTitle>
          <StatisticCardValue>406</StatisticCardValue>
        </StatisticContent>
      </StatisticCard>
    </Row>

    
    <div>
      <HorizontalBarChart 
        data={mockTokenUsageByModelData}
        title="Token Usage By Model"
      />
    </div>

    <Row>
      <LineChart 
        title={"Request Throughput"}
        labels={mockRequestThroughputLabels}
        datasets={mockRequestThroughputDataset}
      />
      <LineChart 
        title={"Error Rates"}
        labels={errorRateData.labels}
        datasets={errorRateData.datasets}
      />
    </Row>

    <Row>
      <BarChart 
        title={"Latency Percentiles"}
        labels={legacyData.labels}
        datasets={legacyData.datasets}
      />
    </Row>

    <Title>Per-Model Analytics</Title>
    <Row>
      <BarChart
        title="Avg Latency by Model (ms)"
        labels={mockPerModelLatencyLabels}
        datasets={mockPerModelLatencyDatasets}
      />
      <LineChart
        title="Request Volume by Model"
        labels={mockPerModelThroughputLabels}
        datasets={mockPerModelThroughputDatasets}
      />
    </Row>

  </Container>
);
