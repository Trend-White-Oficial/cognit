import pandas as pd

def create_rubricas_esocial():
    data = {
        'Código': ['1000', '1003', '1020', '9200', '9201'],
        'Descrição': ['Salário Base', 'Horas Extras 50%', 'DSR sobre Horas Extras', 'INSS Segurado', 'IRRF'],
        'Natureza Rubrica': ['1000', '1003', '1020', '9200', '9201'],
        'Incidência CP (Previdência)': ['11', '11', '11', '00', '00'],
        'Incidência FGTS': ['11', '11', '11', '00', '00'],
        'Incidência IRRF': ['11', '11', '11', '00', '00']
    }
    df = pd.DataFrame(data)
    with pd.ExcelWriter('/home/ubuntu/cognit/public/dp-templates/Rubricas_eSocial_FGTS_Digital.xlsx', engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Rubricas')
    print("Planilha de Rubricas criada.")

def create_simulacao_rescisao():
    # Estrutura básica para simulação
    data = {
        'Campo': [
            'Data de Admissão', 'Data de Demissão', 'Salário Base', 'Motivo',
            'Saldo de Salário (Dias)', 'Aviso Prévio (Dias)', '13º Proporcional',
            'Férias Proporcionais', 'Terço Constitucional', 'FGTS + Multa 40%'
        ],
        'Valor/Informação': [
            '01/01/2023', '15/06/2024', 3000.00, 'Pedido de Demissão',
            15, 30, '6/12', '5/12', 'Sim', 0.00
        ]
    }
    df = pd.DataFrame(data)
    with pd.ExcelWriter('/home/ubuntu/cognit/public/dp-templates/Simulacao_Rescisao.xlsx', engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Simulador')
    print("Planilha de Rescisão criada.")

if __name__ == "__main__":
    import os
    os.makedirs('/home/ubuntu/cognit/scripts', exist_ok=True)
    create_rubricas_esocial()
    create_simulacao_rescisao()
