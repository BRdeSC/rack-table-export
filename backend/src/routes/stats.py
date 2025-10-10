from flask import Blueprint, jsonify
import MySQLdb
from src.utils.database import db_connection

stats_bp = Blueprint('stats', __name__)

# Rota para buscar estatísticas
@stats_bp.route("/api/stats")
@db_connection
def get_stats(db):
    cursor = db.cursor(MySQLdb.cursors.DictCursor)
    
    stats = {}
    
    # Total de objetos
    cursor.execute("SELECT COUNT(*) as count FROM Object")
    stats['total_objects'] = cursor.fetchone()['count']
    
    # Total de racks
    cursor.execute("SELECT COUNT(*) as count FROM Rack")
    stats['total_racks'] = cursor.fetchone()['count']
    
    # Objetos por tipo
    cursor.execute("""
        SELECT objtype_id, COUNT(*) as count 
        FROM Object 
        GROUP BY objtype_id 
        ORDER BY count DESC
    """)
    stats['objects_by_type'] = cursor.fetchall()
    
    # Racks com mais objetos
    cursor.execute("""
        SELECT r.name, COUNT(rs.object_id) as object_count
        FROM Rack r
        LEFT JOIN RackSpace rs ON r.id = rs.rack_id
        GROUP BY r.id
        ORDER BY object_count DESC
        LIMIT 10
    """)
    stats['top_racks'] = cursor.fetchall()
    
    cursor.close()
    return jsonify(stats)