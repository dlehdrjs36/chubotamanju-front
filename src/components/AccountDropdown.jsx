import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { logout } from "../api/logout";

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

const getProfileDisplayName = (profile) => {
  return (
    profile?.providerGlobalName ??
    profile?.globalName ??
    profile?.username ??
    profile?.name ??
    "계정"
  );
};

const AccountDropdown = ({ profile }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const displayName = getProfileDisplayName(profile);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (!dropdownRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleToggle = () => {
    setLogoutError("");
    setIsOpen((currentIsOpen) => !currentIsOpen);
  };

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);
    setLogoutError("");

    try {
      await logout();
      await queryClient.cancelQueries();
      queryClient.setQueryData(["userProfile"], null);
      queryClient.setQueryData(["userGuilds"], null);
      queryClient.removeQueries({ queryKey: ["guildMissions"] });
      setIsOpen(false);
      navigate("/", { replace: true });
    } catch {
      setLogoutError("로그아웃에 실패했습니다.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-full bg-[#5865f2] px-4 text-sm font-bold text-white no-underline shadow-[0_8px_18px_rgba(88,101,242,0.25)] transition hover:-translate-y-px hover:bg-[#4752c4]"
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={handleToggle}
      >
        <DiscordIcon />
        <span>{displayName}</span>
      </button>

      {isOpen ? (
        <div
          className="absolute top-[calc(100%+14px)] right-0 z-50 min-w-[192px] overflow-hidden rounded-none bg-neutral-700 py-2 text-white shadow-[0_18px_36px_rgba(0,0,0,0.22)]"
          role="menu"
          aria-label="계정 메뉴"
        >
          <Link
            className="block px-8 py-4 text-lg font-bold text-white no-underline transition hover:bg-neutral-600 focus:bg-neutral-600 focus:outline-none"
            role="menuitem"
            to="/profile"
            onClick={() => setIsOpen(false)}
          >
            프로필
          </Link>
          <button
            className="block w-full cursor-pointer border-0 bg-transparent px-8 py-4 text-left text-lg font-bold text-white transition hover:bg-neutral-600 focus:bg-neutral-600 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
            type="button"
            role="menuitem"
            disabled={isLoggingOut}
            onClick={handleLogout}
          >
            {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
          </button>
          {logoutError ? (
            <p className="m-0 px-8 pb-3 text-xs font-bold text-red-200">
              {logoutError}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default AccountDropdown;
