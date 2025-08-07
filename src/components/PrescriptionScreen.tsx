import React, { useEffect, useState } from "react";
import {
  Box, Typography, TextField, Button,Grid,Divider,Paper,Autocomplete,MenuItem,
  Select,
 
  FormControl,
  Snackbar,
  Alert,
  Stack,

} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPrescription } from "@fortawesome/free-solid-svg-icons";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import ClearIcon from '@mui/icons-material/Clear';
import { addHours } from "date-fns";
import  DrugCalculator  from "../components/DrugCalculator";

interface PrescriptionScreenProps {

  patient_name: string;
  patient_id: string;
  patient_resource_id: string;
  UserRole: string;

}
type AdministrationHistoryItem = {
  id: string;
  versionId: string;
  name: string;
  status: string;
  effectiveDateTime: string;
  performerName: string;
  patientReference: string;
  requestReference: string;
};

interface Medication {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  frequency: string;
  frequency1?: string; // optional, if some don't have it
  route: string;
  totalDoses: number;
  administeredCount: number;
  dosageInstruction?: {
    doseAndRate?: {
      doseQuantity?: {
        value?: number;
        unit?: string;
      };
    }[];
  }[];
  use: string;
}


export const PrescriptionScreen: React.FC<PrescriptionScreenProps> = (props) => {

    
      const [selectedDrugName, setSelectedDrugName] = useState("");
      const [selectedDrugCategory, setSelectedDrugCategory] = useState("");
      const [selectedDrugUse, setSelectedDrugUse] = useState("");
      const [dose, setDose] = useState("");
      const [route, setRoute] = useState("Oral");
      const [unit, setUnit] = useState("mg");
      const [frequency, setFrequency] = useState("Q12H");
      const [startDate, setStartDate] = useState<Date | null>(null);
      const [endDate, setEndDate] = useState<Date | null>(null);
      const [days, setDays] = useState<number>(1);
      const [indication, setIndication] = useState("");
      const [additionalNote, setAdditionalNote] = useState("");
     // Store medications
     const [drugOptions, setDrugOptions] = useState<any[]>([]);
     // Drug search options
      const [selectedDrug, setSelectedDrug] = useState<any | null>(null); // Selected drug object
      const [administrationHistory, setAdministrationHistory] = useState<AdministrationHistoryItem[]>([]);
      const [prescriptionHistory, setPrescriptionHistory] = useState<Medication[]>([]);

  // Fetch drug data (RxNorm API example)
  // const fetchDrugs = async (query: string) => {
  //   try {
  //     const response = await fetch(
  //       `https://rxnav.nlm.nih.gov/REST/drugs.json?name=${query}`
  //     );
  //     const data = await response.json();
  //     const drugs =
  //       data.drugGroup.conceptGroup?.flatMap((group: any) =>
  //         group.conceptProperties
  //           ? group.conceptProperties.map((item: any) => item.name)
  //           : []
  //       ) || [];
  //     setDrugOptions(drugs);
  //   } catch (error) {
  //     console.error("Error fetching drug data:", error);
  //     setDrugOptions([]);
  //   }
  // };

  
  const fetchDrugs = async (query: string) => {
    try {
      const response = await fetch('/neonatal-drugs.json'); // Replace with the correct file path
      const data = await response.json();

      const drugs =
        data.neonatal_drugs.filter((drug: any) =>
          drug.name.toLowerCase().includes(query.toLowerCase())
        ) || [];

      setDrugOptions(drugs); // Save the full drug objects
    } catch (error) {
      console.error("Error fetching drug data:", error);
      setDrugOptions([]);
    }
  };

  const isFormEmpty = () => {
    return (
      !selectedDrug ||
      !dose ||
      !route ||
      !frequency ||
      !startDate ||
      !endDate 
      // !indication ||
      // !additionalNote
    );
  };
  // Function to calculate the end date
const calculateEndDate = (startDate: string | number | Date, frequency: string, days: number) => {
  if (!startDate || !frequency || !days) return null;
  
  const hoursPerDose = parseInt(frequency.replace('Q', '').replace('H', ''), 10);
  const totalHours = days * 24; // Total hours based on the number of days
  const doses = totalHours / hoursPerDose; // Total doses within the period
  
  return addHours(new Date(startDate), doses * hoursPerDose);
};
const [snackbarOpen, setSnackbarOpen] = useState(false);
const [snackbarMessage, setSnackbarMessage] = useState("");
const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

const handleCloseSnackbar = () => {
  setSnackbarOpen(false);
};

// In your component
useEffect(() => {
  if (startDate && frequency && days) {
    const computedEndDate = calculateEndDate(startDate, frequency, days);
    setEndDate(computedEndDate);
  }
}, [startDate, frequency, days]);
  const resetForm = () => {
    setDrugOptions([]); // Clears the dropdown options safely
    setSelectedDrug(null);
    setSelectedDrugName('');
    setSelectedDrugCategory('');
    setSelectedDrugUse('');
    setDose('');
    setRoute('');
    setFrequency('');
    setStartDate(null);
    setEndDate(null);
    setDays(1);
    setIndication('');
    setAdditionalNote('');
  };
  
  const handleEndDateChange = (newEndDate: Date | null) => {
    setEndDate(newEndDate);
    const effectiveStartDate = startDate || new Date(); // Fallback to current date
    if (newEndDate) {
      const difference = Math.ceil(
        (newEndDate.getTime() - effectiveStartDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (difference >= 1) {
        setDays(difference);
      }
    }
  };
  const [medicationResourceId, setMedicationResourceId] = useState<string | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
 
 
  const [administering, setAdministering] = useState(false);
  const [currentMedicationId, setCurrentMedicationId] = useState<string | null>(null);

  const calculateIntervals = (startDate: string | number | Date, endDate: string | number | Date, frequencyInHours: number) => {
    const intervals = [];
    let currentDate = new Date(startDate);
  
    while (currentDate <= new Date(endDate)) {
      intervals.push(new Date(currentDate)); // Add the current date to the intervals array
      currentDate.setHours(currentDate.getHours() + frequencyInHours); // Increment by the frequency
    }
    return intervals;
    
    
  };
 
  // const fetchPrescription = async () => {
  //   setLoading(true);
  //   try {
  //     const searchUrl = `${import.meta.env.VITE_FHIRAPI_URL}/MedicationRequest?subject=Patient/${props.patient_resource_id}`;
  //     const response = await fetch(searchUrl, {
  //       method: "GET",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: "Basic " + btoa("fhiruser:change-password"),
  //       },
  //     });
  
  //     if (response.ok) {
  //       const searchData = await response.json();
  //       console.log("Fetched Medication:", searchData);
  
  //       if (searchData?.entry && searchData.entry.length > 0) {
  //         const medicationData = searchData.entry.map((entry: { resource: any }) => {
  //           const medication = entry.resource;
  
  //           // Get frequency and start/end dates
  //           const frequency = medication.dosageInstruction?.[0]?.timing?.repeat?.frequency || "N/A";
  //           const startDate = medication.dispenseRequest?.validityPeriod?.start || "N/A";
  //           const endDate = medication.dispenseRequest?.validityPeriod?.end || "N/A";
             
  //           let frequencyInHours = frequency;
  //           const intervals = calculateIntervals(startDate, endDate, frequencyInHours);
  //           console.log("MedicationRequest intervals.",intervals);
  //           return {
  //             id: medication.id, // Ensure the medication ID is included
  //             name: medication.medicationCodeableConcept.text,
  //             frequency: frequency,
  //             frequency1: medication.dosageInstruction?.[0]?.text || "N/A",
  //             route: medication.dosageInstruction?.[0]?.route?.coding?.[0]?.display || "N/A",
  //             startDate: startDate,
  //             endDate: endDate,
  //             use: medication.reasonCode?.[0]?.text || "N/A",
  //             additionalNote: medication.note?.[0]?.text || "N/A",
  //             isCritical: false,
  //             intervals: intervals,
  //           };
  //         });
  
  //         setPrescriptionHistory(medicationData);
         
  //         // Save the medication data with IDs
  //       }
  //     } else {
  //       console.error("Failed to fetch MedicationRequest resource.");
  //     }
  //   } catch (error) {
  //     console.error("Error fetching MedicationRequest:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  

 
  // const handlePrescribe = async () => {
  //   setLoading(true);
  //   const doseValue = Number(dose);
  //     // Dynamically setting the period based on the selected frequency (Q12H, Q8H, Q6H)
  // const period = frequency === 'Q12H' ? 12 : frequency === 'Q8H' ? 8 : frequency === 'Q6H' ? 6 : 12;
  //   const prescriptionData = {
  //     resourceType: "MedicationRequest",
  //     id: medicationResourceId || undefined,
  //     status: "active",
  //     intent: "order",
  //     medicationCodeableConcept: {
  //       text: selectedDrugName, 
  //     },
     
  //     subject: {
  //       reference: `Patient/${props.patient_resource_id}`,
  //       display: props.patient_name,
  //     },
  //     requester: {
  //       reference: "Practitioner/12345", // Use a valid doctor ID
  //     },
  //     dosageInstruction: [
  //       {
  //         text: `${dose} mg ${route} every ${frequency}`,
  //         doseAndRate: [
  //           {
  //             doseQuantity: {
  //               value: doseValue, // Use the number value here
  //               unit: "mg",
  //             },
  //           },
  //         ],
  //         timing: {
  //           repeat: {
  //             frequency: period,  
  //             period: 1,     
  //             periodUnit: "d" 
  //           }
  //         },
  //         route: {
  //           coding: [
  //             {
  //               system: "http://terminology.hl7.org/CodeSystem/route-of-administration",
  //               code: route.toLowerCase(),
  //               display: route,
  //             },
  //           ],
  //         },
  //       },
  //     ],
      
  //     reasonCode: [
  //       {
  //         text: selectedDrugUse,
  //       },
  //     ],
  //     note: [
  //       {
  //         text: additionalNote,
  //       },
  //     ],
  //     dispenseRequest: {
  //       validityPeriod: {
  //         start: startDate, // Start date of the prescription
  //         end: endDate, // End date of the prescription
  //       },
  //       expectedSupplyDuration: {
  //         value: days, // Total number of days
  //         unit: "days",
  //         system: "http://unitsofmeasure.org",
  //         code: "d",
  //       },
  //     },
  //   };
  
  //   try {
  //     const requestConfig = {
  //       method:  "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: "Basic " + btoa("fhiruser:change-password"),
  //       },
  //       body: JSON.stringify(prescriptionData),
  //     };
  
  //     const url =`${import.meta.env.VITE_FHIRAPI_URL}/MedicationRequest`;
  
  //     const response = await fetch(url, requestConfig);
  
  //     if (!response.ok) {
  //       const errorBody = await response.text();
  //       console.error("Error response body:", errorBody);
  //       throw new Error(`Request failed: ${response.statusText}`);
  //     }
  
  //     // Only parse JSON if the response has content
  //     const contentType = response.headers.get("content-type");
  //     let responseData = null;
  //     if (contentType && contentType.includes("application/json")) {
  //       responseData = await response.json();
  //     }
  //       setMedicationResourceId(responseData?.id || null);
  //       console.log("Prescription saved successfully:", responseData);
  //       setSnackbarMessage("Prescription saved successfully!");
  //     setSnackbarSeverity("success");
  //     setSnackbarOpen(true);
  //   } catch (error) {
  //     console.error("Error saving Prescription resource:", error);
  //     setSnackbarMessage("An error occurred while saving the Prescription.");
  //     setSnackbarSeverity("error");
  //     setSnackbarOpen(true);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  
  // const handleAdminister = async (medicationId: string) => {
  //   setAdministering(true);
  //   setCurrentMedicationId(medicationId);
  
  //   try {
  //     // Fetch MedicationRequest to get the medication reference or codeable concept
  //     const medicationRequestResponse = await fetch(
  //       `${import.meta.env.VITE_FHIRAPI_URL}/MedicationRequest/${medicationId}`,
  //       {
  //         method: "GET",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: "Basic " + btoa("fhiruser:change-password"),
  //         },
  //       }
  //     );
  
  //     if (!medicationRequestResponse.ok) {
  //       console.error("Failed to fetch MedicationRequest resource.");
  //       setSnackbarMessage("Failed to fetch MedicationRequest.");
  //       setSnackbarSeverity("error");
  //       return;
  //     }
  
  //     const medicationRequest = await medicationRequestResponse.json();
  
  //     // Validate if the medication details are available
  //     const medicationReference =
  //       medicationRequest.medicationReference?.reference || null;
  //     const medicationCodeableConcept =
  //       medicationRequest.medicationCodeableConcept || null;
  
  //     if (!medicationReference && !medicationCodeableConcept) {
  //       console.error("MedicationRequest does not have a valid medication field.");
  //       setSnackbarMessage("Invalid MedicationRequest: Missing medication.");
  //       setSnackbarSeverity("error");
  //       return;
  //     }
  
  //     // Check if a MedicationAdministration already exists for the MedicationRequest
  //     const searchUrl = `${import.meta.env.VITE_FHIRAPI_URL}/MedicationAdministration?request=MedicationRequest/${medicationId}`;
  //     const searchResponse = await fetch(searchUrl, {
  //       method: "GET",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: "Basic " + btoa("fhiruser:change-password"),
  //       },
  //     });
  
  //     if (!searchResponse.ok) {
  //       console.error("Failed to search for existing MedicationAdministration.");
  //       setSnackbarMessage("Error checking existing administration.");
  //       setSnackbarSeverity("error");
  //       return;
  //     }
  
  //     const searchData = await searchResponse.json();
  //     const existingAdmin = searchData?.entry?.[0]?.resource;
  
  //     // Enhanced: Validation to prevent multiple concurrent administrations
  //     if (existingAdmin && existingAdmin.status === "in-progress") {
  //       console.warn("MedicationAdministration is already in progress.");
  //       setSnackbarMessage("This medication is already being administered.");
  //       setSnackbarSeverity("warning");
  //       return;
  //     }
  
  //     // Prepare the MedicationAdministration resource
  //     const administerData = {
  //       resourceType: "MedicationAdministration",
  //       status: "completed", // Updated as per FHIR resource standard
  //       medicationReference: medicationReference
  //         ? { reference: medicationReference }
  //         : undefined,
  //       medicationCodeableConcept: medicationCodeableConcept || undefined,
  //       request: {
  //         reference: `MedicationRequest/${medicationId}`,
  //       },
  //       subject: {
  //         reference: `Patient/${props.patient_resource_id}`,
  //       },
  //       performer: [
  //         {
  //           actor: {
  //             reference: "Practitioner/12345", // Replace with actual performer ID
  //             display: "Nurse Name", // Replace with dynamic performer name
  //           },
  //         },
  //       ],
  //       effectiveDateTime: new Date().toISOString(),
  //     };
  
  //     // Log administration attempt (enhancement)
  //     console.log(
  //       "Attempting to administer medication with the following data:",
  //       administerData
  //     );
  
  //     let response;
  //     if (existingAdmin) {
  //       // Update existing MedicationAdministration with PUT
  //       const adminId = existingAdmin.id;
  //       response = await fetch(
  //         `${import.meta.env.VITE_FHIRAPI_URL}/MedicationAdministration/${adminId}`,
  //         {
  //           method: "PUT",
  //           headers: {
  //             "Content-Type": "application/json",
  //             Authorization: "Basic " + btoa("fhiruser:change-password"),
  //           },
  //           body: JSON.stringify({ ...existingAdmin, ...administerData }),
  //         }
  //       );
  //     } else {
  //       // Create new MedicationAdministration with POST
  //       response = await fetch(
  //         `${import.meta.env.VITE_FHIRAPI_URL}/MedicationAdministration`,
  //         {
  //           method: "POST",
  //           headers: {
  //             "Content-Type": "application/json",
  //             Authorization: "Basic " + btoa("fhiruser:change-password"),
  //           },
  //           body: JSON.stringify(administerData),
  //         }
  //       );
  //     }
  
  //     if (response.ok) {
  //       const responseData = await response.json();
  //       console.log("Medication administered successfully:", responseData);
  //       setSnackbarMessage("Medication administered successfully!");
  //       setSnackbarSeverity("success");
  //     } else {
  //       const errorMessage = await response.text();
  //       console.error("Failed to administer medication:", errorMessage);
  //       setSnackbarMessage("Failed to administer medication.");
  //       setSnackbarSeverity("error");
  //     }
  //   } catch (error) {
  //     console.error("Error administering medication:", error);
  //     setSnackbarMessage("An error occurred while administering the medication.");
  //     setSnackbarSeverity("error");
  //   } finally {
  //     setAdministering(false);
  //     setCurrentMedicationId(null);
  //     setSnackbarOpen(true);
  //   }
  // };
  
  const fetchAdminister = async () => {
    setLoading(true);
    try {
      const searchUrl = `${import.meta.env.VITE_FHIRAPI_URL}/MedicationAdministration?subject=Patient/${props.patient_resource_id}`;
      const response = await fetch(searchUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + btoa("fhiruser:change-password"),
        },
      });
  
      if (response.ok) {
        const searchData = await response.json();
        console.log("Fetched MedicationAdministration:", searchData);
        console.log("Fetched patient resource id:", props.patient_resource_id);
        console.log("Fetched user role:", props.UserRole);
      
  
        if (searchData?.entry && searchData.entry.length > 0) {
          const allHistories = await Promise.all(
            searchData.entry.map(async (entry: { resource: any }) => {
              const resourceId = entry.resource.id;
              const historyUrl = `${import.meta.env.VITE_FHIRAPI_URL}/MedicationAdministration/${resourceId}/_history`;
  
              const historyResponse = await fetch(historyUrl, {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: "Basic " + btoa("fhiruser:change-password"),
                },
              });
  
              if (historyResponse.ok) {
                const historyData = await historyResponse.json();
                return historyData.entry.map((historyEntry: { resource: any }) => {
                  const medication = historyEntry.resource;
  
                  return {
                    id: medication.id,
                    versionId: medication.meta?.versionId || "N/A",
                    name: medication.medicationCodeableConcept?.text || "N/A",
                    status: medication.status || "N/A",
                    effectiveDateTime: medication.effectiveDateTime || "N/A",
                    performerName: medication.performer?.[0]?.actor?.display || "N/A",
                    patientReference: medication.subject?.reference || "N/A",
                    requestReference: medication.request?.reference || "N/A",
                  } as AdministrationHistoryItem;
                });
              } else {
                console.error(
                  `Failed to fetch history for MedicationAdministration ${resourceId}.`
                );
                return [];
              }
            })
          );
  
          // Flatten the nested array of histories
          const flattenedHistories: AdministrationHistoryItem[] = allHistories.flat();
          setAdministrationHistory(flattenedHistories);
        } else {
          setAdministrationHistory([]);
          console.warn("No MedicationAdministration entries found.");
        }
      } else {
        console.error("Failed to fetch MedicationAdministration resource.");
      }
    } catch (error) {
      console.error("Error fetching MedicationAdministration:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchPrescription = async () => {
    setLoading(true);
    try {
      const searchUrl = `${import.meta.env.VITE_FHIRAPI_URL}/MedicationRequest?subject=Patient/${props.patient_resource_id}`;
      const response = await fetch(searchUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + btoa("fhiruser:change-password"),
        },
      });
  
      if (response.ok) {
        const searchData = await response.json();
        console.log("Fetched Medication:", searchData);
  
        if (searchData?.entry && searchData.entry.length > 0) {
          const medicationData = searchData.entry.map((entry: { resource: any; }) => {
            const medication = entry.resource;
  
            // Extract total doses and administered count from extensions
            const totalDosesExtension = medication.extension?.find(
              (ext: { url: string; }) => ext.url === "http://example.org/fhir/StructureDefinition/totalDoses"
            );
            const administeredCountExtension = medication.extension?.find(
              (ext: { url: string; }) => ext.url === "http://example.org/fhir/StructureDefinition/administeredCount"
            );
  
            const totalDoses = totalDosesExtension?.valueInteger || 0;
            const administeredCount = administeredCountExtension?.valueInteger || 0;
  
            // Get frequency and start/end dates
            const frequency = medication.dosageInstruction?.[0]?.timing?.repeat?.frequency || "N/A";
            const startDate = medication.dispenseRequest?.validityPeriod?.start || "N/A";
            const endDate = medication.dispenseRequest?.validityPeriod?.end || "N/A";
  
            // Calculate intervals
            let frequencyInHours = frequency;
            const intervals = calculateIntervals(startDate, endDate, frequencyInHours);
  
            return {
              id: medication.id, // Medication ID
              name: medication.medicationCodeableConcept.text,
              frequency,
              frequency1: medication.dosageInstruction?.[0]?.text || "N/A",
              route: medication.dosageInstruction?.[0]?.route?.coding?.[0]?.display || "N/A",
              startDate,
              endDate,
              use: medication.reasonCode?.[0]?.text || "N/A",
              additionalNote: medication.note?.[0]?.text || "N/A",
              isCritical: false,
              intervals,
              totalDoses, // Include total doses
              administeredCount, // Include administered count
            };
          });
  
          setPrescriptionHistory(medicationData);
          console.log("PrescriptionHistory",medicationData);
        }
      } else {
        console.error("Failed to fetch MedicationRequest resource.");
      }
    } catch (error) {
      console.error("Error fetching MedicationRequest:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handlePrescribe = async () => {
    setLoading(true);
  
    const period = frequency === 'Q12H' ? 12 : frequency === 'Q8H' ? 8 : frequency === 'Q6H' ? 6 : 12;
    console.log("Total frequency (hours between doses):", period);
  if (!startDate || !endDate) {
  setSnackbarMessage("Start date and end date must be provided.");
  setSnackbarSeverity("error");
  setSnackbarOpen(true);
  setLoading(false);
  return;
}

const start = new Date(startDate);
const end = new Date(endDate);
    console.log("Start Date:", start, "End Date:", end);
  
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    console.log("Total days:", totalDays);
  
    const dosesPerDay = Math.floor(24 / period);
    const totalDoses = (dosesPerDay * totalDays) + 1;
    console.log("Total doses:", totalDoses);
    console.log("indication:", indication);
     console.log("selectedDrugCategory:", selectedDrugCategory);
  
    const prescriptionData = {
      resourceType: "MedicationRequest",
      id: medicationResourceId || undefined,
      status: "active",
      intent: "order",
      medicationCodeableConcept: { text: selectedDrugName },
      subject: { reference: `Patient/${props.patient_resource_id}`, display: props.patient_name },
      requester: { reference: "Practitioner/12345" },
      dosageInstruction: [{
        text: `${dose} mg every ${frequency}`,
        doseAndRate: [{ doseQuantity: { value: Number(dose), unit: "mg" } }],
        timing: { repeat: { frequency: period, periodUnit: "d" } },
        route: {
          coding: [{
            system: "http://terminology.hl7.org/CodeSystem/route-of-administration",
            code: route.toLowerCase(),
            display: route,
          }]
        }
      }],
      reasonCode: [{ text: selectedDrugUse }],
      note: [{ text: additionalNote }],
      dispenseRequest: {
        validityPeriod: { start: startDate, end: endDate },
        expectedSupplyDuration: { value: totalDays, unit: "days", system: "http://unitsofmeasure.org", code: "d" }
      },
      extension: [
        { url: "http://example.org/fhir/StructureDefinition/totalDoses", valueInteger: totalDoses },
        { url: "http://example.org/fhir/StructureDefinition/administeredCount", valueInteger: 0 }
      ]
    };
  
    try {
      const response = await fetch(`${import.meta.env.VITE_FHIRAPI_URL}/MedicationRequest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + btoa("fhiruser:change-password"),
        },
        body: JSON.stringify(prescriptionData),
      });
  
      if (response.ok) {
        const contentType = response.headers.get("Content-Type");
        let responseData = null;
  
        if (contentType && contentType.includes("application/json")) {
          responseData = await response.json();
        }
  
        setMedicationResourceId(responseData?.id || null);
        console.log("Prescription saved successfully:", responseData);
        setSnackbarMessage("Prescription saved successfully!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        fetchPrescription();
      } else {
        const errorBody = await response.text();
        console.error("Error response:", response.status, response.statusText, errorBody);
        throw new Error(`Request failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error saving Prescription resource:", error);
      setSnackbarMessage("An error occurred while saving the Prescription.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };
  
// Helper function to calculate duration in days
const calculateDuration = (startDate: string, endDate: string): number => {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Helper function to calculate next dose date
// const calculateNextDoseDate = (
//   startDate: string,
//   frequency: number,
//   administeredCount: number
// ): Date | null => {
//   if (!startDate || frequency <= 0) return null;
  
//   const start = new Date(startDate);
//   const hoursBetweenDoses = 24 / frequency;
//   const hoursToAdd = hoursBetweenDoses * administeredCount;
  
//   const nextDate = new Date(start);
//   nextDate.setHours(nextDate.getHours() + hoursToAdd);
  
//   return nextDate;
// };
  // const handlePrescribe = async () => {
  //   setLoading(true);
  
  //   const period = frequency === 'Q12H' ? 12 : frequency === 'Q8H' ? 8 : frequency === 'Q6H' ? 6 : 12;
  
  //   // Existing logic to calculate total doses...
  //   const prescriptionData = {
  //     resourceType: "MedicationRequest",
  //     id: medicationResourceId || undefined,
  //     status: "active",
  //     intent: "order",
  //     medicationCodeableConcept: {
  //       text: selectedDrugName,
  //     },
  //     subject: {
  //       reference: `Patient/${props.patient_resource_id}`,
  //       display: props.patient_name,
  //     },
  //     requester: {
  //       reference: "Practitioner/12345", // Replace with actual Practitioner ID
  //     },
  //     dosageInstruction: [
  //       {
  //         text: `${dose} mg ${route} every ${frequency}`,
  //         doseAndRate: [
  //           {
  //             doseQuantity: {
  //               value: Number(dose),
  //               unit: "mg",
  //             },
  //           },
  //         ],
  //         timing: {
  //           repeat: {
  //             frequency: period,  
  //             period: 1,
  //             periodUnit: "d",
  //           },
  //         },
  //         route: {
  //           coding: [
  //             {
  //               system: "http://terminology.hl7.org/CodeSystem/route-of-administration",
  //               code: route.toLowerCase(),
  //               display: route,
  //             },
  //           ],
  //         },
  //       },
  //     ],
  //     reasonCode: [
  //       {
  //         text: selectedDrugUse,
  //       },
  //     ],
  //     note: [
  //       {
  //         text: additionalNote,
  //       },
  //     ],
  //     dispenseRequest: {
  //       validityPeriod: {
  //         start: startDate,
  //         end: endDate,
  //       },
  //       expectedSupplyDuration: {
  //         value: totalDays,
  //         unit: "days",
  //         system: "http://unitsofmeasure.org",
  //         code: "d",
          
  //       },
  //     },
  //     // Custom extension to store total doses and administered count
  //     extension: [
  //       {
  //         url: "http://example.org/fhir/StructureDefinition/totalDoses",
  //         valueInteger: totalDoses,
  //       },
  //       {
  //         url: "http://example.org/fhir/StructureDefinition/administeredCount",
  //         valueInteger: 0,
  //       },
  //     ],
  //   };
  
  //   try {
  //     const response = await fetch(`${import.meta.env.VITE_FHIRAPI_URL}/MedicationRequest`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: "Basic " + btoa("fhiruser:change-password"),
  //       },
  //       body: JSON.stringify(prescriptionData),
  //     });
  
  //     if (response.ok) {
  //       const responseData = await response.json();
  //       setMedicationResourceId(responseData?.id || null);
  //       console.log("Prescription saved successfully:", responseData);
  
  //       // Add the newly prescribed medication directly to the UI
      
  
  //       setSnackbarMessage("Prescription saved successfully!");
  //       setSnackbarSeverity("success");
  //       setSnackbarOpen(true);
  //     } else {
  //       const errorBody = await response.text();
  //       console.error("Error response body:", errorBody);
  //       throw new Error(`Request failed: ${response.statusText}`);
  //     }
  //   } catch (error) {
  //     console.error("Error saving Prescription resource:", error);
  //     setSnackbarMessage("An error occurred while saving the Prescription.");
  //     setSnackbarSeverity("error");
  //     setSnackbarOpen(true);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  
  
  // const handleAdminister = async (medicationResourceId: string) => {
  //   console.log("medicationId:", medicationResourceId);  // Log the value of medicationId
  //   setAdministering(true);
    
  //   setCurrentMedicationId(medicationResourceId);
  
  //   try {
  //     // Fetch MedicationRequest to get current count and total doses
  //     const medicationRequestResponse = await fetch(
  //       `${import.meta.env.VITE_FHIRAPI_URL}/MedicationRequest/${medicationResourceId}`,
  //       {
  //         method: "GET",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: "Basic " + btoa("fhiruser:change-password"),
  //         },
  //       }
  //     );
  
  //     if (!medicationRequestResponse.ok) {
  //       console.error("Failed to fetch MedicationRequest resource.");
  //       setSnackbarMessage("Failed to fetch MedicationRequest.");
  //       setSnackbarSeverity("error");
  //       return;
  //     }
  
  //     const medicationRequest = await medicationRequestResponse.json();
  //     const extensions = medicationRequest.extension || [];
  //     const totalDoses = extensions.find(
  //       (ext: any) => ext.url === "http://example.org/fhir/StructureDefinition/totalDoses"
  //     )?.valueInteger;
  //     const administeredCount = extensions.find(
  //       (ext: any) => ext.url === "http://example.org/fhir/StructureDefinition/administeredCount"
  //     )?.valueInteger;
  
  //     if (administeredCount === undefined || totalDoses === undefined) {
  //       console.error("MedicationRequest does not have totalDoses or administeredCount.");
  //       setSnackbarMessage("Invalid MedicationRequest: Missing dose tracking information.");
  //       setSnackbarSeverity("error");
  //       return;
  //     }
  
  //     // Update administered count
  //     const updatedAdministeredCount = administeredCount + 1;
  //     const status = updatedAdministeredCount >= totalDoses ? "completed" : "active";
  
  //     const updatedRequest = {
  //       ...medicationRequest,
  //       extension: [
  //         {
  //           url: "http://example.org/fhir/StructureDefinition/totalDoses",
  //           valueInteger: totalDoses,
  //         },
  //         {
  //           url: "http://example.org/fhir/StructureDefinition/administeredCount",
  //           valueInteger: updatedAdministeredCount,
  //         },
  //       ],
  //       status,
  //     };
  
  //     // Update MedicationRequest on FHIR server
  //     const updateResponse = await fetch(
  //       `${import.meta.env.VITE_FHIRAPI_URL}/MedicationRequest/${medicationResourceId}`,
  //       {
  //         method: "PUT",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: "Basic " + btoa("fhiruser:change-password"),
  //         },
  //         body: JSON.stringify(updatedRequest),
  //       }
  //     );
  
  //     if (updateResponse.ok) {
  //       console.log(`Medication administered successfully: ${updatedAdministeredCount}/${totalDoses}`);
  //       setSnackbarMessage(`Medication administered: ${updatedAdministeredCount}/${totalDoses}`);
  //       setSnackbarSeverity("success");
  
  //       // Update local state for real-time reflection
  //       setPrescriptionHistory((prevHistory) =>
  //         prevHistory.map((medication) =>
  //           medication.id === medicationResourceId
  //             ? {
  //                 ...medication,
  //                 administeredCount: updatedAdministeredCount,
  //                 status: updatedAdministeredCount >= totalDoses ? "completed" : "active",
  //               }
  //             : medication
  //         )
  //       );
  //     } else {
  //       console.error("Failed to update MedicationRequest:", await updateResponse.text());
  //       setSnackbarMessage("Failed to update MedicationRequest.");
  //       setSnackbarSeverity("error");
  //     }
  //   } catch (error) {
  //     console.error("Error administering medication:", error);
  //     setSnackbarMessage("An error occurred while administering the medication.");
  //     setSnackbarSeverity("error");
  //   } finally {
  //     setAdministering(false);
  //     setCurrentMedicationId(null);
  //     setSnackbarOpen(true);
  //   }
  // };
  
  const handleAdminister = async (medicationResourceId: string) => {
    console.log("MedicationResourceId:", medicationResourceId);
    setAdministering(true);
    setCurrentMedicationId(medicationResourceId);
    console.log('currentMedicationId',currentMedicationId)

    try {
        // Fetch MedicationRequest to get details
        const medicationRequestResponse = await fetch(
            `${import.meta.env.VITE_FHIRAPI_URL}/MedicationRequest/${medicationResourceId}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Basic " + btoa("fhiruser:change-password"),
                },
            }
        );

        if (!medicationRequestResponse.ok) {
            console.error("Failed to fetch MedicationRequest resource.");
            setSnackbarMessage("Failed to fetch MedicationRequest.");
            setSnackbarSeverity("error");
            return;
        }

        const medicationRequest = await medicationRequestResponse.json();

        // Extract extensions for dose tracking
        const extensions = medicationRequest.extension || [];
        const totalDoses = extensions.find(
            (ext: any) => ext.url === "http://example.org/fhir/StructureDefinition/totalDoses"
        )?.valueInteger;
        const administeredCount = extensions.find(
            (ext: any) => ext.url === "http://example.org/fhir/StructureDefinition/administeredCount"
        )?.valueInteger;

        if (administeredCount === undefined || totalDoses === undefined) {
            console.error("Missing dose tracking information in MedicationRequest.");
            setSnackbarMessage("Invalid MedicationRequest: Missing dose tracking information.");
            setSnackbarSeverity("error");
            return;
        }

        // Check if a MedicationAdministration exists
        const searchUrl = `${import.meta.env.VITE_FHIRAPI_URL}/MedicationAdministration?request=MedicationRequest/${medicationResourceId}`;
        const searchResponse = await fetch(searchUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Basic " + btoa("fhiruser:change-password"),
            },
        });

        if (!searchResponse.ok) {
            console.error("Failed to search for existing MedicationAdministration.");
            setSnackbarMessage("Error checking existing administration.");
            setSnackbarSeverity("error");
            return;
        }

        const searchData = await searchResponse.json();
        const existingAdmin = searchData?.entry?.[0]?.resource;

        if (existingAdmin && existingAdmin.status === "in-progress") {
            console.warn("MedicationAdministration is already in progress.");
            setSnackbarMessage("This medication is already being administered.");
            setSnackbarSeverity("error");
            return;
        }

        // Update administered count and status
        const updatedAdministeredCount = administeredCount + 1;
        const status = updatedAdministeredCount >= totalDoses ? "completed" : "active";

        // Update MedicationRequest on the FHIR server
        const updatedRequest = {
            ...medicationRequest,
            extension: [
                {
                    url: "http://example.org/fhir/StructureDefinition/totalDoses",
                    valueInteger: totalDoses,
                },
                {
                    url: "http://example.org/fhir/StructureDefinition/administeredCount",
                    valueInteger: updatedAdministeredCount,
                },
            ],
            status,
        };

        const updateResponse = await fetch(
            `${import.meta.env.VITE_FHIRAPI_URL}/MedicationRequest/${medicationResourceId}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Basic " + btoa("fhiruser:change-password"),
                },
                body: JSON.stringify(updatedRequest),
            }
        );

        if (!updateResponse.ok) {
            console.error("Failed to update MedicationRequest:", await updateResponse.text());
            setSnackbarMessage("Failed to update MedicationRequest.");
            setSnackbarSeverity("error");
            return;
        }

        const administerData = {
            resourceType: "MedicationAdministration",
            status: "completed",
            medicationReference: medicationRequest.medicationReference
                ? { reference: medicationRequest.medicationReference.reference }
                : undefined,
            medicationCodeableConcept: medicationRequest.medicationCodeableConcept || undefined,
            request: {
                reference: `MedicationRequest/${medicationResourceId}`,
            },
            subject: {
                reference: `Patient/${props.patient_resource_id}`,
            },
            performer: [
                {
                    actor: {
                        reference: "Practitioner/12345", // Replace with actual performer ID
                        display: "Nurse Name", // Replace with dynamic performer name
                    },
                },
            ],
            effectiveDateTime: new Date().toISOString(),
        };

        let response;
        if (existingAdmin) {
            // Update existing MedicationAdministration
            const adminId = existingAdmin.id;
            response = await fetch(
                `${import.meta.env.VITE_FHIRAPI_URL}/MedicationAdministration/${adminId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: "Basic " + btoa("fhiruser:change-password"),
                    },
                    body: JSON.stringify({ ...existingAdmin, ...administerData }),
                }
            );
        } else {
            // Create new MedicationAdministration
            response = await fetch(
                `${import.meta.env.VITE_FHIRAPI_URL}/MedicationAdministration`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: "Basic " + btoa("fhiruser:change-password"),
                    },
                    body: JSON.stringify(administerData),
                }
            );
        }

        if (response.ok) {
            console.log(
                `Medication administered successfully: ${updatedAdministeredCount}/${totalDoses}`
            );
            setSnackbarMessage(`Medication administered: ${updatedAdministeredCount}/${totalDoses}`);
            setSnackbarSeverity("success");
            fetchPrescription();
            fetchAdminister();
        } else {
            console.error("Failed to administer medication:", await response.text());
            setSnackbarMessage("Failed to administer medication.");
            setSnackbarSeverity("error");
        }
    } catch (error) {
        console.error("Error administering medication:", error);
        setSnackbarMessage("An error occurred while administering the medication.");
        setSnackbarSeverity("error");
    } finally {
        setAdministering(false);
        setCurrentMedicationId(null);
        setSnackbarOpen(true);
    }
};

  useEffect(() => {
    fetchPrescription();
    fetchAdminister(); //Fetch Procedure on component mount or when `patient_resource_id` changes
  }, [props.patient_resource_id]);
  
  
  return (
    <Box sx={{  borderRadius: "25px", padding: 2 }}>
    
    {props.UserRole !== "NICU Nurse" && (
      <><DrugCalculator /><Box sx={{ padding: 3, borderRadius: 5, backgroundColor: "#FFFFFF" }}>
          <Typography variant="h6" sx={{ color: "#0F3B61", marginBottom: 3 }}>New Prescription</Typography>

          {/* Drug Name with Autocomplete */}
          <Box sx={{ marginBottom: 3 }}>
            <Typography variant="subtitle2" sx={{ color: "#0F3B61", marginBottom: 1 }}>Drug Name*</Typography>
            <Autocomplete
              freeSolo
              options={drugOptions}
              value={selectedDrug}
              onChange={(_event, newValue) => {
                setSelectedDrug(newValue);
                if (newValue) {
                  setSelectedDrugName(newValue.name);
                  setSelectedDrugCategory(newValue.category);
                  setSelectedDrugUse(newValue.use);
                }
              } }
              onInputChange={(_event: any, newInputValue: string) => {
                if (newInputValue.trim()) {
                  fetchDrugs(newInputValue);
                }
              } }
              getOptionLabel={(option) => option.name}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Start typing name..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#DBE2F2',
                      },
                    },
                    '& .MuiInputBase-root': {
                      color: '#0F3B61',
                    },
                  }} />
              )}
              clearIcon={<ClearIcon sx={{ color: '#0F3B61' }} />} />
          </Box>

          {/* Indication */}
          <Box sx={{ marginBottom: 3 }}>
            <Typography variant="subtitle2" sx={{ color: "#0F3B61", marginBottom: 1 }}>Indication*</Typography>
            <TextField
              placeholder="Eg. Sepsis Prophylaxis"
              fullWidth
              value={selectedDrugUse}
              onChange={(e) => setIndication(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#DBE2F2',
                  },
                },
                '& .MuiInputBase-root': {
                  color: '#0F3B61',
                },
              }} />
          </Box>

          {/* Dosage Table */}
          <Box sx={{ marginBottom: 3 }}>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Dosage"
                value={dose}
                onChange={(e) => setDose(e.target.value)}
                type="number"

                sx={{
                  flex: 1,

                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#DBE2F2',
                    },
                  }, '& .MuiInputBase-root': {
                    color: '#0F3B61', // Text color inside the input
                  },
                  '& .MuiInputLabel-root  ': {
                    color: '#9BA1AE', // Label color (optional)
                  },

                }} />
              <Select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                MenuProps={{ MenuListProps: { disablePadding: true }, sx: { '&& .Mui-selected': { backgroundColor: '#124D81', color: '#FFFFFF', }, }, }}
                sx={{
                  '& .MuiSelect-icon': { color: '#0F3B61', backgroundColor: '#F2FBFF' },

                  flex: 1,
                  color: '#0F3B61',
                  border: '1px solid #DBE2F2', // Adding the red border here
                }}>
                <MenuItem value="mg/kg">mg/kg</MenuItem>
                <MenuItem value="mg">mg</MenuItem>
                <MenuItem value="mcg">mcg</MenuItem>
                <MenuItem value="mL">mL</MenuItem>
              </Select>
              <Select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                fullWidth
                MenuProps={{ MenuListProps: { disablePadding: true }, sx: { '&& .Mui-selected': { backgroundColor: '#124D81', color: '#FFFFFF', }, }, }}
                sx={{
                  '& .MuiSelect-icon': { color: '#0F3B61', backgroundColor: '#F2FBFF' },

                  flex: 1,
                  color: '#0F3B61',
                  border: '1px solid #DBE2F2', // Adding the red border here
                }}>
                <MenuItem value="Q12H">Q12H</MenuItem>
                <MenuItem value="Q8H">Q8H </MenuItem>
                <MenuItem value="Q6H">Q6H</MenuItem>
              </Select>
              <Select value={route} onChange={(e) => setRoute(e.target.value)} fullWidth
                MenuProps={{ MenuListProps: { disablePadding: true }, sx: { '&& .Mui-selected': { backgroundColor: '#124D81', color: '#FFFFFF', }, }, }}
                sx={{
                  '& .MuiSelect-icon': { color: '#0F3B61', backgroundColor: '#F2FBFF' },
                  flex: 1,
                  color: '#0F3B61',
                  border: '1px solid #DBE2F2',
                  // Adding the red border here
                }}>

                <MenuItem value="Oral">Oral</MenuItem>
                <MenuItem value="Intravenous">IV-Intravenous</MenuItem>
                <MenuItem value="Rectal">Rectal</MenuItem>
                <MenuItem value="Epidural">Epidural</MenuItem>
                <MenuItem value="Nasal">Nasal</MenuItem>


              </Select>
            </Box>
          </Box>

          {/* Dates */}
          <Box sx={{ display: "flex", gap: 2, marginBottom: 2 }}>

            <LocalizationProvider dateAdapter={AdapterDateFns}>

              <FormControl fullWidth>
                <DateTimePicker
                  label="Start"
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                  format="dd/MM/yyyy hh:mm a"
                  minDateTime={new Date()}
                  slotProps={{
                    textField: {
                      variant: "outlined",
                      fullWidth: true,
                      size: "medium",
                    },
                  }}
                  sx={{
                    marginBottom: 2,
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#DBE2F2', // Border color when the field is not focused
                      },
                    },
                    '& .MuiInputBase-root': {
                      color: '#0F3B61', // Text color inside the input
                    },
                    '& .MuiInputLabel-root  ': {
                      color: '#9BA1AE', // Label color (optional)
                    },
                  }} />
              </FormControl>
            </LocalizationProvider>

            <FormControl fullWidth>
              <Select
                value={days}
                onChange={(e) => setDays(e.target.value as number)}
                fullWidth
                MenuProps={{ MenuListProps: { disablePadding: true }, sx: { '&& .Mui-selected': { backgroundColor: '#124D81', color: '#FFFFFF', }, }, }}
                sx={{
                  '& .MuiSelect-icon': { color: '#0F3B61', backgroundColor: '#F2FBFF' },

                  color: '#0F3B61',
                  border: '1px solid #DBE2F2', // Adding the red border here
                }}>
                {Array.from({ length: Math.max(days, 7) }, (_, i) => i + 1).map((day) => (
                  <MenuItem key={day} value={day}>
                    {day} Day
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <FormControl fullWidth>
                <DateTimePicker
                  label="End"
                  value={endDate}
                  onChange={handleEndDateChange}
                  format="dd/MM/yyyy hh:mm a"
                  minDateTime={new Date()} // Prevent selecting past dates/times
                  slotProps={{
                    textField: {
                      variant: "outlined",
                      fullWidth: true,
                      size: "medium",
                    },
                  }}
                  sx={{
                    marginBottom: 2,
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#DBE2F2', // Border color when the field is not focused
                      },
                    },
                    '& .MuiInputBase-root': {
                      color: '#0F3B61', // Text color inside the input
                    },
                    '& .MuiInputLabel-root  ': {
                      color: '#9BA1AE', // Label color (optional)
                    },
                  }} />
              </FormControl>
            </LocalizationProvider>
          </Box>

          {/* Additional Notes */}
          <Box sx={{ marginBottom: 3 }}>
            <Typography variant="subtitle2" sx={{ color: "#0F3B61", marginBottom: 1 }}>Additional Notes or Special instruction</Typography>
            <TextField
              placeholder="Enter any additional notes..."
              fullWidth
              multiline
              rows={3}
              value={additionalNote}
              onChange={(e) => setAdditionalNote(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#DBE2F2',
                  },
                },
                '& .MuiInputBase-root': {
                  color: '#0F3B61',
                },
              }} />
          </Box>

          {/* Footer */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 3 }}>
            <Box
              sx={{
                padding: '1%',
                borderRadius: '7px',
                backgroundColor: '#5E84CC1A',
                // Adjust multiplier (10) as needed for desired width
              }}
            >
              <Typography variant="body2" sx={{ color: "#9BA1AE" }}>
                Prescribed by
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  color: "#0F3B61",
                }}
              >
                {props.UserRole}
                <span style={{ color: "green", marginLeft: 4 }}></span>
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 3, justifyContent: "space-between" }}>
              <Button variant="outlined" onClick={resetForm} sx={{ borderColor: "#0F3B61", color: "#0F3B61" }}>
                Reset
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  handlePrescribe();
                  resetForm();
                } }
                sx={{
                  pointerEvents: isFormEmpty() ? 'none' : 'auto',
                  opacity: isFormEmpty() ? 0.5 : 1,
                }}
              >
                Prescribe
              </Button>
            </Box>
          </Box>
        </Box></>)}
    {/* nurse view */}
    
  <Box >
  <Grid container alignItems="center" justifyContent="space-between" >
    <Typography variant="h6" sx={{ color: "#0F3B61" }} gutterBottom>
      Administer
    </Typography>
  </Grid>
  <Divider />
  <Box sx={{ padding: 2, borderRadius: 5}}>
    {loading ? (
      <Typography>Loading...</Typography>
    ) : (
      prescriptionHistory.map((medication, index) => {
        const remainingDoses = Math.max(
          medication.totalDoses - medication.administeredCount,
          0
        );

        if (remainingDoses <= 0) return null;

        // Extract dosage information from dosageInstruction
        // const dosageInstruction = medication.dosageInstruction?.[0];
        // const dose = dosageInstruction?.doseAndRate?.[0]?.doseQuantity;
        // const doseValue = dose?.value || "N/A";
        // const doseUnit = dose?.unit || "";
        
        // Calculate next administration date based on frequency and last administered time
       
        return (
          <Paper
            key={index}
            elevation={0}
            sx={{
              backgroundColor: "#FFFFFF",
              mb:2,
              borderRadius: 2,
              boxShadow: "0px 1px 4px rgba(0, 0, 0, 0.1)",
              padding: 2,
             
            }}
          >
            {/* Top Row - Medication Name */}
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Box sx={{ display: "flex",gap:2,alignItems:'center',justifyContent:'center'}} >
              <FontAwesomeIcon
              icon={faPrescription}
              style={{
                
                color: "#228BE6",
              }}
            />
              <Typography variant="subtitle1" sx={{ color: "#124D81", fontWeight: "bold" }}>
                {medication.name}
              </Typography>
              </Box>
           
              <Typography variant="body2" sx={{ color: "#A7B3CD" }}>
                Started:    {new Date(medication.startDate).toLocaleString() || "N/A"}
              </Typography>
            </Box>

            {/* Dosage Information Row */}
            <Box sx={{ 
              display: "flex", 
              justifyContent: "space-between",
              backgroundColor: "#F8FAFF",
              padding: 1,
              mb:1,
              borderRadius: 1,
              
            }}>
              <Box>
                <Typography variant="body2" sx={{ color: "#A7B3CD" }}>Dosage</Typography>
                <Typography variant="subtitle2" sx={{ color: "#495057",fontWeight: "bold" }}>
                {medication.frequency1 }
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: "#A7B3CD" }}>Route</Typography>
                <Typography variant="subtitle2" sx={{ color: "#495057",fontWeight: "bold" }}>
                  {medication.route}
                </Typography>
              </Box>
             
              <Box>
                <Typography variant="body2" sx={{ color: "#A7B3CD" }}>Duration</Typography>
                <Typography variant="subtitle2" sx={{ color: "#495057",fontWeight: "bold" }}>
                  {calculateDuration(medication.startDate, medication.endDate)} days
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: "#A7B3CD" }}>Administered</Typography>
                <Typography variant="subtitle2" sx={{ color: "#495057",fontWeight: "bold" }}>
                {medication.administeredCount}/{medication.totalDoses}
                </Typography>
              </Box>
            </Box>

            {/* Indication and Prescriber */}
            <Box sx={{ marginBottom: 1  }}>
              <Typography variant="body2" sx={{ color: "#A7B3CD" }}>
                Indication: <span style={{ color: "#495057"}}>{medication.use}</span>
              </Typography>
            </Box>

            {/* Administer Section */}
            <Box sx={{ 
              display: "flex", 
              justifyContent: "space-between",
              alignItems: "center",
             
              
  
            }}>
              <Box>
              <Typography variant="body2" sx={{ color: "#A7B3CD" }}>
                  Next: <span style={{ color: "#124D81", fontWeight: "bold" }}>
                  {/* {nextDoseDate ? new Date(nextDoseDate).toLocaleTimeString() : "N/A"} */}

                    {/* {nextDoseDate ? new Date(nextDoseDate).toLocaleString() : "N/A"} */}
                  </span>
                </Typography>
               
              
              </Box>
              <Box>
             
                <Typography variant="body2" sx={{ color: "#A7B3CD" }}>
                  Administered by : <span style={{ color: "#124D81", fontWeight: "bold" }}>
                   --
                  </span>
                </Typography>
              
              </Box>
              
              <Button
                variant="contained"
                sx={{color:'white',backgroundColor:'#228BE6'}}
                disabled={
                  medication.administeredCount >= medication.totalDoses ||
                  administering
                }
                onClick={() => handleAdminister(medication.id)}
              >
                {medication.administeredCount >= medication.totalDoses
                  ? "Completed"
                  : "Administer"}
              </Button>
            </Box>
          </Paper>
        );
      })
    )}
  </Box>
</Box>
    
      {/* Medications  adding */}
     
      <Box marginTop={5}>
     
          <Typography variant="h6" sx={{ color: "#0F3B61" }} gutterBottom>
            Medications
          </Typography>
      
       
        {/* {administrationHistory.map((medication, index) => (
          <TableContainer
          key={index}
          component={Paper}
          elevation={0}
          sx={{
            backgroundColor: "#FFFFFF",
            marginBottom: '25px',
            borderRadius: 3,
            boxShadow: "0px 1px 4px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Table
            sx={{
              "& .MuiTableCell-root": {
                borderBottom: "none",
                paddingY: "12px",
              },
              "& .MuiTableRow-root": {
                borderBottom: "1px solid #E0E0E0",
              },
            }}
          >
            <TableBody>
              <TableRow
                sx={{
                  position: "relative",
                  backgroundColor: "#f2faf4",
                  "&:before": {
                    content: '""',
                    display: "block",
                    width: "8px",
                    height: "100%",
                    position: "absolute",
                    left: 0,
                    top: 0,
                  },
                }}
              >
               
                <TableCell sx={{ color: "#124D81" }}>
                  <Typography variant="subtitle1">{medication.name}</Typography>
                  <Typography color="#A7B3CD">
                    Started:{" "}
                    <Typography variant="caption" component="span" color="#124D81" fontWeight="bold">
                    {new Date(medication.effectiveDateTime).toLocaleString()}
                    </Typography>
                  </Typography>
                </TableCell>
             
                <TableCell align="center">
                  <Typography color="#A7B3CD">
                    Status:{" "}
                    <Typography component="span" color="#124D81" fontWeight="bold">
                    {medication.status}
                    </Typography>
                  </Typography>
                </TableCell>
                
                <TableCell
                 sx={{ color: "#124D81" }}
                  align="center"
                >
                 {new Date(medication.effectiveDateTime).toLocaleString()}
                </TableCell>
              </TableRow>

            </TableBody>
          </Table>
        </TableContainer>
 
))} */}



{administrationHistory.map((medication, index) => (
  <Paper
    key={index}
    elevation={0}
    sx={{
      backgroundColor: "#FFFFFF",
      marginBottom: '25px',
      borderRadius: 3,
      boxShadow: "0px 1px 4px rgba(0, 0, 0, 0.1)",
      padding: 2,
    }}
  >
   <Grid
  container
  alignItems="center"
  justifyContent="space-between"
  spacing={2}
>
  {/* Rx Icon */}
  {/* <Grid item>
    <Box
      sx={{
        width: 48,
        height: 48,
        backgroundColor: "#E6F0FA",
        borderRadius: "10px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "20px",
        color: "#124D81",
        fontWeight: "bold",
      }}
    >
      Rx
    </Box>
  </Grid> */}

  {/* Medication Name + Status */}
  <Grid item sx={{ minWidth: 150 }}>
    <Stack spacing={1}>
      <Typography variant="subtitle1" fontWeight="bold" color="#124D81">
        {medication.name}
      </Typography>
      <Typography
        variant="caption"
        sx={{
          backgroundColor: "#F0F0F0",
          borderRadius: "4px",
          paddingX: 1,
          paddingY: "2px",
          color: "#666",
          fontWeight: 500,
          fontSize: "11px",
          width: "fit-content",
        }}
      >
        {medication.status}
      </Typography>
    </Stack>
  </Grid>

  {/* Dosage, Frequency, Route, Duration */}
  <Grid item sx={{ flexGrow: 1 }}>
    <Grid container justifyContent="space-between">
      {[
        { label: "Dosage", value: "100 mg/kg" },
        { label: "Frequency", value: "Q12H" },
        { label: "Route", value: "IV" },
        { label: "Duration", value: "7 Days" },
      ].map((item, idx) => (
        <Grid item key={idx}>
          <Typography color="#A7B3CD" fontSize="12px">
            {item.label}
          </Typography>
          <Typography fontWeight="bold" color="#124D81">
            {item.value}
          </Typography>
        </Grid>
      ))}
    </Grid>
  </Grid>
</Grid>


    {/* Bottom row for indication, doctor, and start date */}
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      mt={2}
    >
      <Typography variant="body2" color="#124D81">
        <strong>Indication:</strong> Sepsis Prophylaxis
      </Typography>
      <Typography variant="body2" color="#A7B3CD">
        Dr. Rebecca T &nbsp;&nbsp;|&nbsp;&nbsp;
        <strong style={{ color: "#124D81" }}>
          Start Date: {new Date(medication.effectiveDateTime).toLocaleDateString()}
        </strong>
      </Typography>
    </Stack>
  </Paper>
))}




 {/* <TableContainer
  component={Paper}
  elevation={0}
  sx={{
    backgroundColor: "#FFFFFF",
    borderRadius: 3,
    boxShadow: "0px 1px 4px rgba(0, 0, 0, 0.1)",
  }}
>
  <Table
  
    sx={{
      "& .MuiTableCell-root": {
        borderBottom: "none", 
        paddingY: "12px", 
      },
      "& .MuiTableRow-root": {
        borderBottom: "1px solid #E0E0E0", 
      },
    }}
  >
    <TableBody>
      {medicationList.map((medication, index) => (
        <TableRow
          key={index}
          sx={{
            position: "relative",
            backgroundColor: medication.isCritical ? "#FFF7F7" : "inherit",
            marginBottom: "12px", 
            "&:before": {
              content: '""',
              display: "block",
              width: "8px",
              height: "100%",
              backgroundColor: medication.isCritical
                ? "#FF5A5F"
                : medication.isCritical
                ? "#FFD700"
                : "#4CAF50",
              position: "absolute",
              left: 0,
              top: 0,
            },
          }}
        >
          
          <TableCell sx={{ color: medication.isCritical ? "red" : "#124D81" }}>
            <Typography variant="h6">{medication.name}</Typography>
            <Typography color="#A7B3CD">
              Started:{" "}
              <Typography variant="caption" component="span" color="#124D81" fontWeight="bold">
                {medication.startDate
                  ? new Date(medication.startDate).toLocaleString()
                  : "N/A"}
              </Typography>
            </Typography>
          </TableCell>

       
          <TableCell align="center">
            <Typography color="#124D81">
              {medication.dose}{" "}
              <Typography variant="caption" component="span" color="#124D81" fontWeight="bold">
                mg
              </Typography>
            </Typography>
          </TableCell>

         
          <TableCell style={{ color: "#124D81" }} align="center">
            <FontAwesomeIcon
              icon={faClock}
              style={{
                marginRight: "6px",
                color: "#A7B3CD",
              }}
            />
            {medication.frequency}
          </TableCell>

         
          <TableCell align="center">
            <Typography color="#A7B3CD">
              Route:{" "}
              <Typography component="span" color="#124D81" fontWeight="bold">
                {medication.route}
              </Typography>
            </Typography>
          </TableCell>

         
          <TableCell
            style={{
              color: medication.isCritical ? "red" : "#124D81",
              fontWeight: medication.isCritical ? "bold" : "normal",
            }}
            align="center"
          >
            {medication.endDate
              ? new Date(medication.endDate).toLocaleTimeString()
              : "N/A"}
          </TableCell>


         
        </TableRow>
      ))}
    </TableBody>
  </Table>
</TableContainer> */}

      </Box>
    
      <Snackbar
      open={snackbarOpen}
      autoHideDuration={6000}
      onClose={handleCloseSnackbar}
     
    >
      <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: "100%" }}>
        {snackbarMessage}
      </Alert>
    </Snackbar>
    </Box>
   
  );
};



