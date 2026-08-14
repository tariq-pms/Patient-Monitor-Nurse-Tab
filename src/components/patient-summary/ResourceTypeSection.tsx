import React from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ResourceSummaryLine } from './ResourceSummaryLine';

interface ResourceTypeSectionProps {
    darkTheme: boolean;
    resourceType: string;
    resources: any[];
}

export const ResourceTypeSection: React.FC<ResourceTypeSectionProps> = ({ darkTheme, resourceType, resources }) => {
    const textColor = darkTheme ? '#FFFFFF' : '#124D81';
    const surfaceColor = darkTheme ? '#161616' : '#F9F9F9';
    const borderColor = darkTheme ? '#333' : '#E3E8EF';

    return (
        <Accordion
            defaultExpanded
            elevation={0}
            sx={{
                backgroundColor: surfaceColor,
                border: `1px solid ${borderColor}`,
                borderRadius: '14px !important',
                mb: 1.5,
                '&:before': { opacity: 0 },
            }}
        >
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: textColor }} />}>
                <Typography sx={{ color: textColor, fontWeight: 700 }}>
                    {resourceType} ({resources.length})
                </Typography>
            </AccordionSummary>
            <AccordionDetails>
                {resources.map((resource) => (
                    <ResourceSummaryLine
                        key={resource.id}
                        darkTheme={darkTheme}
                        resourceType={resourceType}
                        resource={resource}
                    />
                ))}
            </AccordionDetails>
        </Accordion>
    );
};
