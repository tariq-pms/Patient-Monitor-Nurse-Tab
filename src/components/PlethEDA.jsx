import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const PlethEDA = ({ patientId, pleth_resource }) => {
    const svgRef = useRef();
    const [dataPoints, setDataPoints] = useState(Array(600).fill(0)); // Initialize with zeros
    const [currentIndex, setCurrentIndex] = useState(0); // Initial index for inserting new data
    const resetTimeoutRef = useRef(null);
    const width = 400;
    const height = 90;
    const margin = { top: 0, right: 0, bottom: 0, left: 0 };

    // Function to reset data points to zero
    const resetDataPoints = () => {
        setDataPoints(Array(600).fill(0));
        setCurrentIndex(0);
    };

    // Initialize the D3 chart
    useEffect(() => {
        const svg = d3
            .select(svgRef.current)
            .attr("viewBox", `0 0 ${width} ${height}`)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        svg.append("path")
            .attr("class", "plot")
            .attr("fill", "none")
            .attr("stroke", "#62ECFF")
            .attr("stroke-width", 2);

        // Prepare a vertical line for the most recent data point indicator
        svg.append("line")
            .attr("class", "current-data-line")
            .attr("stroke", "red")
            .attr("stroke-width", 2)
            .attr("y1", 0)
            .attr("y2", height);
    }, []);

    // Update the chart with new data points
    useEffect(() => {
        if (pleth_resource) {
            const newPoints = pleth_resource?.data;

            if (Array.isArray(newPoints) && newPoints.length <= 500) {
                const processedPoints = newPoints.map((point) => point * -1);
                // console.log(processedPoints);

                const updatedData = [...dataPoints];
                const newCurrentIndex =
                    (currentIndex + processedPoints.length) % 600;

                for (let i = 0; i < processedPoints.length; i++) {
                    updatedData[(currentIndex + i) % 600] = processedPoints[i];
                }

                setDataPoints(updatedData);
                setCurrentIndex(newCurrentIndex);

                // Clear existing timeout and set a new one
                if (resetTimeoutRef.current) {
                    clearTimeout(resetTimeoutRef.current);
                }
                resetTimeoutRef.current = setTimeout(() => {
                    resetDataPoints();
                }, 3000); // Adjust the interval by tariq

                // Update D3 chart
                const svg = d3.select(svgRef.current);
                const g = svg.select("g");
                const innerWidth = width - margin.left - margin.right;

                const xScale = d3
                    .scaleLinear()
                    .domain([0, 599])
                    .range([0, innerWidth]);
                const yScale = d3
                    .scaleLinear()
                    .domain([
                        Math.min(-70, ...updatedData),
                        Math.max(70, ...updatedData),
                    ])
                    .range([height, 0]);

                const line = d3
                    .line()
                    .defined((d) => d !== null)
                    .x((_, i) => xScale(i))
                    .y((d) => yScale(d))
                    .curve(d3.curveMonotoneX);

                g.selectAll(".plot").datum(updatedData).attr("d", line);

                // Position the red line at the latest data point
                const currentDataX = xScale((newCurrentIndex - 1 + 600) % 600);
                g.select(".current-data-line")
                    .attr("x1", currentDataX)
                    .attr("x2", currentDataX);
            }
        }
    }, [pleth_resource]);

    useEffect(() => {
        return () => {
            if (resetTimeoutRef.current) {
                clearTimeout(resetTimeoutRef.current);
            }
        };
    }, []);

    return <svg ref={svgRef}></svg>;
};

export default PlethEDA;
