import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import CustomButton from '../../components/CustomButton';
import CustomInput from '../../components/CustomInput';
import SectionHeader from '../../components/SectionHeader';
import colors from '../../constants/colors';

const RegisterScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <SectionHeader
              title="Create Account"
              subtitle="Register to use the complaint portal"
            />

            <CustomInput label="Full Name" placeholder="Enter your full name" />
            <CustomInput label="Locality / Area" placeholder="Enter your area or locality" />
            <CustomInput label="Email" placeholder="Enter your email address" keyboardType="email-address" />
            <CustomInput
              label="Phone Number"
              placeholder="Optional contact number"
              keyboardType="phone-pad"
              note="Optional field for faster communication."
            />
            <CustomInput label="Password" placeholder="Create a password" secureTextEntry />
            <CustomInput
              label="Confirm Password"
              placeholder="Re-enter your password"
              secureTextEntry
            />

            <CustomButton title="Register" onPress={() => navigation.replace('Home')} />

            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.linkWrap}>
              <Text style={styles.linkText}>
                Already have an account? <Text style={styles.linkHighlight}>Login</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  container: {
    flex: 1
  },
  scrollContent: {
    padding: 20
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 22,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 4
  },
  linkWrap: {
    marginTop: 18,
    alignItems: 'center'
  },
  linkText: {
    fontSize: 14,
    color: colors.textLight
  },
  linkHighlight: {
    color: colors.primary,
    fontWeight: '700'
  }
});

export default RegisterScreen;
