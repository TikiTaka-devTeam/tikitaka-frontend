import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ModeTabs from "../../../components/common/ModeTabs.jsx";
import leftArrowIcon from "../../../assets/icons/left_arrow.png";
import megaphoneIcon from "../../../assets/icons/megaphone.png";
import plusIcon from "../../../assets/icons/plus.png";
import { getMySpaces, getSpaceDocuments } from "../api/spaceApi";
import { createSpaceDocument } from "../api/professorSpaceApi";
import LectureUploadModal from "../components/LectureUploadModal.jsx";
import "../styles/professor-space-page.css";

function formatDate(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value).replaceAll("-", ".");
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}.${month}.${day}`;
}

function buildGradient(color) {
  const startColor = color || "#2563eb";
  return `linear-gradient(115deg, ${startColor} 0%, #7fd0d7 100%)`;
}

function ProfessorSpacePage() {
  const { spaceId } = useParams();
  const navigate = useNavigate();

  const [space, setSpace] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [openedMenuId, setOpenedMenuId] = useState("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const headerBackground = useMemo(() => {
    return buildGradient(space?.color);
  }, [space?.color]);

  async function loadProfessorSpacePage() {
    if (!spaceId) {
      setErrorMessage("강의 정보를 찾을 수 없습니다.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      const [spacesData, documentsData] = await Promise.all([
        getMySpaces(),
        getSpaceDocuments(spaceId),
      ]);

      const currentSpace = Array.isArray(spacesData)
        ? spacesData.find((item) => item.space_id === spaceId)
        : null;

      setSpace(currentSpace || null);
      setDocuments(Array.isArray(documentsData) ? documentsData : []);
    } catch (error) {
      console.error(error);
      setErrorMessage("강의자료를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let ignore = false;

    async function load() {
      if (ignore) return;
      await loadProfessorSpacePage();
    }

    load();

    return () => {
      ignore = true;
    };
  }, [spaceId]);

  const tabs = [
    {
      label: "강의",
      active: true,
      disabled: false,
      onClick: () => {},
    },
    {
      label: "멤버",
      active: false,
      disabled: true,
      onClick: undefined,
    },
  ];

  const handleBack = () => {
    navigate("/dashboard?section=spaces");
  };

  const handleMegaphoneClick = () => {
    console.log("공지/알림 버튼 클릭");
  };

  const handleCreateBoxClick = () => {
    if (uploading) return;
    setIsUploadModalOpen(true);
  };

  const handleCloseUploadModal = () => {
    if (uploading) return;
    setIsUploadModalOpen(false);
  };

  const handleUploadLecture = async ({ title, file }) => {
    if (!spaceId) {
      alert("강의 정보를 찾을 수 없습니다.");
      return;
    }

    try {
      setUploading(true);

      await createSpaceDocument(spaceId, {
        title,
        file,
      });

      setIsUploadModalOpen(false);
      await loadProfessorSpacePage();
    } catch (error) {
      console.error(error);
      alert("강의자료 생성에 실패했습니다.");
    } finally {
      setUploading(false);
    }
  };

  const handleDocumentClick = (document) => {
    console.log("교수 강의자료 클릭:", document);

    /*
      교수용 강의자료 상세/수정 페이지가 생기면 여기서 이동.

      예시:
      navigate(`/professor/documents/${document.document_id}`);
    */
  };

  const handleMenuClick = (event, documentId) => {
    event.stopPropagation();
    setOpenedMenuId((prev) => (prev === documentId ? "" : documentId));
  };

  const handleEditClick = (event, document) => {
    event.stopPropagation();
    setOpenedMenuId("");
    console.log("수정 클릭:", document);
  };

  const handleDeleteClick = (event, document) => {
    event.stopPropagation();
    setOpenedMenuId("");
    console.log("삭제 클릭:", document);
  };

  return (
    <main className="professor-space-page">
      <section
        className="professor-space-page__hero"
        style={{ background: headerBackground }}
      >
        <button
          type="button"
          className="professor-space-page__back-button"
          onClick={handleBack}
          aria-label="뒤로가기"
        >
          <img src={leftArrowIcon} alt="" />
        </button>

        <div className="professor-space-page__hero-text">
          <p className="professor-space-page__semester">
            {space?.semester || ""}
          </p>
          <h1 className="professor-space-page__title">{space?.name || ""}</h1>
        </div>
      </section>

      <section className="professor-space-page__body">
        <div className="professor-space-page__top-row">
          <div className="professor-space-page__tabs">
            <ModeTabs items={tabs} />
          </div>

          <button
            type="button"
            className="professor-space-page__megaphone-button"
            onClick={handleMegaphoneClick}
            aria-label="공지"
          >
            <img src={megaphoneIcon} alt="" />
          </button>
        </div>

        {loading && (
          <div className="professor-space-page__state">
            강의자료를 불러오는 중입니다.
          </div>
        )}

        {!loading && errorMessage && (
          <div className="professor-space-page__state">{errorMessage}</div>
        )}

        {!loading && !errorMessage && (
          <div className="professor-space-page__documents">
            <button
              type="button"
              className="professor-space-page__create-card"
              onClick={handleCreateBoxClick}
              disabled={uploading}
            >
              <div className="professor-space-page__create-box">
                <img src={plusIcon} alt="" />
              </div>

              <p className="professor-space-page__create-title">
                {uploading
                  ? "강의자료를 생성하는 중입니다."
                  : "새로운 강의를 생성해 주세요!"}
              </p>
              <p className="professor-space-page__create-subtitle">
                Make a new lecture !
              </p>
            </button>

            {documents.map((document) => (
              <button
                key={document.document_id}
                type="button"
                className="professor-space-page__document-card"
                onClick={() => handleDocumentClick(document)}
              >
                <div className="professor-space-page__thumbnail">
                  {document.thumbnail_url ? (
                    <img src={document.thumbnail_url} alt="" />
                  ) : (
                    <div className="professor-space-page__thumbnail-empty" />
                  )}

                  <button
                    type="button"
                    className="professor-space-page__document-menu-button"
                    onClick={(event) =>
                      handleMenuClick(event, document.document_id)
                    }
                    aria-label="강의자료 메뉴"
                  >
                    ...
                  </button>

                  {openedMenuId === document.document_id && (
                    <div className="professor-space-page__document-menu">
                      <button
                        type="button"
                        onClick={(event) => handleEditClick(event, document)}
                      >
                        수정
                      </button>
                      <button
                        type="button"
                        onClick={(event) => handleDeleteClick(event, document)}
                      >
                        삭제
                      </button>
                    </div>
                  )}
                </div>

                <p className="professor-space-page__document-title">
                  {document.title}
                </p>

                <p className="professor-space-page__document-date">
                  {formatDate(document.uploaded_at)}
                </p>
              </button>
            ))}
          </div>
        )}
      </section>

      {isUploadModalOpen && (
        <LectureUploadModal
          uploading={uploading}
          onClose={handleCloseUploadModal}
          onSubmit={handleUploadLecture}
        />
      )}
    </main>
  );
}

export default ProfessorSpacePage;
