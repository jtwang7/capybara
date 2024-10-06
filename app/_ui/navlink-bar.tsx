"use client";

import { LogOut } from "lucide-react";
import LottieIcon from "@/components/lottie-icon";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@auth0/nextjs-auth0/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const tabList: { label: string; value: string }[] = [
  { label: "Cornell", value: "cornell" },
  { label: "Task", value: "task" },
];

export default function NavlinkBar() {
  const pathname = usePathname();
  const router = useRouter();
  const currentTab = pathname.split("/")[1];

  const { user } = useUser();

  return (
    <div className="px-20 py-4 flex items-center space-x-4">
      <div className="space-x-1 flex items-center">
        <LottieIcon width={20} height={20} lottieJsonPath="/skull.json" />
        <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
          Capybara
        </h4>
      </div>
      <div className="space-x-1 flex-auto">
        {tabList.map(({ label, value }) => (
          <Button
            className="h-6"
            key={value}
            variant={currentTab === value ? "default" : "ghost"}
            onClick={() => {
              router.push(`/${value}`);
            }}
          >
            {label}
          </Button>
        ))}
      </div>
      <div className="space-x-1">
        {!user ? (
          <Button
            className="h-8"
            onClick={() => {
              router.push("/api/auth/login");
            }}
          >
            Login
          </Button>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="space-x-1 flex items-center cursor-pointer">
                <Avatar>
                  <AvatarImage
                    className="p-2"
                    src="/capybara-icon.png"
                    alt="avatar"
                  />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <span className="font-bold">{user.name}</span>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-30">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  router.push("/api/auth/logout");
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
