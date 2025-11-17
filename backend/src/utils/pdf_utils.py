# utils/pdf_utils.py
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.units import inch
from reportlab.lib import colors
from io import BytesIO
import os

# Cores baseadas no seu Excel (azul corporativo)
HEADER_COLOR = colors.HexColor("#0077BA")  # Mesmo azul do Excel
WHITE = colors.white
BLACK = colors.black
LIGHT_GREY = colors.HexColor("#F5F5F5")  # Para linhas alternadas

def apply_pdf_styles(doc, title_text, headers, data, logo_path=None):
    """
    Aplica estilos consistentes com o Excel utils
    """
    elements = []
    styles = getSampleStyleSheet()
    
    # Estilos customizados baseados no Excel
    title_style = ParagraphStyle(
        'ExcelTitle',
        parent=styles['Heading1'],
        fontSize=18,
        textColor=HEADER_COLOR,
        alignment=1,  # center
        spaceAfter=20,
        fontName='Helvetica-Bold'
    )
    
    header_style = ParagraphStyle(
        'ExcelHeader', 
        parent=styles['Normal'],
        fontSize=10,
        textColor=WHITE,
        fontName='Helvetica-Bold',
        alignment=1  # center
    )
    
    cell_style = ParagraphStyle(
        'ExcelCell',
        parent=styles['Normal'],
        fontSize=9,
        fontName='Helvetica',
        alignment=0  # left
    )
    
    # Logo (se existir)
    if logo_path and os.path.exists(logo_path):
        try:
            logo = Image(logo_path)
            logo.drawHeight = 0.7 * inch
            logo.drawWidth = 0.6 * inch
            # Posicionar logo - precisaríamos de layout mais complexo
        except:
            logo_path = None
    
    # Título principal (mesmo estilo do Excel)
    title = Paragraph(title_text, title_style)
    elements.append(title)
    elements.append(Spacer(1, 0.2*inch))
    
    # Preparar dados da tabela
    table_data = []
    
    # Cabeçalho (mesmo estilo do Excel)
    header_row = []
    for header in headers:
        header_row.append(Paragraph(str(header), header_style))
    table_data.append(header_row)
    
    # Dados (mesmo estilo do Excel)
    for row in data:
        data_row = []
        for cell in row:
            data_row.append(Paragraph(str(cell), cell_style))
        table_data.append(data_row)
    
    # Criar tabela com estilos consistentes
    col_widths = [doc.width / len(headers)] * len(headers)
    
    table = Table(table_data, colWidths=col_widths, repeatRows=1)
    
    # Estilo da tabela (replicando Excel)
    table_style = TableStyle([
        # Cabeçalho - azul igual ao Excel
        ('BACKGROUND', (0, 0), (-1, 0), HEADER_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
        ('VALIGN', (0, 0), (-1, 0), 'MIDDLE'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        
        # Bordas de todas as células
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('ALIGN', (0, 1), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 1), (-1, -1), 'MIDDLE'),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        
        # Linhas alternadas (opcional - como no Excel)
        #('ROWBACKGROUNDS', (0, 1), (-1, -1), [LIGHT_GREY, WHITE]),
    ])
    
    table.setStyle(table_style)
    elements.append(table)
    
    return elements

def create_pdf_document(title_text, headers, data, logo_path=None):
    """
    Cria um documento PDF completo com estilos consistentes
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer, 
        pagesize=A4,
        topMargin=0.5*inch,
        bottomMargin=0.5*inch,
        leftMargin=0.5*inch, 
        rightMargin=0.5*inch
    )
    
    elements = apply_pdf_styles(doc, title_text, headers, data, logo_path)
    doc.build(elements)
    buffer.seek(0)
    
    return buffer