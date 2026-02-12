import React from 'react';
import { Box } from '@mui/material';
import { PatientTaskGroup } from './PatientTaskGroup';

export const MyTasks: React.FC = () => {
    // Mock Data to match the screenshot
    const patientsData = [
        {
            patientName: "Sreelakshmi",
            patientId: "NICU-101",
            weight: "1340 g",
            weightDiff: "120 g",
            tasks: [
                {
                    type: 'Medication' as const,
                    title: "Ampicillin",
                    status: 'Urgent' as const,
                    details: [
                        { label: "DOSAGE", value: "25 mg/kg" },
                        { label: "FREQUENCY", value: "Every 12 hours" },
                        { label: "ROUTE", value: "IV" }
                    ],
                    timeLabel: "ADMINISTER AT",
                    timeValue: "10:58"
                },
                {
                    type: 'Vitals' as const,
                    title: "Vital Signs Check",
                    status: 'Urgent' as const,
                    details: [
                        // No extra details for this one in screen, maybe just empty or generic
                    ],
                    timeLabel: "UPDATE BY",
                    timeValue: "10:43"
                },
                {
                    type: 'Assessment' as const,
                    title: "Progress & Assessment",
                    status: 'Pending' as const,
                    details: [
                    ],
                    timeLabel: "UPDATE BY",
                    timeValue: "12:28"
                }

            ]
        },
        {
            patientName: "Priya",
            patientId: "NICU-102",
            weight: "1340 g",
            weightDiff: "120 g",
            tasks: [
                {
                    type: 'Medication' as const,
                    title: "Surfactant",
                    status: 'Missed' as const,
                    details: [
                        { label: "DOSAGE", value: "2.5 ml/kg" },
                        { label: "FREQUENCY", value: "Once" },
                        { label: "ROUTE", value: "Intratracheal" }
                    ],
                    timeLabel: "ADMINISTER AT",
                    timeValue: "10:13"
                },
                {
                    type: 'Assessment' as const,
                    title: "Progress & Assessment",
                    status: 'Missed' as const,
                    details: [

                    ],
                    timeLabel: "UPDATE BY",
                    timeValue: "09:28"
                }
            ]
        },
        {
            patientName: "Kavitha",
            patientId: "NICU-103",
            weight: "1340 g",
            weightDiff: "120 g",
            tasks: [
                {
                    type: 'Assessment' as const,
                    title: "Progress & Assessment",
                    status: 'Pending' as const,
                    details: [
                    ],
                    timeLabel: "UPDATE BY",
                    timeValue: "14:28"
                }
            ]
        }
    ];

    return (
        <Box sx={{ padding: 2 }}>
            <Box sx={{ marginBottom: 2 }}>
                {/* Optional: Add a page title or filter bar here if needed */}
                {/* <Typography variant="h5" fontWeight="bold">Patients & Tasks</Typography> */}
            </Box>

            {patientsData.map((patient, index) => (
                <PatientTaskGroup
                    key={index}
                    patientName={patient.patientName}
                    patientId={patient.patientId}
                    weight={patient.weight}
                    weightDiff={patient.weightDiff}
                    tasks={patient.tasks}
                />
            ))}
        </Box>
    );
};
