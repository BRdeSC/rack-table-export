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
    
    cursor.execute("""
        SELECT 
            r.id, r.name, r.height, r.row_name,
            r.location_id, r.location_name,
            r.asset_no, r.comment,
            COUNT(DISTINCT rs.object_id) as object_count
        FROM Rack r
        LEFT JOIN RackSpace rs ON r.id = rs.rack_id
        GROUP BY r.id
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
    
    # Busca objetos no rack usando RackSpace
    cursor.execute("""
        SELECT 
            o.id, o.name, o.objtype_id, o.asset_no,
            o.has_problems, o.comment,
            rs.unit_no, rs.atom, rs.state
        FROM RackSpace rs
        JOIN Object o ON rs.object_id = o.id
        WHERE rs.rack_id = %s
        ORDER BY rs.unit_no DESC
    """, (rack_id,))
    
    objects_data = cursor.fetchall()
    
    # Adicionar nome do tipo a cada objeto
    objects = []
    for obj in objects_data:
        obj_with_type = dict(obj)  # Converte para dict mutável
        obj_with_type['objtype_name'] = get_object_type_name(obj['objtype_id'])
        objects.append(obj_with_type)
    
    cursor.close()
    
    return jsonify({
        'rack': rack,
        'objects': objects
    })