"use client";

import { Badge } from "./ui/badge";
import { xor } from "lodash";
import { useControllableValue, useBoolean } from "ahooks";
import { Input } from "./ui/input";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { SquareX } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";

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

  const [deletable, { setTrue: allowDelete, setFalse: notAllowDelete }] =
    useBoolean(false);
  const [hoveredTag, setHoveredTag] = useState<string>("");
  const hoverTimer = useRef<NodeJS.Timeout | null>(null);
  const hoverToDelete = (tag: string, time = 1000) => {
    setHoveredTag(tag);
    !!hoverTimer.current && clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => {
      allowDelete();
    }, time);
  };
  const unHoverToCancelDelete = () => {
    setHoveredTag("");
    !!hoverTimer.current && clearTimeout(hoverTimer.current);
    hoverTimer.current = null;
    notAllowDelete();
  };
  const deleteTag = (tag: string) => {
    // TODO: 删除 tag 的逻辑
  };

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
          onMouseEnter={() => hoverToDelete(tag)}
          onMouseLeave={() => unHoverToCancelDelete()}
        >
          <span className="flex items-center flex-nowrap space-x-1">
            <span>{tag}</span>
            {deletable && hoveredTag === tag ? (
              <div
                onClick={(e) => {
                  // 删除 tag 时只响应弹窗 trigger 内部事件，后续事件冒泡拦截
                  e.stopPropagation();
                }}
              >
                <Dialog>
                  <DialogTrigger asChild>
                    <SquareX width={14} height={14} />
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] bg-white">
                    <DialogHeader>
                      <DialogTitle>Confirm Removal</DialogTitle>
                      <DialogDescription>
                        Make double check to your remove action here. Click
                        delete when you're confirmed.
                      </DialogDescription>
                      <div>
                        {/* TODO: 当前要删除的 tag */}
                        {/* TODO: 删除 tag 影响的笔记数量以及具体笔记 */}
                      </div>
                    </DialogHeader>
                    <DialogFooter>
                      <Button
                        onClick={() => {
                          deleteTag(tag);
                        }}
                      >
                        Delete
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            ) : null}
          </span>
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
