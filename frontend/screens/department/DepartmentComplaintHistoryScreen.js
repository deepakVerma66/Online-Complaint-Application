import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import SectionHeader from '../../components/SectionHeader';
import { buildApiUrl, buildUploadUrl } from '../../constants/api';
import colors from '../../constants/colors';

const formatComplaintId = (complaintId) => {
  if (!complaintId) {
    return 'Not available';
  }

  return `CMP-${complaintId.slice(-6).toUpperCase()}`;
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

const DepartmentComplaintHistoryScreen = ({ route }) => {
  const authToken = route?.params?.authToken;
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchHistory = useCallback(async () => {
    if (!authToken) {
      setComplaints([]);
      setErrorMessage('Login session not found. Please login again to view complaint history.');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');

      const response = await fetch(buildApiUrl('/api/complaints/department/history'), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setComplaints([]);
        setErrorMessage(data.message || 'Failed to fetch complaint history.');
        return;
      }

      setComplaints(data.complaints || []);
    } catch (error) {
      setComplaints([]);
      setErrorMessage('Unable to load complaint history. Please check the server connection and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [authToken]);

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [fetchHistory])
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <SectionHeader
          title="Complaint History"
          subtitle="Resolved complaints moved out of the active queue are shown here."
        />

        {isLoading ? (
          <View style={styles.centerCard}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.infoText}>Loading complaint history...</Text>
          </View>
        ) : null}

        {!isLoading && errorMessage ? (
          <View style={styles.centerCard}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {!isLoading && !errorMessage && !complaints.length ? (
          <View style={styles.centerCard}>
            <Text style={styles.emptyTitle}>No resolved complaints yet</Text>
            <Text style={styles.infoText}>
              Resolved department complaints will appear in this history screen.
            </Text>
          </View>
        ) : null}

        {!isLoading && !errorMessage && complaints.length
          ? complaints.map((item) => (
              <View key={item._id} style={styles.card}>
                <View style={styles.rowBetween}>
                  <Text style={styles.complaintId}>{formatComplaintId(item._id)}</Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>Resolved</Text>
                  </View>
                </View>

                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.metaText}>Category: {item.category}</Text>
                <Text style={styles.metaText}>Area: {item.area || 'Not available'}</Text>
                <Text style={styles.metaText}>Ward: {item.wardNumber ? `Ward ${item.wardNumber}` : 'Not available'}</Text>
                <Text style={styles.metaText}>Citizen: {item.citizen?.name || 'Not available'}</Text>
                <Text style={styles.metaText}>Resolved On: {formatCreatedDate(item.updatedAt)}</Text>

                <View style={styles.sectionBlock}>
                  <Text style={styles.sectionLabel}>Complaint Description</Text>
                  <Text style={styles.sectionText}>{item.description}</Text>
                </View>

                {item.departmentRemarks ? (
                  <View style={styles.sectionBlock}>
                    <Text style={styles.sectionLabel}>Officer Remarks</Text>
                    <Text style={styles.sectionText}>{item.departmentRemarks}</Text>
                  </View>
                ) : null}

                {item.departmentResolutionAttachments?.length ? (
                  <View style={styles.sectionBlock}>
                    <Text style={styles.sectionLabel}>Resolution Images</Text>
                    <View style={styles.imageGrid}>
                      {item.departmentResolutionAttachments.map((attachment, index) => (
                        <Image
                          key={`${item._id}-history-${index + 1}`}
                          source={{ uri: buildUploadUrl(attachment) }}
                          style={styles.attachmentImage}
                        />
                      ))}
                    </View>
                  </View>
                ) : null}
              </View>
            ))
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
    backgroundColor: '#E7F6EE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999
  },
  statusBadgeText: {
    fontSize: 12,
    color: colors.success,
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
  sectionText: {
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
  }
});

export default DepartmentComplaintHistoryScreen;
