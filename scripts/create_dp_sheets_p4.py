import pandas as pd

def create_custo_empregado():
    data = {
        'Item': ['Salário Nominal', 'FGTS (8%)', 'Férias (Provisão)', '13º (Provisão)', 'Encargos Sociais', 'Benefícios (VT/VR)', 'Custo Total'],
        'Valor Mensal (R$)': [3000.00, 240.00, 333.33, 250.00, 600.00, 500.00, 4923.33]
    }
    df = pd.DataFrame(data)
    with pd.ExcelWriter('/home/ubuntu/cognit/public/dp-templates/Simulador_Custo_Empregado.xlsx', engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Custo')
    print("Planilha de Custo criada.")

def create_controle_ferias():
    data = {
        'Funcionário': ['João Silva', 'Maria Souza'],
        'Início Período Aquisitivo': ['01/01/2023', '15/05/2023'],
        'Fim Período Aquisitivo': ['31/12/2023', '14/05/2024'],
        'Limite para Gozo': ['31/12/2024', '14/05/2025'],
        'Dias de Direito': [30, 30],
        'Status': ['Pendente', 'Pendente']
    }
    df = pd.DataFrame(data)
    with pd.ExcelWriter('/home/ubuntu/cognit/public/dp-templates/Controle_Ferias.xlsx', engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Férias')
    print("Planilha de Férias criada.")

def create_calculo_13():
    data = {
        'Funcionário': ['João Silva', 'Maria Souza'],
        'Salário Base': [3000.00, 2500.00],
        'Meses Trabalhados': [12, 8],
        'Valor 1ª Parcela': [1500.00, 833.33],
        'Valor 2ª Parcela (Bruto)': [1500.00, 833.33],
        'Total Bruto': [3000.00, 1666.66]
    }
    df = pd.DataFrame(data)
    with pd.ExcelWriter('/home/ubuntu/cognit/public/dp-templates/Calculo_13_Salario.xlsx', engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='13º Salário')
    print("Planilha de 13º criada.")

if __name__ == "__main__":
    create_custo_empregado()
    create_controle_ferias()
    create_calculo_13()
