import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import SectionHeader from '../../components/SectionHeader';
import CustomButton from '../../components/CustomButton';
import CustomInput from '../../components/CustomInput';
import colors from '../../constants/colors';

const departmentOptions = [
  'Water Supply',
  'Sewage',
  'Sanitation',
  'Roads & Potholes',
  'Street Lighting',
  'Waste Management',
  'Parks / Public Spaces',
];

const initialComplaints = [
  {
    id: 'CMP-2401',
    title: 'Overflowing garbage near market lane',
    category: 'Sanitation',
    area: 'Ward 12 - Tungbala',
    date: '02 Apr 2026',
    status: 'Submitted',
    assignedDepartment: '',
    remarks: ''
  },
  {
    id: 'CMP-2402',
    title: 'Broken streetlight near school gate',
    category: 'Electrical',
    area: 'Ward 12 - Majitha Road',
    date: '01 Apr 2026',
    status: 'Forwarded to Department',
    assignedDepartment: 'Street Lighting',
    remarks: 'Priority route near school zone.'
  },
  {
    id: 'CMP-2403',
    title: 'Drainage blockage after rain',
    category: 'Drainage',
    area: 'Ward 12 - Sandhu Colony',
    date: '29 Mar 2026',
    status: 'Submitted',
    assignedDepartment: '',
    remarks: ''
  }
];

const CounselorComplaintsScreen = () => {
  const [complaints, setComplaints] = useState(initialComplaints);

  const updateDepartment = (complaintId, nextDepartment) => {
    setComplaints((current) =>
      current.map((item) =>
        item.id === complaintId ? { ...item, assignedDepartment: nextDepartment } : item
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

  const forwardComplaint = (complaintId) => {
    setComplaints((current) =>
      current.map((item) =>
        item.id === complaintId && item.assignedDepartment
          ? { ...item, status: 'Forwarded to Department' }
          : item
      )
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <SectionHeader
          title="Ward Complaints"
          subtitle="Review complaints from the ward and forward them to the appropriate department."
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
            <Text style={styles.metaText}>Area: {item.area}</Text>
            <Text style={styles.metaText}>Submitted Date: {item.date}</Text>
            {item.assignedDepartment ? (
              <Text style={styles.metaText}>Assigned Department: {item.assignedDepartment}</Text>
            ) : null}

            <Text style={styles.sectionLabel}>Forward To Department</Text>
            <View style={styles.chipRow}>
              {departmentOptions.map((department) => {
                const active = item.assignedDepartment === department;

                return (
                  <TouchableOpacity
                    key={department}
                    style={[styles.chip, active && styles.activeChip]}
                    onPress={() => updateDepartment(item.id, department)}
                  >
                    <Text style={[styles.chipText, active && styles.activeChipText]}>
                      {department}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <CustomInput
              label="Counselor Remarks"
              placeholder="Optional forwarding note for the department"
              value={item.remarks}
              onChangeText={(text) => updateRemarks(item.id, text)}
            />

            <CustomButton
              title="Forward Complaint"
              onPress={() => forwardComplaint(item.id)}
              style={styles.forwardButton}
            />
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
  forwardButton: {
    marginTop: 2
  }
});

export default CounselorComplaintsScreen;
