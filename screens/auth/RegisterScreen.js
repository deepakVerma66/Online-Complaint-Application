import React, { useMemo, useState } from 'react';
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
import SearchableAreaPicker from '../../components/SearchableAreaPicker';
import SectionHeader from '../../components/SectionHeader';
import { getRouteForRole } from '../../constants/auth';
import { buildApiUrl } from '../../constants/api';
import colors from '../../constants/colors';
import { councillorsData } from '../../constants/councillorsData';

const RegisterScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedWard, setSelectedWard] = useState(null);
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const areaOptions = useMemo(() => {
    return councillorsData.map((item) => ({
      area: item.area.trim(),
      value: item.area.trim(),
      label: item.area.trim(),
      wardNumber: item.wardNumber
    }));
  }, []);

  const handleRegister = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!fullName.trim() || !selectedArea || !normalizedEmail || !password || !confirmPassword) {
      setErrorMessage('Full name, area, email, password, and confirm password are required.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Password and confirm password must match.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');

      const response = await fetch(buildApiUrl('/api/auth/register'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: fullName.trim(),
          email: normalizedEmail,
          password,
          area: selectedArea,
          ward: selectedWard
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMessage(data.message || 'Registration failed. Please try again.');
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
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
        >
          <View style={styles.card}>
            <SectionHeader
              title="Create Account"
              subtitle="Register to use the complaint portal"
            />

            <CustomInput
              label="Full Name"
              placeholder="Enter your full name"
              value={fullName}
              onChangeText={setFullName}
            />
            <SearchableAreaPicker
              label="Locality / Area"
              placeholder="Select your area or locality"
              value={selectedArea}
              options={areaOptions}
              onSelect={setSelectedArea}
              onSelectOption={(selectedOption) => setSelectedWard(selectedOption?.wardNumber || null)}
            />
            <CustomInput
              label="Email"
              placeholder="Enter your email address"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <CustomInput
              label="Phone Number"
              placeholder="Optional contact number"
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />
            <CustomInput
              label="Password"
              placeholder="Create a password"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              rightText={showPassword ? 'Hide' : 'Show'}
              onRightTextPress={() => setShowPassword((current) => !current)}
            />
            <CustomInput
              label="Confirm Password"
              placeholder="Re-enter your password"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              rightText={showConfirmPassword ? 'Hide' : 'Show'}
              onRightTextPress={() => setShowConfirmPassword((current) => !current)}
            />

            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

            <CustomButton
              title={isSubmitting ? 'Creating Account...' : 'Register'}
              onPress={handleRegister}
            />

            {isSubmitting ? <ActivityIndicator color={colors.primary} style={styles.loader} /> : null}

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
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40
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

export default RegisterScreen;
