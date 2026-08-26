import AccountDropdown from "./AccountDropdown";
import { useUserProfileData } from "../hooks/queries/use-user-profile-data";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8081";

const DiscordIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M20.317 4.369A19.791 19.791 0 0 0 16.558 3c-.162.287-.35.675-.479.982a18.27 18.27 0 0 0-4.158 0A9.926 9.926 0 0 0 11.442 3a19.736 19.736 0 0 0-3.764 1.369C5.298 7.9 4.654 11.344 4.977 14.739a19.94 19.94 0 0 0 4.61 2.326c.372-.505.704-1.04.989-1.6a12.96 12.96 0 0 1-1.558-.746c.13-.095.257-.194.379-.294 3.006 1.388 6.266 1.388 9.236 0 .124.101.251.2.38.294-.497.293-1.018.542-1.56.747.285.558.616 1.093.988 1.598a19.887 19.887 0 0 0 4.614-2.326c.379-3.936-.647-7.348-2.738-10.369ZM9.64 12.646c-.903 0-1.642-.831-1.642-1.853 0-1.021.723-1.852 1.642-1.852.92 0 1.66.839 1.642 1.852 0 1.022-.723 1.853-1.642 1.853Zm4.736 0c-.903 0-1.642-.831-1.642-1.853 0-1.021.723-1.852 1.642-1.852.92 0 1.66.839 1.642 1.852 0 1.022-.723 1.853-1.642 1.853Z" />
  </svg>
);

const Header = () => {
  const discordLoginUrl = `${API_BASE_URL}/oauth2/authorization/discord`;

  const { data: userProfile } = useUserProfileData();

  return (
    <header style={styles.header}>
      <a href="/" style={styles.brand} aria-label="Chubotamanju 홈으로 이동">
        <span style={styles.logoImageBox} aria-hidden="true">
          <img src="/favicon.svg" alt="" style={styles.logoImage} />
        </span>
        <span style={styles.logo}>Chubotamanju</span>
      </a>

      <nav style={styles.nav} aria-label="주요 메뉴">
        <a href="/guide" style={styles.navLink}>
          가이드
        </a>
      </nav>

      <div style={styles.actions}>
        {userProfile?.data ? (
          <AccountDropdown profile={userProfile.data} />
        ) : (
          <a href={discordLoginUrl} style={styles.discordLoginButton}>
            <DiscordIcon />
            <span>Discord 로그인</span>
          </a>
        )}
      </div>
    </header>
  );
};

const styles = {
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "24px",
    width: "100%",
    minHeight: "64px",
    padding: "0 32px",
    boxSizing: "border-box",
    borderBottom: "1px solid #e5e7eb",
    backgroundColor: "#ffffff",
  },
  brand: {
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    color: "#111827",
    textDecoration: "none",
    whiteSpace: "nowrap",
  },
  logoImageBox: {
    width: "36px",
    height: "36px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "12px",
    backgroundColor: "#f3f4f6",
    border: "1px solid #e5e7eb",
    overflow: "hidden",
  },
  logoImage: {
    width: "24px",
    height: "24px",
    display: "block",
  },
  logo: {
    fontSize: "20px",
    fontWeight: 700,
  },
  nav: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    flex: 1,
  },
  navLink: {
    color: "#4b5563",
    fontSize: "15px",
    fontWeight: 500,
    textDecoration: "none",
  },
  actions: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    marginLeft: "auto",
  },
  discordLoginButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    minHeight: "40px",
    padding: "0 16px",
    borderRadius: "999px",
    color: "#ffffff",
    backgroundColor: "#5865f2",
    fontSize: "14px",
    fontWeight: 700,
    textDecoration: "none",
    boxShadow: "0 8px 18px rgba(88, 101, 242, 0.25)",
  },
};

export default Header;
