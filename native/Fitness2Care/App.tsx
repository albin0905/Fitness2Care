import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MemberProvider } from '../../frontend/src/_common/context/MemberContext';
import { LanguageProvider } from '../../frontend/src/_common/context/LanguageContext';
import { WorkoutProvider } from '../../frontend/src/_common/context/WorkoutContext';
import Layout from '@screens/layout/Layout';
import Dashboard from '@screens/dashboard/Dashboard';
import Workout from '@screens/workout/Workout';
import Login from '@screens/login/Login';
import Goal from '@screens/goal/Goal';
import CalorieTracker from '@screens/calorietracker/CalorieTracker';
import UserAccount from '@screens/account/UserAccount';
import Exercise from '@screens/exercise/Exercise';
import WorkoutDetail from '@screens/workout/WorkoutDetail';
import WorkoutManager from '@screens/workout/WorkoutManager';

// Typdefinition bleibt bestehen für die Verwendung in Komponenten
export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  Dashboard: undefined;
  Workout: undefined;
  Progress: undefined;
  Goal: undefined;
  CalorieTracker: undefined;
  Account: undefined;
  WorkoutManager: undefined;
  WorkoutDetail: { workoutId: string; workoutName?: string };
  Exercise: undefined;
};

const Stack = createNativeStackNavigator();

type WorkoutDetailRouteProp = {
  params: RootStackParamList['WorkoutDetail'];
};

function App() {
  return (
      <LanguageProvider>
        <WorkoutProvider>
          <MemberProvider>
            <NavigationContainer>
              <Stack.Navigator initialRouteName="Login">
                <Stack.Screen
                    name="Login"
                    component={Login}
                    options={{ headerShown: false }}
                />

                <Stack.Screen
                    name="Main"
                    component={Layout}
                    options={{ headerShown: false }}
                />

                <Stack.Group>
                  <Stack.Screen
                      name="Dashboard"
                      component={Dashboard}
                      options={{ title: 'Dashboard' }}
                  />
                  <Stack.Screen
                      name="Workout"
                      component={Workout}
                      options={{ title: 'Workouts' }}
                  />
                  <Stack.Screen
                      name="Goal"
                      component={Goal}
                      options={{ title: 'Goals' }}
                  />
                  <Stack.Screen
                      name="CalorieTracker"
                      component={CalorieTracker}
                      options={{ title: 'Calorie Tracker' }}
                  />
                  <Stack.Screen
                      name="Account"
                      component={UserAccount}
                      options={{ title: 'My Account' }}
                  />
                  <Stack.Screen
                      name="WorkoutManager"
                      component={WorkoutManager}
                      options={{ title: 'Manage Workouts' }}
                  />
                  <Stack.Screen
                      name="WorkoutDetail"
                      component={WorkoutDetail}
                      options={({ route }: { route: WorkoutDetailRouteProp }) => ({
                        title: route.params?.workoutName || 'Workout Details'
                      })}
                  />
                  <Stack.Screen
                      name="Exercise"
                      component={Exercise}
                      options={{ title: 'Exercises' }}
                  />
                </Stack.Group>
              </Stack.Navigator>
            </NavigationContainer>
            <StatusBar style="auto" />
          </MemberProvider>
        </WorkoutProvider>
      </LanguageProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;