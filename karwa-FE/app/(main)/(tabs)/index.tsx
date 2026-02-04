import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, typography } from '@/constants/theme';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Logo from '@/components/ui/Logo';

export default function HomeScreen() {
  const router = useRouter();
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Logo size={100} />
        </View>
        <Text style={styles.title}>Welcome to Karwa</Text>
        <Text style={styles.subtitle}>Your tasks, your income, your way</Text>
      </View>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Get Started</Text>
        <Text style={styles.cardText}>
          Start earning by completing daily tasks. Each task is backed by standardized agreements
          and secure communication.
        </Text>
        <Button
          title="Explore Tasks"
          onPress={() => console.log('Explore tasks')}
          style={styles.button}
        />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>How It Works</Text>
        <View style={styles.stepContainer}>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>1</Text>
            <Text style={styles.stepText}>Browse available tasks</Text>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>2</Text>
            <Text style={styles.stepText}>Accept and complete tasks</Text>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>3</Text>
            <Text style={styles.stepText}>Earn income securely</Text>
          </View>
        </View>
      </Card>

      <Card style={styles.lastCard}>
        <Text style={styles.cardTitle}>Your Reputation</Text>
        <Text style={styles.cardText}>
          Build your reputation through quality work. Higher reputation means better task matching and
          more opportunities.
        </Text>
        <View style={{ marginTop: spacing.md }}>
          <Button
            title="View Profile"
            onPress={() => {
              console.log('View Profile button pressed - navigating to profile');
              router.push('/(main)/profile');
            }}
            variant="primary"
          />
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
    paddingBottom: spacing.xl + 100, // Extra padding to ensure button is visible above tab bar
  },
  header: {
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: spacing.md,
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
    marginBottom: spacing.md,
  },
  lastCard: {
    marginBottom: spacing.xl + 20, // Extra margin for last card to ensure button visibility
  },
  cardTitle: {
    ...typography.heading,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  cardText: {
    ...typography.body,
    color: colors.secondary,
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  buttonContainer: {
    marginTop: spacing.md,
    width: '100%',
    minHeight: 50,
  },
  button: {
    marginTop: spacing.sm,
  },
  profileButton: {
    width: '100%',
    marginTop: 0,
    minHeight: 50,
  },
  stepContainer: {
    gap: spacing.md,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    color: colors.white,
    ...typography.body,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 32,
  },
  stepText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
});
