"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/user-avatar";
import { type SessionUser } from "@/server/lucia";
import { Badge } from "@/components/ui/badge";
import { useLogout } from "@/hooks/logout";
import { popupEditPasswordForm } from "@/app/(panel)/_components/edit-password-popup";

interface UserAccountNavProps extends React.HTMLAttributes<HTMLDivElement> {
  user: Pick<SessionUser, "id" | "name" | "image" | "username" | "role">;
}

export function UserAccountNav({ user }: UserAccountNavProps) {
  const logout = useLogout();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger tabIndex={-1} className="outline-none">
        <UserAvatar user={user} className="h-8 w-8" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            {user.name && (
              <div className="font-medium">
                {user.name}{" "}
                <Badge className="mx-1" variant="secondary">
                  {user.role.toLowerCase()}
                </Badge>
              </div>
            )}
            {user.username && <p className="w-[200px] truncate text-sm text-muted-foreground">{user.username}</p>}
          </div>
        </div>
        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => popupEditPasswordForm(user.id, user.username)}>Edit Password</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onSelect={async (event) => {
            event.preventDefault();
            await logout();
          }}
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
