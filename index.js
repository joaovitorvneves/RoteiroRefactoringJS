const { readFileSync } = require('fs');

function formatarMoeda(valor) {
  return new Intl.NumberFormat("pt-BR",
    { style: "currency", currency: "BRL",
      minimumFractionDigits: 2 }).format(valor/100);
}

function obterPeca(pecas, apre) {
  return pecas[apre.id];
}

function calcularCredito(pecas, apre) {  
  let creditos = 0;
  creditos += Math.max(apre.audiencia - 30, 0);
  if (obterPeca(pecas, apre).tipo === "comedia") 
     creditos += Math.floor(apre.audiencia / 5);
  return creditos;   
}

function calcularTotalCreditos(pecas, apresentacoes) {
  let creditos = 0;
  for (let apre of apresentacoes) {
    creditos += calcularCredito(pecas, apre);
  }
  return creditos;
}

function calcularTotalApresentacao(pecas, apre) {
  let total = 0;
  const peca = obterPeca(pecas, apre);
  switch (peca.tipo) {
  case "tragedia":
    total = 40000;
    if (apre.audiencia > 30) {
      total += 1000 * (apre.audiencia - 30);
    }
    break;
  case "comedia":
    total = 30000;
    if (apre.audiencia > 20) {
       total += 10000 + 500 * (apre.audiencia - 20);
    }
    total += 300 * apre.audiencia;
    break;
  default:
      throw new Error(`Peça desconhecia: ${peca.tipo}`);
  }
  return total;
}

function calcularTotalFatura(pecas, apresentacoes) {
  let totalFatura = 0;
  for (let apre of apresentacoes) {
    totalFatura += calcularTotalApresentacao(pecas, apre);
  }
  return totalFatura;
}

function gerarFaturaStr(fatura, pecas) {
  // corpo principal - focado apenas na apresentação
  let faturaStr = `Fatura ${fatura.cliente}\n`;
  for (let apre of fatura.apresentacoes) {
      faturaStr += `  ${obterPeca(pecas, apre).nome}: ${formatarMoeda(calcularTotalApresentacao(pecas, apre))} (${apre.audiencia} assentos)\n`;
  }
  faturaStr += `Valor total: ${formatarMoeda(calcularTotalFatura(pecas, fatura.apresentacoes))}\n`;
  faturaStr += `Créditos acumulados: ${calcularTotalCreditos(pecas, fatura.apresentacoes)} \n`;
  return faturaStr;
}

function gerarFaturaHTML(fatura, pecas) {
  let faturaHTML = '<html>\n';
  faturaHTML += `<p> Fatura ${fatura.cliente} </p>\n`;
  faturaHTML += '<ul>\n';
  for (let apre of fatura.apresentacoes) {
      faturaHTML += `<li>  ${obterPeca(pecas, apre).nome}: ${formatarMoeda(calcularTotalApresentacao(pecas, apre))} (${apre.audiencia} assentos) </li>\n`;
  }
  faturaHTML += '</ul>\n';
  faturaHTML += `<p> Valor total: ${formatarMoeda(calcularTotalFatura(pecas, fatura.apresentacoes))} </p>\n`;
  faturaHTML += `<p> Créditos acumulados: ${calcularTotalCreditos(pecas, fatura.apresentacoes)} </p>\n`;
  faturaHTML += '</html>';
  return faturaHTML;
}

const faturas = JSON.parse(readFileSync('./faturas.json'));
const pecas = JSON.parse(readFileSync('./pecas.json'));
const faturaStr = gerarFaturaStr(faturas, pecas);
const faturaHTML = gerarFaturaHTML(faturas, pecas);
console.log(faturaStr);
console.log('\n' + faturaHTML);
