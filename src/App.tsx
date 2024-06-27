import "./App.css";
import { Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { Rooms } from "./pages/Rooms";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Header } from "./components/Header";
import { Backdrop, CircularProgress } from "@mui/material";
import { useAuth0 } from "@auth0/auth0-react";
import { UserInfo } from "./pages/UserInfo";
import { useEffect, useState } from "react";
import "@fontsource/noto-sans";
import { PatientMonitor } from "./pages/PatientMonitor";
import { DeviceMonitor } from "./pages/DeviceMonitor";
import { AdminPage } from "./pages/AdminPage";
import { Organization } from "./pages/Organization";
import { AllPatient } from "./pages/AllPatient";
import { CentralMonitor } from "./pages/CentralMonitor";
import { CentralMonitorEDA } from "./pages/CentralMonitorEDA";
import { DeviceProvider } from "./contexts/DeviceContext";

const theme = createTheme({
    typography: {
        allVariants: {
            userSelect: 'none'
        }
    },
    palette: {
        mode: 'dark',
        background: { default: '#000000' },
        primary: {
            main: "#2BA0E0",
        },
        secondary: {
            main: "#00A0E3"
        }
    },
});

function App() {
    const { isLoading, getIdTokenClaims, isAuthenticated } = useAuth0();
    const [currentRoom, setCurrentRoom] = useState("");
    const [roomAltered, setRoomAltered] = useState(false);
    const [UserOrganization, setUserOrganization] = useState("");
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [darkTheme, setDarkTheme] = useState(false);
    const [selectedIcon, setSelectedIcon] = useState<string>("");

    useEffect(() => {
        if (isAuthenticated) {
            getIdTokenClaims()
                .then((res) => {
                    setUserOrganization(res?.organization);
                })
                .catch((error) => {
                    console.error('Failed to fetch organization:', error);
                });
        }
    }, [isAuthenticated]);

    const toggleDarkTheme = () => {
        setDarkTheme((prevTheme) => !prevTheme);
        document.documentElement.style.backgroundColor = darkTheme ? '#F5F5F5' : '#000000';
    };

    function roomChange(roomId: any) {
        setCurrentRoom(roomId);
    }

    function roomModified() {
        setRoomAltered(!roomAltered);
    }

    return (
        <ThemeProvider theme={theme}>
            <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={isLoading}>
                <CircularProgress color="inherit" />
            </Backdrop>
            <Header darkTheme={darkTheme} setSearchQuery={setSearchQuery} toggleDarkTheme={toggleDarkTheme} roomAltered={roomAltered} currentRoom={currentRoom} roomChange={roomChange} userOrganization={UserOrganization} selectedIcon={selectedIcon} setSelectedIcon={setSelectedIcon} />
            <DeviceProvider>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/user" element={<UserInfo />} />
                    <Route path="/rooms" element={<Rooms roomModified={roomModified} userOrganization={UserOrganization} darkTheme={darkTheme} />} />
                    <Route path="/patient-monitor" element={<PatientMonitor currentRoom={currentRoom} userOrganization={UserOrganization} darkTheme={darkTheme} selectedIcon={selectedIcon} />} />
                    <Route path="/all-patient" element={<AllPatient searchQuery={searchQuery} currentRoom={currentRoom} userOrganization={UserOrganization} darkTheme={darkTheme} selectedIcon={selectedIcon} />} />
                    <Route path="/device-monitor" element={<DeviceMonitor currentRoom={currentRoom} darkTheme={darkTheme} />} />
                    <Route path="/admin" element={<AdminPage userOrganization={UserOrganization} darkTheme={darkTheme} />} />
                    <Route path="/organization" element={<Organization darkTheme={darkTheme} />} />
                    <Route path="/central-monitor" element={<CentralMonitor currentRoom={currentRoom} darkTheme={darkTheme} selectedIcon={selectedIcon} />} />
                    <Route path="/central-monitor-2" element={<CentralMonitorEDA currentRoom={currentRoom} darkTheme={darkTheme} selectedIcon={selectedIcon} />} />
                </Routes>
            </DeviceProvider>
        </ThemeProvider>
    );
}

export default App;
