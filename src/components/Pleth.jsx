// import React, { useEffect, useRef, useState } from "react";
// import * as d3 from "d3";

// const Pleth = ({ patientId }) => {
//     const svgRef = useRef();
//     const [dataPoints, setDataPoints] = useState(Array(300).fill(0)); // Initialize with zeros
//     const [currentIndex, setCurrentIndex] = useState(0); // Initial index for inserting new data
//     const width = 500;
//     const height = 110;
//     const margin = { top: 0, right: 0, bottom: 0, left: 0 };
//     const gapSize = 0.5; // Gap size

//     useEffect(() => {
//         const ws = new WebSocket(
//             `${import.meta.env.VITE_PLETHSOCKET_URL}?patientId=${patientId}`
//         );
//         console.log("Pleth Cnnected", patientId);
//         ws.onmessage = (event) => {
//             const messageData = JSON.parse(event.data);
//             const newPoints = messageData?.data?.[0]?.data;
//             const processedPoints = newPoints.map((point) => point * -1);
//             console.log(processedPoints);
//             if (Array.isArray(newPoints) && newPoints.length <= 500) {
//                 setDataPoints((prevData) => {
//                     let updatedData = [...prevData];
//                     // Clear old gap data by overwriting it with zero or handling it as needed
//                     for (let i = 0; i < gapSize; i++) {
//                         updatedData[(currentIndex + i) % 300] = 0;
//                     }
//                     // Insert new data points
//                     processedPoints.forEach((point, i) => {
//                         updatedData[(currentIndex + gapSize + i) % 300] = point;
//                     });
//                     // Set new gap
//                     for (let i = 0; i < gapSize; i++) {
//                         updatedData[
//                             (currentIndex +
//                                 gapSize +
//                                 processedPoints.length +
//                                 i) %
//                                 300
//                         ] = null;
//                     }
//                     return updatedData;
//                 });
//                 setCurrentIndex(
//                     (prevIndex) =>
//                         (prevIndex + gapSize + processedPoints.length) % 300
//                 );
//             }
//         };
//         return () => ws.close();
//     }, [patientId, currentIndex]);

//     useEffect(() => {
//         const svg = d3
//             .select(svgRef.current)
//             .attr("width", width)
//             .attr("height", height)
//             .append("g")
//             .attr("transform", `translate(${margin.left},${margin.top})`);

//         svg.append("path")
//             .attr("class", "plot")
//             .attr("fill", "none")
//             .attr("stroke", "#62ECFF")
//             .attr("stroke-width", 2);

//         // Prepare a vertical line for the gap start indicator
//         svg.append("line")
//             .attr("class", "gap-start-line")
//             .attr("stroke", "red")
//             .attr("stroke-width", 2)
//             .attr("y1", 0)
//             .attr("y2", height);
//     }, []);

//     useEffect(() => {
//         const svg = d3.select(svgRef.current);
//         const g = svg.select("g");
//         const innerWidth = width - margin.left - margin.right;

//         const xScale = d3.scaleLinear().domain([0, 299]).range([0, innerWidth]);
//         const yScale = d3
//             .scaleLinear()
//             .domain([
//                 Math.min(-70, ...dataPoints.filter(Number.isFinite)),
//                 Math.max(70, ...dataPoints.filter(Number.isFinite)),
//             ])
//             .range([height, 0]);

//         const line = d3
//             .line()
//             .defined((d) => d !== null)
//             .x((_, i) => xScale(i))
//             .y((d) => yScale(d))
//             .curve(d3.curveMonotoneX);

//         g.selectAll(".plot").datum(dataPoints).attr("d", line);

//         // Determine where the gap starts
//         const gapStartIndex = dataPoints.findIndex(
//             (d, i) => dataPoints[(i - 1 + 300) % 300] !== null && d === null
//         );
//         if (gapStartIndex >= 0) {
//             const gapStartX = xScale(gapStartIndex);
//             g.select(".gap-start-line")
//                 .attr("x1", gapStartX)
//                 .attr("x2", gapStartX);
//         }
//     }, [dataPoints, currentIndex]);

//     return <svg ref={svgRef}></svg>;
// };

// export default Pleth;

// import React, { useEffect, useRef, useState } from "react";
// import * as d3 from "d3";

// const Pleth = ({ patientId }) => {
//     const svgRef = useRef();
//     const [dataPoints, setDataPoints] = useState(Array(300).fill(0)); // Initialize with zeros
//     const [currentIndex, setCurrentIndex] = useState(0); // Initial index for inserting new data
//     const width = 400;
//     const height = 110;
//     const margin = { top: 0, right: 0, bottom: 0, left: 0 };

