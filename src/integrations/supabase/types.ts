export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      anexos: {
        Row: {
          anotacao_id: string | null
          created_at: string
          id: string
          manutencao_id: string | null
          mime_type: string | null
          nome_arquivo: string
          storage_path: string
          tamanho: number | null
          user_id: string
        }
        Insert: {
          anotacao_id?: string | null
          created_at?: string
          id?: string
          manutencao_id?: string | null
          mime_type?: string | null
          nome_arquivo: string
          storage_path: string
          tamanho?: number | null
          user_id: string
        }
        Update: {
          anotacao_id?: string | null
          created_at?: string
          id?: string
          manutencao_id?: string | null
          mime_type?: string | null
          nome_arquivo?: string
          storage_path?: string
          tamanho?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "anexos_anotacao_id_fkey"
            columns: ["anotacao_id"]
            isOneToOne: false
            referencedRelation: "anotacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anexos_manutencao_id_fkey"
            columns: ["manutencao_id"]
            isOneToOne: false
            referencedRelation: "manutencoes"
            referencedColumns: ["id"]
          },
        ]
      }
      anotacoes: {
        Row: {
          condominio_id: string
          conteudo: string | null
          created_at: string
          id: string
          mes_referencia: string
          titulo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          condominio_id: string
          conteudo?: string | null
          created_at?: string
          id?: string
          mes_referencia: string
          titulo: string
          updated_at?: string
          user_id: string
        }
        Update: {
          condominio_id?: string
          conteudo?: string | null
          created_at?: string
          id?: string
          mes_referencia?: string
          titulo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      condominios: {
        Row: {
          bairro: string | null
          cep: string | null
          cidade: string | null
          cnpj: string | null
          complemento: string | null
          created_at: string
          email: string | null
          estado: string | null
          id: string
          logradouro: string | null
          nome: string
          numero: string | null
          observacoes: string | null
          pais: string | null
          sindico: string | null
          telefone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          complemento?: string | null
          created_at?: string
          email?: string | null
          estado?: string | null
          id?: string
          logradouro?: string | null
          nome: string
          numero?: string | null
          observacoes?: string | null
          pais?: string | null
          sindico?: string | null
          telefone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          complemento?: string | null
          created_at?: string
          email?: string | null
          estado?: string | null
          id?: string
          logradouro?: string | null
          nome?: string
          numero?: string | null
          observacoes?: string | null
          pais?: string | null
          sindico?: string | null
          telefone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      despesas: {
        Row: {
          condominio_id: string | null
          created_at: string
          data_compra: string | null
          data_pagamento: string | null
          descricao: string
          forma_pagamento: string
          fornecedor: string | null
          id: string
          num_parcelas: string | null
          observacoes: string | null
          pago: boolean
          parcela_atual: number
          updated_at: string
          user_id: string
          valor_parcela: number
          valor_total: number
          vencimento: string
        }
        Insert: {
          condominio_id?: string | null
          created_at?: string
          data_compra?: string | null
          data_pagamento?: string | null
          descricao: string
          forma_pagamento?: string
          fornecedor?: string | null
          id?: string
          num_parcelas?: string | null
          observacoes?: string | null
          pago?: boolean
          parcela_atual?: number
          updated_at?: string
          user_id: string
          valor_parcela?: number
          valor_total?: number
          vencimento: string
        }
        Update: {
          condominio_id?: string | null
          created_at?: string
          data_compra?: string | null
          data_pagamento?: string | null
          descricao?: string
          forma_pagamento?: string
          fornecedor?: string | null
          id?: string
          num_parcelas?: string | null
          observacoes?: string | null
          pago?: boolean
          parcela_atual?: number
          updated_at?: string
          user_id?: string
          valor_parcela?: number
          valor_total?: number
          vencimento?: string
        }
        Relationships: [
          {
            foreignKeyName: "despesas_condominio_id_fkey"
            columns: ["condominio_id"]
            isOneToOne: false
            referencedRelation: "condominios"
            referencedColumns: ["id"]
          },
        ]
      }
      manutencoes: {
        Row: {
          ativo: boolean
          condominio_id: string
          created_at: string
          descricao: string | null
          id: string
          periodicidade: Database["public"]["Enums"]["manutencao_periodicidade"]
          proxima_data: string
          responsavel: string | null
          titulo: string
          ultima_execucao: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ativo?: boolean
          condominio_id: string
          created_at?: string
          descricao?: string | null
          id?: string
          periodicidade?: Database["public"]["Enums"]["manutencao_periodicidade"]
          proxima_data: string
          responsavel?: string | null
          titulo: string
          ultima_execucao?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ativo?: boolean
          condominio_id?: string
          created_at?: string
          descricao?: string | null
          id?: string
          periodicidade?: Database["public"]["Enums"]["manutencao_periodicidade"]
          proxima_data?: string
          responsavel?: string | null
          titulo?: string
          ultima_execucao?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      receitas: {
        Row: {
          categoria: Database["public"]["Enums"]["receita_categoria"]
          condominio_id: string
          created_at: string
          data_recebido: string | null
          data_recebimento: string
          descricao: string
          id: string
          num_parcelas: number | null
          observacoes: string | null
          pagador: string | null
          parcela_atual: number | null
          recebido: boolean
          updated_at: string
          user_id: string
          valor: number
        }
        Insert: {
          categoria?: Database["public"]["Enums"]["receita_categoria"]
          condominio_id: string
          created_at?: string
          data_recebido?: string | null
          data_recebimento: string
          descricao: string
          id?: string
          num_parcelas?: number | null
          observacoes?: string | null
          pagador?: string | null
          parcela_atual?: number | null
          recebido?: boolean
          updated_at?: string
          user_id: string
          valor?: number
        }
        Update: {
          categoria?: Database["public"]["Enums"]["receita_categoria"]
          condominio_id?: string
          created_at?: string
          data_recebido?: string | null
          data_recebimento?: string
          descricao?: string
          id?: string
          num_parcelas?: number | null
          observacoes?: string | null
          pagador?: string | null
          parcela_atual?: number | null
          recebido?: boolean
          updated_at?: string
          user_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "receitas_condominio_id_fkey"
            columns: ["condominio_id"]
            isOneToOne: false
            referencedRelation: "condominios"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      manutencao_periodicidade:
        | "mensal"
        | "bimestral"
        | "trimestral"
        | "semestral"
        | "anual"
        | "unica"
      receita_categoria:
        | "taxa_condominial"
        | "multa"
        | "aluguel_area_comum"
        | "outros"
        | "taxa_extra"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      manutencao_periodicidade: [
        "mensal",
        "bimestral",
        "trimestral",
        "semestral",
        "anual",
        "unica",
      ],
      receita_categoria: [
        "taxa_condominial",
        "multa",
        "aluguel_area_comum",
        "outros",
        "taxa_extra",
      ],
    },
  },
} as const
