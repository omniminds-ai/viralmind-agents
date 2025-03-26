// Types based on Discord Webhook API
export interface WebhookPayload {
  url: string;
  content?: string;
  username?: string;
  avatar_url?: string;
  tts?: boolean;
  embeds?: Embed[];
  allowed_mentions?: AllowedMentions;
  components?: Component[];
  files?: File[];
  flags?: number;
  thread_name?: string;
  applied_tags?: string[];
}

export interface Embed {
  title?: string;
  description?: string;
  url?: string;
  timestamp?: string;
  color?: number;
  footer?: EmbedFooter;
  image?: EmbedImage;
  thumbnail?: EmbedThumbnail;
  author?: EmbedAuthor;
  fields?: EmbedField[];
}

export interface EmbedFooter {
  text: string;
  icon_url?: string;
  proxy_icon_url?: string;
}

export interface EmbedImage {
  url: string;
  proxy_url?: string;
  height?: number;
  width?: number;
}

export interface EmbedThumbnail {
  url: string;
  proxy_url?: string;
  height?: number;
  width?: number;
}

export interface EmbedAuthor {
  name: string;
  url?: string;
  icon_url?: string;
  proxy_icon_url?: string;
}

export interface EmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface AllowedMentions {
  parse?: ('roles' | 'users' | 'everyone')[];
  roles?: string[];
  users?: string[];
  replied_user?: boolean;
}

export interface Component {
  type: number;
  components?: Component[];
  style?: number;
  label?: string;
  emoji?: Emoji;
  custom_id?: string;
  url?: string;
  disabled?: boolean;
  placeholder?: string;
  min_values?: number;
  max_values?: number;
  options?: SelectOption[];
}

export interface Emoji {
  id?: string;
  name?: string;
  animated?: boolean;
}

export interface SelectOption {
  label: string;
  value: string;
  description?: string;
  emoji?: Emoji;
  default?: boolean;
}

export interface File {
  name: string;
  content: Buffer | string;
}

// Predefined colors
export enum WebhookColor {
  SUCCESS = 5793266, // Green
  ERROR = 15158332, // Red
  INFO = 3447003, // Blue
  WARNING = 16098851, // Yellow
  PURPLE = 0x9945ff // Purple
}

/**
 * Webhook class for sending Discord webhooks with various content types.
 */
export class Webhook {
  private url: string;

  /**
   * Create a new Webhook instance
   * @param url The webhook URL
   */
  constructor(url: string) {
    if (!url) {
      throw new Error('Webhook URL is required');
    }
    this.url = url;
  }

  /**
   * Send a webhook with the provided configuration
   * @param payload The webhook payload configuration (without url)
   */
  async send(payload: Omit<WebhookPayload, 'url'>): Promise<void> {
    try {
      const response = await fetch(this.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: payload.content,
          username: payload.username,
          avatar_url: payload.avatar_url,
          tts: payload.tts,
          embeds: payload.embeds,
          allowed_mentions: payload.allowed_mentions,
          components: payload.components,
          flags: payload.flags,
          thread_name: payload.thread_name,
          applied_tags: payload.applied_tags
        })
      });

      if (!response.ok) {
        throw new Error(`Webhook request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error sending webhook:', error);
    }
  }

  /**
   * Send a single embed to the webhook
   * @param embed The embed to send
   */
  async sendEmbed(embed: Embed): Promise<void> {
    return this.sendEmbeds([embed]);
  }

  /**
   * Send multiple embeds to the webhook
   * @param embeds The embeds to send
   */
  async sendEmbeds(embeds: Embed[]): Promise<void> {
    return this.send({
      embeds
    });
  }

  /**
   * Send a file with optional content to the webhook
   * @param file The file to send
   * @param content Optional text content
   */
  async sendFile(file: File, content?: string): Promise<void> {
    try {
      const formData = new FormData();
      
      if (content) {
        formData.append('content', content);
      }
      
      // Add file to form data
      const blob = new Blob([file.content], { type: 'application/octet-stream' });
      formData.append('file', blob, file.name);

      const response = await fetch(this.url, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`File webhook request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error sending file webhook:', error);
    }
  }

  /**
   * Send a simple text message to the webhook
   * @param content The text content
   */
  async sendText(content: string): Promise<void> {
    return this.send({
      content
    });
  }

  /**
   * Create a success embed with standardized formatting
   * @param title The embed title
   * @param fields The embed fields
   * @param description Optional description
   */
  static createSuccessEmbed(title: string, fields: EmbedField[], description?: string): Embed {
    return {
      title: `✅ ${title}`,
      description,
      color: WebhookColor.SUCCESS,
      fields
    };
  }

  /**
   * Create an error embed with standardized formatting
   * @param title The embed title
   * @param error The error message
   * @param fields Optional additional fields
   */
  static createErrorEmbed(title: string, error: string, fields?: EmbedField[]): Embed {
    return {
      title: `❌ ${title}`,
      description: error,
      color: WebhookColor.ERROR,
      fields: fields || []
    };
  }

  /**
   * Create an info embed with standardized formatting
   * @param title The embed title
   * @param fields The embed fields
   * @param description Optional description
   */
  static createInfoEmbed(title: string, fields: EmbedField[], description?: string): Embed {
    return {
      title: `ℹ️ ${title}`,
      description,
      color: WebhookColor.INFO,
      fields
    };
  }

  /**
   * Create a warning embed with standardized formatting
   * @param title The embed title
   * @param fields The embed fields
   * @param description Optional description
   */
  static createWarningEmbed(title: string, fields: EmbedField[], description?: string): Embed {
    return {
      title: `⚠️ ${title}`,
      description,
      color: WebhookColor.WARNING,
      fields
    };
  }
}
