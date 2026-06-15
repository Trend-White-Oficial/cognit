import pandas as pd

def create_ponto_banco_horas():
    data = {
        'Data': ['01/06/2024', '02/06/2024'],
        'Entrada 1': ['08:00', '08:00'],
        'Saída 1': ['12:00', '12:00'],
        'Entrada 2': ['13:00', '13:00'],
        'Saída 2': ['17:00', '18:00'],
        'Total Horas': ['08:00', '09:00'],
        'Saldo Banco': ['00:00', '+01:00']
    }
    df = pd.DataFrame(data)
    with pd.ExcelWriter('/home/ubuntu/cognit/public/dp-templates/Controle_Ponto_Banco_Horas.xlsx', engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Ponto')
    print("Planilha de Ponto criada.")

def create_exames_medicos():
    data = {
        'Funcionário': ['João Silva', 'Maria Souza'],
        'Tipo Exame': ['Periódico', 'Admissional'],
        'Data Realização': ['10/01/2024', '15/05/2024'],
        'Validade (Meses)': [12, 12],
        'Próximo Exame': ['10/01/2025', '15/05/2025'],
        'Status': ['Ok', 'Ok']
    }
    df = pd.DataFrame(data)
    with pd.ExcelWriter('/home/ubuntu/cognit/public/dp-templates/Controle_Exames_Medicos.xlsx', engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Exames')
    print("Planilha de Exames criada.")

def create_sindicatos():
    data = {
        'Sindicato': ['Sindicato dos Contabilistas', 'Sindicato do Comércio'],
        'CNPJ': ['00.000.000/0001-00', '11.111.111/0001-11'],
        'Data Base': ['Maio', 'Setembro'],
        'Contribuição Assistencial': ['Sim', 'Não'],
        'Piso Salarial': [1800.00, 1650.00]
    }
    df = pd.DataFrame(data)
    with pd.ExcelWriter('/home/ubuntu/cognit/public/dp-templates/Controle_Sindicatos.xlsx', engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Sindicatos')
    print("Planilha de Sindicatos criada.")

if __name__ == "__main__":
    create_ponto_banco_horas()
    create_exames_medicos()
    create_sindicatos()
