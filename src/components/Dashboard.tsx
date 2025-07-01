import {
  Box, Typography, Button, TableRow, Table, TableBody,
  TableCell, TableHead, IconButton, CircularProgress,
  Chip, TableContainer, Snackbar, Alert
} from "@mui/material";
import { PhotoCamera, UploadFile } from "@mui/icons-material";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import Webcam from "react-webcam";
import { useEffect, useRef, useState } from "react";

interface DashboardProps {
  patient: string;
  patient_name: string;
  patient_id: string;
  patient_resource_id: string;
  UserRole: string;
  onClose: () => void;
}

interface LabReport {
  test: string | undefined;
  testName?: string;
  result?: string;
  unit?: string;
  referenceRange?: string;
  status?: string;
  date?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  patient_name, 
  patient_resource_id,
  onClose 
}) => {
  const [showScanner, setShowScanner] = useState(false);
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<{table: LabReport[], metadata: any} | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedReports, setSavedReports] = useState<any[]>([]);
const [isLoadingReports, setIsLoadingReports] = useState(false);

  const captureAndProcess = async () => {
    if (!webcamRef.current) return;
  
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      alert("Failed to capture image. Please try again.");
      return;
    }
  
    setCapturedImage(imageSrc);
    setIsProcessing(true);
  
    try {
      const response = await processImage(imageSrc);
      console.log('Processing Response:', response);
  
      if (response.error) throw new Error(response.error);
  
      setExtractedData(response);
    } catch (error: any) {
      console.error('Processing Error:', error);
      setError(`Error processing image: ${error.message}`);
    } finally {
      setIsProcessing(false);
      setShowScanner(false);
    }
  };

  const processImage = async (imageData: string) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      const response = await fetch('https://pmsserver.local:5001/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Processing failed');
      }

      return await response.json();
    } catch (err) {
      console.error('Processing error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    fetch('https://pmsserver.local:5001/api/upload', {
      method: 'POST',
      body: formData
    })
      .then(async (response) => {
        const data = await response.json();
        console.log("📦 Server response from upload:", data);
        if (!response.ok || data.error) throw new Error(data.error || 'Upload failed');
        setExtractedData(data);
      })
      .catch((err) => {
        console.error('Upload error:', err);
        setError(err.message);
      })
      .finally(() => setIsProcessing(false));
  };

  // const saveAsFHIRDiagnosticReport = async () => {
  //   if (!extractedData || !patient_resource_id) return;
    
  //   setIsSaving(true);
  //   setError(null);

  //   try {
  //     // Convert the extracted data to FHIR DiagnosticReport format
  //     const diagnosticReport = {
  //       resourceType: "DiagnosticReport",
  //       status: "final",
  //       code: {
  //         coding: [{
  //           system: "http://loinc.org",
  //           code: "11502-2",
  //           display: "Laboratory report"
  //         }]
  //       },
  //       subject: {
  //         reference: `Patient/${patient_resource_id}`
  //       },
  //       effectiveDateTime: new Date().toISOString(),
  //       issued: new Date().toISOString(),
  //       result: extractedData.table.map((test, index) => ({
  //         reference: `Observation/${index}-${Date.now()}`,
  //         display: `${test.testName}: ${test.result}`
  //       })),
  //       contained: extractedData.table.map((test, index) => ({
  //         resourceType: "Observation",
  //         id: `${index}-${Date.now()}`,
  //         status: "final",
  //         code: {
  //           text: test.testName || "Unknown test"
  //         },
  //         valueQuantity: {
  //           value: parseFloat(test.result || "0"),
  //           unit: test.units,
  //           system: "http://unitsofmeasure.org",
  //           code: test.units
  //         },
  //         referenceRange: test.referenceRange ? [{
  //           text: test.referenceRange
  //         }] : undefined,
  //         interpretation: test.status ? [{
  //           coding: [{
  //             system: "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation",
  //             code: test.status === "Normal" ? "N" : "A",
  //             display: test.status
  //           }]
  //         }] : undefined
  //       }))
  //     };

  //     // Save to your FHIR server
  //     const response = await fetch(`${import.meta.env.VITE_FHIRAPI_URL}/DiagnosticReport`, {
  //       method: 'POST',
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: "Basic " + btoa("fhiruser:change-password"),
  //       },
  //       body: JSON.stringify(diagnosticReport)
  //     });

  //     if (!response.ok) {
  //       const errorData = await response.json();
  //       throw new Error(errorData.error || 'Failed to save report');
  //     }

  //     setSaveSuccess(true);
  //   } catch (err) {
  //     console.error('Error saving report:', err);
  //     setError(err instanceof Error ? err.message : 'Failed to save report');
  //   } finally {
  //     setIsSaving(false);
  //   }
  // };
  const saveAsFHIRDiagnosticReport = async () => {
    if (!extractedData || !patient_resource_id) {
      setError('Missing required data to save report');
      return;
    }
  
    setIsSaving(true);
    setError(null);
  
    try {
      // Convert to simplified FHIR DiagnosticReport format without Observations
      const diagnosticReport = {
        resourceType: "DiagnosticReport",
        status: "final",
        code: {
          coding: [{
            system: "http://loinc.org",
            code: "11502-2",
            display: "Laboratory report"
          }]
        },
        subject: {
          reference: `Patient/${patient_resource_id}`
        },
        effectiveDateTime: new Date().toISOString(),
        issued: new Date().toISOString(),
        conclusion: extractedData.table.map(test =>
          `${test.testName || test.test}: ${test.result} ${test.unit || ''}` +
          (test.referenceRange ? ` (Ref: ${test.referenceRange})` : '') +
          (test.status ? ` [${test.status}]` : '')
        ).join('\n')
      };
  
      console.log('Sending FHIR payload:', diagnosticReport);
  
      const response = await fetch(`${import.meta.env.VITE_FHIRAPI_URL}/DiagnosticReport`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + btoa("fhiruser:change-password"),
        },
        body: JSON.stringify(diagnosticReport)
      });
  
      if (!response.ok) {
        let errorMessage = `Server responded with status ${response.status}`;
        try {
          const text = await response.text();
          if (text) {
            const errorData = JSON.parse(text);
            errorMessage = errorData?.issue?.[0]?.details?.text ||
                           errorData?.error || errorMessage;
          }
        } catch (parseError) {
          console.warn('Failed to parse error response:', parseError);
        }
        throw new Error(errorMessage);
      }
  
      // ✅ Safely handle empty response body
      const responseText = await response.text();
      const result = responseText ? JSON.parse(responseText) : {};
      console.log('Successfully saved report:', result);
      setSaveSuccess(true);
      fetchPatientReports();
    } catch (err) {
      console.error('Detailed error:', err);
      setError(`Error saving report: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsSaving(false);
    }
  };
  const fetchPatientReports = async () => {
    setIsLoadingReports(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_FHIRAPI_URL}/DiagnosticReport?subject=Patient/${patient_resource_id}`,
        {
          headers: {
            Authorization: "Basic " + btoa("fhiruser:change-password"),
          },
        }
      );
  
      if (!response.ok) {
        throw new Error(`Failed to fetch reports: ${response.status}`);
      }
  
      const data = await response.json();
      setSavedReports(data.entry || []);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError(`Error loading reports: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoadingReports(false);
    }
  };
  const parseConclusionToTable = (conclusion: string) => {
    const lines = conclusion.split('\n');
    return lines.map(line => {
      // Extract components from each line
      const testMatch = line.match(/^(.+?):/);
      const resultMatch = line.match(/:\s*(.+?)\s*(\(|\[|$)/);
      const refMatch = line.match(/\(Ref:\s*(.+?)\)/);
      const statusMatch = line.match(/\[(.+?)\]$/);
  
      return {
        test: testMatch ? testMatch[1].trim() : 'Unknown',
        result: resultMatch ? resultMatch[1].trim() : '',
        referenceRange: refMatch ? refMatch[1].trim() : undefined,
        status: statusMatch ? statusMatch[1].trim() : undefined,
      };
    });
  };

  useEffect(() => {
    fetchPatientReports();
  }, [patient_resource_id]); // Re-fetch when patient changes
  
  const ReportViewer = ({ report }: { report: any }) => {
    const tests = parseConclusionToTable(report.resource.conclusion);
  
    return (
      <Box sx={{ mt: 3, mb: 4 ,p:2,backgroundColor:'#FFFFFF',borderRadius:'20px'}}>
        <Typography variant="subtitle1" gutterBottom>
          Report from {new Date(report.resource.effectiveDateTime).toLocaleString()}
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{backgroundColor:'grey'}}>
                <TableCell>Test</TableCell>
                <TableCell >Result</TableCell>
                <TableCell >Reference Range</TableCell>
                <TableCell >Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tests.map((test, index) => (
                <TableRow key={index}>
                  <TableCell sx={{color:'black'}}>{test.test}</TableCell>
                  <TableCell sx={{color:'black'}}>{test.result}</TableCell>
                  <TableCell sx={{color:'black'}}>{test.referenceRange || 'N/A'}</TableCell>
                  <TableCell sx={{color:'black'}}>
                    <Chip
                      label={test.status || 'Unknown'}
                      color={test.status === 'Normal' ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };
  return (
    <Box sx={{ flexGrow: 1, padding: 2,  justifyContent: 'center' }}>
      <Box sx={{ width: '100%'}}>
        <Typography 
          variant="h5" 
          sx={{
            fontWeight: 'bold', 
            mb: 2, 
            color: '#124D81',
            display: 'flex', 
            alignItems: 'center', 
            gap: 1
          }}
        >
          <IconButton 
            onClick={onClose} 
            size="small" 
            sx={{
              color: '#124D81', 
              '&:hover': { backgroundColor: 'rgba(18, 77, 129, 0.1)' }
            }}
          >
            <ArrowBackIosNewIcon />
          </IconButton>
          B/O {patient_name}
        </Typography>
        
        <Box mb={3} sx={{ backgroundColor: 'white', borderRadius: '20px' }}>
          <Box sx={{ p: 3 }}>
            {!showScanner && !extractedData && (
              <Box textAlign="center" py={4}>
                <Typography variant="h6" gutterBottom>
                  No Reports Available
                </Typography>
                <Typography color="textSecondary">
                  Upload or scan a lab report to get started
                </Typography>

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
                  <Button 
                    sx={{color:'white',backgroundColor:'#228BE6'}} 
                    variant="contained" 
                    startIcon={<PhotoCamera />}
                    onClick={() => setShowScanner(true)}
                  >
                    Scan Sheet
                  </Button>

                  <Button
                    variant="outlined"
                    startIcon={<UploadFile />}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Upload File
                  </Button>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*,.pdf,.jpg"
                    style={{ display: 'none' }}
                  />
                </Box>
              </Box>
            )}

            {showScanner && (
              <Box>
                <Typography variant="h6" gutterBottom textAlign="center">
                  Scan Lab Report
                </Typography>

                <Box sx={{
                  width: '100%',
                  height: '70vh',
                  maxHeight: '800px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '8px',
                  boxShadow: 3,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  overflow: 'hidden',
                  mb: 2
                }}>
                  {capturedImage ? (
                    <img
                      src={capturedImage}
                      alt="Captured"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain'
                      }}
                    />
                  ) : (
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      videoConstraints={{ facingMode: 'environment' }}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  )}
                </Box>

                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
                  {!capturedImage && (
                    <Button
                      variant="contained"
                      onClick={captureAndProcess} 
                      disabled={isProcessing}
                    >
                      Capture
                    </Button>
                  )}
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setShowScanner(false);
                      setCapturedImage(null);
                    }}
                    disabled={isProcessing}
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
            )}

            {extractedData && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">Lab Report Results</Typography>
                </Box>

                <TableContainer>
                  <Table>
                    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableRow>
                        <TableCell sx={{color:'black'}}>Test Name</TableCell>
                        <TableCell sx={{color:'black'}}>Result</TableCell>
                        <TableCell sx={{color:'black'}}>Unit</TableCell>
                        <TableCell sx={{color:'black'}}>Reference Range</TableCell>
                        <TableCell sx={{color:'black'}}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {extractedData.table.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell sx={{color:'black'}}>{row.testName || row.test || 'N/A'}</TableCell>
                          <TableCell sx={{color:'black'}}>{row.result || 'N/A'}</TableCell>
                          <TableCell sx={{color:'black'}}>{row.unit || 'N/A'}</TableCell>
                          <TableCell sx={{color:'black'}}>{row.referenceRange || 'N/A'}</TableCell>
                          <TableCell sx={{color:'black'}}>
                            <Chip
                              label={row.status || 'Unknown'}
                              color={row.status === 'Normal' ? 'success' : 'error'}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between'}}>
                  <Box>
                    <Button variant="outlined" onClick={() => setExtractedData(null)}>
                      Back
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button 
                      sx={{color:'white',backgroundColor:'#228BE6'}} 
                      variant="contained"
                      onClick={saveAsFHIRDiagnosticReport}
                      disabled={isSaving}
                    >
                      {isSaving ? <CircularProgress size={24} color="inherit" /> : 'Save'}
                    </Button>
                    <Button 
                      variant="outlined"
                      onClick={() => setShowScanner(true)}
                    >
                      Scan Again
                    </Button>
                  </Box>
                </Box>
              </Box>
            )}

            {isProcessing && (
              <Box
                sx={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(0,0,0,0.5)'
                }}
              >
                <Box textAlign="center" p={4} bgcolor="white" borderRadius={2}>
                  <CircularProgress size={60} />
                  <Typography variant="h6" sx={{ mt: 2 }}>
                    Processing Report...
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
{/* Saved Reports Section */}
<Box sx={{ mt: 4,  borderRadius: '20px', p: 3 }}>
  <Typography variant="h6" gutterBottom>
    Saved Reports
  </Typography>

  {isLoadingReports ? (
    <Box display="flex" justifyContent="center" py={4}>
      <CircularProgress />
    </Box>
  ) : savedReports.length === 0 ? (
    <Typography variant="body1" color="Black" textAlign="center" py={2}>
      No saved reports found
    </Typography>
  ) : (
    savedReports.map((report, index) => (
      <ReportViewer key={report.resource.id || index} report={report} />
    ))
  )}
</Box>
      <Snackbar
        open={saveSuccess}
        autoHideDuration={6000}
        onClose={() => setSaveSuccess(false)}
      >
        <Alert onClose={() => setSaveSuccess(false)} severity="success" sx={{ width: '100%' }}>
          Report saved successfully!
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};