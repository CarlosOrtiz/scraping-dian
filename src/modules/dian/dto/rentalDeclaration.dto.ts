import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class RentalDeclaration {

  /* Datos Iniciar sesión */
  @IsString()
  document: string;

  @IsString()
  password: string;


  /* Pregunta Inicar Modal */
  @IsString()
  @IsOptional()
  tax_resident: string;


  /* Datos Declarante */
  @IsString()
  @IsOptional()
  DV: string;

  @IsString()
  @IsOptional()
  NIT: string;

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

  @IsString()
  @IsOptional()
  previous_from_number: string;


  /* Preguntas Si o No */
  @IsString()
  @IsOptional()
  income_country: string;

  @IsString()
  @IsOptional()
  retirement_unemployment: string;

  @IsString()
  @IsOptional()
  millitary_forces_police: string;

  @IsString()
  @IsOptional()
  compensation_insurance: string;

  @IsString()
  @IsOptional()
  income_public_university: string;

  @IsString()
  @IsOptional()
  public_servant: string;

  @IsString()
  @IsOptional()
  hotel_rental_income: string;

  @IsString()
  @IsOptional()
  work_rental_income: string;

  @IsString()
  @IsOptional()
  can_capital_income: string;

  @IsString()
  @IsOptional()
  not_work_rental_income: string;


  /* Patrimonio */
  @IsString()
  @IsOptional()
  patrimony_total: string;

  @IsString()
  @IsOptional()
  debt: string;

  @IsString()
  @IsOptional()
  total_liquid_patrimonio: string;


  /* Rentas de trabajo */
  @IsString()
  @IsOptional()
  total_income_rental_work: string;

  @IsString()
  @IsOptional()
  not_constitutive_income: string;

  @IsString()
  @IsOptional()
  cost_deduction_rt: string;

  @IsString()
  @IsOptional()
  liquid_rental_rt: string;

  @IsString()
  @IsOptional()
  exempt_rental_rt: string;

  @IsString()
  @IsOptional()
  limit_rental_exempt_rt: string;

  @IsString()
  @IsOptional()
  liquid_rental_work_rt: string;


  /* Rentas de capital */
  @IsString()
  @IsOptional()
  total_capital_income: string;

  @IsString()
  @IsOptional()
  income_not_constitutive_rental: string;

  @IsString()
  @IsOptional()
  cost_deduction_coming: string;

  @IsString()
  @IsOptional()
  liquid_rental_rc: string;

  @IsString()
  @IsOptional()
  liquid_rental_passive_rc: string;

  @IsString()
  @IsOptional()
  exempt_rental_rc: string;

  @IsString()
  @IsOptional()
  limit_exempt_rental_rc: string;

  @IsString()
  @IsOptional()
  ordinary_liquid_exercise: string;

  @IsString()
  @IsOptional()
  loss_liquid_exercise_rc: string;

  @IsString()
  @IsOptional()
  compasion_loss_capital_rental: string;

  @IsString()
  @IsOptional()
  liquid_capital_rc: string;


  /* Rentas no laborales */
  @IsString()
  @IsOptional()
  total_income_rnl: string;

  @IsString()
  @IsOptional()
  discount_refund: string;

  @IsString()
  @IsOptional()
  cost_expense_rnl: string;

  @IsString()
  @IsOptional()
  liquid_rental_rnl: string;

  @IsString()
  @IsOptional()
  not_labor_passive_liquid_rental: string;

  @IsString()
  @IsOptional()
  rental_exempt_deduction_rnl: string;

  @IsString()
  @IsOptional()
  limited_exempt_rental_rnl: string;

  @IsString()
  @IsOptional()
  ordinary_liquid_rental_rnl: string;

  @IsString()
  @IsOptional()
  loss_liquid_exercise_rnl: string;

  @IsString()
  @IsOptional()
  compensation_loss_rental_rnl: string;

  @IsString()
  @IsOptional()
  not_work_liquid_rental: string;


  /*Cédula general:  */
  @IsString()
  @IsOptional()
  liquid_rental_cg: string;

  @IsString()
  @IsOptional()
  rental_exempt_deduction_cg: string;

  @IsString()
  @IsOptional()
  ordinaty_rental_cg: string;

  @IsString()
  @IsOptional()
  compensation_lost_cg: string;

  @IsString()
  @IsOptional()
  excess_compensation_cg: string;

  @IsString()
  @IsOptional()
  taxable_rental: string;

  @IsString()
  @IsOptional()
  liquid_rental_taxable_cg: string;

  @IsString()
  @IsOptional()
  presumptive_rental_cg: string;


  /*  Cédula de pensiones*/
  @IsString()
  @IsOptional()
  total_income_rental_cp: string;

  @IsString()
  @IsOptional()
  incomen_not_constitutive_rental_cp: string;

  @IsString()
  @IsOptional()
  liquid_rental_cp: string;

  @IsString()
  @IsOptional()
  pension_exempt_rental_cp: string;

  @IsString()
  @IsOptional()
  liquid_rental_pension_cp: string;


  /* Cédula de dividendos y participaciones */
  @IsString()
  @IsOptional()
  dividend_participation_cdp: string;

  @IsString()
  @IsOptional()
  not_constitutive_income_cdp: string;

  @IsString()
  @IsOptional()
  ordinary_liquid_rental_cdp: string;

  @IsString()
  @IsOptional()
  sub_cedula1: string;

  @IsString()
  @IsOptional()
  sub_cedula2: string;

  @IsString()
  @IsOptional()
  passive_liquid_rental_cdp: string;

  @IsString()
  @IsOptional()
  exempt_rental_cdp: string;


  /* Ganancia ocasional */
  @IsString()
  @IsOptional()
  ingress_go: string;

  @IsString()
  @IsOptional()
  cost_go: string;

  @IsString()
  @IsOptional()
  go_not_taxed_exempt: string;

  @IsString()
  @IsOptional()
  go_taxed: string;


  /*  Liquidación privada*/
  @IsString()
  @IsOptional()
  general_pension: string;

  @IsString()
  @IsOptional()
  presumptive_rental_pension: string;

  @IsString()
  @IsOptional()
  participation_dividend_lp: string;


  /* Firmas */
  @IsString()
  @IsOptional()
  signatory_identification: string;

  @IsString()
  @IsOptional()
  DV_firm: string;

  @IsString()
  @IsOptional()
  dependent_document_type: string;

  @IsString()
  @IsOptional()
  dependent_identification: string;

  @IsString()
  @IsOptional()
  kinship: string;

  @IsString()
  @IsOptional()
  disclaimer: string;


  /*  Pago total*/
  @IsString()
  @IsOptional()
  full_payment: string;

}
