import React, { useMemo, useState } from 'react';
import { Badge, Box, Tab, Tabs } from '@mui/material';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import { RESOURCE_CATEGORIES, getCategoryForResourceType } from '../../constants/fhirResourceCategories';
import { ResourceTypeSection } from './ResourceTypeSection';
import { ObservationSection } from './ObservationSection';
import { OverviewSection } from './OverviewSection';
import { EmptyView } from './StateViews';

interface ResourceCategoryTabsProps {
    darkTheme: boolean;
    byType: Record<string, any[]>;
    patient: any;
    organizationName?: string;
}
interface CategoryGroup {
    key: string;
    label: string;
    resourceTypes: string[];
    resourceCount: number;
}

const OVERVIEW_TAB_INDEX = 0;

export const ResourceCategoryTabs: React.FC<ResourceCategoryTabsProps> = ({
    darkTheme,
    byType,
    patient,
    organizationName,
}) => {
    const categories = useMemo<CategoryGroup[]>(() => {
        const foundTypes = Object.keys(byType);
        const byCategoryKey = new Map<string, CategoryGroup>();

        foundTypes.forEach((resourceType) => {
            const category = getCategoryForResourceType(resourceType);
            const existing = byCategoryKey.get(category.key);
            if (existing) {
                existing.resourceTypes.push(resourceType);
                existing.resourceCount += byType[resourceType].length;
            } else {
                byCategoryKey.set(category.key, {
                    key: category.key,
                    label: category.label,
                    resourceTypes: [resourceType],
                    resourceCount: byType[resourceType].length,
                });
            }
        });

        const ordered = RESOURCE_CATEGORIES.map((category) => byCategoryKey.get(category.key)).filter(
            (group): group is CategoryGroup => Boolean(group),
        );
        const other = byCategoryKey.get('other');
        if (other) ordered.push(other);

        ordered.forEach((group) => group.resourceTypes.sort());
        return ordered;
    }, [byType]);

    const [activeTab, setActiveTab] = useState(OVERVIEW_TAB_INDEX);
    // +1 to account for the Overview tab prepended before the category tabs.
    const maxIndex = categories.length;
    const safeActiveTab = Math.min(activeTab, maxIndex);
    const activeGroup = safeActiveTab === OVERVIEW_TAB_INDEX ? null : categories[safeActiveTab - 1];

    const textColor = darkTheme ? '#FFFFFF' : '#124D81';
    const borderColor = darkTheme ? '#333' : '#E3E8EF';

    if (categories.length === 0) {
        return <EmptyView message="No FHIR resources were found for this patient." />;
    }

    return (
        <Box>
            <Tabs
                value={safeActiveTab}
                onChange={(_event, value) => setActiveTab(value)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                    mb: 2,
                    borderBottom: `1px solid ${borderColor}`,
                    '& .MuiTab-root': { color: textColor, textTransform: 'none', fontWeight: 600 },
                    '& .Mui-selected': { color: '#01AEEE !important' },
                    '& .MuiTabs-indicator': { backgroundColor: '#01AEEE' },
                }}
            >
                <Tab
                    icon={<DashboardRoundedIcon fontSize="small" />}
                    iconPosition="start"
                    label="Overview"
                    sx={{ minHeight: 48}}
                />
                {categories.map((group) => (
                    <Tab
                        key={group.key}
                          sx={{ width: 148}}
                        label={
                            <Badge
                                badgeContent={group.resourceCount}
                                color="primary"
                                max={999}
                                sx={{ '& .MuiBadge-badge': { right: -5, top: -2 } }}
                            >
                                <Box sx={{ pr: 1 }}>{group.label}</Box>
                            </Badge>
                        }
                    />
                ))}
            </Tabs>

            {/* Only the active tab's content mounts -- lazy loads each resource section's DOM. */}
            {activeGroup === null ? (
                <OverviewSection darkTheme={darkTheme} byType={byType} />
            ) : (
                activeGroup.resourceTypes.map((resourceType) =>
                    resourceType === 'Observation' ? (
                        <Box key={resourceType} sx={{ mb: 2 }}>
                            <ObservationSection
                                darkTheme={darkTheme}
                                patient={patient}
                                organizationName={organizationName}
                                observations={byType[resourceType] ?? []}
                            />
                        </Box>
                    ) : (
                        <ResourceTypeSection
                            key={resourceType}
                            darkTheme={darkTheme}
                            resourceType={resourceType}
                            resources={byType[resourceType] ?? []}
                        />
                    ),
                )
            )}
        </Box>
    );
};
