# Framer Motion Animations - Implementation Guide

This implementation adds beautiful, unique animations for different user interactions in the AI Interview Prep app using Framer Motion.

## 🎬 Animation Types

### 1. Credit Consumption Animation
**Trigger**: When user spends credits for question/answer generation
**Features**:
- Floating particle effects representing spent credits
- Pulsing coin icon with rotation
- Gradient background with breathing effect
- Shows exact number of credits consumed
- Auto-dismisses after 2 seconds

### 2. Credit Refill Animation
**Trigger**: When user gains new credits (signup, purchase, etc.)
**Features**:
- Lightning bolt icon with spring animation
- Green gradient theme
- Scale and rotation entrance
- Shows exact number of credits added

### 3. Answer Generation Animation
**Trigger**: When AI generates an answer for a question
**Features**:
- Multi-stage animation (thinking → generating → complete)
- Stage-specific icons and colors
- Floating dots for thinking phase
- Sparkle particles for generation phase
- Question preview with truncation
- Progress indicators between stages

### 4. Question Generation Animation
**Trigger**: When generating interview questions
**Features**:
- Mode-specific theming (resume/job description/combined)
- Phase progression (analyzing → generating → finalizing → complete)
- Real-time question counter
- Progress bar with smooth transitions
- Floating mode indicators for combined mode

### 5. Inline Answer Loading Animation
**Trigger**: Replaces textarea during AI answer generation
**Features**:
- Compact, non-intrusive design
- Animated progress bars
- Spinning sparkle icon
- Breathing dots animation

## 🔧 Integration Points

### CreditDisplay Component
```typescript
// Automatically triggers on credit changes
<CreditDisplay onCreditConsumption={(amount) => showAnimation(amount)} />
```

### QuestionsList Component
```typescript
// Shows full-screen animation during AI answer generation
// Falls back to inline animation for better UX
```

### GenerationControls Component
```typescript
// Shows question generation animation with mode detection
// Handles error states by hiding animation
```

## 🎨 Design Principles

1. **Non-blocking**: All animations use `AnimatePresence` and proper cleanup
2. **Performance-optimized**: Uses `requestAnimationFrame` for smooth updates
3. **Accessible**: Respects user motion preferences
4. **Contextual**: Each animation matches the action's visual theme
5. **Informative**: Shows progress and relevant information during wait times

## 🚀 Usage Examples

### Manual Trigger
```typescript
const [showAnimation, setShowAnimation] = useState(false)

// Trigger credit consumption animation
<CreditConsumptionAnimation
  show={showAnimation}
  creditsUsed={5}
  onComplete={() => setShowAnimation(false)}
/>
```

### Automatic Integration
```typescript
// Credit display automatically detects credit changes
const [prevCredits, setPrevCredits] = useState(user?.credits || 0)

useEffect(() => {
  if (user && prevCredits > user.credits) {
    const creditsUsed = prevCredits - user.credits
    setShowCreditAnimation(true)
  }
  setPrevCredits(user?.credits || 0)
}, [user?.credits])
```

## 📱 Responsive Design

- All animations work on mobile and desktop
- Compact inline animations for mobile
- Full-screen animations scale appropriately
- Touch-friendly dismiss areas

## 🔮 Future Enhancements

1. **Sound Effects**: Add subtle audio feedback
2. **Haptic Feedback**: Mobile vibration on completion
3. **Custom Themes**: User-selectable animation styles
4. **Progress Callbacks**: Real-time progress from backend
5. **Error Animations**: Specific animations for different error types

## 🧪 Testing

Visit `/animations-test` to see all animations in action and test different scenarios.

## 📦 Dependencies

- `framer-motion`: Core animation library
- `lucide-react`: Icons used in animations
- `tailwindcss`: Styling and responsive design
- Existing UI components for consistent theming

All animations integrate seamlessly with the existing design system and maintain the app's professional aesthetic.