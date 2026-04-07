import React, { useMemo, useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import colors from '../../constants/colors';
import { councillorsData } from '../../constants/councillorsData';

const MayorDashboardScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const totals = useMemo(() => {
    return councillorsData.reduce(
      (acc, item) => {
        acc.totalComplaints += item.totalComplaints;
        acc.resolvedComplaints += item.resolvedComplaints;
        acc.pendingComplaints += item.pendingComplaints;
        acc.inProgressComplaints += item.inProgressComplaints;
        return acc;
      },
      {
        totalComplaints: 0,
        resolvedComplaints: 0,
        pendingComplaints: 0,
        inProgressComplaints: 0
      }
    );
  }, []);

  const filteredCouncillors = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return councillorsData;
    }

    return councillorsData.filter((item) => {
      return (
        item.name.toLowerCase().includes(normalizedQuery) ||
        String(item.wardNumber).includes(normalizedQuery) ||
        item.area.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [searchQuery]);

  const summaryCards = [
    { id: '1', label: 'Total Wards', value: String(councillorsData.length) },
    { id: '2', label: 'Total Councillors', value: String(councillorsData.length) },
    { id: '3', label: 'Total Complaints', value: String(totals.totalComplaints) },
    { id: '4', label: 'Resolved Complaints', value: String(totals.resolvedComplaints) },
    { id: '5', label: 'Pending Complaints', value: String(totals.pendingComplaints) },
    { id: '6', label: 'In Progress Complaints', value: String(totals.inProgressComplaints) }
  ];

  const renderHeader = () => (
    <View>
      <View style={styles.heroCard}>
        <Text style={styles.kicker}>Executive View</Text>
        <Text style={styles.title}>Mayor Dashboard</Text>
        <Text style={styles.subtitle}>
          Monitor ward performance, complaint volume, and councillor activity from one place.
        </Text>
      </View>

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
        Showing {filteredCouncillors.length} councillor records from the current dataset.
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
  kicker: {
    color: '#DDECF7',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6
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
