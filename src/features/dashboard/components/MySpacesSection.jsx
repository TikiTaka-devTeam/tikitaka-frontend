import { Fragment, useMemo, useState } from "react";
import { createSpace } from "../api/dashboard.api.js";
import CreateSpaceModal from "./CreateSpaceModal.jsx";
import JoinSpaceModal from "./JoinSpaceModal.jsx";
import MySpaceCard from "./MySpaceCard.jsx";

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M16 16l4 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M5 7h14M8 12h8M10.5 17h3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 5v14M5 12h14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MySpacesSection({
  spaces,
  isLoading,
  errorMessage,
  onRetry,
  onSelectSpace,
  ownerName,
  onSpaceCreated,
  userRole,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  const filteredSpaces = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return spaces;
    }

    return spaces.filter((space) =>
      [space.name, space.nickname, space.professor_name, space.semester]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedQuery)),
    );
  }, [searchQuery, spaces]);

  async function handleCreateSpace(payload) {
    const createdSpace = await createSpace({
      ...payload,
      ownerName,
    });

    onSpaceCreated?.(createdSpace);
  }

  function handleOpenPrimaryModal() {
    if (userRole === "STUDENT") {
      setIsJoinModalOpen(true);
      return;
    }

    setIsCreateModalOpen(true);
  }

  return (
    <Fragment>
      <section className="my-spaces-section">
        <div className="my-spaces-toolbar">
          <button
            type="button"
            className="my-spaces-toolbar__create"
            aria-label="스페이스 추가"
            onClick={handleOpenPrimaryModal}
          >
            <PlusIcon />
          </button>

          <div className="my-spaces-toolbar__search-row">
            <button type="button" className="my-spaces-toolbar__filter" aria-label="필터">
              <FilterIcon />
            </button>

            <label className="my-spaces-toolbar__search">
              <input
                type="search"
                placeholder="스페이스 검색"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
              <span className="my-spaces-toolbar__search-icon">
                <SearchIcon />
              </span>
            </label>
          </div>
        </div>

        {isLoading ? (
          <section className="dashboard-feedback-panel">
            <p>스페이스 목록을 불러오는 중입니다.</p>
          </section>
        ) : null}

        {!isLoading && errorMessage ? (
          <section className="dashboard-feedback-panel is-error">
            <p>{errorMessage}</p>
            <button type="button" className="dashboard-feedback-panel__action" onClick={onRetry}>
              다시 시도
            </button>
          </section>
        ) : null}

        {!isLoading && !errorMessage ? (
          <div className="my-spaces-grid">
            {filteredSpaces.length === 0 ? (
              <div className="my-spaces-empty">
                <p>
                  {searchQuery
                    ? "검색 결과가 없습니다."
                    : "참여 중인 스페이스가 없습니다."}
                </p>
              </div>
            ) : (
              filteredSpaces.map((space) => (
                <MySpaceCard key={space.space_id} space={space} onSelect={onSelectSpace} />
              ))
            )}
          </div>
        ) : null}
      </section>

      <CreateSpaceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateSpace}
        ownerName={ownerName}
      />

      <JoinSpaceModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onSubmit={() => {}}
      />
    </Fragment>
  );
}

export default MySpacesSection;
