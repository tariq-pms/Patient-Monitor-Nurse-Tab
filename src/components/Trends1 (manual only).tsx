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
    const chartRef4 = useRef<any | null>(null);
    const chartRef5 = useRef<any | null>(null);
    const chartRef6 = useRef<any | null>(null);
    const chartRef7 = useRef<any | null>(null);
    const chartRef8 = useRef<any | null>(null);
    const chartRef9 = useRef<any | null>(null);
    const chartRef10 = useRef<any | null>(null);
    const [graphData, setGraphData] = useState(false)
 
    // const [observation, setObservation] = useState<{
    //     resource: {
    //       meta: any;
    //       component: {
    //         code: { text: string };
    //         valueQuantity: { value: number; unit: string };
    //       }[];
    //       effectiveDateTime: string;
    //     };
    //   }[]>([]);
     

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
const [timeFrameEnd, setTimeFrameEnd] = useState(Date.now());

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
      display: true,
      ticks: {
        color: "black",
        autoSkip: true,
        maxTicksLimit: 12.5,
      },
    
    },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        min: 30,           // ✅ Start scale at 0
        max:40,         // ✅ End scale at 100
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
          position: 'right' as const,
          min: 60,           // ✅ Start scale at 0
          max: 180,         // ✅ End scale at 100
          title: {
            color: "black",
            display: true,
            text: "Beats Per Minuite (BPM)",
          },
          ticks: {
            color: 'black',
            stepSize: 5,    // ✅ Increment by 15
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
          maxTicksLimit: 12.5
        }
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        min: 85,           // ✅ Start scale at 0
        max: 100,         // ✅ End scale at 100
        title: {
          color: 'black',
          display: true,
          text: "Percentage (%)"
        },
        ticks: {
          color: 'black',
          stepSize: 5,    // ✅ Increment by 10
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
              maxTicksLimit: 12.5
          }
      },
    y: {      // Celcius
      type: 'linear' as const,
      display: true,
      position: 'right' as const,
      min: 30,           // ✅ Start scale at 0
      max: 180, 
      title: {
          color:'black',
          display: true,
          text: "Beats Per Minuite (BPM)"
      },
      ticks: {
        color: 'black',
        stepSize: 30,    // ✅ Increment by 10
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
              maxTicksLimit: 12.5
          }
      },
    y: {      // Celcius
      type: 'linear' as const,
      display: true,
      position: 'right' as const,
      min: 20,           // ✅ Start scale at 0
      max: 100,
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

// Helper: converts an array into tick labels (0 → first label, 1 → second ...)
const createCategoryTickCallback = (labels: string[]) => {
  return function (value: string | number) {
    return labels[value] ?? "";
  };
};
// Your category label sets
const CATEGORY_LABELS = {
  colour: [ "NORMAL", "PALE","BLUE"],
  neuro: [ "RESPONSIVE", "LETHARGIC","UNRESPONSIVE"],
  feeding: [ "FEEDING WELL", "RELUCTANTLY","NOT FEEDING"],
  glucose: [ "≥2.6", "2.0–2.5", "1.0–1.9","<1.0"],
  parentalConcern: ["NO", "SOME","HIGH"],
};

const categoricalOption = {
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
        yMin: 2,   // start at chart min
        yMax: 3,
        backgroundColor: "rgba(128, 0, 128, 0.2)", // red
        borderWidth: 0,
      },
      // redHigh: {
      //   type: "box",
      //   yMin: 1,
      //   yMax: 2,   // end at chart max
      //   backgroundColor: "rgba(255, 0, 0, 0.2)", // red
      //   borderWidth: 0,
      // },
      yellow: {
        type: "box",
        yMin: 1,
        yMax: 2,
        backgroundColor: "rgba(255, 255, 0, 0.2)", // yellow
        borderWidth: 0,
      },
      white: {
        type: "box",
        yMin: 0,
        yMax: 1,
        backgroundColor: "rgba(0, 0, 0, 0)", // yellow
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
        maxTicksLimit: 12.5
      }
    },
  
    y: {
      type: 'linear',
      display: true,
      position: 'right',
      min: 0,
      max: 3,
      title: {
        color:'black',
        display: true,
        text: ""
    },
      // ticks: {
      //   color: "black",
      //   stepSize: 1,
      //   callback: () => ""   
      // },

      ticks: {
        color:'black',
        stepSize: 1, // Set the color of the scale values (ticks) to red
    },
    }
  }
  
};
const colorOption = {
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
      // purple: {
      //   type: "box",
      //   yMin: 2,   // start at chart min
      //   yMax: 3,
      //   backgroundColor: "rgba(128, 0, 128, 0.2)", // red
      //   borderWidth: 0,
      // },
      redHigh: {
        type: "box",
        yMin: 2,
        yMax: 3,   // end at chart max
        backgroundColor: "rgba(255, 0, 0, 0.2)", // red
        borderWidth: 0,
      },
      yellow: {
        type: "box",
        yMin: 1,
        yMax: 2,
        backgroundColor: "rgba(255, 255, 0, 0.2)", // yellow
        borderWidth: 0,
      },
      white: {
        type: "box",
        yMin: 0,
        yMax: 1,
        backgroundColor: "rgba(0, 0, 0, 0)", // yellow
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
        maxTicksLimit: 12.5
      }
    },
  
    y: {
      type: 'linear',
      display: true,
      position: 'right',
      min: 0,
      max: 3,
      title: {
        color:'black',
        display: true,
        text: ""
    },
      // ticks: {
      //   color: "black",
      //   stepSize: 1,
      //   callback: () => ""   
      // },

      ticks: {
        color:'black',
        stepSize: 1, // Set the color of the scale values (ticks) to red
    },
    }
  }
  
};
const gulcoseOption = {
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
        yMin: 3,   // start at chart min
        yMax: 4,
        backgroundColor: "rgba(128, 0, 128, 0.2)", // red
        borderWidth: 0,
      },
      redHigh: {
        type: "box",
        yMin: 2,
        yMax: 3,   // end at chart max
        backgroundColor: "rgba(255, 0, 0, 0.2)", // red
        borderWidth: 0,
      },
      yellow: {
        type: "box",
        yMin: 1,
        yMax: 2,
        backgroundColor: "rgba(255, 255, 0, 0.2)", // yellow
        borderWidth: 0,
      },
      white: {
        type: "box",
        yMin: 0,
        yMax: 1,
        backgroundColor: "rgba(0, 0, 0, 0)", // yellow
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
        maxTicksLimit: 12.5
      }
    },
  
    y: {
      type: 'linear',
      display: true,
      position: 'right',
      min: 0,
      max: 4,
      title: {
        color:'black',
        display: true,
        text: ""
    },
      // ticks: {
      //   color: "black",
      //   stepSize: 1,
      //   callback: () => ""   
      // },

      ticks: {
        color:'black',
        stepSize: 1, // Set the color of the scale values (ticks) to red
    },
    }
  }
  
};
const neuroOptions = { 
  ...categoricalOption,
  scales: {
    ...categoricalOption.scales,
    y: {
      ...categoricalOption.scales.y,

      max: CATEGORY_LABELS.neuro.length - 0.5,

      ticks: {
        ...categoricalOption.scales.y.ticks,

        // ↓↓↓ ADD THIS ↓↓↓
        font: {
          size: 9,        // Change to any size you want (6, 7, 8 px)
          weight: "normal",
        },

        callback: createCategoryTickCallback(CATEGORY_LABELS.neuro),
      },
    },
  },
};


