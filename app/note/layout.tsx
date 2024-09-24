import Image from "next/image";
import Background from "@/images/background.svg";

export default function NoteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="w-screen h-screen overflow-hidden relative flex justify-center items-center">
      <Image
        src={Background}
        alt="background"
        sizes="100vw"
        className="w-full h-auto absolute left-0 top-0 z-[-1]"
      />
      {children}
    </div>
  );
}
