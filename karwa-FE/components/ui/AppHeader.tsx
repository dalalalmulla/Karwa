import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '@/src/context/ThemeContext';
import { spacing } from '@/constants/Karwa.theme';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
  showBranding?: boolean;
}

export default function AppHeader({
  title,
  subtitle,
  rightElement,
  showBranding = true,
}: AppHeaderProps) {
  const { theme, typography } = useTheme();

  return (
    <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
      {/* Left side - Title and subtitle */}
      <View style={styles.leftContainer}>
        {title && (
          <Text style={[styles.title, { color: theme.textTitle, fontSize: typography.title.fontSize }]}>
            {title}
          </Text>
        )}
        {subtitle && (
          <Text style={[styles.subtitle, { color: theme.textSecondary, fontSize: typography.caption.fontSize }]}>
            {subtitle}
          </Text>
        )}
      </View>

      {/* Right side - Branding or custom element */}
      <View style={styles.rightContainer}>
        {rightElement}
        {showBranding && (
          <View style={styles.branding}>
            <Image
              source={require('../../assets/images/Karwa.png')}
              style={styles.logo}
              contentFit="contain"
            />
            <Text style={[styles.appName, { color: theme.primary, fontSize: typography.body.fontSize }]}>
              Karwa
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
  },
  leftContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  title: {
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 2,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  branding: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  logo: {
    width: 28,
    height: 28,
  },
  appName: {
    fontWeight: '600',
  },
});
