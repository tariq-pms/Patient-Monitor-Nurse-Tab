import {
    Box, Typography, Button, Dialog, DialogContent, Table, TableHead, TableRow, TableCell,
    TableBody, TextField, IconButton, Paper, useTheme, Divider
} from "@mui/material";
import { useState, useEffect } from "react";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import { DeleteOutline, ArrowUpward, ArrowDownward, AddCircleOutline } from "@mui/icons-material";

// ===== TEMPLATES =====

const CBC_REPORT_TEMPLATE = [
    { test: "WBC Count", value: "", unit: "×10³/µL", referenceRange: "", isEditing: false },
    { test: "Absolute Lymphocyte Count", value: "", unit: "×10³/µL", referenceRange: "", isEditing: false },
    { test: "Mid-Sized cells / Monocytes", value: "", unit: "×10³/µL", referenceRange: "", isEditing: false },
    { test: "Lymphocytes", value: "", unit: "%", referenceRange: "", isEditing: false },
    { test: "Hemoglobin (Hb)", value: "", unit: "g/dL", referenceRange: "", isEditing: false },
    { test: "Hematocrit", value: "", unit: "%", referenceRange: "", isEditing: false },
    { test: "Mean Corpuscular Volume", value: "", unit: "fL", referenceRange: "", isEditing: false },
    { test: "Mean Corpuscular Hemoglobin", value: "", unit: "pg", referenceRange: "", isEditing: false },
    { test: "Mean Corpuscular Hemoglobin Concentration", value: "", unit: "g/dL", referenceRange: "", isEditing: false },
    { test: "Red Cell Distribution Width (CV)", value: "", unit: "%", referenceRange: "", isEditing: false },
    { test: "Red Cell Distribution Width (SD)", value: "", unit: "fL", referenceRange: "", isEditing: false },
    { test: "Platelet Count", value: "", unit: "×10³/µL", referenceRange: "", isEditing: false },
    { test: "Mean Platelet Volume", value: "", unit: "fL", referenceRange: "", isEditing: false },
    { test: "RBC Count", value: "", unit: "million/µL", referenceRange: "3.90 - 5.90", isEditing: false },
    { test: "Neutrophils", value: "", unit: "%", referenceRange: "45 – 75", isEditing: false },
];

const CRP_REPORT_TEMPLATE = [
    {
        test: "C-Reactive Protein - Quantitative",
        value: "",
        unit: "mg/L",
        referenceRange: "0-6 or < 10",
        isEditing: false,
    },
];

const DIFFERENTIAL_COUNT_TEMPLATE = [
    { test: "Neutrophils", value: "", unit: "%", referenceRange: "14.0 – 54.6", isEditing: false },
    { test: "Lymphocytes", value: "", unit: "%", referenceRange: "36-45", isEditing: false },
    { test: "Monocytes", value: "", unit: "%", referenceRange: "4.3 – 18.3", isEditing: false },
    { test: "Eosinophils", value: "", unit: "%", referenceRange: "0-2", isEditing: false },
    { test: "Platelet Count", value: "", unit: "lakhs/cumm", referenceRange: "1.5 - 4.5", isEditing: false },
];

const TOTAL_BILIRUBIN_TEMPLATE = [
    { test: "Total Bilirubin", value: "", unit: "mg/dL", referenceRange: "", isEditing: false },
];

const ELECTROLYTES_REPORT_TEMPLATE = [
    { test: "Sodium (Na+)", value: "", unit: "mmol/L", referenceRange: "", isEditing: false },
    { test: "Potassium (K+)", value: "", unit: "mmol/L", referenceRange: "", isEditing: false },
    { test: "Chloride (Cl-)", value: "", unit: "mmol/L", referenceRange: "", isEditing: false },
    { test: "Total Calcium (Ca2+)", value: "", unit: "mmol/L", referenceRange: "", isEditing: false },
    { test: "Ionized Calcium (Ca2+)", value: "", unit: "mmol/L", referenceRange: "", isEditing: false },
    { test: "Magnesium (Mg2+)", value: "", unit: "mmol/L", referenceRange: "", isEditing: false },
    { test: "Phosphorus (PO43-)", value: "", unit: "mmol/L", referenceRange: "", isEditing: false },
];

// ===== DYNAMIC REFERENCE RANGE FUNCTIONS =====

