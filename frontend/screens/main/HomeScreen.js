import React, { useCallback, useState } from 'react';
import { SafeAreaView } from "react-native-safe-area-context";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import SectionHeader from '../../components/SectionHeader';
import { buildApiUrl } from '../../constants/api';
import colors from '../../constants/colors';

const menuCards = [
  {
    id: '1',
    title: 'Post Complaint',
    description: 'Submit a new civic issue with clear details and location.',
    screen: 'PostComplaint'
  },
  {
    id: '2',
    title: 'Complaint Status',
    description: 'Track updates and progress of your submitted complaint.',
    screen: 'ComplaintStatus'
  }
];

const HomeScreen = ({ navigation, route }) => {
  const authToken = route?.params?.authToken;
  const [currentUser, setCurrentUser] = useState(route?.params?.user || null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const userName = currentUser?.name || route?.params?.user?.name || 'User';

  const handleRefresh = useCallback(async () => {
    if (!authToken) {
      setErrorMessage('Login session not found. Please login again.');
      return;
    }

    try {
      setIsRefreshing(true);
      setErrorMessage('');

      const response = await fetch(buildApiUrl('/api/auth/me'), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMessage(data.message || 'Unable to refresh your home screen right now.');
        return;
      }

      setCurrentUser(data.user || currentUser);
    } catch (error) {
      setErrorMessage('Unable to refresh right now. Please check the server connection and try again.');
    } finally {
      setIsRefreshing(false);
    }
  }, [authToken, currentUser]);

  const handleLogout = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }]
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <Text style={styles.portalTitle}>Citizen Complaint Portal</Text>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutChip}>
              <Text style={styles.logoutChipText}>Logout</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.heroHeading}>Hello, {userName}</Text>
          <Text style={styles.heroSubheading}>What would you like to do today?</Text>
        </View>

        <SectionHeader
          title="Quick Access"
          subtitle="Choose an option to continue with your grievance services."
        />

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        {menuCards.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.88}
            style={styles.card}
            onPress={() =>
              navigation.navigate(item.screen, {
                user: currentUser,
                authToken
              })
            }
          >
            <View style={styles.cardContent}>
              <View style={styles.textWrap}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDescription}>{item.description}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  container: {
    padding: 20,
    paddingBottom: 32
  },
  heroCard: {
    backgroundColor: colors.primary,
    borderRadius: 28,
    padding: 24,
    marginBottom: 24,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 22,
    elevation: 5
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  portalTitle: {
    color: '#DDECF7',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase'
  },
  logoutChip: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.12)'
  },
  logoutChipText: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: '700'
  },
  heroHeading: {
    color: colors.surface,
    fontSize: 28,
    fontWeight: '700',
    marginTop: 12
  },
  heroSubheading: {
    color: '#EAF4FB',
    fontSize: 15,
    marginTop: 8,
    lineHeight: 22
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  textWrap: {
    flex: 1
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text
  },
  cardDescription: {
    marginTop: 6,
    fontSize: 14,
    color: colors.textLight,
    lineHeight: 20
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    marginBottom: 12,
    lineHeight: 18
  }
});

export default HomeScreen;
