import React from 'react';


interface PlethProps {
  // initialValue: number;
  // onEventTrigger: (value: number) => void;
  patientId?: string;  // Adding the patientId prop
  pleth_resource?: {
    "device_id": string;
    "patient_id": string;
    "timestamp": string;
    "data": number[];
  };
}

declare module './PlethEDA' {
  const PlethEDA: React.ComponentType<PlethProps>;
  export default PlethEDA;
}
