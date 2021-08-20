import { IsString, IsOptional, IsNotEmpty, IsBoolean, IsNumber, IsEmail } from 'class-validator';

export class RentalDeclaration {

  /* Datos Iniciar sesión */
  @IsString()
  @IsNotEmpty({ message: 'El campo para el número de documento se encuentra vacio -> document' })
  document: string;

  @IsString()
  @IsNotEmpty({ message: 'El campo de para la contraseña de encuentra vacio -> password' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'El campo uid se encuetra vacio' })
  uid: string;

  @IsString()
  @IsNotEmpty({ message: 'El campo url_response se encuetra vacio' })
  url_response: string

  @IsEmail()
  @IsNotEmpty()
  email: string

  @IsNumber()
  @IsNotEmpty({ message: 'El campo de año de la renta se encuentra vacio.' })
  year_Rental_Declaration: number;

  @IsNumber()
  @IsNotEmpty({ message: `El indicativo se encuentra vacio` })
  indicative: number;

  /* Pregunta Inicar Modal */
  @IsBoolean()
  tax_resident_1: boolean;

  @IsBoolean()
  @IsOptional()
  severance_pay_2016_2: boolean;

  @IsBoolean()
  @IsOptional()
  public_server_3: boolean;

  @IsBoolean()
  @IsOptional()
  income_country_4: boolean;

  /* Datos Declarante */
  @IsNumber()
  @IsOptional()
  DV_6: number;

  @IsString()
  @IsOptional()
  NIT_5: number;

  @IsString()
  @IsOptional()
  first_lastname_7: string;

  @IsString()
  @IsOptional()
  second_lastname_8: string;

  @IsString()
  @IsOptional()
  first_name_9: string;

  @IsString()
  @IsOptional()
  other_name_10: string;

  @IsString()
  @IsOptional()
  sectional_address_code_12: string;

  @IsString()
  @IsOptional()
  economic_activity_24: string;

  @IsString()
  @IsOptional()
  correction_code_25: string;

  @IsNumber()
  @IsOptional()
  previous_from_number_26: number;

  /* Preguntas Si o No */
  @IsBoolean()
  @IsOptional()
  income_country_27: boolean;

  @IsBoolean()
  @IsOptional()
  retirement_unemployment_113: boolean;  // esta pregunta sale en la modal del 2018 segunda pregunta

  @IsNumber()
  @IsOptional()
  response_retirement_unemployment_114: number;  //* 

  @IsBoolean()
  @IsOptional()
  millitary_forces_police_115: boolean;

  @IsNumber()
  @IsOptional()
  response_millitary_forces_police_116: number;   //*

  @IsBoolean()
  @IsOptional()
  compensation_insurance_117: boolean;

  @IsNumber()
  @IsOptional()
  response_compensation_insurance_118: number; //*

  @IsBoolean()
  @IsOptional()
  income_public_university_119: boolean;

  @IsNumber()
  @IsOptional()
  response_income_public_university_120: number;

  @IsBoolean()
  @IsOptional()
  public_servant_121: boolean;

  @IsNumber()
  @IsOptional()
  response_public_servant_122: number;

  @IsBoolean()
  @IsOptional()
  hotel_rental_income_123: boolean;

  @IsNumber()
  @IsOptional()
  response_hotel_rental_income_124: number;

  @IsBoolean()
  @IsOptional()
  work_rental_income_125: boolean;

  @IsNumber()
  @IsOptional()
  response_work_rental_income_126: number;

  @IsBoolean()
  @IsOptional()
  can_capital_income_127: boolean;

  @IsNumber()
  @IsOptional()
  response_can_capital_income_128: number;

  @IsBoolean()
  @IsOptional()
  not_work_rental_income_129: boolean;

  @IsNumber()
  @IsOptional()
  response_not_work_rental_income_130: number;


  /* Patrimonio */
  @IsNumber()
  @IsOptional()
  patrimony_total_28: number;

  @IsNumber()
  @IsOptional()
  debt_29: number;

