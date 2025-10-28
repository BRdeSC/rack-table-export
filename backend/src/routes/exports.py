from flask import Blueprint, Response, request
import MySQLdb
from src.utils.database import db_connection
from src.utils.excel_utils import apply_excel_styles
from src.utils.object_types import get_object_type_name  # Importar a função
from io import BytesIO
import openpyxl
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle
from reportlab.lib import colors

exports_bp = Blueprint('exports', __name__)

# Export Lista de Racks 
@exports_bp.route("/api/racks/export/xlsx")
@db_connection
def export_racks_xlsx(db):
    cursor = db.cursor()
    cursor.execute("""
        SELECT 
            r.name, r.location_name, r.row_name, 
            r.height,
            COUNT(DISTINCT rs.object_id) as object_count
        FROM Rack r
        LEFT JOIN RackSpace rs ON r.id = rs.rack_id
        GROUP BY r.id
        ORDER BY r.name
    """)
    data = cursor.fetchall()

    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Racks"

    title = "Relatório de Racks"
    logo_path = "logo-coids.png" 
    headers = ["Rack", "Localizacao", "Linha", "Altura", "Equipamentos"]
    apply_excel_styles(ws, title, headers, data, logo_path)

    buffer = BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    
    return Response(
        buffer.getvalue(),
        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment;filename=racks.xlsx"}
    )


# Export Lista de Equipamentos (ATUALIZADA COM objtype_name)
@exports_bp.route("/api/objects/export/xlsx")
@db_connection
def export_all_objects_xlsx(db):
    cursor = db.cursor(MySQLdb.cursors.DictCursor)  # Mudar para DictCursor
    cursor.execute("""
        SELECT 
            o.id,
            o.name, 
            GROUP_CONCAT(DISTINCT l.name) as location_names,
            GROUP_CONCAT(DISTINCT r.name) as rack_names,
            o.objtype_id, 
            o.asset_no
        FROM Object o
        LEFT JOIN RackSpace rs ON o.id = rs.object_id
        LEFT JOIN Rack r ON rs.rack_id = r.id
        LEFT JOIN Location l ON r.location_id = l.id
        WHERE o.objtype_id NOT IN (1560, 1561, 1562)
        GROUP BY o.id
        ORDER BY o.name
    """)
    data = cursor.fetchall()

    # Processar dados para incluir objtype_name
    processed_data = []
    for row in data:
        objtype_name = get_object_type_name(row['objtype_id'])
        processed_row = (
            row['name'],
            row['location_names'] or 'N/A',
            row['rack_names'] or 'N/A',
            objtype_name,  # Usar nome do tipo em vez do ID
            row['asset_no'] or 'N/A'
        )
        processed_data.append(processed_row)

    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Equipamentos"
    
    title = "Relatório de todos os equipamentos"
    logo_path = "logo-coids.png"
    headers = ["Nome", "Localizacoes", "Racks", "Tipo", "Asset No."]
    apply_excel_styles(ws, title, headers, processed_data, logo_path)

    buffer = BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    
    return Response(
        buffer.getvalue(),
        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment;filename=equipamentos.xlsx"}
    )


# Export Lista de responsáveis
@exports_bp.route("/api/contacts/export/xlsx")
@db_connection
def export_all_contacts_xlsx(db):
    cursor = db.cursor()
    cursor.execute("""
        SELECT 
            DISTINCT av.string_value AS contact_name,
            COUNT(DISTINCT o.id) AS equipment_count
        FROM 
            AttributeValue av
        JOIN
            Attribute a ON av.attr_id = a.id
        JOIN
            Object o ON av.object_id = o.id
        WHERE
            a.name = 'contact person'
        GROUP BY 
            av.string_value
        ORDER BY 
            contact_name
    """)
    data = cursor.fetchall()

    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Responsaveis"
    
    title = "Relatório de Responsáveis"
    logo_path = "logo-coids.png"
    headers = ["Responsável", "Quantidade de Equipamentos"]
    apply_excel_styles(ws, title, headers, data, logo_path)

    buffer = BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    
    return Response(
        buffer.getvalue(),
        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment;filename=responsaveis.xlsx"}
    )


# Export Lista de Equipamentos por Responsável 
@exports_bp.route("/api/contacts/<string:contact_name>/export/xlsx")
@db_connection
def export_contact_equipment_xlsx(db, contact_name):
    cursor = db.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute("""
        SELECT 
            o.id,
            o.name, 
            o.objtype_id,
            o.asset_no,
            GROUP_CONCAT(DISTINCT r.name) as rack_names,
            GROUP_CONCAT(DISTINCT l.name) as location_names,
            GROUP_CONCAT(DISTINCT rs.unit_no) as unit_nos
        FROM Object o
        JOIN AttributeValue av ON o.id = av.object_id
        JOIN Attribute a ON av.attr_id = a.id
        LEFT JOIN RackSpace rs ON o.id = rs.object_id
        LEFT JOIN Rack r ON rs.rack_id = r.id
        LEFT JOIN Location l ON r.location_id = l.id
        WHERE a.name = 'contact person' 
          AND av.string_value = %s
          AND o.objtype_id NOT IN (1560, 1561, 1562)
        GROUP BY o.id  -- ADICIONAR GROUP BY PARA EVITAR DUPLICATAS
        ORDER BY o.name
    """, (contact_name,))
    data = cursor.fetchall()

    # Processar dados para incluir objtype_name
    processed_data = []
    for row in data:
        objtype_name = get_object_type_name(row['objtype_id'])
        processed_row = (
            row['name'],
            objtype_name,
            row['asset_no'] or 'N/A',
            row['rack_names'] or 'N/A',
            row['location_names'] or 'N/A',
            row['unit_nos'] or 'N/A'
        )
        processed_data.append(processed_row)

    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Equipamentos"
    
    title = f"Equipamentos do Responsável: {contact_name}"
    logo_path = "logo-coids.png"
    headers = ["Nome", "Tipo", "Asset No.", "Racks", "Localizações", "Unidades"]
    apply_excel_styles(ws, title, headers, processed_data, logo_path)

    buffer = BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    
    return Response(
        buffer.getvalue(),
        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment;filename=equipamentos_{contact_name}.xlsx"}
    )



