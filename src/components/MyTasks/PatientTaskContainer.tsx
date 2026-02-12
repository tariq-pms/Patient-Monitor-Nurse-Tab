import React, { useEffect, useState } from 'react';
import { PatientTaskGroup } from './PatientTaskGroup';
import { TaskItemProps } from './TaskItem';

interface PatientTaskContainerProps {
    patient_id: string; // The FHIR ID or logical ID
    patient_resource_id: string; // The specific resource ID for fetching
    patient_name: string;
    birthDate: string;
    gender: string;
    currentWeight?: string; // Optional, might need to calculate or fetch
    birthWeight?: string;
    observations?: any[];
    communications?: any[];
    darkTheme?: boolean;
}

export const PatientTaskContainer: React.FC<PatientTaskContainerProps> = ({
    patient_id,
    patient_resource_id,
    patient_name,
    // birthDate,
    // gender,
    currentWeight = "N/A", // Default if not provided
    birthWeight = "N/A",
    // observations,
    // communications,
}) => {
    const [medicationTasks, setMedicationTasks] = useState<TaskItemProps[]>([]);
    const [diagnosticTasks, setDiagnosticTasks] = useState<TaskItemProps[]>([]);

    useEffect(() => {
        const fetchMedications = async () => {
            try {
                const searchUrl = `${import.meta.env.VITE_FHIRAPI_URL}/MedicationRequest?subject=Patient/${patient_resource_id}&status=active`;
                const response = await fetch(searchUrl, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: "Basic " + btoa("fhiruser:change-password"),
                    },
                });

                if (response.ok) {
                    const searchData = await response.json();
                    if (searchData?.entry && searchData.entry.length > 0) {
                        const tasks: TaskItemProps[] = searchData.entry.map((entry: any) => {
                            const med = entry.resource;
                            // ----------------------------------------------------------------
                            // 1. DOSAGE LOGIC
                            // ----------------------------------------------------------------
                            const dosage = med.dosageInstruction?.[0];
                            let doseDisplay = "N/A";

                            const doseVal = dosage?.doseAndRate?.[0]?.doseQuantity?.value;
                            const doseUnit = dosage?.doseAndRate?.[0]?.doseQuantity?.unit || '';

                            if (doseVal) {
                                // Check if it's weight-based (e.g. mg/kg) and we have weight
                                if (doseUnit.includes('/kg') && currentWeight && currentWeight !== "N/A") {
                                    // Assumption: currentWeight is in GRAMS (common in this app's NICU context)
                                    // If unknown, we might default to just showing the unit.
                                    const weightKg = parseFloat(currentWeight) / 1000;
                                    if (!isNaN(weightKg)) {
                                        const totalDose = (doseVal * weightKg).toFixed(2);
                                        // e.g. "12.5 mg (5 mg/kg)"
                                        doseDisplay = `${totalDose} mg`;
                                    } else {
                                        doseDisplay = `${doseVal} ${doseUnit}`;
                                    }
                                } else {
                                    doseDisplay = `${doseVal} ${doseUnit}`;
                                }
                            } else if (dosage?.text) {
                                // Fallback to free text if structured dose is missing
                                doseDisplay = dosage.text;
                            }

                            // ----------------------------------------------------------------
                            // 2. FREQUENCY LOGIC
                            // ----------------------------------------------------------------
                            let freqDisplay = "N/A";
                            const timing = dosage?.timing?.repeat;
                            const period = timing?.period;
                            const periodUnit = timing?.periodUnit; // h, d, min
                            const frequencyCount = timing?.frequency || 1;

                            if (period) {
                                const unitMap: Record<string, string> = {
                                    'h': 'hours',
                                    'd': 'days',
                                    'min': 'mins',
                                    'wk': 'weeks',
                                    's': 'secs'
                                };
                                const pUnit = unitMap[periodUnit] || periodUnit;

                                if (frequencyCount > 1) {
                                    freqDisplay = `${frequencyCount}x every ${period} ${pUnit}`;
                                } else {
                                    // If period is 24 hours, say "Once Daily"? 
                                    // Or just "Every 24 hours"
                                    if (period === 24 && periodUnit === 'h') freqDisplay = "Every 24 hours";
                                    else if (period === 12 && periodUnit === 'h') freqDisplay = "Every 12 hours";
                                    else freqDisplay = `Every ${period} ${pUnit}`;
                                }
                            } else if (dosage?.text) {
                                // Sometimes parsing fails but text exists (e.g. "Q12H")
                                // Try to extraction 'Q' codes if needed, or just show text
                                freqDisplay = dosage.text;
                            }

                            // ----------------------------------------------------------------
                            // 3. ROUTE LOGIC
                            // ----------------------------------------------------------------
                            const routeDisplay = dosage?.route?.coding?.[0]?.display || "N/A";

                            // ----------------------------------------------------------------
                            // 4. NEXT DOSE & STATUS LOGIC (Heuristic)
                            // ----------------------------------------------------------------
                            // ----------------------------------------------------------------
                            // 4. NEXT DOSE & STATUS LOGIC (Heuristic)
                            // ----------------------------------------------------------------
                            let nextDoseTime = new Date();
                            let status: 'Missed' | 'Ongoing' | 'Upcoming' = 'Ongoing';

                            const startTimeStr = med.dispenseRequest?.validityPeriod?.start || med.authoredOn;
                            if (startTimeStr && period) {
                                const start = new Date(startTimeStr);
                                let periodHours = period;
                                // Convert to hours for calculation
                                if (periodUnit === 'd') periodHours *= 24;
                                if (periodUnit === 'min') periodHours /= 60;
                                if (periodUnit === 'wk') periodHours *= 24 * 7;
                                // If unit is 's', ignore or handle tiny.

                                const nowMs = new Date().getTime();
                                const elapsedMs = nowMs - start.getTime();
                                const periodMs = periodHours * 60 * 60 * 1000;

                                if (periodMs > 0 && elapsedMs > 0) {
                                    const count = Math.floor(elapsedMs / periodMs);
                                    const nextSched = new Date(start.getTime() + (count + 1) * periodMs);
                                    const prevSched = new Date(start.getTime() + count * periodMs);

                                    // Logic:
                                    // If we are close to prevSched (within -30m to +60m), it's Ongoing.
                                    // If we are way past prevSched (>60m), it's Missed.
                                    // If we are waiting for nextSched, it's Upcoming.

                                    const diffPrevMinutes = (nowMs - prevSched.getTime()) / (1000 * 60);

                                    if (diffPrevMinutes > 60) {
                                        status = 'Missed';
                                        nextDoseTime = prevSched;
                                    } else if (diffPrevMinutes >= -30 && diffPrevMinutes <= 60) {
                                        status = 'Ongoing';
                                        nextDoseTime = prevSched;
                                    } else {
                                        status = 'Upcoming';
                                        nextDoseTime = nextSched;
                                    }
                                }
                            }

                            return {
                                type: 'Medication',
                                title: med.medicationCodeableConcept?.text || "Unknown Medication",
                                status: status,
                                details: [
                                    { label: "DOSAGE", value: doseDisplay },
                                    { label: "FREQUENCY", value: freqDisplay },
                                    { label: "ROUTE", value: routeDisplay }
                                ],
                                timeLabel: "ADMINISTER AT",
                                timeValue: nextDoseTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            };
                        });

                        // Sort: Missed > Ongoing > Upcoming
                        const statusOrder = { 'Missed': 0, 'Ongoing': 1, 'Upcoming': 2 };
                        tasks.sort((a, b) => {
                            const sa = statusOrder[a.status as 'Missed' | 'Ongoing' | 'Upcoming'] ?? 99;
                            const sb = statusOrder[b.status as 'Missed' | 'Ongoing' | 'Upcoming'] ?? 99;
                            return sa - sb;
                        });

                        setMedicationTasks(tasks);
                    }
                }
            } catch (error) {
                console.error("Error fetching medications:", error);
            }
        };

        const fetchDiagnostics = async () => {
            try {
                // Fetch DiagnosticReports with status 'registered' (which implies order placed/collect sample)
                // In FHIR, an order might be a ServiceRequest or a DiagnosticReport with 'registered' status.
                // Based on DiagnosticOrderDialog, we save 'DiagnosticReport' with status='registered'.
                const searchUrl = `${import.meta.env.VITE_FHIRAPI_URL}/DiagnosticReport?subject=Patient/${patient_resource_id}&status=registered`;
                const response = await fetch(searchUrl, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: "Basic " + btoa("fhiruser:change-password"),
                    },
                });

                if (response.ok) {
                    const searchData = await response.json();
                    if (searchData?.entry && searchData.entry.length > 0) {
                        const tasks: TaskItemProps[] = searchData.entry.map((entry: any) => {
                            const report = entry.resource;
                            // Extract "Specimen" from Conclusion or Extension if possible, or just default
                            // In Dialog, we saved: conclusion: `Specimen: ..., ...`
                            let specimen = "Venous"; // Default
                            if (report.conclusion) {
                                const match = report.conclusion.match(/Specimen:\s*([^,]+)/);
                                if (match) specimen = match[1];
                            }

                            return {
                                type: 'Labs',
                                title: report.code?.text || "Unknown Test",
                                status: 'Pending', // Display as "Collect Sample" really, but status enum calls for standard. We can override label in display if needed, but 'Pending' is blue which is fine. OR use 'Urgent' for orange? User image shows "Sample Collection Pending" in orange.
                                // Let's map 'Pending' to Orange in TaskItem or just use 'Urgent' as proxy?
                                // TaskItem 'Pending' is Blue. 'Urgent' is Orange.
                                // Let's use 'Urgent' to match the color if we want, or just stick to 'Pending'.
                                // User image 3: "Sample Collection Pending" is ORANGE pill.
                                // My Tasks "Collect Sample" might be interpreted as Urgent?
                                // Let's set to 'Urgent' to check 'Collect Sample'.
                                // Update: TaskItem doesn't support custom text yet, just status.
                                // I'll set status to 'Urgent' for now to get attention.
                                details: [
                                    { label: "Specimen", value: specimen },
                                    { label: "Ordered By", value: report.performer?.[0]?.display || "System" }
                                ],
                                timeLabel: "ORDERED AT",
                                timeValue: new Date(report.issued || report.effectiveDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            };
                        });
                        setDiagnosticTasks(tasks);
                    }
                }
            } catch (error) {
                console.error("Error fetching diagnostics:", error);
            }
        };

        if (patient_resource_id) {
            fetchMedications();
            fetchDiagnostics();
        }
    }, [patient_resource_id]);


    const allTasks = [...medicationTasks, ...diagnosticTasks];
    // Calculate weight diff - placeholder
    const weightDiff = "120 g";

    return (
        <PatientTaskGroup
            patientName={patient_name}
            patientId={patient_id}
            weight={currentWeight !== "N/A" ? currentWeight + " g" : birthWeight + " g"} // Prefer current weight
            weightDiff={weightDiff}
            tasks={allTasks}
        />
    );
};
