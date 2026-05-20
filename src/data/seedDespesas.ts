// Dados importados da planilha "Controle_de_Compras_para_o_Comdomínio_18-04-26.xlsx"
export interface SeedDespesa {
  data_compra: string | null; // ISO yyyy-mm-dd
  descricao: string;
  fornecedor: string;
  valor_total: number;
  num_parcelas: string;
  parcela_atual: number;
  valor_parcela: number;
  vencimento: string; // ISO
  pago: boolean;
  data_pagamento: string | null;
}

export const SEED_DESPESAS: SeedDespesa[] = [
  // Extintores - 3x
  { data_compra: "2026-04-08", descricao: "Serviços de extintores e mangueiras hidrante - NF 4970", fornecedor: "M R Barreto Extintores", valor_total: 2455.00, num_parcelas: "3", parcela_atual: 1, valor_parcela: 818.34, vencimento: "2026-05-08", pago: false, data_pagamento: null },
  { data_compra: "2026-04-08", descricao: "Serviços de extintores e mangueiras hidrante - NF 4970", fornecedor: "M R Barreto Extintores", valor_total: 2455.00, num_parcelas: "3", parcela_atual: 2, valor_parcela: 818.33, vencimento: "2026-06-08", pago: false, data_pagamento: null },
  { data_compra: "2026-04-08", descricao: "Serviços de extintores e mangueiras hidrante - NF 4970", fornecedor: "M R Barreto Extintores", valor_total: 2455.00, num_parcelas: "3", parcela_atual: 3, valor_parcela: 818.33, vencimento: "2026-07-08", pago: false, data_pagamento: null },
  // Material pintura
  { data_compra: "2026-03-26", descricao: "Material de Pintura, Metalatex, Rolo de Espuma, Bandeja Plástica", fornecedor: "Normatel NF 107818", valor_total: 202.99, num_parcelas: "1", parcela_atual: 1, valor_parcela: 202.99, vencimento: "2026-04-24", pago: false, data_pagamento: null },
  // OTIS - 6x
  { data_compra: "2026-01-17", descricao: "Amortecedor porta externa elevador de serviços 3º andar", fornecedor: "OTIS", valor_total: 1600.95, num_parcelas: "6", parcela_atual: 1, valor_parcela: 266.82, vencimento: "2026-05-18", pago: false, data_pagamento: null },
  { data_compra: "2026-01-17", descricao: "Amortecedor porta externa elevador de serviços 3º andar", fornecedor: "OTIS", valor_total: 1600.95, num_parcelas: "6", parcela_atual: 2, valor_parcela: 266.82, vencimento: "2026-06-18", pago: false, data_pagamento: null },
  { data_compra: "2026-01-17", descricao: "Amortecedor porta externa elevador de serviços 3º andar", fornecedor: "OTIS", valor_total: 1600.95, num_parcelas: "6", parcela_atual: 3, valor_parcela: 266.82, vencimento: "2026-07-18", pago: false, data_pagamento: null },
  { data_compra: "2026-01-17", descricao: "Amortecedor porta externa elevador de serviços 3º andar", fornecedor: "OTIS", valor_total: 1600.95, num_parcelas: "6", parcela_atual: 4, valor_parcela: 266.82, vencimento: "2026-08-18", pago: false, data_pagamento: null },
  { data_compra: "2026-01-17", descricao: "Amortecedor porta externa elevador de serviços 3º andar", fornecedor: "OTIS", valor_total: 1600.95, num_parcelas: "6", parcela_atual: 5, valor_parcela: 266.82, vencimento: "2026-09-18", pago: false, data_pagamento: null },
  { data_compra: "2026-01-17", descricao: "Amortecedor porta externa elevador de serviços 3º andar", fornecedor: "OTIS", valor_total: 1600.95, num_parcelas: "6", parcela_atual: 6, valor_parcela: 266.82, vencimento: "2026-10-18", pago: false, data_pagamento: null },
  // Sinaleiros - 3x
  { data_compra: "2026-03-26", descricao: "Compra de 02 Sinaleiros duplo entrada e saída das garagens", fornecedor: "Carmehil NF 23346", valor_total: 1386.60, num_parcelas: "3", parcela_atual: 1, valor_parcela: 462.20, vencimento: "2026-04-25", pago: false, data_pagamento: null },
  { data_compra: "2026-03-26", descricao: "Compra de 02 Sinaleiros duplo entrada e saída das garagens", fornecedor: "Carmehil NF 23346", valor_total: 1386.60, num_parcelas: "3", parcela_atual: 2, valor_parcela: 462.20, vencimento: "2026-05-25", pago: false, data_pagamento: null },
  { data_compra: "2026-03-26", descricao: "Compra de 02 Sinaleiros duplo entrada e saída das garagens", fornecedor: "Carmehil NF 23346", valor_total: 1386.60, num_parcelas: "3", parcela_atual: 3, valor_parcela: 462.20, vencimento: "2026-06-25", pago: false, data_pagamento: null },
  // Bradesco Seguros - 6x
  { data_compra: "2026-04-07", descricao: "Seguro Condomínio", fornecedor: "Bradesco Seguros", valor_total: 3302.76, num_parcelas: "6", parcela_atual: 1, valor_parcela: 550.46, vencimento: "2026-04-10", pago: true, data_pagamento: "2026-04-10" },
  { data_compra: "2026-04-07", descricao: "Seguro Condomínio", fornecedor: "Bradesco Seguros", valor_total: 3302.76, num_parcelas: "6", parcela_atual: 2, valor_parcela: 550.46, vencimento: "2026-05-10", pago: false, data_pagamento: null },
  { data_compra: "2026-04-07", descricao: "Seguro Condomínio", fornecedor: "Bradesco Seguros", valor_total: 3302.76, num_parcelas: "6", parcela_atual: 3, valor_parcela: 550.46, vencimento: "2026-06-10", pago: false, data_pagamento: null },
  { data_compra: "2026-04-07", descricao: "Seguro Condomínio", fornecedor: "Bradesco Seguros", valor_total: 3302.76, num_parcelas: "6", parcela_atual: 4, valor_parcela: 550.46, vencimento: "2026-07-10", pago: false, data_pagamento: null },
  { data_compra: "2026-04-07", descricao: "Seguro Condomínio", fornecedor: "Bradesco Seguros", valor_total: 3302.76, num_parcelas: "6", parcela_atual: 5, valor_parcela: 550.46, vencimento: "2026-08-10", pago: false, data_pagamento: null },
  { data_compra: "2026-04-07", descricao: "Seguro Condomínio", fornecedor: "Bradesco Seguros", valor_total: 3302.76, num_parcelas: "6", parcela_atual: 6, valor_parcela: 550.46, vencimento: "2026-09-10", pago: false, data_pagamento: null },
  // Limpeza cisternas
  { data_compra: "2026-03-18", descricao: "Limpeza de 03 Cisternas e duas caixas d'água", fornecedor: "Francinete", valor_total: 1130.00, num_parcelas: "1", parcela_atual: 1, valor_parcela: 1130.00, vencimento: "2026-03-18", pago: true, data_pagamento: "2026-03-18" },
  // Para raios
  { data_compra: "2026-03-18", descricao: "Compra de material para revisão dos para raios", fornecedor: "Dragão dos Parafusos NF 343168", valor_total: 623.54, num_parcelas: "PIX", parcela_atual: 1, valor_parcela: 623.54, vencimento: "2026-03-01", pago: true, data_pagamento: "2026-03-01" },
  // Anthropic
  { data_compra: "2026-04-06", descricao: "Assinatura Cloud Aplicativo para o Condomínio", fornecedor: "Anthropic, PBC", valor_total: 1320.00, num_parcelas: "Cartão 12x", parcela_atual: 1, valor_parcela: 110.00, vencimento: "2026-05-05", pago: false, data_pagamento: null },
  // Diesel
  { data_compra: "2026-04-12", descricao: "Óleo Diesel para o grupo gerador", fornecedor: "Posto Serv 100", valor_total: 145.60, num_parcelas: "PIX", parcela_atual: 1, valor_parcela: 145.60, vencimento: "2026-04-12", pago: true, data_pagamento: "2026-04-12" },
  // LED Natal - 2x
  { data_compra: "2025-12-05", descricao: "Lâmpadas de LED para enfeite de Natal", fornecedor: "Eletrônica Apollo NF 130.530", valor_total: 639.96, num_parcelas: "2", parcela_atual: 1, valor_parcela: 319.98, vencimento: "2026-01-04", pago: true, data_pagamento: "2026-01-04" },
  { data_compra: "2025-12-05", descricao: "Lâmpadas de LED para enfeite de Natal", fornecedor: "Eletrônica Apollo NF 130.531", valor_total: 640.96, num_parcelas: "2", parcela_atual: 2, valor_parcela: 320.48, vencimento: "2026-02-03", pago: true, data_pagamento: "2026-02-03" },
  // Impermeabilização - 2x
  { data_compra: "2025-12-10", descricao: "Material para impermeabilizar lajes da cobertura do condomínio", fornecedor: "Normatel NF 535075", valor_total: 570.69, num_parcelas: "2", parcela_atual: 1, valor_parcela: 285.35, vencimento: "2026-01-09", pago: true, data_pagamento: "2026-01-09" },
  { data_compra: "2025-12-10", descricao: "Material para impermeabilizar lajes da cobertura do condomínio", fornecedor: "Normatel NF 535075", valor_total: 570.69, num_parcelas: "2", parcela_atual: 2, valor_parcela: 285.35, vencimento: "2026-02-09", pago: true, data_pagamento: "2026-02-09" },
  // Luminárias - 6x
  { data_compra: "2025-12-04", descricao: "Compra de 10 Luminárias para os tetos do elevador e tinta para piso", fornecedor: "Normatel NF 534157", valor_total: 1057.80, num_parcelas: "6", parcela_atual: 1, valor_parcela: 176.17, vencimento: "2026-01-03", pago: true, data_pagamento: "2026-01-03" },
  { data_compra: "2025-12-04", descricao: "Compra de 10 Luminárias para os tetos do elevador e tinta para piso", fornecedor: "Normatel NF 534157", valor_total: 1057.80, num_parcelas: "6", parcela_atual: 2, valor_parcela: 176.17, vencimento: "2026-02-02", pago: true, data_pagamento: "2026-02-02" },
  { data_compra: "2025-12-04", descricao: "Compra de 10 Luminárias para os tetos do elevador e tinta para piso", fornecedor: "Normatel NF 534157", valor_total: 1057.80, num_parcelas: "6", parcela_atual: 3, valor_parcela: 176.17, vencimento: "2026-03-04", pago: true, data_pagamento: "2026-03-04" },
  { data_compra: "2025-12-04", descricao: "Compra de 10 Luminárias para os tetos do elevador e tinta para piso", fornecedor: "Normatel NF 534157", valor_total: 1057.80, num_parcelas: "6", parcela_atual: 4, valor_parcela: 176.17, vencimento: "2026-04-03", pago: true, data_pagamento: "2026-04-03" },
  { data_compra: "2025-12-04", descricao: "Compra de 10 Luminárias para os tetos do elevador e tinta para piso", fornecedor: "Normatel NF 534157", valor_total: 1057.80, num_parcelas: "6", parcela_atual: 5, valor_parcela: 176.16, vencimento: "2026-05-03", pago: false, data_pagamento: null },
  { data_compra: "2025-12-04", descricao: "Compra de 10 Luminárias para os tetos do elevador e tinta para piso", fornecedor: "Normatel NF 534157", valor_total: 1057.80, num_parcelas: "6", parcela_atual: 6, valor_parcela: 176.16, vencimento: "2026-06-02", pago: false, data_pagamento: null },
];
