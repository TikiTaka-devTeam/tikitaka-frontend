function ModeTabs({ items, onChange }) {
  return (
    <nav
      className="mode-tabs"
      aria-label="\uD398\uC774\uC9C0 \uC774\uB3D9"
    >
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          className={`mode-tabs__item ${item.active ? "is-active" : ""}`}
          onClick={() => onChange?.(item.value ?? item.label)}
          aria-pressed={item.active}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}

export default ModeTabs;
