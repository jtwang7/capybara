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
import { useBoolean, useControllableValue } from "ahooks";
import { transformImageUrl } from "@/actions/cloudinary";
import LottieIcon from "./lottie-icon";

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
  const [
    imageLoading,
    { setTrue: startImageLoading, setFalse: stopImageLoading },
  ] = useBoolean(false);

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
  src,
  loading = false,
}: {
  width: number;
  src?: string;
  loading?: boolean;
}) {
  if (!src) {
    return (
      <Empty
        image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
        imageStyle={{ height: 120 }}
        description="No screenshot"
        className="w-full h-full flex justify-center items-center flex-col"
      />
    );
  }
  if (loading) {
    return (
      <div className="w-full h-full flex flex-col justify-center items-center">
        <LottieIcon
          lottieJsonPath="/data-search.json"
          width={width / 3}
          height={width / 3}
        />
        <span>Image Loading...</span>
      </div>
    );
  }
  return (
    <div className="w-full h-lvh relative overflow-auto">
      <Image src={src} alt="404 not found" width={width} height={9999999} />
    </div>
  );
}
