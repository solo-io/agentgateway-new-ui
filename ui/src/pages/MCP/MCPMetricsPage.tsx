import styled from "@emotion/styled";
import { Card } from "antd";
import { mockToolCallCountsData } from "../../api/mockMetrics";
import { HorizontalBarChart } from "../../components/Charts/HorizontalBarChart";
import { TimePickerSection } from "../../components/TimePickerSection/TimePickerSection";

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

const EmptyStateCard = styled(Card)`
  text-align: center;
  .ant-card-body {
    padding: 64px 32px;
  }
`;

const EmptyIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: var(--color-bg-hover);
  color: var(--color-text-tertiary);
  margin: 0 auto 16px;
`;

/**
 * Tool call counts
 * Latency distributions
 * Error rates
 * Per-target analytics
 */
export const MCPMetricsPage = () => (
  <Container>
    <TimePickerSection />
    <HorizontalBarChart 
      data={mockToolCallCountsData}
      title="Tool Call Counts"
    />
  </Container>
);
