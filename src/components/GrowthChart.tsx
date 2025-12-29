import { useState, useEffect, FC,  useMemo, useRef } from 'react';
import Box from '@mui/material/Box';
import {Alert, Dialog,DialogActions,DialogContent,DialogTitle,Snackbar,Stack,TextField,Typography, Button, CircularProgress, TableHead, Table, TableCell, TableRow, TableBody} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import annotationPlugin from "chartjs-plugin-annotation";
import { ChartOptions, LegendItem, Plugin,Chart, CategoryScale } from 'chart.js';
import fentonChart from '../assets/fenton_chart_boy.png';
import fentonChart1 from '../assets/fenton_chart_girl.png';

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
  gender:string
          }
        
export const GrowthChart: FC<PatientDetails> = (props): JSX.Element => {

    const [addnewbutton, setaddnewbutton] = useState(false);
    const [addnewbutton1, setaddnewbutton1] = useState(false);
    const [snackSucc, setSnackSucc] = useState(false);
    const [snack, setSnack] = useState(false);
    const [date, setDate] = useState<Date | null>(null);
    const [previousWeight, setPreviousWeight] = useState("");
    const [currentWeight, setCurrentWeight] = useState("");
    const [gainLoss, setGainLoss] = useState("N/A");
    const [totalIntake, setTotalIntake] = useState("");
    const [totalOutput, setTotalOutput] = useState("");
  

    // const [gainLoss, setGainLoss] = useState("N/A");
    const [length, setLength] = useState("");
    // const [weeks, setWeeks] = useState("");
    // const [days, setDays] = useState("");
    const [pmaWeeksState, setPmaWeeksState] = useState("");
    const [pmaDaysState, setPmaDaysState] = useState("");
    

    const [headC, setHeadC] = useState("");
    const [fentonEntries, setFentonEntries] = useState<any[]>([]);
    const [manualEntries, setManualEntries] = useState([]);


    // const [manualData, setManualData] = useState<any[]>([]);
    // const [entries, setEntries] = useState<any[]>([]);
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
        console.log("🏥 Fetching gender from growth chart:", props.gender);

       
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
          `${baseUrl}/Observation?subject=Patient/${props.patient_resource_id}&category=growth-chart&_sort=-date`,
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
            await fetchManualTrends(props.patient_resource_id); // 🔥 refresh chart
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
            await fetchManualTrends(props.patient_resource_id); 
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
        // 🔄 After save, refresh manual trend data instantly



      } catch (error) {
        console.error("Network error:", error);
        setSnackSucc(false);    
        setSnack(true);         
      }
    };

    // const handleAddEntry1 = async () => {
    //   if (!currentWeight || !weeks || !days) {
    //     setSnackSucc(false);
    //     setSnack(true);
    //     return;
    //   }
    
    //   const pmaDecimal = parseFloat((Number(weeks) + Number(days) / 7).toFixed(2));
    
    //   const components: any[] = [];
    
    //   if (currentWeight)
    //     components.push({
    //       code: { text: "Weight" },
    //       valueQuantity: {
    //         value: parseFloat(currentWeight),
    //         unit: "g",
    //         system: "http://unitsofmeasure.org",
    //         code: "g",
    //       },
    //     });
    
    //   if (length)
    //     components.push({
    //       code: { text: "Length" },
    //       valueQuantity: {
    //         value: parseFloat(length),
    //         unit: "cm",
    //         system: "http://unitsofmeasure.org",
    //         code: "cm",
    //       },
    //     });
    
    //   if (headC)
    //     components.push({
    //       code: { text: "Head Circumference" },
    //       valueQuantity: {
    //         value: parseFloat(headC),
    //         unit: "cm",
    //         system: "http://unitsofmeasure.org",
    //         code: "cm",
    //       },
    //     });
    
    //   // PMA
    //   components.push({
    //     code: { text: "Post-menstrual Age (PMA)" },
    //     valueQuantity: {
    //       value: pmaDecimal,
    //       unit: "weeks",
    //       system: "http://unitsofmeasure.org",
    //       code: "wk",
    //     },
    //   });
    
    //   const observation = {
    //     resourceType: "Observation",
    //     status: "final",
    //     category: [
    //       {
    //         coding: [
    //           {
    //             system: "http://terminology.hl7.org/CodeSystem/observation-category",
    //             code: "fenton-chart",
    //             display: "Fenton Chart",
    //           },
    //         ],
    //       },
    //     ],
    //     code: {
    //       coding: [
    //         {
    //           system: "http://loinc.org",
    //           code: "8331-1",
    //           display: "Weekly Fenton Chart Measurement",
    //         },
    //       ],
    //       text: "Fenton Chart Entry",
    //     },
    //     subject: {
    //       reference: `Patient/${props.patient_resource_id}`,
    //     },
    //     effectiveDateTime: new Date().toISOString(),
    //     component: components,
    //   };
    
    //   const baseUrl = import.meta.env.VITE_FHIRAPI_URL;
    //   const authHeader = "Basic " + btoa("fhiruser:change-password");
    
    //   try {
    //     // 🔍 1. Search if a Fenton observation already exists
    //     const searchResponse = await fetch(
    //       `${baseUrl}/Observation?subject=Patient/${props.patient_resource_id}&category=fenton-chart`,
    //       {
    //         headers: {
    //           Authorization: authHeader,
    //           Accept: "application/fhir+json",
    //         },
    //       }
    //     );
    
    //     const searchResult = await searchResponse.json();
    
    //     if (searchResponse.ok && searchResult.entry?.length > 0) {
    //       // 🔁 UPDATE (PUT)
    //       const existingObservation = searchResult.entry[0].resource;
    //       const obsId = existingObservation.id;
    
    //       const putResponse = await fetch(`${baseUrl}/Observation/${obsId}`, {
    //         method: "PUT",
    //         headers: {
    //           Authorization: authHeader,
    //           "Content-Type": "application/fhir+json",
    //           Accept: "application/fhir+json",
    //         },
    //         body: JSON.stringify({
    //           ...existingObservation,
    //           ...observation,
    //           id: obsId, // keep same ID
    //         }),
    //       });
    
    //       if (putResponse.ok) {
    //         setSnackSucc(true);
    //         setSnack(true);
    //       } else {
    //         setSnackSucc(false);
    //         setSnack(true);
    //       }
    
    //     } else {
    //       // 🆕 CREATE (POST)
    //       const postResponse = await fetch(`${baseUrl}/Observation`, {
    //         method: "POST",
    //         headers: {
    //           Authorization: authHeader,
    //           "Content-Type": "application/fhir+json",
    //           Accept: "application/fhir+json",
    //         },
    //         body: JSON.stringify(observation),
    //       });
    
    //       if (postResponse.ok) {
    //         setSnackSucc(true);
    //         setSnack(true);
    //       } else {
    //         setSnackSucc(false);
    //         setSnack(true);
    //       }
    //     }
    
    //     // Reset
    //     setaddnewbutton1(false);
    //     setCurrentWeight("");
    //     setLength("");
    //     setHeadC("");
    
    //   } catch (error) {
    //     console.error("Network error:", error);
    //     setSnackSucc(false);
    //     setSnack(true);
    //   }
    // };
    
    const handleAddEntry1 = async () => {
      if (!currentWeight) {
        setSnackSucc(false);
        setSnack(true);
        return;
      }
    
      // --- Compute PMA from GA + DOB ---
     
    
     
    
      const pmaDecimal = parseFloat(
        (Number(pmaWeeksState) + Number(pmaDaysState) / 7).toFixed(2)
      );
      
    
      // --- Build FHIR Components ---
      const components: any[] = [];
    
      if (currentWeight)
        components.push({
          code: { text: "Weight" },
          valueQuantity: {
            value: parseFloat(currentWeight),
            unit: "g",
            system: "http://unitsofmeasure.org",
            code: "g",
          },
        });
    
      if (length)
        components.push({
          code: { text: "Length" },
          valueQuantity: {
            value: parseFloat(length),
            unit: "cm",
            system: "http://unitsofmeasure.org",
            code: "cm",
          },
        });
    
      if (headC)
        components.push({
          code: { text: "Head Circumference" },
          valueQuantity: {
            value: parseFloat(headC),
            unit: "cm",
            system: "http://unitsofmeasure.org",
            code: "cm",
          },
        });
    
      // PMA
      components.push({
        code: { text: "Post-menstrual Age (PMA)" },
        valueQuantity: {
          value: pmaDecimal,
          unit: "weeks",
          system: "http://unitsofmeasure.org",
          code: "wk",
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
                code: "fenton-chart",
                display: "Fenton Chart",
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              system: "http://loinc.org",
              code: "8331-1",
              display: "Weekly Fenton Chart Measurement",
            },
          ],
          text: "Fenton Chart Entry",
        },
        subject: {
          reference: `Patient/${props.patient_resource_id}`,
        },
        effectiveDateTime: new Date().toISOString(),
        component: components,
      };
    
      const baseUrl = import.meta.env.VITE_FHIRAPI_URL;
      const authHeader = "Basic " + btoa("fhiruser:change-password");
    
      try {
        // 🔍 1. CHECK IF FENTON OBS ALREADY EXISTS
        const searchResponse = await fetch(
          `${baseUrl}/Observation?subject=Patient/${props.patient_resource_id}&category=fenton-chart`,
          {
            headers: {
              Authorization: authHeader,
              Accept: "application/fhir+json",
            },
          }
        );
    
        const searchResult = await searchResponse.json();
    
        if (searchResponse.ok && searchResult.entry?.length > 0) {
          // 🔁 UPDATE EXISTING
          const existingObservation = searchResult.entry[0].resource;
          const obsId = existingObservation.id;
    
          const putResponse = await fetch(`${baseUrl}/Observation/${obsId}`, {
            method: "PUT",
            headers: {
              Authorization: authHeader,
              "Content-Type": "application/fhir+json",
              Accept: "application/fhir+json",
            },
            body: JSON.stringify({
              ...existingObservation,
              ...observation,
              id: obsId,
            }),
          });
    
          if (putResponse.ok) {
            await fetchFentonData(props.patient_resource_id);   // 🔥 refresh chart/table instantly
            setSnackSucc(true);
            setSnack(true);
          } else {
            setSnackSucc(false);
            setSnack(true);
          }
         
        } else {
          // 🆕 CREATE NEW
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
            await fetchFentonData(props.patient_resource_id);   // already good
            setSnackSucc(true);
            setSnack(true);
          } else {
            setSnackSucc(false);
            setSnack(true);
          }
        }
    
        // RESET VALUES
        setaddnewbutton1(false);
        setCurrentWeight("");
        setLength("");
        setHeadC("");
        
      } catch (error) {
        console.error("Network error:", error);
        setSnackSucc(false);
        setSnack(true);
      }
    };
    
    
    async function fetchFentonData(patientId: string) {
      console.log("📥 Fetching manual Observation history for patient:", patientId);
    
      const baseUrl = import.meta.env.VITE_FHIRAPI_URL as string;
      const authHeader = "Basic " + btoa("fhiruser:change-password");
    
      try {
        // 1️⃣ Find the Observation for this patient (Daily Neonatal Entry)
        const searchUrl = `${baseUrl}/Observation?subject=Patient/${patientId}&category=fenton-chart&_sort=-date`;

        console.log("🔍 Searching for fenton Observation:", searchUrl);
    
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
        const historyUrl = `${baseUrl}/Observation/${observationId}/_history?_count=40`;

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
        const parsed = historyBundle.entry?.map((entry: any) => {
          const obs = entry.resource;
        
          const dateISO = obs.effectiveDateTime ?? obs.meta?.lastUpdated;
        
          let pmaWeeks = null;
          let weight = null;
          let length = null;
          let headC = null;
        
          obs.component?.forEach((c: any) => {
            const label = c.code?.text;
            const value = c.valueQuantity?.value;
        
            if (label === "Post-menstrual Age (PMA)") pmaWeeks = value;
            if (label === "Weight") weight = value;
            if (label === "Length") length = value;
            if (label === "Head Circumference") headC = value;
          });
        
          return {
            pmaWeeks,
            weight,
            length,
            headC,
            dateISO,
          };
        }) || [];
    
        console.log("✅ Parsed Observation history data:", parsed);
        const parsed1 = parsed.reverse();
        setFentonEntries(parsed1);   // 🔥 Auto-update chart
        return parsed1;
        // return parsed.reverse();
         // oldest first
      } catch (error) {
        console.error("❌ Error fetching manual trends:", error);
        setSnackSucc(false)
        return [];
      }
    }
      
    async function fetchManualTrends(patientId: string) {
      console.log("📥 Fetching manual Observation history for patient:", patientId);
      console.log("📥 Fetching Gender in growth chart:", props.gender);
    
      const baseUrl = import.meta.env.VITE_FHIRAPI_URL as string;
      const authHeader = "Basic " + btoa("fhiruser:change-password");
    
      try {
        // 1️⃣ Find the Observation for this patient (Daily Neonatal Entry)
        const searchUrl = `${baseUrl}/Observation?subject=Patient/${patientId}&category=growth-chart&_sort=-date`;
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
        const historyUrl = `${baseUrl}/Observation/${observationId}/_history?_count=40`;
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
        const parsed2 = parsed.reverse();
        setManualEntries(parsed2);   // 🔥 Auto-update chart
        return parsed2; // oldest first
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

//     // Input format: "22W 3D"
// const parseGA = (ga: string) => {
//   if (!ga) return { weeks: "", days: "" };

//   const match = ga.match(/(\d+)\s*W\s*(\d+)\s*D/i);
//   if (!match) return { weeks: "", days: "" };

//   return {
//     weeks: match[1], // "22"
//     days: match[2],  // "3"
//   };
// };

// useEffect(() => {
//   if (props.gestational_age) {
//     const { weeks, days } = parseGA(props.gestational_age);
//     setWeeks(weeks);
//     setDays(days);
//   }
// }, [props.gestational_age]);


    useEffect(() => {
      if (addnewbutton) {
        fetchPreviousWeight();
      }
    }, [addnewbutton]);
    
      useEffect(() => {
    if ( props.patient_resource_id) {
      fetchManualTrends(props.patient_resource_id)
        .then((data) => setManualEntries(data))
        .catch((err) => console.error(err));
    }
      }, [props.patient_resource_id]);

      useEffect(() => {
        if (props.patient_resource_id) {
          fetchFentonData(props.patient_resource_id).then((data) => {
            setFentonEntries(data);
          });
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

  function parseGA(gaString: string) {
    // Example: "22W 5D"
    const match = gaString.match(/(\d+)\s*W\s*(\d+)\s*D/i);
    if (!match) return { weeks: 0, days: 0 };
    return { weeks: Number(match[1]), days: Number(match[2]) };
  }
  
  function calculatePMA(gaAtBirth: string, birthDate: string) {
    const { weeks, days } = parseGA(gaAtBirth);
    const gaDays = weeks * 7 + days;
  
    const dob = new Date(birthDate);
    const today = new Date();
  
    const diffDays = Math.floor((today.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24));
  
    const totalDays = gaDays + diffDays;
  
    const pmaWeeks = Math.floor(totalDays / 7);
    const pmaDays = totalDays % 7;
  
    return { pmaWeeks, pmaDays };
  }

  useEffect(() => {
    const { pmaWeeks, pmaDays } = calculatePMA(
      props.gestational_age,
      props.birth_date
    );
  
    setPmaWeeksState(pmaWeeks.toString());
    setPmaDaysState(pmaDays.toString());
    
  }, [props.gestational_age, props.birth_date]);
  
// Auto PMA calculation
// const { pmaWeeks, pmaDays } = calculatePMA(
//   props.gestational_age, 
//   props.birth_date
// );


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

const addWeekly = () => {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
    <Dialog
     open={addnewbutton1}
     onClose={() => setaddnewbutton1(false)}
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
       Fenton Chart Entry
      </DialogTitle>

      {/* Content */}
      <DialogContent sx={{ pt: 2 }}>
        {/* Header Info */}
             {/* Date and Time Pickers */}
       

        {/* Divider */}
      
 

        {/* <Stack direction="row" gap={2} mt={2}>

  <TextField
    type="number"
    label="Weeks"
    fullWidth
    required
    value={weeks}
    onChange={(e) => setWeeks(e.target.value)}
    InputProps={{
      sx: {
        backgroundColor: "#F5F5F5",
        borderRadius: 1,
        color: "#000",
      },
    }}
    InputLabelProps={{ sx: { color: "#000" } }}
    variant="outlined"
  />

 
  <TextField
    type="number"
    label="Days"
    placeholder="0–6"
    fullWidth
    value={days}
    onChange={(e) => setDays(e.target.value)}
    InputProps={{
      sx: {
        backgroundColor: "#F5F5F5",
        borderRadius: 1,
        color: "#000",
      },
    }}
    InputLabelProps={{ sx: { color: "#000" } }}
  />
</Stack> */}

<Stack direction="row" gap={2} mt={2}>

  {/* PMA Weeks */}
  <TextField
  label="PMA Weeks"
  value={pmaWeeksState}
  fullWidth
  onChange={(e) => setPmaWeeksState(e.target.value)}
  InputProps={{
    sx: {
      backgroundColor: "#F5F5F5",
      borderRadius: 1,
      color: "#000",
    },
  }}
  InputLabelProps={{ sx: { color: "#000" } }}
/>

  {/* PMA Days */}
  <TextField
  label="PMA Days"
  value={pmaDaysState}
  fullWidth
  onChange={(e) => setPmaDaysState(e.target.value)}
  InputProps={{
    sx: {
      backgroundColor: "#F5F5F5",
      borderRadius: 1,
      color: "#000",
    },
  }}
  InputLabelProps={{ sx: { color: "#000" } }}
/>

</Stack>

       
        <Stack direction="row" spacing={2} mt={2}>
        
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

       
        <Stack direction="row" spacing={2} mt={2}>
          
          <TextField
            label="Length"
             type="number"
            value={length}
            onChange={(e) => setLength(e.target.value)}
            InputProps={{
              endAdornment: (
                <Typography sx={{ color: "#9BA1AE" }}>cm</Typography>
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
        <Stack direction="row" spacing={2} mt={2}>
          
          <TextField
            label="Head C"
            value={headC}
             type="number"
            onChange={(e) => setHeadC(e.target.value)}
            InputProps={{
              endAdornment: (
                <Typography sx={{ color: "#9BA1AE" }}>cm</Typography>
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
onClick={handleAddEntry1}
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

const temperatureData1 = prepareManualTemperatureData(manualEntries);

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
    <div  id="legend-container"></div>
    </div>

  </Stack>
 
 

</Stack>
   
);


},[manualEntries])


// Add these constants for reference line intervals
const PMA_INTERVAL = 2; // weeks
const LEN_INTERVAL = 2; // cm
const HC_INTERVAL = 2; // cm
const WT_INTERVAL = 500; // grams

// Add this function to generate reference lines
const generateReferenceLines = () => {
  const lines = [];
  
  // 1. PMA reference lines (vertical)
  for (let pma = PMA_MIN; pma <= PMA_MAX; pma += PMA_INTERVAL) {
    const x = mapX(pma);
    lines.push(
      <line
        key={`pma-${pma}`}
        x1={x}
        x2={x}
        y1={Y0}
        y2={Y1}
        stroke="#e0e0e0"
        strokeWidth={1}
        strokeDasharray="3,3"
      />
    );
    
    // PMA labels at bottom
    lines.push(
      <text
        key={`pma-label-${pma}`}
        x={x}
        y={Y1 + 15}
        fontSize="10"
        textAnchor="middle"
        fill="#666"
      >
        {pma}
      </text>
    );
  }
  
  // 2. Length reference lines (horizontal)
  for (let len = LEN_MIN; len <= LEN_MAX; len += LEN_INTERVAL) {
    const y = mapY_length(len);
    lines.push(
      <line
        key={`len-${len}`}
        x1={X0}
        x2={X1}
        y1={y}
        y2={y}
        stroke="#87CEFA" // Light blue for length
        strokeWidth={0.5}
        strokeDasharray="2,2"
      />
    );
    
    // Length labels on left
    lines.push(
      <text
        key={`len-label-${len}`}
        x={X0 - 10}
        y={y}
        fontSize="9"
        textAnchor="end"
        fill="#666"
        alignmentBaseline="middle"
      >
        {len}
      </text>
    );
  }
  
  // 3. Head circumference reference lines (horizontal)
  for (let hc = HC_MIN; hc <= HC_MAX; hc += HC_INTERVAL) {
    const y = mapY_head(hc);
    lines.push(
      <line
        key={`hc-${hc}`}
        x1={X0}
        x2={X1}
        y1={y}
        y2={y}
        stroke="#98FB98" // Pale green for head circumference
        strokeWidth={0.5}
        strokeDasharray="2,2"
      />
    );
    
    // HC labels on left
    lines.push(
      <text
        key={`hc-label-${hc}`}
        x={X0 - 10}
        y={y}
        fontSize="9"
        textAnchor="end"
        fill="#666"
        alignmentBaseline="middle"
      >
        {hc}
      </text>
    );
  }
  
  // 4. Weight reference lines (horizontal)
  for (let wt = WT_MIN; wt <= WT_MAX; wt += WT_INTERVAL) {
    const y = mapY_weight(wt);
    lines.push(
      <line
        key={`wt-${wt}`}
        x1={X0}
        x2={X1}
        y1={y}
        y2={y}
        stroke="#FFB6C1" // Light pink for weight
        strokeWidth={0.5}
        strokeDasharray="2,2"
      />
    );
    
    // Weight labels on left (convert to kg for readability)
    lines.push(
      <text
        key={`wt-label-${wt}`}
        x={X0 - 10}
        y={y}
        fontSize="9"
        textAnchor="end"
        fill="#666"
        alignmentBaseline="middle"
      >
        {(wt / 1000).toFixed(1)}
      </text>
    );
  }
  
  return lines;
};

// Also add connecting lines between measurements for the same entry
const generateConnectingLines = (entries: any[]) => {
  return entries.map((e, i) => {
    const x = mapX(e.pmaWeeks);
    const yLen = mapY_length(e.length);
    const yHC = mapY_head(e.headC);
    const yWt = mapY_weight(e.weight);
    
    return (
      <g key={`conn-${i}`}>
        {/* Vertical reference line for this measurement */}
        <line
          x1={x}
          x2={x}
          y1={Math.min(yLen, yHC, yWt) - 20}
          y2={Math.max(yLen, yHC, yWt) + 20}
          stroke="#888"
          strokeWidth={0.5}
          strokeDasharray="5,5"
        />
        
        {/* Labels for each point with values */}
        <g>
          <text
            x={x + 8}
            y={yLen - 8}
            fontSize="10"
            fill="blue"
            fontWeight="bold"
          >
            {e.length}cm
          </text>
          <text
            x={x + 8}
            y={yHC - 8}
            fontSize="10"
            fill="green"
            fontWeight="bold"
          >
            {e.headC}cm
          </text>
          <text
            x={x + 8}
            y={yWt - 8}
            fontSize="10"
            fill="red"
            fontWeight="bold"
          >
            {(e.weight / 1000).toFixed(1)}kg
          </text>
        </g>
      </g>
    );
  });
};
const IMG_W = 2200;
const IMG_H = 1700;

const GRID_LEFT = 230;
const GRID_RIGHT = 1515;
const GRID_TOP = 102;
const GRID_BOTTOM = 1699;

const CHART_WIDTH = 800;
const CHART_HEIGHT = 1100;

// clinical ranges used for each axis
const PMA_MIN = 22;
const PMA_MAX = 50;

// Length (cm)
const LEN_MIN = 31;
const LEN_MAX = 56;

// Head circumference (cm)
const HC_MIN = 22;
const HC_MAX = 42;

// Weight (grams)
const WT_MIN = 300;
const WT_MAX = 6000;

// --------------------- MAPPING FUNCTIONS ---------------------

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
// PMA → X-axis
const containerRef = useRef<HTMLDivElement | null>(null);
// const entries = useMemo(() => SAMPLE_DATA, []);

// scale factors: image space -> canvas space
const scaleX = CHART_WIDTH / IMG_W;
const scaleY = CHART_HEIGHT / IMG_H;

// scaled grid bounds inside our canvas
const X0 = GRID_LEFT * scaleX+22;
const X1 = GRID_RIGHT * scaleX+163;
const Y0 = GRID_TOP * scaleY-15;
const Y1 = GRID_BOTTOM * scaleY-114;


const LEN_BOTTOM_IMG = GRID_TOP + 450;   // ~ 102 + 450 = 552 (image px)
const HC_TOP_IMG = LEN_BOTTOM_IMG ;       // 552
const HC_BOTTOM_IMG = GRID_TOP + 1000;   // ~ 1102 (image px)
const WT_TOP_IMG = HC_BOTTOM_IMG;        // 1102

const LEN_Y_TOP = GRID_TOP * scaleY+25;
const LEN_Y_BOTTOM = LEN_BOTTOM_IMG * scaleY;

const HC_Y_TOP = HC_TOP_IMG * scaleY-120;
const HC_Y_BOTTOM = HC_BOTTOM_IMG * scaleY-265;

const WT_Y_TOP = WT_TOP_IMG * scaleY-350;
const WT_Y_BOTTOM = GRID_BOTTOM * scaleY-145;

// mapping functions (use clinical ranges -> map into scaled pixel boxes)
const mapX = (pma: number) => {
  const frac = (pma - PMA_MIN) / (PMA_MAX - PMA_MIN);
  const x = X0 + frac * (X1 - X0);
  return clamp(Math.round(x), 0, CHART_WIDTH);
};

const mapY_length = (lenCm: number) => {
  const frac = (lenCm - LEN_MIN) / (LEN_MAX - LEN_MIN);
  const y = LEN_Y_BOTTOM - frac * (LEN_Y_BOTTOM - LEN_Y_TOP);
  return Math.round(y);
};


const mapY_head = (hcCm: number) => {
  const frac = (hcCm - HC_MIN) / (HC_MAX - HC_MIN);
  const y = HC_Y_BOTTOM - frac * (HC_Y_BOTTOM - HC_Y_TOP);
  return Math.round(y);
};

const mapY_weight = (wtGrams: number) => {
  const frac = (wtGrams - WT_MIN) / (WT_MAX - WT_MIN);
  const y = WT_Y_BOTTOM - frac * (WT_Y_BOTTOM - WT_Y_TOP);
  return Math.round(y);
};


const handleDownload = async () => {
  if (!containerRef.current) return;

  const doc = new jsPDF("p", "pt", "a4");

  // ✔ Correct A4 size in points
  const PAGE_W = doc.internal.pageSize.getWidth();   // ~595
  const PAGE_H = doc.internal.pageSize.getHeight();  // ~842

  const PADDING = 10;
  const HEADER_H = 80;

  // -----------------------------------------
  // 1️⃣ FETCH ORGANIZATION + LOGO
  // -----------------------------------------
  let orgName = "Unknown Organization";
  let logoDataUrl = null;

  try {
    const orgUrl = `${import.meta.env.VITE_FHIRAPI_URL}/Organization/${props.userOrganization}`;
    const res = await fetch(orgUrl, {
      headers: {
        Authorization: "Basic " + btoa("fhiruser:change-password"),
        Accept: "application/fhir+json",
      },
    });

    if (res.ok) {
      const org = await res.json();
      orgName = org.name || orgName;

      const ext = org.extension || [];
      const logoExt = ext.find((e: { url: string; }) =>
        e.url === "http://example.org/fhir/StructureDefinition/organization-logo"
      );
      const logoRef = logoExt?.valueReference?.reference;

      if (logoRef) {
        const binaryId = logoRef.replace("Binary/", "");
        const binRes = await fetch(
          `${import.meta.env.VITE_FHIRAPI_URL}/Binary/${binaryId}`,
          {
            headers: {
              Authorization: "Basic " + btoa("fhiruser:change-password"),
              Accept: "application/fhir+json",
            },
          }
        );

        if (binRes.ok) {
          const b = await binRes.json();
          if (b.data) logoDataUrl = `data:${b.contentType};base64,${b.data}`;
        }
      }
    }
  } catch (err) {
    console.error("ORG LOGO ERROR:", err);
  }

  // -----------------------------------------
  // 2️⃣ CAPTURE CHART AREA
  // -----------------------------------------
  const canvas = await html2canvas(containerRef.current, {
    scale: 2,
    backgroundColor: "#fff",
    useCORS: true,
  });
  const PNG = canvas.toDataURL("image/png");

  // -----------------------------------------
  // 3️⃣ HEADER
  // -----------------------------------------
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, PAGE_W, HEADER_H + 20, "F");

  // LOGO
  const logoX = PADDING + 10;
  const logoY = PADDING + 10;

  if (logoDataUrl) {
    const img = new Image();
    img.src = logoDataUrl;
    await new Promise(r => (img.onload = r));
    doc.addImage(img, "PNG", logoX, logoY, 120, 35);
  } else {
    doc.setFillColor(200);
    doc.rect(logoX, logoY, 120, 35, "F");
  }

  // -----------------------------------------
  // PATIENT CARD
  // -----------------------------------------
  const cardX = PAGE_W * 0.35;
  const cardY = PADDING;
  const cardW = PAGE_W * 0.62;
  const cardH = 60;

  doc.setFillColor(245, 245, 245);
  doc.roundedRect(cardX, cardY, cardW, cardH, 8, 8, "F");

  doc.setFontSize(10);
  doc.text(`B/O: ${props.patient_name || ""}`, cardX + 10, cardY + 15);
  doc.text(`ID: ${props.patient_id || ""}`, cardX + 150, cardY + 15);
  doc.text(`DOB: ${props.birth_date || ""}`, cardX + 280, cardY + 15);

  doc.text(`G.A: ${props.gestational_age || ""}`, cardX + 10, cardY + 32);
  doc.text(`Printed: ${new Date().toLocaleString()}`, cardX + 150, cardY + 32);

  doc.text(`Gender: ${props.gender || "—"}`, cardX + 10, cardY + 49);

  doc.setDrawColor(180);
  doc.line(20, HEADER_H, PAGE_W - 20, HEADER_H);

  // -----------------------------------------
  // 4️⃣ FIT CHART INTO A4 BELOW HEADER
  // -----------------------------------------

  // Real chart px size from canvas
  const imgW = canvas.width;
  const imgH = canvas.height;

  // Compute aspect-fit dimensions
  const maxW = PAGE_W ;
  const maxH = PAGE_H - HEADER_H ;

  let finalW = maxW;
  let finalH = (imgH / imgW) * finalW;

  if (finalH > maxH) {
    finalH = maxH;
    finalW = (imgW / imgH) * finalH;
  }

  const chartX = (PAGE_W - finalW) / 2;
  const chartY = HEADER_H + 2;

  doc.addImage(PNG, "PNG", chartX, chartY, finalW, finalH);

  // -----------------------------------------
  // 5️⃣ SAVE
  // -----------------------------------------
  doc.save(`FentonChart_${props.patient_id || "patient"}.pdf`);
};
const fentonGraph = useMemo(() => {
  return (
    <Box display="flex"  alignItems="flex-start">
    {/* left: chart area */}
    
    <Box
      ref={containerRef}
      sx={{
        width: CHART_WIDTH,
        height: CHART_HEIGHT,
        position: "relative",
        // border: "1px solid #e6e6e6",
        background: "#fff",
      }}
    >
      {/* background PNG from public folder (place your 2200x1700 PNG there as /fenton_chart.png) */}
      <img
        src={props.gender?.toLowerCase() === "female" ? fentonChart1 : fentonChart}
        alt="Fenton Chart"
        style={{
          width: CHART_WIDTH,
          height: CHART_HEIGHT,
          objectFit: "fill",
          display: "block",
        }}
      />


<svg
width={CHART_WIDTH}
height={CHART_HEIGHT}
style={{ position: "absolute", left: 0, top: 0, pointerEvents: "auto" }}
>
{/* Background reference lines */}
{/* {generateReferenceLines()} */}

{/* Connecting lines for each measurement set */}
{generateConnectingLines(fentonEntries)}

{/* Region labels */}
{/* <g>
  <text
    x={X0 - 40}
    y={(LEN_Y_TOP + LEN_Y_BOTTOM) / 2}
    fontSize="12"
    fill="#0066cc"
    textAnchor="middle"
    transform={`rotate(-90 ${X0 - 40} ${(LEN_Y_TOP + LEN_Y_BOTTOM) / 2})`}
    fontWeight="bold"
  >
    Length (cm)
  </text>
  <text
    x={X0 - 40}
    y={(HC_Y_TOP + HC_Y_BOTTOM) / 2}
    fontSize="12"
    fill="#008800"
    textAnchor="middle"
    transform={`rotate(-90 ${X0 - 40} ${(HC_Y_TOP + HC_Y_BOTTOM) / 2})`}
    fontWeight="bold"
  >
    Head Circ (cm)
  </text>
  <text
    x={X0 - 40}
    y={(WT_Y_TOP + WT_Y_BOTTOM) / 2}
    fontSize="12"
    fill="#cc0000"
    textAnchor="middle"
    transform={`rotate(-90 ${X0 - 40} ${(WT_Y_TOP + WT_Y_BOTTOM) / 2})`}
    fontWeight="bold"
  >
    Weight (kg)
  </text>
</g> */}

{/* Main border */}
<rect x={X0} y={Y0} width={X1 - X0} height={Y1 - Y0} stroke="#aaa" fill="none" />

{/* Plot points */}
{fentonEntries.map((e, i) => {
  const x = mapX(e.pmaWeeks);
  const yLen = mapY_length(e.length);
  const yHC = mapY_head(e.headC);
  const yWt = mapY_weight(e.weight);
  
  return (
    <g key={i}>
      {/* Length point */}
      <circle cx={x} cy={yLen} r={6} fill="blue" stroke="#fff" strokeWidth={2} />
      
      {/* Head circumference point */}
      <circle cx={x} cy={yHC} r={6} fill="green" stroke="#fff" strokeWidth={2} />
      
      {/* Weight point */}
      <circle cx={x} cy={yWt} r={6} fill="red" stroke="#fff" strokeWidth={2} />
      
      {/* Date label */}
      <text 
        x={x} 
        y={Math.min(CHART_HEIGHT - 6, yWt + 28)} 
        fontSize="10" 
        textAnchor="middle" 
        fill="#222"
        fontWeight="bold"
      >
        {new Date(e.dateISO).toLocaleDateString([], { day: "2-digit", month: "short" })}
      </text>
      
      {/* PMA label above */}
      <text 
        x={x} 
        y={Y0 - 10} 
        fontSize="10" 
        textAnchor="middle" 
        fill="#666"
        fontWeight="bold"
      >
        {e.pmaWeeks}w
      </text>
    </g>
  );
})}
</svg>

    </Box>

    {/* right: table and controls */}
    <Box mt={5} flexGrow={0.8} >
     

      <Table size="small" >
        <TableHead  sx={{backgroundColor:'#868E961F',justifyContent:'center'}}>
          <TableRow>
            <TableCell sx={{color:'black'}}>PMA (w)</TableCell>
            <TableCell sx={{color:'black'}}>Weight (g)</TableCell>
            <TableCell sx={{color:'black'}}>Length (cm)</TableCell>
            <TableCell sx={{color:'black'}}>Head C (cm)</TableCell>
            <TableCell sx={{color:'black'}}>Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
{fentonEntries.map((e, idx) => (
  <TableRow key={idx} hover>
    <TableCell sx={{color:'black'}}>
      {e.pmaWeeks}
    </TableCell>

    <TableCell sx={{color:'black'}}>
      {e.weight} g
    </TableCell>

    <TableCell sx={{color:'black'}}>
      {e.length} cm
    </TableCell>

    <TableCell sx={{color:'black'}}>
      {e.headC} cm
    </TableCell>

    <TableCell sx={{color:'black'}}>
    {new Date(e.dateISO).toLocaleString()}

    </TableCell>
  </TableRow>
))}
</TableBody>

      </Table>
    </Box>
    </Box>  
   
);


},[fentonEntries])

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
         
      )}  
       <Box  sx={{ backgroundColor:'#ffffff'}}>
            <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{mt:4,pb:0, pt:2,pl:2,pr:2}}
      >
          <Typography variant="h6" sx={{ color: "#0F3B61" }} >
          Fenton Chart
    </Typography>
  <Stack  direction="row" spacing={3}>

  <Button
 onClick={handleDownload}
  sx={{ backgroundColor: "#228BE61A", color: "#228BE6" }}
>
  <DownloadIcon />
</Button>
            <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setaddnewbutton1(true)}
            sx={{ backgroundColor: "#228BE61A", color: "#228BE6" }}
          >
           Weekly Entry
          </Button>
  </Stack>
 
          </Stack>      
        {fentonGraph}                         
    
    </Box>
    {/* Tabs Section */}
    </Box>

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
    {addWeekly()}
  
  </Box>
);

};