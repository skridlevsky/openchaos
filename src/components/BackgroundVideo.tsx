'use client';

export default function BackgroundVideo() {
  const handleClick = () => {
    const video = document.querySelector('video');
    if (video && video.paused) {
      video.play();
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 -z-10 cursor-pointer"
        onClick={handleClick}
      >
        <video
          autoPlay
          muted={true}
          playsInline
          className="w-full h-full object-cover"
          onPlay={(e) => {
            e.currentTarget.muted = false;
          }}
        >
          <source src="/bad-apple.mp4" type="video/mp4" />
        </video>
      </div>
    </>
  );
}