const colourOptions = {
  ...categoricalOption,
  scales: {
    ...categoricalOption.scales,
    y: {
      ...categoricalOption.scales.y,
      max: CATEGORY_LABELS.colour.length - 1,
      ticks: {
        ...categoricalOption.scales.y.ticks,
        font: {
          size: 9,        // Change to any size you want (6, 7, 8 px)
          weight: "normal",
        },
        callback: createCategoryTickCallback(CATEGORY_LABELS.colour),
      },
    },
  },
};

const parentalConcernOptions = {
  ...categoricalOption,
  scales: {
    ...categoricalOption.scales,
    y: {
      ...categoricalOption.scales.y,
      max: CATEGORY_LABELS.parentalConcern.length - 1,
      ticks: {
        ...categoricalOption.scales.y.ticks,
        font: {
          size: 9,        // Change to any size you want (6, 7, 8 px)
          weight: "normal",
        },
        callback: createCategoryTickCallback(CATEGORY_LABELS.parentalConcern),
      },
    },
  },
};

const glucoseOptions = {
  ...categoricalOption,
  scales: {
    ...categoricalOption.scales,
    y: {
      ...categoricalOption.scales.y,
      max: CATEGORY_LABELS.glucose.length - 1,
      ticks: {
        ...categoricalOption.scales.y.ticks,
        callback: createCategoryTickCallback(CATEGORY_LABELS.glucose),
      },
    },
  },
};

const feedingOptions = {
  ...categoricalOption,
  scales: {
    ...categoricalOption.scales,
    y: {
      ...categoricalOption.scales.y,
      max: CATEGORY_LABELS.feeding.length - 1,
      ticks: {
        ...categoricalOption.scales.y.ticks,
        font: {
          size: 9,        // Change to any size you want (6, 7, 8 px)
          weight: "normal",
        },
        callback: createCategoryTickCallback(CATEGORY_LABELS.feeding),
      },
    },
  },
};

