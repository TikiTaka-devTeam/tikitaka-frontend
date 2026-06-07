// src/features/lecture/components/LectureLayout.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import TopNav from "./TopNav.jsx";
import Toolbar from "./Toolbar.jsx";
import SlideViewer from "./SlideViewer.jsx";
import QuestionPanel from "./QuestionPanel.jsx";
import useDrawingStore, { TOOLS } from "../stores/useDrawingStore.js";
import useScale from "../hooks/useScale.js";
import {
  createQuestion,
  deleteSlideStroke,
  fetchDocumentSlides,
  fetchSlideQuestions,
  fetchSlideStrokes,
  normalizeQuestionResponse,
  normalizeSlideResponse,
  saveSlideStrokes,
} from "../api/lectureApi.js";
import { getSpaceDocuments } from "../../spaces/api/spaceApi.js";
import {
  createLectureSocket,
  requestStrokeResync,
  sendQuestionCreated,
  sendSharedStroke,
  sendSharedStrokeDelete,
} from "../api/lectureSocket.js";
import "../styles/lecture.css";

const MAX_OPEN_DOCUMENTS = 10;

function createLocalId(prefix) {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getStrokeKey(stroke) {
  return String(
    stroke?.strokeId ??
      stroke?.stroke_id ??
      stroke?.id ??
      `${stroke?.tool}-${stroke?.strokeOrder}`,
  );
}

function getQuestionKey(question) {
  return String(
    question?.id ??
      question?.questionId ??
      question?.question_id ??
      `${question?.slideId}-${question?.x}-${question?.y}-${question?.content}`,
  );
}

function getSavedStrokeIds(result) {
  if (!result) return [];

  if (Array.isArray(result.strokeIds)) {
    return result.strokeIds;
  }

  if (Array.isArray(result.stroke_ids)) {
    return result.stroke_ids;
  }

  if (Array.isArray(result.strokes)) {
    return result.strokes
      .map((stroke) => stroke.strokeId ?? stroke.stroke_id ?? stroke.id)
      .filter(Boolean);
  }

  if (Array.isArray(result)) {
    return result
      .map((stroke) => stroke.strokeId ?? stroke.stroke_id ?? stroke.id)
      .filter(Boolean);
  }

  return [];
}

function attachSavedStrokeIds(strokes, result) {
  const savedStrokeIds = getSavedStrokeIds(result);

  return strokes.map((stroke, index) => {
    const savedStrokeId =
      stroke.strokeId ?? stroke.stroke_id ?? savedStrokeIds[index] ?? stroke.id;

    return {
      ...stroke,
      id: stroke.id ?? savedStrokeId,
      strokeId: savedStrokeId,
      scope: stroke.scope || "shared",
    };
  });
}

function LectureLayout({ mode = "student" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { spaceId, documentId } = useParams();
  const scaleVars = useScale();
  const socketRef = useRef(null);
  const lastReceivedStrokeSeqRef = useRef(0);

  const [documents, setDocuments] = useState([]);
  const [activeDocId, setActiveDocId] = useState(null);
  const [pageIndex, setPageIndex] = useState(0);

  const [isLoadingDocument, setIsLoadingDocument] = useState(false);
  const [documentError, setDocumentError] = useState("");

  const [questions, setQuestions] = useState([]);
  const [professorNotes, setProfessorNotes] = useState([]);

  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [draftQuestion, setDraftQuestion] = useState(null);
  const [draftProfessorNote, setDraftProfessorNote] = useState(null);

  const loadStrokes = useDrawingStore((state) => state.loadStrokes);
  const pendingSave = useDrawingStore((state) => state.pendingSave);
  const pendingDelete = useDrawingStore((state) => state.pendingDelete);
  const clearPending = useDrawingStore((state) => state.clearPending);
  const clearPendingDelete = useDrawingStore(
    (state) => state.clearPendingDelete,
  );
  const removeStrokeWithoutPending = useDrawingStore(
    (state) => state.removeStrokeWithoutPending,
  );
  const upsertStrokeWithoutPending = useDrawingStore(
    (state) => state.upsertStrokeWithoutPending,
  );
  const activeTool = useDrawingStore((state) => state.tool);
  const setTool = useDrawingStore((state) => state.setTool);

  const activeDoc = useMemo(
    () =>
      documents.find((doc) => String(doc.document_id) === String(activeDocId)),
    [documents, activeDocId],
  );

  const slides = activeDoc?.slides ?? [];
  const currentSlide = slides[pageIndex];

  const currentSlideQuestions = questions.filter(
    (question) =>
      String(question.documentId) === String(activeDocId) &&
      String(question.slideId) === String(currentSlide?.slide_id),
  );

  const currentSlideProfessorNotes = professorNotes.filter(
    (note) =>
      String(note.documentId) === String(activeDocId) &&
      String(note.slideId) === String(currentSlide?.slide_id),
  );

  function handleBackToSpace() {
    if (spaceId) {
      navigate(`/spaces/${spaceId}`);
      return;
    }

    navigate("/dashboard");
  }

  function openDocument(nextDocument) {
    if (!nextDocument?.document_id) return;

    setDocuments((prev) => {
      const alreadyOpen = prev.some(
        (doc) => String(doc.document_id) === String(nextDocument.document_id),
      );

      if (alreadyOpen) {
        setActiveDocId(nextDocument.document_id);
        setPageIndex(0);
        setDraftQuestion(null);
        setDraftProfessorNote(null);
        setSelectedQuestionId(null);
        return prev;
      }

      if (prev.length >= MAX_OPEN_DOCUMENTS) {
        alert(
          "강의자료는 최대 10개까지 열 수 있습니다. 기존 탭을 닫고 다시 열어주세요.",
        );
        return prev;
      }

      setActiveDocId(nextDocument.document_id);
      setPageIndex(0);
      setDraftQuestion(null);
      setDraftProfessorNote(null);
      setSelectedQuestionId(null);

      return [...prev, nextDocument];
    });
  }

  function handleSelectDoc(docId) {
    setActiveDocId(docId);
    setPageIndex(0);
    setDraftQuestion(null);
    setDraftProfessorNote(null);
    setSelectedQuestionId(null);
  }

  function handleCloseDoc(docId) {
    setDocuments((prev) => {
      const next = prev.filter(
        (doc) => String(doc.document_id) !== String(docId),
      );

      if (String(docId) === String(activeDocId)) {
        const closedIndex = prev.findIndex(
          (doc) => String(doc.document_id) === String(docId),
        );

        const fallback = next[closedIndex] ?? next[closedIndex - 1] ?? null;

        setActiveDocId(fallback?.document_id ?? null);
        setPageIndex(0);
        setDraftQuestion(null);
        setDraftProfessorNote(null);
        setSelectedQuestionId(null);
      }

      return next;
    });
  }

  function goPrev() {
    setPageIndex((index) => Math.max(0, index - 1));
    setDraftQuestion(null);
    setDraftProfessorNote(null);
    setSelectedQuestionId(null);
  }

  function goNext() {
    setPageIndex((index) => Math.min(slides.length - 1, index + 1));
    setDraftQuestion(null);
    setDraftProfessorNote(null);
    setSelectedQuestionId(null);
  }

  async function reloadCurrentSlideStrokes(slideId) {
    if (!slideId) return;

    try {
      const strokes = await fetchSlideStrokes(slideId);

      const drawingStrokes = Array.isArray(strokes)
        ? strokes.filter((stroke) => stroke.tool !== TOOLS.FIXER)
        : [];

      const fixerStrokes = Array.isArray(strokes)
        ? strokes.filter((stroke) => stroke.tool === TOOLS.FIXER)
        : [];

      loadStrokes(drawingStrokes);

      setProfessorNotes((prev) => {
        const filteredPrev = prev.filter(
          (note) =>
            !(
              String(note.documentId) === String(activeDocId) &&
              String(note.slideId) === String(slideId)
            ),
        );

        const loadedNotes = fixerStrokes.map((stroke) => {
          const point = stroke.points?.[0] ?? { x: 0, y: 0 };

          return {
            id: stroke.id ?? stroke.strokeId,
            strokeId: stroke.strokeId ?? stroke.id,
            documentId: activeDocId,
            slideId,
            pageNumber: currentSlide?.page_number,
            x: point.x,
            y: point.y,
            content: stroke.content || "교수 수정",
            createdAt: new Date().toISOString(),
            scope: stroke.scope || "shared",
          };
        });

        return [...filteredPrev, ...loadedNotes];
      });
    } catch (error) {
      console.error("필기 재조회 실패", error);
    }
  }

  async function refreshCurrentSlideQuestions() {
    if (!activeDocId || !currentSlide?.slide_id) return;

    try {
      const questionList = await fetchSlideQuestions(currentSlide.slide_id);

      const normalizedQuestions = Array.isArray(questionList)
        ? questionList.map((question) =>
            normalizeQuestionResponse(question, {
              documentId: activeDocId,
              slideId: currentSlide.slide_id,
              pageNumber: currentSlide.page_number,
            }),
          )
        : [];

      setQuestions((prev) => {
        const filteredPrev = prev.filter(
          (question) =>
            !(
              String(question.documentId) === String(activeDocId) &&
              String(question.slideId) === String(currentSlide.slide_id)
            ),
        );

        return [...filteredPrev, ...normalizedQuestions];
      });
    } catch (error) {
      console.error("질문 목록 갱신 실패", error);
    }
  }

  function handleQuestionPoint(point) {
    if (!activeDocId || !currentSlide) return;

    setDraftQuestion({
      id: createLocalId("question-draft"),
      documentId: activeDocId,
      slideId: currentSlide.slide_id,
      pageNumber: currentSlide.page_number,
      x: point.x,
      y: point.y,
      content: "",
    });

    setDraftProfessorNote(null);
    setSelectedQuestionId(null);
  }

  function handleProfessorNotePoint(point) {
    if (!activeDocId || !currentSlide) return;

    setDraftProfessorNote({
      id: createLocalId("professor-note-draft"),
      documentId: activeDocId,
      slideId: currentSlide.slide_id,
      pageNumber: currentSlide.page_number,
      x: point.x,
      y: point.y,
      content: "",
    });

    setDraftQuestion(null);
    setSelectedQuestionId(null);
  }

  function handleLiveStrokeChange({ stroke }) {
    if (mode !== "professor") return;
    if (!spaceId || !currentSlide?.slide_id) return;
    if (!stroke) return;

    sendSharedStroke(socketRef.current, {
      spaceId,
      slideId: currentSlide.slide_id,
      stroke: {
        ...stroke,
        scope: "shared",
      },
    });
  }

  async function handleQuestionSubmit(content) {
    if (!draftQuestion || !content.trim()) {
      setDraftQuestion(null);
      return;
    }

    const localQuestion = {
      id: createLocalId("question"),
      documentId: draftQuestion.documentId,
      slideId: draftQuestion.slideId,
      pageNumber: draftQuestion.pageNumber,
      x: draftQuestion.x,
      y: draftQuestion.y,
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };

    setSelectedQuestionId(null);
    setDraftQuestion(null);
    setTool(TOOLS.LIST);

    try {
      const questionPointStroke = {
        id: createLocalId("question-point"),
        tool: TOOLS.QUESTION,
        content: localQuestion.content,
        color: "#111827",
        thickness: 4,
        strokeOrder: 0,
        points: [
          {
            x: localQuestion.x,
            y: localQuestion.y,
          },
        ],
      };

      const strokeSaveResult = await saveSlideStrokes(
        localQuestion.slideId,
        [questionPointStroke],
        "student",
      );

      const [savedQuestionPointStroke] = attachSavedStrokeIds(
        [questionPointStroke],
        strokeSaveResult,
      );

      const privateStrokeId =
        savedQuestionPointStroke?.strokeId ??
        savedQuestionPointStroke?.stroke_id ??
        savedQuestionPointStroke?.id;

      if (!privateStrokeId) {
        throw new Error("질문 포인트 저장에 실패했습니다.");
      }

      const savedQuestion = await createQuestion(localQuestion.slideId, {
        ...localQuestion,
        privateStrokeId,
        private_stroke_id: privateStrokeId,
      });

      const nextQuestion = normalizeQuestionResponse(savedQuestion, {
        ...localQuestion,
        privateStrokeId,
        private_stroke_id: privateStrokeId,
      });

      setQuestions((prev) => {
        const nextKey = getQuestionKey(nextQuestion);

        if (prev.some((question) => getQuestionKey(question) === nextKey)) {
          return prev;
        }

        return [...prev, nextQuestion];
      });

      sendQuestionCreated(socketRef.current, {
        spaceId,
        slideId: localQuestion.slideId,
        question: nextQuestion,
      });

      await refreshCurrentSlideQuestions();
    } catch (error) {
      console.error(error);
      alert(error.message || "질문 저장에 실패했습니다.");
    }
  }

  function handleSelectQuestion(question) {
    if (!question) return;

    if (selectedQuestionId === question.id) {
      setSelectedQuestionId(null);
      setDraftQuestion(null);
      setDraftProfessorNote(null);
      return;
    }

    if (String(question.documentId) !== String(activeDocId)) {
      setActiveDocId(question.documentId);
    }

    const targetDoc = documents.find(
      (doc) => String(doc.document_id) === String(question.documentId),
    );

    const targetSlides = targetDoc?.slides ?? [];
    const targetIndex = targetSlides.findIndex(
      (slide) => String(slide.slide_id) === String(question.slideId),
    );

    if (targetIndex >= 0) {
      setPageIndex(targetIndex);
    }

    setSelectedQuestionId(question.id);
    setDraftQuestion(null);
    setDraftProfessorNote(null);
  }

  async function handleProfessorNoteSubmit(content) {
    if (!draftProfessorNote) {
      return;
    }

    const nextNote = {
      id: createLocalId("professor-note"),
      documentId: draftProfessorNote.documentId,
      slideId: draftProfessorNote.slideId,
      pageNumber: draftProfessorNote.pageNumber,
      x: draftProfessorNote.x,
      y: draftProfessorNote.y,
      content: content?.trim() || "교수 수정",
      createdAt: new Date().toISOString(),
      scope: "shared",
    };

    const fixerStroke = {
      id: nextNote.id,
      tool: TOOLS.FIXER,
      content: nextNote.content,
      color: "#111827",
      thickness: 4,
      strokeOrder: professorNotes.length,
      points: [
        {
          x: nextNote.x,
          y: nextNote.y,
        },
      ],
    };

    setProfessorNotes((prev) => [...prev, nextNote]);
    setDraftProfessorNote(null);

    try {
      const result = await saveSlideStrokes(
        nextNote.slideId,
        [fixerStroke],
        "professor",
      );

      const [savedFixerStroke] = attachSavedStrokeIds([fixerStroke], result);

      if (savedFixerStroke?.strokeId) {
        setProfessorNotes((prev) =>
          prev.map((note) =>
            note.id === nextNote.id
              ? {
                  ...note,
                  strokeId: savedFixerStroke.strokeId,
                }
              : note,
          ),
        );
      }

      await reloadCurrentSlideStrokes(nextNote.slideId);
    } catch (error) {
      console.error("교수 수정 아이콘 저장 실패", error);
    }
  }

  async function handleProfessorNoteDone(noteId) {
    const targetNote = professorNotes.find((note) => note.id === noteId);

    setProfessorNotes((prev) => prev.filter((note) => note.id !== noteId));

    if (!targetNote?.strokeId) {
      return;
    }

    const strokeToDelete = {
      id: targetNote.strokeId,
      strokeId: targetNote.strokeId,
      scope: targetNote.scope || "shared",
    };

    try {
      await deleteSlideStroke(strokeToDelete);

      if (mode === "professor") {
        sendSharedStrokeDelete(socketRef.current, {
          spaceId,
          slideId: targetNote.slideId,
          stroke: strokeToDelete,
        });
      }
    } catch (error) {
      console.error("교수 수정 아이콘 완료 처리 실패", error);
    }
  }

  function handleQuestionCancel() {
    setDraftQuestion(null);
  }

  function handleProfessorNoteCancel() {
    setDraftProfessorNote(null);
  }

  useEffect(() => {
    if (!documentId) return;

    let ignore = false;

    async function loadDocument() {
      try {
        setIsLoadingDocument(true);
        setDocumentError("");

        const slideList = await fetchDocumentSlides(documentId);
        const normalizedSlides = Array.isArray(slideList)
          ? slideList
              .map(normalizeSlideResponse)
              .filter((slide) => !slide.is_deleted)
          : [];

        const stateDocument = location.state?.document;
        let documentFromList = null;

        if (!stateDocument && spaceId) {
          try {
            const documentList = await getSpaceDocuments(spaceId);

            if (Array.isArray(documentList)) {
              documentFromList = documentList.find((item) => {
                const itemDocumentId =
                  item.document_id || item.documentId || item.id;

                return String(itemDocumentId) === String(documentId);
              });
            }
          } catch (error) {
            console.error("강의자료 제목 조회 실패", error);
          }
        }

        const resolvedDocument = stateDocument || documentFromList || {};

        const targetDocument = {
          document_id:
            resolvedDocument.document_id ||
            resolvedDocument.documentId ||
            resolvedDocument.id ||
            documentId,

          title:
            resolvedDocument.title ||
            resolvedDocument.document_title ||
            resolvedDocument.documentTitle ||
            resolvedDocument.name ||
            "강의자료",

          thumbnail_url:
            resolvedDocument.thumbnail_url ||
            resolvedDocument.thumbnailUrl ||
            "",

          pdf_url: resolvedDocument.pdf_url || resolvedDocument.pdfUrl || "",

          uploaded_at:
            resolvedDocument.uploaded_at || resolvedDocument.uploadedAt || null,
        };

        if (ignore) return;

        openDocument({
          ...targetDocument,
          slides: normalizedSlides,
        });
      } catch (error) {
        if (ignore) return;

        console.error(error);
        setDocumentError(error.message || "강의자료를 불러오지 못했습니다.");
      } finally {
        if (!ignore) {
          setIsLoadingDocument(false);
        }
      }
    }

    loadDocument();

    return () => {
      ignore = true;
    };
  }, [documentId, spaceId, location.state]);

  useEffect(() => {
    if (!currentSlide?.slide_id) {
      loadStrokes([]);
      return;
    }

    let ignore = false;

    async function loadSlideData() {
      try {
        const [strokesResult, questionsResult] = await Promise.allSettled([
          fetchSlideStrokes(currentSlide.slide_id),
          fetchSlideQuestions(currentSlide.slide_id),
        ]);

        if (ignore) return;

        const strokes =
          strokesResult.status === "fulfilled" ? strokesResult.value : [];

        const questionList =
          questionsResult.status === "fulfilled" ? questionsResult.value : [];

        if (strokesResult.status === "rejected") {
          console.error("필기 조회 실패", strokesResult.reason);
        }

        if (questionsResult.status === "rejected") {
          console.error("질문 조회 실패", questionsResult.reason);
        }

        const drawingStrokes = Array.isArray(strokes)
          ? strokes.filter((stroke) => stroke.tool !== TOOLS.FIXER)
          : [];

        const fixerStrokes = Array.isArray(strokes)
          ? strokes.filter((stroke) => stroke.tool === TOOLS.FIXER)
          : [];

        loadStrokes(drawingStrokes);

        setProfessorNotes((prev) => {
          const filteredPrev = prev.filter(
            (note) =>
              !(
                String(note.documentId) === String(activeDocId) &&
                String(note.slideId) === String(currentSlide.slide_id)
              ),
          );

          const loadedNotes = fixerStrokes.map((stroke) => {
            const point = stroke.points?.[0] ?? { x: 0, y: 0 };

            return {
              id: stroke.id ?? stroke.strokeId,
              strokeId: stroke.strokeId ?? stroke.id,
              documentId: activeDocId,
              slideId: currentSlide.slide_id,
              pageNumber: currentSlide.page_number,
              x: point.x,
              y: point.y,
              content: stroke.content || "교수 수정",
              createdAt: new Date().toISOString(),
              scope: stroke.scope || "shared",
            };
          });

          return [...filteredPrev, ...loadedNotes];
        });

        const normalizedQuestions = Array.isArray(questionList)
          ? questionList.map((question) =>
              normalizeQuestionResponse(question, {
                documentId: activeDocId,
                slideId: currentSlide.slide_id,
                pageNumber: currentSlide.page_number,
              }),
            )
          : [];

        setQuestions((prev) => {
          const filteredPrev = prev.filter(
            (question) =>
              !(
                String(question.documentId) === String(activeDocId) &&
                String(question.slideId) === String(currentSlide.slide_id)
              ),
          );

          return [...filteredPrev, ...normalizedQuestions];
        });

        setDraftQuestion(null);
        setDraftProfessorNote(null);
      } catch (error) {
        if (ignore) return;
        console.error(error);
      }
    }

    loadSlideData();

    return () => {
      ignore = true;
    };
  }, [activeDocId, currentSlide?.slide_id, loadStrokes]);

  useEffect(() => {
    if (!spaceId || !currentSlide?.slide_id) return;

    socketRef.current?.deactivate?.();
    lastReceivedStrokeSeqRef.current = 0;

    socketRef.current = createLectureSocket({
      spaceId,
      slideId: currentSlide.slide_id,

      onSharedStroke: (stroke, payload) => {
        lastReceivedStrokeSeqRef.current =
          payload?.strokeSeq ??
          payload?.stroke_seq ??
          lastReceivedStrokeSeqRef.current;

        if (mode !== "professor") {
          upsertStrokeWithoutPending(stroke);
        }
      },

      onSharedStrokeDelete: (stroke) => {
        if (mode !== "professor") {
          removeStrokeWithoutPending(stroke);
        }
      },

      onQuestionCreated: (question) => {
        const nextQuestion = normalizeQuestionResponse(question, {
          documentId: activeDocId,
          slideId: currentSlide.slide_id,
          pageNumber: currentSlide.page_number,
        });

        setQuestions((prev) => {
          const nextKey = getQuestionKey(nextQuestion);

          if (prev.some((item) => getQuestionKey(item) === nextKey)) {
            return prev;
          }

          return [...prev, nextQuestion];
        });
      },

      onConnect: () => {
        requestStrokeResync(socketRef.current, {
          spaceId,
          slideId: currentSlide.slide_id,
          lastReceivedStrokeSeq: lastReceivedStrokeSeqRef.current,
        });
      },

      onError: (error) => {
        console.error(error);
      },
    });

    return () => {
      socketRef.current?.deactivate?.();
      socketRef.current = null;
    };
  }, [
    spaceId,
    currentSlide?.slide_id,
    activeDocId,
    currentSlide?.page_number,
    mode,
    removeStrokeWithoutPending,
    upsertStrokeWithoutPending,
  ]);

  useEffect(() => {
    if (!currentSlide?.slide_id || pendingSave.length === 0) return;

    const slideId = currentSlide.slide_id;
    const strokesToSave = [...pendingSave];

    async function savePendingStrokes() {
      try {
        const result = await saveSlideStrokes(slideId, strokesToSave, mode);
        const savedStrokes = attachSavedStrokeIds(strokesToSave, result);

        /*
          교수 필기는 그리는 중에 handleLiveStrokeChange에서 이미 WebSocket으로 전송됩니다.
          여기서 다시 sendSharedStroke를 호출하면 학생 화면에 중복 stroke가 생길 수 있으므로,
          저장 후 추가 브로드캐스트는 하지 않습니다.
        */

        clearPending();

        await reloadCurrentSlideStrokes(slideId);

        if (mode !== "professor") {
          savedStrokes.forEach((stroke) => {
            upsertStrokeWithoutPending(stroke);
          });
        }
      } catch (error) {
        console.error("필기 저장 실패", error);
      }
    }

    savePendingStrokes();
  }, [
    pendingSave,
    currentSlide?.slide_id,
    clearPending,
    mode,
    upsertStrokeWithoutPending,
  ]);

  useEffect(() => {
    if (pendingDelete.length === 0) return;

    const strokesToDelete = [...pendingDelete];

    async function deletePendingStrokes() {
      try {
        if (mode === "professor" && currentSlide?.slide_id) {
          strokesToDelete.forEach((stroke) => {
            sendSharedStrokeDelete(socketRef.current, {
              spaceId,
              slideId: currentSlide.slide_id,
              stroke,
            });
          });
        }

        await Promise.all(
          strokesToDelete.map((stroke) => deleteSlideStroke(stroke)),
        );

        clearPendingDelete();
      } catch (error) {
        console.error("필기 삭제 저장 실패", error);
      }
    }

    deletePendingStrokes();
  }, [
    pendingDelete,
    clearPendingDelete,
    mode,
    spaceId,
    currentSlide?.slide_id,
  ]);

  return (
    <div className="lecture-page" style={scaleVars}>
      <div className="lecture-page__frame">
        <TopNav
          title={activeDoc?.title ?? "강의자료"}
          documents={documents}
          activeDocId={activeDocId}
          onBack={handleBackToSpace}
          onSelectDoc={handleSelectDoc}
          onCloseDoc={handleCloseDoc}
        />

        <Toolbar mode={mode} />

        <div
          className={`lecture-page__content ${
            activeTool === TOOLS.LIST ? "has-question-panel" : ""
          }`}
        >
          {isLoadingDocument ? (
            <div className="lecture-page__empty">
              강의자료를 불러오는 중입니다
            </div>
          ) : documentError ? (
            <div className="lecture-page__empty">{documentError}</div>
          ) : slides.length > 0 ? (
            <>
              <SlideViewer
                slide={currentSlide}
                imageUrl={currentSlide?.image_url}
                onPrev={goPrev}
                onNext={goNext}
                draftQuestion={draftQuestion}
                questions={currentSlideQuestions}
                selectedQuestionId={selectedQuestionId}
                draftProfessorNote={draftProfessorNote}
                professorNotes={currentSlideProfessorNotes}
                onQuestionPoint={handleQuestionPoint}
                onQuestionSubmit={handleQuestionSubmit}
                onQuestionCancel={handleQuestionCancel}
                onProfessorNotePoint={handleProfessorNotePoint}
                onProfessorNoteSubmit={handleProfessorNoteSubmit}
                onProfessorNoteCancel={handleProfessorNoteCancel}
                onProfessorNoteDone={handleProfessorNoteDone}
                onLiveStrokeChange={
                  mode === "professor" ? handleLiveStrokeChange : undefined
                }
              />

              {activeTool === TOOLS.LIST && (
                <QuestionPanel
                  questions={currentSlideQuestions}
                  selectedQuestionId={selectedQuestionId}
                  onSelectQuestion={handleSelectQuestion}
                />
              )}

              <div className="lecture-page__pager">
                <button
                  type="button"
                  className="lecture-page__pager-btn"
                  onClick={goPrev}
                  disabled={pageIndex === 0}
                  aria-label="이전 슬라이드"
                >
                  ‹
                </button>

                <span className="lecture-page__pager-text">
                  {pageIndex + 1} / {slides.length}
                </span>

                <button
                  type="button"
                  className="lecture-page__pager-btn"
                  onClick={goNext}
                  disabled={pageIndex === slides.length - 1}
                  aria-label="다음 슬라이드"
                >
                  ›
                </button>
              </div>
            </>
          ) : (
            <div className="lecture-page__empty">열린 강의자료가 없습니다</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LectureLayout;
