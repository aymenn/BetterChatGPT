export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      chatgpt_user_profiles: {
        Row: {
          id: string
          email: string | null
          api_key: string | null
          api_endpoint: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          api_key?: string | null
          api_endpoint?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          api_key?: string | null
          api_endpoint?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      chatgpt_folders: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string | null
          expanded: boolean
          folder_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color?: string | null
          expanded?: boolean
          folder_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string | null
          expanded?: boolean
          folder_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      chatgpt_chats: {
        Row: {
          id: string
          user_id: string
          folder_id: string | null
          title: string
          title_set: boolean
          config: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          folder_id?: string | null
          title: string
          title_set?: boolean
          config?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          folder_id?: string | null
          title?: string
          title_set?: boolean
          config?: Json
          created_at?: string
          updated_at?: string
        }
      }
      chatgpt_messages: {
        Row: {
          id: string
          chat_id: string
          role: string
          content: string
          message_order: number
          created_at: string
        }
        Insert: {
          id?: string
          chat_id: string
          role: string
          content: string
          message_order: number
          created_at?: string
        }
        Update: {
          id?: string
          chat_id?: string
          role?: string
          content?: string
          message_order?: number
          created_at?: string
        }
      }
      chatgpt_user_settings: {
        Row: {
          id: string
          theme: string
          auto_title: boolean
          advanced_mode: boolean
          hide_menu_options: boolean
          hide_side_menu: boolean
          enter_to_submit: boolean
          inline_latex: boolean
          markdown_mode: boolean
          count_total_tokens: boolean
          total_token_used: Json
          prompts: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          theme?: string
          auto_title?: boolean
          advanced_mode?: boolean
          hide_menu_options?: boolean
          hide_side_menu?: boolean
          enter_to_submit?: boolean
          inline_latex?: boolean
          markdown_mode?: boolean
          count_total_tokens?: boolean
          total_token_used?: Json
          prompts?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          theme?: string
          auto_title?: boolean
          advanced_mode?: boolean
          hide_menu_options?: boolean
          hide_side_menu?: boolean
          enter_to_submit?: boolean
          inline_latex?: boolean
          markdown_mode?: boolean
          count_total_tokens?: boolean
          total_token_used?: Json
          prompts?: Json
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}