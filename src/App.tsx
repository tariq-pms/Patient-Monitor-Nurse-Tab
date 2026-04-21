import "./App.css";
import { Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
// import { Rooms } from "./pages/Rooms";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { Header } from "./components/Header";
import { Backdrop, CircularProgress } from "@mui/material";
import { useAuth0 } from "@auth0/auth0-react";
import { UserInfo } from "./pages/UserInfo";
import { useEffect, useState, useMemo } from "react";
import { PatientMonitor } from "./pages/PatientMonitor";
import { NurseMonitor } from "./pages/NurseMonitor";
import { AdminPage } from "./pages/AdminPage";
import { Organization } from "./pages/Organization";
// import { AllPatient } from "./pages/AllPatient";
// import { DeviceProvider } from "./contexts/DeviceContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { PatientDetailView } from "./pages/PatientDetails";
import { Administration } from "./pages/Administration";
import { PermissionProvider } from './contexts/PermissionContext';
import { PatientProfile } from "./pages/PatientProfile";
import { createAppTheme } from './theme';
import TitleUpdater from "./components/TitleUpdater";
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

function App() {
    const { isLoading, getIdTokenClaims, isAuthenticated } = useAuth0();
    const [currentRoom, setCurrentRoom] = useState("");
    // const [roomAltered, setRoomAltered] = useState(false);
    const [UserOrganization, setUserOrganization] = useState("");
    const [searchQuery, setSearchQuery] = useState<string>('');
    // set mode based on system theme

    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
    console.log('systemTheme', systemTheme);
    const [darkTheme, setDarkTheme] = useState(systemTheme); // Default to dark mode

    // Create theme dynamically based on darkTheme state
    const theme = useMemo(() => createAppTheme(darkTheme ? 'dark' : 'light'), [darkTheme]);

    const [UserRole, setUserRole] = useState("");
    const [openDialog, setOpenDialog] = useState(false);

    const handleOpenDialog = () => setOpenDialog(true);
    const handleCloseDialog = () => setOpenDialog(false);


    useEffect(() => {
        if (isAuthenticated) {
            getIdTokenClaims()
                .then((res) => {
                    console.log('fetched res in app', res);
                    setUserOrganization(res?.organization);
                    setUserRole(res?.role || "");

                    console.log('fetched UserRole', res?.role);
                    console.log('searchQuery', searchQuery);
                    console.log('fetched UserOrganization', res?.organization);
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

    // function roomModified() {
    //     setRoomAltered(!roomAltered);
    // }

    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarCollapsed(prev => !prev);
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <NotificationProvider>
                    <TitleUpdater />
                    <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={isLoading}>
                        <CircularProgress color="inherit" />
                    </Backdrop>
                    <Header darkTheme={darkTheme} setSearchQuery={setSearchQuery} toggleDarkTheme={toggleDarkTheme} currentRoom={currentRoom} roomChange={roomChange} onToggleSidebar={toggleSidebar} isSidebarCollapsed={isSidebarCollapsed} onAddClick={handleOpenDialog} userOrganization={""} />
                    {/* <DeviceProvider> */}
                        <PermissionProvider>
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/user" element={<UserInfo />} />
                                {/* <Route path="/rooms" element={<Rooms roomModified={roomModified} userOrganization={UserOrganization} darkTheme={darkTheme} />} /> */}
                                <Route path="/patient-monitor" element={<PatientMonitor currentRoom={currentRoom} userOrganization={UserOrganization} darkTheme={darkTheme} />} />
                                <Route path="/nurse-monitor" element={<NurseMonitor currentRoom={currentRoom} userOrganization={UserOrganization} darkTheme={darkTheme} />} />
                                {/* <Route path="/all-patient" element={<AllPatient searchQuery={searchQuery} currentRoom={currentRoom} userOrganization={UserOrganization} darkTheme={darkTheme} />} /> */}

                                <Route path="/admin" element={<AdminPage userOrganization={UserOrganization} darkTheme={darkTheme} />} />
                                <Route path="/administration" element={<Administration isSidebarCollapsed={isSidebarCollapsed} openDialog={openDialog} userOrganization={UserOrganization} darkTheme={darkTheme} onCloseDialog={handleCloseDialog} />} />
                                <Route path="/organization" element={<Organization darkTheme={darkTheme} userOrganization={UserOrganization} />} />
                                <Route path="/patient-profile/:patientId" element={<PatientProfile UserRole={UserRole} userOrganization={UserOrganization} />} />
                                <Route path="/patient/:id" element={<PatientDetailView isSidebarCollapsed={isSidebarCollapsed} key={""} newData={false} userOrganization={UserOrganization} patient_id={""} device={[]} patient_resource_id={""} observation_resource={[]} communication_resource={[]} patient_name={""} darkTheme={darkTheme} toggleTheme={toggleDarkTheme} UserRole={UserRole} selectedIcon={""} gestational_age={""} birthDate={""} gender={""} />} />
                            </Routes>
                        </PermissionProvider>
                    {/* </DeviceProvider> */}

                </NotificationProvider>
            </ThemeProvider>
        </LocalizationProvider>
    );
}

export default App;
