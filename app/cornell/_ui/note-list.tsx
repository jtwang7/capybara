"use client";

import { clsx } from "clsx";
import Image from "next/image";
import { CardDescription, CardTitle, Card } from "@/components/ui/card";
import { Note } from "@/types/cornell";
import { useControllableValue } from "ahooks";
import { Empty } from "antd";

export default function NoteList(props: {
  notes?: Note[];
  defaultUid?: string;
  uid?: string;
  onUidChange?: (uid: string) => void;
}) {
  const { notes = [] } = props;

  const [currentUid, setCurrentUid] = useControllableValue(props, {
    defaultValuePropName: "defaultUid",
    valuePropName: "uid",
    trigger: "onUidChange",
  });

  if (notes.length === 0) {
    return (
      <Empty
        image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
        imageStyle={{ height: 60 }}
        description="Paste a web page (url) to add a note"
        className="flex flex-col justify-center items-center h-full"
      />
    );
  }
  return (
    <div className="flex flex-col h-full items-center p-3 space-y-2">
      {notes.map((note) => (
        <Card
          key={note.uid}
          className={clsx(
            "w-full",
            "p-2",
            "rounded-md",
            "cursor-pointer",
            currentUid === note.uid && "bg-gray-100"
          )}
          onClick={() => {
            setCurrentUid(note.uid);
          }}
        >
          <CardTitle>
            {
              <div className="flex space-x-1">
                <Image
                  src={note.icon_url ?? "/paperclip.png"}
                  width={20}
                  height={20}
                  className="p-1"
                  alt="website icon"
                />
                <span className="text-sm text-balance">{note.title}</span>
              </div>
            }
          </CardTitle>
          <CardDescription>{note.description}</CardDescription>
        </Card>
      ))}
    </div>
  );
}
