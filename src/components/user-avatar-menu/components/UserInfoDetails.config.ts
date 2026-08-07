export interface DisplayOptions {
  hideFullName?: boolean;
  hideUserName?: boolean;
  hideEmail?: boolean;
  hideBlockStatus?: boolean;
  hideStatus?: boolean;
  hideTime?: boolean;
}

export const DEFAULT_OPTIONS: DisplayOptions = {
  hideFullName: false,
  hideUserName: false,
  hideEmail: false,
  hideBlockStatus: false,
  hideStatus: false,
  hideTime: false,
};
