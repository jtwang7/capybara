"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./ui/resizable";
import MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";
import MarkdownIt from "markdown-it";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ImperativePanelHandle } from "react-resizable-panels";
import Image from "next/image";
import { message } from "antd";
import { useBoolean, useControllableValue } from "ahooks";
import { transformImageUrl } from "@/actions/cloudinary";
import LottieIcon from "./lottie-icon";
import { updateNote } from "@/actions/cornell-action";
import { Note } from "@/types/cornell";
import { useEvent } from "@/hooks/use-event";

export enum Mode {
  Edit = "edit",
  Preview = "preview",
}

export default function CornellNote(props: {
  note: Note;
  mode?: Mode;
  /* note point controller */
  defaultPoint?: string;
  point?: string;
  onPointChange?: (point: string) => void;
  /* note summary controller */
  defaultSummary?: string;
  summary?: string;
  onSummaryChange?: (summary: string) => void;
}) {
  const { note, mode = Mode.Edit } = props;
  const screenshot = note?.screenshot;

  const mdParser = new MarkdownIt();
  const cornellPointRef = useRef<ImperativePanelHandle>(null!);
  const cornellSummaryRef = useRef<ImperativePanelHandle>(null!);
  const imageContainerRef = useRef<HTMLDivElement>(null!);
  const imageContainerSize = useRef({ width: 0, height: 0 });
  const resizeTimer = useRef<NodeJS.Timeout>();
  const [imageUrl, setImageUrl] = useState<string>();
  const [pointFocused, { setTrue: focusPoint, setFalse: blurPoint }] =
    useBoolean(false);
  // defaultValue 不生效，原因是当前场景 fetch data 时，首次 defaultValue 赋值始终为 undefined
  const [notePoint, setNotePoint] = useControllableValue(props, {
    defaultValuePropName: "defaultPoint",
    valuePropName: "point",
    trigger: "onPointChange",
  });
  const [noteSummary, setNoteSummary] = useControllableValue(props, {
    defaultValuePropName: "defaultSummary",
    valuePropName: "summary",
    trigger: "onSummaryChange",
  });
  const [
    imageLoading,
    { setTrue: startImageLoading, setFalse: stopImageLoading },
  ] = useBoolean(false);

  // 添加全局监听函数监听 command + s
  const handler = useEvent(async (event: unknown) => {
    const e = event as KeyboardEvent;
    if (e.metaKey && e.key === "s" && pointFocused && note) {
      e.preventDefault();
      const success = await updateNote({ ...note, point: notePoint });
      !success
        ? message.error("Save note points failed")
        : message.success("Save note points success");
    }
  });

  useEffect(() => {
    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("keydown", handler);
    };
  }, []);

  useLayoutEffect(() => {
    switch (mode) {
      case Mode.Edit:
        cornellPointRef.current.expand();
        cornellSummaryRef.current.expand();
        break;
      case Mode.Preview:
        cornellPointRef.current.collapse();
        cornellSummaryRef.current.collapse();
        break;
    }
  }, [mode]);

  useEffect(() => {
    startImageLoading();
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === imageContainerRef.current) {
          clearTimeout(resizeTimer.current);
          const { width, height } = entry.contentRect;
          imageContainerSize.current.width = width;
          imageContainerSize.current.height = height;
          resizeTimer.current = setTimeout(() => {
            // transform cloudinary image size
            if (screenshot) {
              transformImageUrl({ secureUrl: screenshot, width })
                .then((url) => {
                  setImageUrl(url);
                })
                .finally(() => {
                  stopImageLoading();
                });
            }
          }, 500);
        }
      }
    });
    if (imageContainerRef.current) {
      resizeObserver.observe(imageContainerRef.current);
    }

    return () => {
      if (imageContainerRef.current) {
        resizeObserver.unobserve(imageContainerRef.current);
      }
    };
  }, [screenshot]);

  return (
    <ResizablePanelGroup direction="vertical">
      <ResizablePanel defaultSize={75}>
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={70}>
            <div className="w-full h-full" ref={imageContainerRef}>
              <ImageContainer
                src={imageUrl}
                width={imageContainerSize.current.width}
                height={imageContainerSize.current.height}
                loading={imageLoading}
              />
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel
            ref={cornellPointRef}
            collapsible
            defaultSize={30}
            minSize={30}
          >
            <MdEditor
              value={notePoint}
              onFocus={focusPoint}
              onBlur={blurPoint}
              onChange={({ text }) => setNotePoint(text)}
              renderHTML={(text) => mdParser.render(text)}
              view={{ menu: true, md: true, html: false }}
              canView={{
                menu: true,
                md: true,
                html: true,
                fullScreen: false,
                hideMenu: false,
                both: false,
              }}
              className="h-full"
              placeholder={`Enter note point here, such as:\n1. Overview of this article\n2. Key points of this article\n3. Your personal opinion on this article\n4. Summary of this article\n5. more...`}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel ref={cornellSummaryRef} collapsible defaultSize={25}>
        {/* TODO: note summary here! may add AI */}
        <MdEditor
          readOnly
          value={noteSummary}
          onChange={({ text }) => setNoteSummary(text)}
          renderHTML={(text) => mdParser.render(text)}
          view={{ menu: false, md: false, html: true }}
          className="h-full"
          placeholder="Enter note summary here!"
        />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

function ImageContainer({
  width,
  height,
  src,
  loading = false,
}: {
  width: number;
  height: number;
  src?: string;
  loading?: boolean;
}) {
  if (!src) {
    return (
      <div className="w-full h-full flex flex-col justify-center items-center">
        <LottieIcon
          lottieJsonPath="/data-search.json"
          width={width / 4}
          height={height / 4}
        />
        <span>No Screenshot</span>
      </div>
    );
  }
  if (loading) {
    return (
      <div className="w-full h-full flex flex-col justify-center items-center">
        <LottieIcon
          lottieJsonPath="/data-search.json"
          width={width / 4}
          height={height / 4}
        />
        <span>Image Loading...</span>
      </div>
    );
  }
  return (
    <div className="w-full h-full relative overflow-auto">
      <Image src={src} alt="404 not found" width={width} height={9999999} />
    </div>
  );
}
