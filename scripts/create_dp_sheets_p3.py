import pandas as pd

def create_simulador_folha():
    data = {
        'Descrição': ['Salário Base', 'Horas Extras', 'Total Proventos', 'INSS', 'IRRF', 'Total Descontos', 'Líquido'],
        'Valor (R$)': [5000.00, 500.00, 5500.00, 617.10, 450.00, 1067.10, 4432.90]
    }
    df = pd.DataFrame(data)
    with pd.ExcelWriter('/home/ubuntu/cognit/public/dp-templates/Simulador_Folha_Pagamento.xlsx', engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Folha')
    print("Planilha de Folha criada.")

def create_analise_tributaria():
    data = {
        'Cenário': ['Empresa Simples Nacional', 'Lucro Presumido/Real'],
        'FPAS': ['Exento', '20%'],
        'RAT (Ajustado)': ['0%', '2%'],
        'CPP': ['0%', '20%'],
        'Terceiros': ['0%', '5.8%'],
        'Custo Total %': ['~8%', '~33%']
    }
    df = pd.DataFrame(data)
    with pd.ExcelWriter('/home/ubuntu/cognit/public/dp-templates/Analise_FPAS_RAT_CPP.xlsx', engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Tributário')
    print("Planilha de Análise Tributária criada.")

if __name__ == "__main__":
    create_simulador_folha()
    create_analise_tributaria()
