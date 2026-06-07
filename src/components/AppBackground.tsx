import Image from "next/image";
import { images } from "@/lib/images";

const tiles = [
  { src: images.hero, top: "5%", left: "3%", size: 180, rotate: -8 },
  { src: images.couple, top: "12%", right: "5%", size: 160, rotate: 6 },
  { src: images.friends, top: "45%", left: "1%", size: 140, rotate: 4 },
  { src: images.connection, top: "55%", right: "2%", size: 170, rotate: -5 },
  { src: images.signup, bottom: "8%", left: "6%", size: 150, rotate: -3 },
  { src: images.couple, bottom: "12%", right: "4%", size: 130, rotate: 8 },
];

export default function AppBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-cream/92" />
      <div className="absolute inset-0 bg-gradient-to-br from-rose/5 via-transparent to-plum/8" />

      {tiles.map((tile, i) => (
        <div
          key={i}
          className="absolute relative opacity-[0.12] blur-[0.5px]"
          style={{
            top: tile.top,
            left: tile.left,
            right: tile.right,
            bottom: tile.bottom,
            width: tile.size,
            height: tile.size,
            transform: `rotate(${tile.rotate}deg)`,
          }}
        >
          <Image
            src={tile.src}
            alt=""
            fill
            className="rounded-3xl object-cover shadow-lg"
            sizes={`${tile.size}px`}
          />
        </div>
      ))}
    </div>
  );
}
