from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.units import inch
from reportlab.lib import colors
from io import BytesIO
import os
from datetime import datetime

# Cores baseadas no seu Excel (azul corporativo)
HEADER_COLOR = colors.HexColor("#0077BA")  # Mesmo azul do Excel
WHITE = colors.white
BLACK = colors.black
LIGHT_GREY = colors.HexColor("#F5F5F5")  # Para linhas alternadas
BACKGROUND_GREY = colors.HexColor("#ecf0f1")  # Para células de label

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


def get_pdf_styles():
    """Retorna os estilos padrão para PDFs de fichas técnicas"""
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'Title',
        parent=styles['Heading1'],
        fontSize=16,
        textColor=HEADER_COLOR,
        alignment=1,  # center
        spaceAfter=20,
        fontName='Helvetica-Bold'
    )
    
    heading_style = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontSize=12,
        spaceAfter=12,
        spaceBefore=20,
        textColor=colors.HexColor("#34495e"),
        fontName='Helvetica-Bold'
    )
    
    footer_style = ParagraphStyle(
        'Footer', 
        fontSize=8, 
        textColor=colors.grey, 
        alignment=1
    )
    
    normal_style = styles['Normal']
    
    return {
        'title': title_style,
        'heading': heading_style,
        'footer': footer_style,
        'normal': normal_style
    }

def create_basic_info_table(obj, rack_info):
    """Cria tabela de informações básicas no estilo padrão"""
    basic_data = [
        ['Nome do Equipamento:', obj.get('name', 'N/A')],
        ['Tipo:', obj.get('objtype_name', 'N/A')],
        ['Label Visível:', obj.get('label', 'N/A')],
        ['Asset Tag:', obj.get('asset_no', 'N/A')],
        ['Tem Problemas:', 'Sim' if obj.get('has_problems') else 'Não'],
    ]
    
    if rack_info:
        basic_data.extend([
            ['Rack:', rack_info.get('rack_name', 'N/A')],
            ['Unit No:', rack_info.get('unit_no', 'N/A')],
            ['Localização:', rack_info.get('location_name', 'N/A')]
        ])
    
    basic_table = Table(basic_data, colWidths=[2*inch, 4*inch])
    basic_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BACKGROUND', (0, 0), (0, -1), BACKGROUND_GREY),
        ('TEXTCOLOR', (0, 0), (-1, -1), BLACK),
        ('ALIGN', (0, 0), (0, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey),
    ]))
    
    return basic_table

def create_attributes_table(attributes):
    """Cria tabela de atributos no estilo padrão"""
    if not attributes:
        return None
        
    attr_data = [['Atributo', 'Valor']]
    for attr in attributes:
        value = str(attr.get('attribute_value', ''))[:100] + ('...' if len(str(attr.get('attribute_value', ''))) > 100 else '')
        attr_data.append([attr.get('attribute_name', ''), value])
    
    attr_table = Table(attr_data, colWidths=[2.5*inch, 3.5*inch])
    attr_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('BACKGROUND', (0, 0), (-1, 0), HEADER_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('BACKGROUND', (0, 1), (-1, -1), WHITE),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ]))
    
    return attr_table

def create_network_ports_table(ports):
    """Cria tabela de portas de rede no estilo padrão - formato API"""
    if not ports:
        return None
        
    ports_data = [['Local name', 'Visible label', 'Interface', 'L2 address', 'Remote object and port', 'Cable ID']]
    
    for port in ports:
        ports_data.append([
            port.get('port_name', ''),
            port.get('port_label', ''),
            port.get('interface_name', 'N/A'),
            port.get('l2_address', 'N/A'),
            '',  # Remote object and port
            ''   # Cable ID
        ])
    
    ports_table = Table(ports_data, colWidths=[0.9*inch, 0.8*inch, 0.9*inch, 1*inch, 1.5*inch, 1*inch])
    ports_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('BACKGROUND', (0, 0), (-1, 0), HEADER_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('BACKGROUND', (0, 1), (-1, -1), WHITE),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ]))
    
    return ports_table

def create_comment_section(comment, styles):
    """Cria seção de comentários"""
    if not comment:
        return None
        
    elements = []
    elements.append(Paragraph("COMENTÁRIOS", styles['heading']))
    
    # Processar comentário
    if len(comment) > 500:
        comment = comment[:500] + "... [texto truncado]"
    comment_para = Paragraph(comment.replace('\n', '<br/>'), styles['normal'])
    elements.append(comment_para)
    
    return elements

def create_ficha_tecnica_pdf():
    """Cria um documento PDF padrão para fichas técnicas"""
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer, 
        pagesize=A4,
        topMargin=0.5*inch,
        bottomMargin=0.5*inch,
        leftMargin=0.5*inch, 
        rightMargin=0.5*inch
    )
    return buffer, doc