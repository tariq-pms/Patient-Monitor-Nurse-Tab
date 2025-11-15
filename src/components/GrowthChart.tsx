import { useState, useEffect, FC,  useMemo, useRef } from 'react';
import Box from '@mui/material/Box';
import {Alert, Dialog,DialogActions,DialogContent,DialogTitle,Snackbar,Stack,TextField,Typography, Button, CircularProgress} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import annotationPlugin from "chartjs-plugin-annotation";
import { ChartOptions, LegendItem, Plugin,Chart, CategoryScale } from 'chart.js';


import DownloadIcon from '@mui/icons-material/Download';
import { Line } from 'react-chartjs-2';
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
Chart.register(annotationPlugin);
Chart.register(CategoryScale);
export interface PatientDetails {
  userOrganization: string;
  patient_resource_id: string;
  patient_name: string;
  patient_id: string;
  gestational_age: string;
  birth_date:string;
          }

export const GrowthChart: FC<PatientDetails> = (props): JSX.Element => {

    const [addnewbutton, setaddnewbutton] = useState(false);
    const [snackSucc, setSnackSucc] = useState(false);
    const [snack, setSnack] = useState(false);
    const [date, setDate] = useState<Date | null>(null);
    const [previousWeight, setPreviousWeight] = useState("");
    const [currentWeight, setCurrentWeight] = useState("");
    const [gainLoss, setGainLoss] = useState("N/A");
    const [totalIntake, setTotalIntake] = useState("");
    const [totalOutput, setTotalOutput] = useState("");
    const chartRef1 = useRef<any | null>(null);
    const [loading, setLoading] = useState(false);
    const [selectedLegends, setSelectedLegends] = useState<any>([])
   
    const getOrCreateLegendList = (_chart: any, id: string) => {
      const legendContainer = document.getElementById(id);
      let listContainer = legendContainer!.querySelector('div');
      if (!listContainer) {
        listContainer = document.createElement('div');
        listContainer.style.display = 'flex';
        listContainer.style.flexDirection = 'row';
        listContainer.style.flexWrap = 'wrap'
    
        listContainer.className = 'listContainer';
        legendContainer!.appendChild(listContainer);
      }
    
      return listContainer;
    };  
    const downloadTrendsPDF = async () => {
      const doc = new jsPDF("p", "pt", "a4"); // Portrait A4
      const pageWidth = doc.internal.pageSize.getWidth();
      // const pageHeight = doc.internal.pageSize.getHeight();
      let orgName = "Unknown Organization";
      let logoDataUrl: string | null = null;
    
      try {
        // =========================
        // Fetch Organization
        // =========================
        const orgUrl = `${import.meta.env.VITE_FHIRAPI_URL}/Organization/${props.userOrganization}`;
        console.log("🏥 Fetching Organization from:", orgUrl);
        console.log("selectedlegend", selectedLegends);
    
        const res = await fetch(orgUrl, {
          headers: {
            Authorization: "Basic " + btoa("fhiruser:change-password"),
            Accept: "application/fhir+json",
          },
        });
    
        if (!res.ok) throw new Error(`Organization fetch failed: ${res.status}`);
    
        const orgData = await res.json();
        orgName = orgData.name || orgName;
        console.log("✅ Organization name fetched:", orgName);
    
        // =========================
        // Fetch logo Binary if exists
        // =========================
        const extensions = Array.isArray(orgData.extension) ? orgData.extension : [];
        const logoExt = extensions.find(
          (ext: any) =>
            ext.url === "http://example.org/fhir/StructureDefinition/organization-logo"
        );
        const logoRef = logoExt?.valueReference?.reference;
        console.log("🔗 Logo Reference (fixed):", logoRef);
    
        if (logoRef) {
          const binaryId = logoRef.replace("Binary/", "");
          const binaryUrl = `${import.meta.env.VITE_FHIRAPI_URL}/Binary/${binaryId}`;
          console.log("🖼️ Fetching Binary from:", binaryUrl);
    
          const binaryRes = await fetch(binaryUrl, {
            headers: {
              Authorization: "Basic " + btoa("fhiruser:change-password"),
              Accept: "application/fhir+json",
            },
          });
    
          if (!binaryRes.ok) throw new Error(`Binary fetch failed: ${binaryRes.status}`);
    
          const binaryData = await binaryRes.json();
          console.log("📦 Binary fetched:", binaryData);
    
          if (binaryData.data && binaryData.contentType) {
            logoDataUrl = `data:${binaryData.contentType};base64,${binaryData.data}`;
            console.log("✅ Logo Data URL ready (first 50 chars):", logoDataUrl.slice(0, 50) + "...");
          } else {
            console.warn("⚠️ Binary missing data/contentType");
          }
        } else {
          console.warn("⚠️ No logo extension found in Organization");
        }
      } catch (err) {
        console.error("❌ Error fetching organization/logo:", err);
      }
    
      // =========================
      // Draw Logo
      // =========================
      const logoBoxSize = 60;
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
          console.log("🖼️ Logo image loaded");
    
          const aspectRatio = img.width / img.height;
          let drawWidth = logoBoxSize;
          let drawHeight = logoBoxSize;
    
          if (aspectRatio > 1) drawHeight = logoBoxSize / aspectRatio;
          else drawWidth = logoBoxSize * aspectRatio;
    
          const offsetX = logoX + (logoBoxSize - drawWidth) / 2;
          const offsetY = logoY + (logoBoxSize - drawHeight) / 2- 10;
    
          doc.addImage(img, "PNG", offsetX, offsetY, drawWidth, drawHeight);
          console.log("✅ Logo added to PDF");
        } else {
          console.warn("⚠️ No logo, drawing fallback rectangle");
          doc.setFillColor(200, 220, 255);
          doc.rect(logoX, logoY, logoBoxSize, logoBoxSize, "F");
          doc.setFontSize(8);
          doc.text("No Logo", logoX + 5, logoY + 30);
        }
      } catch (err) {
        console.error("❌ Failed to add logo:", err);
        doc.setFillColor(200, 220, 255);
        doc.rect(logoX, logoY, logoBoxSize, logoBoxSize, "F");
      }
    

