import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const Pleth = ({patientId}) => {
    const svgRef = useRef();
    const [dataPoints, setDataPoints] = useState(Array(300).fill(0)); // Initialize with zeros
    const [currentIndex, setCurrentIndex] = useState(0); // Initial index for inserting new data
    const width = 400;
    const height = 64;
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const gapSize = 10; // Gap size

    useEffect(() => {
        const ws = new WebSocket(`${import.meta.env.VITE_PLETHSOCKET_URL}/?patientId=${patientId}`);
        console.log("Pleth Cnnected", patientId)
        ws.onmessage = (event) => {
            const messageData = JSON.parse(event.data);
            const newPoints = messageData?.data?.[0]?.data;
            console.log(newPoints)
            if (Array.isArray(newPoints) && newPoints.length <= 100) {
                setDataPoints((prevData) => {
                    let updatedData = [...prevData];
                    // Clear old gap data by overwriting it with zero or handling it as needed
                    for (let i = 0; i < gapSize; i++) {
                        updatedData[(currentIndex + i) % 300] = 0;
                    }
                    // Insert new data points
                    newPoints.forEach((point, i) => {
                        updatedData[(currentIndex + gapSize + i) % 300] = point;
                    });
                    // Set new gap
                    for (let i = 0; i < gapSize; i++) {
                        updatedData[(currentIndex + gapSize + newPoints.length + i) % 300] = null;
                    }
                    return updatedData;
                });
                setCurrentIndex((prevIndex) => (prevIndex + gapSize + newPoints.length) % 300);
            }
        };
        return () => ws.close();
    }, [patientId,currentIndex]);

    useEffect(() => {
        const svg = d3.select(svgRef.current)
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        svg.append("path")
            .attr("class", "plot")
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 2);

        // Prepare a vertical line for the gap start indicator
        svg.append("line")
            .attr("class", "gap-start-line")
            .attr("stroke", "red")
            .attr("stroke-width", 2)
            .attr("y1", 0)
            .attr("y2", height);
    }, []);

    useEffect(() => {
        const svg = d3.select(svgRef.current);
        const g = svg.select("g");
        const innerWidth = width - margin.left - margin.right;

        const xScale = d3.scaleLinear().domain([0, 299]).range([0, innerWidth]);
        const yScale = d3.scaleLinear()
            .domain([Math.min(-65535, ...dataPoints.filter(Number.isFinite)), Math.max(65535, ...dataPoints.filter(Number.isFinite))])
            .range([height, 0]);

        const line = d3.line()
            .defined((d) => d !== null)
            .x((_, i) => xScale(i))
            .y((d) => yScale(d))
            .curve(d3.curveMonotoneX);

        g.selectAll(".plot").datum(dataPoints).attr("d", line);

        // Determine where the gap starts
        const gapStartIndex = dataPoints.findIndex((d, i) => dataPoints[(i - 1 + 300) % 300] !== null && d === null);
        if (gapStartIndex >= 0) {
            const gapStartX = xScale(gapStartIndex);
            g.select(".gap-start-line")
                .attr("x1", gapStartX)
                .attr("x2", gapStartX);
        }
    }, [dataPoints, currentIndex]);

    return <svg ref={svgRef}></svg>;
};

export default Pleth;
