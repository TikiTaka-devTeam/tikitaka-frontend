import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ModeTabs from "../../../components/common/ModeTabs";
import leftArrowIcon from "../../../assets/icons/left_arrow.png";
import { getMySpaces, getSpaceDocuments } from "../api/spaceApi";
import "../styles/space-page.css";

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
  const startColor = color || "#2f6ff2";
  return `linear-gradient(115deg, ${startColor} 0%, #f47597 100%)`;
}

function SpacePage() {
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

    async function loadSpacePage() {
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

        setSpace(currentSpace || null);
        setDocuments(Array.isArray(documentsData) ? documentsData : []);
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

    loadSpacePage();

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
    navigate(-1);
  };

  const handleDocumentClick = (document) => {
    console.log("문서 클릭:", document);

    /*
      다음 페이지 구현되면 여기서 이동하면 됨.

      예시:
      navigate(`/documents/${document.document_id}`);
    */
  };

  return (
    <main className="space-page">
      <section
        className="space-page__hero"
        style={{ background: headerBackground }}
      >
        <button
          type="button"
          className="space-page__back-button"
          onClick={handleBack}
          aria-label="뒤로가기"
        >
          <img src={leftArrowIcon} alt="" />
        </button>

        <div className="space-page__hero-text">
          <p className="space-page__semester">{space?.semester || ""}</p>
          <h1 className="space-page__title">{space?.name || ""}</h1>
        </div>
      </section>

      <section className="space-page__body">
        <div className="space-page__tabs">
          <ModeTabs items={tabs} />
        </div>

        {loading && (
          <div className="space-page__state">강의자료를 불러오는 중입니다.</div>
        )}

        {!loading && errorMessage && (
          <div className="space-page__state">{errorMessage}</div>
        )}

        {!loading && !errorMessage && documents.length === 0 && (
          <div className="space-page__state">등록된 강의자료가 없습니다.</div>
        )}

        {!loading && !errorMessage && documents.length > 0 && (
          <div className="space-page__documents">
            {documents.map((document) => (
              <button
                key={document.document_id}
                type="button"
                className="space-page__document-card"
                onClick={() => handleDocumentClick(document)}
              >
                <div className="space-page__thumbnail">
                  {document.thumbnail_url ? (
                    <img src={document.thumbnail_url} alt="" />
                  ) : (
                    <div className="space-page__thumbnail-empty" />
                  )}
                </div>

                <p className="space-page__document-title">{document.title}</p>

                <p className="space-page__document-date">
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

export default SpacePage;
