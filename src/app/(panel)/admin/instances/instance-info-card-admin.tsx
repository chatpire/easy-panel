"use client";

import * as React from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import Link from "next/link";
import { FunctionButton } from "@/components/loading-button";
import { api } from "@/trpc/react";
import { InstanceInfoCard } from "../../_components/instance-info-card";
import { toast } from "sonner";
import { TRPCClientError } from "@trpc/client";
import { type ServiceInstance } from "@/schema/serviceInstance.schema";
import { popupChatGPTShareInstanceConfigDetails } from "../../_components/chatgpt-shared/chatgpt-share-config-popup";
import { useRouter } from "next/navigation";
import { popup } from "@/components/popup";
import { Checkbox } from "@/components/ui/checkbox";
import { popupPoekmonAPIConfigForm } from "../../_components/poekmon-api/poekmon-api-config-popup";
import { popupPoekmonSharedInstanceConfigDetails } from "../../_components/poekmon-shared/poekmon-shared-config-popup";

interface Props extends React.HTMLAttributes<HTMLFormElement> {
  instance: ServiceInstance;
  className?: string;
}

export function DeleteInstance({ instanceId, closePopup }: { instanceId: string; closePopup: () => void }) {
  const router = useRouter();
  const deleteMutation = api.serviceInstance.delete.useMutation();
  const [deleteLogs, setDeleteLogs] = React.useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox checked={deleteLogs} onCheckedChange={() => setDeleteLogs((current) => !current)} />
        <label
          htmlFor="terms"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Delete logs associated with this instance
        </label>
      </div>
      <FunctionButton
        variant={"destructive"}
        className="my-2 w-full"
        onClick={async () => {
          await deleteMutation.mutateAsync({ id: instanceId, deleteLogs });
          closePopup();
          toast.success("Instance has been deleted.");
          router.refresh();
        }}
      >
        Confirm
      </FunctionButton>
    </div>
  );
}

export function AdminInstanceInfoCard({ instance, className }: Props) {
  const router = useRouter();
  const grantMutation = api.userInstanceAbility.grantInstanceToAllActiveUsers.useMutation();

  const grantToAll = async (instanceId: string) => {
    try {
      await grantMutation.mutateAsync({ instanceId });
      toast.success("Published to all active users.");
    } catch (error) {
      console.error(error);
      if (error instanceof TRPCClientError) {
        toast.error(error.message);
      }
      toast.error("An error occured. Did you already grant to all active users?");
    }
  };

  return (
    <InstanceInfoCard instance={instance} className={className}>
      <div className="flex w-full flex-row items-center justify-between">
        <div className="-mx-4">
          {instance.url && (
            <Link className={buttonVariants({ variant: "link" })} href={instance.url ?? ""}>
              <Icons.externalLink className="mr-2 h-4 w-4" />
              {instance.url}
            </Link>
          )}
        </div>
        <div className="flex flex-row items-center space-x-4 max-md:hidden">
          <FunctionButton className="lt-md:w-full" variant={"outline"} onClick={() => grantToAll(instance.id)}>
            Publish To All Active Users
          </FunctionButton>
          {/* <FunctionButton variant={"outline"} onClick={() => unpublish(instance.id)}>
            Unpublish
          </FunctionButton> */}
          {instance.type === "CHATGPT_SHARED" && (
            <Button
              onClick={() => popupChatGPTShareInstanceConfigDetails({ url: instance.url ?? "", id: instance.id })}
            >
              <Icons.eye className="mr-2 h-4 w-4" />
              View Config
            </Button>
          )}
          {instance.type === "POEKMON_API" && (
            <Button onClick={() => popupPoekmonAPIConfigForm({ id: instance.id, data: instance.data })}>
              <Icons.pencil className="mr-2 h-4 w-4" />
              Edit Config
            </Button>
          )}
          {instance.type === "POEKMON_SHARED" && (
            <Button onClick={() => popupPoekmonSharedInstanceConfigDetails({ id: instance.id, data: instance.data })}>
              <Icons.pencil className="mr-2 h-4 w-4" />
              Edit Config
            </Button>
          )}
          <Button onClick={() => router.push(`/admin/instances/update/${instance.id}`)}>
            <Icons.pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <FunctionButton
            className="lt-md:w-full"
            variant={"destructive"}
            onClick={async () => {
              popup({
                title: `Delete Instance`,
                description: `Delete instance ${instance.name} from database. This will delete all associated user data.`,
                content: (closePopup) => <DeleteInstance instanceId={instance.id} closePopup={closePopup} />,
              });
            }}
          >
            Delete
          </FunctionButton>
        </div>
      </div>
    </InstanceInfoCard>
  );
}
