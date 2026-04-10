import { Box, Stack, ToggleButtonGroup, ToggleButton, Button, Dialog, DialogActions, DialogContent, TextField, DialogTitle, Typography, CircularProgress, IconButton, alpha } from '@mui/material'
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
import jsPDF from "jspdf";
import DownloadIcon from '@mui/icons-material/Download';
import { useTheme } from "@mui/material/styles";

import Grid from "@mui/material/Grid";
import AddIcon from '@mui/icons-material/Add';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import GridOnIcon from '@mui/icons-material/GridOn';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import html2canvas from 'html2canvas';



Chart.register(annotationPlugin);
Chart.register(CategoryScale);



export interface PatientDetails {
  userOrganization: string;
  device_id: string;
  patient_resource_id: string;
  patient_name: string;
  patient_id: string;
  gestational_age: string;
  birth_date: string;
 gender:string;
  device_resource_id: string;

  darkTheme: boolean;
  selectedIcon: string
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
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const [selectedLegends, setSelectedLegends] = useState<any>([])
  const chartRef1 = useRef<any | null>(null);
  const chartRef2 = useRef<any | null>(null);
  const chartRef3 = useRef<any | null>(null);
  const chartRef4 = useRef<any | null>(null);
  const chartRef5 = useRef<any | null>(null);
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
      listContainer.style.flexWrap = 'nowrap';
      listContainer.style.alignItems = 'center';
      listContainer.style.gap = '20px';
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
      ul.style.lineHeight = '1';
      ul.style.gap = '20px';
      ul.style.flexWrap = 'nowrap';
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
          boxSpan.style.flexShrink = '0';
          boxSpan.style.height = '12px';
          boxSpan.style.marginRight = '5px';
          boxSpan.style.width = '12px';
          boxSpan.style.borderRadius = '50%';

          const textContainer = document.createElement('p');
          textContainer.style.fontSize = '12px';
          textContainer.style.color = '#6c757d';
          textContainer.style.margin = '0px';
          textContainer.style.padding = '0px';
          textContainer.style.whiteSpace = 'nowrap';

          const text = document.createTextNode("- " + item.text);
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

  const [times] = useState<Array<any>>([])
  const [dataset] = useState([[{}]])
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState('manual'); // 'device' or 'manual'

  //     const heaterYaxis = {
  //         "%": "y",

  //         "C°": "y"
  //     };
  //     const pulseoximeterYaxis = {

  //       'BPM': "y"
  //   }
  //   const spo2Yaxis = {
  //     "%": "y",

  // }

  const [manualData, setManualData] = useState<any[]>([]);
const [deviceData, setDeviceData] = useState<any[]>([]);

  const [step, setStep] = useState(1);

  // const [manualTrends, setManualTrends] = useState<any[]>([]);
  const [latestManual, setLatestManual] = useState<any | null>(null);

