import {
    Box, Typography, Button, Dialog, DialogContent, DialogTitle, DialogActions,
    TextField, MenuItem, Chip, ToggleButton, ToggleButtonGroup, Paper, IconButton, InputAdornment, useTheme
} from "@mui/material";
import { useState, useEffect } from "react";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import { alpha } from "@material-ui/core";
import { useAuth0 } from "@auth0/auth0-react";

interface DiagnosticOrderDialogProps {
    open: boolean;
    onClose: () => void;
    onOrderSuccess?: () => void;
    patientResourceId: string;
    isDarkMode?: boolean;
    onReturnDraftOrders?: (orders: any[]) => void;
}

export const DiagnosticOrderDialog = ({
    open,
    onClose,
    onOrderSuccess,
    patientResourceId,
    isDarkMode = false,
    onReturnDraftOrders
}: DiagnosticOrderDialogProps) => {
    const theme = useTheme();
    const { user } = useAuth0();

    // Available tests state
    const [availableTests, setAvailableTests] = useState<string[]>(() => {
        const saved = localStorage.getItem("availableTests");
        return saved ? JSON.parse(saved) : [
            "CBC",
            "Serum Electrolytes",
            "CRP",
            "Differential Count",
            "Total Bilirubin",
        ];
    });

    // Persist Available Tests
    useEffect(() => {
        localStorage.setItem("availableTests", JSON.stringify(availableTests));
    }, [availableTests]);

    const [testSearch, setTestSearch] = useState("");
    const [selectedTests, setSelectedTests] = useState<string[]>([]);
    const [testConfigs, setTestConfigs] = useState<Record<string, {
        specimen: string;
        priority: string;
        frequency: string;
    }>>({});
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const isExpanded = selectedTests.length > 0;

    const toggleTest = (testName: string) => {
        setSelectedTests(prev => {
            if (prev.includes(testName)) {
                // remove
                setTestConfigs(cfg => {
                    const copy = { ...cfg };
                    delete copy[testName];
                    return copy;
                });
                return prev.filter(t => t !== testName);
            } else {
                // add
                setTestConfigs(cfg => ({
                    ...cfg,
                    [testName]: {
                        specimen: "Venous",
                        priority: "Routine",
                        frequency: "Once",
                    },
                }));
                return [...prev, testName];
            }
        });
    };

    const handlePlaceOrder = async () => {
        if (selectedTests.length === 0 || !patientResourceId) {
            setError('Missing selected tests or patient ID');
            return;
        }

        setError(null);
        setIsSaving(true);

        try {
            // Create a separate DiagnosticReport for each test
            const draftOrders = selectedTests.map(test => {
                const config = testConfigs[test] || {};

                return {
                    resourceType: "DiagnosticReport",
                    status: "registered",
                    code: {
                        coding: [{
                            system: "http://loinc.org",
                            code: "11502-2",
                            display: "Laboratory report"
                        }],
                        text: test // Individual test name
                    },
                    subject: {
                        reference: `Patient/${patientResourceId}`
                    },
                    effectiveDateTime: new Date().toISOString(),
                    issued: new Date().toISOString(),
                    performer: [{ display: user?.name || "Dr. System" }],
                    extension: [
                        { url: "specimen-type", valueString: config.specimen || 'N/A' },
                        { url: "priority", valueString: config.priority || 'Routine' },
                        { url: "source", valueString: "clinical-notes" }  // Mark as from clinical notes
                    ],
                    conclusion: `Specimen: ${config.specimen || 'N/A'}, Priority: ${config.priority || 'Routine'}, Freq: ${config.frequency || 'Once'}`
                };
            });

            // If a handler for draft orders is provided, return them and skip saving
            if (onOrderSuccess && (onOrderSuccess as any).length > 0) {
                // Check if the parent passed a function expecting arguments (draft mode)
                // This is a bit hacky, cleaner to have explicit prop.
                // Let's use a new prop `onReturnDraftOrders` in the interface
            }

            // Using the explicit prop logic (will be added to interface)
            if (onReturnDraftOrders) {
                onReturnDraftOrders(draftOrders);
                onClose();
                setIsSaving(false);
                return;
            }

            const promises = draftOrders.map(order => {
                return fetch(`${import.meta.env.VITE_FHIRAPI_URL}/DiagnosticReport`, {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: "Basic " + btoa("fhiruser:change-password"),
                    },
                    body: JSON.stringify(order)
                });
            });

            // Wait for all reports to save
            const responses = await Promise.all(promises);

            // Check if any response failed
            const failed = responses.find(r => !r.ok);
            if (failed) throw new Error("One or more tests failed to save.");

            // Success - reset and close
            setSelectedTests([]);
            setTestConfigs({});
            setTestSearch("");

            if (onOrderSuccess) {
                onOrderSuccess();
            }

            onClose();

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setIsSaving(false);
        }
    };

    const handleClose = () => {
        // Reset state when closing
        setSelectedTests([]);
        setTestConfigs({});
        setTestSearch("");
        setError(null);
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth="sm"
            PaperProps={{
                sx: {
                    borderRadius: "16px",
                    backgroundColor: isDarkMode ? theme.palette.background.paper : "#FFFFFF",
                    transition: "max-height 0.35s ease",
                    maxHeight: isExpanded ? "90vh" : "45vh",
                    overflow: "hidden",
                },
            }}
        >
            <DialogTitle
                sx={{
                    color: isDarkMode ? theme.palette.text.primary : "#000000ff",
                    fontWeight: "bold",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                }}
            >
                Diagnostic Report
                <IconButton onClick={handleClose} sx={{ color: isDarkMode ? theme.palette.text.secondary : "#0F3B61" }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent
                sx={{
                    p: 3,
                    overflowY: isExpanded ? "auto" : "hidden",
                    transition: "all 0.3s ease",
                }}
            >
                <Box sx={{ width: '100%' }}>
                    <Typography
                        variant="subtitle1"
                        sx={{ color: isDarkMode ? theme.palette.text.secondary : "#858585", mb: 1 }}
                    >
                        Select Tests
                    </Typography>

                    {/* Test Search & Custom Add */}
                    <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search or Add Custom Test"
                            value={testSearch}
                            sx={{
                                "& .MuiInputBase-input": { color: isDarkMode ? theme.palette.text.primary : "#000" },
                                backgroundColor: isDarkMode ? theme.palette.background.default : "#F9FAFB",
                                "& .MuiOutlinedInput-notchedOutline": { borderColor: isDarkMode ? theme.palette.divider : "rgba(0,0,0,0.23)" },
                            }}
                            onChange={(e) => setTestSearch(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: isDarkMode ? theme.palette.text.disabled : "#dadcdfff" }} fontSize="small" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <Button
                            variant="outlined"
                            disabled={!testSearch.trim()}
                            onClick={() => {
                                // If it's not in the list, add it
                                if (!availableTests.some(t => t.toLowerCase() === testSearch.toLowerCase())) {
                                    setAvailableTests(prev => [...prev, testSearch]);
                                    toggleTest(testSearch); // Select it
                                    setTestSearch(""); // Clear
                                }
                            }}
                        >
                            Add
                        </Button>
                    </Box>

                    {/* Chips */}
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
                        {availableTests
                            .filter(test =>
                                test.toLowerCase().includes(testSearch.toLowerCase())
                            )
                            .map(test => (
                                <Chip
                                    key={test}
                                    label={test}
                                    clickable
                                    onClick={() => toggleTest(test)}
                                    sx={{
                                        borderRadius: "16px",
                                        bgcolor: isDarkMode ? alpha("#58A6FF", 0.2) : alpha("#228BE6", 0.15),
                                        color: isDarkMode ? "#58A6FF" : "#228BE6",
                                        fontWeight: 500,
                                        "& .MuiChip-deleteIcon": {
                                            color: isDarkMode ? alpha("#58A6FF", 0.7) : alpha("#228BE6", 0.7),
                                            "&:hover": { color: isDarkMode ? "#58A6FF" : "#228BE6" }
                                        },
                                        "&:hover": {
                                            bgcolor: isDarkMode ? alpha("#58A6FF", 0.3) : alpha("#228BE6", 0.25),
                                        },
                                    }}
                                />
                            ))}
                    </Box>

                    {/* Selected Tests Configuration */}
                    <Box sx={{ mt: 3 }}>
                        {selectedTests.map(test => (
                            <Paper
                                key={test}
                                variant="outlined"
                                sx={{
                                    p: 2,
                                    mb: 2,
                                    borderRadius: "12px",
                                    backgroundColor: isDarkMode ? theme.palette.background.default : "#FFF",
                                    "& .MuiInputBase-input": { color: isDarkMode ? theme.palette.text.primary : "#000" },
                                    "& .MuiInputBase-Label": { color: isDarkMode ? theme.palette.text.primary : "#000" },
                                    border: `1px solid ${isDarkMode ? theme.palette.divider : "#b8b8b8ff"}`
                                }}
                            >
                                {/* Header */}
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Typography fontWeight={600} color={isDarkMode ? theme.palette.text.primary : "black"}>{test}</Typography>
                                    <IconButton size="small" onClick={() => toggleTest(test)}>
                                        <RemoveCircleOutlineIcon color="error" />
                                    </IconButton>
                                </Box>

                                {/* Specimen */}
                                <Box display={"flex"}>
                                    <Box mt={2}>
                                        <Typography variant="caption" color="grey">
                                            Specimen
                                        </Typography>
                                        <ToggleButtonGroup
                                            exclusive
                                            value={testConfigs[test]?.specimen}
                                            onChange={(_, newValue) => {
                                                if (!newValue) return;
                                                setTestConfigs(prev => ({
                                                    ...prev,
                                                    [test]: { ...prev[test], specimen: newValue },
                                                }));
                                            }}
                                        >
                                            {["Venous", "Heel Stick", "Arterial"].map((opt) => (
                                                <ToggleButton
                                                    key={opt}
                                                    value={opt}
                                                    sx={{
                                                        textTransform: "none",
                                                        fontWeight: 600,
                                                        color: "#7A8899",
                                                        width: "71px",
                                                        height: "48px",
                                                        border: "1px solid #D0D7E2",
                                                        borderRadius: "8px",
                                                        "&.Mui-selected": {
                                                            backgroundColor: alpha("#228BE6", 0.1),
                                                            color: "#228BE6",
                                                        },
                                                    }}
                                                >
                                                    {opt}
                                                </ToggleButton>
                                            ))}
                                        </ToggleButtonGroup>
                                    </Box>

                                    {/* Priority */}
                                    <Box mt={2}>
                                        <Typography variant="caption" color="grey">
                                            Priority
                                        </Typography>
                                        <ToggleButtonGroup
                                            exclusive
                                            value={testConfigs[test]?.priority}
                                            onChange={(_, newValue) => {
                                                if (!newValue) return;
                                                setTestConfigs(prev => ({
                                                    ...prev,
                                                    [test]: { ...prev[test], priority: newValue },
                                                }));
                                            }}
                                        >
                                            {["Routine", "Emergency"].map((opt) => (
                                                <ToggleButton
                                                    key={opt}
                                                    value={opt}
                                                    sx={{
                                                        textTransform: "none",
                                                        fontWeight: 600,
                                                        color: "#7A8899",
                                                        width: "83px",
                                                        height: "48px",
                                                        border: "1px solid #D0D7E2",
                                                        borderRadius: "8px",
                                                        "&.Mui-selected": {
                                                            backgroundColor: alpha("#228BE6", 0.1),
                                                            color: "#228BE6",
                                                        },
                                                    }}
                                                >
                                                    {opt}
                                                </ToggleButton>
                                            ))}
                                        </ToggleButtonGroup>
                                    </Box>

                                    {/* Frequency */}
                                    <Box mt={1}>
                                        <Typography variant="caption" color="grey">
                                            Fqy
                                        </Typography>
                                        <TextField
                                            select
                                            size="small"
                                            value={testConfigs[test]?.frequency}
                                            onChange={(e) =>
                                                setTestConfigs(prev => ({
                                                    ...prev,
                                                    [test]: { ...prev[test], frequency: e.target.value },
                                                }))
                                            }
                                            sx={{ mt: 1, height: "45px", width: 120, border: "1px solid  #D0D7E2", borderRadius: 2, color: "#7A8899" }}
                                        >
                                            {["Once", "Daily", "Weekly"].map(opt => (
                                                <MenuItem key={opt} value={opt}>
                                                    {opt}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </Box>
                                </Box>
                            </Paper>
                        ))}
                    </Box>

                    {/* Error Display */}
                    {error && (
                        <Typography color="error" sx={{ mt: 2 }}>
                            {error}
                        </Typography>
                    )}
                </Box>
            </DialogContent>

            {/* Footer Actions */}
            <DialogActions sx={{ p: 2, justifyContent: 'flex-end', borderTop: `1px solid ${isDarkMode ? theme.palette.divider : '#E5E7EB'}` }}>
                <Box display="flex" gap={2}>
                    <Button
                        sx={{ color: 'white', backgroundColor: '#228BE6' }}
                        variant="contained"
                        disabled={selectedTests.length === 0}
                        onClick={handleClose}
                    >
                        Back
                    </Button>

                    <Button
                        variant="contained"
                        sx={{ backgroundColor: "#228BE6", color: "#fff" }}
                        onClick={handlePlaceOrder}
                        disabled={selectedTests.length === 0 || isSaving}
                    >
                        {isSaving ? "Ordering..." : "Order"}
                    </Button>
                </Box>
            </DialogActions>
        </Dialog>
    );
};
