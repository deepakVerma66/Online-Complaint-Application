import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import SectionHeader from '../../components/SectionHeader';
import CustomButton from '../../components/CustomButton';
import CustomInput from '../../components/CustomInput';
import colors from '../../constants/colors';

const statusOptions = ['Acknowledged', 'In Progress', 'Resolved'];

const initialComplaints = [
  {
    id: 'DPT-3101',
    title: 'Potholes on internal ward road',
    category: 'Road Maintenance',
    ward: 'Ward 8',
    department: 'Roads & Potholes',
    date: '03 Apr 2026',
    status: 'Acknowledged',
    remarks: 'Engineering review pending for material allocation.'
  },
  {
    id: 'DPT-3102',
    title: 'Drainage chamber damage near market',
    category: 'Drainage',
    ward: 'Ward 14',
    department: 'Sewage',
    date: '01 Apr 2026',
    status: 'In Progress',
    remarks: 'Site team has been assigned and repair is underway.'
  },
  {
    id: 'DPT-3103',
    title: 'Streetlight replacement request',
    category: 'Electrical',
    ward: 'Ward 19',
    department: 'Street Lighting',
    date: '29 Mar 2026',
    status: 'Resolved',
    remarks: 'Faulty unit replaced and inspection completed.'
  }
];

const DepartmentComplaintsScreen = () => {
  const [complaints, setComplaints] = useState(initialComplaints);

  const updateStatus = (complaintId, nextStatus) => {
    setComplaints((current) =>
      current.map((item) =>
        item.id === complaintId ? { ...item, status: nextStatus } : item
      )
    );
  };

  const updateRemarks = (complaintId, nextRemarks) => {
    setComplaints((current) =>
      current.map((item) =>
        item.id === complaintId ? { ...item, remarks: nextRemarks } : item
      )
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <SectionHeader
          title="Assigned Complaints"
          subtitle="Department-side demo queue with status controls and remarks preview."
        />

        {complaints.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={styles.complaintId}>{item.id}</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusBadgeText}>{item.status}</Text>
              </View>
            </View>

            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.metaText}>Category: {item.category}</Text>
            <Text style={styles.metaText}>Assigned Ward: {item.ward}</Text>
            <Text style={styles.metaText}>Assigned Department: {item.department}</Text>
            <Text style={styles.metaText}>Submitted Date: {item.date}</Text>

            <Text style={styles.sectionLabel}>Update Status</Text>
            <View style={styles.chipRow}>
              {statusOptions.map((status) => {
                const active = item.status === status;

                return (
                  <TouchableOpacity
                    key={status}
                    style={[styles.chip, active && styles.activeChip]}
                    onPress={() => updateStatus(item.id, status)}
                  >
                    <Text style={[styles.chipText, active && styles.activeChipText]}>
                      {status}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.remarksBox}>
              <CustomInput
                label="Officer Remarks / Action Taken"
                placeholder="Add department remarks for demo UI"
                value={item.remarks}
                onChangeText={(text) => updateRemarks(item.id, text)}
                multiline
              />
            </View>

            <CustomButton title="Update Status" onPress={() => {}} style={styles.updateButton} />
          </View>
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
    alignItems: 'center',
    marginBottom: 12
  },
  complaintId: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '700'
  },
  statusBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999
  },
  statusBadgeText: {
    fontSize: 12,
    color: colors.primaryDark,
    fontWeight: '700'
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10
  },
  metaText: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 6
  },
  sectionLabel: {
    marginTop: 14,
    marginBottom: 10,
    fontSize: 14,
    fontWeight: '700',
    color: colors.text
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: colors.surface
  },
  activeChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  chipText: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: '600'
  },
  activeChipText: {
    color: colors.surface
  },
  remarksBox: {
    marginTop: 12,
    backgroundColor: '#F8FBFD',
    borderRadius: 16,
    padding: 14
  },
  updateButton: {
    marginTop: 12
  }
});

export default DepartmentComplaintsScreen;
