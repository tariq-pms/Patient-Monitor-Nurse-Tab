import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import { Skeleton } from '@mui/material';
import { useDeviceContext } from '../contexts/DeviceContext';
import { CICCard } from '../components/CICCard';
import { INCCard } from '../components/INCCard';
import { SVAASCard } from '../components/SVAASCard';
import { BrammiCard } from '../components/BrammiCard';
import { NewDeviceDetails2 } from '../components/NewDeviceDetails2';

interface CentralMonitorEDAProps {
    currentRoom: string;
    darkTheme: boolean;
    selectedIcon: string;
}

export const CentralMonitorEDA: React.FC<CentralMonitorEDAProps> = ({ currentRoom, darkTheme, selectedIcon }) => {
    const { devices, deviceData, setDevices } = useDeviceContext();
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDevice, setSelectedDevice] = useState<any>(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (currentRoom !== "") {
            setIsLoading(true);
            fetch(`${import.meta.env.VITE_DEVICEDATA_URL as string}/devices?room=${currentRoom}`, {
                
                 credentials: "omit",
                // headers: {
                //     Authorization: "Basic " + btoa("fhiruser:change-password"),
                // },
            })
                .then((response) => response.json())
                .then((data) => {
                    console.log("Devices lookup: ",data);
                    setDevices(data);
                })
                .catch((error) => {
                    console.error('Error fetching device data:', error);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [currentRoom, setDevices]);

    const handleDeviceCardClick = (device: any) => {
        setSelectedDevice(device);
        console.log("handleDeviceclick",device);
    };

    const renderDeviceCard = (device: any) => {
        const deviceProps = {
            key: device.deviceId,
            device_id: device.macId,
            device_resource_id: device.deviceId,
            patient: deviceData[device.deviceId]?.patient || null,
            observation_resource: deviceData[device.deviceId]?.observation ,
            communication_resource: deviceData[device.deviceId]?.communication ,
            pleth_resource: deviceData[device.deviceId]?.pleth ,
            darkTheme,
            selectedIcon,
            onClick: () => handleDeviceCardClick(device),
        };

        // console.log(deviceData[device.deviceId])

        switch (device.type) {
            case 'Comprehensive Infant Care Centre':
                return <CICCard {...deviceProps} />;
            case 'Intensive Neonatal Care Center':
                return <INCCard {...deviceProps} />;
            case 'PMS-SVAAS':
                return <SVAASCard {...deviceProps} />;
            case 'Heating Cooling Machine':
                return <BrammiCard {...deviceProps} />;
            default:
                return null;
        }
    };

    return (
        <div style={selectedIcon === 'vertical' ? { display: 'flex', justifyContent: 'left', alignItems: 'left' } : { display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {selectedIcon === 'vertical' ? (
                <div style={{ display: 'flex', height: '100vh', alignItems: 'stretch', width: '98%' }}>
                    <Box sx={{ display: 'flex', marginTop: '0px', paddingTop: '0px', flexWrap: 'wrap', gap: '2rem', mt: { xs: 5, sm: 6, md: 4, lg: 3 }, mb: { xs: 3, sm: 4, md: 4, lg: 3 }, justifyContent: 'left', minWidth: '40%', maxWidth: '40%', height: '100%' }}>
                        <Box sx={{ width: "100%" }}>
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: '0.3rem', justifyContent: "center", width: "100%", marginBottom: '2%', maxHeight: '800px', overflowY: 'auto' }}>
                                {isLoading ? (
                                    <Skeleton variant="rounded" width={500} height={300} animation="wave" sx={{ borderRadius: '25px' }} />
                                ) : devices.map(renderDeviceCard)}
                            </Box>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', marginTop: '0px', gap: '2rem', mt: { xs: 5, sm: 6, md: 4, lg: 2 }, mb: { xs: 3, sm: 4, md: 4, lg: 2 }, justifyContent: 'center', width: '60%', height: '100%' }}>
                        {selectedDevice && (
                            <NewDeviceDetails2
                                isDialogOpened={isOpen}
                                handleCloseDialog={() => { setIsOpen(false); } }
                                darkTheme={darkTheme}
                                selectedIcon={selectedIcon}
                                device_id={selectedDevice.macId}
                                device_resource_id={selectedDevice.deviceId}
                                observation_resource={deviceData[selectedDevice.deviceId]?.observation}
                                communication_resource={deviceData[selectedDevice.deviceId]?.communication}
                                patient={deviceData[selectedDevice.deviceId]?.patient || null}
                                newData={true}
                            />
                        )}
                    </Box>
                </div>
            ) : (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: '2rem', mt: { xs: 5, sm: 6, md: 7, lg: 3 }, mb: { xs: 3, sm: 4, md: 5, lg: 2 }, justifyContent: "center", width: '100%' }}>
                    <Box sx={{ width: "100%" }}>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: '0.3rem', justifyContent: "left", width: "100%", marginBottom: '2%' }}>
                            {isLoading ? (
                                <Skeleton variant="rounded" width={500} height={300} animation="wave" sx={{ borderRadius: '25px' }} />
                            ) : devices.map(renderDeviceCard)}
                        </Box>
                    </Box>
                </Box>
            )}
        </div>
    );
};
