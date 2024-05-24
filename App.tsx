import { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Login from './components/Login';
import WelcomePage from './components/WelcomePage';
import Settings from './components/Settings';
import Expenses from './components/Expenses';
import Incomes from './components/Incomes';
import Statistics from './components/Statistics';
import Categories from './components/Categories';
import apiUrl from './Api'
const Stack = createStackNavigator();

function App() {
  const [userExists, setUserExists] = useState<boolean>(false);
  useEffect(() => {
    checkUserExists();
  }, []);
  const checkUserExists = async () => {
    try {
      const response = await fetch(`http://${apiUrl}:9090/user/1`);
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }
      const data = await response.json();
      if (data) {
        setUserExists(true);
      } else {
        setUserExists(false);
      }
    } catch (error) {
      console.error('Error checking if user exists: ', error);
      setUserExists(false);
    }
  };
  
  console.log('User exists',userExists);
  
  const initialRouteName = userExists ? 'WelcomePage' : 'Login';
  

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName={initialRouteName} screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="WelcomePage" component={WelcomePage} />
          <Stack.Screen name="Expenses" component={Expenses} />
          <Stack.Screen name="Incomes" component={Incomes} />
          <Stack.Screen name="Settings" component={Settings} />
          <Stack.Screen name="Statistics" component={Statistics} />
          <Stack.Screen name="Categories" component={Categories} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
