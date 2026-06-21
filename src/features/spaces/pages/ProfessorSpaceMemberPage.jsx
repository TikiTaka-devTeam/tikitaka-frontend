import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ModeTabs from "../../../components/common/ModeTabs.jsx";
import leftArrowIcon from "../../../assets/icons/left_arrow.png";
import megaphoneIcon from "../../../assets/icons/megaphone.png";
import userIcon from "../../../assets/icons/userIcon.png";
import reloadIcon from "../../../assets/icons/reload.png";
import { getMySpaces, recordSpaceAccess } from "../api/spaceApi";
import {
  approveSpaceMember,
  denySpaceMember,
  getPendingSpaceMembers,
  getSpaceMembers,
} from "../api/professorSpaceMemberApi";
import "../styles/professor-space-member-page.css";

function buildGradient(color) {
  const startColor = color || "#2563eb";
  return `linear-gradient(115deg, ${startColor} 0%, #7fd0d7 100%)`;
}

function getMemberId(member) {
  return (
    member.space_member_id ||
    member.member_id ||
    member.user_id ||
    member.id ||
    ""
  );
}

function getMemberName(member) {
  return member.name || member.user_name || "이름 없음";
}

function getStudentNumber(member) {
  return member.member_id_number || member.student_number || "";
}

function MemberRow({ member, showMessageButton = false }) {
  return (
    <div className="professor-space-member-page__member-row">
      <div className="professor-space-member-page__profile-image">
        <img src={member.profile_url || userIcon} alt="" />
      </div>

      <div className="professor-space-member-page__member-info">
        <p className="professor-space-member-page__member-name">
          {getMemberName(member)}
        </p>
        <p className="professor-space-member-page__student-number">
          {getStudentNumber(member)}
        </p>
      </div>

      {showMessageButton && (
        <button
          type="button"
          className="professor-space-member-page__message-button"
          disabled
        >
          메세지
        </button>
      )}
    </div>
  );
}

function PendingMemberRow({ member, onApprove, onDeny, disabled }) {
  const memberId = getMemberId(member);

  return (
    <div className="professor-space-member-page__pending-row">
      <div className="professor-space-member-page__profile-image">
        <img src={member.profile_url || userIcon} alt="" />
      </div>

      <div className="professor-space-member-page__member-info">
        <p className="professor-space-member-page__member-name">
          {getMemberName(member)}
        </p>
        <p className="professor-space-member-page__student-number">
          {getStudentNumber(member)}
        </p>
      </div>

      <div className="professor-space-member-page__approval-buttons">
        <button
          type="button"
          className="professor-space-member-page__deny-button"
          onClick={() => onDeny(memberId)}
          disabled={disabled || !memberId}
        >
          거절
        </button>

        <button
          type="button"
          className="professor-space-member-page__approve-button"
          onClick={() => onApprove(memberId)}
          disabled={disabled || !memberId}
        >
          승인
        </button>
      </div>
    </div>
  );
}