const categoricalOption1: ChartOptions<'line'> = {
  responsive: true,
  scales: {
    y: {
      min: 0,
      max: 3,
      ticks: { stepSize: 1 }
    },
    x: {
      ticks: { maxRotation: 0, minRotation: 0 }
    }
  },
  plugins: {
    legend: { display: false }
  }
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

const handleSelect =(field: keyof typeof observation1) => (_: any, value: string | null) => {
    if (value !== null) setObservation1((prev) => ({ ...prev, [field]: value }));
  };

const handleNext = () => setStep((prev) => prev + 1);
const handleBack = () => setStep((prev) => prev - 1);


    const handleInputChange = (field: keyof VitalsData) => (event: React.ChangeEvent<HTMLInputElement>) => {
        setVitals({ ...vitals, [field]: event.target.value });
      };

      function getVisibleXAxisTicks(chartRef: React.MutableRefObject<any>) {
        if (!chartRef?.current) return [];
      
        const scale = chartRef.current.scales.x;
        if (!scale) return [];
      
        // Chart.js stores visible ticks here
        return scale.ticks.map(t => t.label);
      }
      
      const downloadTrendsPDF = async () => {
               
       
        const hideXAxis = () => {
          [
            chartRef1,
            chartRef2,
            chartRef3,
            chartRef4,
            chartRef5,
            chartRef6,
            chartRef7,
            chartRef8,
            chartRef9,
            chartRef10
           
          ].forEach(ref => {
            const c = ref?.current;
            if (c) {
              c.options.scales.x.display = false;
              c.update();
            }
          });
        };
        const chartLabels = [
          { label: "Colour", sublabels: ["Blue", "Pale", "Pink"] },
          { label: "Concern", sublabels: ["High", "Some", "Nil"] },
          { label: "Neuro", sublabels: ["Unresponsive", "Lethargic", "Responsive"] },
          { label: "Feeding", sublabels: ["Nil", "Reluctantly", "Well"] },
          { label: "Glucose", sublabels: ["< 1.0", "1.0 - 1.9", "2.0 - 2.5", ">= 2.6"] },
        ];
        
        
        // 🔥 2️⃣ RESTORE X-AXIS AFTER CAPTURE
        const showXAxis = () => {
          [
            chartRef1,
            chartRef2,
            chartRef3,
            chartRef4,
            chartRef5,
            chartRef6,
            chartRef7,
            chartRef8,
            chartRef9,
            chartRef10
           
          ].forEach(ref => {
            const c = ref?.current;
            if (c) {
              c.options.scales.x.display = true;
              c.update();
            }
          });
        };
      
        // ---- APPLY TEMPORARY HIDE ----
        hideXAxis();
       
        const doc = new jsPDF("p", "pt", "a4");
        const pageWidth = doc.internal.pageSize.getWidth();
      
        let orgName = "Unknown Organization";
        let logoDataUrl = null;
      
        try {
          const orgUrl = `${import.meta.env.VITE_FHIRAPI_URL}/Organization/${props.userOrganization}`;
          const res = await fetch(orgUrl, {
            headers: {
              Authorization: "Basic " + btoa("fhiruser:change-password"),
              Accept: "application/fhir+json",
            },
          });
      
          if (!res.ok) throw new Error(`Organization fetch failed: ${res.status}`);
      
          const orgData = await res.json();
          orgName = orgData.name || orgName;
      
          const extensions = Array.isArray(orgData.extension) ? orgData.extension : [];
          const logoExt = extensions.find(
            (ext: { url: string; }) =>
              ext.url ===
              "http://example.org/fhir/StructureDefinition/organization-logo"
          );
          const logoRef = logoExt?.valueReference?.reference;
      
          if (logoRef) {
            const binaryId = logoRef.replace("Binary/", "");
            const binaryUrl = `${import.meta.env.VITE_FHIRAPI_URL}/Binary/${binaryId}`;
      
            const binaryRes = await fetch(binaryUrl, {
              headers: {
                Authorization: "Basic " + btoa("fhiruser:change-password"),
                Accept: "application/fhir+json",
              },
            });
      
            if (!binaryRes.ok) throw new Error(`Binary fetch failed: ${binaryRes.status}`);
      
            const binaryData = await binaryRes.json();
      
            if (binaryData.data && binaryData.contentType) {
              logoDataUrl = `data:${binaryData.contentType};base64,${binaryData.data}`;
            }
          }
        } catch (err) {
          console.error("Error fetching organization/logo:", err);
        }
      
        const padding = 10;
        const headerHeight = 80;
      
        doc.setFillColor(255, 255, 255);
        doc.rect(0, 0, pageWidth, headerHeight + 20, "F");
      
        const logoX = padding + 10;
        const logoY = padding;
      
        try {
          if (logoDataUrl) {
            const img = new Image();
            img.src = logoDataUrl;
      
            await new Promise((resolve) => (img.onload = resolve));
      
            doc.addImage(img, "PNG", logoX, logoY, 130, 35);
          } else {
            doc.setFillColor(200);
            doc.rect(logoX, logoY, 130, 35, "F");
          }
        } catch {
          doc.setFillColor(200);
          doc.rect(logoX, logoY, 130, 35, "F");
        }
      
        doc.setFontSize(8);
        doc.text("Score Key:", logoX, 64);
      
        doc.setFillColor(255, 255, 255);
        doc.rect(logoX + 50, 54, 20, 15, "F");
        doc.text("0", logoX + 60, 64);
      
        doc.setFillColor(255, 255, 153);
        doc.rect(logoX + 92, 54, 20, 15, "F");
        doc.text("1", logoX + 100, 64);
      
        doc.setFillColor(255, 153, 153);
        doc.rect(logoX + 132, 54, 20, 15, "F");
        doc.text("2", logoX + 140, 64);
      
        const cardX = pageWidth * 0.35;
        const cardY = padding;
        const cardW = pageWidth * 0.62;
        const cardH = 60;
      
        doc.setFillColor(245, 245, 245);
        doc.roundedRect(cardX, cardY, cardW, cardH, 8, 8, "F");
      
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
      
        doc.text(`B/O: ${props.patient_name || ""}`, cardX + 10, cardY + 15);
        doc.text(`ID:${props.patient_id || ""}`, cardX + 150, cardY + 15);
        doc.text(`DOB: ${props.birth_date || ""}`, cardX + 280, cardY + 15);
        doc.text(`G.A: ${props.gestational_age || ""}`, cardX + 10, cardY + 32);
      
        doc.text(`TimeFrame: ${timeFrame} Hrs`, cardX + 280, cardY + 32);
      
        doc.text(`DOA: ____________________`, cardX + 150, cardY + 32);
        doc.text(`Gender: Male`, cardX + 10, cardY + 49);
        doc.text(`Printed at: ${new Date().toLocaleString()}`, cardX + 150, cardY + 49);
      
        const lineY = headerHeight;
        doc.setDrawColor(180);
        doc.line(20, lineY, pageWidth - 20, lineY);
      
        let startY = lineY + 2;
      
        const timeList = getVisibleXAxisTicks(chartRef1);
      
        if (timeList.length > 0) {
          const graphStartX = pageWidth * 0.20;
          const graphWidth = pageWidth * 0.77;
          const cellWidth = graphWidth / timeList.length + 0.7;
          const rowHeight = 20;
      
          doc.setFillColor(245, 245, 245);
          doc.rect(10, startY, graphWidth - 40, rowHeight, "F");
          doc.setTextColor(0, 0, 0);
          doc.setFontSize(10);
          doc.setFont("helvetica", "bold");
          doc.text("Time", 20, startY + rowHeight / 2);
      
          doc.setFillColor(245, 245, 245);
          doc.rect(graphStartX, startY, graphWidth, rowHeight, "F");
      
          doc.setFontSize(7);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(0, 0, 0);
      
          timeList.forEach((t, i) => {
            const x = graphStartX + i * cellWidth + cellWidth / 2;
            doc.text(t, x - 15, startY + 10, { align: "center" });
          });
      
          startY += rowHeight + 4;
        }
      
        const chartHeights = {
          temperatureGraph: 100,
          respirationGraph: 100,
          pulseGraph: 100,
          spo2Graph: 70,
        };
      
        const defaultHeight = 60;
      
        const chartIds = [
          { id: "temperatureGraph", title: "Temperature" },
          { id: "respirationGraph", title: "Respiration Rate" },
          { id: "pulseGraph", title: "Heart Rate" },
          { id: "spo2Graph", title: "SpO2" },
          { id: "colourGraph", title: "Colour" },
          { id: "neuroGraph", title: "Neuro" },
          { id: "feedingGraph", title: "Feeding" },
          { id: "glucoseGraph", title: "Glucose" },

          { id: "parentalGraph", title: "Concern" },
        ];
        
      
        const titleColumnWidth = pageWidth * 0.23;
        const chartColumnX = pageWidth * 0.20;
        const maxChartWidth = pageWidth * 0.80;
      
        for (const chart of chartIds) {
          const el = document.getElementById(chart.id);
          if (!el) continue;
      
          const chartHeight = chartHeights [chart.id] || defaultHeight;
      
          doc.setFillColor(245, 245, 245);
          doc.rect(10, startY, titleColumnWidth, chartHeight, "F");
      
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.text(chart.title, 20, startY + chartHeight / 2 + 3);
          
       // --- Determine lookup key (fix for multi-line titles) ---
let lookupLabel = Array.isArray(chart.title)
? (chart.labelKey ?? chart.title.join(" "))
: chart.title;

// --- Find matching chart label entry ---
// const info = chartLabels.find(l => l.label === lookupLabel);

// if (info && info.sublabels) {
// doc.setFontSize(7);
// doc.setFont("helvetica", "normal");

// // Y coordinate for sublabels (aligned vertically)
// let subY = startY - 20 + chartHeight / 2 + 3;

// // X coordinate: after main title text
// const titleText = Array.isArray(chart.title) ? chart.title.join(" ") : chart.title;
// const subLabelX = 20 + doc.getTextWidth(titleText) + 15;

// // Print sublabels vertically
// info.sublabels.forEach(sub => {
//   doc.text(` ${sub}`, subLabelX, subY);
//   subY += 15;
// });
// }
const info = chartLabels.find(l => l.label === lookupLabel);

if (info && info.sublabels) {

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");

  const subCount = info.sublabels.length;

  // Prepare text width
  const titleText = Array.isArray(chart.title)
    ? chart.title.join(" ")
    : chart.title;

  let  gap, subLabelX: number;
  let subY = startY - 20 + chartHeight / 2 + 3;
  // --------------------------
  // RULE A → For 3 Sublabels
  // --------------------------
  if (subCount === 3) {
    subY = startY - 15 + chartHeight / 2 + 3;
   
    subLabelX = 25 + doc.getTextWidth(titleText) + 15;
  }

  // --------------------------
  // RULE B → For 4 Sublabels
  // --------------------------
  else if (subCount === 4) {
    subY = startY - 20 + chartHeight / 2 + 3;
    gap = 15;
    subLabelX = 25 + doc.getTextWidth(titleText) + 15;
  }

  // Print each sublabel
  info.sublabels.forEach(sub => {
    doc.text(` ${sub}`, subLabelX, subY);
    subY += 15;
  });
}



          // 🎯 CAPTURE FULL CANVAS (no cropping)
          const canvas = await html2canvas(el, {
            scale: 2,
            backgroundColor: "#fff",
          });
      
          const imgData = canvas.toDataURL("image/png");
      
          doc.addImage(imgData, "PNG", chartColumnX - 8, startY, maxChartWidth, chartHeight);
          doc.setDrawColor(180); // light gray
          doc.setLineWidth(0.5);
          doc.line(10, startY + chartHeight + 2, pageWidth - 10, startY + chartHeight + 2);
          startY += chartHeight + 5;
        }
      
        // 🔥 3️⃣ RESTORE AFTER PDF
        showXAxis();
        
      
        doc.save(`Trends_Report(${props.patient_id || "patient"}).pdf`);
      };
      
         async function downloadTrendsPDF1(props: any, manualData: any[], timeFrameHours: number, timeFrameEnd: number) {
        const doc = new jsPDF("p", "pt", "a4");
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 24;
      
        // Layout dims
        const leftColWidth = pageWidth * 0.22; // label column (~22%)
        const rightColX = leftColWidth + margin; // start of chart area
        const chartAreaWidth = pageWidth - rightColX - margin;
        const smallGap = 8;
      
        // Row heights (tweak as needed)
        const timeRowHeight = 30;
        const chartRowHeight = 60; // per-row chart (image height)
        const rowGap = 18;
      
        // Chart IDs and Titles in the desired order
        const chartDefs = [
          { id: "temperatureGraph", title: "Temperature", hasBands: true, bandType: "temp" },
          { id: "respirationGraph", title: "Respiration Rate", hasBands: true, bandType: "rr" },
          { id: "pulseGraph", title: "Heart Rate", hasBands: true, bandType: "hr" },
          { id: "spo2Graph", title: "SpO₂", hasBands: true, bandType: "spo2" },
          { id: "colourGraph", title: "Colour", hasBands: true, bandType: "categorical" },
          { id: "neuroGraph", title: "Neuro", hasBands: true, bandType: "categorical" },
          { id: "feedingGraph", title: "Feeding", hasBands: true, bandType: "categorical" },
          { id: "glucoseGraph", title: "Glucose", hasBands: true, bandType: "categorical" },
          { id: "parentalGraph", title: "Parental Concern", hasBands: true, bandType: "categorical" },
        ];
      
        // ---------- Helpers ----------
        // Format time labels (10-minute grid)
        function generateTimeBuckets(hours: number, endTs: number, intervalMin = 10) {
          const buckets: number[] = [];
          const interval = intervalMin * 60 * 1000;
          const start = endTs - hours * 3600 * 1000;
          for (let t = start; t <= endTs; t += interval) buckets.push(t);
          return buckets;
        }
      
        // Draw simple background band patterns for each bandType
        function drawBands(doc: any, x: number, y: number, w: number, h: number, bandType: string) {
          // Adjust band segmentation per chart type
          if (bandType === "temp") {
            // Example: red (low), green (normal), yellow (warm), red (high)
            const segments = [
              { color: [255, 200, 200], heightRatio: 0.25 }, // low
              { color: [220, 255, 220], heightRatio: 0.15 }, // normal
              { color: [255, 255, 200], heightRatio: 0.2 },  // warm
              { color: [255, 200, 200], heightRatio: 0.4 },  // high
            ];
            let curY = y;
            segments.forEach(s => {
              const segH = Math.round(h * s.heightRatio);
              doc.setFillColor(...s.color);
              doc.rect(x, curY, w, segH, "F");
              curY += segH;
            });
          } else if (bandType === "rr") {
            // simple alternating bands
            const rows = 4;
            for (let i = 0; i < rows; i++) {
              doc.setFillColor(i % 2 ? 255 : 245, i % 2 ? 245 : 235, 235);
              doc.rect(x, y + (h / rows) * i, w, h / rows, "F");
            }
          } else if (bandType === "hr") {
            // HR: alternating pastel stripes
            for (let i = 0; i < 5; i++) {
              doc.setFillColor(255 - i * 6, 240 - i * 6, 245 - i * 6);
              doc.rect(x, y + (h / 5) * i, w, h / 5, "F");
            }
          } else if (bandType === "spo2") {
            // SPO2: green zone larger
            const g = Math.round(h * 0.6);
            doc.setFillColor(235, 255, 235);
            doc.rect(x, y, w, g, "F");
            doc.setFillColor(255, 250, 235);
            doc.rect(x, y + g, w, h - g, "F");
          } else {
            // categorical small alternating bands
            for (let i = 0; i < 3; i++) {
              doc.setFillColor(250 - i * 6, 245 - i * 6, 255 - i * 6);
              doc.rect(x, y + (h / 3) * i, w, h / 3, "F");
            }
          }
          // subtle horizontal grid lines
          doc.setDrawColor(220);
          const lines = Math.floor(h / 8);
          for (let i = 0; i <= lines; i++) {
            const yy = y + (h / lines) * i;
            doc.line(x, yy, x + w, yy);
          }
        }
      
        // Safe html2canvas for an element (ensuring size)
        async function captureElementImage(el: HTMLElement, targetW: number, targetH: number) {
          // Temporarily enforce sizes so image output is consistent
          const prevWidth = el.style.width;
          const prevHeight = el.style.height;
          const prevBackground = el.style.backgroundColor;
      
          el.style.width = `${targetW}px`;
          el.style.height = `${targetH}px`;
          el.style.backgroundColor = "#ffffff"; // ensure white background for PDF
      
          // wait a tick for style to apply
          await new Promise((r) => setTimeout(r, 50));
      
          const canvas = await html2canvas(el, { scale: 2, backgroundColor: "#fff", useCORS: true });
          // restore
          el.style.width = prevWidth;
          el.style.height = prevHeight;
          el.style.backgroundColor = prevBackground;
      
          return canvas.toDataURL("image/png");
        }
      
        // Fetch organization + logo (same behavior you already had)
        let orgName = "Unknown Organization";
        let logoDataUrl: string | null = null;
        try {
          const orgUrl = `${import.meta.env.VITE_FHIRAPI_URL}/Organization/${props.userOrganization}`;
          const res = await fetch(orgUrl, {
            headers: { Authorization: "Basic " + btoa("fhiruser:change-password"), Accept: "application/fhir+json" },
          });
          if (res.ok) {
            const orgData = await res.json();
            orgName = orgData.name || orgName;
            const extensions = Array.isArray(orgData.extension) ? orgData.extension : [];
            const logoExt = extensions.find((ext: any) => ext.url === "http://example.org/fhir/StructureDefinition/organization-logo");
            const logoRef = logoExt?.valueReference?.reference;
            if (logoRef) {
              const binaryId = logoRef.replace("Binary/", "");
              const binaryUrl = `${import.meta.env.VITE_FHIRAPI_URL}/Binary/${binaryId}`;
              const binaryRes = await fetch(binaryUrl, {
                headers: { Authorization: "Basic " + btoa("fhiruser:change-password"), Accept: "application/fhir+json" },
              });
              if (binaryRes.ok) {
                const binaryData = await binaryRes.json();
                if (binaryData.data && binaryData.contentType) {
                  logoDataUrl = `data:${binaryData.contentType};base64,${binaryData.data}`;
                }
              }
            }
          }
        } catch (err) {
          console.warn("Org/logo fetch failed:", err);
        }
      
        // ---------- Header ----------
        const logoBoxSize = 56;
        const logoX = margin;
        const logoY = margin;
        try {
          if (logoDataUrl) {
            const img = new Image();
            img.src = logoDataUrl;
            await new Promise<void>((resolve, reject) => {
              img.onload = () => resolve();
              img.onerror = (e) => reject(e);
            });
            // fit inside square
            const ar = img.width / img.height;
            let w = logoBoxSize, h = logoBoxSize;
            if (ar > 1) h = logoBoxSize / ar; else w = logoBoxSize * ar;
            doc.addImage(img, "PNG", logoX, logoY - 4, w, h);
          } else {
            doc.setFillColor(220, 235, 255);
            doc.rect(logoX, logoY - 4, logoBoxSize, logoBoxSize, "F");
            doc.setFontSize(7);
            doc.text("No Logo", logoX + 6, logoY + 20);
          }
        } catch (err) {
          doc.setFillColor(220, 235, 255);
          doc.rect(logoX, logoY - 4, logoBoxSize, logoBoxSize, "F");
        }
      
        // Hospital name and title
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text(orgName, logoX + logoBoxSize + 10, logoY + 8);
        doc.setFontSize(10);
        doc.text("Phoenix Medical Systems (P) Ltd.", logoX + logoBoxSize + 10, logoY + 8 + 16);
        doc.setFontSize(11);
        doc.text("NEWBORN EARLY WARNING SCORE", logoX + logoBoxSize + 10, logoY + 36);
      
        // Separator
        doc.setDrawColor(200);
        doc.line(margin / 2, logoY + 50, pageWidth - margin / 2, logoY + 50);
      
        // Patient block
        const patientY = logoY + 70;
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text(`Name: ${props.patient_name || ""}`, margin, patientY);
        doc.text(`UHID: ${props.patient_id || ""}`, margin, patientY + 14);
        doc.text(`DOB: ${props.birth_date || ""}`, margin + 220, patientY);
        doc.text(`G.A: ${props.gestational_age || ""}`, margin + 360, patientY);
        doc.text(`DOA: ____________________`, margin + 220, patientY + 14);
      
        // Score key (right)
        doc.setFontSize(9);
        doc.text("Score Key:", pageWidth - 120, margin + 8);
        doc.setFillColor(255, 255, 255);
        doc.rect(pageWidth - 140, margin + 20, 20, 14, "F");
        doc.setFontSize(8);
        doc.text("0", pageWidth - 135, margin + 31);
        doc.setFillColor(255, 255, 0);
        doc.rect(pageWidth - 120, margin + 16, 20, 14, "F");
        doc.setFillColor(255, 102, 102);
        doc.rect(pageWidth - 100, margin + 16, 20, 14, "F");
        doc.setFontSize(9);
      
        // ---------- TIME ROW ----------
        let cursorY = patientY + 40;
        // Generate buckets for header time labels (10-min resolution)
        const buckets = generateTimeBuckets(timeFrameHours, timeFrameEnd, 10); // change 10 -> 5 for higher resolution
        // draw time row background
        doc.setFillColor(245, 245, 245);
        doc.rect(rightColX, cursorY, chartAreaWidth, timeRowHeight, "F");
      
        // Draw "Time" label in left column
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setFillColor(230, 240, 255);
        doc.rect(margin, cursorY, leftColWidth - margin / 2, timeRowHeight, "F");
        doc.text("Time", margin + 8, cursorY + timeRowHeight / 2 + 4);
      
        // Draw each bucket time text across chart area
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        const cellW = chartAreaWidth / Math.max(6, buckets.length); // prevent very narrow
        let tx = rightColX;
        for (let i = 0; i < buckets.length; i++) {
          const t = new Date(buckets[i]);
          const label = t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          // small separator vertical line
          doc.setDrawColor(230);
          doc.line(tx, cursorY, tx, cursorY + timeRowHeight);
          doc.text(label, tx + 4, cursorY + timeRowHeight / 2 + 4);
          tx += cellW;
          if (tx > rightColX + chartAreaWidth) break;
        }
        // bottom separator for time row
        doc.setDrawColor(200);
        doc.line(margin, cursorY + timeRowHeight, pageWidth - margin, cursorY + timeRowHeight);
      
        cursorY += timeRowHeight + rowGap;
      
        // ---------- CHART ROWS ----------
        // For each chart: draw left label block, background bands on chart area, then capture DOM chart and draw image
        // Keep pagination in mind (move to next page if cursorY + block would overflow)
        for (const def of chartDefs) {
          // paginate if needed
          if (cursorY + chartRowHeight + 60 > pageHeight - margin) {
            doc.addPage();
            cursorY = margin + 20;
          }
      
          // Left label column block
          doc.setFillColor(240, 248, 255);
          doc.rect(margin, cursorY, leftColWidth - margin / 2, chartRowHeight, "F");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          // center vertically
          const titleY = cursorY + chartRowHeight / 2 + 4;
          doc.text(def.title, margin + 8, titleY);
      
          // Chart background bands and grid
          drawBands(doc, rightColX, cursorY, chartAreaWidth, chartRowHeight, def.bandType);
      
          // Try to find DOM element for the chart. If not found, we will only show background
          const el = document.getElementById(def.id) as HTMLElement | null;
          if (el) {
            try {
              // Calculate target pixel width/height for canvas capture.
              // Use a width that matches our final printed image width (convert pt to px roughly 1pt = 1.333px)
              const ptToPx = 1.333; // approximation
              const targetW = Math.round((chartAreaWidth - 10) * ptToPx); // small padding
              const targetH = Math.round(chartRowHeight * ptToPx);
              const imgData = await captureElementImage(el, targetW, targetH);
      
              // Maintain aspect ratio when placing into PDF
              const finalW = chartAreaWidth - 8;
              const finalH = chartRowHeight - 6;
              doc.addImage(imgData, "PNG", rightColX + 4, cursorY + 3, finalW, finalH);
            } catch (err) {
              // If capture failed, fallback to "no chart" placeholder (we already drew bands)
              console.warn("capture failed for", def.id, err);
              doc.setFontSize(7);
              doc.setTextColor(120);
              doc.text("Chart capture failed", rightColX + 10, cursorY + chartRowHeight / 2);
            }
          } else {
            // If no DOM element, annotate placeholder
            doc.setFontSize(8);
            doc.setTextColor(110);
            doc.text("No chart available", rightColX + 10, cursorY + chartRowHeight / 2);
          }
      
          cursorY += chartRowHeight + rowGap;
        }
      
        // Footer: NEWTT2 total area (simple box)
        const footerY = cursorY + 6;
        doc.setDrawColor(200);
        doc.rect(margin, footerY, pageWidth - 2 * margin, 48);
        doc.setFontSize(9);
        doc.text("NEWT/TT2 TOTAL", margin + 8, footerY + 14);
        doc.text("Monitoring Flag: _________________", margin + 8, footerY + 30);
        doc.text("Escalation: _______________________", margin + 220, footerY + 30);
      
        // Save
        const filename = `Trends_Report(${props.patient_id || "patient"}).pdf`;
        doc.save(filename);
      }


      async function fetchDeviceVitals(patientId: string, timeframeHours = 24) {
        console.log("📥 Fetching DEVICE vitals for patient:", patientId);
      
        try {
          const searchUrl = `${import.meta.env.VITE_FHIRAPI_URL}/Observation?subject=Patient/${patientId}&category=data-log&_sort=-date&_count=1`;
      
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
          const historyUrl = `${import.meta.env.VITE_FHIRAPI_URL}/Observation/${observationId}/_history?_since=${sinceDate}`;
      
          console.log("📜 Fetching DEVICE observation history:", historyUrl);
      
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
      
              obs.component?.forEach((c: any) => {
                const label = c.code?.coding?.[0]?.display;
                const value = c.valueQuantity?.value ?? c.valueString;
                if (label && value !== undefined) values[label] = value;
              });
      
              return { time, ...values };
            }) || [];
      
          const parsedSorted = parsed.sort(
            (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
          );
      
          console.log("📟 Parsed DEVICE vitals:", parsedSorted);
      
          return parsedSorted;
        } catch (error) {
          console.error("❌ Error fetching device vitals:", error);
          return [];
        }
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

    const historyUrl = `${import.meta.env.VITE_FHIRAPI_URL}/Observation/${observationId}/_history?_since=${sinceDate}`;

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
    const parsedSorted = parsed.sort(
      (a: { time: string | number | Date; }, b: { time: string | number | Date; }) => new Date(a.time).getTime() - new Date(b.time).getTime()
    );
    return parsedSorted;
    // return parsed.reverse();
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

  //     useEffect(() => {
  // if (fullData24h.length === 0) return;
  // const currentTime = new Date("2024-07-22T07:10:07.234512Z");
  // // const cutoff = new Date(currentTime.getTime() - timeFrame * 60 * 60 * 1000);
  // const cutoff = new Date("2024-07-20T07:10:07.234Z");

  // const filtered = fullData24h.filter((e) => {
  //   const ts = new Date(
  //     e.resource.effectiveDateTime ?? e.resource.meta.lastUpdated
  //   );
  //   return ts >= cutoff && ts <= currentTime;
  // });

  // // ✅ downsample hourly
  // const hourlyData = timeFrame >= 24
  //   ? downsampleHourly(filtered, cutoff, currentTime)
  //   : filtered.length > 2000 ? downsample(filtered, 2000) : filtered;

  // setObservation(hourlyData);
  //     }, [timeFrame, fullData24h]);
// 🔥 1. Filter manual data based on timeframe

const filteredManualData = useMemo(() => { 
  if (!manualData.length) return [];

  const now = timeFrameEnd;  // use selected end time
  const cutoff = now - timeFrame * 60 * 60 * 1000;

  return manualData.filter((d) => {
    const t = new Date(d.time).getTime();
    return t >= cutoff && t <= now;   // INCLUDE END
  });

}, [manualData, timeFrame, timeFrameEnd]);

function generateTimeLabels1(hours: number, timeFrameEnd: number) {
  const labels = [];
  const now = timeFrameEnd;                     // End time is when user clicked timeframe
  const start = now - hours * 60 * 60 * 1000;   // History window start
console.log("start",start);

  let t = start;

  while (t <= now) {
    const d = new Date(t);
    const time = d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const year = String(d.getFullYear()).slice(-2);
    const date = `${d.getDate()}/${d.getMonth() + 1}/${year}`;
    // 🔥 if > 12 hr timeframe → include date
    const label =
      hours > 12
        ? [time, date]
        :  [time]

    labels.push({ label, timestamp: t });   // store raw timestamp for exact matching
    t += 10 * 60 * 1000;
  }

  return labels;
}

function generateTimeLabels(
  hours: number,
  sourceData: any[],
  timeFrameEnd: number
) {
  if (!sourceData.length) return [];

  // 1️⃣ maxTime = timeFrameEnd (user-selected point)
  const maxTime = timeFrameEnd;
  const readableTime = new Date(maxTime).toLocaleString();
  console.log("maxTime (readable):", readableTime);
  

  // 2️⃣ Start = end - timeframe hours
  const minTime = maxTime - hours * 60 * 60 * 1000;
  const readableTime1 = new Date(minTime).toLocaleString();
  console.log("minTime (readable):", readableTime1);
 
  
  const interval = 4 * 60 * 1000; // 3 minute interval
  const labels = [];

  for (let t = minTime; t <= maxTime; t += interval) {
    const d = new Date(t);

    const time = d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });

    const year = String(d.getFullYear()).slice(-2);
    const date = `${d.getDate()}/${d.getMonth() + 1}/${year}`;

    // 🔥 If timeframe > 12 hours → show date also
    const label = hours > 12 ? [time, date] : [time];
   
    

    labels.push({
      timestamp: t,
      label
    });
  }

  return labels;
}


