"use client";

import { Badge } from "./ui/badge";
import { xor } from "lodash";
import { useControllableValue, useBoolean } from "ahooks";
import { Input } from "./ui/input";
import { useEffect, useRef, useState } from "react";

export default function TagsSelector(props: {
  defaultTagValue?: string[];
  tagValue?: string[];
  tagList?: string[];
  onChange?: (tags: string[]) => void;
  onSelect?: (tag: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const { tagList = [], onSelect } = props;
  const [availableTagList, setAvailableTagList] = useState(tagList);
  const [tags, setTags] = useControllableValue<string[]>(props, {
    defaultValuePropName: "defaultTagValue",
    valuePropName: "tagValue",
    trigger: "onChange",
  });

  const [edit, { setTrue: startEdit, setFalse: stopEdit }] = useBoolean(false);

  const createTag = (value: string) => {
    setTags((prev) => [...prev, value]);
    setAvailableTagList((prev) => [...prev, value]);
    stopEdit();
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
        className="cursor-pointer  outline-dashed h-5 mr-2 mb-2"
        onClick={() => {
          startEdit();
        }}
      >
        {!edit ? (
          "+"
        ) : (
          <Input
            ref={inputRef}
            className="border-none bg-transparent h-4 outline-none focus-visible:ring-0 shadow-none px-0"
            onBlur={(e) => {
              const newTag = e.target.value;
              newTag && createTag(newTag);
            }}
          />
        )}
      </Badge>
    </div>
  );
}
