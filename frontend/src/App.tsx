import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./_views/layout/Layout";
import Dashboard from "./_views/dashboard/Dashboard";
import "bootstrap/dist/css/bootstrap.css";
import { MemberProvider } from "./_common/context/MemberContext";
import Workout from "./_views/workout/Workout";
import Login from "./_views/login/Login";
import Progress from "./_views/progress/Progress";
import Goal from "./_views/goal/Goal";
import CalorieTracker from "./_views/calorietracker/CalorieTracker";
import UserAccount from "./_views/account/UserAccount";
import { LanguageProvider } from "./_common/context/LanguageContext";
import { WorkoutProvider } from "./_common/context/WorkoutContext";
import Exercise from "./_views/exercise/Exercise";
import { ExerciseProvider } from "./_common/context/ExerciseContext";
import WorkoutDetail from "./_views/workout/workoutDetail/WorkoutDetail";
import WorkoutManager from "./_views/workout/WorkoutManager";

function App() {
    return (
        <LanguageProvider>
            <WorkoutProvider>
                <MemberProvider>
                    <ExerciseProvider>
                        <BrowserRouter>
                            <Routes>
                                <Route path="/" element={<Login />} />
                                <Route path="/" element={<Layout />}>
                                    <Route path="/dashboard" element={<Dashboard />} />
                                    <Route path="/workout" element={<Workout />} />
                                    <Route path="/progress" element={<Progress />} />
                                    <Route path="/goal" element={<Goal />} />
                                    <Route path="/calorietracker" element={<CalorieTracker />} />
                                    <Route path="/account" element={<UserAccount />} />
                                    <Route path="/workout/manage" element={<WorkoutManager />} />
                                    <Route path="/workout/manage/:workoutId" element={<WorkoutManager />} />
                                    <Route path="/exercise" element={<Exercise />} />
                                    <Route path="/workout/details/id/:workoutId" element={<WorkoutDetail />} />
                                </Route>
                            </Routes>
                        </BrowserRouter>
                    </ExerciseProvider>
                </MemberProvider>
            </WorkoutProvider>
        </LanguageProvider>
    );
}

export default App;
