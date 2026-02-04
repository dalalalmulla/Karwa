import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
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

  const notificationCount = data?.user.notificationCount ?? 0;
  const hasNotifications = notificationCount > 0;

  const handleNotificationPress = () => {
    // Navigate to notifications screen or show notifications
    Alert.alert('Notifications', `You have ${notificationCount} new update${notificationCount !== 1 ? 's' : ''}`);
    // TODO: Navigate to notifications screen when implemented
    // router.push('/notifications');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.logoContainer}>
            <Logo size={80} />
          </View>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={handleNotificationPress}
            activeOpacity={0.7}
          >
            <MaterialIcons name="notifications" size={24} color={colors.text} />
            {hasNotifications && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {notificationCount > 99 ? '99+' : notificationCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        <Text style={styles.name}>{getFullName()}</Text>
        <Text style={styles.subtitle}>{data?.user.email || 'N/A'}</Text>
      </View>

      <Card style={styles.card}>
        <View style={styles.statRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Rating Average</Text>
            <Text style={styles.statValue}>
              ⭐ {data?.user.ratingAverage !== undefined 
                ? data.user.ratingAverage.toFixed(1) 
                : '0.0'}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Completed Tasks</Text>
            <Text style={styles.statValue}>
              {data?.user.completedTasksCount ?? 0}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Earned Points</Text>
            <Text style={styles.statValue}>
              {data?.user.earnedPoints ?? 0}
            </Text>
          </View>
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
  headerTop: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
  },
  notificationButton: {
    position: 'relative',
    padding: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray100,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.error || '#FF3B30',
    borderRadius: borderRadius.full,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    borderWidth: 2,
    borderColor: colors.background,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  name: {
    ...typography.title,
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.secondary,
    textAlign: 'center',
  },
  card: {
    marginBottom: spacing.md,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    ...typography.caption,
    color: colors.secondary,
    marginBottom: spacing.xs,
  },
  statValue: {
    ...typography.heading,
    color: colors.text,
    fontSize: 20,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  logoutButton: {
    marginTop: spacing.lg,
  },
});

