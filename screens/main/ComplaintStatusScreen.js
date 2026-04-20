import React, { useCallback, useState } from 'react';
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from '@react-navigation/native';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import SectionHeader from '../../components/SectionHeader';
import { buildApiUrl, buildUploadUrl } from '../../constants/api';
import colors from '../../constants/colors';

const complaintStages = [
  { key: 'received', title: 'Received' },
  { key: 'forwarded_to_department', title: 'Forwarded to Department' },
  { key: 'acknowledged', title: 'Acknowledged' },
  { key: 'in_progress', title: 'In Progress' },
  { key: 'resolved', title: 'Resolved' }
];

const statusLabels = {
  received: 'Received',
  forwarded_to_department: 'Forwarded to Department',
  acknowledged: 'Acknowledged',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  completed: 'Resolved'
};

const formatComplaintId = (complaintId) => {
  if (!complaintId) {
    return 'Not available';
  }

  return `CMP-${complaintId.slice(-6).toUpperCase()}`;
};

const formatStatusLabel = (status) => {
  return statusLabels[status] || 'Received';
};

const formatAssignedCounselor = (assignedCounselor, wardNumber) => {
  if (assignedCounselor?.name && assignedCounselor?.ward) {
    return `${assignedCounselor.name} (Ward ${assignedCounselor.ward})`;
  }

  if (assignedCounselor?.name) {
    return assignedCounselor.name;
  }

  if (wardNumber) {
    return `Ward ${wardNumber} counselor`;
  }

  return 'Not assigned yet';
};

