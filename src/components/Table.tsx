import { FC, useEffect, useMemo, useState } from "react";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { Box, Button, Stack } from "@mui/material";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { ExportToCsv } from 'export-to-csv';
import { Divider } from "@material-ui/core";

export interface rowsandcolumns {
  rows: [];
  columns: [];
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








  return (
      <MaterialReactTable 
            enableGrouping
            enableDensityToggle={false}
            enableFilters={false}
            enableHiding={false}
            enableFullScreenToggle={false}
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
                  <Box width={'40px'} height={'20px'} sx={{backgroundColor:'#00BCD4', borderRadius:'5px'}}></Box>
                  &nbsp;
                  - Medium Priority
                  &nbsp;
                  <Box width={'40px'} height={'20px'} sx={{backgroundColor:'#FFEB3B', borderRadius:'5px'}}></Box>
                  &nbsp;
                  - Low Priority
                </Stack>
                </Stack>
                
            )}>
              </MaterialReactTable>
  );
};
