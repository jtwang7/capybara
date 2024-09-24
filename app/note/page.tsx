"use client";

import { GitHubLogoIcon } from "@radix-ui/react-icons";
import * as motion from "framer-motion/client";
import { AnimatePresence } from "framer-motion";
import Typewriter from "@/components/typewriter";
import DrumpIcon from "@/components/drump-icon";
import EnterButton from "@/components/enter-button";
import { useEffect, useRef, useState } from "react";
import { STAGE } from "./types";
import { Input } from "@/components/ui/input";
import Searcher from "./_components/searcher";

export default function NotePage() {
  const [stage, setStage] = useState(STAGE.init);
  const [autoFocus, setAutoFocus] = useState(false);

  useEffect(() => {
    if (stage === STAGE.init) {
      const keydownHandler = (e: KeyboardEvent) => {
        if (e.key === "k" && e.metaKey) {
          setStage(STAGE.search);
        }
      };
      document.addEventListener("keydown", keydownHandler);
      return () => {
        document.removeEventListener("keydown", keydownHandler);
      };
    }
  }, [stage]);

  return (
    <>
      <AnimatePresence>
        {stage === STAGE.init && (
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -300 }}
            transition={{ duration: 0.4 }}
          >
            <Typewriter
              text={["Hi Capybara!"]}
              className="text-7xl font-extrabold leading-normal block select-none"
              options={{ typeSpeed: 20 }}
            />
            <Typewriter
              text={["Welcome to Tian's Note"]}
              className="text-xl font-extrabold leading-normal block select-none"
              options={{ typeSpeed: 10, startDelay: 500 }}
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-4 pl-2 border-l-4 border-black"
            >
              <DrumpIcon
                icon={<GitHubLogoIcon />}
                className="w-6 h-6"
                onClick={() => {
                  window.open("https://github.com/jtwang7", "_blank");
                }}
              />
            </motion.div>
            <motion.div
              className="w-full mt-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <EnterButton
                text="Press [ ⌘ + K ] to search"
                onClick={() => {
                  setStage(STAGE.search);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {stage === STAGE.search && (
          <motion.div
            initial={{ opacity: 0, y: "100vh", position: "absolute" }}
            animate={{ opacity: 1, y: 0, position: "relative" }}
            transition={{ duration: 1, delay: 0.4 }}
            className="w-9/12 h-5/6 flex flex-col items-center space-y-10"
            onAnimationComplete={() => {
              setAutoFocus(true);
            }}
          >
            <Searcher autoFocus={autoFocus} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
