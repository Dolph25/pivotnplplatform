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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      deals: {
        Row: {
          acquisition_price: number | null
          acquisition_strategy: string | null
          actual_acquisition_price: number | null
          actual_exit_price: number | null
          actual_hold_months: number | null
          actual_profit: number | null
          actual_rehab_cost: number | null
          actual_roi_pct: number | null
          closing_date: string | null
          contract_date: string | null
          created_at: string | null
          created_by: string | null
          deal_id: string
          deal_name: string
          deal_notes: string | null
          deal_type: string
          debt_amount: number | null
          deleted_at: string | null
          equity_required: number | null
          estimated_rehab: number | null
          exit_date: string | null
          exit_strategy: string | null
          funded_by_lps: boolean | null
          id: string
          identified_date: string | null
          is_active: boolean | null
          lp_approval_date: string | null
          pipeline_stage: string | null
          presented_to_lps: boolean | null
          projected_hold_months: number | null
          projected_irr_pct: number | null
          projected_profit: number | null
          projected_roi_pct: number | null
          property_id: string | null
          status: string
          target_sale_price: number | null
          total_capital: number | null
          total_investment: number | null
          underwriting_notes: string | null
          updated_at: string | null
        }
        Insert: {
          acquisition_price?: number | null
          acquisition_strategy?: string | null
          actual_acquisition_price?: number | null
          actual_exit_price?: number | null
          actual_hold_months?: number | null
          actual_profit?: number | null
          actual_rehab_cost?: number | null
          actual_roi_pct?: number | null
          closing_date?: string | null
          contract_date?: string | null
          created_at?: string | null
          created_by?: string | null
          deal_id: string
          deal_name: string
          deal_notes?: string | null
          deal_type: string
          debt_amount?: number | null
          deleted_at?: string | null
          equity_required?: number | null
          estimated_rehab?: number | null
          exit_date?: string | null
          exit_strategy?: string | null
          funded_by_lps?: boolean | null
          id?: string
          identified_date?: string | null
          is_active?: boolean | null
          lp_approval_date?: string | null
          pipeline_stage?: string | null
          presented_to_lps?: boolean | null
          projected_hold_months?: number | null
          projected_irr_pct?: number | null
          projected_profit?: number | null
          projected_roi_pct?: number | null
          property_id?: string | null
          status?: string
          target_sale_price?: number | null
          total_capital?: number | null
          total_investment?: number | null
          underwriting_notes?: string | null
          updated_at?: string | null
        }
        Update: {
          acquisition_price?: number | null
          acquisition_strategy?: string | null
          actual_acquisition_price?: number | null
          actual_exit_price?: number | null
          actual_hold_months?: number | null
          actual_profit?: number | null
          actual_rehab_cost?: number | null
          actual_roi_pct?: number | null
          closing_date?: string | null
          contract_date?: string | null
          created_at?: string | null
          created_by?: string | null
          deal_id?: string
          deal_name?: string
          deal_notes?: string | null
          deal_type?: string
          debt_amount?: number | null
          deleted_at?: string | null
          equity_required?: number | null
          estimated_rehab?: number | null
          exit_date?: string | null
          exit_strategy?: string | null
          funded_by_lps?: boolean | null
          id?: string
          identified_date?: string | null
          is_active?: boolean | null
          lp_approval_date?: string | null
          pipeline_stage?: string | null
          presented_to_lps?: boolean | null
          projected_hold_months?: number | null
          projected_irr_pct?: number | null
          projected_profit?: number | null
          projected_roi_pct?: number | null
          property_id?: string | null
          status?: string
          target_sale_price?: number | null
          total_capital?: number | null
          total_investment?: number | null
          underwriting_notes?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deals_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          deal_id: string | null
          deleted_at: string | null
          document_name: string
          document_type: string
          file_path: string
          file_size: number | null
          id: string
          investor_id: string | null
          is_active: boolean | null
          mime_type: string | null
          property_id: string | null
          uploaded_at: string | null
          uploaded_by: string | null
          visibility: string | null
        }
        Insert: {
          deal_id?: string | null
          deleted_at?: string | null
          document_name: string
          document_type: string
          file_path: string
          file_size?: number | null
          id?: string
          investor_id?: string | null
          is_active?: boolean | null
          mime_type?: string | null
          property_id?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
          visibility?: string | null
        }
        Update: {
          deal_id?: string | null
          deleted_at?: string | null
          document_name?: string
          document_type?: string
          file_path?: string
          file_size?: number | null
          id?: string
          investor_id?: string | null
          is_active?: boolean | null
          mime_type?: string | null
          property_id?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      investor_leads: {
        Row: {
          accredited_status: string | null
          converted_to_lp: boolean | null
          created_at: string | null
          deposit_amount: number | null
          deposit_date: string | null
          deposit_submitted: boolean | null
          email: string
          experience: string | null
          id: string
          investment_amount: number | null
          investment_tier: string | null
          last_contact_date: string | null
          name: string
          notes: string | null
          phone: string | null
          qualified: boolean | null
          source: string | null
          status: string | null
          timeline: string | null
        }
        Insert: {
          accredited_status?: string | null
          converted_to_lp?: boolean | null
          created_at?: string | null
          deposit_amount?: number | null
          deposit_date?: string | null
          deposit_submitted?: boolean | null
          email: string
          experience?: string | null
          id?: string
          investment_amount?: number | null
          investment_tier?: string | null
          last_contact_date?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          qualified?: boolean | null
          source?: string | null
          status?: string | null
          timeline?: string | null
        }
        Update: {
          accredited_status?: string | null
          converted_to_lp?: boolean | null
          created_at?: string | null
          deposit_amount?: number | null
          deposit_date?: string | null
          deposit_submitted?: boolean | null
          email?: string
          experience?: string | null
          id?: string
          investment_amount?: number | null
          investment_tier?: string | null
          last_contact_date?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          qualified?: boolean | null
          source?: string | null
          status?: string | null
          timeline?: string | null
        }
        Relationships: []
      }
      investors: {
        Row: {
          accreditation_type: string | null
          accreditation_verified_by: string | null
          accreditation_verified_date: string | null
          accredited_investor: boolean | null
          address: string | null
          city: string | null
          commitment_amount: number | null
          company_name: string | null
          created_at: string | null
          current_nav: number | null
          deleted_at: string | null
          distributions_received: number | null
          documents_completed: boolean | null
          email: string
          first_name: string
          id: string
          invested_amount: number | null
          investor_id: string
          investor_tier: string | null
          is_active: boolean | null
          last_login: string | null
          last_name: string
          phone: string | null
          ppm_accepted: boolean | null
          ppm_accepted_date: string | null
          state: string | null
          status: string | null
          subscription_agreement_date: string | null
          subscription_agreement_signed: boolean | null
          updated_at: string | null
          user_id: string | null
          zip_code: string | null
        }
        Insert: {
          accreditation_type?: string | null
          accreditation_verified_by?: string | null
          accreditation_verified_date?: string | null
          accredited_investor?: boolean | null
          address?: string | null
          city?: string | null
          commitment_amount?: number | null
          company_name?: string | null
          created_at?: string | null
          current_nav?: number | null
          deleted_at?: string | null
          distributions_received?: number | null
          documents_completed?: boolean | null
          email: string
          first_name: string
          id?: string
          invested_amount?: number | null
          investor_id: string
          investor_tier?: string | null
          is_active?: boolean | null
          last_login?: string | null
          last_name: string
          phone?: string | null
          ppm_accepted?: boolean | null
          ppm_accepted_date?: string | null
          state?: string | null
          status?: string | null
          subscription_agreement_date?: string | null
          subscription_agreement_signed?: boolean | null
          updated_at?: string | null
          user_id?: string | null
          zip_code?: string | null
        }
        Update: {
          accreditation_type?: string | null
          accreditation_verified_by?: string | null
          accreditation_verified_date?: string | null
          accredited_investor?: boolean | null
          address?: string | null
          city?: string | null
          commitment_amount?: number | null
          company_name?: string | null
          created_at?: string | null
          current_nav?: number | null
          deleted_at?: string | null
          distributions_received?: number | null
          documents_completed?: boolean | null
          email?: string
          first_name?: string
          id?: string
          invested_amount?: number | null
          investor_id?: string
          investor_tier?: string | null
          is_active?: boolean | null
          last_login?: string | null
          last_name?: string
          phone?: string | null
          ppm_accepted?: boolean | null
          ppm_accepted_date?: string | null
          state?: string | null
          status?: string | null
          subscription_agreement_date?: string | null
          subscription_agreement_signed?: boolean | null
          updated_at?: string | null
          user_id?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          accrued_interest: number | null
          address: string
          ai_analysis: string | null
          arv: number | null
          bankruptcy_case_number: string | null
          bankruptcy_filing_date: string | null
          bankruptcy_filing_type: string | null
          bankruptcy_flag: boolean | null
          bankruptcy_status: string | null
          bathrooms: number | null
          bedrooms: number | null
          bpo: number | null
          city: string
          corporate_advances: number | null
          county: string | null
          created_at: string | null
          created_by: string | null
          current_interest_rate: number | null
          current_servicer: string | null
          days_since_last_payment: number | null
          deal_stage: string
          deferred_balance: number | null
          deleted_at: string | null
          delinquent_status: string | null
          discount_to_bpo: number | null
          discount_to_upb: number | null
          escrow_balance: number | null
          estimated_full_payoff: number | null
          estimated_irr: number | null
          estimated_legal_balance: number | null
          estimated_roi: number | null
          foreclosure_flag: boolean | null
          foreclosure_start_date: string | null
          foreclosure_status: string | null
          id: string
          internal_notes: string | null
          is_active: boolean | null
          last_modified_by: string | null
          last_payment_date: string | null
          latest_property_value: number | null
          latest_value_date: string | null
          latitude: number | null
          lien_position: number | null
          loan_origination_date: string | null
          longitude: number | null
          lot_size: number | null
          ltv_ratio: number | null
          maturity_date: string | null
          notes: string | null
          num_units: number | null
          occupancy_status: string | null
          original_interest_rate: number | null
          original_lender: string | null
          original_loan_amount: number | null
          original_term_months: number | null
          owner_first_name: string | null
          owner_last_name: string | null
          owner_occupied: boolean | null
          projected_hold_period_months: number | null
          property_id: string
          property_type: string | null
          remaining_term_months: number | null
          reo_flag: boolean | null
          risk_score: number | null
          source: string
          source_loan_number: string | null
          square_feet: number | null
          state: string
          strike_price: number | null
          total_balance: number | null
          upb: number | null
          updated_at: string | null
          year_built: number | null
          zillow_value: number | null
          zip_code: string
          zoning: string | null
        }
        Insert: {
          accrued_interest?: number | null
          address: string
          ai_analysis?: string | null
          arv?: number | null
          bankruptcy_case_number?: string | null
          bankruptcy_filing_date?: string | null
          bankruptcy_filing_type?: string | null
          bankruptcy_flag?: boolean | null
          bankruptcy_status?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          bpo?: number | null
          city: string
          corporate_advances?: number | null
          county?: string | null
          created_at?: string | null
          created_by?: string | null
          current_interest_rate?: number | null
          current_servicer?: string | null
          days_since_last_payment?: number | null
          deal_stage?: string
          deferred_balance?: number | null
          deleted_at?: string | null
          delinquent_status?: string | null
          discount_to_bpo?: number | null
          discount_to_upb?: number | null
          escrow_balance?: number | null
          estimated_full_payoff?: number | null
          estimated_irr?: number | null
          estimated_legal_balance?: number | null
          estimated_roi?: number | null
          foreclosure_flag?: boolean | null
          foreclosure_start_date?: string | null
          foreclosure_status?: string | null
          id?: string
          internal_notes?: string | null
          is_active?: boolean | null
          last_modified_by?: string | null
          last_payment_date?: string | null
          latest_property_value?: number | null
          latest_value_date?: string | null
          latitude?: number | null
          lien_position?: number | null
          loan_origination_date?: string | null
          longitude?: number | null
          lot_size?: number | null
          ltv_ratio?: number | null
          maturity_date?: string | null
          notes?: string | null
          num_units?: number | null
          occupancy_status?: string | null
          original_interest_rate?: number | null
          original_lender?: string | null
          original_loan_amount?: number | null
          original_term_months?: number | null
          owner_first_name?: string | null
          owner_last_name?: string | null
          owner_occupied?: boolean | null
          projected_hold_period_months?: number | null
          property_id: string
          property_type?: string | null
          remaining_term_months?: number | null
          reo_flag?: boolean | null
          risk_score?: number | null
          source: string
          source_loan_number?: string | null
          square_feet?: number | null
          state?: string
          strike_price?: number | null
          total_balance?: number | null
          upb?: number | null
          updated_at?: string | null
          year_built?: number | null
          zillow_value?: number | null
          zip_code: string
          zoning?: string | null
        }
        Update: {
          accrued_interest?: number | null
          address?: string
          ai_analysis?: string | null
          arv?: number | null
          bankruptcy_case_number?: string | null
          bankruptcy_filing_date?: string | null
          bankruptcy_filing_type?: string | null
          bankruptcy_flag?: boolean | null
          bankruptcy_status?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          bpo?: number | null
          city?: string
          corporate_advances?: number | null
          county?: string | null
          created_at?: string | null
          created_by?: string | null
          current_interest_rate?: number | null
          current_servicer?: string | null
          days_since_last_payment?: number | null
          deal_stage?: string
          deferred_balance?: number | null
          deleted_at?: string | null
          delinquent_status?: string | null
          discount_to_bpo?: number | null
          discount_to_upb?: number | null
          escrow_balance?: number | null
          estimated_full_payoff?: number | null
          estimated_irr?: number | null
          estimated_legal_balance?: number | null
          estimated_roi?: number | null
          foreclosure_flag?: boolean | null
          foreclosure_start_date?: string | null
          foreclosure_status?: string | null
          id?: string
          internal_notes?: string | null
          is_active?: boolean | null
          last_modified_by?: string | null
          last_payment_date?: string | null
          latest_property_value?: number | null
          latest_value_date?: string | null
          latitude?: number | null
          lien_position?: number | null
          loan_origination_date?: string | null
          longitude?: number | null
          lot_size?: number | null
          ltv_ratio?: number | null
          maturity_date?: string | null
          notes?: string | null
          num_units?: number | null
          occupancy_status?: string | null
          original_interest_rate?: number | null
          original_lender?: string | null
          original_loan_amount?: number | null
          original_term_months?: number | null
          owner_first_name?: string | null
          owner_last_name?: string | null
          owner_occupied?: boolean | null
          projected_hold_period_months?: number | null
          property_id?: string
          property_type?: string | null
          remaining_term_months?: number | null
          reo_flag?: boolean | null
          risk_score?: number | null
          source?: string
          source_loan_number?: string | null
          square_feet?: number | null
          state?: string
          strike_price?: number | null
          total_balance?: number | null
          upb?: number | null
          updated_at?: string | null
          year_built?: number | null
          zillow_value?: number | null
          zip_code?: string
          zoning?: string | null
        }
        Relationships: []
      }
      saved_deals: {
        Row: {
          address: string
          ai_insights: string | null
          bpo_value: number
          created_at: string
          exit_strategy: string
          hold_period: number
          id: string
          irr: number | null
          latitude: number | null
          longitude: number | null
          profit: number | null
          property_type: string
          rehab_costs: number
          roi: number | null
          sale_price: number
          strike_price: number
          units: number
          updated_at: string
          user_id: string
          verdict: string | null
        }
        Insert: {
          address: string
          ai_insights?: string | null
          bpo_value: number
          created_at?: string
          exit_strategy: string
          hold_period: number
          id?: string
          irr?: number | null
          latitude?: number | null
          longitude?: number | null
          profit?: number | null
          property_type: string
          rehab_costs: number
          roi?: number | null
          sale_price: number
          strike_price: number
          units?: number
          updated_at?: string
          user_id: string
          verdict?: string | null
        }
        Update: {
          address?: string
          ai_insights?: string | null
          bpo_value?: number
          created_at?: string
          exit_strategy?: string
          hold_period?: number
          id?: string
          irr?: number | null
          latitude?: number | null
          longitude?: number | null
          profit?: number | null
          property_type?: string
          rehab_costs?: number
          roi?: number | null
          sale_price?: number
          strike_price?: number
          units?: number
          updated_at?: string
          user_id?: string
          verdict?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      deposited_vip_leads: {
        Row: {
          accredited_status: string | null
          converted_to_lp: boolean | null
          created_at: string | null
          deposit_amount: number | null
          deposit_date: string | null
          deposit_submitted: boolean | null
          email: string | null
          experience: string | null
          id: string | null
          investment_amount: number | null
          investment_tier: string | null
          last_contact_date: string | null
          name: string | null
          notes: string | null
          phone: string | null
          qualified: boolean | null
          source: string | null
          status: string | null
          timeline: string | null
        }
        Insert: {
          accredited_status?: string | null
          converted_to_lp?: boolean | null
          created_at?: string | null
          deposit_amount?: number | null
          deposit_date?: string | null
          deposit_submitted?: boolean | null
          email?: string | null
          experience?: string | null
          id?: string | null
          investment_amount?: number | null
          investment_tier?: string | null
          last_contact_date?: string | null
          name?: string | null
          notes?: string | null
          phone?: string | null
          qualified?: boolean | null
          source?: string | null
          status?: string | null
          timeline?: string | null
        }
        Update: {
          accredited_status?: string | null
          converted_to_lp?: boolean | null
          created_at?: string | null
          deposit_amount?: number | null
          deposit_date?: string | null
          deposit_submitted?: boolean | null
          email?: string | null
          experience?: string | null
          id?: string | null
          investment_amount?: number | null
          investment_tier?: string | null
          last_contact_date?: string | null
          name?: string | null
          notes?: string | null
          phone?: string | null
          qualified?: boolean | null
          source?: string | null
          status?: string | null
          timeline?: string | null
        }
        Relationships: []
      }
      investor_metrics: {
        Row: {
          converted_count: number | null
          qualified_count: number | null
          total_committed: number | null
          total_leads: number | null
          vip_count: number | null
        }
        Relationships: []
      }
      v_deal_pipeline: {
        Row: {
          avg_irr: number | null
          avg_roi: number | null
          deal_count: number | null
          status: string | null
          total_capital: number | null
          total_projected_profit: number | null
        }
        Relationships: []
      }
      v_portfolio_summary: {
        Row: {
          active_properties: number | null
          avg_interest_rate: number | null
          bankruptcies: number | null
          foreclosures: number | null
          total_balance: number | null
          total_bpo: number | null
          total_properties: number | null
          total_strike_price: number | null
          total_upb: number | null
        }
        Relationships: []
      }
      vip_qualified_leads: {
        Row: {
          accredited_status: string | null
          converted_to_lp: boolean | null
          created_at: string | null
          email: string | null
          experience: string | null
          id: string | null
          investment_amount: number | null
          investment_tier: string | null
          last_contact_date: string | null
          name: string | null
          notes: string | null
          phone: string | null
          qualified: boolean | null
          source: string | null
          status: string | null
          timeline: string | null
        }
        Insert: {
          accredited_status?: string | null
          converted_to_lp?: boolean | null
          created_at?: string | null
          email?: string | null
          experience?: string | null
          id?: string | null
          investment_amount?: number | null
          investment_tier?: string | null
          last_contact_date?: string | null
          name?: string | null
          notes?: string | null
          phone?: string | null
          qualified?: boolean | null
          source?: string | null
          status?: string | null
          timeline?: string | null
        }
        Update: {
          accredited_status?: string | null
          converted_to_lp?: boolean | null
          created_at?: string | null
          email?: string | null
          experience?: string | null
          id?: string | null
          investment_amount?: number | null
          investment_tier?: string | null
          last_contact_date?: string | null
          name?: string | null
          notes?: string | null
          phone?: string | null
          qualified?: boolean | null
          source?: string | null
          status?: string | null
          timeline?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "investor" | "analyst"
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
      app_role: ["admin", "investor", "analyst"],
    },
  },
} as const
