from flask import Blueprint, jsonify
import MySQLdb
import html
from src.utils.database import db_connection
from src.utils.object_types import get_object_type_name

def decode_html_entities(text):
    """Decodifica entidades HTML como &gt;, &lt;, &amp;, etc."""
    if not text or not isinstance(text, str):
        return text
    return html.unescape(text)

# Cache global para HW types (evita múltiplas queries ao banco)
_hw_type_cache = None
_sw_type_cache = None

def get_hw_type_map(db):
    """Busca todos os HW types do banco com cache"""
    global _hw_type_cache
    
    # Se já temos cache, retorna
    if _hw_type_cache is not None:
        return _hw_type_cache
    
    cursor = db.cursor(MySQLdb.cursors.DictCursor)
    
    # Buscar todos os HW types do Dictionary (chapter 11 = server models)
    cursor.execute("""
        SELECT dict_key, dict_value 
        FROM Dictionary 
        WHERE chapter_id = 11
        ORDER BY dict_key
    """)
    
    hw_types = cursor.fetchall()
    cursor.close()
    
    # Criar mapeamento limpando o formato %GPASS%
    hw_type_map = {}
    for hw_type in hw_types:
        clean_value = hw_type['dict_value'].replace('%GPASS%', ' ')
        hw_type_map[str(hw_type['dict_key'])] = clean_value
    
    print(f"HW Types carregados: {len(hw_type_map)} modelos")
    _hw_type_cache = hw_type_map
    
    return hw_type_map

objects_bp = Blueprint('objects', __name__)


def get_sw_type_map(db):
    """Busca todos os SW types do banco com cache - chapter_id 13"""
    global _sw_type_cache
    
    if _sw_type_cache is not None:
        return _sw_type_cache
    
    cursor = db.cursor(MySQLdb.cursors.DictCursor)
    
    # Buscar todos os SW types do Dictionary - chapter_id 13
    cursor.execute("""
        SELECT dict_key, dict_value 
        FROM Dictionary 
        WHERE chapter_id = 13
        ORDER BY dict_key
    """)
    
    sw_types = cursor.fetchall()
    cursor.close()
    
    # Criar mapeamento limpando o formato %GSKIP%
    sw_type_map = {}
    for sw_type in sw_types:
        original_value = sw_type['dict_value']
        
        # Processar o formato: 'Xen Hypervisor%GSKIP%XenServer 7.0'
        if '%GSKIP%' in original_value:
            clean_value = original_value.split('%GSKIP%')[-1]
        else:
            clean_value = original_value
        
        sw_type_map[str(sw_type['dict_key'])] = clean_value
    
    print(f"SW Types carregados: {len(sw_type_map)} modelos")
    _sw_type_cache = sw_type_map
    
    return sw_type_map


# Rota para objetos
@objects_bp.route("/api/objects")
@db_connection
def get_objects(db):
    cursor = db.cursor(MySQLdb.cursors.DictCursor)
    
    cursor.execute("""
        SELECT 
            o.id, o.name, o.objtype_id, o.asset_no,
            o.has_problems, o.comment,
            GROUP_CONCAT(DISTINCT r.name) as rack_names,
            GROUP_CONCAT(DISTINCT l.name) as location_names
        FROM Object o
        LEFT JOIN RackSpace rs ON o.id = rs.object_id
        LEFT JOIN Rack r ON rs.rack_id = r.id
        LEFT JOIN Location l ON r.location_id = l.id
        WHERE o.objtype_id NOT IN (1560, 1561, 1562) 
        GROUP BY o.id
        ORDER BY o.name 
    """)
    
    data = cursor.fetchall()
    
    # Adicionar nome do tipo a cada objeto
    for obj in data:
        obj['objtype_name'] = get_object_type_name(obj['objtype_id'])
    
    cursor.close()
    return jsonify(data)

@objects_bp.route("/api/objects/count")
@db_connection
def get_objects_count(db):
    cursor = db.cursor()
    
    cursor.execute("""
        SELECT COUNT(DISTINCT o.id) as unique_equipments_count
        FROM Object o
        WHERE o.objtype_id NOT IN (1560, 1561, 1562)
    """)
    
    count = cursor.fetchone()[0]
    cursor.close()
    return jsonify({"unique_equipments_count": count})


