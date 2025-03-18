import {BrowserRouter, Route, Routes} from "react-router-dom";
import Layout from "./_views/layout/Layout";
import Dashboard from "./_views/dashboard/Dashboard";
import "bootstrap/dist/css/bootstrap.css"
import {MemberProvider} from "./_common/context/MemberContext";
import Workout from "./_views/workout/Workout";
import Login from "./_views/login/Login";
import Progress from "./_views/progress/Progress";
import Goal from "./_views/goal/Goal";
import CalorieTracker from "./_views/calorietracker/CalorieTracker";
import UserAccount from "./_views/account/UserAccount";
import {LanguageProvider} from "./_common/context/LanguageContext";

function App() {
  return (
  <LanguageProvider>
    <MemberProvider>
      <BrowserRouter>
        <Routes>
            <Route path="/" element={<Login/>}/>
          <Route path="/" element={<Layout/>}>
              <Route path="/dashboard" element={<Dashboard/>}/>
              <Route path="/workout" element={<Workout/>}/>
              <Route path="/progress" element={<Progress/>}/>
              <Route path="/goal" element={<Goal/>}/>
              <Route path="/calorietracker" element={<CalorieTracker/>}/>
              <Route path="/account" element={<UserAccount/>}/>
          </Route>
        </Routes>
      </BrowserRouter>
    </MemberProvider>
  </LanguageProvider>
  );
}

export default App;
