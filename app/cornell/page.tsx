"use client";

import _, { cloneDeep } from "lodash";
import { usePrevious } from "ahooks";
import { v4 } from "uuid";
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
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import TagsSelector from "@/components/tags-selector";
import { urlParseAction } from "@/actions/url-parse-action";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";

interface Note {
  uid: string;
  title: string;
  link: string;
  iconUrl?: string;
  description?: string;
  tags?: string[];
}

const urlSchema = z.string().url({ message: "Invalid URL" });

const formSchema = z.object({
  uid: z.string().min(1, { message: "UID is required" }),
  title: z.string().min(1, { message: "Title is required" }),
  link: z.string().min(1, { message: "Link is required" }),
  iconUrl: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
});

// TODO: mock note data
const mockNotes: Note[] = [
  {
    uid: "0",
    title: "title1",
    link: "link1",
    iconUrl: "/paperclip.png",
    description: "description1",
    tags: ["tag1", "tag2"],
  },
  {
    uid: "1",
    title: "title2",
    link: "link2",
    iconUrl: "/paperclip.png",
    description: "description2",
    tags: ["tag3", "tag4"],
  },
];

export default function CornellPage({ className }: { className?: string }) {
  const [webUrl, setWebUrl] = useState("");

  const [notes, setNotes] = useState<Note[]>(mockNotes);
  const previousNotes = usePrevious(notes);
  const [currentNoteIdx, setCurrentNoteIdx] = useState(0);
  const [tagList, setTagList] = useState(() => {
    const list = notes.reduce<Set<string>>((store, note) => {
      note.tags?.forEach((tag) => {
        store.add(tag);
      });
      return store;
    }, new Set<string>());
    return Array.from(list);
  });

  const form = useForm<z.infer<typeof formSchema>>({
    // resolver will validate formdata before submit
    resolver: zodResolver(formSchema),
    defaultValues: notes[0],
  });
  const onSubmit = (data: z.infer<typeof formSchema>) => {
    setNotes((prev) => {
      const copy = cloneDeep(prev);
      const idx = copy.findIndex((note) => note.uid === data.uid);
      if (!idx) {
        toast({
          title: "Save Note Failed",
          description: `Note with uid ${data.uid} not found`,
        });
        return copy;
      }
      copy[idx] = data;
      return copy;
    });
  };

  useEffect(() => {
    form.reset({ ...notes[currentNoteIdx] });
  }, [currentNoteIdx]);

  useEffect(() => {
    // add one article
    if (notes.length - (previousNotes?.length ?? 0) === 1) {
      setCurrentNoteIdx(notes.length - 1);
    }
  }, [notes]);

  return (
    <div
      className={clsx(
        "rounded-lg",
        "w-11/12",
        "h-5/6",
        "m-auto",
        "border-2",
        "border-gray-300",
        "overflow-hidden",
        !!className && className
      )}
    >
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
            const { title, iconUrl } = await urlParseAction(webUrl);
            setNotes((prev) => {
              const newNote = {
                uid: v4(),
                title,
                link: webUrl,
                iconUrl,
                description: "",
                tags: [],
              };
              return [...prev, newNote];
            });
            setWebUrl("");
          }
        }}
      />
      <ResizablePanelGroup direction="horizontal">
        {/* note introduction cards */}
        <ResizablePanel defaultSize={20} minSize={20} maxSize={20}>
          <div className="flex flex-col h-full items-center p-3 space-y-2">
            {notes.map((note, idx) => (
              <Card
                key={note.uid}
                className={clsx(
                  "w-full",
                  "p-2",
                  "rounded-md",
                  "cursor-pointer",
                  currentNoteIdx === idx && "bg-gray-100"
                )}
                onClick={() => {
                  setCurrentNoteIdx(idx);
                }}
              >
                <CardTitle>
                  {
                    <div className="flex space-x-1">
                      <Image
                        src={note.iconUrl ?? "/paperclip.png"}
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
        </ResizablePanel>
        <ResizableHandle />
        {/* note detail */}
        <ResizablePanel defaultSize={20} minSize={15} maxSize={25}>
          <div className="flex flex-col h-full items-center p-3">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full space-y-2"
              >
                <FormField
                  control={form.control}
                  name="uid"
                  render={({ field, formState }) => (
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
                  name="iconUrl"
                  render={({ field, formState }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">Icon Url</FormLabel>
                      <FormControl>
                        <Input placeholder="Add note icon-url" {...field} />
                      </FormControl>
                      <FormDescription>
                        <span className="text-red-400">
                          {formState.errors.iconUrl?.message}
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
                <Button type="submit" className="h-8">
                  Save
                </Button>
              </form>
            </Form>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={60}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={75}>
              <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={70}>
                  <div>One</div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={30}>
                  <div>Two</div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={25}>
              <div>Three</div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
