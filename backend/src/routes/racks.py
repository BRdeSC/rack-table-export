from flask import Blueprint, jsonify
import MySQLdb
from src.utils.database import db_connection
from src.utils.object_types import get_object_type_name

racks_bp = Blueprint('racks', __name__)

# Rota para lista de racks
@racks_bp.route("/api/racks")
@db_connection
def get_racks(db):
    cursor = db.cursor(MySQLdb.cursors.DictCursor)
    
    # Query otimizada para incluir slots vazios
    cursor.execute("""
        SELECT 
            r.id, 
            r.name, 
            r.height, 
            r.row_name,
            r.location_id, 
            r.location_name,
            r.asset_no, 
            r.comment,
            COUNT(DISTINCT rs.object_id) as object_count,
            (r.height - COUNT(DISTINCT rs.unit_no)) as empty_slots
        FROM Rack r
        LEFT JOIN RackSpace rs ON r.id = rs.rack_id
        GROUP BY r.id, r.name, r.height, r.row_name, r.location_id, 
                 r.location_name, r.asset_no, r.comment
        ORDER BY r.name
    """)
    
    data = cursor.fetchall()
    cursor.close()
    return jsonify(data)

# Rota para detalhes do rack
@racks_bp.route("/api/rack/<int:rack_id>")
@db_connection
def get_rack_detail(db, rack_id):
    cursor = db.cursor(MySQLdb.cursors.DictCursor)
    
    # Informações do rack
    cursor.execute("""
        SELECT id, name, height, row_name, 
               location_id, location_name, asset_no, comment
        FROM Rack 
        WHERE id = %s
    """, (rack_id,))
    
    rack = cursor.fetchone()
    
    if not rack:
        cursor.close()
        return jsonify({"error": "Rack não encontrado"}), 404
    
    # Busca objetos no rack usando RackSpace (apenas equipamentos)
    cursor.execute("""
        SELECT 
            o.id, o.name, o.objtype_id, o.asset_no,
            o.has_problems, o.comment,
            rs.unit_no, rs.atom, rs.state  -- rs.state existe, o.state não
        FROM RackSpace rs
        JOIN Object o ON rs.object_id = o.id
        WHERE rs.rack_id = %s 
        AND o.objtype_id NOT IN (1560, 1561, 1562)  -- Exclui infraestrutura
        ORDER BY rs.unit_no DESC
    """, (rack_id,))
    
    objects_data = cursor.fetchall()
    
    # Adicionar nome do tipo usando função importada
    processed_objects = []
    for obj in objects_data:
        processed_obj = dict(obj)
        processed_obj['objtype_name'] = get_object_type_name(obj['objtype_id'])
        processed_objects.append(processed_obj)
    
    cursor.close()
    
    return jsonify({
        'rack': rack,
        'objects': processed_objects
    })