  const crosshairPlugin = {
    id: "crosshair",
    afterDraw: (chart: any) => {
      if (chart.tooltip?._active?.length) {
        const activePoint = chart.tooltip._active[0];
        const ctx = chart.ctx;
        const x = activePoint.element.x;
        const topY = chart.scales.y.top;
        const bottomY = chart.scales.y.bottom;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x, topY);
        ctx.lineTo(x, bottomY);
        ctx.lineWidth = 1;
        ctx.strokeStyle = "rgba(0, 0, 0, 0.4)"; // dark gray dotted line
        ctx.setLineDash([5, 5]); // dotted effect
        ctx.stroke();
        ctx.restore();
      }
    }
  };

  useEffect(() => {
    const loadManualTrends = async () => {
      const data = await fetchManualTrends(props.patient_resource_id);

      // setManualTrends(data);

      // ✅ Get the last element (latest)
      if (data.length > 0) {
        setLatestManual(data[data.length - 1]);
        // console.log("🆕 Latest Manual:", data[data.length - 1]);
      } else {
        setLatestManual(null);
      }
    };

    loadManualTrends();
  }, [props.patient_resource_id]);

  const temperatureOption = {
    animation: false,

    responsive: true,
    maintainAspectRatio: false,
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
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        titleColor: "#000",
        bodyColor: "#000",
        borderColor: "#ddd",
        borderWidth: 1,
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y + ' °C';
            } else {
              label += 'No Data';
            }
            return label;
          }
        }
      },
      annotation: {
  // Ensures annotations are drawn behind everything else
  drawTime: 'beforeDatasetsDraw', 
  annotations: {
    pinkLow: {
      type: "box",
      yMin: 0,
      yMax: 36.0,
      backgroundColor: "rgba(253, 226, 228, 0.45)", // Dropped to 0.2
      borderWidth: 0,
      z: -10,
    },
    green: {
      type: "box",
      yMin: 36.0,
      yMax: 36.5,
      backgroundColor: "rgba(224, 242, 241, 0.45)", // Dropped to 0.2
      borderWidth: 0,
      z: -10,
    },
    white: {
      type: "box",
      yMin: 36.5,
      yMax: 37.5,
      backgroundColor: "transparent", 
      borderWidth: 0,
      z: -10,
    },
    yellow: {
      type: "box",
      yMin: 37.5,
      yMax: 38.0,
      backgroundColor: "rgba(255, 248, 220, 0.45)", // Dropped to 0.2
      borderWidth: 0,
      z: -10,
    },
    pinkHigh: {
      type: "box",
      yMin: 38.0,
      yMax: 42.0,
      backgroundColor: "rgba(253, 226, 228, 0.45)", // Dropped to 0.2
      borderWidth: 0,
      z: -10,
    },
  },
},

    },
    scales: {

      x: {
        display: true,
        grid: {
          display: true,
          drawOnChartArea: true,
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          color: "#6c757d",
          autoSkip: true,
          maxTicksLimit: 6,
          maxRotation: 0,
          minRotation: 0,
        },
        afterFit: function (scale: any) {
          let prevDateStr: string | null = null;
          scale.ticks.forEach((tick: any) => {
            const lbl = tick.label;
            if (Array.isArray(lbl) && lbl.length >= 2) {
              const timeStr = lbl[0];
              const dateStr = lbl[1];
              if (dateStr !== prevDateStr) {
                prevDateStr = dateStr;
              } else {
                tick.label = [timeStr];
              }
            }
          });
        },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        min: 35,
        max: 39,
        title: {
          color: '#6c757d',
          display: false,
          text: "Temperature (C°)"
        },
        ticks: {
          color: '#6c757d',
          stepSize: 1,
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
    maintainAspectRatio: false,
    // legend: {
    //     position: 'bottom'
    // },
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
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        titleColor: "#000",
        bodyColor: "#000",
        borderColor: "#ddd",
        borderWidth: 1,
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y + ' bpm';
            } else {
              label += 'No Data';
            }
            return label;
          }
        }
      },
      annotation: {
        drawTime: 'beforeDraw',
        annotations: {
          purple: {
            type: "box",
            yMin: 0,   // start at chart min
            yMax: 60,
            backgroundColor: "rgba(128, 0, 128, 0.4)", // red
            borderWidth: 0,
            z: -1,
          },
          redLow: {
            type: "box",
            yMin: 60,   // start at chart min
            yMax: 80,
            backgroundColor: "rgba(255, 0, 0, 0.4)", // red
            borderWidth: 0,
            z: -1,
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
            backgroundColor: "rgba(255, 255, 0, 0.4)", // yellow
            borderWidth: 0,
            z: -1,
          },
          white: {
            type: "box",
            yMin: 100,
            yMax: 160,
            backgroundColor: "rgba(0, 0, 0, 0)", // yellow
            borderWidth: 0,
            z: -1,
          },
          yellow1: {
            type: "box",
            yMin: 160,
            yMax: 175,
            backgroundColor: "rgba(255, 255, 0, 0.4)", // yellow
            borderWidth: 0,
            z: -1,
          },
          redHigh: {
            type: "box",
            yMin: 175,
            yMax: 200,   // end at chart max
            backgroundColor: "rgba(255, 0, 0, 0.4)", // red
            borderWidth: 0,
            z: -1,
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#6c757d',
          autoSkip: true,
          maxTicksLimit: 5,
        },
        afterFit: function (scale: any) {
          let prevDateStr: string | null = null;
          scale.ticks.forEach((tick: any) => {
            const lbl = tick.label;
            if (Array.isArray(lbl) && lbl.length >= 2) {
              const timeStr = lbl[0];
              const dateStr = lbl[1];
              if (dateStr !== prevDateStr) {
                prevDateStr = dateStr;
              } else {
                tick.label = [timeStr];
              }
            }
          });
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
        min: 45,
        max: 185,
        title: {
          color: "#6c757d",
          display: false,
          text: "Beats Per Minuite (BPM)",
        },
        ticks: {
          color: '#6c757d',
          stepSize: 10,
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
    maintainAspectRatio: false,
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
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        titleColor: "#000",
        bodyColor: "#000",
        borderColor: "#0CB0D3",
        borderWidth: 1,
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y + ' %';
            } else {
              label += 'No Data';
            }
            return label;
          }
        }
      },
      annotation: {
        drawTime: 'beforeDraw',
        annotations: {
          purple: {
            type: "box",
            yMin: 0,
            yMax: 90,
            backgroundColor: "rgba(238, 219, 240, 0.4)", // purple
            borderWidth: 0,
            z: -1,
          },
          yellow: {
            type: "box",
            yMin: 90,
            yMax: 95,
            backgroundColor: "rgba(255, 248, 220, 0.4)", // yellow
            borderWidth: 0,
            z: -1,
          },
          white: {
            type: "box",
            yMin: 95,
            yMax: 100,
            backgroundColor: "rgba(255, 255, 255, 0)", // transparent white
            borderWidth: 0,
            z: -1,
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: true,
          drawOnChartArea: true,
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          color: '#6c757d',
          autoSkip: true,
          maxTicksLimit: 6,
          maxRotation: 0,
          minRotation: 0,
        },
        afterFit: function (scale: any) {
          let prevDateStr: string | null = null;
          scale.ticks.forEach((tick: any) => {
            const lbl = tick.label;
            if (Array.isArray(lbl) && lbl.length >= 2) {
              const timeStr = lbl[0];
              const dateStr = lbl[1];
              if (dateStr !== prevDateStr) {
                prevDateStr = dateStr;
              } else {
                tick.label = [timeStr];
              }
            }
          });
        }
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        min: 80,
        max: 100,
        title: {
          color: '#6c757d',
          display: false,
          text: "Percentage (%)"
        },
        ticks: {
          color: '#6c757d',
          stepSize: 5,
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
    maintainAspectRatio: false,
    // legend: {
    //     position: 'bottom'
    // },
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
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        titleColor: "#000",
        bodyColor: "#000",
        borderColor: "#ddd",
        borderWidth: 1,
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y + ' bpm';
            } else {
              label += 'No Data';
            }
            return label;
          }
        }
      },

      annotation: {
        drawTime: 'beforeDraw',
        annotations: {
          purple: {
            type: "box",
            yMin: 0,
            yMax: 60,
            backgroundColor: "rgba(238, 219, 240, 0.4)", // purple
            borderWidth: 0,
            z: -1,
          },
          pinkLow: {
            type: "box",
            yMin: 60,
            yMax: 80,
            backgroundColor: "rgba(253, 226, 228, 0.4)", // pink
            borderWidth: 0,
            z: -1,
          },
          yellowLow: {
            type: "box",
            yMin: 80,
            yMax: 100,
            backgroundColor: "rgba(255, 248, 220, 0.4)", // yellow
            borderWidth: 0,
            z: -1,
          },
          white: {
            type: "box",
            yMin: 100,
            yMax: 160,
            backgroundColor: "rgba(255, 255, 255, 0)", // transparent white
            borderWidth: 0,
            z: -1,
          },
          yellowHigh: {
            type: "box",
            yMin: 160,
            yMax: 175,
            backgroundColor: "rgba(255, 248, 220, 0.4)", // yellow
            borderWidth: 0,
            z: -1,
          },
          pinkHigh: {
            type: "box",
            yMin: 175,
            yMax: 200,
            backgroundColor: "rgba(253, 226, 228, 0.4)", // pink
            borderWidth: 0,
            z: -1,
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
        grid: {
          display: true,
          drawOnChartArea: true,
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          color: '#6c757d',
          autoSkip: true,
          maxTicksLimit: 6,
          maxRotation: 0,
          minRotation: 0,
        },
        afterFit: function (scale: any) {
          let prevDateStr: string | null = null;
          scale.ticks.forEach((tick: any) => {
            const lbl = tick.label;
            if (Array.isArray(lbl) && lbl.length >= 2) {
              const timeStr = lbl[0];
              const dateStr = lbl[1];
              if (dateStr !== prevDateStr) {
                prevDateStr = dateStr;
              } else {
                tick.label = [timeStr];
              }
            }
          });
        }
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        min: 40,
        max: 200,
        title: {
          color: '#6c757d',
          display: false,
          text: "Breaths Per Minute (BPM)"
        },
        ticks: {
          color: '#6c757d',
          stepSize: 20,
        },
        grid: {
          color: 'grey',
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
    // tension: 0.3,
    responsive: true,
    maintainAspectRatio: false,
    // legend: {
    //     position: 'bottom'
    // },
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
        drawTime: 'beforeDraw',
        annotations: {
          purple: {
            type: "box",
            yMin: 0,
            yMax: 20,
            backgroundColor: "rgba(238, 219, 240, 0.4)", // purple
            borderWidth: 0,
            z: -1,
          },
          pinkLow: {
            type: "box",
            yMin: 20,
            yMax: 25,
            backgroundColor: "rgba(253, 226, 228, 0.4)", // pink
            borderWidth: 0,
            z: -1,
          },
          yellowLow: {
            type: "box",
            yMin: 25,
            yMax: 30,
            backgroundColor: "rgba(255, 248, 220, 0.4)", // yellow
            borderWidth: 0,
            z: -1,
          },
          white: {
            type: "box",
            yMin: 30,
            yMax: 60,
            backgroundColor: "rgba(255, 255, 255, 0)", // transparent white
            borderWidth: 0,
            z: -1,
          },
          yellowHigh: {
            type: "box",
            yMin: 60,
            yMax: 80,
            backgroundColor: "rgba(255, 248, 220, 0.4)", // yellow
            borderWidth: 0,
            z: -1,
          },
          pinkHigh: {
            type: "box",
            yMin: 80,
            yMax: 100,
            backgroundColor: "rgba(253, 226, 228, 0.4)", // pink
            borderWidth: 0,
            z: -1,
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: true,
          drawOnChartArea: true,
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          color: '#6c757d',
          autoSkip: true,
          maxTicksLimit: 6,
          maxRotation: 0,
          minRotation: 0,
        },
        afterFit: function (scale: any) {
          let prevDateStr: string | null = null;
          scale.ticks.forEach((tick: any) => {
            const lbl = tick.label;
            if (Array.isArray(lbl) && lbl.length >= 2) {
              const timeStr = lbl[0];
              const dateStr = lbl[1];
              if (dateStr !== prevDateStr) {
                prevDateStr = dateStr;
              } else {
                tick.label = [timeStr];
              }
            }
          });
        }
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        min: 10,
        max: 90,
        title: {
          color: '#6c757d',
          display: false,
          text: "Breaths per minute (BPM)"
        },
        ticks: {
          color: '#6c757d',
          stepSize: 10,
        },
        grid: {
          color: 'grey',
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

  // Helper: converts an array into tick labels (0 → first label, 1 → second ...)
  // const createCategoryTickCallback = (labels: string[]) => {
  //   return function (value: string | number) {
  //     return labels[value] ?? "";
  //   };
  // };
  // Your category label sets
  // const CATEGORY_LABELS = {
  //   colour: [ "NORMAL", "PALE","BLUE"],
  //   neuro: [ "RESPONSIVE", "LETHARGIC","UNRESPONSIVE"],
  //   feeding: [ "FEEDING WELL", "RELUCTANTLY","NOT FEEDING"],
  //   glucose: [ "≥2.6", "2.0–2.5", "1.0–1.9","<1.0"],
  //   parentalConcern: ["NO", "SOME","HIGH"],
  // };

  // categoricalOption removed as it's no longer used for charts

  // colorOption removed as it's no longer used for charts

  // gulcoseOption removed as it's no longer used for charts

  // const neuroOptions = { 
  //   ...categoricalOption,
  //   scales: {
  //     ...categoricalOption.scales,
  //     y: {
  //       ...categoricalOption.scales.y,

  //       max: CATEGORY_LABELS.neuro.length - 0.5,

  //       ticks: {
  //         ...categoricalOption.scales.y.ticks,

  //         // ↓↓↓ ADD THIS ↓↓↓
  //         font: {
  //           size: 9,        // Change to any size you want (6, 7, 8 px)
  //           weight: "normal",
  //         },

  //         callback: createCategoryTickCallback(CATEGORY_LABELS.neuro),
  //       },
  //     },
  //   },
  // };


  // const colourOptions = {
  //   ...categoricalOption,
  //   scales: {
  //     ...categoricalOption.scales,
  //     y: {
  //       ...categoricalOption.scales.y,
  //       max: CATEGORY_LABELS.colour.length - 1,
  //       ticks: {
  //         ...categoricalOption.scales.y.ticks,
  //         font: {
  //           size: 9,        // Change to any size you want (6, 7, 8 px)
  //           weight: "normal",
  //         },
  //         callback: createCategoryTickCallback(CATEGORY_LABELS.colour),
  //       },
  //     },
  //   },
  // };

  // const parentalConcernOptions = {
  //   ...categoricalOption,
  //   scales: {
  //     ...categoricalOption.scales,
  //     y: {
  //       ...categoricalOption.scales.y,
  //       max: CATEGORY_LABELS.parentalConcern.length - 1,
  //       ticks: {
  //         ...categoricalOption.scales.y.ticks,
  //         font: {
  //           size: 9,        // Change to any size you want (6, 7, 8 px)
  //           weight: "normal",
  //         },
  //         callback: createCategoryTickCallback(CATEGORY_LABELS.parentalConcern),
  //       },
  //     },
  //   },
  // };

  // const glucoseOptions = {
  //   ...categoricalOption,
  //   scales: {
  //     ...categoricalOption.scales,
  //     y: {
  //       ...categoricalOption.scales.y,
  //       max: CATEGORY_LABELS.glucose.length - 1,
  //       ticks: {
  //         ...categoricalOption.scales.y.ticks,
  //         callback: createCategoryTickCallback(CATEGORY_LABELS.glucose),
  //       },
  //     },
  //   },
  // };

  // const feedingOptions = {
  //   ...categoricalOption,
  //   scales: {
  //     ...categoricalOption.scales,
  //     y: {
  //       ...categoricalOption.scales.y,
  //       max: CATEGORY_LABELS.feeding.length - 1,
  //       ticks: {
  //         ...categoricalOption.scales.y.ticks,
  //         font: {
  //           size: 9,        // Change to any size you want (6, 7, 8 px)
  //           weight: "normal",
  //         },
  //         callback: createCategoryTickCallback(CATEGORY_LABELS.feeding),
  //       },
  //     },
  //   },
  // };

  // const categoricalOption1: ChartOptions<'line'> = {
  //   responsive: true,
  //   scales: {
  //     y: {
  //       min: 0,
  //       max: 3,
  //       ticks: { stepSize: 1 }
  //     },
  //     x: {
  //       ticks: { maxRotation: 0, minRotation: 0 }
  //     }
  //   },
  //   plugins: {
  //     legend: { display: false }
  //   }
  // };


  const [temperatureData, setTemperatureData] = useState<TemperatureData>({
    labels: [], // Initially, there are no labels
    datasets: [], // Initially, there are no datasets
  })
  // const [fullData24h, setFullData24h] = useState<any[]>([]);

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
  }, [times])
  
  const handleAddEntry = async (formData?: any) => {
    try {
      const vitals = formData?.vitals || {};
      const observation = formData?.observation1 || {};

      // Valdiation
      if (vitals.hr) {
        const hr = parseFloat(vitals.hr);
        if (hr < 0 || hr > 300) return alert("Heart Rate must be between 0 and 300 bpm");
      }
      if (vitals.pr) {
        const pr = parseFloat(vitals.pr);
        if (pr < 0 || pr > 300) return alert("Pulse Rate must be between 0 and 300 bpm");
      }
      if (vitals.rr) {
        const rr = parseFloat(vitals.rr);
        if (rr < 0 || rr > 150) return alert("Respiratory Rate must be between 0 and 150 bpm");
      }
      if (vitals.spo2) {
        const spo2 = parseFloat(vitals.spo2);
        if (spo2 < 0 || spo2 > 100) return alert("SpO₂ must be between 0 and 100%");
      }
      if (vitals.skinTemp) {
        const skinTemp = parseFloat(vitals.skinTemp);
        if (skinTemp < 10 || skinTemp > 45) return alert("Skin Temperature must be between 10 and 45°C");
      }
      if (vitals.coreTemp) {
        const coreTemp = parseFloat(vitals.coreTemp);
        if (coreTemp < 10 || coreTemp > 45) return alert("Core Temperature must be between 10 and 45°C");
      }

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
      
      // Clear Inputs
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
      setObservation1({
        grunting: "",
        colour: "",
        neuro: "",
        feeding: "",
        glucose: "",
        parentalConcerns: "",
      });
      setStep(1);

      // Refresh Data
      setLoading(true);
      fetchManualTrends(props.patient_resource_id)
        .then((data) => setManualData(data))
        .finally(() => setLoading(false));

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
  let cachedObservationId: string | null = null;
let vitalsAbortController: AbortController | null = null;
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

  const handleSelect = (field: keyof typeof observation1) => (_: any, value: string | null) => {
    if (value !== null) setObservation1((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => setStep((prev) => prev + 1);
  const handleBack = () => setStep((prev) => prev - 1);

  function getVisibleXAxisTicks(chartRef: React.MutableRefObject<any>) {
    if (!chartRef?.current) return [];

    const scale = chartRef.current.scales.x;
    if (!scale) return [];

    // Chart.js stores visible ticks here
    return scale.ticks.map((t: { label: any; }) => t.label);
  }
  const handleInputChange = (field: keyof VitalsData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value;
    
    // Length limits
    if (["hr", "pr", "rr", "spo2"].includes(field)) {
      if (value.length > 3) return;
    }
    if (["skinTemp", "coreTemp"].includes(field)) {
      if (value.length > 4) return;
    }
    if (field === "bp" && value.length > 7) return;

    // Only restrict to numbers and decimals for numeric vital inputs, leave observation alone
    if ((field as string) !== "observation" && field !== "bp") {
      value = value.replace(/[^0-9.]/g, '');
      const parts = value.split('.');
      if (parts.length > 2) {
        value = parts[0] + '.' + parts.slice(1).join('');
      }
    } else if (field === "bp") {
      value = value.replace(/[^0-9/]/g, '');
    }
    setVitals({ ...vitals, [field]: value });
  };


const downloadTrendsPDF = async () => {
    const hideXAxis = () => {
        [chartRef1, chartRef2, chartRef3, chartRef4, chartRef5].forEach(ref => {
            const c = ref?.current;
            if (c) { c.options.scales.x.display = false; c.update(); }
        });
    };

    const showXAxis = () => {
        [chartRef1, chartRef2, chartRef3, chartRef4, chartRef5].forEach(ref => {
            const c = ref?.current;
            if (c) { c.options.scales.x.display = true; c.update(); }
        });
    };

    hideXAxis();

    const doc       = new jsPDF("p", "pt", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const padding   = 30;
    const headerHeight = 85;

    // =========================
    // 1️⃣ FETCH ORGANIZATION + LOGO + FOOTER DATA
    // =========================
    let orgName    = "Unknown Organization";
    let logoDataUrl: string | null = null;

    let footerAddress  = "";
    let footerPhones: string[] = [];
    let footerEmail    = "";
    let footerWebsite  = "";

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

        // ── Logo ──────────────────────────────────────────────
        const logoExt = (orgData.extension || []).find(
            (ext: any) => ext.url === "http://example.org/fhir/StructureDefinition/organization-logo"
        );
        const logoRef = logoExt?.valueReference?.reference;
        if (logoRef) {
            const binaryId  = logoRef.replace("Binary/", "");
            const binaryRes = await fetch(
                `${import.meta.env.VITE_FHIRAPI_URL}/Binary/${binaryId}`,
                {
                    headers: {
                        Authorization: "Basic " + btoa("fhiruser:change-password"),
                        Accept: "application/fhir+json",
                    },
                }
            );
            if (!binaryRes.ok) throw new Error(`Binary fetch failed: ${binaryRes.status}`);
            const binaryData = await binaryRes.json();
            if (binaryData.data && binaryData.contentType) {
                logoDataUrl = `data:${binaryData.contentType};base64,${binaryData.data}`;
            }
        }

        // ── Address ───────────────────────────────────────────
        const addr = orgData.address?.[0];
        if (addr) {
            footerAddress = [
                addr.line?.join(", "),
                addr.city,
                addr.state,
                addr.postalCode,
                addr.country,
            ].filter(Boolean).join(", ");
        }

        // ── Telecom ───────────────────────────────────────────
        (orgData.telecom || []).forEach((t: any) => {
            if (t.system === "phone") footerPhones.push(t.value);
            if (t.system === "email") footerEmail   = t.value;
            if (t.system === "url")   footerWebsite = t.value;
        });

    } catch (err) {
        console.error("Error fetching organization/logo:", err);
    }

    // =========================
    // 🧾 HEADER
    // =========================
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, headerHeight + 10, "F");

    if (logoDataUrl) {
        doc.addImage(logoDataUrl, "PNG", padding, 20, 80, 20);
    }

    const cardW = 220;
    const cardH = 60;
    const cardX = pageWidth - cardW - padding;
    const cardY = 30;

    // Title tab
    doc.setFillColor(220, 225, 230);
    doc.roundedRect(cardX + 20, cardY - 15, cardW - 20, 15, 3, 3, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(40);
    doc.text("VITALS AND TRENDS", cardX + 65, cardY - 3);

    // Info card
    doc.setDrawColor(200, 208, 215);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(cardX + 10, cardY, cardW, cardH - 5, 5, 5, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(50);

    doc.text(`B/O: ${props.patient_name    || ""}`, cardX + 15,  cardY + 15);
    doc.text(`ID: ${props.patient_id       || ""}`, cardX + 140, cardY + 15);
    doc.text(`G.A: ${props.gestational_age || ""}`, cardX + 15,  cardY + 32);
    doc.text(`TimeFrame: ${timeFrame} Hrs`,          cardX + 140, cardY + 32);
    doc.text(`Gender: ${props.gender       || ""}`, cardX + 15,  cardY + 49);

    // Header divider
    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(1);
    doc.line(padding, headerHeight + 10, pageWidth - padding, headerHeight + 10);

    // =========================
    // 📊 CHART GRID
    // =========================
    const sidebarWidth = 35;
    const chartStartX  = padding + sidebarWidth;
    const chartWidth   = pageWidth - chartStartX - padding;
    const rowHeight    = 150;
    let currentY       = 110;

    // Time header row
    const timeList = getVisibleXAxisTicks(chartRef1);
    if (timeList.length > 0) {
        const cellWidth = chartWidth / timeList.length;

        doc.setFillColor(240, 240, 240);
        doc.rect(padding, currentY, sidebarWidth, 25, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.text("TIME", padding + 5, currentY + 16);

        doc.setFillColor(248, 249, 250);
        doc.rect(chartStartX, currentY, chartWidth, 25, "F");
        doc.setDrawColor(200);
        doc.rect(chartStartX, currentY, chartWidth, 25, "D");

        timeList.forEach((t: string | string[], i: number) => {
            const x = chartStartX + i * cellWidth + cellWidth / 2;
            doc.setFontSize(7);
            doc.text(t, x, currentY + 15, { align: "center" });
        });
        currentY += 30;
    }

    // Chart rows
    const chartIds = [
        { id: "temperatureGraph", title: "TEMPERATURE" },
        { id: "respirationGraph", title: "RESPIRATION" },
        { id: "pulseGraph",       title: "PULSE RATE"  },
        { id: "spo2Graph",        title: "SpO2"        },
    ];

    for (const chart of chartIds) {
        const el = document.getElementById(chart.id);
        if (!el) continue;

        doc.setDrawColor(200);
        doc.setFillColor(255, 255, 255);
        doc.rect(padding, currentY, sidebarWidth + chartWidth, rowHeight, "D");

        doc.setFillColor(248, 249, 250);
        doc.rect(padding, currentY, sidebarWidth, rowHeight, "F");
        doc.line(chartStartX, currentY, chartStartX, currentY + rowHeight);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text(chart.title, padding + 23, currentY + (rowHeight / 1.5), { angle: 90 });

        const canvas  = await html2canvas(el, { scale: 2, backgroundColor: "#fff", logging: false, useCORS: true });
        const imgData = canvas.toDataURL("image/png");
        doc.addImage(imgData, "PNG", chartStartX + 1, currentY + 1, chartWidth - 2, rowHeight - 2);

        currentY += rowHeight + 8;
    }

    // =========================
    // 4️⃣ FOOTER — built from org resource
    // =========================
    const logoX      = padding;  // reuse padding as left anchor (matches header logo)
    const totalPages = (doc as any).internal.getNumberOfPages();

    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        const pageHeight = doc.internal.pageSize.getHeight();

        // Divider line
        doc.setDrawColor(238, 238, 238);
        doc.setLineWidth(1);
        doc.line(logoX, pageHeight - 50, pageWidth - logoX, pageHeight - 50);

        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.setFont("helvetica", "normal");

        // Row 1 — Address
        doc.text(footerAddress || "Address not available", logoX, pageHeight - 35);

        // Row 2 — Phones | Email | Website + page number
        const contactParts: string[] = [];
        if (footerPhones.length > 0) contactParts.push(footerPhones.join(", "));
        if (footerEmail)             contactParts.push(footerEmail);
        if (footerWebsite)           contactParts.push(footerWebsite);

        doc.text(contactParts.join("  |  "), logoX, pageHeight - 21);
        doc.text(`Page ${i}/${totalPages}`, pageWidth - logoX - 30, pageHeight - 21);
    }

    showXAxis();
    doc.save(`Trends_Report_${props.patient_id}.pdf`);
};

  // async function fetchDeviceVitals(patientId: string, timeframeHours = 48) {
  //   // console.log("📡 fetchDeviceVitals() called", { patientId, timeframeHours });

  //   try {
  //     const sinceDate = new Date(Date.now() - timeframeHours * 3600 * 1000).toISOString();
  //     // console.log("⏳ Fetching history since:", sinceDate);

  //     // ---------------- SEARCH LATEST OBSERVATION ----------------
  //     const searchUrl =
  //       `${import.meta.env.VITE_FHIRAPI_URL}/Observation?subject=Patient/${patientId}` +
  //       `&category=data-log&_sort=-_lastUpdated&_count=1`;

  //     // console.log("🔍 Search URL:", searchUrl);

  //     const searchResponse = await fetch(searchUrl, {
  //       headers: {
  //         Authorization: "Basic " + btoa("fhiruser:change-password"),
  //         Accept: "application/fhir+json",
  //       },
  //     });

  //     // console.log("🔎 Search Response Status:", searchResponse.status);

  //     const searchResult = await searchResponse.json();
  //     // console.log("📥 Search Result:", searchResult);

  //     if (!searchResult.entry?.length) {
  //       console.warn("⚠ No observation entries found for patient.");
  //       return [];
  //     }

  //     const observationId = searchResult.entry[0].resource.id;
  //     // console.log("🆔 Latest Observation ID:", observationId);

  //     // ---------------- FETCH OBSERVATION HISTORY ----------------
  //     const historyUrl =
  //       `${import.meta.env.VITE_FHIRAPI_URL}/Observation/${observationId}` +
  //       `/_history?_since=${sinceDate}&_count=10000`;

  //     // console.log("📜 History URL:", historyUrl);

  //     const historyResponse = await fetch(historyUrl, {
  //       headers: {
  //         Authorization: "Basic " + btoa("fhiruser:change-password"),
  //         Accept: "application/fhir+json",
  //       },
  //     });

  //     // console.log("📄 History Response Status:", historyResponse.status);

  //     const bundle = await historyResponse.json();
  //     // console.log("📦 History Bundle:", bundle);

  //     // ---------------- PARSE HISTORY DATA ----------------
  //     const parsed =
  //       bundle.entry?.map((entry: any) => {
  //         const obs = entry.resource;
  //         // console.log("🔧 Parsing Observation Entry:", obs);

  //         const time = obs.effectiveDateTime;
  //         const values: Record<string, number | string> = {};

  //         obs.component?.forEach((c: any) => {
  //           const label = c.code?.coding?.[0]?.display;
  //           const value = c.valueQuantity?.value ?? c.valueString;

  //           // console.log(`   ➕ Component: ${label} = ${value}`);

  //           if (label && value !== undefined) values[label] = value;
  //         });

  //         return { time, ...values };
  //       }) || [];

  //     // console.log("🔍 Parsed Values (Before Sort):", parsed);

  //     const sorted = parsed.sort((a: any, b: any) =>
  //       new Date(a.time).getTime() - new Date(b.time).getTime()
  //     );

  //     // console.log("✅ Sorted Device Vitals:", sorted);

  //     return sorted;
  //   } catch (err) {
  //     console.error("❌ Error fetching device history:", err);
  //     return [];
  //   }
  // }
async function fetchDeviceVitals(patientId: string, timeframeHours = 48) {
  // 1. Cancel any previous pending request to save bandwidth and CPU
  if (vitalsAbortController) {
    vitalsAbortController.abort();
  }
  vitalsAbortController = new AbortController();

  try {
    const sinceDate = new Date(Date.now() - timeframeHours * 3600 * 1000).toISOString();
    let obsId = cachedObservationId;

    // 2. Search for the ID ONLY if we haven't found it yet
    if (!obsId) {
      const searchUrl = `${import.meta.env.VITE_FHIRAPI_URL}/Observation?subject=Patient/${patientId}&category=data-log&_sort=-_lastUpdated&_count=1`;
      
      const searchResponse = await fetch(searchUrl, {
        headers: {
          Authorization: "Basic " + btoa("fhiruser:change-password"),
          Accept: "application/fhir+json",
        },
        signal: vitalsAbortController.signal,
      });

      const searchResult = await searchResponse.json();
      if (!searchResult.entry?.length) {
        return [];
      }
      obsId = searchResult.entry[0].resource.id;
      cachedObservationId = obsId; // Store it for future calls
    }

    // 3. Fetch History
    const historyUrl = `${import.meta.env.VITE_FHIRAPI_URL}/Observation/${obsId}/_history?_since=${sinceDate}&_count=10000`;

    const historyResponse = await fetch(historyUrl, {
      headers: {
        Authorization: "Basic " + btoa("fhiruser:change-password"),
        Accept: "application/fhir+json",
      },
      signal: vitalsAbortController.signal,
    });

    const bundle = await historyResponse.json();
    const entries = bundle.entry || [];
    const totalEntries = entries.length;

    // 4. Calculate Skip Factor (Downsampling)
    // Goal: Don't overwhelm the chart. Aim for ~2000-3000 points max.
    let skipFactor = 1;
    if (totalEntries > 5000) skipFactor = 5;
    if (totalEntries > 20000) skipFactor = 15;
    if (totalEntries > 50000) skipFactor = 30;

    const parsed: any[] = [];

    // 5. Optimized Loop with Skip Logic
    // We iterate backwards because FHIR history is usually Newest -> Oldest
    for (let i = 0; i < totalEntries; i += skipFactor) {
      const obs = entries[i].resource;
      const row: any = { time: obs.effectiveDateTime };

      const components = obs.component || [];
      for (let j = 0; j < components.length; j++) {
        const c = components[j];
        const label = c.code?.coding?.[0]?.display;
        if (label) {
          row[label] = c.valueQuantity?.value ?? c.valueString;
        }
      }
      parsed.push(row);
    }

    // 6. Final Sort: Chronological order (Oldest -> Newest)
    // Since we parsed Newest -> Oldest with skip, a reverse is much faster than a full .sort()
    return parsed.reverse();

  } catch (err: any) {
    if (err.name === 'AbortError') {
      // Ignore abort errors - it just means a newer request started
      return [];
    }
    console.error("❌ Error fetching device history:", err);
    return [];
  }
}


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
        // fetchDeviceVitals(props.patient_resource_id)
        .then((data) => setManualData(data))
        .finally(() => setLoading(false));
    }
  }, [dataSource, props.patient_resource_id]);

  useEffect(() => {
     setLoading(true);
    fetchDeviceVitals(props.patient_resource_id)
      .then((data) => setDeviceData(data))
        .finally(() => setLoading(false));
      
  }, [props.patient_resource_id, timeFrame]);

  const filteredManualData = useMemo(() => {
    if (!manualData.length) return [];

    const now = timeFrameEnd;  // use selected end time
    const cutoff = now - timeFrame * 60 * 60 * 1000;

    return manualData.filter((d) => {
      const t = new Date(d.time).getTime();
      return t >= cutoff && t <= now;   // INCLUDE END
    });

  }, [manualData, timeFrame, timeFrameEnd]);

  const filteredDeviceData = useMemo(() => {
    if (!deviceData.length) return [];

    const now = timeFrameEnd;
    const cutoff = now - timeFrame * 60 * 60 * 1000;

    return deviceData.filter((d: any) => {
      const t = new Date(d.time).getTime();
      return t >= cutoff && t <= now;
    });

  }, [deviceData, timeFrame, timeFrameEnd]);

    function generateTimeLabels(
    hours: number,
    sourceData: any[],
    timeFrameEnd: number
  ) {
    if (!sourceData.length) return [];

    // 1️⃣ maxTime = timeFrameEnd (user-selected point)
    const maxTime = timeFrameEnd;

    // 2️⃣ Start = end - timeframe hours
    const minTime = maxTime - hours * 60 * 60 * 1000;

    const interval = 1 * 60 * 1000; // 3 minute interval
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


  function prepareManualTemperatureData_Filtered(data: any[], hours: number, timeFrameEnd: number) {
    const labels = generateTimeLabels(hours, data, timeFrameEnd);
    const findClosestPoint = (target: number, key: string) => {
      const WINDOW = 2 * 60 * 1000;
      let closest = null; let minDiff = Infinity;
      data.forEach((item) => {
        const t = new Date(item.time).getTime();
        const diff = Math.abs(t - target);
        if (diff < minDiff && diff <= WINDOW) {
          minDiff = diff;
          closest = item[key] ?? null;
        }
      }); return closest;
    };
    return {
      labels: labels.map(l => l.label),
      datasets: [
        {
          label: "Skin Temp",
          data: labels.map(l => findClosestPoint(l.timestamp, "Skin Temperature")),
          pointRadius: 0,
          borderWidth: 2.5,
          borderColor: '#1565C0',
          fill: false,
          order: 0,
          pointHoverRadius: 5,
          spanGaps: true,
        },
        {
          label: "Core Temp",
          data: labels.map(l => findClosestPoint(l.timestamp, "Core Temperature")),
          pointRadius: 0,
          borderWidth: 2.5,
          borderColor: '#C62828',
          fill: false,
          order: 0,
          pointHoverRadius: 5,
          spanGaps: true,
        }]
    };
  }


 function prepareDeviceTemperatureData(deviceData: any[], hours: number, timeFrameEnd: number) {
  const labels = generateTimeLabels(hours, deviceData, timeFrameEnd);
  
  // 1. Sort data by time once to allow the pointer to work (O(n log n))
  const sortedData = [...deviceData].sort(
    (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
  );

  const WINDOW = 2 * 60 * 1000; // 2 minutes
  const MIN_TEMP = 30;
  const MAX_TEMP = 45;

  /**
   * Helper to find data points in one pass (O(n))
   */
  const getOptimizedPoints = (key: string) => {
    let dataIdx = 0;
    
    return labels.map((l) => {
      const target = l.timestamp;

      // Move the pointer forward to skip data older than our current window
      while (
        dataIdx < sortedData.length && 
        new Date(sortedData[dataIdx].time).getTime() < target - WINDOW
      ) {
        dataIdx++;
      }

      // Check the current and next few points within the window
      // (Since it's sorted, we only need to look at the immediate vicinity)
      let bestMatch = null;
      let minDiff = Infinity;
      let tempIdx = dataIdx;

      while (
        tempIdx < sortedData.length && 
        new Date(sortedData[tempIdx].time).getTime() <= target + WINDOW
      ) {
        const item = sortedData[tempIdx];
        const itemTime = new Date(item.time).getTime();
        const diff = Math.abs(itemTime - target);
        const val = item[key];

        // RANGE VALIDATION: Only accept if within 30-45 and better than previous match
        if (val !== null && val >= MIN_TEMP && val <= MAX_TEMP) {
          if (diff < minDiff) {
            minDiff = diff;
            bestMatch = val;
          }
        }
        tempIdx++;
      }

      return bestMatch;
    });
  };

  return {
    labels: labels.map((l) => l.label),
    datasets: [
      {
        label: "Skin Temp(Device)",
        data: getOptimizedPoints("CURRENT SKIN TEMPERATURE"),
        pointRadius: 0,
        borderWidth: 2.5,
        borderColor: "#007bff",
        fill: false,
        spanGaps: false, // Prevents lines jumping over large missing gaps
      },
      {
        label: "Core Temp(Device)",
        data: getOptimizedPoints("CURRENT PERIPHERAL TEMPERATURE"),
        pointRadius: 0,
        borderWidth: 2.5,
        borderColor: "#ff5733",
        fill: false,
        spanGaps: false,
      },
    ],
  };
}
  function prepareDeviceSpo2Data(deviceData: any[], hours: number, timeFrameEnd: number) {
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
          label: "SpO₂(Device)",
          data: labels.map(l => findClosestPoint(l.timestamp, "CURRENT SPO2")),
          pointRadius: 0,
          borderWidth: 2.5,
          borderColor: "#007bff",
          fill: false,
          spanGaps: true,
        }
      ]
    };
  }

  function prepareDevicePrData(deviceData: any[], hours: number, timeFrameEnd: number) {
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
          label: "PR(Device)",
          data: labels.map(l => findClosestPoint(l.timestamp, "CURRENT PULSE RATE")),
          pointRadius: 0,
          borderWidth: 2.5,
          borderColor: "#007bff",
          fill: false,
          spanGaps: true,
        }
      ]
    };
  }

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
          pointRadius: 0,
          pointHoverRadius: 5,
          borderWidth: 2.5,
          fill: false,
          spanGaps: true,
        }
      ]
    };
  }

  
  const temperatureData1 = useMemo(() => {
    return prepareManualTemperatureData_Filtered(filteredManualData, timeFrame, timeFrameEnd);

  }, [filteredManualData, timeFrame, timeFrameEnd]);
  const temperatureData2 = useMemo(() => {
    return prepareDeviceTemperatureData(filteredDeviceData, timeFrame, timeFrameEnd);

  }, [filteredDeviceData, timeFrame, timeFrameEnd]);

  const pulseoximeterDataM = useMemo(() => {
    return preparePulseOXDataFiltered(
      filteredManualData,
      timeFrame,
      timeFrameEnd,
      "Pulse Rate"
    );
  }, [filteredManualData, timeFrame, timeFrameEnd]);
  const devicePulseRate = useMemo(() => {
    return prepareDevicePrData(
      filteredDeviceData,
      timeFrame,
      timeFrameEnd,

    );
  }, [filteredDeviceData, timeFrame, timeFrameEnd]);

  const pulseoximeterData2 = useMemo(() => {
    return preparePulseOXDataFiltered(
      filteredManualData,
      timeFrame,
      timeFrameEnd,
      "SpO₂"
    );
  }, [filteredManualData, timeFrame, timeFrameEnd]);
  const deviceSpo2Data = useMemo(() => {
    return prepareDeviceSpo2Data(
      filteredDeviceData,
      timeFrame,
      timeFrameEnd,

    );
  }, [filteredDeviceData, timeFrame, timeFrameEnd]);
  const pulseoximeterData3 = useMemo(() => {
    return preparePulseOXDataFiltered(
      filteredManualData,
      timeFrame,
      timeFrameEnd,
      "Respiratory Rate"
    );
  }, [filteredManualData, timeFrame, timeFrameEnd]);


  const combinedTemperatureData = useMemo(() => {
    const labels =
      temperatureData1.labels.length > temperatureData2.labels.length
        ? temperatureData1.labels
        : temperatureData2.labels;

    return {
      labels,
      datasets: [
        ...temperatureData1.datasets,
        ...temperatureData2.datasets,
      ]
    };
  }, [temperatureData1, temperatureData2]);

  // const combinedSpo2Data = useMemo(() => {
  //   const labels =
  //     pulseoximeterData2.labels.length > deviceSpo2Data.labels.length
  //       ? pulseoximeterData2.labels
  //       : deviceSpo2Data.labels;

  //   return {
  //     labels,
  //     datasets: [
  //       ...pulseoximeterData2.datasets,
  //       ...deviceSpo2Data.datasets,
  //     ]
  //   };
  // }, [pulseoximeterData2, deviceSpo2Data]);


  const combinedSpo2Data = useMemo(() => {
  const labels =
    pulseoximeterData2.labels.length > deviceSpo2Data.labels.length
      ? pulseoximeterData2.labels
      : deviceSpo2Data.labels;

  const cyanBlue = "#0CB0D3";

  const allDatasets = [
    ...pulseoximeterData2.datasets,
    ...deviceSpo2Data.datasets,
  ].map((dataset) => ({
    ...dataset,
    borderColor: cyanBlue,
    backgroundColor: cyanBlue, // Point color
    pointBackgroundColor: cyanBlue,
    pointBorderColor: "#fff",
    pointHoverBackgroundColor: "#fff",
    pointHoverBorderColor: cyanBlue,
    borderWidth: 2,
    tension: 0.3, // Keeps the line smooth
    fill: false,  // Set to true if you want an area chart
  }));

  return {
    labels,
    datasets: allDatasets,
  };
}, [pulseoximeterData2, deviceSpo2Data]);

  const combinedPrData = useMemo(() => {
    return {
      labels: devicePulseRate.labels.length
        ? devicePulseRate.labels
        : pulseoximeterDataM.labels,

      datasets: [
        ...pulseoximeterDataM.datasets,  // manual
        ...devicePulseRate.datasets,     // device
      ],
    };
  }, [pulseoximeterDataM, devicePulseRate]);

  const manualGraph = useMemo(() => {
    return (
      <Box height="100%" width="100%" mx="auto">
        <Grid container spacing={2}>
          {/* 🌡️ Temperature Graph */}
          <Grid item xs={12} lg={6}>
            <Stack
              height="100%"
              p={1}
              sx={{
                backgroundColor: '#FFFFFF',
                borderRadius: 2,
                boxShadow: '0px 2px 6px rgba(0,0,0,0.1)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5, flexWrap: 'wrap', gap: 0.5 }}>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <ThermostatIcon sx={{ color: '#F76707', fontSize: 20 }} />
                  <Typography variant="h6" align="left" sx={{ fontWeight: 600, color: '#343a40', fontSize: '16px', lineHeight: 1 }}>
                    Temperature <span style={{ fontWeight: 400, color: '#ADB5BD', fontSize: '12px' }}>°C</span>
                  </Typography>
                </Stack>
                <div id="legend-container" style={{ display: 'flex', flexWrap: 'nowrap', gap: '20px', alignItems: 'center', fontSize: '0.75rem' }}></div>
              </Box>
              <Box sx={{ position: 'relative', height: { xs: 200, sm: 240, md: 260, lg: 240 }, width: '100%' }} id="temperatureGraph">
                <Line
                  key={timeFrame}
                  ref={chartRef1}
                  options={temperatureOption as ChartOptions<'line'>}
                  data={combinedTemperatureData}
                  plugins={[temperatureLegendPlugin, crosshairPlugin]}
                />
              </Box>
            </Stack>
          </Grid>

          {/* 🌬️ Respiration Rate Graph */}
          <Grid item xs={12} lg={6}>
            <Stack
              height="100%"
              p={1}
              sx={{
                backgroundColor: '#FFFFFF',
                borderRadius: 2,
                boxShadow: '0px 2px 6px rgba(0,0,0,0.1)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5, flexWrap: 'wrap', gap: 0.5 }}>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <ShowChartIcon sx={{ color: '#FAB005', fontSize: 20 }} />
                  <Typography variant="h6" align="left" sx={{ fontWeight: 600, color: '#343a40', fontSize: '16px', lineHeight: 1 }}>
                    Respiration <span style={{ fontWeight: 400, color: '#ADB5BD', fontSize: '12px' }}>(bpm)</span>
                  </Typography>
                </Stack>
                <div id="legend-container-manual-RR" style={{ display: 'flex', flexWrap: 'nowrap', gap: '20px', alignItems: 'center', fontSize: '0.75rem' }}></div>
              </Box>
              <Box sx={{ position: 'relative', height: { xs: 200, sm: 240, md: 260, lg: 240 }, width: '100%' }} id="respirationGraph">
                <Line
                  options={pulseoximeterOption3 as ChartOptions<'line'>}
                  ref={chartRef4}
                  data={pulseoximeterData3}
                  plugins={[temperatureLegendPlugin, crosshairPlugin]}
                />
              </Box>
            </Stack>
          </Grid>

          {/* ❤️ Heart/Pulse Rate Graph */}
          <Grid item xs={12} lg={6}>
            <Stack
              height="100%"
              p={1}
              spacing={0.5}
              sx={{
                backgroundColor: '#FFFFFF',
                borderRadius: 2,
                boxShadow: '0px 2px 6px rgba(0,0,0,0.1)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5, flexWrap: 'wrap', gap: 0.5 }}>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <MonitorHeartIcon sx={{ color: '#F06595', fontSize: 20 }} />
                  <Typography variant="h6" align="left" sx={{ fontWeight: 600, color: '#343a40', fontSize: '16px', lineHeight: 1 }}>
                    Heart/Pulse Rate <span style={{ fontWeight: 400, color: '#ADB5BD', fontSize: '12px' }}>(bpm)</span>
                  </Typography>
                </Stack>
                <div id="legend-container-manual-pulse" style={{ display: 'flex', flexWrap: 'nowrap', gap: '20px', alignItems: 'center', fontSize: '0.75rem' }}></div>
              </Box>
              <Box sx={{ position: 'relative', height: { xs: 200, sm: 240, md: 260, lg: 240 }, width: '100%' }} id="pulseGraph">
                <Line
                  ref={chartRef2}
                  options={pulseoximeterOption1 as ChartOptions<'line'>}
                  data={combinedPrData}
                  plugins={[temperatureLegendPlugin, crosshairPlugin]}
                />
              </Box>
            </Stack>
          </Grid>

          {/* 🩸 SpO₂ Graph */}
          <Grid item xs={12} lg={6}>
            <Stack
              height="100%"
              p={1}
              sx={{
                backgroundColor: '#FFFFFF',
                borderRadius: 2,
                boxShadow: '0px 2px 6px rgba(0,0,0,0.1)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5, flexWrap: 'wrap', gap: 0.5 }}>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <WaterDropIcon sx={{ color: '#228BE6', fontSize: 20 }} />
                  <Typography variant="h6" align="left" sx={{ fontWeight: 600, color: '#343a40', fontSize: '16px', lineHeight: 1 }}>
                    SpO₂ <span style={{ fontWeight: 400, color: '#ADB5BD', fontSize: '12px' }}>(%)</span>
                  </Typography>
                </Stack>
                <div id="legend-container3" style={{ display: 'flex', flexWrap: 'nowrap', gap: '20px', alignItems: 'center', fontSize: '0.75rem' }}></div>
              </Box>
              <Box sx={{ position: 'relative', height: { xs: 200, sm: 240, md: 260, lg: 240 }, width: '100%' }} id="spo2Graph">
                <Line
                  options={sp02Option as ChartOptions<'line'>}
                  data={combinedSpo2Data}
                  ref={chartRef5}
                  plugins={[temperatureLegendPlugin, crosshairPlugin]}
                />
              </Box>
            </Stack>
          </Grid>

          {/* --- Categorical Data Table --- */}
          <Grid item xs={12}>
            <Box
              id="observationSummaryTable"
              sx={{
                backgroundColor: "#FFFFFF",
                borderRadius: 2,
                boxShadow: "0px 2px 6px rgba(0,0,0,0.1)",
                p: 2,
                overflowX: "auto",
              }}
            >
              {(() => {
                const allLabels = generateTimeLabels(timeFrame, filteredManualData, timeFrameEnd);
                const step = Math.max(1, Math.floor(allLabels.length / 10));
                const sampledColumns = allLabels.filter((_, idx) => idx % step === 0);
                const intervalMs = (timeFrame * 60 * 60 * 1000) / 10;
                const WINDOW = intervalMs / 2; // Strict half-interval to avoid duplication

                return (
                  <Box sx={{ minWidth: 800 }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #EEEDF1" }}>
                      <thead>
                        <tr>
                          <th style={{ border: "1px solid #EEEDF1", padding: "10px 16px", backgroundColor: "#F8F9FA", textAlign: "left", color: "#888", fontWeight: 600, fontSize: "11px", letterSpacing: "0.5px", textTransform: "uppercase", width: "150px" }}>
                            Time
                          </th>
                          {sampledColumns.map((l, idx) => {
                            const labelStr = Array.isArray(l.label) ? l.label.join(" ") : l.label;
                            return (
                              <th key={idx} style={{ border: "1px solid #EEEDF1", padding: "8px", backgroundColor: "#F8F9FA", color: "#888", fontWeight: 500, fontSize: "11px", whiteSpace: "nowrap" }}>
                                {labelStr}
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { label: "Grunting", field: "Grunting" },
                          { label: "Color", field: "Colour" },
                          { label: "Neuro", field: "Neuro" },
                          { label: "Feeding", field: "Feeding" },
                          { label: "Glucose", field: "Glucose" }
                        ].map((row) => (
                          <tr key={row.field}>
                            <td style={{ border: "1px solid #EEEDF1", padding: "10px 16px", fontWeight: 600, color: "#495057", backgroundColor: "#FAFAFA", fontSize: "12px" }}>
                              {row.label}
                            </td>
                            {sampledColumns.map((l, idx) => {
                              let value = "--";
                              let minDiff = Infinity;

                              filteredManualData.forEach((item) => {
                                const t = new Date(item.time).getTime();
                                const diff = Math.abs(t - l.timestamp);
                                // Use strict less-than to avoid boundary overlap
                                if (diff < minDiff && diff < WINDOW) {
                                  minDiff = diff;
                                  value = item[row.field] || "--";
                                }
                              });

                              return (
                                <td key={idx} style={{ border: "1px solid #EEEDF1", padding: "8px", textAlign: "center", color: value === "--" ? "#CCC" : "#333", fontSize: "12px" }}>
                                  {value}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Box>
                );
              })()}
            </Box>
          </Grid>

        </Grid>
      </Box >

    );


  }, [manualData, deviceData, timeFrame])

  useEffect(() => { console.log(selectedLegends) }, [selectedLegends])

  const graph = useMemo(() => {
    return (

      <Stack height="100%" width="100%" spacing={2}
        sx={{
          backgroundColor: 'transparent', alignItems: 'center', // centers each chart horizontally
          justifyContent: 'center',
        }} mx="auto" mt={2} >
        {/* 🌡️ Temperature */}
        <Stack width="95%" p={3} spacing={1}
          sx={{ backgroundColor: '#FFFFFF', borderRadius: 2, boxShadow: '0px 2px 6px rgba(0,0,0,0.1)' }}>
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
        <Stack width="95%" p={3} spacing={1}
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


  }, [rendergraph, loading])

  const combinedData = dataSource === "log"
    ? [...(manualData || []),]
    : manualData;


  return (
    <React.Fragment>
     
        <Box sx={{maxWidth: { xs: '80%', md: '80%',lg:'100%' }, }}>

        <Box mt={1} mb={1} display={'flex'} justifyContent={'space-between'}>
          <Typography variant="h6" sx={{ color: isDarkMode ? theme.palette.text.primary : "#0F3B61" }} gutterBottom>
                Vitals & Trends
              </Typography>
  <Box display={"flex"}  alignItems="center"
  justifyContent="flex-end"
  gap={1.5}>
    <IconButton 
 onClick={downloadTrendsPDF} // Add this
  sx={{
    backgroundColor: alpha("#228BE6", 0.1),
    color: "#228BE6",
    borderRadius: "8px",
    px: 2, py: 0.9,
    "&:hover": { backgroundColor: alpha("#228BE6", 0.2) },
  }}
>
  <DownloadIcon />
</IconButton>
   <Button
  startIcon={<AddIcon fontSize="small" />}
  onClick={() => setManualVitalsDialog(true)}
                disabled={dataSource !== "manual"}
  sx={{
    backgroundColor: alpha("#228BE6", 0.1),
    color: "#228BE6",
    textTransform: "none",
    borderRadius: "8px",
    px: 3,
  }}
>
  Entry
</Button>

  </Box>
  </Box>

          {graphData ? (
            <>
              {/* Vitals Display Row — unified horizontal bar */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  width: '100%',
                  maxWidth: 1400,
                  minHeight: { xs: 'auto', md: 74 },
                  backgroundColor: isDarkMode ? theme.palette.background.paper : '#FFFFFF',
                  borderRadius: 2,
                  boxShadow: '0px 1px 4px rgba(0,0,0,0.06)',
                  border: `1px solid ${isDarkMode ? theme.palette.divider : '#EEEDF1'}`,
                  mb: 2,
                  mt: 1,
                  overflow: 'hidden',
                }}
              >
                {[
                  {
                    title: "HEART RATE",
                    value: latestManual && (latestManual["Pulse Rate"] || latestManual["Heart Rate"]) ? (latestManual["Pulse Rate"] || latestManual["Heart Rate"]) : "--",
                    status: (val: any) => val === "--" ? null : val > 160 ? { text: "HIGH", color: "#E8590C", bg: "#FFF4E6" } : val < 100 ? { text: "LOW", color: "#2196F3", bg: "#E3F2FD" } : { text: "STABLE", color: "#2F9E44", bg: "#EBFBEE" }
                  },
                  {
                    title: "RESP RATE",
                    value: latestManual && latestManual["Respiratory Rate"] ? latestManual["Respiratory Rate"] : "--",
                    status: (val: any) => val === "--" ? null : val > 60 ? { text: "HIGH", color: "#E8590C", bg: "#FFF4E6" } : val < 30 ? { text: "LOW", color: "#E8590C", bg: "#FFF4E6" } : { text: "STABLE", color: "#2F9E44", bg: "#EBFBEE" }
                  },
                  {
                    title: "O2 SATURATION",
                    value: latestManual && latestManual["SpO₂"] ? latestManual["SpO₂"] + "%" : "--",
                    status: (val: any) => val === "--" ? null : parseInt(val) < 90 ? { text: "LOW", color: "#F59F00", bg: "#FFF9DB" } : parseInt(val) < 95 ? { text: "LOW", color: "#F59F00", bg: "#FFF9DB" } : { text: "STABLE", color: "#2F9E44", bg: "#EBFBEE" }
                  },
                  {
                    title: "TEMP (AX)",
                    value: latestManual && (latestManual["Temperature"] || latestManual["Core Temperature"] || latestManual["Skin Temperature"]) ? (latestManual["Temperature"] || latestManual["Core Temperature"] || latestManual["Skin Temperature"]) + "°" : "--",
                    status: (val: any) => val === "--" ? null : parseFloat(val) > 37.5 ? { text: "HIGH", color: "#E8590C", bg: "#FFF4E6" } : parseFloat(val) < 36.5 ? { text: "LOW", color: "#2196F3", bg: "#E3F2FD" } : { text: "STABLE", color: "#2F9E44", bg: "#EBFBEE" }
                  },
                ].map((card, idx) => {
                  const stat = card.status ? card.status(card.value) : null;
                  return (
                    <Box
                      key={idx}
                      sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        px: 3,
                        py: 1.5,
                        borderRight: { xs: 'none', sm: `1px solid ${isDarkMode ? theme.palette.divider : '#EEEDF1'}` },
                        borderBottom: { xs: `1px solid ${isDarkMode ? theme.palette.divider : '#EEEDF1'}`, sm: 'none' },
                        minHeight: { md: 74 },
                      }}
                    >
                      {/* Label row with inline badge */}
                      <Stack direction="row" alignItems="center" spacing={0.75} mb={0.5}>
                        <Typography sx={{ color: '#ADB5BD', fontWeight: 700, fontSize: '10px', letterSpacing: '0.6px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                          {card.title}
                        </Typography>
                        {stat && (
                          <Box sx={{ bgcolor: stat.bg, color: stat.color, px: 0.8, py: 0.1, borderRadius: '4px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.3px', lineHeight: '16px', whiteSpace: 'nowrap' }}>
                            {stat.text}
                          </Box>
                        )}
                      </Stack>
                      {/* Value */}
                      <Typography sx={{ fontWeight: 600, color: isDarkMode ? theme.palette.text.primary : '#212529', fontSize: '22px', lineHeight: 1.1 }}>
                        {card.value}
                      </Typography>
                    </Box>
                  );
                })}

                {/* Last Updated — right-most cell, slightly different bg */}
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    px: 3,
                    py: 1.5,
                    minWidth: { sm: 140 },
                    minHeight: { md: 74 },
                    borderLeft: { xs: 'none', sm: `1px solid ${isDarkMode ? theme.palette.divider : '#EEEDF1'}` },
                    borderTop: { xs: `1px solid ${isDarkMode ? theme.palette.divider : '#EEEDF1'}`, sm: 'none' },
                    backgroundColor: isDarkMode ? theme.palette.background.default : '#FAFAFA',
                  }}
                >
                  <Typography sx={{ color: '#ADB5BD', fontWeight: 700, fontSize: '10px', letterSpacing: '0.6px', textTransform: 'uppercase', mb: 0.5, whiteSpace: 'nowrap' }}>
                    LAST UPDATED
                  </Typography>
                  <Typography sx={{ fontWeight: 600, color: isDarkMode ? theme.palette.text.primary : '#212529', fontSize: '18px', lineHeight: 1.1 }}>
                    {latestManual && latestManual.time
                      ? new Date(latestManual.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : "--"}
                  </Typography>
                </Box>
              </Box>


              {/* Header Controls */}
              <Stack direction="row" width="100%" p={1} justifyContent="space-between" alignItems="center"
              >
                {/* Left: Time Frame */}
                <Box>
                  <ToggleButtonGroup
                    value={timeFrame}
                    exclusive
                    size="small"
                    onChange={(_, newValue) => {
                      if (newValue !== null) {
                        setLoading(true);
                        setTimeFrameEnd(Date.now());
                        setTimeFrame(newValue);
                        setTimeout(() => setLoading(false), 150);
                      }
                    }}
                    sx={{
                      backgroundColor: isDarkMode ? theme.palette.background.default : "#F8F9FA",
                      borderRadius: "24px",
                      p: 0.5,
                      border: `1px solid ${isDarkMode ? theme.palette.divider : "#EEEDF1"}`,
                      "& .MuiToggleButtonGroup-grouped": {
                        border: 'none',
                        borderRadius: '20px !important',
                        color: "#888",
                        fontWeight: 600,
                        px: 2.5,
                        minWidth: "60px",
                        "&.Mui-selected": {
                          backgroundColor: `${isDarkMode ? theme.palette.background.paper : "#FFFFFF"} !important`,
                          color: "#228BE6 !important",
                          boxShadow: "0px 2px 4px rgba(0,0,0,0.05)",
                        },
                        "&:hover": {
                          backgroundColor: "#F0F0F0",
                        }
                      },
                    }}
                  >
                    {[3, 6, 12, 24, 48].map((hour) => (
                      <ToggleButton
                        key={`${hour}hr`}
                        value={hour}
                        sx={{
                          height: "32px",
                          fontSize: "12px",
                          textTransform: "none",
                        }}
                      >
                        {hour} H
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                </Box>

                {/* Right: Buttons */}
                <Stack direction="row" spacing={2} alignItems="center" >
                  <ToggleButtonGroup
                    value={dataSource}
                    exclusive
                    size="small"
                    sx={{
                      backgroundColor: isDarkMode ? theme.palette.background.paper : "#FFFFFF",
                      border: `1px solid ${isDarkMode ? theme.palette.divider : "#EEEDF1"}`,
                      borderRadius: "8px",
                      p: 0.25,
                      "& .MuiToggleButtonGroup-grouped": {
                        border: 'none',
                        borderRadius: '6px !important',
                        color: "#888",
                        minWidth: "40px",
                        "&.Mui-selected": {
                          backgroundColor: "#E6F2FE !important",
                          color: "#228BE6 !important",
                        },
                      },
                    }}
                  >
                    <ToggleButton
                      value="manual"
                      onClick={() => setDataSource("manual")}
                      sx={{ height: "32px" }}
                    >
                      <TrendingUpIcon fontSize="small" />
                    </ToggleButton>
                    <ToggleButton
                      value="log"
                      onClick={() => setDataSource("log")}
                      sx={{ height: "32px" }}
                    >
                      <GridOnIcon fontSize="small" />
                    </ToggleButton>
                  </ToggleButtonGroup>

                  <Button
                    variant="contained"
                    startIcon={<CalendarTodayIcon sx={{ fontSize: "16px !important" }} />}
                    onClick={() => {
                      setLoading(true);
                      setTimeFrameEnd(Date.now());
                      setTimeout(() => setLoading(false), 150);
                    }}
                    sx={{
                      height: "36px",
                      borderRadius: "20px",
                      textTransform: "none",
                      backgroundColor: isDarkMode ? theme.palette.background.paper : "#FFFFFF",
                      color: "#228BE6",
                      fontWeight: 600,
                      fontSize: "13px",
                      boxShadow: "0px 2px 4px rgba(0,0,0,0.05)",
                      border: `1px solid ${isDarkMode ? theme.palette.divider : "#EEEDF1"}`,
                      "&:hover": {
                        backgroundColor: isDarkMode ? theme.palette.action.hover : "#F8F9FA",
                      }
                    }}
                  >
                    Today
                  </Button>
                </Stack>
              </Stack>

              {/* Old Vitals Display Row Removed */}

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
                        backgroundColor: isDarkMode ? theme.palette.background.paper : "#FFF", borderRadius: 2, boxShadow: 1,
                        p: 2,
                        overflowX: "auto",
                        maxHeight: "400px",
                      }}
                    >
                      {combinedData.length > 0 ? (
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                          <thead>
                            <tr style={{ backgroundColor: isDarkMode ? theme.palette.background.default : "#F8F9FA", textAlign: "left" }}>
                              {Object.keys(combinedData[0]).map((col) => (
                                <th key={col} style={{ padding: "8px", fontWeight: 600 }}>
                                  {col}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {combinedData.map((row, idx) => (
                              <tr key={idx} style={{ borderBottom: `1px solid ${isDarkMode ? theme.palette.divider : "#E0E0E0"}` }}>
                                {Object.entries(row).map(([key, val], i) => {
                                  let displayVal = val as any;
                                  if (key === "time" && typeof val === "string" && !isNaN(Date.parse(val))) {
                                    // Convert ISO string to IST
                                    displayVal = new Intl.DateTimeFormat('en-IN', {
                                      timeZone: 'Asia/Kolkata',
                                      year: 'numeric',
                                      month: '2-digit',
                                      day: '2-digit',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      second: '2-digit',
                                      hour12: true
                                    }).format(new Date(val));
                                  }
                                  return (
                                    <td key={i} style={{ padding: "8px" }}>
                                      {displayVal}
                                    </td>
                                  );
                                })}
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

        
        </Box>

        <Dialog
          open={manualVitalsDialog}
          onClose={() => setManualVitalsDialog(false)}
          fullWidth
          maxWidth="xs"
          PaperProps={{
            sx: {
              backgroundColor: isDarkMode ? theme.palette.background.paper : '#FFFFFF',
              color: isDarkMode ? theme.palette.text.primary : "#000000",
              borderRadius: 3,
            },
          }}
        >
          <DialogTitle
            sx={{
              fontWeight: 500,
              pb: 1,
              color: isDarkMode ? theme.palette.text.primary : "#000000",
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
                        backgroundColor: isDarkMode ? theme.palette.background.default : "#F5F5F5",
                        borderRadius: 1,
                        color: isDarkMode ? theme.palette.text.primary : "#000",
                      },
                    }}
                    InputLabelProps={{ sx: { color: isDarkMode ? theme.palette.text.secondary : "#000" } }}
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
                    InputLabelProps={{ sx: { color: isDarkMode ? theme.palette.text.secondary : "#000" } }}
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
                      sx: { backgroundColor: isDarkMode ? theme.palette.background.default : "#F5F5F5", borderRadius: 1, color: isDarkMode ? theme.palette.text.primary : "#000" },
                    }}
                    InputLabelProps={{ sx: { color: isDarkMode ? theme.palette.text.secondary : "#000" } }}
                  />
                  <TextField
                    label="SpO₂"
                    value={vitals.spo2}
                    onChange={handleInputChange("spo2")}
                    fullWidth
                    placeholder="--- %"
                    InputProps={{
                      sx: { backgroundColor: isDarkMode ? theme.palette.background.default : "#F5F5F5", borderRadius: 1, color: isDarkMode ? theme.palette.text.primary : "#000" },
                    }}
                    InputLabelProps={{ sx: { color: isDarkMode ? theme.palette.text.secondary : "#000" } }}
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
                      sx: { backgroundColor: isDarkMode ? theme.palette.background.default : "#F5F5F5", borderRadius: 1, color: isDarkMode ? theme.palette.text.primary : "#000" },
                    }}
                    InputLabelProps={{ sx: { color: isDarkMode ? theme.palette.text.secondary : "#000" } }}
                  />
                  <TextField
                    label="Core Temperature"
                    value={vitals.coreTemp}
                    onChange={handleInputChange("coreTemp")}
                    fullWidth
                    placeholder="--- °C"
                    InputProps={{
                      sx: { backgroundColor: isDarkMode ? theme.palette.background.default : "#F5F5F5", borderRadius: 1, color: isDarkMode ? theme.palette.text.primary : "#000" },
                    }}
                    InputLabelProps={{ sx: { color: isDarkMode ? theme.palette.text.secondary : "#000" } }}
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
                    sx: { backgroundColor: isDarkMode ? theme.palette.background.default : "#F5F5F5", borderRadius: 1, color: isDarkMode ? theme.palette.text.primary : "#000" },
                  }}
                  InputLabelProps={{ sx: { color: isDarkMode ? theme.palette.text.secondary : "#000" } }}
                />
              </Stack>
            )}

            {step === 2 && (
              <Stack spacing={2} >
                {[
                  { label: "Grunting", field: "grunting", options: ["Present", "No"] },
                  { label: "Colour", field: "colour", options: ["Blue", "Pale", "Pink"] },
                  { label: "Neuro", field: "neuro", options: ["Inactive", "Lethargic", "Responsive"] },
                  { label: "Feeding", field: "feeding", options: ["Nil", "Reluctantly", "Well"] },
                  { label: "Glucose", field: "glucose", options: ["< 1.0", "1.0 - 1.9", "2.0 - 2.5", "≥ 2.6"] },
                  { label: "Parental Concerns", field: "parentalConcerns", options: ["High", "Some", "Nil"] },
                ].map(({ label, field, options }) => (
                  <Stack key={field}>
                    <Typography sx={{ mb: 1, fontSize: 14, color: isDarkMode ? theme.palette.text.primary : "#000" }}>
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
                        <ToggleButton key={opt} value={opt} sx={{ color: '#0F3B61', width: '30%' }}>
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
              <Button 
                onClick={() => {
                  setManualVitalsDialog(false);
                  setVitals({ hr: '', pr: '', rr: '', spo2: '', skinTemp: '', coreTemp: '', bp: '', observation: '' });
                  setObservation1({ grunting: "", colour: "", neuro: "", feeding: "", glucose: "", parentalConcerns: "" });
                  setStep(1);
                }} 
                sx={{ color: "#1976d2" }}
              >
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
     

    </React.Fragment>
  )
}

