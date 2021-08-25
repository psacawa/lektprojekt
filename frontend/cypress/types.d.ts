export interface MailhogEmailUser {
  Relays: null;
  Mailbox: string;
  Domain: string;
  Params: string;
}

export interface MailhogMessage {
  ID: string;
  From: EmailUser;
  To: EmailUser[];
  Content: {
    Headers: Record<string, string[]>;
    Body: string;
    Size: number;
    MIME: null | string;
  };
  Created: string;
  MIME: null | string;
  // what interests us
  Raw: {
    From: string;
    To: [string];
    Data: string;
    Helo: string;
  };
}
