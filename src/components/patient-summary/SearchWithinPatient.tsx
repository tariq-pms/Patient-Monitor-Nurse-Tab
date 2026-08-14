import React from 'react';
import { TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface SearchWithinPatientProps {
    darkTheme: boolean;
    value: string;
    onChange: (value: string) => void;
}

export const SearchWithinPatient: React.FC<SearchWithinPatientProps> = ({ darkTheme, value, onChange }) => (
    <TextField
        size="small"
        placeholder="Search within this patient's records..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
        InputProps={{
            startAdornment: <SearchIcon sx={{ color: '#124D81', mr: 1, fontSize: '1.2rem' }} />,
        }}
        sx={{
            minWidth: 280,
            '& .MuiOutlinedInput-root': {
                borderRadius: '25px',
                color: darkTheme ? '#FFFFFF' : '#1E1E1E',
                backgroundColor: darkTheme ? '#1E1E1E' : '#FFFFFF',
            },
        }}
    />
);
