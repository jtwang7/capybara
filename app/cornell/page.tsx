"use client";

import _, { cloneDeep } from "lodash";
import { useBoolean, usePrevious } from "ahooks";
import short from "short-uuid";
import { Empty, Spin, message } from "antd";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import clsx from "clsx";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import TagsSelector from "@/components/tags-selector";
import { urlParseAction } from "@/actions/url-parse-action";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";
import type { Note } from "@/types/cornell";
import type { ImperativePanelHandle } from "react-resizable-panels";
import CornellNote, { Mode } from "@/components/cornell-note";
import { getNotes, insertNote, updateNote } from "@/actions/cornell-action";

const urlSchema = z.string().url({ message: "Invalid URL" });

const formSchema = z.object({
  uid: z.string().min(1, { message: "UID is required" }),
  title: z.string().min(1, { message: "Title is required" }),
  link: z.string().min(1, { message: "Link is required" }),
  icon_url: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
});

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
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema), // resolver will validate formdata before submit
    defaultValues: notes[0],
  });
  const tagList = useMemo(() => {
    const list = notes.reduce<Set<string>>((store, note) => {
      note.tags?.forEach((tag) => {
        store.add(tag);
      });
      return store;
    }, new Set<string>());
    return Array.from(list);
  }, [notes]);

  // switch note
  const gotoNote = (uid: string) => {
    setCurrentNoteUid(uid);
    const targetNote = notes.find((note) => note.uid === uid);
    form.reset(targetNote);
    configureRef.current.expand(20);
    setCornellMode(Mode.Preview);
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const _note = notes.find((note) => note.uid === data.uid);
    let newNote = cloneDeep(_note);
    if (!newNote) {
      toast({
        title: "Save Note Failed",
        description: `Note with uid ${data.uid} not found`,
      });
      return;
    }
    newNote = {
      ...newNote,
      ...data,
    };

    const success = await updateNote(newNote);
    if (success) {
      message.success("Note saved successfully");
    } else {
      message.error("Note save failed");
      return;
    }
    setNotes((prev) => {
      const copy = cloneDeep(prev);
      const idx = copy.findIndex((note) => note.uid === data.uid);
      copy[idx] = newNote!;
      return copy;
    });
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
    async function fetchData() {
      const list = await getNotes({});
      const notes = list.map((note) => {
        Reflect.set(note, "tags", Reflect.get(note, "tags")?.split(",") ?? []);
        return note as Note;
      });
      setNotes(notes);
    }
    fetchData();
  }, []);

  useEffect(() => {
    // first render
    if (previousNotes?.length === 0 && notes.length) {
      gotoNote(notes[0].uid!);
      return;
    }
    // add one article
    if (notes.length - (previousNotes?.length ?? 0) === 1) {
      gotoNote(notes.at(-1)!.uid!);
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
          {/* note introduction cards */}
          <ResizablePanel defaultSize={20} minSize={20} maxSize={20}>
            {notes.length ? (
              <div className="flex flex-col h-full items-center p-3 space-y-2">
                {notes.map((note) => (
                  <Card
                    key={note.uid}
                    className={clsx(
                      "w-full",
                      "p-2",
                      "rounded-md",
                      "cursor-pointer",
                      currentNoteUid === note.uid && "bg-gray-100"
                    )}
                    onClick={() => {
                      gotoNote(note.uid);
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
                          <span className="text-sm">{note.title}</span>
                        </div>
                      }
                    </CardTitle>
                    <CardDescription>{note.description}</CardDescription>
                  </Card>
                ))}
              </div>
            ) : (
              <Empty
                image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                imageStyle={{ height: 60 }}
                description="Paste a web page (url) to add a note"
                className="flex flex-col justify-center items-center h-full"
              />
            )}
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
            <div className="flex flex-col h-full items-center p-3">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="w-full space-y-2"
                >
                  <FormField
                    control={form.control}
                    name="uid"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">UID</FormLabel>
                        <FormControl>
                          <Input disabled {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field, formState }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Add note title" {...field} />
                        </FormControl>
                        <FormDescription>
                          <span className="text-red-400">
                            {formState.errors.title?.message}
                          </span>
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="link"
                    render={({ field, formState }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Link</FormLabel>
                        <FormControl>
                          <Input placeholder="Add note link" {...field} />
                        </FormControl>
                        <FormDescription>
                          <span className="text-red-400">
                            {formState.errors.link?.message}
                          </span>
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="icon_url"
                    render={({ field, formState }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">
                          Icon Url
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Add note icon-url" {...field} />
                        </FormControl>
                        <FormDescription>
                          <span className="text-red-400">
                            {formState.errors.icon_url?.message}
                          </span>
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">
                          Description
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Add note description"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Tags</FormLabel>
                        <FormControl>
                          <TagsSelector
                            tagList={tagList}
                            tagValue={field.value}
                            onChange={(tags) => {
                              form.setValue("tags", tags);
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <div className="space-x-2">
                    <Button type="submit" className="h-7 font-bold">
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      className="h-7 font-bold"
                      onClick={() => {
                        configureRef.current.collapse();
                        setCornellMode(Mode.Edit);
                      }}
                    >
                      Cornell Mode
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={60}>
            <CornellNote
              mode={cornellMode}
              screenshot={currentNote?.screenshot}
              defaultPoint=""
              defaultSummary=""
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </>
  );
}
