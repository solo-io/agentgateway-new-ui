import styled from "@emotion/styled";
import { Checkbox, Toolbar, ToolbarContent, ToolbarItem } from "@patternfly/react-core";
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

interface SoloLogViewerProps {
  data: string[];
}

export const SoloLogViewer = ({ data }: SoloLogViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const followRef = useRef(true);
  const { theme } = useTheme();
  const [isTextWrapped, setIsTextWrapped] = useState(false);

  useEffect(() => {
    const scrollEl = containerRef.current?.querySelector("[class*='scroll-container']");
    if (!scrollEl) return;

    const onScroll = () => {
      const atBottom = scrollEl.scrollHeight - scrollEl.scrollTop - scrollEl.clientHeight < 30;
      followRef.current = atBottom;
    };
    scrollEl.addEventListener("scroll", onScroll);

    if (followRef.current) {
      scrollEl.scrollTop = scrollEl.scrollHeight;
    }

    return () => {
      scrollEl.removeEventListener("scroll", onScroll);
    };
  }, [data, isTextWrapped]);

  return (
    <Container ref={containerRef}>
      <LogViewer
        data={data}
        hasLineNumbers={true}
        theme={theme}
        isTextWrapped={isTextWrapped}
        toolbar={
          <Toolbar>
            <ToolbarContent>
                <ToolbarItem>
                  <LogViewerSearch
                    placeholder="Search logs"
                    minSearchChars={3}
                  />
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