function ProfessorSpaceMemberPage() {
  const { spaceId } = useParams();
  const navigate = useNavigate();

  const [space, setSpace] = useState(null);
  const [members, setMembers] = useState([]);
  const [pendingMembers, setPendingMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [processingMemberId, setProcessingMemberId] = useState("");

  const headerBackground = useMemo(() => {
    return buildGradient(space?.color);
  }, [space?.color]);

  useEffect(() => {
    if (!spaceId) return;

    void recordSpaceAccess(spaceId).catch((error) => {
      console.error("Failed to record space access:", error);
    });
  }, [spaceId]);

  async function loadProfessorSpaceMemberPage() {
    if (!spaceId) {
      setErrorMessage("강의 정보를 찾을 수 없습니다.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      const [spacesData, membersData, pendingData] = await Promise.all([
        getMySpaces(),
        getSpaceMembers(spaceId),
        getPendingSpaceMembers(spaceId),
      ]);

      const currentSpace = Array.isArray(spacesData)
        ? spacesData.find((item) => item.space_id === spaceId)
        : null;

      setSpace(currentSpace || null);
      setMembers(Array.isArray(membersData) ? membersData : []);
      setPendingMembers(Array.isArray(pendingData) ? pendingData : []);
    } catch (error) {
      console.error(error);
      setErrorMessage("멤버 정보를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let ignore = false;

    async function load() {
      if (ignore) return;
      await loadProfessorSpaceMemberPage();
    }

    load();

    return () => {
      ignore = true;
    };
  }, [spaceId]);

  const tabs = [
    {
      label: "강의",
      value: "lecture",
      active: false,
    },
    {
      label: "멤버",
      value: "members",
      active: true,
    },
  ];

  const handleTabChange = (value) => {
    if (value === "lecture") {
      navigate(`/spaces/${spaceId}`);
      return;
    }

    if (value === "members") {
      return;
    }
  };

  const handleBack = () => {
    navigate("/dashboard?section=spaces");
  };

  const handleMegaphoneClick = () => {
    console.log("공지/알림 버튼 클릭");
  };

  const handleReloadClick = async () => {
    await loadProfessorSpaceMemberPage();
  };

  const handleApproveMember = async (memberId) => {
    if (!spaceId || !memberId || processingMemberId) return;

    try {
      setProcessingMemberId(memberId);
      await approveSpaceMember(spaceId, memberId);
      await loadProfessorSpaceMemberPage();
    } catch (error) {
      console.error(error);
      alert("승인에 실패했습니다.");
    } finally {
      setProcessingMemberId("");
    }
  };

  const handleDenyMember = async (memberId) => {
    if (!spaceId || !memberId || processingMemberId) return;

    try {
      setProcessingMemberId(memberId);
      await denySpaceMember(spaceId, memberId);
      await loadProfessorSpaceMemberPage();
    } catch (error) {
      console.error(error);
      alert("거절에 실패했습니다.");
    } finally {
      setProcessingMemberId("");
    }
  };

  return (
    <main className="professor-space-member-page">
      <section
        className="professor-space-member-page__hero"
        style={{ background: headerBackground }}
      >
        <button
          type="button"
          className="professor-space-member-page__back-button"
          onClick={handleBack}
          aria-label="뒤로가기"
        >
          <img src={leftArrowIcon} alt="" />
        </button>

        <div className="professor-space-member-page__hero-text">
          <p className="professor-space-member-page__semester">
            {space?.semester || ""}
          </p>
          <h1 className="professor-space-member-page__title">
            {space?.name || ""}
          </h1>
        </div>
      </section>

      <section className="professor-space-member-page__body">
        <div className="professor-space-member-page__top-row">
          <div className="professor-space-member-page__tabs">
            <ModeTabs items={tabs} onChange={handleTabChange} />
          </div>

          <button
            type="button"
            className="professor-space-member-page__megaphone-button"
            onClick={handleMegaphoneClick}
            aria-label="공지"
          >
            <img src={megaphoneIcon} alt="" />
          </button>
        </div>

        {loading && (
          <div className="professor-space-member-page__state">
            멤버 정보를 불러오는 중입니다.
          </div>
        )}

        {!loading && errorMessage && (
          <div className="professor-space-member-page__state">
            {errorMessage}
          </div>
        )}

        {!loading && !errorMessage && (
          <div className="professor-space-member-page__content">
            <section className="professor-space-member-page__member-panel">
              <div className="professor-space-member-page__panel-header">
                <h2>멤버</h2>

                <button
                  type="button"
                  className="professor-space-member-page__reload-button"
                  onClick={handleReloadClick}
                  aria-label="멤버 새로고침"
                >
                  <img src={reloadIcon} alt="" />
                </button>
              </div>

              <div className="professor-space-member-page__divider" />

              <div className="professor-space-member-page__member-list">
                {members.length > 0 ? (
                  members.map((member) => (
                    <MemberRow
                      key={getMemberId(member)}
                      member={member}
                      showMessageButton={false}
                    />
                  ))
                ) : (
                  <div className="professor-space-member-page__empty">
                    아직 승인된 멤버가 없습니다.
                  </div>
                )}
              </div>
            </section>

            <section className="professor-space-member-page__approval-panel">
              <div className="professor-space-member-page__panel-header">
                <h2>승인</h2>

                <button
                  type="button"
                  className="professor-space-member-page__reload-button"
                  onClick={handleReloadClick}
                  aria-label="승인 목록 새로고침"
                >
                  <img src={reloadIcon} alt="" />
                </button>
              </div>

              <div className="professor-space-member-page__divider" />

              <div className="professor-space-member-page__approval-content">
                <div className="professor-space-member-page__approval-summary">
                  <p>
                    {pendingMembers.length} 명의 학생이
                    <br />
                    <span>승인</span>을 대기중입니다
                  </p>
                  <strong>Space에 멤버를 추가하세요!</strong>
                </div>

                <div className="professor-space-member-page__pending-list">
                  {pendingMembers.length > 0 ? (
                    pendingMembers.map((member) => (
                      <PendingMemberRow
                        key={getMemberId(member)}
                        member={member}
                        onApprove={handleApproveMember}
                        onDeny={handleDenyMember}
                        disabled={processingMemberId === getMemberId(member)}
                      />
                    ))
                  ) : (
                    <div className="professor-space-member-page__empty professor-space-member-page__empty--pending">
                      승인 대기중인 학생이 없습니다.
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        )}
      </section>
    </main>
  );
}

export default ProfessorSpaceMemberPage;
