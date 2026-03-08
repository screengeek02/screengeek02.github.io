import Image from 'next/image';

export default function Logo() {
  return (
    <Image
      src="/public/image/logo.png"
      alt="Helio logo"
      width={220}
      height={80}
      priority
      unoptimized
      className="h-14 w-auto object-contain md:h-16"
    />
  );
}
