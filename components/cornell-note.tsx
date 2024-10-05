"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./ui/resizable";
import MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";
import MarkdownIt from "markdown-it";
import { useLayoutEffect, useRef } from "react";
import { ImperativePanelHandle } from "react-resizable-panels";
import Image from "next/image";
import { Empty } from "antd";
import { useControllableValue } from "ahooks";

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

  return (
    <ResizablePanelGroup direction="vertical">
      <ResizablePanel defaultSize={75}>
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={70}>
            {/* note screenshot here! */}
            {screenshot ? (
              <Image src={screenshot} alt="404 not found" />
            ) : (
              <Empty
                image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                imageStyle={{ height: 120 }}
                description="No screenshot"
                className="w-full h-full flex justify-center items-center flex-col"
              />
            )}
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
