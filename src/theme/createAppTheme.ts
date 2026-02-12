import { createTheme, ThemeOptions } from '@mui/material/styles';
import {
    brandColors,
    semanticColors,
    lightPalette,
    darkPalette,
    ThemeMode,
} from './colorTokens';

/**
 * Creates a MUI theme based on the specified mode (light/dark)
 */
export const createAppTheme = (mode: ThemeMode) => {
    const palette = mode === 'dark' ? darkPalette : lightPalette;

    const themeOptions: ThemeOptions = {
        palette: {
            mode,
            primary: {
                main: brandColors.primary,
                light: '#5DB8E8',
                dark: '#1E7BB0',
                contrastText: '#FFFFFF',
            },
            secondary: {
                main: brandColors.secondary,
                contrastText: '#FFFFFF',
            },
            error: {
                main: semanticColors.error,
            },
            warning: {
                main: semanticColors.warning,
            },
            success: {
                main: semanticColors.success,
            },
            info: {
                main: semanticColors.info,
            },
            background: {
                default: palette.background.default,
                paper: palette.background.paper,
            },
            text: {
                primary: palette.text.primary,
                secondary: palette.text.secondary,
                disabled: palette.text.disabled,
            },
            divider: palette.border.default,
            action: {
                hover: palette.action.hover,
                selected: palette.action.selected,
                disabled: palette.action.disabled,
                focus: palette.action.focus,
            },
        },
        typography: {
            fontFamily: '"Noto Sans", "Roboto", "Helvetica", "Arial", sans-serif',
            allVariants: {
                userSelect: 'none',
            },
        },
        shape: {
            borderRadius: 8,
        },
        components: {
            MuiCssBaseline: {
                styleOverrides: {
                    body: {
                        backgroundColor: palette.background.default,
                        color: palette.text.primary,
                        transition: 'background-color 0.3s ease, color 0.3s ease',
                    },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        backgroundImage: 'none', // Remove default gradient
                        backgroundColor: palette.background.paper,
                    },
                },
            },
            MuiCard: {
                styleOverrides: {
                    root: {
                        backgroundColor: palette.background.paper,
                        border: `1px solid ${palette.border.default}`,
                    },
                },
            },
            MuiButton: {
                styleOverrides: {
                    root: {
                        textTransform: 'none',
                        fontWeight: 500,
                    },
                    contained: {
                        boxShadow: 'none',
                        '&:hover': {
                            boxShadow: 'none',
                        },
                    },
                    outlined: {
                        borderColor: palette.border.default,
                    },
                },
            },
            MuiIconButton: {
                styleOverrides: {
                    root: {
                        '&:hover': {
                            backgroundColor: palette.action.hover,
                        },
                    },
                },
            },
            MuiTableCell: {
                styleOverrides: {
                    root: {
                        borderBottom: `1px solid ${palette.border.default}`,
                    },
                    head: {
                        backgroundColor: palette.background.subtle,
                        color: palette.text.secondary,
                        fontWeight: 600,
                    },
                },
            },
            MuiTableRow: {
                styleOverrides: {
                    root: {
                        '&:hover': {
                            backgroundColor: palette.action.hover,
                        },
                    },
                },
            },
            MuiChip: {
                styleOverrides: {
                    root: {
                        fontWeight: 500,
                    },
                },
            },
            MuiDialog: {
                styleOverrides: {
                    paper: {
                        backgroundColor: palette.background.paper,
                        border: `1px solid ${palette.border.default}`,
                    },
                },
            },
            MuiMenu: {
                styleOverrides: {
                    paper: {
                        backgroundColor: palette.background.paper,
                        border: `1px solid ${palette.border.default}`,
                    },
                },
            },
            MuiTextField: {
                styleOverrides: {
                    root: {
                        '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                                borderColor: palette.border.default,
                            },
                            '&:hover fieldset': {
                                borderColor: palette.border.strong,
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: palette.border.focus,
                            },
                        },
                    },
                },
            },
            MuiSelect: {
                styleOverrides: {
                    root: {
                        '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: palette.border.default,
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: palette.border.strong,
                        },
                    },
                },
            },
            MuiTabs: {
                styleOverrides: {
                    root: {
                        '& .MuiTabs-indicator': {
                            backgroundColor: brandColors.primary,
                        },
                    },
                },
            },
            MuiTab: {
                styleOverrides: {
                    root: {
                        textTransform: 'none',
                        fontWeight: 500,
                        '&.Mui-selected': {
                            color: brandColors.primary,
                        },
                    },
                },
            },
        },
    };

    return createTheme(themeOptions);
};

// Export pre-built themes for convenience
export const lightTheme = createAppTheme('light');
export const darkTheme = createAppTheme('dark');
