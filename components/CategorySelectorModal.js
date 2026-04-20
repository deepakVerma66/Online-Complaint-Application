import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import colors from '../constants/colors';

const CategorySelectorModal = ({ visible, categories, selectedValue, onSelect, onClose }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modalCard} onPress={() => {}}>
          <Text style={styles.title}>Select Category</Text>
          <Text style={styles.subtitle}>Choose the complaint type that best matches the issue.</Text>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.listWrap}>
            {categories.map((category) => {
              const isSelected = selectedValue === category;

              return (
                <TouchableOpacity
                  key={category}
                  activeOpacity={0.85}
                  style={[styles.optionRow, isSelected && styles.selectedOptionRow]}
                  onPress={() => onSelect(category)}
                >
                  <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <TouchableOpacity activeOpacity={0.85} onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    paddingHorizontal: 22
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    maxHeight: '72%'
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textLight
  },
  listWrap: {
    marginTop: 18
  },
  optionRow: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#F8FBFD',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border
  },
  selectedOptionRow: {
    backgroundColor: colors.accent,
    borderColor: colors.primary
  },
  optionText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text
  },
  selectedOptionText: {
    color: colors.primaryDark
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 10
  },
  closeButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700'
  }
});

export default CategorySelectorModal;
