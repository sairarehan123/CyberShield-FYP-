import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

/**
 * Four pictorial illustrations in the same visual family as the logo:
 * one central object, radiating circuit lines, soft glow, lots of negative space.
 * Built only from Views + icons (no images, no extra packages).
 * Drawn on a fixed 300x300 canvas (centre = 150,150) and scaled to fit the screen.
 */
const CANVAS = 300;
const C = CANVAS / 2;
const BEVEL = '#CFAEE8'; // light lilac rim of the shield

// ---------- helpers ----------

const polar = (deg, r) => {
  const a = (deg * Math.PI) / 180;
  return { x: C + r * Math.cos(a), y: C + r * Math.sin(a) };
};

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a, b, t) => {
  const A = hex(a);
  const B = hex(b);
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',')})`;
};

// Place children centred on (x, y) inside a box of `size`.
function Place({ x, y, size, children, style }) {
  return (
    <View
      style={[
        {
          position: 'absolute',
          left: x - size / 2,
          top: y - size / 2,
          width: size,
          height: size,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

function Segment({ x1, y1, x2, y2, color = colors.accent, thickness = 1.5, opacity = 1 }) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
  return (
    <View
      style={{
        position: 'absolute',
        left: (x1 + x2) / 2 - len / 2,
        top: (y1 + y2) / 2 - thickness / 2,
        width: len,
        height: thickness,
        backgroundColor: color,
        opacity,
        transform: [{ rotate: `${ang}deg` }],
      }}
    />
  );
}

// ---------- shared scenery ----------

// Soft stepped glow behind the scene.
function Glow() {
  const steps = [
    { d: 288, c: colors.lilac },
    { d: 244, c: colors.lilac },
    { d: 200, c: colors.pink },
    { d: 158, c: colors.pink },
    { d: 116, c: colors.pinkStrong },
  ];
  return (
    <>
      {steps.map((s) => (
        <Place key={s.d} x={C} y={C} size={s.d}>
          <View style={{ width: s.d, height: s.d, borderRadius: s.d / 2, backgroundColor: s.c, opacity: 0.16 }} />
        </Place>
      ))}
    </>
  );
}

// Circuit lines radiating outward, with small nodes and the occasional bend (like the logo).
const SPOKE_LEN = [48, 30, 40, 26, 36, 22];
const SPOKES = Array.from({ length: 18 }, (_, i) => ({
  deg: i * 20 + 10,
  r0: 82 + (i % 3) * 6,
  len: SPOKE_LEN[i % 6],
  bend: i % 2 === 0 ? (i % 4 === 0 ? 40 : -40) : 0,
}));

function Spokes() {
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity: 0.5 }]}>
      {SPOKES.map((s, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            left: C,
            top: C,
            width: 0,
            height: 0,
            transform: [{ rotate: `${s.deg}deg` }],
          }}
        >
          <View style={[styles.spoke, { left: s.r0, top: -0.75, width: s.len }]} />
          {s.bend ? (
            <View
              style={{
                position: 'absolute',
                left: s.r0 + s.len,
                top: 0,
                width: 0,
                height: 0,
                transform: [{ rotate: `${s.bend}deg` }],
              }}
            >
              <View style={[styles.spoke, { left: 0, top: -0.75, width: 12 }]} />
              <View style={[styles.node, { left: 12 - 3.5, top: -3.5 }]} />
            </View>
          ) : (
            <View style={[styles.node, { left: s.r0 + s.len - 3.5, top: -3.5 }]} />
          )}
        </View>
      ))}
    </View>
  );
}

function Orbit({ r, opacity = 0.7 }) {
  return (
    <Place x={C} y={C} size={r * 2}>
      <View
        style={{
          width: r * 2,
          height: r * 2,
          borderRadius: r,
          borderWidth: 1.5,
          borderColor: colors.dotInactive,
          opacity,
        }}
      />
    </Place>
  );
}

function Scene({ children }) {
  return (
    <View style={styles.canvas}>
      <Glow />
      <Spokes />
      {children}
    </View>
  );
}

// ---------- reusable symbols ----------

// The shield: lilac rim, plum core, pink edge light, faint inner outline, white emblem.
function Shield({ x = C, y = C, size = 104, icon = 'lock-closed' }) {
  return (
    <Place x={x} y={y} size={size * 1.5}>
      <View
        style={{
          position: 'absolute',
          width: size * 0.75,
          height: size * 0.75,
          borderRadius: size,
          backgroundColor: colors.accent,
          shadowColor: colors.accent,
          shadowOpacity: 0.55,
          shadowRadius: 26,
          shadowOffset: { width: 0, height: 6 },
        }}
      />
      <Ionicons name="shield" size={size} color={BEVEL} style={styles.abs} />
      <Ionicons name="shield" size={size * 0.82} color={colors.primary} style={styles.abs} />
      <Ionicons
        name="shield"
        size={size * 0.82}
        color={colors.accent}
        style={[styles.abs, { opacity: 0.35, transform: [{ translateX: size * 0.06 }] }]}
      />
      <Ionicons
        name="shield-outline"
        size={size * 0.62}
        color={colors.white}
        style={[styles.abs, { opacity: 0.3 }]}
      />
      <Ionicons name={icon} size={size * 0.32} color={colors.white} style={styles.abs} />
    </Place>
  );
}

// Small round symbol chip.
function Chip({ x, y, icon, size = 42, highlight = false }) {
  return (
    <Place x={x} y={y} size={size * 1.7}>
      {highlight ? (
        <>
          <View style={[styles.halo, { width: size * 1.7, height: size * 1.7, borderRadius: size, opacity: 0.2 }]} />
          <View style={[styles.halo, { width: size * 1.35, height: size * 1.35, borderRadius: size, opacity: 0.3 }]} />
        </>
      ) : null}
      <View
        style={[
          styles.chip,
          { width: size, height: size, borderRadius: size / 2 },
          highlight && { borderColor: colors.accent, borderWidth: 1.5 },
        ]}
      >
        <Ionicons name={icon} size={size * 0.48} color={highlight ? colors.accent : colors.primary} />
      </View>
    </Place>
  );
}

// ---------- 1. Scan: know your habits ----------

function ScanIllustration() {
  const top = polar(-90, 108);
  const right = polar(0, 108);
  const bottom = polar(90, 108);
  const left = polar(180, 108);
  return (
    <Scene>
      <Orbit r={108} />
      <Place x={C} y={C} size={170}>
        <Ionicons name="scan-outline" size={158} color={colors.accent} />
      </Place>
      <Shield size={92} icon="finger-print" />
      <Chip {...top} icon="key-outline" />
      <Chip {...right} icon="link-outline" />
      <Chip {...bottom} icon="refresh-outline" />
      <Chip {...left} icon="wifi-outline" />
    </Scene>
  );
}

// ---------- 2. Insight: understand your risks ----------

function InsightIllustration() {
  const shield = { x: 140, y: 138 };
  const lens = { x: 174, y: 176, d: 86 };
  const link = { x: 236, y: 76 };
  return (
    <Scene>
      <Orbit r={112} opacity={0.5} />
      {/* thread from the highlighted point down to the lens */}
      <Segment x1={link.x} y1={link.y} x2={lens.x} y2={lens.y} opacity={0.65} />
      <Shield x={shield.x} y={shield.y} size={104} icon="lock-closed" />

      {/* magnifying glass */}
      <Place x={lens.x} y={lens.y} size={lens.d + 8}>
        <View
          style={{
            width: lens.d,
            height: lens.d,
            borderRadius: lens.d / 2,
            borderWidth: 7,
            borderColor: colors.primaryLight,
            backgroundColor: 'rgba(255,255,255,0.4)',
          }}
        />
      </Place>
      <View
        style={{
          position: 'absolute',
          left: lens.x,
          top: lens.y,
          width: 0,
          height: 0,
          transform: [{ rotate: '45deg' }],
        }}
      >
        <View style={styles.handle} />
      </View>

      <Chip x={60} y={96} icon="eye-off-outline" size={38} />
      <Chip x={76} y={232} icon="lock-closed-outline" size={38} />
      <Chip {...link} icon="link-outline" size={40} highlight />
    </Scene>
  );
}

// ---------- 3. Guidance: made for you ----------

function GuidanceIllustration() {
  const orb = { x: C, y: 76 };
  const shield = { x: C, y: 214 };
  return (
    <Scene>
      <Orbit r={112} opacity={0.45} />

      {/* flow from the AI to the shield */}
      <Segment x1={orb.x} y1={orb.y + 46} x2={shield.x} y2={shield.y - 56} opacity={0.6} />
      {[0.3, 0.55, 0.8].map((t) => (
        <View
          key={t}
          style={[
            styles.flowDot,
            { left: C - 3.5, top: orb.y + 46 + (shield.y - 56 - orb.y - 46) * t - 3.5 },
          ]}
        />
      ))}

      {/* AI orb */}
      <Place x={orb.x} y={orb.y} size={150}>
        <View style={[styles.halo, { width: 138, height: 138, borderRadius: 69, opacity: 0.18 }]} />
        <View style={[styles.halo, { width: 112, height: 112, borderRadius: 56, opacity: 0.26 }]} />
        <View style={styles.orb}>
          <LinearGradient
            colors={colors.gradientPrimary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.orbFill}
          >
            <Ionicons name="sparkles" size={40} color={colors.white} />
          </LinearGradient>
        </View>
      </Place>

      <Shield x={shield.x} y={shield.y} size={104} icon="person" />

      {/* quiet chat bubble + small accents */}
      <Place x={232} y={140} size={56}>
        <Ionicons name="chatbubble" size={50} color={BEVEL} />
        <Ionicons
          name="ellipsis-horizontal"
          size={20}
          color={colors.white}
          style={{ position: 'absolute', top: 14 }}
        />
      </Place>
      <Chip x={66} y={146} icon="lock-closed-outline" size={38} />
      <Ionicons name="sparkles" size={16} color={colors.accent} style={{ position: 'absolute', left: 78, top: 40, opacity: 0.8 }} />
      <Ionicons name="sparkles" size={12} color={colors.accent} style={{ position: 'absolute', left: 218, top: 34, opacity: 0.7 }} />
    </Scene>
  );
}

// ---------- 4. Growth: build safer habits ----------

const ARC_POINTS = 13;
const ARC_START = 135;
const ARC_SWEEP = -185; // from bottom-left, along the right side, up to the top-right
const BADGE_AT = [3, 6, 9];

function GrowthIllustration() {
  const pts = Array.from({ length: ARC_POINTS }, (_, i) => {
    const t = i / (ARC_POINTS - 1);
    return { t, ...polar(ARC_START + ARC_SWEEP * t, 112) };
  });
  return (
    <Scene>
      {pts.map((p, i) => {
        if (BADGE_AT.includes(i)) {
          return (
            <Place key={i} x={p.x} y={p.y} size={34}>
              <LinearGradient colors={colors.gradientPrimary} style={styles.badge}>
                <Ionicons name="checkmark" size={17} color={colors.white} />
              </LinearGradient>
            </Place>
          );
        }
        if (i === ARC_POINTS - 1) {
          return (
            <Place key={i} x={p.x} y={p.y} size={64}>
              <View style={[styles.halo, { width: 60, height: 60, borderRadius: 30, opacity: 0.25 }]} />
              <View style={styles.arrow}>
                <Ionicons name="arrow-up" size={20} color={colors.white} />
              </View>
            </Place>
          );
        }
        const s = 4 + p.t * 5;
        return (
          <Place key={i} x={p.x} y={p.y} size={12}>
            <View
              style={{
                width: s,
                height: s,
                borderRadius: s / 2,
                backgroundColor: mix(colors.dotInactive, colors.accent, p.t),
              }}
            />
          </Place>
        );
      })}

      <Shield size={104} icon="lock-closed" />
      <Chip x={56} y={104} icon="key-outline" size={36} />
      <Chip x={96} y={44} icon="lock-closed-outline" size={34} />
    </Scene>
  );
}

// ---------- public component ----------

const ART = {
  scan: ScanIllustration,
  insight: InsightIllustration,
  guidance: GuidanceIllustration,
  growth: GrowthIllustration,
};

function OnboardingIllustration({ name, size, label }) {
  const Art = ART[name];
  if (!Art) return null;
  return (
    <View
      style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}
      accessible
      accessibilityRole="image"
      accessibilityLabel={label}
    >
      <View style={{ width: CANVAS, height: CANVAS, transform: [{ scale: size / CANVAS }] }}>
        <Art />
      </View>
    </View>
  );
}

export default React.memo(OnboardingIllustration);

// ---------- styles ----------

const styles = StyleSheet.create({
  canvas: { width: CANVAS, height: CANVAS },
  abs: { position: 'absolute' },
  spoke: { position: 'absolute', height: 1.5, backgroundColor: colors.accent },
  node: {
    position: 'absolute',
    width: 7,
    height: 7,
    borderRadius: 3.5,
    borderWidth: 1.5,
    borderColor: colors.accent,
    backgroundColor: colors.white,
  },
  halo: { position: 'absolute', backgroundColor: colors.accent },
  chip: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  handle: {
    position: 'absolute',
    left: 40,
    top: -5,
    width: 42,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primaryLight,
  },
  orb: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.accent,
    shadowColor: colors.accent,
    shadowOpacity: 0.5,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
  },
  orbFill: { flex: 1, borderRadius: 44, alignItems: 'center', justifyContent: 'center' },
  flowDot: {
    position: 'absolute',
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.accent,
  },
  badge: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  arrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
});