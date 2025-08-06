# Icon System Documentation

## Overview

Our application uses a unified, tree-shaken icon system based on Iconify that provides:

- ✅ **Tree-shaking**: Only includes icons that are actually used
- ✅ **CSP-safe**: No external API calls, all icons are bundled locally
- ✅ **Type-safe**: Full TypeScript support
- ✅ **Performance**: Minimal bundle size with optimized SVG data
- ✅ **Consistency**: Same behavior in development and production

## Architecture

### Components

1. **`src/components/ui/icon.tsx`** - Core Icon component
2. **`src/components/ui/icons.tsx`** - Icon definitions and exports
3. **`scripts/generate-icon-bundle.js`** - Bundle generation script
4. **`scripts/verify-icon-bundle.js`** - Bundle verification script
5. **`src/lib/icons/bundle.json`** - Generated icon bundle

### Icon Sets

We support multiple icon sets:

- **Lucide** (`lucide:*`) - Modern, consistent icon set
- **Material Design Icons** (`mdi:*`) - Google's Material Design icons
- **Iconify Icons** (`ic:*`) - Additional icon set

## Usage

### Basic Usage

```tsx
import { Icons } from '@/components/ui/icons'

// Use predefined icons
<>
  <Icons.eye className="size-6" />
  <Icons.loading className="size-10 animate-spin" />
</>
```

### Direct Icon Usage

```tsx
import { Icon } from '@/components/ui/icon'

// Use any icon from the bundle
<Icon name="lucide:home" size={24} className="text-blue-500" />
```

### Adding New Icons

1. **Add to Icons object** (recommended):

   ```tsx
   // In src/components/ui/icons.tsx
   export const Icons = {
     // ... existing icons
     newIcon: (props: IconProps) => <Icon name="lucide:star" {...props} />,
   }
   ```

2. **Use directly**:

   ```tsx
   <Icon name="lucide:star" size={20} />
   ```

3. **Regenerate bundle**:
   ```bash
   bun run generate:icons
   ```

## Development Workflow

### Adding New Icons

1. Use the icon in your component
2. Run `bun run generate:icons` to update the bundle
3. The build process will automatically include new icons

### Verification

```bash
# Verify icon bundle integrity
bun run verify:icons

# Generate and verify in one step
bun run generate:icons && bun run verify:icons
```

### Build Process

The build process automatically:

1. Scans the codebase for icon usage
2. Generates a minimal bundle with only used icons
3. Includes the bundle in the production build

## Bundle Analysis

### Current Bundle Stats

- **Total Icons**: 18
- **Icon Sets**: 3 (lucide, mdi, ic)
- **Bundle Size**: ~2KB (minimal)

### Bundle Contents

```
lucide:loader-circle, lucide:loader,
lucide:chevron-left,  lucide:chevron-right,
lucide:arrow-left,    lucide:plus,
lucide:minus,         lucide:pencil,
lucide:trash-2,       lucide:eye,
lucide:eye-off,       lucide:search,
lucide:x,             ic:sharp-water-drop,
mdi:bridge,           mdi:wallet,
mdi:qrcode,           mdi:cash-minus
```

### Bundle Structure

Each icon in the bundle includes:

- **body**: The SVG path data
- **viewBox**: The SVG viewBox attribute (typically "0 0 24 24")

## Benefits

### Performance

- **No external dependencies**: All icons are bundled locally
- **Minimal bundle size**: Only includes used icons
- **Fast loading**: No network requests for icons

### Security

- **CSP compliant**: No external API calls
- **Self-contained**: All icon data is local

### Developer Experience

- **Type safety**: Full TypeScript support
- **Consistent API**: Same interface for all icons
- **Easy maintenance**: Centralized icon management

### Production Ready

- **Tree-shaking**: Automatic optimization
- **SSR safe**: Works with server-side rendering
- **Turbopack compatible**: Works with Next.js 15

## Migration from Old System

### Before (SVG imports)

```tsx
import Image from 'next/image'
import eyeIcon from '@/public/app/icons/svg/eye.svg'

<Image src={eyeIcon} className="size-6" alt="Eye" />
```

### After (Iconify system)

```tsx
import { Icons } from '@/components/ui/icons'

<Icons.eye className="size-6" />
```

## Troubleshooting

### ViewBox Errors

If you see errors like "Expected number" for viewBox:

1. Ensure the icon bundle includes both `body` and `viewBox` properties
2. Run `bun run generate:icons` to regenerate the bundle
3. Check that the Icon component uses `iconData.viewBox` correctly

### Icon Not Found

If you see "Icon not found" warnings:

1. Check the icon name is correct
2. Ensure the icon exists in the supported icon sets
3. Run `bun run generate:icons` to update the bundle

### Build Errors

If the build fails:

1. Run `bun run verify:icons` to check bundle integrity
2. Ensure all icon names are valid
3. Check for typos in icon names

### Performance Issues

If you notice performance issues:

1. Check bundle size with `bun run analyze`
2. Ensure you're not importing unused icons
3. Consider using more specific icon names

## Future Enhancements

- [ ] Add more icon sets as needed
- [ ] Implement icon color theming
- [ ] Add icon animation support
- [ ] Create icon picker component
- [ ] Add icon search functionality