// =========================
// 🏥 Hospital Name
// =========================
doc.setFont("helvetica", "bold");
doc.setFontSize(14);
doc.text(orgName, logoX + logoBoxSize + 10, logoY + 15);

doc.setFontSize(11);
doc.text("Growth Chart Report", logoX + logoBoxSize + 10, logoY + 35);

// =========================
// Line separator
// =========================
doc.setDrawColor(180);
doc.line(10, 70, pageWidth - 10, 70);

    // =========================
    // 👶 PATIENT INFO
    // =========================
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
  
    const patientY = 85;
    doc.text(`Name: ${props.patient_name}`, 40, patientY);
    doc.text(`UHID: ${props.patient_id}`, 40,  patientY+20);
    doc.text(`DOB:  ${props.birth_date}`, 250, patientY);
    doc.text(`G.A  : ${props.gestational_age}`, 420, patientY);
    doc.text(`DOA: ____________________`, 250, patientY+22);
    doc.setDrawColor(180);
    doc.line(10, 120, pageWidth - 10, 120);
  
      // =========================
      //  SECTION
      // =========================
      const chartIds = [{ id: "temperatureGraph"}];
    
      const chartHeight = 280; // 🔥 Increased chart height
      const chartWidth = pageWidth - 60; // almost full width
      let startY = patientY + 60;
    
      for (const chart of chartIds) {
        const element = document.getElementById(chart.id);
        if (!element) continue;
    
        // Title above chart
        // doc.setFont("helvetica", "bold");
        // doc.setFontSize(12);
        // doc.text(chart.title, 270, startY);
    
        // Capture chart
        const canvas = await html2canvas(element, {
          scale: 2,
          backgroundColor: "#fff",
        });
        const imgData = canvas.toDataURL("image/png");
    
        // Maintain aspect ratio
        const aspectRatio = canvas.width / canvas.height;
        const targetWidth = chartWidth;
        const targetHeight = Math.min(chartHeight, targetWidth / aspectRatio);
    
        // Add chart image
        doc.addImage(imgData, "PNG", 40, startY + 10, targetWidth, targetHeight);
    
        startY += targetHeight + 60; // extra gap between charts
      }
    
      // =========================
      // 💾 SAVE PDF
      // =========================
      doc.save(`GrowthChart_Report(${props.patient_id}).pdf`);
      // doc.save("GrowthChart_Report.pdf");
    };
  
    const temperatureLegendPlugin: Plugin = {
  
      id: 'htmlLegend',
      afterUpdate(chart, _args, options) {
          const ul = getOrCreateLegendList(chart, options.containerID);
        // Remove old legend items
        while (ul.firstChild) {
          ul.firstChild.remove();
        }
        ul.style.margin = '0px';
        ul.style.padding = '0px';
        ul.style.lineHeight = '300%';
        ul.style.gap='5%';
        // Reuse the built-in legendItems generator
       
    
        
        const items: LegendItem[] = chart.options?.plugins?.legend?.labels?.generateLabels?.(chart) || [];
    
    items.forEach((item) => {
    if (item.text !== '') {
              const li = document.createElement('div');
              li.style.alignItems = 'left';
              li.style.cursor = 'pointer';
              li.style.display = 'flex';
              li.style.flexDirection = 'row';
              // li.style.flexWrap = 'wrap'
              li.style.padding = '0px';
              li.style.margin = '0px';
              // li.style.backgroundColor= 'red';
        
              li.onclick = () => {
      
                const type = (chart.config as any)?.type;
               
                if (type === 'pie' || type === 'doughnut') {
                  // Pie and doughnut charts only have a single dataset and visibility is per item
                  if (item.index !== undefined) {
                      chart.toggleDataVisibility(item.index);
                    }
                } else {
                  if (item.datasetIndex !== undefined) {
                    chart.setDatasetVisibility(item.datasetIndex, !chart.isDatasetVisible(item.datasetIndex));
                    chart.isDatasetVisible(item.datasetIndex)
                      ? setSelectedLegends((prev: any) => [...prev, item.text])
                      : setSelectedLegends((current: any[]) => current.filter((lol) => lol !== item.text));
                  }
                }
                chart.update();
              };
        
              // Color box
              const boxSpan = document.createElement('span');
              boxSpan.style.background = item.hidden ? 'transparent' : (typeof item.fillStyle === 'string' ? item.fillStyle : 'transparent');
              // boxSpan.style.borderColor = item.strokeStyle;
              boxSpan.style.border = `2px solid ${item.strokeStyle}`;
              boxSpan.style.display = 'inline-block';
              boxSpan.style.flexShrink = '0px';
              boxSpan.style.height = '20px'; // Added height
              boxSpan.style.marginRight = '5px';
              boxSpan.style.width = '20px';
              boxSpan.style.borderRadius = '8px'
    
        
              // Text
              const textContainer = document.createElement('p');
              textContainer.style.fontSize = '12px'
              textContainer.style.color ='black';
              textContainer.style.marginTop = '-12px';
              textContainer.style.padding = '0px';
              // textContainer.style.textDecoration = item.hidden ? 'line-through' : '';
        
              const text = document.createTextNode("- "+item.text);
              textContainer.appendChild(text);
        
              li.appendChild(boxSpan);
              li.appendChild(textContainer);
              ul.appendChild(li);
          }
    
        });
      }
    };
    const temperatureOption = {
      animation: false,
      
      responsive: true,
      interaction: {
        mode: "index",
        intersect: false,
      },
      stacked: false,
      plugins: {
        decimation: {
          enabled: true,
          algorithm: "min-max",
        },
        colors: {
          forceOverride: true,
        },
        legend: {
          display: false,
        },
        htmlLegend: {
          containerID: "legend-container",
        },
        zoom: {
          zoom: {
            pinch: { enabled: true },
            wheel: { enabled: true, modifierKey: "ctrl" },
            mode: "x",
          },
        },
   
      
      },
      scales: {
            
        x: {
          ticks: {
            color: "black",
            autoSkip: true,
            maxTicksLimit: 10,
          },
          border: {
            display: true,
          },
        },
          y: {
            type: 'linear' as const,
            display: true,
            position: 'left' as const,
            min: 0,           // ✅ Start scale at 0
            max:4000,         // ✅ End scale at 100
            title: {
              color: 'black',
              display: true,
              text: "gram (g)"
            },
            ticks: {
              color: 'black',
              stepSize: 500,    // ✅ Increment by 10
            },
            grid: {
              color: 'grey',
              drawOnChartArea: true,
            },
          },
          y1: {
            type: 'linear' as const,
            display: true,
            position: 'right' as const,
            min: 0,           // ✅ Start scale at 0
            max:240,         // ✅ End scale at 100
            title: {
              color: 'black',
              display: true,
              text: "Milli liter (ml)"
            },
            ticks: {
              color: 'black',
              stepSize: 30,    // ✅ Increment by 10
            },
            grid: {
              color: 'grey',
              drawOnChartArea: true,
            },
          },
       
        
      },
    };
    
    const handleAddEntry = async () => {
      if (!currentWeight) {
        setSnackSucc(false);        
        setSnack(true);   
        setLoading(true)          
        return;
      }
    
      const components = [];
    
      if (previousWeight)
        components.push({
          code: { text: "Previous Weight" },
          valueQuantity: {
            value: parseFloat(previousWeight),
            unit: "g",
            system: "http://unitsofmeasure.org",
            code: "g",
          },
        });
    
      if (currentWeight)
        components.push({
          code: { text: "Current Weight" },
          valueQuantity: {
            value: parseFloat(currentWeight),
            unit: "g",
            system: "http://unitsofmeasure.org",
            code: "g",
          },
        });
    
      if (gainLoss)
        components.push({
          code: { text: "Gain/Loss in 24 hrs" },
          valueString: gainLoss,
        });
    
      if (totalIntake)
        components.push({
          code: { text: "Total Intake" },
          valueQuantity: {
            value: parseFloat(totalIntake),
            unit: "mL",
            system: "http://unitsofmeasure.org",
            code: "mL",
          },
        });
    
      if (totalOutput)
        components.push({
          code: { text: "Total Output" },
          valueQuantity: {
            value: parseFloat(totalOutput),
            unit: "mL",
            system: "http://unitsofmeasure.org",
            code: "mL",
          },
        });
    
      const observation = {
        resourceType: "Observation",
        status: "final",
        category: [
          {
            coding: [
              {
                system: "http://terminology.hl7.org/CodeSystem/observation-category",
                code: "growth-chart",
                display: "Growth Chart",
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              system: "http://loinc.org",
              code: "8331-1",
              display: "Daily Neonatal Measurement Summary",
            },
          ],
          text: "Daily Neonatal Entry",
        },
        subject: {
          reference: `Patient/${props.patient_resource_id}`,
        },
        effectiveDateTime: new Date().toISOString(),
        component: components,
      };
    
      const baseUrl = import.meta.env.VITE_FHIRAPI_URL as string;
      const authHeader = "Basic " + btoa("fhiruser:change-password");
    
      try {
        const searchResponse = await fetch(
          `${baseUrl}/Observation?subject=Patient/${props.patient_resource_id}&code=8331-1`,
          {
            headers: {
              Authorization: authHeader,
              Accept: "application/fhir+json",
            },
          }
        );
    
        const searchResult = await searchResponse.json();
    
        if (searchResponse.ok && searchResult.entry?.length > 0) {
          // Updating existing Observation
          const existingObservation = searchResult.entry[0].resource;
          const observationId = existingObservation.id;
    
          const putResponse = await fetch(`${baseUrl}/Observation/${observationId}`, {
            method: "PUT",
            headers: {
              Authorization: authHeader,
              "Content-Type": "application/fhir+json",
              Accept: "application/fhir+json",
            },
            body: JSON.stringify({
              ...existingObservation,
              ...observation,
            }),
          });
    
          if (putResponse.ok) {
            setSnackSucc(true);  
            setSnack(true);      
          } else {
            setSnackSucc(false); 
            setSnack(true);      
          }
        } else {
          // Creating new Observation
          const postResponse = await fetch(`${baseUrl}/Observation`, {
            method: "POST",
            headers: {
              Authorization: authHeader,
              "Content-Type": "application/fhir+json",
              Accept: "application/fhir+json",
            },
            body: JSON.stringify(observation),
          });
    
          if (postResponse.ok) {
            setSnackSucc(true);  
            setSnack(true);     
          } else {
            setSnackSucc(false); 
            setSnack(true);    
          }
        }
    
        // Reset fields
        setaddnewbutton(false);
        setPreviousWeight("");
        setCurrentWeight("");
        setTotalIntake("");
        setTotalOutput("");
      } catch (error) {
        console.error("Network error:", error);
        setSnackSucc(false);    
        setSnack(true);         
      }
    };
      
    async function fetchManualTrends(patientId: string) {
      console.log("📥 Fetching manual Observation history for patient:", patientId);
    
      const baseUrl = import.meta.env.VITE_FHIRAPI_URL as string;
      const authHeader = "Basic " + btoa("fhiruser:change-password");
    
      try {
        // 1️⃣ Find the Observation for this patient (Daily Neonatal Entry)
        const searchUrl = `${baseUrl}/Observation?subject=Patient/${patientId}&code=8331-1&_sort=-date`;
        console.log("🔍 Searching for Observation:", searchUrl);
    
        const searchResponse = await fetch(searchUrl, {
          headers: {
            Authorization: authHeader,
            Accept: "application/fhir+json",
          },
        });
    
        if (!searchResponse.ok) {
          throw new Error("Failed to search for Observations");
        }
    
        const searchBundle = await searchResponse.json();
        if (!searchBundle.entry || searchBundle.entry.length === 0) {
          console.warn("⚠️ No Observation found for patient:", patientId);
          return [];
        }
    
        // 2️⃣ Use the most recent Observation’s ID (or whichever you want)
        const observationId = searchBundle.entry[0].resource.id;
        console.log("🧩 Found Observation ID:", observationId);
    
        // 3️⃣ Fetch full history of that Observation
        const historyUrl = `${baseUrl}/Observation/${observationId}/_history`;
        console.log("📜 Fetching full Observation history:", historyUrl);
    
        const historyResponse = await fetch(historyUrl, {
          headers: {
            Authorization: authHeader,
            Accept: "application/fhir+json",
          },
        });
    
        if (!historyResponse.ok) {
          throw new Error(`Failed to fetch Observation history for ID: ${observationId}`);
        }
    
        const historyBundle = await historyResponse.json();
    
        // 4️⃣ Parse each historical version
        const parsed =
          historyBundle.entry?.map((entry: any) => {
            const obs = entry.resource;
            const time = obs.effectiveDateTime ?? obs.meta?.lastUpdated;
            const values: Record<string, any> = {};
    
            obs.component?.forEach((c: any) => {
              const label = c.code?.text;
              const value = c.valueQuantity?.value ?? c.valueString ?? null;
              if (label) values[label] = value;
            });
    
            return { time, ...values };
          }) || [];
    
        console.log("✅ Parsed Observation history data:", parsed);
        return parsed.reverse(); // oldest first
      } catch (error) {
        console.error("❌ Error fetching manual trends:", error);
        setSnackSucc(false)
        return [];
      }
    }

    const fetchPreviousWeight = async () => {
      const baseUrl = import.meta.env.VITE_FHIRAPI_URL as string;
      const authHeader = "Basic " + btoa("fhiruser:change-password");
    
      try {
        // 🟡 Fetch the most recent Observation for the patient
        const response = await fetch(
          `${baseUrl}/Observation?subject=Patient/${props.patient_resource_id}&code=8331-1&_sort=-date&_count=1`,
          {
            headers: {
              Authorization: authHeader,
              Accept: "application/fhir+json",
            },
          }
        );
    
        if (!response.ok) {
          console.error("❌ Failed to fetch previous weight:", response.statusText);
          return;
        }
    
        const result = await response.json();
    
        if (result.entry && result.entry.length > 0) {
          const observation = result.entry[0].resource;
          const currentWeightComponent = observation.component?.find(
            (comp: any) => comp.code?.text === "Current Weight"
          );
    
          if (currentWeightComponent?.valueQuantity?.value) {
            const previous = currentWeightComponent.valueQuantity.value;
            console.log("📦 Auto-fetched Previous Weight:", previous);
            setPreviousWeight(previous.toString());
          }
        } else {
          console.log("ℹ️ No previous Observation found for this patient.");
        }
      } catch (error) {
        console.error("❌ Error fetching previous weight:", error);
      }
    };

    useEffect(() => {
      if (addnewbutton) {
        fetchPreviousWeight();
      }
    }, [addnewbutton]);
    
      useEffect(() => {
    if ( props.patient_resource_id) {
      fetchManualTrends(props.patient_resource_id)
        .then((data) => setManualData(data))
        .catch((err) => console.error(err));
    }
      }, [props.patient_resource_id]);
  
  useEffect(() => {
    if (!previousWeight || !currentWeight) {
      setGainLoss("N/A");
      return;
    }
  
    const prev = parseFloat(previousWeight);
    const curr = parseFloat(currentWeight);
  
    const absoluteGain = (curr - prev) * 1; // in grams
    const percentGain = ((curr - prev) / prev) * 100;
  
    const display =
      absoluteGain >= 0
        ? `+${absoluteGain.toFixed(1)} g (+${percentGain.toFixed(2)}%)`
        : `${absoluteGain.toFixed(1)} g (${percentGain.toFixed(2)}%)`;
  
    setGainLoss(display);
  }, [previousWeight, currentWeight]);

  const [manualData, setManualData] = useState<any[]>([]);

  const addValues = () => {
    return (
      <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog
       open={addnewbutton}
       onClose={() => setaddnewbutton(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            borderRadius: 3,
            backgroundColor: "#FFFFFF",
            color: "#000000",
            boxShadow: "0px 4px 20px rgba(0,0,0,0.1)",
          },
        }}
      >
        {/* Title */}
        <DialogTitle
          sx={{
            textAlign: "center",
            fontWeight: 600,
            fontSize: "1.1rem",
            color: "#000000",
            borderBottom: "1px solid #E0E0E0",
          }}
        >
          Daily Entry
        </DialogTitle>

        {/* Content */}
        <DialogContent sx={{ pt: 2 }}>
          {/* Header Info */}
          {/* <Stack spacing={0.5} alignItems="center">
            <Typography
              sx={{ color: "#1E88E5", fontWeight: 600, cursor: "pointer" }}
            >
              B/O Sreelakshmi
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ID: 6352489 | NICU 1 - 01
            </Typography>
          </Stack> */}

          {/* Date and Time Pickers */}
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            justifyContent="center"
            mt={2}
            sx={{backgroundColor:'#F5F5F5'}}
          >
             <DateTimePicker
  label="Date & Time"
  value={date}
  onChange={(newValue) => setDate(newValue)}
  format="dd/MM/yyyy hh:mm a"
  minDateTime={new Date()}
  slotProps={{
    textField: {
      variant: "outlined",
      fullWidth: true,
      size: "medium",
    },
    openPickerIcon: {
      sx: { color: '#9BA1AE' }, // 👈 Grey color for the calendar icon
    },
  }}
  sx={{
    marginBottom: 2,
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: '#DBE2F2', // Border color when not focused
      },
      '&:hover fieldset': {
        borderColor: '#124D81', // Border color on hover
      },
      '&.Mui-focused fieldset': {
        borderColor: '#124D81', // Border color when focused
      },
    },
    '& .MuiInputBase-root': {
      color: '#0F3B61', // Text color
    },
    '& .MuiInputLabel-root': {
      color: '#9BA1AE', // Label color
    },
  }}
