import { useState, useEffect, FC, useMemo, useRef } from 'react';
import React from 'react';
import Box from '@mui/material/Box';
import { Alert, Dialog, DialogActions, DialogContent, DialogTitle, Snackbar, Stack, TextField, Typography, Button, CircularProgress, TableHead, Table, TableCell, TableRow, TableBody, useTheme } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import annotationPlugin from "chartjs-plugin-annotation";
import { Chart, CategoryScale } from 'chart.js';
import fentonChart from '../assets/fenton_chart_boy.png';
import fentonChart1 from '../assets/fenton_chart_girl.png';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import { Menu, MenuItem, ListItemIcon } from '@mui/material';
import { useAuth0 } from "@auth0/auth0-react";
import { BORNEO_LOGO } from './GrowthNimai_logo'; // Adjust path if needed
// ... keep your existing imports ...
import {
  Paper,
  ToggleButton,
  ToggleButtonGroup,

  IconButton // <--- Add this here
} from '@mui/material';

import autoTable from 'jspdf-autotable';

import {
  TableContainer,
  Chip // <--- Add this
} from '@mui/material';

import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale, // 👈 1. IMPORT THIS
  Filler
} from 'chart.js';

import { Tooltip as MuiTooltip } from '@mui/material'; // ✅ Fixes the conflict

// 2. IMPORT THE DATE ADAPTER (Required for 'time' axis)
import 'chartjs-adapter-date-fns';
// 3. REGISTER IT
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale, // 👈 4. ADD IT HERE
  Filler
);
// Add these icons if you don't have them
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import TableRowsIcon from '@mui/icons-material/TableRows';
// import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import 'chartjs-adapter-date-fns';
import CloseIcon from '@mui/icons-material/Close';
// 1. For the Layout
import { Grid } from "@mui/material";
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { Popover } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { subDays, format, startOfDay, differenceInDays, endOfDay, isSameDay, addDays } from 'date-fns';

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
  birth_date: string;
  gender: string
  currentUserName?: string;
  onWeightChange?: (weight: string) => void;
}

// FENTON 2025 DATA (Rough Approximation based on provided images)
// Structure: { male: { [ga]: { sga: <x, aga: [min, max] } }, female: ... }
const FENTON_2025_DATA = {
  male: {
    22: { sga: 400, lga: 670 },
    23: { sga: 480, lga: 800 },
    24: { sga: 560, lga: 930 },
    25: { sga: 650, lga: 1070 },
    26: { sga: 740, lga: 1220 },
    27: { sga: 840, lga: 1370 },
    28: { sga: 940, lga: 1480 },
    32: { sga: 1510, lga: 2360 },
    34: { sga: 1930, lga: 2980 },
    36: { sga: 2420, lga: 3650 },
    38: { sga: 2860, lga: 4240 },
    40: { sga: 3120, lga: 4600 },
  },
  female: {
    22: { sga: 380, lga: 630 },
    23: { sga: 450, lga: 750 },
    24: { sga: 530, lga: 880 },
    25: { sga: 610, lga: 1010 },
    26: { sga: 690, lga: 1150 },
    27: { sga: 780, lga: 1290 },
    28: { sga: 880, lga: 1400 },
    32: { sga: 1440, lga: 2220 },
    34: { sga: 1840, lga: 2810 },
    36: { sga: 2310, lga: 3420 },
    38: { sga: 2740, lga: 3950 },
    40: { sga: 3000, lga: 4290 },
  }
};

// Helper: Calculate PMA (Post-menstrual Age) in Weeks for Fenton Data
// Returns integer or decimal weeks (e.g., 32.5)
const calculatePmaForFenton = (birthDateStr: string, gaStr: string, targetDate: Date = new Date()): number => {
  if (!birthDateStr || !gaStr) return 0;

  // 1. Parse GA (e.g., "28+3" or "28" or "22W 3D")
  let gaWeeks = 0;
  let gaDays = 0;

  if (gaStr.includes('W') || gaStr.includes('D')) {
    const match = gaStr.match(/(\d+)\s*W\s*(\d+)\s*D/i);
    if (match) {
      gaWeeks = parseInt(match[1]) || 0;
      gaDays = parseInt(match[2]) || 0;
    }
  } else {
    const [gaWeeksStr, gaDaysStr] = gaStr.split(/[+\s]+/);
    gaWeeks = parseInt(gaWeeksStr) || 0;
    gaDays = parseInt(gaDaysStr) || 0;
  }

  // 2. Calculate Days since Birth (using midnight normalization for consistency)
  const birth = startOfDay(new Date(birthDateStr));
  const target = startOfDay(targetDate);
  const daysSinceBirth = Math.max(0, differenceInDays(target, birth));

  // 3. Calculate Total PMA in weeks
  const totalDays = (gaWeeks * 7) + gaDays + daysSinceBirth;
  return Number((totalDays / 7).toFixed(1));
};

// Helper: Get Growth Category (SGA, AGA, LGA)
const getGrowthCategory = (weightGram: number, pma: number, gender: string = 'male'): string | null => {
  if (!weightGram || !pma) return null;

  // Robust gender detection (handles 'female', 'f', 'GIRL', 'female infant', etc.)
  const g = String(gender).toLowerCase().trim();
  const isFemale = g === 'female' || g === 'f' || g === 'girl' || g === 'female infant' || g === 'female child';
  const isMale = g === 'male' || g === 'm' || g === 'boy' || g === 'male infant' || g === 'male child';

  // Log with console.warn to ensure visibility even if "Info" is filtered
  console.warn(`📊 [getGrowthCategory] START: Weight=${weightGram}g, PMA=${pma.toFixed(2)}, InputGender="${gender}"`);
  console.log(`📊 [getGrowthCategory] RESOLVED: ${isFemale ? 'FEMALE 👧' : isMale ? 'MALE 👦' : 'DEFAULT/MALE'} (isFemale: ${isFemale}, isMale: ${isMale})`);

  const dataset = isFemale ? FENTON_2025_DATA.female : FENTON_2025_DATA.male;
  const availableWeeks = Object.keys(dataset).map(Number).sort((a: number, b: number) => a - b);

  // Finding the milestone week (Bracketing Logic - NO interpolation)
  // We use the highest milestone week that is <= our current PMA.
  const weekKey = availableWeeks.slice().reverse().find((w: number) => w <= pma);

  if (!weekKey) {
    console.log(`📊 [getGrowthCategory] SKIPPED: PMA ${pma} is below the first milestone ${availableWeeks[0]}`);
    return null;
  }

  const data = (dataset as any)[weekKey];
  const sgaLimit = data.sga;
  const lgaLimit = data.lga;

  console.info(`📊 [getGrowthCategory] MILESTONE found: Week ${weekKey} (for PMA ${pma.toFixed(2)})`);
  console.info(`📊 [getGrowthCategory] BOUNDARIES: SGA <= ${sgaLimit}g, LGA >= ${lgaLimit}g`);

  if (weightGram <= sgaLimit) {
    console.warn(`📊 [getGrowthCategory] RESULT: SGA (Weight ${weightGram} <= ${sgaLimit})`);
    return 'SGA';
  }
  if (weightGram >= lgaLimit) {
    console.warn(`📊 [getGrowthCategory] RESULT: LGA (Weight ${weightGram} >= ${lgaLimit})`);
    return 'LGA';
  }
  console.log(`📊 [getGrowthCategory] RESULT: AGA (Weight ${weightGram} is between ${sgaLimit} and ${lgaLimit})`);
  return 'AGA';
};

// clinicalZonesPlugin ...

