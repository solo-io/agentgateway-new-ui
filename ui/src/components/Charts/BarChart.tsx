import styled from "@emotion/styled";
import { BarController, BarElement, Chart } from "chart.js";
import { useEffect, useRef } from 'react';

Chart.register(BarController, BarElement);

const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
    padding: var(--spacing-lg);
    background-color: var(--color-bg-container);
    border: 1px solid var(--color-border-secondary);
    border-radius: var(--border-radius-md);
`;

const ChartTitle = styled.div`
    display: flex;
    align-items: flex-start;
    font-size: 16px;
    font-weight: 600;   
    color: var(--color-text-base);
`

interface BarChartDataset { 
    label: string;
    data: number[];
    backgroundColor: string;
}

interface BarChartProps { 
    title: string;
    labels: string[];
    datasets: BarChartDataset[];
}

export const BarChart = ({ title, labels, datasets }: BarChartProps) => { 
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<Chart | null>(null);

    useEffect(() => { 
        if (!canvasRef.current) return;

        // destroy existing instance to avoid canvas reuse errors
        if (chartRef.current) { 
            chartRef.current.destroy();
        }

        chartRef.current = new Chart(canvasRef.current, { 
            type: 'bar',
            data: { 
                labels,
                datasets: datasets.map((ds: BarChartDataset) => ({ 
                    ...ds,
                    backgroundColor: ds.backgroundColor,
                })),
            },
            options: {
                responsive: true,
                scales: { 
                    y: { beginAtZero: true },
                }
            },
        })
    }, [labels, datasets]);
    
    return (
        <Container>
            <ChartTitle>{title}</ChartTitle>
            <canvas ref={canvasRef} />
        </Container>
    );
}