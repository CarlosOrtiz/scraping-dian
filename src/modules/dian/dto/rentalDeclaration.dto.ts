import { IsString, IsOptional, IsNotEmpty, IsBoolean, IsNumber } from 'class-validator';

export class RentalDeclaration {

  /* Datos Iniciar sesión */
  @IsString()
  document: string;

  @IsString()
  password: string;

  /* Pregunta Inicar Modal */
  @IsBoolean()
  tax_resident: boolean;

  /* Datos Declarante */
  @IsNumber()
  @IsOptional()
  DV: number;

  @IsString()
  @IsOptional()
  NIT: number;

  @IsString()
  @IsOptional()
  first_lastname: string;

  @IsString()
  @IsOptional()
  second_lastname: string;

  @IsString()
  @IsOptional()
  first_name: string;

  @IsString()
  @IsOptional()
  other_name: string;

  @IsString()
  @IsOptional()
  sectional_address_code: string;

  @IsString()
  @IsOptional()
  economic_activity: string;

  @IsString()
  @IsOptional()
  correction_code: string;

  @IsNumber()
  @IsOptional()
  previous_from_number: number;

  /* Preguntas Si o No */
  @IsBoolean()
  @IsOptional()
  income_country: boolean;

  @IsBoolean()
  @IsOptional()
  retirement_unemployment: boolean;

  @IsBoolean()
  @IsOptional()
  millitary_forces_police: boolean;

  @IsBoolean()
  @IsOptional()
  compensation_insurance: boolean;

  @IsBoolean()
  @IsOptional()
  income_public_university: boolean;

  @IsBoolean()
  @IsOptional()
  public_servant: boolean;

  @IsBoolean()
  @IsOptional()
  hotel_rental_income: boolean;

  @IsBoolean()
  @IsOptional()
  work_rental_income: boolean;

  @IsBoolean()
  @IsOptional()
  can_capital_income: boolean;

  @IsBoolean()
  @IsOptional()
  not_work_rental_income: boolean;


  /* Patrimonio */
  @IsNumber()
  @IsOptional()
  patrimony_total: number;

  @IsNumber()
  @IsOptional()
  debt: number;

  @IsNumber()
  @IsOptional()
  total_liquid_patrimonio: number;


  /* Rentas de trabajo */
  @IsNumber()
  @IsOptional()
  total_income_rental_work: number;

  @IsNumber()
  @IsOptional()
  not_constitutive_income: number;

  @IsNumber()
  @IsOptional()
  cost_deduction_rt: number;

  @IsNumber()
  @IsOptional()
  liquid_rental_rt: number;

  @IsNumber()
  @IsOptional()
  exempt_rental_rt: number;

  @IsNumber()
  @IsOptional()
  limit_rental_exempt_rt: number;

  @IsNumber()
  @IsOptional()
  liquid_rental_work_rt: number;


  /* Rentas de capital */
  @IsNumber()
  @IsOptional()
  total_capital_income: number;

  @IsNumber()
  @IsOptional()
  income_not_constitutive_rental: number;

  @IsNumber()
  @IsOptional()
  cost_deduction_coming: number;

  @IsNumber()
  @IsOptional()
  liquid_rental_rc: number;
  //43 El valor de la casilla 43 no puede superar 0. (CASILLA 38 + CASILLA 42 - CASILLA 39 - CASILLA 40)
  //39 El valor de la casilla 64 más la casilla 65 no puede superar el valor de la casilla 63.
  @IsNumber()
  @IsOptional()
  liquid_rental_passive_rc: number;

  @IsNumber()
  @IsOptional()
  exempt_rental_rc: number;

  @IsNumber()
  @IsOptional()
  limit_exempt_rental_rc: number;

  @IsNumber()
  @IsOptional()
  ordinary_liquid_exercise: number;
  //47 = El valor de la casilla 64 más la casilla 65 no puede superar el valor de la casilla 63.
  @IsNumber()
  @IsOptional()
  loss_liquid_exercise_rc: number;

  @IsNumber()
  @IsOptional()
  compasion_loss_capital_rental: number;

  @IsNumber()
  @IsOptional()
  liquid_capital_rc: number;


  /* Rentas no laborales */
  @IsNumber()
  @IsOptional()
  total_income_rnl: number;

  @IsNumber()
  @IsOptional()
  discount_refund: number;

  @IsNumber()
  @IsOptional()
  income_not_constitutive_rental_rnl: number;

  @IsNumber()
  @IsOptional()
  cost_expense_rnl: number;

  @IsNumber()
  @IsOptional()
  liquid_rental_rnl: number; //Renta líquida:

  @IsNumber()
  @IsOptional()
  not_labor_passive_liquid_rental: number;

  @IsNumber()
  @IsOptional()
  rental_exempt_deduction_rnl: number;

  @IsNumber()
  @IsOptional()
  limited_exempt_rental_rnl: number;