const getDynamicCBCRanges = (pnaDays: number, gender: string = "unknown", configSource: any) => {
    const template = JSON.parse(JSON.stringify(CBC_REPORT_TEMPLATE));

    return template.map((item: any) => {
        let config = configSource?.[item.test];

        // Initial mapping fallbacks based on template names vs constant keys
        if (!config && item.test === "RBC Count") config = configSource?.["Total RBC Count (T-RBC)"];

        if (config) {
            // 1. Filter by Max Days to find valid age buckets
            const ageCandidates = config.filter((c: any) => pnaDays <= c.maxDays && (c.minDays === undefined || pnaDays >= c.minDays));

            if (ageCandidates.length > 0) {
                // Find the tightest maxDays constraint (smallest maxDays that is >= pnaDays)
                ageCandidates.sort((a: any, b: any) => a.maxDays - b.maxDays);
                const bestMaxDays = ageCandidates[0].maxDays;

                // Filter specifically for this maxDays bucket
                const bucket = ageCandidates.filter((c: any) => c.maxDays === bestMaxDays);

                // 2. Find Best Sex Match
                let match = bucket.find((c: any) => c.sex?.toLowerCase() === gender.toLowerCase());
                if (!match) match = bucket.find((c: any) => c.sex?.toLowerCase() === "unknown");
                if (!match) match = bucket.find((c: any) => !c.sex);
                if (!match) match = bucket[0];

                if (match) {
                    item.referenceRange = match.range;
                }
            } else {
                // Fallback to the largest available MaxDays if no constraint met
                const sorted = [...config].sort((a: any, b: any) => a.maxDays - b.maxDays);
                const maxAvailable = sorted[sorted.length - 1];
                item.referenceRange = maxAvailable.range;
            }
        }
        return item;
    });
};

const getDynamicElectrolyteRanges = (pnaDays: number, configSource: any) => {
    const template = JSON.parse(JSON.stringify(ELECTROLYTES_REPORT_TEMPLATE));

    return template.map((item: any) => {
        const config = configSource?.[item.test];

        if (config) {
            const match = config.find((c: any) => pnaDays <= c.maxDays && (c.minDays === undefined || pnaDays >= c.minDays));
            if (match) {
                item.referenceRange = match.range;
            } else {
                item.referenceRange = config[config.length - 1].range;
            }
        }
        return item;
    });
};

const getDynamicBilirubinRanges = (pnaDays: number, configSource: any) => {
    const template = JSON.parse(JSON.stringify(TOTAL_BILIRUBIN_TEMPLATE));
    // configSource is an array here
    const match = configSource?.find((c: any) => pnaDays <= c.maxDays && (c.minDays === undefined || pnaDays >= c.minDays));

    if (template[0]) {
        if (match) {
            template[0].referenceRange = match.range;
        } else if (configSource && configSource.length > 0) {
            template[0].referenceRange = configSource[configSource.length - 1].range;
        }
    }
    return template;
};

const getDynamicCRPRanges = (_pnaDays: number, configSource: any) => {
    const template = JSON.parse(JSON.stringify(CRP_REPORT_TEMPLATE));
    // CRP usually doesn't vary much by age, but we'll check config anyway
    if (template[0] && configSource?.["C-Reactive Protein - Quantitative"]) {
        const config = configSource["C-Reactive Protein - Quantitative"];
        if (config && config.length > 0) {
            template[0].referenceRange = config[0].range;
        }
    }
    return template;
};

const getDynamicDifferentialRanges = (pnaDays: number, configSource: any) => {
    const template = JSON.parse(JSON.stringify(DIFFERENTIAL_COUNT_TEMPLATE));

    return template.map((item: any) => {
        const config = configSource?.[item.test];

        if (config) {
            const match = config.find((c: any) => pnaDays <= c.maxDays && (c.minDays === undefined || pnaDays >= c.minDays));
            if (match) {
                item.referenceRange = match.range;
            } else {
                item.referenceRange = config[config.length - 1].range;
            }
        }
        return item;
    });
};

interface ResultRow {
    test: string;
    value: string;
    unit: string;
    referenceRange: string;
    isEditing: boolean;
}

interface ResultEntryDialogProps {
    open: boolean;
    onClose: () => void;
    onResultSuccess?: () => void;
    order: any; // The full DiagnosticReport FHIR resource
    patientName: string;
    patientAgeDays?: number; // Patient age in days for dynamic reference ranges
    patientGender?: string; // Patient gender for gender-specific ranges
    isDarkMode?: boolean;
}

