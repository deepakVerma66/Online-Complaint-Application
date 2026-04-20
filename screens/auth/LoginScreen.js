import React, { useState } from 'react';
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import CustomButton from '../../components/CustomButton';
import CustomInput from '../../components/CustomInput';
import colors from '../../constants/colors';
import { getRouteForRole } from '../../constants/auth';
import { buildApiUrl } from '../../constants/api';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setErrorMessage('Email and password are required.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');

      const response = await fetch(buildApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: normalizedEmail,
          password
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMessage(data.message || 'Login failed. Please try again.');
        return;
      }

      const destinationRoute = getRouteForRole(data.user?.role);
      navigation.reset({
        index: 0,
        routes: [
          {
            name: destinationRoute,
            params: {
              user: data.user,
              authToken: data.token
            }
          }
        ]
      });
    } catch (error) {
      setErrorMessage(
        'Unable to reach the server. If you are testing on a phone, replace localhost with your laptop IP in constants/api.js.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
        >
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

            <CustomInput
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            <CustomInput
              label="Password"
              placeholder="Enter your password"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              rightText={showPassword ? 'Hide' : 'Show'}
              onRightTextPress={() => setShowPassword((current) => !current)}
            />

            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

            <CustomButton
              title={isSubmitting ? 'Signing In...' : 'Login'}
              onPress={handleLogin}
            />

            {isSubmitting ? <ActivityIndicator color={colors.primary} style={styles.loader} /> : null}

            <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.linkWrap}>
              <Text style={styles.linkText}>
                New user? <Text style={styles.linkHighlight}>Register here</Text>
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
    flex: 1,
    paddingHorizontal: 24
  },
  scrollContent: {
    flexGrow: 1,
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
  errorText: {
    color: colors.danger,
    fontSize: 13,
    marginBottom: 12,
    lineHeight: 18
  },
  loader: {
    marginTop: 14
  }
});

export default LoginScreen;