  @IsNumber()
  @IsOptional()
  total_liquid_patrimonio_30: number;


  /* Rentas de trabajo */
  @IsNumber()
  @IsOptional()
  total_income_rental_work_31: number;

  @IsNumber()
  @IsOptional()
  not_constitutive_income_32: number;

  @IsNumber()
  @IsOptional()
  cost_deduction_rt_33: number;

  @IsNumber()
  @IsOptional()
  liquid_rental_rt_34: number;

  @IsNumber()
  @IsOptional()
  exempt_rental_rt_35: number;

  @IsNumber()
  @IsOptional()
  limit_rental_exempt_rt_36: number;

  @IsNumber()
  @IsOptional()
  liquid_rental_work_rt_37: number;


  /* Rentas de capital */
  @IsNumber()
  @IsOptional()
  total_capital_income_38: number;

  @IsNumber()
  @IsOptional()
  income_not_constitutive_rental_39: number;

  @IsNumber()
  @IsOptional()
  cost_deduction_coming_40: number;

  @IsNumber()
  @IsOptional()
  liquid_rental_rc_41: number;
  //43 El valor de la casilla 43 no puede superar 0. (CASILLA 38 + CASILLA 42 - CASILLA 39 - CASILLA 40)
  //39 El valor de la casilla 64 más la casilla 65 no puede superar el valor de la casilla 63.
  @IsNumber()
  @IsOptional()
  liquid_rental_passive_rc_42: number;

  @IsNumber()
  @IsOptional()
  exempt_rental_rc_43: number;

  @IsNumber()
  @IsOptional()
  limit_exempt_rental_rc_44: number;

  @IsNumber()
  @IsOptional()
  ordinary_liquid_exercise_45: number;
  //47 = El valor de la casilla 64 más la casilla 65 no puede superar el valor de la casilla 63.
  @IsNumber()
  @IsOptional()
  loss_liquid_exercise_rc_46: number;

  @IsNumber()
  @IsOptional()
  compasion_loss_capital_rental_47: number;

  @IsNumber()
  @IsOptional()
  liquid_capital_rc_48: number;


  /* Rentas no laborales */
  @IsNumber()
  @IsOptional()
  total_income_rnl_49: number;

  @IsNumber()
  @IsOptional()
  discount_refund_50: number;

  @IsNumber()
  @IsOptional()
  income_not_constitutive_rental_rnl_51: number;

  @IsNumber()
  @IsOptional()
  cost_expense_rnl_52: number;

  @IsNumber()
  @IsOptional()
  liquid_rental_rnl_53: number; //Renta líquida:

  @IsNumber()
  @IsOptional()
  not_labor_passive_liquid_rental_54: number;

  @IsNumber()
  @IsOptional()
  rental_exempt_deduction_rnl_55: number;

  @IsNumber()
  @IsOptional()
  limited_exempt_rental_rnl_56: number;

  @IsNumber()
  @IsOptional()
  ordinary_liquid_rental_rnl_57: number;

  @IsNumber()
  @IsOptional()
  loss_liquid_exercise_rnl_58: number;

  @IsNumber()
  @IsOptional()
  compensation_loss_rental_rnl_59: number;

  @IsNumber()
  @IsOptional()
  not_work_liquid_rental_60: number;


  /*Cédula general:  */
  @IsNumber()
  @IsOptional()
  liquid_rental_cg_61: number;

  @IsNumber()
  @IsOptional()
  rental_exempt_deduction_cg_62: number;

  @IsNumber()
  @IsOptional()
  ordinaty_rental_cg_63: number;

  @IsNumber()
  @IsOptional()
  compensation_lost_cg_64: number;

  @IsNumber()
  @IsOptional()
  excess_compensation_cg_65: number;

  @IsNumber()
  @IsOptional()
  taxable_rental_66: number;

  @IsNumber()
  @IsOptional()
  liquid_rental_taxable_cg_67: number;

  @IsNumber()
  @IsOptional()
  presumptive_rental_cg_68: number;


