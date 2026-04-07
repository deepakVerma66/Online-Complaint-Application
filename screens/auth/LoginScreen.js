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

const LoginScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.logoSection}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>OCA</Text>
            </View>
            <Text style={styles.appTitle}>Online Complaint Application</Text>
            <Text style={styles.appSubtitle}>Citizen grievance support portal</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Login to continue</Text>

            <CustomInput label="Email or Username" placeholder="Enter your email or username" />
            <CustomInput label="Password" placeholder="Enter your password" secureTextEntry />

            <CustomButton title="Login" onPress={() => navigation.replace('Home')} />

            <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.linkWrap}>
              <Text style={styles.linkText}>
                New user? <Text style={styles.linkHighlight}>Register here</Text>
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.demoCard}>
            <SectionHeader title="Demo Role Access" subtitle="Frontend Testing Only" />

            <CustomButton
              title="Continue as User"
              onPress={() => navigation.replace('Home')}
              style={styles.demoButton}
            />
            <CustomButton
              title="Continue as Counselor"
              onPress={() => navigation.replace('CounselorHome')}
              outlined
              style={styles.demoButton}
            />
            <CustomButton
              title="Continue as Department"
              onPress={() => navigation.replace('DepartmentHome')}
              outlined
              style={styles.demoButton}
            />
            <CustomButton
              title="Continue as Mayor"
              onPress={() => navigation.replace('MayorDashboard')}
              outlined
            />
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
    flex: 1,
    paddingHorizontal: 24
  },
  scrollContent: {
    paddingVertical: 28
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 26
  },
  logoCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 6
  },
  logoText: {
    color: colors.surface,
    fontSize: 24,
    fontWeight: '800'
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center'
  },
  appSubtitle: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 6
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
  demoCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 22,
    marginTop: 18,
    marginBottom: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 22,
    elevation: 3
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text
  },
  subtitle: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 6,
    marginBottom: 24
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
  },
  demoButton: {
    marginBottom: 12
  }
});

export default LoginScreen;
