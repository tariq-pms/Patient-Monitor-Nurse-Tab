import { Box, Stack, Divider, ToggleButtonGroup, ToggleButton } from '@mui/material'
import React, { FC, useEffect, useMemo, useRef, useState } from 'react'
import { ChartOptions, LegendItem, Plugin } from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { Chart, CategoryScale } from 'chart.js';

Chart.register(CategoryScale);

export interface DeviceDetails {
 
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
export const Trends1: FC<DeviceDetails> = (props): JSX.Element => {
    const [selectedLegends, setSelectedLegends] = useState<any>([])
    const chartRef1 = useRef<any | null>(null);

    const [graphData, setGraphData] = useState(false)
    
    const [observation, setObservation] = useState( [])
   const [timeFrame, setTimeFrame] = useState(-1)
    const [times, setTimes] = useState<Array<any>>([])
    const [dataset, setDataSet] = useState([[{}]])
    const [loading, setLoading] = useState(false);
    const heaterYaxis = {
        "%": "y",
        "C": "y1",
        "C°": "y1"
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

    const [temperatureData, setTemperatureData] = useState<TemperatureData>({
        labels: [], // Initially, there are no labels
        datasets: [], // Initially, there are no datasets
    })
  
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
        setGraphData(true)
        setrendergraph(!rendergraph)
    },[times])
    const labels = times;
 
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
    

    function subtractDaysFromDate(dateString: string, days: number) {
        const date = new Date(dateString);
        date.setDate(date.getDate() - days);
        console.log(date)
        return date.toISOString();
    }

    useEffect(() => {
        let url = []
        let currentNewDate = new Date()
        let currentdate = currentNewDate.getDate().toString().padStart(2, '0')
        let currentmonth = (Number(currentNewDate.getMonth()) + 1).toString().padStart(2, '0')
        let currentyear = currentNewDate.getFullYear()
        let currentDate = currentyear + "-" + currentmonth + "-" + currentdate
        console.log('current date', currentDate)
    
        if (timeFrame != -1) {
            setLoading(true);
    
            if (timeFrame == 0) {
                let prevdate = "";
                url.push(`${import.meta.env.VITE_FHIRAPI_URL as string}/Observation/190a20ad4a2-f989b337-d96f-4ce0-88ac-86976086122c/_history?_count=144`)
                console.log('Fetching data for timeFrame 0, URL:', url[0]);
    
                Promise.all(
                    url.map((query) => {
                        console.log('Making fetch request to:', query);
                        return fetch(query, {
                            credentials: "omit",
                            method: "GET",
                            headers: {
                                Authorization: "Basic " + btoa("fhiruser:change-password"),
                            },
                        })
                        .then((response) => response.json())
                        .then((data) => {
                            console.log('Response data:', data);
    
                            if (data.total === 0) {
                                console.log('No data found');
                                return null;
                            }
                            if (((data.entry[0].resource.meta.lastUpdated).toString()) == prevdate) {
                                console.log('No new data since last fetch');
                                return null;
                            }
                            prevdate = (data.entry[0].resource.meta.lastUpdated).toString();
                            console.log('Data entry:', data.entry);
                            return (data.entry.map((val: any) => (val)));
                        })
                    })
                )
                .then((results) => {
                    const dats = results.filter((entry) => entry !== null)
                        .reduce((accumulator, currentvalue) => accumulator.concat(currentvalue), []);
                    console.log('Processed data:', dats);
                    setObservation(dats.reverse());
                    setLoading(false);
                });
            } else {
                console.log('Fetching data for timeFrame other than 0');
                getDataForGraph(1, currentDate + "T00:00:00Z").then((result: any) => {
                    console.log('Fetched graph data:', result);
                    setObservation(result.reverse());
                    setLoading(false);
                });
            }
        }
    }, [timeFrame]);
    
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
                  
                    
                })
                setDataSet([zeroth, first, second, third])
                var fd = new Date(obs.resource.effectiveDateTime.toString())
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
                 
                  
                })
                setDataSet([zeroth, first, second, third])
                var fd = new Date(obs.resource.effectiveDateTime.toString())
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
                    new Date(obs?.resource?.effectiveDateTime.toString()).toLocaleTimeString())
                }))
        }
            // setLoading(false)
    },[observation])

    useEffect(() => {console.log(selectedLegends)},[selectedLegends])
   
    const graph = useMemo(() => {
        console.log("New device details props: ",props);
      
            return (
                <Stack width={'100%'} height={'100%'} direction={'row'} justifyContent={'center'} divider={
                    <Divider orientation='vertical' flexItem sx={{marginLeft:'1%',backgroundColor:'#505050', color:'#505050'}}/>
                }>
                    <Stack height={'100%'} width={'95%'} spacing={'5%'} sx={{backgroundColor:'transparent'}}  marginRight={'auto'} marginLeft={'2%'} marginTop={'2%'}>
                       
                        <Line ref={chartRef1} options={temperatureOption as ChartOptions<'line'>} data={temperatureData} height={"100%"} plugins={[temperatureLegendPlugin]} ></Line>
                        <div id="legend-container"></div>
                        <Divider />
                    </Stack>
                 

                </Stack>
            );
     
     
    },[rendergraph,loading])
    
    return (
        <React.Fragment>
            <Box   
            >
                 <div style={{padding:'2px'}}>
                                {   
                                        graphData && (<>
                                        <Stack direction={'row'} width={"100%"} justifyContent={'space-between'}>
                                       
                                        <Stack width={'100%'} direction={{ xs: 'row', sm: 'row', md:'row', lg:'column' }} marginBottom={{ xs: '30px', sm: '30px', md:'20px', lg:'20px' }} sx={{padding:'20px'}}>

                                        <Stack width={'100%'} direction={'row-reverse'}  textAlign={'start'}  >
                                      
                                        <ToggleButtonGroup
    value={timeFrame}
    exclusive
    size="small"
    sx={{
        marginLeft: 'auto',
        marginRight: '1%',
        backgroundColor: `${'#CACACA'} !important`,
        '& .MuiToggleButton-root': { color:  'black' },
        '& .Mui-selected': {
            backgroundColor: `${'#000000'} !important`,
           
            color: `${ '#FFFFFF'} !important`,
        },
    }}
> <ToggleButton value={0} key="left" sx={{height:'30px', width:'50px',  fontSize:'10px', textTransform:'capitalize'}} onClick={() => {setTimeFrame(0)}}>
                                                24 Hr
                                                </ToggleButton>,
                                                <ToggleButton value={1} key="center" sx={{height:'30px', width:'55px', fontSize:'10px', textTransform:'capitalize'}} onClick={() => {setTimeFrame(1)}}>
                                                    1 Week
                                                </ToggleButton>,
                                                <ToggleButton value={2} key="right" sx={{height:'30px', width:'58px', fontSize:'10px', textTransform:'capitalize'}} onClick={() => {setTimeFrame(2)}}>
                                                    2 Weeks
                                                </ToggleButton>
                                                
                                            </ToggleButtonGroup>
                                             
                                        </Stack></Stack>
                                      
                                        </Stack>
                                      
                                            {graph}
                                        
                                        
                                        </>)
                                    }
                                    {
                                        !graphData && (<div></div>)
                                    } 
                                    <Divider sx={{marginTop:'40px', backgroundColor:'white', color:'white'}} />           
                                </div></Box>

        </React.Fragment>
    )
}

