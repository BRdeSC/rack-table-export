from flask import Blueprint, jsonify
import MySQLdb
from src.utils.database import db_connection
from src.utils.object_types import get_object_type_name

objects_bp = Blueprint('objects', __name__)

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
    
    # Portas de rede (se existirem)
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
    
    return jsonify({
        'object': obj,
        'rack': rack_info,
        'attributes': attributes,
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