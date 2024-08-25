export type DialogAction = {
  handleSetOpen: (value: boolean) => void;
  handleSetClose: (value: boolean) => void;
  open: boolean;
};

export type DialogActionOpen = Pick<DialogAction, "handleSetOpen">;

export type DialogActionClose = Pick<DialogAction, "handleSetClose">;

export type DialogActionIsOpen = Pick<DialogAction, "open">;
