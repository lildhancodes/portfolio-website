/**
 * Reframe component: DepthCarousel
 *
 * This runtime is generated from Framer to preserve its variants, animations,
 * styles, and nested component behavior. Keep custom styling in your app CSS
 * or pass className/style when the component's internal styles allow it.
 * Usage and prop documentation: https://reframe.elxr.studio/docs
 */
/**
 * This typed facade exposes the generated Framer runtime with editor-friendly
 * props, variants, className, and style support.
 */
import type {
  ComponentType,
  CSSProperties,
  HTMLAttributes,
  ReactElement,
  ReactNode,
  Ref,
} from "react";

// @ts-expect-error The generated JavaScript runtime does not include its own declaration file.
import RuntimeComponent from "./depth-carousel.runtime.jsx";

/** Values accepted by Framer's Link property control. */
export type FramerLinkValue =
  | string
  | { href?: string; [key: string]: unknown };

/** Values accepted by Framer's Responsive Image property control. */
export interface FramerImageValue {
  src?: string;
  srcSet?: string;
  alt?: string;
  [key: string]: unknown;
}

/** Values accepted by Framer's Border property control. */
export interface FramerBorderValue {
  borderColor?: string;
  borderStyle?: string;
  borderWidth?: number;
  borderTopWidth?: number;
  borderRightWidth?: number;
  borderBottomWidth?: number;
  borderLeftWidth?: number;
  [key: string]: unknown;
}

/** Values accepted by Framer's BoxShadow property control. */
export interface FramerBoxShadowValue {
  type?: string;
  x?: number;
  y?: number;
  blur?: number;
  spread?: number;
  color?: string;
  inset?: boolean;
  diffusion?: number;
  focus?: number;
  [key: string]: unknown;
}

/** Values accepted by Framer's Font property control. */
export interface FramerFontValue {
  fontFamily?: string;
  fontSize?: number | string;
  fontWeight?: number | string;
  fontStyle?: string;
  lineHeight?: number | string;
  letterSpacing?: number | string;
  textAlign?: string;
  [key: string]: unknown;
}

/** Values accepted by Framer's Transition property control. */
export interface FramerTransitionValue {
  type?: string;
  duration?: number;
  delay?: number;
  ease?: string | number[];
  stiffness?: number;
  damping?: number;
  mass?: number;
  bounce?: number;
  velocity?: number;
  [key: string]: unknown;
}

/** Framer variant names and internal IDs available on this component. */
export type DepthCarouselVariant = string;
export type DepthCarouselBreakpoint =
  | "base"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl";

export interface DepthCarouselProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "color"> {
  children?: ReactNode;
  locale?: string;
  style?: CSSProperties;
  ref?: Ref<HTMLElement>;
  layoutId?: string;
  variant?: DepthCarouselVariant;
  slides?: ({ image?: FramerImageValue | string; caption?: string })[];
  height?: number;
  cardWidth?: number;
  cardHeight?: number;
  sideScale?: number;
  spacing?: number;
  depth?: number;
  curve?: number;
  perspective?: number;
  stiffness?: number;
  damping?: number;
  radius?: number;
  maxBlur?: number;
  reflection?: boolean;
  reflectionStrength?: number;
  vignette?: number;
  edgeSpread?: number;
  edgeStrength?: number;
  background?: string;
  labelColor?: string;
  showCounter?: boolean;
  hint?: string;
  font?: FramerFontValue;
}

export interface DepthCarouselResponsiveProps
  extends Omit<DepthCarouselProps, "variant"> {
  variants?: Partial<Record<DepthCarouselBreakpoint, DepthCarouselVariant>>;
}

export interface DepthCarouselComponent {
  (props?: DepthCarouselProps): ReactElement | null;
  Responsive: ComponentType<DepthCarouselResponsiveProps>;
}

/**
 * Typed public facade over Framer's generated component runtime.
 * The runtime file is machine-generated to preserve Framer fidelity.
 */

const runtimeDefaults = ((RuntimeComponent as unknown as {
  defaultProps?: Record<string, unknown>;
}).defaultProps ?? {}) as Record<string, unknown>;

function normalizeRuntimeProps<T>(props?: T): T {
  const normalized = {
    ...runtimeDefaults,
    ...((props ?? {}) as object),
  } as Record<string, unknown>;
  for (const key of Object.keys(normalized)) {
    if (normalized[key] === undefined) {
      if (runtimeDefaults[key] === undefined) delete normalized[key];
      else normalized[key] = runtimeDefaults[key];
    }
  }

  if (!Array.isArray(normalized["slides"])) {
    normalized["slides"] = Array.isArray(runtimeDefaults["slides"])
      ? runtimeDefaults["slides"]
      : [];
  }
  return normalized as T;
}





const DepthCarousel = ((props: DepthCarouselProps = {}) => {
  const normalized = normalizeRuntimeProps(props);
  return <RuntimeComponent {...normalized} />;
}) as unknown as DepthCarouselComponent;

Object.assign(DepthCarousel, RuntimeComponent);
DepthCarousel.Responsive = (props: DepthCarouselResponsiveProps) => (
  <RuntimeComponent.Responsive {...normalizeRuntimeProps(props)} />
);

export default DepthCarousel;