# Export Lista de Equipamentos Filtrados por Tipo
@exports_bp.route("/api/search/equipments/export/xlsx")
@db_connection
def export_equipments_filtered_xlsx(db):
    cursor = db.cursor(MySQLdb.cursors.DictCursor)
    
    # Obter parâmetros de filtro
    objtype_id = request.args.get('type_id', '')
    
    # Construir query base
    query = """
        SELECT 
            o.id,
            o.name, 
            GROUP_CONCAT(DISTINCT l.name) as location_names,
            GROUP_CONCAT(DISTINCT r.name) as rack_names,
            o.objtype_id, 
            o.asset_no
        FROM Object o
        LEFT JOIN RackSpace rs ON o.id = rs.object_id
        LEFT JOIN Rack r ON rs.rack_id = r.id
        LEFT JOIN Location l ON r.location_id = l.id
        WHERE o.objtype_id NOT IN (1560, 1561, 1562)
    """
    
    params = []
    
    # Aplicar filtro de tipo se fornecido
    if objtype_id:
        query += " AND o.objtype_id = %s"
        params.append(objtype_id)
    
    query += " GROUP BY o.id ORDER BY o.name"
    
    cursor.execute(query, params)
    data = cursor.fetchall()

    # Processar dados para incluir objtype_name
    processed_data = []
    for row in data:
        objtype_name = get_object_type_name(row['objtype_id'])
        processed_row = (
            row['name'],
            row['location_names'] or 'N/A',
            row['rack_names'] or 'N/A',
            objtype_name,
            row['asset_no'] or 'N/A'
        )
        processed_data.append(processed_row)

    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Equipamentos"
    
    # Definir título baseado no filtro
    if objtype_id:
        type_name = get_object_type_name(int(objtype_id))
        title = f"Relatório de Equipamentos - {type_name}"
        filename = f"equipamentos_{type_name.lower().replace(' ', '_')}.xlsx"
    else:
        title = "Relatório de todos os equipamentos"
        filename = "equipamentos.xlsx"
    
    logo_path = "logo-coids.png"
    headers = ["Nome", "Localizacoes", "Racks", "Tipo", "Asset No."]
    apply_excel_styles(ws, title, headers, processed_data, logo_path)

    buffer = BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    
    return Response(
        buffer.getvalue(),
        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment;filename={filename}"}
    )


# Exportar PDF - Lista de equipamentos por rack
@exports_bp.route("/api/objects/rack/<int:rack_id>/export/pdf")
@db_connection
def export_rack_objects_pdf(db, rack_id):
    cursor = db.cursor(MySQLdb.cursors.DictCursor)  # Mudar para DictCursor
    
    # Nome do rack
    cursor.execute("SELECT name FROM Rack WHERE id = %s", (rack_id,))
    rack_result = cursor.fetchone()
    rack_name = rack_result['name'] if rack_result else f"Rack_{rack_id}"
    
    # Dados dos equipamentos
    cursor.execute("""
        SELECT 
            o.id, o.name, o.objtype_id, o.asset_no,
            rs.unit_no
        FROM RackSpace rs
        JOIN Object o ON rs.object_id = o.id
        WHERE rs.rack_id = %s
        ORDER BY rs.unit_no DESC
    """, (rack_id,))
    data = cursor.fetchall()
    
    # Processar dados para incluir objtype_name
    processed_data = []
    for row in data:
        objtype_name = get_object_type_name(row['objtype_id'])
        processed_data.append([
            row['id'],
            row['name'],
            objtype_name,  # Usar nome do tipo
            row['asset_no'] or 'N/A',
            row['unit_no'] or 'N/A'
        ])
    
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    
    # Criar a tabela de dados
    table_data = [["ID", "Nome", "Tipo", "Asset No.", "Unidade"]]
    table_data.extend(processed_data)

    table = Table(table_data)
    
    # Estilo da tabela
    style = TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('BOX', (0, 0), (-1, -1), 1, colors.black),
    ])
    table.setStyle(style)
    
    story = [table]
    doc.build(story)
    
    buffer.seek(0)
    
    return Response(
        buffer.getvalue(),
        mimetype="application/pdf",
        headers={"Content-Disposition": f"attachment;filename={rack_name}_equipamentos.pdf"}
    )