// function prepareManualTemperatureData_Filtered(data: any[]) {
//   return {
//     labels: data.map(d => new Date(d.time).toLocaleTimeString([], {
//       hour: "2-digit",
//       minute: "2-digit"
//     })),

//     datasets: [
//       {
//         label: "Skin Temperature",
//         data: data.map(d => d["Skin Temperature"] ?? null),
//         pointRadius: 4,
//         pointHoverRadius: 6,
//       },
//       {
//         label: "Core Temperature",
//         data: data.map(d => d["Core Temperature"] ?? null),
//         pointRadius: 4,
//         pointHoverRadius: 6,
//       }
//     ]
//   };
// }

function prepareDeviceTemperatureData_Filtered(deviceData: any[], hours: number, timeFrameEnd: number) {
  const labels = generateTimeLabels(hours, deviceData, timeFrameEnd);

  const findClosestPoint = (target: number, key: string) => {
    const WINDOW = 2 * 60 * 1000;
    let closest = null;
    let minDiff = Infinity;

    deviceData.forEach((item) => {
      const t = new Date(item.time).getTime();
      const diff = Math.abs(t - target);

      if (diff < minDiff && diff <= WINDOW) {
        minDiff = diff;
        closest = item[key] ?? null;
      }
    });

    return closest;
  };

  return {
    labels: labels.map(l => l.label),
    datasets: [
      {
        label: "Device Skin Temp",
        data: labels.map(l => findClosestPoint(l.timestamp, "CURRENT SKIN TEMPERATURE")),
        pointRadius: 2,
        borderDash: [5, 5],     // 🔥 dotted line
        spanGaps: true,
      },
      {
        label: "Device Core Temp",
        data: labels.map(l => findClosestPoint(l.timestamp, "CURRENT PERIPHERAL TEMPERATURE")),
        pointRadius: 2,
        borderDash: [5, 5],     // 🔥 dotted line
        spanGaps: true,
      }
    ]
  };
}



