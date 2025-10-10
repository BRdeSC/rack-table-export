from flask import Blueprint, Response
import MySQLdb
from src.utils.database import db_connection
from src.utils.excel_utils import apply_excel_styles
from io import BytesIO
import openpyxl
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle
from reportlab.lib import colors

exports_bp = Blueprint('exports', __name__)

# Export Lista de RAcks 
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

    # for row in data:
    #     ws.append(row)
    #     for cell in ws[ws.max_row]:
    #         cell.alignment = Alignment(horizontal='center', vertical='center')

    buffer = BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    
    return Response(
        buffer.getvalue(),
        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment;filename=racks.xlsx"}
    )

# Export Lista de Equipamentos
@exports_bp.route("/api/objects/export/xlsx")
@db_connection
def export_all_objects_xlsx(db):
    cursor = db.cursor()
    cursor.execute("""
        SELECT 
            o.name, 
            GROUP_CONCAT(DISTINCT l.name) as location_names,
            GROUP_CONCAT(DISTINCT r.name) as rack_names,
            o.objtype_id, o.asset_no
        FROM Object o
        LEFT JOIN RackSpace rs ON o.id = rs.object_id
        LEFT JOIN Rack r ON rs.rack_id = r.id
        LEFT JOIN Location l ON r.location_id = l.id
        GROUP BY o.id
        ORDER BY o.name
    """)
    data = cursor.fetchall()

    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Equipamentos"
    
    title = "Relatório de todos os equipamentos"
    logo_path = "logo-coids.png"
    headers = ["Nome", "Localizacoes", "Racks", "Tipo", "Asset No."]
    apply_excel_styles(ws, title, headers, data, logo_path)
    
    # for row in data:
    #     ws.append(row)

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
    cursor = db.cursor()
    cursor.execute("""
        SELECT 
            o.name, 
            o.objtype_id,
            o.asset_no,
            r.name as rack_name,
            l.name as location_name,
            rs.unit_no
        FROM Object o
        JOIN AttributeValue av ON o.id = av.object_id
        JOIN Attribute a ON av.attr_id = a.id
        LEFT JOIN RackSpace rs ON o.id = rs.object_id
        LEFT JOIN Rack r ON rs.rack_id = r.id
        LEFT JOIN Location l ON r.location_id = l.id
        WHERE a.name = 'contact person' AND av.string_value = %s
        ORDER BY o.name
    """, (contact_name,))
    data = cursor.fetchall()

    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Equipamentos"
    
    title = f"Equipamentos do Responsável: {contact_name}"
    logo_path = "logo-coids.png"
    headers = ["Nome", "Tipo", "Asset No.", "Rack", "Localização", "Unidade"]
    apply_excel_styles(ws, title, headers, data, logo_path)

    buffer = BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    
    return Response(
        buffer.getvalue(),
        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment;filename=equipamentos_{contact_name}.xlsx"}
    )

#****************************************

# Exportar pdf
# Lista de equipamentos 
@exports_bp.route("/api/objects/rack/<int:rack_id>/export/pdf")
@db_connection
def export_rack_objects_pdf(db, rack_id):
    cursor = db.cursor()
    
    # Nome do rack
    cursor.execute("SELECT name FROM Rack WHERE id = %s", (rack_id,))
    rack_name = cursor.fetchone()[0]
    
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
    
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    
    # Criar a tabela de dados
    table_data = [["ID", "Nome", "Tipo", "Asset No.", "Unidade"]]
    for row in data:
        table_data.append(list(row))

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
