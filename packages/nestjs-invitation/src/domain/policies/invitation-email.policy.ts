export interface InvitationEmailTemplateSettings {
  logo: string;
  fileName: string;
  subject: string;
}

export interface InvitationEmailSettings {
  from: string;
  baseUrl: string;
  templates: {
    invitation: InvitationEmailTemplateSettings;
    invitationAccepted: InvitationEmailTemplateSettings;
  };
}

export class InvitationEmailPolicy {
  readonly from: string;
  readonly baseUrl: string;
  readonly invitationTemplate: InvitationEmailTemplateSettings;
  readonly acceptedTemplate: InvitationEmailTemplateSettings;

  constructor(settings: InvitationEmailSettings) {
    const { from, baseUrl, templates } = settings;

    this.from = from;
    this.baseUrl = baseUrl;
    this.invitationTemplate = templates.invitation;
    this.acceptedTemplate = templates.invitationAccepted;
  }
}
