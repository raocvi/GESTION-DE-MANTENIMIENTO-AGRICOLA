import zipfile
import xml.etree.ElementTree as ET
import os
import json

excel_path = r"c:\Users\raulo\OneDrive\Escritorio\ANTIGRAVITY\PLAN DE MANTENIMIENTO\ANEXOS\Plan_Mantenimiento_CaseIH_A9900.xlsx"

def read_xlsx(filepath):
    """Lee un archivo xlsx sin dependencias externas"""
    with zipfile.ZipFile(filepath, 'r') as z:
        # Leer string compartidos
        shared_strings = []
        if 'xl/sharedStrings.xml' in z.namelist():
            with z.open('xl/sharedStrings.xml') as f:
                tree = ET.parse(f)
                root = tree.getroot()
                ns = {'ns': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
                for si in root.findall('.//ns:si', ns):
                    text_parts = []
                    for t in si.findall('.//ns:t', ns):
                        if t.text:
                            text_parts.append(t.text)
                    shared_strings.append(''.join(text_parts))
        
        # Leer workbook para obtener nombres de hojas
        with z.open('xl/workbook.xml') as f:
            tree = ET.parse(f)
            root = tree.getroot()
            ns = {'ns': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
                  'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
            sheets = []
            for sheet in root.findall('.//ns:sheet', ns):
                sheets.append({'name': sheet.get('name'), 'id': sheet.get('sheetId')})
        
        print(f"=== ARCHIVO EXCEL: {os.path.basename(filepath)} ===")
        print(f"Hojas encontradas: {len(sheets)}")
        for s in sheets:
            print(f"  - Hoja {s['id']}: {s['name']}")
        print()
        
        # Leer cada hoja
        for sheet_idx, sheet_info in enumerate(sheets):
            sheet_file = f'xl/worksheets/sheet{sheet_idx+1}.xml'
            if sheet_file not in z.namelist():
                continue
                
            print(f"\n{'='*70}")
            print(f"HOJA: {sheet_info['name']}")
            print(f"{'='*70}")
            
            with z.open(sheet_file) as f:
                tree = ET.parse(f)
                root = tree.getroot()
                ns = {'ns': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
                
                rows_data = {}
                max_row = 0
                max_col = 0
                
                for row in root.findall('.//ns:row', ns):
                    row_num = int(row.get('r', 0))
                    max_row = max(max_row, row_num)
                    rows_data[row_num] = {}
                    
                    for cell in row.findall('ns:c', ns):
                        cell_ref = cell.get('r', '')
                        cell_type = cell.get('t', '')
                        col_letters = ''.join(filter(str.isalpha, cell_ref))
                        
                        # Convertir letra a número
                        col_num = 0
                        for ch in col_letters:
                            col_num = col_num * 26 + (ord(ch.upper()) - ord('A') + 1)
                        max_col = max(max_col, col_num)
                        
                        v = cell.find('ns:v', ns)
                        value = None
                        if v is not None and v.text:
                            if cell_type == 's':  # shared string
                                try:
                                    value = shared_strings[int(v.text)]
                                except:
                                    value = v.text
                            elif cell_type == 'b':
                                value = bool(int(v.text))
                            else:
                                try:
                                    float_val = float(v.text)
                                    value = int(float_val) if float_val.is_integer() else float_val
                                except:
                                    value = v.text
                        
                        if value is not None:
                            rows_data[row_num][col_num] = value
                
                print(f"Dimensiones: {max_row} filas x {max_col} columnas")
                print(f"\nPrimeras 20 filas con datos:")
                
                count = 0
                for row_num in sorted(rows_data.keys()):
                    if count >= 20:
                        break
                    row = rows_data[row_num]
                    if row:
                        cells_str = " | ".join([f"C{col}={repr(val)}" for col, val in sorted(row.items())])
                        print(f"  Fila {row_num}: {cells_str}")
                        count += 1
                
                if max_row > 20:
                    print(f"  ... y {max_row - 20} filas más")

read_xlsx(excel_path)
