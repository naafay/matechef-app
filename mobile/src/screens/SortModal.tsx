import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme';

const { height } = Dimensions.get('window');

type Props = {
  selectedOption: string;
  onSelect: (option: string) => void;
  onCancel: () => void;
};

const SORT_OPTIONS = [
  'Recommended',
  'Price: High to Low',
  'Price: Low to High',
  'Newest',
  'Oldest',
  'Closest to me',
];

export default function SortModal({ selectedOption, onSelect, onCancel }: Props) {
  return (
    <TouchableWithoutFeedback onPress={onCancel}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback>
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.title}>Sort by</Text>
              <TouchableOpacity onPress={onCancel}>
                <Ionicons name="close" size={24} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            {SORT_OPTIONS.map((opt) => {
              const isActive = opt === selectedOption;
              return (
                <TouchableOpacity
                  key={opt}
                  style={[styles.optionRow, isActive && styles.optionRowActive]}
                  onPress={() => onSelect(opt)}
                >
                  <Text style={[styles.optionText, isActive && styles.optionTextActive]}>
                    {opt}
                  </Text>
                  {isActive && <Ionicons name="checkmark" size={20} color={Colors.primary} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: height * 0.6,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  optionRowActive: {
    backgroundColor: '#F2F2F2',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  optionTextActive: {
    fontWeight: '700',
    color: Colors.primary,
  },
});
