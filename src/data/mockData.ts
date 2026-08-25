import type { Veiculo, IPVA, Licenciamento } from '@/types'

// Dados mockados de veículos
export const veiculosMock: Veiculo[] = [
  // São Paulo
  {
    id: '1',
    placa: 'ABC1D23',
    tipo: 'tracao',
    marca: 'Volvo',
    modelo: 'FH 540',
    anoFabricacao: 2022,
    anoModelo: 2023,
    renavam: '12345678901',
    estado: 'SP',
    valorVenal: 650000
  },
  {
    id: '2',
    placa: 'DEF2E34',
    tipo: 'carreta',
    marca: 'Randon',
    modelo: 'SR GR',
    anoFabricacao: 2021,
    anoModelo: 2022,
    renavam: '12345678902',
    estado: 'SP',
    valorVenal: 180000
  },
  {
    id: '3',
    placa: 'GHI3F45',
    tipo: 'tracao',
    marca: 'Scania',
    modelo: 'R 450',
    anoFabricacao: 2023,
    anoModelo: 2024,
    renavam: '12345678903',
    estado: 'SP',
    valorVenal: 720000
  },
  // Paraná
  {
    id: '4',
    placa: 'JKL4G56',
    tipo: 'tracao',
    marca: 'Mercedes-Benz',
    modelo: 'Actros 2651',
    anoFabricacao: 2022,
    anoModelo: 2023,
    renavam: '12345678904',
    estado: 'PR',
    valorVenal: 580000
  },
  {
    id: '5',
    placa: 'MNO5H67',
    tipo: 'carreta',
    marca: 'Librelato',
    modelo: 'Graneleira',
    anoFabricacao: 2020,
    anoModelo: 2021,
    renavam: '12345678905',
    estado: 'PR',
    valorVenal: 150000
  },
  // Santa Catarina
  {
    id: '6',
    placa: 'PQR6I78',
    tipo: 'tracao',
    marca: 'DAF',
    modelo: 'XF 530',
    anoFabricacao: 2023,
    anoModelo: 2024,
    renavam: '12345678906',
    estado: 'SC',
    valorVenal: 690000
  },
  {
    id: '7',
    placa: 'STU7J89',
    tipo: 'carreta',
    marca: 'Facchini',
    modelo: 'SRF',
    anoFabricacao: 2022,
    anoModelo: 2023,
    renavam: '12345678907',
    estado: 'SC',
    valorVenal: 165000
  },
  // Rio Grande do Sul
  {
    id: '8',
    placa: 'VWX8K90',
    tipo: 'tracao',
    marca: 'Iveco',
    modelo: 'S-Way 600',
    anoFabricacao: 2024,
    anoModelo: 2025,
    renavam: '12345678908',
    estado: 'RS',
    valorVenal: 750000
  },
  {
    id: '9',
    placa: 'YZA9L01',
    tipo: 'carreta',
    marca: 'Guerra',
    modelo: 'Graneleira',
    anoFabricacao: 2021,
    anoModelo: 2022,
    renavam: '12345678909',
    estado: 'RS',
    valorVenal: 140000
  },
  {
    id: '10',
    placa: 'BCD0M12',
    tipo: 'tracao',
    marca: 'Volvo',
    modelo: 'FH 460',
    anoFabricacao: 2021,
    anoModelo: 2022,
    renavam: '12345678910',
    estado: 'RS',
    valorVenal: 520000
  },
]

