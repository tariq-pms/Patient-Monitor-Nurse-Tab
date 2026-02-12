import {
    Box, Typography, Button, Dialog, TextField, Chip, ToggleButton, ToggleButtonGroup,
    IconButton, Divider, Checkbox, useTheme
} from "@mui/material";
import { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { alpha } from "@material-ui/core";

interface SampleCollectionDialogProps {
    open: boolean;
    onClose: () => void;
    onCollectionSuccess?: () => void;
    reportId: string;
    isDarkMode?: boolean;
}

export const SampleCollectionDialog = ({
    open,
    onClose,
    onCollectionSuccess,
    reportId,
    isDarkMode = false
}: SampleCollectionDialogProps) => {
    const theme = useTheme();

    const [patientVerified, setPatientVerified] = useState(false);
    const [sampleQty, setSampleQty] = useState("");
    const [collectionSite, setCollectionSite] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const handleCollectSample = async () => {
        if (!patientVerified || !sampleQty || !collectionSite || !reportId) {
            return;
        }

        setIsSaving(true);

        try {
            const FHIR_URL = import.meta.env.VITE_FHIRAPI_URL;
            const FHIR_AUTH = "Basic " + btoa("fhiruser:change-password");

            // Fetch existing report
            const res = await fetch(`${FHIR_URL}/DiagnosticReport/${reportId}`, {
                headers: { Authorization: FHIR_AUTH }
            });
            const report = await res.json();

            // Update with collection data
            const updatedReport = {
                ...report,
                status: "preliminary", // Change from "registered" to "preliminary"
                extension: [
                    ...(report.extension || []),
                    { url: "sample-qty", valueString: sampleQty },
                    { url: "collection-site", valueString: collectionSite },
                    { url: "patient-verified", valueBoolean: patientVerified },
                    { url: "collection-time", valueDateTime: new Date().toISOString() }
                ]
            };

            // PUT update
            await fetch(`${FHIR_URL}/DiagnosticReport/${reportId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: FHIR_AUTH
                },
                body: JSON.stringify(updatedReport)
            });

            // Reset state
            setPatientVerified(false);
            setSampleQty("");
            setCollectionSite("");

            if (onCollectionSuccess) {
                onCollectionSuccess();
            }

            onClose();

        } catch (err) {
            console.error("Error collecting sample:", err);
            alert("Failed to update sample collection status");
        } finally {
            setIsSaving(false);
        }
    };

    const handleClose = () => {
        setPatientVerified(false);
        setSampleQty("");
        setCollectionSite("");
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: "16px",
                    p: 2,
                    backgroundColor: isDarkMode ? theme.palette.background.paper : "#fff",
                },
            }}
        >
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography fontWeight={600} color={isDarkMode ? theme.palette.text.primary : "black"}>
                    Sample Collection
                </Typography>
                <IconButton onClick={handleClose}>
                    <CloseIcon sx={{ color: isDarkMode ? theme.palette.text.secondary : "black" }} />
                </IconButton>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Patient Verified */}
            <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                    border: `1px solid ${isDarkMode ? theme.palette.divider : "#E5E7EB"}`,
                    borderRadius: "10px",
                    px: 2,
                    py: 1.5,
                    mb: 2,
                }}
            >
                <Typography color={isDarkMode ? theme.palette.text.primary : "black"}>Patient Verified?</Typography>
                <Checkbox
                    sx={{ color: isDarkMode ? theme.palette.text.secondary : "black" }}
                    checked={patientVerified}
                    onChange={(e) => setPatientVerified(e.target.checked)}
                />
            </Box>

            {/* Sample Qty */}
            <Box mb={2}>
                <Typography variant="caption" color={isDarkMode ? theme.palette.text.secondary : "black"}>
                    Sample qty
                </Typography>

                <TextField
                    fullWidth
                    placeholder="Collected Sample qty"
                    value={sampleQty}
                    onChange={(e) => setSampleQty(e.target.value)}
                    sx={{
                        mt: 1,
                        "& .MuiOutlinedInput-root": {
                            borderRadius: "12px",
                            pr: 1,
                            color: isDarkMode ? theme.palette.text.primary : "#000",
                            borderColor: isDarkMode ? theme.palette.divider : undefined,
                        },
                        "& .MuiOutlinedInput-notchedOutline": { borderColor: isDarkMode ? theme.palette.divider : undefined },
                        backgroundColor: isDarkMode ? theme.palette.background.default : "#F9FAFB",
                    }}
                    InputProps={{
                        endAdornment: (
                            <Box display="flex" gap={1}>
                                {["0.5mL", "1.0mL", "1.5mL", "2.0mL"].map((qty) => (
                                    <Chip
                                        key={qty}
                                        label={qty}
                                        clickable
                                        onClick={() => setSampleQty(qty)}
                                        sx={{
                                            height: 28,
                                            borderRadius: "16px",
                                            fontWeight: 500,
                                            backgroundColor: sampleQty === qty
                                                ? (isDarkMode ? "#58A6FF" : "#228BE6")
                                                : (isDarkMode ? alpha("#58A6FF", 0.2) : "#E8F1FD"),
                                            color: sampleQty === qty
                                                ? "#fff"
                                                : (isDarkMode ? "#58A6FF" : "#228BE6"),
                                            cursor: "pointer",
                                        }}
                                    />
                                ))}
                            </Box>
                        ),
                    }}
                />
            </Box>

            {/* Collection Site */}
            <Typography variant="caption" color={isDarkMode ? theme.palette.text.secondary : "grey"}>
                Collection site
            </Typography>
            <ToggleButtonGroup
                exclusive
                value={collectionSite}
                fullWidth
                onChange={(_, value) => value && setCollectionSite(value)}
                sx={{ mt: 1, mb: 2 }}
            >
                {["Left Heel", "Right Heel", "UAC", "PIV"].map((site) => (
                    <ToggleButton
                        key={site}
                        value={site}
                        sx={{
                            textTransform: "none",
                            fontWeight: 600,
                            color: isDarkMode ? theme.palette.text.secondary : "#7A8899",
                            height: "48px",
                            border: `1px solid ${isDarkMode ? theme.palette.divider : "#D0D7E2"}`,
                            borderRadius: "8px",
                            "&.Mui-selected": {
                                backgroundColor: isDarkMode ? alpha("#58A6FF", 0.2) : alpha("#228BE6", 0.1),
                                color: isDarkMode ? "#58A6FF" : "#228BE6",
                            },
                        }}
                    >
                        {site}
                    </ToggleButton>
                ))}
            </ToggleButtonGroup>

            {/* Footer */}
            <Box mt={4} display="flex" gap={2}>
                <Button fullWidth variant="outlined" onClick={handleClose}>
                    Back
                </Button>
                <Button
                    fullWidth
                    variant="contained"
                    sx={{ backgroundColor: "#228BE6" }}
                    disabled={!patientVerified || !sampleQty || !collectionSite || isSaving}
                    onClick={handleCollectSample}
                >
                    {isSaving ? "Updating..." : "Sample Collected →"}
                </Button>
            </Box>
        </Dialog>
    );
};
