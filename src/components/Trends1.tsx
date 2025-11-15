import { Box, Stack, Divider, ToggleButtonGroup, ToggleButton, Button, Dialog, DialogActions, DialogContent, TextField, DialogTitle, Typography,  CircularProgress, IconButton, Tooltip } from '@mui/material'
import React, { FC, useEffect, useMemo, useRef, useState } from 'react'
import { ChartOptions, LegendItem, Plugin } from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { Chart, CategoryScale } from 'chart.js';
import annotationPlugin from "chartjs-plugin-annotation";

import ThermostatIcon from '@mui/icons-material/Thermostat';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import DownloadIcon from '@mui/icons-material/Download';
import EditNoteIcon from '@mui/icons-material/EditNote';


import FavoriteIcon from "@mui/icons-material/Favorite";
import OpacityIcon from "@mui/icons-material/Opacity";
import DeviceThermostatIcon from "@mui/icons-material/DeviceThermostat";
import BoltIcon from "@mui/icons-material/Bolt";

Chart.register(annotationPlugin);
Chart.register(CategoryScale);

export interface PatientDetails {
  userOrganization: string;
    device_id: string;
    patient_resource_id: string;
    patient_name: string;
    patient_id: string;
    gestational_age: string;
    birth_date:string;
    
    device_resource_id: string;
     
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
  
export const Trends1: FC<PatientDetails> = (props): JSX.Element => {
    const [selectedLegends, setSelectedLegends] = useState<any>([])
    const chartRef1 = useRef<any | null>(null);
    const chartRef2 = useRef<any | null>(null);
    const chartRef3 = useRef<any | null>(null);
    const [graphData, setGraphData] = useState(false)
   
    const [observation, setObservation] = useState<{
        resource: {
          meta: any;
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

const [timeFrame, setTimeFrame] = useState<number>(12);
    const [times, setTimes] = useState<Array<any>>([])
    const [dataset, setDataSet] = useState([[{}]])
    const [loading, setLoading] = useState(false);
    const [dataSource, setDataSource] = useState('manual'); // 'device' or 'manual'
    const heaterYaxis = {
        "%": "y",
      
        "C°": "y"
    };
    const pulseoximeterYaxis = {
     
      'BPM': "y"
  }
  const spo2Yaxis = {
    "%": "y",
    
}
  
const [manualData, setManualData] = useState<any[]>([]);
const [step, setStep] = useState(1);

// const [manualTrends, setManualTrends] = useState<any[]>([]);
const [latestManual, setLatestManual] = useState<any | null>(null);


useEffect(() => {
  const loadManualTrends = async () => {
    const data = await fetchManualTrends(props.patient_resource_id);
    // setManualTrends(data);

    // ✅ Get the last element (latest)
    if (data.length > 0) {
      setLatestManual(data[data.length - 1]);
      console.log("🆕 Latest Manual:", data[data.length - 1]);
    } else {
      setLatestManual(null);
    }
  };

  loadManualTrends();
}, [props.patient_resource_id]);
const temperatureOption = {
  animation: false,
  
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
      containerID: "legend-container",
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
          yMin: 0,   // start at chart min
          yMax: 36,
          backgroundColor: "rgba(255, 0, 0, 0.2)", // red
          borderWidth: 0,
        },
        green: {
          type: "box",
          yMin: 36,
          yMax: 36.5,
          backgroundColor: "rgba(0, 128, 0, 0.2)", // green
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
          yMax: 42,   // end at chart max
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
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        min: 33,           // ✅ Start scale at 0
        max:42,         // ✅ End scale at 100
        title: {
          color: 'black',
          display: true,
          text: "Temperature (C°)"
        },
        ticks: {
          color: 'black',
          stepSize: 1,    // ✅ Increment by 10
        },
        grid: {
          color: 'grey',
          drawOnChartArea: true,
        },
      },
    // y1: {      // Celcius
    //   type: 'linear' as const,
    //   display: true,
    //   position: 'left' as const,
    //   grid: {
    //       color: 'black',
    //       drawOnChartArea: true,
    //     },
    //   title: {
    //       color:'black',
    //       display: true,
    //       text: "Temperature (C°)"
    //   },
    //   ticks: {
    //       color:'black'// Set the color of the scale values (ticks) to red
    //   }
    // },
   
    
  },
};

const pulseoximeterOption = {
      animation: false,
      // tension: 0.3,
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
      },
      annotation: {
        annotations: {
          purple: {
            type: "box",
            yMin: 0,   // start at chart min
            yMax: 60,
            backgroundColor: "rgba(128, 0, 128, 0.2)", // red
            borderWidth: 0,
          },
          redLow: {
            type: "box",
            yMin: 60,   // start at chart min
            yMax: 80,
            backgroundColor: "rgba(255, 0, 0, 0.2)", // red
            borderWidth: 0,
          },
          // orange: {
          //   type: "box",
          //   yMin: 60,
          //   yMax: 80,
          //   backgroundColor: "rgba(255, 165, 0, 0.2)", // orange
          //   borderWidth: 0,
          // },
          yellow: {
            type: "box",
            yMin: 80,
            yMax: 100,
            backgroundColor: "rgba(255, 255, 0, 0.2)", // yellow
            borderWidth: 0,
          },
          white: {
            type: "box",
            yMin: 100,
            yMax: 160,
            backgroundColor: "rgba(0, 0, 0, 0)", // yellow
            borderWidth: 0,
          },
          yellow1: {
            type: "box",
            yMin: 160,
            yMax: 175,
            backgroundColor: "rgba(255, 255, 0, 0.2)", // yellow
            borderWidth: 0,
          },
          redHigh: {
            type: "box",
            yMin: 175,
            yMax: 200,   // end at chart max
            backgroundColor: "rgba(255, 0, 0, 0.2)", // red
            borderWidth: 0,
          },
        },
      },
      },
      scales: {
          x: {
              ticks: {
                  color:'black',
                  autoSkip: true,
                  maxTicksLimit: 5
              }
          },
          
        // y1: {      // Celcius
        //   type: 'linear' as const,
        //   display: true,
        //   position: 'left' as const,
        //   title: {
        //       color:'black',
        //       display: true,
        //       text: "Beats Per Minuite (BPM)"
        //   },
        //   ticks: {
        //       color:'black' // Set the color of the scale values (ticks) to red
        //   },
        //   grid: {
        //       color: '#303030',
        //       drawOnChartArea: true,
        //     },
            
        // },
        y: {
          type: 'linear' as const,
          display: true,
          position: 'left' as const,
          min: 20,           // ✅ Start scale at 0
          max: 200,         // ✅ End scale at 100
          title: {
            color: "black",
            display: true,
            text: "Beats Per Minuite (BPM)",
          },
          ticks: {
            color: 'black',
            stepSize: 20,    // ✅ Increment by 15
          },
          grid: {
            color: 'grey',
            drawOnChartArea: true,
          },
        },
        // y1: {
        //   type: "linear",
        //   display: true,
        //   position: "left",
        //   title: {
        //     color: "black",
        //     display: true,
        //     text: "Beats Per Minuite (BPM)",
        //   },
        //   ticks: {
        //     color: "black",
        //   },
        // },
        // y1: {     // %
        //   type: 'linear' as const,
        //   display: true,
        //   position: 'left' as const,
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
 
const sp02Option = {
    animation: false,
    // tension: 0.3,
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
      colors: {
        forceOverride: true
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
      },
      annotation: {
        annotations: {
          purple: {
            type: "box",
            yMin: 0,   // start at chart min
            yMax: 90,
            backgroundColor: "rgba(128, 0, 128, 0.2)", // red
            borderWidth: 0,
          },
         
          yellow: {
            type: "box",
            yMin: 90,
            yMax: 95,
            backgroundColor: "rgba(255, 255, 0, 0.2)",
            borderWidth: 0,
          },
          white: {
            type: "box",
            yMin: 95,
            yMax: 100,
            backgroundColor: "rgba(0, 0, 0, 0)",
            borderWidth: 0,
          },
       
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: 'black',
          autoSkip: true,
          maxTicksLimit: 10
        }
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        min: 88,           // ✅ Start scale at 0
        max: 100,         // ✅ End scale at 100
        title: {
          color: 'black',
          display: true,
          text: "Percentage (%)"
        },
        ticks: {
          color: 'black',
          stepSize: 1,    // ✅ Increment by 10
        },
        grid: {
          color: 'grey',
          drawOnChartArea: true,
        },
      },
    },
  };
  
const pulseoximeterOption1 = {
    animation: false,
    // tension: 0.3,
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
    },
    
