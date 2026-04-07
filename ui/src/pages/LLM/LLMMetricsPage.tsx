import styled from "@emotion/styled";
import { Card } from "antd";
import { CircleSlash, Send, TriangleAlert } from "lucide-react";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
`;

const PageTitle = styled.h1`
  margin: 0;
  font-size: 24px;
  font-weight: 600;
`;

const MetricsRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: var(--spacing-lg);
`;

const StatisticCard = styled(Card)`
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
  margin-left: auto;
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
 * Metrics:
 * - Token usage
 * - Request throughput
 * - Latency percentiles
 * - Error rates
 * - Per-model analytics
 */

export const LLMMetricsPage = () => (
  <Container>
    <PageTitle>LLM Metrics</PageTitle>

    <MetricsRow>
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
    </MetricsRow>

    <div>
      Token Usage By Model (TODO)
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


    {/* <EmptyStateCard>
      <EmptyIcon>
        <BarChart3 size={28} />
      </EmptyIcon>
      <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 600 }}>
        LLM Performance Metrics
      </h3>
      <p
        style={{
          margin: "0 0 24px",
          color: "var(--color-text-secondary)",
          maxWidth: 400,
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        Token usage, request throughput, latency percentiles, error rates, and
        per-model analytics will be displayed here.
      </p>
      <Tag bordered={false} color="processing" style={{ padding: "4px 12px", fontSize: 13 }}>
        Coming soon
      </Tag>
    </EmptyStateCard> */}
  </Container>
);
