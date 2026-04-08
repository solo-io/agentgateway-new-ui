import styled from "@emotion/styled";
import { Button, Segmented, Tooltip } from "antd";
import { Clock, RefreshCw } from "lucide-react";
import { useState } from "react";
import { CustomTimePickerDropdown } from "./CustomTimePickerDropdown";

const timeOptions = ['1m', '5m', '15m', '30m', '1h', '6h', '24h', '7d', '30d'];

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
`;

const CustomButtonWrapper = styled.div`
  position: relative;
`;

export const TimePickerSection = () => {
  const [activeTab, setActiveTab] = useState<string>('30d');
  const [isCustomActive, setIsCustomActive] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [customStart, setCustomStart] = useState<Date | undefined>();
  const [customEnd, setCustomEnd] = useState<Date | undefined>();

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setIsCustomActive(false);
  };

  return (
    <Container>
      <Controls>
        <Segmented
          options={timeOptions}
          value={isCustomActive ? 'custom' : activeTab}
          onChange={handleTabChange}
        />
        <CustomButtonWrapper>
          <Button
            icon={<Clock size={14} />}
            type={isCustomActive ? 'primary' : 'default'}
            onClick={() => setCustomOpen(prev => !prev)}
          >
            Custom
          </Button>
          <CustomTimePickerDropdown
            isOpen={customOpen}
            savedStart={customStart}
            savedEnd={customEnd}
            onClose={() => setCustomOpen(false)}
            onApply={(start, end) => {
              setCustomStart(start);
              setCustomEnd(end);
              setIsCustomActive(true);
              setCustomOpen(false);
            }}
          />
        </CustomButtonWrapper>
      </Controls>
      <Tooltip title="Refresh Data" placement="left">
        <Button icon={<RefreshCw size={14} />} shape="circle" />
      </Tooltip>
    </Container>
  );
};