  annotation: {
    annotations: {
      purple: {
        type: "box",
        yMin: 40,   // start at chart min
        yMax: 60,
        backgroundColor: "rgba(128, 0, 128, 0.2)", // red
        borderWidth: 0,
      },
      redHigh: {
        type: "box",
        yMin: 60,
        yMax: 80,   // end at chart max
        backgroundColor: "rgba(255, 0, 0, 0.2)", // red
        borderWidth: 0,
      },
      yellow: {
        type: "box",
        yMin: 80,
        yMax: 100,
        backgroundColor: "rgba(255, 255, 0, 0.2)", // yellow
        borderWidth: 0,
      },
      white: {
        type: "box",
        yMin: 100,
        yMax: 160,
        backgroundColor: "rgba(0, 0, 0, 0)", // yellow
        borderWidth: 0,
      },
      yellow1: {
        type: "box",
        yMin: 160,
        yMax: 175,
        backgroundColor: "rgba(255, 255, 0, 0.2)", // yellow
        borderWidth: 0,
      },
      red: {
        type: "box",
        yMin: 175,
        yMax: 200,   // end at chart max
        backgroundColor: "rgba(255, 0, 0, 0.2)", // red
        borderWidth: 0,
      },
    
      
    },
  },
    // annotation: {
    //   annotations: {
    //     redLow: {
    //       type: "box",
    //       yMin: 0,   // start at chart min
    //       yMax: 80,
    //       backgroundColor: "rgba(255, 0, 0, 0.2)", // red
    //       borderWidth: 0,
    //     },
      
