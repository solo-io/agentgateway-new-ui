import styled from "@emotion/styled";
import { Button, Checkbox, Toolbar, ToolbarContent, ToolbarItem } from "@patternfly/react-core";
import OutlinedPlayCircleIcon from '@patternfly/react-icons/dist/esm/icons/outlined-play-circle-icon';
import PauseIcon from '@patternfly/react-icons/dist/esm/icons/pause-icon';
import { LogViewer, LogViewerSearch } from "@patternfly/react-log-viewer";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";

const Container = styled.div`
  gap: var(--spacing-lg);
  height: 100%;
  overflow: hidden;
  
  .pf-v6-c-check__label {
    color: var(--color-text-base);
  }
`

const StyledButton = styled(Button)`
  && { 
    background-color: var(--color-sidebar);
  }
`;

const StyledFooterButton = styled(Button)`
  && { 
    background-color: var(--color-sidebar);
    margin-top: var(--spacing-md);
  }
`;

const StyledResumeIcon = styled(OutlinedPlayCircleIcon)`
  margin-right: var(--spacing-sm);
`;

interface SoloLogViewerProps {
  data: string[];
}

export const SoloLogViewer = ({ data }: SoloLogViewerProps) => {
  const { theme } = useTheme();
  const [isTextWrapped, setIsTextWrapped] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentItemCount, setCurrentItemCount] = useState(0);
  const [linesBehind, setLinesBehind] = useState(0);
  const logViewerRef = useRef<any>(null);

  useEffect(() => {
    if (!isPaused && data.length > 0) { 
      setCurrentItemCount(data.length);
      if (logViewerRef.current) { 
        logViewerRef.current.scrollToBottom();
      }
    } else if (data.length !== currentItemCount) { 
      setLinesBehind(data.length - currentItemCount);
    } else { 
      setLinesBehind(0);
    }
  }, [isPaused, data]);


  const onScroll = ({
    scrollOffsetToBottom,
    scrollUpdateWasRequested,
  }: {
    scrollOffsetToBottom: number;
    scrollDirection: string;
    scrollUpdateWasRequested: boolean;
  }) => {
    if (!scrollUpdateWasRequested) {
      if (scrollOffsetToBottom > 0) {
        setIsPaused(true);
      } else {
        setIsPaused(false);
      }
    }
  };

  const ControlButton = () => (
    <StyledButton
      onClick={() => { 
        setIsPaused(!isPaused);
      }}
      icon={isPaused ? <StyledResumeIcon /> : <PauseIcon />}
    >
      {isPaused ? `Resume Logs` : `Pause Logs`}
    </StyledButton>
  );

  const FooterButton = () => (
    <StyledFooterButton
      onClick={() => setIsPaused(false)}
      isBlock
    >
      <StyledResumeIcon />
      Resume Logs{linesBehind === 0 ? null : ` (${linesBehind} lines behind)`}
    </StyledFooterButton>
  )

  return (
    <Container>
      <LogViewer
        data={data}
        hasLineNumbers={true}
        theme={theme}
        isTextWrapped={isTextWrapped}
        scrollToRow={isPaused ? undefined : currentItemCount}
        innerRef={logViewerRef}
        onScroll={onScroll}
        footer={isPaused && <FooterButton />}
        toolbar={
          <Toolbar>
            <ToolbarContent>
                <ToolbarItem>
                  <LogViewerSearch
                    placeholder="Search logs"
                    minSearchChars={3}
                  />
                </ToolbarItem>
                <ToolbarItem>
                  <ControlButton />
                </ToolbarItem>
                <ToolbarItem alignSelf="center">
                  <Checkbox
                    label="Wrap text"
                    aria-label="wrap text checkbox"
                    isChecked={isTextWrapped}
                    id="wrap-text-checkbox"
                    onChange={(_event, value) => setIsTextWrapped(value)}
                  />
                </ToolbarItem>
            </ToolbarContent>
          </Toolbar>
        }
      />
    </Container>
  );
}