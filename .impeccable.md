# Bridge Trainer — Design Context

## Users

Beginners learning contract bridge at home, on their own time. They're likely casual learners studying in relaxed settings — evenings, weekends, quiet moments. They may feel intimidated by bridge's complexity and need an interface that feels approachable, not overwhelming. They chose this app because they want to learn, not because they're already experts.

## Brand Personality

**Elegant, classic, timeless.**

Bridge is a game with deep tradition. The interface should feel like a well-appointed card room — refined, unhurried, and quietly confident. Not flashy or trendy. Not cold or sterile. The warmth comes from craftsmanship and attention to detail, not from brightness or decoration.

Think of the physical objects in a bridge player's world: green baize felt, gilt-edged playing cards, a leather-bound score pad, polished wood. The digital equivalent is restrained luxury — rich colors, beautiful typography, generous spacing, and subtle texture.

## Aesthetic Direction

**Visual tone**: Refined traditionalism — classic card-room atmosphere rendered with modern web craft. The Swiss-typographic "Card Table Modernist" direction is the right neighborhood, but it should lean warmer and more inviting than strictly minimal.

**References** (spiritual, not literal):
- The typography and restraint of a fine print book or broadsheet
- The color palette of a card table: green felt, warm cream, gold leaf, dark wood
- The quiet confidence of luxury stationery (monogrammed cards, wax seals)

**Anti-references** (explicitly NOT this):
- Neon/glowing dark mode with cyan accents (trendy crypto/gaming aesthetic)
- Playful/cartoony illustrations (undermines the classic tone)
- Dense dashboard-style layouts with metric cards and sparklines
- Generic SaaS admin panel with Inter and blue buttons

**Theme**: Both light and dark, user-switchable.
- **Light**: Warm cream background, emerald green accents, gold highlights. Like a sunlit card room.
- **Dark**: Deep green-black background (card table at night), lighter emerald accents, warm gold. Soft, not harsh — imagine reading under a green-shaded banker's lamp.

## Typography Direction

**Display font**: Bodoni Moda — high-contrast Didone serif, evokes classic printing traditions and luxury. The hairline thins and bold strokes create drama at heading sizes while feeling unmistakably "timeless."

**Body font**: Libre Franklin — warm humanist grotesque, highly readable at body sizes. Pairs naturally with Bodoni Moda's precision without competing with it.

**Monospace**: JetBrains Mono (for scores, bids, numbers) — crisp tabular figures, already in use and appropriate for this role.

## Color Direction

**Light palette**:
- Background: warm cream (oklch ~0.97, tinted toward yellow hue 90)
- Text: dark charcoal with warm tint (oklch ~0.20)
- Primary: deep emerald green (oklch ~0.35, hue 165)
- Accent: gold (oklch ~0.65, hue 80)
- Surfaces: warm off-white with subtle green tint

**Dark palette**:
- Background: very dark green-black (oklch ~0.15, hue 165)
- Text: warm off-white (oklch ~0.92)
- Primary: lighter emerald (oklch ~0.55, hue 165)
- Accent: warm gold (oklch ~0.72, hue 80)
- Surfaces: slightly lighter green-black

All neutrals tinted toward brand hue 165 (emerald) for subconscious cohesion.

## Design Principles

1. **Quiet craft speaks loudest** — Elegance comes from restraint, precision, and details you feel before you notice. Every element earns its place.

2. **Bridge tradition, modern execution** — Draw from the rich visual heritage of card games (felt, gold, cream, serif type) but render it with modern web standards and interaction patterns.

3. **Approachable sophistication** — Beginners should feel welcomed, not intimidated. Classic doesn't mean stiff. Generous spacing, clear hierarchy, and warm colors keep it inviting.

4. **Dark mode as atmosphere, not gimmick** — The dark theme should feel like a card table at night under soft light — warm and enveloping, not cold and stark.

5. **Typography as personality** — The Didone display serif is the single strongest brand signal. Let it carry the weight of "timeless" so everything else can be simple.
