import * as React from "react";
import { useState } from "react";
import { Play } from "lucide-react";

export default function VideoSection(): React.ReactElement {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  return (
    <section className="relative py-0">
      {/* Background Image with Play Button */}
      <div className="relative h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=1920&q=80')`,
          }}
        >
          <div className="absolute inset-0 bg-[#1a2744]/40"></div>
        </div>

        {/* Video Title */}
        <div className="absolute top-8 left-8 z-10">
          <p className="text-white/60 text-xs tracking-wider mb-1">#mLab STUDIO</p>
        </div>

        {/* Play Button */}
        <div className="absolute inset-0 flex items-center justify-center">
          {!isPlaying ? (
            <button
              onClick={() => setIsPlaying(true)}
              className="group relative"
            >
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-red-600 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                <Play className="w-8 h-8 md:w-10 md:h-10 text-white fill-white ml-1" />
              </div>
              <div className="absolute inset-0 rounded-full bg-red-600/30 animate-ping"></div>
            </button>
          ) : (
            <iframe
              className="w-full h-full absolute inset-0"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
              title="mLab Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          )}
        </div>

        {/* Bottom text */}
        <div className="absolute bottom-8 left-8 z-10">
          <p className="text-white text-lg md:text-xl font-medium">Watch our #Stories</p>
        </div>
      </div>
    </section>
  );
}