  @IsNumber()
  @IsOptional()
  ordinary_liquid_rental_rnl: number;

  @IsNumber()
  @IsOptional()
  loss_liquid_exercise_rnl: number;

  @IsNumber()
  @IsOptional()
  compensation_loss_rental_rnl: number;

  @IsNumber()
  @IsOptional()
  not_work_liquid_rental: number;


  /*Cédula general:  */
  @IsNumber()
  @IsOptional()
  liquid_rental_cg: number;

  @IsNumber()
  @IsOptional()
  rental_exempt_deduction_cg: number;

  @IsNumber()
  @IsOptional()
  ordinaty_rental_cg: number;

  @IsNumber()
  @IsOptional()
  compensation_lost_cg: number;

  @IsNumber()
  @IsOptional()
  excess_compensation_cg: number;

  @IsNumber()
  @IsOptional()
  taxable_rental: number;

  @IsNumber()
  @IsOptional()
  liquid_rental_taxable_cg: number;

  @IsNumber()
  @IsOptional()
  presumptive_rental_cg: number;


  /*  Cédula de pensiones*/
  @IsNumber()
  @IsOptional()
  total_income_rental_cp: number;

  @IsNumber()
  @IsOptional()
  incomen_not_constitutive_rental_cp: number;

  @IsNumber()
  @IsOptional()
  liquid_rental_cp: number;

  @IsNumber()
  @IsOptional()
  pension_exempt_rental_cp: number;

  @IsNumber()
  @IsOptional()
  liquid_rental_pension_cp: number;


  /* Cédula de dividendos y participaciones */
  @IsNumber()
  @IsOptional()
  dividend_participation_cdp: number;

  @IsNumber()
  @IsOptional()
  not_constitutive_income_cdp: number;

  @IsNumber()
  @IsOptional()
  ordinary_liquid_rental_cdp: number;

  @IsNumber()
  @IsOptional()
  sub_cedula1: number;

  @IsNumber()
  @IsOptional()
  sub_cedula2: number;

  @IsNumber()
  @IsOptional()
  passive_liquid_rental_cdp: number;

  @IsNumber()
  @IsOptional()
  exempt_rental_cdp: number;


  /* Ganancia ocasional */
  @IsNumber()
  @IsOptional()
  ingress_go: number;

  @IsNumber()
  @IsOptional()
  cost_go: number;

  @IsNumber()
  @IsOptional()
  go_not_taxed_exempt: number;

  @IsNumber()
  @IsOptional()
  go_taxed: number;

  /*  Liquidación privada*/
  @IsNumber()
  @IsOptional()
  general_pension: number;

  @IsNumber()
  @IsOptional()
  presumptive_rental_pension: number;

  @IsNumber()
  @IsOptional()
  participation_dividend_lp: number;

  @IsOptional()
  @IsNumber()
  dividends_shares_2017_1: number;

  @IsOptional()
  @IsNumber()
  dividends_shares_2017_2: number;

  @IsOptional()
  @IsNumber()
  total_taxable_liquid_income: number;

  @IsOptional()
  @IsNumber()
  taxes_paid_abroad: number;

  @IsOptional()
  @IsNumber()
  donations: number;

  @IsOptional()
  @IsNumber()
  others_private: number;

  @IsOptional()
  @IsNumber()
  tax_discounts: number;

  @IsOptional()
  @IsNumber()
  total_income_tax: number;

  @IsOptional()
  @IsNumber()
  occasional_earnings_tax: number;

  @IsOptional()
  @IsNumber()
  discount_taxes_occasional_income: number;

  @IsOptional()
  @IsNumber()
  total_tax_charged: number;

  @IsOptional()
  @IsNumber()
  advance_rental_liquid_year_taxable: number;

  @IsOptional()
  @IsNumber()
  balance_favor_previous_taxable_year: number;

  @IsOptional()
  @IsNumber()
  withholdings_taxable_year_to_report: number;

  @IsOptional()
  @IsNumber()
  income_advance_following_taxable_year: number;

  @IsOptional()
  @IsNumber()
  balance_pay_tax: number;

  @IsOptional()
  @IsNumber()
  sanctions: number;

  @IsOptional()
  @IsNumber()
  total_balance_pay: number;

  @IsOptional()
  @IsNumber()
  total_balance_favor: number;

  /* Firmas */
  @IsNumber()
  @IsOptional()
  signatory_identification: number;

  @IsNumber()
  @IsOptional()
  DV_firm: number;

  @IsString()
  @IsOptional()
  dependent_document_type: string;

  @IsNumber()
  @IsOptional()
  dependent_identification: number;

  @IsString()
  @IsOptional()
  kinship: string;

  @IsBoolean()
  @IsOptional()
  disclaimer: Boolean;

  /*  Pago total*/
  @IsNumber()
  @IsOptional()
  full_payment: number;

}
