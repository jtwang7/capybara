"use client";

import { Badge } from "./ui/badge";
import { xor } from "lodash";
import { useControllableValue, useBoolean } from "ahooks";
import { Input } from "./ui/input";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function TagsSelector(props: {
  defaultTagValue?: string[];
  tagValue?: string[];
  onChange?: (tags: string[]) => void;
  defaultTagList?: string[];
  tagList?: string[];
  onTagListChange?: (tags: string[]) => void;
  onSelect?: (tag: string) => void;
}) {
  const { onSelect } = props;

  const { toast } = useToast();

  const [availableTagList, setAvailableTagList] = useControllableValue<
    string[]
  >(props, {
    defaultValuePropName: "defaultTagList",
    valuePropName: "tagList",
    trigger: "onTagListChange",
  });
  const [tags, setTags] = useControllableValue<string[]>(props, {
    defaultValuePropName: "defaultTagValue",
    valuePropName: "tagValue",
    trigger: "onChange",
  });

  const [edit, { setTrue: startEdit, setFalse: stopEdit }] = useBoolean(false);

  const inputValue = useRef("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const createTag = (value: string) => {
    const init = () => {
      stopEdit();
      inputValue.current = "";
    };
    try {
      if (!value) {
        toast({
          variant: "destructive",
          title: "Tag cannot be empty",
          duration: 1500,
        });
        return;
      }
      if (availableTagList.some((tag) => tag === value)) {
        toast({
          variant: "destructive",
          title: "Tag already exists",
          duration: 1500,
        });
        return;
      }
      setTags((prev) => [...prev, value]);
      setAvailableTagList((prev) => [...prev, value]);
    } finally {
      init();
    }
  };

  useEffect(() => {
    if (edit && inputRef.current) {
      inputRef.current.focus();
    }
  }, [edit]);

  return (
    <div className="flex flex-wrap justify-start items-center">
      {availableTagList.map((tag) => (
        <Badge
          key={tag}
          className="cursor-pointer mr-2 mb-2"
          variant={tags?.includes(tag) ? "default" : "outline"}
          onClick={() => {
            setTags(xor(tags, [tag]));
            onSelect?.(tag);
          }}
        >
          {tag}
        </Badge>
      ))}
      <Badge
        variant="secondary"
        className="cursor-pointer outline-dashed h-5 mr-2 mb-2"
        onClick={() => {
          startEdit();
        }}
      >
        {!edit ? (
          "+"
        ) : (
          <Input
            ref={inputRef}
            onChange={(e) => {
              inputValue.current = e.target.value;
            }}
            className="border-none bg-transparent h-4 outline-none focus-visible:ring-0 shadow-none px-0 font-normal"
            onBlur={() => {
              createTag(inputValue.current);
            }}
          />
        )}
      </Badge>
    </div>
  );
}