export const ResultEntryDialog = ({
    open,
    onClose,
    onResultSuccess,
    order,
    patientName,
    patientAgeDays = 0,
    patientGender = "unknown",
    isDarkMode = false
}: ResultEntryDialogProps) => {
    const theme = useTheme();
    const [results, setResults] = useState<ResultRow[]>([]);
    const [newItem, setNewItem] = useState<ResultRow>({ test: "", value: "", unit: "", referenceRange: "", isEditing: true });
    const [isSaving, setIsSaving] = useState(false);

    // Initialize results based on order type with dynamic reference ranges
    useEffect(() => {
        if (!order || !open) return;

        // Load reference range config from localStorage
        const savedConfig = localStorage.getItem("refRangeConfig");
        const refRangeConfig = savedConfig ? JSON.parse(savedConfig) : null;

        const testName = order.code?.text || "";
        const lowerTest = testName.toLowerCase();

        let template: ResultRow[] = [];

        if (lowerTest.includes("cbc")) {
            template = refRangeConfig?.CBC
                ? getDynamicCBCRanges(patientAgeDays, patientGender, refRangeConfig.CBC)
                : JSON.parse(JSON.stringify(CBC_REPORT_TEMPLATE));
        } else if (lowerTest.includes("differential")) {
            template = refRangeConfig?.["Differential Count"]
                ? getDynamicDifferentialRanges(patientAgeDays, refRangeConfig["Differential Count"])
                : JSON.parse(JSON.stringify(DIFFERENTIAL_COUNT_TEMPLATE));
        } else if (lowerTest.includes("crp")) {
            template = refRangeConfig?.CRP
                ? getDynamicCRPRanges(patientAgeDays, refRangeConfig.CRP)
                : JSON.parse(JSON.stringify(CRP_REPORT_TEMPLATE));
        } else if (lowerTest.includes("electrolyte")) {
            template = refRangeConfig?.Electrolytes
                ? getDynamicElectrolyteRanges(patientAgeDays, refRangeConfig.Electrolytes)
                : JSON.parse(JSON.stringify(ELECTROLYTES_REPORT_TEMPLATE));
        } else if (lowerTest.includes("bilirubin")) {
            template = refRangeConfig?.Bilirubin
                ? getDynamicBilirubinRanges(patientAgeDays, refRangeConfig.Bilirubin)
                : JSON.parse(JSON.stringify(TOTAL_BILIRUBIN_TEMPLATE));
        } else {
            // Custom order - check if learned config exists
            const learnedConfig = refRangeConfig?.[testName];
            if (learnedConfig) {
                // Build template from learned config
                template = Object.keys(learnedConfig).map(paramName => {
                    const paramConfig = learnedConfig[paramName];
                    const unit = paramConfig[0]?.unit || "";
                    const range = paramConfig[0]?.range || "";
                    return {
                        test: paramName,
                        value: "",
                        unit: unit,
                        referenceRange: range,
                        isEditing: false
                    };
                });
            } else {
                // Empty template for truly new custom orders
                template = [{ test: "", value: "", unit: "", referenceRange: "", isEditing: true }];
            }
        }

        setResults(template);
    }, [order, open, patientAgeDays, patientGender]);

    const handleAddItem = () => {
        if (!newItem.test) return;
        setResults([...results, { ...newItem, isEditing: false }]);
        setNewItem({ test: "", value: "", unit: "", referenceRange: "", isEditing: true });
    };

    const isOutOfRange = (value: string, rangeStr: string) => {
        if (!value || !rangeStr) return false;
        const match = rangeStr.match(/(\d+\.?\d*)\s*[-–]\s*(\d+\.?\d*)/);
        if (!match) return false;
        const numVal = parseFloat(value);
        const min = parseFloat(match[1]);
        const max = parseFloat(match[2]);
        return numVal < min || numVal > max;
    };

    const handleSaveResults = async () => {
        if (!order) return;

        setIsSaving(true);

        try {
            const FHIR_URL = import.meta.env.VITE_FHIRAPI_URL;
            const FHIR_AUTH = "Basic " + btoa("fhiruser:change-password");

            // Fetch existing report
            const res = await fetch(`${FHIR_URL}/DiagnosticReport/${order.id}`, {
                headers: { Authorization: FHIR_AUTH }
            });
            const report = await res.json();

            // Format results like Dashboard does - only entries with values
            const resultsString = results
                .filter(r => r.value) // Only include items with values
                .map(r => `${r.test}: ${r.value} ${r.unit} (Ref: ${r.referenceRange})`)
                .join('\n');

            // Match Dashboard's exact format
            const updatedReport = {
                ...report,
                status: "final",
                conclusion: `RESULTS:\n${resultsString}\n\n${report.conclusion || ''}\n[Verified By: Lab Technician]`,
                issued: new Date().toISOString(),
            };

            // PUT update
            await fetch(`${FHIR_URL}/DiagnosticReport/${order.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: FHIR_AUTH
                },
                body: JSON.stringify(updatedReport)
            });

            if (onResultSuccess) {
                onResultSuccess();
            }

            onClose();

        } catch (err) {
            console.error("Error saving results:", err);
            alert("Failed to save results");
        } finally {
            setIsSaving(false);
        }
    };

    const handleClose = () => {
        setResults([]);
        setNewItem({ test: "", value: "", unit: "", referenceRange: "", isEditing: true });
        onClose();
    };

    if (!order) return null;

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: "16px",
                    p: 0,
                    backgroundColor: isDarkMode ? theme.palette.background.paper : "#FFFFFF",
                    boxShadow: "0px 10px 30px rgba(0,0,0,0.08)",
                    display: "flex",
                    flexDirection: "column",
                    maxHeight: "90vh",
                },
            }}
        >
            {/* Header */}
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                p={3}
                borderBottom={`1px solid ${isDarkMode ? theme.palette.divider : "#E5E7EB"}`}
            >
                <Typography fontWeight={600} color={isDarkMode ? theme.palette.text.primary : "black"}>
                    B/O : {patientName} - {order.code?.text || "Report"}
                </Typography>

                <IconButton onClick={handleClose}>
                    <CloseIcon sx={{ color: isDarkMode ? theme.palette.text.secondary : "#232324ff" }} />
                </IconButton>
            </Box>

            <DialogContent sx={{ p: 3, overflowY: "auto" }}>
                {/* Meta Info */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        borderRadius: "12px",
                        backgroundColor: isDarkMode ? theme.palette.background.default : "#ffffffff",
                        border: `1px solid ${isDarkMode ? theme.palette.divider : "#E5E7EB"}`,
                        mb: 2
                    }}
                >
                    <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={2}>
                        <Typography variant="caption" color={isDarkMode ? theme.palette.text.primary : "black"}>
                            <b>Collection</b><br />
                            {order.effectiveDateTime || new Date().toLocaleString()}
                        </Typography>
                        <Typography variant="caption" color={isDarkMode ? theme.palette.text.primary : "black"}>
                            <b>Received</b><br />
                            {order.meta?.lastUpdated ? new Date(order.meta.lastUpdated).toLocaleString() : new Date().toLocaleString()}
                        </Typography>
                        <Typography variant="caption" color={isDarkMode ? theme.palette.text.primary : "black"}>
                            <b>Report</b><br />
                            {new Date().toLocaleString()}
                        </Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={2}>
                        <Typography variant="caption" color={isDarkMode ? theme.palette.text.primary : "black"}>
                            <b>Reported by</b><br />Lab User
                        </Typography>
                        <Typography variant="caption" color={isDarkMode ? theme.palette.text.primary : "black"}>
                            <b>Verified by</b><br />Lab Technician
                        </Typography>
                    </Box>
                </Paper>

                {/* Result Table */}
                <Paper
                    elevation={0}
                    sx={{
                        borderRadius: "12px",
                        p: 2,
                        border: `1px solid ${isDarkMode ? theme.palette.divider : "#E5E7EB"}`,
                        backgroundColor: isDarkMode ? theme.palette.background.default : "#fff"
                    }}
                >
                    <Table size="small" sx={{ borderCollapse: "separate", borderSpacing: "0 8px" }}>
                        <TableHead sx={{ backgroundColor: isDarkMode ? theme.palette.background.paper : "#F8FAFC", "& th": { borderBottom: "none" } }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700, color: isDarkMode ? theme.palette.text.primary : "#000" }}>Result Entry</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: isDarkMode ? theme.palette.text.primary : "#000" }}>Value</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: isDarkMode ? theme.palette.text.primary : "#000" }}>Unit</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: isDarkMode ? theme.palette.text.primary : "#000" }}>Reference Range</TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody sx={{ backgroundColor: isDarkMode ? theme.palette.background.default : "#fff" }}>
                            {results.map((row, index) => (
                                <TableRow
                                    key={index}
                                    sx={{
                                        backgroundColor: isDarkMode ? theme.palette.background.paper : "#FFFFFF",
                                        borderRadius: "8px",
                                        "&:hover": { backgroundColor: isDarkMode ? theme.palette.action.hover : "#FAFAFA" },
                                    }}
                                >
                                    {/* Test Name */}
                                    <TableCell sx={{
                                        fontWeight: 500,
                                        color: isDarkMode ? theme.palette.text.primary : "#000",
                                        backgroundColor: isDarkMode ? theme.palette.background.paper : "#FFFFFF",
                                        borderTopLeftRadius: "12px",
                                        borderBottomLeftRadius: "12px",
                                        border: `1px solid ${isDarkMode ? theme.palette.divider : "#E5E7EB"}`,
                                        borderRight: "none",
                                    }}>
                                        {row.isEditing ? (
                                            <TextField
                                                variant="standard"
                                                fullWidth
                                                value={row.test}
                                                onChange={(e) => {
                                                    const updated = [...results];
                                                    updated[index].test = e.target.value;
                                                    setResults(updated);
                                                }}
                                                sx={{ "& .MuiInputBase-input": { fontSize: "0.875rem", fontWeight: 500, color: isDarkMode ? theme.palette.text.primary : "#000" } }}
                                            />
                                        ) : (
                                            row.test
                                        )}
                                    </TableCell>

                                    {/* Value */}
                                    <TableCell sx={{
                                        backgroundColor: isDarkMode ? theme.palette.background.paper : "#FFFFFF",
                                        borderTop: `1px solid ${isDarkMode ? theme.palette.divider : "#E5E7EB"}`,
                                        borderBottom: `1px solid ${isDarkMode ? theme.palette.divider : "#E5E7EB"}`,
                                    }}>
                                        <TextField
                                            variant="standard"
                                            value={row.value}
                                            autoFocus={index === 0}
                                            onChange={(e) => {
                                                const updated = [...results];
                                                updated[index].value = e.target.value;
                                                setResults(updated);
                                            }}
                                            sx={{
                                                width: 80,
                                                "& .MuiInputBase-input": {
                                                    color: isOutOfRange(row.value, row.referenceRange) ? "#DC2626" : (isDarkMode ? theme.palette.text.primary : "#111827"),
                                                    fontSize: "0.875rem",
                                                    fontWeight: isOutOfRange(row.value, row.referenceRange) ? 700 : 600
                                                },
                                                "& .MuiInput-underline:after": { borderBottomColor: isDarkMode ? "#58A6FF" : "#228BE6" },
                                            }}
                                        />
                                    </TableCell>

                                    {/* Unit */}
                                    <TableCell sx={{
                                        color: isDarkMode ? theme.palette.text.secondary : "#6B7280",
                                        backgroundColor: isDarkMode ? theme.palette.background.paper : "#FFFFFF",
                                        borderTop: `1px solid ${isDarkMode ? theme.palette.divider : "#E5E7EB"}`,
                                        borderBottom: `1px solid ${isDarkMode ? theme.palette.divider : "#E5E7EB"}`,
                                    }}>
                                        {row.isEditing ? (
                                            <TextField
                                                variant="standard"
                                                fullWidth
                                                value={row.unit}
                                                onChange={(e) => {
                                                    const updated = [...results];
                                                    updated[index].unit = e.target.value;
                                                    setResults(updated);
                                                }}
                                                sx={{ "& .MuiInputBase-input": { fontSize: "0.875rem", color: isDarkMode ? theme.palette.text.primary : "#000" } }}
                                            />
                                        ) : (
                                            row.unit
                                        )}
                                    </TableCell>

                                    {/* Reference Range */}
                                    <TableCell sx={{
                                        color: isDarkMode ? theme.palette.text.secondary : "#6B7280",
                                        backgroundColor: isDarkMode ? theme.palette.background.paper : "#FFFFFF",
                                        borderTop: `1px solid ${isDarkMode ? theme.palette.divider : "#E5E7EB"}`,
                                        borderBottom: `1px solid ${isDarkMode ? theme.palette.divider : "#E5E7EB"}`,
                                    }}>
                                        {row.isEditing ? (
                                            <TextField
                                                variant="standard"
                                                fullWidth
                                                value={row.referenceRange}
                                                onChange={(e) => {
                                                    const updated = [...results];
                                                    updated[index].referenceRange = e.target.value;
                                                    setResults(updated);
                                                }}
                                                sx={{ "& .MuiInputBase-input": { fontSize: "0.875rem", color: isDarkMode ? theme.palette.text.primary : "#000" } }}
                                            />
                                        ) : (
                                            row.referenceRange
                                        )}
                                    </TableCell>

                                    {/* Actions */}
                                    <TableCell sx={{
                                        backgroundColor: isDarkMode ? theme.palette.background.paper : "#FFFFFF",
                                        borderTopRightRadius: "12px",
                                        borderBottomRightRadius: "12px",
                                        border: `1px solid ${isDarkMode ? theme.palette.divider : "#E5E7EB"}`,
                                        borderLeft: "none",
                                    }}>
                                        <Box display="flex" gap={0.5}>
                                            {/* Move Up */}
                                            <IconButton
                                                size="small"
                                                disabled={index === 0}
                                                onClick={() => {
                                                    if (index === 0) return;
                                                    const updated = [...results];
                                                    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
                                                    setResults(updated);
                                                }}
                                            >
                                                <ArrowUpward fontSize="small" sx={{ color: index === 0 ? "#E5E7EB" : "#9CA3AF" }} />
                                            </IconButton>

                                            {/* Move Down */}
                                            <IconButton
                                                size="small"
                                                disabled={index === results.length - 1}
                                                onClick={() => {
                                                    if (index === results.length - 1) return;
                                                    const updated = [...results];
                                                    [updated[index + 1], updated[index]] = [updated[index], updated[index + 1]];
                                                    setResults(updated);
                                                }}
                                            >
                                                <ArrowDownward fontSize="small" sx={{ color: index === results.length - 1 ? "#E5E7EB" : "#9CA3AF" }} />
                                            </IconButton>

                                            {/* Edit */}
                                            <IconButton
                                                size="small"
                                                onClick={() => {
                                                    const updated = [...results];
                                                    updated[index].isEditing = !updated[index].isEditing;
                                                    setResults(updated);
                                                }}
                                            >
                                                {row.isEditing ? (
                                                    <CheckIcon fontSize="small" sx={{ color: "#10B981" }} />
                                                ) : (
                                                    <EditIcon fontSize="small" sx={{ color: "#228BE6" }} />
                                                )}
                                            </IconButton>

                                            {/* Delete */}
                                            <IconButton
                                                size="small"
                                                onClick={() => {
                                                    const updated = [...results];
                                                    updated.splice(index, 1);
                                                    setResults(updated);
                                                }}
                                            >
                                                <DeleteOutline fontSize="small" sx={{ color: "#EF4444" }} />
                                            </IconButton>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}

                            {/* Add other */}
                            <TableRow>
                                <TableCell sx={{
                                    fontWeight: 500,
                                    color: isDarkMode ? theme.palette.text.primary : "#000",
                                    backgroundColor: isDarkMode ? theme.palette.background.paper : "#FFFFFF",
                                    borderTopLeftRadius: "12px",
                                    borderBottomLeftRadius: "12px",
                                    border: `1px solid ${isDarkMode ? theme.palette.divider : "#E5E7EB"}`,
                                    borderRight: "none",
                                }}>
                                    <TextField
                                        variant="standard"
                                        placeholder="Add Other Items"
                                        fullWidth
                                        value={newItem.test}
                                        onChange={(e) => setNewItem({ ...newItem, test: e.target.value })}
                                        sx={{
                                            width: 140,
                                            "& .MuiInputBase-input": { color: isDarkMode ? theme.palette.text.primary : "#111827", fontSize: "0.875rem" },
                                            "& .MuiInput-underline:after": { borderBottomColor: isDarkMode ? "#58A6FF" : "#228BE6" },
                                        }}
                                    />
                                </TableCell>
                                <TableCell sx={{
                                    color: isDarkMode ? theme.palette.text.secondary : "#6B7280",
                                    backgroundColor: isDarkMode ? theme.palette.background.paper : "#FFFFFF",
                                    borderTop: `1px solid ${isDarkMode ? theme.palette.divider : "#E5E7EB"}`,
                                    borderBottom: `1px solid ${isDarkMode ? theme.palette.divider : "#E5E7EB"}`,
                                }}>
                                    <TextField
                                        variant="standard"
                                        placeholder="Value"
                                        fullWidth
                                        value={newItem.value}
                                        onChange={(e) => setNewItem({ ...newItem, value: e.target.value })}
                                        sx={{
                                            width: 50,
                                            "& .MuiInputBase-input": { color: isDarkMode ? theme.palette.text.primary : "#111827", fontSize: "0.875rem" },
                                            "& .MuiInput-underline:after": { borderBottomColor: isDarkMode ? "#58A6FF" : "#228BE6" },
                                        }}
                                    />
                                </TableCell>
                                <TableCell sx={{
                                    color: isDarkMode ? theme.palette.text.secondary : "#6B7280",
                                    backgroundColor: isDarkMode ? theme.palette.background.paper : "#FFFFFF",
                                    borderTop: `1px solid ${isDarkMode ? theme.palette.divider : "#E5E7EB"}`,
                                    borderBottom: `1px solid ${isDarkMode ? theme.palette.divider : "#E5E7EB"}`,
                                }}>
                                    <TextField
                                        variant="standard"
                                        placeholder="Unit"
                                        fullWidth
                                        value={newItem.unit}
                                        onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                                        sx={{
                                            width: 50,
                                            "& .MuiInputBase-input": { color: isDarkMode ? theme.palette.text.primary : "#111827", fontSize: "0.875rem" },
                                            "& .MuiInput-underline:after": { borderBottomColor: isDarkMode ? "#58A6FF" : "#228BE6" },
                                        }}
                                    />
                                </TableCell>
                                <TableCell sx={{
                                    color: isDarkMode ? theme.palette.text.secondary : "#6B7280",
                                    backgroundColor: isDarkMode ? theme.palette.background.paper : "#FFFFFF",
                                    borderTop: `1px solid ${isDarkMode ? theme.palette.divider : "#E5E7EB"}`,
                                    borderBottom: `1px solid ${isDarkMode ? theme.palette.divider : "#E5E7EB"}`,
                                }}>
                                    <TextField
                                        variant="standard"
                                        placeholder="Ref Range"
                                        fullWidth
                                        value={newItem.referenceRange}
                                        onChange={(e) => setNewItem({ ...newItem, referenceRange: e.target.value })}
                                        sx={{
                                            width: 90,
                                            "& .MuiInputBase-input": { color: isDarkMode ? theme.palette.text.primary : "#111827", fontSize: "0.875rem" },
                                            "& .MuiInput-underline:after": { borderBottomColor: isDarkMode ? "#58A6FF" : "#228BE6" },
                                        }}
                                    />
                                </TableCell>
                                <TableCell sx={{
                                    backgroundColor: isDarkMode ? theme.palette.background.paper : "#FFFFFF",
                                    borderTopRightRadius: "12px",
                                    borderBottomRightRadius: "12px",
                                    border: `1px solid ${isDarkMode ? theme.palette.divider : "#E5E7EB"}`,
                                    borderLeft: "none",
                                }}>
                                    <IconButton onClick={handleAddItem} disabled={!newItem.test}>
                                        <AddCircleOutline sx={{ color: newItem.test ? (isDarkMode ? "#58A6FF" : "#4338CA") : "#9CA3AF" }} />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </Paper>
            </DialogContent>

            {/* Footer */}
            <Box
                mt={3}
                pt={2}
                px={3}
                pb={3}
                borderTop={`1px solid ${isDarkMode ? theme.palette.divider : "#E5E7EB"}`}
                display="flex"
                gap={2}
            >
                <Button
                    fullWidth
                    variant="outlined"
                    onClick={handleClose}
                    sx={{ textTransform: "none" }}
                >
                    Cancel
                </Button>
                <Button
                    fullWidth
                    variant="contained"
                    disabled={isSaving}
                    sx={{ flex: 1, textTransform: "none", backgroundColor: "#228BE6", color: "#fff", borderRadius: "10px" }}
                    onClick={handleSaveResults}
                >
                    {isSaving ? "Saving..." : "Proceed →"}
                </Button>
            </Box>
        </Dialog>
    );
};
