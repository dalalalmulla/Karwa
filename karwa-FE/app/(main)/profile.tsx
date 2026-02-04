import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Logo from '@/components/ui/Logo';
import { getCurrentUser } from '@/src/api/auth';
import { useAuth } from '@/src/context/AuthContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { logout, token } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Redirect to login if no token
  useEffect(() => {
    if (!token) {
      console.log('No token found, redirecting to login');
      router.replace('/(auth)/login');
    }
  }, [token, router]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
    retry: 1,
    enabled: !!token, // Only run query if token exists
  });

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      router.replace('/(auth)/login');
    } catch (error) {
      Alert.alert('Error', 'Failed to logout. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  const getFullName = () => {
    const firstName = data?.user.firstName || '';
    const lastName = data?.user.lastName || '';
    if (firstName || lastName) {
      return `${firstName} ${lastName}`.trim();
    }
    return 'Not provided';
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (error) {
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    const isNetworkError = errorMessage.includes('Network') || errorMessage.includes('timeout') || errorMessage.includes('ECONNREFUSED');
    const isAuthError = errorMessage.includes('Authentication') || errorMessage.includes('token') || errorMessage.includes('401');
    
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Failed to load profile</Text>
          <Text style={styles.errorText}>
            {errorMessage}
          </Text>
          {isAuthError && (
            <View style={styles.networkHelp}>
              <Text style={styles.helpTitle}>Authentication Required:</Text>
              <Text style={styles.helpText}>• Your session may have expired</Text>
              <Text style={styles.helpText}>• Please login again to continue</Text>
            </View>
          )}
          {isNetworkError && (
            <View style={styles.networkHelp}>
              <Text style={styles.helpTitle}>Troubleshooting:</Text>
              <Text style={styles.helpText}>• Make sure backend server is running</Text>
              <Text style={styles.helpText}>• Ensure your device is on the same WiFi network</Text>
              <Text style={styles.helpText}>• Check if backend is accessible at: 192.168.3.170:8000</Text>
            </View>
          )}
          {isAuthError ? (
            <Button
              title="Go to Login"
              onPress={() => router.replace('/(auth)/login')}
              style={styles.retryButton}
            />
          ) : (
            <>
              <Button
                title="Retry"
                onPress={() => refetch()}
                style={styles.retryButton}
              />
              <Button
                title="Go Back"
                onPress={() => router.back()}
                variant="secondary"
                style={styles.backButton}
              />
            </>
          )}
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Logo size={80} />
        </View>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Your account information</Text>
      </View>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Personal Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Name</Text>
          <Text style={styles.infoValue}>{getFullName()}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{data?.user.email || 'N/A'}</Text>
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Performance</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Rating Average</Text>
          <Text style={styles.infoValue}>
            {data?.user.ratingAverage !== undefined 
              ? data.user.ratingAverage.toFixed(1) 
              : '0.0'}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Completed Tasks</Text>
          <Text style={styles.infoValue}>
            {data?.user.completedTasksCount ?? 0}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Earned Points</Text>
          <Text style={styles.infoValue}>
            {data?.user.earnedPoints ?? 0}
          </Text>
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Account Details</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>User ID</Text>
          <Text style={styles.infoValue} numberOfLines={1}>
            {data?.user._id || 'N/A'}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Member Since</Text>
          <Text style={styles.infoValue}>{formatDate(data?.user.createdAt)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Last Updated</Text>
          <Text style={styles.infoValue}>{formatDate(data?.user.updatedAt)}</Text>
        </View>
      </Card>

      <Button
        title={isLoggingOut ? 'Logging out...' : 'Logout'}
        onPress={handleLogout}
        variant="secondary"
        style={styles.logoutButton}
        disabled={isLoggingOut}
      />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    gap: spacing.md,
  },
  loadingText: {
    ...typography.body,
    color: colors.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  errorTitle: {
    ...typography.heading,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  errorText: {
    ...typography.body,
    color: colors.secondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  retryButton: {
    marginTop: spacing.md,
  },
  backButton: {
    marginTop: spacing.sm,
  },
  networkHelp: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.gray100,
    borderRadius: borderRadius.md,
    width: '100%',
  },
  helpTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  helpText: {
    ...typography.caption,
    color: colors.secondary,
    marginBottom: spacing.xs,
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
  cardTitle: {
    ...typography.heading,
    color: colors.text,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  infoLabel: {
    ...typography.body,
    color: colors.secondary,
    flex: 1,
  },
  infoValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  logoutButton: {
    marginTop: spacing.lg,
  },
});

