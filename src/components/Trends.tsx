import { Box, Divider, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { ChartOptions, LegendItem, Plugin } from 'chart.js';
import React, { useMemo, useRef, useState } from 'react';
import { Bar } from 'react-chartjs-2'; // Import Bar instead of Line

import 'chart.js/auto';

import { Chart, CategoryScale } from 'chart.js';

Chart.register(CategoryScale);

export const Trends = (): JSX.Element => {
    type TemperatureData = {
        labels: any[];
        datasets: any[];
    };

    const getOrCreateLegendList = (_chart: any, id: string) => {
        const legendContainer = document.getElementById(id);
        let listContainer = legendContainer!.querySelector('div');
        if (!listContainer) {
            listContainer = document.createElement('div');
            listContainer.style.display = 'flex';
            listContainer.style.flexDirection = 'row';
            listContainer.style.flexWrap = 'wrap';
            listContainer.className = 'listContainer';
            legendContainer!.appendChild(listContainer);
        }
        return listContainer;
    }

    const chartRef1 = useRef<any | null>(null);
    const chartRef2 = useRef<any | null>(null);
    const chartRef3 = useRef<any | null>(null);
    const [S_and_D, setS_and_D] = useState(0);
    const [ setSelectedLegends] = useState<any>([]);
    // const [downloadConfirmation, setDownloadConfirmation] = useState(false);

    const [temperatureData] = useState<TemperatureData>({
        labels: ['27/12/23', '26/12/23', '25/12/23', '24/12/23', '23/12/23', '22/12/23', '21/12/23'],
        datasets: [
            {
                label: 'Set Skin Temperature',
                data: [10, 15, 13, 18, 12, 20, 11],
                backgroundColor: 'rgba(75,192,192,0.6)', // Change to backgroundColor for bar chart
                borderColor: 'rgba(75,192,192,1)',
                borderWidth: 1,
                yaxisID: "y1"
            },
            {
                label: 'Measured Skin Temperature',
                data: [9, 14, 14, 19, 11, 21, 12],
                backgroundColor: 'rgba(255,99,132,0.6)', // Change to backgroundColor for bar chart
                borderColor: 'red',
                borderWidth: 1,
                yaxisID: "y1"
            },
            {
                label: 'Heater Output',
                data: [89, 74, 64, 59, 41, 31, 22],
                backgroundColor: 'rgba(201,203,207,0.6)', // Change to backgroundColor for bar chart
                borderColor: 'grey',
                borderWidth: 1,
                yaxisID: "y1"
            },
        ],
    });

    const [weightData] = useState<TemperatureData>({
        labels: ['27/12/23', '26/12/23', '25/12/23', '24/12/23', '23/12/23', '22/12/23', '21/12/23'],
        datasets: [
            {
                label: 'Weight',
                data: [10, 15, 13, 18, 12, 20, 11],
                backgroundColor: 'rgba(75,192,192,0.6)', // Change to backgroundColor for bar chart
                borderColor: 'rgba(75,192,192,1)',
                borderWidth: 1,
                yaxisID: "y"
            }
        ],
    });

    const [pulseoximeterData] = useState<TemperatureData>({
        labels: ['27/12/23', '26/12/23', '25/12/23', '24/12/23', '23/12/23', '22/12/23', '21/12/23'],
        datasets: [
            {
                label: 'Spo2',
                data: [10, 15, 13, 18, 12, 20, 11],
                backgroundColor: 'rgba(255,206,86,0.6)', // Change to backgroundColor for bar chart
                borderColor: 'yellow',
                borderWidth: 1,
                yaxisID: "y"
            },
            {
                label: 'Pulse Rate',
                data: [9, 14, 14, 19, 11, 21, 12],
                backgroundColor: 'rgba(75,192,192,0.6)', // Change to backgroundColor for bar chart
                borderColor: 'green',
                borderWidth: 1,
                yaxisID: "y1"
            },
        ],
    });

    const graphDataDisplay = useMemo(() => {
         const temperatureOption = {
            animation: false,
            responsive: true,
            interaction: {
                mode: 'index' as const,
                intersect: false,
            },
            stacked: false,
            plugins: {
                decimation: {
                    enabled: true,
                    algorithm: 'min-max',
                },
                legend: {
                    display: false,
                },
                htmlLegend: {
                    containerID: 'legend-container',
                },
                zoom: {
                    zoom: {
                        wheel: {
                            enabled: true,
                            modifierKey: 'ctrl'
                        },
                        mode: 'x',
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        autoSkip: true,
                        maxTicksLimit: 10
                    },
                    grid: {
                        display: true,
                       
                    }
                },
                y: {
                    type: 'linear' as const,
                    display: true,
                    position: 'left' as const,
                    grid: {
                        color: '#303030',
                        drawOnChartArea: true,
                    },
                    title: {
                        display: true,
                        text: "Percentage (%)"
                    }
                },
                y1: {
                    type: 'linear' as const,
                    display: true,
                    position: 'right' as const,
                    grid: {
                        color: '#303030',
                        drawOnChartArea: false,
                    },
                    title: {
                        display: true,
                        text: "Temperature (C°)"
                    }
                },
            },
        };
        
        const weightOption = {
            animation: false,
            responsive: true,
            interaction: {
                mode: 'index' as const,
                intersect: false,
            },
            stacked: false,
            plugins: {
                decimation: {
                    enabled: true,
                    algorithm: 'min-max',
                },
                legend: {
                    display: false
                },
                htmlLegend: {
                    containerID: 'legend-container3',
                },
                zoom: {
                    zoom: {
                        wheel: {
                            enabled: true,
                            modifierKey: 'ctrl'
                        },
                        mode: 'x',
                    }
                }
            },
            ticks: {
                color:'red' // Set the color of the scale values (ticks) to red
            },
            scales: {
                x: {
                    ticks: {
                        autoSkip: true,
                        maxTicksLimit: 10
                    }
                },
                y: {
                    type: 'linear' as const,
                    display: true,
                    position: 'left' as const,
                    grid: {
                        color: '#303030',
                        drawOnChartArea: true,
                    },
                    title: {
                        display: true,
                        text: "Grams (g)"
                    }
                },
            },
        };

        const pulseoximeterOption = {
            animation: false,
            responsive: true,
            interaction: {
                mode: 'index' as const,
                intersect: false,
            },
            stacked: false,
            plugins: {
                decimation: {
                    enabled: true,
                    algorithm: 'min-max',
                },
                legend: {
                    display: false
                },
                htmlLegend: {
                    containerID: 'legend-container2',
                },
                zoom: {
                    zoom: {
                        wheel: {
                            enabled: true,
                            modifierKey: 'ctrl'
                        },
                        mode: 'x',
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        autoSkip: true,
                        maxTicksLimit: 10
                    }
                },
                y: {
                    type: 'linear' as const,
                    display: true,
                    position: 'left' as const,
                    title: {
                        display: true,
                        text: "Percentage (%)"
                    },
                    grid: {
                        color: '#303030',
                        drawOnChartArea: true,
                    },
                },
                y1: {
                    type: 'linear' as const,
                    display: true,
                    position: 'right' as const,
                    grid: {
                        drawOnChartArea: false,
                    },
                    title: {
                        display: true,
                        text: "Beats Per Minute (BPM)"
                    }
                },
            },
        };

        const temperatureLegendPlugin: Plugin = {
            id: 'htmlLegend',
            afterUpdate(chart, _args, options) {
                const ul = getOrCreateLegendList(chart, options.containerID);
                while (ul.firstChild) {
                    ul.firstChild.remove();
                }
                ul.style.margin = '0px';
                ul.style.padding = '0px';
                ul.style.lineHeight = '300%';
                ul.style.gap = '5%';

                const items: LegendItem[] = chart.options?.plugins?.legend?.labels?.generateLabels?.(chart) || [];
                items.forEach((item) => {
                    if (item.text !== '') {
                        const li = document.createElement('div');
                        li.style.alignItems = 'left';
                        li.style.cursor = 'pointer';
                        li.style.display = 'flex';
                        li.style.flexDirection = 'row';
                        li.style.padding = '0px';
                        li.style.margin = '0px';

                        li.onclick = () => {
                            setS_and_D(2);
                            const type = (chart.config as any)?.type;
                            if (type === 'pie' || type === 'doughnut') {
                                if (item.index !== undefined) {
                                    chart.toggleDataVisibility(item.index);
                                }
                            } else {
                                if (item.datasetIndex !== undefined) {
                                    chart.setDatasetVisibility(item.datasetIndex, !chart.isDatasetVisible(item.datasetIndex));
                                    chart.isDatasetVisible(item.datasetIndex)
                                        ? setSelectedLegends((prev: any) => [...prev, item.text])
                                        : setSelectedLegends((current: any[]) => current.filter((lol) => lol !== item.text));
                                }
                            }
                            chart.update();
                        };

                        const boxSpan = document.createElement('span');
                        boxSpan.style.background = item.hidden ? 'transparent' : (typeof item.fillStyle === 'string' ? item.fillStyle : 'transparent');
                        boxSpan.style.border = `2px solid ${item.strokeStyle}`;
                        boxSpan.style.display = 'inline-block';
                        boxSpan.style.flexShrink = '0px';
                        boxSpan.style.height = '20px';
                        boxSpan.style.marginRight = '5px';
                        boxSpan.style.width = '20px';
                        boxSpan.style.borderRadius = '8px';

                        const textContainer = document.createElement('p');
                        textContainer.style.fontSize = '12px';
                        textContainer.style.color = 'black';
                        textContainer.style.marginTop = '-12px';
                        textContainer.style.padding = '0px';

                        const text = document.createTextNode("- " + item.text);
                        textContainer.appendChild(text);

                        li.appendChild(boxSpan);
                        li.appendChild(textContainer);
                        ul.appendChild(li);
                    }
                });
            }
        };

        return (
            <div style={{ marginTop: '25px' }}>
                <Stack direction={'row'} width={"100%"} justifyContent={'right'}>
                    
                        
                <ToggleButtonGroup
    value={S_and_D}
    exclusive
    size="small"
    sx={{
        marginRight: '1%',
        backgroundColor: '#CACACA', // Default background color
        '& .MuiToggleButton-root': {
            color: 'black', // Default text color for unselected buttons
            backgroundColor: '#CACACA', // Background color for unselected buttons
            border: 'none', // Optional: Remove border if needed
            '&:hover': {
                backgroundColor: '#B0B0B0', // Optional: Slightly darker grey on hover
            },
        },
        '& .Mui-selected': {
            backgroundColor: 'black', // Background color when selected
            color: '#FFFFFF', // Text color when selected
            '&:hover': {
                backgroundColor: 'black', // Maintain black on hover
            },
        },
    }}
>
    <ToggleButton
        value={0}
        key="left"
        sx={{
            height: '30px',
            width: '80px',
            fontSize: '10px',
            textTransform: 'capitalize',
        }}
        onClick={() => {
            setS_and_D(0);
            let temp: any[] = [];
            chartRef1.current.data.datasets.forEach((dataset: { label: any }, datasetIndex: any) => {
                temp.push(dataset.label);
                chartRef1.current.setDatasetVisibility(datasetIndex, true);
            });
            chartRef1.current.update();
            chartRef2.current.data.datasets.forEach((dataset: { label: any }, datasetIndex: any) => {
                temp.push(dataset.label);
                chartRef2.current.setDatasetVisibility(datasetIndex, true);
            });
            chartRef2.current.update();
            chartRef3.current.data.datasets.forEach((dataset: { label: any }, datasetIndex: any) => {
                temp.push(dataset.label);
                chartRef3.current.setDatasetVisibility(datasetIndex, true);
            });
            chartRef3.current.update();
            setSelectedLegends(temp.filter((val) => val != ''));
        }}
    >
        Select all
    </ToggleButton>
    <ToggleButton
        value={1}
        key="right"
        sx={{
            height: '30px',
            width: '80px',
            fontSize: '10px',
            textTransform: 'capitalize',
        }}
        onClick={() => {
            setS_and_D(1);
            chartRef1.current.data.datasets.forEach((_dataset: any, datasetIndex: any) => {
                chartRef1.current.setDatasetVisibility(datasetIndex, false);
            });
            chartRef1.current.update();
            chartRef2.current.data.datasets.forEach((_dataset: any, datasetIndex: any) => {
                chartRef2.current.setDatasetVisibility(datasetIndex, false);
            });
            chartRef2.current.update();
            chartRef3.current.data.datasets.forEach((_dataset: any, datasetIndex: any) => {
                chartRef3.current.setDatasetVisibility(datasetIndex, false);
            });
            chartRef3.current.update();
            setSelectedLegends([]);
        }}
    >
        Deselect all
    </ToggleButton>
</ToggleButtonGroup>

                           
                        </Stack>
                   
                
                <Stack width={'100%'} height={'100%'} direction={'row'} justifyContent={'center'} divider={
                    <Divider orientation='vertical' flexItem sx={{ marginLeft: '1%', backgroundColor: '#505050', color: '#505050' }} />
                }>
                    <Stack height={'100%'} width={'95%'} sx={{ backgroundColor: '' }} spacing={'5%'} marginRight={'auto'} marginLeft={'2%'} marginTop={'2%'}>
                        <Bar ref={chartRef1} options={temperatureOption as ChartOptions<'bar'>} data={temperatureData} height={"100%"} plugins={[temperatureLegendPlugin]} />
                        <div id="legend-container"></div>
                        <Divider />
                        <Bar ref={chartRef2} options={pulseoximeterOption as ChartOptions<'bar'>} data={pulseoximeterData} height={'100%'} plugins={[temperatureLegendPlugin]} />
                        <div id="legend-container2"></div>
                        <Divider />
                        <Bar ref={chartRef3} options={weightOption as ChartOptions<'bar'>} data={weightData} height={'100%'} plugins={[temperatureLegendPlugin]} />
                        <div id="legend-container3"></div>
                    </Stack>
                </Stack>
            </div>
        );
    }, []);
    
    return (
        <React.Fragment>
            <Box justifyContent={'center'} textAlign={'center'} width={'100%'} marginTop={"20px"} sx={{ backgroundColor: '#ffffff', borderRadius: '25px' }}>
            
        <Typography variant="h6" sx={{ color: "#0F3B61" }}>Trends</Typography>
       

                   
                    {graphDataDisplay}
               
            </Box>
        </React.Fragment>
    );
};