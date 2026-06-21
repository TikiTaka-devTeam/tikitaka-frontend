import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ModeTabs from "../../../components/common/ModeTabs.jsx";
import leftArrowIcon from "../../../assets/icons/left_arrow.png";
import megaphoneIcon from "../../../assets/icons/megaphone.png";
import plusIcon from "../../../assets/icons/plus.png";
import {
  getMySpaces,
  recordSpaceAccess,
  getSpaceDocuments,
  getSpaceCode,
  getDocumentSlides,
} from "../api/spaceApi";
import { createSpaceDocument } from "../api/professorSpaceApi";
import LectureUploadModal from "../components/LectureUploadModal.jsx";
import "../styles/professor-space-page.css";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"
).replace(/\/$/, "");

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

function resolveImageUrl(url) {
  if (!url) return "";

  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:") ||
    url.startsWith("blob:")
  ) {
    return url;
  }

  if (url.startsWith("/")) {
    return `${API_BASE_URL}${url}`;
  }

  return `${API_BASE_URL}/${url}`;
}

async function attachFirstSlideThumbnails(rawDocuments) {
  if (!Array.isArray(rawDocuments)) {
    return [];
  }

  const documentsWithThumbnails = await Promise.all(
    rawDocuments.map(async (document) => {
      if (document.thumbnail_url) {
        return {
          ...document,
          display_thumbnail_url: document.thumbnail_url,
        };
      }

      try {
        const slides = await getDocumentSlides(document.document_id);

        const firstSlide = Array.isArray(slides)
          ? [...slides]
              .filter((slide) => !slide.is_deleted)
              .sort((a, b) => a.page_number - b.page_number)[0]
          : null;

        return {
          ...document,
          display_thumbnail_url: firstSlide?.image_url || "",
        };
      } catch (error) {
        console.error("첫 번째 슬라이드 썸네일 조회 실패:", error);

        return {
          ...document,
          display_thumbnail_url: "",
        };
      }
    }),
  );

  return documentsWithThumbnails;
}

function ProfessorSpacePage() {
  const { spaceId } = useParams();
  const navigate = useNavigate();

  const [space, setSpace] = useState(null);
  const [spaceCode, setSpaceCode] = useState("");
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [openedMenuId, setOpenedMenuId] = useState("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const headerBackground = useMemo(() => {
    return buildGradient(space?.color);
  }, [space?.color]);

  useEffect(() => {
    if (!spaceId) return;

    void recordSpaceAccess(spaceId).catch((error) => {
      console.error("Failed to record space access:", error);
    });
  }, [spaceId]);

  async function loadProfessorSpacePage() {
    if (!spaceId) {
      setErrorMessage("강의 정보를 찾을 수 없습니다.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      const [spacesData, documentsData, codeData] = await Promise.all([
        getMySpaces(),
        getSpaceDocuments(spaceId),
        getSpaceCode(spaceId),
      ]);

      const currentSpace = Array.isArray(spacesData)
        ? spacesData.find((item) => item.space_id === spaceId)
        : null;

      const documentsWithThumbnails = await attachFirstSlideThumbnails(
        Array.isArray(documentsData) ? documentsData : [],
      );

      setSpace(currentSpace || null);
      setDocuments(documentsWithThumbnails);
      setSpaceCode(codeData?.space_code || codeData?.spaceCode || "");
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
      value: "lecture",
      active: true,
    },
    {
      label: "멤버",
      value: "members",
      active: false,
    },
  ];

  const handleTabChange = (value) => {
    if (value === "lecture") {
      return;
    }

    if (value === "members") {
      navigate(`/spaces/${spaceId}/members`);
    }
  };

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

    const documentId =
      document.document_id ||
      document.documentId ||
      document.id;

    if (!spaceId || !documentId) {
      alert("강의자료 정보를 찾을 수 없습니다.");
      return;
    }

    navigate(`/spaces/${spaceId}/documents/${documentId}`, {
      state: { document },
    });
  };

  const handleDocumentKeyDown = (event, document) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    handleDocumentClick(document);
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

          <div className="professor-space-page__title-row">
            <h1 className="professor-space-page__title">{space?.name || ""}</h1>

            {spaceCode && (
              <span className="professor-space-page__space-code">
                #{spaceCode}
              </span>
            )}
          </div>
        </div>
      </section>

      <section className="professor-space-page__body">
        <div className="professor-space-page__top-row">
          <div className="professor-space-page__tabs">
            <ModeTabs items={tabs} onChange={handleTabChange} />
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

            {documents.map((document) => {
              const documentId =
                document.document_id ||
                document.documentId ||
                document.id;

              return (
                <div
                  key={documentId}
                  className="professor-space-page__document-card"
                  role="button"
                  tabIndex={0}
                  onClick={() => handleDocumentClick(document)}
                  onKeyDown={(event) => handleDocumentKeyDown(event, document)}
                >
                  <div className="professor-space-page__thumbnail">
                    {document.display_thumbnail_url ? (
                      <img
                        src={resolveImageUrl(document.display_thumbnail_url)}
                        alt=""
                      />
                    ) : (
                      <div className="professor-space-page__thumbnail-empty" />
                    )}

                    <button
                      type="button"
                      className="professor-space-page__document-menu-button"
                      onClick={(event) => handleMenuClick(event, documentId)}
                      aria-label="강의자료 메뉴"
                    >
                      ...
                    </button>

                    {openedMenuId === documentId && (
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
                </div>
              );
            })}
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
