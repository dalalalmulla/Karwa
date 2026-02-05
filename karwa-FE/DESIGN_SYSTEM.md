# Karwa Design System

## Overview
Modern, minimalist design system for the Karwa app with reusable components and consistent theming.

## Design Principles
1. **Minimalist**: Clean, uncluttered interfaces with plenty of white space
2. **Consistent**: Reusable components ensure visual consistency
3. **Accessible**: High contrast, readable fonts, clear hierarchy
4. **Modern**: Rounded corners, subtle shadows, smooth interactions

## Components

### Core UI Components

#### Card
- **Variants**: `default`, `elevated`, `outlined`, `flat`
- **Padding**: `none`, `small`, `medium`, `large`
- **Usage**: Container for content with consistent styling

#### Button
- **Variants**: `primary`, `secondary`
- **States**: `loading`, `disabled`
- **Modern**: Larger touch targets (48px), rounded corners

#### Badge
- **Variants**: `primary`, `secondary`, `success`, `warning`, `danger`, `info`
- **Sizes**: `small`, `medium`, `large`
- **Usage**: Status indicators, labels, tags

#### StatusBadge
- **Purpose**: Task status display
- **Auto-maps**: Task status to appropriate badge variant

#### StatCard
- **Purpose**: Display statistics/metrics
- **Features**: Icon support, label/value layout

#### EmptyState
- **Purpose**: Empty list/state messaging
- **Features**: Icon, title, message, optional action button

#### SectionHeader
- **Purpose**: Section titles with optional actions
- **Features**: Title, subtitle, action button

#### MetaInfo
- **Purpose**: Display metadata (icon + label + value)
- **Usage**: Task cards, detail views

### TaskCard
- **Purpose**: Reusable task card component
- **Features**: Title, description, status, points, metadata
- **Consistent**: Used across all task lists

## Typography Scale
- **Title**: 26px, Bold (700)
- **Heading**: 20px, Semi-bold (600)
- **Body**: 15px, Regular (400)
- **Caption**: 13px, Regular (400)
- **Small**: 11px, Regular (400)

## Spacing Scale
- **xs**: 4px
- **sm**: 6px
- **md**: 12px
- **lg**: 16px
- **xl**: 24px

## Border Radius
- **sm**: 4px
- **md**: 8px
- **lg**: 12px
- **full**: 9999px (circular)

## Shadows
- **subtle**: Light shadow for default cards
- **medium**: Deeper shadow for elevated elements

## Color System
Uses Karwa brand colors with semantic naming:
- **Primary**: Blue (#227CC5)
- **Success**: Green (#43A661)
- **Danger**: Red (#DC3545)
- **Warning**: Yellow (#F2C94C)

## Usage Examples

### Task Card
```tsx
<TaskCard
  task={task}
  onPress={() => router.push(`/task/${task._id}`)}
/>
```

### Empty State
```tsx
<EmptyState
  title="No tasks found"
  message="Create your first task to get started"
  actionLabel="Create Task"
  onAction={() => router.push('/create-task')}
/>
```

### Stat Card
```tsx
<StatCard
  label="Rating"
  value="4.5"
  icon={<StarIcon />}
/>
```

## Best Practices
1. Always use theme context for colors
2. Use reusable components instead of custom styles
3. Maintain consistent spacing using the spacing scale
4. Use semantic color names (primary, success, etc.)
5. Ensure touch targets are at least 44px (48px preferred)

