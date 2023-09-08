import { FC, useEffect, useMemo, useState } from "react";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { Box, Button, Stack, ThemeProvider, createTheme, useTheme } from "@mui/material";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { ExportToCsv } from 'export-to-csv';
import { Divider } from "@material-ui/core";

export interface rowsandcolumns {
  rows: [];
  columns: [{'header': string}];
}
export const Table: FC<rowsandcolumns> = (props) => {
  const [tableData, setTableData]=useState(props)
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

          info: {

            main: 'rgb(255,122,0)', //add in a custom color for the toolbar alert background stuff

          },

          background: {

            default:

              globalTheme.palette.mode === 'light'

                ? 'rgb(254,255,244)' //random light yellow color for the background in light mode

                : '#000', //pure black table in dark mode for fun

          },

        },
        // typography: {

        //   button: {

        //     textTransform: 'none', //customize typography styles for all buttons in table by default

        //     fontSize: '1.2rem',

        //   },

        // },

        components: {

          MuiTooltip: {

            styleOverrides: {

              tooltip: {

                fontSize: '1.1rem', //override to make tooltip font size larger

              },

            },

          },

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






  return (
    <ThemeProvider theme={tableTheme}>
            <MaterialReactTable 
            enableGrouping
            enableDensityToggle={false}
            enableFilters={false}
            enableHiding={false}
            enableFullScreenToggle={false}

            muiTableHeadRowProps={{
              sx:{
                backgroundColor:'black'
              }
            }}
            initialState={{
                density: 'compact',        
                expanded: true, //expand all groups by default        
                grouping: ['date','time'], //an array of columns to group by by default (can be multiple)        
                pagination: { pageIndex: 0, pageSize: 20 },
                sorting: [{ id: 'date', desc: true }], //sort by state by defaul
                columnVisibility:{priority:false}
              }} 
              columns={tableData.columns} data={tableData.rows} 
              positionToolbarAlertBanner="bottom"   
              full
              renderTopToolbarCustomActions={({ table }) => (
                <Stack width="100%" direction={'row'} justifyContent={'space-between'}>
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
                        Export
                    </Button>
                </Box>
                <Stack direction={'row'} paddingTop={'10px'}>
                  <Box width={'40px'} height={'20px'} sx={{backgroundColor:'#F44336', borderRadius:'5px'}}></Box>
                  &nbsp;
                  - High Priority
                  &nbsp;
                  <Box width={'40px'} height={'20px'} sx={{backgroundColor:'#FFEB3B', borderRadius:'5px'}}></Box>
                  &nbsp;
                  - Medium Priority
                  &nbsp;
                  <Box width={'40px'} height={'20px'} sx={{backgroundColor:'#00BCD4', borderRadius:'5px'}}></Box>
                  &nbsp;
                  - Low Priority
                </Stack>
                </Stack>
                
            )}>
              </MaterialReactTable>
    </ThemeProvider>

  );
};
