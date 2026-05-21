/**
 * Concept icons extracted from the upstream Fibe icon set at
 *   fibe/packs/shared_kernel/app/components/components/icons/svg_data.rb
 *
 * Each icon is a 24×24 viewBox SVG that inherits color from `currentColor`
 * so it picks up the parent text color via CSS.
 */
import React from 'react';

const Svg = ({children, ...rest}) => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    aria-hidden="true"
    {...rest}
  >
    {children}
  </svg>
);

// Marquee — umbrella shape (verbatim from svg_data.rb UMBRELLA_ICON_DATA).
export const MarqueeIcon = (props) => (
  <Svg {...props}>
    <g strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
      <line x1="12" y1="1" x2="12" y2="4" />
      <path d="M12 1.5l2 1-2 1" />
      <path d="M3.5 14C3.5 8.5 7 4 12 4s8.5 4.5 8.5 10" />
      <line x1="12" y1="4" x2="12" y2="14" />
      <line x1="12" y1="4" x2="7" y2="14" />
      <line x1="12" y1="4" x2="17" y2="14" />
      <line x1="12" y1="4" x2="4" y2="13" />
      <line x1="12" y1="4" x2="20" y2="13" />
      <path d="M3.5 14q1.7 2 3.5 0t3.5 0 3.5 0 3.5 0" />
      <line x1="5" y1="16" x2="5" y2="21" />
      <line x1="19" y1="16" x2="19" y2="21" />
      <line x1="3" y1="21" x2="21" y2="21" />
      <path d="M10 21v-4a2 2 0 014 0v4" />
    </g>
  </Svg>
);

// Props — Greek/temple column with a kit/prop above (theatre prop).
export const PropsIcon = (props) => (
  <Svg {...props}>
    <g strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
      <rect x="7" y="5" width="7" height="11" rx="0.5" />
      <path d="M6.5 5l4-3 4 3" />
      <path d="M9 16v-3a1.5 1.5 0 013 0v3" />
      <rect x="9" y="7" width="3" height="2" rx="0.5" />
      <path d="M14 9c2 0 3 1.5 4 4s1.5 4 4 4" />
      <line x1="5" y1="16" x2="7" y2="8" />
      <line x1="3.5" y1="16" x2="5.5" y2="8" />
      <line x1="4" y1="14" x2="6" y2="14" />
      <line x1="4.5" y1="12" x2="6.3" y2="12" />
      <line x1="5" y1="10" x2="6.7" y2="10" />
      <line x1="2" y1="21" x2="22" y2="21" />
      <line x1="7.5" y1="16" x2="6" y2="21" />
      <line x1="13.5" y1="16" x2="15" y2="21" />
    </g>
  </Svg>
);

// Templates — playspec grid (the Fibe "blueprint" icon).
export const TemplatesIcon = (props) => (
  <Svg {...props}>
    <g strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
      <rect x="2" y="2" width="20" height="20" rx="1" />
      <line x1="2" y1="8" x2="22" y2="8" opacity="0.3" />
      <line x1="2" y1="14" x2="22" y2="14" opacity="0.3" />
      <line x1="8" y1="2" x2="8" y2="22" opacity="0.3" />
      <line x1="15" y1="2" x2="15" y2="22" opacity="0.3" />
      <line x1="3.5" y1="4.5" x2="5.5" y2="4.5" />
      <line x1="3.5" y1="6" x2="5.5" y2="6" />
      <path d="M10 11l1.5-2 1.5 2" />
      <rect x="10" y="11" width="3" height="2.5" rx="0.3" />
      <rect x="16.5" y="4" width="3.5" height="2.5" rx="0.3" />
      <line x1="16.5" y1="5.25" x2="20" y2="5.25" />
      <circle cx="5" cy="17" r="1.5" />
      <line x1="5" y1="15.5" x2="5" y2="14.5" />
      <line x1="10" y1="16" x2="18" y2="16" />
      <line x1="10" y1="15.5" x2="10" y2="16.5" />
      <line x1="18" y1="15.5" x2="18" y2="16.5" />
      <line x1="10" y1="19" x2="14" y2="19" />
      <line x1="16" y1="19" x2="20" y2="19" />
    </g>
  </Svg>
);

