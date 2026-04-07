import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import HomeScreen from '../screens/main/HomeScreen';
import PostComplaintScreen from '../screens/main/PostComplaintScreen';
import ComplaintStatusScreen from '../screens/main/ComplaintStatusScreen';
import NotificationScreen from '../screens/main/NotificationScreen';
import CounselorHomeScreen from '../screens/counselor/CounselorHomeScreen';
import CounselorComplaintsScreen from '../screens/counselor/CounselorComplaintsScreen';
import CounselorAnnouncementScreen from '../screens/counselor/CounselorAnnouncementScreen';
import DepartmentHomeScreen from '../screens/department/DepartmentHomeScreen';
import DepartmentComplaintsScreen from '../screens/department/DepartmentComplaintsScreen';
import MayorDashboardScreen from '../screens/mayor/MayorDashboardScreen';
import colors from '../constants/colors';

const Stack = createNativeStackNavigator();

const screenOptions = {
  headerStyle: {
    backgroundColor: colors.surface
  },
  headerShadowVisible: false,
  headerTintColor: colors.text,
  headerTitleStyle: {
    fontWeight: '700'
  },
  contentStyle: {
    backgroundColor: colors.background
  }
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={screenOptions}>
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Register' }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen
          name="PostComplaint"
          component={PostComplaintScreen}
          options={{ title: 'Post Complaint' }}
        />
        <Stack.Screen
          name="ComplaintStatus"
          component={ComplaintStatusScreen}
          options={{ title: 'Complaint Status' }}
        />
        <Stack.Screen
          name="Notifications"
          component={NotificationScreen}
          options={{ title: 'Notifications' }}
        />
        <Stack.Screen
          name="CounselorHome"
          component={CounselorHomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CounselorComplaints"
          component={CounselorComplaintsScreen}
          options={{ title: 'Counselor Complaints' }}
        />
        <Stack.Screen
          name="CounselorAnnouncement"
          component={CounselorAnnouncementScreen}
          options={{ title: 'Make Announcement' }}
        />
        <Stack.Screen
          name="DepartmentHome"
          component={DepartmentHomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="DepartmentComplaints"
          component={DepartmentComplaintsScreen}
          options={{ title: 'Department Complaints' }}
        />
        <Stack.Screen
          name="MayorDashboard"
          component={MayorDashboardScreen}
          options={{ title: 'Mayor Dashboard' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
