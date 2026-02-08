export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          rating: number;
          tier: "bronze" | "silver" | "gold" | "diamond";
          wins: number;
          losses: number;
          current_streak: number;
          best_streak: number;
          last_battle_date: string | null;
          streak_freezes: number;
          push_token: string | null;
          xp: number;
          level: number;
          display_name: string | null;
          country: string | null;
          preferred_language: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          rating?: number;
          tier?: "bronze" | "silver" | "gold" | "diamond";
          wins?: number;
          losses?: number;
          current_streak?: number;
          best_streak?: number;
          last_battle_date?: string | null;
          streak_freezes?: number;
          push_token?: string | null;
          xp?: number;
          level?: number;
          display_name?: string | null;
          country?: string | null;
          preferred_language?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          rating?: number;
          tier?: "bronze" | "silver" | "gold" | "diamond";
          wins?: number;
          losses?: number;
          current_streak?: number;
          best_streak?: number;
          last_battle_date?: string | null;
          streak_freezes?: number;
          push_token?: string | null;
          xp?: number;
          level?: number;
          display_name?: string | null;
          country?: string | null;
          preferred_language?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      questions: {
        Row: {
          id: string;
          language: string;
          difficulty: number;
          category: string | null;
          code_snippet: string;
          question_text: string;
          options: string[];
          correct_answer: number;
          explanation: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          language?: string;
          difficulty: number;
          category?: string | null;
          code_snippet: string;
          question_text?: string;
          options: string[];
          correct_answer: number;
          explanation: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          language?: string;
          difficulty?: number;
          category?: string | null;
          code_snippet?: string;
          question_text?: string;
          options?: string[];
          correct_answer?: number;
          explanation?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      matches: {
        Row: {
          id: string;
          player1_id: string;
          player2_id: string | null;
          is_bot_match: boolean;
          player1_score: number;
          player2_score: number;
          winner_id: string | null;
          player1_rating_change: number | null;
          player2_rating_change: number | null;
          is_ranked: boolean;
          started_at: string;
          ended_at: string;
        };
        Insert: {
          id?: string;
          player1_id: string;
          player2_id?: string | null;
          is_bot_match?: boolean;
          player1_score?: number;
          player2_score?: number;
          winner_id?: string | null;
          player1_rating_change?: number | null;
          player2_rating_change?: number | null;
          is_ranked?: boolean;
          started_at?: string;
          ended_at?: string;
        };
        Update: {
          id?: string;
          player1_id?: string;
          player2_id?: string | null;
          is_bot_match?: boolean;
          player1_score?: number;
          player2_score?: number;
          winner_id?: string | null;
          player1_rating_change?: number | null;
          player2_rating_change?: number | null;
          is_ranked?: boolean;
          started_at?: string;
          ended_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "matches_player1_id_fkey";
            columns: ["player1_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "matches_player2_id_fkey";
            columns: ["player2_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      match_rounds: {
        Row: {
          id: string;
          match_id: string;
          round_number: number;
          question_id: string;
          player1_answer: number | null;
          player1_time_ms: number | null;
          player2_answer: number | null;
          player2_time_ms: number | null;
          round_winner_id: string | null;
          round_started_at: string | null;
        };
        Insert: {
          id?: string;
          match_id: string;
          round_number: number;
          question_id: string;
          player1_answer?: number | null;
          player1_time_ms?: number | null;
          player2_answer?: number | null;
          player2_time_ms?: number | null;
          round_winner_id?: string | null;
          round_started_at?: string | null;
        };
        Update: {
          id?: string;
          match_id?: string;
          round_number?: number;
          question_id?: string;
          player1_answer?: number | null;
          player1_time_ms?: number | null;
          player2_answer?: number | null;
          player2_time_ms?: number | null;
          round_winner_id?: string | null;
          round_started_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "match_rounds_match_id_fkey";
            columns: ["match_id"];
            isOneToOne: false;
            referencedRelation: "matches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "match_rounds_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "questions";
            referencedColumns: ["id"];
          },
        ];
      };
      match_queue: {
        Row: {
          id: string;
          user_id: string;
          rating: number;
          is_ranked: boolean;
          joined_at: string;
          last_ping: string;
          expires_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          rating: number;
          is_ranked?: boolean;
          joined_at?: string;
          last_ping?: string;
          expires_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          rating?: number;
          is_ranked?: boolean;
          joined_at?: string;
          last_ping?: string;
          expires_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "match_queue_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      user_question_history: {
        Row: {
          id: string;
          user_id: string;
          question_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          question_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          question_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_question_history_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_question_history_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "questions";
            referencedColumns: ["id"];
          },
        ];
      };
      league_memberships: {
        Row: {
          id: string;
          user_id: string;
          league_tier: string;
          league_group: number;
          week_start: string;
          points: number;
          position: number | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          league_tier: string;
          league_group: number;
          week_start: string;
          points?: number;
          position?: number | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          league_tier?: string;
          league_group?: number;
          week_start?: string;
          points?: number;
          position?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "league_memberships_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}

// Convenience types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Question = Database["public"]["Tables"]["questions"]["Row"];
export type Match = Database["public"]["Tables"]["matches"]["Row"];
export type MatchRound = Database["public"]["Tables"]["match_rounds"]["Row"];
export type MatchQueue = Database["public"]["Tables"]["match_queue"]["Row"];
export type LeagueMembership =
  Database["public"]["Tables"]["league_memberships"]["Row"];

// Tier type
export type Tier = "bronze" | "silver" | "gold" | "diamond";

// Battle state types
export type BattleState = "waiting" | "ready" | "question" | "result" | "ended";

export interface BattleQuestion {
  id: string;
  code_snippet: string;
  question_text: string;
  options: string[];
  correct_answer: number;
  explanation: string;
  time_limit_ms: number;
}

export interface BattleResult {
  winner_id: string | null;
  player1_score: number;
  player2_score: number;
  rating_change: number;
  is_comeback: boolean;
}
