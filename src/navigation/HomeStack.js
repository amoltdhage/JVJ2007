// HomeStack.js
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/Authenticated/HomeScreen';
import GetTogetherForm from '../screens/Authenticated/GetTogetherForm';

const HomeStack = createNativeStackNavigator();

export default function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen name="GetTogetherForm" component={GetTogetherForm} />
    </HomeStack.Navigator>
  );
}
