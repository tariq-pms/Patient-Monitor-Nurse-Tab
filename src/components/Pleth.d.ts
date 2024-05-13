import React from 'react';


interface PlethProps {
  // initialValue: number;
  // onEventTrigger: (value: number) => void;
  patientId: string;  // Adding the patientId prop
}

declare module './Pleth' {
  const Pleth: React.ComponentType<PlethProps>;
  export default Pleth;
}
