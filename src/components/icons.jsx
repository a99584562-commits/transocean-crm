// Ultra-light line icons (stroke 1.5, round caps) — no heavy icon library.
const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

const I = (children) =>
  function Icon(props) {
    return (
      <svg {...base} {...props}>
        {children}
      </svg>
    )
  }

export const IconDashboard = I(
  <>
    <rect x="3" y="3" width="7.5" height="7.5" rx="2" />
    <rect x="13.5" y="3" width="7.5" height="5" rx="2" />
    <rect x="13.5" y="11" width="7.5" height="10" rx="2" />
    <rect x="3" y="13.5" width="7.5" height="7.5" rx="2" />
  </>,
)

export const IconPolicy = I(
  <>
    <path d="M12 3l7 2.5v5c0 4.5-3 7.8-7 9-4-1.2-7-4.5-7-9v-5L12 3z" />
    <path d="M9 11.5l2.2 2.2L15 9.8" />
  </>,
)

export const IconCertificate = I(
  <>
    <path d="M6 3h8l4 4v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
    <path d="M14 3v4h4" />
    <circle cx="11.5" cy="13.5" r="2.2" />
    <path d="M10 15.4L9.2 19l2.3-1.2 2.3 1.2-.8-3.6" />
  </>,
)

export const IconVessel = I(
  <>
    <path d="M4 14h16l-2 5H6l-2-5z" />
    <path d="M12 14V6" />
    <path d="M12 4a1.4 1.4 0 1 0 0 2.8" />
    <path d="M12 6.8c2.4 0 4.5 1.4 5.5 3.4M12 6.8c-2.4 0-4.5 1.4-5.5 3.4" />
  </>,
)

export const IconPremium = I(
  <>
    <rect x="3" y="6" width="18" height="13" rx="2.5" />
    <path d="M3 10h18" />
    <circle cx="16.5" cy="14.5" r="1.4" />
  </>,
)

export const IconClaim = I(
  <>
    <path d="M12 3l7 2.5v5c0 4.5-3 7.8-7 9-4-1.2-7-4.5-7-9v-5L12 3z" />
    <path d="M12 8.5v4" />
    <path d="M12 15.4v.1" />
  </>,
)

export const IconWording = I(
  <>
    <path d="M5 3v4M3 5h4M6 17v3M4.5 18.5h3" />
    <path d="M14 4l2.2 5.3L21 11l-4.8 1.7L14 18l-2.2-5.3L7 11l4.8-1.7L14 4z" />
  </>,
)

export const IconPlus = I(<path d="M12 5v14M5 12h14" />)
export const IconClose = I(<path d="M6 6l12 12M18 6L6 18" />)
export const IconSearch = I(
  <>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </>,
)
export const IconCheck = I(<path d="M5 12.5l4.5 4.5L19 7" />)
export const IconArrowRight = I(<path d="M5 12h14M13 6l6 6-6 6" />)
export const IconChevron = I(<path d="M9 6l6 6-6 6" />)
export const IconCalendar = I(
  <>
    <rect x="4" y="5" width="16" height="16" rx="2.5" />
    <path d="M4 9h16M9 3v4M15 3v4" />
  </>,
)
export const IconBuilding = I(
  <>
    <rect x="5" y="3" width="14" height="18" rx="2" />
    <path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2" />
  </>,
)
export const IconBell = I(
  <>
    <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6z" />
    <path d="M10 19a2 2 0 0 0 4 0" />
  </>,
)
export const IconReset = I(
  <>
    <path d="M4 4v5h5" />
    <path d="M4 9a8 8 0 1 1-1.5 5" />
  </>,
)
export const IconDoc = I(
  <>
    <path d="M6 3h8l4 4v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
    <path d="M14 3v4h4M8 13h8M8 16h5" />
  </>,
)
export const IconAnchorPct = I(<path d="M19 5L5 19M8 7a2 2 0 1 0 0-.01M16 17a2 2 0 1 0 0-.01" />)
export const IconColumns = I(
  <>
    <rect x="3" y="4" width="5" height="16" rx="1.5" />
    <rect x="9.5" y="4" width="5" height="16" rx="1.5" />
    <rect x="16" y="4" width="5" height="16" rx="1.5" />
  </>,
)
export const IconList = I(
  <>
    <path d="M8 6h12M8 12h12M8 18h12" />
    <path d="M4 6h.01M4 12h.01M4 18h.01" />
  </>,
)
export const IconRoute = I(
  <>
    <circle cx="6" cy="6" r="2.2" />
    <circle cx="18" cy="18" r="2.2" />
    <path d="M8 6h6a3 3 0 0 1 0 6H8a3 3 0 0 0 0 6h2" />
  </>,
)
