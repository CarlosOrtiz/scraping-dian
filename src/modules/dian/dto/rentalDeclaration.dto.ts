import { IsString } from 'class-validator';

export class RentalDeclaration {

  /* Datos Iniciar sesión */
  @IsString()
  document: string;

  @IsString()
  password: string;


  /* Pregunta Inicar Modal */
  @IsString()
  tax_resident: string;


  /* Datos Declarante */
  @IsString()
  DV: string;

  @IsString()
  NIT: string;

  @IsString()
  first_lastname: string;

  @IsString()
  second_lastname: string;

  @IsString()
  first_name: string;

  @IsString()
  other_name: string;

  @IsString()
  sectional_address_code: string;

  @IsString()
  economic_activity: string;

  @IsString()
  correction_code: string;

  @IsString()
  previous_from_number: string;


  /* Preguntas Si o No */
  @IsString()
  income_country: string;

  @IsString()
  retirement_unemployment: string;

  @IsString()
  millitary_forces_police: string;

  @IsString()
  compensation_insurance: string;

  @IsString()
  income_public_university: string;

  @IsString()
  public_servant: string;

  @IsString()
  hotel_rental_income: string;

  @IsString()
  work_rental_income: string;

  @IsString()
  can_capital_income: string;

  @IsString()
  not_work_rental_income: string;


  /* Patrimonio */
  @IsString()
  patrimony_total: string;

  @IsString()
  debt: string;

  @IsString()
  total_liquid_patrimonio: string;


  /* Rentas de trabajo */
  @IsString()
  total_income_rental_work: string;

  @IsString()
  not_constitutive_income: string;

  @IsString()
  cost_deduction_rt: string;

  @IsString()
  liquid_rental_rt: string;

  @IsString()
  exempt_rental_rt: string;

  @IsString()
  limit_rental_exempt_rt: string;

  @IsString()
  liquid_rental_work_rt: string;


  /* Rentas de capital */
  @IsString()
  total_capital_income: string;

  @IsString()
  income_not_constitutive_rental: string;

  @IsString()
  cost_deduction_coming: string;

  @IsString()
  liquid_rental_rc: string;

  @IsString()
  liquid_rental_passive_rc: string;

  @IsString()
  exempt_rental_rc: string;

  @IsString()
  limit_exempt_rental_rc: string;

  @IsString()
  ordinary_liquid_exercise: string;

  @IsString()
  loss_liquid_exercise_rc: string;

  @IsString()
  compasion_loss_capital_rental: string;

  @IsString()
  liquid_capital_rc: string;


  /* Rentas no laborales */
  @IsString()
  total_income_rnl: string;

  @IsString()
  discount_refund: string;

  @IsString()
  cost_expense_rnl: string;

  @IsString()
  liquid_rental_rnl: string;

  @IsString()
  not_labor_passive_liquid_rental: string;

  @IsString()
  rental_exempt_deduction_rnl: string;

  @IsString()
  limited_exempt_rental_rnl: string;

  @IsString()
  ordinary_liquid_rental_rnl: string;

  @IsString()
  loss_liquid_exercise_rnl: string;

  @IsString()
  compensation_loss_rental_rnl: string;

  @IsString()
  not_work_liquid_rental: string;


  /*Cédula general:  */
  @IsString()
  liquid_rental_cg: string;

  @IsString()
  rental_exempt_deduction_cg: string;

  @IsString()
  ordinaty_rental_cg: string;

  @IsString()
  compensation_lost_cg: string;

  @IsString()
  excess_compensation_cg: string;

  @IsString()
  taxable_rental: string;

  @IsString()
  liquid_rental_taxable_cg: string;

  @IsString()
  presumptive_rental_cg: string;


  /*  Cédula de pensiones*/
  @IsString()
  total_income_rental_cp: string;

  @IsString()
  incomen_not_constitutive_rental_cp: string;

  @IsString()
  liquid_rental_cp: string;

  @IsString()
  pension_exempt_rental_cp: string;

  @IsString()
  liquid_rental_pension_cp: string;


  /* Cédula de dividendos y participaciones */
  @IsString()
  dividend_participation_cdp: string;

  @IsString()
  not_constitutive_income_cdp: string;

  @IsString()
  ordinary_liquid_rental_cdp: string;

  @IsString()
  sub_cedula1: string;

  @IsString()
  sub_cedula2: string;

  @IsString()
  passive_liquid_rental_cdp: string;

  @IsString()
  exempt_rental_cdp: string;


  /* Ganancia ocasional */
  @IsString()
  ingress_go: string;

  @IsString()
  cost_go: string;
  @IsString()
  go_not_taxed_exempt: string;

  @IsString()
  go_taxed: string;


  /*  Liquidación privada*/
  @IsString()
  general_pension: string;

  @IsString()
  presumptive_rental_pension: string;

  @IsString()
  participation_dividend_lp: string;


  /* Firmas */
  @IsString()
  signatory_identification: string;

  @IsString()
  DV_firm: string;

  @IsString()
  dependent_document_type: string;

  @IsString()
  dependent_identification: string;

  @IsString()
  kinship: string;

  @IsString()
  disclaimer: string;


  /*  Pago total*/
  @IsString()
  full_payment: string;

}
