
import { FC, useState, useEffect } from 'react';
import { Box, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import { InitialAssessment } from './InitialAssessment';

interface NewPageProps {
    patient_resource_id?: string;
    UserRole?: string;
}

export const NewPage: FC<NewPageProps> = (props) => {
    const { patient_resource_id, UserRole } = props;
    const [patientDetails, setPatientDetails] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPatientDetails = async (patientId: string) => {
        const BASE = import.meta.env.VITE_FHIRAPI_URL;
        const AUTH = {
            Authorization: "Basic " + btoa("fhiruser:change-password"),
        };

        try {
            /* =========================
               1️⃣ PATIENT
            ========================= */
            const patientRes = await fetch(`${BASE}/Patient/${patientId}`, {
                headers: AUTH,
            });

            if (!patientRes.ok) throw new Error("Failed to fetch patient data");
            const patient = await patientRes.json();

            /* =========================
               2️⃣ ACTIVE ENCOUNTER
            ========================= */
            const encRes = await fetch(
                `${BASE}/Encounter?subject=Patient/${patientId}&status=in-progress`,
                { headers: AUTH }
            );
            const encBundle = await encRes.json();
            const encounter = encBundle.entry?.[0]?.resource || null;

            /* =========================
               3️⃣ RELATED PERSON
            ========================= */
            const rpRes = await fetch(
                `${BASE}/RelatedPerson?patient=Patient/${patientId}`,
                { headers: AUTH }
            );
            const rpBundle = await rpRes.json();
            const kin = rpBundle.entry?.[0]?.resource || null;

            /* =========================
               🔁 NORMALIZE FOR UI
            ========================= */
            return {
                /* IDs */
                patientResourceId: patient.id,
                encounterId: encounter?.id || null,
                patientId:
                    patient.identifier?.find((i: any) =>
                        i.system?.includes("uhid")
                    )?.value || "-",

                admissionNo:
                    patient.identifier?.find((i: any) =>
                        i.system?.includes("admission")
                    )?.value || "-",

                /* Baby */
                motherName:
                    patient.extension?.find(
                        (e: any) =>
                            e.url ===
                            "http://hl7.org/fhir/StructureDefinition/patient-mothersMaidenName"
                    )?.valueString || "-",

                name: patient.name?.[0]?.text || "-",
                gender: patient.gender || "-",
                birthDate: patient.birthDate || "-",

                birthDateTime: patient.birthDate
                    ? new Date(patient.birthDate).toLocaleDateString()
                    : "-",

                gestationalAge:
                    patient.extension?.find((e: any) =>
                        e.url.includes("gestationalAge")
                    )?.valueString || "-",

                birthWeight:
                    patient.extension?.find((e: any) =>
                        e.url.includes("birthWeight")
                    )?.valueQuantity?.value || "-",

                nationality:
                    patient.extension?.find((e: any) =>
                        e.url.includes("nationality")
                    )?.valueString || "-",

                /* Contact */
                mobile: patient.telecom?.[0]?.value || "-",
                address: patient.address?.[0]?.text || "-",

                /* Admission */
                bed:
                    encounter?.location?.[0]?.location?.display || "-",

                admissionDate: encounter?.period?.start
                    ? new Date(encounter.period.start).toLocaleString()
                    : "-",

                treatingDoctor:
                    encounter?.participant?.[0]?.individual?.display || "-",

                admittingDoctor:
                    encounter?.participant?.[1]?.individual?.display || "-",

                refHospital:
                    encounter?.hospitalization?.origin?.display || "-",


                /* Next of Kin */
                kinName: kin?.name?.[0]?.text || "-",

                kinRelation:
                    kin?.relationship?.[0]?.coding?.[0]?.display || "-",

                kinMobile: kin?.telecom?.[0]?.value || "-",

                kinAddress: kin?.address?.[0]?.text || "-",
            };
        } catch (err: any) {
            console.error("Error fetching patient details:", err);
            setError(err.message || "Failed to load patient details.");
            return null;
        }
    };


    useEffect(() => {
        if (!patient_resource_id) return;

        const load = async () => {
            setLoading(true);
            setError(null);
            const data = await fetchPatientDetails(patient_resource_id);
            if (data) {
                setPatientDetails(data);
            }
            setLoading(false);
        };

        load();
    }, [patient_resource_id]);

    if (!patient_resource_id) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography>Please select a patient to view details.</Typography>
            </Box>
        );
    }

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '400px' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%', height: '100%', padding: '20px' }}>
            <Paper elevation={0} sx={{ padding: '0px', borderRadius: '12px', minHeight: '80vh', backgroundColor: 'transparent' }}>
                {patientDetails && patientDetails.encounterId ? (
                    <InitialAssessment
                        patient={patientDetails}
                        patientId={patientDetails.patientResourceId}
                        patientId1={patientDetails.patientId || ""}
                        patient_name={patientDetails.motherName}
                        encounterId={patientDetails.encounterId}
                        gender={patientDetails.gender}
                        admission_date={patientDetails.admissionDate}
                        gestational_age={patientDetails.gestationalAge}
                        UserRole={UserRole || ""}
                        admissionNo={patientDetails.admissionNo}
                        birth_weight={patientDetails.birthWeight}
                    />
                ) : (
                    <Typography>No active encounter found for this patient.</Typography>
                )}
            </Paper>
        </Box>
    );
};
