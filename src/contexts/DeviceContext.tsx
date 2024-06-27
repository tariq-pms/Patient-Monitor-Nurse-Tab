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

    const updateDeviceData = (deviceId: string, dataType: string, data: any) => {
        setDeviceData((prevData) => ({
            ...prevData,
            [deviceId]: {
                ...prevData[deviceId],
                [dataType]: data,
            },
        }));
    };

    useEffect(() => {
        const socket = new WebSocket('ws://sujiv-vostro-3401.local:9995/');

        socket.onopen = () => {
            console.log('WebSocket connection established');
            devices.forEach((device) => {
                socket.send(JSON.stringify({ deviceId: device.deviceId, room: device.room, type: device.type }));
            });
        };

        socket.onmessage = (event) => {
            const { topic, data } = JSON.parse(event.data);
            updateDeviceData(data.device_id, topic, data.data);
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
            fetch(`${import.meta.env.VITE_FHIRAPI_URL as string}/Patient/${device.patientId}`, {
                credentials: "omit",
                headers: {
                    Authorization: "Basic " + btoa("fhiruser:change-password"),
                },
            })
            .then(response => response.json())
            .then(data => {
                updateDeviceData(device.deviceId, 'patient', data);
            })
            .catch(error => {
                console.error('Error fetching patient data:', error);
            });
        });
    }, [devices]);

    return (
        <DeviceContext.Provider value={{ devices, deviceData, setDevices, updateDeviceData }}>
            {children}
        </DeviceContext.Provider>
    );
};
