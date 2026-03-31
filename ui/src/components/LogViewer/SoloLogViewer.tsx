import styled from "@emotion/styled";
import { LogViewer } from "@patternfly/react-log-viewer";
import { useEffect, useRef } from "react";

const Container = styled.div`
  gap: var(--spacing-lg);
  height: 100%;
  overflow: hidden;
  border: 1px solid var(--color-border-base);
  padding: var(--spacing-lg);
  font-family: 'Courier New', monospace;
`

interface SoloLogViewerProps {
  data: string[];
}

export const SoloLogViewer = ({ data }: SoloLogViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const followRef = useRef(true);
  const listenerAttached = useRef(false);

  useEffect(() => {
    const scrollEl = containerRef.current?.querySelector("[class*='scroll-container']");
    if (!scrollEl) return;

    if (!listenerAttached.current) {
      scrollEl.addEventListener("scroll", () => {
        const atBottom = scrollEl.scrollHeight - scrollEl.scrollTop - scrollEl.clientHeight < 30;
        followRef.current = atBottom;
      });
      listenerAttached.current = true;
    }

    if (followRef.current) {
      scrollEl.scrollTop = scrollEl.scrollHeight;
    }
  }, [data]);

  return (
    <Container ref={containerRef}>
      <LogViewer
        data={data}
        hasLineNumbers={true}
      />
    </Container>
  );
}