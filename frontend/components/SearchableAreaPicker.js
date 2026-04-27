import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import colors from '../constants/colors';

const getOptionLabel = (option) => {
  if (typeof option === 'string') {
    return option;
  }

  return option?.label || option?.area || '';
};

const getOptionValue = (option) => {
  if (typeof option === 'string') {
    return option;
  }

  return option?.value || option?.area || '';
};

const SearchableAreaPicker = ({ label, placeholder, value, options, onSelect, onSelectOption }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOptions = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return options;
    }

    return options.filter((item) => {
      const optionLabel = getOptionLabel(item).toLowerCase();
      const wardLabel = typeof item === 'string' ? '' : `ward ${item.wardNumber ?? ''}`.toLowerCase();

      return optionLabel.includes(normalizedQuery) || wardLabel.includes(normalizedQuery);
    });
  }, [options, searchQuery]);

  const openModal = () => setIsVisible(true);

  const closeModal = () => {
    setIsVisible(false);
    setSearchQuery('');
  };

  const handleSelect = (selectedOption) => {
    onSelect(getOptionValue(selectedOption));
    if (onSelectOption) {
      onSelectOption(selectedOption);
    }
    closeModal();
  };

  const renderItem = ({ item }) => {
    const optionLabel = getOptionLabel(item);
    const optionValue = getOptionValue(item);
    const isSelected = optionValue === value;

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={[styles.optionItem, isSelected && styles.selectedOptionItem]}
        onPress={() => handleSelect(item)}
      >
        <View style={styles.optionContent}>
          <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>{optionLabel}</Text>
          {typeof item !== 'string' && item.wardNumber ? (
            <Text style={[styles.wardText, isSelected && styles.selectedWardText]}>
              Ward {item.wardNumber}
            </Text>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>

      <TouchableOpacity activeOpacity={0.85} style={styles.trigger} onPress={openModal}>
        <Text style={[styles.triggerText, !value && styles.placeholderText]}>
          {value || placeholder}
        </Text>
        <Text style={styles.triggerHint}>Select</Text>
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <Pressable style={styles.overlay} onPress={closeModal}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <View style={styles.headerRow}>
              <View style={styles.headerTextWrap}>
                <Text style={styles.modalTitle}>Select Area / Locality</Text>
                <Text style={styles.modalSubtitle}>Search and choose your area from the list.</Text>
              </View>

              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.searchInput}
              placeholder="Search area or locality"
              placeholderTextColor={colors.textLight}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <FlatList
              data={filteredOptions}
              keyExtractor={(item, index) =>
                typeof item === 'string' ? `${item}-${index}` : `${item.wardNumber}-${item.area}-${index}`
              }
              renderItem={renderItem}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No matching areas found.</Text>
                </View>
              }
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 18
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8
  },
  trigger: {
    minHeight: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  triggerText: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    paddingRight: 12
  },
  placeholderText: {
    color: colors.textLight
  },
  triggerHint: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600'
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.36)',
    justifyContent: 'center',
    paddingHorizontal: 18
  },
  modalCard: {
    maxHeight: '68%',
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 18,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 8
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14
  },
  headerTextWrap: {
    flex: 1,
    paddingRight: 12
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text
  },
  modalSubtitle: {
    fontSize: 13,
    color: colors.textLight,
    marginTop: 4,
    lineHeight: 18
  },
  closeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: colors.accent
  },
  closeButtonText: {
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: '700'
  },
  searchInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: '#FAFCFE',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.text,
    marginBottom: 14
  },
  listContent: {
    paddingBottom: 4
  },
  optionItem: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 10,
    backgroundColor: colors.surface
  },
  selectedOptionItem: {
    borderColor: colors.primary,
    backgroundColor: colors.accent
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  optionText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
    paddingRight: 12
  },
  selectedOptionText: {
    color: colors.primaryDark,
    fontWeight: '700'
  },
  wardText: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: '600'
  },
  selectedWardText: {
    color: colors.primaryDark
  },
  emptyState: {
    paddingVertical: 24,
    alignItems: 'center'
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.textLight
  }
});

export default SearchableAreaPicker;
