"use client";

import * as React from "react";
import { useMediaQuery } from "usehooks-ts";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

type PopupClose = () => void;

interface PopupOptions {
  title: string;
  description: string;
  content: (clossFn: PopupClose) => React.ReactNode;
}

class PopupState {
  private observers: ((options: PopupOptions) => void)[] = [];
  private closeObservers: (() => void)[] = [];

  public open(options: PopupOptions) {
    this.observers.forEach((observer) => observer(options));
  }

  public close() {
    this.closeObservers.forEach((observer) => observer());
  }

  public subscribe(observer: (options: PopupOptions) => void, closeObserver: () => void) {
    this.observers.push(observer);
    this.closeObservers.push(closeObserver);
  }

  public unsubscribe(observer: (options: PopupOptions) => void, closeObserver: () => void) {
    this.observers = this.observers.filter((obs) => obs !== observer);
    this.closeObservers = this.closeObservers.filter((obs) => obs !== closeObserver);
  }
}

const popupState = new PopupState();

export function popup(options: PopupOptions) {
  popupState.open(options);
  return () => popupState.close();
}

export function Popup() {
  const [open, setOpen] = React.useState(false);
  const [options, setOptions] = React.useState<PopupOptions | null>(null);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const handleOpen = (options: PopupOptions) => {
    setOptions(options);
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setOptions(null);
  };

  React.useEffect(() => {
    popupState.subscribe(handleOpen, handleClose);

    return () => {
      popupState.unsubscribe(handleOpen, handleClose);
    };
  }, []);

  return (
    <>
      {isDesktop ? (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{options?.title}</DialogTitle>
              <DialogDescription>{options?.description}</DialogDescription>
            </DialogHeader>
            <div>{options?.content(handleClose)}</div>
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent>
            <DrawerHeader className="text-left">
              <DrawerTitle>{options?.title}</DrawerTitle>
              <DrawerDescription>{options?.description}</DrawerDescription>
            </DrawerHeader>
            <div className="px-4">{options?.content(handleClose)}</div>
            <DrawerFooter className="pt-2">
              <DrawerClose asChild>
                <Button variant="outline" onClick={() => popupState.close()}>
                  Cancel
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
}
