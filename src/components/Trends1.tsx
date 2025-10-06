import { Box, Stack, Divider, ToggleButtonGroup, ToggleButton, Button, Dialog, DialogActions, DialogContent, TextField, DialogTitle, Typography, InputAdornment, CircularProgress } from '@mui/material'
import React, { FC, useEffect, useMemo, useRef, useState } from 'react'
import { ChartOptions, LegendItem, Plugin } from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { Chart, CategoryScale } from 'chart.js';
import annotationPlugin from "chartjs-plugin-annotation";

import { PDFDocument } from "pdf-lib";
Chart.register(annotationPlugin);
Chart.register(CategoryScale);

export interface DeviceDetails {
 
    device_id: string;
    patient_resource_id: string;
    device_resource_id: string;
    observation_resource: {
      "resourceType": string;
      "id": string;
      "effectiveDateTime": string;
      "meta": {
          "versionId": string;
          "lastUpdated": string;
      },
      "identifier": 
          {
              "value": string;
          }[];
      "status": string;
      "category":
          {
              "coding":
                  {
                      "system": string;
                      "code": string;
                      "display": string;
                  }[];
          }[];
      "code": {
          "coding": 
              {
                  "system": string;
                  "code": string;
                  "display": string;
              }[];
          
          "text": string;
      };
      "subject": {
          "reference": string;
      };
      "device": {
          "reference": string;
      };
      "component": 
          {
              "code": {
                  "coding": 
                      {
                          "system": string;
                          "code": string;
                          "display": string;
                      }[];
                  "text": string;
              };
              "valueQuantity": {
                  "value": number;
                  "unit": string;
                  "system": string;
                  "code": string;
              };
          }[];
    };
    
            darkTheme:boolean;
            selectedIcon:string
            }
type TemperatureData = {
labels: any[];
datasets: any[]; 
};
interface VitalsData {
    hr: string;
    pr: string;
    rr: string;
    spo2: string;
    skinTemp: string;
    coreTemp: string;
    bp: string;
    observation: string;
  }
  interface ManualEntryDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (vitals: VitalsData) => void;
  }
