import React, { useEffect, useMemo, useState } from 'react';
import { Backdrop, Box, Button, CircularProgress, Divider, Paper, Stack, Typography, } from '@mui/material';
import { useLocation } from "react-router-dom";
import { MaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
import zoomPlugin from 'chartjs-plugin-zoom'
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { ExportToCsv } from 'export-to-csv';
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
    const [rows, setRows] = useState([{
        date: String,
        time: String,
        alarm: String,
        priority: String
    }])
    
    useEffect(() => {
        fetch(`http://13.126.5.10:9444/fhir-server/api/v4/Observation/${observation_resource?.id}/_history`, {
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
            if(totaldata>100000){
                totaldata=100000
            }
            // console.log(`http://13.126.5.10:9444/fhir-server/api/v4/Observation/${observation_resource.id}/_history?_page=${page}&_count=50`)
            while(totaldata>=100){
                fetch(`http://13.126.5.10:9444/fhir-server/api/v4/Observation/${observation_resource.id}/_history?_page=${page}&_count=100`,{
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
                totaldata=totaldata%100
                page+=1
            }
                fetch(`http://13.126.5.10:9444/fhir-server/api/v4/Observation/${observation_resource.id}/_history?_page=${page}&_count=100`,{
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
            if(totaldata>100000){
                totaldata=100000
            }
            
            while(totaldata>=100){
                
                fetch(`http://13.126.5.10:9444/fhir-server/api/v4/Communication/${communication_resource.id}/_history?_page=${page}&_count=100`,{
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
                
                totaldata=totaldata%100
                page+=1
            }
            if(totaldata <100){
                fetch(`http://13.126.5.10:9444/fhir-server/api/v4/Communication/${communication_resource.id}/_history?_page=${page}&_count=100`,{
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
    const [vvtemp, setvvtemp] = useState(false)
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
      const yAxisIDMap = {
        "%": "y",
        "C": "y1",
        "g": "y2",
        "BPM": "y3"
        // Add more mappings as needed
      };
      const csvOptions = {
        fieldSeparator: ',',
        quoteStrings: '"',
        decimalSeparator: '.',
        showLabels: true,
        useBom: true,
        useKeysAsHeaders: false,
        headers: cols.map((c) => c.header),
      };
      const csvExporter = new ExportToCsv(csvOptions);
      const handleExportData = () => {
        csvExporter.generateCsv(rows);
      };
    useEffect(() => {
    //    console.log(Array.isArray(observation))

        if(observation[1]?.resource?.component?.length>1){
            
            setTimes(observation.map((obs) => {
                return(
                    new Date(obs.resource.meta.lastUpdated).toLocaleTimeString())
                }))
            setDataSet(observation[1].resource.component.map((data, index) => {
                return {
                label: String(observation[1]?.resource?.component[index]?.code?.text),
                data: observation.map((obs) => {
                    if(obs?.resource?.component){return(obs.resource?.component[index]?.valueQuantity.value)}
                    else{return(null)}    
                    
                }),
                // borderColor: 'rgb(255, 99, 132)',
                // backgroundColor:'rgb(255, 99, 132)',
                yAxisID: yAxisIDMap[String(observation[1]?.resource?.component[index]?.valueQuantity.unit)] || 'y3'
            }}))
        //     setDataSet(() => {
        //         if(observation[1].resource.component.length>6){
        //             return [
        //                 {
        //                     label: String(observation[1].resource.component[1].code.text),
        //                     data: observation.map((obs) => {
        //                         if(obs.resource.component){return(obs.resource.component[1].valueQuantity.value)}
        //                         else{return(null)}    
                                
        //                     }),
        //                     // borderColor: 'rgb(255, 99, 132)',
        //                     // backgroundColor:'rgb(255, 99, 132)',
        //                     yAxisID: yAxisIDMap[String(observation[1].resource.component[1].valueQuantity.unit)] || 'y3'
        //                 },
        //                 {
        //                     label: String(observation[1].resource.component[2].code.text),
        //                     data: observation.map((obs) => {
        //                         if(obs.resource.component){return(obs.resource.component[2].valueQuantity.value)}
        //                         else{return(null)}    
                                
        //                     }),
        //                     // borderColor: 'rgb(53, 162, 235)',
        //                     // backgroundColor:'rgb(53, 162, 235)',
        //                     yAxisID: yAxisIDMap[String(observation[1].resource.component[2].valueQuantity.unit)] || 'y3'
        //                 }, 
        //                 {
        //                     label: String(observation[1].resource.component[3].code.text),
        //                     data: observation.map((obs) => {
        //                         if(obs.resource.component){return(obs.resource.component[3].valueQuantity.value)}
        //                         else{return(null)}    
                                
        //                     }),
        //                     // borderColor: 'rgb(53, 162, 235)',
        //                     // backgroundColor:'rgb(53, 162, 235)',
        //                     yAxisID: yAxisIDMap[String(observation[1].resource.component[3].valueQuantity.unit)] || 'y3'
        //                 },
        //                 {
        //                     label: String(observation[1].resource.component[4].code.text),
        //                     data: observation.map((obs) => {
        //                         if(obs.resource.component){return(obs.resource?.component[4]?.valueQuantity.value)}
        //                         else{return(null)}    
                                
        //                     }),
        //                     // borderColor: 'rgb(53, 162, 235)',
        //                     // backgroundColor:'rgb(53, 162, 235)',
        //                     yAxisID: yAxisIDMap[String(observation[1].resource.component[4].valueQuantity.unit)] || 'y3'
        //                 },
        //                 {
        //                     label: String(observation[1].resource.component[5].code.text),
        //                     data: observation.map((obs) => {
        //                         if(obs.resource.component){return(obs.resource?.component[5]?.valueQuantity.value)}
        //                         else{return(null)}    
                                
        //                     }),
        //                     // borderColor: 'rgb(53, 162, 235)',
        //                     // backgroundColor:'rgb(53, 162, 235)',
        //                     yAxisID: yAxisIDMap[String(observation[1].resource.component[5].valueQuantity.unit)] || 'y3'
        //                 },
        //                 {
        //                     label: String(observation[1].resource.component[6].code.text),
        //                     data: observation.map((obs) => {
        //                         if(obs.resource.component && obs.resource.component[6]){
        //                             return(obs.resource.component[6].valueQuantity.value)
        //                         }
        //                         else{
        //                             return(null)
        //                         }
        //                         }),
        //                     // data: observation.map((obs) => {
        //                     //     if(obs.resource.component){return(obs.resource.component[1].valueQuantity.value)}
        //                     //     else{return(null)}    
                                
        //                     // }),
        //                     // borderColor: 'rgb(53, 162, 235)',
        //                     // backgroundColor:'rgb(53, 162, 235)',
        //                     yAxisID: yAxisIDMap[String(observation[1].resource.component[6].valueQuantity.unit)] || 'y3'
        //                 },
        //                 {
        //                     label: String(observation[1].resource.component[7].code.text),
        //                     data: observation.map((obs) => {
        //                         if(obs.resource.component && obs.resource.component[7]){
        //                             return(obs.resource.component[7].valueQuantity.value)
        //                         }
        //                         else{
        //                             return(null)
        //                         }
        //                         }),
        //                     // data: observation.map((obs) => {
        //                     //     if(obs.resource.component){return(obs.resource.component[1].valueQuantity.value)}
        //                     //     else{return(null)}    
                                
        //                     // }),
        //                     // borderColor: 'rgb(53, 162, 235)',
        //                     // backgroundColor:'rgb(53, 162, 235)',
        //                     yAxisID: yAxisIDMap[String(observation[1].resource.component[7].valueQuantity.unit)] || 'y3'
        //                 }
        //             ]
        //         }
        //         if(observation[1].resource.component.length<=6){
        //             return [
        //                 {
        //                     label: String(observation[1].resource.component[1].code.text),
        //                     data: observation.map((obs) => {
        //                         if(obs.resource.component){return(obs.resource.component[1]?.valueQuantity.value)}
        //                         else{return(null)}    
                                
        //                     }),
        //                     // borderColor: 'rgb(255, 99, 132)',
        //                     // backgroundColor:'rgb(255, 99, 132)',
        //                     yAxisID:'y'
        //                 },
        //                 {
        //                     label: String(observation[1].resource.component[2].code.text),
        //                     data: observation.map((obs) => {
        //                         if(obs.resource.component){return(obs.resource.component[2]?.valueQuantity.value)}
        //                         else{return(0)}    
                                
        //                     }),
        //                     // borderColor: 'rgb(53, 162, 235)',
        //                     // backgroundColor:'rgb(53, 162, 235)',
        //                     yAxisID:'y'
        //                 }, 
        //                 {
        //                     label: String(observation[1].resource.component[3].code.text),
        //                     data: observation.map((obs) => {
        //                         if(obs.resource.component){return(obs.resource.component[3]?.valueQuantity.value)}
        //                         else{return(null)}    
                                
        //                     }),
        //                     // borderColor: 'rgb(53, 162, 235)',
        //                     // backgroundColor:'rgb(53, 162, 235)',
        //                     yAxisID:'y1'
        //                 },
        //                 {
        //                     label: String(observation[1]?.resource?.component[4]?.code.text),
        //                     data: observation.map((obs) => {
        //                         if(obs.resource.component){return(obs.resource.component[4]?.valueQuantity.value)}
        //                         else{return(null)}    
                                
        //                     }),
        //                     // borderColor: 'rgb(53, 162, 235)',
        //                     // backgroundColor:'rgb(53, 162, 235)',
        //                     yAxisID:'y'
        //                 },
        //                 {
        //                     label: String(observation[1]?.resource?.component[5]?.code.text),
        //                     data: observation.map((obs) => {
        //                         if(obs.resource.component){return(obs.resource.component[5]?.valueQuantity.value)}
        //                         else{return(null)}    
                                
        //                     }),
        //                     // borderColor: 'rgb(53, 162, 235)',
        //                     // backgroundColor:'rgb(53, 162, 235)',
        //                     yAxisID:'y2'
        //                 }]
        //         }
        //     }
        // )
        }
        setvvtemp(true)
        console.log(observation)
    },[observation])
    useEffect(() => {
        // communication.map((commres) => {
        //     console.log(commres.resource.meta.lastUpdated)
        // })
        // console.log(communication)
        var x: { date: String; time: String; alarm: String; priority: String; }[] = []
        
        communication.map((commres) => 
             {
                if(commres.resource.extension){
                    
                    commres.resource.extension[0].valueCodeableConcept.coding.map((val,index) => 
                    {  
                        const lastUpdatedDate = new Date(commres.resource.meta.lastUpdated);


                       x.push({
                           date: (lastUpdatedDate.toLocaleDateString()),
                           time: (lastUpdatedDate.toLocaleTimeString()),
                           alarm: String(val.display),
                           priority: String(commres.resource.extension[1].valueCodeableConcept.coding[index].display)
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
                                if (newObs?.component[0]?.valueQuantity.unit==1 || newObs?.component[0]?.valueQuantity.unit=="BABY") {
                                    return 'BABY';
                                } else if (newObs?.component[0]?.valueQuantity.unit==2 || newObs?.component[0]?.valueQuantity.unit=="PREWARM"){
                                    return 'PREWARM';
                                } else if (newObs?.component[0]?.valueQuantity.unit==3 || newObs?.component[0]?.valueQuantity.unit=="MANUAL"){
                                    return 'MANUAL';
                                } else if (newObs?.component[0]?.valueQuantity.unit==3 || newObs?.component[0]?.valueQuantity.unit=="AIR"){
                                    return 'AIR';
                                } else if (newObs?.component[0]?.valueQuantity.unit==3 || newObs?.component[0]?.valueQuantity.unit=="BUBBLE CPAP"){
                                    return 'BUBBLE CPAP'
                                } else if (newObs?.component[0]?.valueQuantity.unit==3 || newObs?.component[0]?.valueQuantity.unit=="FLOW CPAP 1"){
                                    return 'FLOW CPAP 1'
                                } else if (newObs?.component[0]?.valueQuantity.unit==3 || newObs?.component[0]?.valueQuantity.unit=="BUBBLE CPAP 2"){
                                    return 'FLOW CPAP 2'
                                } else if (newObs?.component[0]?.valueQuantity.unit==3 || newObs?.component[0]?.valueQuantity.unit=="PULSE OXIMETER"){
                                    return 'PULSE OXIMETER'
                                } else if (newObs?.component[0]?.valueQuantity.unit==3 || newObs?.component[0]?.valueQuantity.unit=="HIGH FLOW"){
                                    return 'HIGH FLOW'
                                }

                                else{
                                    return 'NOT FOUND';
                                }
                            }
                            else{
                                return "Device Not Active"
                            }
                            
                        })()}
                    </Typography>
                </Stack>
                {newData && newObs?.component.map((_obs: any,index: number) => {
                    if((index<4 || index>8) && index!=0){
                        return (
                            <Stack alignItems={'center'} spacing={'10px'}>
                                <Typography variant="h6" >
                                    {newObs?.component[index]?.code.text}
                                </Typography>
                                <div style={{ display: 'flex',marginLeft:'auto', marginRight:'auto', paddingRight:'10px' }}>
                                <Typography variant='h3'>
                                {Math.round((newObs?.component[index]?.valueQuantity?.value + Number.EPSILON) * 100) / 100}&nbsp;
                                </Typography>
                                <Typography variant='h5'>
                                {newObs?.component[index]?.valueQuantity?.unit}
                                </Typography>
                            </div>
                                {/* <Typography variant="h3">
                                {Math.round((newData && newObs?.component[index]?.valueQuantity.value + Number.EPSILON) * 100) / 100}{newObs?.component[index]?.valueQuantity.unit}
                                </Typography> */}
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
                    var temp = false
                    if(newObs?.component[index]?.code.text=="SIQ"){
                        temp = true
                    }
                    if(index<9 && index>3){
                    return (
                        <Stack alignItems={'center'} spacing={'10px'}>
                            <Typography variant="h6" >
                                {newData && newObs?.component[index]?.code.text}
                            </Typography>
                            {temp && <Box width={'130px'} height={'45px'} sx={{backgroundColor:'white', borderRadius:'10px'}}>
                            <Box width={String(newObs?.component[index]?.valueQuantity?.value)+'%'} height={'100%'} sx={{backgroundColor:'blue', borderRadius:'10px'}}></Box>
                                    </Box>}
                            {!temp && <Typography variant="h3">
                                {/* {newData && newObs?.component[index]?.valueQuantity?.value}{newObs?.component[index]?.valueQuantity?.unit} */}
                                <div style={{ display: 'flex',marginLeft:'auto', marginRight:'auto', paddingRight:'10px' }}>
                                <Typography variant='h3'>
                                {Math.round((newObs?.component[index]?.valueQuantity?.value + Number.EPSILON) * 100) / 100}&nbsp;
                                </Typography>
                                <Typography variant='h5'>
                                {newObs?.component[index]?.valueQuantity?.unit}
                                </Typography>
                            </div>
                            </Typography>}
                            
                        </Stack>
                    )}
                    temp = false
                })}
                <Divider sx={{marginTop:'20px'}} />
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
            {/* {newData && newObs?.component.map((_obs: any, index: number) => {
                    if(index>10){
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
                })} */}
            </Box>
            
            </Box>:<Box
            sx={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center"}}>
                    <Typography variant='h2' sx={{fontWeight:'bold'}}>{newData && 'Oximeter Not connected'}{!newData && ''}</Typography></Box>}
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
              }} columns={cols} data={rows} 
              positionToolbarAlertBanner="bottom"    
renderTopToolbarCustomActions={({ table }) => (
    <Box
      sx={{ display: 'flex', gap: '1rem', p: '0.5rem', flexWrap: 'wrap' }} 
    >
      <Button
        color="primary"
        //export all data that is currently in the table (ignore pagination, sorting, filtering, etc.)
        onClick={handleExportData}
        startIcon={<FileDownloadIcon />}
        variant="contained"
      >
        Export All Data
      </Button>
    </Box>
  )}>

              </MaterialReactTable>




        </Stack>
    </Paper>
    )
}
