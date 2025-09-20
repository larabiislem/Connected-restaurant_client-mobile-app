import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignINScreen from '@/screens/signIn';
import MenuScreen from '@/screens/menu';
import DescriptionScreen from '@/screens/description';
import SignUpScreen1 from '../screens/signUp1';
import SignUpScreen2 from '../screens/signUp2';
import SignUpScreen3 from '../screens/signUp3';
import SignUp2_5 from '@/screens/singUp2-5';
import { CartProvider } from '@/CartContext';
import Main from './main';






const Stack = createNativeStackNavigator();

const Menu = () => {
  return (
  
      <Stack.Navigator screenOptions={{headerShown : false}}>
        <Stack.Screen name="Menu" component={MenuScreen} />
        <Stack.Screen name="Description" component={DescriptionScreen} />
      </Stack.Navigator>
      
   
  );
};
 function App() {



  return (
    
      <CartProvider>
        <Stack.Navigator initialRouteName="SignIn">
        
          <Stack.Screen name="SignUp1" component={SignUpScreen1} options={{headerShown: false}} />
          <Stack.Screen name="SignUp2" component={SignUpScreen2} options={{headerShown: false}} />
          <Stack.Screen name="SignUp2_5" component={SignUp2_5} options={{headerShown: false}} />
          <Stack.Screen name="SignUp3" component={SignUpScreen3} options={{headerShown: false}} />
          <Stack.Screen name="SignIn" component={SignINScreen} options={{headerShown: false}} />
          <Stack.Screen name="Main" component={Main} options={{headerShown: false}} />
          
   
        </Stack.Navigator>
      </CartProvider>
    
  );
};



export default App;