// Playgrounds — Fibe playground icon (sail, arrow, swing).
export const PlaygroundsIcon = (props) => (
  <Svg {...props}>
    <g strokeLinecap="round" strokeLinejoin="round">
      <line strokeWidth="0.75" opacity="0.4" x1="12" y1="1" x2="12" y2="23" />
      <line strokeWidth="0.75" opacity="0.4" x1="1" y1="12" x2="23" y2="12" />
      <line strokeWidth="1.5" x1="15" y1="4" x2="15" y2="10" />
      <path strokeWidth="1.5" d="M15 4c1 0 3 3 6 6" />
      <line strokeWidth="1.5" x1="3" y1="8" x2="10" y2="5" />
      <path strokeWidth="1.5" d="M5.5 10l1-3 1 3" />
      <circle cx="3.5" cy="7.5" r="0.7" fill="currentColor" stroke="none" />
      <circle cx="9.5" cy="5.3" r="0.7" fill="currentColor" stroke="none" />
      <path strokeWidth="1.5" d="M3 17q3.5-3 7 0" />
      <line strokeWidth="1.5" x1="3.5" y1="17.5" x2="4" y2="20" />
      <line strokeWidth="1.5" x1="9.5" y1="17.5" x2="9" y2="20" />
      <line strokeWidth="1" x1="6.5" y1="14.5" x2="6.5" y2="13" />
      <line strokeWidth="1" x1="4.5" y1="15.5" x2="4" y2="14.5" />
      <line strokeWidth="1" x1="8.5" y1="15.5" x2="9" y2="14.5" />
      <circle strokeWidth="1.5" cx="18" cy="18" r="2.5" />
      <line strokeWidth="1.5" x1="18" y1="15.5" x2="18" y2="18" />
      <line strokeWidth="1.5" x1="18" y1="18" x2="15.8" y2="19.3" />
      <line strokeWidth="1.5" x1="18" y1="18" x2="20.2" y2="19.3" />
    </g>
  </Svg>
);

// Tricks — top hat (magic trick) with motion.
export const TricksIcon = (props) => (
  <Svg {...props}>
    <g strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
      <path d="M10 3.5V1.5h4v2" />
      <line x1="8.5" y1="3.5" x2="15.5" y2="3.5" />
      <circle cx="12" cy="5" r="1.5" />
      <line x1="12" y1="6.5" x2="12" y2="12.5" />
      <path d="M5 8l3 1h8l3-1" />
      <line x1="12" y1="12.5" x2="9" y2="16" />
      <line x1="12" y1="12.5" x2="15" y2="16" />
      <line strokeWidth="2" x1="6" y1="16" x2="18" y2="16" />
      <circle cx="12" cy="18.5" r="2.5" />
    </g>
  </Svg>
);

// Genies — OpenCode robot (verbatim from upstream `Components::Robots`,
// index 3 — the same one selected for the OpenCode provider in the agent
// wizard at packs/agents/app/components/components/views/wizard/step_agent.rb).
// Filled with the upstream red palette so it reads as the OpenCode mascot
// rather than as a generic outline icon.
export const GeniesIcon = (props) => (
  <svg
    width="36"
    height="36"
    viewBox="0 0 64 64"
    fill="none"
    aria-hidden="true"
    {...props}
  >
    <polygon points="32,10 54,50 10,50" fill="#dc2626" />
    <rect x="20" y="30" width="24" height="14" rx="3" fill="#991b1b" />
    <rect x="22" y="33" width="8" height="4" rx="2" fill="#fca5a5" />
    <rect x="34" y="33" width="8" height="4" rx="2" fill="#fca5a5" />
    <rect x="28" y="40" width="8" height="3" rx="1.5" fill="#fecaca" />
    <rect x="6" y="36" width="8" height="10" rx="3" fill="#b91c1c" />
    <rect x="50" y="36" width="8" height="10" rx="3" fill="#b91c1c" />
    <rect x="18" y="52" width="10" height="6" rx="3" fill="#b91c1c" />
    <rect x="36" y="52" width="10" height="6" rx="3" fill="#b91c1c" />
  </svg>
);

// Compose → Fibe — terminal / convert icon.
export const ComposeIcon = (props) => (
  <Svg {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </Svg>
);

// SDK / CLI / MCP — terminal window with a prompt and a cursor.
export const SdkIcon = (props) => (
  <Svg {...props}>
    <g strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
      <rect x="2.5" y="4" width="19" height="16" rx="2" />
      <line x1="2.5" y1="8.5" x2="21.5" y2="8.5" />
      <path d="M6 13l3 2-3 2" />
      <line x1="12" y1="17" x2="17" y2="17" />
    </g>
    <circle cx="5" cy="6.25" r="0.6" fill="currentColor" stroke="none" />
    <circle cx="7" cy="6.25" r="0.6" fill="currentColor" stroke="none" />
    <circle cx="9" cy="6.25" r="0.6" fill="currentColor" stroke="none" />
  </Svg>
);

// Wallet, Mana & Sparks — wallet pouch with a small sparkle (Sparks/Mana).
export const WalletIcon = (props) => (
  <Svg {...props}>
    <g strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
      <path d="M3 9.5a2 2 0 012-2h11l3 2.5v9.5a2 2 0 01-2 2H5a2 2 0 01-2-2v-10z" />
      <path d="M3 12.5h13.5a2 2 0 012 2v1.5a2 2 0 01-2 2H3" />
      <path d="M19.5 4l.7 1.8L22 6.5l-1.8.7L19.5 9l-.7-1.8L17 6.5l1.8-.7z" />
    </g>
    <circle cx="14.5" cy="15.25" r="1" fill="currentColor" stroke="none" />
  </Svg>
);