    //     yellow: {
    //       type: "box",
    //       yMin: 80,
    //       yMax: 100,
    //       backgroundColor: "rgba(255, 255, 0, 0.2)", // yellow
    //       borderWidth: 0,
    //     },
    //     white: {
    //       type: "box",
    //       yMin: 100,
    //       yMax: 160,
    //       backgroundColor: "rgba(0, 0, 0, 0)", // yellow
    //       borderWidth: 0,
    //     },
    //     yellow1: {
    //       type: "box",
    //       yMin: 160,
    //       yMax: 175,
    //       backgroundColor: "rgba(255, 255, 0, 0.2)", // yellow
    //       borderWidth: 0,
    //     },
    //     redHigh: {
    //       type: "box",
    //       yMin: 175,
    //       yMax: 200,   // end at chart max
    //       backgroundColor: "rgba(255, 0, 0, 0.2)", // red
    //       borderWidth: 0,
    //     },
    //   },
    // },
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
      // grid: {
      //     color: '#303030',
      //     drawOnChartArea: true,
      //   },
        
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
  // tension: 0.3,
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
  },
  annotation: {
    annotations: {
      purple: {
        type: "box",
        yMin: 10,   // start at chart min
        yMax: 20,
        backgroundColor: "rgba(128, 0, 128, 0.2)", // red
        borderWidth: 0,
      },
      redHigh: {
        type: "box",
        yMin: 20,
        yMax: 25,   // end at chart max
        backgroundColor: "rgba(255, 0, 0, 0.2)", // red
        borderWidth: 0,
      },
      yellow: {
        type: "box",
        yMin: 25,
        yMax: 30,
        backgroundColor: "rgba(255, 255, 0, 0.2)", // yellow
        borderWidth: 0,
      },
      white: {
        type: "box",
        yMin: 30,
        yMax: 60,
        backgroundColor: "rgba(0, 0, 0, 0)", // yellow
        borderWidth: 0,
      },
      yellow1: {
        type: "box",
        yMin: 60,
        yMax: 80,
        backgroundColor: "rgba(255, 255, 0, 0.2)", // yellow
        borderWidth: 0,
      },
      red: {
        type: "box",
        yMin: 80,
        yMax: 100,   // end at chart max
        backgroundColor: "rgba(255, 0, 0, 0.2)", // red
        borderWidth: 0,
      },
    
      
    },
  },
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
      // grid: {
      //     color: '#303030',
      //     drawOnChartArea: true,
      //   },
        
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
  const [pulseoximeterData1, setPulseoximeterData1] = useState<TemperatureData>({
        labels: [], // Initially, there are no labels
        datasets: [], // Initially, there are no datasets
        })
    
   
  const [rendergraph, setrendergraph] = useState(false)

    useEffect(() => {
      setTemperatureData({
        labels,
        datasets: dataset[0] || []
      });
      setPulseoximeterData({
        labels,
        datasets: dataset[1] || []
      });
      setPulseoximeterData1({
        labels,
        datasets: dataset[2] || []
      });
    

      setGraphData(true)
      setrendergraph(!rendergraph)
  },[times])
  
  const handleAddEntry = async (formData?: any) => {
    try {
      const vitals = formData?.vitals || {};
      const observation = formData?.observation1 || {};
  
      const baseUrl = import.meta.env.VITE_FHIRAPI_URL as string;
      const searchUrl = `${baseUrl}/Observation?subject=Patient/${props.patient_resource_id}&category=vital-signs&_sort=-date&_count=1`;
  
      // ------------------------
      // 🔍 Step 1: Fetch latest Observation
      // ------------------------
      let existingObservationId: string | null = null;
  
      const searchResponse = await fetch(searchUrl, {
        headers: {
          Authorization: "Basic " + btoa("fhiruser:change-password"),
          Accept: "application/fhir+json",
        },
      });
  
      if (searchResponse.ok) {
        // Avoid parsing empty response bodies
        const text = await searchResponse.text();
        if (text.trim()) {
          const result = JSON.parse(text);
          if (result.entry?.length > 0) {
            existingObservationId = result.entry[0].resource.id;
            console.log("🩺 Found existing observation:", existingObservationId);
          }
        }
      } else {
        console.warn("⚠️ Observation search failed:", searchResponse.status);
      }
  
      // ------------------------
      // 🧱 Step 2: Build Components
      // ------------------------
      const components: any[] = [];
  
      const addVital = (
        code: string,
        display: string,
        value: any,
        unit: string,
        systemCode: string
      ) => {
        if (value !== undefined && value !== null && value !== "") {
          components.push({
            code: {
              coding: [{ system: "http://loinc.org", code, display }],
              text: display,
            },
            valueQuantity: {
              value: parseFloat(value),
              unit,
              system: "http://unitsofmeasure.org",
              code: systemCode,
            },
          });
        }
      };
  
      // 🩸 Add vitals
      addVital("8867-4", "Heart Rate", vitals.hr, "BPM", "BPM");
      addVital("8888-4", "Pulse Rate", vitals.pr, "BPM", "BPM");
      addVital("9279-1", "Respiratory Rate", vitals.rr, "BPM", "BPM");
      addVital("20564-1", "SpO₂", vitals.spo2, "%", "%");
      addVital("60839-8", "Skin Temperature", vitals.skinTemp, "°C", "°C");
      addVital("60839-8", "Core Temperature", vitals.coreTemp, "°C", "°C");
  
      // 🧍 BP split
      if (vitals.bp) {
        const [sys, dia] = vitals.bp.split("/").map((v: string) => v.trim());
        if (sys && dia) {
          addVital("8480-6", "Systolic BP", sys, "mm[Hg]", "mm[Hg]");
          addVital("8462-4", "Diastolic BP", dia, "mm[Hg]", "mm[Hg]");
        }
      }
  
      // 🗒️ Notes
      // if (vitals.observation) {
      //   components.push({
      //     code: {
      //       coding: [{ system: "http://loinc.org", code: "69730-0", display: "Note" }],
      //       text: "Note",
      //     },
      //     valueString: vitals.observation,
      //   });
      // }
  
      // ------------------------
      // 🧠 Step 3: Add Observation fields
      // ------------------------
      const addObs = (field: string, label: string, value: any) => {
        if (value) {
          components.push({
            code: {
              coding: [
                {
                  system: "http://hospital.local/observation",
                  code: field,
                  display: label,
                },
              ],
              text: label,
            },
            valueString: value,
          });
        }
      };
  
      addObs("grunting", "Grunting", observation.grunting);
      addObs("colour", "Colour", observation.colour);
      addObs("neuro", "Neuro", observation.neuro);
      addObs("feeding", "Feeding", observation.feeding);
      addObs("glucose", "Glucose", observation.glucose);
      addObs("parentalConcerns", "Parental Concerns", observation.parentalConcerns);
  
      // ------------------------
      // 🏗️ Step 4: Create or Update Observation
      // ------------------------
      const requestBody: any = {
        resourceType: "Observation",
        status: "final",
        category: [
          {
            coding: [
              {
                system: "http://terminology.hl7.org/CodeSystem/observation-category",
                code: "vital-signs",
                display: "Vital Signs",
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              system: "http://loinc.org",
              code: "85353-1",
              display: "Vital signs panel",
            },
          ],
          text: "Vital signs panel",
        },
        subject: { reference: `Patient/${props.patient_resource_id}` },
        effectiveDateTime: new Date().toISOString(),
        component: components,
      };
  
      if (existingObservationId) {
        requestBody.id = existingObservationId;
      }
  
      const url = existingObservationId
        ? `${baseUrl}/Observation/${existingObservationId}`
        : `${baseUrl}/Observation`;
  
      const response = await fetch(url, {
        method: existingObservationId ? "PUT" : "POST",
        headers: {
          Authorization: "Basic " + btoa("fhiruser:change-password"),
          "Content-Type": "application/fhir+json",
          Accept: "application/fhir+json",
        },
        body: JSON.stringify(requestBody),
      });
  
      // ------------------------
      // ✅ Step 5: Handle Response
      // ------------------------
      const text = await response.text();
      if (!response.ok) {
        console.error("❌ Failed to save:", text);
        alert("Failed to save observation");
        return;
      }
  
      if (text.trim()) {
        const saved = JSON.parse(text);
        console.log("✅ Observation saved successfully:", saved);
      } else {
        console.log("✅ Observation saved (no response body)");
      }
  
      alert("Vitals + Observation saved successfully!");
      setManualVitalsDialog(false);
  
    } catch (error) {
      console.error("⚠️ Error in handleAddEntry:", error);
      alert("Something went wrong. Please try again.");
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

      const [observation1, setObservation1] = useState({
        grunting: "",
        colour: "",
        neuro: "",
        feeding: "",
        glucose: "",
        parentalConcerns: "",
      });
  
  const labels = times;
  
  const [manualVitalsDialog, setManualVitalsDialog] = useState(false)
  // const handleInputChange =
  // (field: keyof typeof vitals) => (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setVitals((prev) => ({ ...prev, [field]: e.target.value }));
  // };

const handleSelect =
  (field: keyof typeof observation1) => (_: any, value: string | null) => {
    if (value !== null) setObservation1((prev) => ({ ...prev, [field]: value }));
  };

const handleNext = () => setStep((prev) => prev + 1);
const handleBack = () => setStep((prev) => prev - 1);


const handleInputChange = (field: keyof VitalsData) => (event: React.ChangeEvent<HTMLInputElement>) => {
        setVitals({ ...vitals, [field]: event.target.value });
      };

const downloadTrendsPDF = async () => {
        const doc = new jsPDF("p", "pt", "a4"); // Portrait A4
        const pageWidth = doc.internal.pageSize.getWidth();
        // const pageHeight = doc.internal.pageSize.getHeight();
        let orgName = "Unknown Organization";
        let logoDataUrl: string | null = null;
      
        try {
          // =========================
          // Fetch Organization
          // =========================
          const orgUrl = `${import.meta.env.VITE_FHIRAPI_URL}/Organization/${props.userOrganization}`;
          console.log("🏥 Fetching Organization from:", orgUrl);
      
          const res = await fetch(orgUrl, {
            headers: {
              Authorization: "Basic " + btoa("fhiruser:change-password"),
              Accept: "application/fhir+json",
            },
          });
      
          if (!res.ok) throw new Error(`Organization fetch failed: ${res.status}`);
      
          const orgData = await res.json();
          orgName = orgData.name || orgName;
          console.log("✅ Organization name fetched:", orgName);
      
          // =========================
          // Fetch logo Binary if exists
          // =========================
          const extensions = Array.isArray(orgData.extension) ? orgData.extension : [];
          const logoExt = extensions.find(
            (ext: any) =>
              ext.url === "http://example.org/fhir/StructureDefinition/organization-logo"
          );
          const logoRef = logoExt?.valueReference?.reference;
          console.log("🔗 Logo Reference (fixed):", logoRef);
      
          if (logoRef) {
            const binaryId = logoRef.replace("Binary/", "");
            const binaryUrl = `${import.meta.env.VITE_FHIRAPI_URL}/Binary/${binaryId}`;
            console.log("🖼️ Fetching Binary from:", binaryUrl);
      
            const binaryRes = await fetch(binaryUrl, {
              headers: {
                Authorization: "Basic " + btoa("fhiruser:change-password"),
                Accept: "application/fhir+json",
              },
            });
      
            if (!binaryRes.ok) throw new Error(`Binary fetch failed: ${binaryRes.status}`);
      
            const binaryData = await binaryRes.json();
            console.log("📦 Binary fetched:", binaryData);
      
            if (binaryData.data && binaryData.contentType) {
              logoDataUrl = `data:${binaryData.contentType};base64,${binaryData.data}`;
              console.log("✅ Logo Data URL ready (first 50 chars):", logoDataUrl.slice(0, 50) + "...");
            } else {
              console.warn("⚠️ Binary missing data/contentType");
            }
          } else {
            console.warn("⚠️ No logo extension found in Organization");
          }
        } catch (err) {
          console.error("❌ Error fetching organization/logo:", err);
        }
      
        // =========================
        // Draw Logo
        // =========================
        const logoBoxSize = 60;
        const logoX = 40;
        const logoY = 20;
      
        try {
          if (logoDataUrl) {
            const img = new Image();
            img.src = logoDataUrl;
      
            await new Promise<void>((resolve, reject) => {
              img.onload = () => resolve();
              img.onerror = (e) => reject(e);
            });
            console.log("🖼️ Logo image loaded");
      
            const aspectRatio = img.width / img.height;
            let drawWidth = logoBoxSize;
            let drawHeight = logoBoxSize;
      
            if (aspectRatio > 1) drawHeight = logoBoxSize / aspectRatio;
            else drawWidth = logoBoxSize * aspectRatio;
      
            const offsetX = logoX + (logoBoxSize - drawWidth) / 2;
            const offsetY = logoY + (logoBoxSize - drawHeight) / 2- 10;
      
            doc.addImage(img, "PNG", offsetX, offsetY, drawWidth, drawHeight);
            console.log("✅ Logo added to PDF");
          } else {
            console.warn("⚠️ No logo, drawing fallback rectangle");
            doc.setFillColor(200, 220, 255);
            doc.rect(logoX, logoY, logoBoxSize, logoBoxSize, "F");
            doc.setFontSize(8);
            doc.text("No Logo", logoX + 5, logoY + 30);
          }
        } catch (err) {
          console.error("❌ Failed to add logo:", err);
          doc.setFillColor(200, 220, 255);
          doc.rect(logoX, logoY, logoBoxSize, logoBoxSize, "F");
        }
      

// =========================
// 🏥 Hospital Name
// =========================
doc.setFont("helvetica", "bold");
doc.setFontSize(14);
doc.text(orgName, logoX + logoBoxSize + 10, logoY + 15);

doc.setFontSize(11);
doc.text("NEWBORN EARLY WARNING SCORE", logoX + logoBoxSize + 10, logoY + 35);

// =========================
// Line separator
// =========================
doc.setDrawColor(180);
doc.line(10, 70, pageWidth - 10, 70);

      // =========================
      // 👶 PATIENT INFO
      // =========================
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
    
      const patientY = 85;
      doc.text(`Name: ${props.patient_name}`, 40, patientY);
      doc.text(`UHID: ${props.patient_id}`, 40,  patientY+20);
      doc.text(`DOB:  ${props.birth_date}`, 250, patientY);
      doc.text(`G.A  : ${props.gestational_age}`, 420, patientY);
      doc.text(`DOA: ____________________`, 250, patientY+22);
      // doc.setDrawColor(180);
      // doc.line(40, 140, pageWidth - 40, 140);
      // =========================
      // 📊 CHART SECTION
      // =========================
        
      
        // ✅ Score Legend
        doc.setFontSize(9);
        doc.text("Score Key:", 508, 40);
        doc.setFillColor(255, 255, 255);
        doc.rect(488, 52, 20, 15, "F");
        doc.text("0", 488, 58);
        doc.setFillColor(255, 255, 0);
        doc.rect(508, 48, 20, 15, "F");
        doc.text("1", 518, 58);
        doc.setFillColor(255, 102, 102);
        doc.rect(538, 48, 20, 15, "F");
        doc.text("2", 548, 58);
      
        // ✅ Chart details
        const chartIds = [
          { id: "temperatureGraph", title: "Temperature" },
          { id: "respirationGraph", title: "Respiration Rate" },
          { id: "pulseGraph", title: "Heart Rate" },
          { id: "spo2Graph", title: "SpO2" },
        ];
      
        // Layout calculation (20% title, 70% chart)
        const titleColumnWidth = pageWidth * 0.23; // 20% of width
        const chartColumnX = pageWidth * 0.2; // 25% start of chart area
        const chartWidth = pageWidth * 0.83; // 70% of width
      
        const chartHeight = 160; // uniform chart height
        let startY = 120;
      
        for (const chart of chartIds) {
          const element = document.getElementById(chart.id);
          if (!element) continue;
      
          // Title area background (optional, visual separation)
          doc.setFillColor(230, 245, 255);
          doc.rect(20, startY, titleColumnWidth - 40, chartHeight, "F");
      
          // Add Title in the left column (center vertically)
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          const titleY = startY + chartHeight / 2;
          doc.text(chart.title, 30, titleY);
      
          // Capture chart image
          const canvas = await html2canvas(element, { scale: 2, backgroundColor: "#fff" });
          const imgData = canvas.toDataURL("image/png");
      
          // Scale chart to fit 70% width
          const scaledHeight = chartHeight;
          const scaledWidth = (canvas.width * scaledHeight) / canvas.height;
      
          // Ensure it doesn’t exceed chartWidth limit
          const finalWidth = Math.min(scaledWidth, chartWidth - 40);
      
          // Add chart image aligned to the right column
          doc.addImage(imgData, "PNG", chartColumnX, startY, finalWidth, scaledHeight);
      
          startY += chartHeight + 20; // Gap between rows
        }
      
        // ✅ Save file
        doc.save(`Trends_Report(${props.patient_id}).pdf`);
      };
    
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
      url = '';
    }
  }

  console.log(`🎉 Fetch complete. Total pages fetched: ${pageCount}`);
      };



