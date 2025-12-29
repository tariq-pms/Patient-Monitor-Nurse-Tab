import {Box,Typography,Tabs,Tab,Paper,IconButton,Stack} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useParams, useNavigate } from "react-router-dom";
import { FC, useEffect, useState } from "react";
import Avatar from "@mui/material/Avatar";
import InitialAssessment from "../components/InitialAssessment";
import AdmissionDetails from "../components/AdmissionDetails";
import { NurseAssessment } from "../components/InitialAssessmentNurse";
export interface PatientDetails {
  userOrganization: string;
  UserRole:string;
  
}
export const PatientProfile: FC<PatientDetails> = (props): JSX.Element => {
// export default function PatientProfile() {

  const navigate = useNavigate();
  const [patient, setPatient] = useState<any>(null);
  const [tabIndex, setTabIndex] = useState(0);
 const { patientId } = useParams<{ patientId: string }>();
 

 const fetchPatientDetails = async (patientId: string) => {
    const BASE = import.meta.env.VITE_FHIRAPI_URL;
    const AUTH = {
      Authorization: "Basic " + btoa("fhiruser:change-password"),
    };
  
    /* =========================
       1️⃣ PATIENT
    ========================= */
    const patientRes = await fetch(`${BASE}/Patient/${patientId}`, {
      headers: AUTH,
    });
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
  };

  const [patientDetails, setPatientDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  if (!patientId) return;

  const load = async () => {
    setLoading(true);
    const data = await fetchPatientDetails(patientId);
    console.log("🧾 Patient Details:", data);
    setPatientDetails(data);
    setLoading(false);
  };

  load();
}, [patientId]);

  useEffect(() => {
    loadPatientData();
  }, []);


  const loadPatientData = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_FHIRAPI_URL}/Patient/${patientId}`,
        {
          headers: {
            Authorization: "Basic " + btoa("fhiruser:change-password"),
          },
        }
      );

      const data = await res.json();
      setPatient(data);
    } catch (err) {
      console.error("❌ Error fetching patient:", err);
    }
  };

  if (!patient) return <Typography>{loading}</Typography>;
  
  return (
    <Box sx={{ p: 0 }}>
      <Paper
  sx={{
    p: 1,
    alignItems:"center",
    justifyContent:'center',
    
    borderRadius: 2,
    border: "1px solid #E0E6F1",
    backgroundColor: "#FFFFFF",
    boxShadow:"none"
  }}
>
  {/* TOP ROW */}
     
    <Box
   
    sx={{
      display: "flex",
      alignItems:'center',
      justifyContent:'space-between',
    }}
  >
     <IconButton onClick={() => navigate(-1)}>
      <ArrowBackIcon sx={{color:'#124D81'}}/>
    </IconButton>
    <Stack direction="row" alignItems="center" spacing={2}>
  <Avatar sx={{ width: 40, height: 40 }} />
  <ProfileField
    label="Patient Name"
    value={`B/o ${patientDetails?.motherName}`}
  />
</Stack>

     

    <ProfileField
      label="UHID"
    
      value={patientDetails?.patientId}
    />

    <ProfileField
      label="Admission no"
      value={patientDetails?.admissionNo}
    />

    <ProfileField
      label="Bed no"
      value={patientDetails?.bed}
    />

    <ProfileField
      label="DOB"
      value={patientDetails?.birthDate}
    />

    <ProfileField
      label="Gender"
      value={patientDetails?.gender}
    />

    <ProfileField
      label="GA"
      value={patientDetails?.gestationalAge}
    />

    <ProfileField
      label="Birth weight"
      value={
        patientDetails?.birthWeight
          ? `${patientDetails.birthWeight} g`
          : "--"
      }
    />
  </Box>




  {/* INFO STRIP */}
 
      </Paper>

      <Tabs
        value={tabIndex}
        onChange={(_e, v) => setTabIndex(v)}
        sx={{ mt: 2, borderBottom: "1px solid #D9E1EE" }}
      >
        <Tab sx={{color:"#000"}}label="Initial Assessments" />
        <Tab sx={{color:"#000"}}label="Nurse Assessments"/>
        <Tab sx={{color:"#000"}}label="Admission Details" />
        <Tab sx={{color:"#000"}}label="Audit Logs" />
        <Tab sx={{color:"#000"}} label="Other Docs" />
      </Tabs>

      {/* ---------------------- */}
      {/* TAB CONTENT */}
      {/* ---------------------- */}

      <Box sx={{ mt: 3 }}>
      {tabIndex === 0 && (
  <>
    {patientDetails?.patientResourceId &&
      patientDetails?.encounterId && (
        <InitialAssessment
        patient={patientDetails} patientId={patientDetails.patientResourceId} patientId1={patientDetails.patientId} patient_name={patientDetails.motherName}
        encounterId={patientDetails.encounterId} gender={patientDetails.gender}     admission_date={patientDetails.admissionDate}
        gestational_age= {patientDetails.gestationalAge} 
        UserRole={props.UserRole} 
       admissionNo={patientDetails.admissionNo}
        birth_weight={patientDetails.birthWeight}
        />
      )}
  </>
)}

        {tabIndex === 1 && <NurseAssessment  patient={patientDetails} patientId={patientDetails.patientResourceId} patientId1={patientDetails.patientId} patient_name={patientDetails.motherName}
          encounterId={patientDetails.encounterId} gender={patientDetails.gender}     admission_date={patientDetails.admissionDate}
          gestational_age= {patientDetails.gestationalAge} 
          UserRole={props.UserRole} 
         admissionNo={patientDetails.admissionNo}
          birth_weight={patientDetails.birthWeight} />}
        {tabIndex === 2 && <AdmissionDetails
          patient={patientDetails} userOrganization={props.userOrganization}  userRole={props.UserRole}
/>}
        {tabIndex === 3 && <AuditLogs />}
        {tabIndex === 4 && <OtherDocs />}
      </Box>
    </Box>
  );
}

/* ---------------------- */
/* Small field component */
/* ---------------------- */
const ProfileField = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <Box sx={{ minWidth: 120 }}>
    <Typography
      sx={{
        fontSize: 12,
        color: "#6B7280",
        lineHeight: 1.2,
      }}
    >
      {label}
    </Typography>
    <Typography
      sx={{
        fontSize: 14,
        fontWeight: 600,
        color: "#111827",
        lineHeight: 1.4,
      }}
    >
      {value || "--"}
    </Typography>
  </Box>
);

// function ExpandableSection({ title, index, children }) {
//   const [open, setOpen] = useState(false);

//   return (
//     <Paper
//       sx={{
//         p: 2,
//         borderRadius: 2,
//         backgroundColor: "#FFFFFF",
//         border: "1px solid #E2E8F0",
//       }}
//     >
//       {/* HEADER */}
//       <Box
//         onClick={() => setOpen(!open)}
//         sx={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           cursor: "pointer",
//         }}
//       >
//         <Typography sx={{ fontWeight: 600, color: "#0F2B45" }}>
//           {index}. {title}
//         </Typography>

//         <Typography
//           sx={{
//             fontSize: 26,
//             color: "#228BE6",
//             fontWeight: 600,
//             transform: open ? "rotate(45deg)" : "rotate(0deg)",
//             transition: "0.2s",
//             lineHeight: 1,
//           }}
//         >
//           +
//         </Typography>
//       </Box>

//       {/* CONTENT */}
//       <Collapse in={open}>
//         <Divider sx={{ my: 2 }} />

//         <Box sx={{ p: 1 }}>{children}</Box>
//       </Collapse>
//     </Paper>
//   );
// }



/* ---------------------- */
/* Initial Assessment Sections */
/* ---------------------- */
// function InitialAssessment() {
//   const [planOfCare, setPlanOfCare] = useState({
//   planForDay: "",
//   investigations: [] as string[],
//   medications: [
//     {
//       name: "",
//       dose: "",
//       frequency: "",
//       lastDose: ""
//     }
//   ],
//   newMedication: {
//     name: "",
//     dose: "",
//     frequency: "",
//     lastDose: ""
//   }
// });
// const addPlanText = (text: string) => {
//   setPlanOfCare((prev) => ({
//     ...prev,
//     planForDay: prev.planForDay
//       ? prev.planForDay + ", " + text
//       : text
//   }));
// };

// const toggleInvestigation = (test: string) => {
//   setPlanOfCare((prev) => ({
//     ...prev,
//     investigations: prev.investigations.includes(test)
//       ? prev.investigations.filter((i) => i !== test)
//       : [...prev.investigations, test]
//   }));
// };

// const updateNewMedication = (key: string, value: string) => {
//   setPlanOfCare((prev) => ({
//     ...prev,
//     newMedication: {
//       ...prev.newMedication,
//       [key]: value
//     }
//   }));
// };

// const addMedication = () => {
//   setPlanOfCare((prev) => ({
//     ...prev,
//     medications: [...prev.medications, prev.newMedication],
//     newMedication: { name: "", dose: "", frequency: "", lastDose: "" }
//   }));
// };


// const [chiefComplaint, setChiefComplaint] = useState("");

//     const [birthType, setBirthType] = useState<string | null>("NVD"); // default selected
//   const [liquorStatus, setLiquorStatus] = useState<string | null>("Clear"); 
//     const [birthHistory, setBirthHistory] = useState({
//   chiefComplaints: "",
//   presentIllness: "",
//   birthType: null,
//   liquorStatus: null,
//   criedImmediately: false,
//   resuscitation: false,
//   vitaminK: false,
//   gestWeeks: "",
//   gestDays: "",
//   birthWeight: "",
//   vaccination: "",
//   apgar1: "",
//   apgar5: "",
//   apgar10: "",
// });
// const isBirthHistoryComplete = () => {
//   return (
//     birthHistory.chiefComplaints.trim() !== "" &&
//     birthHistory.presentIllness.trim() !== "" &&

//     birthHistory.gestWeeks.trim() !== "" &&
//     birthHistory.gestDays.trim() !== "" &&
//     birthHistory.birthWeight.trim() !== "" &&
//     birthHistory.vaccination.trim() !== "" &&
//     birthHistory.apgar1 !== ""
 
//   );
// };

//   const [vitals, setVitals] = useState({
//     temp: "",
//     hr: "",
//     rr: "",
//     spo2: "",
//     relatedText: "",
//     weight: "",
//     hc: "",
//     length: "",
//     bsl: "",
//     bp: ""
//   });

//   const isVitalsComplete = () => {
//     return (
//       vitals.temp &&
//       vitals.hr &&
//       vitals.rr &&
//       vitals.spo2 &&
//       vitals.weight &&
//       vitals.hc &&
//       vitals.length &&
//       vitals.bsl &&
//       vitals.bp
//     );
//   };
   
//   const [exam, setExam] = useState({
//     consciousness: "",
//     color: [],
//     skin: [],
//     skinOther: "",
//     headNeck: [],
//     headNeckOther: "",
//     headNeckDesc: "",
//     ear: [],
//     earOther: "",
//     earDesc: "",
//     nose: [],
//     noseOther: "",
//     noseDesc: "",
//     throat: [],
//     throatOther: "",
//     throatDesc: "",
//     eyes: [],
//     eyesOther: "",
//     eyesDesc: "",
//     spineBack:[],
//     spineBackOther:"",
//     spineBackDesc:"",
//     hipsLimbs:[],
//     hipsLimbsOther:"",
//     hipsLimbsDesc:"",
//     respiratory: [],
// respiratoryOther: "",
// respiratoryDesc: "",

// cardio: [],
// cardioOther: "",
// cardioDesc: "",

// gi: [],
// giOther: "",
// giDesc: "",

// cns: [],
// cnsOther: "",
// cnsDesc: "",

// gu: [],
// guOther: "",
// guDesc: "",

// msk: [],
// mskOther: "",
// mskDesc: "",

//   });

//   // REQUIRED FIELDS → Fill these according to your logic
//   const isGeneralPhysicalComplete = () => {
//     return (
//       exam.consciousness &&
//       exam.color.length > 0 &&
//       (exam.skin.length > 0 || exam.skinOther.trim() !== "")
//     );
//   };
//   const saveInitialAssessment = async (
//     patientId: string,
//     encounterId: string
//   ) => {
//     const BASE = import.meta.env.VITE_FHIRAPI_URL;
//     const AUTH = {
//       "Content-Type": "application/fhir+json",
//       Authorization: "Basic " + btoa("fhiruser:change-password"),
//     };
  
//     try {
//       /* ===============================
//          1️⃣ BIRTH HISTORY OBSERVATION
//       =============================== */
//       const birthHistoryPayload = {
//         resourceType: "Observation",
//         status: "final",
//         code: { text: "Birth History" },
//         subject: { reference: `Patient/${patientId}` },
//         encounter: { reference: `Encounter/${encounterId}` },
//         component: [
//           { code: { text: "Present Illness" }, valueString: birthHistory.presentIllness },
//           { code: { text: "Type of Birth" }, valueString: birthType },
//           { code: { text: "Liquor Status" }, valueString: liquorStatus },
//           { code: { text: "Gestation" }, valueString: `${birthHistory.gestWeeks}W ${birthHistory.gestDays}D` },
//           { code: { text: "Birth Weight" }, valueQuantity: { value: Number(birthHistory.birthWeight), unit: "g" } },
//           { code: { text: "Vaccination" }, valueString: birthHistory.vaccination },
//           { code: { text: "APGAR 1 min" }, valueString: birthHistory.apgar1 },
//           { code: { text: "APGAR 5 min" }, valueString: birthHistory.apgar5 },
//           { code: { text: "APGAR 10 min" }, valueString: birthHistory.apgar10 },
//         ],
//       };
  
//       await fetch(`${BASE}/Observation`, {
//         method: "POST",
//         headers: AUTH,
//         body: JSON.stringify(birthHistoryPayload),
//       });
  
//       /* ===============================
//          2️⃣ CHIEF COMPLAINT → CONDITION
//       =============================== */
//       if (chiefComplaint) {
//         const complaints = chiefComplaint.split(",").map(c => c.trim());
  
//         for (const complaint of complaints) {
//           const conditionPayload = {
//             resourceType: "Condition",
//             clinicalStatus: { text: "active" },
//             code: { text: complaint },
//             subject: { reference: `Patient/${patientId}` },
//             encounter: { reference: `Encounter/${encounterId}` },
//           };
  
//           await fetch(`${BASE}/Condition`, {
//             method: "POST",
//             headers: AUTH,
//             body: JSON.stringify(conditionPayload),
//           });
//         }
//       }
//         /* ===============================
//          3️⃣ VITAL SIGNS OBSERVATIONS
//       =============================== */
//       const vitalsMap = [
//         { label: "Body Temperature", value: vitals.temp, unit: "°C" },
//         { label: "Heart Rate", value: vitals.hr, unit: "beats/min" },
//         { label: "Respiratory Rate", value: vitals.rr, unit: "breaths/min" },
//         { label: "Oxygen Saturation", value: vitals.spo2, unit: "%" },
//       ];
  
//       for (const v of vitalsMap) {
//         if (!v.value) continue;
  
//         await fetch(`${BASE}/Observation`, {
//           method: "POST",
//           headers: AUTH,
//           body: JSON.stringify({
//             resourceType: "Observation",
//             status: "final",
//             code: { text: v.label },
//             subject: { reference: `Patient/${patientId}` },
//             encounter: { reference: `Encounter/${encounterId}` },
//             valueQuantity: {
//               value: Number(v.value),
//               unit: v.unit,
//             },
//           }),
//         });
//       }
  
//       /* ===============================
//          4️⃣ ANTHROPOMETRY
//       =============================== */
//       const measurements = [
//         { label: "Weight", value: vitals.weight, unit: "g" },
//         { label: "Head Circumference", value: vitals.hc, unit: "cm" },
//         { label: "Length", value: vitals.length, unit: "cm" },
//       ];
  
//       for (const m of measurements) {
//         if (!m.value) continue;
  
//         await fetch(`${BASE}/Observation`, {
//           method: "POST",
//           headers: AUTH,
//           body: JSON.stringify({
//             resourceType: "Observation",
//             status: "final",
//             code: { text: m.label },
//             subject: { reference: `Patient/${patientId}` },
//             encounter: { reference: `Encounter/${encounterId}` },
//             valueQuantity: {
//               value: Number(m.value),
//               unit: m.unit,
//             },
//           }),
//         });
//       }
  
//       /* ===============================
//          5️⃣ BSL / BP
//       =============================== */
//       if (vitals.bsl) {
//         await fetch(`${BASE}/Observation`, {
//           method: "POST",
//           headers: AUTH,
//           body: JSON.stringify({
//             resourceType: "Observation",
//             status: "final",
//             code: { text: "Blood Glucose" },
//             subject: { reference: `Patient/${patientId}` },
//             encounter: { reference: `Encounter/${encounterId}` },
//             valueQuantity: {
//               value: Number(vitals.bsl),
//               unit: "mg/dL",
//             },
//           }),
//         });
//       }
  
//       if (vitals.bp) {
//         await fetch(`${BASE}/Observation`, {
//           method: "POST",
//           headers: AUTH,
//           body: JSON.stringify({
//             resourceType: "Observation",
//             status: "final",
//             code: { text: "Blood Pressure" },
//             subject: { reference: `Patient/${patientId}` },
//             encounter: { reference: `Encounter/${encounterId}` },
//             valueString: vitals.bp,
//           }),
//         });
//       }

//       /* ===============================
//    6️⃣ GENERAL PHYSICAL EXAMINATION
// ================================ */
// const generalExamPayload = {
//   resourceType: "Observation",
//   status: "final",
//   code: { text: "General Physical Examination" },
//   subject: { reference: `Patient/${patientId}` },
//   encounter: { reference: `Encounter/${encounterId}` },

//   component: [
//     {
//       code: { text: "Level of Consciousness" },
//       valueString: exam.consciousness,
//     },

//     {
//       code: { text: "Color" },
//       valueString: exam.color.join(", "),
//     },

//     {
//       code: { text: "Skin Findings" },
//       valueString: exam.skin.join(", "),
//     },
//     {
//       code: { text: "Skin Other Findings" },
//       valueString: exam.skinOther,
//     },

//     {
//       code: { text: "Head & Neck Findings" },
//       valueString: exam.headNeck.join(", "),
//     },
//     {
//       code: { text: "Head & Neck Other" },
//       valueString: exam.headNeckOther,
//     },
//     {
//       code: { text: "Head & Neck Description" },
//       valueString: exam.headNeckDesc,
//     },

//     {
//       code: { text: "ENT - Ear Findings" },
//       valueString: exam.ear.join(", "),
//     },
//     {
//       code: { text: "ENT - Ear Other" },
//       valueString: exam.earOther,
//     },
//     {
//       code: { text: "ENT - Ear Description" },
//       valueString: exam.earDesc,
//     },

//     {
//       code: { text: "ENT - Nose Findings" },
//       valueString: exam.nose.join(", "),
//     },
//     {
//       code: { text: "ENT - Nose Other" },
//       valueString: exam.noseOther,
//     },
//     {
//       code: { text: "ENT - Nose Description" },
//       valueString: exam.noseDesc,
//     },

//     {
//       code: { text: "ENT - Throat Findings" },
//       valueString: exam.throat.join(", "),
//     },
//     {
//       code: { text: "ENT - Throat Other" },
//       valueString: exam.throatOther,
//     },
//     {
//       code: { text: "ENT - Throat Description" },
//       valueString: exam.throatDesc,
//     },

//     {
//       code: { text: "ENT - Eye Findings" },
//       valueString: exam.eyes.join(", "),
//     },
//     {
//       code: { text: "ENT - Eye Other" },
//       valueString: exam.eyesOther,
//     },
//     {
//       code: { text: "ENT - Eye Description" },
//       valueString: exam.eyesDesc,
//     },

//     {
//       code: { text: "Spine & Back Findings" },
//       valueString: exam.spineBack.join(", "),
//     },
//     {
//       code: { text: "Spine & Back Other" },
//       valueString: exam.spineBackOther,
//     },
//     {
//       code: { text: "Spine & Back Description" },
//       valueString: exam.spineBackDesc,
//     },

//     {
//       code: { text: "Hips & Limbs Findings" },
//       valueString: exam.hipsLimbs.join(", "),
//     },
//     {
//       code: { text: "Hips & Limbs Other" },
//       valueString: exam.hipsLimbsOther,
//     },
//     {
//       code: { text: "Hips & Limbs Description" },
//       valueString: exam.hipsLimbsDesc,
//     },
//   ].filter(
//     (c) =>
//       c.valueString !== undefined &&
//       c.valueString !== null &&
//       c.valueString !== ""
//   ),
// };

// await fetch(`${BASE}/Observation`, {
//   method: "POST",
//   headers: AUTH,
//   body: JSON.stringify(generalExamPayload),
// });
// /* ===============================
//    7️⃣ SYSTEMATIC EXAMINATION
// ================================ */
// const systematicExamPayload = {
//   resourceType: "Observation",
//   status: "final",
//   code: { text: "Systematic Examination" },
//   subject: { reference: `Patient/${patientId}` },
//   encounter: { reference: `Encounter/${encounterId}` },

//   component: [
//     {
//       code: { text: "Respiratory Findings" },
//       valueString: exam.respiratory.join(", "),
//     },
//     {
//       code: { text: "Respiratory Other" },
//       valueString: exam.respiratoryOther,
//     },
//     {
//       code: { text: "Respiratory Description" },
//       valueString: exam.respiratoryDesc,
//     },

//     {
//       code: { text: "Cardiovascular Findings" },
//       valueString: exam.cardio.join(", "),
//     },
//     {
//       code: { text: "Cardiovascular Other" },
//       valueString: exam.cardioOther,
//     },
//     {
//       code: { text: "Cardiovascular Description" },
//       valueString: exam.cardioDesc,
//     },

//     {
//       code: { text: "GI Findings" },
//       valueString: exam.gi.join(", "),
//     },
//     {
//       code: { text: "GI Other" },
//       valueString: exam.giOther,
//     },
//     {
//       code: { text: "GI Description" },
//       valueString: exam.giDesc,
//     },

//     {
//       code: { text: "CNS Findings" },
//       valueString: exam.cns.join(", "),
//     },
//     {
//       code: { text: "CNS Other" },
//       valueString: exam.cnsOther,
//     },
//     {
//       code: { text: "CNS Description" },
//       valueString: exam.cnsDesc,
//     },

//     {
//       code: { text: "Genitourinary Findings" },
//       valueString: exam.gu.join(", "),
//     },
//     {
//       code: { text: "Genitourinary Other" },
//       valueString: exam.guOther,
//     },
//     {
//       code: { text: "Genitourinary Description" },
//       valueString: exam.guDesc,
//     },

//     {
//       code: { text: "Musculoskeletal Findings" },
//       valueString: exam.msk.join(", "),
//     },
//     {
//       code: { text: "Musculoskeletal Other" },
//       valueString: exam.mskOther,
//     },
//     {
//       code: { text: "Musculoskeletal Description" },
//       valueString: exam.mskDesc,
//     },
//   ].filter(
//     (c) => c.valueString && c.valueString.trim() !== ""
//   ),
// };

// await fetch(`${BASE}/Observation`, {
//   method: "POST",
//   headers: AUTH,
//   body: JSON.stringify(systematicExamPayload),
// });
// /* ===============================
//    8️⃣ PLAN OF CARE / TREATMENT
// ================================ */
// const carePlanPayload = {
//   resourceType: "CarePlan",
//   status: "active",
//   intent: "plan",
//   title: "Initial Treatment Plan",
//   subject: { reference: `Patient/${patientId}` },
//   encounter: { reference: `Encounter/${encounterId}` },
//   period: {
//     start: new Date().toISOString(),
//   },
//   activity: [
//     {
//       detail: {
//         kind: "ServiceRequest",
//         description: planOfCare.planForDay,
//       },
//     },
//     ...planOfCare.investigations.map((inv) => ({
//       detail: {
//         kind: "ServiceRequest",
//         description: inv,
//       },
//     })),
//   ],
//   note: [
//     {
//       text: planOfCare.medications
//         .map(
//           (m) =>
//             `${m.name} ${m.dose} ${m.frequency} (Last: ${m.lastDose})`
//         )
//         .join(" | "),
//     },
//   ],
// };

// await fetch(`${BASE}/CarePlan`, {
//   method: "POST",
//   headers: AUTH,
//   body: JSON.stringify(carePlanPayload),
// });

  
//       console.log("✅ Initial Assessment saved successfully");
  
//     } catch (err) {
//       console.error("❌ Failed to save Initial Assessment", err);
//       throw err;
//     }
//   };
  
//   // Reusable checkbox handler
//   const toggleValue = (field, value) => {
//     const arr = exam[field];
//     const updated = arr.includes(value)
//       ? arr.filter((v) => v !== value)
//       : [...arr, value];

//     setExam({ ...exam, [field]: updated });
//   };
//   return (
//     <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
//       <Typography
//         sx={{
//           fontSize: 18,
//           fontWeight: 700,
//           color: "#124D81",
//           mb: 1,
//         }}
//       >
//         Initial Assessment
//       </Typography>

//       {/* ----------------- Birth History ----------------- */}
//        <Accordion sx={{
//     background: "#FFFFFF",
//     borderRadius: "12px",
//     boxShadow: "none",
//     border: "1px solid #E6EEF6",
//     mt: 0
//   }}>
//         <AccordionSummary
//   expandIcon={isBirthHistoryComplete() 
//     ? <CheckCircleIcon sx={{ color: "green",fontSize: 30 }} />
//     : <ExpandMoreIcon sx={{ color: "#228BE6",fontSize: 30 }} />
//   }
//   sx={{
//     backgroundColor: isBirthHistoryComplete() ? "#D9F7D9" : "#FFFFFF",
//       borderRadius: "8px",
      
//     "& .MuiAccordionSummary-expandIconWrapper": {
//       transform: "none !important",
//     },
//     "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
//       transform: "none !important",
//     },
//   }}
// >

//           <Typography sx={{ fontWeight: 600, color: "#0F2B45" }}>1. Birth History</Typography>
//         </AccordionSummary>
//         <AccordionDetails  sx={{ color: "#228BE6" }}>
//           <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
//             {/* Chief Complaints */}
//             <Typography sx={{ color: "#124D81", fontWeight: 600 }}>Chief Complaints</Typography>
//             <TextField
//   placeholder="E.g. Respiratory Distress"
//   fullWidth
//   multiline
//   minRows={2}
//   value={chiefComplaint}
//   onChange={(e) => setChiefComplaint(e.target.value)}

//               sx={{
//                 backgroundColor: "#F9FBFF",
//                 borderRadius: 2,
//                 "& .MuiInputBase-input": { color: "#000" },
//               }}
//             />

//             {/* Complaint Tags */}
//            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
//   {[
//     "RDS",
//     "MSL",
//     "Preterm",
//     "LBW",
//     "Sepsis",
//     "Risk of Sepsis",
//     "Birth Asphyxia",
//     "Hypoglycemia",
//     "Feeding Intolerance",
//     "Jaundice",
//   ].map((tag) => (
//     <Chip
//       key={tag}
//       label={tag}
//       clickable
//       onClick={() => {
//         setChiefComplaint((prev) =>
//           prev
//             ? prev.includes(tag)
//               ? prev
//               : `${prev}, ${tag}`
//             : tag
//         );
//       }}
//       sx={{
//         backgroundColor: "#E7F1FD",
//         color: "#124D81",
//         fontWeight: 500,
//         cursor: "pointer",
//         "&:hover": {
//           backgroundColor: "#D0E4FF",
//         },
//       }}
//     />
//   ))}
// </Box>


//             {/* History of Present Illness */}
//             <Typography sx={{ color: "#124D81", fontWeight: 600 }}>History of Present Illness</Typography>
//             <TextField
//               placeholder="Free Text Here..."
//               fullWidth
//               multiline
//               minRows={2}
//               value={birthHistory.presentIllness}
//   onChange={(e) =>
//     setBirthHistory({ ...birthHistory, presentIllness: e.target.value })
//   }
//               sx={{
//                 backgroundColor: "#F9FBFF",
//                 borderRadius: 2,
//                 "& .MuiInputBase-input": { color: "#000" },
//               }}
//             />

//             {/* Type of Birth + Liquor Status */}
//             <Grid container spacing={2}>
//       <Grid item xs={12} md={6}>
//         <Typography sx={{ color: "#124D81", fontWeight: 600 }}>Type of Birth *</Typography>
//         <ToggleButtonGroup
//           exclusive
//           fullWidth
//           value={birthType}
//           onChange={(event, newValue) => setBirthType(newValue)
//           }
//         >
//           {["NVD", "LSCS", "Instrumental"].map((opt) => (
//             <ToggleButton
//               key={opt}
//               value={opt}
//               sx={{ flex: 1, textTransform: "none", borderRadius:"8px",fontWeight: 600, color: "#124D81",
//                     "&.Mui-selected": {
//       backgroundColor: "#228BE6",
//       borderRadius:"8px", // blue background when selected
//       color: "#fff",             // white text when selected
//       "&:hover": {
//         backgroundColor: "#1B75D1", // darker blue on hover
//       },
//     },
//                }}
//             >
//               {opt}
//             </ToggleButton>
//           ))}
//         </ToggleButtonGroup>
//       </Grid>


//              <Grid item xs={12} md={6}>
//         <Typography sx={{ color: "#124D81", fontWeight: 600 }}>Liquor Status *</Typography>
//         <ToggleButtonGroup
//           exclusive
//           fullWidth
//           value={liquorStatus}
//           onChange={(event, newValue) => setLiquorStatus(newValue)}
//         >
//           {["Clear", "Meconium Thin", "Meconium Thick", "Foul"].map((opt) => (
//             <ToggleButton
//               key={opt}
//               value={opt}
//               sx={{ flex: 1, textTransform: "none", borderRadius:"8px",fontWeight: 600, color: "#124D81",
//                 "&.Mui-selected": {
//       backgroundColor: "#228BE6", // blue background when selected
//       color: "#fff", 
//       borderRadius:"8px",            // white text when selected
//       "&:hover": {
//         backgroundColor: "#1B75D1", // darker blue on hover
//       },
//     }
//                }}
//             >
//               {opt}
//             </ToggleButton>
//           ))}
//         </ToggleButtonGroup>
//       </Grid>
//             </Grid>

//             {/* Birth Questions */}
//             <Grid container spacing={2}>
//               <Grid item xs={12} md={4}>
//                 <FormControlLabel control={<Checkbox />} label="Cried Immediately after birth?" />
//               </Grid>
//               <Grid item xs={12} md={4}>
//                 <FormControlLabel control={<Checkbox />} label="Resuscitation" />
//               </Grid>
//               <Grid item xs={12} md={4}>
//                 <FormControlLabel control={<Checkbox />} label="Vitamin K given?" />
//               </Grid>
//             </Grid>

//             {/* Gestation + Birth Weight + Vaccination */}
//             <Grid container spacing={2}>
//               <Grid item xs={12} md={4}>
//                 <Typography sx={{ color: "#124D81", fontWeight: 600 }}>Gestation</Typography>
//                 <Box sx={{ display: "flex", gap: 1 }}>
//                   <TextField
//                     placeholder="00"
//                     fullWidth
//                     value={birthHistory.gestWeeks}
//   onChange={(e) =>
//     setBirthHistory({ ...birthHistory, gestWeeks: e.target.value })
//   }
//                     sx={{ backgroundColor: "#F9FBFF", "& .MuiInputBase-input": { color: "#000" } }}
//                   />
//                   <Typography sx={{ pt: 1 }}>Wks</Typography>
//                   <TextField
//                     placeholder="00"
//                     fullWidth
//                            value={birthHistory.gestDays}
//   onChange={(e) =>
//     setBirthHistory({ ...birthHistory, gestDays: e.target.value })
//   }
//                     sx={{ backgroundColor: "#F9FBFF", "& .MuiInputBase-input": { color: "#000" } }}
//                   />
//                   <Typography sx={{ pt: 1 }}>Days</Typography>
//                 </Box>
//               </Grid>

//               <Grid item xs={12} md={4}>
//                 <Typography sx={{ color: "#124D81", fontWeight: 600 }}>Birth Weight</Typography>
//                 <TextField
//                   placeholder="0000 g"
//                   fullWidth
//                            value={birthHistory.birthWeight}
//   onChange={(e) =>
//     setBirthHistory({ ...birthHistory, birthWeight: e.target.value })
//   }
        
//                   sx={{ backgroundColor: "#F9FBFF", "& .MuiInputBase-input": { color: "#000" } }}
//                 />
//               </Grid>

//               <Grid item xs={12} md={4}>
//                 <Typography sx={{ color: "#124D81", fontWeight: 600 }}>Vaccination</Typography>
//                 <TextField
//                   placeholder="0000 g"
//                   fullWidth
//                                       value={birthHistory.vaccination}
//   onChange={(e) =>
//     setBirthHistory({ ...birthHistory, vaccination: e.target.value })
//   }
//                   sx={{ backgroundColor: "#F9FBFF", "& .MuiInputBase-input": { color: "#000" } }}
//                 />
//               </Grid>
//             </Grid>

//             {/* APGAR Scores */}
//             <Typography sx={{ color: "#124D81", fontWeight: 600, mt: 3 }}>APGAR Scores *</Typography>
//             <Grid container spacing={2}>
//               {["1min", "5min", "10min"].map((label) => (
//                 <Grid item xs={12} md={4} key={label}>
//                   <TextField
//                     select
//                     label={label}
//                     fullWidth
//                                          value={birthHistory.apgar1}
//   onChange={(e) =>
//     setBirthHistory({ ...birthHistory, apgar1: e.target.value })
//   }
//                     sx={{ backgroundColor: "#F9FBFF", "& .MuiInputLabel-root": { color: "#124D81" }, "& .MuiInputBase-input": { color: "#000" } }}
//                   >
//                     {[0, 1, 2, 3, 4, 5].map((v) => (
//                       <MenuItem key={v} value={v}>{v}</MenuItem>
//                     ))}
//                   </TextField>
//                 </Grid>
//               ))}
//             </Grid>

//             {/* Action Buttons */}
//             <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4, gap: 2 }}>
//               <Button
//                 variant="outlined"
//                 sx={{ textTransform: "none", borderRadius: 2, borderColor: "#A7C0DA", color: "#124D81" }}
//               >
//                 Save & Exit
//               </Button>
//               <Button
//                 variant="contained"
                
//                 sx={{ textTransform: "none", backgroundColor: "#228BE6", borderRadius: 2, px: 4 }}
//               >
//                 Next
//               </Button>
//             </Box>
//           </Box>
//         </AccordionDetails>
//       </Accordion>
//      <Accordion sx={{
//     background: "#FFFFFF",
//     borderRadius: "12px",
//     boxShadow: "none",
//     border: "1px solid #E6EEF6",
//     mt: 0
//   }}>
//       <AccordionSummary
//         expandIcon={
//           isVitalsComplete() ? (
//             <CheckCircleIcon sx={{ color: "green", fontSize: 30 }} />
//           ) : (
//             <ExpandMoreIcon sx={{ color: "#228BE6", fontSize: 30 }} />
//           )
//         }
//         sx={{
//           backgroundColor: isVitalsComplete() ? "#D9F7D9" : "#FFFFFF",
//           borderRadius: "12px",
//           "& .MuiAccordionSummary-expandIconWrapper": {
//             transform: "none !important"
//           },
//           "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
//             transform: "none !important"
//           }
//         }}
//       >
//         <Typography sx={{ fontWeight: 600, color: "#0F2B45" }}>
//           2. Vitals & Anthropometry
//         </Typography>
//       </AccordionSummary>

//       <AccordionDetails sx={{ p: 3 }}>
//         {/* Vitals Row */}
//         <Typography sx={{ fontWeight: 600, color: "#124D81" }}>Vitals</Typography>

//         <Grid container spacing={2} sx={{ mt: 1 }}>
//           {[
//             { label: "Temp °C", key: "temp" },
//             { label: "HR bpm", key: "hr" },
//             { label: "RR bpm", key: "rr" },
//             { label: "SpO₂ %", key: "spo2" }
//           ].map((item) => (
//             <Grid item xs={6} md={3} key={item.key}>
//               <TextField
//                 placeholder="00"
//                 fullWidth
//                 value={vitals[item.key]}
//                 onChange={(e) =>
//                   setVitals({ ...vitals, [item.key]: e.target.value })
//                 }
//                 sx={{
//                   background: "#F9FBFF",
//                   "& .MuiInputBase-input": { color: "#000" }
//                 }}
//               />
//             </Grid>
//           ))}

//           {/* Other related text */}
//           <Grid item xs={12}>
//             <TextField
//               placeholder="Other related text..."
//               fullWidth
//               value={vitals.relatedText}
//               onChange={(e) =>
//                 setVitals({ ...vitals, relatedText: e.target.value })
//               }
//               sx={{
//                 background: "#F9FBFF",
//                 "& .MuiInputBase-input": { color: "#000" }
//               }}
//             />
//           </Grid>
//         </Grid>

//         {/* Measurements */}
//         <Typography sx={{ mt: 4, fontWeight: 600, color: "#124D81" }}>
//           Measurements
//         </Typography>

//         <Grid container spacing={2} sx={{ mt: 1 }}>
//           <Grid item xs={12} md={4}>
//             <TextField
//               placeholder="Weight (g)"
//               fullWidth
//               value={vitals.weight}
//               onChange={(e) => setVitals({ ...vitals, weight: e.target.value })}
//               sx={{ background: "#F9FBFF", "& .MuiInputBase-input": { color: "#000" } }}
//             />
//           </Grid>

//           <Grid item xs={12} md={4}>
//             <TextField
//               placeholder="HC (cm)"
//               fullWidth
//               value={vitals.hc}
//               onChange={(e) => setVitals({ ...vitals, hc: e.target.value })}
//               sx={{ background: "#F9FBFF", "& .MuiInputBase-input": { color: "#000" } }}
//             />
//           </Grid>

//           <Grid item xs={12} md={4}>
//             <TextField
//               placeholder="Length (cm)"
//               fullWidth
//               value={vitals.length}
//               onChange={(e) => setVitals({ ...vitals, length: e.target.value })}
//               sx={{ background: "#F9FBFF", "& .MuiInputBase-input": { color: "#000" } }}
//             />
//           </Grid>
//         </Grid>

//         {/* BSL + BP */}
//         <Typography sx={{ mt: 4, fontWeight: 600, color: "#124D81" }}>
//           BSL / Blood Glucose
//         </Typography>

//         <Grid container spacing={2} sx={{ mt: 1 }}>
//           <Grid item xs={12} md={6}>
//             <TextField
//               placeholder="00 mg/dL"
//               fullWidth
//               value={vitals.bsl}
//               onChange={(e) => setVitals({ ...vitals, bsl: e.target.value })}
//               sx={{ background: "#F9FBFF", "& .MuiInputBase-input": { color: "#000" } }}
//             />
//           </Grid>

//           <Grid item xs={12} md={6}>
//             <TextField
//               placeholder="00 mmHg"
//               fullWidth
//               value={vitals.bp}
//               onChange={(e) => setVitals({ ...vitals, bp: e.target.value })}
//               sx={{ background: "#F9FBFF", "& .MuiInputBase-input": { color: "#000" } }}
//             />
//           </Grid>
//         </Grid>

//         {/* Buttons */}
//         <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4, gap: 2 }}>
//           <Button
//             variant="outlined"
//             sx={{
//               textTransform: "none",
//               borderRadius: 2,
//               borderColor: "#A7C0DA",
//               color: "#124D81"
//             }}
//           >
//             Save & Exit
//           </Button>

//           <Button
//             variant="contained"
            
//             sx={{
//               textTransform: "none",
//               backgroundColor: "#228BE6",
//               borderRadius: 2,
//               px: 4
//             }}
//           >
//             Next
//           </Button>
//         </Box>
//       </AccordionDetails>
//     </Accordion>
  
//      <Accordion sx={{
//     background: "#FFFFFF",
//     borderRadius: "12px",
//     boxShadow: "none",
//     border: "1px solid #E6EEF6",
//     mt: 0
//   }}>
//       <AccordionSummary
//         expandIcon={
//           isGeneralPhysicalComplete() ? (
//             <CheckCircleIcon sx={{ color: "green", fontSize: 30 }} />
//           ) : (
//             <ExpandMoreIcon sx={{ color: "#228BE6", fontSize: 30 }} />
//           )
//         }
//         sx={{
//           backgroundColor: isGeneralPhysicalComplete()
//             ? "#D9F7D9"
//             : "#FFFFFF",
//           borderRadius: "12px",
//           "& .MuiAccordionSummary-expandIconWrapper": {
//             transform: "none !important"
//           },
//           "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
//             transform: "none !important"
//           },
//             "& *": {
//     color: "#0F2B45 !important"   // applies to all text inside
//   },
//   "& .MuiInputBase-input": {
//     color: "#000 !important"      // text inside textfields
//   },
//   "& .MuiFormControlLabel-label": {
//     color: "#0F2B45 !important"   // checkbox labels
//   }
//         }}
//       >
//         <Typography sx={{ fontWeight: 600, color: "#0F2B45" }}>
//           3. General Physical Examinations
//         </Typography>
//       </AccordionSummary>

//       <AccordionDetails>
//         <Box sx={{ p: 2 }}>
//           {/* LEVEL OF CONSCIOUSNESS */}
//           <Typography sx={{ fontWeight: 600, color: "#124D81",  "& *": {
//     color: "#0F2B45 !important"   // applies to all text inside
//   },
//   "& .MuiInputBase-input": {
//     color: "#000 !important"      // text inside textfields
//   },
//   "& .MuiFormControlLabel-label": {
//     color: "#0F2B45 !important"   // checkbox labels
//   } }}>
//             Level of Consciousness
//           </Typography>

//           <ToggleButtonGroup
//           fullWidth
//             exclusive
//             value={exam.consciousness}
//             onChange={(e, v) =>
//               setExam({ ...exam, consciousness: v })
//             }
//             sx={{ mt: 1,border:'1px solid grey' }}
//           >
//             {["Active & Alert", "Lethargic", "Irritable", "Comatose"].map(
//               (opt) => (
//                 <ToggleButton
//                   key={opt}
//                   value={opt}
//                   sx={{ flex: 1, textTransform: "none", borderRadius:"8px",fontWeight: 600, color: "#124D81",
//                     "&.Mui-selected": {
//       backgroundColor: "#228BE6",
//       borderRadius:"8px", // blue background when selected
//       color: "#fff",             // white text when selected
//       "&:hover": {
//         backgroundColor: "#1B75D1", // darker blue on hover
//       },
//     },
//                }}
//                 >
//                   {opt}
//                 </ToggleButton>
//               )
//             )}
//           </ToggleButtonGroup>

//           {/* COLOR */}
//           <Typography sx={{ mt: 4, fontWeight: 600, color: "#124D81" }}>
//             Color
//           </Typography>

//           <Grid container spacing={2} sx={{ mt: 1 }}>
//             {[
//               "Pink",
//               "Pale",
//               "Plethoric",
//               "Jaundice",
//               "Central Cyanosis",
//               "Peripheral Cyanosis"
//             ].map((label) => (
//               <Grid item xs={6} md={4} key={label}>
//                 <FormControlLabel
//                   control={
//                     <Checkbox
//                       checked={exam.color.includes(label)}
//                       onChange={() => toggleValue("color", label)}
//                     />
//                   }
//                   sx={{ flex: 1, textTransform: "none", borderRadius:"8px",fontWeight: 600, color: "#124D81",
//                     "&.Mui-selected": {
//       backgroundColor: "#228BE6",
//       borderRadius:"8px", // blue background when selected
//       color: "#fff",             // white text when selected
//       "&:hover": {
//         backgroundColor: "#1B75D1", // darker blue on hover
//       },
//     },
//                }}
//                   label={label}
//                 />
//               </Grid>
//             ))}
//           </Grid>

//           {/* SKIN */}
//           <Accordion sx={{ background: "#FFFFFF", borderRadius: "12px", mt: 3 }}>
//   <AccordionSummary
//     expandIcon={
      
//         <ExpandMoreIcon sx={{ color: "#228BE6", fontSize: 28 }} />
      
//     }
//     sx={{
//       backgroundColor : "#FFFFFF",
//       borderRadius: "12px",

//       // Prevent rotation
//       "& .MuiAccordionSummary-expandIconWrapper": {
//         transform: "none !important",
//       },
//       "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
//         transform: "none !important",
//       },

//       // Header text color
//       "& .MuiAccordionSummary-content": {
//         color: "#0F2B45 !important",
//         fontWeight: 600,
//       }
//     }}
//   >
//     <Typography sx={{ fontWeight: 600, color: "#0F2B45" }}>
//       Skin
//     </Typography>
//   </AccordionSummary>

//   <AccordionDetails
//     sx={{
//       "& *": {
//         color: "#0F2B45 !important", // all text visible
//       },
//       "& .MuiInputBase-input": {
//         color: "#000 !important", // textfield input visible
//       },
//       "& .MuiFormControlLabel-label": {
//         color: "#0F2B45 !important", // checkbox labels visible
//       }
//     }}
//   >
//     <Grid container spacing={2} sx={{ mt: 1 }}>
//       {[
//         "Petechiae/Purpura",
//         "Bruising",
//         "Peeling",
//         "Lanugo",
//         "Birth marks",
//         "Meconium Stain"
//       ].map((label) => (
//         <Grid item xs={6} md={4} key={label}>
//           <FormControlLabel
//             control={
//               <Checkbox
//                 checked={exam.skin.includes(label)}
//                 onChange={() => toggleValue("skin", label)}
//                 sx={{ color: "#228BE6" }}
//               />
//             }
//             label={label}
//           />
//         </Grid>
//       ))}

//       {/* Other Findings */}
//       <Grid item xs={12} md={6}>
//         <TextField
//           placeholder="Type Other Findings..."
//           fullWidth
//           value={exam.skinOther}
//           onChange={(e) =>
//             setExam({ ...exam, skinOther: e.target.value })
//           }
//           sx={{
//             background: "#F9FBFF",
//             borderRadius: "8px",
//             "& .MuiInputBase-input": {
//               color: "#000 !important",
//             }
//           }}
//         />
//       </Grid>
//     </Grid>
//   </AccordionDetails>
// </Accordion>


//           {/* HEAD & NECK */}
//        <Accordion sx={{ background: "#FFFFFF", borderRadius: "12px", mt: 3 }}>
//   <AccordionSummary
//     expandIcon={
    
//         <ExpandMoreIcon sx={{ color: "#228BE6", fontSize: 28 }} />
      
//     }
//     sx={{
//       backgroundColor: "#FFFFFF",
//       borderRadius: "12px",

//       // Prevent rotation
//       "& .MuiAccordionSummary-expandIconWrapper": {
//         transform: "none !important",
//       },
//       "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
//         transform: "none !important",
//       },

//       // Header text
//       "& .MuiAccordionSummary-content": {
//         color: "#0F2B45 !important",
//         fontWeight: 600,
//       }
//     }}
//   >
//     <Typography sx={{ fontWeight: 600, color: "#0F2B45" }}>
//       Head & Neck
//     </Typography>
//   </AccordionSummary>

//   <AccordionDetails
//     sx={{
//       "& *": {
//         color: "#0F2B45 !important",
//       },
//       "& .MuiInputBase-input": {
//         color: "#000 !important",
//       },
//       "& .MuiFormControlLabel-label": {
//         color: "#0F2B45 !important",
//       }
//     }}
//   >
//     <Grid container spacing={2} sx={{ mt: 1 }}>
//       {[
//         "Override Suture",
//         "Excessive moulding",
//         "Microcephaly",
//         "Depressed fontanelle",
//         "Bulging fontanelle",
//         "Hydrocephalus",
//         "Caput",
//         "Webbed Neck",
//         "Subgaleal Hemorrhage"
//       ].map((label) => (
//         <Grid item xs={6} md={4} key={label}>
//           <FormControlLabel
//             control={
//               <Checkbox
//                 checked={exam.headNeck.includes(label)}
//                 onChange={() => toggleValue("headNeck", label)}
//                 sx={{ color: "#228BE6" }}
//               />
//             }
//             label={label}
//           />
//         </Grid>
//       ))}

//       <Grid item xs={12} md={6}>
//         <TextField
//           placeholder="Other Findings"
//           fullWidth
//           value={exam.headNeckOther}
//           onChange={(e) =>
//             setExam({ ...exam, headNeckOther: e.target.value })
//           }
//           sx={{
//             background: "#F9FBFF",
//             borderRadius: "8px",
//             "& .MuiInputBase-input": { color: "#000 !important" }
//           }}
//         />
//       </Grid>

//       <Grid item xs={12} md={6}>
//         <TextField
//           placeholder="Description"
//           fullWidth
//           value={exam.headNeckDesc}
//           onChange={(e) =>
//             setExam({ ...exam, headNeckDesc: e.target.value })
//           }
//           sx={{
//             background: "#F9FBFF",
//             borderRadius: "8px",
//             "& .MuiInputBase-input": { color: "#000 !important" }
//           }}
//         />
//       </Grid>
//     </Grid>
//   </AccordionDetails>
// </Accordion>


//           {/* EAR / NOSE / THROAT / EYES */}
        
//           <Accordion sx={{ background: "#FFFFFF", borderRadius: "12px", mt: 3 }}>
//   <AccordionSummary
//     expandIcon={
    
//         <ExpandMoreIcon sx={{ color: "#228BE6", fontSize: 28 }} />
    
//     }
//     sx={{
//       backgroundColor:  "#FFFFFF",
//       borderRadius: "12px",

//       // prevent rotation
//       "& .MuiAccordionSummary-expandIconWrapper": {
//         transform: "none !important"
//       },
//       "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
//         transform: "none !important"
//       },

//       "& .MuiAccordionSummary-content": {
//         color: "#0F2B45 !important",
//         fontWeight: 600
//       }
//     }}
//   >
//     <Typography sx={{ fontWeight: 600, color: "#0F2B45" }}>
//       ENT (Ear, Nose, Throat & Eyes)
//     </Typography>
//   </AccordionSummary>

//   <AccordionDetails
//     sx={{
//       "& *": { color: "#0F2B45 !important" },
//       "& .MuiInputBase-input": { color: "#000 !important" },
//       "& .MuiFormControlLabel-label": { color: "#0F2B45 !important" }
//     }}
//   >
//     {[
//       { title: "Ear", key: "ear" },
//       { title: "Nose", key: "nose" },
//       { title: "Throat", key: "throat" },
//       { title: "Eyes", key: "eyes" }
//     ].map((section) => (
//       <Box key={section.key} sx={{ mt: 4 }}>
//         {/* SECTION TITLE */}
//         <Typography sx={{ fontWeight: 600, color: "#124D81" }}>
//           {section.title}
//         </Typography>

//         {/* CHECKBOXES */}
//         <Grid container spacing={2} sx={{ mt: 1 }}>
//           {[
//             "Discharge",
//             "Subconj hemorrhage",
//             "Squint",
//             "Red Reflex Absent"
//           ].map((label) => (
//             <Grid item xs={6} md={4} key={label}>
//               <FormControlLabel
//                 control={
//                   <Checkbox
//                     checked={exam[section.key].includes(label)}
//                     onChange={() => toggleValue(section.key, label)}
//                     sx={{ color: "#228BE6" }}
//                   />
//                 }
//                 label={label}
//               />
//             </Grid>
//           ))}

//           {/* Other Findings */}
//           <Grid item xs={12} md={6}>
//             <TextField
//               placeholder="Type Other Findings..."
//               fullWidth
//               value={exam[section.key + "Other"]}
//               onChange={(e) =>
//                 setExam({
//                   ...exam,
//                   [section.key + "Other"]: e.target.value
//                 })
//               }
//               sx={{
//                 background: "#F9FBFF",
//                 borderRadius: "8px",
//                 "& .MuiInputBase-input": { color: "#000 !important" }
//               }}
//             />
//           </Grid>

//           {/* Description */}
//           <Grid item xs={12} md={6}>
//             <TextField
//               placeholder="Description"
//               fullWidth
//               value={exam[section.key + "Desc"]}
//               onChange={(e) =>
//                 setExam({
//                   ...exam,
//                   [section.key + "Desc"]: e.target.value
//                 })
//               }
//               sx={{
//                 background: "#F9FBFF",
//                 borderRadius: "8px",
//                 "& .MuiInputBase-input": { color: "#000 !important" }
//               }}
//             />
//           </Grid>
//         </Grid>
//       </Box>
//     ))}
//   </AccordionDetails>
// </Accordion>
// <Accordion sx={{ background: "#FFFFFF", borderRadius: "12px", mt: 3 }}>
//   <AccordionSummary
//     expandIcon={
//       <ExpandMoreIcon sx={{ color: "#228BE6", fontSize: 28 }} />
//     }
//     sx={{
//       backgroundColor: "#FFFFFF",
//       borderRadius: "12px",

//       // Prevent rotation
//       "& .MuiAccordionSummary-expandIconWrapper": {
//         transform: "none !important",
//       },
//       "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
//         transform: "none !important",
//       },

//       // Header text
//       "& .MuiAccordionSummary-content": {
//         color: "#0F2B45 !important",
//         fontWeight: 600,
//       }
//     }}
//   >
//     <Typography sx={{ fontWeight: 600, color: "#0F2B45" }}>
//       Spine & Back
//     </Typography>
//   </AccordionSummary>

//   <AccordionDetails
//     sx={{
//       "& *": { color: "#0F2B45 !important" },
//       "& .MuiInputBase-input": { color: "#000 !important" },
//       "& .MuiFormControlLabel-label": { color: "#0F2B45 !important" }
//     }}
//   >
//     <Grid container spacing={2} sx={{ mt: 1 }}>
//       {[
//         "Spina Bifida",
//         "Sacral Dimple",
//         "Hairy Patch",
//         "Scoliosis",
//         "Kyphosis",
//         "Lordosis",
//         "Tenderness",
//         "Hematoma",
//         "Deformity"
//       ].map((label) => (
//         <Grid item xs={6} md={4} key={label}>
//           <FormControlLabel
//             control={
//               <Checkbox
//                 checked={exam.spineBack.includes(label)}
//                 onChange={() => toggleValue("spineBack", label)}
//                 sx={{ color: "#228BE6" }}
//               />
//             }
//             label={label}
//           />
//         </Grid>
//       ))}

//       {/* Other Findings */}
//       <Grid item xs={12} md={6}>
//         <TextField
//           placeholder="Other Findings"
//           fullWidth
//           value={exam.spineBackOther}
//           onChange={(e) =>
//             setExam({ ...exam, spineBackOther: e.target.value })
//           }
//           sx={{
//             background: "#F9FBFF",
//             borderRadius: "8px",
//             "& .MuiInputBase-input": { color: "#000 !important" }
//           }}
//         />
//       </Grid>

//       {/* Description */}
//       <Grid item xs={12} md={6}>
//         <TextField
//           placeholder="Description"
//           fullWidth
//           value={exam.spineBackDesc}
//           onChange={(e) =>
//             setExam({ ...exam, spineBackDesc: e.target.value })
//           }
//           sx={{
//             background: "#F9FBFF",
//             borderRadius: "8px",
//             "& .MuiInputBase-input": { color: "#000 !important" }
//           }}
//         />
//       </Grid>
//     </Grid>
//   </AccordionDetails>

  
// </Accordion>
// <Accordion sx={{ background: "#FFFFFF", borderRadius: "12px", mt: 3 }}>
//   <AccordionSummary
//     expandIcon={
//       <ExpandMoreIcon sx={{ color: "#228BE6", fontSize: 28 }} />
//     }
//     sx={{
//       backgroundColor: "#FFFFFF",
//       borderRadius: "12px",

//       // Prevent rotation
//       "& .MuiAccordionSummary-expandIconWrapper": {
//         transform: "none !important",
//       },
//       "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
//         transform: "none !important",
//       },

//       "& .MuiAccordionSummary-content": {
//         color: "#0F2B45 !important",
//         fontWeight: 600,
//       }
//     }}
//   >
//     <Typography sx={{ fontWeight: 600, color: "#0F2B45" }}>
//       Hips / Limbs
//     </Typography>
//   </AccordionSummary>

//   <AccordionDetails
//     sx={{
//       "& *": { color: "#0F2B45 !important" },
//       "& .MuiInputBase-input": { color: "#000 !important" },
//       "& .MuiFormControlLabel-label": { color: "#0F2B45 !important" }
//     }}
//   >
//     <Grid container spacing={2} sx={{ mt: 1 }}>
//       {[
//         "Asymmetry",
//         "Dislocation",
//         "Limited Abduction",
//         "Click / Clunk",
//         "Shortening",
//         "Polydactyly",
//         "Syndactyly",
//         "Club Foot",
//         "Fracture / Crepitus"
//       ].map((label) => (
//         <Grid item xs={6} md={4} key={label}>
//           <FormControlLabel
//             control={
//               <Checkbox
//                 checked={exam.hipsLimbs.includes(label)}
//                 onChange={() => toggleValue("hipsLimbs", label)}
//                 sx={{ color: "#228BE6" }}
//               />
//             }
//             label={label}
//           />
//         </Grid>
//       ))}

//       {/* Other Findings */}
//       <Grid item xs={12} md={6}>
//         <TextField
//           placeholder="Other Findings"
//           fullWidth
//           value={exam.hipsLimbsOther}
//           onChange={(e) =>
//             setExam({ ...exam, hipsLimbsOther: e.target.value })
//           }
//           sx={{
//             background: "#F9FBFF",
//             borderRadius: "8px",
//             "& .MuiInputBase-input": { color: "#000 !important" }
//           }}
//         />
//       </Grid>

//       {/* Description */}
//       <Grid item xs={12} md={6}>
//         <TextField
//           placeholder="Description"
//           fullWidth
//           value={exam.hipsLimbsDesc}
//           onChange={(e) =>
//             setExam({ ...exam, hipsLimbsDesc: e.target.value })
//           }
//           sx={{
//             background: "#F9FBFF",
//             borderRadius: "8px",
//             "& .MuiInputBase-input": { color: "#000 !important" }
//           }}
//         />
//       </Grid>
//     </Grid>
//   </AccordionDetails>
// </Accordion>



//           {/* ACTION BUTTONS */}
//           <Box
//             sx={{ display: "flex", justifyContent: "flex-end", mt: 4, gap: 2 , "& .MuiInputBase-input": { color: "#000" },}}
//           >
//             <Button
//               variant="outlined"
//               sx={{
//                 textTransform: "none",
//                 borderRadius: 2,
//                 borderColor: "#A7C0DA",
//                 color: "#124D81"
//               }}
//             >
//               Save & Exit
//             </Button>

//             <Button
//               variant="contained"
              
//               sx={{
//                 textTransform: "none",
//                 backgroundColor: "#228BE6",
//                 borderRadius: 2,
//                 px: 4
//               }}
//             >
//               Next
//             </Button>
//           </Box>
//         </Box>
//       </AccordionDetails>
//     </Accordion>
//     <Accordion sx={{
//     background: "#FFFFFF",
//     borderRadius: "12px",
//     boxShadow: "none",
//     border: "1px solid #E6EEF6",
//     mt: 0
//   }}>
//   <AccordionSummary
//     expandIcon={<ExpandMoreIcon sx={{ color: "#228BE6", fontSize: 30 }} />}
//     sx={{
//       backgroundColor: "#FFFFFF",
//       borderRadius: "12px",
//       "& .MuiAccordionSummary-expandIconWrapper": {
//         transform: "none !important"
//       },
//       "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
//         transform: "none !important"
//       },
//       "& .MuiAccordionSummary-content": {
//         color: "#0F2B45 !important",
//         fontWeight: 600
//       }
//     }}
//   >
//     <Typography sx={{ fontWeight: 600 }}>
//       4. Systematic Examination
//     </Typography>
//   </AccordionSummary>

//   <AccordionDetails>
//     <Box sx={{ "& *": { color: "#0F2B45" }}}>
//       {[
//         {
//           title: "Respiratory",
//           key: "respiratory",
//           options: [
//             "Grunting",
//             "Nasal Flaring",
//             "Apnea",
//             "Stridor",
//             "Tachypnoea (>60/min)",
//             "Subcostal Retraction",
//             "Intercostal Retraction",
//             "Suprasternal Retraction",
//             "Diminished Air Entry",
//             "Crackles/Crepitations",
//             "Wheeze"
//           ]
//         },
//         {
//           title: "Cardiovascular",
//           key: "cardio",
//           options: [
//             "Heart Murmur",
//             "Abnormal S1 S2",
//             "Tachycardia >160bpm",
//             "Bradycardia <100bpm",
//             "CRT >3 Secs",
//             "Bounding Pulses",
//             "Irregular Rhythm",
//             "Weak Pulses",
//             "Hypotension",
//             "Active Precordium"
//           ]
//         },
//         {
//           title: "Gastrointestinal & Abdomen",
//           key: "gi",
//           options: [
//             "Abdominal Distension",
//             "Abdominal Tenderness",
//             "Scaphoid Abdomen",
//             "Discolored Abdominal Wall",
//             "Visible Bowel Loops",
//             "Hepatomegaly >2cm",
//             "Splenomegaly",
//             "Abdominal Mass",
//             "Umbilical Hernia",
//             "Omphalitis/Infected Cord",
//             "Umbilical Granuloma",
//             "Imperforate Anus",
//             "Bloody Stool",
//             "Bilious Vomiting",
//             "Hyperactive Bowel Sounds"
//           ]
//         },
//         {
//           title: "Central Nervous System",
//           key: "cns",
//           options: [
//             "Lethargic",
//             "Irritability/High-pitched Cry",
//             "Hypotonia",
//             "Hypertonia",
//             "Jitteriness",
//             "Seizures (Focal)",
//             "Seizures (Generalized)",
//             "Absent/Weak Reflex",
//             "Posturing",
//             "Weak Cry",
//             "Bulging Fontanelle",
//             "Sunken Fontanelle",
//             "Pupils Fixed/Dilated"
//           ]
//         },
//         {
//           title: "Genitourinary",
//           key: "gu",
//           options: [
//             "Undescended Testis Right",
//             "Undescended Testis Left",
//             "Bilateral Undescended Testes",
//             "Hypospadias",
//             "Epispadias",
//             "Hydrocele",
//             "Inguinal Hernia",
//             "Micropenis",
//             "Clitoromegaly",
//             "Fused Labia",
//             "Palpably Full Bladder",
//             "Ambiguous Genitalia",
//             "Vaginal Discharge (Bloody)"
//           ]
//         },
//         {
//           title: "Musculoskeletal",
//           key: "msk",
//           options: [
//             "Skeletal Deformity/Fracture",
//             "Decreased Arm Movement",
//             "Single Palmar Crease",
//             "Hip Instability",
//             "Scoliosis",
//             "Spinal Defect/Dimple",
//             "Asymmetric Movement",
//             "Syndactyly",
//             "Clinodactyly",
//             "Polydactyly",
//             "Spinal Hair Tuft",
//             "Spina Bifida"
//           ]
//         }
//       ].map((section) => (
//         <Accordion
//           key={section.key}
//           sx={{ background: "#FFFFFF", borderRadius: "12px", mt: 3 }}
//         >
//           <AccordionSummary
//             expandIcon={<ExpandMoreIcon sx={{ color: "#228BE6" }} />}
//             sx={{
//               "& .MuiAccordionSummary-expandIconWrapper": {
//                 transform: "none !important"
//               },
//               "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
//                 transform: "none !important"
//               },
//               "& .MuiAccordionSummary-content": {
//                 fontWeight: 600,
//                 color: "#124D81"
//               }
//             }}
//           >
//             <Typography sx={{ fontWeight: 600 }}>
//               {section.title}
//             </Typography>
//           </AccordionSummary>

//           <AccordionDetails>
//             <Grid container spacing={2}>
//               {/* Other + Description */}
//               <Grid item xs={12} md={6}>
//                 <TextField
//                   placeholder="Type Other Findings..."
//                   fullWidth
//                   value={exam[section.key + "Other"]}
//                   onChange={(e) =>
//                     setExam({
//                       ...exam,
//                       [section.key + "Other"]: e.target.value
//                     })
//                   }
//                   sx={{
//                     background: "#F9FBFF",
//                     borderRadius: "8px",
//                     "& .MuiInputBase-input": { color: "#000" }
//                   }}
//                 />
//               </Grid>

//               <Grid item xs={12} md={6}>
//                 <TextField
//                   placeholder="Description"
//                   fullWidth
//                   value={exam[section.key + "Desc"]}
//                   onChange={(e) =>
//                     setExam({
//                       ...exam,
//                       [section.key + "Desc"]: e.target.value
//                     })
//                   }
//                   sx={{
//                     background: "#F9FBFF",
//                     borderRadius: "8px",
//                     "& .MuiInputBase-input": { color: "#000" }
//                   }}
//                 />
//               </Grid>

//               {/* Checkboxes */}
//               {section.options.map((label) => (
//                 <Grid item xs={6} md={3} key={label}>
//                   <FormControlLabel
//                     control={
//                       <Checkbox
//                         checked={exam[section.key].includes(label)}
//                         onChange={() =>
//                           toggleValue(section.key, label)
//                         }
//                         sx={{ color: "#228BE6" }}
//                       />
//                     }
//                     label={label}
//                   />
//                 </Grid>
//               ))}
//             </Grid>
//           </AccordionDetails>
//         </Accordion>
//       ))}
//     </Box>
//      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4, gap: 2 }}>
//           <Button
//             variant="outlined"
//             sx={{
//               textTransform: "none",
//               borderRadius: 2,
//               borderColor: "#A7C0DA",
//               color: "#124D81"
//             }}
//           >
//             Save & Exit
//           </Button>

//           <Button
//             variant="contained"
            
//             sx={{
//               textTransform: "none",
//               backgroundColor: "#228BE6",
//               borderRadius: 2,
//               px: 4
//             }}
//           >
//             Next
//           </Button>
//         </Box>
//   </AccordionDetails>
// </Accordion>
//       <Accordion
//   sx={{
//     background: "#FFFFFF",
//     borderRadius: "12px",
//     boxShadow: "none",
//     border: "1px solid #E6EEF6",
//     mt: 0
//   }}
// >
//   <AccordionSummary
//     expandIcon={<ExpandMoreIcon sx={{ color: "#228BE6", fontSize: 28 }} />}
//     sx={{
//       "& .MuiAccordionSummary-expandIconWrapper": {
//         transform: "none !important"
//       },
//       "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
//         transform: "none !important"
//       },
//       "& .MuiAccordionSummary-content": {
//         fontWeight: 600,
//         color: "#0F2B45"
//       }
//     }}
//   >
//     <Typography sx={{ fontWeight: 600 }}>
//       5. Plan of Care / Treatment Plan
//     </Typography>
//   </AccordionSummary>

//   <AccordionDetails sx={{ "& *": { color: "#0F2B45" } }}>
//     {/* PLAN FOR DAY */}
//     <Typography sx={{ fontWeight: 600, mb: 1 }}>
//       Plan for the day
//     </Typography>

//     <TextField
//       fullWidth
//       placeholder="Enter here"
//       value={planOfCare.planForDay}
//       onChange={(e) =>
//         setPlanOfCare({ ...planOfCare, planForDay: e.target.value })
//       }
//       sx={{
//         background: "#F9FBFF",
//         mb: 1
//       }}
//     />

//     <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 3 }}>
//       {["Admission", "Ventilator", "Surgery", "Phototherapy", "Warmer"].map(
//         (chip) => (
//           <Chip
//             key={chip}
//             label={chip}
//             clickable
//             onClick={() => addPlanText(chip)}
//             sx={{
//               background: "#E7F1FD",
//               color: "#124D81",
//               fontWeight: 500
//             }}
//           />
//         )
//       )}
//     </Box>

//     {/* INVESTIGATIONS */}
//     <Typography sx={{ fontWeight: 600, mb: 1 }}>
//       Investigations
//     </Typography>

//     <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 3 }}>
//       {[
//         "CBC",
//         "Serum Bilirubin",
//         "Electrolytes",
//         "Blood Gas",
//         "CRP",
//         "Blood Culture"
//       ].map((test) => (
//         <Chip
//           key={test}
//           label={test}
//           clickable
//           onClick={() => toggleInvestigation(test)}
//           sx={{
//             background: planOfCare.investigations.includes(test)
//               ? "#228BE6"
//               : "#E7F1FD",
//             color: planOfCare.investigations.includes(test)
//               ? "#fff"
//               : "#124D81"
//           }}
//         />
//       ))}
//     </Box>

//     {/* MEDICATION ORDERS */}
//     <Typography sx={{ fontWeight: 600, mb: 1 }}>
//       Medication Orders
//     </Typography>

//     {planOfCare.medications.map((med, idx) => (
//       <Grid container spacing={2} key={idx} sx={{ mb: 1 }}>
//         <Grid item xs={3}>{med.name}</Grid>
//         <Grid item xs={2}>{med.dose}</Grid>
//         <Grid item xs={2}>{med.frequency}</Grid>
//         <Grid item xs={3}>{med.lastDose}</Grid>
//       </Grid>
//     ))}

//     {/* ADD MEDICATION */}
//     <Grid container spacing={2} sx={{ mt: 1 }}>
//       <Grid item xs={3}>
//         <TextField
//           placeholder="Search or Enter Name"
//           fullWidth
//           value={planOfCare.newMedication.name}
//           onChange={(e) =>
//             updateNewMedication("name", e.target.value)
//           }
//         />
//       </Grid>

//       <Grid item xs={2}>
//         <TextField
//           placeholder="Dose"
//           fullWidth
//           value={planOfCare.newMedication.dose}
//           onChange={(e) =>
//             updateNewMedication("dose", e.target.value)
//           }
//         />
//       </Grid>

//       <Grid item xs={2}>
//         <TextField
//           placeholder="Frequency"
//           fullWidth
//           value={planOfCare.newMedication.frequency}
//           onChange={(e) =>
//             updateNewMedication("frequency", e.target.value)
//           }
//         />
//       </Grid>

//       <Grid item xs={3}>
//         <TextField
//           type="datetime-local"
//           fullWidth
//           value={planOfCare.newMedication.lastDose}
//           onChange={(e) =>
//             updateNewMedication("lastDose", e.target.value)
//           }
//         />
//       </Grid>

//       <Grid item xs={2}>
//         <IconButton onClick={addMedication}>
//           <AddCircleOutlineIcon sx={{ color: "#228BE6" }} />
//         </IconButton>
//       </Grid>
//     </Grid>

//     {/* ACTION BUTTONS */}
//     <Box
//       sx={{
//         display: "flex",
//         justifyContent: "flex-end",
//         gap: 2,
//         mt: 3
//       }}
//     >
//       {/* <Button
//         variant="outlined"
//         sx={{
//           textTransform: "none",
//           borderColor: "#A7C0DA",
//           color: "#124D81"
//         }}
//       >
//         Save & Exit
//       </Button> */}

//       <Button
//         variant="contained"
//         onClick={saveInitialAssessment}
//         sx={{
//           textTransform: "none",
//           backgroundColor: "#228BE6",
//           px: 4
//         }}
//       >
//         Save
//       </Button>
//     </Box>
//   </AccordionDetails>
// </Accordion>


//        {/* <Accordion sx={{
//     background: "#FFFFFF",
//     borderRadius: "12px",
//     boxShadow: "none",
//     border: "1px solid #E6EEF6",
//     mt: 0
//   }}>
//         <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "#228BE6" }} />}>
//           <Typography sx={{ fontWeight: 600, color: "#0F2B45" }}>6. Others</Typography>
//         </AccordionSummary>
//         <AccordionDetails>
//           <Typography>Other Notes / Data</Typography>
//         </AccordionDetails>
//       </Accordion> */}
//     </Box>
//   );
// }




// function NurseAssessment() {
//   const visibleTextSX = {
//   "& .MuiTypography-root": {
//     color: "#0F2B45"
//   },
//   "& .MuiFormControlLabel-label": {
//     color: "#0F2B45",
//     fontSize: "14px"
//   },
//   "& .MuiCheckbox-root": {
//     color: "#228BE6"
//   },
//   "& .MuiInputBase-input": {
//     color: "#000"
//   },
//   "& .MuiOutlinedInput-notchedOutline": {
//     borderColor: "#D0D7E2"
//   },
//   "& .MuiInputLabel-root": {
//     color: "#124D81"
//   }
// };
//  const [vitals, setVitals] = useState({
//     temp: "",
//     hr: "",
//     rr: "",
//     spo2: "",
//     relatedText: "",
//     weight: "",
//     hc: "",
//     length: "",
//     bsl: "",
//     bp: ""
//   });
// const [patient, setPatient] = useState({
//   name: "",
//   gender: "",
//   doa: "",
//   admittedTime: "",
//   age: "",
//   uhid: "",
//   admissionNo: "",
//   companionName: "",
//   relationship: "",
//   language: ""
// });
// const updatePatient = (key: string, value: any) => {
//   setPatient((prev) => ({ ...prev, [key]: value }));
// };

//   const isVitalsComplete = () => {
//     return (
//       vitals.temp &&
//       vitals.hr &&
//       vitals.rr &&
//       vitals.spo2 &&
//       vitals.weight &&
//       vitals.hc &&
//       vitals.length &&
//       vitals.bsl &&
//       vitals.bp
//     );
//   };
  
//   const [relation,setRelation]=useState("");
//   const [medications, setMedications] = useState([
//   {
//     name: "",
//     dose: "",
//     frequency: "",
//     lastDose: ""
//   }
// ]);

// const updateMedication = (
//   index: number,
//   field: string,
//   value: string
// ) => {
//   const updated = [...medications];
//   updated[index][field] = value;
//   setMedications(updated);
// };

// const addMedicationRow = () => {
//   setMedications([
//     ...medications,
//     { name: "", dose: "", frequency: "", lastDose: "" }
//   ]);
// };
// const [allergies, setAllergies] = useState({
//   medication: "No",
//   bloodTransfusion: "No",
//   food: "No"
// });

// const updateAllergy = (field: string, value: string) => {
//   setAllergies((prev) => ({
//     ...prev,
//     [field]: value
//   }));
// };
// const [nursingNeeds, setNursingNeeds] = useState({
//   languageProblem: false,
//   culturalBarrier: false,
//   fallRisk: false,
//   incontinent: false,
//   oxygenTherapy: false,
//   tracheotomy: false,
//   pressureUlcerRisk: false,
//   specialNutrition: false,
//   implants: false,
//   otherNeeds: ""
// });

// const toggleNursingNeed = (key: string) => {
//   setNursingNeeds((prev) => ({
//     ...prev,
//     [key]: !prev[key]
//   }));
// };

// const updateOtherNeeds = (value: string) => {
//   setNursingNeeds((prev) => ({
//     ...prev,
//     otherNeeds: value
//   }));
// };

//   return (
//     <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
//       <Typography
//         sx={{
//           fontSize: 18,
//           fontWeight: 700,
//           color: "#124D81",
//           mb: 1,
//         }}
//       >
//       Nurse Assessment
//       </Typography>

//       {/* ----------------- Birth History ----------------- */}
//       <Accordion sx={{
//     background: "#FFFFFF",
//     borderRadius: "12px",
//     boxShadow: "none",
//     border: "1px solid #E6EEF6",
//     mt: 0
//   }}>
//   <AccordionSummary
//     expandIcon={<ExpandMoreIcon sx={{ color: "#228BE6", fontSize: 28 }} />}
//     sx={{
//       borderRadius: "12px",

//       // prevent rotation
//       "& .MuiAccordionSummary-expandIconWrapper": {
//         transform: "none !important"
//       },
//       "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
//         transform: "none !important"
//       },

//       "& .MuiAccordionSummary-content": {
//         fontWeight: 600,
//         color: "#0F2B45"
//       }
//     }}
//   >
//     <Typography sx={{ fontWeight: 600, color: "#0F2B45" }}>
//       1.Patient Details
//     </Typography>
//   </AccordionSummary>

//   <AccordionDetails
//     sx={{
//       "& *": { color: "#0F2B45" },
//       "& .MuiInputBase-input": { color: "#000" },
//       "& .MuiFormControlLabel-label": { color: "#0F2B45" }
//     }}
//   >
//     <Grid container spacing={2}>
//       {/* Name */}
//       <Grid item xs={12} md={8}>
//         <Typography sx={{ fontWeight: 600 }}>Name *</Typography>
//         <TextField
//   fullWidth
//   placeholder="Mother's name"
//   value={patient.name}
//   onChange={(e) => updatePatient("name", e.target.value)}
//   sx={{ background: "#F9FBFF" }}
// />

//       </Grid>

//       {/* Gender */}
//       <Grid item xs={12} md={4}>
//         <Typography sx={{ fontWeight: 600 }}>Gender *</Typography>
//         <ToggleButtonGroup
//   exclusive
//   fullWidth
//   value={patient.gender}
//   onChange={(e, v) => updatePatient("gender", v)}
// >
//   {["Male", "Female"].map((g) => (
//     <ToggleButton
//       key={g}
//       value={g}
//       sx={{
//         textTransform: "none",
//         fontWeight: 600,
//         background: "#F9FAFB",
//         color:"#868E96",
//         "&.Mui-selected": {
//           background: "#F9FAFB",
//           color: "#228BE6"
//         }
//       }}
//     >
//       {g}
//     </ToggleButton>
//   ))}
// </ToggleButtonGroup>

//       </Grid>

//       {/* DOA */}
//       <Grid item xs={12} md={4}>
//         <Typography sx={{ fontWeight: 600 }}>DOA *</Typography>
//       <TextField
//   type="date"
//   fullWidth
//   name="doa"
//   value={patient.doa}
//   onChange={(e) => updatePatient("doa", e.target.value)}
//   inputProps={{
//     max: new Date().toISOString().split("T")[0], // ⛔ no future dates
//   }}
//   InputLabelProps={{ shrink: true }}
//   sx={{
//     backgroundColor: "#F5F5F5",
//     borderRadius: 1,
//     "& .MuiInputBase-input": {
//       color: "#000",
//       opacity: 1,
//     },
//   }}
// />


//       </Grid>

//       {/* Admitted Time */}
//       <Grid item xs={12} md={4}>
//         <Typography sx={{ fontWeight: 600 }}>Admitted time *</Typography>
//       <TextField
//   type="time"
//   fullWidth
//   name="admittedTime"
//   value={patient.admittedTime}
//   onChange={(e) => updatePatient("admittedTime", e.target.value)}
//   InputLabelProps={{ shrink: true }}
//   sx={{
//     backgroundColor: "#F5F5F5",
//     borderRadius: 1,
//     "& .MuiInputBase-input": {
//       color: "#000",
//       opacity: 1,
//     },
//   }}
// />


//       </Grid>

//       {/* Age */}
//       <Grid item xs={12} md={4}>
//         <Typography sx={{ fontWeight: 600 }}>Age</Typography>
//         <TextField
//           fullWidth
//           value={patient.age}
//   onChange={(e) => updatePatient("age", e.target.value)}
//           sx={{ background: "#F9FBFF" }}
//         />
//       </Grid>

//       {/* UHID */}
//       <Grid item xs={12} md={6}>
//         <Typography sx={{ fontWeight: 600 }}>UHID</Typography>
//         <TextField
//   fullWidth
//   value={patient.uhid}
//   onChange={(e) => updatePatient("uhid", e.target.value)}
//   sx={{ background: "#F9FBFF" }}
// />

//       </Grid>

//       {/* Admission No */}
//       <Grid item xs={12} md={6}>
//         <Typography sx={{ fontWeight: 600 }}>Admission No</Typography>
//         <TextField
//   fullWidth
//   value={patient.admissionNo}
//   onChange={(e) => updatePatient("admissionNo", e.target.value)}
//   sx={{ background: "#F9FBFF" }}
// />

//       </Grid>

//       {/* Companion */}
//       <Grid item xs={12} md={6}>
//         <Typography sx={{ fontWeight: 600 }}>Name of companion</Typography>
//         <TextField
//   fullWidth
//   placeholder="Name of the Kin/companion"
//   value={patient.companionName}
//   onChange={(e) => updatePatient("companionName", e.target.value)}
//   sx={{ background: "#F9FBFF" }}
// />

//       </Grid>

//       {/* Relationship */}
//       <Grid item xs={12} md={6}>
//         <Typography sx={{ fontWeight: 600 }}>Relationship</Typography>
//         <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
//             {/* Chief Complaints */}
           
//             <TextField
  
//   fullWidth
//   multiline
//   minRows={2}
//   value={relation}
//   onChange={(e) => setRelation(e.target.value)}

//               sx={{
//                 backgroundColor: "#F9FBFF",
//                 borderRadius: 2,
//                 "& .MuiInputBase-input": { color: "#000" },
//               }}
//             />

//             {/* Complaint Tags */}
//            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
//   {[
//     "Father","Mother","Brother","Cousin"
//   ].map((tag) => (
//     <Chip
//       key={tag}
//       label={tag}
//       clickable
//       onClick={() => {
//         setRelation((prev) =>
//           prev
//             ? prev.includes(tag)
//               ? prev
//               : `${prev}, ${tag}`
//             : tag
//         );
//       }}
//       sx={{
//         backgroundColor: "#E7F1FD",
//         color: "#124D81",
//         fontWeight: 500,
//         cursor: "pointer",
//         "&:hover": {
//           backgroundColor: "#D0E4FF",
//         },
//       }}
//     />
//   ))}
// </Box>
// </Box>
//       </Grid>

//       {/* Language */}
//       <Grid item xs={12}>
//         <Typography sx={{ fontWeight: 600 }}>
//           Primary Language Spoken *
//         </Typography>
//        <ToggleButtonGroup
//   exclusive
//   fullWidth
//   value={patient.language}
//   onChange={(e, v) => updatePatient("language", v)}
// >
//   {["Marathi", "Hindi", "English", "Urdu", "Other"].map((lang) => (
//     <ToggleButton
//       key={lang}
//       value={lang}
//       sx={{
//         textTransform: "none",
//         fontWeight: 600,
//         background: "#F9FAFB",
//         color:"#868E96",
//         "&.Mui-selected": {
//           background: "#F9FAFB",
//           color: "#228BE6"
//         }
//       }}
//     >
//       {lang}
//     </ToggleButton>
//   ))}
// </ToggleButtonGroup>

//       </Grid>

//       {/* Buttons */}
//       <Grid item xs={12}>
//         <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
//           <Button
//             variant="outlined"
//             sx={{
//               textTransform: "none",
//               borderColor: "#A7C0DA",
//               color: "#124D81"
//             }}
//           >
//             Save & Exit
//           </Button>
//           <Button
//             variant="contained"
            
//             sx={{
//               textTransform: "none",
//               backgroundColor: "#228BE6",
//               px: 4
//             }}
//           >
//             Next
//           </Button>
//         </Box>
//       </Grid>
//     </Grid>
//   </AccordionDetails>
// </Accordion>


//       {/* ----------------- Other Sections ----------------- */}


//      <Accordion sx={{
//     background: "#FFFFFF",
//     borderRadius: "12px",
//     boxShadow: "none",
//     border: "1px solid #E6EEF6",
//     mt: 0
//   }}>
//       <AccordionSummary
//         expandIcon={
//           isVitalsComplete() ? (
//             <CheckCircleIcon sx={{ color: "green", fontSize: 30 }} />
//           ) : (
//             <ExpandMoreIcon sx={{ color: "#228BE6", fontSize: 30 }} />
//           )
//         }
//         sx={{
//           backgroundColor: isVitalsComplete() ? "#D9F7D9" : "#FFFFFF",
//           borderRadius: "12px",
//           "& .MuiAccordionSummary-expandIconWrapper": {
//             transform: "none !important"
//           },
//           "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
//             transform: "none !important"
//           }
//         }}
//       >
//         <Typography sx={{ fontWeight: 600, color: "#0F2B45" }}>
//           2. Vitals & Anthropometry
//         </Typography>
//       </AccordionSummary>

//       <AccordionDetails sx={{ p: 3 }}>
//         {/* Vitals Row */}
//         <Typography sx={{ fontWeight: 600, color: "#124D81" }}>Vitals</Typography>

//         <Grid container spacing={2} sx={{ mt: 1 }}>
//           {[
//             { label: "Temp °C", key: "temp" },
//             { label: "HR bpm", key: "hr" },
//             { label: "RR bpm", key: "rr" },
//             { label: "SpO₂ %", key: "spo2" }
//           ].map((item) => (
//             <Grid item xs={6} md={3} key={item.key}>
//               <TextField
//                 placeholder="00"
//                 fullWidth
//                 value={vitals[item.key]}
//                 onChange={(e) =>
//                   setVitals({ ...vitals, [item.key]: e.target.value })
//                 }
//                 sx={{
//                   background: "#F9FBFF",
//                   "& .MuiInputBase-input": { color: "#000" }
//                 }}
//               />
//             </Grid>
//           ))}

//           {/* Other related text */}
//           <Grid item xs={12}>
//             <TextField
//               placeholder="Other related text..."
//               fullWidth
//               value={vitals.relatedText}
//               onChange={(e) =>
//                 setVitals({ ...vitals, relatedText: e.target.value })
//               }
//               sx={{
//                 background: "#F9FBFF",
//                 "& .MuiInputBase-input": { color: "#000" }
//               }}
//             />
//           </Grid>
//         </Grid>

//         {/* Measurements */}
//         <Typography sx={{ mt: 4, fontWeight: 600, color: "#124D81" }}>
//           Measurements
//         </Typography>

//         <Grid container spacing={2} sx={{ mt: 1 }}>
//           <Grid item xs={12} md={4}>
//             <TextField
//               placeholder="Weight (g)"
//               fullWidth
//               value={vitals.weight}
//               onChange={(e) => setVitals({ ...vitals, weight: e.target.value })}
//               sx={{ background: "#F9FBFF", "& .MuiInputBase-input": { color: "#000" } }}
//             />
//           </Grid>

//           <Grid item xs={12} md={4}>
//             <TextField
//               placeholder="HC (cm)"
//               fullWidth
//               value={vitals.hc}
//               onChange={(e) => setVitals({ ...vitals, hc: e.target.value })}
//               sx={{ background: "#F9FBFF", "& .MuiInputBase-input": { color: "#000" } }}
//             />
//           </Grid>

//           <Grid item xs={12} md={4}>
//             <TextField
//               placeholder="Length (cm)"
//               fullWidth
//               value={vitals.length}
//               onChange={(e) => setVitals({ ...vitals, length: e.target.value })}
//               sx={{ background: "#F9FBFF", "& .MuiInputBase-input": { color: "#000" } }}
//             />
//           </Grid>
//         </Grid>

//         {/* BSL + BP */}
//         <Typography sx={{ mt: 4, fontWeight: 600, color: "#124D81" }}>
//           BSL / Blood Glucose
//         </Typography>

//         <Grid container spacing={2} sx={{ mt: 1 }}>
//           <Grid item xs={12} md={6}>
//             <TextField
//               placeholder="00 mg/dL"
//               fullWidth
//               value={vitals.bsl}
//               onChange={(e) => setVitals({ ...vitals, bsl: e.target.value })}
//               sx={{ background: "#F9FBFF", "& .MuiInputBase-input": { color: "#000" } }}
//             />
//           </Grid>

//           <Grid item xs={12} md={6}>
//             <TextField
//               placeholder="00 mmHg"
//               fullWidth
//               value={vitals.bp}
//               onChange={(e) => setVitals({ ...vitals, bp: e.target.value })}
//               sx={{ background: "#F9FBFF", "& .MuiInputBase-input": { color: "#000" } }}
//             />
//           </Grid>
//         </Grid>

//         {/* Buttons */}
//         <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4, gap: 2 }}>
//           <Button
//             variant="outlined"
//             sx={{
//               textTransform: "none",
//               borderRadius: 2,
//               borderColor: "#A7C0DA",
//               color: "#124D81"
//             }}
//           >
//             Save & Exit
//           </Button>

//           <Button
//             variant="contained"
            
//             sx={{
//               textTransform: "none",
//               backgroundColor: "#228BE6",
//               borderRadius: 2,
//               px: 4
//             }}
//           >
//             Next
//           </Button>
//         </Box>
//       </AccordionDetails>
//     </Accordion>

//       <Accordion
      
//   sx={{
//     background: "#FFFFFF",
//     borderRadius: "12px",
//     boxShadow: "none",
//     border: "1px solid #E6EEF6",
//     mt: 0
//   }}
// >
//   <AccordionSummary
//     expandIcon={<ExpandMoreIcon sx={{ color: "#228BE6", fontSize: 28 }} />}
//     sx={{
      
//       "& .MuiAccordionSummary-content": {
//         fontWeight: 600,
//         color: "#0F2B45"
//       }
//     }}
//   >
//     <Typography sx={{ fontWeight: 600 }}>
//       3. Current Medications
//     </Typography>
//   </AccordionSummary>

//   <AccordionDetails
//     sx={{
//       "& *": { color: "#0F2B45" },
//       "& .MuiInputBase-input": { color: "#000" }
//     }}
//   >
//     {/* HEADER */}
//     <Grid container spacing={2} sx={{ mb: 4,marginLeft:"26px" }}>
//       {["Medication", "Dose", "Frequency", "Date / Time of last dose"].map(
//         (h) => (
//           <Grid item xs={3} key={h}>
//             <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
//               {h}
//             </Typography>
//           </Grid>
//         )
//       )}
//     </Grid>

//     {/* ROWS */}
//     {medications.map((med, index) => (
//       <Grid
//         container
//         spacing={2}
//         alignItems="center"
//         key={index}
//         sx={{
//           mb: 1,
//           p: 1.5,
//           borderRadius: "10px",
//           border: "1px solid #E6EEF6"
//         }}
//       >
//         <Grid item xs={3}>
//           <TextField
//             fullWidth
//             placeholder="Search or enter name"
//             value={med.name}
//             onChange={(e) =>
//               updateMedication(index, "name", e.target.value)
//             }
//             sx={{ background: "#F9FBFF" }}
//           />
//         </Grid>

//         <Grid item xs={3}>
//           <TextField
//             fullWidth
//             placeholder="Dose"
//             value={med.dose}
//             onChange={(e) =>
//               updateMedication(index, "dose", e.target.value)
//             }
//             sx={{ background: "#F9FBFF" }}
//           />
//         </Grid>

//         <Grid item xs={3}>
//           <TextField
//             fullWidth
//             placeholder="Frequency"
//             value={med.frequency}
//             onChange={(e) =>
//               updateMedication(index, "frequency", e.target.value)
//             }
//             sx={{ background: "#F9FBFF" }}
//           />
//         </Grid>

//         <Grid item xs={3}>
//           <TextField
//             type="datetime-local"
//             fullWidth
//             value={med.lastDose}
//             onChange={(e) =>
//               updateMedication(index, "lastDose", e.target.value)
//             }
//             sx={{
//               background: "#F9FBFF",
//               "& .MuiInputBase-input": { color: "#000" }
//             }}
//           />
//         </Grid>
//       </Grid>
//     ))}

//     {/* ADD BUTTON */}
//     <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
//       <IconButton
//         onClick={addMedicationRow}
//         sx={{
//           background: "#E7F1FD",
//           borderRadius: "8px"
//         }}
//       >
//         +
//       </IconButton>
//     </Box>

//     {/* ACTION BUTTONS */}
//     <Box
//       sx={{
//         display: "flex",
//         justifyContent: "flex-end",
//         gap: 2,
//         mt: 3
//       }}
//     >
//       <Button
//         variant="outlined"
//         sx={{
//           textTransform: "none",
//           borderColor: "#A7C0DA",
//           color: "#124D81"
//         }}
//       >
//         Save & Exit
//       </Button>

//       <Button
//         variant="contained"
        
//         sx={{
//           textTransform: "none",
//           backgroundColor: "#228BE6",
//           px: 4
//         }}
//       >
//         Next
//       </Button>
//     </Box>
//   </AccordionDetails>
// </Accordion>

// <Accordion

//   sx={{
//     background: "#FFFFFF",
//     borderRadius: "12px",
//     boxShadow: "none",
//     border: "1px solid #E6EEF6",
//     mt: 0
//   }}
// >
//   <AccordionSummary
//     expandIcon={<ExpandMoreIcon sx={{ color: "#228BE6", fontSize: 28 }} />}
//     sx={{
//       "& .MuiAccordionSummary-expandIconWrapper": {
//         transform: "none !important"
//       },
//       "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
//         transform: "none !important"
//       },
//       "& .MuiAccordionSummary-content": {
//         fontWeight: 600,
//         color: "#0F2B45"
//       }
//     }}
//   >
//     <Typography sx={{ fontWeight: 600 }}>
//       4. Allergies / Adverse Reaction
//     </Typography>
//   </AccordionSummary>

//   <AccordionDetails
//     sx={{
//       "& *": { color: "#0F2B45" }
//     }}
//   >
//     {[
//       { label: "Medication / Drug", key: "medication" },
//       { label: "Blood Transfusion", key: "bloodTransfusion" },
//       { label: "Food", key: "food" }
//     ].map((item) => (
//       <Box key={item.key} sx={{ mb: 3 }}>
//         <Typography sx={{ fontWeight: 600, mb: 1 }}>
//           {item.label}
//         </Typography>

//         <ToggleButtonGroup
//           exclusive
//           fullWidth
//           value={allergies[item.key]}
//           onChange={(e, v) => v && updateAllergy(item.key, v)}
//           sx={{
//             borderRadius: "10px",
//             overflow: "hidden",
//             border: "1px solid #E6EEF6"
//           }}
//         >
//           {["No", "Not Known", "Yes"].map((opt) => (
//             <ToggleButton
//               key={opt}
//               value={opt}
//               sx={{
//                 textTransform: "none",
//                 fontWeight: 600,
//                 color: "#7A8899",
//                 border: "none",
//                 "&.Mui-selected": {
//                   backgroundColor: "#E7F1FD",
//                   color: "#228BE6"
//                 }
//               }}
//             >
//               {opt}
//             </ToggleButton>
//           ))}
//         </ToggleButtonGroup>
//       </Box>
//     ))}

//     {/* ACTION BUTTONS */}
//     <Box
//       sx={{
//         display: "flex",
//         justifyContent: "flex-end",
//         gap: 2,
//         mt: 3
//       }}
//     >
//       <Button
//         variant="outlined"
//         sx={{
//           textTransform: "none",
//           borderColor: "#A7C0DA",
//           color: "#124D81"
//         }}
//       >
//         Save & Exit
//       </Button>

//       <Button
//         variant="contained"
        
//         sx={{
//           textTransform: "none",
//           backgroundColor: "#228BE6",
//           px: 4
//         }}
//       >
//         Next
//       </Button>
//     </Box>
//   </AccordionDetails>
// </Accordion>

// <Accordion

//   sx={{
//     background: "#FFFFFF",
//     borderRadius: "12px",
//     boxShadow: "none",
//     border: "1px solid #E6EEF6",
//     mt: 0
//   }}
// >
//   <AccordionSummary
//     expandIcon={<ExpandMoreIcon sx={{ color: "#228BE6", fontSize: 28 }} />}
//     sx={{
//       "& .MuiAccordionSummary-expandIconWrapper": {
//         transform: "none !important"
//       },
//       "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
//         transform: "none !important"
//       },
//       "& .MuiAccordionSummary-content": {
//         fontWeight: 600,
//         color: "#0F2B45"
//       }
//     }}
//   >
//     <Typography sx={{ fontWeight: 600 }}>
//       5. Nursing Needs
//     </Typography>
//   </AccordionSummary>

//   <AccordionDetails
//     sx={{
//       "& *": { color: "#0F2B45" }
//     }}
//   >
//     {[
//       { label: "Is there a Language Problem", key: "languageProblem" },
//       { label: "Any Cultural / Religious barriers", key: "culturalBarrier" },
//       { label: "Is the patient at risk for falls", key: "fallRisk" },
//       { label: "Is the patient incontinent", key: "incontinent" },
//       { label: "Does patient require oxygen therapy", key: "oxygenTherapy" },
//       { label: "Has tracheotomy been done", key: "tracheotomy" },
//       { label: "Is the patient at risk for pressure ulcers", key: "pressureUlcerRisk" },
//       { label: "Any special nutritional needs", key: "specialNutrition" },
//       { label: "Does the patient have implants", key: "implants" }
//     ].map((item) => (
//       <Box
//         key={item.key}
//         sx={{
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//           border: "1px solid #E6EEF6",
//           borderRadius: "8px",
//           px: 2,
//           py: 1.5,
//           mb: 1.5
//         }}
//       >
//         <Typography sx={{ fontWeight: 500 }}>
//           {item.label}
//         </Typography>

//         <Checkbox
//           checked={nursingNeeds[item.key]}
//           onChange={() => toggleNursingNeed(item.key)}
//           sx={{ color: "#228BE6" }}
//         />
//       </Box>
//     ))}

//     {/* OTHER NEEDS */}
//     <TextField
//       fullWidth
//       placeholder="Any other needs, please write here"
//       value={nursingNeeds.otherNeeds}
//       onChange={(e) => updateOtherNeeds(e.target.value)}
//       sx={{
//         mt: 2,
//         background: "#F9FBFF",
//         borderRadius: "8px",
//         "& .MuiInputBase-input": { color: "#000" }
//       }}
//     />

//     {/* ACTION BUTTONS */}
//     <Box
//       sx={{
//         display: "flex",
//         justifyContent: "flex-end",
//         gap: 2,
//         mt: 3
//       }}
//     >
//       <Button
//         variant="outlined"
//         sx={{
//           textTransform: "none",
//           borderColor: "#A7C0DA",
//           color: "#124D81"
//         }}
//       >
//         Save & Exit
//       </Button>

//       <Button
//         variant="contained"
//         sx={{
//           textTransform: "none",
//           backgroundColor: "#228BE6",
//           px: 4
//         }}
//       >
//         Next
//       </Button>
//     </Box>
//   </AccordionDetails>
// </Accordion>

//     </Box>);
// }

// function AdmissionDetails({ patient }: { patient: any, }) {
//   if (!patient) return null;
//   const generateAdmissionform = async (patient: any) => {
//     const pdf = new jsPDF("p", "mm", "a4");
   
//     const pageWidth = 210;
//     const margin = 12;
//     let y = 40;
//     let orgName = "Unknown Organization";
//     let logoDataUrl: string | null = null;
    
//     try {
//       // =========================
//       // Fetch Organization
//       // =========================
//       const orgUrl = `${import.meta.env.VITE_FHIRAPI_URL}/Organization/${props.userOrganization}`;
     

     

  
//       const res = await fetch(orgUrl, {
//         headers: {
//           Authorization: "Basic " + btoa("fhiruser:change-password"),
//           Accept: "application/fhir+json",
//         },
//       });
  
//       if (!res.ok) throw new Error(`Organization fetch failed: ${res.status}`);
  
//       const orgData = await res.json();
//       orgName = orgData.name || orgName;
//       console.log("✅ Organization name fetched:", orgName);
  
//       // =========================
//       // Fetch logo Binary if exists
//       // =========================
//       const extensions = Array.isArray(orgData.extension) ? orgData.extension : [];
//       const logoExt = extensions.find(
//         (ext: any) =>
//           ext.url === "http://example.org/fhir/StructureDefinition/organization-logo"
//       );
//       const logoRef = logoExt?.valueReference?.reference;
//       console.log("🔗 Logo Reference (fixed):", logoRef);
  
//       if (logoRef) {
//         const binaryId = logoRef.replace("Binary/", "");
//         const binaryUrl = `${import.meta.env.VITE_FHIRAPI_URL}/Binary/${binaryId}`;
//         console.log("🖼️ Fetching Binary from:", binaryUrl);
  
//         const binaryRes = await fetch(binaryUrl, {
//           headers: {
//             Authorization: "Basic " + btoa("fhiruser:change-password"),
//             Accept: "application/fhir+json",
//           },
//         });
  
//         if (!binaryRes.ok) throw new Error(`Binary fetch failed: ${binaryRes.status}`);
  
//         const binaryData = await binaryRes.json();
//         console.log("📦 Binary fetched:", binaryData);
  
//         if (binaryData.data && binaryData.contentType) {
//           logoDataUrl = `data:${binaryData.contentType};base64,${binaryData.data}`;
//           console.log("✅ Logo Data URL ready (first 50 chars):", logoDataUrl.slice(0, 50) + "...");
//         } else {
//           console.warn("⚠️ Binary missing data/contentType");
//         }
//       } else {
//         console.warn("⚠️ No logo extension found in Organization");
//       }
//     } catch (err) {
//       console.error("❌ Error fetching organization/logo:", err);
//     }
//     // const logoBase64="";
//     const logoBoxSize = 60;
//     const logoX = 40;
//     const logoY = 20;
  
//     try {
//       if (logoDataUrl) {
//         const img = new Image();
//         img.src = logoDataUrl;
  
//         await new Promise<void>((resolve, reject) => {
//           img.onload = () => resolve();
//           img.onerror = (e) => reject(e);
//         });
//         console.log("🖼️ Logo image loaded");
  
//         const aspectRatio = img.width / img.height;
//         let drawWidth = logoBoxSize;
//         let drawHeight = logoBoxSize;
  
//         if (aspectRatio > 1) drawHeight = logoBoxSize / aspectRatio;
//         else drawWidth = logoBoxSize * aspectRatio;
  
//         const offsetX = logoX + (logoBoxSize - drawWidth) / 2;
//         const offsetY = logoY + (logoBoxSize - drawHeight) / 2- 10;
  
//         pdf.addImage(img, "PNG", offsetX, offsetY, drawWidth, drawHeight);
//         console.log("✅ Logo added to PDF");
//       } else {
//         console.warn("⚠️ No logo, drawing fallback rectangle");
//         pdf.setFillColor(200, 220, 255);
//         pdf.rect(logoX, logoY, logoBoxSize, logoBoxSize, "F");
//         pdf.setFontSize(8);
//         pdf.text("No Logo", logoX + 5, logoY + 30);
//       }
//     } catch (err) {
//       console.error("❌ Failed to add logo:", err);
//       pdf.setFillColor(200, 220, 255);
//       pdf.rect(logoX, logoY, logoBoxSize, logoBoxSize, "F");
//     }
  
//     // pdf.addImage(
//     //   logoDataUrl,
//     //   "PNG",
//     //   pageWidth - 45, // X (right aligned)
//     //   8,              // Y
//     //   35,             // width
//     //   15              // height
//     // );
//     pdf.setFont("Times", "Normal");
//     pdf.setFontSize(11);
   
//     // ===== HEADER =====
//     pdf.setFontSize(14);
//     pdf.text("ADMISSION RECORD", pageWidth / 2, y, { align: "center" });
//     y += 6;
   
//     pdf.line(margin, y, pageWidth - margin, y);
//     y += 6;
   
//     pdf.setFontSize(11);
   
//     // ===== ROW HELPER =====
//     const row = (
//       l1: string,
//       v1: string,
//       l2?: string,
//       v2?: string
//     ) => {
//       pdf.text(l1, margin, y);
//       pdf.text(v1 || "-", margin + 35, y);
   
//       if (l2 && v2) {
//         pdf.text(l2, pageWidth / 2, y);
//         pdf.text(v2 || "-", pageWidth / 2 + 35, y);
//       }
   
//       y += 7;
     
//     };
   
//     // ===== PATIENT DETAILS =====
//     row(
//       "Name :",
//       `Baby of ${patient.motherName || "-"}`,
//       "UHID :",
//       patient.patientId || "-"
//     );
   
//     row(
//       "Age / Gender :",
//       `${patient.gestationalAge || "-"} / ${patient.gender || "-"}`,
//       "Admission No :",
//       patient.admissionNo || "-"
//     );
   
//     row(
//       "Mobile No :",
//       patient.mobile || "-",
//       "Nationality :",
//       patient.nationality || "-"
//     );
   
//     row(
//       "DOB :",
//       patient.birthDate || "-",
//       "Marital Status :",
//       patient.maritalStatus || "-"
//     );
   
//     row(
//       "Bed No / Ward :",
//       patient.bed || "-",
//       "Special Needs :",
//       patient.specialNeeds ? "Yes" : "No"
//     );
   
//     pdf.text("Address :", margin, y);
//     pdf.text(
//       patient.address || "-",
//       margin + 35,
//       y,
//       { maxWidth: pageWidth - margin * 2 - 35 }
//     );
   
//     y += 10;
//     pdf.line(margin, y - 5, pageWidth - margin, y - 5);
   
//     // ===== NEXT OF KIN =====
//     pdf.setFont("Times", "Bold");
//     pdf.text("Next of Kin", margin, y);
//     pdf.setFont("Times", "Normal");
//     y += 6;
   
//     row("Name :", patient.kinName || "-");
//     row("Relationship :", patient.kinRelation || "-");
//     row("Address :", patient.kinAddress || "-");
//     row("Phone :", patient.kinMobile || "-");
//     pdf.line(margin, y-5, pageWidth - margin, y-5);
//     // ===== ADMISSION DETAILS =====
//     pdf.setFont("Times", "Bold");
//     pdf.text("Admission Details", margin, y);
//     pdf.setFont("Times", "Normal");
//     y += 6;
   
//     row("Date of Admission :", patient.admissionDate || "-");
//     row("Treating Doctor :", patient.treatingDoctor || "-");
//     row("Admitting Doctor :", patient.admittingDoctor || "-");
//     row("Referring Doctor :", patient.refHospital || "-");
//   pdf.line(margin, y-5, pageWidth - margin, y-5);
//     // ===== CONSENT =====
//     y += 4;
//     pdf.setFont("Times", "Bold");
//     pdf.text("Consent for Admission & Treatment", margin+65, y);
//     pdf.setFont("Times", "Normal");
//     y += 6;
   
//     pdf.text(
//       `I ____________________ request hospital authorities for my / ________ admission under the supervision of my attending Dr. ____________________.I hereby give my consent to my attending doctor or his/her designee to admit me under their care and decide the necessary treatment, operation or procedure required as per the situation.I have understood the expenses for my treatment and I agree to follow all hospital rules and regulations.`,
//       margin,
//       y+2,
//       { maxWidth: pageWidth - margin * 2 ,
//         align:"justify",
//         lineHeightFactor:2
//       }
//     );
   
//     y += 35;
   
//     // ===== SIGNATURES =====
//     pdf.text("Name :", margin, y+2);
//     pdf.text("Signature of Patient", margin, y + 10);
   
//     pdf.text("Name of Witness:", pageWidth / 2, y+2);
//     pdf.text("Signature of Witness:", pageWidth / 2, y + 10);
   
//     y += 18;
//     pdf.text("Admitted By : -", margin, y+28);
//     pdf.text("Printed By : -", pageWidth / 2, y+28);
   
//     y += 8;
//     pdf.text(
//       `Print Date & Time : ${new Date().toLocaleString()}`,
//       margin,
//       y+32
//     );
   
//     // ===== FOOTER =====
//     y = 285;
//     pdf.line(margin, y, pageWidth - margin, y);
//     y += 5;
//     pdf.setFontSize(9);
//     pdf.text(
//       "HELPLINE : 9893200539 | 5th & 6th Floor, Archit Sai Avenue, Nashik",
//       pageWidth / 2,
//       y,
//       { align: "center" }
//     );
   
//     pdf.save("Admission_Record.pdf");
//   };
//   return (
//     <Card
//       elevation={0}
//       sx={{
//         backgroundColor: "#ffffff",
//         borderRadius: 2,
//         p: 3,
//         border: "1px solid #E0E0E0",
//       }}
//     >
    
//       <Grid container spacing={2}>
//         <Grid item display={'flex'} gap={3} xs={6}>
//           <Typography variant="subtitle1" sx={{ color: "#6B7280" }}>
//             Mobile No :
//           </Typography>
//           <Typography variant="inherit" sx={{ fontWeight: 600, color: "#111827"}}>
//             {patient.mobile}
//           </Typography>
//         </Grid>

//         <Grid item display={'flex'} gap={3} xs={6}>
//           <Typography variant="subtitle1" sx={{ color: "#6B7280" }}>
//             Nationality :
//           </Typography>
//           <Typography variant="inherit" sx={{ fontWeight: 600, color: "#111827"}}>
//             {patient.nationality}
//           </Typography>
//         </Grid>

//         <Grid item display={'flex'} alignItems={'center'} gap={3} xs={12}>
//           <Typography variant="subtitle1" sx={{ color: "#6B7280" }}>
//             Address :
//           </Typography>
//           <Typography variant="inherit" sx={{ fontWeight: 600, color: "#111827"}}>
//   {patient.address}
// </Typography>

//         </Grid>
//       </Grid>

//       <Divider sx={{ my: 2,backgroundColor:'grey' }} />

   

//       <Grid container spacing={2}>
//         <Grid item display={'flex'} gap={2} xs={6}>
//           <Typography fontSize={13} sx={{ color: "#6B7280" }}>
//           Next of Kin Name :
//           </Typography>
//           <Typography fontWeight={500} sx={{ color: "#111827" }}>
//             {patient.kinName}
//           </Typography>
//         </Grid>

//         <Grid item display={'flex'} gap={3} xs={6}>
//           <Typography fontSize={13} sx={{ color: "#6B7280" }}>
//             Relationship :
//           </Typography>
//           <Typography fontWeight={500} sx={{ color: "#111827" }}>
//             {patient.kinRelation}
//           </Typography>
//         </Grid>

//         <Grid item display={'flex'} gap={3} xs={6}>
//           <Typography fontSize={13} sx={{ color: "#6B7280" }}>
//             Mobile No :
//           </Typography>
//           <Typography fontWeight={500} sx={{ color: "#111827" }}>
//             {patient.kinMobile}
//           </Typography>
//         </Grid>

//         <Grid item display={'flex'} gap={3} xs={12}>
//           <Typography fontSize={13} sx={{ color: "#6B7280" }}>
//             Address :
//           </Typography>
//           <Typography fontWeight={500} sx={{ color: "#111827" }}>
//             {patient.kinAddress}
//           </Typography>
//         </Grid>
//       </Grid>
//       <Divider sx={{ my: 2,backgroundColor:'grey' }} />
//       <Grid display={'flex'}  justifyContent={'space-between'}>
       
//         <Grid item display={'flex'} gap={3} xs={6}>
//           <Typography variant="subtitle1" sx={{ color: "#6B7280" }}>
//           DOA
//           </Typography>
//           <Typography variant="inherit" sx={{ fontWeight: 600, color: "#111827"}}>
//             {patient.treatingDoctor}
//           </Typography>
//         </Grid>
//         <Grid item display={'flex'} gap={3} xs={6}>
//           <Typography variant="subtitle1" sx={{ color: "#6B7280" }}>
//           Treating Doctor
//           </Typography>
//           <Typography variant="inherit" sx={{ fontWeight: 600, color: "#111827"}}>
//             {patient.treatingDoctor}
//           </Typography>
//         </Grid>
//         <Grid item display={'flex'} gap={3} xs={6}>
//           <Typography variant="subtitle1" sx={{ color: "#6B7280" }}>
//           Admitting Doctor
//           </Typography>
//           <Typography variant="inherit" sx={{ fontWeight: 600, color: "#111827"}}>
//             {patient.treatingDoctor}
//           </Typography>
//         </Grid>
//         <Grid item display={'flex'} gap={2} >
//           <Typography variant="subtitle1" sx={{ color: "#6B7280" }}>
//             Reffering Doctor
//           </Typography>
//           <Typography variant="inherit" sx={{ fontWeight: 600, color: "#111827"}}>
//             {patient.treatingDoctor}
//           </Typography>
//         </Grid>
//       </Grid>
     
 
//       <Box mt={3} >
//         <Typography fontSize={12} sx={{ color: "#6B7280" }}>
//           Filled by:Doctor Name
//         </Typography>
//         <Box
//   sx={{
//     position: "absolute",
//     bottom: 16,
//     right: 16,
//     display: "flex",
//     alignItems: "center",
//     p: 1.5,
//     borderRadius: "10px",
//     border: "1px solid #e2e8f0",
//     backgroundColor: "#f8fafc",
//     transition: "0.2s",
//     "&:hover": {
//       backgroundColor: "#edf2f7",
//       boxShadow: "0px 2px 8px rgba(0,0,0,0.08)",
//       cursor: "pointer",
//     },
//   }}
// >
//   <DownloadForOfflineIcon
//     onClick={() => generateAdmissionform(patient)}
//     sx={{ color: "#124D81" }}
//   />
// </Box>
//       </Box>
//     </Card>
//   );
// }

function AuditLogs() {
  return <Typography>Audit Logs Section</Typography>;
}

function OtherDocs() {
  return <Typography>Other Documents Section</Typography>;
}
