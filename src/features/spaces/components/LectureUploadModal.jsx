import { useRef, useState } from "react";
import uploadIcon from "../../../assets/icons/upload.png";
import "../styles/lecture-upload-modal.css";

const ALLOWED_FILE_TYPES = ["image/png", "image/jpeg", "application/pdf"];

function getDefaultTitleFromFile(file) {
  if (!file?.name) return "";
  return file.name.replace(/\.[^/.]+$/, "");
}

function LectureUploadModal({ uploading, onClose, onSubmit }) {
  const fileInputRef = useRef(null);

  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [message, setMessage] = useState("");

  const validateFile = (selectedFile) => {
    if (!selectedFile) {
      return false;
    }

    if (!ALLOWED_FILE_TYPES.includes(selectedFile.type)) {
      setMessage(
        "image/png, image/jpeg, application/pdf 파일만 업로드할 수 있습니다.",
      );
      return false;
    }

    return true;
  };

  const applyFile = (selectedFile) => {
    if (!validateFile(selectedFile)) {
      return;
    }

    setFile(selectedFile);
    setMessage("");

    if (!title.trim()) {
      setTitle(getDefaultTitleFromFile(selectedFile));
    }
  };

  const handleFileInputChange = (event) => {
    const selectedFile = event.target.files?.[0];

    event.target.value = "";

    if (!selectedFile) {
      return;
    }

    applyFile(selectedFile);
  };

  const handleAddFileClick = () => {
    if (uploading) return;
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    if (uploading) return;
    setFile(null);
    setMessage("");
  };

  const handleSaveTitle = () => {
    if (!title.trim()) {
      setMessage("강의 이름을 입력해주세요.");
      return;
    }

    setMessage("강의 이름이 저장되었습니다.");
  };

  const handleDragOver = (event) => {
    event.preventDefault();

    if (uploading) return;
    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();

    if (uploading) return;

    setIsDragging(false);

    const selectedFile = event.dataTransfer.files?.[0];

    if (!selectedFile) {
      return;
    }

    applyFile(selectedFile);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (uploading) {
      return;
    }

    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setMessage("강의 이름을 입력해주세요.");
      return;
    }

    if (!file) {
      setMessage("업로드할 파일을 추가해주세요.");
      return;
    }

    setMessage("");

    await onSubmit({
      title: trimmedTitle,
      file,
    });
  };

  const handleBackdropClick = (event) => {
    if (event.target !== event.currentTarget) {
      return;
    }

    if (uploading) {
      return;
    }

    onClose();
  };

  return (
    <div
      className="lecture-upload-modal__backdrop"
      onMouseDown={handleBackdropClick}
    >
      <section className="lecture-upload-modal" role="dialog" aria-modal="true">
        <div className="lecture-upload-modal__visual" />

        <form className="lecture-upload-modal__content" onSubmit={handleSubmit}>
          <button
            type="button"
            className="lecture-upload-modal__close-button"
            onClick={onClose}
            disabled={uploading}
            aria-label="닫기"
          >
            ×
          </button>

          <h2 className="lecture-upload-modal__title">
            새로운 강의를 생성해주세요 !
          </h2>

          <div className="lecture-upload-modal__field">
            <label
              className="lecture-upload-modal__label"
              htmlFor="lecture-upload-title"
            >
              강의 이름 <span>*</span>
            </label>

            <div className="lecture-upload-modal__title-row">
              <input
                id="lecture-upload-title"
                type="text"
                className="lecture-upload-modal__input"
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value);
                  setMessage("");
                }}
                placeholder="1주차"
                disabled={uploading}
              />

              <button
                type="button"
                className="lecture-upload-modal__save-button"
                onClick={handleSaveTitle}
                disabled={uploading}
              >
                저장
              </button>
            </div>
          </div>

          <div className="lecture-upload-modal__field lecture-upload-modal__field--file">
            <p className="lecture-upload-modal__label">
              파일 업로드 <span>*</span>
            </p>

            <div
              className={
                isDragging
                  ? "lecture-upload-modal__drop-zone is-dragging"
                  : "lecture-upload-modal__drop-zone"
              }
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <img
                className="lecture-upload-modal__upload-icon"
                src={uploadIcon}
                alt=""
              />

              <p className="lecture-upload-modal__drop-title">
                Drag &amp; drop files here
              </p>

              <p className="lecture-upload-modal__allowed-types">
                Allowed types: image/png, image/jpeg, application/pdf
              </p>

              <button
                type="button"
                className="lecture-upload-modal__add-file-button"
                onClick={handleAddFileClick}
                disabled={uploading}
              >
                파일 추가하기
              </button>

              <input
                ref={fileInputRef}
                type="file"
                className="lecture-upload-modal__file-input"
                accept="image/png,image/jpeg,application/pdf"
                onChange={handleFileInputChange}
              />
            </div>
          </div>

          <div className="lecture-upload-modal__field lecture-upload-modal__field--list">
            <p className="lecture-upload-modal__label">파일 목록</p>

            {file ? (
              <div className="lecture-upload-modal__file-row">
                <div className="lecture-upload-modal__file-name">
                  {file.name}
                </div>

                <button
                  type="button"
                  className="lecture-upload-modal__remove-file-button"
                  onClick={handleRemoveFile}
                  disabled={uploading}
                  aria-label="파일 삭제"
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="lecture-upload-modal__empty-file">
                아직 추가된 파일이 없습니다.
              </div>
            )}
          </div>

          {message && (
            <p className="lecture-upload-modal__message">{message}</p>
          )}

          <div className="lecture-upload-modal__bottom-row">
            <button
              type="submit"
              className="lecture-upload-modal__upload-button"
              disabled={uploading}
            >
              {uploading ? "업로드 중" : "업로드"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default LectureUploadModal;
