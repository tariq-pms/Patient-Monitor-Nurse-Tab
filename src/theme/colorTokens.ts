/**
 * Color Tokens for NeoLife Application
 * Inspired by GitHub's dark mode with custom brand colors
 */

// Brand Colors (consistent across themes)
export const brandColors = {
    primary: '#2BA0E0',      // NeoLife Blue
    secondary: '#00A0E3',
    accent: '#58A6FF',       // GitHub Blue
};

// Semantic Colors (consistent across themes)
export const semanticColors = {
    success: '#3FB950',      // Green
    warning: '#F0883E',      // Orange/Amber
    error: '#F85149',        // Red
    info: '#58A6FF',         // Blue
    emergency: '#F97316',    // Bright Orange
    pending: '#F0883E',      // Orange for pending status
    collected: '#22C55E',    // Green for collected
    ready: '#3FB950',        // Green for report ready
};

// Gender Colors
export const genderColors = {
    male: '#2BA0E0',
    female: '#FFAFCC',
};

// Light Mode Palette
export const lightPalette = {
    background: {
        default: '#F8FAFC',      // Page background
        paper: '#FFFFFF',        // Cards/Panels
        subtle: '#F1F5F9',       // Subtle backgrounds (table headers)
        sidebar: '#FFFFFF',      // Sidebar background
        hover: '#E2E8F0',        // Hover states
        elevated: '#FFFFFF',     // Elevated surfaces
    },
    text: {
        primary: '#0F172A',      // Main text (dark slate)
        secondary: '#475569',    // Secondary text
        tertiary: '#94A3B8',     // Muted/placeholder text
        disabled: '#CBD5E1',     // Disabled text
        inverse: '#FFFFFF',      // Text on dark backgrounds
    },
    border: {
        default: '#E2E8F0',      // Default borders
        subtle: '#F1F5F9',       // Subtle borders
        strong: '#CBD5E1',       // Strong borders
        focus: '#2BA0E0',        // Focus rings
    },
    action: {
        hover: 'rgba(0, 0, 0, 0.04)',
        selected: 'rgba(43, 160, 224, 0.08)',
        disabled: 'rgba(0, 0, 0, 0.12)',
        focus: 'rgba(43, 160, 224, 0.12)',
    },
};

// Dark Mode Palette (GitHub-inspired)
export const darkPalette = {
    background: {
        default: '#0D1117',      // Page background (deep navy)
        paper: '#161B22',        // Cards/Panels
        subtle: '#1C2128',       // Subtle backgrounds (table rows)
        sidebar: '#21262D',      // Sidebar - slightly lighter/elevated
        hover: '#30363D',        // Hover states
        elevated: '#21262D',     // Elevated surfaces
    },
    text: {
        primary: '#FFFFFF',      // Main text
        secondary: '#8B949E',    // Secondary text
        tertiary: '#6E7681',     // Muted/placeholder text
        disabled: '#484F58',     // Disabled text
        inverse: '#0D1117',      // Text on light backgrounds
    },
    border: {
        default: '#30363D',      // Default borders
        subtle: '#21262D',       // Subtle borders
        strong: '#484F58',       // Strong borders
        focus: '#58A6FF',        // Focus rings
    },
    action: {
        hover: 'rgba(255, 255, 255, 0.08)',
        selected: 'rgba(88, 166, 255, 0.15)',
        disabled: 'rgba(255, 255, 255, 0.12)',
        focus: 'rgba(88, 166, 255, 0.25)',
    },
};

// Type definitions
export type ThemeMode = 'light' | 'dark';
export type ColorPalette = typeof lightPalette;