function prepareManualTemperatureData_Filtered( data: any[], hours: number, timeFrameEnd: number) 
{ const labels = generateTimeLabels(hours, data, timeFrameEnd);
   const findClosestPoint = (target: number, key: string) => { const WINDOW = 2 * 60 * 1000; 
   let closest = null; let minDiff = Infinity; 
   data.forEach((item) => { const t = new Date(item.time).getTime();
     const diff = Math.abs(t - target); 
    if (diff < minDiff && diff <= WINDOW) { minDiff = diff; 
      closest = item[key] ?? null; } }); return closest; }; 
      return { labels: labels.map(l => l.label), 
        datasets: [ { label: "Skin Temperature", data: labels.map(l => findClosestPoint(l.timestamp, "Skin Temperature")), pointRadius: 3, pointHoverRadius: 5, spanGaps: true, }, { label: "Core Temperature", data: labels.map(l => findClosestPoint(l.timestamp, "Core Temperature")), pointRadius: 3, pointHoverRadius: 5, spanGaps: true, } ] }; }

        function preparePulseOXDataFiltered(
data: any[], hours: number, timeFrameEnd: number, field: string) {
  const labels = generateTimeLabels(hours, data, timeFrameEnd);

  const findClosestPoint = (target: number) => {
    const WINDOW = 2 * 60 * 1000; // more stable
    let closest = null;
    let minDiff = Infinity;

    data.forEach((item) => {
      const t = new Date(item.time).getTime();
      const diff = Math.abs(t - target);

      if (diff < minDiff && diff <= WINDOW) {
        minDiff = diff;
        closest = item[field] ?? null;
      }
    });

    return closest;
  };

  return {
    labels: labels.map(l => l.label),
    datasets: [
      {
        label: field,
        data: labels.map(l => findClosestPoint(l.timestamp)),
        pointRadius: 3,
        pointHoverRadius: 5,
        borderWidth: 2,
        spanGaps: true,
      }
    ]
  };
}