  /*  Cédula de pensiones*/
  @IsNumber()
  @IsOptional()
  total_income_rental_cp_69: number;

  @IsNumber()
  @IsOptional()
  incomen_not_constitutive_rental_cp_70: number;

  @IsNumber()
  @IsOptional()
  liquid_rental_cp_71: number;

  @IsNumber()
  @IsOptional()
  pension_exempt_rental_cp_72: number;

  @IsNumber()
  @IsOptional()
  liquid_rental_pension_cp_73: number;


  /* Cédula de dividendos y participaciones */
  @IsNumber()
  @IsOptional()
  dividend_participation_cdp_74: number;

  @IsNumber()
  @IsOptional()
  not_constitutive_income_cdp_75: number;

  @IsNumber()
  @IsOptional()
  ordinary_liquid_rental_cdp_76: number;

  @IsNumber()
  @IsOptional()
  sub_cedula1_77: number;

  @IsNumber()
  @IsOptional()
  sub_cedula2_78: number;

  @IsNumber()
  @IsOptional()
  passive_liquid_rental_cdp_79: number;

  @IsNumber()
  @IsOptional()
  exempt_rental_cdp_80: number;


  /* Ganancia ocasional */
  @IsNumber()
  @IsOptional()
  ingress_go_81: number;

  @IsNumber()
  @IsOptional()
  cost_go_82: number;

  @IsNumber()
  @IsOptional()
  go_not_taxed_exempt_83: number;

  @IsNumber()
  @IsOptional()
  go_taxed_84: number;

  /*  Liquidación privada*/
  @IsNumber()
  @IsOptional()
  general_pension_85: number;

  @IsNumber()
  @IsOptional()
  presumptive_rental_pension_86: number;

  @IsNumber()
  @IsOptional()
  participation_dividend_lp_87: number;

  @IsOptional()
  @IsNumber()
  dividends_shares_2017_1_88: number;

  @IsOptional()
  @IsNumber()
  dividends_shares_2017_2_89: number;

  @IsOptional()
  @IsNumber()
  total_taxable_liquid_income_90: number;

  @IsOptional()
  @IsNumber()
  taxes_paid_abroad_91: number;

  @IsOptional()
  @IsNumber()
  donations_92: number;

  @IsOptional()
  @IsNumber()
  others_private_93: number;

  @IsOptional()
  @IsNumber()
  tax_discounts_94: number;

  @IsOptional()
  @IsNumber()
  total_income_tax_95: number;

  @IsOptional()
  @IsNumber()
  occasional_earnings_tax_96: number;

  @IsOptional()
  @IsNumber()
  discount_taxes_occasional_income_97: number;

  @IsOptional()
  @IsNumber()
  total_tax_charged_98: number;

  @IsOptional()
  @IsNumber()
  advance_rental_liquid_year_taxable_99: number;

  @IsOptional()
  @IsNumber()
  balance_favor_previous_taxable_year_100: number;

  @IsOptional()
  @IsNumber()
  withholdings_taxable_year_to_report_101: number;

  @IsOptional()
  @IsNumber()
  income_advance_following_taxable_year_102: number;

  @IsOptional()
  @IsNumber()
  balance_pay_tax_103: number;

  @IsOptional()
  @IsNumber()
  sanctions_104: number;

  @IsOptional()
  @IsNumber()
  total_balance_pay_105: number;

  @IsOptional()
  @IsNumber()
  total_balance_favor_106: number;

  /* Firmas */
  @IsNumber()
  @IsOptional()
  signatory_identification_107: number;

  @IsNumber()
  @IsOptional()
  DV_firm_108: number;

  @IsString()
  @IsOptional()
  dependent_document_type_109: string;

  @IsNumber()
  @IsOptional()
  dependent_identification_110: number;

  @IsString()
  @IsOptional()
  kinship_112: string;

  @IsBoolean()
  @IsOptional()
  disclaimer_994: boolean;

  /*  Pago total*/
  @IsNumber()
  @IsOptional()
  full_payment_980: number;

}
