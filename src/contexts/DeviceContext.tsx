import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface DeviceData {
    [key: string]: {
        communication?: any;
        observation?: any;
        pleth?: any;
        patient?: any;
    };
}

interface DeviceContextProps {
    devices: any[];
    deviceData: DeviceData;
    setDevices: (devices: any[]) => void;
    updateDeviceData: (deviceId: string, dataType: string, data: any) => void;
}

const DeviceContext = createContext<DeviceContextProps>({
    devices: [],
    deviceData: {},
    setDevices: () => {},
    updateDeviceData: () => {},
});

export const useDeviceContext = () => useContext(DeviceContext);

interface DeviceProviderProps {
    children: ReactNode;
}

export const DeviceProvider: React.FC<DeviceProviderProps> = ({ children }) => {
    const [devices, setDevices] = useState<any[]>([]);
    const [deviceData, setDeviceData] = useState<DeviceData>({});
    const [previousPatientIds, setPreviousPatientIds] = useState<{ [key: string]: string }>({});

    const updateDeviceData = (deviceId: string, dataType: string, data: any) => {
        if (dataType === 'patient') {
            setDeviceData((prevData) => ({
                ...prevData,
                [deviceId]: {
                    ...prevData[deviceId],
                    [dataType]: data,
                },
            }));
        }
        else{
            setDeviceData((prevData) => ({
                ...prevData,
                [deviceId]: {
                    ...prevData[deviceId],
                    [dataType]: data.data,
                },
            }));
        }
        
        console.log("DC: ",deviceId, dataType, data);
        if (dataType === 'observation' && data.patient && previousPatientIds[deviceId] !== data.patient) {
            setPreviousPatientIds((prevIds) => ({
                ...prevIds,
                [deviceId]: data.patient,
            }));
            fetchPatientData(deviceId, data.patient);
        }
    };

    const fetchPatientData = (deviceId: string, patientId: string) => {
        fetch(`${import.meta.env.VITE_FHIRAPI_URL as string}/Patient/${patientId}`, {
            credentials: "omit",
            headers: {
                Authorization: "Basic " + btoa("fhiruser:change-password"),
            },
        })
        .then(response => response.json())
        .then(data => {
            updateDeviceData(deviceId, 'patient', data);
        })
        .catch(error => {
            console.error('Error fetching patient data:', error);
        });
    };

    useEffect(() => {
        const socket = new WebSocket(`${import.meta.env.VITE_STREAMSOCKET_URL as string}`);

        socket.onopen = () => {
            console.log('WebSocket connection established');
            devices.forEach((device) => {
                if (device.deviceId && device.room && device.type) {
                    socket.send(JSON.stringify({ deviceId: device.deviceId, room: device.room, type: device.type }));
                } else {
                    console.warn('Device with missing information:', device);
                }
            });
        };

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'add') {
                setDevices(prevDevices => [...prevDevices, message.device]);
                fetchPatientData(message.device.deviceId, message.device.patientId);
            } else if (message.type === 'remove') {
                setDevices(prevDevices => prevDevices.filter(d => d.deviceId !== message.device.deviceId));
            } else {
                const { topic, data } = message;
                updateDeviceData(data.device_id, topic, data);
            }
        };

        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        return () => {
            socket.close();
        };
    }, [devices]);

    useEffect(() => {
        devices.forEach(device => {
            if (device.patientId) {
                fetchPatientData(device.deviceId, device.patientId);
            } else {
                console.warn('Device with missing patientId:', device);
            }
        });
    }, [devices]);

    return (
        <DeviceContext.Provider value={{ devices, deviceData, setDevices, updateDeviceData }}>
            {children}
        </DeviceContext.Provider>
    );
};
