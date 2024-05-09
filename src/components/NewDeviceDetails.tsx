import { Dialog, DialogTitle, DialogContent, DialogActions, Button,  Box, Stack, Typography, Divider, IconButton, ToggleButtonGroup, ToggleButton, Tooltip } from '@mui/material'
import React, { FC, useEffect, useMemo, useRef, useState } from 'react'
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Table } from './Table';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faXmark } from '@fortawesome/free-solid-svg-icons';
import { CustomNoButton } from './CustomNoButton';
import { CustomOkButton } from './CustomOkButton';
import { ExportToCsv } from 'export-to-csv';
import { MRT_ColumnDef } from 'material-react-table';
import { ChartOptions, LegendItem, Plugin } from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { Chart, CategoryScale } from 'chart.js';
// import { color } from 'chart.js/helpers';


Chart.register(CategoryScale);

export interface DeviceDetails {
    newData: boolean;
    isDialogOpened: boolean;
    handleCloseDialog: Function;
    device_id: string;
    patient: {
      "resourceType": string;
      "id": string;
      "meta": {
          "versionId": string;
          "lastUpdated": string;
      };
      "extension": 
          {
              "url": string;
              "valueString":string;
          }[];
  
      "identifier": 
          {
              "system": string;
              "value": string;
          }[];
      
  } | null;
    device_resource_id: string;
    observation_resource: {
      "resourceType": string;
      "id": string;
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
    communication_resource: {
      meta: any;
      "id" : string;
      "status" : string;
      "resourceType": string;
      "sent": string;
      "category" : {
      "coding" : {
          "system" : string;
          "code" : string;
          }[];
          "text" : string;
      }[];
      "subject": {
          "reference": string;
      };
      "sender": {
          "reference": string;};
      "payload":{
          "contentReference":{
              "display": string;
          };}[];
      "extension":
          {
              "url": string;
              "valueCodeableConcept": {
                  "coding": {
                      "system": string;
                      "code": string;
                      "display": string;
                  }[];
              };}[]; };
            darkTheme:boolean
            }
type TemperatureData = {
labels: any[];
datasets: any[]; 
};
export const NewDeviceDetails: FC<DeviceDetails> = (props): JSX.Element => {
    const [selectedLegends, setSelectedLegends] = useState<any>([])
    const chartRef1 = useRef<any | null>(null);
    const chartRef2 = useRef<any | null>(null);
    const chartRef3 = useRef<any | null>(null);
    const { darkTheme } = props;
    const [graphData, setGraphData] = useState(false)
    const [selectAlarm, setSelectAlarm] = useState(0)
    const [newalarm, setNewAlarm] = useState<Array<{ date: string; time: { val: string; alarm: string[]; priority: string[]; }; }>>([]);
    const leftarrowcolor = selectAlarm==0 ? '#606060' : '#124D81'
    const rightarrowcolor = selectAlarm==newalarm.length-1 ? '#606060' : '#124D81'
    const [tableVisisble, setTableVisible] = useState(false)
    const [observation, setObservation] = useState( [
               {
                   "fullUrl": String,
                   "resource": {
                       "resourceType": String,
                       "id": String,
                       "meta": {
                           "versionId": String,
                           "lastUpdated": String
                       },
                       "identifier": [
                           {
                               "value":String
                           }
                       ],
                       "status": String,
                       "category": [
                           {
                               "coding": [
                                   {
                                       "system": String,
                                       "code": String,
                                       "display": String
                                   }
                               ]
                           }
                       ],
                       "code": {
                           "coding": [
                               {
                                   "system": String,
                                   "code":String,
                                   "display": String
                               }
                           ],
                           "text": String
                       },
                       "subject": {
                           "reference": String
                       },
                       "device": {
                           "reference": String
                       },
                       "component": [
                           {
                               "code": {
                                   "coding": [
                                       {
                                           "system": String,
                                           "code": String,
                                           "display": String
                                       }
                                   ],
                                   "text": String
                               },
                               "valueQuantity": {
                                   "value": Number,
                                   "unit": String,
                                   "system": String,
                                   "code": String
                               }
                           }
                       ]
                   },
                   "request": {
                       "method": String,
                       "url": String
                   },
                   "response": {
                       "status": String,
                       "location": String,
                       "etag": String,
                       "lastModified": String
                   }
               }
        ]
    )
    const [communication, setCommunication] = useState([{
        "resource":{
            "resourceType": String,
            "id": String,
            "meta": {
                "versionId": String,
                "lastUpdated": String
            },
            "extension": [
                {
                    "url": String,
                    "valueCodeableConcept": {
                        "coding": [
                            {
                                "system": String,
                                "code": String,
                                "display": String
                            }
                        ]
                    }
                },
                {
                    "url": String,
                    "valueCodeableConcept": {
                        "coding": [
                            {
                                "system": String,
                                "code": String,
                                "display": String
                            }
                        ]
                    }
                }
            ],
            "status": String,
            "category": [
                {
                    "coding": [
                        {
                            "system": String,
                            "code": String
                        }
                    ],
                    "text": String
                }
            ],
            "subject": {
                "reference": String
            },
            "sender": {
                "reference": String
            },
            "payload": [
                {
                    "contentReference": {
                        "display": String
                    }
                }
            ]
        }}
    ])
    const [timeFrame, setTimeFrame] = useState(-1)
    const [times, setTimes] = useState<Array<any>>([])
    const [dataset, setDataSet] = useState([[{}]])
    const heaterYaxis = {
        "%": "y",
        "C": "y1",
        "C°": "y1"
    };
    
    const pulseoximeterYaxis = {
        "%": "y",
        'BPM': "y1"
    }
    const pressure1OptionYaxis = {
        "%": "y",
        "LPM": "y1",
    }
    const pressure2OptionYaxis = {
        "CmH2O": "y",
        "Bar": "y1",
    }
    const pressure1Option = {
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
            containerID: 'legend-container',
          },
          zoom: {
            pan: {
                enabled: true,
                mode: 'x',
                modifierKey: 'ctrl'
            },
            zoom: {
                wheel: {
                    enabled: true,       // Enable wheel zooming
                    modifierKey: 'ctrl'
                },
                mode: 'x', }
        }
        },
        scales: {
            x: {
                ticks: {
                    autoSkip: true,
                    maxTicksLimit: 10
                }
            },
          y: {      // Celcius
            type: 'linear' as const,
            display: true,
            position: 'left' as const,
            title: {
                color:darkTheme? 'white':'black',
                display: true,
                text: "Percentage (%)"
            },
            ticks: {
                color:darkTheme? 'white':'black' // Set the color of the scale values (ticks) to red
            }
          },
          y1: {     // %
            type: 'linear' as const,
            display: true,
            position: 'right' as const,
            grid: {
              drawOnChartArea: false,
            },
            title: {

                color:darkTheme? 'white':'black',
                display: true,
                text: "Liters Per Minuite (LPM)"
            },
            ticks: {
                color:darkTheme? 'white':'black' // Set the color of the scale values (ticks) to red
            }

          },
        },
    };
    const pressure2Option = {
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
            htmlLegend: {
                // ID of the container to put the legend in
                containerID: 'legend-container3',
              },
          colors: {
            forceOverride: true
          },
          legend: {
            display: false
          },
          zoom: {
            // pan: {
            //     enabled: true,
            //     mode: 'x'
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
                    autoSkip: true,
                    maxTicksLimit: 10
                }
            },
          y: {      // Celcius
            type: 'linear' as const,
            display: true,
            position: 'left' as const,
            title: {
                color:darkTheme? 'white':'black',
                display: true,
                text: "Centimeter of Water (CmH2O)"
            },
            ticks: {
                color:darkTheme? 'white':'black' // Set the color of the scale values (ticks) to red
            }
          },
          y1: {     // %
            type: 'linear' as const,
            display: true,
            position: 'right' as const,
            grid: {
              drawOnChartArea: false,
            },
            title: {
                color:darkTheme? 'white':'black',
                display: true,
                text: "Bar"
            },
            ticks: {
                color:darkTheme? 'white':'black' // Set the color of the scale values (ticks) to red
            }
          },
        },
    };
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
               
                    color:darkTheme? 'white':'black' ,
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
                    color: 'grey'
                },
                
            },
          y: {      // Celcius
            type: 'linear' as const,
            display: true,
            position: 'left' as const,
            grid: {
                color: '#303030',
                drawOnChartArea: true,
              },
            title: {
                color:darkTheme?'white':'black',
                display: true,
                text: "Percentage (%)"
            },
            ticks: {
                color:darkTheme? 'white':'black' // Set the color of the scale values (ticks) to red
            }
          },
          y1: {     // %
            type: 'linear' as const,
            display: true,
            position: 'right' as const,
            grid: {
                color: '#303030',  
              drawOnChartArea: false,
            },
            title: {
                color:darkTheme?'white':'black',
                display: true,
                text: "Temperature (C°)"
            },
            ticks: {
                color:darkTheme? 'white':'black' // Set the color of the scale values (ticks) to red
            }
          },
          
        },
    };
    const weightOption = {
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
            containerID: 'legend-container3',
          },
          zoom: {
            // pan: {
            //     enabled: true,
            //     mode: 'x',
                
            // },
            zoom: {
                // pinch: {
                //     enabled: true ,      // Enable pinch zooming
                //     modifierKey: 'ctrl'
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
                    color:darkTheme? 'white':'black',
                    autoSkip: true,
                    maxTicksLimit: 10
                }
            },
          y: {     //g
            type: 'linear' as const,
            display: true,
            position: 'left' as const,
            grid: {
                color: '#303030',
                drawOnChartArea: true,
              },
            title: {
                color:darkTheme? 'white':'black',
                display: true,
                text: "Grams (g)"
            },
            ticks: {
                color:darkTheme? 'white':'black' // Set the color of the scale values (ticks) to red
            }
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
                    color:darkTheme? 'white':'black',
                    autoSkip: true,
                    maxTicksLimit: 10
                }
            },
          y: {      // Celcius
            type: 'linear' as const,
            display: true,
            position: 'left' as const,
            title: {
                color:darkTheme? 'white':'black',
                display: true,
                text: "Percentage (%)"
            },
            ticks: {
                color:darkTheme? 'white':'black' // Set the color of the scale values (ticks) to red
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
                color:darkTheme? 'white':'black',
                display: true,
                text: "Beats Per Minuite (BPM)"
            },
            ticks: {
                color:darkTheme? 'white':'black' // Set the color of the scale values (ticks) to red
            }
          },
        },
    };
    const [temperatureData, setTemperatureData] = useState<TemperatureData>({
        labels: [], // Initially, there are no labels
        datasets: [], // Initially, there are no datasets
    })
    const [weightData, setWeightData] = useState<TemperatureData>({
        labels: [], // Initially, there are no labels
        datasets: [], // Initially, there are no datasets
    })
    const [pulseoximeterData, setPulseoximeterData] = useState<TemperatureData>({
    labels: [], // Initially, there are no labels
    datasets: [], // Initially, there are no datasets
    })
    const alarmUI = newalarm[selectAlarm]?.time?.alarm.map((vals,index) => {
        if(newalarm[selectAlarm].time.priority[index]=="High Priority"){
            return (
                <Box width={'200px'}  height={'110px'} sx={{border:'1px solid red', borderRadius:'10px', margin:'15px', boxShadow: `0px 0px 10px 1px red`,backgroundColor:darkTheme?'#2F3D4A':'#FFFFFF'}} justifyContent={'center'} textAlign={'center'}>
                    <Typography variant='subtitle1' color={darkTheme?'white':'#124D81'} paddingTop={'13%'}><b>{vals}</b></Typography>
                    <div style={{display:'flex', justifyContent:'center', textAlign:'center'}}>
                        <Typography variant='subtitle2' color={darkTheme?'white':'#124D81'} >{(newalarm[selectAlarm].date).toString()} - {(newalarm[selectAlarm].time.val).toString()}</Typography>
                    </div>
                    
                </Box>
            )
        }
        if(newalarm[selectAlarm].time.priority[index]=="Medium Priority"){
            return (
                <Box width={'200px'} height={'110px'} sx={{border:'1px solid #ffd700', borderRadius:'10px', margin:'15px', boxShadow: `0px 0px 10px 1px #ffd700`,backgroundColor:darkTheme?'#2F3D4A':'#FFFFFF'}} justifyContent={'center'} textAlign={'center'}>
                    <Typography variant='subtitle1'  color={darkTheme?'white':'#124D81'} paddingTop={'13%'}><b>{vals}</b></Typography>
                    <div style={{display:'flex', justifyContent:'center', textAlign:'center'}}>
                        <Typography variant='subtitle2'  color={darkTheme?'white':'#124D81'} >{(newalarm[selectAlarm].date).toString()} - {(newalarm[selectAlarm].time.val).toString()}</Typography>
                    </div>
                </Box>
            )
        }
        if(newalarm[selectAlarm].time.priority[index]=="Low Priority"){
            return (
                <Box width={'200px'} height={'110px'} sx={{border:'1px solid cyan', borderRadius:'10px', margin:'15px', boxShadow: `0px 0px 10px 1px cyan`,backgroundColor:darkTheme?'#2F3D4A':'#FFFFFF'}} justifyContent={'center'} textAlign={'center'}>
                    <Typography variant='subtitle1'  color={darkTheme?'white':'#124D81'} paddingTop={'13%'}><b>{vals}</b></Typography>
                    <div style={{display:'flex', justifyContent:'center', textAlign:'center'}}>
                        <Typography variant='subtitle2'  color={darkTheme?'white':'#124D81'}>{(newalarm[selectAlarm].date).toString()} - {(newalarm[selectAlarm].time.val).toString()}</Typography>
                    </div>
                </Box>
            )
        }
    })
    const [rows, setRows] = useState<Array<{ date: string; time: string; alarm: string[][]; }>>([]);
    const columns = useMemo<MRT_ColumnDef[]>(
        () => [
            
            {
                accessorKey: "date",
                header: "Date",
                id: "date",
                // maxSize: 50,
                // muiTableHeadCellProps: {
                //     align: 'center',
                //   },
                //   muiTableBodyCellProps: {
                //     align: 'center',
                //   },
            },
            {
                accessorKey: "time",
                header: "Time",
                id: "time",
                // maxSize: 50,
                // muiTableHeadCellProps: {
                //     align: 'center',
                //   },
                //   muiTableBodyCellProps: {
                //     align: 'center',
                //   },
            },
            {
                accessorKey: "alarm",
                header: "Alarm",
                id: "alarm",
                Cell: ({ cell }) => {
                    return (
                        <Box width={'100%'} height={'100%'} display={'flex'} flexWrap={'wrap'}>
                        {cell.getValue<Array<string>>().map((val) => {
                        return (
                            <Tooltip title={val[0]} placement="top">
                                <Box
                                    display={'inline-block'}
                                    paddingTop={"5px"}
                                    paddingBottom={"5px"}
                                    paddingLeft={'10px'}
                                    paddingRight={'10px'}
                                    justifyContent={'center'}
                                    textAlign={'center'}
                                    color={'black'}
                                    margin={'10px'}
                                    sx={() => ({
                                        borderRadius: "20px",
                                        backgroundColor:
                                        val[1] == "Low Priority"
                                        ? "cyan"
                                        : val[1] == "Medium Priority"
                                        ? "yellow  " : "red ",
                                    })}
                                >
                                    {(() => {
                                        var initials = '';
                                        val[0].split(' ').forEach(word => {
                                            if(word.length>0){
                                                initials+=word[0]
                                            }
                                        });
                                        return initials
                                    })()}
                                </Box>
                            </Tooltip>

                        )
                    })}
                    </Box>
                    
                    )
                    // <Box
                    //     display={'inline-block'}
                    //     paddingTop={"5px"}
                    //     paddingBottom={"5px"}
                    //     paddingLeft={'10px'}
                    //     paddingRight={'10px'}
                    //     justifyContent={'center'}
                    //     textAlign={'center'}
                    //     color={'black'}
                    //     sx={() => ({
                    //         borderRadius: "20px",
                    //         backgroundColor:
                    //         row.original.priority == "Low Priority"
                    //         ? "cyan"
                    //         : row.original.priority == "Medium Priority"
                    //         ? "yellow  " : "red ",
                    //     })}
                    // >
                    //     {cell.getValue<Array>()[1]}
                    // </Box>
            },
                // muiTableHeadCellProps: {
                //     align: 'center',
                //   },
                //   muiTableBodyCellProps: {
                //     align: 'center',
                //   },
                
            },
            {
                accessorKey: "priority",
                header: "Priority",
                id: "priority",
                Cell: ({ cell }) => (
                    <Box
                        width={'40%'}
                        padding={"5px"}
                        justifyContent={'center'}
                        textAlign={'center'}
                        color={'black'}
                        sx={() => ({
                            borderRadius: "5px",
                            backgroundColor:
                            cell.getValue<string>() == "Low Priority"
                            ? "#00BCD4"
                            : cell.getValue<string>() == "Medium Priority"
                            ? "#FFEB3B  " : "#F44336 "
                        })}
                    >
                        {cell.getValue<string>()}
                    </Box>
                ),
                maxSize: 100,
                muiTableHeadCellProps: {
                    align: 'center',
                  },
                  muiTableBodyCellProps: {
                    align: 'center',
                  },
            },

        ], []
    )
    const scrollto = useRef<null | HTMLDivElement>(null);
    const handleClick = () => {
        scrollto.current?.scrollIntoView({behavior: 'smooth'});
    };
    const infscrollfunc = (page: Number) => {
        fetch(`${import.meta.env.VITE_FHIRAPI_URL as string}/Communication/${props.communication_resource.id}/_history/?_page=${page}`, {
        credentials: "omit", // send cookies and HTTP authentication information
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Basic " + btoa("fhiruser:change-password"), // set HTTP basic auth header
        },
        })
        .then((response) => response.json())
        .then((data) => {
            let x: { date: string; time: string; alarm: string[][]; }[] = []
            data.entry.map((commres: any) => {
                if(commres.resource.extension){
                    const lastUpdatedDate = new Date((commres.resource.meta.lastUpdated).toString());
                    var xx: string[][] = []
                    commres.resource.extension[0].valueCodeableConcept.coding.map((val: { display: { toString: () => string; }; },index: string | number) => 
                        {  
                        xx.push([val.display.toString(), commres.resource.extension[1].valueCodeableConcept.coding[index].display.toString()])
                        }
                    )
                    x.push({
                        date: (lastUpdatedDate.toLocaleDateString()),
                        time: (lastUpdatedDate.toLocaleTimeString()),
                        alarm: xx,
                    })

                }
            })
            x.map((val) => {
                setRows((rows) => [...rows,val])
            })
            // let x: { date: string; time: string; alarm: string[][]; }[] = []
            // let y: { date: string; time: { val: string; alarm: string[]; priority: string[]; }; }[] = []
            // communication.map((commres) => 
            //      {
            //         if(commres.resource.extension){
            //             const lastUpdatedDate = new Date((commres.resource.meta.lastUpdated).toString());
            //             y.push({
            //                 date: (lastUpdatedDate.toLocaleDateString()),
            //                 time: {
            //                     val: (lastUpdatedDate.toLocaleTimeString()),
            //                     alarm: commres.resource.extension[0].valueCodeableConcept.coding.map((val) => {return val.display.toString()}),
            //                     priority: commres.resource.extension[1].valueCodeableConcept.coding.map((val) => {return val.display.toString()})
            //                 }
            //             })
            //             var xx: string[][] = []
            //             commres.resource.extension[0].valueCodeableConcept.coding.map((val,index) => 
            //             {  
            //                 xx.push([val.display.toString(), commres.resource.extension[1].valueCodeableConcept.coding[index].display.toString()])
    
            //             }
    
            //        )
            //             x.push({
            //                 date: (lastUpdatedDate.toLocaleDateString()),
            //                 time: (lastUpdatedDate.toLocaleTimeString()),
            //                 alarm: xx,
            //             })
            //         }
    
            //             }
            // )
            // setRows(x)
        })
    }
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
                  setS_and_D(2)
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
                textContainer.style.color = darkTheme? 'white' :'black';
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
    const [S_and_D, setS_and_D] = useState(0)
    const [downloadConfirmation, setDownloadConfirmation] = useState(false)
    const csvOptions = {
        fieldSeparator: ',',
        quoteStrings: '"',
        decimalSeparator: '.',
        showLabels: true,
        useBom: true,
        useKeysAsHeaders: false,
        headers: ['Parameter','Values'],
    };
    const csvExporter = new ExportToCsv(csvOptions);
    const handleExportData = () => {
        if(temperatureData.labels.length!=0 && selectedLegends.length!=0){
            let vvtemp: any[] = []
            selectedLegends.map((item: any) => {
                temperatureData.datasets.map((val: { data: any; label: any; }) => {
                    if(val.label == item){
                        vvtemp.push(val.data)
                    }
                })
                pulseoximeterData.datasets.map((val: { data: any; label: any; }) => {
                    if(val.label == item){
                        vvtemp.push(val.data)
                    }
                })
                weightData.datasets.map((val: { data: any; label: any; }) => {
                    if(val.label == item){
                        vvtemp.push(val.data)
                    }
                })
            })
            let temprow = [];
            temprow.push(selectedLegends.map((vals: any, index: number) => {
                return (
                    {
                        Parameter: vals,
                        Values: vvtemp[index]
                    }
                )
            }))
            csvExporter.generateCsv(temprow[0])
        }
        setDownloadConfirmation(false)
    };
    const [varq, setvarq] = useState(false)
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
        setWeightData(() => {
           
            if(dataset[2]?.length > 0) {
                
                return (
                    {
                        labels,
                        datasets: dataset[2]
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
    const labels = times;
    useEffect(() => {
        if(props.communication_resource?.id!=null){
             
            fetch(`${import.meta.env.VITE_FHIRAPI_URL as string}/Communication/${props.communication_resource.id}/_history/`, {
            credentials: "omit",
            headers: {
                Authorization: "Basic "+ btoa("fhiruser:change-password"),
            },
            })
            .then((response) => response.json())
            .then((data) => {
                let temparr: any[] = []
                for(let i=0;i<data?.entry?.length;i++){
                        
                    temparr.push(data.entry[i])
                }
                setCommunication(temparr)
                console.log(temparr)
                // var page = 1
                // if(totaldata>100000){
                //     totaldata=100000
                // }
                
                // while(totaldata>=100){
                    
                //     fetch(`http://pmscloud.in:9444/fhir-server/api/v4/Communication/${props.communication_resource.id}/_history?_page=${page}&_count=100`,{
                //         credentials: "omit",
                //         headers: {
                //             Authorization: "Basic "+ btoa("fhiruser:change-password"),
                //         },
                //     })
                //     .then((response) => response.json())
                //     .then((data) => {
                //         for(let i=0;i<data.entry.length;i++){
                        
                //             temparr.push(data.entry[i])
                //         }
                //     })
                    
                //     totaldata=totaldata%100
                //     page+=1
                // }
                // if(totaldata <100){
                //     fetch(`http://pmscloud.in:9444/fhir-server/api/v4/Communication/${props.communication_resource.id}/_history?_page=${page}&_count=100`,{
                //         credentials: "omit",
                //         headers: {
                //             Authorization: "Basic "+ btoa("fhiruser:change-password"),
                //         },
                //     })
                //     .then((response) => response.json())
                //     .then((data) => {
                //         for(let i=0;i<data.entry.length;i++){
                //             // console.log(temparr)
                //             temparr.push(data.entry[i])
                //         }
                        
                //         setCommunication(temparr)
                //     })
                // }
                // console.log(temparr)
                // setObservation((prevobs) => ({...prevobs,entry: temparr}))
                
                
            })
        }
    },[props.communication_resource?.id])
    useEffect(() => {
        let x: { date: string; time: string; alarm: string[][]; }[] = []
        let y: { date: string; time: { val: string; alarm: string[]; priority: string[]; }; }[] = []
        communication.map((commres) => 
             {
                if(commres.resource.extension){
                    const lastUpdatedDate = new Date((commres.resource.meta.lastUpdated).toString());
                    y.push({
                        date: (lastUpdatedDate.toLocaleDateString()),
                        time: {
                            val: (lastUpdatedDate.toLocaleTimeString()),
                            alarm: commres.resource.extension[0].valueCodeableConcept.coding.map((val) => {return val.display.toString()}),
                            priority: commres.resource.extension[1].valueCodeableConcept.coding.map((val) => {return val.display.toString()})
                        }
                    })
                    var xx: string[][] = []
                    commres.resource.extension[0].valueCodeableConcept.coding.map((val,index) => 
                    {  
                        xx.push([val.display.toString(), commres.resource.extension[1].valueCodeableConcept.coding[index].display.toString()])

                    }

               )
                    x.push({
                        date: (lastUpdatedDate.toLocaleDateString()),
                        time: (lastUpdatedDate.toLocaleTimeString()),
                        alarm: xx,
                    })
                }

                    }
        )
        setRows(x)
        setNewAlarm(y)
    },[communication])
    useEffect(() => {
        if(props.communication_resource?.id!=null){
            var x: { date: string; time: string; alarm: string[][]; }[] = []
            var y: { date: string; time: { val: string; alarm: string[]; priority: string[]; }; }[] = []
            if(props.communication_resource.extension){
                const lastUpdatedDate = new Date(props.communication_resource.meta.lastUpdated);
                // y.push({                                                                                 // This is for live updation of the new alarm ui
                //     date: (lastUpdatedDate.toLocaleDateString()),
                //     time: {
                //         val: (lastUpdatedDate.toLocaleTimeString()),
                //         alarm: data.extension[0].valueCodeableConcept.coding.map((val: { display: any; }) => {return val.display}),
                //         priority: data.extension[1].valueCodeableConcept.coding.map((val: { display: any; }) => {return val.display})
                //     }
                //     })
                y.push({
                    date: (lastUpdatedDate.toLocaleDateString()),
                    time: {
                        val: (lastUpdatedDate.toLocaleTimeString()),
                        alarm:  props.communication_resource.extension[0].valueCodeableConcept.coding.map((val) => {return val.display.toString()}),
                        priority:  props.communication_resource.extension[1].valueCodeableConcept.coding.map((val) => {return val.display.toString()})
                    }
                })
                var xx: string[][] = []
                props.communication_resource.extension[0].valueCodeableConcept.coding.map((val, index) => 
                {  
                    xx.push([val.display.toString(), props.communication_resource.extension[1].valueCodeableConcept.coding[index].display.toString()])


                
                }
                )


                x.push({
                    date: (lastUpdatedDate.toLocaleDateString()),
                    time: (lastUpdatedDate.toLocaleTimeString()),
                    alarm: xx,
                })
                // console.log(y)
                // console.log(newalarm)
                // setNewAlarm((rows) => [y, ...rows])

                x.map((val) => {
                    setRows((rows) => [val,...rows])
                })
                y.map((val) => {
                    setNewAlarm((rows) => [val,...rows])
                })
                
            }
        }
    },[props.communication_resource])

    function getDataForGraph(page: number, when: string) {

        const accumulatedData: any[] = []
        var meta = 0;
        function fetchData(when: string, times:number): Promise<void> {
            return fetch(`${import.meta.env.VITE_FHIRAPI_URL as string}/Observation/${props.observation_resource.id}/_history?_count=1&_since=${when}&_page=${page}`,{
                credentials: "omit",
                method: "GET",
                headers: {
                    Authorization: "Basic "+ btoa("fhiruser:change-password"),
                },
            })
            .then((response) => response.json())
            .then((data: any) => {
                
                if(data.total>0){
                    
                    var lastpage = Math.floor(data.total/10)+data.total%10
                    return fetch(`${import.meta.env.VITE_FHIRAPI_URL as string}/Observation/${props.observation_resource.id}/_history?_count=1&_since=${when}&_page=${lastpage}`,{
                        credentials: "omit",
                        method: "GET",
                        headers: {
                            Authorization: "Basic "+ btoa("fhiruser:change-password"),
                        },
                    })
                    .then((response) => response.json())
                    .then((data: any) => {  
                        if(data.entry[0].resource.meta.versionId!=meta){
                            meta = data.entry[0].resource.meta.versionId
                            accumulatedData.push(data.entry[0]); 
                        }
                        
                        if (timeFrame==1?(times < 7):(times<14)) {
                            const newWhen = subtractDaysFromDate(when, 1);
                            return fetchData(newWhen,times+1); // Continue fetching recursively
                        }
                        
                    })
                }
                if (timeFrame==1?(times < 7):(times<14)) {
                    const newWhen = subtractDaysFromDate(when, 1);
                    return fetchData(newWhen,times+1); // Continue fetching recursively
                }
            })
        }
        return fetchData(when,1).then(() => accumulatedData);
    }

    function subtractDaysFromDate(dateString: string, days: number) {
        const date = new Date(dateString);
        date.setDate(date.getDate() - days);
        console.log(date)
        return date.toISOString();
    }

    const [selectedTab, setSelectedTab] = useState('overview');
    const handleTabChange = (_event: any, newTab: React.SetStateAction<string> | null) => {
        if (newTab !== null) {
            setSelectedTab(newTab);
        }
    };


    useEffect(() => {
        let url = []
        let currentNewDate = new Date()
        let currentdate = currentNewDate.getDate().toString().padStart(2,'0')
        let currentmonth = (Number(currentNewDate.getMonth())+1).toString().padStart(2,'0')
        let currentyear = currentNewDate.getFullYear()
        let currentDate = currentyear+"-"+currentmonth+"-"+currentdate
        if(timeFrame!=-1){
            if(timeFrame==0){
                let prevdate = ""
                url.push(`${import.meta.env.VITE_FHIRAPI_URL as string}/Observation/${props.observation_resource?.id}/_history?_since=${currentDate}T00:00:00Z&_count=10000`)
                Promise.all(
                    url.map((query) => {
                        return fetch(query, {
                            credentials: "omit",
                            method: "GET",
                            headers: {
                                Authorization: "Basic "+ btoa("fhiruser:change-password"),
                            },
                        })
                        .then((response) => response.json())
                        .then((data) => {
        
                            if(data.total===0){return null}
                            if(((data.entry[0].resource.meta.lastUpdated).toString())==prevdate){return null}
                            
                            prevdate = (data.entry[0].resource.meta.lastUpdated).toString()
        
                            
                            return (data.entry.map((val: any)=>(val)))
                            
                        })
                    })
                    
                )
                .then((results) => {
                    const dats = results.filter((entry) => entry!==null)
                    .reduce((accumulator, currentvalue) => accumulator.concat(currentvalue),[])
                    console.log(dats)
                    setObservation(dats.reverse())
                })
            }
            else{
                
                getDataForGraph(1,currentDate+"T00:00:00Z").then((result: any) => {
                    setObservation(result.reverse())
                })
    
                // console.log(x)
                // for (let incrementDate = 0; incrementDate < 7 ; incrementDate++) {
                //     let weekNewDate = new Date(currentNewDate.setDate(currentNewDate.getDate() - incrementDate));
                //     let weekdate = weekNewDate.getUTCDate().toString().padStart(2,'0')
                //     let weekmonth = (Number(weekNewDate.getMonth())+1).toString().padStart(2,'0')
                //     let weekyear = weekNewDate.getUTCFullYear()
                //     let weekDate = weekyear+"-"+weekmonth+"-"+weekdate
                //     // url.push(`http://pmscloud.in:9444/fhir-server/api/v4/Observation/${observation_resource?.id}/_history?_count=1&_since=${weekDate}T00:00:00Z`)
                //     for (let index2 = 0; index2 < 24; index2++) {
                //         url.push(`http://pmscloud.in:9444/fhir-server/api/v4/Observation/${props.observation_resource?.id}/_history?_count=1&_since=${weekDate}T${index2.toString().padStart(2,'0')}:00:00Z`)
                //     }
                    
                                    
                // }
                // url.push(`http://pmscloud.in:9444/fhir-server/api/v4/Observation/${props.observation_resource?.id}/_history?_count=1`)
                // fetch(`http://pmscloud.in:9444/fhir-server/api/v4/Observation/${props.observation_resource?.id}/_history?_count=1`,{
                //     credentials:'omit',
                //     method:'GET',
                //     headers: {
                //         Authorization: "Basic "+ btoa("fhiruser:change-password")
                //     }
                // }).then((response) => response.json())
                // .then((data) => {
                //     pr
                // })
            }
        }
        

        // let temparr: any[] = []
        

        
        //   })
    },[timeFrame])
    useEffect(() => {
        console.log(observation)
        if(observation[1]?.resource?.component?.length>1){
            
            console.log(observation)
            setTimes(observation.map((obs) => {
                let zeroth: {}[] = []
                let first: {}[] = []
                let second: {}[] = []
                let third: {}[] = []

                observation[1].resource.component.map((data, index) => {
                    if(data.valueQuantity.unit.toString() == "C" || data.valueQuantity.unit.toString()=="C°" || data.valueQuantity.unit.toString() == "C°" || data.code.text.toString()=="Set Heater" || data.code.text.toString()=="Heater Level"){
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
                    else if(data.code.text.toString() == "Pulse Rate" || data.code.text.toString() == "SpO2" || data.code.text.toString() == "SPO2"){
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
                    else if(data.valueQuantity.unit.toString() == "g"){
                        second.push({
                            label: data.code.text.toString(),
                            data: observation.map((data2) => {
                                if(data2?.resource?.component){
                                    return (
                                        data2?.resource?.component[index]?.valueQuantity?.value.toString()
                                    )
                                }
                            }),
                            yAxisID: "y"
                        })
                    }
                    else if(data.valueQuantity.unit.toString() == "LPM" || data.code.text.toString() == "Set FiO2")
                    {
                        let unit = data.valueQuantity.unit.toString() as keyof typeof pressure1OptionYaxis;
                        zeroth.push({
                            label: data.code.text.toString(),
                            data: observation.map((data2) => {
                                if(data2?.resource?.component){
                                    return (
                                        data2?.resource?.component[index]?.valueQuantity?.value.toString()
                                    )
                                }
                            }),
                            yAxisID: pressure1OptionYaxis[unit] || "y"
                        })
                    }
                    else if(data.valueQuantity.unit.toString() == "CmH2O" || data.valueQuantity.unit.toString() == "Bar"){
                        let unit = data.valueQuantity.unit.toString() as keyof typeof pressure2OptionYaxis;
                        second.push({
                            label: data.code.text.toString(),
                            data: observation.map((data2) => {
                                if(data2?.resource?.component){
                                    return (
                                        data2?.resource?.component[index]?.valueQuantity?.value.toString()
                                    )
                                }
                            }),
                            yAxisID: pressure2OptionYaxis[unit] || "y"
                        })
                    }
                    // else if(data.code.text.toString() == "Humidity set" || data.code.text.toString() == "Measure Humidity"){
                    //     let unit2 = data.valueQuantity.unit.toString();
                    //     third.push({
                    //         label: data.code.text.toString(),
                    //         data: observation.map((data2, index2) => {
                    //             return (
                    //                 data2?.resource?.component[index]?.valueQuantity?.value.toString()
                    //             )
                    //         }),
                    //         yAxisID: "y"
                    //     })
                    // }
                    
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
        else if(observation[0]?.resource?.component?.length>1){
            setTimes(observation.map((obs) => {
                let zeroth: {}[] = []
                let first: {}[] = []
                let second: {}[] = []
                let third: {}[] = []

                observation[0].resource.component.map((data, index) => {
                    if(data.valueQuantity.unit.toString() == "C" || data.valueQuantity.unit.toString()=="C°" || data.valueQuantity.unit.toString() == "C°" || data.code.text.toString()=="Set Heater" || data.code.text.toString()=="Heater Level"){
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
                    else if(data.code.text.toString() == "Pulse Rate" || data.code.text.toString() == "SpO2" || data.code.text.toString() == "SPO2"){
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
                    else if(data.valueQuantity.unit.toString() == "g"){
                        second.push({
                            label: data.code.text.toString(),
                            data: observation.map((data2) => {
                                if(data2?.resource?.component){
                                    return (
                                        data2?.resource?.component[index]?.valueQuantity?.value.toString()
                                    )
                                }
                            }),
                            yAxisID: "y"
                        })
                    }
                    else if(data.valueQuantity.unit.toString() == "LPM" || data.code.text.toString() == "Set FiO2")
                    {
                        let unit = data.valueQuantity.unit.toString() as keyof typeof pressure1OptionYaxis;
                        zeroth.push({
                            label: data.code.text.toString(),
                            data: observation.map((data2) => {
                                if(data2?.resource?.component){
                                    return (
                                        data2?.resource?.component[index]?.valueQuantity?.value.toString()
                                    )
                                }
                            }),
                            yAxisID: pressure1OptionYaxis[unit] || "y"
                        })
                    }
                    else if(data.valueQuantity.unit.toString() == "CmH2O" || data.valueQuantity.unit.toString() == "Bar"){
                        let unit = data.valueQuantity.unit.toString() as keyof typeof pressure2OptionYaxis;
                        second.push({
                            label: data.code.text.toString(),
                            data: observation.map((data2) => {
                                if(data2?.resource?.component){
                                    return (
                                        data2?.resource?.component[index]?.valueQuantity?.value.toString()
                                    )
                                }
                            }),
                            yAxisID: pressure2OptionYaxis[unit] || "y"
                        })
                    }
                    // else if(data.code.text.toString() == "Humidity set" || data.code.text.toString() == "Measure Humidity"){
                    //     let unit2 = data.valueQuantity.unit.toString();
                    //     third.push({
                    //         label: data.code.text.toString(),
                    //         data: observation.map((data2, index2) => {
                    //             return (
                    //                 data2?.resource?.component[index]?.valueQuantity?.value.toString()
                    //             )
                    //         }),
                    //         yAxisID: "y"
                    //     })
                    // }
                    
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
    useEffect(() => {console.log(selectedLegends)},[selectedLegends])
    useEffect(() => {props.handleCloseDialog()},[varq])
    const graph = useMemo(() => {
        if(props.observation_resource?.identifier[0]?.value?.toString()=="PMS-CIC"){
            return (
                <Stack width={'100%'} height={'100%'}  direction={'row'} justifyContent={'center'} divider={
                    <Divider orientation='vertical' flexItem sx={{marginLeft:'1%',backgroundColor:'#505050', color:'#505050'}}/>
                }>
                    <Stack height={'100%'} width={'95%'} sx={{backgroundColor:'transparent'}} spacing={'5%'} marginRight={'auto'}  marginLeft={'2%'} marginTop={'2%'}>
                        {/* <MyChart height={'100%'} forwardedRef={chartRef1} options={temperatureOption as ChartOptions} data={temperatureData} plugins={temperatureLegendPlugin} /> */}
                        <Line ref={chartRef1} options={temperatureOption as ChartOptions<'line'>} data={temperatureData} height={"100%"} plugins={[temperatureLegendPlugin]} ></Line>
                        <div id="legend-container"></div>
                        <Divider />
                        {/* <MyChart height={'100%'} forwardedRef={chartRef2} options={pulseoximeterOption as ChartOptions} data={pulseoximeterData} plugins={temperatureLegendPlugin} /> */}
                        <Line ref={chartRef2} options={pulseoximeterOption as ChartOptions<'line'>} data={pulseoximeterData} height={'100%'} plugins={[temperatureLegendPlugin]}></Line>
                        <div id="legend-container2"></div>
                        <Divider />
                        {/* <MyChart height={'100%'} forwardedRef={chartRef3} options={weightOption as ChartOptions} data={weightData} plugins={temperatureLegendPlugin} />                                             */}
                        <Line ref={chartRef3} options={weightOption as ChartOptions<'line'>} data={weightData} height={'100%'} plugins={[temperatureLegendPlugin]}></Line>
                        <div id="legend-container3"></div>
                    </Stack>
                    {/* <Box width={'35%'} justifyContent={'center'} textAlign={'center'} sx={{borderRadius:'20px', marginTop:'-50px'}}>
                        <Stack spacing={'10px'} sx={{marginLeft:'7%', width:'100%', justifyContent:'center', marginTop:'60px', textAlign:'center' }} className="legendBox">
                        
                        
                        
                        </Stack>

                        <Button color="primary"  startIcon={<FileDownloadIcon />} variant="contained" sx={{marginTop:'70%', borderRadius:'25px', width:'200px'}} onClick={() => {
                            setDownloadConfirmation(true)
                        }}>
                            Download
                        </Button>
                        
                    </Box> */}

                </Stack>
            )
        }
        if(props.observation_resource?.identifier[0]?.value?.toString()=="PMSinc" || props.observation_resource?.identifier[0]?.value?.toString()=="PMS-INC"){
            
            return (
                <Stack width={'100%'} height={'100%'} direction={'row'} justifyContent={'center'} divider={
                    <Divider orientation='vertical' flexItem sx={{marginLeft:'1%',backgroundColor:'#505050', color:'#505050'}}/>
                }>
                    <Stack height={'100%'} width={'95%'} spacing={'5%'} sx={{backgroundColor:'transparent'}}  marginRight={'auto'} marginLeft={'2%'} marginTop={'2%'}>
                        {/* <MyChart height={'100%'} forwardedRef={chartRef1} options={temperatureOption as ChartOptions} data={temperatureData} plugins={temperatureLegendPlugin} /> */}
                        <Line ref={chartRef1} options={temperatureOption as ChartOptions<'line'>} data={temperatureData} height={"100%"} plugins={[temperatureLegendPlugin]} ></Line>
                        <div id="legend-container"></div>
                        <Divider />
                        {/* <MyChart height={'100%'} forwardedRef={chartRef2} options={pulseoximeterOption as ChartOptions} data={pulseoximeterData} plugins={temperatureLegendPlugin} /> */}
                        <Line ref={chartRef2} options={pulseoximeterOption as ChartOptions<'line'>} data={pulseoximeterData} height={'100%'} plugins={[temperatureLegendPlugin]}></Line>
                        <div id="legend-container2"></div>
                        <Divider />
                        {/* <MyChart height={'100%'} forwardedRef={chartRef3} options={weightOption as ChartOptions} data={weightData} plugins={temperatureLegendPlugin} />                                             */}
                        <Line ref={chartRef3} options={weightOption as ChartOptions<'line'>} data={weightData} height={'100%'} plugins={[temperatureLegendPlugin]}></Line>
                        <div id="legend-container3"></div>
                    </Stack>
                    {/* <Box width={'35%'} justifyContent={'center'} textAlign={'center'} sx={{borderRadius:'20px', marginTop:'-50px'}}>
                        <Stack spacing={'10px'} sx={{marginLeft:'7%', width:'100%', justifyContent:'center', marginTop:'60px', textAlign:'center' }} className="legendBox">
                        
                        
                        
                        </Stack>

                        <Button color="primary"  startIcon={<FileDownloadIcon />} variant="contained" sx={{marginTop:'70%', borderRadius:'25px', width:'200px'}} onClick={() => {
                            setDownloadConfirmation(true)
                        }}>
                            Download
                        </Button>
                        
                    </Box> */}

                </Stack>
            )
        }
        if(props.observation_resource?.identifier[0]?.value?.toString()=="PMS-SVAAS" || props.observation_resource?.identifier[0]?.value?.toString()=="PMSsvaas"){

            return (

                <Stack width={'100%'} height={'100%'} direction={'row'} divider={
                    <Divider orientation='vertical' flexItem sx={{marginLeft:'1%'}}/>
                }>
                    <Stack height={'100%'} width={'95%'} spacing={'5%'} sx={{backgroundColor:'transparent'}}  marginRight={'auto'} marginLeft={'2%'} marginTop={'2%'}>
                        <Line ref={chartRef1} options={pressure1Option as ChartOptions<'line'>} data={temperatureData} height={"100%"} plugins={[temperatureLegendPlugin]} ></Line>
                        <div id="legend-container"></div>
                        <Divider />
                        <Line ref={chartRef2} options={pulseoximeterOption as ChartOptions<'line'>} data={pulseoximeterData} height={'100%'} plugins={[temperatureLegendPlugin]}></Line>
                        <div id="legend-container2"></div>
                        <Divider />
                        <Line ref={chartRef3} options={pressure2Option as ChartOptions<'line'>} data={weightData} height={'100%'} plugins={[temperatureLegendPlugin]}></Line>
                        <div id="legend-container3"></div>
                    </Stack>

                </Stack>



                
            )
        }
        if(props.observation_resource?.identifier[0]?.value?.toString()=="PMS-HCM"){
            return (
                <Stack width={'100%'} height={'100%'} direction={'row'} justifyContent={'center'} divider={
                    <Divider orientation='vertical' flexItem sx={{marginLeft:'1%',backgroundColor:'#505050', color:'#505050'}}/>
                }>
                    <Stack height={'100%'} width={'95%'} spacing={'5%'} sx={{backgroundColor:'transparent'}}  marginRight={'auto'} marginLeft={'2%'} marginTop={'2%'}>
                        {/* <MyChart height={'100%'} forwardedRef={chartRef1} options={temperatureOption as ChartOptions} data={temperatureData} plugins={temperatureLegendPlugin} /> */}
                        <Line ref={chartRef1} options={temperatureOption as ChartOptions<'line'>} data={temperatureData} height={"100%"} plugins={[temperatureLegendPlugin]} ></Line>
                        <div id="legend-container"></div>
                        {/* <Divider /> */}
                        {/* <MyChart height={'100%'} forwardedRef={chartRef2} options={pulseoximeterOption as ChartOptions} data={pulseoximeterData} plugins={temperatureLegendPlugin} /> */}
                        {/* <Line ref={chartRef2} options={pulseoximeterOption as ChartOptions} data={pulseoximeterData} height={'100%'} plugins={[temperatureLegendPlugin]}></Line> */}
                        {/* <div id="legend-container2" style={{width:'1px', height='1px' }}></div> */}
                        {/* <Divider /> */}
                        {/* <MyChart height={'100%'} forwardedRef={chartRef3} options={weightOption as ChartOptions} data={weightData} plugins={temperatureLegendPlugin} />                                             */}
                        {/* <Line ref={chartRef3} options={weightOption as ChartOptions} data={weightData} height={'100%'} plugins={[temperatureLegendPlugin]}></Line> */}
                        {/* <div id="legend-container3" style={{width:'1px', height='1px' }}></div> */}
                    </Stack>
                    {/* <Box width={'35%'} justifyContent={'center'} textAlign={'center'} sx={{borderRadius:'20px', marginTop:'-50px'}}>
                        <Stack spacing={'10px'} sx={{marginLeft:'7%', width:'100%', justifyContent:'center', marginTop:'60px', textAlign:'center' }} className="legendBox">
                        
                        
                        
                        </Stack>

                        <Button color="primary"  startIcon={<FileDownloadIcon />} variant="contained" sx={{marginTop:'70%', borderRadius:'25px', width:'200px'}} onClick={() => {
                            setDownloadConfirmation(true)
                        }}>
                            Download
                        </Button>
                        
                    </Box> */}

                </Stack>
            )
        }
        return <div></div>
    },[rendergraph])
    return (
        <React.Fragment>
            <Dialog
                open={props.isDialogOpened}
                sx={{
                    backdropFilter :"blur(5px)"
                }}
                onClose={() =>
                {setvarq(!varq)}}
                // fullWidth
                maxWidth="lg"
                PaperProps={{sx:{minWidth:{
                    xs: '90%',
                    sm: '90%',
                    md: '70%',
                    lg: '70%',
                },maxWidth:{
                    xs: '90%',
                    sm: '90%',
                    md: '70%',
                    lg: '70%',
                },minHeight:'90%',borderRadius:'25px', boxShadow: `0px 0px 40px 1px #404040`, border:'0.4px solid #505050', backgroundColor: darkTheme?'#2F3D4A': '#FFFFFF'}}}
                >
                <DialogTitle
                    sx={{
                        borderBottom:'1px solid grey'
                    }}
                >
                    {/* <IconButton sx={{marginLeft:'96%'}}><CloseRounded/></IconButton> */}
                    <Stack direction={'row'} width={'102%'} >
                        <Stack direction={'row'} width={'100%'} sx={{justifyContent:'space-between', marginLeft:'auto', marginRight:'auto'}}>
                        <Typography variant="h6" color={darkTheme?'#FFFFFF': '#2F3D4A'} fontWeight={'regular'} >
                        {props.patient?.extension[0]?.valueString} &nbsp; | &nbsp; {props.patient?.identifier[0]?.value}
                        
                        </Typography>
                        <Typography variant="h6" color={darkTheme?'#FFFFFF': '#2F3D4A'}>
                            {(() => {
                                if(props.observation_resource){
                                    var q = "";
                                    if(props.observation_resource.identifier[0].value.toString()=="PMS-CIC"){
                                        q = "CIC | "
                                    }
                                    else if(props.observation_resource.identifier[0].value.toString()=="PMS-INC"){
                                        q = "INC | "
                                    }
                                    else if(props.observation_resource.identifier[0].value.toString()=="PMS-HCM"){
                                        q = "Brammi | "
                                    }
                                    else if(props.observation_resource.identifier[0].value.toString()=="PMS-SYRINGE"){
                                        q = "Syringe | "
                                    }
                                    else if(props.observation_resource.identifier[0].value.toString()=="PMS-SVAAS"){
                                        q = "SVAAS | "
                                    }
                                    
                                    return (q+props.device_id)
                                }
                            })()}
                        {/* {props.device_id} */}
                        </Typography>
                        
                        </Stack>
                        <IconButton sx={{width:'45px', marginTop:'-4px',color:darkTheme?'#FFFFFF': '#2F3D4A', marginLeft:'10px'}} onClick={() => {setvarq(!varq)}}><FontAwesomeIcon style={{padding:'0px', margin:'0px'}} icon={faXmark} /></IconButton>
                    </Stack>

                    
                </DialogTitle>
                <DialogContent dividers={true} sx={{justifyContent:'center', overflowY: 'scroll'}}>
                {/* <Box width={'60px'} height={'30px'} borderRadius={'25px'} sx={{backgroundColor:'red', marginLeft:'auto', opacity:`${liveOpacity ? '1':'0'}`, textAlign:'center'}}>
                    <Typography>LIVE</Typography>
                </Box> */}
                <Stack>
                    <ToggleButtonGroup
                            value={selectedTab}
                            exclusive
                            onChange={handleTabChange}
                            aria-label="selected tab"
                            sx={{ width: '100%', marginBottom: '20px' }} // Full width and marginBottom
                        >
                            <ToggleButton value="overview" sx={{ width: '100%'}} style={{ backgroundColor: selectedTab === 'overview' ? '#124D81' : '#F3F2F7',color: selectedTab === 'overview' ? '#F3F2F7' : '#124D81'}}>Overview</ToggleButton>
                            <ToggleButton value="trends" sx={{ width: '100%' }} style={{ backgroundColor: selectedTab === 'trends' ? '#124D81' : '#F3F2F7',color: selectedTab === 'trends' ? '#F3F2F7' : '#124D81' }}>Trends</ToggleButton>
                            <ToggleButton value="alarms" sx={{ width: '100%' }} style={{ backgroundColor: selectedTab === 'alarms' ? '#124D81' : '#F3F2F7',color: selectedTab === 'alarms' ? '#F3F2F7' : '#124D81'  }}>Alarms</ToggleButton>
                                                    
                        </ToggleButtonGroup>
                    </Stack>
                    {selectedTab === 'overview' && (
                    <>
                    <Stack
                    direction={'row'}
                    divider={<Divider orientation='vertical' flexItem/>}
                    sx={{display: "flex",flexWrap: "wrap",gap: { xs: "2rem",sm: "2rem",md: "4rem",lg: "4rem",xl: "4rem"},
                    mt: {xs: 5,sm: 6,md: 7,lg: 8,},
                    mb: {xs: 5,sm: 6,md: 7,lg: 8,},
                    justifyContent: "center",}}>
                    <Stack alignItems={'center'} spacing={'10px'}>
                    <Typography variant="subtitle1" color={darkTheme?'#FFFFFF':'#124D81'}  >
                        {props.newData && props.observation_resource?.component[0]?.code.text}
                    </Typography>
                    <Typography variant="h4" color={darkTheme?'#FFFFFF':'#124D81'} sx={{fontWeight:'bold'}}>
                        {(() => {
                        if(props.newData){
                        return (props.observation_resource?.component[0]?.valueQuantity.unit=='1' || props.observation_resource?.component[0]?.valueQuantity.unit)
                        }
                        else{
                        return "Device Not Active"
                        }
                        })()}
                    </Typography>
                    </Stack>
                    {props.newData && props.observation_resource?.component.map((_obs: any,index: number) => {
                    if((props.observation_resource?.component[index]?.code.text!="SIQ" && props.observation_resource?.component[index]?.code.text!="PVI" && props.observation_resource?.component[index]?.code.text!="PI" && props.observation_resource?.component[index]?.code.text!="SPO2" && props.observation_resource?.component[index]?.code.text!="Pulse Rate") && index!=0){
                    return (
                    <Stack alignItems={'center'} spacing={'10px'} color={darkTheme?'#FFFFFF':'#124D81'}>
                    <Typography variant="subtitle1"  >
                        {props.observation_resource?.component[index]?.code.text}
                    </Typography>
                    {(() => {
                        if(props.observation_resource?.component[index]?.valueQuantity?.unit=="Min"){
                            var value = Math.round((props.observation_resource?.component[index]?.valueQuantity?.value + Number.EPSILON) * 100) / 100

                            if(value>=60){
                                return (
                                    <>
                                        <Typography variant='h4' >
                                            {value/60+":"+value%60}&nbsp;
                                        </Typography>
                                        <Typography variant='h5'>
                                            {"Hr"}
                                        </Typography>
                                    </>
                                )
                            }
                            else{
                                return (
                                    <>
                                        <Typography variant='h4'>
                                            {value}&nbsp;
                                        </Typography>
                                        <Typography variant='h5'>
                                            {"Min"}
                                        </Typography>
                                    </>
                                )
                            }
                        }
                        else{
                            return(
                                <>
                                    <Typography variant='h4'>
                                        {Math.round((props.observation_resource?.component[index]?.valueQuantity?.value + Number.EPSILON) * 100) / 100}&nbsp;
                                    </Typography>
                                    <Typography variant='h5'>
                                        {props.observation_resource?.component[index]?.valueQuantity?.unit}
                                    </Typography>
                                </>
                            )
                        }
                    })()}
                    </Stack>
                    )
                    }
                    })}
                    </Stack>

                    {props.newData && (
                        <Divider sx={{marginTop:'20px'}} />
                    )}
                    
                    {props.newData?
                    (
                    <>
                        <Typography variant='h5'  color={darkTheme?'#FFFFFF':'#124D81'} paddingLeft={'2%'} paddingTop={'3%'}>Pulse Oximeter</Typography>
                        <Stack
                            direction={'row'}
                            divider={
                                <Divider orientation='vertical' flexItem/>
                                }
                            sx={{display: "flex",flexWrap: "wrap",color:darkTheme?'#FFFFFF':'#124D81',
                            gap: {xs: "2rem",sm: "4rem",md: "4rem",lg: "4rem",xl: "4rem",},
                            mt: {xs: 2,sm: 3,md: 3,lg: 3,},
                            mb: { xs: 3,sm: 4,md: 5,lg: 6,},
                            justifyContent: "center",
                            textAlign:'center',
                            width:'100%'}}
                            >
                            {(() => {
                            var x = false
                            var items =  ( props.newData && props.observation_resource?.component.map((_obs: any, index: number) => {
                                    if(props.observation_resource?.component[index]?.code.text=="SIQ"|| props.observation_resource?.component[index]?.code.text=="PVI" || props.observation_resource?.component[index]?.code.text=="PI"|| props.observation_resource?.component[index]?.code.text=="SPO2" || props.observation_resource?.component[index]?.code.text=="Pulse Rate"){
                                        x = true
                                        var temp = false
                                        if(props.observation_resource?.component[index]?.code.text=="SIQ"){
                                            temp = true
                                        }
                                        return (
                                            <Stack alignItems={'center'} spacing={'10px'} justifyContent={'center'}>
                                            <Typography variant="subtitle1" >
                                                {props.newData && props.observation_resource?.component[index]?.code.text}
                                            </Typography>
                                            {temp && <Box width={'130px'} height={'45px'} sx={{backgroundColor:'white', borderRadius:'10px'}}>
                                            <Box width={String(props.observation_resource?.component[index]?.valueQuantity?.value)+'%'} height={'100%'} sx={{backgroundColor:'blue', borderRadius:'10px'}}></Box>
                                            </Box>}
                                            {!temp && 
                                            <Typography variant="h3">
                                                {/* {props.newData && props.observation_resource?.component[index]?.valueQuantity?.value}{props.observation_resource?.component[index]?.valueQuantity?.unit} */}
                                                <div style={{ display: 'flex',marginLeft:'auto', marginRight:'auto', paddingRight:'10px' }}>
                                                <Typography variant='h4'>
                                                    {Math.round((props.observation_resource?.component[index]?.valueQuantity?.value + Number.EPSILON) * 100) / 100}&nbsp;
                                                </Typography>
                                                <Typography variant='h5'>
                                                    {props.observation_resource?.component[index]?.valueQuantity?.unit}
                                                </Typography>
                                                </div>
                                            </Typography>
                                            }
                                            </Stack>
                                        )
                                    }
                                    
        
                                }))
                                
                                if (x){
                                    return items
                                }
                                else{
                                    return (<Typography variant='h6' sx={{fontWeight:'bold', paddingTop:'1%', opacity:'0.5'}}>{props.newData && 'Oximeter Not connected'}{!props.newData && ''}</Typography>)
                                }
    })()}
                            {}
                            
                        </Stack>
                    </>
                    ):
                    
                    <Box
                    sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    color:darkTheme?'#FFFFFF':'#124D81',
                    justifyContent: "center"}}><Typography variant='h6' sx={{fontWeight:'bold', paddingTop:'1%', opacity:'0.5'}}>{props.newData && 'Oximeter Not connected'}{!props.newData && ''}</Typography>
                    </Box>}
                    </> )}

                <Divider sx={{marginTop:'20px', backgroundColor:'grey', color:'grey'}}/>
                {selectedTab === 'trends' && (
                <>
                {props.observation_resource?.identifier[0]?.value?.toString()!="PMS-SYRINGE" &&
                                <div style={{marginTop:'25px'}}>
                                {   
                                        graphData && (<>
                                        <Stack direction={'row'} width={"100%"} justifyContent={'space-between'}>
                                        {/* <Button color="primary" startIcon={<FileDownloadIcon />} variant="contained" sx={{width:'100px', marginLeft:'2%'}}>
                                                Export
                                        </Button> */}
                                        <Stack width={'100%'} direction={{ xs: 'row', sm: 'row', md:'row', lg:'column' }} marginBottom={{ xs: '30px', sm: '30px', md:'20px', lg:'20px' }}>
                                        <Typography variant='h5' paddingLeft={'2%'} color={darkTheme?'#FFFFFF':'#124D81'}>Trends</Typography>
                                        <Stack width={'100%'} direction={'row'}  textAlign={'center'}  >
                                           <ToggleButtonGroup value={timeFrame} exclusive size="small" sx={{marginLeft:'auto', marginRight:'1%',backgroundColor:'grey', }}>
                                                <ToggleButton value={0} key="left" sx={{height:'30px', width:'50px', borderTopLeftRadius:'20px',borderBottomLeftRadius:'20px', fontSize:'10px', textTransform:'capitalize'}} onClick={() => {setTimeFrame(0)}}>
                                                Day
                                                </ToggleButton>,
                                                <ToggleButton value={1} key="center" sx={{height:'30px', width:'55px', fontSize:'10px', textTransform:'capitalize'}} onClick={() => {setTimeFrame(1)}}>
                                                    1 Week
                                                </ToggleButton>,
                                                <ToggleButton value={2} key="right" sx={{height:'30px', width:'58px', borderTopRightRadius:'20px',borderBottomRightRadius:'20px', fontSize:'10px', textTransform:'capitalize'}} onClick={() => {setTimeFrame(2)}}>
                                                    2 Weeks
                                                </ToggleButton>
                                            </ToggleButtonGroup>
                                            <ToggleButtonGroup value={S_and_D} exclusive size="small" sx={{marginRight:'1%',backgroundColor:'grey', '& .MuiToggleButton-root': {color:'white'},'& .Mui-selected': {backgroundColor: '#124D81',},}}>
                                                <ToggleButton value={0} key="left" sx={{height:'30px', width:'80px', borderTopLeftRadius:'20px',borderBottomLeftRadius:'20px', fontSize:'10px', textTransform:'capitalize'}} onClick={() => {
                                                    setS_and_D(0)
                                                    let temp: any[] = []
                                                    chartRef1.current.data.datasets.forEach((dataset: { label: any; }, datasetIndex: any) => {
                                                        temp.push(dataset.label)    
                                                        chartRef1.current.setDatasetVisibility(datasetIndex, true);
                                                        });
                                                    chartRef1.current.update();
                                                    chartRef2.current.data.datasets.forEach((dataset: { label: any; }, datasetIndex: any) => {
                                                        temp.push(dataset.label)
                                                        chartRef2.current.setDatasetVisibility(datasetIndex, true);
                                                        });
                                                    chartRef2.current.update();
                                                    chartRef3.current.data.datasets.forEach((dataset: { label: any; }, datasetIndex: any) => {
                                                        temp.push(dataset.label)
                                                        chartRef3.current.setDatasetVisibility(datasetIndex, true);
                                                        });
                                                    chartRef3.current.update();
                                                    setSelectedLegends(temp.filter(val => val!=""))
                                                }}>
                                                    Select all
                                                </ToggleButton>
                                                <ToggleButton value={1} key="right" sx={{height:'30px', width:'80px', borderTopRightRadius:'20px',borderBottomRightRadius:'20px', fontSize:'10px', textTransform:'capitalize'}}  onClick={() => {
                                                    setS_and_D(1)
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
                                                    setSelectedLegends([])
                                                }}>
                                                    Deselect all
                                                </ToggleButton>
                                            </ToggleButtonGroup>
                                            <Button color="primary" startIcon={<FileDownloadIcon />} variant="contained" sx={{  borderRadius:'25px', width:'100px', height:'30px', textTransform:'capitalize', fontSize:'10px', color:'white'}} onClick={() => {
                                                setDownloadConfirmation(true)
                                            }}>
                                                Download
                                            </Button>
                                        </Stack>
                                        </Stack>
                                        <Dialog
                                            open={downloadConfirmation}
                                            onClose={() => {setDownloadConfirmation(false)}}
                                            scroll='paper'
                                            PaperProps={{style:{borderRadius:'25px', boxShadow: `0px 0px 40px 1px #404040`, border:'0.4px solid #505050', backgroundImage:'linear-gradient(to bottom, #111522, #111522, #111522)', minWidth:'400px', minHeight:'200px'}}} // borderRadius:'3%', boxShadow: `0px 0px 20px 10px #7B7B7B`, border:'1px solid #7B7B7B
                                        >
                                            <DialogTitle id="responsive-dialog-title" sx={{textAlign:"center", fontWeight:'bold', padding:'9%'}}>
                                                {`Confirm Download data of the following parameters` }
                                            </DialogTitle>
                                            <DialogContent sx={{textAlign:"center", marginBottom:'auto', paddingBottom:'9%'}}>
                                                <Stack marginLeft={'auto'} marginRight={'auto'} width={'70%'} spacing={'5px'} justifyContent={'center'} textAlign={'center'}>
                                                    {selectedLegends.map((vals: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | React.ReactFragment | React.ReactPortal | null | undefined) => {
                                                        return (
                                                            <Box  border={'0.3px solid grey'}>{vals}</Box>
                                                        )
                                                    })}
                                                </Stack>
                                            </DialogContent>
                                            <DialogActions sx={{paddingBottom:'5%'}}>
                                                <Stack direction={'row'} width={'100%'} justifyContent={'space-around'}>    
                                                <Box sx={{minWidth:'90px', minHeight:'45px'}} onClick={() => {setDownloadConfirmation(false)}}><CustomNoButton text="Cancel"></CustomNoButton></Box>
                                                
                                                <Box sx={{minWidth:'90px', minHeight:'45px'}} onClick={handleExportData}><CustomOkButton text="Confirm"></CustomOkButton></Box>
                                                </Stack>
                                                
                                            </DialogActions>
                                        </Dialog>
                                        
                
                                        </Stack>
                                        
                                        {/* <div style={{justifyContent:'center'}}>
                                            
                                        </div> */}
                                            {graph}
                                        
                                        
                                            {/* <Button >Select all</Button> */}
                                            
                                        </>)
                                    }
                                    {
                                        !graphData && (<div></div>)
                                    } 
                                    <Divider sx={{marginTop:'40px', backgroundColor:'white', color:'white'}} />           
                                </div>
                }
                </>)}
                {selectedTab === 'alarms' && (
                <>
                <Typography variant='h5' paddingLeft={'2%'} color={darkTheme?'#FFFFFF':'#124D81'} paddingTop={'3%'}>Alarms</Typography>
                <Stack direction={'row'} width={'100%'} justifyContent={'space-between'} marginTop={'3%'}>
                    <IconButton sx={{height:'50px', width:'50px', borderRadius:'100px', marginTop:'auto', marginBottom:'auto',color:'blue'}} onClick={() => {if(selectAlarm>0){setSelectAlarm(selectAlarm-1)}}}><FontAwesomeIcon fontSize={'30px'} icon={faChevronLeft} style={{color:`${leftarrowcolor}`}}/></IconButton>
                    <Box width={'100%'} display={'flex'} textAlign={'center'} justifyContent={'center'} flexWrap={'wrap'} >
                    {alarmUI}
                        {/* <div style={{marginTop:'2.5%', display:'flex', width:'100%', height:'100%', justifyContent:'space-evenly'}}></div>  */}
                    </Box>
                    <IconButton sx={{height:'50px', width:'50px', borderRadius:'100px', marginTop:'auto', marginBottom:'auto'}} onClick={() => {if(selectAlarm<newalarm.length){setSelectAlarm(selectAlarm+1)}}}><FontAwesomeIcon fontSize={'30px'} icon={faChevronRight} style={{color:`${rightarrowcolor}`}} /></IconButton>  
                </Stack>
                {/* onClick={() => {setTableVisible(!tableVisisble)}} endIcon={tableVisisble ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />} */}
                <Button sx={{width:'20%', height:'50px', marginLeft:'40%', marginTop:'3%', marginBottom:'3%', borderRadius:'50px', color:'#111522', backgroundColor:'white', border:'0.5px solid grey', fontWeight:50, boxShadow: `0px 0px 10px 1px #6e6f88`, textTransform:'capitalize'}}  endIcon={tableVisisble ? <KeyboardArrowUpIcon sx={{ fontSize: 80 }} /> : <KeyboardArrowDownIcon sx={{ fontSize: 80 }}  />} onClick={() => { handleClick();setTableVisible(!tableVisisble);}}> 
                <Box sx={{ fontWeight: 'regular', m: 1, fontSize:16, }}>Alarm Log</Box>
                </Button>
                <div  style={{ width:'100%'}} >
                {tableVisisble && <Table  infscrollfunc={infscrollfunc} rows={rows} columns={columns}/>}
                {/* <div ref={scrollto} style={{width:'100px', height:'20px', backgroundColor:'red', marginTop:tableVisisble ? '300px'  : '0px'}}></div> */}
                </div>
                {/* <div style={{width:'10px', height:'10px', backgroundColor:'yellow'}} ref={scrollto}></div> */}
                </>
                 )}
                </DialogContent>
            </Dialog>
        </React.Fragment>
    )
}