export const Trends1: FC<DeviceDetails> = (props): JSX.Element => {
    const [selectedLegends, setSelectedLegends] = useState<any>([])
    const chartRef1 = useRef<any | null>(null);
    const chartRef2 = useRef<any | null>(null);
    const [graphData, setGraphData] = useState(false)
   
    const [observation, setObservation] = useState<{
        resource: {
          component: {
            code: { text: string };
            valueQuantity: { value: number; unit: string };
          }[];
          effectiveDateTime: string;
        };
      }[]>([]);
      



// changes 
const getOrCreateLegendList = (_chart: any, id: string) => {
  const legendContainer = document.getElementById(id);
  let listContainer = legendContainer!.querySelector('div');
  if (!listContainer) {
    listContainer = document.createElement('div');
    listContainer.style.display = 'flex';
    listContainer.style.flexDirection = 'row';
    listContainer.style.flexWrap = 'wrap'

    listContainer.className = 'listContainer';
    legendContainer!.appendChild(listContainer);
  }

  return listContainer;
};   
const temperatureLegendPlugin: Plugin = {
  
  id: 'htmlLegend',
  afterUpdate(chart, _args, options) {
      const ul = getOrCreateLegendList(chart, options.containerID);
    // Remove old legend items
    while (ul.firstChild) {
      ul.firstChild.remove();
    }
    ul.style.margin = '0px';
    ul.style.padding = '0px';
    ul.style.lineHeight = '300%';
    ul.style.gap='5%';
    // Reuse the built-in legendItems generator
   

    
    const items: LegendItem[] = chart.options?.plugins?.legend?.labels?.generateLabels?.(chart) || [];

items.forEach((item) => {
if (item.text !== '') {
          const li = document.createElement('div');
          li.style.alignItems = 'left';
          li.style.cursor = 'pointer';
          li.style.display = 'flex';
          li.style.flexDirection = 'row';
          // li.style.flexWrap = 'wrap'
          li.style.padding = '0px';
          li.style.margin = '0px';
          // li.style.backgroundColor= 'red';
    
          li.onclick = () => {
  
            const type = (chart.config as any)?.type;
           
            if (type === 'pie' || type === 'doughnut') {
              // Pie and doughnut charts only have a single dataset and visibility is per item
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
    
          // Color box
          const boxSpan = document.createElement('span');
          boxSpan.style.background = item.hidden ? 'transparent' : (typeof item.fillStyle === 'string' ? item.fillStyle : 'transparent');
          // boxSpan.style.borderColor = item.strokeStyle;
          boxSpan.style.border = `2px solid ${item.strokeStyle}`;
          boxSpan.style.display = 'inline-block';
          boxSpan.style.flexShrink = '0px';
          boxSpan.style.height = '20px'; // Added height
          boxSpan.style.marginRight = '5px';
          boxSpan.style.width = '20px';
          boxSpan.style.borderRadius = '8px'

    
          // Text
          const textContainer = document.createElement('p');
          textContainer.style.fontSize = '12px'
          textContainer.style.color ='black';
          textContainer.style.marginTop = '-12px';
          textContainer.style.padding = '0px';
          // textContainer.style.textDecoration = item.hidden ? 'line-through' : '';
    
          const text = document.createTextNode("- "+item.text);
          textContainer.appendChild(text);
    
          li.appendChild(boxSpan);
          li.appendChild(textContainer);
          ul.appendChild(li);
      }

    });
  }
};

const [timeFrame, setTimeFrame] = useState<number>(0);
    const [times, setTimes] = useState<Array<any>>([])
    const [dataset, setDataSet] = useState([[{}]])
    const [loading, setLoading] = useState(false);
    const [dataSource, setDataSource] = useState('device'); // 'device' or 'manual'
    const heaterYaxis = {
        "%": "y",
        "C": "y1",
        "C°": "y1"
    };
    const pulseoximeterYaxis = {
      "%": "y",
      'BPM': "y1"
  }
  const [deviceData, setDeviceData] = useState<any[]>([]);
const [manualData, setManualData] = useState<any[]>([]);

  const temperatureOption = {
    animation: false,
    tension: 0.3,
    responsive: true,

    // legend: {
    //     position: 'bottom'
    // },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    
    stacked: false,
    plugins: {
        decimation:{
            enabled: true,
            algorithm: 'min-max',
        },
      colors: {
        forceOverride: true
      },
      legend: {
        display: false,
      },
     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
     //   @ts-ignore
      htmlLegend: {
        // ID of the container to put the legend in
        containerID: 'legend-container',
      },
      zoom: {
        // pan: {
        //     enabled: true,
        //     mode: 'x',
        // },
        zoom: {
            // pinch: {
            //     enabled: true       // Enable pinch zooming
            // },
            wheel: {
                enabled: true,       // Enable wheel zooming
                modifierKey: 'ctrl'
            },
            
            mode: 'x',

        }
    }
    },
    scales: {
        
        x: {
            ticks: {
           
                color:'black',
                autoSkip: true,
                maxTicksLimit: 10
            },
            border: {
                display: true
            },
            grid: {
                display: true,
                drawOnChartArea: true,
                drawTicks: true,
                color:'black'
            },
            
        },
      y: {      // Celcius
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        grid: {
            color: 'black',
            drawOnChartArea: true,
          },
        title: {
            color:'black',
            display: true,
            text: "Percentage (%)"
        },
        ticks: {
            color:'black'// Set the color of the scale values (ticks) to red
        }
      },
      y1: {     // %
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
            color: 'black',  
          drawOnChartArea: false,
        },
        title: {
            color:'black',
            display: true,
            text: "Temperature (C°)"
        },
        ticks: {
            color:'black'// Set the color of the scale values (ticks) to red
        }
      },
      
    },
};
const temperatureOption1: ChartOptions<"line"> = {
  animation: false,
  tension: 0.3,
  responsive: true,
  interaction: {
    mode: "index",
    intersect: false,
  },
  stacked: false,
  plugins: {
    decimation: {
      enabled: true,
      algorithm: "min-max",
    },
    colors: {
      forceOverride: true,
    },
    legend: {
      display: false,
    },
    htmlLegend: {
      containerID: "legend-container-manual-temp",
    },
    zoom: {
      zoom: {
        pinch: { enabled: true },
        wheel: { enabled: true, modifierKey: "ctrl" },
        mode: "x",
      },
    },
    annotation: {
      annotations: {
        redLow: {
          type: "box",
          yMin: 35,   // start at chart min
          yMax: 36,
          backgroundColor: "rgba(255, 0, 0, 0.2)", // red
          borderWidth: 0,
        },
        orange: {
          type: "box",
          yMin: 36,
          yMax: 36.5,
          backgroundColor: "rgba(255, 165, 0, 0.2)", // orange
          borderWidth: 0,
        },
        yellow: {
          type: "box",
          yMin: 37.5,
          yMax: 38,
          backgroundColor: "rgba(255, 255, 0, 0.2)", // yellow
          borderWidth: 0,
        },
        redHigh: {
          type: "box",
          yMin: 38,
          yMax: 40,   // end at chart max
          backgroundColor: "rgba(255, 0, 0, 0.2)", // red
          borderWidth: 0,
        },
      },
    },
  
  },
  scales: {
    x: {
      ticks: {
        color: "black",
        autoSkip: true,
        maxTicksLimit: 10,
      },
      border: {
        display: true,
      },
    },
    y: {
      type: "linear",
      display: true,
      position: "left",
      title: {
        color: "black",
        display: true,
        text: "Temperature (°C)",
      },
      ticks: {
        color: "black",
      },
    },
  },
};

    const pulseoximeterOption = {
      animation: false,
      tension: 0.3,
      responsive: true,
      // legend: {
      //     position: 'bottom'
      // },
      interaction: {
        mode: 'index' as const,
        intersect: false,
      },
      stacked: false,
      plugins: {
          decimation:{
              enabled: true,
              algorithm: 'min-max',
          },
        colors: {
          forceOverride: true
        },
        legend: {
          display: false
        },
        htmlLegend: {
          // ID of the container to put the legend in
          containerID: 'legend-container2',
        },
        zoom: {

          zoom: {
              wheel: {
                  enabled: true,       // Enable wheel zooming
                  modifierKey: 'ctrl'
              },
              mode: 'x',
          }
      }
      },
      scales: {
          x: {
              ticks: {
                  color:'black',
                  autoSkip: true,
                  maxTicksLimit: 10
              }
          },
        y: {      // Celcius
          type: 'linear' as const,
          display: true,
          position: 'left' as const,
          title: {
              color:'black',
              display: true,
              text: "Percentage (%)"
          },
          ticks: {
              color:'black' // Set the color of the scale values (ticks) to red
          },
          grid: {
              color: '#303030',
              drawOnChartArea: true,
            },
            
        },
        y1: {     // %
          type: 'linear' as const,
          display: true,
          position: 'right' as const,
          grid: {
              drawOnChartArea: false,
            },
          title: {
              color:'black',
              display: true,
              text: "Beats Per Minuite (BPM)"
          },
          ticks: {
              color:'black' // Set the color of the scale values (ticks) to red
          }
        },
      },
  };

  const pulseoximeterOption1 = {
    animation: false,
    tension: 0.3,
    responsive: true,
    // legend: {
    //     position: 'bottom'
    // },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    stacked: false,
    plugins: {
        decimation:{
            enabled: true,
            algorithm: 'min-max',
        },
      colors: {
        forceOverride: true
      },
      legend: {
        display: false
      },
      htmlLegend: {
        // ID of the container to put the legend in
        containerID: 'legend-container-manual-pulse',
      },
      zoom: {

        zoom: {
            wheel: {
                enabled: true,       // Enable wheel zooming
                modifierKey: 'ctrl'
            },
            mode: 'x',
        }
    }
    },
    scales: {
        x: {
            ticks: {
                color:'black',
                autoSkip: true,
                maxTicksLimit: 10
            }
        },
      y: {      // Celcius
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
            color:'black',
            display: true,
            text: "Percentage (%)"
        },
        ticks: {
            color:'black' // Set the color of the scale values (ticks) to red
        },
        grid: {
            color: '#303030',
            drawOnChartArea: true,
          },
          
      },
    
    },
};

const pulseoximeterOption2 = {
  animation: false,
  tension: 0.3,
  responsive: true,
  // legend: {
  //     position: 'bottom'
  // },
  interaction: {
    mode: 'index' as const,
    intersect: false,
  },
  stacked: false,
  plugins: {
      decimation:{
          enabled: true,
          algorithm: 'min-max',
      },
    colors: {
      forceOverride: true
    },
    legend: {
      display: false
    },
    htmlLegend: {
      // ID of the container to put the legend in
      containerID: 'legend-container-manual-spo2',
    },
    zoom: {

      zoom: {
          wheel: {
              enabled: true,       // Enable wheel zooming
              modifierKey: 'ctrl'
          },
          mode: 'x',
      }
  }
  },
  scales: {
      x: {
          ticks: {
              color:'black',
              autoSkip: true,
              maxTicksLimit: 10
          }
      },
    y: {      // Celcius
      type: 'linear' as const,
      display: true,
      position: 'left' as const,
      title: {
          color:'black',
          display: true,
          text: "Beats Per Minuite (BPM)"
      },
      ticks: {
          color:'black' // Set the color of the scale values (ticks) to red
      },
      grid: {
          color: '#303030',
          drawOnChartArea: true,
        },
        
    },
    // y1: {     // %
    //   type: 'linear' as const,
    //   display: true,
    //   position: 'right' as const,
    //   grid: {
    //       drawOnChartArea: false,
    //     },
    //   title: {
    //       color:'black',
    //       display: true,
    //       text: "Beats Per Minuite (BPM)"
    //   },
    //   ticks: {
    //       color:'black' // Set the color of the scale values (ticks) to red
    //   }
    // },
  },
};
const pulseoximeterOption3 = {
  animation: false,
  tension: 0.3,
  responsive: true,
  // legend: {
  //     position: 'bottom'
  // },
  interaction: {
    mode: 'index' as const,
    intersect: false,
  },
  stacked: false,
  plugins: {
      decimation:{
          enabled: true,
          algorithm: 'min-max',
      },
    colors: {
      forceOverride: true
    },
    legend: {
      display: false
    },
    htmlLegend: {
      // ID of the container to put the legend in
      containerID: 'legend-container-manual-RR',
    },
    zoom: {

      zoom: {
          wheel: {
              enabled: true,       // Enable wheel zooming
              modifierKey: 'ctrl'
          },
          mode: 'x',
      }
  }
  },
  scales: {
      x: {
          ticks: {
              color:'black',
              autoSkip: true,
              maxTicksLimit: 10
          }
      },
    y: {      // Celcius
      type: 'linear' as const,
      display: true,
      position: 'left' as const,
      title: {
          color:'black',
          display: true,
          text: "Breaths per minute (BPM)"
      },
      ticks: {
          color:'black' // Set the color of the scale values (ticks) to red
      },
      grid: {
          color: '#303030',
          drawOnChartArea: true,
        },
        
    },
    // y: {     // %
    //   type: 'linear' as const,
    //   display: true,
    //   position: 'right' as const,
    //   grid: {
    //       drawOnChartArea: false,
    //     },
    //   title: {
    //       color:'black',
    //       display: true,
    //       text: "Beats Per Minuite (BPM)"
    //   },
    //   ticks: {
    //       color:'black' // Set the color of the scale values (ticks) to red
    //   }
    // },
  },
};
    const [temperatureData, setTemperatureData] = useState<TemperatureData>({
        labels: [], // Initially, there are no labels
        datasets: [], // Initially, there are no datasets
    })
    const [fullData24h, setFullData24h] = useState<any[]>([]);
    const [pulseoximeterData, setPulseoximeterData] = useState<TemperatureData>({
      labels: [], // Initially, there are no labels
      datasets: [], // Initially, there are no datasets
      })
    
       
    const temperatureLegendPlugin1: Plugin = {
        
        id: 'htmlLegend',
        afterUpdate(chart, _args, options) {
            const ul = getOrCreateLegendList(chart, options.containerID);
          // Remove old legend items
          while (ul.firstChild) {
            ul.firstChild.remove();
          }
          ul.style.margin = '0px';
          ul.style.padding = '0px';
          ul.style.lineHeight = '300%';
          ul.style.gap='5%';
          
          const items: LegendItem[] = chart.options?.plugins?.legend?.labels?.generateLabels?.(chart) || [];

items.forEach((item) => {
  if (item.text !== '') {
                const li = document.createElement('div');
                li.style.alignItems = 'left';
                li.style.cursor = 'pointer';
                li.style.display = 'flex';
                li.style.flexDirection = 'row';
                // li.style.flexWrap = 'wrap'
                li.style.padding = '0px';
                li.style.margin = '0px';
                // li.style.backgroundColor= 'red';
          
                li.onclick = () => {
                  
                  const type = (chart.config as any)?.type;
                 
                  if (type === 'pie' || type === 'doughnut') {
                    // Pie and doughnut charts only have a single dataset and visibility is per item
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
          
                // Color box
                const boxSpan = document.createElement('span');
                boxSpan.style.background = item.hidden ? 'transparent' : (typeof item.fillStyle === 'string' ? item.fillStyle : 'transparent');
                // boxSpan.style.borderColor = item.strokeStyle;
                boxSpan.style.border = `2px solid ${item.strokeStyle}`;
                boxSpan.style.display = 'inline-block';
                boxSpan.style.flexShrink = '0px';
                boxSpan.style.height = '20px'; // Added height
                boxSpan.style.marginRight = '5px';
                boxSpan.style.width = '20px';
                boxSpan.style.borderRadius = '8px'
    
          
                // Text
                const textContainer = document.createElement('p');
                textContainer.style.fontSize = '12px'
                textContainer.style.color = 'black';
                textContainer.style.marginTop = '-12px';
                textContainer.style.padding = '0px';
                // textContainer.style.textDecoration = item.hidden ? 'line-through' : '';
          
                const text = document.createTextNode("- "+item.text);
                textContainer.appendChild(text);
          
                li.appendChild(boxSpan);
                li.appendChild(textContainer);
                ul.appendChild(li);
            }

          });
        }
    };
    const [rendergraph, setrendergraph] = useState(false)

    useEffect(() => {
      setTemperatureData(() => {
          if(dataset[0]?.length > 1) {
              return (
                  {
                      labels,
                      datasets: dataset[0]
                  }
              )
          }
          else {
              return (
                  {
                      labels: [],
                      datasets: []
                  }
              )
          }
      })
      setPulseoximeterData(() => {
          if(dataset[1]?.length > 1) {
              
              return (
                  {
                      labels,
                      datasets: dataset[1]
                  }
              )
          }
          else {
              return (
                  {
                      labels: [],
                      datasets: []
                  }
              )
          }
      })
    

      setGraphData(true)
      setrendergraph(!rendergraph)
  },[times])
   
 
    // const handleAddEntry = async () => {
    //     try {
    //       // Create the FHIR Observation resource
    //       const observationResource = {
    //         resourceType: "Observation",
    //         status: "final",
    //         category: [
    //           {
    //             coding: [
    //               {
    //                 system: "http://terminology.hl7.org/CodeSystem/observation-category",
    //                 code: "vital-signs",
    //                 display: "Vital Signs"
    //               }
    //             ]
    //           }
    //         ],
    //         code: {
    //           coding: [
    //             {
    //               system: "http://loinc.org",
    //               code: "85353-1",
    //               display: "Vital signs panel"
    //             }
    //           ],
    //           text: "Vital signs panel"
    //         },
    //         subject: {
    //           reference:  `Patient/${props.patient_resource_id}`// Replace with actual patient ID
    //         },
    //         effectiveDateTime: new Date().toISOString(),
    //         component: [
    //           // Add components for each vital sign
    //           ...(vitals.hr ? [{
    //             code: {
    //               coding: [
    //                 {
    //                   system: "http://loinc.org",
    //                   code: "8867-4",
    //                   display: "Heart rate"
    //                 }
    //               ],
    //               text: "Heart rate"
    //             },
    //             valueQuantity: {
    //               value: parseFloat(vitals.hr),
    //               unit: "BPM",
    //               system: "http://unitsofmeasure.org",
    //               code: "BPM"
    //             }
    //           }] : []),
    //           ...(vitals.pr ? [{
    //             code: {
    //               coding: [
    //                 {
    //                   system: "http://loinc.org",
    //                   code: "8888-4",
    //                   display: "Pulse rate"
    //                 }
    //               ],
    //               text: "Pulse rate"
    //             },
    //             valueQuantity: {
    //               value: parseFloat(vitals.pr),
    //               unit: "BPM",
    //               system: "http://unitsofmeasure.org",
    //               code: "BPM"
    //             }
    //           }] : []),
    //           ...(vitals.rr ? [{
    //             code: {
    //               coding: [
    //                 {
    //                   system: "http://loinc.org",
    //                   code: "9279-1",
    //                   display: "Respiratory rate"
    //                 }
    //               ],
    //               text: "Respiratory rate"
    //             },
    //             valueQuantity: {
    //               value: parseFloat(vitals.rr),
    //               unit: "BPM",
    //               system: "http://unitsofmeasure.org",
    //               code: "BPM"
    //             }
    //           }] : []),
    //           ...(vitals.spo2 ? [{
    //             code: {
    //               coding: [
    //                 {
    //                   system: "http://loinc.org",
    //                   code: "20564-1",
    //                   display: "Oxygen saturation in Arterial blood"
    //                 }
    //               ],
    //               text: "SpO2"
    //             },
    //             valueQuantity: {
    //               value: parseFloat(vitals.spo2),
    //               unit: "%",
    //               system: "http://unitsofmeasure.org",
    //               code: "%"
    //             }
    //           }] : []),
    //           ...(vitals.skinTemp ? [{
    //             code: {
    //               coding: [
    //                 {
    //                   system: "http://loinc.org",
    //                   code: "60839-8",
    //                   display: "Skin temperature"
    //                 }
    //               ],
    //               text: "Skin temperature"
    //             },
    //             valueQuantity: {
    //               value: parseFloat(vitals.skinTemp),
    //               unit: "C°",
    //               system: "http://unitsofmeasure.org",
    //               code: "C°"
    //             }
    //           }] : []),
    //           ...(vitals.coreTemp ? [{
    //             code: {
    //               coding: [
    //                 {
    //                   system: "http://loinc.org",
    //                   code: "60839-8",
    //                   display: "Core body temperature"
    //                 }
    //               ],
    //               text: "Core temperature"
    //             },
    //             valueQuantity: {
    //               value: parseFloat(vitals.coreTemp),
    //               unit: "C°",
    //               system: "http://unitsofmeasure.org",
    //               code: "C°"
    //             }
    //           }] : []),
    //           ...(vitals.bp ? (() => {
    //             const bpValues = vitals.bp.split('/');
    //             if (bpValues.length === 2) {
    //               return [
    //                 {
    //                   code: {
    //                     coding: [
    //                       {
    //                         system: "http://loinc.org",
    //                         code: "8480-6",
    //                         display: "Systolic blood pressure"
    //                       }
    //                     ],
    //                     text: "Systolic blood pressure"
    //                   },
    //                   valueQuantity: {
    //                     value: parseFloat(bpValues[0]),
    //                     unit: "mm[Hg]",
    //                     system: "http://unitsofmeasure.org",
    //                     code: "mm[Hg]"
    //                   }
    //                 },
    //                 {
    //                   code: {
    //                     coding: [
    //                       {
    //                         system: "http://loinc.org",
    //                         code: "8462-4",
    //                         display: "Diastolic blood pressure"
    //                       }
    //                     ],
    //                     text: "Diastolic blood pressure"
    //                   },
    //                   valueQuantity: {
    //                     value: parseFloat(bpValues[1]),
    //                     unit: "mm[Hg]",
    //                     system: "http://unitsofmeasure.org",
    //                     code: "mm[Hg]"
    //                   }
    //                 }
    //               ];
    //             }   
    //             return [];
    //           })() : []),
    //         //   ...(vitals.observation ? [{
    //         //     code: {
    //         //       coding: [
    //         //         {
    //         //           system: "http://loinc.org",
    //         //           code: "69730-0",
    //         //           display: "Note"
    //         //         }
    //         //       ],
    //         //       text: "Note"
    //         //     },
    //         //     valueString: vitals.observation
    //         //   }] : [])
    //         ]
    //       };
      
    //       // Remove empty arrays
    //       observationResource.component = observationResource.component.filter(comp => comp !== null && comp !== undefined);
      
    //       // Send to server with correct FHIR content type
    //       const response = await fetch(`${import.meta.env.VITE_FHIRAPI_URL as string}/Observation`, {
    //         method: "POST",
    //         credentials: "omit",
    //         headers: {
    //           "Authorization": "Basic " + btoa("fhiruser:change-password"),
    //           "Content-Type": "application/fhir+json",
    //           "Accept": "application/fhir+json"
    //         },
    //         body: JSON.stringify(observationResource)
    //       });
          
       
    //       if (response.ok) {
    //         let result = null;
    //         const text = await response.text(); // get raw body
    //         if (text) {
    //           try {
    //             result = JSON.parse(text); // only parse if not empty
    //           } catch (e) {
    //             console.warn("Response is not JSON, raw text:", text);
    //           }
    //         }
    //         console.log("Observation created successfully:", result);
    //         alert("Vitals entry added successfully!");
    //       } else {
    //         const errorText = await response.text();
    //         console.error("Failed to create observation:", response.status, response.statusText, errorText);
    //         alert(`Failed to add vitals entry. Server returned: ${response.status} ${response.statusText}`);
    //       }
      
    //       // Close dialog and reset form
    //       setManualVitalsDialog(false);
    //       setVitals({
    //         hr: '',
    //         pr: '',
    //         rr: '',
    //         spo2: '',
    //         skinTemp: '',
    //         coreTemp: '',
    //         bp: '',
    //         observation: ''
    //       });
      
    //     } catch (error) {
    //       console.error('Error creating observation:', error);
    //       alert('An error occurred. Please try again.');
    //     }
    //   };
    
      const handleAddEntry = async () => {
        try {
          // First, try to find an existing Observation for this patient with vital-signs category
          const searchUrl = `${import.meta.env.VITE_FHIRAPI_URL as string}/Observation?subject=Patient/${props.patient_resource_id}&category=vital-signs&_sort=-date&_count=1`;
          
          const searchResponse = await fetch(searchUrl, {
            method: "GET",
            credentials: "omit",
            headers: {
              "Authorization": "Basic " + btoa("fhiruser:change-password"),
              "Accept": "application/fhir+json"
            }
          });
      
          let existingObservationId = null;
          
          if (searchResponse.ok) {
            const searchResult = await searchResponse.json();
            if (searchResult.entry && searchResult.entry.length > 0) {
              existingObservationId = searchResult.entry[0].resource.id;
              console.log("Found existing observation:", existingObservationId);
            }
          }
      
          let requestBody;
      
          if (existingObservationId) {
            // For UPDATE: Use the existing observation with the same structure but new values
            // First, get the full existing observation to maintain its structure
            const getResponse = await fetch(`${import.meta.env.VITE_FHIRAPI_URL as string}/Observation/${existingObservationId}`, {
              method: "GET",
              credentials: "omit",
              headers: {
                "Authorization": "Basic " + btoa("fhiruser:change-password"),
                "Accept": "application/fhir+json"
              }
            });
      
            if (getResponse.ok) {
              const existingObservation = await getResponse.json();
              
              // Update the existing observation with new values
              requestBody = {
                ...existingObservation,
                effectiveDateTime: new Date().toISOString(),
                component: [
                    // Add components for each vital sign
                    ...(vitals.hr ? [{
                      code: {
                        coding: [
                          {
                            system: "http://loinc.org",
                            code: "8867-4",
                            display: "Heart Rate"
                          }
                        ],
                        text: "Heart Rate"
                      },
                      valueQuantity: {
                        value: parseFloat(vitals.hr),
                        unit: "BPM",
                        system: "http://unitsofmeasure.org",
                        code: "BPM"
                      }
                    }] : []),
                    ...(vitals.pr ? [{
                      code: {
                        coding: [
                          {
                            system: "http://loinc.org",
                            code: "8888-4",
                            display: "Pulse Rate"
                          }
                        ],
                        text: "Pulse Rate"
                      },
                      valueQuantity: {
                        value: parseFloat(vitals.pr),
                        unit: "BPM",
                        system: "http://unitsofmeasure.org",
                        code: "BPM"
                      }
                    }] : []),
                    ...(vitals.rr ? [{
                      code: {
                        coding: [
                          {
                            system: "http://loinc.org",
                            code: "9279-1",
                            display: "Respiratory Rate"
                          }
                        ],
                        text: "Respiratory Rate"
                      },
                      valueQuantity: {
                        value: parseFloat(vitals.rr),
                        unit: "BPM",
                        system: "http://unitsofmeasure.org",
                        code: "BPM"
                      }
                    }] : []),
                    ...(vitals.spo2 ? [{
                      code: {
                        coding: [
                          {
                            system: "http://loinc.org",
                            code: "20564-1",
                            display: "SpO2"
                          }
                        ],
                        text: "SpO2"
                      },
                      valueQuantity: {
                        value: parseFloat(vitals.spo2),
                        unit: "%",
                        system: "http://unitsofmeasure.org",
                        code: "%"
                      }
                    }] : []),
                    ...(vitals.skinTemp ? [{
                      code: {
                        coding: [
                          {
                            system: "http://loinc.org",
                            code: "60839-8",
                            display: "Skin Temperature"
                          }
                        ],
                        text: "Skin Temperature"
                      },
                      valueQuantity: {
                        value: parseFloat(vitals.skinTemp),
                        unit: "C°",
                        system: "http://unitsofmeasure.org",
                        code: "C°"
                      }
                    }] : []),
                    ...(vitals.coreTemp ? [{
                      code: {
                        coding: [
                          {
                            system: "http://loinc.org",
                            code: "60839-8",
                            display: "Core Temperature"
                          }
                        ],
                        text: "Core Temperature"
                      },
                      valueQuantity: {
                        value: parseFloat(vitals.coreTemp),
                        unit: "C°",
                        system: "http://unitsofmeasure.org",
                        code: "C°"
                      }
                    }] : []),
                    ...(vitals.bp ? (() => {
                      const bpValues = vitals.bp.split('/');
                      if (bpValues.length === 2) {
                        return [
                          {
                            code: {
                              coding: [
                                {
                                  system: "http://loinc.org",
                                  code: "8480-6",
                                  display: "Systolic Blood Pressure"
                                }
                              ],
                              text: "Systolic Blood Pressure"
                            },
                            valueQuantity: {
                              value: parseFloat(bpValues[0]),
                              unit: "mm[Hg]",
                              system: "http://unitsofmeasure.org",
                              code: "mm[Hg]"
                            }
                          },
                          {
                            code: {
                              coding: [
                                {
                                  system: "http://loinc.org",
                                  code: "8462-4",
                                  display: "Diastolic Blood Pressure"
                                }
                              ],
                              text: "Diastolic Blood Pressure"
                            },
                            valueQuantity: {
                              value: parseFloat(bpValues[1]),
                              unit: "mm[Hg]",
                              system: "http://unitsofmeasure.org",
                              code: "mm[Hg]"
                            }
                          }
                        ];
                      }   
                      return [];
                    })() : []),
                  //   ...(vitals.observation ? [{
                  //     code: {
                  //       coding: [
                  //         {
                  //           system: "http://loinc.org",
                  //           code: "69730-0",
                  //           display: "Note"
                  //         }
                  //       ],
                  //       text: "Note"
                  //     },
                  //     valueString: vitals.observation
                  //   }] : [])
                  ].filter(comp => comp !== null && comp !== undefined)
              };
            } else {
              // If we can't get the existing observation, fall back to creating a new one
              existingObservationId = null;
            }
          }
      
          if (!existingObservationId) {
            // For CREATE: Build a new observation from scratch
            requestBody = {
              resourceType: "Observation",
              status: "final",
              category: [
                {
                  coding: [
                    {
                      system: "http://terminology.hl7.org/CodeSystem/observation-category",
                      code: "vital-signs",
                      display: "Vital Signs"
                    }
                  ]
                }
              ],
              code: {
                coding: [
                  {
                    system: "http://loinc.org",
                    code: "85353-1",
                    display: "Vital signs panel"
                  }
                ],
                text: "Vital signs panel"
              },
              subject: {
                reference: `Patient/${props.patient_resource_id}`
              },
              effectiveDateTime: new Date().toISOString(),
              component: [
                // Add components for each vital sign
                ...(vitals.hr ? [{
                  code: {
                    coding: [
                      {
                        system: "http://loinc.org",
                        code: "8867-4",
                        display: "Heart Rate"
                      }
                    ],
                    text: "Heart Rate"
                  },
                  valueQuantity: {
                    value: parseFloat(vitals.hr),
                    unit: "BPM",
                    system: "http://unitsofmeasure.org",
                    code: "BPM"
                  }
                }] : []),
                ...(vitals.pr ? [{
                  code: {
                    coding: [
                      {
                        system: "http://loinc.org",
                        code: "8888-4",
                        display: "Pulse Rate"
                      }
                    ],
                    text: "Pulse Rate"
                  },
                  valueQuantity: {
                    value: parseFloat(vitals.pr),
                    unit: "BPM",
                    system: "http://unitsofmeasure.org",
                    code: "BPM"
                  }
                }] : []),
                ...(vitals.rr ? [{
                  code: {
                    coding: [
                      {
                        system: "http://loinc.org",
                        code: "9279-1",
                        display: "Respiratory Rate"
                      }
                    ],
                    text: "Respiratory Rate"
                  },
                  valueQuantity: {
                    value: parseFloat(vitals.rr),
                    unit: "BPM",
                    system: "http://unitsofmeasure.org",
                    code: "BPM"
                  }
                }] : []),
                ...(vitals.spo2 ? [{
                  code: {
                    coding: [
                      {
                        system: "http://loinc.org",
                        code: "20564-1",
                        display: "SpO2"
                      }
                    ],
                    text: "SpO2"
                  },
                  valueQuantity: {
                    value: parseFloat(vitals.spo2),
                    unit: "%",
                    system: "http://unitsofmeasure.org",
                    code: "%"
                  }
                }] : []),
                ...(vitals.skinTemp ? [{
                  code: {
                    coding: [
                      {
                        system: "http://loinc.org",
                        code: "60839-8",
                        display: "Skin Temperature"
                      }
                    ],
                    text: "Skin Temperature"
                  },
                  valueQuantity: {
                    value: parseFloat(vitals.skinTemp),
                    unit: "C°",
                    system: "http://unitsofmeasure.org",
                    code: "C°"
                  }
                }] : []),
                ...(vitals.coreTemp ? [{
                  code: {
                    coding: [
                      {
                        system: "http://loinc.org",
                        code: "60839-8",
                        display: "Core Temperature"
                      }
                    ],
                    text: "Core Temperature"
                  },
                  valueQuantity: {
                    value: parseFloat(vitals.coreTemp),
                    unit: "C°",
                    system: "http://unitsofmeasure.org",
                    code: "C°"
                  }
                }] : []),
                ...(vitals.bp ? (() => {
                  const bpValues = vitals.bp.split('/');
                  if (bpValues.length === 2) {
                    return [
                      {
                        code: {
                          coding: [
                            {
                              system: "http://loinc.org",
                              code: "8480-6",
                              display: "Systolic Blood Pressure"
                            }
                          ],
                          text: "Systolic Blood Pressure"
                        },
                        valueQuantity: {
                          value: parseFloat(bpValues[0]),
                          unit: "mm[Hg]",
                          system: "http://unitsofmeasure.org",
                          code: "mm[Hg]"
                        }
                      },
                      {
                        code: {
                          coding: [
                            {
                              system: "http://loinc.org",
                              code: "8462-4",
                              display: "Diastolic Blood Pressure"
                            }
                          ],
                          text: "Diastolic Blood Pressure"
                        },
                        valueQuantity: {
                          value: parseFloat(bpValues[1]),
                          unit: "mm[Hg]",
                          system: "http://unitsofmeasure.org",
                          code: "mm[Hg]"
                        }
                      }
                    ];
                  }   
                  return [];
                })() : []),
              //   ...(vitals.observation ? [{
              //     code: {
              //       coding: [
              //         {
              //           system: "http://loinc.org",
              //           code: "69730-0",
              //           display: "Note"
              //         }
              //       ],
              //       text: "Note"
              //     },
              //     valueString: vitals.observation
              //   }] : [])
              ].filter(comp => comp !== null && comp !== undefined)
            };
          }
      
          let response;
          let url;
      
          if (existingObservationId) {
            // UPDATE existing observation
            url = `${import.meta.env.VITE_FHIRAPI_URL as string}/Observation/${existingObservationId}`;
            response = await fetch(url, {
              method: "PUT",
              credentials: "omit",
              headers: {
                "Authorization": "Basic " + btoa("fhiruser:change-password"),
                "Content-Type": "application/fhir+json",
                "Accept": "application/fhir+json"
              },
              body: JSON.stringify(requestBody)
            });
          } else {
            // CREATE new observation
            url = `${import.meta.env.VITE_FHIRAPI_URL as string}/Observation`;
            response = await fetch(url, {
              method: "POST",
              credentials: "omit",
              headers: {
                "Authorization": "Basic " + btoa("fhiruser:change-password"),
                "Content-Type": "application/fhir+json",
                "Accept": "application/fhir+json"
              },
              body: JSON.stringify(requestBody)
            });
          }
         
          if (response.ok) {
            let result = null;
            const text = await response.text();
            if (text) {
              try {
                result = JSON.parse(text);
              } catch (e) {
                console.warn("Response is not JSON, raw text:", text);
              }
            }
            console.log(`Observation ${existingObservationId ? 'updated' : 'created'} successfully:`, result);
            alert(`Vitals entry ${existingObservationId ? 'updated' : 'added'} successfully!`);
          } else {
            const errorText = await response.text();
            console.error(`Failed to ${existingObservationId ? 'update' : 'create'} observation:`, response.status, response.statusText, errorText);
            alert(`Failed to ${existingObservationId ? 'update' : 'add'} vitals entry. Server returned: ${response.status} ${response.statusText}`);
          }
      
          // Close dialog and reset form
          setManualVitalsDialog(false);
          setVitals({
            hr: '',
            pr: '',
            rr: '',
            spo2: '',
            skinTemp: '',
            coreTemp: '',
            bp: '',
            observation: ''
          });
      
        } catch (error) {
          console.error('Error processing observation:', error);
          alert('An error occurred. Please try again.');
        }
      };

      const handleAddEntry1 = async () => {
        try {
          // Create the FHIR Observation resource
          const observationResource = {
            resourceType: "Observation",
            status: "final",
            category: [
              {
                coding: [
                  {
                    system: "http://terminology.hl7.org/CodeSystem/observation-category",
                    code: "vital-signs",
                    display: "Vital Signs"
                  }
                ]
              }
            ],
            code: {
              coding: [
                {
                  system: "http://loinc.org",
                  code: "85353-1",
                  display: "Vital signs panel"
                }
              ],
              text: "Vital signs panel"
            },
            subject: {
              reference:  `Patient/${props.patient_resource_id}`// Replace with actual patient ID
            },
            effectiveDateTime: new Date().toISOString(),
            component: [
              // Add components for each vital sign
              ...(vitals.hr ? [{
                code: {
                  coding: [
                    {
                      system: "http://loinc.org",
                      code: "8867-4",
                      display: "Heart Rate"
                    }
                  ],
                  text: "Heart Rate"
                },
                valueQuantity: {
                  value: parseFloat(vitals.hr),
                  unit: "BPM",
                  system: "http://unitsofmeasure.org",
                  code: "BPM"
                }
              }] : []),
              ...(vitals.pr ? [{
                code: {
                  coding: [
                    {
                      system: "http://loinc.org",
                      code: "8888-4",
                      display: "Pulse Rate"
                    }
                  ],
                  text: "Pulse Rate"
                },
                valueQuantity: {
                  value: parseFloat(vitals.pr),
                  unit: "BPM",
                  system: "http://unitsofmeasure.org",
                  code: "BPM"
                }
              }] : []),
              ...(vitals.rr ? [{
                code: {
                  coding: [
                    {
                      system: "http://loinc.org",
                      code: "9279-1",
                      display: "Respiratory Rate"
                    }
                  ],
                  text: "Respiratory Rate"
                },
                valueQuantity: {
                  value: parseFloat(vitals.rr),
                  unit: "BPM",
                  system: "http://unitsofmeasure.org",
                  code: "BPM"
                }
              }] : []),
              ...(vitals.spo2 ? [{
                code: {
                  coding: [
                    {
                      system: "http://loinc.org",
                      code: "20564-1",
                      display: "SpO2"
                    }
                  ],
                  text: "SpO2"
                },
                valueQuantity: {
                  value: parseFloat(vitals.spo2),
                  unit: "%",
                  system: "http://unitsofmeasure.org",
                  code: "%"
                }
              }] : []),
              ...(vitals.skinTemp ? [{
                code: {
                  coding: [
                    {
                      system: "http://loinc.org",
                      code: "60839-8",
                      display: "Skin Temperature"
                    }
                  ],
                  text: "Skin Temperature"
                },
                valueQuantity: {
                  value: parseFloat(vitals.skinTemp),
                  unit: "C°",
                  system: "http://unitsofmeasure.org",
                  code: "C°"
                }
              }] : []),
              ...(vitals.coreTemp ? [{
                code: {
                  coding: [
                    {
                      system: "http://loinc.org",
                      code: "60839-8",
                      display: "Core Temperature"
                    }
                  ],
                  text: "Core Temperature"
                },
                valueQuantity: {
                  value: parseFloat(vitals.coreTemp),
                  unit: "C°",
                  system: "http://unitsofmeasure.org",
                  code: "C°"
                }
              }] : []),
              ...(vitals.bp ? (() => {
                const bpValues = vitals.bp.split('/');
                if (bpValues.length === 2) {
                  return [
                    {
                      code: {
                        coding: [
                          {
                            system: "http://loinc.org",
                            code: "8480-6",
                            display: "Systolic Blood Pressure"
                          }
                        ],
                        text: "Systolic Blood Pressure"
                      },
                      valueQuantity: {
                        value: parseFloat(bpValues[0]),
                        unit: "mm[Hg]",
                        system: "http://unitsofmeasure.org",
                        code: "mm[Hg]"
                      }
                    },
                    {
                      code: {
                        coding: [
                          {
                            system: "http://loinc.org",
                            code: "8462-4",
                            display: "Diastolic Blood Pressure"
                          }
                        ],
                        text: "Diastolic Blood Pressure"
                      },
                      valueQuantity: {
                        value: parseFloat(bpValues[1]),
                        unit: "mm[Hg]",
                        system: "http://unitsofmeasure.org",
                        code: "mm[Hg]"
                      }
                    }
                  ];
                }   
                return [];
              })() : []),
            //   ...(vitals.observation ? [{
            //     code: {
            //       coding: [
            //         {
            //           system: "http://loinc.org",
            //           code: "69730-0",
            //           display: "Note"
            //         }
            //       ],
            //       text: "Note"
            //     },
            //     valueString: vitals.observation
            //   }] : [])
            ]
          };
      
          // Remove empty arrays
          observationResource.component = observationResource.component.filter(comp => comp !== null && comp !== undefined);
      
          // Send to server with correct FHIR content type
          const response = await fetch(`${import.meta.env.VITE_FHIRAPI_URL as string}/Observation`, {
            method: "POST",
            credentials: "omit",
            headers: {
              "Authorization": "Basic " + btoa("fhiruser:change-password"),
              "Content-Type": "application/fhir+json",
              "Accept": "application/fhir+json"
            },
            body: JSON.stringify(observationResource)
          });
          
       
          if (response.ok) {
            let result = null;
            const text = await response.text(); // get raw body
            if (text) {
              try {
                result = JSON.parse(text); // only parse if not empty
              } catch (e) {
                console.warn("Response is not JSON, raw text:", text);
              }
            }
            console.log("Observation created successfully:", result);
            alert("Vitals entry added successfully!");
          } else {
            const errorText = await response.text();
            console.error("Failed to create observation:", response.status, response.statusText, errorText);
            alert(`Failed to add vitals entry. Server returned: ${response.status} ${response.statusText}`);
          }
      
          // Close dialog and reset form
          setManualVitalsDialog(false);
          setVitals({
            hr: '',
            pr: '',
            rr: '',
            spo2: '',
            skinTemp: '',
            coreTemp: '',
            bp: '',
            observation: ''
          });
      
        } catch (error) {
          console.error('Error creating observation:', error);
          alert('An error occurred. Please try again.');
        }
      };

    const [vitals, setVitals] = useState<VitalsData>({
        hr: '',
        pr: '',
        rr: '',
        spo2: '',
        skinTemp: '',
        coreTemp: '',
        bp: '',
        observation: ''
      });
    const labels = times;
    const [manualVitalsDialog, setManualVitalsDialog] = useState(false)
    
    const handleInputChange = (field: keyof VitalsData) => (event: React.ChangeEvent<HTMLInputElement>) => {
        setVitals({ ...vitals, [field]: event.target.value });
      };
    
     
    function getDataForGraph(page: number, when: string) {
        const accumulatedData: any[] = []
        var meta = 0;
        
        function fetchData(when: string, times: number): Promise<void> {
            console.log(`Fetching data for page ${page}, when ${when}, times ${times}`);
            
            return fetch(`${import.meta.env.VITE_FHIRAPI_URL as string}/Observation/190a20ad4a2-f989b337-d96f-4ce0-88ac-86976086122c/_history?_count=1000`, {
                credentials: "omit",
                method: "GET",
                headers: {
                    Authorization: "Basic " + btoa("fhiruser:change-password"),
                },
            })
            .then((response) => response.json())
            .then((data: any) => {
                console.log(`Response data received:`, data);
    
                if (data.total > 0) {
                    var lastpage = Math.floor(data.total / 10) + data.total % 10;
                    console.log(`Total records found: ${data.total}. Last page: ${lastpage}`);
                    
                    return fetch(`${import.meta.env.VITE_FHIRAPI_URL as string}/Observation/190a20ad4a2-f989b337-d96f-4ce0-88ac-86976086122c/_history?_count=1000`, {
                        credentials: "omit",
                        method: "GET",
                        headers: {
                            Authorization: "Basic " + btoa("fhiruser:change-password"),
                        },
                    })
                    .then((response) => response.json())
                    .then((data: any) => {
                        console.log(`Fetching last page data:`, data);
                        
                        if (data.entry[0].resource.meta.versionId != meta) {
                            console.log(`New versionId detected: ${data.entry[0].resource.meta.versionId}`);
                            meta = data.entry[0].resource.meta.versionId;
                            accumulatedData.push(data.entry[0]);
                        }
                        
                        if (timeFrame == 1 ? (times < 7) : (times < 14)) {
                            const newWhen = subtractDaysFromDate(when, 1);
                            console.log(`Continuing fetch for previous day: ${newWhen}`);
                            return fetchData(newWhen, times + 1); // Continue fetching recursively
                        }
                    })
                }
                
                if (timeFrame == 1 ? (times < 7) : (times < 14)) {
                    const newWhen = subtractDaysFromDate(when, 1);
                    console.log(`Continuing fetch for previous day: ${newWhen}`);
                    return fetchData(newWhen, times + 1); // Continue fetching recursively
                }
            })
        }
        
        return fetchData(when, 1).then(() => {
            console.log(`Data fetching completed. Accumulated data:`, accumulatedData);
            return accumulatedData;
        });
    }
    const prevDateRef = useRef<string>("");

    function subtractDaysFromDate(dateString: string, days: number) {
        const date = new Date(dateString);
        date.setDate(date.getDate() - days);
        console.log(date)
        return date.toISOString();
    }
    const downloadTrendsPDF = async () => {
        if (!chartRef1.current) return;
    
        try {
          // 1. Export chart as PNG
          const chartImage = chartRef1.current.toBase64Image("image/png");
          const pngImageBytes = await fetch(chartImage).then((res) => res.arrayBuffer());
    
          // 2. Load hospital PDF template (put chart1.pdf in /public/templates/)
          const existingPdfBytes = await fetch("/templates/chart1.pdf").then((res) =>
            res.arrayBuffer()
          );
          const pdfDoc = await PDFDocument.load(existingPdfBytes);
    
          // 3. Embed chart into the template
          const pngImage = await pdfDoc.embedPng(pngImageBytes);
          const firstPage = pdfDoc.getPages()[0];
          firstPage.drawImage(pngImage, {
            x: 610, // 🔹 adjust position
            y: 300,
            width: 550, // 🔹 adjust size
            height: 280,
          });
    
          // 4. Save & trigger download
          const pdfBytes = await pdfDoc.save();
          const blob = new Blob([pdfBytes], { type: "application/pdf" });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = "Trends_Report.pdf";
          link.click();
        } catch (error) {
          console.error("Error generating PDF:", error);
        }
    };

      // helper: downsample an array of points
     function downsample<T>(arr: T[], maxPoints: number): T[] {
  if (arr.length <= maxPoints) return arr;
  const step = Math.ceil(arr.length / maxPoints);
  return arr.filter((_, i) => i % step === 0);
      }
      function downsampleHourly(observations: any[], cutoff: Date, end: Date): any[] {
  // Map observations to hours
  const hoursMap: Record<string, any[]> = {};

  observations.forEach((obs) => {
    const ts = new Date(obs.resource.meta.lastUpdated);
    if (ts >= cutoff && ts <= end) {
      // Round to hour
      const hourKey = `${ts.getFullYear()}-${ts.getMonth()}-${ts.getDate()}-${ts.getHours()}`;
      if (!hoursMap[hourKey]) hoursMap[hourKey] = [];
      hoursMap[hourKey].push(obs);
    }
  });

  // For each hour, take the last observation (or average)
  const hourlyObservations = Object.keys(hoursMap)
    .sort() // chronological
    .map((hourKey) => {
      const batch = hoursMap[hourKey];
      return batch[batch.length - 1]; // last observation of the hour
      // Or compute average if needed:
      // return averageObservation(batch)
    });

  return hourlyObservations;
      }

      useEffect(() => {
  const obsId = "190a53303b0-109e626a-ce18-431a-bb4c-347e48081fab"; // ⚠️ Instead of a single ID, use subject or device ref if possible
  const currentTime = new Date("2024-07-22T07:10:07.234512Z");
  const cutoff = new Date("2024-07-20T07:10:07.234Z");
   console.log('cutoff',cutoff);
   
  setLoading(true);
  let collected: any[] = [];

  // fetch all Observations in last 24h
  fetchObservationsByDate(obsId, cutoff, currentTime, (batch) => {
    collected = [...collected, ...batch];
    setFullData24h(collected); // ✅ store ALL points
    setLoading(false);
  });
      }, []);
      
     const fetchObservationsByDate = async (
  obsId: string,
  cutoff: Date,
  end: Date,
  onBatch: (batch: any[]) => void
) => {
  console.log("⚡ Starting fetch for Observation history. ID:", obsId);
  console.log("⏱ Cutoff:", cutoff.toISOString(), "End:", end.toISOString());

  const baseUrl = `${import.meta.env.VITE_FHIRAPI_URL}/Observation/${obsId}/_history`;
  let url = `${baseUrl}?_count=1000&_since=2024-07-20T07:10:07.234Z`;
  let pageCount = 0;

  while (url) {
    console.log(`🔹 Fetching page #${pageCount + 1}:`, url);

    let res;
    try {
      res = await fetch(url, {
        headers: { Authorization: "Basic " + btoa("fhiruser:change-password") },
      });
      console.log("📡 Fetch result:", res);
    } catch (err) {
      console.error("❌ Network or fetch error:", err);
      break;
    }

    if (!res.ok) {
      console.error("❌ FHIR fetch failed:", res.status, await res.text());
      break;
    }

    let bundle;
    try {
      bundle = await res.json();
      console.log("📦 Bundle received:", bundle);
    } catch (err) {
      console.error("❌ Failed to parse JSON:", err);
      break;
    }

    if (!bundle.entry || bundle.entry.length === 0) {
      console.log("ℹ️ No entries found in this page → stopping fetch.");
      break;
    }

    console.log(`✅ Page #${pageCount + 1} contains entries:`, bundle.entry.length);

    const batch: any[] = [];
    for (const e of bundle.entry) {
      const ts = new Date(e.resource.effectiveDateTime ?? e.resource.meta.lastUpdated);
      if (ts >= cutoff && ts <= end) {
        batch.push(e);
      }
    }

    console.log(`📝 Batch after filtering by date:`, batch.length, "entries");

    if (batch.length > 0) {
      onBatch(batch.reverse()); // preserve chronological order
      console.log(`📤 Sent batch of ${batch.length} entries upstream via onBatch callback.`);
    }

    // ⚡ Follow pagination - Fix: Use base URL and extract only the query parameters
    const nextLink = bundle.link?.find((l: any) => l.relation === "next");
    if (nextLink && nextLink.url) {
      // Extract only the query parameters from the nextLink URL and append to baseUrl
      const nextUrl = new URL(nextLink.url);
      url = `${baseUrl}${nextUrl.search}`;
      console.log("➡️ Next page URL (corrected):", url);
      pageCount++;
    } else {
      url = null;
    }
  }

  console.log(`🎉 Fetch complete. Total pages fetched: ${pageCount}`);
      };
    async function fetchManualTrends(patientId: string) {
  console.log("📥 Fetching MANUAL observations for patient:", patientId);

  const url = `${import.meta.env.VITE_FHIRAPI_URL}/Observation/19980e35a20-77ec4c96-06d9-4051-a57b-3c755c5dac0e/_history`;
 console.log("manual url",url);
 
  const response = await fetch(url, {
    headers: {
      Authorization: "Basic " + btoa("fhiruser:change-password"), // change to your auth
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch manual observations");
  }

  const bundle = await response.json();

  // Parse bundle → extract components (HR, SpO₂, Temp, etc.)
  const parsed = bundle.entry?.map((e: any) => {
    const obs = e.resource;
    const time = obs.effectiveDateTime;

    const values: any = {};
    obs.component?.forEach((c: any) => {
      const label = c.code?.coding?.[0]?.display;
      const value = c.valueQuantity?.value;
      values[label] = value;
    });

    return { time, ...values };
  }) || [];

  return parsed.reverse(); // oldest → latest
    }
    useEffect(() => {
  if (dataSource === "manual" && props.patient_resource_id) {
    fetchManualTrends(props.patient_resource_id)
      .then((data) => setManualData(data))
      .catch((err) => console.error(err));
  }
    }, [dataSource, props.patient_resource_id]);

      useEffect(() => {
  if (fullData24h.length === 0) return;
  const currentTime = new Date("2024-07-22T07:10:07.234512Z");
  // const cutoff = new Date(currentTime.getTime() - timeFrame * 60 * 60 * 1000);
  const cutoff = new Date("2024-07-20T07:10:07.234Z");

  const filtered = fullData24h.filter((e) => {
    const ts = new Date(
      e.resource.effectiveDateTime ?? e.resource.meta.lastUpdated
    );
    return ts >= cutoff && ts <= currentTime;
  });

  // ✅ downsample hourly
  const hourlyData = timeFrame >= 24
    ? downsampleHourly(filtered, cutoff, currentTime)
    : filtered.length > 2000 ? downsample(filtered, 2000) : filtered;

  setObservation(hourlyData);
}, [timeFrame, fullData24h]);

function prepareManualTemperatureData(manualData: any[]) {
  return {
    labels: manualData.map((d) => new Date(d.time).toLocaleTimeString()),
    datasets: [
      {
        label: "Skin Temperature",
        data: manualData.map((d) => d["Skin Temperature"] || null),
        borderColor: "orange",
        backgroundColor: "orange",
        fill: false,
      },
      {
        label: "Core Temperature",
        data: manualData.map((d) => d["Core Temperature"] || null),
        borderColor: "red",
        backgroundColor: "red",
        fill: false,
      },
    ],
  };
}
function prepareManualPulseoximeterData(manualData: any[]) {
  return {
    labels: manualData.map((d) => new Date(d.time).toLocaleTimeString()),
    datasets: [
      {
        label: "SpO2",
        data: manualData.map((d) => d["SpO2"] || null),
        borderColor: "blue",
        backgroundColor: "blue",
        fill: false,
      },
      
    ],
  };
}
function prepareManualPulseoximeterDataspo2(manualData: any[]) {
  return {
    labels: manualData.map((d) => new Date(d.time).toLocaleTimeString()),
    datasets: [
      {
        label: "Heart Rate",
        data: manualData.map((d) => d["Heart Rate"] || null),
        borderColor: "green",
        backgroundColor: "green",
        fill: false,
      },
      {
        label: "Pulse Rate",
        data: manualData.map((d) => d["Pulse Rate"] || null),
        borderColor: "purple",
        backgroundColor: "purple",
        fill: false,
      },
      
    ],
  };
}
function prepareManualPulseoximeterDataRR(manualData: any[]) {
  return {
    labels: manualData.map((d) => new Date(d.time).toLocaleTimeString()),
    datasets: [
    
      {
        label: "Respiratory Rate",
        data: manualData.map((d) => d["Respiratory Rate"] || null),
        borderColor: "purple",
        backgroundColor: "purple",
        fill: false,
      },
      
    ],
  };
}


      useEffect(() => {
        console.log(observation)
        if(observation[1]?.resource?.component?.length>1){
            
            console.log('observation',observation)
            setTimes(observation.map((obs) => {
                let zeroth: {}[] = []
                let first: {}[] = []
                let second: {}[] = []
                let third: {}[] = []

                observation[1].resource.component.map((data, index) => {
                    if(data.valueQuantity.unit.toString() == "C°"  ){
                        let unit = data.valueQuantity.unit.toString() as keyof typeof heaterYaxis;
                        zeroth.push({
                            label: data.code.text.toString(),
                            data: observation.map((data2) => {
                                if(data2?.resource?.component){
                                    return (
                                        data2?.resource?.component[index]?.valueQuantity?.value.toString()
                                    )
                                }
                                
                            }),
                            yAxisID: heaterYaxis[unit] || "y"
                        })
                    }
                    else if(data.code.text.toString() == "Pulse Rate" ||data.code.text.toString() == "PI" || data.code.text.toString() == "SpO2" || data.code.text.toString() == "PVI"){
                        let unit2 = data.valueQuantity.unit.toString() as keyof typeof pulseoximeterYaxis;
                        first.push({
                            label: data.code.text.toString() ,
                            data: observation.map((data2) => {
                                if(data2?.resource?.component){
                                    return (
                                        data2?.resource?.component[index]?.valueQuantity?.value.toString()
                                    )
                                }
                            }),
                            yAxisID: pulseoximeterYaxis[unit2] || "y"
                        })
                    }
                                      
                })
                setDataSet([zeroth, first, second, third])
                var fd = new Date(obs.resource.meta.lastUpdated.toString())
                var t = fd.toLocaleTimeString()
                var d = fd.getDate()+"/"+(fd.getMonth()+1)
                
                return(
                    // new Date(obs.resource.meta.lastUpdated).toLocaleString())
                    d+"-"+t
                )
                }))
        }
             else{
            setTimes(observation.map((obs) => {

                let second = [{
                    label: "",
                    data: [] as string[],
                    yAxisID: "y"
                }]
                setDataSet([second, second, second, second])
                return(
                    new Date(obs?.resource?.meta.lastUpdated.toString()).toLocaleTimeString())
                }))
        }
            // setLoading(false)
    },[observation])

    const temperatureData1 = prepareManualTemperatureData(manualData);
    const pulseoximeterData1 = prepareManualPulseoximeterData(manualData);
    const pulseoximeterData2 =  prepareManualPulseoximeterDataspo2(manualData);
    const pulseoximeterData3 =  prepareManualPulseoximeterDataRR(manualData);

    const manualGraph = useMemo(() => {
       
      
      return (
          <Stack width={'100%'} height={'100%'} direction={'row'} justifyContent={'center'} divider={
              <Divider orientation='vertical' flexItem sx={{marginLeft:'1%',backgroundColor:'#505050', color:'#505050'}}/>
          }>
              <Stack height={'100%'} width={'95%'} spacing={'5%'} sx={{backgroundColor:'transparent'}}  marginRight={'auto'} marginLeft={'2%'} marginTop={'2%'}>
                 
                  <Line ref={chartRef1} options={temperatureOption1 as ChartOptions<'line'>} data={temperatureData1} height={"100%"} plugins={[temperatureLegendPlugin]} ></Line>
                  <div id="legend-container-manual-temp"></div>
                  
                 <Line
                  ref={chartRef2}
          options={pulseoximeterOption1 as ChartOptions<'line'>}
          data={pulseoximeterData1}
          height={"100%"}
          plugins={[temperatureLegendPlugin]}
        />
          <div id="legend-container-manual-pulse"></div>
          <Line
          options={pulseoximeterOption3 as ChartOptions<'line'>}
          data={pulseoximeterData3}
          height={"100%"}
          plugins={[temperatureLegendPlugin]}
        />
          <div id="legend-container-manual-RR"></div>
          <Line
          options={pulseoximeterOption2 as ChartOptions<'line'>}
          data={pulseoximeterData2}
          height={"100%"}
          plugins={[temperatureLegendPlugin]}
        />
          <div id="legend-container-manual-spo2"></div>

          
                  {/* <MyChart height={'100%'} forwardedRef={chartRef2} options={pulseoximeterOption as ChartOptions} data={pulseoximeterData} plugins={temperatureLegendPlugin} /> */}
                  {/* <Line ref={chartRef2} options={pulseoximeterOption as ChartOptions<'line'>} data={pulseoximeterData} height={'100%'} plugins={[temperatureLegendPlugin]}></Line>
                  <div id="legend-container2"></div> */}

              </Stack>
           

          </Stack>
      );


},[manualData])
    const manualGraph1 = useMemo(() => {
      if (!manualData.length) return <div>No manual data available</div>;
    
      const temperatureData = prepareManualTemperatureData(manualData);
      
    
      return (
        <Stack height={"100%"} width={"95%"} spacing={"5%"} sx={{ backgroundColor: "transparent" }}>
        
        <Line
          options={temperatureOption1 as ChartOptions<'line'>}
          data={temperatureData}
          height={"100%"}
          plugins={[temperatureLegendPlugin]}
        />
      <div id="legend-container-manual-temp"></div>
       

        
        <Line
          options={pulseoximeterOption1 as ChartOptions<'line'>}
          data={pulseoximeterData}
          height={"100%"}
          plugins={[temperatureLegendPlugin]}
        />
      </Stack>
      );
    }, [manualData]);
    
    useEffect(() => {console.log(selectedLegends)},[selectedLegends])
   
    const graph = useMemo(() => {
       
      
            return (
                <Stack width={'100%'} height={'100%'} direction={'row'} justifyContent={'center'} divider={
                    <Divider orientation='vertical' flexItem sx={{marginLeft:'1%',backgroundColor:'#505050', color:'#505050'}}/>
                }>
                    <Stack height={'100%'} width={'95%'} spacing={'5%'} sx={{backgroundColor:'transparent'}}  marginRight={'auto'} marginLeft={'2%'} marginTop={'2%'}>
                       
                        <Line ref={chartRef1} options={temperatureOption as ChartOptions<'line'>} data={temperatureData} height={"100%"} plugins={[temperatureLegendPlugin]} ></Line>
                        <div id="legend-container"></div>
                       
                        {/* <MyChart height={'100%'} forwardedRef={chartRef2} options={pulseoximeterOption as ChartOptions} data={pulseoximeterData} plugins={temperatureLegendPlugin} /> */}
                        <Line ref={chartRef2} options={pulseoximeterOption as ChartOptions<'line'>} data={pulseoximeterData} height={'100%'} plugins={[temperatureLegendPlugin]}></Line>
                        <div id="legend-container2"></div>

                    </Stack>
                 

                </Stack>
            );
     
     
    },[rendergraph,loading])

 
    return (
        <React.Fragment>
            <Box >
                 <div style={{padding:'2px'}}>
                                {   
                                        graphData && (<>
                                        
                                        <Stack direction={'row'}  width={"100%"} justifyContent={'space-between'}>
                                       
                                        <Stack width={'100%'} direction={'row-reverse'} textAlign={'start'} spacing={1}>
                {/* Device/Manual Toggle Button Group */}
                <ToggleButtonGroup
                  value={dataSource}
                  exclusive
                  size="small"
                  sx={{
                    backgroundColor: '#F5F5F5',
                    '& .MuiToggleButton-root': { 
                      color: 'black',
                      border: '1px solid #124D81',
                      fontWeight: 'bold'
                    },
                    '& .Mui-selected': {
                      backgroundColor: '#124D81 !important',
                      color: '#FFFFFF !important',
                    },
                  }}
                >
                  <ToggleButton 
                    value="device" 
                    key="device" 
                    sx={{
                      height: '30px', 
                      width: '70px', 
                      fontSize: '12px', 
                      textTransform: 'capitalize'
                    }} 
                    onClick={() => setDataSource('device')}
                  >
                    Device
                  </ToggleButton>
                  <ToggleButton 
                    value="manual" 
                    key="manual" 
                    sx={{
                      height: '30px', 
                      width: '70px', 
                      fontSize: '12px', 
                      textTransform: 'capitalize'
                    }} 
                    onClick={() => setDataSource('manual')}
                  >
                    Manual
                  </ToggleButton>
                </ToggleButtonGroup>

                {/* Time Frame Toggle Button Group */}
                <ToggleButtonGroup
                  value={timeFrame}
                  exclusive
                  size="small"
                  onChange={(_, newValue) => {
                    if (newValue !== null) setTimeFrame(newValue); // ✅ directly store hours
                  }}
                  sx={{
                    backgroundColor: '#F5F5F5',
                    '& .MuiToggleButton-root': { 
                      color: 'black',
                      border: '1px solid #124D81',
                      fontWeight: 'bold'
                    },
                    '& .Mui-selected': {
                      backgroundColor: '#124D81 !important',
                      color: '#FFFFFF !important',
                    },
                  }}
                >
                 <ToggleButton 
  value={3} 
  key="3hr" 
  sx={{ height: '30px', width: '50px', fontSize: '12px', textTransform: 'capitalize' }}
>
  3 Hr
                </ToggleButton>
                <ToggleButton 
  value={6} 
  key="6hr" 
  sx={{ height: '30px', width: '55px', fontSize: '12px', textTransform: 'capitalize' }}
>
  6 Hr
                </ToggleButton>
                <ToggleButton 
  value={12} 
  key="12hr" 
  sx={{ height: '30px', width: '58px', fontSize: '12px', textTransform: 'capitalize' }}
>
  12 Hr
                </ToggleButton>
            <ToggleButton 
                value={24} 
                key="24hr" 
                sx={{ height: '30px', width: '50px', fontSize: '12px', textTransform: 'capitalize' }}
                    >
                 24 Hr
            </ToggleButton>
            <ToggleButton 
  value={48} 
  key="48hr" 
  sx={{ height: '30px', width: '50px', fontSize: '12px', textTransform: 'capitalize' }}
>
  48 Hr
            </ToggleButton>

                </ToggleButtonGroup>
                
                {/* Action Buttons */}
                <Button
                  variant="contained"
                  color="primary"
                  sx={{
                    height: '30px',
                    fontSize: '12px',
                    textTransform: 'capitalize'
                  }}
                  onClick={downloadTrendsPDF}
                >
                  Download Trends PDF
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{
                    height: '30px',
                    fontSize: '12px',
                    textTransform: 'capitalize',
                    // Enable button only when Manual tab is selected
                    opacity: dataSource === 'manual' ? 1 : 0.6,
                    pointerEvents: dataSource === 'manual' ? 'auto' : 'none'
                  }}
                  onClick={() => setManualVitalsDialog(true)}
                >
                  Manual Entry
                </Button>

              </Stack>
                                      
                                        </Stack>
                                      
                                        {loading ? (
        <Stack alignItems="center" justifyContent="center" height="300px">
          <CircularProgress />
        </Stack>
      ) : (
        dataSource === "device" && graph
      )}
                                        
                                        {loading ? (
        <Stack alignItems="center" justifyContent="center" height="300px">
          <CircularProgress />
        </Stack>
      ) : (
        dataSource === "manual" && manualGraph
      )}                                    
                                        </>)
                                    }
                                    {
                                        !graphData && (<div></div>)
                                    } 
                                    <Divider sx={{marginTop:'40px', backgroundColor:'white', color:'white'}} />           
                                </div>
                                
                                <Dialog
  open={manualVitalsDialog}
  onClose={() => setManualVitalsDialog(false)}
  fullWidth
  maxWidth="xs"
  PaperProps={{
    sx: {
      backgroundColor: '#FFFFFF',
      color: '#000000',
      borderRadius: 3,
    },
  }}
>
<DialogTitle sx={{ fontWeight: 500, pb: 1, color: '#000000', textAlign: 'center' }}>
Add Vitals
</DialogTitle>

<DialogContent>
              <Stack spacing={2} sx={{ mt: 2 }}>
                <Stack direction="row" spacing={2}>
                  <TextField
                    label="HR"
                    value={vitals.hr}
                    InputProps={{
                        sx: {
                          backgroundColor: '#F5F5F5',
                          borderRadius: 1,
                          color: '#000',
                        },
                      }}
                      InputLabelProps={{ sx: { color: '#000' } }}
                      
                    onChange={handleInputChange('hr')}
                    fullWidth
                    placeholder="--- bpm"
                    
                  />
                  <TextField
                    label="PR"
                    value={vitals.pr}
                    onChange={handleInputChange('pr')}
                    fullWidth
                    placeholder="--- bpm"
                    InputProps={{
                        sx: {
                          backgroundColor: '#F5F5F5',
                          borderRadius: 1,
                          color: '#000',
                        },
                      }}
                      InputLabelProps={{ sx: { color: '#000' } }}
                  />
                </Stack>
                
                <Stack direction="row" spacing={2}>
                  <TextField
                    label="RR"
                    value={vitals.rr}
                    onChange={handleInputChange('rr')}
                    fullWidth
                    placeholder="--- bpm"
                    InputProps={{
                        sx: {
                          backgroundColor: '#F5F5F5',
                          borderRadius: 1,
                          color: '#000',
                        },
                      }}
                      InputLabelProps={{ sx: { color: '#000' } }}
                  />
                  <TextField
                    label="SpO2"
                    value={vitals.spo2}
                    onChange={handleInputChange('spo2')}
                    fullWidth
                    placeholder="--- %"
                    InputProps={{
                        sx: {
                          backgroundColor: '#F5F5F5',
                          borderRadius: 1,
                          color: '#000',
                        },
                      }}
                      InputLabelProps={{ sx: { color: '#000' } }}
                  />
                </Stack>
                
                <Stack direction="row" spacing={2}>
                  <TextField
                    label="Skin Temperature"
                    value={vitals.skinTemp}
                    onChange={handleInputChange('skinTemp')}
                    fullWidth
                    placeholder="--- °C"
                    InputProps={{
                        sx: {
                          backgroundColor: '#F5F5F5',
                          borderRadius: 1,
                          color: '#000',
                        },
                      }}
                      InputLabelProps={{ sx: { color: '#000' } }}
                  />
                  <TextField
                    label="Core Temperature"
                    value={vitals.coreTemp}
                    onChange={handleInputChange('coreTemp')}
                    fullWidth
                    placeholder="--- °C"
                    InputProps={{
                        sx: {
                          backgroundColor: '#F5F5F5',
                          borderRadius: 1,
                          color: '#000',
                        },
                      }}
                      InputLabelProps={{ sx: { color: '#000' } }}
                  />
                </Stack>
                
                {/* <TextField
                  label="Blood Pressure"
                  value={vitals.bp}
                  onChange={handleInputChange('bp')}
                  fullWidth
                  placeholder="-- mmHg"
                  InputProps={{
                    sx: {
                      backgroundColor: '#F5F5F5',
                      borderRadius: 1,
                      color: '#000',
                    },
                  }}
                  InputLabelProps={{ sx: { color: '#000' } }}
                /> */}
                
                <TextField
                  label="Observation Note"
                  value={vitals.observation}
                  onChange={handleInputChange('observation')}
                  fullWidth
                  InputProps={{
                    sx: {
                      backgroundColor: '#F5F5F5',
                      borderRadius: 1,
                      color: '#000',
                    },
                  }}
                  InputLabelProps={{ sx: { color: '#000' } }}
                  multiline
                  rows={3}
                  placeholder="Observation Notes"
                />
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button >Cancel</Button>
              <Button onClick={handleAddEntry} variant="contained" color="primary">
                Add Entry
              </Button>
            </DialogActions>
          </Dialog>
                                </Box>

        </React.Fragment>
    )
}

