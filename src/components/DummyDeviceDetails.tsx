import React, { useEffect, useMemo, useRef, useState } from 'react';

import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ExpandMoreRounded } from '@mui/icons-material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, Stack, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from '@mui/material'
import { ChartOptions, LegendItem, Plugin } from "chart.js";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { Line } from 'react-chartjs-2';
import { CustomOkButton } from './CustomOkButton';
import { CustomNoButton } from './CustomNoButton';
import { MRT_ColumnDef } from 'material-react-table';
import { Table } from './Table';

export const DummyDeviceDetails = (props: {
    observation_resource: any;
    newData: any; isOpen: boolean ; handleCloseDialog: Function
}) => {
    const [varq, setvarq] = useState(false)
    const [, setIsOpen] = useState(props.isOpen);
    const chartRef1 = useRef<any | null>(null);
    const [S_and_D, setS_and_D] = useState(0)
    type TemperatureData = {
        labels: any[];
        datasets: any[]; 
        };
    const chartRef2 = useRef<any | null>(null);
    const chartRef3 = useRef<any | null>(null);
    const [timeFrame, setTimeFrame] = useState(5)
    const [downloadConfirmation, setDownloadConfirmation] = useState(false)
    const [selectedLegends, setSelectedLegends] = useState<any>([])
    
      useEffect(() => {
          setIsOpen(props.isOpen);
        }, [props.isOpen]);
      const [tableVisisble, setTableVisible] = useState(false)
      useEffect(() => {props.handleCloseDialog()},[varq])
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
    }
   
    const [temperatureData] = useState<TemperatureData>({
        labels: ['27/12/23','26/12/23','25/12/23','24/12/23','23/12/23','22/12/23','21/12/23'], 
        datasets: [
            {
              label: 'Set Skin Temperature',
              data: [10, 15, 13, 18, 12, 20, 11],
              borderColor: 'rgba(75,192,192,1)',
              borderWidth: 2,
              fill: true,
              yaxisID: "y1"
            },
            {
                label: 'Measured Skin Temperature',
                data: [9, 14, 14, 19, 11, 21, 12], 
                borderColor: 'red',
                borderWidth: 2,
                fill: true,
                yaxisID: "y1"
            },
            {
                label: 'Heater Output',
                data: [89, 74, 64, 59, 41, 31, 22], 
                borderColor: 'grey',
                borderWidth: 2,
                fill: true,
                yaxisID: "y1"
            },

          ],
    })
    const [weightData] = useState<TemperatureData>({
        labels: ['27/12/23','26/12/23','25/12/23','24/12/23','23/12/23','22/12/23','21/12/23'], 
        datasets: [
            {
              label: 'Weight',
              data: [10, 15, 13, 18, 12, 20, 11],
              borderColor: 'rgba(75,192,192,1)',
              borderWidth: 2,
              fill: true,
              yaxisID: "y"
            }
          ],
    })
    const [pulseoximeterData] = useState<TemperatureData>({
        labels: ['27/12/23','26/12/23','25/12/23','24/12/23','23/12/23','22/12/23','21/12/23'], 
        datasets: [
            {
              label: 'Spo2',
              data: [10, 15, 13, 18, 12, 20, 11],
              borderColor: 'yellow',
              borderWidth: 2,
              fill: true,
              yaxisID: "y"
            },
            {
                label: 'Pulse Rate',
                data: [9, 14, 14, 19, 11, 21, 12], 
                borderColor: 'green',
                borderWidth: 2,
                fill: true,
                yaxisID: "y1"
              },
          ],
    })
      const graphDataDisplay =  useMemo(() =>{
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
                    }
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
                    display: true,
                    text: "Percentage (%)"
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
                    display: true,
                    text: "Temperature (C°)"
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
                    display: true,
                    text: "Grams (g)"
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
                        autoSkip: true,
                        maxTicksLimit: 10
                    }
                },
              y: {      // Celcius
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
            },
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
                    textContainer.style.color = 'white';
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
        }
        return (
            <div style={{marginTop:'25px'}}>

                <Stack direction={'row'} width={"100%"} justifyContent={'space-between'}>
                <Stack width={'100%'} direction={{ xs: 'row', sm: 'row', md:'row', lg:'column' }} marginBottom={{ xs: '30px', sm: '30px', md:'20px', lg:'20px' }}>
                {/* <Typography variant='h5' paddingLeft={'2%'}>Trends</Typography> */}
                <Stack width={'100%'} direction={'row'} textAlign={'center'}  >
                    
                    <ToggleButtonGroup value={timeFrame} exclusive size="small" sx={{marginLeft:'auto', marginRight:'1%'}}>
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
                    <ToggleButtonGroup value={S_and_D} exclusive size="small" sx={{marginRight:'1%'}}>
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
                        
                        <Box sx={{minWidth:'90px', minHeight:'45px'}} ><CustomOkButton text="Confirm"></CustomOkButton></Box>
                        </Stack>
                        
                    </DialogActions>
                </Dialog>
                

                </Stack>
                <Stack width={'100%'} height={'100%'} direction={'row'} justifyContent={'center'} divider={
                    <Divider orientation='vertical' flexItem sx={{marginLeft:'1%',backgroundColor:'#505050', color:'#505050'}}/>
                }>
                    <Stack height={'100%'} width={'95%'} spacing={'5%'} marginRight={'auto'} marginLeft={'2%'} marginTop={'2%'}>
                        {/* <MyChart height={'100%'} forwardedRef={chartRef1} options={temperatureOption as ChartOptions} data={temperatureData} plugins={temperatureLegendPlugin} /> */}
                        <Line ref={chartRef1} options={temperatureOption as ChartOptions<'line'>} data={temperatureData} height={"100%"} plugins={[temperatureLegendPlugin]} ></Line>
                        <div id="legend-container"></div>
                        
                        
                            <Divider />
                            <Line ref={chartRef2} options={pulseoximeterOption as ChartOptions<'line'>} data={pulseoximeterData} height={'100%'} plugins={[temperatureLegendPlugin]}></Line>
                        <div id="legend-container2"></div>
                        <Divider />
                        {/* <MyChart height={'100%'} forwardedRef={chartRef3} options={weightOption as ChartOptions} data={weightData} plugins={temperatureLegendPlugin} />                                             */}
                        <Line ref={chartRef3} options={weightOption as ChartOptions<'line'>} data={weightData} height={'100%'} plugins={[temperatureLegendPlugin]}></Line>
                        <div id="legend-container3"></div>
                        {/* <MyChart height={'100%'} forwardedRef={chartRef2} options={pulseoximeterOption as ChartOptions} data={pulseoximeterData} plugins={temperatureLegendPlugin} /> */}
                        
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


            </div>
        )
    },[])
    const [rows] = useState<Array<{ date: string; time: string; alarm: string[][]; device: string }>>([]);

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
                accessorKey: "device",
                header: "Device",
                id: "device", 
            },
            {
                accessorKey: "alarm",
                header: "Alarm",
                id: "alarm",
                Cell: ({ cell }) => {
                    if(cell.getValue()!=undefined ){
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
                    }
                    
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
                Cell: ({ cell }) => {
                    if(cell.getValue()!=undefined){
                        return(
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
                        )
                    }
                    
                },
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

  return (
    <React.Fragment>
    <Dialog
        open={props.isOpen}
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
            md: '50%',
            lg: '50%',
        },maxWidth:{
            xs: '90%',
            sm: '90%',
            md: '50%',
            lg: '50%',
        },minHeight:'90%',borderRadius:'25px', boxShadow: `0px 0px 40px 1px #404040`, border:'0.4px solid #505050', backgroundImage:'linear-gradient(to bottom, #111522, #111522, #111522)' }}}
        >
            <DialogTitle
                sx={{
                    borderBottom:'1px solid white'
                }}
            >
                {/* <IconButton sx={{marginLeft:'96%'}}><CloseRounded/></IconButton> */}
                <Stack direction={'row'} width={'102%'} >
                    <Stack direction={'row'} width={'100%'} sx={{justifyContent:'space-between', marginLeft:'auto', marginRight:'auto'}}>
                    <Typography variant="h6" fontWeight={'regular'} >
                        Jessica Adams | 123456
                    
                    </Typography>
                    <Typography variant="h6">
                        CIC | FF:FF:FF:FF
                    </Typography>
                    
                    </Stack>
                    <IconButton sx={{width:'45px', marginTop:'-4px', marginLeft:'10px'}} onClick={() => {setvarq(!varq)}}><FontAwesomeIcon style={{padding:'0px', margin:'0px'}} icon={faXmark} /></IconButton>
                </Stack>

                
            </DialogTitle>
            <DialogContent dividers={true} sx={{justifyContent:'center', overflowY: 'scroll'}} >
                <Box justifyContent={'center'} textAlign={'center'} width={'100%'} marginTop={"20px"}>
                    <Stack
                        direction={'row'}
                        divider={
                        <Divider orientation='vertical' flexItem/>
                        }
                        sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: {
                        xs: "2rem",
                        sm: "2rem",
                        md: "4rem",
                        lg: "4rem",
                        xl: "4rem",
                        },
                        mt: {
                        xs: 5,
                        sm: 6,
                        md: 7,
                        lg: 8,
                        },
                        mb: {
                        xs: 5,
                        sm: 6,
                        md: 7,

                        lg: 8,
                        },
                        justifyContent: "center",
                        }}
                    >
                        <Stack alignItems={'center'} spacing={'10px'}>
                            <Typography variant="subtitle1" >
                                Spo2
                            </Typography>
                            <div style={{ display: 'flex',marginLeft:'auto', marginRight:'auto', paddingRight:'10px' }}>
                            <Typography variant='h4'>
                                95&nbsp;
                            </Typography>
                            <Typography variant='h5'>
                                %
                            </Typography>
                            </div>
                        </Stack>

                        <Stack alignItems={'center'} spacing={'10px'}>
                            <Typography variant="subtitle1" >
                            Pulse Rate
                            </Typography>
                            <div style={{ display: 'flex',marginLeft:'auto', marginRight:'auto', paddingRight:'10px' }}>
                            <Typography variant='h4'>
                                120&nbsp;
                            </Typography>
                            <Typography variant='h5'>
                                BPM
                            </Typography>
                            </div>
                        </Stack>

                        <Stack alignItems={'center'} spacing={'10px'}>
                            <Typography variant="subtitle1" >
                                Weight
                            </Typography>
                            <div style={{ display: 'flex',marginLeft:'auto', marginRight:'auto', paddingRight:'10px' }}>
                            <Typography variant='h4'>
                                950&nbsp;
                            </Typography>
                            <Typography variant='h5'>
                                g
                            </Typography>
                            </div>
                        </Stack>

                        <Stack alignItems={'center'} spacing={'10px'}>
                            <Typography variant="subtitle1" >
                            Measured Skin Temp
                            </Typography>
                            <div style={{ display: 'flex',marginLeft:'auto', marginRight:'auto', paddingRight:'10px' }}>
                            <Typography variant='h4'>
                                34&nbsp;
                            </Typography>
                            <Typography variant='h5'>
                            °C
                            </Typography>
                            </div>
                        </Stack>

                        <Stack alignItems={'center'} spacing={'10px'}>
                            <Typography variant="subtitle1" >
                            Set Skin Temp
                            </Typography>
                            <div style={{ display: 'flex',marginLeft:'auto', marginRight:'auto', paddingRight:'10px' }}>
                            <Typography variant='h4'>
                                36&nbsp;
                            </Typography>
                            <Typography variant='h5'>
                            °C
                            </Typography>
                            </div>
                        </Stack>

                        <Stack alignItems={'center'} spacing={'10px'}>
                            <Typography variant="subtitle1" >
                            PI
                            </Typography>
                            <div style={{ display: 'flex',marginLeft:'auto', marginRight:'auto', paddingRight:'10px' }}>
                            <Typography variant='h4'>
                                100&nbsp;
                            </Typography>
                            <Typography variant='h5'>
                                %
                            </Typography>
                            </div>
                        </Stack>

                        <Stack alignItems={'center'} spacing={'10px'}>
                            <Typography variant="subtitle1" >
                                Spo2
                            </Typography>
                            <div style={{ display: 'flex',marginLeft:'auto', marginRight:'auto', paddingRight:'10px' }}>
                            <Typography variant='h4'>
                                95&nbsp;
                            </Typography>
                            <Typography variant='h5'>
                                %
                            </Typography>
                            </div>
                        </Stack>
          
                    </Stack>
                </Box>
                
                {/* <Divider sx={{marginTop:'40px', marginBottom:'20px', backgroundColor:'white', color:'white'}}/>
                <Typography variant='h5' paddingLeft={'2%'}>Connected Devices</Typography>
                <Box marginTop={'3%'} marginLeft={'3%'} display={'flex'} textAlign={'center'} justifyContent={'left'} flexWrap={'wrap'} width={'100%'} gap={'10px'}>
                    <Box borderRadius={'10px'} justifyContent={'center'} textAlign={'center'} boxShadow={`0px 0px 10px 2px #00B1FD`} border={'1px solid #00B1FD'} height={'70px'}>
                        <Typography paddingTop={'10px'} paddingLeft={'10px'} paddingRight={'10px'}>CIC (Warmer)</Typography>
                        <Typography variant="caption" paddingTop={'5px'} paddingLeft={'10px'} paddingRight={'10px'}>FF:FF:FF:FF:FF:FF</Typography>
                    </Box>
                </Box> */}

                <Divider sx={{marginTop:'40px', marginBottom:'20px', backgroundColor:'white', color:'white'}}/>
                            <Typography variant='h5' paddingLeft={'2%'}>Trends</Typography>
                            {graphDataDisplay}
                {/* {props.observation_resource && props.observation_resource!=undefined && props.observation_resource[0].identifier[0].value.toString()!='PMS-SYRINGE' && (<>
                    <Divider sx={{marginTop:'40px', marginBottom:'20px', backgroundColor:'white', color:'white'}}/>
                    <Typography variant='h5' paddingLeft={'2%'}>Trends</Typography>
                    {graphDataDisplay}
                </>)} */}
                
               <Divider sx={{marginTop:'40px', marginBottom:'20px', backgroundColor:'white', color:'white'}}/>
               <Typography variant='h5' paddingLeft={'2%'}>Alarms</Typography>
               <Accordion elevation={0} defaultExpanded={true} sx={{ width:'100%',backgroundColor:"transparent", backgroundImage:'none', marginTop:'10px' , marginBottom:"10px", border:'1px solid grey', borderRadius:'15px', '&:before': {opacity: 0}}} >
                    <AccordionSummary
                            expandIcon={<ExpandMoreRounded sx={{ fontSize:'200%'}}/>}
                            aria-controls="panel1a-content"
                            id="panel1a-header"
                            
                            >
                            <Typography variant='h5' component={"h2"} >CIC(Warmer)
                            </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                    <Box width={'100%'} display={'flex'} textAlign={'center'} justifyContent={'center'} flexWrap={'wrap'}>
                        <Box width={'200px'} height={'110px'} sx={{border:'1px solid red', borderRadius:'10px', margin:'15px', boxShadow: `0px 0px 10px 1px red`}} justifyContent={'center'} textAlign={'center'}>
                            <Typography variant='subtitle1' paddingTop={'13%'}><b>Test Device</b></Typography>
                            <div style={{display:'flex', justifyContent:'center', textAlign:'center'}}>
                                <Typography variant='subtitle2' >25/12/2023 - 15:51</Typography>
                            </div>
                            
                        </Box>
                    </Box>
                    </AccordionDetails>
                </Accordion>

                <Button sx={{width:'20%', height:'50px', marginLeft:'40%', marginTop:'3%', marginBottom:'3%', borderRadius:'50px', color:'white', backgroundColor:'#111522', border:'0.5px solid grey', fontWeight:50, boxShadow: `0px 0px 10px 1px #6e6f88`, textTransform:'capitalize'}}  endIcon={tableVisisble ? <KeyboardArrowUpIcon sx={{ fontSize: 80 }} /> : <KeyboardArrowDownIcon sx={{ fontSize: 80 }}  />} onClick={() => {setTableVisible(!tableVisisble);}}> 
                    <Box sx={{ fontWeight: 'regular', m: 1, fontSize:16, }}>Alarm Log</Box>
                </Button>
                {/* <div  style={{marginLeft:'auto', width:'85%', marginRight:'auto'}} >
                    {tableVisisble && <Table infscrollfunc={infscrollfunc} rows={rows} columns={columns}/>}
                </div> */}
                <div  style={{marginLeft:'auto', width:'85%', marginRight:'auto'}} >
                            {tableVisisble && <Table rows={rows} columns={columns} infscrollfunc={() => {console.log("HELLO")}} />}
                        </div>
               <Divider sx={{marginTop:'40px', marginBottom:'20px', backgroundColor:'white', color:'white'}}/>
            </DialogContent>
        </Dialog>
</React.Fragment>
  );
};