/>

          </Stack>

          {/* Divider */}
    

          {/* Weight Section */}
          <Stack direction="row" spacing={2} mt={2}>
          <TextField
  label="Previous Weight"
  value={previousWeight}
  
  onChange={(e) => setPreviousWeight(e.target.value)}
  type="number"
  InputProps={{
    endAdornment: (
      <Typography sx={{ color: "#9BA1AE" }}>g</Typography>
    ),
    sx: {
      backgroundColor: "#F5F5F5",
      borderRadius: 1,
      color: "#000",
    },
  }}
  InputLabelProps={{ sx: { color: "#000" } }}
  fullWidth
  variant="outlined"
/>
            <TextField
              label="Current Weight"
              required
              type="number"
              value={currentWeight}
              onChange={(e) => setCurrentWeight(e.target.value)}
              InputProps={{
                endAdornment: (
                  <Typography sx={{ color: "#9BA1AE" }}>g</Typography>
                ),
                sx: {
                  backgroundColor: "#F5F5F5",
                  borderRadius: 1,
                  color: "#000",
                },
              }}
              InputLabelProps={{ sx: { color: "#000" } }}
              fullWidth
              variant="outlined"
            />
          </Stack>

          {/* Intake / Output */}
          <Stack direction="row" spacing={2} mt={2}>
            <TextField
              label="Total Intake"
              value={totalIntake}
              onChange={(e) => setTotalIntake(e.target.value)}
              InputProps={{
                endAdornment: (
                  <Typography sx={{ color: "#9BA1AE" }}>ml</Typography>
                ),
                sx: {
                  backgroundColor: "#F5F5F5",
                  borderRadius: 1,
                  color: "#000",
                },
              }}
              InputLabelProps={{ sx: { color: "#000" } }}
              fullWidth
              variant="outlined"
            />
            <TextField
              label="Total Output"
              value={totalOutput}
              onChange={(e) => setTotalOutput(e.target.value)}
              InputProps={{
                endAdornment: (
                  <Typography sx={{ color: "#9BA1AE" }}>ml</Typography>
                ),
                sx: {
                  backgroundColor: "#F5F5F5",
                  borderRadius: 1,
                  color: "#000",
                },
              }}
              InputLabelProps={{ sx: { color: "#000" } }}
              fullWidth
              variant="outlined"
            />
          </Stack>

          {/* Gain / Loss */}
          <Stack mt={2}>
            <TextField
              label="Gain / Loss in 24 hrs"
              value={gainLoss}
              InputProps={{
                readOnly: true,
                sx: {
                  backgroundColor: "#F5F5F5",
                  borderRadius: 1,
                  color:
                    gainLoss === "N/A"
                      ? "#9BA1AE"
                      : gainLoss.includes("-")
                      ? "#D32F2F"
                      : "#2E7D32",
                  fontWeight: 600,
                },
              }}
              InputLabelProps={{ sx: { color: "#000" } }}
              fullWidth
              variant="outlined"
            />
          </Stack>
          {/* Gain / Loss */}
         
        </DialogContent>

        {/* Footer Buttons */}
        <DialogActions
          sx={{
            justifyContent: "space-between",
            px: 3,
            pb: 2,
          }}
        >
          <Button
            variant="outlined"
            sx={{
              textTransform: "none",
              color: "#344054",
              borderColor: "#D0D5DD",
              "&:hover": { backgroundColor: "#F9FAFB" },
            }}
          >
            Scan & Upload
          </Button>
          <Button
  variant="contained"
  onClick={handleAddEntry}
  sx={{
    textTransform: "none",
    backgroundColor: "#228BE6",
    "&:hover": { backgroundColor: "#1C7ED6" },
  }}
