"use client";

import { deleteNote, deleteTag, updateNote } from "@/actions/cornell-action";
import TagsSelector from "@/components/tags-selector";
import { Button } from "@/components/ui/button";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Note } from "@/types/cornell";
import { zodResolver } from "@hookform/resolvers/zod";
import { PopoverClose } from "@radix-ui/react-popover";
import { message } from "antd";
import { cloneDeep } from "lodash";
import {
  Dispatch,
  SetStateAction,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  uid: z.string().min(1, { message: "UID is required" }),
  title: z.string().min(1, { message: "Title is required" }),
  link: z.string().min(1, { message: "Link is required" }),
  icon_url: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
});

const NoteDetail = forwardRef(
  (
    props: {
      notes: Note[];
      setNotes: Dispatch<SetStateAction<Note[]>>;
      onDelete?: (uid: string) => void;
      onFocus?: () => void;
    },
    ref: any
  ) => {
    const { notes, setNotes, onDelete, onFocus } = props;

    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema), // resolver will validate formdata before submit
      defaultValues: notes[0],
    });

    const [tagList, setTagList] = useState<string[]>([]);
    useEffect(() => {
      const list = notes.reduce<Set<string>>((store, note) => {
        note.tags?.forEach((tag) => {
          tag && store.add(tag);
        });
        return store;
      }, new Set<string>());
      setTagList(Array.from(list));
    }, [notes]);

    // expose form instance to parent component
    useImperativeHandle(
      ref,
      () => {
        return {
          form,
        };
      },
      []
    );

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

    return (
      <div className="flex flex-col h-full items-center overflow-auto p-1">
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
                  <FormLabel className="font-semibold">Icon Url</FormLabel>
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
                  <FormLabel className="font-semibold">Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Add note description" {...field} />
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
                      onTagListChange={(tags) => {
                        setTagList(tags);
                      }}
                      tagValue={field.value}
                      onChange={(tags) => {
                        form.setValue("tags", tags);
                      }}
                      onDelete={async (tag) => {
                        await deleteTag(notes, tag);
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="w-full flex">
              <Button
                type="submit"
                variant="outline"
                className="flex-auto h-7 font-bold rounded-none rounded-l-md"
              >
                Save
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex-auto h-7 font-bold rounded-none"
                  >
                    Delete
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" style={{ padding: 10 }}>
                  <div className="space-y-2">
                    <p className="font-bold">{form.getValues("title")}</p>
                    <p>Please double-check if you want to delete this note.</p>
                    <div className="flex flex-row-reverse space-x-2">
                      <PopoverClose asChild>
                        <Button className="h-7 p-2 mx-2 font-bold">
                          Cancel
                        </Button>
                      </PopoverClose>
                      <Button
                        className="h-7 p-2 mx-2"
                        variant="outline"
                        onClick={async () => {
                          const uid = form.getValues("uid");
                          const success = await deleteNote(uid);
                          if (!success) {
                            message.error("Delete note failed");
                            return;
                          }
                          // after delete callback "onDelete"
                          onDelete?.(uid);
                        }}
                      >
                        Confirm
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              <Button
                variant="outline"
                className="flex-auto h-7 font-bold rounded-none rounded-r-md"
                type="button"
                onClick={() => {
                  onFocus?.();
                }}
              >
                Focus
              </Button>
            </div>
          </form>
        </Form>
      </div>
    );
  }
);

export default NoteDetail;