function preparePulseOXDataFiltered1(
data: any[], hours: number, timeFrameEnd: number, field: string) {
  const labels = generateTimeLabels(hours, data, timeFrameEnd);


  const VALUE_MAP: any = {
    "Grunting": { "No": 0, "Mild": 1, "Severe": 2 },
    "Colour": { "Normal": 0, "Pale": 1, "Blue": 2 },
    "Neuro": { "Responsive": 0, "Lethargic": 1, "Unresponsive": 2 },
    "Feeding": { "Well": 2, "Reluctantly": 1, "Nil": 0 },
    "Glucose": { "< 1.0": 3, "1.0 - 1.9": 2, "2.0 - 2.5": 1, "≥ 2.6": 0 },
    "Parental Concerns": { "Nil": 0, "Some": 1, "High": 2 },
  };
 


  const convert = (value: any) => VALUE_MAP[field]?.[value] ?? null;

  const findClosestPoint = (target: number) => {
    const WINDOW = 2 * 60 * 1000;
    let closest = null;
    let minDiff = Infinity;

    data.forEach((item) => {
      const t = new Date(item.time).getTime();
      const diff = Math.abs(t - target);

      if (diff < minDiff && diff <= WINDOW) {
        minDiff = diff;
        closest = convert(item[field]);
      }
    });

    return closest;
  };

  return {
    labels: labels.map(l => l.label),
    datasets: [
      {
        label: field,
        data: labels.map(l => findClosestPoint(l.timestamp)),
        pointRadius: 3,
        pointHoverRadius: 5,
        spanGaps: true,
      }
    ]
  };
}

// function preparePulseOXDataFiltered(
//   data: any[],
//   hours: number,
//   timeFrameEnd: number,
//   field: string
// ) {
//   const labels = generateTimeLabels(hours, timeFrameEnd);

//   const findClosestPoint = (target: number) => {
//     const WINDOW = 30 * 60 * 1000;

//     let closest = null;
//     let minDiff = Infinity;

//     data.forEach((item) => {
//       const itemTime = new Date(item.time).getTime();
//       const diff = Math.abs(itemTime - target);

//       if (diff < minDiff && diff <= WINDOW) {
//         minDiff = diff;
//         closest = item[field] ?? null;
//       }
//     });

//     return closest;
//   };

