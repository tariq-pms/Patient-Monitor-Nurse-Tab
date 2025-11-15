import { useState } from 'react';
import { Box, Tabs, Tab, Button, CircularProgress, DialogActions, Dialog, DialogTitle, DialogContent, Snackbar, Alert} from '@mui/material';
import jsPDF from 'jspdf';

import { ApgarScreen } from './ApgarScreen';
import { BallardScore } from './BallardScore';
import { DowneScore } from './DowneScore';
import autoTable from 'jspdf-autotable';
import DownloadIcon from '@mui/icons-material/Download';

interface AssessmentsProps {
  patient_resource_id: string;
  patient_name: string;
  patient_id: string;
  gestational_age: string;
  birth_date:string;
  UserRole: string;
  userOrganization: string;
}

export const Assessments = ({ patient_name, patient_id, patient_resource_id, UserRole,userOrganization, gestational_age,birth_date }: AssessmentsProps) => {
  const [activeTab, setActiveTab] = useState(0);
  const [loadingPDF, setLoadingPDF] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleDownloadAllProcedures = async () => {
    setLoadingPDF(true);
  
    try {
      const baseUrl = import.meta.env.VITE_FHIRAPI_URL;
      const proceduresUrl = `${baseUrl}/Procedure?subject=Patient/${patient_resource_id}`;
  
      // Step 1: Fetch all Procedure resources for the patient
      const response = await fetch(proceduresUrl, {
        headers: {
          Authorization: "Basic " + btoa("fhiruser:change-password"),
          "Content-Type": "application/json",
        },
      });
  
      const data = await response.json();
      const procedures = data.entry?.map((e: any) => e.resource) || [];
  
      if (procedures.length === 0) {
        setSnackbar({
          open: true,
          message: "No procedures found for this patient.",
          severity: "error",
        });
        // alert("No procedures found for this patient.");
        setLoadingPDF(false);
        return;
      }
  
      const allHistory: any[] = [];
  
      // Step 2: Loop through each Procedure and fetch its history
      for (const proc of procedures) {
        const historyUrl = `${baseUrl}/Procedure/${proc.id}/_history`;
  
        const historyResponse = await fetch(historyUrl, {
          headers: {
            Authorization: "Basic " + btoa("fhiruser:change-password"),
            "Content-Type": "application/json",
          },
        });
  
        const historyData = await historyResponse.json();
  
        const entries = historyData.entry?.map((entry: any) => {
          const resource = entry.resource;
          return {
            procedureId: resource.id || "N/A",
            type: resource.code?.text || "N/A",
            status: resource.status || "N/A",
            performed:
              resource.performedDateTime
                ? new Date(resource.performedDateTime).toLocaleString()
                : "N/A",
            performer: resource.performer?.[0]?.actor?.display || "N/A",
            score: resource.note?.[0]?.text || "N/A",
            details: (resource.extension || [])
              .map((ext: any) => {
                const label = ext.url.split("/").pop();
                const val =
                  ext.valueCodeableConcept?.coding?.[0]?.display ||
                  ext.valueString ||
                  ext.valueInteger ||
                  "N/A";
                return `${label}: ${val}`;
              })
              .join(", "),
            lastUpdated: resource.meta?.lastUpdated
              ? new Date(resource.meta.lastUpdated).toLocaleString()
              : "N/A",
          };
        });
  
        allHistory.push(...entries);
      }
  
      // Step 3: Initialize PDF
      const doc = new jsPDF("p", "pt", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();
  
      // =========================
      // 🏥 Fetch Organization Info + Logo
      // =========================
      let orgName = "Unknown Organization";
      let logoDataUrl: string | null = null;
  
      try {
        const orgUrl = `${import.meta.env.VITE_FHIRAPI_URL}/Organization/${userOrganization}`;
        const res = await fetch(orgUrl, {
          headers: {
            Authorization: "Basic " + btoa("fhiruser:change-password"),
            Accept: "application/fhir+json",
          },
        });
        if (res.ok) {
          const orgData = await res.json();
          orgName = orgData.name || orgName;
  
          const logoExt = orgData.extension?.find(
            (ext: any) =>
              ext.url ===
              "http://example.org/fhir/StructureDefinition/organization-logo"
          );
          const logoRef = logoExt?.valueReference?.reference;
  
          if (logoRef) {
            const binaryId = logoRef.replace("Binary/", "");
            const binaryUrl = `${import.meta.env.VITE_FHIRAPI_URL}/Binary/${binaryId}`;
            const binaryRes = await fetch(binaryUrl, {
              headers: {
                Authorization: "Basic " + btoa("fhiruser:change-password"),
                Accept: "application/fhir+json",
              },
            });
  
            if (binaryRes.ok) {
              const binaryData = await binaryRes.json();
              if (binaryData.data && binaryData.contentType) {
                logoDataUrl = `data:${binaryData.contentType};base64,${binaryData.data}`;
              }
            }
          }
        }
      } catch (err) {
        console.warn("Organization/logo fetch failed", err);
      }
  
      // =========================
      // 🧾 Header Section
      // =========================
      const logoBoxSize = 50;
      const logoX = 40;
      const logoY = 20;
      try {

        if (logoDataUrl) {
  
          const img = new Image();
  
          img.src = logoDataUrl;
  
          await new Promise<void>((resolve, reject) => {
  
            img.onload = () => resolve();
  
            img.onerror = (e) => reject(e);
  
          });
  
          const aspectRatio = img.width / img.height;
  
          let drawWidth = logoBoxSize;
  
          let drawHeight = logoBoxSize;
  
          if (aspectRatio > 1) drawHeight = logoBoxSize / aspectRatio;
  
          else drawWidth = logoBoxSize * aspectRatio;
  
          const offsetX = logoX + (logoBoxSize - drawWidth) / 2;
  
          const offsetY = logoY + (logoBoxSize - drawHeight) / 2 - 10;
  
          doc.addImage(img, "PNG", offsetX, offsetY, drawWidth, drawHeight);
  
        } else {
  
          doc.setFillColor(200, 220, 255);
  
          doc.rect(logoX, logoY, logoBoxSize, logoBoxSize, "F");
  
          doc.setFontSize(8);
  
          doc.text("No Logo", logoX + 5, logoY + 30);
  
        }
  
      } catch {
  
        doc.setFillColor(200, 220, 255);
  
        doc.rect(logoX, logoY, logoBoxSize, logoBoxSize, "F");
  
      }
  
      // Hospital name and title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text(orgName, logoX + 60, logoY + 15);
  
      doc.setFontSize(11);
      doc.text("Assessment History Report", logoX + 60, logoY + 35);
  
      // Line separator
      doc.setDrawColor(180);
      doc.line(logoX, logoY + 45, pageWidth - logoX, logoY + 45);
  
      // =========================
      // 👶 Patient Info Section
      // =========================
      const patientY = 85;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Name: ${patient_name}`, 40, patientY);
      doc.text(`UHID: ${patient_id}`, 40,  patientY+20);
      doc.text(`DOB:  ${birth_date}`, 250, patientY);
      doc.text(`G.A  : ${gestational_age}`, 420, patientY);
      doc.text(`DOA: ____________________`, 250, patientY+22);
      // doc.text(`Patient Name: ${patient_name}`, margin, infoY);
      // doc.text(`Patient ID: ${patient_id}`, pageWidth / 2, infoY);
  
      doc.text(`Report Date: ${new Date().toLocaleString()}`, 420, patientY+22);
       doc.line(logoX, patientY + 35, pageWidth - logoX, patientY + 35);
  
      // =========================
      // 📊 Table Section
      // =========================
      autoTable(doc, {
        startY: patientY + 40,
        head: [
          [
            
            "Type",
        "Performed Date",
            "Performer",
            "Score",
            "Details",
           
          ],
        ],
        body: allHistory.map((p) => [
       
          p.type,
     p.performed,
          p.performer,
          p.score,
          p.details,
         
        ]),
        theme: "grid",
        headStyles: {
          fillColor: [18, 77, 129],
          textColor: 255,
          fontStyle: "bold",
        },
        styles: {
          fontSize: 8,
          cellPadding: 4,
          lineWidth: 0.1,
          valign: "middle",
        },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { left: logoX, right: logoX },
      });
  
      // =========================
      // 💾 Save File
      // =========================
      doc.save(`Assessment_Report(${patient_id}).pdf`);
      setSnackbar({
        open: true,
        message: "Download complete!",
        severity: "success",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      setSnackbar({
        open: true,
        message: "Error generating PDF.",
        severity: "error",
      });
    } finally {
      setLoadingPDF(false);
    }
  };

  
  return (
    <Box sx={{ width: '100%', borderRadius: '20px' }}>
      <Box sx={{ borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            color: '#228BE6',
            borderBottom: '1px solid #DBE2F2',
            '& .MuiTabs-indicator': { backgroundColor: '#124D81' },
            '& .MuiTab-root': {
              color: '#757575',
              '&.Mui-selected': {
                color: '#228BE6',
                fontWeight: 'bold',
              },
            },
          }}
        >
          <Tab label="APGAR Score" />
          <Tab label="Ballard Score" />
          <Tab label="Downe Score" />
        </Tabs>
        <Button
  onClick={() => setConfirmDialog(true)}
  sx={{ backgroundColor: "#228BE61A", color: "#228BE6" }}
>
  {loadingPDF ? <CircularProgress size={20} /> : <DownloadIcon />}
</Button>
        {/* <Button
          variant="contained"
          onClick={handleDownloadAllProcedures}
          disabled={loadingPDF}
          sx={{
            backgroundColor: '#228BE6',
            color: '#fff',
            textTransform: 'none',
            borderRadius: '8px',
            marginRight: '10px',
            '&:hover': { backgroundColor: '#0D3252' },
          }}
        >
          {loadingPDF ? 'Generating...' : 'Download All Procedures'}
        </Button> */}
      </Box>

      <Box sx={{ mt: 2 }}>
        {activeTab === 0 && (
          <ApgarScreen
            patient_name={patient_name}
            patient_id={patient_id}
            patient_resource_id={patient_resource_id}
            UserRole={UserRole}
          />
        )}
        {activeTab === 1 && (
          <BallardScore
            patient_name={patient_name}
            patient_id={patient_id}
            patient_resource_id={patient_resource_id}
            UserRole={UserRole}
          />
        )}
        {activeTab === 2 && (
          <DowneScore
            patient_name={patient_name}
            patient_id={patient_id}
            patient_resource_id={patient_resource_id}
            UserRole={UserRole}
          />
        )}
      </Box>
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
  <DialogTitle>Download PDF?</DialogTitle>
  <DialogContent>
    Do you want to download the Assessment Report?
  </DialogContent>

  <DialogActions>
    <Button onClick={() => setConfirmDialog(false)}>Cancel</Button>
    <Button
      onClick={() => {
        setConfirmDialog(false);
        handleDownloadAllProcedures();
      }}
      variant="contained"
    >
      Yes, Download
    </Button>
  </DialogActions>
</Dialog>
<Snackbar
  open={snackbar.open}
  autoHideDuration={3000}
  onClose={() => setSnackbar({ ...snackbar, open: false })}
>
  <Alert severity={snackbar.severity as any} variant="filled">
    {snackbar.message}
  </Alert>
</Snackbar>

    </Box>
    
  );
};
