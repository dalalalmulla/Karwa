import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, spacing, typography } from '@/constants/theme';
import Card from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface CollapsibleProps {
  title: string;
  children: React.ReactNode;
}

function Collapsible({ title, children }: CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card style={styles.collapsibleCard}>
      <TouchableOpacity
        style={styles.collapsibleHeader}
        onPress={() => setIsOpen(!isOpen)}
        activeOpacity={0.7}>
        <Text style={styles.collapsibleTitle}>{title}</Text>
        <IconSymbol
          name="chevron.right"
          size={20}
          color={colors.secondary}
          style={[styles.chevron, isOpen && styles.chevronOpen]}
        />
      </TouchableOpacity>
      {isOpen && <View style={styles.collapsibleContent}>{children}</View>}
    </Card>
  );
}

export default function ExploreScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Explore</Text>
        <Text style={styles.subtitle}>Discover features and learn more about Karwa</Text>
      </View>

      <Collapsible title="Task Management">
        <Text style={styles.text}>
          Manage your tasks efficiently. View available tasks, track your progress, and complete
          them to earn income.
        </Text>
      </Collapsible>

      <Collapsible title="Secure Communication">
        <Text style={styles.text}>
          All communication happens securely within the app. Your privacy and data are protected
          with industry-standard encryption.
        </Text>
      </Collapsible>

      <Collapsible title="Reputation System">
        <Text style={styles.text}>
          Build your reputation through consistent, quality work. Higher reputation unlocks better
          opportunities and higher-paying tasks.
        </Text>
      </Collapsible>

      <Collapsible title="Standardized Agreements">
        <Text style={styles.text}>
          Every task is backed by a standardized agreement. Clear terms, fair compensation, and
          transparent expectations for all parties.
        </Text>
      </Collapsible>

      <Card style={styles.infoCard}>
        <View style={styles.infoRow}>
          <IconSymbol name="house.fill" size={24} color={colors.primary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Need Help?</Text>
            <Text style={styles.infoText}>Contact support for assistance</Text>
          </View>
        </View>
      </Card>
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
  collapsibleCard: {
    marginBottom: spacing.md,
  },
  collapsibleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  collapsibleTitle: {
    ...typography.heading,
    color: colors.text,
    flex: 1,
  },
  chevron: {
    transform: [{ rotate: '0deg' }],
  },
  chevronOpen: {
    transform: [{ rotate: '90deg' }],
  },
  collapsibleContent: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  text: {
    ...typography.body,
    color: colors.secondary,
    lineHeight: 22,
  },
  infoCard: {
    marginTop: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  infoText: {
    ...typography.caption,
    color: colors.secondary,
  },
});
