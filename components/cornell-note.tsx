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
import { Empty } from "antd";
import { useControllableValue } from "ahooks";
import { transformImageUrl } from "@/actions/cloudinary";

export enum Mode {
  Edit = "edit",
  Preview = "preview",
}

export default function CornellNote(props: {
  /* note point controller */
  defaultPoint?: string;
  point?: string;
  onPointChange?: (point: string) => void;
  /* note summary controller */
  defaultSummary?: string;
  summary?: string;
  onSummaryChange?: (summary: string) => void;
  /* other */
  screenshot?: string;
  mode?: Mode;
}) {
  const { screenshot, mode = Mode.Edit } = props;

  const mdParser = new MarkdownIt();
  const cornellPointRef = useRef<ImperativePanelHandle>(null!);
  const cornellSummaryRef = useRef<ImperativePanelHandle>(null!);
  const imageContainerRef = useRef<HTMLDivElement>(null!);
  const imageContainerSize = useRef({ width: 0, height: 0 });
  const resizeTimer = useRef<NodeJS.Timeout>();
  const [imageUrl, setImageUrl] = useState<string>();
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
              transformImageUrl({ secureUrl: screenshot, width }).then(
                (url) => {
                  setImageUrl(url);
                }
              );
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
              {imageUrl ? (
                <div className="w-full h-lvh relative overflow-auto">
                  <Image
                    src={imageUrl}
                    alt="404 not found"
                    width={imageContainerSize.current.width}
                    height={9999999}
                  />
                </div>
              ) : (
                <Empty
                  image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                  imageStyle={{ height: 120 }}
                  description="No screenshot"
                  className="w-full h-full flex justify-center items-center flex-col"
                />
              )}
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