# Rota para detalhes do objeto
@objects_bp.route("/api/object/<int:object_id>")
@db_connection
def get_object_detail(db, object_id):
    cursor = db.cursor(MySQLdb.cursors.DictCursor)
    
    # Buscar mapeamento de HW types do banco
    hw_type_map = get_hw_type_map(db)
    
    # Informações básicas do objeto
    cursor.execute("""
        SELECT id, name, label, objtype_id, asset_no, 
               has_problems, comment
        FROM Object 
        WHERE id = %s
    """, (object_id,))
    
    obj = cursor.fetchone()
    
    if not obj:
        cursor.close()
        return jsonify({"error": "Objeto não encontrado"}), 404
    
    # Adicionar nome do tipo
    obj['objtype_name'] = get_object_type_name(obj['objtype_id'])
    
    # Informações do rack
    cursor.execute("""
        SELECT 
            r.id as rack_id, 
            r.name as rack_name, 
            rs.unit_no,
            rs.atom,
            rs.state
        FROM RackSpace rs
        JOIN Rack r ON rs.rack_id = r.id
        WHERE rs.object_id = %s
    """, (object_id,))
    
    rack_info = cursor.fetchone()
    
    # Atributos do objeto
    cursor.execute("""
        SELECT 
            a.name as attribute_name, 
            a.type as attribute_type,
            COALESCE(av.string_value, av.uint_value, av.float_value) as attribute_value
        FROM AttributeValue av 
        JOIN Attribute a ON av.attr_id = a.id 
        WHERE av.object_id = %s
    """, (object_id,))
    
    attributes = cursor.fetchall()

    # Processar atributos específicos
    processed_attributes = []
    for attr in attributes:
        # Format support contract expiration
        if attr['attribute_name'] == 'support contract expiration' and attr['attribute_value']:
            try:
                from datetime import datetime, timezone
                dt = datetime.fromtimestamp(int(attr['attribute_value']), tz=timezone.utc)
                attr['attribute_value'] = dt.strftime('%Y-%m-%d') 
            except:
                pass
        
        # Format HW warranty expiration
        elif attr['attribute_name'] == 'HW warranty expiration' and attr['attribute_value']:
            try:
                from datetime import datetime, timezone
                dt = datetime.fromtimestamp(int(attr['attribute_value']), tz=timezone.utc)
                attr['attribute_value'] = dt.strftime('%Y-%m-%d') 
            except:
                pass
        
        # Mapear HW type
        elif attr['attribute_name'] == 'HW type' and attr['attribute_value']:
            hw_type_map = get_hw_type_map(db)
            original_value = attr['attribute_value']
            mapped_value = hw_type_map.get(original_value, f"HW Type {original_value}")
            attr['attribute_value'] = mapped_value

        # Mapear SW type (NOVO) - seguindo o mesmo padrão
        elif attr['attribute_name'] == 'SW type' and attr['attribute_value']:
            sw_type_map = get_sw_type_map(db)
            original_value = attr['attribute_value']
            mapped_value = sw_type_map.get(original_value, f"SW Type {original_value}")
            attr['attribute_value'] = mapped_value
        
        # Mapear Hypervisor (NOVO)
        elif attr['attribute_name'] == 'Hypervisor' and attr['attribute_value']:
            hypervisor_map = {
                '1501': 'Sim',
                '1502': 'Não',
                # Podemos adicionar mais conforme necessário
            }
            original_value = attr['attribute_value']
            mapped_value = hypervisor_map.get(original_value, f"Hypervisor {original_value}")
            attr['attribute_value'] = mapped_value

        processed_attributes.append(attr)
    
    # Portas de rede
    ports = []
    try:
        cursor.execute("""
            SELECT 
                name as port_name,
                type as port_type,
                label as port_label
            FROM Port 
            WHERE object_id = %s
            ORDER BY name
        """, (object_id,))
        ports = cursor.fetchall()
    except MySQLdb.Error:
        pass
    
        cursor.close()
    
    # Decodificar entidades HTML no comentário se existir
    if obj.get('comment'):
        obj['comment'] = decode_html_entities(obj['comment'])
    
    return jsonify({
        'object': obj,
        'rack': rack_info,
        'attributes': processed_attributes,
        'ports': ports
    })

# Rota para buscar objetos por tipo
@objects_bp.route("/api/objects/type/<int:objtype_id>")
@db_connection
def get_objects_by_type(db, objtype_id):
    cursor = db.cursor(MySQLdb.cursors.DictCursor)
    
    cursor.execute("""
        SELECT 
            o.id, o.name, o.objtype_id, o.asset_no,
            r.name as rack_name,
            rs.unit_no as rack_unit,
            l.name as location_name
        FROM Object o
        LEFT JOIN RackSpace rs ON o.id = rs.object_id
        LEFT JOIN Rack r ON rs.rack_id = r.id
        LEFT JOIN Location l ON r.location_id = l.id
        WHERE o.objtype_id = %s
        ORDER BY o.name
    """, (objtype_id,))
    
    data = cursor.fetchall()
    
    # Adicionar nome do tipo
    type_name = get_object_type_name(objtype_id)
    for obj in data:
        obj['objtype_name'] = type_name
    
    cursor.close()
    return jsonify(data)

# Rota para listar todos os tipos disponíveis (OPCIONAL - útil para frontend)
@objects_bp.route("/api/object-types")
@db_connection
def get_object_types(db):
    cursor = db.cursor(MySQLdb.cursors.DictCursor)
    
    cursor.execute("""
        SELECT DISTINCT objtype_id
        FROM Object 
        ORDER BY objtype_id
    """)
    
    types_data = cursor.fetchall()
    
    # Adicionar nomes aos tipos
    for type_item in types_data:
        type_item['objtype_name'] = get_object_type_name(type_item['objtype_id'])
    
    cursor.close()
    return jsonify(types_data)