import React, { useEffect, useMemo, useState } from 'react';
import { Backdrop, Box, CircularProgress, Divider, Paper, Stack, Typography, } from '@mui/material';
import { useLocation } from "react-router-dom";
import { MaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
import zoomPlugin from 'chartjs-plugin-zoom'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Colors,
  } from 'chart.js';
import { Line } from 'react-chartjs-2';
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Colors,
    zoomPlugin
);
import {faker} from '@faker-js/faker';
interface Column {
    accessorKey: string;
    header: string;
    id: string;
}
interface Row {
    date: string;
    time: string;
    alarm: string;
    priority: string;
  }


export const DetailedDevice = () => {
    const [loading, setLoading] = useState(true)
    const [observation, setObservation] = useState(
     [
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
    const [newObs, setNewObs] = useState({})
    const [newData, setNewData] = useState(false)
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
    const {key, device_id, patient, device_resource_id, observation_resource, communication_resource} = useLocation().state
    // setNewObs(observation_resource)
   
    const [dataset, setDataSet] = useState([
        {
            // "name": "",
            // "data": [],
            // "bordorcolor": "",
            // "backgroundcolor":"",
            // "yaxis":""
        }
    ])
    const [graphData, setGraphData] = useState(false)
    const [times, setTimes] = useState<Array<any>>([])
    const cols = [
        {
            accessorKey: "date",
            header: "Date",
            id: "date"
        },
        {
            accessorKey: "time",
            header: "Time",
            id: "time"
        },
        {
            accessorKey: "alarm",
            header: "Alarm",
            id: "alarm"
        },
        {
            accessorKey: "priority",
            header: "Priority",
            id: "priority"
        }
    ]
    const [rows, setRows] = useState([])
    
    useEffect(() => {
        fetch(`http://13.126.5.10:9444/fhir-server/api/v4/Observation/${observation_resource.id}/_history`, {
          credentials: "omit",
          headers: {
            Authorization: "Basic "+ btoa("fhiruser:change-password"),
          },
        })
        .then((response) => response.json())
        .then((data) => {
            // setObservation(data)
            let temparr: any[] = []
            var totaldata = data.total
            var page = 1
            if(totaldata>1000){
                totaldata=1000
            }
            // console.log(`http://13.126.5.10:9444/fhir-server/api/v4/Observation/${observation_resource.id}/_history?_page=${page}&_count=50`)
            while(totaldata>=50){
                fetch(`http://13.126.5.10:9444/fhir-server/api/v4/Observation/${observation_resource.id}/_history?_page=${page}&_count=50`,{
                    credentials: "omit",
                    headers: {
                        Authorization: "Basic "+ btoa("fhiruser:change-password"),
                    },
                })
                .then((response) => response.json())
                .then((data) => {
                    for(let i=0;i<data.entry.length;i++){
                       
                        temparr.push(data.entry[i])
                    }
                })
                totaldata=totaldata%50
                page+=1
            }
                fetch(`http://13.126.5.10:9444/fhir-server/api/v4/Observation/${observation_resource.id}/_history?_page=${page}&_count=50`,{
                    credentials: "omit",
                    headers: {
                        Authorization: "Basic "+ btoa("fhiruser:change-password"),
                    },
                })
                .then((response) => response.json())
                .then((data) => {
                    for(let i=0;i<data.entry.length;i++){
                        // console.log(temparr)
                        temparr.push(data.entry[i])
                    }
                    
                    setObservation(temparr.reverse())
                    setLoading(false)
                })
            
            // console.log(temparr)
            // setObservation((prevobs) => ({...prevobs,entry: temparr}))
            
            
        })
        // console.log(`http://13.126.5.10:9444/fhir-server/api/v4/Communication/${communication_resource.id}/_history`)
        fetch(`http://13.126.5.10:9444/fhir-server/api/v4/Communication/${communication_resource.id}/_history`, {
          credentials: "omit",
          headers: {
            Authorization: "Basic "+ btoa("fhiruser:change-password"),
          },
        })
        .then((response) => response.json())
        .then((data) => {
            // setObservation(data)
            let temparr: any[] = []
            var totaldata = data.total
            
            var page = 1
            if(totaldata>1000){
                totaldata=1000
            }
            while(totaldata>=50){
                fetch(`http://13.126.5.10:9444/fhir-server/api/v4/Communication/${communication_resource.id}/_history?_page=${page}&_count=50`,{
                    credentials: "omit",
                    headers: {
                        Authorization: "Basic "+ btoa("fhiruser:change-password"),
                    },
                })
                .then((response) => response.json())
                .then((data) => {
                    for(let i=0;i<data.entry.length;i++){
                       
                        temparr.push(data.entry[i])
                    }
                })
                totaldata=totaldata%50
                page+=1
            }
            if(totaldata <50){
                
                fetch(`http://13.126.5.10:9444/fhir-server/api/v4/Communication/${communication_resource.id}/_history?_page=${page}&_count=50`,{
                    credentials: "omit",
                    headers: {
                        Authorization: "Basic "+ btoa("fhiruser:change-password"),
                    },
                })
                .then((response) => response.json())
                .then((data) => {
                    for(let i=0;i<data.entry.length;i++){
                        // console.log(temparr)
                        temparr.push(data.entry[i])
                    }
                    setCommunication(temparr)
                    setLoading(false)
                })
            }
            // console.log(temparr)
            // setObservation((prevobs) => ({...prevobs,entry: temparr}))
            
            
        })



        const socket = new WebSocket("ws://13.126.5.10:9444/fhir-server/api/v4/notification");
        socket.onopen = () => {
        //   console.log("Socket open successful from new page");
        };
        socket.onmessage = (data) => {
          var recieved_data = JSON.parse(data.data)
          // console.log(data)
          if (recieved_data.location.split("/")[0] == "Observation" && recieved_data.location.split("/")[1] == observation_resource.id){
              // console.log(data)
            // if (obsArray.includes(recieved_data.resourceId)){
              fetch(`http://13.126.5.10:9444/fhir-server/api/v4/${recieved_data.location}`, {
              credentials: "omit",
              headers: {
                Authorization: "Basic "+ btoa("fhiruser:change-password"),
                },
              })
              .then((response) => response.json())
              .then((data) => {
                // console.log(temp)
                // console.log(temp)
                setNewObs(data)
                setNewData(true)
            
              })
            // }
          }
          
          // console.log(data.data);
        };
        socket.onerror = () => {console.log(`Error in socket connection`)}
      }, [])
      useEffect(() => {console.log(communication)},[communication])
    const [vvtemp, setvvtemp] = useState(false)
    useEffect(() => {
    //    console.log(Array.isArray(observation))

        if(observation[1]?.resource?.component?.length>1){
            
            setTimes(observation.map((obs) => {
                return(
                    new Date(obs.resource.meta.lastUpdated).toLocaleTimeString())
                }))
            
            setDataSet(() => {
                if(observation[1].resource.component.length>6){
                    return [
                        {
                            label: String(observation[1].resource.component[1].code.text),
                            data: observation.map((obs) => {
                                if(obs.resource.component){return(obs.resource.component[1].valueQuantity.value)}
                                else{return(null)}    
                                
                            }),
                            // borderColor: 'rgb(255, 99, 132)',
                            // backgroundColor:'rgb(255, 99, 132)',
                            yaxis:'y'
                        },
                        {
                            label: String(observation[1].resource.component[2].code.text),
                            data: observation.map((obs) => {
                                if(obs.resource.component){return(obs.resource.component[2].valueQuantity.value)}
                                else{return(null)}    
                                
                            }),
                            // borderColor: 'rgb(53, 162, 235)',
                            // backgroundColor:'rgb(53, 162, 235)',
                            yaxis:'y'
                        }, 
                        {
                            label: String(observation[1].resource.component[3].code.text),
                            data: observation.map((obs) => {
                                if(obs.resource.component){return(obs.resource.component[3].valueQuantity.value)}
                                else{return(null)}    
                                
                            }),
                            // borderColor: 'rgb(53, 162, 235)',
                            // backgroundColor:'rgb(53, 162, 235)',
                            yaxis:'y1'
                        },
                        {
                            label: String(observation[1].resource.component[4].code.text),
                            data: observation.map((obs) => {
                                if(obs.resource.component){return(obs.resource.component[4].valueQuantity.value)}
                                else{return(null)}    
                                
                            }),
                            // borderColor: 'rgb(53, 162, 235)',
                            // backgroundColor:'rgb(53, 162, 235)',
                            yaxis:'y'
                        },
                        {
                            label: String(observation[1].resource.component[5].code.text),
                            data: observation.map((obs) => {
                                if(obs.resource.component){return(obs.resource.component[5].valueQuantity.value)}
                                else{return(null)}    
                                
                            }),
                            // borderColor: 'rgb(53, 162, 235)',
                            // backgroundColor:'rgb(53, 162, 235)',
                            yaxis:'y2'
                        },
                        {
                            label: String(observation[1].resource.component[6].code.text),
                            data: observation.map((obs) => {
                                if(obs.resource.component && obs.resource.component[6]){
                                    return(obs.resource.component[6].valueQuantity.value)
                                }
                                else{
                                    return(null)
                                }
                                }),
                            // data: observation.map((obs) => {
                            //     if(obs.resource.component){return(obs.resource.component[1].valueQuantity.value)}
                            //     else{return(null)}    
                                
                            // }),
                            // borderColor: 'rgb(53, 162, 235)',
                            // backgroundColor:'rgb(53, 162, 235)',
                            yaxis:'y1'
                        },
                        {
                            label: String(observation[1].resource.component[7].code.text),
                            data: observation.map((obs) => {
                                if(obs.resource.component && obs.resource.component[7]){
                                    return(obs.resource.component[7].valueQuantity.value)
                                }
                                else{
                                    return(null)
                                }
                                }),
                            // data: observation.map((obs) => {
                            //     if(obs.resource.component){return(obs.resource.component[1].valueQuantity.value)}
                            //     else{return(null)}    
                                
                            // }),
                            // borderColor: 'rgb(53, 162, 235)',
                            // backgroundColor:'rgb(53, 162, 235)',
                            yaxis:'y3'
                        }
                    ]
                }
                if(observation[1].resource.component.length<=6){
                    return [
                        {
                            label: String(observation[1].resource.component[1].code.text),
                            data: observation.map((obs) => {
                                if(obs.resource.component){return(obs.resource.component[1].valueQuantity.value)}
                                else{return(null)}    
                                
                            }),
                            // borderColor: 'rgb(255, 99, 132)',
                            // backgroundColor:'rgb(255, 99, 132)',
                            yaxis:'y'
                        },
                        {
                            label: String(observation[1].resource.component[2].code.text),
                            data: observation.map((obs) => {
                                if(obs.resource.component){return(obs.resource.component[2].valueQuantity.value)}
                                else{return(0)}    
                                
                            }),
                            // borderColor: 'rgb(53, 162, 235)',
                            // backgroundColor:'rgb(53, 162, 235)',
                            yaxis:'y'
                        }, 
                        {
                            label: String(observation[1].resource.component[3].code.text),
                            data: observation.map((obs) => {
                                if(obs.resource.component){return(obs.resource.component[3].valueQuantity.value)}
                                else{return(null)}    
                                
                            }),
                            // borderColor: 'rgb(53, 162, 235)',
                            // backgroundColor:'rgb(53, 162, 235)',
                            yaxis:'y1'
                        },
                        {
                            label: String(observation[1].resource.component[4].code.text),
                            data: observation.map((obs) => {
                                if(obs.resource.component){return(obs.resource.component[4].valueQuantity.value)}
                                else{return(null)}    
                                
                            }),
                            // borderColor: 'rgb(53, 162, 235)',
                            // backgroundColor:'rgb(53, 162, 235)',
                            yaxis:'y'
                        },
                        {
                            label: String(observation[1].resource.component[5].code.text),
                            data: observation.map((obs) => {
                                if(obs.resource.component){return(obs.resource.component[5].valueQuantity.value)}
                                else{return(null)}    
                                
                            }),
                            // borderColor: 'rgb(53, 162, 235)',
                            // backgroundColor:'rgb(53, 162, 235)',
                            yaxis:'y2'
                        }]
                }
            }
        )
        }
        setvvtemp(true)
        console.log(observation)
    },[observation])
    useEffect(() => {
        // communication.map((commres) => {
        //     console.log(commres.resource.meta.lastUpdated)
        // })
        // console.log(communication)
        var x: { date: StringConstructor; time: StringConstructor; alarm: StringConstructor; priority: StringConstructor; }[] = []
        
        communication.map((commres) => 
             {
                if(commres.resource.extension){
                    
                    commres.resource.extension[0].valueCodeableConcept.coding.map((val,index) => 
                    {  
                       x.push({
                           date: String(new Date(commres.resource.meta.lastUpdated).toLocaleDateString()),
                           time: String(new Date(commres.resource.meta.lastUpdated).toLocaleTimeString()),
                           alarm: val.display,
                           priority: commres.resource.extension[1].valueCodeableConcept.coding[index].display
                       })
                    }
               )
                }

                    }
        )
        console.log(x)
        setRows(x)
        // setRows(
        // console.log(communication)
        // )
    },[communication])
    const [data, setData] = useState({})
    useEffect(() => {
        // console.log(dataset)
        // console.log(labels)
        // console.log(times)
        setData({
            labels,
            datasets: dataset
        })
        setGraphData(true)
    },[times])
    const labels = times;
    // const data = {
    //     labels,
    //     datasets: [
    //       {
    //         label: 'Dataset 1',
    //         data: [1,2,3,4],
    //         borderColor: 'rgb(255, 99, 132)',
    //         backgroundColor: 'rgba(255, 99, 132, 0.5)',
    //       },
    //       {
    //         label: 'Dataset 2',
    //         data: [1,2,3,4],
    //         borderColor: 'rgb(53, 162, 235)',
    //         backgroundColor: 'rgba(53, 162, 235, 0.5)',
    //       },
    //     ],
    //   };
    // const vvtemp = [1,2,3,4,5];
    // const data = {
    //         vvtemp,
    //         datasets: [{
    //             label: "HELLO",
    //             data: [1,2,3,4,5],
    //             borderColor: 'rgb(255, 99, 132)',
    //             backgroundColor:'rgb(255, 99, 132)',
    //             yaxis:'y'
    //         }]
    //     }
    // useEffect(() => {console.log(data)},[data])
    const options = {
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
          colors: {
            forceOverride: true
          },
          zoom: {
            pan: {
                enabled: true,
                mode: 'x'
            },
            zoom: {
                pinch: {
                    enabled: true       // Enable pinch zooming
                },
                wheel: {
                    enabled: true       // Enable wheel zooming
                },
                mode: 'x',
            }
        }
        },
        scales: {
          y: {      // Celcius
            type: 'linear' as const,
            display: true,
            position: 'left' as const,
            title: {
                display: true,
                text: "Percentage (%)"
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
                display: true,
                text: "Temperature (C°)"
            }
          },
          y2: {     //g
            type: 'linear' as const,
            display: true,
            position: 'right' as const,
            grid: {
              drawOnChartArea: false,
            },
            title: {
                display: true,
                text: "Grams (g)"
            }
          },
          y3: {     // bpm
            type: 'linear' as const,
            display: true,
            position: 'left' as const,
            grid: {
              drawOnChartArea: false,
            },
            title: {
                display: true,
                text: "Beats Per Minuite (bpm)"
            }
          }
        },
      };
//    const options = {
//   responsive: true,
//   plugins: {
//     legend: {
//       position: 'top' as const,
//     },
//     title: {
//       display: true,
//       text: 'Chart.js Line Chart',
//     },
//   },
// };
    // const labels = times;

    // const data = {
    // times,
    // datasets: dataset
    // };

    // useEffect(() => {console.log(dataset)},[dataset])









    return (
    <Paper sx={{backgroundColor:'transparent', width:'95%', margin: '0 auto', marginTop:'10px',}}>
        <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={loading}
        ><CircularProgress color="inherit" /></Backdrop>
        <Stack width={"100%"} >
            <Stack direction={'row'} width={'95%'} sx={{justifyContent:'space-between' ,marginTop:'20px', marginLeft:'auto', marginRight:'auto'}}>
                <Typography variant="h6" >
                    {device_id}
                </Typography>
                <Typography variant="h6">
                    {patient?.extension[0]?.valueString} | {patient?.identifier[0]?.value}
                </Typography>
            </Stack>
            <Divider sx={{marginTop:'20px',}}/>
            <Box
                sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: {
                        xs: "2rem",
                        sm: "3rem",
                        md: "4rem",
                        lg: "5rem",
                        xl: "6rem",
                    },
                    mt: {
                        xs: 5,
                        sm: 6,
                        md: 7,
                        lg: 8,
                    },
                    mb: {
                        xs: 3,
                        sm: 4,
                        md: 5,
                        lg: 6,
                    },
                    justifyContent: "center",
                }}
            >
                <Stack alignItems={'center'} spacing={'10px'}>
                    <Typography variant="h6" >
                        {newData && newObs?.component[0]?.code.text}
                    </Typography>
                    <Typography variant="h3" sx={{fontWeight:'bold'}}>
                        {(() => {
                            if(newData){
                                if (newObs?.component[0]?.valueQuantity.value==0) {
                                    return 'P';
                                } else if (newObs?.component[0].valueQuantity.value==1){
                                    return 'M';
                                }
                                else{
                                    return 'B';
                                }
                            }
                            else{
                                return "Device Not Active"
                            }
                            
                        })()}
                    </Typography>
                </Stack>
                {newData && newObs?.component.map((_obs: any,index: number) => {
                    if(index<6 && index!=0){
                        return (
                            <Stack alignItems={'center'} spacing={'10px'}>
                                <Typography variant="h6" >
                                    {newObs?.component[index]?.code.text}
                                </Typography>
                                <Typography variant="h3">
                                    {newData && newObs?.component[index]?.valueQuantity.value}{newObs?.component[index]?.valueQuantity.unit}
                                </Typography>
                            </Stack>
                        )
                    }
                })}
            </Box>
            {/* <Stack direction={'row'} sx={{justifyContent:'space-evenly', marginTop:'20px', marginLeft:'10px', marginRight:'10px'}}>
                
                
                
            </Stack> */}
            <Divider sx={{marginTop:'20px'}} />
            {newData && newObs?.component[7]?.code ? 
            <Box
            sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: {
                    xs: "2rem",
                    sm: "3rem",
                    md: "4rem",
                    lg: "5rem",
                    xl: "6rem",
                },
                mt: {
                    xs: 5,
                    sm: 6,
                    md: 7,
                    lg: 8,
                },
                mb: {
                    xs: 3,
                    sm: 4,
                    md: 5,
                    lg: 6,
                },
                justifyContent: "center",
            }}
        >
                {newData && newObs?.component.map((_obs: any, index: number) => {
                    if(index>5){
                    return (
                        <Stack alignItems={'center'} spacing={'10px'}>
                            <Typography variant="h6" >
                                {newData && newObs?.component[index]?.code.text}
                            </Typography>
                            <Typography variant="h3">
                                {newData && newObs?.component[index]?.valueQuantity?.value}{newObs?.component[index]?.valueQuantity?.unit}
                            </Typography>
                        </Stack>
                    )}
                })}
            </Box>:<Box
            sx={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center"}}>
                    <Typography variant='h2' sx={{fontWeight:'bold'}}>Oximeter Not connected</Typography></Box>}
            <Divider sx={{marginTop:'20px'}} />
            <div style={{marginTop:'25px'}}>
            
                {
                    graphData && (<Line options={options} data={data}></Line>)
                }
                {
                    !graphData && (<div></div>)
                }
            
            </div>
            <Divider sx={{marginTop:'20px', marginBottom:'20px'}} />
            <MaterialReactTable enableGrouping
            initialState={{
                density: 'compact',        
                expanded: true, //expand all groups by default        
                grouping: ['date','time'], //an array of columns to group by by default (can be multiple)        
                pagination: { pageIndex: 0, pageSize: 20 },
                sorting: [{ id: 'date', desc: true }], //sort by state by defaul
              }} columns={cols} data={rows}></MaterialReactTable>
        </Stack>
    </Paper>
    )
}
