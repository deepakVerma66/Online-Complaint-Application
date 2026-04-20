import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import SectionHeader from '../../components/SectionHeader';
import { buildApiUrl } from '../../constants/api';
import colors from '../../constants/colors';

const DepartmentHomeScreen = ({ navigation, route }) => {
  const user = route?.params?.user;
  const authToken = route?.params?.authToken;
  const userName = user?.name || 'Department Head';
  const [summary, setSummary] = useState({
    totalAssigned: 0,
    acknowledged: 0,
    inProgress: 0,
    resolved: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchSummary = useCallback(async () => {
    if (!authToken) {
      setSummary({
        totalAssigned: 0,
        acknowledged: 0,
        inProgress: 0,
        resolved: 0
      });
      setErrorMessage('Login session not found. Please login again to view department data.');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');

      const response = await fetch(buildApiUrl('/api/complaints/department/summary'), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setSummary({
          totalAssigned: 0,
          acknowledged: 0,
          inProgress: 0,
          resolved: 0
        });
        setErrorMessage(data.message || 'Failed to fetch dashboard summary.');
        return;
      }

      setSummary({
        totalAssigned: data.summary?.totalAssigned || 0,
        acknowledged: data.summary?.acknowledged || 0,
        inProgress: data.summary?.inProgress || 0,
        resolved: data.summary?.resolved || 0
      });
    } catch (error) {
      setSummary({
        totalAssigned: 0,
        acknowledged: 0,
        inProgress: 0,
        resolved: 0
      });
      setErrorMessage('Unable to load dashboard summary. Please check the server connection and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [authToken]);

  useFocusEffect(
    useCallback(() => {
      fetchSummary();
    }, [fetchSummary])
  );

  const handleLogout = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }]
    });
  };

  const summaryCards = [
    { id: '1', label: 'Total Assigned Complaints', value: summary.totalAssigned },
    { id: '2', label: 'Acknowledged', value: summary.acknowledged },
    { id: '3', label: 'In Progress', value: summary.inProgress },
    { id: '4', label: 'Resolved', value: summary.resolved }
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <Text style={styles.kicker}>Official Role</Text>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutChip}>
              <Text style={styles.logoutChipText}>Logout</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.title}>Department Head-
           Dashboard</Text>
          <Text style={styles.subtitle}>
            Welcome, {userName}. Review assigned complaints and manage resolution.
          </Text>
        </View>

        <SectionHeader
          title="Overview"
          subtitle="A quick snapshot of currently assigned complaint volume."
        />

        {isLoading ? (
          <View style={styles.feedbackCard}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.feedbackText}>Loading dashboard summary...</Text>
          </View>
        ) : null}

        {!isLoading && errorMessage ? (
          <View style={styles.feedbackCard}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {!isLoading && !errorMessage ? (
          <View style={styles.summaryGrid}>
            {summaryCards.map((item) => (
              <View key={item.id} style={styles.summaryCard}>
                <Text style={styles.summaryValue}>{item.value}</Text>
                <Text style={styles.summaryLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <TouchableOpacity
          activeOpacity={0.88}
          style={styles.actionCard}
          onPress={() =>
            navigation.navigate('DepartmentComplaints', {
              user,
              authToken
            })
          }
        >
          <Text style={styles.actionTitle}>Manage Complaints</Text>
          <Text style={styles.actionDescription}>
            Open the department complaint queue and update progress for assigned cases.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.88}
          style={styles.actionCard}
          onPress={() =>
            navigation.navigate('DepartmentComplaintHistory', {
              user,
              authToken
            })
          }
        >
          <Text style={styles.actionTitle}>Complaint History</Text>
          <Text style={styles.actionDescription}>
            View resolved complaints that have been removed from the active manage complaints queue.
          </Text>
        </TouchableOpacity>
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
  kicker: {
    color: '#DDECF7',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6
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
  title: {
    color: colors.surface,
    fontSize: 28,
    fontWeight: '700',
    marginTop: 10
  },
  subtitle: {
    color: '#EAF4FB',
    fontSize: 15,
    marginTop: 8,
    lineHeight: 22
  },
  feedbackCard: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 22,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
    alignItems: 'center',
    marginBottom: 20
  },
  feedbackText: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 12
  },
  errorText: {
    fontSize: 14,
    color: colors.danger,
    lineHeight: 20,
    textAlign: 'center'
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24
  },
  summaryCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary
  },
  summaryLabel: {
    fontSize: 13,
    color: colors.textLight,
    marginTop: 8,
    lineHeight: 18
  },
  actionCard: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3
  },
  actionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text
  },
  actionDescription: {
    marginTop: 8,
    fontSize: 14,
    color: colors.textLight,
    lineHeight: 20
  }
});

export default DepartmentHomeScreen;
