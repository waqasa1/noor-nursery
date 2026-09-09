export function BilingualHeading({ en, ur, as: Tag = "h1", className = "" }) {
  return (
    <div className={className}>
      <Tag className="font-display font-bold text-foreground">{en}</Tag>
      {ur && (
        <p className="text-urdu mt-1 text-secondary" dir="rtl" lang="ur">
          {ur}
        </p>
      )}
    </div>
  );
}

export function BilingualParagraph({ en, ur, className = "" }) {
  return (
    <div className={className}>
      <p className="text-foreground">{en}</p>
      {ur && (
        <p className="text-urdu mt-2 text-muted-foreground" dir="rtl" lang="ur">
          {ur}
        </p>
      )}
    </div>
  );
}