async function fetchManualTrends(patientId: string, timeframeHours = 24) {
  console.log("📥 Fetching MANUAL observations for patient:", patientId);

  try {
    const searchUrl = `${import.meta.env.VITE_FHIRAPI_URL}/Observation?subject=Patient/${patientId}&category=vital-signs&_sort=-date&_count=1`;
    const searchResponse = await fetch(searchUrl, {
      headers: {
        Authorization: "Basic " + btoa("fhiruser:change-password"),
        Accept: "application/fhir+json",
      },
    });

    const searchResult = await searchResponse.json();
    if (!searchResult.entry?.length) return [];

    const observationId = searchResult.entry[0].resource.id;
    const sinceDate = new Date(Date.now() - timeframeHours * 60 * 60 * 1000).toISOString();

    const historyUrl = `${import.meta.env.VITE_FHIRAPI_URL}/Observation/${observationId}/_history?_since=${sinceDate}&_count=50`;
    console.log("📜 Fetching filtered observation history:", historyUrl);

    const historyResponse = await fetch(historyUrl, {
      headers: {
        Authorization: "Basic " + btoa("fhiruser:change-password"),
        Accept: "application/fhir+json",
      },
    });

    const bundle = await historyResponse.json();

    const parsed =
      bundle.entry?.map((entry: any) => {
        const obs = entry.resource;
        const time = obs.effectiveDateTime;
        const values: Record<string, number | string> = {};
        obs.component?.forEach((component: any) => {
          const label = component.code?.coding?.[0]?.display;
          const value = component.valueQuantity?.value ?? component.valueString;
          if (label && value !== undefined) values[label] = value;
        });
        return { time, ...values };
      }) || [];

    console.log("🧩 Parsed manual data:", parsed);
    return parsed.reverse();
  } catch (error) {
    console.error("❌ Error fetching manual trends:", error);
    return [];
  }
}