// Dados mockados de IPVA 2026
export const ipvaMock: IPVA[] = [
  // SP - Pagos
  { id: 'ipva-1', veiculoId: '1', ano: 2026, valor: 9750, valorPago: 9750, parcelas: 5, parcelaAtual: 5, dataVencimento: '2026-01-15', dataPagamento: '2026-01-10', status: 'pago' },
  { id: 'ipva-2', veiculoId: '2', ano: 2026, valor: 2700, valorPago: 2700, parcelas: 1, parcelaAtual: 1, dataVencimento: '2026-01-20', dataPagamento: '2026-01-18', status: 'pago' },
  // SP - Pendente
  { id: 'ipva-3', veiculoId: '3', ano: 2026, valor: 10800, parcelas: 5, parcelaAtual: 2, dataVencimento: '2026-02-15', status: 'pendente' },
  // PR - Próximo vencimento
  { id: 'ipva-4', veiculoId: '4', ano: 2026, valor: 5800, parcelas: 5, parcelaAtual: 1, dataVencimento: '2026-02-05', status: 'proximo' },
  { id: 'ipva-5', veiculoId: '5', ano: 2026, valor: 1500, valorPago: 1500, parcelas: 1, parcelaAtual: 1, dataVencimento: '2026-01-25', dataPagamento: '2026-01-20', status: 'pago' },
  // SC - Pendentes
  { id: 'ipva-6', veiculoId: '6', ano: 2026, valor: 6900, parcelas: 3, parcelaAtual: 1, dataVencimento: '2026-02-10', status: 'pendente' },
  { id: 'ipva-7', veiculoId: '7', ano: 2026, valor: 1650, parcelas: 1, parcelaAtual: 1, dataVencimento: '2026-02-15', status: 'pendente' },
  // RS - Vencido
  { id: 'ipva-8', veiculoId: '8', ano: 2026, valor: 7500, parcelas: 6, parcelaAtual: 1, dataVencimento: '2026-01-20', status: 'vencido' },
  // RS - Pagos
  { id: 'ipva-9', veiculoId: '9', ano: 2026, valor: 1400, valorPago: 1316, parcelas: 1, parcelaAtual: 1, dataVencimento: '2026-01-15', dataPagamento: '2026-01-10', status: 'pago' },
  { id: 'ipva-10', veiculoId: '10', ano: 2026, valor: 5200, valorPago: 5200, parcelas: 6, parcelaAtual: 6, dataVencimento: '2026-01-20', dataPagamento: '2026-01-15', status: 'pago' },
]

// Dados mockados de Licenciamento 2026
export const licenciamentoMock: Licenciamento[] = [
  { id: 'lic-1', veiculoId: '1', ano: 2026, valor: 181.54, dataVencimento: '2026-03-15', status: 'pendente', crlvEmitido: false },
  { id: 'lic-2', veiculoId: '2', ano: 2026, valor: 181.54, dataVencimento: '2026-03-20', dataPagamento: '2026-01-15', status: 'pago', crlvEmitido: true },
  { id: 'lic-3', veiculoId: '3', ano: 2026, valor: 181.54, dataVencimento: '2026-04-15', status: 'pendente', crlvEmitido: false },
  { id: 'lic-4', veiculoId: '4', ano: 2026, valor: 155.23, dataVencimento: '2026-04-10', status: 'pendente', crlvEmitido: false },
  { id: 'lic-5', veiculoId: '5', ano: 2026, valor: 155.23, dataVencimento: '2026-04-15', dataPagamento: '2026-01-20', status: 'pago', crlvEmitido: true },
  { id: 'lic-6', veiculoId: '6', ano: 2026, valor: 145.78, dataVencimento: '2026-02-10', status: 'proximo', crlvEmitido: false },
  { id: 'lic-7', veiculoId: '7', ano: 2026, valor: 145.78, dataVencimento: '2026-02-15', status: 'proximo', crlvEmitido: false },
  { id: 'lic-8', veiculoId: '8', ano: 2026, valor: 168.92, dataVencimento: '2026-01-20', status: 'vencido', crlvEmitido: false },
  { id: 'lic-9', veiculoId: '9', ano: 2026, valor: 168.92, dataVencimento: '2026-04-20', dataPagamento: '2026-01-10', status: 'pago', crlvEmitido: true },
  { id: 'lic-10', veiculoId: '10', ano: 2026, valor: 168.92, dataVencimento: '2026-04-25', status: 'pendente', crlvEmitido: false },
]
