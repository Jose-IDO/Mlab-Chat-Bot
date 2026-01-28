import * as React from "react";
import { Button } from "../button";

// Define type for news items
interface NewsItem {
  image: string;
  date: string;
  title: string;
  excerpt: string;
  badge: string | null;
  badgeColor?: string;
}

const newsItems: NewsItem[] = [
  {
    image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&q=80",
    date: "31 October, 2025",
    title: "CALL FOR APPLICATIONS: APPOINTMENT OF AN ASSESSOR AND MODERATOR FO...",
    excerpt:
      "The role of the assessor is to collect evidence and make a judgement on learner competence using the...",
    badge: "CALL FOR SERVICE PROVIDERS",
    badgeColor: "bg-[#8cc63f]",
  },
  {
    image: "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=600&q=80",
    date: "24 October, 2025",
    title: "CALL FOR DIGITAL AND GREEN INNOVATIONS",
    excerpt:
      "In partnership with the Department of Science and Innovation (DSI), mLab is pleased to announce a...",
    badge: "CALL FOR PROPOSALS",
    badgeColor: "bg-[#8cc63f]",
  },
  {
    image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&q=80",
    date: "30 September, 2025",
    title: "MLAB PARTNERS WITH GIZ TO HELP SOUTH AFRICANS SAVE GREEN THROUG...",
    excerpt:
      "The Digital Skills for Jobs Africa Program, together with mLab (with the support of the BMZ, is proud to...",
    badge: null,
  },
];

export default function NewsSection(): React.ReactElement {
  return (
    <section className="py-16 md:py-24 bg-[#f8f8f8] relative">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-[2px] bg-[#8cc63f]"></div>
            <span className="text-[#1a2744] font-bold text-xl tracking-wider">
              LATEST NEWS
            </span>
            <div className="w-8 h-[2px] bg-[#8cc63f]"></div>
          </div>
          <p className="text-gray-500 text-sm max-w-xl mx-auto">
            Keep up to date with our latest calls for applications, opportunities, projects and announcements.
          </p>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {newsItems.map((item, index) => (
            <article
              key={index}
              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 group"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {item.badge && (
                  <div
                    className={`absolute top-4 left-4 ${item.badgeColor} text-white text-xs font-bold px-3 py-2 rounded`}
                  >
                    {item.badge}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-gray-400 text-sm mb-2">{item.date}</p>
                <h3 className="text-[#1a2744] font-bold text-lg mb-3 line-clamp-2 group-hover:text-[#8cc63f] transition-colors">
                  {item.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">
                  {item.excerpt}
                </p>
                <Button
                  variant="outline"
                  className="border-[#1a2744] text-[#1a2744] hover:bg-[#1a2744] hover:text-white font-semibold text-sm"
                >
                  READ MORE
                </Button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
