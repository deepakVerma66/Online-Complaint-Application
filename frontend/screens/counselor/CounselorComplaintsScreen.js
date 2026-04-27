import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import SectionHeader from '../../components/SectionHeader';
import CustomButton from '../../components/CustomButton';
import { buildApiUrl, buildUploadUrl } from '../../constants/api';
import colors from '../../constants/colors';

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

const getStatusBadgeStyle = (status) => {
  if (status === 'completed' || status === 'resolved') {
    return {
      backgroundColor: '#E7F6EE',
      textColor: colors.success
    };
  }

  if (status === 'forwarded_to_department') {
    return {
      backgroundColor: '#FFF4DA',
      textColor: '#A66A00'
    };
  }

  if (status === 'in_progress') {
    return {
      backgroundColor: '#E9F3FB',
      textColor: colors.secondary
    };
  }

  return {
    backgroundColor: colors.accent,
    textColor: colors.primaryDark
  };
};

const CounselorComplaintsScreen = ({ route }) => {
  const user = route?.params?.user;
  const authToken = route?.params?.authToken;
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [forwardingComplaintId, setForwardingComplaintId] = useState('');

  const fetchComplaints = useCallback(async () => {
    if (!authToken) {
      setComplaints([]);
      setErrorMessage('Login session not found. Please login again to view assigned complaints.');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');

      const response = await fetch(buildApiUrl('/api/complaints/counselor/my'), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setComplaints([]);
        setErrorMessage(data.message || 'Failed to fetch assigned complaints.');
        return;
      }

      setComplaints(data.complaints || []);
    } catch (error) {
      setComplaints([]);
      setErrorMessage('Unable to load assigned complaints. Please check the server connection and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [authToken]);

  useFocusEffect(
    useCallback(() => {
      fetchComplaints();
    }, [fetchComplaints])
  );

  const handleForwardToDepartment = async (complaintId) => {
    if (!authToken || forwardingComplaintId) {
      return;
    }

    const targetComplaint = complaints.find((item) => item._id === complaintId);

    if (targetComplaint?.status === 'forwarded_to_department') {
      return;
    }

    try {
      setForwardingComplaintId(complaintId);

      const response = await fetch(buildApiUrl(`/api/complaints/${complaintId}/counselor/forward`), {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        Alert.alert('Forward failed', data.message || 'Unable to forward complaint to department.');
        return;
      }

      setComplaints((currentComplaints) =>
        currentComplaints.map((item) =>
          item._id === complaintId
            ? {
                ...item,
                ...data.complaint
              }
            : item
        )
      );

      Alert.alert(
        'Complaint forwarded',
        'The complaint has been forwarded to the department head and the status is now updated.'
      );
    } catch (error) {
      Alert.alert(
        'Forward failed',
        'Unable to forward complaint right now. Please check the server connection and try again.'
      );
    } finally {
      setForwardingComplaintId('');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <SectionHeader
          title="My Assigned Complaints"
          subtitle={`Only complaints assigned to ${user?.name || 'this councillor'} are shown here.`}
        />

        {isLoading ? (
          <View style={styles.centerCard}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.infoText}>Loading assigned complaints...</Text>
          </View>
        ) : null}

        {!isLoading && errorMessage ? (
          <View style={styles.centerCard}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {!isLoading && !errorMessage && !complaints.length ? (
          <View style={styles.centerCard}>
            <Text style={styles.emptyTitle}>No active complaints found</Text>
            <Text style={styles.infoText}>
              Complaints stay here only until they are forwarded to the department.
            </Text>
          </View>
        ) : null}

        {!isLoading && !errorMessage && complaints.length
          ? complaints.map((item) => {
              const badgeStyle = getStatusBadgeStyle(item.status);
              const isForwarding = forwardingComplaintId === item._id;
              const canForward = item.status === 'received';

              return (
                <View key={item._id} style={styles.card}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.complaintId}>{formatComplaintId(item._id)}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: badgeStyle.backgroundColor }]}>
                      <Text style={[styles.statusBadgeText, { color: badgeStyle.textColor }]}>
                        {formatStatusLabel(item.status)}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.metaText}>Category: {item.category}</Text>
                  <Text style={styles.metaText}>Area: {item.area || 'Not available'}</Text>
                  <Text style={styles.metaText}>Ward: {item.wardNumber ? `Ward ${item.wardNumber}` : 'Not available'}</Text>
                  <Text style={styles.metaText}>Submitted On: {formatCreatedDate(item.createdAt)}</Text>
                  <Text style={styles.metaText}>Citizen: {item.citizen?.name || 'Not available'}</Text>
                  {item.landmark ? <Text style={styles.metaText}>Landmark: {item.landmark}</Text> : null}

                  <View style={styles.sectionBlock}>
                    <Text style={styles.sectionLabel}>Description</Text>
                    <Text style={styles.descriptionText}>{item.description}</Text>
                  </View>

                  {item.attachments?.length ? (
                    <View style={styles.sectionBlock}>
                      <Text style={styles.sectionLabel}>Complaint Images</Text>
                      <View style={styles.imageGrid}>
                        {item.attachments.map((attachment, index) => (
                          <Image
                            key={`${item._id}-attachment-${index + 1}`}
                            source={{ uri: buildUploadUrl(attachment) }}
                            style={styles.attachmentImage}
                          />
                        ))}
                      </View>
                    </View>
                  ) : null}

                  <View style={styles.sectionBlock}>
                    <Text style={styles.sectionLabel}>Assignment</Text>
                    <Text style={styles.assignmentText}>
                      Assigned to: {item.assignedToCounselor?.name || user?.name || 'Current councillor'}
                    </Text>
                    <Text style={styles.assignmentSubtext}>
                      Forwarding will update the complaint status for both the councillor and citizen views.
                    </Text>
                  </View>

                  <CustomButton
                    title={
                      isForwarding
                        ? 'Forwarding...'
                        : canForward
                          ? 'Forward to Department'
                          : 'Already Forwarded'
                    }
                    onPress={() => {
                      if (canForward) {
                        handleForwardToDepartment(item._id);
                      }
                    }}
                    style={[
                      styles.forwardButton,
                      !canForward && styles.disabledForwardButton
                    ]}
                  />
                </View>
              );
            })
          : null}
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
  infoText: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 20
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999
  },
  statusBadgeText: {
    fontSize: 12,
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
  sectionBlock: {
    marginTop: 14,
    backgroundColor: '#F8FBFD',
    borderRadius: 16,
    padding: 14
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8
  },
  descriptionText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  attachmentImage: {
    width: '48%',
    height: 150,
    borderRadius: 14,
    backgroundColor: colors.accent,
    marginBottom: 10
  },
  assignmentText: {
    fontSize: 14,
    color: colors.primaryDark,
    lineHeight: 20,
    fontWeight: '600'
  },
  assignmentSubtext: {
    fontSize: 13,
    color: colors.textLight,
    lineHeight: 19,
    marginTop: 6
  },
  forwardButton: {
    marginTop: 14
  },
  disabledForwardButton: {
    opacity: 0.7
  }
});

export default CounselorComplaintsScreen;
