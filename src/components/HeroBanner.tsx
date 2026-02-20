interface HeroBannerProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
}

export default function HeroBanner({ title, subtitle, backgroundImage }: HeroBannerProps) {
  return (
    <div
      className="relative w-full h-[50vh] min-h-[320px] flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${backgroundImage || "/img/header_img/newhome_bg.jpg"})` }}
    >
      <div className="hero-overlay absolute inset-0" />
      <div className="relative z-10 text-center px-6 animate-fade-in">
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
