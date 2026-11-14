// Line icons drawn for the store: 1.5px strokes, round joins, in the current text colour.
type P = { className?: string; title?: string };
const S = ({ children, className, title }: P & { children: React.ReactNode }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    className={className} aria-hidden={title ? undefined : true} role={title ? 'img' : undefined}>
    {title && <title>{title}</title>}
    {children}
  </svg>
);
export const SearchIcon = (p: P) => <S {...p}><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></S>;
export const BagIcon = (p: P) => <S {...p}><path d="M5 8h14l-1 12H6L5 8Z" /><path d="M9 8V6.5a3 3 0 0 1 6 0V8" /></S>;
export const UserIcon = (p: P) => <S {...p}><circle cx="12" cy="8.5" r="3.5" /><path d="M5 20c1.2-3.6 4-5 7-5s5.8 1.4 7 5" /></S>;
export const HeartIcon = (p: P) => <S {...p}><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" /></S>;
export const MenuIcon = (p: P) => <S {...p}><path d="M4 8h16M4 16h16" /></S>;
export const CloseIcon = (p: P) => <S {...p}><path d="m6 6 12 12M18 6 6 18" /></S>;
export const RxIcon = (p: P) => <S {...p}><path d="M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7l-4-4Z" /><path d="M14 3v4h4" /><path d="M9 11h2.5a1.5 1.5 0 0 1 0 3H9v-3Zm0 3v3m2.2-3 2.8 3" /></S>;
export const LeafIcon = (p: P) => <S {...p}><path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14Z" /><path d="M5 19 13 11" /></S>;
export const ShieldIcon = (p: P) => <S {...p}><path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></S>;
export const TruckIcon = (p: P) => <S {...p}><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7" /><circle cx="7" cy="17.5" r="1.5" /><circle cx="17" cy="17.5" r="1.5" /></S>;
export const ChatIcon = (p: P) => <S {...p}><path d="M4 12a8 8 0 1 1 3.3 6.5L4 20l1.3-3.6A8 8 0 0 1 4 12Z" /><path d="M9.5 9.5c0 2.8 2.2 5 5 5l1-1.2-1.6-1-.9.7a3.2 3.2 0 0 1-2-2l.7-.9-1-1.6-1.2 1Z" /></S>;
export const ArrowIcon = (p: P) => <S {...p}><path d="M5 12h14M13 6l6 6-6 6" /></S>;
export const DoctorIcon = (p: P) => <S {...p}><circle cx="12" cy="7" r="3.5" /><path d="M5 21c.8-4 3.5-6 7-6s6.2 2 7 6" /><path d="M9 15.5v2.5a2 2 0 1 0 4 0" /></S>;
export const ClockIcon = (p: P) => <S {...p}><circle cx="12" cy="12" r="8" /><path d="M12 8v4l2.5 2.5" /></S>;
export const UploadIcon = (p: P) => <S {...p}><path d="M12 15V4m-4 4 4-4 4 4" /><path d="M5 15v4h14v-4" /></S>;
export const PrintIcon = (p: P) => <S {...p}><path d="M7 9V4h10v5M7 17H5v-6h14v6h-2" /><path d="M7 14h10v6H7z" /></S>;

/** One small line drawing for each form of medicine (the "by preparation" index). Decorative. */
const FORM_PATHS: Record<string, React.ReactNode> = {
  // a cup of decoction, steaming
  kashayam: <><path d="M5 10h12v3a6 6 0 0 1-12 0v-3Z" /><path d="M17 11h1.5a2 2 0 0 1 0 4H17" /><path d="M9 4c0 1.5 1 1.5 1 3M13 4c0 1.5 1 1.5 1 3" /><path d="M7 21h8" /></>,
  // a tonic bottle
  arishtam: <><path d="M10 3h4v3l2 3v10a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V9l2-3V3Z" /><path d="M8 13h8" /></>,
  // a drop of oil
  thailam: <><path d="M12 3c3.5 4.5 6 7.5 6 11a6 6 0 0 1-12 0c0-3.5 2.5-6.5 6-11Z" /><path d="M9.5 14.5A2.5 2.5 0 0 0 12 17" /></>,
  // mortar and pestle
  choornam: <><path d="M5 11h14a7 7 0 0 1-14 0Z" /><path d="M12 18v2M9 20.5h6" /><path d="m14 9 5-6" /></>,
  // a jar
  lehyam: <><path d="M8 4h8v3H8z" /><path d="M7 7h10l1 3v8a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-8l1-3Z" /><path d="M6 13h12" /></>,
  // a lidded ghee pot
  ghritham: <><path d="M6 10c0 6 2 9.5 6 9.5s6-3.5 6-9.5" /><path d="M5 10h14" /><path d="M9 10c0-2 1.3-3 3-3s3 1 3 3" /><path d="M12 7V5" /></>,
  capsule: <><path d="M8.5 15.5a4 4 0 0 1 0-5.7l3.3-3.3a4 4 0 0 1 5.7 5.7l-3.3 3.3a4 4 0 0 1-5.7 0Z" /><path d="m10.1 8.1 5.8 5.8" /></>,
  // a spoonful of syrup
  syrup: <><path d="M4 13c0-2.2 2-4 4.5-4s4.5 1.8 4.5 4-2 4-4.5 4S4 15.2 4 13Z" /><path d="M13 13h7" /><path d="M17 4c1 1.3 1.6 2.1 1.6 3a1.6 1.6 0 0 1-3.2 0c0-.9.6-1.7 1.6-3Z" /></>,
  // a liniment bottle with a nozzle
  liniment: <><path d="M9 9h6l1 10a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1L9 9Z" /><path d="M10 5h4v4h-4z" /><path d="M12 3v2" /></>,
  // AVVVS's own: the leaf
  proprietary: <><path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14Z" /><path d="M5 19 13 11" /></>,
};
export const FormIcon = ({ slug, className }: { slug: string; className?: string }) => (
  <S className={className}>{FORM_PATHS[slug] ?? FORM_PATHS.proprietary}</S>
);