//   return {
//     labels: labels.map((l) => l.label),
//     datasets: [
//       {
//         label: field,
//         data: labels.map((l) => findClosestPoint(l.timestamp)),
//         pointRadius: 3,
//         pointHoverRadius: 5,
//         borderWidth: 2,
//         spanGaps: true
//       },
//     ],
//   };
// }

// function preparePulseOXDataFiltered1(
//   data: any[],
//   hours: number,
//   timeFrameEnd: number,
//   field: string
// ) {
//   console.log("➡️ RUN preparePulseOXDataFiltered1 FOR FIELD:", field);

//   // ⭐ IMPORTANT: The field name in your manual data is EXACTLY the same as "field"
//   // Example: field="Grunting" → item["Grunting"]

//   const labels = generateTimeLabels(hours, timeFrameEnd);

//   const convertValue = (str: any) => {
//     if (str === undefined || str === null) return null;

//     // ⭐ Glucose special handling
//     if (field === "Glucose") {
//       const nums = String(str)
//         .split("-")
//         .map((v) => parseFloat(v.trim()));
//       if (nums.length === 2) {
//         return (nums[0] + nums[1]) / 2;
//       }
//       return parseFloat(str);
//     }

//     // ⭐ Categorical mappings
//     const VALUE_MAP: any = {
//       "Grunting": { "No": 0, "Mild": 1, "Severe": 2 },
//       "Colour": { "Pink": 0, "Pale": 1, "Blue": 2 },
//       "Neuro": { "Active": 0, "Lethargic": 1, "Unresponsive": 2 },
//       "Feeding": { "Normal": 0, "Reluctantly": 1, "Not Feeding": 2 },
//       "Parental Concerns": { "None": 0, "Some": 1, "High": 2 },
//     };

//     const map = VALUE_MAP[field];
//     return map ? map[str] ?? null : null;
//   };

//   // ⭐ NEW — simple matching because manual data is simple key/value
//   const findClosestPoint = (target: number) => {
//     let closest: any = null;
//     let minDiff = Infinity;
//     const WINDOW = 10 * 60 * 1000; // 10 minutes

//     data.forEach((item) => {
//       const itemTime = new Date(item.time).getTime();

//       const diff = Math.abs(itemTime - target);
//       if (diff < minDiff && diff <= WINDOW) {
//         minDiff = diff;
//         closest = convertValue(item[field]); // ⭐ DIRECT access here
//       }
//     });

//     return closest;
//   };

//   const datasetValues = labels.map((l) => findClosestPoint(l.timestamp));

//   return {
//     labels: labels.map((l) => l.label),
//     datasets: [
//       {
//         label: field,
//         data: datasetValues,
//         pointRadius: 3,
//         pointHoverRadius: 5,
//         spanGaps: true,
//       },
//     ],
//   };
// }



    //   useEffect(() => {
        
    //     if(observation[1]?.resource?.component?.length>1){
            
    //         console.log('observation',observation)
    //         setTimes(observation.map((obs) => {
    //           let temperatureArr: {}[] = [];
    //           let pulseRateArr: {}[] = [];
    //           let spo2Arr: {}[] = [];
              

    //             observation[1].resource.component.map((data, index) => {
    //               if (data.code.text.toString() === "Measured Skin Temp 1" || data.code.text.toString() === "Measured Skin Temp 2") {
    //                 let unit = data.valueQuantity.unit.toString() as keyof typeof heaterYaxis;
    //                 temperatureArr.push({
    //                   label: data.code.text.toString(),
    //                   data: observation.map((data2) => data2?.resource?.component?.[index]?.valueQuantity?.value.toString()),
    //                   yAxisID: heaterYaxis[unit] || "y"
    //                 });
    //               } 
    //               else if (data.code.text.toString() === "Pulse Rate") {
    //                 let unit2 = data.valueQuantity.unit.toString() as keyof typeof pulseoximeterYaxis;
    //                 pulseRateArr.push({
    //                   label: data.code.text.toString(),
    //                   data: observation.map((data2) => data2?.resource?.component?.[index]?.valueQuantity?.value.toString()),
    //                   yAxisID: pulseoximeterYaxis[unit2] || "y"
    //                 });
    //               } 
    //               else if (data.code.text.toString() === "SpO2") {
    //                 let unit3 = data.valueQuantity.unit.toString() as keyof typeof spo2Yaxis;
    //                 spo2Arr.push({
    //                   label: data.code.text.toString(),
    //                   data: observation.map((data2) => data2?.resource?.component?.[index]?.valueQuantity?.value.toString()),
    //                   yAxisID: spo2Yaxis[unit3] || "y"
    //                 });
    //               }
                  
                                      
    //             })
    //             setDataSet([temperatureArr, pulseRateArr, spo2Arr])

    //             var fd = new Date(obs.resource.meta.lastUpdated.toString())
    //             var t = fd.toLocaleTimeString()
    //             var d = fd.getDate()+"/"+(fd.getMonth()+1)
                
    //             return(
    //                 // new Date(obs.resource.meta.lastUpdated).toLocaleString())
    //                 d+"-"+t
    //             )
    //             }))
    //     }
    //          else{
    //         setTimes(observation.map((obs) => {

    //             let second = [{
    //                 label: "",
    //                 data: [] as string[],
    //                 yAxisID: "y"
    //             }]
    //             setDataSet([second, second, second, second])
    //             return(
    //                 new Date(obs?.resource?.meta.lastUpdated.toString()).toLocaleTimeString())
    //             }))
    //     }
    //         // setLoading(false)
    // },[observation])

    // const temperatureData1 = prepareManualTemperatureData(manualData);
    
    const temperatureData1 = useMemo(() => {
      return prepareManualTemperatureData_Filtered(filteredManualData, timeFrame, timeFrameEnd);

    }, [filteredManualData, timeFrame,timeFrameEnd]);
    

    const pulseoximeterDataM = useMemo(() => {
      return preparePulseOXDataFiltered(
        filteredManualData,
        timeFrame,
        timeFrameEnd,
        "Heart Rate"
      );
    }, [filteredManualData, timeFrame, timeFrameEnd]);
    const pulseoximeterData2 = useMemo(() => {
      return preparePulseOXDataFiltered(
        filteredManualData,
        timeFrame,
        timeFrameEnd,
        "SpO₂"
      );
    }, [filteredManualData, timeFrame, timeFrameEnd]);
    const pulseoximeterData3 = useMemo(() => {
      return preparePulseOXDataFiltered(
        filteredManualData,
        timeFrame,
        timeFrameEnd,
        "Respiratory Rate"
      );
    }, [filteredManualData, timeFrame, timeFrameEnd]);

    const gruntingData = useMemo(() => {
      return preparePulseOXDataFiltered1(
        filteredManualData,
        timeFrame,
        timeFrameEnd,
        "Grunting"
      );
    }, [filteredManualData, timeFrame, timeFrameEnd]);
    const colourData = useMemo(() => {
      return preparePulseOXDataFiltered1(
        filteredManualData,
        timeFrame,
        timeFrameEnd,
        "Colour"
      );
    }, [filteredManualData, timeFrame, timeFrameEnd]);
    
    const neuroData = useMemo(() => {
      return preparePulseOXDataFiltered1(
        filteredManualData,
        timeFrame,
        timeFrameEnd,
        "Neuro"
      );
    }, [filteredManualData, timeFrame, timeFrameEnd]);
    
    const feedingData = useMemo(() => {
      return preparePulseOXDataFiltered1(
        filteredManualData,
        timeFrame,
        timeFrameEnd,
        "Feeding"
      );
    }, [filteredManualData, timeFrame, timeFrameEnd]);
    
    const glucoseData = useMemo(() => {
      return preparePulseOXDataFiltered1(
        filteredManualData,
        timeFrame,
        timeFrameEnd,
        "Glucose"
      );
    }, [filteredManualData, timeFrame, timeFrameEnd]);
    
    const parentalConcernData = useMemo(() => {
      return preparePulseOXDataFiltered1(
        filteredManualData,
        timeFrame,
        timeFrameEnd,
        "Parental Concerns"
      );
    }, [filteredManualData, timeFrame, timeFrameEnd]);

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
        mt={1}
      >
        {/* 🌡️ Temperature Graph */}
        <Stack
          width="95%"
          p={2}
          
          sx={{
            backgroundColor: '#FFFFFF',
            borderRadius: 2,
            boxShadow: '0px 2px 6px rgba(0,0,0,0.1)',
          }}
        > 
        
        <Stack direction="row" alignItems="center" >
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
            key={timeFrame}
            ref={chartRef1}
            options={temperatureOption as ChartOptions<'line'>}
            data={temperatureData1}
            height="50%"
            plugins={[temperatureLegendPlugin]}
          /></div>
          <div  id="legend-container"></div>
        </Stack>
       
        {/* 🌬️ Respiration Rate Graph */}
        <Stack
  width="95%"
  p={2}
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
    ref={chartRef4}
    data={pulseoximeterData3}
    height="50%"
    plugins={[temperatureLegendPlugin]}
  /></div>
  <div id="legend-container-manual-RR"></div>
