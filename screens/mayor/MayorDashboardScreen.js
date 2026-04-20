import React, { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import colors from '../../constants/colors';
import { buildApiUrl } from '../../constants/api';
import { councillorsData } from '../../constants/councillorsData';

const MayorDashboardScreen = ({ navigation, route }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [overview, setOverview] = useState({
    summary: {
      totalComplaints: 0,
      acknowledgedComplaints: 0,
      resolvedComplaints: 0,
      pendingComplaints: 0,
      inProgressComplaints: 0
    },
    wardMetrics: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const authToken = route?.params?.authToken;
  const userName = route?.params?.user?.name || 'Mayor';

  const handleLogout = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }]
    });
  };

  const fetchOverview = useCallback(async () => {
    if (!authToken) {
      setOverview({
        summary: {
          totalComplaints: 0,
          acknowledgedComplaints: 0,
          resolvedComplaints: 0,
          pendingComplaints: 0,
          inProgressComplaints: 0
        },
        wardMetrics: []
      });
      setErrorMessage('Login session not found. Please login again to view mayor dashboard data.');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');

      const response = await fetch(buildApiUrl('/api/complaints/mayor/overview'), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setOverview({
          summary: {
            totalComplaints: 0,
            acknowledgedComplaints: 0,
            resolvedComplaints: 0,
            pendingComplaints: 0,
            inProgressComplaints: 0
          },
          wardMetrics: []
        });
        setErrorMessage(data.message || 'Failed to fetch mayor dashboard data.');
        return;
      }

      setOverview({
        summary: {
          totalComplaints: data.summary?.totalComplaints || 0,
          acknowledgedComplaints: data.summary?.acknowledgedComplaints || 0,
          resolvedComplaints: data.summary?.resolvedComplaints || 0,
          pendingComplaints: data.summary?.pendingComplaints || 0,
          inProgressComplaints: data.summary?.inProgressComplaints || 0
        },
        wardMetrics: data.wardMetrics || []
      });
    } catch (error) {
      setOverview({
        summary: {
          totalComplaints: 0,
          acknowledgedComplaints: 0,
          resolvedComplaints: 0,
          pendingComplaints: 0,
          inProgressComplaints: 0
        },
        wardMetrics: []
      });
      setErrorMessage('Unable to load mayor dashboard data. Please check the server connection and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [authToken]);

  useFocusEffect(
    useCallback(() => {
      fetchOverview();
    }, [fetchOverview])
  );

  const wardMetricsMap = useMemo(() => {
    return new Map(
      overview.wardMetrics.map((item) => [item.wardNumber, item])
    );
  }, [overview.wardMetrics]);

  const councillorRecords = useMemo(() => {
    return councillorsData.map((item) => {
      const wardMetrics = wardMetricsMap.get(item.wardNumber);

      return {
        ...item,
        totalComplaints: wardMetrics?.totalComplaints || 0,
        acknowledgedComplaints: wardMetrics?.acknowledgedComplaints || 0,
        resolvedComplaints: wardMetrics?.resolvedComplaints || 0,
        pendingComplaints: wardMetrics?.pendingComplaints || 0,
        inProgressComplaints: wardMetrics?.inProgressComplaints || 0
      };
    });
  }, [wardMetricsMap]);

  const filteredCouncillors = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return councillorRecords;
    }

    return councillorRecords.filter((item) => {
      return (
        item.name.toLowerCase().includes(normalizedQuery) ||
        String(item.wardNumber).includes(normalizedQuery) ||
        item.area.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [councillorRecords, searchQuery]);

  const summaryCards = [
    { id: '1', label: 'Total Wards', value: String(councillorsData.length) },
    { id: '2', label: 'Total Councillors', value: String(councillorsData.length) },
    { id: '3', label: 'Total Complaints', value: String(overview.summary.totalComplaints) },
    { id: '4', label: 'Acknowledged Complaints', value: String(overview.summary.acknowledgedComplaints) },
    { id: '5', label: 'Resolved Complaints', value: String(overview.summary.resolvedComplaints) },
    { id: '6', label: 'Pending Complaints', value: String(overview.summary.pendingComplaints) },
    { id: '7', label: 'In Progress Complaints', value: String(overview.summary.inProgressComplaints) }
  ];

  const renderHeader = () => (
    <View>
      <View style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <Text style={styles.kicker}>Executive View</Text>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutChip}>
            <Text style={styles.logoutChipText}>Logout</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.title}>Mayor Dashboard</Text>
        <Text style={styles.subtitle}>
          Welcome, {userName}. Monitor ward performance, complaint volume, and councillor activity from one place.
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.feedbackCard}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.feedbackText}>Loading city complaint data...</Text>
        </View>
      ) : null}

      {!isLoading && errorMessage ? (
        <View style={styles.feedbackCard}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}

      <Text style={styles.sectionTitle}>City Summary</Text>
      <View style={styles.summaryGrid}>
        {summaryCards.map((item) => (
          <View key={item.id} style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{item.value}</Text>
            <Text style={styles.summaryLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.searchCard}>
        <Text style={styles.searchLabel}>Search Councillors</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, ward number, or area"
          placeholderTextColor={colors.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <Text style={styles.sectionTitle}>Councillor Performance</Text>
      <Text style={styles.sectionSubtitle}>
        Showing {filteredCouncillors.length} councillor records with live complaint data.
      </Text>
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.rowBetween}>
        <View style={styles.nameWrap}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.area}>{item.area}</Text>
        </View>
        <View style={styles.wardChip}>
          <Text style={styles.wardChipText}>Ward {item.wardNumber}</Text>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metricBox}>
          <Text style={styles.metricValue}>{item.totalComplaints}</Text>
          <Text style={styles.metricLabel}>Total</Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricValue}>{item.resolvedComplaints}</Text>
          <Text style={styles.metricLabel}>Resolved</Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricValue}>{item.pendingComplaints}</Text>
          <Text style={styles.metricLabel}>Pending</Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricValue}>{item.inProgressComplaints}</Text>
          <Text style={styles.metricLabel}>In Progress</Text>
        </View>
      </View>

      <View style={styles.footerRow}>
        <Text style={styles.address}>{item.address}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={filteredCouncillors}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      />
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
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 14
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 18
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 22
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
    marginTop: 8,
    fontSize: 13,
    color: colors.textLight,
    lineHeight: 18
  },
  searchCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 18,
    marginBottom: 22,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3
  },
  searchLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10
  },
  searchInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.text
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
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  nameWrap: {
    flex: 1,
    paddingRight: 10
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text
  },
  area: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 6
  },
  wardChip: {
    backgroundColor: colors.accent,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  wardChipText: {
    fontSize: 12,
    color: colors.primaryDark,
    fontWeight: '700'
  },
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16
  },
  metricBox: {
    width: '23%',
    backgroundColor: '#F8FBFD',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary
  },
  metricLabel: {
    fontSize: 11,
    color: colors.textLight,
    marginTop: 6,
    textAlign: 'center'
  },
  footerRow: {
    marginTop: 8
  },
  address: {
    fontSize: 13,
    color: colors.textLight,
    lineHeight: 19,
    marginBottom: 12
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8F5EC',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.success
  }
});

export default MayorDashboardScreen;
