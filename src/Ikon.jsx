export default function Ikon({ ad, boyut = 24 }) {
  const ortak = {
    width: boyut,
    height: boyut,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  }
  switch (ad) {
    case 'masalar':
      return (
        <svg {...ortak}>
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <path d="M9 22V12h6v10" />
        </svg>
      )
    case 'harita':
      return (
        <svg {...ortak}>
          <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21 3 6" />
          <line x1="9" y1="3" x2="9" y2="18" />
          <line x1="15" y1="6" x2="15" y2="21" />
        </svg>
      )
    case 'ekle':
      return (
        <svg {...ortak}>
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      )
    case 'arkadaslar':
      return (
        <svg {...ortak}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    case 'profil':
      return (
        <svg {...ortak}>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      )
    case 'mesaj':
      return (
        <svg {...ortak}>
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      )
    case 'giris':
      return (
        <svg {...ortak}>
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
          <polyline points="10 17 15 12 10 7" />
          <line x1="15" y1="12" x2="3" y2="12" />
        </svg>
      )
    case 'pin':
      return (
        <svg {...ortak}>
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      )
    case 'kamera':
      return (
        <svg {...ortak}>
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
      )
    case 'erkek':
      return (
        <svg {...ortak}>
          <circle cx="12" cy="8" r="4.5" />
          <path d="M4 21v-1a8 8 0 0 1 16 0v1" />
        </svg>
      )
    case 'kadin':
      return (
        <svg {...ortak}>
          <circle cx="12" cy="7" r="4" />
          <path d="M12 11c-3 0-5 3-5.5 10h11C17 14 15 11 12 11z" />
        </svg>
      )
    case 'kullanici':
      return (
        <svg {...ortak}>
          <circle cx="12" cy="7.5" r="4" />
          <path d="M5 21a7 7 0 0 1 14 0" />
        </svg>
      )
    case 'zil':
      return (
        <svg {...ortak}>
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      )
    case 'soru':
      return (
        <svg {...ortak}>
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      )
    case 'oksag':
      return (
        <svg {...ortak}>
          <polyline points="9 18 15 12 9 6" />
        </svg>
      )
    case 'oksol':
      return (
        <svg {...ortak}>
          <polyline points="15 18 9 12 15 6" />
        </svg>
      )
    default:
      return null
  }
}