//     useEffect(() => {
//         const ws = new WebSocket(
//             `${import.meta.env.VITE_PLETHSOCKET_URL}?patientId=${patientId}`
//         );
//         console.log("Pleth Connected", patientId);
//         ws.onmessage = (event) => {
//             const messageData = JSON.parse(event.data);
//             const newPoints = messageData?.data?.[0]?.data;
//             const processedPoints = newPoints.map((point) => point * -1);
//             console.log(processedPoints);
//             if (Array.isArray(newPoints) && newPoints.length <= 500) {
//                 setDataPoints((prevData) => {
//                     let updatedData = [...prevData];
//                     processedPoints.forEach((point, i) => {
//                         updatedData[(currentIndex + i) % 300] = point;
//                     });
//                     return updatedData;
//                 });
//                 setCurrentIndex(
//                     (prevIndex) => (prevIndex + processedPoints.length) % 300
//                 );
//             }
//         };
//         return () => ws.close();
//     }, [patientId, currentIndex]);

//     useEffect(() => {
//         const svg = d3
//             .select(svgRef.current)
//             .attr("width", width)
//             .attr("height", height)
//             .append("g")
//             .attr("transform", `translate(${margin.left},${margin.top})`);

//         svg.append("path")
//             .attr("class", "plot")
//             .attr("fill", "none")
//             .attr("stroke", "#62ECFF")
//             .attr("stroke-width", 2);
//     }, []);

//     useEffect(() => {
//         const svg = d3.select(svgRef.current);
//         const g = svg.select("g");
//         const innerWidth = width - margin.left - margin.right;

//         const xScale = d3.scaleLinear().domain([0, 299]).range([0, innerWidth]);
//         const yScale = d3
//             .scaleLinear()
//             .domain([Math.min(-70, ...dataPoints), Math.max(70, ...dataPoints)])
//             .range([height, 0]);

//         const line = d3
//             .line()
//             .defined((d) => d !== null)
//             .x((_, i) => xScale(i))
//             .y((d) => yScale(d))
//             .curve(d3.curveMonotoneX);

//         g.selectAll(".plot").datum(dataPoints).attr("d", line);
//     }, [dataPoints, currentIndex]);

//     return <svg ref={svgRef}></svg>;
// };

// export default Pleth;

// import React, { useEffect, useRef, useState } from "react";
// import * as d3 from "d3";

// const Pleth = ({ patientId }) => {
//     const svgRef = useRef();
//     const [dataPoints, setDataPoints] = useState(Array(300).fill(0)); // Initialize with zeros
//     const [currentIndex, setCurrentIndex] = useState(0); // Initial index for inserting new data
//     const width = 400;
//     const height = 110;
//     const margin = { top: 0, right: 0, bottom: 0, left: 0 };

//     useEffect(() => {
//         const ws = new WebSocket(
//             `${import.meta.env.VITE_PLETHSOCKET_URL}?patientId=${patientId}`
//         );
//         console.log("Pleth Connected", patientId);
//         ws.onmessage = (event) => {
//             const messageData = JSON.parse(event.data);
//             const newPoints = messageData?.data?.[0]?.data;
//             const processedPoints = newPoints.map((point) => point * -1);
//             console.log(processedPoints);
//             if (Array.isArray(newPoints) && newPoints.length <= 500) {
//                 setDataPoints((prevData) => {
//                     let updatedData = [...prevData];
//                     processedPoints.forEach((point, i) => {
//                         updatedData[(currentIndex + i) % 300] = point;
//                     });
//                     return updatedData;
//                 });
//                 setCurrentIndex(
//                     (prevIndex) => (prevIndex + processedPoints.length) % 300
//                 );
//             }
//         };
//         return () => ws.close();
//     }, [patientId, currentIndex]);

//     useEffect(() => {
//         const svg = d3
//             .select(svgRef.current)
//             .attr("width", width)
//             .attr("height", height)
//             .append("g")
//             .attr("transform", `translate(${margin.left},${margin.top})`);

//         svg.append("path")
//             .attr("class", "plot")
//             .attr("fill", "none")
//             .attr("stroke", "#62ECFF")
//             .attr("stroke-width", 2);

//         // Prepare a vertical line for the most recent data point indicator
//         svg.append("line")
//             .attr("class", "current-data-line")
//             .attr("stroke", "red")
//             .attr("stroke-width", 2)
//             .attr("y1", 0)
//             .attr("y2", height);
//     }, []);

