import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ModeTabs from "../../../components/common/ModeTabs.jsx";
import leftArrowIcon from "../../../assets/icons/left_arrow.png";
import {
  getMySpaces,
  getSpaceDocuments,
  getDocumentSlides,
} from "../api/spaceApi";
import "../styles/student-space-page.css";

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
  const startColor = color || "#6b4de6";
  return `linear-gradient(115deg, ${startColor} 0%, #f47597 100%)`;
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

function StudentSpacePage() {
  const { spaceId } = useParams();
  const navigate = useNavigate();

  const [space, setSpace] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const headerBackground = useMemo(() => {
    return buildGradient(space?.color);
  }, [space?.color]);

  useEffect(() => {
    let ignore = false;

    async function loadStudentSpacePage() {
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

        if (ignore) return;

        const currentSpace = Array.isArray(spacesData)
          ? spacesData.find((item) => item.space_id === spaceId)
          : null;

        const documentsWithThumbnails = await attachFirstSlideThumbnails(
          Array.isArray(documentsData) ? documentsData : [],
        );

        if (ignore) return;

        setSpace(currentSpace || null);
        setDocuments(documentsWithThumbnails);
      } catch (error) {
        if (ignore) return;

        console.error(error);
        setErrorMessage("강의자료를 불러오지 못했습니다.");
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadStudentSpacePage();

    return () => {
      ignore = true;
    };
  }, [spaceId]);

  const tabs = [
    {
      label: "날짜",
      active: true,
      disabled: false,
      onClick: () => {},
    },
    {
      label: "공지",
      active: false,
      disabled: true,
      onClick: undefined,
    },
  ];

  const handleBack = () => {
    navigate("/dashboard?section=spaces");
  };

  const handleDocumentClick = (document) => {
    console.log("문서 클릭:", document);

    /*
      다음 페이지 구현되면 여기서 이동.

      예시:
      navigate(`/documents/${document.document_id}`);
    */
  };

  return (
    <main className="student-space-page">
      <section
        className="student-space-page__hero"
        style={{ background: headerBackground }}
      >
        <button
          type="button"
          className="student-space-page__back-button"
          onClick={handleBack}
          aria-label="뒤로가기"
        >
          <img src={leftArrowIcon} alt="" />
        </button>

        <div className="student-space-page__hero-text">
          <p className="student-space-page__semester">
            {space?.semester || ""}
          </p>
          <h1 className="student-space-page__title">{space?.name || ""}</h1>
        </div>
      </section>

      <section className="student-space-page__body">
        <div className="student-space-page__tabs">
          <ModeTabs items={tabs} />
        </div>

        {loading && (
          <div className="student-space-page__state">
            강의자료를 불러오는 중입니다.
          </div>
        )}

        {!loading && errorMessage && (
          <div className="student-space-page__state">{errorMessage}</div>
        )}

        {!loading && !errorMessage && documents.length === 0 && (
          <div className="student-space-page__state">
            등록된 강의자료가 없습니다.
          </div>
        )}

        {!loading && !errorMessage && documents.length > 0 && (
          <div className="student-space-page__documents">
            {documents.map((document) => (
              <button
                key={document.document_id}
                type="button"
                className="student-space-page__document-card"
                onClick={() => handleDocumentClick(document)}
              >
                <div className="student-space-page__thumbnail">
                  {document.display_thumbnail_url ? (
                    <img
                      src={resolveImageUrl(document.display_thumbnail_url)}
                      alt=""
                    />
                  ) : (
                    <div className="student-space-page__thumbnail-empty" />
                  )}
                </div>

                <p className="student-space-page__document-title">
                  {document.title}
                </p>

                <p className="student-space-page__document-date">
                  {formatDate(document.uploaded_at)}
                </p>
              </button>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default StudentSpacePage;
