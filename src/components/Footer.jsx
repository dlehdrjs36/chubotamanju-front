import { Link } from "react-router-dom";

const footerLinkClassName =
  "text-slate-500 no-underline transition hover:text-indigo-600 focus:text-indigo-600 focus:outline-none";

const FooterDivider = () => (
  <span className="text-slate-300" aria-hidden="true">
    |
  </span>
);

const Footer = () => {
  return (
    <footer className="flex min-h-[72px] flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-slate-200 bg-white px-4 py-5 text-sm font-bold text-slate-400">
      <span>© Chubotamanju</span>
      <FooterDivider />
      <nav
        className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2"
        aria-label="푸터 메뉴"
      >
        <Link className={footerLinkClassName} to="/terms-of-service">
          이용약관
        </Link>
        <FooterDivider />
        <Link className={footerLinkClassName} to="/privacy-policy">
          개인정보 처리방침
        </Link>
      </nav>
    </footer>
  );
};

export default Footer;
