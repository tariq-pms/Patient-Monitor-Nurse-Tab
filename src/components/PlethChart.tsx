import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { ScaleLinear } from "d3-scale";

interface PlethChartProps {
    patientId: string;
}

const PlethChart: React.FC<PlethChartProps> = ({ patientId }) => {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const [dataPoints, setDataPoints] = useState<Array<number | null>>(new Array(300).fill(null));
    const [currentIndex, setCurrentIndex] = useState(0);
    const width = 800;
    const height = 300;
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const gapSize = 10;

    useEffect(() => {
        const ws = new WebSocket(`ws://localhost:9043?patientId=${encodeURIComponent(patientId)}`);
        console.log("Pleth socket successful")
        ws.onmessage = (event) => {
            const messageData = JSON.parse(event.data);
            const newPoints = messageData?.data?.[0]?.data;
            console.log("Pleth data: ", patientId, newPoints);
            setDataPoints((prevData) => {
                const updatedData = [...prevData];
                for (let i = 0; i < gapSize; i++) {
                    updatedData[(currentIndex + i) % 300] = null; // Clear old gap data
                }
                newPoints.forEach((point: number, i: number) => {
                    updatedData[(currentIndex + gapSize + i) % 300] = point;
                });
                return updatedData;
            });
            setCurrentIndex((prevIndex) => (prevIndex + gapSize + newPoints.length) % 300);
        };
        return () => ws.close();
    }, [currentIndex, patientId, gapSize]);

    useEffect(() => {
        if (!svgRef.current) return;
        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const g = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const xScale: ScaleLinear<number, number> = d3.scaleLinear().domain([0, 299]).range([0, width - margin.left - margin.right]);
        const yScale: ScaleLinear<number, number> = d3.scaleLinear()
            .domain([0, Math.max(...dataPoints.filter((d): d is number => d !== null))])
            .range([height, 0]);

        const line = d3.line<number | null>()
            .defined((d): d is number => d !== null)
            .x((_, i) => xScale(i))
            .y((d) => yScale(d as number))
            .curve(d3.curveMonotoneX);

        g.append("path")
            .datum(dataPoints)
            .attr("class", "plot")
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 2)
            .attr("d", line);

        // Draw red line at each start of a gap dynamically
        dataPoints.forEach((point, i) => {
            if (point === null && i > 0 && dataPoints[i - 1] !== null) {
                const gapStartX = xScale(i);
                g.append("line")
                    .attr("x1", gapStartX)
                    .attr("x2", gapStartX)
                    .attr("y1", 0)
                    .attr("y2", height)
                    .attr("stroke", "red")
                    .attr("stroke-width", 2);
            }
        });
    }, [dataPoints]);

    return <svg ref={svgRef} width={width} height={height}></svg>;
};

export default PlethChart;
