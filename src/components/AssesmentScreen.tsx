import { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
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
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [activeTab, setActiveTab] = useState(0);
  const [loadingPDF, setLoadingPDF] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [hasProcedures, setHasProcedures] = useState<boolean>(true);

  useEffect(() => {
    const checkProcedures = async () => {
      try {
        const url = `${import.meta.env.VITE_FHIRAPI_URL}/Procedure?subject=Patient/${patient_resource_id}&_count=1`;
        const res = await fetch(url, {
          headers: { Authorization: "Basic " + btoa("fhiruser:change-password") }
        });
        const data = await res.json();
        setHasProcedures(!!data.entry && data.entry.length > 0);
      } catch (err) {
        console.error(err);
      }
    };
    if (patient_resource_id) checkProcedures();
  }, [patient_resource_id]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleDownloadAllProcedures = async () => {
    setLoadingPDF(true);

    try {
        const baseUrl = import.meta.env.VITE_FHIRAPI_URL;

        // =========================
        // 1️⃣ FETCH ORGANIZATION + LOGO + FOOTER DATA
        // =========================
        let orgName    = "Unknown Organization";
        let logoDataUrl: string | null = null;

        let footerAddress  = "";
        let footerPhones: string[] = [];
        let footerEmail    = "";
        let footerWebsite  = "";

        try {
            const orgUrl = `${baseUrl}/Organization/${userOrganization}`;
            const res = await fetch(orgUrl, {
                headers: {
                    Authorization: "Basic " + btoa("fhiruser:change-password"),
                    Accept: "application/fhir+json",
                },
            });

            if (res.ok) {
                const orgData = await res.json();
                orgName = orgData.name || orgName;

                // ── Logo ──────────────────────────────────────────────
                const logoExt = (orgData.extension || []).find(
                    (ext: any) => ext.url === "http://example.org/fhir/StructureDefinition/organization-logo"
                );
                const logoRef = logoExt?.valueReference?.reference;
                if (logoRef) {
                    const binaryId  = logoRef.replace("Binary/", "");
                    const binaryRes = await fetch(`${baseUrl}/Binary/${binaryId}`, {
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

                // ── Address ───────────────────────────────────────────
                const addr = orgData.address?.[0];
                if (addr) {
                    footerAddress = [
                        addr.line?.join(", "),
                        addr.city,
                        addr.state,
                        addr.postalCode,
                        addr.country,
                    ].filter(Boolean).join(", ");
                }

                // ── Telecom ───────────────────────────────────────────
                (orgData.telecom || []).forEach((t: any) => {
                    if (t.system === "phone") footerPhones.push(t.value);
                    if (t.system === "email") footerEmail   = t.value;
                    if (t.system === "url")   footerWebsite = t.value;
                });
            }
        } catch (err) {
            console.warn("Organization/logo fetch failed", err);
        }

        // =========================
        // 2️⃣ FETCH PROCEDURES
        // =========================
        const proceduresUrl = `${baseUrl}/Procedure?subject=Patient/${patient_resource_id}`;
        const response = await fetch(proceduresUrl, {
            headers: {
                Authorization: "Basic " + btoa("fhiruser:change-password"),
                "Content-Type": "application/json",
            },
        });

        const data       = await response.json();
        const procedures = data.entry?.map((e: any) => e.resource) || [];

        if (procedures.length === 0) {
            setSnackbar({ open: true, message: "No procedures found for this patient.", severity: "error" });
            setLoadingPDF(false);
            return;
        }

        const allHistory: any[] = [];

        for (const proc of procedures) {
            const historyRes  = await fetch(`${baseUrl}/Procedure/${proc.id}/_history`, {
                headers: {
                    Authorization: "Basic " + btoa("fhiruser:change-password"),
                    "Content-Type": "application/json",
                },
            });
            const historyData = await historyRes.json();

            const entries = historyData.entry?.map((entry: any) => {
                const resource = entry.resource;
                return {
                    procedureId: resource.id || "N/A",
                    type:        resource.code?.text || "N/A",
                    status:      resource.status || "N/A",
                    performed:   resource.performedDateTime
                        ? new Date(resource.performedDateTime).toLocaleString()
                        : "N/A",
                    performer: resource.performer?.[0]?.actor?.display || "N/A",
                    score:     resource.note?.[0]?.text || "N/A",
                    details:   (resource.extension || [])
                        .map((ext: any) => {
                            const label = ext.url.split("/").pop();
                            const val   =
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

        // =========================
        // 3️⃣ INITIALIZE PDF
        // =========================
        const doc       = new jsPDF("p", "pt", "a4");
        const pageWidth = doc.internal.pageSize.getWidth();

        // =========================
        // 🧾 HEADER
        // =========================
        const logoBoxSize = 80;
        const logoX = 30;
        const logoY = 20;

        try {
            if (logoDataUrl) {
                const img = new Image();
                img.src = logoDataUrl;
                await new Promise<void>((resolve, reject) => {
                    img.onload  = () => resolve();
                    img.onerror = (e) => reject(e);
                });
                const aspectRatio = img.width / img.height;
                let drawWidth  = logoBoxSize;
                let drawHeight = logoBoxSize;
                if (aspectRatio > 1) drawHeight = logoBoxSize / aspectRatio;
                else drawWidth = logoBoxSize * aspectRatio;
                const offsetX = logoX + (logoBoxSize - drawWidth)  / 2;
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

        // Right side Info Box
        const rightX = pageWidth - 40 - 250;
        const boxY   = logoY + 10;

        // Grey Tab
        doc.setFillColor(224, 228, 231);
        doc.rect(rightX + 50, boxY - 14, 160, 14, "F");
        doc.setFontSize(9);
        doc.setTextColor(51, 51, 51);
        doc.setFont("helvetica", "bold");
        doc.text("ASSESSMENT HISTORY", rightX + 55, boxY - 4);

        // Bordered Box
        doc.setDrawColor(209, 217, 224);
        doc.setLineWidth(1);
        doc.roundedRect(rightX, boxY, 250, 40, 4, 4, "S");

        const row1Y = boxY + 15;
        const row2Y = boxY + 30;
        doc.setFontSize(9);

        doc.setTextColor(144, 164, 174); doc.setFont("helvetica", "normal");
        doc.text("B/O:", rightX + 10, row1Y);
        doc.setTextColor(0, 0, 0); doc.setFont("helvetica", "bold");
        doc.text(patient_name || "N/A", rightX + 35, row1Y);

        doc.setTextColor(144, 164, 174); doc.setFont("helvetica", "normal");
        doc.text("UHID:", rightX + 130, row1Y);
        doc.setTextColor(0, 0, 0); doc.setFont("helvetica", "bold");
        doc.text(patient_id || "N/A", rightX + 165, row1Y);

        doc.setTextColor(144, 164, 174); doc.setFont("helvetica", "normal");
        doc.text("GA:", rightX + 10, row2Y);
        doc.setTextColor(0, 0, 0); doc.setFont("helvetica", "bold");
        doc.text(gestational_age || "N/A", rightX + 35, row2Y);

        doc.setTextColor(144, 164, 174); doc.setFont("helvetica", "normal");
        doc.text("DOB:", rightX + 130, row2Y);
        doc.setTextColor(0, 0, 0); doc.setFont("helvetica", "bold");
        doc.text(birth_date || "N/A", rightX + 165, row2Y);

        doc.setDrawColor(238, 238, 238);
        doc.line(logoX, boxY + 55, pageWidth - logoX, boxY + 55);

        // =========================
        // 📊 TABLE
        // =========================
        autoTable(doc, {
            startY: boxY + 65,
            head: [["Type", "Performed Date", "Performer", "Score", "Details"]],
            body: allHistory.map((p) => [p.type, p.performed, p.performer, p.score, p.details]),
            theme: "grid",
            headStyles: { fillColor: [18, 77, 129], textColor: 255, fontStyle: "bold" },
            styles:     { fontSize: 8, cellPadding: 4, lineWidth: 0.1, valign: "middle" },
            alternateRowStyles: { fillColor: [245, 245, 245] },
            margin: { left: logoX, right: logoX, bottom: 60 },
        });

        // =========================
        // 4️⃣ FOOTER — built from org resource
        // =========================
        const totalPages = (doc as any).internal.getNumberOfPages();

        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            const pageHeight = doc.internal.pageSize.getHeight();

            // Divider line
            doc.setDrawColor(238, 238, 238);
            doc.setLineWidth(1);
            doc.line(logoX, pageHeight - 50, pageWidth - logoX, pageHeight - 50);

            doc.setFontSize(7);
            doc.setTextColor(100, 100, 100);
            doc.setFont("helvetica", "normal");

            // Row 1 — Address
            doc.text(footerAddress || "Address not available", logoX, pageHeight - 35);

            // Row 2 — Phones | Email | Website + page number
            const contactParts: string[] = [];
            if (footerPhones.length > 0) contactParts.push(footerPhones.join(", "));
            if (footerEmail)             contactParts.push(footerEmail);
            if (footerWebsite)           contactParts.push(footerWebsite);

            doc.text(contactParts.join("  |  "), logoX, pageHeight - 21);
            doc.text(`Page ${i}/${totalPages}`, pageWidth - logoX - 30, pageHeight - 21);
        }

        // =========================
        // 💾 SAVE
        // =========================
        doc.save(`Assessment_Report(${patient_id}).pdf`);
        setSnackbar({ open: true, message: "Download complete!", severity: "success" });

    } catch (error) {
        console.error("Error generating PDF:", error);
        setSnackbar({ open: true, message: "Error generating PDF.", severity: "error" });
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
            borderBottom: `1px solid ${isDarkMode ? theme.palette.divider : '#DBE2F2'}`,
            '& .MuiTabs-indicator': { backgroundColor: '#124D81' },
            '& .MuiTab-root': {
              color: isDarkMode ? theme.palette.text.secondary : '#757575',
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
          disabled={!hasProcedures || loadingPDF}
          sx={{ 
            backgroundColor: isDarkMode ? 'rgba(34,139,230,0.15)' : "#228BE61A", 
            color: "#228BE6",
            '&:disabled': { backgroundColor: isDarkMode ? theme.palette.action.disabledBackground : "#e0e0e0", color: isDarkMode ? theme.palette.text.disabled : "#a0a0a0" }
          }}
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
