import React, { FC, useEffect, useMemo, useState } from 'react';
import { Backdrop, Box, Button, CircularProgress, Divider, Paper, Stack, ToggleButton, ToggleButtonGroup, Typography, } from '@mui/material';
import { useLocation } from "react-router-dom";
import { MaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
import zoomPlugin from 'chartjs-plugin-zoom'
import FileDownloadIcon from '@mui/icons-material/FileDownload';

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
import { Table } from '../components/Table';



export type AlarmTable = {
    date: string;
    time: string;
    alarm: string;
    priority: string;
}
export const DetailedDevice: FC = () => {
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
    const [requiredForTimer, setRequiredForTimer] = useState(false)
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
    const [timeFrame, setTimeFrame] = useState(5)
    const {key, device_id, patient, device_resource_id, observation_resource, communication_resource} = useLocation().state
    // setNewObs(observation_resource)
   
    const [dataset, setDataSet] = useState([[{}]])
    const [graphData, setGraphData] = useState(false)
    const [times, setTimes] = useState<Array<any>>([])
    const columns = useMemo<MRT_ColumnDef<AlarmTable>[]>(
        () => [
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
                id: "alarm",
                Cell: ({ cell,row }) => (
                    <Box
                        display={'inline-block'}
                        paddingTop={"5px"}
                        paddingBottom={"5px"}
                        paddingLeft={'10px'}
                        paddingRight={'10px'}
                        justifyContent={'center'}
                        textAlign={'center'}
                        color={'black'}
                        sx={() => ({
                            borderRadius: "5px",
                            backgroundColor:
                            row.original.priority == "Low Priority"
                            ? "#FFEB3B"
                            : row.original.priority == "Medium Priority"
                            ? "#00BCD4  " : "#F44336 "
                        })}
                    >
                        {cell.getValue<string>()}
                    </Box>
                ),
                
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
                            ? "#FFEB3B"
                            : cell.getValue<string>() == "Medium Priority"
                            ? "#00BCD4  " : "#F44336 "
                        })}
                    >
                        {cell.getValue<string>()}
                    </Box>
                ),
            }
        ]
    )
        useEffect(() => {
            if(newObs.component){
                setNewData(true)
                setRequiredForTimer(!requiredForTimer)
            }
        },[newObs])
    const [rows, setRows] = useState([{
        date: String,
        time: String,
        alarm: String,
        priority: String
    }])

    useEffect(() => {
        let timer: number | undefined;
        
        if(newData){
            timer = setInterval(() => {setNewData(false);clearInterval(timer)},7000)
        }
        return () => {
            clearInterval(timer); 
        };
    }, [requiredForTimer])
    useEffect(() => {

        
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



        //   if (recieved_data.location.split("/")[0] == "Observation" && recieved_data.location.split("/")[1] == observation_resource.id){
        //       // console.log(data)
        //     // if (obsArray.includes(recieved_data.resourceId)){
        //       fetch(`http://13.126.5.10:9444/fhir-server/api/v4/${recieved_data.location}`, {
        //       credentials: "omit",
        //       headers: {
        //         Authorization: "Basic "+ btoa("fhiruser:change-password"),
        //         },
        //       })
        //       .then((response) => response.json())
        //       .then((data) => {
        //         // console.log(temp)
        //         // console.log(temp)
        //         setNewObs(data)
                
            
        //       })
        //     // }
        //   }



          if (recieved_data.location.split("/")[0] == "Communication" && recieved_data.location.split("/")[1] == communication_resource.id){
            
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
        //         date: String,
        // time: String,
        // alarm: String,
        // priority: String
        let x: { date: string; time: string; alarm: string; priority: string; }[] = [];
            if(data.extension){
                        
                data.extension[0].valueCodeableConcept.coding.map((val,index) => 
                {  
                    const lastUpdatedDate = new Date(data.meta.lastUpdated);


                x.push({
                    date: (lastUpdatedDate.toLocaleDateString()),
                    time: (lastUpdatedDate.toLocaleTimeString()),
                    alarm: String(val.display),
                    priority: String(data.extension[1].valueCodeableConcept.coding[index].display)
                })
                }
                )
                x.map((val) => {
                    setRows((rows) => [...rows])
                })
                // setRows((rows) => [...rows,x])
            }
                
            
              })
          }
          
          // console.log(data.data);
        };
        socket.onerror = () => {console.log(`Error in socket connection`)}
      }, [])


    useEffect(() => {
        console.log(observation_resource.id)
        let url = []
        let currentNewDate = new Date()
        let currentdate = currentNewDate.getDate().toString().padStart(2,'0')
        let currentmonth = (Number(currentNewDate.getMonth())+1).toString().padStart(2,'0')
        let currentyear = currentNewDate.getFullYear()
        let currentDate = currentyear+"-"+currentmonth+"-"+currentdate
        if(timeFrame==0){
            url.push(`http://13.126.5.10:9444/fhir-server/api/v4/Observation/${observation_resource?.id}/_history?_since=${currentDate}T00:00:00Z`)
        }
        else if(timeFrame==1){
            // let weekNewDate = new Date(currentNewDate.setDate(currentNewDate.getDate() - 7));
            // let weekdate = weekNewDate.getUTCDate().toString().padStart(2,'0')
            // let weekmonth = ((weekNewDate.getMonth())+1).toString().padStart(2,'0')
            // let weekyear = weekNewDate.getUTCFullYear()
            for (let incrementDate = 0; incrementDate < 7 ; incrementDate++) {
                let weekNewDate = new Date(currentNewDate.setDate(currentNewDate.getDate() - incrementDate));
                let weekdate = weekNewDate.getUTCDate().toString().padStart(2,'0')
                let weekmonth = (Number(weekNewDate.getMonth())+1).toString().padStart(2,'0')
                let weekyear = weekNewDate.getUTCFullYear()
                let weekDate = weekyear+"-"+weekmonth+"-"+weekdate
                for (let index2 = 0; index2 < 24; index2++) {
                    url.push(`http://13.126.5.10:9444/fhir-server/api/v4/Observation/${observation_resource?.id}/_history?_count=1&_since=${weekDate}T${index2.toString().padStart(2,'0')}:00:00Z`)
                }
                
                                
            }
        }
        else if(timeFrame==2){
            let monthNewDate = new Date(currentNewDate.setMonth(currentNewDate.getMonth() - 1));
            let monthdate = monthNewDate.getUTCDate().toString().padStart(2,'0')
            let monthmonth = (Number(monthNewDate.getMonth())+1).toString().padStart(2,'0')
            let monthyear = monthNewDate.getUTCFullYear()
            for (let index = 1; index < 30; index++) {
                let monthDate = monthyear+"-"+monthmonth+"-"+index.toString().padStart(2,'0')
                url.push(`http://13.126.5.10:9444/fhir-server/api/v4/Observation/${observation_resource?.id}/_history?_count=1&_since=${monthDate}T00:00:00Z`)
            }
        }
        let temparr: any[] = []
        url.map((query) => {
            fetch(query, {
                credentials: "omit",
                method: "GET",
                headers: {
                    Authorization: "Basic "+ btoa("fhiruser:change-password"),
                },
            })
            .then((response) => response.json())
            .then((data) => {
                if(data.total==0){return}
                var totaldata = data.total 
                let page = 1
                if(totaldata>10000){
                    totaldata = 10000
                }
                console.log(data.entry)
                temparr.push(data.entry.resource)
                // var totaldata = data.total
                // let page = 1
                // if(totaldata>10000){
                //     totaldata = 10000
                // }
                // while(totaldata>=100){
                //     fetch(`http://13.126.5.10:9444/fhir-server/api/v4/Observation/${observation_resource.id}/_history?_page=${page}&_count=100`,{
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
                // fetch(`http://13.126.5.10:9444/fhir-server/api/v4/Observation/${observation_resource.id}/_history?_page=${page}&_count=100`,{
                //     credentials: "omit",
                //     method: "GET",
                //     headers: {
                //         Authorization: "Basic "+ btoa("fhiruser:change-password"),
                //     },
                // })
                // .then((response) => response.json())
                // .then((data) => {
                //     for(let i=0;i<data.entry.length;i++){
                //         temparr.push(data.entry[i])
                //     }
                //     console.log(temparr)
                // })
            })
            
        })
        console.log(temparr)
              
        //   })
    },[timeFrame])
