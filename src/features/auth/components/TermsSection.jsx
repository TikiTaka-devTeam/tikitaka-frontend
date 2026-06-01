function TermsSection({
  title,
  checked,
  onChange,
  content,
}) {
  return (
    <section className="terms-section">
      <div className="terms-header">
        <h3>{title}</h3>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={checked}
            onChange={onChange}
          />
          동의합니다.
        </label>
      </div>

      <div className="terms-content">
        <pre>{content}</pre>
      </div>
    </section>
  );
}

export default TermsSection;