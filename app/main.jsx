import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View } from 'react-native';
import HomeScreen from '@/screens/home';
import MenuScreen from '@/screens/menu';
import MyListScreen from '@/screens/mylist';
import DescriptionScreen from '@/screens/description';
import { CartProvider } from '@/CartContext';
import {Ionicons , MaterialCommunityIcons } from '@expo/vector-icons';
import Octicons from '@expo/vector-icons/Octicons';
import AntDesign from '@expo/vector-icons/AntDesign';
import MycartScreen from '@/screens/mycart';
import ProfileScreen from '@/screens/Profile';
import MyOrdersScreen from '@/screens/my_orders';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import GameScreen from '@/screens/game';
import NotificationScreen from '@/screens/notification';









const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const Menu = () => {



  return (
  
      <Stack.Navigator screenOptions={{headerShown : false}}>
        <Stack.Screen name="Menu" component={MenuScreen} />
        <Stack.Screen name="Description" component={DescriptionScreen} />
        <Stack.Screen name="Mycart" component={MycartScreen} />   
      </Stack.Navigator>
      
   
  );
};

const Home = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown : false}}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Description" component={DescriptionScreen} />
      <Stack.Screen name="Mycart" component={MycartScreen} />
      <Stack.Screen name="Game" component={GameScreen} />
      <Stack.Screen name="Notification" component={NotificationScreen} />
    </Stack.Navigator>
  );
}



export default function Main() {

  


  return (
 <CartProvider>
  
        <Tab.Navigator    screenOptions={{
          tabBarActiveTintColor: 'black',
          tabBarInactiveTintColor: 'gray',
          headerShown: false,

        }} >
          <Tab.Screen name="Home" component={Home} options={{
            tabBarLabel: 'Home',
            tabBarIcon: ({ color, size }) => (
              <Octicons name="home" size={size} color={color} />
           
            ),
          }}/>
          <Tab.Screen name="Menu" component={Menu} 
          options={{
            tabBarLabel: 'Menu',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="restaurant-outline" size={size} color={color} />
           
            ),
          }}
          
          />

          <Tab.Screen name="MyList" component={MyListScreen} 
           options={{
            tabBarLabel: 'My List',
            tabBarIcon: ({ color, size }) => (
              <AntDesign name="hearto" size={size} color={color} />
           
            ),
          }}  
          />
          <Tab.Screen name="Orders" component={MyOrdersScreen} 
          options={{
            tabBarLabel: 'My orders',
            tabBarIcon: ({ color, size }) => (
              <FontAwesome name="reorder" size={size} color={color} />
           
            ),
          }}
          />
          <Tab.Screen name="Profile" component={ProfileScreen} 
           options={{
            tabBarLabel: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="account" size={size} color={color} />
           
            ),
          }}
          />
        
         
          
        </Tab.Navigator>
   
 </CartProvider>
     

  );
}