//     useEffect(() => {
//         const svg = d3.select(svgRef.current);
//         const g = svg.select("g");
//         const innerWidth = width - margin.left - margin.right;

//         const xScale = d3.scaleLinear().domain([0, 299]).range([0, innerWidth]);
//         const yScale = d3
//             .scaleLinear()
//             .domain([Math.min(-70, ...dataPoints), Math.max(70, ...dataPoints)])
//             .range([height, 0]);

//         const line = d3
//             .line()
//             .defined((d) => d !== null)
//             .x((_, i) => xScale(i))
//             .y((d) => yScale(d))
//             .curve(d3.curveMonotoneX);

//         g.selectAll(".plot").datum(dataPoints).attr("d", line);

//         // Position the red line at the latest data point
//         const currentDataX = xScale((currentIndex - 1 + 300) % 300);
//         g.select(".current-data-line")
//             .attr("x1", currentDataX)
//             .attr("x2", currentDataX);
//     }, [dataPoints, currentIndex]);

//     return <svg ref={svgRef}></svg>;
// };

// export default Pleth;

// import React, { useEffect, useRef, useState } from "react";
// import * as d3 from "d3";

// const Pleth = ({ patientId }) => {
//     const svgRef = useRef();
//     const [dataPoints, setDataPoints] = useState(Array(300).fill(0)); // Initialize with zeros
//     const [currentIndex, setCurrentIndex] = useState(0); // Initial index for inserting new data
//     const width = 400;
//     const height = 110;
//     const margin = { top: 0, right: 0, bottom: 0, left: 0 };

//     useEffect(() => {
//         const ws = new WebSocket(
//             `${import.meta.env.VITE_PLETHSOCKET_URL}?patientId=${patientId}`
//         );
//         console.log("Pleth Connected", patientId);

//         ws.onmessage = (event) => {
//             const messageData = JSON.parse(event.data);
//             const newPoints = messageData?.data?.[0]?.data;

//             if (Array.isArray(newPoints) && newPoints.length <= 500) {
//                 const processedPoints = newPoints.map((point) => point * -1);
//                 console.log(processedPoints);

//                 setDataPoints((prevData) => {
//                     let updatedData = [...prevData];
//                     processedPoints.forEach((point, i) => {
//                         updatedData[(currentIndex + i) % 300] = point;
//                     });
//                     return updatedData;
//                 });

//                 setCurrentIndex(
//                     (prevIndex) => (prevIndex + processedPoints.length) % 300
//                 );
//             }
//         };

//         return () => ws.close();
//     }, [patientId, currentIndex]);

//     useEffect(() => {
//         const svg = d3
//             .select(svgRef.current)
//             .attr("width", width)
//             .attr("height", height)
//             .append("g")
//             .attr("transform", `translate(${margin.left},${margin.top})`);

//         svg.append("path")
//             .attr("class", "plot")
//             .attr("fill", "none")
//             .attr("stroke", "#62ECFF")
//             .attr("stroke-width", 2);

//         // Prepare a vertical line for the most recent data point indicator
//         svg.append("line")
//             .attr("class", "current-data-line")
//             .attr("stroke", "red")
//             .attr("stroke-width", 2)
//             .attr("y1", 0)
//             .attr("y2", height);
//     }, []);

//     useEffect(() => {
//         const svg = d3.select(svgRef.current);
//         const g = svg.select("g");
//         const innerWidth = width - margin.left - margin.right;

//         const xScale = d3.scaleLinear().domain([0, 299]).range([0, innerWidth]);
//         const yScale = d3
//             .scaleLinear()
//             .domain([Math.min(-70, ...dataPoints), Math.max(70, ...dataPoints)])
//             .range([height, 0]);

//         const line = d3
//             .line()
//             .defined((d) => d !== null)
//             .x((_, i) => xScale(i))
//             .y((d) => yScale(d))
//             .curve(d3.curveMonotoneX);

//         g.selectAll(".plot").datum(dataPoints).attr("d", line);

//         // Position the red line at the latest data point
//         const currentDataX = xScale((currentIndex - 1 + 300) % 300);
//         g.select(".current-data-line")
//             .attr("x1", currentDataX)
//             .attr("x2", currentDataX);
//     }, [dataPoints, currentIndex]);

//     return <svg ref={svgRef}></svg>;
// };