//     useEffect(() => {        setObservation(temparr)
// },[neededForGraph])
    const [vvtemp, setvvtemp] = useState(false)
    const temperatureOption = {
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
        },
    };
    const weightOption = {
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
          y: {     //g
            type: 'linear' as const,
            display: true,
            position: 'left' as const,
            grid: {
                drawOnChartArea: false,
            },
            title: {
                display: true,
                text: "Grams (g)"
            }
            },
        },
    };
    const pulseoximeterOption = {
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
                text: "Beats Per Minuite (BPM)"
            }
          },
        //   y2: {     //g
        //     type: 'linear' as const,
        //     display: true,
        //     position: 'right' as const,
        //     grid: {
        //       drawOnChartArea: false,
        //     },
        //     title: {
        //         display: true,
        //         text: "Grams (g)"
        //     }
        //   },
        //   y3: {     // bpm
        //     type: 'linear' as const,
        //     display: true,
        //     position: 'left' as const,
        //     grid: {
        //       drawOnChartArea: false,
        //     },
        //     title: {
        //         display: true,
        //         text: "Beats Per Minuite (bpm)"
        //     }
        //   }
        },
    };
    // const humidityOption = {
    //     tension: 0.3,
    //     responsive: true,
    //     // legend: {
    //     //     position: 'bottom'
    //     // },
    //     interaction: {
    //       mode: 'index' as const,
    //       intersect: false,
    //     },
    //     stacked: false,
    //     plugins: {
    //       colors: {
    //         forceOverride: true
    //       },
    //       zoom: {
    //         pan: {
    //             enabled: true,
    //             mode: 'x'
    //         },
    //         zoom: {
    //             pinch: {
    //                 enabled: true       // Enable pinch zooming
    //             },
    //             wheel: {
    //                 enabled: true       // Enable wheel zooming
    //             },
    //             mode: 'x',
    //         }
    //     }
    //     },
    //     scales: {
    //       y: {     //g
    //         type: 'linear' as const,
    //         display: true,
    //         position: 'left' as const,
    //         grid: {
    //             drawOnChartArea: false,
    //         },
    //         title: {
    //             display: true,
    //             text: "Percentage (%)"
    //         }
    //         },
    //     },
    // };
    const heaterYaxis = {
    "%": "y",
    "C": "y1",
    // "g": "y2",
    // "BPM": "y3"
    // Add more mappings as needed
    };
    const pulseoximeterYaxis = {
        "%": "y",
        "BPM": "y1"
    }
    
      
    useEffect(() => {
    //    console.log(Array.isArray(observation))
        if(observation[1]?.resource?.component?.length>1){
            
            setTimes(observation.map((obs) => {
                let zeroth = []
                let first = []
                let second = [{
                    label: "",
                    data: [] as string[],
                    yAxisID: "y"
                }]
                let third = [{
                    label: "",
                    data: [] as string[],
                    yAxisID: "y"
                }]

                observation[1].resource.component.map((data, index) => {
                    if(data.valueQuantity.unit.toString() == "C" || data.valueQuantity.unit.toString() == "C°" || data.code.text.toString()=="Set Heater" || data.code.text.toString()=="Heater Level"){
                        let unit = data.valueQuantity.unit.toString();
                        console.log("********************")
                        console.log(unit)
                        zeroth.push({
                            label: data.code.text.toString(),
                            data: observation.map((data2, index2) => {
                                return (
                                    data2?.resource?.component[index]?.valueQuantity?.value.toString()
                                )
                            }),
                            yAxisID: heaterYaxis[unit] || "y"
                        })
                    }
                    else if(data.code.text.toString() == "Pulse Rate" || data.code.text.toString() == "SpO2"){
                        let unit2 = data.valueQuantity.unit.toString();
                        first.push({
                            label: data.code.text.toString(),
                            data: observation.map((data2, index2) => {
                                return (
                                    data2?.resource?.component[index]?.valueQuantity?.value.toString()
                                )
                            }),
                            yAxisID: pulseoximeterYaxis[unit2] || "y"
                        })
                    }
                    else if(data.valueQuantity.unit.toString() == "g"){
                        second.push({
                            label: data.code.text.toString(),
                            data: observation.map((data2, index2) => {
                                return (
                                    data2?.resource?.component[index]?.valueQuantity?.value.toString()
                                )
                            }),
                            yAxisID: "y"
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
                return(
                    new Date(obs.resource.meta.lastUpdated).toLocaleTimeString())
                }))

            //     observation[1].resource.component.map((data, index) => {
            //     return {
            //     label: String(observation[1]?.resource?.component[index]?.code?.text),
            //     data: observation.map((obs) => {
            //         if(obs?.resource?.component){return(obs.resource?.component[index]?.valueQuantity.value)}
            //         else{return(null)}    
                    
            //     }),
            //     // borderColor: 'rgb(255, 99, 132)',
            //     // backgroundColor:'rgb(255, 99, 132)',
            //     yAxisID: yAxisIDMap[String(observation[1]?.resource?.component[index]?.valueQuantity.unit)] || 'y3'
            // }})
            
            


        }
        setvvtemp(true)
        // console.log(observation)
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
        setRows(x)
        // setRows(
        // console.log(communication)
        // )
    },[communication])
    const [temperatureData, setTemperatureData] = useState({})
    const [weightData, setWeightData] = useState({})
    const [pulseoximeterData, setPulseoximeterData] = useState({})
    // const [humidityData, setHumidityData] = useState({})
    
    useEffect(() => {
        // console.log(labels)
        // console.log(times)
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
            if(dataset[2]?.length > 1) {
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
        // setHumidityData(() => {
        //     if(dataset[3]?.length > 1) {
        //         return (
        //             {
        //                 labels,
        //                 datasets: dataset[3]
        //             }
        //         )
        //     }
        //     else {
        //         return (
        //             {
        //                 labels: [],
        //                 datasets: []
        //             }
        //         )
        //     }
        // })
        setGraphData(true)

    },[times])
    const labels = times;








    return (
    <Paper sx={{backgroundColor:'transparent', width:'95%', margin: '0 auto', marginTop:'10px',}}>
        <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={loading}
        ><CircularProgress color="inherit" /></Backdrop>
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
                                return (newObs?.component[0]?.valueQuantity.unit==1 || newObs?.component[0]?.valueQuantity.unit)
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
                    graphData && (<>
                    <Box sx={{ display: 'flex', gap: '1rem', p: '0.5rem', flexWrap: 'wrap', marginLeft:"1%" }} >
                        <Button color="primary" startIcon={<FileDownloadIcon />} variant="contained">
                            Export
                        </Button>
                    </Box>
                    <ToggleButtonGroup value={timeFrame} exclusive size="small" sx={{marginLeft:'auto', marginRight:'2%'}}>
                        <ToggleButton value={0} key="left" sx={{backgroundColor:'#2BA0E0'}} onClick={() => {setTimeFrame(0)}}>
                            Day
                        </ToggleButton>,
                        <ToggleButton value={1} key="center" sx={{backgroundColor:'#2BA0E0'}} onClick={() => {setTimeFrame(1)}}>
                            Week
                        </ToggleButton>,
                        <ToggleButton value={2} key="right" sx={{backgroundColor:'#2BA0E0'}} onClick={() => {setTimeFrame(2)}}>
                            Month
                        </ToggleButton>,
                    </ToggleButtonGroup>
                        {(() => {
                            if(observation_resource?.identifier[0]?.value?.toString()=="PMSCIC"){
                                return (
                                    <Stack height={'100%'} width={'100%'}>
                                        
                                            <Line options={temperatureOption} data={temperatureData} height={"90%"}></Line>
                                        <Stack direction={'row'} width={'100%'} height={"50%"} justifyContent={'space-between'}>
                                            <div style={{width:'45%'}}>
                                                <Line options={pulseoximeterOption} data={pulseoximeterData} height={'100%'}></Line>
                                            </div>
                                            <div style={{width:'45%'}}>
                                                <Line options={weightOption} data={weightData} height={'100%'} ></Line>
                                            </div>
                                        </Stack>
                                    </Stack>
                                )
                            }
                            if(observation_resource?.identifier[0]?.value?.toString()=="PMSinc"){
                                return (
                                    <Stack height={'100%'} width={'100%'}>
                                        <Line options={temperatureOption} data={temperatureData} height={"60%"}></Line>
                                        <Stack direction={'row'} width={'100%'} height={"50%"} justifyContent={'space-between'}>
                                            <div style={{width:'48%'}}>
                                                <Line options={pulseoximeterOption} data={pulseoximeterData} height={'100%'}></Line>
                                            </div>
                                            <div style={{width:'48%'}}>
                                                <Line options={weightOption} data={weightData} height={'100%'} ></Line>
                                            </div>
                                        </Stack>
                                        {/* <Line options={humidityOption} data={humidityData} height={"60%"}></Line> */}
                                    </Stack>
                                )
                            }
                            return <div></div>
                        })()}
                       
                    
                        {/* <Button >Select all</Button> */}
                        
                    </>)
                }
                {
                    !graphData && (<div></div>)
                }
            
            </div>
            <Divider sx={{marginTop:'20px', marginBottom:'20px'}} />
            <Table rows={rows} columns={columns}/>
        </Stack>
    </Paper>
    )
}
