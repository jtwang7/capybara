"use client";

import { Input } from "@/components/ui/input";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useRef } from "react";

export default function Searcher({
  autoFocus = false,
}: {
  autoFocus?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null!);

  useEffect(() => {
    autoFocus && inputRef.current.focus();
  }, [autoFocus]);

  // 指令
  const commands = [
    {
      label: "search",
      value: "search",
    },
    {
      label: "create",
      value: "create",
    },
  ];

  return (
    <div className="w-full h-full bg-white flex flex-col rounded-lg overflow-hidden">
      <div className="flex">
        <Select defaultValue={commands[0].value}>
          <SelectTrigger className="w-[150px] rounded-none">
            <SelectValue placeholder="Command" />
          </SelectTrigger>
          <SelectContent
            onCloseAutoFocus={(e) => {
              e.preventDefault();
              inputRef.current.focus();
            }}
          >
            {commands.map((command) => (
              <SelectItem key={command.value} value={command.value}>
                {command.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          ref={inputRef}
          className="rounded-none focus-visible:ring-0 "
          placeholder="Press [ $ ] to focus command"
        />
      </div>
      <div className="flex-auto">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={25} minSize={20} maxSize={30}>
            <div className="flex h-full items-center justify-center p-6">
              <span className="font-semibold">Two</span>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={75}>
            <div className="flex h-full items-center justify-center p-6">
              <span className="font-semibold">Three</span>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
