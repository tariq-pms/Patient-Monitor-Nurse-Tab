import React, { useState } from 'react';
import { Box, IconButton, Stack, Tooltip, Typography, Collapse } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import CodeIcon from '@mui/icons-material/Code';

interface RawJsonPanelProps {
    darkTheme: boolean;
    data: any;
    defaultOpen?: boolean;
}

export const RawJsonPanel: React.FC<RawJsonPanelProps> = ({ darkTheme, data, defaultOpen = false }) => {
    const [open, setOpen] = useState(defaultOpen);
    const [copied, setCopied] = useState(false);

    const json = JSON.stringify(data, null, 2);

    const handleCopy = async (event: React.MouseEvent) => {
        event.stopPropagation();
        try {
            await navigator.clipboard.writeText(json);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch (error) {
            console.error('Failed to copy JSON:', error);
        }
    };

    return (
        <Box sx={{ mt: 1 }}>
            <Stack
                direction="row"
                alignItems="center"
                spacing={0.5}
                onClick={() => setOpen((prev) => !prev)}
                sx={{ cursor: 'pointer', width: 'fit-content' }}
            >
                <CodeIcon fontSize="small" sx={{ color: darkTheme ? '#7FD8FF' : '#124D81' }} />
                <Typography variant="caption" sx={{ color: darkTheme ? '#7FD8FF' : '#124D81', fontWeight: 600 }}>
                    {open ? 'Hide raw JSON' : 'View raw JSON'}
                </Typography>
            </Stack>
            <Collapse in={open} unmountOnExit>
                <Box
                    sx={{
                        position: 'relative',
                        mt: 1,
                        backgroundColor: darkTheme ? '#0A0A0A' : '#F5F5F5',
                        border: `1px solid ${darkTheme ? '#333' : '#E3E8EF'}`,
                        borderRadius: '8px',
                        maxHeight: 400,
                        overflow: 'auto',
                    }}
                >
                    <Tooltip title={copied ? 'Copied!' : 'Copy JSON'}>
                        <IconButton
                            size="small"
                            onClick={handleCopy}
                            sx={{ position: 'absolute', top: 4, right: 4, color: darkTheme ? '#FFFFFF' : '#124D81' }}
                        >
                            {copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                        </IconButton>
                    </Tooltip>
                    <Box
                        component="pre"
                        sx={{
                            m: 0,
                            p: 1.5,
                            fontSize: '0.75rem',
                            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                            color: darkTheme ? '#D4D4D4' : '#1E1E1E',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                        }}
                    >
                        {json}
                    </Box>
                </Box>
            </Collapse>
        </Box>
    );
};