useEffect(() => {
  if (dataSource === "manual" || dataSource === "log") {
    setLoading(true);
    fetchManualTrends(props.patient_resource_id)
      .then((data) => setManualData(data))
      .finally(() => setLoading(false));
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
      function prepareManualPulseoximeterDataspo2(manualData: any[]) {
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


      function prepareManualPulseoximeterData(manualData: any[]) {
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
      }
    ],
  };
      }


      useEffect(() => {
        
        if(observation[1]?.resource?.component?.length>1){
            
            console.log('observation',observation)
            setTimes(observation.map((obs) => {
              let temperatureArr: {}[] = [];
              let pulseRateArr: {}[] = [];
              let spo2Arr: {}[] = [];
              

                observation[1].resource.component.map((data, index) => {
                  if (data.code.text.toString() === "Measured Skin Temp 1" || data.code.text.toString() === "Measured Skin Temp 2") {
                    let unit = data.valueQuantity.unit.toString() as keyof typeof heaterYaxis;
                    temperatureArr.push({
                      label: data.code.text.toString(),
                      data: observation.map((data2) => data2?.resource?.component?.[index]?.valueQuantity?.value.toString()),
                      yAxisID: heaterYaxis[unit] || "y"
                    });
                  } 
                  else if (data.code.text.toString() === "Pulse Rate") {
                    let unit2 = data.valueQuantity.unit.toString() as keyof typeof pulseoximeterYaxis;
                    pulseRateArr.push({
                      label: data.code.text.toString(),
                      data: observation.map((data2) => data2?.resource?.component?.[index]?.valueQuantity?.value.toString()),
                      yAxisID: pulseoximeterYaxis[unit2] || "y"
                    });
                  } 
                  else if (data.code.text.toString() === "SpO2") {
                    let unit3 = data.valueQuantity.unit.toString() as keyof typeof spo2Yaxis;
                    spo2Arr.push({
                      label: data.code.text.toString(),
                      data: observation.map((data2) => data2?.resource?.component?.[index]?.valueQuantity?.value.toString()),
                      yAxisID: spo2Yaxis[unit3] || "y"
                    });
                  }
                  
                                      
                })
                setDataSet([temperatureArr, pulseRateArr, spo2Arr])

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
   const pulseoximeterDataM = prepareManualPulseoximeterData(manualData);
    const pulseoximeterData2 =  prepareManualPulseoximeterDataspo2(manualData);
    const pulseoximeterData3 =  prepareManualPulseoximeterDataRR(manualData);

    const manualGraph = useMemo(() => {
        return (
        
        <Stack
        height="100%"
        width="100%"
        spacing={2} // uniform spacing
        sx={{
          backgroundColor: 'transparent',
          alignItems: 'center', // ✅ centers all charts horizontally
          justifyContent: 'center',
        }}
        mx="auto"
        mt={2}
      >
        {/* 🌡️ Temperature Graph */}
        <Stack
          width="95%"
          p={3}
          spacing={1}
          sx={{
            backgroundColor: '#FFFFFF',
            borderRadius: 2,
            boxShadow: '0px 2px 6px rgba(0,0,0,0.1)',
          }}
        > 
        
        <Stack direction="row" alignItems="center" spacing={1}>
          <ThermostatIcon sx={{ color: '#124D81', fontSize: 28 }} />
          <Typography
            variant="h6"
            align="left"
            sx={{ fontWeight: 600, color: '#333' }}
          >
            Temperature 
          </Typography></Stack>
          <div id="temperatureGraph">
          <Line
            ref={chartRef1}
            options={temperatureOption as ChartOptions<'line'>}
            data={temperatureData1}
            height="100%"
            plugins={[temperatureLegendPlugin]}
          /></div>
          <div  id="legend-container"></div>
        </Stack>
       
        {/* 🌬️ Respiration Rate Graph */}
        <Stack
  width="95%"
  p={3}
  spacing={1}
  sx={{
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
    boxShadow: '0px 2px 6px rgba(0,0,0,0.1)',
  }}
>
  {/* Title + Icon */}
  <Stack direction="row" alignItems="center" spacing={1}>
    <ShowChartIcon sx={{ color: '#124D81', fontSize: 28 }} />
    <Typography
      variant="h6"
      align="left"
      sx={{ fontWeight: 600, color: '#333' }}
    >
      Respiration Rate
    </Typography>
  </Stack>

  {/* Chart */}
  <div id="respirationGraph">
  <Line
    options={pulseoximeterOption3 as ChartOptions<'line'>}
    data={pulseoximeterData3}
    height="100%"
    plugins={[temperatureLegendPlugin]}
  /></div>
  <div id="legend-container-manual-RR"></div>
</Stack>
        {/* ❤️ Pulse Graph */}
        <Stack
          width="95%"
          p={3}
          spacing={1}
          sx={{
            backgroundColor: '#FFFFFF',
            borderRadius: 2,
            boxShadow: '0px 2px 6px rgba(0,0,0,0.1)',
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
          <MonitorHeartIcon sx={{ color: '#124D81', fontSize: 28 }} />
          <Typography
            variant="h6"
            align="left"
            sx={{ fontWeight: 600, color: '#333' }}
          >
            Pulse Rate 
          </Typography></Stack>
          <div id="pulseGraph">
          <Line
            ref={chartRef2}
            options={pulseoximeterOption1 as ChartOptions<'line'>}
            data={pulseoximeterDataM}
            height="100%"
            plugins={[temperatureLegendPlugin]}
          /></div>
          <div id="legend-container-manual-pulse"></div>
        </Stack>
         
        {/* 🩸 SpO₂ Graph */}
        <Stack
          width="95%"
          p={3}
          spacing={1}
          sx={{
            backgroundColor: '#FFFFFF',
            borderRadius: 2,
            boxShadow: '0px 2px 6px rgba(0,0,0,0.1)',
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
          <WaterDropIcon sx={{ color: '#124D81', fontSize: 28 }} />
          <Typography
            variant="h6"
            align="center"
            sx={{ fontWeight: 600, color: '#333' }}
          >
            SpO₂ 
          </Typography></Stack>
          <div id="spo2Graph">
          <Line
            options={sp02Option as ChartOptions<'line'>}
            data={pulseoximeterData2}
            height="100%"
            plugins={[temperatureLegendPlugin]}
          /></div>
          <div id="legend-container3"></div>
        </Stack>
      </Stack>
           
      );


},[manualData])


    // const manualGraph1 = useMemo(() => {
    //   if (!manualData.length) return <div>No manual data available</div>;
    
    //   const temperatureData = prepareManualTemperatureData(manualData);
      
    
    //   return (
    //     <Stack height={"100%"} width={"95%"} spacing={"5%"} sx={{ backgroundColor: "transparent" }}>
        
    //     <Line
    //       options={temperatureOption1 as ChartOptions<'line'>}
    //       data={temperatureData}
    //       height={"100%"}
    //       plugins={[temperatureLegendPlugin]}
    //     />
    //   <div id="legend-container-manual-temp"></div>
       

        
    //     <Line
    //       options={pulseoximeterOption1 as ChartOptions<'line'>}
    //       data={pulseoximeterData}
    //       height={"100%"}
    //       plugins={[temperatureLegendPlugin]}
    //     />
    //   </Stack>
    //   );
    // }, [manualData]);
    
    useEffect(() => {console.log(selectedLegends)},[selectedLegends])
   
    const graph = useMemo(() => {
       
      
            return (
              
              <Stack
                height="100%"
                width="100%"
                spacing={2}
                sx={{
                  backgroundColor: 'transparent',
                  alignItems: 'center', // centers each chart horizontally
                  justifyContent: 'center',
                }}
                mx="auto"
                mt={2}
              >
                {/* 🌡️ Temperature */}
                <Stack
                  width="95%"
                  p={3}
                  spacing={1}
                  sx={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 2,
                    boxShadow: '0px 2px 6px rgba(0,0,0,0.1)',
                  }}
                ><Stack direction="row" alignItems="center" spacing={1}>
          <ThermostatIcon sx={{ color: '#124D81', fontSize: 28 }} />
                  <Typography
                    variant="h6"
                    align="center"
                    sx={{ fontWeight: 600, color: '#333' }}
                  >
                    Temperature
                  </Typography></Stack>
                  <Line
                    ref={chartRef1}
                    options={temperatureOption as ChartOptions<'line'>}
                    data={temperatureData}
                    height="100%"
                    plugins={[temperatureLegendPlugin]}
                  />
                  <div id="legend-container"></div>
                </Stack>
            
                {/* ❤️ Pulse Rate */}
                <Stack
                  width="95%"
                  p={3}
                  spacing={1}
                  sx={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 2,
                    boxShadow: '0px 2px 6px rgba(0,0,0,0.1)',
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                  <ShowChartIcon sx={{ color: '#124D81', fontSize: 28 }} />
                  <Typography
                    variant="h6"
                    align="center"
                    sx={{ fontWeight: 600, color: '#333' }}
                  >
                    Pulse Rate
                  </Typography></Stack>
                  <Line
                    ref={chartRef2}
                    options={pulseoximeterOption as ChartOptions<'line'>}
                    data={pulseoximeterData}
                    height="100%"
                    plugins={[temperatureLegendPlugin]}
                  />
                  <div id="legend-container2"></div>
                </Stack>
            
                {/* 🩸 SpO₂ */}
                <Stack
                  width="95%"
                  p={3}
                  spacing={1}
                  sx={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 2,
                    boxShadow: '0px 2px 6px rgba(0,0,0,0.1)',
                  }}
                >
                    <Stack direction="row" alignItems="center" spacing={1}>
                    <WaterDropIcon sx={{ color: '#124D81', fontSize: 28 }} />
                  <Typography
                    variant="h6"
                    align="center"
                    sx={{ fontWeight: 600, color: '#333' }}
                  >
                    SpO₂
                  </Typography></Stack>
                  <Line
                    ref={chartRef3}
                    options={sp02Option as ChartOptions<'line'>}
                    data={pulseoximeterData1}
                    height="100%"
                    plugins={[temperatureLegendPlugin]}
                  />
                  <div id="legend-container3"></div>
                </Stack>
              </Stack>
           
            
            
            );
     
     
    },[rendergraph,loading])

    const combinedData = dataSource === "log"
    ? [...(manualData || []), ]
    : manualData;
    return (
        <React.Fragment>
            <Box>
            <Box>
            <Stack
            direction="row"
         
         
            justifyContent="space-between"
            alignItems="center"
          >
              <Typography variant="h6" sx={{ mb: 1, fontWeight: "bold", color: "#124D81" }}>
        Vitals & Trends
      </Typography>
      <Stack  direction="row" spacing={2}> <Tooltip title="Add Manual Vitals">
                <IconButton
                  onClick={() => setManualVitalsDialog(true)}
                  disabled={dataSource !== "manual"}
                  sx={{
                    fontWeight: "bold",
                    color: "#228BE6",
                    backgroundColor: "#F5F5F5",
                    "&:hover": {
                      backgroundColor: "rgba(34, 139, 230, 0.1)",
                      color: "#FFFFFF",
                    },
                  }}
                >
                  <EditNoteIcon sx={{ fontSize: "26px" }} />
                </IconButton>
              </Tooltip>
      <Tooltip title="Download PDF">
                <IconButton
                  onClick={downloadTrendsPDF}
                  sx={{
                    fontWeight: "bold",
                    color: "#228BE6",
                    backgroundColor: "#F5F5F5",
                    "&:hover": {
                      backgroundColor: "rgba(34, 139, 230, 0.1)",
                      color: "#FFFFFF",
                    },
                  }}
                >
                  <DownloadIcon sx={{ fontSize: "26px" }} />
                </IconButton>
              </Tooltip>  </Stack>
              </Stack>

     
            

      {graphData ? (
        <>
          {/* Header Controls */}
          <Stack
            direction="row"
            width="100%"
         
          p={1}
            justifyContent="space-between"
            alignItems="center"
          >
            {/* Left: Time Frame */}
            <Box width="60%">
              <ToggleButtonGroup
                value={timeFrame}
                exclusive
                size="small"
                onChange={(_, newValue) => {
                  if (newValue !== null) setTimeFrame(newValue);
                }}
                fullWidth
                sx={{
                 
                  borderRadius: "10px",
                  "& .MuiToggleButton-root": {
                    color: "#343A40",
                    border: "2px solid #EEEDF1",
                    fontWeight: "bold",
                  },
                  "& .Mui-selected": {
                    backgroundColor: "rgba(34, 139, 230, 0.1) !important",
                    color: "#228BE6 !important",
                  },
                }}
              >
                {[3, 6, 12, 24, 48].map((hour) => (
                  <ToggleButton
                    key={`${hour}hr`}
                    value={hour}
                    sx={{
                      height: "30px",
                      fontSize: "12px",
                      textTransform: "capitalize",
                    }}
                  >
                    {hour} Hr
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>

            {/* Right: Buttons */}
            <Stack direction="row" spacing={1} alignItems="center" >

              {/* Device / Manual Toggle */}
              <ToggleButtonGroup
                value={dataSource}
                exclusive
                size="small"
                sx={{
                  backgroundColor: "#F5F5F5",
                  borderRadius: "10px",
                  "& .MuiToggleButton-root": {
                    color: "#343A40",
                    border: "2px solid #EEEDF1",
                  
                   
                  },
                  "& .Mui-selected": {
                    backgroundColor: "rgba(34, 139, 230, 0.1) !important",
                    color: "#228BE6 !important",
                  },
                }}
              >
                <ToggleButton
                  value="device"
                  onClick={() => setDataSource("device")}
                  sx={{
                    height: "35px",
                    width: "75px",
                    fontSize: "15px",
                    textTransform: "capitalize",
                  }}
                >
                  Device
                </ToggleButton>
                <ToggleButton
                  value="manual"
                  onClick={() => setDataSource("manual")}
                  sx={{
                    height: "35px",
                    width: "75px",
                    fontSize: "15px",
                    textTransform: "capitalize",
                  }}
                >
                  Manual
                </ToggleButton>
                <ToggleButton
                  value="log"
                  onClick={() => setDataSource("log")}
                  sx={{
                    height: "35px",
                    width: "75px",
                    fontSize: "15px",
                    textTransform: "capitalize",
                  }}
                >Log</ToggleButton>
              </ToggleButtonGroup>
            </Stack>
          </Stack>

          {/* Vitals Display Row */}
          <Stack
  direction="row"
  alignItems="center"
  sx={{
    backgroundColor: "#FFFFFF",
    borderRadius: 3,
    p: 1,
    mt: 1,
  }}
>
  {/* Left: Latest Manual Values (70%) */}
  <Box sx={{ ml:2 ,flex: "0 0 25%" }}>
    <Typography variant="subtitle1" sx={{ color: "#666" }}>
      Last Update
    </Typography>
    <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "#333" }}>
      {latestManual
        ?    new Date(latestManual.time).toLocaleString([], {})
        : "No Data"}
    </Typography>
  </Box>
 
  <Box
    sx={{
      flex: "0 0 70%",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    }}
  >
    {latestManual ? (
      <>
        {/* ❤️ Pulse / Heart Rate */}
        {(latestManual["Pulse Rate"] || latestManual["Heart Rate"]) && (
          <Stack direction="row" alignItems="center" spacing={1}>
            <FavoriteIcon sx={{ color: "#E91E63" ,fontSize:'30px'}} />
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              {latestManual["Pulse Rate"] ?? latestManual["Heart Rate"]}
            </Typography>
          </Stack>
        )}

        {/* 💧 SpO2 */}
        {latestManual["SpO₂"] && (
          <Stack direction="row" alignItems="center" spacing={1}>
            <OpacityIcon sx={{ color: "#03A9F4",fontSize:'30px' }} />
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              {latestManual["SpO₂"]}
            </Typography>
          </Stack>
        )}

        {/* 🌡️ Temperature */}
        {(latestManual["Temperature"] ||
          latestManual["Core Temperature"] ||
          latestManual["Skin Temperature"]) && (
          <Stack direction="row" alignItems="center" spacing={1}>
            <DeviceThermostatIcon sx={{ color: "#FF9800",fontSize:'30px' }} />
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              {latestManual["Temperature"] ??
                latestManual["Core Temperature"] ??
                latestManual["Skin Temperature"]}
            </Typography>
          </Stack>
        )}

        {/* 🌬️ Respiratory Rate */}
        {latestManual["Respiratory Rate"] && (
          <Stack direction="row" alignItems="center" spacing={0}>
            <BoltIcon sx={{ color: "#FFEB3B" ,fontSize:'30px' }} />
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              {latestManual["Respiratory Rate"]}
            </Typography>
          </Stack>
        )}
      </>
    ) : (
      <Typography variant="body2" color="textSecondary">
        No Recent Data
      </Typography>
    )}
  </Box>

 

  {/* Right: Last Update (30%) */}
  
</Stack>






          {/* Chart Section */}
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
          {dataSource === "log" && (
        <Box>
          {loading ? (
            <CircularProgress size={24} />
          ) : (
            <Box
              sx={{
                backgroundColor: "#FFF",
                borderRadius: 2,
                boxShadow: 1,
                p: 2,
                overflowX: "auto",
                maxHeight: "400px",
              }}
            >
              {combinedData.length > 0 ? (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                  <thead>
                    <tr style={{ backgroundColor: "#F8F9FA", textAlign: "left" }}>
                      {Object.keys(combinedData[0]).map((col) => (
                        <th key={col} style={{ padding: "8px", fontWeight: 600 }}>
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {combinedData.map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid #E0E0E0" }}>
                        {Object.values(row).map((val, i) => (
                          <td key={i} style={{ padding: "8px" }}>
                            {val as any}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  No log data found.
                </Typography>
              )}
            </Box>
          )}
        </Box>
      )}
        </>
      ) : (
        <Box></Box>
      )}

      <Divider sx={{ mt: "40px", backgroundColor: "white" }} />
    </Box>
                                
    <Dialog
      open={manualVitalsDialog}
      onClose={() => setManualVitalsDialog(false)}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          backgroundColor:'#FFFFFF',
          color: "#000000",
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 500,
          pb: 1,
          color: "#000000",
          textAlign: "center",
        }}
      >
        {step === 1 ? "Add Vitals" : "Observation Entry"}
      </DialogTitle>

      <DialogContent>
        {step === 1 && (
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Stack direction="row" spacing={2}>
              <TextField
                label="HR"
                value={vitals.hr}
                onChange={handleInputChange("hr")}
                fullWidth
                placeholder="--- bpm"
                InputProps={{
                  sx: {
                    backgroundColor: "#F5F5F5",
                    borderRadius: 1,
                    color: "#000",
                  },
                }}
                InputLabelProps={{ sx: { color: "#000" } }}
              />
              <TextField
                label="PR"
                value={vitals.pr}
                onChange={handleInputChange("pr")}
                fullWidth
                placeholder="--- bpm"
                InputProps={{
                  sx: {
                    backgroundColor: "#F5F5F5",
                    borderRadius: 1,
                    color: "#000",
                  },
                }}
                InputLabelProps={{ sx: { color: "#000" } }}
              />
            </Stack>

            <Stack direction="row" spacing={2}>
              <TextField
                label="RR"
                value={vitals.rr}
                onChange={handleInputChange("rr")}
                fullWidth
                placeholder="--- bpm"
                InputProps={{
                  sx: { backgroundColor: "#F5F5F5", borderRadius: 1, color: "#000" },
                }}
                InputLabelProps={{ sx: { color: "#000" } }}
              />
              <TextField
                label="SpO2"
                value={vitals.spo2}
                onChange={handleInputChange("spo2")}
                fullWidth
                placeholder="--- %"
                InputProps={{
                  sx: { backgroundColor: "#F5F5F5", borderRadius: 1, color: "#000" },
                }}
                InputLabelProps={{ sx: { color: "#000" } }}
              />
            </Stack>

            <Stack direction="row" spacing={2}>
              <TextField
                label="Skin Temperature"
                value={vitals.skinTemp}
                onChange={handleInputChange("skinTemp")}
                fullWidth
                placeholder="--- °C"
                InputProps={{
                  sx: { backgroundColor: "#F5F5F5", borderRadius: 1, color: "#000" },
                }}
                InputLabelProps={{ sx: { color: "#000" } }}
              />
              <TextField
                label="Core Temperature"
                value={vitals.coreTemp}
                onChange={handleInputChange("coreTemp")}
                fullWidth
                placeholder="--- °C"
                InputProps={{
                  sx: { backgroundColor: "#F5F5F5", borderRadius: 1, color: "#000" },
                }}
                InputLabelProps={{ sx: { color: "#000" } }}
              />
            </Stack>

            <TextField
              label="Observation Note"
              value={vitals.observation}
              onChange={handleInputChange("observation")}
              fullWidth
              multiline
              rows={3}
              placeholder="Observation Notes"
              InputProps={{
                sx: { backgroundColor: "#F5F5F5", borderRadius: 1, color: "#000" },
              }}
              InputLabelProps={{ sx: { color: "#000" } }}
            />
          </Stack>
        )}

        {step === 2 && (
          <Stack spacing={2} >
            {[
              { label: "Grunting", field: "grunting", options: ["Present", "No"] },
              { label: "Colour", field: "colour", options: ["Blue", "Pale", "Pink"] },
              { label: "Neuro", field: "neuro", options: ["Unresponsive", "Lethargic", "Responsive"] },
              { label: "Feeding", field: "feeding", options: ["Nil", "Reluctantly", "Well"] },
              { label: "Glucose", field: "glucose", options: ["< 1.0", "1.0 - 1.9", "2.0 - 2.5", "≥ 2.6"] },
              { label: "Parental Concerns", field: "parentalConcerns", options: ["High", "Some", "Nil"] },
            ].map(({ label, field, options }) => (
              <Stack key={field}>
              <Typography sx={{ mb: 1, fontSize: 14, color: "#000" }}>
                {label}
              </Typography>
            
              <ToggleButtonGroup
                color="secondary"
                exclusive
                value={observation1[field as keyof typeof observation1]}
                onChange={handleSelect(field as keyof typeof observation1)}
                sx={{
                
                  display: "flex",
                  justifyContent: "space-equally", // equal spacing
                  gap: 2, // optional small gap
                  "& .MuiToggleButton-root": {
                    textTransform: "none",
                    borderRadius: 2,
                    border: "1px solid #0F3B61",
                   
                  },
                }}
              >
                {options.map((opt) => (
                  <ToggleButton key={opt} value={opt} sx={{color:'#0F3B61',width:'30%'}}>
                    {opt}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Stack>
            

            ))}
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ justifyContent: "space-between" }}>
        {step === 2 && (
          <Button onClick={handleBack} sx={{ color: "#1976d2" }}>
            Back
          </Button>
        )}
        {step === 1 && (
          <Button  sx={{ color: "#1976d2" }}>
            Cancel
          </Button>
        )}
        {step === 1 ? (
          <Button onClick={handleNext} variant="contained" sx={{ backgroundColor: "#1976d2" }}>
            Next
          </Button>
        ) : (
          <>
            {/* <Button  sx={{ color: "#9E9E9E" }}>
              Skip
            </Button> */}
            <Button
  onClick={() => handleAddEntry({ vitals, observation1 })}
  variant="contained"
  sx={{ backgroundColor: "#1976d2" }}
>
  Save
</Button>

           
          </>
        )}
      </DialogActions>
    </Dialog>
                                </Box>

        </React.Fragment>
    )
}

