import { ElementType, FC, ReactNode,  useEffect, useMemo,  useState } from "react";
import { MaterialReactTable,  type MRT_ColumnDef } from "material-react-table";
import { Box, Button, Stack, SvgIconClasses, SvgIconPropsColorOverrides, SvgIconPropsSizeOverrides, SxProps, Theme, ThemeProvider, createTheme, useTheme } from "@mui/material";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { ExportToCsv } from 'export-to-csv';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { CommonProps } from "@mui/material/OverridableComponent";
import { OverridableStringUnion } from "@mui/types";
import { JSX } from "react/jsx-runtime";
export interface rowsandcolumns {
  rows: {
    date: string;
    time: string;
    alarm: Array<Array<string>>;
}[];
  columns: MRT_ColumnDef[];
  infscrollfunc: Function;
}
export const Table: FC<rowsandcolumns> = (props) => {
  const [tableData, setTableData]= useState(props)
  useEffect(() => {
    setTableData(props);
},[props])
  const csvOptions = {
    fieldSeparator: ',',
    quoteStrings: '"',
    decimalSeparator: '.',
    showLabels: true,
    useBom: true,
    useKeysAsHeaders: false,
    headers: props.columns.map((c) => c.header),
  };
  
  const csvExporter = new ExportToCsv(csvOptions);
  const handleExportData = () => {
    csvExporter.generateCsv(props.rows);
  };

  const globalTheme = useTheme(); //(optional) if you already have a theme defined in your app root, you can import here


  const tableTheme = useMemo(

    () =>

      createTheme({

        palette: {

          mode: globalTheme.palette.mode, //let's use the same dark/light mode as the global theme

          primary: globalTheme.palette.secondary, //swap in the secondary color as the primary for the table

          background: {

            default:

              globalTheme.palette.mode === 'light'

                ? 'rgb(254,255,244)' //random light yellow color for the background in light mode

                : '#111522', //pure black table in dark mode for fun

          },

        },
        // typography: {

        //   button: {

        //     textTransform: 'none', //customize typography styles for all buttons in table by default

        //     fontSize: '1.2rem',

        //   },

        // },

        components: {


          MuiSwitch: {

            styleOverrides: {

              thumb: {

                color: 'pink', //change the color of the switch thumb in the columns show/hide menu to pink

              },

            },

          },

        },

      }),

    [globalTheme],

  );
  const [loading, setLoading] = useState(false)

  const [page, setPage] = useState(2)
  // const tableContainerRef = useRef<HTMLDivElement>(null);
  // const fetchMoreOnBottomReached = useCallback(
  //   (containerRefElement?: HTMLDivElement | null) => {
  //     if (containerRefElement) {
  //       const { scrollHeight, scrollTop, clientHeight } = containerRefElement;
  //       //once the user has scrolled within 400px of the bottom of the table, fetch more data if we can
  //       if (
  //         scrollHeight - scrollTop - clientHeight < 400
  //       ) {
  //         setPage(page+1)
  //         // props.infscrollfunc(page)
  //         console.log(page)
          
  //       }
  //     }
  //   },
  //   [],
  // );
  //   // const cols = 

  //   useEffect(() => {
  //     fetchMoreOnBottomReached(tableContainerRef.current);
  //   }, [fetchMoreOnBottomReached]);
  const [hasReachedBottom, setHasReachedBottom] = useState(false);

  const handleScrollToBottom = () => {
    // Your code to execute when the user reaches the bottom
    props.infscrollfunc(page)
    setPage(page+1)
    // You can also set hasReachedBottom to true to prevent further calls
    setHasReachedBottom(true);
  };

  const handleTableScroll = (e: { target: any; }) => {
    
    const table = e.target
    const isAtBottom =
    table.scrollTop + table.clientHeight >= table.scrollHeight;

    // Check if we're at the bottom and the function hasn't been called yet
    if (isAtBottom && !hasReachedBottom) {
      setLoading(true)
      handleScrollToBottom();
      setHasReachedBottom(true);
    }
    else{
      setHasReachedBottom(false);
    }
    
  }
  useEffect(() => {setLoading(false); },[props.rows])
  return (
    <ThemeProvider theme={tableTheme}>

            <MaterialReactTable 
            columns={tableData.columns}
            data={tableData.rows} 
            muiTableBodyCellProps={{
              sx:{
                fontSize:'12px',
                backgroundColor:'transparent'
                
              }
            }}
            // muiTableHeadRowProps={{
            //   sx:{
            //     backgroundImage:'linear-gradient(to bottom, #34405D, #151E2F, #34405D)'
            //     // backgroundColor:'#2f79d0'
            //   }
            // }}
            // enableColumnResizing
            enablePagination={false}
            enableRowVirtualization
            enableColumnActions={false}
            enableFilterMatchHighlighting={false}
            enableSorting={false}
            enableColumnDragging={false}
            enableGrouping
            enableDensityToggle={false}
            enableFilters={false}
            enableHiding={false}
            enableFullScreenToggle={false}
            icons={{
              //change sort icon, connect internal props so that it gets styled correctly//best practice


              ExpandMoreIcon: (props: JSX.IntrinsicAttributes & { component: ElementType<any>; } & {
                  children?: ReactNode; classes?: Partial<SvgIconClasses> | undefined; color?: OverridableStringUnion<"primary" | "disabled" | "inherit" | "action" | "error" | "info" | "warning" | "secondary" | "success", SvgIconPropsColorOverrides> | undefined; fontSize?: OverridableStringUnion<"inherit" | "small" | "large" | "medium", SvgIconPropsSizeOverrides> | undefined; htmlColor?: string | undefined; inheritViewBox?: boolean | undefined; shapeRendering?: string | undefined; sx?: SxProps<Theme> | undefined; //customize typography styles for all buttons in table by default
                  //customize typography styles for all buttons in table by default
                  //     fontSize: '1.2rem',
                  //   },
                  // },
                  titleAccess?: string | undefined; viewBox?: string | undefined;
                } & CommonProps & Omit<any, "color" | "fontSize" | "shapeRendering" | "children" | keyof CommonProps | "sx" | "viewBox" | "htmlColor" | "inheritViewBox" | "titleAccess">) =>  {
                if(props.style?.transform=='rotate(-90deg)'){
                  return (
                    <FontAwesomeIcon icon={faXmark} style={{visibility:'hidden',  pointerEvents: "none", cursor: "not-allowed"}} />
                  )
                }
                else{
                  return (
                    <KeyboardArrowDownRoundedIcon {...props}/>
                  )
                }
              
              },
              KeyboardDoubleArrowDownIcon: (_props: any) =>  <FontAwesomeIcon icon={faXmark} style={{visibility:'hidden',  pointerEvents: "none", cursor: "not-allowed"}} />,
            }}
            muiTableContainerProps={{
              sx: { maxHeight: '600px' }, //give the table a max height
              onScroll:handleTableScroll
              // sx:{
                
              //   // borderRadius:'100px',         //Responsible for the table body's changes
              //   // backgroundColor:'yellow'
              // }
            }}

            muiTableHeadCellProps={{    // For the Header
              sx:{
                backgroundImage:'linear-gradient(to bottom, #34405D, #151E2F, #34405D)'      
              }
            }}

            muiTablePaginationProps={{
              sx:{                         // For the pagenation container
                marginTop:'2%',
                // marginRight:'220px',
                // borderRadius:'100px',        
                // backgroundColor:'green'
              }
            }}
            muiToolbarAlertBannerChipProps={{
              sx:{
                visibility:'hidden',        // For showing coloumns which are grouped

              }
            }}
            muiToolbarAlertBannerProps={{
              sx:{
                visibility:'hidden',          // For showing the text "grouped by"
              }
            }}
            muiTopToolbarProps={{
              sx:{
                // borderRadius:'100px',         //Responsible for parent of header
                // backgroundColor:'cyan'
              }
            }}
            muiTableProps={{
              sx:{
              }
            }}
            

            muiBottomToolbarProps={{
              sx:{        
                // visibility:'hidden',          //Responsible for parent of footer
                // backgroundColor:'yellow',
              }
            }}
            initialState={{
                density: 'compact',        
                expanded: true, //expand all groups by default        
                grouping: ['date'], //an array of columns to group by by default (can be multiple)        
                // pagination: { pageIndex: 0, pageSize: 20 },
                sorting: [{ id: 'date', desc: true }], //sort by state by defaul
                columnVisibility:{priority:false}
              }} 
              state={{
                showProgressBars: loading,
              }}
              
              positionToolbarAlertBanner="bottom"   
              muiTablePaperProps={{
                elevation: 0, //change the mui box shadow
                //customize paper styles
                sx: {
                  borderRadius: '0',
                },
              }}
              renderTopToolbarCustomActions={({ }) => (
                <Stack width="100%" direction={'row'} justifyContent={'space-between'}>
                  <Box
                sx={{ display: 'flex', gap: '1rem', p: '0.5rem', flexWrap: 'wrap', borderTopLeftRadius:'25px' }} 
                >
                    <Button
                        color="primary"
                        //export all data that is currently in the table (ignore pagination, sorting, filtering, etc.)
                        onClick={handleExportData}
                        startIcon={<FileDownloadIcon />}
                        variant="contained"
                        sx={{  borderRadius:'25px', width:'100px', height:'30px', textTransform:'capitalize', fontSize:'10px', color:'white'}}
                    >
                        Download
                    </Button>
                </Box>
                {(() => {
                    return null
                })()}
                <Stack direction={'row'} paddingTop={'10px'} sx={{fontSize:'12px'}}>
                  <Box width={'20px'} height={'20px'} sx={{backgroundColor:'red', borderRadius:'5px'}}></Box>
                  <div style={{fontSize:'12px', marginTop:'2px'}} >&nbsp; - High Priority &nbsp;</div>

                  <Box width={'20px'} height={'20px'} sx={{backgroundColor:'yellow', borderRadius:'5px'}}></Box>
                  <div style={{fontSize:'12px', marginTop:'2px'}} >&nbsp; - Medium Priority &nbsp;</div>
                  <Box width={'20px'} height={'20px'} sx={{backgroundColor:'cyan', borderRadius:'5px'}}></Box>
                  <div style={{fontSize:'12px', marginTop:'2px'}} >&nbsp; - Low Priority &nbsp;</div>

                </Stack>
                </Stack>
                
            )} />
    </ThemeProvider>

  );
};
