import styled from "@emotion/styled";
import { Card } from "antd";
import { CircleSlash, Send, TriangleAlert } from "lucide-react";
import { HorizontalBarChart } from "../../components/Charts/HorizontalBarChart";

/**
 * Styling
 */
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
`;

const StatisticsRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: var(--spacing-lg);
  width: 100%;
`;
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
  }
];

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

    <StatisticsRow>
      <StatisticCard>
        <StyledIcon>
          <TriangleAlert size={28} />
        </StyledIcon>
        <StatisticContent>
          <StatisticCardTitle>Global Error Rate</StatisticCardTitle>
          <StatisticCardValue>10%</StatisticCardValue>
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
    </StatisticsRow>

    <div>
      <HorizontalBarChart 
        data={mockTokenUsageByModelData}
        title="Token Usage By Model"
      />
    </div>

    <div>
      Request Throughput (TODO)
    </div>
    <div>
      Latency Percentiles (TODO)
    </div>
    <div>
      Error Rates (TODO)
    </div>
    <div>
      Per-Model Analytics (TODO)
    </div>

  </Container>
);
