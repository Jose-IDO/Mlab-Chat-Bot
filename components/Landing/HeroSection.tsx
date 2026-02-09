import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function HeroSection(): React.ReactElement {
  return (
    <section className="!relative h-[700px] !md:h-[700px] !w-full overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1573164713988-8665fc963095?w=1920&q=80')`,
        }}
      >
        <div className="absolute inset-0 bg-[#1a2744]/80"></div>
      </div>

      {/* Green accent shapes */}
      <div className="absolute top-0 left-0 w-32 h-32 md:w-48 md:h-48">
        <div className="absolute top-4 left-4 w-20 h-20 md:w-32 md:h-32 border-2 border-[#8cc63f]/30 rounded-full"></div>
        <div className="absolute top-8 left-8 w-12 h-12 md:w-20 md:h-20 bg-[#8cc63f]/20 rounded-full"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight max-w-5xl">
          CREATING TECHNOLOGY FOR THE PEOPLE
        </h1>
        <p className="mt-6 text-white/80 text-sm md:text-base max-w-2xl">
          Registered Non-Profit Not-for-Profit Organisation (NPO), focused on
          building South Africa&apos;s skills in ICT. Provider
        </p>
      </div>

      {/* Navigation Arrows */}
      <button className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all">
        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-white" />
      </button>
      <button className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all">
        <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-white" />
      </button>

      {/* Slide indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        <div className="w-3 h-3 rounded-full bg-[#8cc63f]"></div>
        <div className="w-3 h-3 rounded-full bg-white/30"></div>
        <div className="w-3 h-3 rounded-full bg-white/30"></div>
      </div>
    </section>
  );
}