</Stack>
        {/* ❤️ Pulse Graph */}
        <Stack
          width="95%"
          p={2}
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
            height="50%"
            plugins={[temperatureLegendPlugin]}
          /></div>
          <div id="legend-container-manual-pulse"></div>
        </Stack>
         
        {/* 🩸 SpO₂ Graph */}
        <Stack
          width="95%"
          
          p={2}
         
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
            ref={chartRef5}
            height="50%"
            plugins={[temperatureLegendPlugin]}
            
          /></div>
          <div id="legend-container3"></div>
        </Stack>
        {/* --- 🔊 Grunting --- */}
{/* <Stack
  width="95%"
  
  p={3}
  spacing={1}
  sx={{
    backgroundColor: "#FFFFFF",
    borderRadius: 2,
    boxShadow: "0px 2px 6px rgba(0,0,0,0.1)",
  }}
>
  <Typography variant="h6" sx={{ fontWeight: 600, color: "#333" }}>
    Grunting Present?
  </Typography>
  <Line options={categoricalOption as ChartOptions<'line'>} data={gruntingData} height="30%" />
</Stack> */}

{/* --- 🎨 Colour --- */}


{/* --- 🧠 Neuro --- */}
<Stack
  width="95%"
  p={3}
  spacing={1}
  sx={{
    backgroundColor: "#FFFFFF",
    borderRadius: 2,
    boxShadow: "0px 2px 6px rgba(0,0,0,0.1)",
  }}
>
  <Typography variant="h6" sx={{ fontWeight: 600, color: "#333" }}>
    Neuro
  </Typography>
  <div id="neuroGraph">
  <Line  ref={chartRef6} options={categoricalOption  as ChartOptions<'line'>} data={neuroData} height="30%"  />
  </div>
 
</Stack>

{/* --- 🍼 Feeding --- */}
<Stack
  width="95%"
  p={3}
  spacing={1}
  sx={{
    backgroundColor: "#FFFFFF",
    borderRadius: 2,
    boxShadow: "0px 2px 6px rgba(0,0,0,0.1)",
  }}
>
  <Typography variant="h6" sx={{ fontWeight: 600, color: "#333" }}>
    Feeding
  </Typography>
  <div id="feedingGraph">
  <Line  ref={chartRef7} options={colorOption   as ChartOptions<'line'>} data={feedingData} height="30%"  />
  </div>
 
</Stack>
<Stack
  width="95%"
  p={3}
  spacing={1}
  sx={{
    backgroundColor: "#FFFFFF",
    borderRadius: 2,
    boxShadow: "0px 2px 6px rgba(0,0,0,0.1)",
  }}
>
  <Typography variant="h6" sx={{ fontWeight: 600, color: "#333" }}>
    Colour
  </Typography>
  <div id="colourGraph">
  <Line  ref={chartRef8} options={categoricalOption  as ChartOptions<'line'>} data={colourData} height="30%"  /></div>
</Stack>
{/* --- 🩸 Glucose --- */}
<Stack
  width="95%"
  p={3}
  spacing={1}
  sx={{
    backgroundColor: "#FFFFFF",
    borderRadius: 2,
    boxShadow: "0px 2px 6px rgba(0,0,0,0.1)",
  }}
>
  <Typography variant="h6" sx={{ fontWeight: 600, color: "#333" }}>
    Glucose (mmol/L)
  </Typography>
  <div id="glucoseGraph">
  <Line  ref={chartRef9} options={gulcoseOption   as ChartOptions<'line'>} data={glucoseData} height="30%"  />
  </div>
  
</Stack>

{/* --- 👨‍👩‍👦 Parental Concern --- */}
<Stack
  width="95%"
  p={3}
  spacing={1}
  sx={{
    backgroundColor: "#FFFFFF",
    borderRadius: 2,
    boxShadow: "0px 2px 6px rgba(0,0,0,0.1)",
  }}
>

  <Typography variant="h6" sx={{ fontWeight: 600, color: "#333" }}>
    Parental Concern
  </Typography>
  <div id="parentalGraph">
  <Line ref={chartRef10} options={colorOption  as ChartOptions<'line'>} data={parentalConcernData} height="30%"  />
  </div>
 
</Stack>

      </Stack>
           
      );


},[manualData, timeFrame])


    useEffect(() => {console.log(selectedLegends)},[selectedLegends])
   
    const graph = useMemo(() => {
        return (
              
              <Stack height="100%" width="100%" spacing={2}
                sx={{
                  backgroundColor: 'transparent', alignItems: 'center', // centers each chart horizontally
                  justifyContent: 'center',
                }} mx="auto" mt={2} >
                {/* 🌡️ Temperature */}
                <Stack width="95%"  p={3} spacing={1}
                  sx={{ backgroundColor: '#FFFFFF', borderRadius: 2, boxShadow: '0px 2px 6px rgba(0,0,0,0.1)'}}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                    <ThermostatIcon sx={{ color: '#124D81', fontSize: 28 }} />
                  <Typography variant="h6" align="center" sx={{ fontWeight: 600, color: '#333' }}>Temperature</Typography></Stack>
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
                <Stack width="95%" p={3}  spacing={1}
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
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" sx={{ mb: 1, fontWeight: "bold", color: "#124D81" }}>Vitals & Trends</Typography>
      <Stack  direction="row" spacing={2}> <Tooltip title="Add Manual Vitals">
                <IconButton onClick={() => setManualVitalsDialog(true)}
                  disabled={dataSource !== "manual"}
                  sx={{ fontWeight: "bold",color: "#228BE6",
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
                // onChange={(_, newValue) => {
                //   if (newValue !== null) setTimeFrame(newValue);
                // }}
                onChange={(_, newValue) => {
                  if (newValue !== null) {
                    setLoading(true);
                
                    setTimeFrameEnd(Date.now());  // 🔥 fix future timeline
                    setTimeFrame(newValue);
                
                    setTimeout(() => setLoading(false), 150);
                  }
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
                {/* <ToggleButton
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
                </ToggleButton> */}
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
                  Trends
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
              sx={{backgroundColor: "#FFF", borderRadius: 2, boxShadow: 1,
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

      {/* <Divider sx={{ mt: "40px", backgroundColor: "white" }} /> */}
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
                label="SpO₂"
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