const formatCreatedDate = (dateValue) => {
  if (!dateValue) {
    return 'Not available';
  }

  const parsedDate = new Date(dateValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Not available';
  }

  return parsedDate.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const getStageIndex = (status) => {
  const normalizedStatus = status === 'completed' ? 'resolved' : status;
  const stageIndex = complaintStages.findIndex((item) => item.key === normalizedStatus);

  return stageIndex === -1 ? 0 : stageIndex;
};

const ComplaintStatusScreen = ({ route }) => {
  const authToken = route?.params?.authToken;
  const currentUser = route?.params?.user;
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaintId, setSelectedComplaintId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchComplaints = useCallback(async () => {
    if (!authToken) {
      setErrorMessage('Login session not found. Please login again to view your complaints.');
      setComplaints([]);
      setSelectedComplaintId('');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');

      const response = await fetch(buildApiUrl('/api/complaints/my'), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMessage(data.message || 'Failed to fetch complaints.');
        setComplaints([]);
        setSelectedComplaintId('');
        return;
      }

      const complaintList = data.complaints || [];

      setComplaints(complaintList);
      setSelectedComplaintId((currentSelectedComplaintId) => {
        const hasExistingSelection = complaintList.some((item) => item._id === currentSelectedComplaintId);

        if (hasExistingSelection) {
          return currentSelectedComplaintId;
        }

        return complaintList[0]?._id || '';
      });
    } catch (error) {
      setErrorMessage('Unable to load complaints. Please check the server connection and try again.');
      setComplaints([]);
      setSelectedComplaintId('');
    } finally {
      setIsLoading(false);
    }
  }, [authToken]);

  useFocusEffect(
    useCallback(() => {
      fetchComplaints();
    }, [fetchComplaints])
  );

  const selectedComplaint = complaints.find((item) => item._id === selectedComplaintId) || complaints[0] || null;
  const activeStageIndex = getStageIndex(selectedComplaint?.status);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <SectionHeader
          title="Track Your Complaint"
          subtitle={`View complaints submitted by ${currentUser?.name || 'your account'}.`}
        />

        {isLoading ? (
          <View style={styles.centerCard}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.infoMessage}>Loading your complaints...</Text>
          </View>
        ) : null}

        {!isLoading && errorMessage ? (
          <View style={styles.centerCard}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {!isLoading && !errorMessage && !complaints.length ? (
          <View style={styles.centerCard}>
            <Text style={styles.emptyTitle}>No complaints found</Text>
            <Text style={styles.emptyText}>
              Complaints posted from this logged-in citizen account will appear here.
            </Text>
          </View>
        ) : null}

        {!isLoading && !errorMessage && complaints.length ? (
          <>
            <View style={styles.complaintListCard}>
              <Text style={styles.sectionTitle}>Your Complaints</Text>
              {complaints.map((item) => {
                const isSelected = item._id === selectedComplaint?._id;

                return (
                  <TouchableOpacity
                    key={item._id}
                    activeOpacity={0.88}
                    style={[styles.complaintListItem, isSelected && styles.selectedComplaintListItem]}
                    onPress={() => setSelectedComplaintId(item._id)}
                  >
                    <View style={styles.complaintListTextWrap}>
                      <Text style={[styles.complaintListTitle, isSelected && styles.selectedComplaintListTitle]}>
                        {item.title}
                      </Text>
                      <Text style={styles.complaintListMeta}>
                        {item.category} . {formatCreatedDate(item.createdAt)}
                      </Text>
                    </View>
                    <View style={[styles.statusChip, isSelected && styles.selectedStatusChip]}>
                      <Text style={[styles.statusChipText, isSelected && styles.selectedStatusChipText]}>
                        {formatStatusLabel(item.status)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {selectedComplaint ? (
              <>
                <View style={styles.infoCard}>
                  <View style={styles.infoRow}>
                    <View style={styles.infoBlock}>
                      <Text style={styles.infoLabel}>Complaint ID</Text>
                      <Text style={styles.infoValue}>{formatComplaintId(selectedComplaint._id)}</Text>
                    </View>
                    <View style={styles.infoBlock}>
                      <Text style={styles.infoLabel}>Status</Text>
                      <Text style={styles.infoValue}>{formatStatusLabel(selectedComplaint.status)}</Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <Text style={styles.infoLabel}>Complaint Title</Text>
                  <Text style={styles.infoValue}>{selectedComplaint.title}</Text>

                  <Text style={[styles.infoLabel, styles.topSpacing]}>Category</Text>
                  <Text style={styles.infoValue}>{selectedComplaint.category}</Text>

                  <Text style={[styles.infoLabel, styles.topSpacing]}>Area / Locality</Text>
                  <Text style={styles.infoValue}>{selectedComplaint.area}</Text>

                  <Text style={[styles.infoLabel, styles.topSpacing]}>Assigned Councillor</Text>
                  <Text style={styles.infoValue}>
                    {formatAssignedCounselor(
                      selectedComplaint.assignedToCounselor,
                      selectedComplaint.wardNumber
                    )}
                  </Text>

                  <Text style={[styles.infoLabel, styles.topSpacing]}>Submitted On</Text>
                  <Text style={styles.infoValue}>{formatCreatedDate(selectedComplaint.createdAt)}</Text>

                  <Text style={[styles.infoLabel, styles.topSpacing]}>Description</Text>
                  <Text style={styles.infoDescription}>{selectedComplaint.description}</Text>
                </View>

                <View style={styles.trackerCard}>
                  {complaintStages.map((item, index) => {
                    const isLastItem = index === complaintStages.length - 1;
                    const isActive = index <= activeStageIndex;

                    return (
                      <View key={item.key} style={styles.stageRow}>
                        <View style={styles.markerColumn}>
                          <View style={[styles.circle, isActive && styles.activeCircle]}>
                            <Text style={[styles.circleText, isActive && styles.activeCircleText]}>
                              {index + 1}
                            </Text>
                          </View>
                          {!isLastItem ? (
                            <View style={[styles.line, isActive && styles.activeLine]} />
                          ) : null}
                        </View>

                        <View style={styles.stageContent}>
                          <Text style={styles.stageTitle}>{item.title}</Text>
                          <Text style={styles.stageSubtitle}>
                            {isActive
                              ? 'Stage updated and visible to the citizen.'
                              : 'This stage will be updated as your complaint progresses.'}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>

                <View style={styles.remarksCard}>
                  <Text style={styles.remarksTitle}>Current Update</Text>
                  <Text style={styles.remarksText}>
                    Current complaint status: {formatStatusLabel(selectedComplaint.status)}.
                  </Text>
                  {selectedComplaint.departmentRemarks ? (
                    <Text style={styles.remarksText}>
                      Department remarks: {selectedComplaint.departmentRemarks}
                    </Text>
                  ) : null}
                </View>

                {selectedComplaint.departmentResolutionAttachments?.length ? (
                  <View style={styles.resolutionCard}>
                    <Text style={styles.remarksTitle}>Resolution Images</Text>
                    <View style={styles.imageGrid}>
                      {selectedComplaint.departmentResolutionAttachments.map((attachment, index) => (
                        <Image
                          key={`${selectedComplaint._id}-resolution-${index + 1}`}
                          source={{ uri: buildUploadUrl(attachment) }}
                          style={styles.resolutionImage}
                        />
                      ))}
                    </View>
                  </View>
                ) : null}
              </>
            ) : null}
          </>
        ) : null}
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
  centerCard: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 22,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
    alignItems: 'center'
  },
  infoMessage: {
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
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text
  },
  emptyText: {
    fontSize: 14,
    color: colors.textLight,
    lineHeight: 20,
    marginTop: 8,
    textAlign: 'center'
  },
  complaintListCard: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 14
  },
  complaintListItem: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center'
  },
  selectedComplaintListItem: {
    borderColor: colors.primary,
    backgroundColor: colors.accent
  },
  complaintListTextWrap: {
    flex: 1,
    paddingRight: 12
  },
  complaintListTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text
  },
  selectedComplaintListTitle: {
    color: colors.primaryDark
  },
  complaintListMeta: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 6
  },
  statusChip: {
    borderRadius: 999,
    backgroundColor: '#EEF6FB',
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  selectedStatusChip: {
    backgroundColor: colors.primary
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryDark
  },
  selectedStatusChipText: {
    color: colors.surface
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
    marginBottom: 20
  },
  infoRow: {
    flexDirection: 'row'
  },
  infoBlock: {
    flex: 1,
    paddingRight: 10
  },
  infoLabel: {
    fontSize: 13,
    color: colors.textLight,
    marginBottom: 6
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text
  },
  infoDescription: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22
  },
  topSpacing: {
    marginTop: 16
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16
  },
  trackerCard: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3
  },
  stageRow: {
    flexDirection: 'row'
  },
  markerColumn: {
    width: 34,
    alignItems: 'center'
  },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center'
  },
  activeCircle: {
    borderColor: colors.primary,
    backgroundColor: colors.primary
  },
  circleText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textLight
  },
  activeCircleText: {
    color: colors.surface
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: colors.border,
    marginVertical: 4
  },
  activeLine: {
    backgroundColor: colors.primary
  },
  stageContent: {
    flex: 1,
    paddingLeft: 14,
    paddingBottom: 22
  },
  stageTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text
  },
  stageSubtitle: {
    fontSize: 13,
    color: colors.textLight,
    marginTop: 6,
    lineHeight: 19
  },
  remarksCard: {
    backgroundColor: '#EEF6FB',
    borderRadius: 20,
    padding: 18,
    marginTop: 20
  },
  remarksTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primaryDark,
    marginBottom: 8
  },
  remarksText: {
    fontSize: 13,
    color: colors.primaryDark,
    lineHeight: 20,
    marginTop: 4
  },
  resolutionCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 18,
    marginTop: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 12
  },
  resolutionImage: {
    width: '48%',
    height: 150,
    borderRadius: 14,
    backgroundColor: colors.accent,
    marginBottom: 10
  }
});

export default ComplaintStatusScreen;