>
  + Add Entry
</Button>


        </DialogActions>
      </Dialog>
    </LocalizationProvider>
      
    );
};

function prepareManualTemperatureData(manualData: any[]) {
  const sortedData = [...manualData].sort(
    (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
  );

  return {
    labels: sortedData.map((d) =>
      new Date(d.time).toLocaleDateString()
    ),
    datasets: [
      // {
      //   label: "Previous Weight (g)",
      //   data: sortedData.map((d) =>
      //     d["Previous Weight"] ? Number(d["Previous Weight"]) : null
      //   ),
      //   borderColor: "orange",
      //   backgroundColor: "orange",
      //   borderWidth: 2,
       
      //   fill: true,
      //   yAxisID: "y", // ✅ left axis
      // },
      {
        label: "Current Weight (g)",
        data: sortedData.map((d) =>
          d["Current Weight"] ? Number(d["Current Weight"]) : null
        ),
        borderColor: "red",
        backgroundColor: "red",
        borderWidth: 2,
        
        fill: false,
        yAxisID: "y", // ✅ left axis
      },
      {
        label: "Total Intake (mL)",
        data: sortedData.map((d) =>
          d["Total Intake"] ? Number(d["Total Intake"]) : null
        ),
        borderColor: "green",
        backgroundColor: "green",
        borderWidth: 2,
     
        fill: false,
        yAxisID: "y1", // ✅ right axis
      },
      {
        label: "Total Output (mL)",
        data: sortedData.map((d) =>
          d["Total Output"] ? Number(d["Total Output"]) : null
        ),
        borderColor: "blue",
        backgroundColor: "blue",
        borderWidth: 2,
      
        fill: false,
        yAxisID: "y1", // ✅ right axis
      },
    ],
  };
}

const temperatureData1 = prepareManualTemperatureData(manualData);

const manualGraph = useMemo(() => {
  return (
  <Stack
  height="100%"
  width="100%"
 
  sx={{
    backgroundColor: 'transparent',
    alignItems: 'center', // ✅ centers all charts horizontally
    justifyContent: 'center',
  }}
p={0}
  mt={2}
>
 
  <Stack
    width="95%"
    p={3}
    spacing={1}
    sx={{
      backgroundColor: '#FFFFFF',
      borderRadius: 2,
      boxShadow: '0px 2px 6px rgba(0,0,0,0.1)',
    }}
  > 
  
  {/* <Stack direction="row" alignItems="center" spacing={1}>
    <ChildCareIcon sx={{ color: '#124D81', fontSize: 28 }} />
    <Typography
      variant="h6"
      align="left"
      sx={{ fontWeight: 600, color: '#333' }}
    >
      Growth Chart 
    </Typography></Stack> */}
    <div id="temperatureGraph">
    <Line
      ref={chartRef1}
      options={temperatureOption as ChartOptions<'line'>}
      data={temperatureData1}
      height="100%"
      plugins={[temperatureLegendPlugin]}
    />
    <div  id="legend-container"></div></div>
  </Stack>
 
 

</Stack>
   
);


},[manualData])

   return (
  <Box>
    {/* Header Section */}
    <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mt:0,mb: 0, backgroundColor: ""}}
      >
          <Typography variant="h6" sx={{ color: "#0F3B61" }} >
      Growth Chart
    </Typography>
  <Stack  direction="row" spacing={3}>

  <Button
  onClick={downloadTrendsPDF}
  sx={{ backgroundColor: "#228BE61A", color: "#228BE6" }}
>
  <DownloadIcon />
</Button>
            <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setaddnewbutton(true)}
            sx={{ backgroundColor: "#228BE61A", color: "#228BE6" }}
          >
             Daily Entry
          </Button>
  </Stack>
 
      </Stack>
    
<Box>  {loading ? (
        <Stack alignItems="center" justifyContent="center" height="300px">
          <CircularProgress />
        </Stack>
      ) : (
         manualGraph
      )}                                    </Box>
    {/* Tabs Section */}
   

    {/* Snackbar Feedback */}
    <Snackbar
      open={snack}
      autoHideDuration={5000}
     
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
    >
      <Alert
        
        variant="filled"
        severity={snackSucc ? "success" : "error"}
      >
        {snackSucc
          ? "Operation Completed Successfully"
          : "Operation Failed"}
      </Alert>
    </Snackbar>
    {addValues()}
  
  </Box>
);

};