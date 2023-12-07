import "./App.css";
import { Routes, Route } from "react-router-dom";
import {Home} from "./pages/Home";
import {Rooms} from "./pages/Rooms"
import { DetailedDevice } from "./pages/DetailedDevice";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {Header} from "./components/Header";
import { Backdrop } from "@mui/material";
import {CircularProgress} from "@mui/material";
import { useAuth0 } from "@auth0/auth0-react";
import { UserInfo } from "./pages/UserInfo";
import { useState } from "react";
import "@fontsource/noto-sans";
import {PatientMonitor} from "./pages/PatientMonitor";
import { DeviceMonitor } from "./pages/DeviceMonitor";
import {AdminPage} from "./pages/AdminPage";
const theme = createTheme({
  typography: {
    allVariants:{
      userSelect: 'none'
    }
  },
  palette: {//
    mode: 'dark',
    background: {default: '#000000'},// "#121111",
    primary: {
      main: "#2BA0E0", //#181C2D
    },
    secondary:{
      main: "#00A0E3"
    }
  },
  
});
 
            
          
function App() {

  const {isLoading} = useAuth0(); 

  const [currentRoom, setCurrentRoom] = useState("")
  const [roomAltered, setRoomAltered] = useState(false)
  function roomChange (roomId: any) {
    setCurrentRoom(roomId)
  }

  function roomModified (){
    setRoomAltered(!roomAltered)
  }
  // useEffect(() => {console.log(currentRoom)},[currentRoom])
  // const roomChange = (event) => {
  //   console.log("HELLO WORLD")
    
  // }
 
  return (
    <div>
      <ThemeProvider theme={theme}>
        <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={isLoading}
        ><CircularProgress color="inherit" /></Backdrop>
        <Header roomAltered={roomAltered} currentRoom={currentRoom} roomChange={roomChange} />
        <Routes>
          <Route path="/" element={<Home currentRoom={currentRoom} />}/>
          <Route path="/user" element={<UserInfo />} />
          <Route path="/rooms" element={<Rooms roomModified={roomModified}/>} />
          <Route path="/devicedata" element={<DetailedDevice />} />
          <Route path="/patient-monitor" element={<PatientMonitor currentRoom={currentRoom}/>} />
          <Route path="/device-monitor" element={<DeviceMonitor currentRoom={currentRoom}/>} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </ThemeProvider>
    </div>
  );
}

export default App;