// export default Pleth;

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const Pleth = ({ patientId }) => {
    const svgRef = useRef();
    const [dataPoints, setDataPoints] = useState(Array(600).fill(0)); // Initialize with zeros
    const [currentIndex, setCurrentIndex] = useState(0); // Initial index for inserting new data
    const width = 400;
    const height = 90;
    const margin = { top: 0, right: 0, bottom: 0, left: 0 };

    useEffect(() => {
        const ws = new WebSocket(
            `${import.meta.env.VITE_PLETHSOCKET_URL}?patientId=${patientId}`
        );
        console.log("Pleth Connected", patientId);

        ws.onmessage = (event) => {
            const messageData = JSON.parse(event.data);
            const newPoints = messageData?.data?.[0]?.data;

            if (Array.isArray(newPoints) && newPoints.length <= 500) {
                const processedPoints = newPoints.map((point) => point * -1);
                console.log(processedPoints);

                setDataPoints((prevData) => {
                    const updatedData = [...prevData];
                    const newCurrentIndex =
                        (currentIndex + processedPoints.length) % 600;

                    for (let i = 0; i < processedPoints.length; i++) {
                        updatedData[(currentIndex + i) % 600] =
                            processedPoints[i];
                    }

                    setCurrentIndex(newCurrentIndex);
                    return updatedData;
                });
            }
        };

        return () => ws.close();
    }, [patientId, currentIndex]);

    useEffect(() => {
        const svg = d3
            .select(svgRef.current)
            // .attr("width", width)
            // .attr("height", height)
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

    useEffect(() => {
        const svg = d3.select(svgRef.current);
        const g = svg.select("g");
        const innerWidth = width - margin.left - margin.right;

        const xScale = d3.scaleLinear().domain([0, 599]).range([0, innerWidth]);
        const yScale = d3
            .scaleLinear()
            .domain([Math.min(-70, ...dataPoints), Math.max(70, ...dataPoints)])
            .range([height, 0]);

        const line = d3
            .line()
            .defined((d) => d !== null)
            .x((_, i) => xScale(i))
            .y((d) => yScale(d))
            .curve(d3.curveMonotoneX);

        g.selectAll(".plot").datum(dataPoints).attr("d", line);

        // Position the red line at the latest data point
        const currentDataX = xScale((currentIndex - 1 + 600) % 600);
        g.select(".current-data-line")
            .attr("x1", currentDataX)
            .attr("x2", currentDataX);
    }, [dataPoints, currentIndex]);

    return <svg ref={svgRef}></svg>;
};

export default Pleth;

// import React, { useEffect, useRef, useState } from "react";
// import * as d3 from "d3";

// const Pleth = ({ patientId }) => {
//     const svgRef = useRef();
//     const [dataPoints, setDataPoints] = useState(Array(600).fill(0)); // Initialize with zeros
//     const [currentIndex, setCurrentIndex] = useState(0); // Initial index for inserting new data
//     const width = 400;
//     const height = 110;
//     const margin = { top: 0, right: 0, bottom: 0, left: 0 };

//     useEffect(() => {
//         const ws = new WebSocket(
//             `${import.meta.env.VITE_PLETHSOCKET_URL}?patientId=${patientId}`
//         );
//         console.log("Pleth Connected", patientId);

//         ws.onmessage = (event) => {
//             const messageData = JSON.parse(event.data);
//             const newPoints = messageData?.data?.[0]?.data;

//             if (Array.isArray(newPoints) && newPoints.length <= 500) {
//                 const processedPoints = newPoints.map((point) => point * -1);
//                 console.log(processedPoints);

//                 setDataPoints((prevData) => {
//                     const updatedData = [...prevData];
//                     const newCurrentIndex =
//                         (currentIndex + processedPoints.length) % 500;

//                     for (let i = 0; i < processedPoints.length; i++) {
//                         updatedData[(currentIndex + i) % 500] =
//                             processedPoints[i];
//                     }

//                     setCurrentIndex(newCurrentIndex);
//                     return updatedData;
//                 });
//             }
//         };

//         return () => ws.close();
//     }, [patientId, currentIndex]);

//     useEffect(() => {
//         const svg = d3
//             .select(svgRef.current)
//             .attr("width", width)
//             .attr("height", height)
//             .append("g")
//             .attr("transform", `translate(${margin.left},${margin.top})`);

//         svg.append("path")
//             .attr("class", "plot")
//             .attr("fill", "none")
//             .attr("stroke", "#62ECFF")
//             .attr("stroke-width", 2);

//         // Prepare a vertical line for the most recent data point indicator
//         svg.append("line")
//             .attr("class", "current-data-line")
//             .attr("stroke", "red")
//             .attr("stroke-width", 2)
//             .attr("y1", 0)
//             .attr("y2", height);
//     }, []);

//     useEffect(() => {
//         const svg = d3.select(svgRef.current);
//         const g = svg.select("g");
//         const innerWidth = width - margin.left - margin.right;

//         const xScale = d3.scaleLinear().domain([0, 499]).range([0, innerWidth]);
//         const yScale = d3
//             .scaleLinear()
//             .domain([Math.min(-70, ...dataPoints), Math.max(70, ...dataPoints)])
//             .range([height, 0]);

//         const line = d3
//             .line()
//             .defined((d) => d !== null)
//             .x((_, i) => xScale(i))
//             .y((d) => yScale(d))
//             .curve(d3.curveMonotoneX);

//         g.selectAll(".plot").datum(dataPoints).attr("d", line);

//         // Position the red line at the latest data point
//         const currentDataX = xScale((currentIndex - 1 + 500) % 500);
//         g.select(".current-data-line")
//             .attr("x1", currentDataX)
//             .attr("x2", currentDataX);
//     }, [dataPoints, currentIndex]);

//     return <svg ref={svgRef}></svg>;
// };

// export default Pleth;

//code for data points from starting

// import React, { useEffect, useRef, useState } from "react";
// import * as d3 from "d3";

// const Pleth = ({ patientId }) => {
//     const svgRef = useRef();
//     const [dataPoints, setDataPoints] = useState([]);
//     const [resetGraph, setResetGraph] = useState(false);
//     const width = 400;
//     const height = 110;
//     const margin = { top: 0, right: 0, bottom: 0, left: 0 };

//     useEffect(() => {
//         const ws = new WebSocket(
//             `${import.meta.env.VITE_PLETHSOCKET_URL}?patientId=${patientId}`
//         );
//         console.log("Pleth Connected", patientId);

//         ws.onmessage = (event) => {
//             const messageData = JSON.parse(event.data);
//             const newPoints = messageData?.data?.[0]?.data;

//             if (Array.isArray(newPoints) && newPoints.length <= 500) {
//                 const processedPoints = newPoints.map((point) => point * -1);
//                 console.log(processedPoints);

//                 setDataPoints((prevData) => {
//                     const updatedData = [...prevData, ...processedPoints];
//                     if (updatedData.length >= 600) {
//                         // Reset dataPoints to start over
//                         setResetGraph(true);
//                         return [];
//                     }
//                     return updatedData;
//                 });
//             }
//         };

//         return () => ws.close();
//     }, [patientId]);

//     useEffect(() => {
//         const svg = d3
//             .select(svgRef.current)
//             .attr("width", width)
//             .attr("height", height)
//             .append("g")
//             .attr("transform", `translate(${margin.left},${margin.top})`);

//         svg.append("path")
//             .attr("class", "plot")
//             .attr("fill", "none")
//             .attr("stroke", "#62ECFF")
//             .attr("stroke-width", 2);

//         svg.append("line")
//             .attr("class", "current-data-line")
//             .attr("stroke", "red")
//             .attr("stroke-width", 2)
//             .attr("y1", 0)
//             .attr("y2", height);
//     }, []);

//     useEffect(() => {
//         if (resetGraph) {
//             const svg = d3.select(svgRef.current);
//             const g = svg.select("g");

//             // Clear the path
//             g.selectAll(".plot").attr("d", null);

//             // Remove the red line
//             g.select(".current-data-line").attr("x1", null).attr("x2", null);

//             // Reset the graph state
//             setResetGraph(false);
//         } else {
//             const svg = d3.select(svgRef.current);
//             const g = svg.select("g");
//             const innerWidth = width - margin.left - margin.right;

//             const xScale = d3
//                 .scaleLinear()
//                 .domain([0, 599])
//                 .range([0, innerWidth]);
//             const yScale = d3
//                 .scaleLinear()
//                 .domain([
//                     Math.min(-70, ...dataPoints),
//                     Math.max(70, ...dataPoints),
//                 ])
//                 .range([height, 0]);

//             const line = d3
//                 .line()
//                 .defined((d) => d !== null)
//                 .x((_, i) => xScale(i))
//                 .y((d) => yScale(d))
//                 .curve(d3.curveMonotoneX);

//             g.selectAll(".plot").datum(dataPoints).attr("d", line);

//             const currentDataX = xScale(dataPoints.length - 1);
//             g.select(".current-data-line")
//                 .attr("x1", currentDataX)
//                 .attr("x2", currentDataX);
//         }
//     }, [dataPoints, resetGraph]);

//     return <svg ref={svgRef}></svg>;
// };

// export default Pleth;
