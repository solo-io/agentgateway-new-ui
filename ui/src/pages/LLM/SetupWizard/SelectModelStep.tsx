import styled from "@emotion/styled";
import { Button, Card } from "antd";
import { useNavigate } from "react-router-dom";
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

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-lg);
`;

const OptionCard = styled(Card)<{ $selected: boolean }>`
  cursor: pointer;
  box-shadow: ${({ $selected }) =>
    $selected ? "0 0 0 2px var(--color-primary)" : "none"};
  background: ${({ $selected }) =>
    $selected ? "var(--color-primary-bg)" : "inherit"};
  transition: box-shadow 0.2s, background 0.2s;

  &:hover {
    box-shadow: ${({ $selected }) =>
      $selected ? "0 0 0 2px var(--color-primary)" : "0 0 0 2px var(--color-primary-hover)"};
  }
`;

const CardLabel = styled.div<{ $selected: boolean }>`
  font-weight: 600;
  font-size: 15px;
  color: ${({ $selected }) =>
    $selected ? "var(--color-primary)" : "var(--color-text-base)"};
  margin-bottom: var(--spacing-xs);
`;

const CardSubtext = styled.div`
  font-size: 13px;
  color: var(--color-text-secondary);
`;

const Actions = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: var(--spacing-xl);
`;

const OPTIONS = [
  {
    id: "ollama",
    label: "Ollama",
    subtext: "Run models locally with Ollama",
  },
  {
    id: "manual",
    label: "Manual Configuration",
    subtext: "Set up your model manually",
  },
];

export function SelectModelStep() { 
    const { data, setSelectedWalkthrough, nextStep, previousStep } = useLLMWizard();
    const selected = data.selectedWalkthrough;

    const navigate = useNavigate();

    const handleSelect = (id: string) => {
        setSelectedWalkthrough(id);
    };

    const handleNext = () => { 
        if (!selected) return;

        if (selected === "manual") { 
            navigate("/traffic-configuration/editor");
            return;
        }
        
        if (selected) nextStep();
    };

    return (
        <div>
            <StepTitle>How do you want to set up your model?</StepTitle>
            <CardGrid>
                {OPTIONS.map(({ id, label, subtext }) => (
                    <OptionCard
                        key={id}
                        $selected={selected === id}
                        onClick={() => handleSelect(id)}
                    >
                        <CardLabel $selected={selected === id}>{label}</CardLabel>
                        <CardSubtext>{subtext}</CardSubtext>
                    </OptionCard>
                ))}
            </CardGrid>

            <Actions>
                <Button onClick={previousStep}>Back</Button>
                <Button type="primary" disabled={!selected} onClick={handleNext}>
                    Next
                </Button>
            </Actions>
        </div>
    );
}