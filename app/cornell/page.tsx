"use client";

import { useBoolean, usePrevious } from "ahooks";
import short from "short-uuid";
import { Spin, message } from "antd";

import { Input } from "@/components/ui/input";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import clsx from "clsx";
import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { urlParseAction } from "@/actions/url-parse-action";
import { toast } from "@/hooks/use-toast";
import type { Note } from "@/types/cornell";
import type { ImperativePanelHandle } from "react-resizable-panels";
import CornellNote, { Mode } from "@/components/cornell-note";
import { getNotes, insertNote } from "@/actions/cornell-action";
import NoteList from "./_ui/note-list";
import NoteDetail from "./_ui/note-detail";
import LottieIcon from "@/components/lottie-icon";

const urlSchema = z.string().url({ message: "Invalid URL" });

export default function CornellPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const configureRef = useRef<ImperativePanelHandle>(null!);
  const [webUrl, setWebUrl] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const previousNotes = usePrevious(notes);
  const [currentNoteUid, setCurrentNoteUid] = useState<string>();
  const currentNote = useMemo(
    () => notes.find((note) => note.uid === currentNoteUid),
    [notes, currentNoteUid]
  );
  const [cornellMode, setCornellMode] = useState(Mode.Preview);
  const formRef = useRef<any>(null!);

  // fetch notes
  async function fetchNotes() {
    const list = await getNotes({});
    const _notes = list.map((note) => {
      Reflect.set(note, "tags", Reflect.get(note, "tags")?.split(",") ?? []);
      return note as Note;
    });
    setNotes(_notes);
    gotoNote(_notes[0].uid, _notes);
  }

  // switch note
  const gotoNote = (uid: string, notes: Note[]) => {
    setCurrentNoteUid(uid);
    const targetNote = notes.find((note) => note.uid === uid);
    formRef.current.form.reset(targetNote);
    configureRef.current.expand(20);
    setCornellMode(Mode.Preview);
  };

  // parse url
  const [parseLoading, { setTrue: startParse, setFalse: stopParse }] =
    useBoolean(false);
  useEffect(() => {
    if (parseLoading) {
      messageApi.open({
        type: "loading",
        content: "Parsing URL...",
        duration: 0,
      });
    } else {
      messageApi.destroy();
    }
  }, [parseLoading]);

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    // add one article
    if (notes.length - (previousNotes?.length ?? 0) === 1) {
      gotoNote(notes.at(-1)!.uid!, notes);
      return;
    }
  }, [notes]);

  return (
    <>
      {contextHolder}
      <div
        className={clsx(
          "rounded-lg",
          "w-11/12",
          "h-5/6",
          "m-auto",
          "border-2",
          "border-gray-300",
          "overflow-hidden"
        )}
      >
        <Spin percent="auto" size="small" spinning={parseLoading}>
          <Input
            placeholder="Pasting a web page (url) here, e.g. https://www.google.com"
            className="rounded-none focus-visible:ring-0"
            value={webUrl}
            onChange={(e) => {
              setWebUrl(e.target.value);
            }}
            onKeyDown={async (e) => {
              if (e.key === "Enter") {
                const validateRes = urlSchema.safeParse(webUrl);
                if (!validateRes.success) {
                  toast({
                    title: validateRes.error.errors[0].message,
                    variant: "destructive",
                  });
                  return;
                }
                const uid = short.generate();
                try {
                  startParse();
                  const {
                    title,
                    iconUrl: icon_url,
                    screenshot,
                  } = await urlParseAction({
                    url: webUrl,
                    uid,
                    screenWidth: window.screen.width,
                    screenHeight: window.screen.height,
                  });
                  const newNote: Note = {
                    uid,
                    title,
                    link: webUrl,
                    icon_url,
                    description: "",
                    tags: [],
                    screenshot,
                    point: "",
                    summary: "",
                  };
                  await insertNote(newNote);
                  setNotes((prev) => [...prev, newNote]);
                  setWebUrl("");
                } finally {
                  stopParse();
                }
              }
            }}
          />
        </Spin>
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={20} minSize={20} maxSize={20}>
            <div className="h-[calc(100%-36px)] p-3 box-border">
              <NoteList
                notes={notes}
                uid={currentNoteUid}
                onUidChange={(uid) => {
                  gotoNote(uid, notes);
                }}
              />
            </div>
          </ResizablePanel>
          <ResizableHandle />
          {/* note detail */}
          <ResizablePanel
            ref={configureRef}
            collapsible
            defaultSize={20}
            minSize={15}
            maxSize={25}
          >
            <div className="h-[calc(100%-36px)] p-3 box-border">
              <NoteDetail
                notes={notes}
                setNotes={setNotes}
                ref={formRef}
                onDelete={() => {
                  fetchNotes();
                }}
                onFocus={() => {
                  configureRef.current.collapse();
                  setCornellMode(Mode.Edit);
                }}
              />
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={60}>
            {currentNote ? (
              <CornellNote
                note={currentNote}
                mode={cornellMode}
                defaultPoint={currentNote?.point}
                defaultSummary={currentNote?.summary}
              />
            ) : (
              <div className="w-full h-full flex justify-center items-center">
                <LottieIcon
                  lottieJsonPath="/data-search.json"
                  width={200}
                  height={200}
                />
              </div>
            )}
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </>
  );
}
