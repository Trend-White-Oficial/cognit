import pandas as pd

def create_horas_noturnas():
    data = {
        'Data': ['01/06/2024', '02/06/2024'],
        'Início Noturno': ['22:00', '22:00'],
        'Fim Noturno': ['05:00', '06:00'],
        'Horas Relógio': ['07:00', '08:00'],
        'Horas Reduzidas (52:30)': ['08:00', '09:08'],
        'Adicional Noturno (20%)': ['R$ 40,00', 'R$ 45,66']
    }
    df = pd.DataFrame(data)
    with pd.ExcelWriter('/home/ubuntu/cognit/public/dp-templates/Planilha_Horas_Noturnas.xlsx', engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Horas Noturnas')
    print("Planilha de Horas Noturnas criada.")

if __name__ == "__main__":
    create_horas_noturnas()
