interface Web2LoadingSpinnerProps {
  text?: string;
}

export function Web2LoadingSpinner({ text = "Loading..." }: Web2LoadingSpinnerProps) {
  return (
    <div className="web2-loading-container">
      <div className="web2-loading-spinner" />
      <p>{text}</p>
    </div>
  );
}