export const GrowthChart: FC<PatientDetails> = (props): JSX.Element => {
  // Theme hook for dark mode detection
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  // Theme-aware Clinical Zones Plugin for BSL Chart
  const clinicalZonesPlugin = useMemo(() => ({
    id: 'clinicalZones',
    beforeDraw: (chart: any) => {
      if (!chart.chartArea || !chart.scales.y) return;

      const { ctx, chartArea: { left, width }, scales: { y } } = chart;

      const drawZone = (yStart: number, yEnd: number, color: string) => {
        const topPixel = y.getPixelForValue(yEnd);
        const bottomPixel = y.getPixelForValue(yStart);
        const height = bottomPixel - topPixel;

        ctx.save();
        ctx.fillStyle = color;
        ctx.fillRect(left, topPixel, width, height);
        ctx.restore();
      };

      // Dark mode uses higher opacity for visibility on dark backgrounds
      if (isDarkMode) {
        // Hyperglycemia (>200): Dark Red - Subtle
        drawZone(200, 250, 'rgba(239, 68, 68, 0.15)');
        drawZone(150, 200, 'rgba(239, 68, 68, 0.10)');
        // Stable (70-150): Dark Green - Subtle
        drawZone(70, 150, 'rgba(16, 185, 129, 0.10)');
        // Hypoglycemia (<45): Dark Yellow/Orange - Subtle
        drawZone(45, 70, 'rgba(245, 158, 11, 0.05)');
        drawZone(0, 45, 'rgba(245, 158, 11, 0.10)');
      } else {
        // Light mode - original colors
        // Hyperglycemia (>200): Light Red
        drawZone(200, 250, 'rgba(250, 82, 82, 0.14)');
        drawZone(150, 200, 'rgba(250, 82, 82, 0.06)');
        // Stable (70-150): Light Green
        drawZone(70, 150, 'rgba(81, 207, 102, 0.10)');
        // Hypoglycemia (<45): Light Yellow
        drawZone(45, 70, 'rgba(250, 176, 5, 0.04)');
        drawZone(0, 45, 'rgba(250, 176, 5, 0.10)');
      }
    }
  }), [isDarkMode]);

  // ---------------- DEBUGGING START ----------------
  // Removed extensive debug logs to improve performance and console readability

  const [addnewbutton, setaddnewbutton] = useState(false);
  const [addnewbutton1, setaddnewbutton1] = useState(false);
  const [snackSucc, setSnackSucc] = useState(false);
  const [snack, setSnack] = useState(false);
  const [date, setDate] = useState<Date | null>(null);
  const [previousWeight, setPreviousWeight] = useState("");
  const [previousWeightDate, setPreviousWeightDate] = useState<Date | null>(null);
  const [currentWeight, setCurrentWeight] = useState("");
  const [gainLoss, setGainLoss] = useState("N/A");
  // const [totalIntake, setTotalIntake] = useState("");
  // const [totalOutput, setTotalOutput] = useState("");
  const { user } = useAuth0();

  // 1. STATE: Default range is Current Date +/- 3 Days
  // Allow Date OR null
  const [graphStartDate, setGraphStartDate] = useState<Date | null>(subDays(new Date(), 7));
  const [graphEndDate, setGraphEndDate] = useState<Date | null>(new Date());

  // State for the Popover (The dropdown menu)
  // Allow HTMLButtonElement OR null
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [currentBSL, setCurrentBSL] = useState("");



  // 🔥 4. AUTO-CLEAR INPUTS on Patient Change or Open
  useEffect(() => {
    // Reset form when patient ID changes
    // setDate(new Date()); // Optional: reset date to now
    setCurrentWeight("");
    setCurrentBSL("");
    setPreviousWeight("");
    setGainLoss("N/A");
  }, [props.patient_resource_id]);

  useEffect(() => {
    // Also clear when opening the dialog if needed (optional, depends on UX preference)
    if (addnewbutton) {
      setDate(new Date());
      setCurrentWeight("");
      setCurrentBSL("");
    }
  }, [addnewbutton]);


  const handleDateClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleDateClose = () => {
    setAnchorEl(null);
  };

  const openDateRange = Boolean(anchorEl);

  // const [gainLoss, setGainLoss] = useState("N/A");
  const [length, setLength] = useState("");
  // const [weeks, setWeeks] = useState("");
  // const [days, setDays] = useState("");
  const [pmaWeeksState, setPmaWeeksState] = useState("");
  const [pmaDaysState, setPmaDaysState] = useState("");

  const [headC, setHeadC] = useState("");
  const [fentonEntries, setFentonEntries] = useState<any[]>([]);
  // Adding <any[]> tells TypeScript this list will hold data later
  const [manualEntries, setManualEntries] = useState<any[]>([]);
  const lastSentWeightRef = useRef<string | null>(null);

  // 🔥 DEFINE THESE VARIABLES SO THE TABLE CAN SEE THEM
  // (Adjust "manualEntries" if your main data state is named something else, like "observations")

  // ---------------------------------------------------------------------------
  // 🗓️ INDEPENDENT DATE STATE (Weight & BSL)
  // ---------------------------------------------------------------------------
  const [weightRange, setWeightRange] = useState<{ start: Date | null; end: Date | null }>({
    start: subDays(new Date(), 6),
    end: new Date()
  });

  const [bslRange, setBslRange] = useState<{ start: Date | null; end: Date | null }>({
    start: subDays(new Date(), 6),
    end: new Date()
  });

  // 🔥 1. SYNC GLOBAL DATES -> LOCAL RANGES
  // When the user picks a date in the Global Toolbar, reset both charts to that range.
  useEffect(() => {
    if (graphStartDate && graphEndDate) {
      setWeightRange({ start: graphStartDate, end: graphEndDate });
      setBslRange({ start: graphStartDate, end: graphEndDate });
    }
  }, [graphStartDate, graphEndDate]);

  // Derived Active Filters (for UI highlighting)
  const activeWeightFilter = useMemo(() => {
    if (!weightRange.start || !weightRange.end) return null;
    const today = new Date();
    if (isSameDay(weightRange.end, today) && isSameDay(weightRange.start, today)) return '1D';
    if (isSameDay(weightRange.end, today) && isSameDay(weightRange.start, subDays(today, 6))) return '7D';
    return null;
  }, [weightRange]);

  const activeBslFilter = useMemo(() => {
    if (!bslRange.start || !bslRange.end) return null;
    const today = new Date();
    if (isSameDay(bslRange.end, today) && isSameDay(bslRange.start, today)) return '1D';
    if (isSameDay(bslRange.end, today) && isSameDay(bslRange.start, subDays(today, 6))) return '7D';
    return null;
  }, [bslRange]);

  // Handlers
  const handleWeightFilter = (_event: any, newView: string | null) => {
    if (!newView) return;
    const today = new Date();
    if (newView === '1D') setWeightRange({ start: today, end: today });
    if (newView === '7D') setWeightRange({ start: subDays(today, 6), end: today });
  };

  const handleBslFilter = (_event: any, newView: string | null) => {
    if (!newView) return;
    const today = new Date();
    if (newView === '1D') setBslRange({ start: today, end: today });
    if (newView === '7D') setBslRange({ start: subDays(today, 6), end: today });
  };


  // 🏗️ FILTERED DATA (Used by both Charts & Tables)
  const filteredBslList = useMemo(() => {
    const start = bslRange.start ? startOfDay(bslRange.start) : startOfDay(new Date());
    const end = bslRange.end ? endOfDay(bslRange.end) : endOfDay(new Date());

    return (manualEntries || [])
      .filter((e: any) => {
        if (!e.time || !e.BSL) return false;
        const t = new Date(e.time);
        return t >= start && t <= end;
      })
      .sort((a: any, b: any) => new Date(a.time).getTime() - new Date(b.time).getTime());
  }, [manualEntries, bslRange]);


  const filteredWeightList = useMemo(() => {
    const start = weightRange.start ? startOfDay(weightRange.start) : startOfDay(new Date());
    const end = weightRange.end ? endOfDay(weightRange.end) : endOfDay(new Date());

    return (manualEntries || [])
      .filter((e: any) => {
        if (!e.time || !e["Current Weight"]) return false;
        const t = new Date(e.time);
        return t >= start && t <= end;
      })
      .sort((a: any, b: any) => new Date(a.time).getTime() - new Date(b.time).getTime());
  }, [manualEntries, weightRange]);

  // 🔥 ALIASES FOR BACKWARD COMPATIBILITY
  const weightData = filteredWeightList;
  const bslEntries = filteredBslList;

  useEffect(() => {
    // 🔥 FIX: Use ALL manual entries to find the GLOBAL latest weight
    // This ensures that the Prescription/Drug module always gets the newest weight,
    // even if the user has filtered the chart view to an older date.
    const allWeights = (manualEntries || []).filter((e: any) => e["Current Weight"]);

    if (allWeights.length > 0) {
      // 1. Sort by time (Newest First)
      const sorted = [...allWeights].sort((a: any, b: any) =>
        new Date(b.time).getTime() - new Date(a.time).getTime()
      );

      const globalLatest = sorted[0];
      console.log("⚖️ Global Latest Weight Found:", globalLatest);

      // 2. Check if parent connected the listener
      if (props.onWeightChange) {
        if (globalLatest && globalLatest["Current Weight"]) {
          const val = String(globalLatest["Current Weight"]);

          // 🔥 SYNC PROTECTION: Only call parent if weight value is actually different
          if (val !== lastSentWeightRef.current) {
            console.log("🚀 Sending Global Weight to Parent:", val);
            lastSentWeightRef.current = val;
            props.onWeightChange(val);
          }
        }
      }
    }
  }, [manualEntries, props.onWeightChange]);

  // 🔥 NEW: Dynamic Date Range Logic
  // Automatically adjust the graph range to show the last 7 days from the LATEST entry
  useEffect(() => {
    if (manualEntries && manualEntries.length > 0) {
      // 1. Find the latest entry by date
      // Note: manualEntries might not be sorted by time here, so we sort it first
      const sortedEntries = [...manualEntries].sort((a: any, b: any) =>
        new Date(b.time).getTime() - new Date(a.time).getTime()
      );

      const latestEntry = sortedEntries[0];
      if (latestEntry && latestEntry.time) {
        const latestDate = new Date(latestEntry.time);

        // 2. Calculate the new range (Latest Date - 7 Days)
        // We use endOfDay for the end date to include the full day
        const newEndDate = endOfDay(latestDate);
        const newStartDate = subDays(newEndDate, 7); // 8 days total (inclusive) as requested ("one more day")

        console.log("📅 Dynamic Range Update:", {
          latestEntryDate: latestDate,
          newStartDate,
          newEndDate
        });

        // 3. Update the state
        setGraphEndDate(newEndDate);
        setGraphStartDate(newStartDate);
      }
    }
  }, [manualEntries]);

  // ---------------------------------------------------------------------------
  // 🔥 AUTO-CALCULATE HEADER STATS (Current Weight & Gain/Loss)
  // ---------------------------------------------------------------------------
  // ---------------------------------------------------------------------------
  // 🔥 AUTO-CALCULATE HEADER STATS (Current Weight & Gain/Loss)
  // ---------------------------------------------------------------------------

  // Auto-correct End Date if Start Date changes
  useEffect(() => {
    if (graphStartDate && graphEndDate) {
      const maxLimit = addDays(new Date(graphStartDate), 7);

      // If current End Date is too far, snap it back to the 7-day limit
      if (graphEndDate > maxLimit) {
        setGraphEndDate(maxLimit);
      }
      // If current End Date is before Start Date, reset it to Start Date
      if (graphEndDate < graphStartDate) {
        setGraphEndDate(graphStartDate);
      }
    }
  }, [graphStartDate]);


  // const [manualData, setManualData] = useState<any[]>([]);
  // const [entries, setEntries] = useState<any[]>( []);

  const [loading] = useState(false);

  // Removed "React." prefix -> requires "useState" to be in your imports at the top
  const [tabValue, setTabValue] = useState(0);
  const [viewMode, setViewMode] = useState<string>('chart');
  // const [bsl, setBsl] = useState<string>("");

  // Removed "React." prefix -> You might need to add "SyntheticEvent" and "MouseEvent" to your top imports
  const handleTabChange = (_event: any, newValue: number) => {
    setTabValue(newValue);
  };

  const handleViewModeChange = (
    _event: any,
    newMode: string | null
  ) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };
  // const downloadTrendsPDF = async () => {
  //   const doc = new jsPDF("p", "pt", "a4"); // Portrait A4
  //   const pageWidth = doc.internal.pageSize.getWidth();
  //   // const pageHeight = doc.internal.pageSize.getHeight();
  //   let orgName = "Unknown Organization";
  //   let logoDataUrl: string | null = null;

  //   try {
  //     // =========================
  //     // Fetch Organization
  //     // =========================
  //     const orgUrl = `${import.meta.env.VITE_FHIRAPI_URL}/Organization/${props.userOrganization}`;
  //     console.log("🏥 Fetching Organization from:", orgUrl);
  //     console.log("🏥 Fetching gender from growth chart:", props.gender);




  //     const res = await fetch(orgUrl, {
  //       headers: {
  //         Authorization: "Basic " + btoa("fhiruser:change-password"),
  //         Accept: "application/fhir+json",
  //       },
  //     });

  //     if (!res.ok) throw new Error(`Organization fetch failed: ${res.status}`);

  //     const orgData = await res.json();
  //     orgName = orgData.name || orgName;
  //     console.log("✅ Organization name fetched:", orgName);

  //     // =========================
  //     // Fetch logo Binary if exists
  //     // =========================
  //     const extensions = Array.isArray(orgData.extension) ? orgData.extension : [];
  //     const logoExt = extensions.find(
  //       (ext: any) =>
  //         ext.url === "http://example.org/fhir/StructureDefinition/organization-logo"
  //     );
  //     const logoRef = logoExt?.valueReference?.reference;
  //     console.log("🔗 Logo Reference (fixed):", logoRef);

  //     if (logoRef) {
  //       const binaryId = logoRef.replace("Binary/", "");
  //       const binaryUrl = `${import.meta.env.VITE_FHIRAPI_URL}/Binary/${binaryId}`;
  //       console.log("🖼️ Fetching Binary from:", binaryUrl);

  //       const binaryRes = await fetch(binaryUrl, {
  //         headers: {
  //           Authorization: "Basic " + btoa("fhiruser:change-password"),
  //           Accept: "application/fhir+json",
  //         },
  //       });

  //       if (!binaryRes.ok) throw new Error(`Binary fetch failed: ${binaryRes.status}`);

  //       const binaryData = await binaryRes.json();
  //       console.log("📦 Binary fetched:", binaryData);

  //       if (binaryData.data && binaryData.contentType) {
  //         logoDataUrl = `data:${binaryData.contentType};base64,${binaryData.data}`;
  //         console.log("✅ Logo Data URL ready (first 50 chars):", logoDataUrl.slice(0, 50) + "...");
  //       } else {
  //         console.warn("⚠️ Binary missing data/contentType");
  //       }
  //     } else {
  //       console.warn("⚠️ No logo extension found in Organization");
  //     }
  //   } catch (err) {
  //     console.error("❌ Error fetching organization/logo:", err);
  //   }

  //   // =========================
  //   // Draw Logo
  //   // =========================
  //   const logoBoxSize = 60;
  //   const logoX = 40;
  //   const logoY = 20;

  //   try {
  //     if (logoDataUrl) {
  //       const img = new Image();
  //       img.src = logoDataUrl;

  //       await new Promise<void>((resolve, reject) => {
  //         img.onload = () => resolve();
  //         img.onerror = (e) => reject(e);
  //       });
  //       console.log("🖼️ Logo image loaded");

  //       const aspectRatio = img.width / img.height;
  //       let drawWidth = logoBoxSize;
  //       let drawHeight = logoBoxSize;

  //       if (aspectRatio > 1) drawHeight = logoBoxSize / aspectRatio;
  //       else drawWidth = logoBoxSize * aspectRatio;

  //       const offsetX = logoX + (logoBoxSize - drawWidth) / 2;
  //       const offsetY = logoY + (logoBoxSize - drawHeight) / 2 - 10;

  //       doc.addImage(img, "PNG", offsetX, offsetY, drawWidth, drawHeight);
  //       console.log("✅ Logo added to PDF");
  //     } else {
  //       console.warn("⚠️ No logo, drawing fallback rectangle");
  //       doc.setFillColor(200, 220, 255);
  //       doc.rect(logoX, logoY, logoBoxSize, logoBoxSize, "F");
  //       doc.setFontSize(8);
  //       doc.text("No Logo", logoX + 5, logoY + 30);
  //     }
  //   } catch (err) {
  //     console.error("❌ Failed to add logo:", err);
  //     doc.setFillColor(200, 220, 255);
  //     doc.rect(logoX, logoY, logoBoxSize, logoBoxSize, "F");
  //   }


  //   // =========================
  //   // 🏥 Hospital Name
  //   // =========================
  //   doc.setFont("helvetica", "bold");
  //   doc.setFontSize(14);
  //   doc.text(orgName, logoX + logoBoxSize + 10, logoY + 15);

  //   doc.setFontSize(11);
  //   doc.text("Growth Chart Report", logoX + logoBoxSize + 10, logoY + 35);

  //   // =========================
  //   // Line separator
  //   // =========================
  //   doc.setDrawColor(180);
  //   doc.line(10, 70, pageWidth - 10, 70);

  //   // =========================
  //   // 👶 PATIENT INFO
  //   // =========================
  //   doc.setFont("helvetica", "normal");
  //   doc.setFontSize(10);

  //   const patientY = 85;
  //   doc.text(`Name: ${props.patient_name}`, 40, patientY);
  //   doc.text(`UHID: ${props.patient_id}`, 40, patientY + 20);
  //   doc.text(`DOB:  ${props.birth_date}`, 250, patientY);
  //   doc.text(`G.A  : ${props.gestational_age}`, 420, patientY);
  //   doc.text(`DOA: ____________________`, 250, patientY + 22);
  //   doc.setDrawColor(180);
  //   doc.line(10, 120, pageWidth - 10, 120);

  //   // =========================
  //   //  SECTION
  //   // =========================
  //   const chartIds = [{ id: "temperatureGraph" }];

  //   const chartHeight = 280; // 🔥 Increased chart height
  //   const chartWidth = pageWidth - 60; // almost full width
  //   let startY = patientY + 60;

  //   for (const chart of chartIds) {
  //     const element = document.getElementById(chart.id);
  //     if (!element) continue;

  //     // Title above chart
  //     // doc.setFont("helvetica", "bold");
  //     // doc.setFontSize(12);
  //     // doc.text(chart.title, 270, startY);

  //     // Capture chart
  //     const canvas = await html2canvas(element, {
  //       scale: 2,
  //       backgroundColor: "#fff",
  //     });
  //     const imgData = canvas.toDataURL("image/png");

  //     // Maintain aspect ratio
  //     const aspectRatio = canvas.width / canvas.height;
  //     const targetWidth = chartWidth;
  //     const targetHeight = Math.min(chartHeight, targetWidth / aspectRatio);

  //     // Add chart image
  //     doc.addImage(imgData, "PNG", 40, startY + 10, targetWidth, targetHeight);

  //     startY += targetHeight + 60; // extra gap between charts
  //   }

  //   // =========================
  //   // 💾 SAVE PDF
  //   // =========================
  //   doc.save(`GrowthChart_Report(${props.patient_id}).pdf`);
  //   // doc.save("GrowthChart_Report.pdf");
  // };



  const handleAddEntry = async () => {
    console.log("🟢 Starting Save Process...");

    const weightVal = parseFloat(currentWeight);
    const bslVal = parseFloat(currentBSL);
    const isWeightEntered = currentWeight.trim() !== "";
    const isBslEntered = currentBSL.trim() !== "";

    if (!isWeightEntered && !isBslEntered) {
      setSnackSucc(false);
      setSnack(true);
      return;
    }

    // 🔥 Validation Limits
    if (isWeightEntered && (isNaN(weightVal) || weightVal < 0 || weightVal > 20000)) {
      alert("Weight must be between 0 and 20000 g.");
      return;
    }
    if (isBslEntered && (isNaN(bslVal) || bslVal < 0 || bslVal > 250)) {
      alert("BSL must be between 0 and 250 mg/dL.");
      return;
    }

    const hasWeight = isWeightEntered && !isNaN(weightVal);
    const hasBSL = isBslEntered && !isNaN(bslVal);

    const components = [];

    // 1. Handle Weight
    if (hasWeight) {
      components.push({
        code: { text: "Current Weight" },
        valueQuantity: { value: weightVal, unit: "g", system: "http://unitsofmeasure.org", code: "g" }
      });

      // 🔥 NEW: Calculate Weight Velocity (g/kg/d)
      if (previousWeight && !isNaN(parseFloat(previousWeight)) && previousWeightDate) {
        const prev = parseFloat(previousWeight);
        const curr = weightVal;
        const currDate = date ? new Date(date) : new Date();
        const prevDate = new Date(previousWeightDate);

        // Duration in days (min 1 day)
        const duration = Math.max(1, Math.abs(differenceInDays(currDate, prevDate)));
        const avgWeight = (curr + prev) / 2;
        const velocity = ((curr - prev) * 1000) / (avgWeight * duration);

        const sign = velocity > 0 ? "+" : "";
        const formattedVelocity = `${sign}${velocity.toFixed(2)} g/kg/d`;

        components.push({
          code: { text: "Gain/Loss in 24 hrs" },
          valueString: formattedVelocity // Save the rate
        });

        // Also save Previous Weight for reference
        components.push({
          code: { text: "Previous Weight" },
          valueQuantity: { value: prev, unit: "g", system: "http://unitsofmeasure.org", code: "g" }
        });
      }
    }

    // 2. Handle BSL
    if (hasBSL) {
      components.push({
        code: { text: "BSL" },
        valueQuantity: { value: bslVal, unit: "mg/dL", system: "http://unitsofmeasure.org", code: "mg/dL" }
      });
    }

    // ... (Keep the rest of your Save Logic: finalDate, observation object, fetch POST) ...
    // Note: I am omitting the fetch code here to save space, keep your existing fetch/POST logic!

    const finalDate = date ? new Date(date).toISOString() : new Date().toISOString();
    const observation = {
      resourceType: "Observation",
      status: "final",
      category: [{ coding: [{ system: "http://terminology.hl7.org/CodeSystem/observation-category", code: "growth-chart", display: "Growth Chart" }] }],
      code: { coding: [{ system: "http://loinc.org", code: "8331-1", display: "Daily Neonatal Measurement Summary" }], text: "Daily Neonatal Entry" },
      subject: { reference: `Patient/${props.patient_resource_id}` },
      performer: [{ display: user?.name || "Dr. Janardhanan" }],
      effectiveDateTime: finalDate,
      component: components,
    };

    const baseUrl = import.meta.env.VITE_FHIRAPI_URL as string;
    const authHeader = "Basic " + btoa("fhiruser:change-password");

    try {
      const postResponse = await fetch(`${baseUrl}/Observation`, {
        method: "POST",
        headers: { Authorization: authHeader, "Content-Type": "application/fhir+json", Accept: "application/fhir+json" },
        body: JSON.stringify(observation),
      });

      if (postResponse.ok) {
        await fetchManualTrends(props.patient_resource_id);
        setSnackSucc(true);
        setSnack(true);
        setaddnewbutton(false);
        setPreviousWeight("");
        setCurrentWeight("");
        setCurrentBSL("");
      } else {
        setSnackSucc(false);
        setSnack(true);
      }
    } catch (error) {
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

  const handleDownloadPdf = () => {
    const doc = new jsPDF();

    // ---------------------------------------------------------
    // 1. SETUP & HEADER
    // ---------------------------------------------------------

    // ➤ LOGO (Replace this string with your Base64 image data or URL)
    // You can convert your image to base64 here: https://www.base64-image.de/
    const logoUrl = BORNEO_LOGO;

    // Draw Logo (Left)
    // doc.addImage(imgData, 'FMT', x, y, width, height)
    try {
      doc.addImage(logoUrl, 'PNG', 14, 10, 25, 12); // Adjust W/H as needed
    } catch (e) {
      console.warn("Logo not found or invalid format");
    }

    // Hospital Address / Name (Next to Logo)
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text("Shree Vallabh Nagar,", 42, 12);
    doc.text("Mumbai Naka, Nashik", 42, 16);
    doc.text("422001.", 42, 20);

    // Title Box (Left)
    doc.setFillColor(245, 247, 250); // Light Gray bg
    doc.roundedRect(14, 25, 50, 8, 1, 1, 'F');
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    doc.text("BSL & WEIGHT CHART", 39, 30, { align: "center" });

    // ---------------------------------------------------------
    // 2. PATIENT DEMOGRAPHICS BOX (Right)
    // ---------------------------------------------------------
    const rightBoxX = 110;
    const rightBoxY = 10;
    const rightBoxW = 85;
    const rightBoxH = 18;

    // Draw Border Box
    doc.setDrawColor(200);
    doc.setLineWidth(0.1);
    doc.roundedRect(rightBoxX, rightBoxY, rightBoxW, rightBoxH, 2, 2, 'S');

    // Line Separator
    doc.line(rightBoxX, rightBoxY + 9, rightBoxX + rightBoxW, rightBoxY + 9);

    // Data Mapping from Props
    const pName = props.patient_name || "Unknown";
    const pID = props.patient_id || "--";
    const pGA = props.gestational_age || "--";
    // Get latest weight from data if available
    const latestWt = weightData.length > 0 ? weightData[0]["Current Weight"] : "--";

    doc.setFontSize(9);

    // Row 1: Name & ID
    doc.setFont("helvetica", "normal");
    doc.text("B/O Mothers Name", rightBoxX + 2, rightBoxY + 6);
    doc.setFont("helvetica", "bold");
    doc.text(pName, rightBoxX + 35, rightBoxY + 6);

    doc.setFont("helvetica", "normal");
    doc.text("ID:", rightBoxX + 55, rightBoxY + 6);
    doc.setFont("helvetica", "bold");
    doc.text(pID, rightBoxX + 62, rightBoxY + 6);

    // Row 2: GA & Weight
    doc.setFont("helvetica", "normal");
    doc.text("GA:", rightBoxX + 2, rightBoxY + 15);
    doc.setFont("helvetica", "bold");
    doc.text(pGA, rightBoxX + 10, rightBoxY + 15);

    doc.setFont("helvetica", "normal");
    doc.text("Current Weight:", rightBoxX + 50, rightBoxY + 15);
    doc.setFont("helvetica", "bold");
    doc.text(`${latestWt} g`, rightBoxX + 74, rightBoxY + 15);


    // ---------------------------------------------------------
    // 3. TABLES (Side by Side)
    // ---------------------------------------------------------
    const startY = 40;

    // --- TABLE 1: WEIGHT (Left) ---
    // Transform Data for AutoTable
    const weightRows = weightData
      .sort((a: any, b: any) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .map((row: any, i: number, arr: any[]) => {
        const curr = row["Current Weight"];
        const prevRow = arr[i + 1];
        const prevWeight = prevRow ? prevRow["Current Weight"] : null;
        let vStr = "";

        if (curr && prevWeight) {
          const currDate = new Date(row.time);
          const prevDate = new Date(prevRow.time);
          const duration = Math.max(1, Math.abs(differenceInDays(currDate, prevDate)));
          const avgWeight = (curr + prevWeight) / 2;
          const velocity = ((curr - prevWeight) * 1000) / (avgWeight * duration);
          vStr = `(${velocity > 0 ? '+' : ''}${velocity.toFixed(1)}g/kg/d)`;
        }

        return [
          format(new Date(row.time), 'dd-MM-yy'),
          format(new Date(row.time), 'hh:mm a'),
          `${curr} ${vStr}`
        ];
      });

    autoTable(doc, {
      startY: startY,
      head: [['Date', 'Time', 'Weight (g)']],
      body: weightRows,
      theme: 'grid', // Changed from 'plain' to 'grid'
      margin: { left: 14 },
      tableWidth: 85,
      styles: {
        fontSize: 8,
        cellPadding: 3,
        lineColor: [200, 200, 200], // Gray border color
        lineWidth: 0.1 // Thin border
      },
      headStyles: {
        fillColor: [245, 247, 250],
        textColor: 80,
        fontStyle: 'bold',
        lineColor: [200, 200, 200],
        lineWidth: 0.1
      },
      columnStyles: {
        0: { textColor: 100 },
        2: { fontStyle: 'bold' }
      },
      didParseCell: function (data) {
        // Color the Difference Text (Green/Red)
        if (data.section === 'body' && data.column.index === 2) {
          const text = data.cell.raw as string;
          if (text.includes('+')) data.cell.styles.textColor = [16, 185, 129]; // Green
          if (text.includes('-')) data.cell.styles.textColor = [239, 68, 68];  // Red
        }
      }
    });


    // --- TABLE 2: BSL (Right Side of PDF) ---
    const bslRows = bslEntries
      .sort((a: any, b: any) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .map((row: any) => {
        const val = row["BSL"];
        let label = "";

        // Label Logic for PDF Text
        if (val < 45) label = "Hypo";
        else if (val >= 45 && val < 70) label = "Hypo Borderline";
        else if (val >= 70 && val <= 150) label = "Stable";
        else if (val > 150 && val <= 200) label = "Hyper Borderline";
        else if (val > 200) label = "Hyper";

        return [
          format(new Date(row.time), 'dd-MM-yy'),
          format(new Date(row.time), 'hh:mm a'),
          `${val} (${label})`
        ];
      });

    autoTable(doc, {
      startY: startY,
      head: [['Date', 'Time', 'BSL (mg/dL)']],
      body: bslRows,
      theme: 'grid', // Changed from 'plain' to 'grid'
      margin: { left: 110 },
      tableWidth: 85,
      styles: {
        fontSize: 8,
        cellPadding: 3,
        lineColor: [200, 200, 200], // Gray border color
        lineWidth: 0.1 // Thin border
      },
      headStyles: {
        fillColor: [245, 247, 250],
        textColor: 80,
        fontStyle: 'bold',
        lineColor: [200, 200, 200],
        lineWidth: 0.1
      },
      columnStyles: {
        2: { fontStyle: 'bold' }
      },

      // 🔥 COLOR LOGIC FOR PDF TEXT
      didParseCell: function (data) {
        if (data.section === 'body' && data.column.index === 2) {
          const text = data.cell.raw as string;
          const val = parseInt(text.split(' ')[0]); // Extract number from "40 (Hypo)"

          if (!isNaN(val)) {
            if (val < 45) {
              data.cell.styles.textColor = [245, 158, 11]; // Orange (Hypo)
            }
            else if (val >= 45 && val < 70) {
              data.cell.styles.textColor = [234, 179, 8]; // Yellow (Hypo Borderline)
            }
            else if (val >= 70 && val <= 150) {
              data.cell.styles.textColor = [16, 185, 129]; // Green (Stable)
            }
            else if (val > 150 && val <= 200) {
              data.cell.styles.textColor = [248, 113, 113]; // Mild Red (Hyper Borderline)
            }
            else if (val > 200) {
              data.cell.styles.textColor = [239, 68, 68]; // Red (Hyper)
            }
          }
        }
      }
    });

    // ---------------------------------------------------------
    // 4. FOOTER
    // ---------------------------------------------------------
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setTextColor(150);
      const username = user?.name || 'User'; // Fallback to 'User' if name is missing
      const footerText = `Printed By: ${username}   ${format(new Date(), 'dd/MM/yy hh:mm a')}`;
      doc.text(footerText, 14, 290); // Bottom left
      doc.text(`Page ${i}/${pageCount}`, 190, 290, { align: 'right' });
    }

    doc.save(`BSL_Weight_Chart_${pName}.pdf`);
  };

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
    console.log("📥 Fetching raw history...");
    const baseUrl = import.meta.env.VITE_FHIRAPI_URL as string;
    const authHeader = "Basic " + btoa("fhiruser:change-password");

    try {
      const searchResponse = await fetch(
        `${baseUrl}/Observation?subject=Patient/${patientId}&category=growth-chart&_sort=date&_count=1000`,
        { headers: { Authorization: authHeader, Accept: "application/fhir+json" } }
      );
      const searchBundle = await searchResponse.json();

      if (!searchBundle.entry || searchBundle.entry.length === 0) {
        setManualEntries([]);
        return [];
      }

      const rawList = searchBundle.entry.map((entry: any) => {
        const obs = entry.resource;
        const values: Record<string, any> = {};

        // 1. Extract Values
        obs.component?.forEach((c: any) => {
          let label = c.code?.text;
          const value = c.valueQuantity?.value ?? c.valueString ?? null;
          if (label) {
            if (label.toUpperCase() === "BSL" || label.toUpperCase() === "GLUCOSE") label = "BSL";
            values[label] = value;
          }
        });

        // -------------------------------------------------------------
        // 🔍 DEBUGGING: Check what the server is actually sending us
        // -------------------------------------------------------------
        if (obs.performer) {
          console.log(`✅ Found Performer for ${obs.effectiveDateTime}:`, obs.performer);
        } else {
          console.log(`⚠️ NO Performer for ${obs.effectiveDateTime}`);
        }
        // -------------------------------------------------------------

        // 2. Extract User Name (With Safety Checks)
        // We check 'display' first, but if that's missing, we try to grab any text we can find.
        let userName = "Unknown User";

        if (obs.performer && obs.performer.length > 0) {
          userName = obs.performer[0].display || obs.performer[0].reference || "Unknown User";
        }

        return {
          id: obs.id,
          time: obs.effectiveDateTime,
          user: userName, // <--- This saves it to the row
          ...values
        };
      });

      console.log("✅ Final Processed Data:", rawList);
      setManualEntries(rawList);

      const lastWeightEntry = [...rawList].reverse().find((e: any) => e["Current Weight"]);
      if (lastWeightEntry) {
        setPreviousWeight(lastWeightEntry["Current Weight"].toString());
        setPreviousWeightDate(new Date(lastWeightEntry.time));
      }

      return rawList;

    } catch (error) {
      console.error("❌ Fetch Error:", error);
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
          const prevDate = observation.effectiveDateTime;
          console.log("📦 Auto-fetched Previous Weight:", previous, "at", prevDate);
          setPreviousWeight(previous.toString());
          setPreviousWeightDate(new Date(prevDate));
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
    if (props.patient_resource_id) {
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
    if (!previousWeight || !currentWeight || !previousWeightDate) {
      setGainLoss("N/A");
      return;
    }

    const prev = parseFloat(previousWeight);
    const curr = parseFloat(currentWeight);
    const currDate = date || new Date();
    const prevDate = previousWeightDate;

    // Use absolute days for duration (min 1 day to avoid division by zero)
    const duration = Math.max(1, Math.abs(differenceInDays(currDate, prevDate)));
    const avgWeight = (curr + prev) / 2;

    // Formula: [(curr - prev) * 1000] / [((curr + prev)/2) * duration]
    const velocity = ((curr - prev) * 1000) / (avgWeight * duration);

    const sign = velocity > 0 ? "+" : "";
    const display = `${sign}${velocity.toFixed(2)} g/kg/d`;

    setGainLoss(display);
  }, [previousWeight, currentWeight, previousWeightDate, date]);

  function calculatePMA(gaAtBirth: string, birthDate: string) {
    if (!gaAtBirth || !birthDate) return { pmaWeeks: 0, pmaDays: 0, pmaDecimal: 0 };

    let gaWeeks = 0;
    let gaDays = 0;

    // Support both "22W 3D" and "22+3" or "22"
    if (gaAtBirth.includes('W') || gaAtBirth.includes('D')) {
      const match = gaAtBirth.match(/(\d+)\s*W\s*(\d+)\s*D/i);
      if (match) {
        gaWeeks = Number(match[1]) || 0;
        gaDays = Number(match[2]) || 0;
      }
    } else {
      const [gaWeeksStr, gaDaysStr] = gaAtBirth.split(/[+\s]+/);
      gaWeeks = parseInt(gaWeeksStr) || 0;
      gaDays = parseInt(gaDaysStr) || 0;
    }

    const birth = startOfDay(new Date(birthDate));
    const today = startOfDay(new Date());
    const daysSinceBirth = Math.max(0, differenceInDays(today, birth));

    const totalDays = (gaWeeks * 7) + gaDays + daysSinceBirth;
    const pmaWeeks = Math.floor(totalDays / 7);
    const pmaDays = totalDays % 7;
    const pmaDecimal = Number((totalDays / 7).toFixed(1));

    return { pmaWeeks, pmaDays, pmaDecimal };
  }

  useEffect(() => {
    const { pmaWeeks, pmaDays } = calculatePMA(
      props.gestational_age,
      props.birth_date
    );

    setPmaWeeksState(pmaWeeks.toString());
    setPmaDaysState(pmaDays.toString());

  }, [props.gestational_age, props.birth_date, addnewbutton1]);

  // Auto PMA calculation
  // const { pmaWeeks, pmaDays } = calculatePMA(
  //   props.gestational_age, 
  //   props.birth_date
  // );


  const addValues = () => {
    const weightVal = parseFloat(currentWeight);
    const bslVal = parseFloat(currentBSL);
    const isWeightEntered = currentWeight.trim() !== "";
    const isBslEntered = currentBSL.trim() !== "";

    const isWeightInvalid = isWeightEntered && (isNaN(weightVal) || weightVal < 0 || weightVal > 20000);
    const isBslInvalid = isBslEntered && (isNaN(bslVal) || bslVal < 0 || bslVal > 250);
    const isSaveDisabled = (!isWeightEntered && !isBslEntered) || isWeightInvalid || isBslInvalid;

    return (
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Dialog
          open={addnewbutton}
          onClose={() => setaddnewbutton(false)}
          fullWidth
          maxWidth="xs"
          PaperProps={{
            sx: {
              borderRadius: "16px",
              backgroundColor: isDarkMode ? theme.palette.background.paper : "#FFFFFF",
              boxShadow: "0px 24px 48px rgba(0,0,0,0.2)",
              padding: "12px",
              border: isDarkMode ? `1px solid ${theme.palette.divider}` : undefined,
            },
          }}
        >
          {/* HEADER */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ px: 1, pb: 2 }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1.1rem", color: isDarkMode ? theme.palette.text.primary : "#111927" }}>
              BSL & Weight Entry
            </Typography>
            <IconButton
              onClick={() => setaddnewbutton(false)}
              size="small"
              sx={{ color: isDarkMode ? theme.palette.text.secondary : "#6B7280", "&:hover": { backgroundColor: isDarkMode ? theme.palette.action.hover : "#F3F4F6" } }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>

          <DialogContent sx={{ px: 1, py: 0 }}>

            {/* 1. Date & Time + Doctor Row (Gray Boxes) */}
            <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
              <Box sx={{ flex: 1 }}>
                <DateTimePicker
                  value={date}
                  onChange={(newValue) => setDate(newValue)}
                  format="dd-MM-yy hh:mm a"
                  minDateTime={new Date()}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "small",
                      sx: {
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: isDarkMode ? theme.palette.action.hover : "#F3F4F6",
                          borderRadius: "8px",
                          "& fieldset": { border: "none" },
                          "& input": { fontWeight: 600, fontSize: "13px", color: isDarkMode ? theme.palette.text.primary : "#374151" },
                        },
                        "& .MuiSvgIcon-root": { fontSize: "18px", color: isDarkMode ? theme.palette.text.secondary : "#6B7280" }
                      },
                    },
                  }}
                />
              </Box>

              {/* Visual-only Doctor Box to match design */}
              <Box
                sx={{
                  flex: 1,
                  backgroundColor: isDarkMode ? theme.palette.action.hover : "#F3F4F6",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  px: 1.5,
                  cursor: "pointer"
                }}
              >
                <Typography sx={{ fontSize: "13px", fontWeight: 500, color: isDarkMode ? theme.palette.text.primary : "#374151" }}>
                  {user?.name || "Dr. Janardhanan"}
                </Typography>
                <PersonOutlineIcon sx={{ fontSize: "18px", color: isDarkMode ? theme.palette.text.secondary : "#6B7280" }} />
              </Box>
            </Stack>

            {/* 2. Weight Input */}
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5, color: isDarkMode ? theme.palette.text.secondary : "#374151", fontSize: "14px" }}>
                Weight
              </Typography>
              <TextField
                required
                fullWidth
                value={currentWeight}
                onChange={(e) => setCurrentWeight(e.target.value)}
                type="number"
                placeholder="0"
                error={currentWeight.trim() !== "" && (parseFloat(currentWeight) < 0 || parseFloat(currentWeight) > 20000)}
                helperText={currentWeight.trim() !== "" && (parseFloat(currentWeight) < 0 || parseFloat(currentWeight) > 20000) ? "Range: 0 - 20,000 g" : ""}
                inputProps={{ min: 0, max: 20000 }}
                InputProps={{
                  endAdornment: <Typography sx={{ color: isDarkMode ? theme.palette.text.secondary : "#9CA3AF", fontSize: "14px" }}>g</Typography>,
                  sx: {
                    backgroundColor: isDarkMode ? theme.palette.background.paper : "#FFFFFF",
                    borderRadius: "8px",
                    border: `1px solid ${isDarkMode ? theme.palette.divider : (currentWeight.trim() !== "" && (parseFloat(currentWeight) < 0 || parseFloat(currentWeight) > 20000) ? "#d32f2f" : "#E5E7EB")}`,
                    "& fieldset": { border: "none" },
                    "& input": { fontSize: "15px", fontWeight: 500, color: isDarkMode ? theme.palette.text.primary : "#111827" },
                    "&:hover": { border: `1px solid ${isDarkMode ? theme.palette.text.secondary : "#D1D5DB"}` },
                    "&.Mui-focused": { border: "1px solid #58A6FF", boxShadow: isDarkMode ? "0 0 0 2px rgba(88, 166, 255, 0.2)" : "0 0 0 2px rgba(34,139,230,0.1)" },
                  },
                }}
              />
            </Box>

            {/* 3. BSL Input (New Field) */}
            {/* BSL INPUT FIELD */}
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5, color: isDarkMode ? theme.palette.text.secondary : "#374151", fontSize: "14px" }}>
                BSL (Glucose)
              </Typography>
              <TextField
                fullWidth
                value={currentBSL}
                onChange={(e) => setCurrentBSL(e.target.value)}
                type="number"
                placeholder="0"
                error={currentBSL.trim() !== "" && (parseFloat(currentBSL) < 0 || parseFloat(currentBSL) > 250)}
                helperText={currentBSL.trim() !== "" && (parseFloat(currentBSL) < 0 || parseFloat(currentBSL) > 250) ? "Range: 0 - 250 mg/dL" : ""}
                inputProps={{ min: 0, max: 250 }}
                InputProps={{
                  endAdornment: <Typography sx={{ color: isDarkMode ? theme.palette.text.secondary : "#9CA3AF", fontSize: "14px" }}>mg/dL</Typography>,
                  sx: {
                    backgroundColor: isDarkMode ? theme.palette.background.paper : "#FFFFFF",
                    borderRadius: "8px",
                    border: `1px solid ${isDarkMode ? theme.palette.divider : (currentBSL.trim() !== "" && (parseFloat(currentBSL) < 0 || parseFloat(currentBSL) > 250) ? "#d32f2f" : "#E5E7EB")}`,
                    "& fieldset": { border: "none" },
                    "& input": {
                      fontSize: "15px",
                      fontWeight: 500,
                      color: isDarkMode ? theme.palette.text.primary : "#111827"
                    },
                    "&:hover": { border: `1px solid ${isDarkMode ? theme.palette.text.secondary : "#D1D5DB"}` },
                    "&.Mui-focused": { border: "1px solid #58A6FF", boxShadow: isDarkMode ? "0 0 0 2px rgba(88, 166, 255, 0.2)" : "0 0 0 2px rgba(34,139,230,0.1)" },
                  },
                }}
              />
            </Box>

            {/* Hidden Previous Weight (Logic Preserved) */}
            <TextField
              value={previousWeight}
              onChange={(e) => setPreviousWeight(e.target.value)}
              type="number"
              sx={{ display: "none" }}
            />

          </DialogContent>

          {/* FOOTER */}
          <DialogActions sx={{ px: 1, pb: 2, pt: 2 }}>
            <Stack direction="row" spacing={1.5} width="100%">
              <Button
                fullWidth
                onClick={() => setaddnewbutton(false)}
                sx={{
                  textTransform: "none",
                  color: isDarkMode ? theme.palette.text.primary : "#374151",
                  backgroundColor: isDarkMode ? theme.palette.action.hover : "#F3F4F6",
                  borderRadius: "8px",
                  fontWeight: 600,
                  py: 1.2,
                  "&:hover": { backgroundColor: isDarkMode ? theme.palette.action.selected : "#E5E7EB" },
                }}
              >
                Cancel
              </Button>
              <Button
                fullWidth
                variant="contained"
                onClick={handleAddEntry}
                disabled={isSaveDisabled}
                startIcon={<AddIcon />}
                sx={{
                  textTransform: "none",
                  backgroundColor: "#228BE6",
                  borderRadius: "8px",
                  fontWeight: 600,
                  py: 1.2,
                  boxShadow: "none",
                  "&:hover": { backgroundColor: "#1C7ED6", boxShadow: "none" },
                }}
              >
                Save
              </Button>
            </Stack>
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
                label="Weight Velocity"
                value={gainLoss}
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <Typography sx={{ color: "#9BA1AE", fontSize: "12px", whiteSpace: "nowrap", ml: 1 }}>
                      g / kg / d
                    </Typography>
                  ),
                  sx: {
                    backgroundColor: "#F5F5F5",
                    borderRadius: 1,
                    color:
                      gainLoss === "N/A"
                        ? "#9BA1AE"
                        : (parseFloat(gainLoss) < 0 || gainLoss.includes("-"))
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





  // Helper to determine which Quick Filter is active
  // Helper to determine which Quick Filter is active
  // 1. Helper to see which button is active (1D or 7D)

  // ---------------------------------------------------------------------------
  // 🗑️ DELETE MENU STATE (Handles both Weight & BSL)
  // ---------------------------------------------------------------------------
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'weight' | 'bsl', row: any } | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false); // <--- NEW STATE

  // Open the menu and save WHICH item we want to delete
  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, row: any, type: 'weight' | 'bsl') => {
    setMenuAnchor(event.currentTarget);
    setDeleteTarget({ type, row });
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
    // Don't clear deleteTarget yet if we are opening confirmation
  };

  const handleDeleteClick = () => {
    handleCloseMenu();
    setDeleteConfirmOpen(true);
  }

  const handleCloseConfirm = () => {
    setDeleteConfirmOpen(false);
    setDeleteTarget(null);
  }


  const confirmDelete = async () => {
    if (!deleteTarget || !deleteTarget.row.id) {
      handleCloseConfirm();
      return;
    }

    console.log("🗑️ Deleting entry ID:", deleteTarget.row.id);

    // 1. Setup API details
    const baseUrl = import.meta.env.VITE_FHIRAPI_URL as string;
    const authHeader = "Basic " + btoa("fhiruser:change-password");

    try {
      // 2. Send DELETE command to Server
      const response = await fetch(`${baseUrl}/Observation/${deleteTarget.row.id}`, {
        method: "DELETE",
        headers: { Authorization: authHeader }
      });

      if (response.ok) {
        // 3. Success! Remove it from the screen immediately (using ID, not time)
        const updatedList = manualEntries.filter((entry: any) => entry.id !== deleteTarget.row.id);
        setManualEntries(updatedList);
        setSnackSucc(true); // Optional: Show success message
      } else {
        alert("Failed to delete from server.");
      }
    } catch (error) {
      console.error("Delete Error:", error);
      alert("Error deleting entry.");
    }

    handleCloseConfirm();
  };



  // BSL GRAPH CONFIGURATION
  const bslDataConfig = useMemo(() => {
    return {
      datasets: [
        {
          label: 'Glucose (mg/dL)',
          data: filteredBslList.map((e: any) => ({
            x: new Date(e.time),
            y: e["BSL"]
          })),

          // 🔥 1. Line Style: Blue & Curved
          borderColor: '#3B82F6', // Blue-500
          borderWidth: 3,
          tension: 0, // Smooth curve like the image

          // 🔥 2. Dynamic Point Colors
          pointBackgroundColor: (context: any) => {
            const val = context.raw?.y;
            if (val > 200) return 'rgb(250, 82, 82)'; // Hyper
            if (val < 45) return 'rgb(250, 176, 5)'; // Hypo
            if (val >= 70 && val <= 150) return 'rgb(81, 207, 102)'; // Stable
            if ((val >= 45 && val < 70)) return 'rgb(253, 226, 163)';
            if (val > 150 && val <= 200) return 'rgb(247, 120, 120)';
            return '#3B82F6';
          },
          pointBorderColor: isDarkMode ? '#1F2937' : '#FFFFFF',
          pointBorderWidth: 2,
          pointRadius: 6,
          spanGaps: true,
        },
      ],
    };
  }, [filteredBslList, isDarkMode]);


  // BSL Chart Options with Custom Time Scale
  // Cast as 'any' to avoid strict TypeScript conflicts
  // BSL Chart Options with Custom Time Scale
  const bslOptions = useMemo(() => {
    let start = bslRange.start || subDays(new Date(), 6);
    let end = bslRange.end || new Date();

    const totalDays = differenceInDays(end, start) + 1;
    const showOnlyDates = totalDays > 5;

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: (context: any) => {
              const d = new Date(context[0].parsed.x);
              return format(d, 'MMM dd, HH:mm');
            }
          }
        }
      },
      scales: {
        x: {
          type: 'time',
          min: startOfDay(start).getTime(),
          max: endOfDay(end).getTime(),

          time: {
            unit: showOnlyDates ? 'day' : 'hour',
            displayFormats: {
              day: 'MMM dd',
              hour: 'HH:mm'
            }
          },
          grid: {
            display: true,
            color: (context: any) => {
              const d = new Date(context.tick.value);
              return d.getHours() === 0
                ? (isDarkMode ? '#3D4752' : '#E5E7EB')
                : (isDarkMode ? '#2D333B' : '#F3F4F6');
            }
          },
          ticks: {
            source: 'auto',
            autoSkip: true,
            maxRotation: 0,
            callback: function (val: any) {
              const d = new Date(val);
              const hour = d.getHours();
              if (hour === 0) return format(d, 'MMM dd');
              if (showOnlyDates) return null;
              if (totalDays >= 4 && hour === 12) return "12pm";
              if (totalDays >= 2) {
                if (hour === 6) return "6am";
                if (hour === 12) return "12pm";
                if (hour === 18) return "6pm";
                return null;
              }
              if (hour % 4 === 0) {
                const ampm = hour >= 12 ? 'pm' : 'am';
                const h = hour % 12 || 12;
                return `${h}${ampm}`;
              }
              return null;
            },
            font: function (context: any) {
              const d = new Date(context.tick.value);
              return {
                weight: d.getHours() === 0 ? 'bold' : 'normal',
                size: d.getHours() === 0 ? 12 : 11
              };
            },
            color: isDarkMode ? '#9CA3AF' : undefined
          }
        },
        y: {
          title: {
            display: true,
            text: 'Glucose (mg/dL)',
            color: isDarkMode ? '#9CA3AF' : undefined
          },
          beginAtZero: false,
          min: 0,
          max: 250,
          ticks: { color: isDarkMode ? '#9CA3AF' : undefined },
          grid: { borderDash: [4, 4], color: isDarkMode ? '#3D4752' : '#E5E7EB' }
        }
      }
    };
  }, [bslRange, isDarkMode]);
  // 🔥 NEW: Dynamic Options for Weight Chart (Theme-aware)
  const weightDataConfig = useMemo(() => {
    return {
      datasets: [
        {
          label: 'Weight (g)',
          data: filteredWeightList.map((e: any) => ({
            x: new Date(e.time),
            y: e["Current Weight"]
          })),
          borderColor: '#228BE6',
          backgroundColor: '#228BE6',
          pointBackgroundColor: '#FFFFFF',
          pointBorderColor: '#228BE6',
          borderWidth: 2,
          tension: 0,
          pointRadius: 4,
        }
      ]
    };
  }, [filteredWeightList]);

  const weightOptions: any = useMemo(() => {
    let start = weightRange.start || subDays(new Date(), 6);
    let end = weightRange.end || new Date();

    const totalDays = differenceInDays(end, start) + 1;
    const showOnlyDates = totalDays > 2;

    // Fix: Ensure we cover the full day range for the axis
    const minTime = startOfDay(start).getTime();
    const maxTime = endOfDay(end).getTime();

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: (context: any) => {
              const d = new Date(context[0].parsed.x);
              return format(d, 'MMM dd, HH:mm');
            }
          }
        }
      },
      scales: {
        x: {
          type: 'time',
          min: minTime,
          max: maxTime,
          time: {
            unit: showOnlyDates ? 'day' : 'hour',
            displayFormats: {
              day: 'MMM dd',
              hour: 'HH:mm'
            }
          },
          ticks: {
            autoSkip: true,
            maxTicksLimit: 10,
            color: isDarkMode ? '#9CA3AF' : undefined
          },
          grid: {
            color: isDarkMode ? '#3D4752' : '#E5E7EB'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Weight (g)',
            color: isDarkMode ? '#9CA3AF' : undefined
          },
          ticks: {
            color: isDarkMode ? '#9CA3AF' : undefined
          },
          grid: {
            color: isDarkMode ? '#3D4752' : '#E5E7EB'
          },
          beginAtZero: false,
        }
      }
    };
  }, [weightRange, isDarkMode]);



  // Calculate the latest values from your data
  // 🔥 FIX: Find the latest entries that ACTUALLY have weight

  // Set the display values based on that found entry
  // const displayWeight = lastWeightEntry ? lastWeightEntry["Current Weight"] : "--";
  // const displayVelocity = lastWeightEntry ? lastWeightEntry["Gain/Loss in 24 hrs"] : "--";

  // ---------------------------------------------------------------------------
  // 🔥 DERIVED VALUES (Calculated automatically on every render)
  // ---------------------------------------------------------------------------

  // 1. Sort data to find the newest entry
  // (Make sure to use 'weightData' or 'temperatureData1' depending on your variable name)
  const validWeights = (manualEntries || []).filter((e: any) => e["Current Weight"]);

  const sortedWeights = [...validWeights].sort(
    (a: any, b: any) => new Date(b.time).getTime() - new Date(a.time).getTime()
  );

  // 2. Get the Latest & Previous Entries
  const lastWeightEntry = sortedWeights.length > 0 ? sortedWeights[0] : null;
  const previousWeightEntry = sortedWeights.length > 1 ? sortedWeights[1] : null;

  // 3. Get Current Weight
  const displayWeight = lastWeightEntry ? lastWeightEntry["Current Weight"] : "--";

  // 3.5 Calculate Growth Category (AGA/SGA/LGA)
  const growthCategory = useMemo(() => {
    if (!lastWeightEntry || !props.birth_date || !props.gestational_age) {
      console.log("🏥 [GrowthChart] growthCategory SKIPPED: missing data", {
        lastWeightEntry: !!lastWeightEntry,
        birth_date: props.birth_date,
        gestational_age: props.gestational_age
      });
      return null;
    }

    // Calculate PMA for the date of the weight measurement
    const measurementDate = new Date(lastWeightEntry.time);
    const pma = calculatePmaForFenton(props.birth_date, props.gestational_age, measurementDate);

    console.warn(`🏥 [GrowthChart] Calculating Growth Category: PMA=${pma}, Weight=${lastWeightEntry["Current Weight"]}, Gender=${props.gender}`);
    const cat = getGrowthCategory(lastWeightEntry["Current Weight"], pma, props.gender);
    console.warn(`🏥 [GrowthChart] Growth Category Result: ${cat}`);
    return cat;
  }, [lastWeightEntry, props.birth_date, props.gestational_age, props.gender]);

  // 4. Calculate Gain/Loss (Current - Previous)
  let displayVelocity: any = null;

  if (lastWeightEntry && previousWeightEntry) {
    const current = lastWeightEntry["Current Weight"];
    const prev = previousWeightEntry["Current Weight"];
    const currDate = new Date(lastWeightEntry.time);
    const prevDate = new Date(previousWeightEntry.time);
    const duration = Math.max(1, Math.abs(differenceInDays(currDate, prevDate)));
    const avgWeight = (current + prev) / 2;
    const velocity = ((current - prev) * 1000) / (avgWeight * duration);
    const sign = velocity > 0 ? "+" : "";

    displayVelocity = {
      value: `${sign}${velocity.toFixed(2)}`,
      unit: "g/kg/d",
      isPositive: velocity >= 0
    };
  }

  // Add these constants for reference line intervals
  // const PMA_INTERVAL = 2; // weeks
  // const LEN_INTERVAL = 2; // cm
  // const HC_INTERVAL = 2; // cm
  // const WT_INTERVAL = 500; // grams

  // Add this function to generate reference lines
  // const generateReferenceLines = () => {
  //   const lines = [];

  //   // 1. PMA reference lines (vertical)
  //   for (let pma = PMA_MIN; pma <= PMA_MAX; pma += PMA_INTERVAL) {
  //     const x = mapX(pma);
  //     lines.push(
  //       <line
  //         key={`pma-${pma}`}
  //         x1={x}
  //         x2={x}
  //         y1={Y0}
  //         y2={Y1}
  //         stroke="#e0e0e0"
  //         strokeWidth={1}
  //         strokeDasharray="3,3"
  //       />
  //     );

  //     // PMA labels at bottom
  //     lines.push(
  //       <text
  //         key={`pma-label-${pma}`}
  //         x={x}
  //         y={Y1 + 15}
  //         fontSize="10"
  //         textAnchor="middle"
  //         fill="#666"
  //       >
  //         {pma}
  //       </text>
  //     );
  //   }

  //   // 2. Length reference lines (horizontal)
  //   for (let len = LEN_MIN; len <= LEN_MAX; len += LEN_INTERVAL) {
  //     const y = mapY_length(len);
  //     lines.push(
  //       <line
  //         key={`len-${len}`}
  //         x1={X0}
  //         x2={X1}
  //         y1={y}
  //         y2={y}
  //         stroke="#87CEFA" // Light blue for length
  //         strokeWidth={0.5}
  //         strokeDasharray="2,2"
  //       />
  //     );

  //     // Length labels on left
  //     lines.push(
  //       <text
  //         key={`len-label-${len}`}
  //         x={X0 - 10}
  //         y={y}
  //         fontSize="9"
  //         textAnchor="end"
  //         fill="#666"
  //         alignmentBaseline="middle"
  //       >
  //         {len}
  //       </text>
  //     );
  //   }

  //   // 3. Head circumference reference lines (horizontal)
  //   for (let hc = HC_MIN; hc <= HC_MAX; hc += HC_INTERVAL) {
  //     const y = mapY_head(hc);
  //     lines.push(
  //       <line
  //         key={`hc-${hc}`}
  //         x1={X0}
  //         x2={X1}
  //         y1={y}
  //         y2={y}
  //         stroke="#98FB98" // Pale green for head circumference
  //         strokeWidth={0.5}
  //         strokeDasharray="2,2"
  //       />
  //     );

  //     // HC labels on left
  //     lines.push(
  //       <text
  //         key={`hc-label-${hc}`}
  //         x={X0 - 10}
  //         y={y}
  //         fontSize="9"
  //         textAnchor="end"
  //         fill="#666"
  //         alignmentBaseline="middle"
  //       >
  //         {hc}
  //       </text>
  //     );
  //   }

  //   // 4. Weight reference lines (horizontal)
  //   for (let wt = WT_MIN; wt <= WT_MAX; wt += WT_INTERVAL) {
  //     const y = mapY_weight(wt);
  //     lines.push(
  //       <line
  //         key={`wt-${wt}`}
  //         x1={X0}
  //         x2={X1}
  //         y1={y}
  //         y2={y}
  //         stroke="#FFB6C1" // Light pink for weight
  //         strokeWidth={0.5}
  //         strokeDasharray="2,2"
  //       />
  //     );

  //     // Weight labels on left (convert to kg for readability)
  //     lines.push(
  //       <text
  //         key={`wt-label-${wt}`}
  //         x={X0 - 10}
  //         y={y}
  //         fontSize="9"
  //         textAnchor="end"
  //         fill="#666"
  //         alignmentBaseline="middle"
  //       >
  //         {(wt / 1000).toFixed(1)}
  //       </text>
  //     );
  //   }

  //   return lines;
  // };

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
  const X0 = GRID_LEFT * scaleX + 22;
  const X1 = GRID_RIGHT * scaleX + 163;
  const Y0 = GRID_TOP * scaleY - 15;
  const Y1 = GRID_BOTTOM * scaleY - 114;


  const LEN_BOTTOM_IMG = GRID_TOP + 450;   // ~ 102 + 450 = 552 (image px)
  const HC_TOP_IMG = LEN_BOTTOM_IMG;       // 552
  const HC_BOTTOM_IMG = GRID_TOP + 1000;   // ~ 1102 (image px)
  const WT_TOP_IMG = HC_BOTTOM_IMG;        // 1102

  const LEN_Y_TOP = GRID_TOP * scaleY + 25;
  const LEN_Y_BOTTOM = LEN_BOTTOM_IMG * scaleY;

  const HC_Y_TOP = HC_TOP_IMG * scaleY - 120;
  const HC_Y_BOTTOM = HC_BOTTOM_IMG * scaleY - 265;

  const WT_Y_TOP = WT_TOP_IMG * scaleY - 350;
  const WT_Y_BOTTOM = GRID_BOTTOM * scaleY - 145;

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
      doc.setFillColor('200');
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
    const maxW = PAGE_W;
    const maxH = PAGE_H - HEADER_H;

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
      <Box display="flex" flexDirection={{ xs: 'column', lg: 'row' }} alignItems="flex-start" gap={4}>
        {/* left: chart area - Scrollable on mobile */}
        <Box
          sx={{
            width: { xs: '100%', lg: 'auto' },
            overflowX: 'auto', // Allow horizontal scroll for the chart on small screens
            display: 'flex',
            justifyContent: { xs: 'flex-start', lg: 'center' },
            pb: 2
          }}
        >
          <Box
            ref={containerRef}
            sx={{
              width: CHART_WIDTH,
              height: CHART_HEIGHT,
              position: "relative",
              // border: "1px solid #e6e6e6",
              background: "#fff",
              flexShrink: 0 // Prevent chart from shrinking
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
        </Box>

        {/* right: table and controls */}
        <Box mt={{ xs: 2, lg: 5 }} width={{ xs: '100%', lg: 'auto' }} flexGrow={0.8} >


          <Table size="small" >
            <TableHead sx={{ backgroundColor: '#868E961F', justifyContent: 'center' }}>
              <TableRow>
                <TableCell sx={{ color: 'black' }}>PMA (w)</TableCell>
                <TableCell sx={{ color: 'black' }}>Weight (g)</TableCell>
                <TableCell sx={{ color: 'black' }}>Length (cm)</TableCell>
                <TableCell sx={{ color: 'black' }}>Head C (cm)</TableCell>
                <TableCell sx={{ color: 'black' }}>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fentonEntries.map((e, idx) => (
                <TableRow key={idx} hover>
                  <TableCell sx={{ color: 'black' }}>
                    {e.pmaWeeks}
                  </TableCell>

                  <TableCell sx={{ color: 'black' }}>
                    {e.weight} g
                  </TableCell>

                  <TableCell sx={{ color: 'black' }}>
                    {e.length} cm
                  </TableCell>

                  <TableCell sx={{ color: 'black' }}>
                    {e.headC} cm
                  </TableCell>

                  <TableCell sx={{ color: 'black' }}>
                    {new Date(e.dateISO).toLocaleString()}

                  </TableCell>
                </TableRow>
              ))}
            </TableBody>

          </Table>
        </Box>
      </Box>

    );


  }, [fentonEntries])

  // ... all your logic is above here ...

  return (
    <Box sx={{ backgroundColor: isDarkMode ? theme.palette.background.default : '#F4F6F8', minHeight: '100vh', width: '100%', overflowX: 'hidden' }}>
      <Box sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
        {/* TITLE */}
        <Typography variant="h6" sx={{ color: isDarkMode ? theme.palette.text.primary : "#0F3B61", fontWeight: 600, mb: 2, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
          Growth Chart
        </Typography>

        <Paper elevation={0} sx={{ borderRadius: '8px', border: `1px solid ${isDarkMode ? theme.palette.divider : '#E0E0E0'}`, overflow: 'hidden', backgroundColor: isDarkMode ? theme.palette.background.paper : '#fff' }}>

          {/* TABS HEADER */}
          <Stack direction="row" sx={{ borderBottom: 0, borderColor: 'divider' }}>
            <Box
              onClick={() => handleTabChange(null, 0)}
              sx={{
                flex: 1,
                py: 1.5,
                textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: tabValue === 0 ? (isDarkMode ? 'rgba(88, 166, 255, 0.15)' : '#E3F2FD') : 'transparent',
                color: tabValue === 0 ? (isDarkMode ? '#58A6FF' : '#1976D2') : (isDarkMode ? theme.palette.text.secondary : '#666'),
                fontWeight: tabValue === 0 ? 600 : 500,
                fontSize: { xs: '13px', sm: '14px' },
                transition: 'all 0.2s',
                borderBottom: tabValue === 0 ? `2px solid ${isDarkMode ? '#58A6FF' : '#1976D2'}` : 'none',
                '&:hover': { backgroundColor: tabValue === 0 ? (isDarkMode ? 'rgba(88, 166, 255, 0.15)' : '#E3F2FD') : (isDarkMode ? theme.palette.action.hover : '#F5F5F5') }
              }}
            >
              Weight & BSL
            </Box>
            <Box
              onClick={() => handleTabChange(null, 1)}
              sx={{
                flex: 1,
                py: 1.5,
                textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: tabValue === 1 ? (isDarkMode ? 'rgba(88, 166, 255, 0.15)' : '#E3F2FD') : 'transparent',
                color: tabValue === 1 ? (isDarkMode ? '#58A6FF' : '#1976D2') : (isDarkMode ? theme.palette.text.secondary : '#666'),
                fontWeight: tabValue === 1 ? 600 : 500,
                fontSize: { xs: '13px', sm: '14px' },
                transition: 'all 0.2s',
                borderBottom: tabValue === 1 ? `2px solid ${isDarkMode ? '#58A6FF' : '#1976D2'}` : 'none',
                '&:hover': { backgroundColor: tabValue === 1 ? (isDarkMode ? 'rgba(88, 166, 255, 0.15)' : '#E3F2FD') : (isDarkMode ? theme.palette.action.hover : '#F5F5F5') }
              }}
            >
              Fenton Chart
            </Box>
          </Stack>

          {/* === TAB 1: WEIGHT & BSL === */}
          {tabValue === 0 && (
            <Box sx={{ p: { xs: 2, sm: 3 } }}>
              {/* Section Title */}
              <Typography variant="subtitle1" fontWeight={600} sx={{ color: isDarkMode ? theme.palette.text.primary : '#0F3B61', mb: 2, fontSize: { xs: '0.95rem', sm: '1rem' } }}>
                Weight & BSL
              </Typography>

              {/* Header Stats & Toolbar - Responsive Layout */}
              <Stack
                direction={{ xs: 'column', lg: 'row' }}
                spacing={{ xs: 3, lg: 0 }}
                justifyContent="space-between"
                alignItems="flex-start"
                sx={{ mb: 3, borderBottom: { xs: `1px solid ${isDarkMode ? theme.palette.divider : '#E0E0E0'}`, lg: 'none' }, pb: { xs: 2, lg: 0 } }}
              >
                {/* LEFT SIDE: Stats Cards */}
                <Stack direction="row" spacing={{ xs: 3, sm: 5 }} sx={{ width: { xs: '100%', lg: 'auto' }, flexWrap: 'wrap' }}>
                  {/* Current Weight */}
                  <Box>
                    <Typography variant="caption" sx={{ color: isDarkMode ? theme.palette.text.secondary : '#667085', display: 'block', fontWeight: 500, mb: 0.5 }}>
                      Current Weight
                    </Typography>
                    <Stack direction="row" alignItems="baseline" spacing={0.5}>
                      <Typography variant="h4" fontWeight={700} sx={{ color: isDarkMode ? '#58A6FF' : '#228BE6', fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                        {displayWeight || "--"}
                      </Typography>
                      <Typography component="span" variant="body1" sx={{ color: isDarkMode ? theme.palette.text.secondary : '#667085', fontWeight: 500 }}>
                        g
                      </Typography>
                    </Stack>
                  </Box>

                  {/* Gain/Loss */}
                  <Box>
                    <Typography variant="caption" sx={{ color: isDarkMode ? theme.palette.text.secondary : '#667085', display: 'block', fontWeight: 500, mb: 0.5 }}>
                      Weight Velocity
                    </Typography>
                    <Typography
                      variant="h4"
                      fontWeight={700}
                      sx={{
                        color: displayVelocity ? (displayVelocity.isPositive ? '#039855' : '#D92D20') : (isDarkMode ? theme.palette.text.secondary : '#667085'),
                        fontSize: { xs: '1.5rem', sm: '2rem' }
                      }}
                    >
                      {displayVelocity ? displayVelocity.value : "--"}
                      {displayVelocity && (
                        <Typography component="span" variant="body1" sx={{ color: isDarkMode ? theme.palette.text.secondary : '#667085', fontWeight: 500, ml: 0.5 }}>
                          {displayVelocity.unit}
                        </Typography>
                      )}
                    </Typography>
                  </Box>
                </Stack>

                {/* RIGHT SIDE: Toolbar & Filters */}
                <Box sx={{ width: { xs: '100%', lg: 'auto' }, display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', lg: 'flex-end' }, gap: 2 }}>

                  {/* Row 1: Buttons */}
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ width: '100%', justifyContent: { xs: 'flex-start', lg: 'flex-end' } }}>
                    {/* View Toggle */}
                    {/* View Toggle (Chart vs List) */}
                    <ToggleButtonGroup
                      value={viewMode}
                      exclusive
                      onChange={handleViewModeChange}
                      size="small"
                      sx={{
                        height: 36,
                        bgcolor: isDarkMode ? theme.palette.background.paper : 'white',
                        '& .MuiToggleButton-root': {
                          border: `1px solid ${isDarkMode ? theme.palette.divider : '#E0E0E0'}`,
                          color: isDarkMode ? theme.palette.text.secondary : '#666',
                          backgroundColor: isDarkMode ? theme.palette.background.paper : '#fff',
                          px: 1.5,
                          transition: 'all 0.2s ease',

                          // 🔥 ACTIVE STATE: Light Blue Bg + Solid Blue Icon
                          '&.Mui-selected': {
                            backgroundColor: isDarkMode ? 'rgba(88, 166, 255, 0.15) !important' : 'rgba(34, 139, 230, 0.1) !important',
                            color: isDarkMode ? '#58A6FF !important' : '#228BE6 !important',
                            borderColor: isDarkMode ? '#58A6FF !important' : '#228BE6 !important',
                            '&:hover': {
                              backgroundColor: isDarkMode ? 'rgba(88, 166, 255, 0.25) !important' : 'rgba(34, 139, 230, 0.2) !important'
                            }
                          },

                          // HOVER STATE (Unselected)
                          '&:hover': {
                            backgroundColor: isDarkMode ? theme.palette.action.hover : '#F5F5F5'
                          }
                        }
                      }}
                    >
                      <ToggleButton value="chart">
                        <ShowChartIcon fontSize="small" />
                      </ToggleButton>
                      <ToggleButton value="list">
                        <TableRowsIcon fontSize="small" />
                      </ToggleButton>
                    </ToggleButtonGroup>

                    {/* Date Range Button */}
                    <Button
                      variant="outlined"
                      onClick={handleDateClick}
                      startIcon={<CalendarTodayIcon fontSize="small" />}
                      sx={{
                        height: 36,
                        color: isDarkMode ? theme.palette.text.primary : '#344054',
                        borderColor: isDarkMode ? theme.palette.divider : '#D0D5DD',
                        backgroundColor: isDarkMode ? theme.palette.background.paper : 'white',
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '13px',
                        px: 1.5,
                        minWidth: 'auto',
                        "&:hover": { backgroundColor: isDarkMode ? theme.palette.action.hover : "#F9FAFB", borderColor: isDarkMode ? theme.palette.divider : "#D0D5DD" }
                      }}
                    >
                      <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                        {`${format(graphStartDate || new Date(), 'd MMM')} - ${format(graphEndDate || new Date(), 'd MMM')}`}
                      </Box>
                      <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                        {format(graphStartDate || new Date(), 'd MMM')}
                      </Box>
                    </Button>

                    {/* Download Button */}
                    <IconButton
                      onClick={handleDownloadPdf}
                      sx={{
                        border: `1px solid ${isDarkMode ? theme.palette.divider : '#E0E0E0'}`,
                        borderRadius: '4px',
                        height: 36, width: 36,
                        backgroundColor: isDarkMode ? theme.palette.background.paper : '#fff',
                        '&:hover': { backgroundColor: isDarkMode ? theme.palette.action.hover : '#F5F5F5' }
                      }}
                    >
                      <DownloadIcon fontSize="small" sx={{ color: isDarkMode ? theme.palette.text.secondary : '#666' }} />
                    </IconButton>

                    {/* Entry Button */}
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => {
                        setDate(new Date());
                        setaddnewbutton(true);
                      }}
                      sx={{
                        textTransform: 'none',
                        backgroundColor: isDarkMode ? 'rgba(88, 166, 255, 0.15)' : 'rgba(34, 139, 230, 0.1)',
                        color: isDarkMode ? '#58A6FF' : '#228BE6',
                        boxShadow: 'none',
                        fontWeight: 600,
                        '&:hover': {
                          backgroundColor: isDarkMode ? 'rgba(88, 166, 255, 0.25)' : 'rgba(34, 139, 230, 0.2)',
                          boxShadow: 'none'
                        }
                      }}
                    >
                      Entry
                    </Button>
                  </Stack>

                  {/* Row 2: 1D / 7D Filter - REMOVED GLOBAL TOGGLE */}
                  {/* <ToggleButtonGroup ... /> - DELETED */}
                </Box>
              </Stack>

              {/* Hidden Popover */}
              <Popover
                open={openDateRange}
                anchorEl={anchorEl}
                onClose={handleDateClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{ sx: { p: 2, width: 300, borderRadius: 2, backgroundColor: isDarkMode ? theme.palette.background.paper : undefined, border: isDarkMode ? `1px solid ${theme.palette.divider}` : undefined } }}
              >
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <Stack spacing={2}>
                    <Typography variant="subtitle2" fontWeight={600} color={isDarkMode ? 'text.primary' : undefined}>Select Date Range</Typography>
                    <DatePicker
                      label="Start Date"
                      value={graphStartDate}
                      onChange={(val) => val && setGraphStartDate(val)}
                      format="dd/MM/yyyy"
                      slotProps={{ textField: { size: 'small' } }}
                    />
                    <DatePicker
                      label="End Date"
                      value={graphEndDate}
                      onChange={(val) => val && setGraphEndDate(val)}
                      minDate={graphStartDate || undefined}
                      maxDate={graphStartDate ? addDays(new Date(graphStartDate), 7) : undefined}
                      format="dd/MM/yyyy"
                      slotProps={{ textField: { size: 'small' } }}
                    />
                  </Stack>
                </LocalizationProvider>
              </Popover>

              {/* 🔥 GRAPH / TABLE CONTENT AREA - FIXED RESPONSIVENESS */}
              <Box sx={{ minHeight: 400, backgroundColor: isDarkMode ? theme.palette.background.paper : '#fff', borderRadius: '8px', p: 0 }}>
                {loading ? (
                  <Stack alignItems="center" justifyContent="center" height="400px">
                    <CircularProgress />
                  </Stack>
                ) : (
                  viewMode === 'chart' ? (
                    /* === CHART VIEW === */
                    <Grid container spacing={3}>
                      {/* Weight Chart */}
                      <Grid item xs={12} lg={6}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: isDarkMode ? theme.palette.text.primary : undefined }}>Weight Trend</Typography>
                            {growthCategory && (
                              <Chip
                                label={growthCategory}
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: '10px',
                                  fontWeight: 700,
                                  borderRadius: '4px',
                                  backgroundColor:
                                    growthCategory === 'AGA' ? (isDarkMode ? '#064E3B' : '#DCFCE7') :
                                      growthCategory === 'SGA' ? (isDarkMode ? '#713F12' : '#FEF9C3') :
                                        (isDarkMode ? '#7F1D1D' : '#FEE2E2'),
                                  color:
                                    growthCategory === 'AGA' ? (isDarkMode ? '#4ADE80' : '#166534') :
                                      growthCategory === 'SGA' ? (isDarkMode ? '#FACC15' : '#854D0E') :
                                        (isDarkMode ? '#F87171' : '#991B1B'),
                                  border: `1px solid ${growthCategory === 'AGA' ? (isDarkMode ? '#065F46' : '#BBF7D0') :
                                    growthCategory === 'SGA' ? (isDarkMode ? '#854D0E' : '#FEF08A') :
                                      (isDarkMode ? '#991B1B' : '#FECACA')
                                    }`,
                                }}
                              />
                            )}
                          </Stack>
                          <ToggleButtonGroup
                            size="small"
                            value={activeWeightFilter}
                            exclusive
                            onChange={handleWeightFilter}
                            sx={{ height: 24, bgcolor: 'background.paper' }}
                          >
                            <ToggleButton value="1D" sx={{ fontSize: '10px', px: 1, py: 0.5 }}>1D</ToggleButton>
                            <ToggleButton value="7D" sx={{ fontSize: '10px', px: 1, py: 0.5 }}>7D</ToggleButton>
                          </ToggleButtonGroup>
                        </Stack>

                        {/* 🔥 FIX: Removed minWidth to prevent overflow */}
                        <Box sx={{ width: '100%', height: { xs: '300px', md: '350px' } }}>
                          <Line
                            data={weightDataConfig}
                            options={{ ...weightOptions, maintainAspectRatio: false }}
                          />
                        </Box>
                      </Grid>
                      {/* BSL Chart */}
                      <Grid item xs={12} lg={6}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: isDarkMode ? theme.palette.text.primary : undefined }}>Glucose (BSL) Trend</Typography>
                          <ToggleButtonGroup
                            size="small"
                            value={activeBslFilter}
                            exclusive
                            onChange={handleBslFilter}
                            sx={{ height: 24, bgcolor: 'background.paper' }}
                          >
                            <ToggleButton value="1D" sx={{ fontSize: '10px', px: 1, py: 0.5 }}>1D</ToggleButton>
                            <ToggleButton value="7D" sx={{ fontSize: '10px', px: 1, py: 0.5 }}>7D</ToggleButton>
                          </ToggleButtonGroup>
                        </Stack>
                        {/* 🔥 FIX: Removed minWidth to prevent overflow */}
                        <Box sx={{ width: '100%', height: { xs: '300px', md: '350px' } }}>
                          <Line
                            data={bslDataConfig}
                            options={{ ...(bslOptions as any), maintainAspectRatio: false }}
                            plugins={[clinicalZonesPlugin]}
                          />
                        </Box>

                        {/* Legend - Wraps on small screens */}
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                          <Stack
                            direction="row"
                            spacing={2}
                            flexWrap="wrap"
                            useFlexGap
                            justifyContent="center"
                            sx={{ bgcolor: isDarkMode ? theme.palette.background.default : '#F9FAFB', px: 2, py: 1, borderRadius: '20px', border: `1px solid ${isDarkMode ? theme.palette.divider : '#EAECF0'}` }}
                          >
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#F59E0B' }} />
                              <Typography variant="caption" fontWeight={700} color={isDarkMode ? 'text.primary' : '#1D2939'}>Hypo &lt;45</Typography>
                            </Stack>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#e2b059ff' }} />
                              <Typography variant="caption" fontWeight={700} color={isDarkMode ? 'text.primary' : '#1D2939'}>Hypo Borderline 45-70</Typography>
                            </Stack>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#10B981' }} />
                              <Typography variant="caption" fontWeight={700} color={isDarkMode ? 'text.primary' : '#1D2939'}>Stable 70-150</Typography>
                            </Stack>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#e76767ff' }} />
                              <Typography variant="caption" fontWeight={700} color={isDarkMode ? 'text.primary' : '#1D2939'}>Hyper Borderline 150-200</Typography>
                            </Stack>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#d91a1aff' }} />
                              <Typography variant="caption" fontWeight={700} color={isDarkMode ? 'text.primary' : '#1D2939'}>Hyper &gt;200</Typography>
                            </Stack>
                          </Stack>
                        </Box>
                      </Grid>
                    </Grid>
                  ) : (
                    /* === TABLE VIEW === */
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      {/* ======================= WEIGHT TABLE ======================= */}
                      <Grid item xs={12} lg={6}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              color: isDarkMode ? theme.palette.text.primary : '#344054',
                              fontWeight: 600,
                              fontSize: '14px'
                            }}
                          >
                            Weight Table
                          </Typography>
                          <ToggleButtonGroup
                            value={activeWeightFilter}
                            exclusive
                            onChange={handleWeightFilter}
                            size="small"
                            sx={{
                              height: 28,
                              '& .MuiToggleButton-root': {
                                fontSize: '0.75rem',
                                padding: '4px 10px',
                                textTransform: 'none',
                                fontWeight: 600,
                                borderColor: isDarkMode ? theme.palette.divider : '#D0D5DD',
                                color: isDarkMode ? theme.palette.text.secondary : '#344054',
                                '&.Mui-selected': {
                                  backgroundColor: isDarkMode ? theme.palette.primary.dark : '#F9FAFB',
                                  color: isDarkMode ? theme.palette.primary.contrastText : '#182230',
                                  borderColor: isDarkMode ? theme.palette.primary.dark : '#D0D5DD',
                                  '&:hover': {
                                    backgroundColor: isDarkMode ? theme.palette.primary.main : '#F3F4F6'
                                  }
                                }
                              }
                            }}
                          >
                            <ToggleButton value="1D">1D</ToggleButton>
                            <ToggleButton value="7D">7D</ToggleButton>
                          </ToggleButtonGroup>
                        </Stack>
                        <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${isDarkMode ? theme.palette.divider : '#EAECF0'}`, borderRadius: '8px', bgcolor: isDarkMode ? theme.palette.background.paper : '#FFFFFF' }}>
                          <Table size="small">
                            <TableHead sx={{ bgcolor: isDarkMode ? theme.palette.action.hover : '#F9FAFB' }}>
                              <TableRow>
                                <TableCell sx={{ color: isDarkMode ? theme.palette.text.secondary : '#475467', fontWeight: 700, fontSize: '12px' }}>Date</TableCell>
                                <TableCell sx={{ color: isDarkMode ? theme.palette.text.secondary : '#475467', fontWeight: 700, fontSize: '12px' }}>Time</TableCell>
                                <TableCell sx={{ color: isDarkMode ? theme.palette.text.secondary : '#475467', fontWeight: 700, fontSize: '12px' }}>Weight (g)</TableCell>
                                <TableCell align="center" sx={{ color: isDarkMode ? theme.palette.text.secondary : '#475467', fontWeight: 700, fontSize: '12px' }}>User</TableCell>
                                <TableCell sx={{ width: '40px' }} /> {/* Empty header for the 3-dots column */}
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {[...filteredWeightList]
                                .sort((a: any, b: any) => new Date(b.time).getTime() - new Date(a.time).getTime())
                                .map((row: any, index: number, arr: any[]) => {
                                  const currentWeight = row["Current Weight"];
                                  const prevRow = arr[index + 1];
                                  const prevWeight = prevRow ? prevRow["Current Weight"] : null;

                                  // 🔥 Calculate Growth Category (AGA/SGA/LGA)
                                  let pma = row["Post-menstrual Age (PMA)"];
                                  if (!pma && props.birth_date && props.gestational_age) {
                                    pma = calculatePmaForFenton(props.birth_date, props.gestational_age, new Date(row.time));
                                  }
                                  const category = getGrowthCategory(currentWeight, pma, props.gender);

                                  return (
                                    <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                      <TableCell sx={{ color: isDarkMode ? theme.palette.text.secondary : '#344054', fontSize: '13px', fontWeight: 500 }}>{format(new Date(row.time), 'dd-MM-yy')}</TableCell>
                                      <TableCell sx={{ color: isDarkMode ? theme.palette.text.primary : '#101828', fontWeight: 600, fontSize: '13px' }}>{format(new Date(row.time), 'hh:mm a')}</TableCell>
                                      <TableCell sx={{ color: isDarkMode ? theme.palette.text.primary : '#101828', fontWeight: 700, fontSize: '14px' }}>
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                          <span>
                                            {currentWeight}
                                            {prevWeight && (
                                              (() => {
                                                const currDate = new Date(row.time);
                                                const prevDate = new Date(prevRow.time);
                                                const duration = Math.max(1, Math.abs(differenceInDays(currDate, prevDate)));
                                                const avgWeight = (currentWeight + prevWeight) / 2;
                                                const velocity = ((currentWeight - prevWeight) * 1000) / (avgWeight * duration);
                                                const vStr = `${velocity > 0 ? '+' : ''}${velocity.toFixed(1)} g/kg/d`;

                                                return (
                                                  <span style={{ color: velocity >= 0 ? '#10B981' : '#F04438', fontSize: '12px', fontWeight: 600, marginLeft: '6px' }}>
                                                    ({vStr})
                                                  </span>
                                                );
                                              })()
                                            )}
                                          </span>
                                          {category && (
                                            <Chip
                                              label={category}
                                              size="small"
                                              sx={{
                                                height: 18,
                                                fontSize: '9px',
                                                fontWeight: 700,
                                                borderRadius: '4px',
                                                padding: '0 4px',
                                                backgroundColor:
                                                  category === 'AGA' ? (isDarkMode ? '#064E3B' : '#DCFCE7') :
                                                    category === 'SGA' ? (isDarkMode ? '#713F12' : '#FEF9C3') :
                                                      (isDarkMode ? '#7F1D1D' : '#FEE2E2'),
                                                color:
                                                  category === 'AGA' ? (isDarkMode ? '#4ADE80' : '#166534') :
                                                    category === 'SGA' ? (isDarkMode ? '#FACC15' : '#854D0E') :
                                                      (isDarkMode ? '#F87171' : '#991B1B'),
                                                border: `1px solid ${category === 'AGA' ? (isDarkMode ? '#065F46' : '#BBF7D0') :
                                                  category === 'SGA' ? (isDarkMode ? '#854D0E' : '#FEF08A') :
                                                    (isDarkMode ? '#991B1B' : '#FECACA')
                                                  }`,
                                              }}
                                            />
                                          )}
                                        </Stack>
                                      </TableCell>

                                      {/* 🔥 1. USER COLUMN WITH TOOLTIP */}
                                      <TableCell align="center">
                                        <MuiTooltip
                                          title={row.user || "Unknown User"}
                                          arrow
                                          placement="top"
                                          enterTouchDelay={0}
                                          leaveTouchDelay={2000}
                                        >
                                          <PersonOutlineIcon sx={{ color: isDarkMode ? theme.palette.text.secondary : '#98A2B3', fontSize: 20, cursor: 'pointer' }} />
                                        </MuiTooltip>
                                      </TableCell>

                                      {/* 🔥 2. ACTION MENU (THREE DOTS) */}
                                      <TableCell align="right" padding="none">
                                        <IconButton onClick={(e) => handleOpenMenu(e, row, 'weight')} size="small">
                                          <MoreVertIcon fontSize="small" sx={{ color: isDarkMode ? theme.palette.text.secondary : '#98A2B3' }} />
                                        </IconButton>
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              {filteredWeightList.length === 0 && (<TableRow><TableCell colSpan={5} align="center" sx={{ color: isDarkMode ? theme.palette.text.secondary : '#667085', py: 3 }}>No weight data found</TableCell></TableRow>)}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Grid>

                      {/* ======================= BSL TABLE ======================= */}
                      <Grid item xs={12} lg={6}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                          <Typography
                            variant="subtitle2"
                            sx={{ mb: 1, color: isDarkMode ? theme.palette.text.primary : '#344054', fontWeight: 600, fontSize: '14px' }}
                          >
                            BSL Table
                          </Typography>
                          <ToggleButtonGroup
                            value={activeBslFilter}
                            exclusive
                            onChange={handleBslFilter}
                            size="small"
                            sx={{
                              height: 28,
                              '& .MuiToggleButton-root': {
                                fontSize: '0.75rem',
                                padding: '4px 10px',
                                textTransform: 'none',
                                fontWeight: 600,
                                borderColor: isDarkMode ? theme.palette.divider : '#D0D5DD',
                                color: isDarkMode ? theme.palette.text.secondary : '#344054',
                                '&.Mui-selected': {
                                  backgroundColor: isDarkMode ? theme.palette.primary.dark : '#F9FAFB',
                                  color: isDarkMode ? theme.palette.primary.contrastText : '#182230',
                                  borderColor: isDarkMode ? theme.palette.primary.dark : '#D0D5DD',
                                  '&:hover': {
                                    backgroundColor: isDarkMode ? theme.palette.primary.main : '#F3F4F6'
                                  }
                                }
                              }
                            }}
                          >
                            <ToggleButton value="1D">1D</ToggleButton>
                            <ToggleButton value="7D">7D</ToggleButton>
                          </ToggleButtonGroup>
                        </Stack>
                        <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${isDarkMode ? theme.palette.divider : '#EAECF0'}`, borderRadius: '8px', bgcolor: isDarkMode ? theme.palette.background.paper : '#FFFFFF' }}>
                          <Table size="small">
                            <TableHead sx={{ bgcolor: isDarkMode ? theme.palette.action.hover : '#F9FAFB' }}>
                              <TableRow>
                                <TableCell sx={{ color: isDarkMode ? theme.palette.text.secondary : '#475467', fontWeight: 700, fontSize: '12px' }}>Date</TableCell>
                                <TableCell sx={{ color: isDarkMode ? theme.palette.text.secondary : '#475467', fontWeight: 700, fontSize: '12px' }}>Time</TableCell>
                                <TableCell sx={{ color: isDarkMode ? theme.palette.text.secondary : '#475467', fontWeight: 700, fontSize: '12px' }}>BSL (mg/dL)</TableCell>
                                <TableCell align="center" sx={{ color: isDarkMode ? theme.palette.text.secondary : '#475467', fontWeight: 700, fontSize: '12px' }}>User</TableCell>
                                <TableCell sx={{ width: '40px' }} />
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {[...filteredBslList]
                                .sort((a: any, b: any) => new Date(b.time).getTime() - new Date(a.time).getTime())
                                .map((row: any, index: number) => {
                                  const val = row["BSL"];
                                  let status = "(Stable)"; let color = "#10B981";
                                  if (val < 45) { status = "(Hypo)"; color = "#F59E0B"; }
                                  else if (val >= 45 && val < 70) { status = "(Hypo Borderline)"; color = "#ebbd36"; }
                                  else if (val > 150 && val <= 200) { status = "(Hyper Borderline)"; color = "#F87171"; }
                                  else if (val > 200) { status = "(Hyper)"; color = "#EF4444"; }

                                  return (
                                    <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                      <TableCell sx={{ color: isDarkMode ? theme.palette.text.secondary : '#344054', fontSize: '13px', fontWeight: 500 }}>{format(new Date(row.time), 'dd-MM-yy')}</TableCell>
                                      <TableCell sx={{ color: isDarkMode ? theme.palette.text.primary : '#101828', fontWeight: 600, fontSize: '13px' }}>{format(new Date(row.time), 'hh:mm a')}</TableCell>
                                      <TableCell sx={{ color: isDarkMode ? theme.palette.text.primary : '#101828', fontWeight: 700, fontSize: '14px' }}>
                                        {val} <span style={{ color: color, fontSize: '12px', fontWeight: 600, marginLeft: '6px' }}>{status}</span>
                                      </TableCell>

                                      {/* 🔥 1. USER COLUMN WITH TOOLTIP */}
                                      <TableCell align="center">
                                        <MuiTooltip
                                          title={row.user || "Unknown User"}
                                          arrow
                                          placement="top"
                                          enterTouchDelay={0}
                                          leaveTouchDelay={2000}
                                        >
                                          <PersonOutlineIcon sx={{ color: isDarkMode ? theme.palette.text.secondary : '#98A2B3', fontSize: 20, cursor: 'pointer' }} />
                                        </MuiTooltip>
                                      </TableCell>

                                      {/* 🔥 2. ACTION MENU (THREE DOTS) */}
                                      <TableCell align="right" padding="none">
                                        <IconButton onClick={(e) => handleOpenMenu(e, row, 'bsl')} size="small">
                                          <MoreVertIcon fontSize="small" sx={{ color: isDarkMode ? theme.palette.text.secondary : '#98A2B3' }} />
                                        </IconButton>
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              {filteredBslList.length === 0 && (<TableRow><TableCell colSpan={5} align="center" sx={{ color: isDarkMode ? theme.palette.text.secondary : '#667085', py: 3 }}>No BSL data found</TableCell></TableRow>)}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Grid>

                      {/* 🔥 3. THE POPUP MENU COMPONENT (Must be included) */}
                      <Menu
                        anchorEl={menuAnchor}
                        open={Boolean(menuAnchor)}
                        onClose={handleCloseMenu}
                        PaperProps={{ elevation: 3, sx: { borderRadius: 2, minWidth: 120, backgroundColor: isDarkMode ? theme.palette.background.paper : undefined, border: isDarkMode ? `1px solid ${theme.palette.divider}` : undefined } }}
                      >
                        <MenuItem onClick={handleDeleteClick} sx={{ color: '#EF4444', fontSize: '14px' }}>
                          <ListItemIcon>
                            <DeleteIcon fontSize="small" sx={{ color: '#EF4444' }} />
                          </ListItemIcon>
                          Delete
                        </MenuItem>
                      </Menu>
                    </Grid>
                  )
                )}
              </Box>
            </Box>
          )}

          {/* === TAB 2: FENTON CHART === */}
          {tabValue === 1 && (
            <Box sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                spacing={{ xs: 2, sm: 0 }}
                sx={{ mb: 3 }}
              >
                <Typography variant="subtitle1" fontWeight={600} sx={{ color: isDarkMode ? theme.palette.text.primary : "#0F3B61" }}>
                  Fenton Chart
                </Typography>
                <Stack direction="row" spacing={1}>
                  <IconButton
                    onClick={handleDownload}
                    sx={{
                      border: `1px solid ${isDarkMode ? theme.palette.divider : '#E0E0E0'}`,
                      borderRadius: '6px',
                      padding: '6px',
                      backgroundColor: isDarkMode ? theme.palette.background.paper : '#fff',
                      '&:hover': { backgroundColor: isDarkMode ? theme.palette.action.hover : '#F5F5F5' }
                    }}
                  >
                    <DownloadIcon fontSize="small" sx={{ color: isDarkMode ? theme.palette.text.secondary : '#666' }} />
                  </IconButton>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => setaddnewbutton1(true)}
                    sx={{
                      textTransform: 'none',
                      borderColor: isDarkMode ? theme.palette.divider : '#E0E0E0',
                      color: isDarkMode ? '#58A6FF' : '#0D6EFD',
                      backgroundColor: isDarkMode ? theme.palette.background.paper : '#fff',
                      fontSize: { xs: '12px', sm: '13px' },
                      '&:hover': { borderColor: isDarkMode ? '#58A6FF' : '#0D6EFD', backgroundColor: isDarkMode ? theme.palette.action.hover : '#F5F5F5' }
                    }}
                  >
                    Weekly Entry
                  </Button>
                </Stack>
              </Stack>

              {/* THE FENTON GRAPH AREA */}
              <Box sx={{
                minHeight: 500,
                backgroundColor: isDarkMode ? theme.palette.background.paper : '#fff',
                borderRadius: '8px',
                pb: 2,
                overflow: 'hidden' // Ensure no double scrolls
              }}>
                {/* Responsive Fenton: Full width, auto height */}
                <Box sx={{ width: '100%', height: 'auto', p: 2 }}>
                  {fentonGraph}
                </Box>
              </Box>
            </Box>
          )}

        </Paper>

        {/* Clinical Disclaimer */}
        <Typography
          variant="caption"
          sx={{
            mt: 2,
            display: 'block',
            textAlign: 'center',
            color: isDarkMode ? theme.palette.text.secondary : '#667085',
            fontStyle: 'italic',
            fontSize: '11px',
            lineHeight: 1.5
          }}
        >
          Values and labels are provided for reference and tracking; all clinical decisions must be made by the care team.
        </Typography>
      </Box>

      {/* DIALOGS/SNACKBARS */}

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleCloseConfirm}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            borderRadius: 2,
            p: 1,
            backgroundColor: isDarkMode ? theme.palette.background.paper : '#fff',
            border: isDarkMode ? `1px solid ${theme.palette.divider}` : undefined
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, color: isDarkMode ? theme.palette.text.primary : '#111827' }}>
          Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: isDarkMode ? theme.palette.text.secondary : '#374151' }}>
            Are you sure you want to delete this entry? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseConfirm} sx={{ color: isDarkMode ? theme.palette.text.secondary : '#6B7280', textTransform: 'none', fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            variant="contained"
            color="error"
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack}
        autoHideDuration={5000}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        onClose={() => setSnack(false)}
      >
        <Alert variant="filled" severity={snackSucc ? "success" : "error"}>
          {snackSucc ? "Operation Completed Successfully" : "Operation Failed"}
        </Alert>
      </Snackbar>

      {addValues()}
      {addWeekly()}
    </Box>
  );
};