"use client";

import _ from "lodash";
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
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import TagsSelector from "@/components/tags-selector";

interface Note {
  uid: string;
  title: string;
  link: string;
  description?: string;
  tags?: string[];
}

const formSchema = z
  .object({
    title: z.string().min(1),
    link: z.string().min(1),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
  })
  .required({
    title: true,
    link: true,
  });

// TODO: mock note data
const mockNotes: Note[] = [
  {
    uid: "0",
    title: "title1",
    link: "link1",
    description: "description1",
    tags: ["tag1", "tag2"],
  },
  {
    uid: "1",
    title: "title2",
    link: "link2",
    description: "description2",
    tags: ["tag3", "tag4"],
  },
];

export default function CornellPage({ className }: { className?: string }) {
  const [notes, setNotes] = useState<Note[]>(mockNotes);
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
    const res = formSchema.safeParse(data);
    if (!res.success) {
      console.error(res.error);
    }
    console.log(data);
  };

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
        className="rounded-none"
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
                  form.reset({ ...note });
                }}
              >
                <CardTitle>{note.title}</CardTitle>
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
          <div className="flex h-full items-center justify-center p-6">
            <span className="font-semibold">Three</span>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
