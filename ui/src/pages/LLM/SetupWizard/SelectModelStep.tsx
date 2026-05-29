import styled from "@emotion/styled";
import { Button, Card } from "antd";
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
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-lg);
`;

const OptionCard = styled(Card)<{ $selected: boolean; $disabled: boolean }>`
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
  opacity: ${({ $disabled }) => ($disabled ? 0.5 : 1)};
  border: 2px solid
    ${({ $selected }) =>
      $selected ? "var(--color-primary)" : "var(--color-border)"};
  transition: border-color 0.2s;

  &:hover {
    border-color: ${({ $disabled, $selected }) =>
      $disabled ? "var(--color-border)" : $selected ? "var(--color-primary)" : "var(--color-primary-hover)"};
  }
`;

const CardLabel = styled.div`
  font-weight: 600;
  font-size: 15px;
  color: var(--color-text-base);
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
    disabled: false,
  },
  {
    id: "other-walkthroughs",
    label: "Other Walkthroughs",
    subtext: "Coming soon",
    disabled: true,
  },
  {
    id: "manual",
    label: "Manual Setup",
    subtext: "Coming soon",
    disabled: true,
  },
];

export function SelectModelStep() { 
    const { data, setSelectedWalkthrough, nextStep, previousStep } = useLLMWizard();
    const selected = data.selectedWalkthrough;

    const handleSelect = (id: string, disabled: boolean) => {
        if (disabled) return;
        setSelectedWalkthrough(id);
    };

    const handleNext = () => { 
        if (selected) nextStep();
    };

    return (
        <div>
            <StepTitle>How do you want to set up your model?</StepTitle>
            <StepDescription>
                Choose a setup path.  More options will be available soon.
            </StepDescription>

            <CardGrid>
                {OPTIONS.map(({ id, label, subtext, disabled }) => (
                    <OptionCard
                        key={id}
                        $selected={selected === id}
                        $disabled={disabled}
                        onClick={() => handleSelect(id, disabled)}
                    >
                        <CardLabel>{label}</CardLabel>
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