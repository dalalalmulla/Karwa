import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/context/ThemeContext';
import { useAuth } from '@/src/context/AuthContext';
import { AntDesign } from '@expo/vector-icons';
import type { FontSizeScale } from '@/constants/Karwa.theme';
import { spacing, borderRadius, shadows } from '@/constants/Karwa.theme';
import WatermarkBackground from '@/components/ui/WatermarkBackground';
import Button from '@/components/ui/Button';

interface SettingItemProps {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  icon?: React.ReactNode;
}

function SettingItem({ title, subtitle, onPress, rightElement, icon }: SettingItemProps) {
  const { theme, typography } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.settingItem, { backgroundColor: theme.surface, borderColor: theme.border }]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.settingItemLeft}>
        {icon && <View style={styles.settingIcon}>{icon}</View>}
        <View style={styles.settingTextContainer}>
          <Text style={[styles.settingTitle, { color: theme.text, fontSize: typography.body.fontSize }]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.settingSubtitle, { color: theme.textSecondary, fontSize: typography.caption.fontSize }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {rightElement && <View style={styles.settingItemRight}>{rightElement}</View>}
    </TouchableOpacity>
  );
}

interface OptionButtonProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}

function OptionButton({ label, isSelected, onPress }: OptionButtonProps) {
  const { theme, typography } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.optionButton,
        {
          backgroundColor: isSelected ? theme.primary : theme.surface,
          borderColor: isSelected ? theme.primary : theme.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.optionButtonText,
          {
            color: isSelected ? theme.white : theme.text,
            fontSize: typography.caption.fontSize,
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const {
    theme,
    typography,
    themeMode,
    setThemeMode,
    fontSizeScale,
    setFontSizeScale,
  } = useTheme();
  const { logout } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const fontSizeOptions: { label: string; value: FontSizeScale }[] = [
    { label: 'Small', value: 'small' },
    { label: 'Medium', value: 'medium' },
    { label: 'Large', value: 'large' },
    { label: 'X-Large', value: 'xlarge' },
  ];

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoggingOut(true);
              await logout();
              router.replace('/(auth)/login');
            } catch (error) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  return (
    <WatermarkBackground style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <View>
            <Text style={[styles.headerTitle, { color: theme.textTitle, fontSize: typography.title.fontSize }]}>
              Settings
            </Text>
            <Text style={[styles.headerSubtitle, { color: theme.textSecondary, fontSize: typography.caption.fontSize }]}>
              Customize your app experience
            </Text>
          </View>
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary, fontSize: typography.caption.fontSize }]}>
            APPEARANCE
          </Text>

          {/* Dark Mode Toggle */}
          <SettingItem
            title="Dark Mode"
            subtitle="Switch between light and dark themes"
            rightElement={
              <Switch
                value={themeMode === 'dark'}
                onValueChange={(value) => setThemeMode(value ? 'dark' : 'light')}
                trackColor={{ false: theme.border, true: theme.primarySoft }}
                thumbColor={themeMode === 'dark' ? theme.primary : theme.surface}
              />
            }
          />
        </View>

        {/* Font Size Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary, fontSize: typography.caption.fontSize }]}>
            FONT SIZE
          </Text>

          <View style={[styles.optionsContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.optionHeader}>
              <Text style={[styles.optionTitle, { color: theme.textHeading, fontSize: typography.body.fontSize }]}>
                Text Size
              </Text>
            </View>
            <Text style={[styles.optionDescription, { color: theme.textSecondary, fontSize: typography.caption.fontSize }]}>
              Adjust the text size throughout the app
            </Text>
            <View style={styles.optionsRow}>
              {fontSizeOptions.map((option) => (
                <OptionButton
                  key={option.value}
                  label={option.label}
                  isSelected={fontSizeScale === option.value}
                  onPress={() => setFontSizeScale(option.value)}
                />
              ))}
            </View>
            {/* Preview text */}
            <View style={[styles.previewContainer, { borderColor: theme.border }]}>
              <Text style={[styles.previewLabel, { color: theme.textMuted, fontSize: typography.small.fontSize }]}>
                Preview:
              </Text>
              <Text style={[styles.previewText, { color: theme.text, fontSize: typography.body.fontSize }]}>
                This is how text will appear in the app.
              </Text>
            </View>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary, fontSize: typography.caption.fontSize }]}>
            ABOUT
          </Text>
          <View style={[styles.aboutContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.aboutAppName, { color: theme.text, fontSize: typography.heading.fontSize }]}>
              Karwa
            </Text>
            <Text style={[styles.appVersion, { color: theme.textMuted, fontSize: typography.caption.fontSize }]}>
              Version 1.0.0
            </Text>
          </View>
        </View>

        {/* Logout Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary, fontSize: typography.caption.fontSize }]}>
            ACCOUNT
          </Text>
          <SettingItem
            title="Logout"
            subtitle="Sign out of your account"
            icon={<AntDesign name="logout" size={20} color={theme.danger} />}
            onPress={handleLogout}
            rightElement={
              isLoggingOut ? (
                <ActivityIndicator size="small" color={theme.danger} />
              ) : (
                <AntDesign name="right" size={16} color={theme.textMuted} />
              )
            }
          />
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </WatermarkBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontWeight: '700',
  },
  headerSubtitle: {
    marginTop: spacing.xs,
  },

  // Section
  section: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: spacing.sm,
    letterSpacing: 0.5,
  },

  // Setting Item
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    ...shadows.subtle,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: spacing.md,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontWeight: '500',
  },
  settingSubtitle: {
    marginTop: 2,
  },
  settingItemRight: {
    marginLeft: spacing.md,
  },

  // Options Container
  optionsContainer: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    ...shadows.subtle,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  optionTitle: {
    fontWeight: '500',
  },
  optionDescription: {
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },

  // Option Button
  optionButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    minWidth: 70,
    alignItems: 'center',
  },
  optionButtonText: {
    fontWeight: '500',
  },

  // Preview
  previewContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
  },
  previewLabel: {
    marginBottom: spacing.xs,
  },
  previewText: {
    lineHeight: 22,
  },

  // About
  aboutContainer: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    ...shadows.subtle,
  },
  aboutAppName: {
    fontWeight: '600',
  },
  appVersion: {
    marginTop: spacing.xs,
  },

  bottomSpacer: {
    height: spacing.xl,
  },
});
