import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, typography } from '@/constants/theme';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function ModalScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Modal</Text>
        <Text style={styles.subtitle}>This is a modal screen</Text>
      </View>

      <Card style={styles.card}>
        <Text style={styles.cardText}>
          This modal demonstrates the design system components and styling. You can use this as a
          reference for building new screens.
        </Text>
      </Card>

      <View style={styles.buttonContainer}>
        <Button title="Close" onPress={() => router.back()} variant="secondary" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.title,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.secondary,
  },
  card: {
    marginBottom: spacing.lg,
  },
  cardText: {
    ...typography.body,
    color: colors.secondary,
    lineHeight: 22,
  },
  buttonContainer: {
    marginTop: spacing.md,
  },
});
