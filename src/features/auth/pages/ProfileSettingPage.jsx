import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import leftArrowIcon from "../../../assets/icons/left_arrow.png";
import userIcon from "../../../assets/icons/userIcon.png";
import { getCurrentUser, logout } from "../api/auth.api.js";
import "../styles/profileSetting.css";

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("tikitaka_user") || "null") || {};
  } catch {
    return {};
  }
}

function getUserValue(user, keys, fallback = "") {
  for (const key of keys) {
    const value = user?.[key];

    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return value;
    }
  }

  return fallback;
}

function SettingRow({ label, value, isAction = false, onClick }) {
  if (isAction) {
    return (
      <button type="button" className="profile-setting-row" onClick={onClick}>
        <span>{label}</span>
        {value ? <span className="profile-setting-row__value">{value}</span> : null}
      </button>
    );
  }

  return (
    <div className="profile-setting-row">
      <span>{label}</span>
      {value ? <span className="profile-setting-row__value">{value}</span> : null}
    </div>
  );
}

function ProfileSettingPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(() => readStoredUser());
  const [failedProfileImage, setFailedProfileImage] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        const { data } = await getCurrentUser();

        if (!isMounted) {
          return;
        }

        setProfile((prevProfile) => ({ ...prevProfile, ...data }));
        localStorage.setItem(
          "tikitaka_user",
          JSON.stringify({ ...readStoredUser(), ...data }),
        );
      } catch {
        if (isMounted) {
          setProfile(readStoredUser());
        }
      }
    }

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const displayName = getUserValue(profile, ["name", "user_name", "username"], "사용자");
  const email = getUserValue(profile, ["email"], "");
  const phoneNumber = getUserValue(
    profile,
    ["phone_number", "phoneNumber", "phone"],
    "",
  );
  const profileImage = String(getUserValue(
    profile,
    ["profile_url", "profileUrl", "profile_image_url", "profileImageUrl"],
    "",
  )).trim();

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      await logout();
    } catch {
      // Even if the server request fails, clear local credentials.
    } finally {
      localStorage.removeItem("tikitaka_access_token");
      localStorage.removeItem("tikitaka_refresh_token");
      localStorage.removeItem("tikitaka_user");
      window.location.replace("/login");
    }
  };

  return (
    <main className="profile-setting-page">
      <header className="profile-setting-header">
        <button
          type="button"
          className="profile-setting-back"
          aria-label="뒤로 가기"
          onClick={() => navigate(-1)}
        >
          <img src={leftArrowIcon} alt="" />
        </button>
        <h1>내 정보</h1>
      </header>

      <section className="profile-setting-hero" aria-label="프로필">
        <div className="profile-setting-avatar">
          {profileImage && profileImage !== failedProfileImage ? (
            <img
              src={profileImage}
              alt={`${displayName} 프로필`}
              onError={() => setFailedProfileImage(profileImage)}
            />
          ) : (
            <img src={userIcon} alt={`${displayName} 프로필`} />
          )}
          <span className="profile-setting-avatar__plus" aria-hidden="true">
            +
          </span>
        </div>
        <strong>{displayName}</strong>
        {email ? <p>{email}</p> : null}
      </section>

      <section className="profile-setting-panel" aria-label="내 정보 설정">
        <div className="profile-setting-group">
          <h2>계정</h2>
          <SettingRow label="이메일" value={email} />
          <SettingRow label="전화번호" value={phoneNumber} />
          <SettingRow label="비밀번호 변경" />
        </div>

        <div className="profile-setting-group">
          <h2>앱 설정</h2>
          <SettingRow label="다크모드" value="시스템 기본값" />
          <SettingRow label="알림 설정" />
        </div>

        <div className="profile-setting-group">
          <h2>이용 안내</h2>
          <SettingRow label="앱 버전" />
          <SettingRow label="공지사항" />
          <SettingRow label="문의하기" />
        </div>

        <div className="profile-setting-group profile-setting-group--last">
          <h2>기타</h2>
          <SettingRow label="회원 탈퇴" />
          <SettingRow
            label={isLoggingOut ? "로그아웃 중" : "로그아웃"}
            isAction
            onClick={handleLogout}
          />
        </div>
      </section>
    </main>
  );
}

export default ProfileSettingPage;
