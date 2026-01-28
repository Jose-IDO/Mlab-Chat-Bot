import * as React from "react";
import { Network, GraduationCap, Rocket, Settings } from "lucide-react";
import { Button } from "../button";

// Define type for service items
interface Service {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  subtitle: string;
  title: string;
  description: string;
  featured?: boolean;
}

const services: Service[] = [
  {
    icon: Network,
    subtitle: "DIGITAL / TECHNOLOGY",
    title: "Tech Ecosystems",
    description:
      "mLab plays a catalytic role in nurturing and growing tech ecosystems in South Africa through its technology ecosystem strategy.",
  },
  {
    icon: GraduationCap,
    subtitle: "CAPACITY / TRAINING",
    title: "Tech Skills",
    description:
      "Assisting in workforce Ready Skills Training, ICT Entrepreneurship and more digital skills for Africa. Youth, Innovators and students.",
  },
  {
    icon: Rocket,
    subtitle: "SUPPORT / INCUBATORS",
    title: "Tech Start-Ups",
    description:
      "A great business idea is a good start... but it does not translate to a ready able to go to market. mLab supply the capacity to start and scale.",
  },
  {
    icon: Settings,
    subtitle: "BUILD / SOFTWARE",
    title: "Tech Solutions",
    description:
      "mLab develops custom, innovative and unique solutions for Government, the public sector as well as development organisations and Businesses.",
    featured: true,
  },
];

export default function WhatWeDoSection(): React.ReactElement {
  return (
    <section className="py-16 md:py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-[2px] bg-[#8cc63f]"></div>
            <span className="text-[#8cc63f] font-semibold text-sm tracking-wider">
              WHAT WE DO
            </span>
            <div className="w-8 h-[2px] bg-[#8cc63f]"></div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className={`group p-6 rounded-lg transition-all duration-300 ${
                service.featured
                  ? "bg-[#8cc63f] text-white"
                  : "bg-white hover:shadow-xl border border-gray-100"
              }`}
            >
              {/* Icon */}
              <div
                className={`mb-4 ${
                  service.featured ? "text-white" : "text-[#8cc63f]"
                }`}
              >
                <service.icon className="w-12 h-12 stroke-[1.5]" />
              </div>

              {/* Subtitle */}
              <p
                className={`text-xs tracking-wider mb-2 ${
                  service.featured ? "text-white/80" : "text-gray-400"
                }`}
              >
                {service.subtitle}
              </p>

              {/* Title */}
              <h3
                className={`text-xl font-bold mb-3 ${
                  service.featured ? "text-white" : "text-[#1a2744]"
                }`}
              >
                {service.title}
              </h3>

              {/* Description */}
              <p
                className={`text-sm leading-relaxed mb-6 ${
                  service.featured ? "text-white/90" : "text-gray-600"
                }`}
              >
                {service.description}
              </p>

              {/* Button */}
              <Button
                variant="outline"
                className={`font-semibold text-sm ${
                  service.featured
                    ? "border-white text-white hover:bg-white hover:text-[#8cc63f]"
                    : "border-[#1a2744] text-[#1a2744] hover:bg-[#1a2744] hover:text-white"
                }`}
              >
                READ MORE
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
