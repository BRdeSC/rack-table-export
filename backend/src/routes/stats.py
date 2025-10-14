from flask import Blueprint, jsonify
import MySQLdb
from src.utils.database import db_connection
from src.utils.object_types import get_object_type_name

stats_bp = Blueprint('stats', __name__)

# Rota para buscar estatísticas
@stats_bp.route("/api/stats")
@db_connection
def get_stats(db):
    cursor = db.cursor(MySQLdb.cursors.DictCursor)
    
    stats = {}
    
    # Total de objetos (equipamentos)
    cursor.execute("""
        SELECT COUNT(*) as count 
        FROM Object 
        WHERE objtype_id NOT IN (1560, 1561, 1562)  -- Exclui racks, fileiras, locais
    """)
    stats['total_equipments'] = cursor.fetchone()['count']
    
    # Total de racks
    cursor.execute("SELECT COUNT(*) as count FROM Rack")
    stats['total_racks'] = cursor.fetchone()['count']
    
    # Objetos por tipo
    cursor.execute("""
        SELECT objtype_id, COUNT(*) as count 
        FROM Object 
        WHERE objtype_id NOT IN (1560, 1561, 1562)  -- Exclui infraestrutura
        GROUP BY objtype_id 
        ORDER BY count DESC
    """)
    objects_by_type = cursor.fetchall()

    # Adicionar nomes aos tipos usando a função importada
    for item in objects_by_type:
        item['objtype_name'] = get_object_type_name(item['objtype_id'])
    
    stats['objects_by_type'] = objects_by_type
    
    # Racks com mais objetos (equipamentos)
    cursor.execute("""
        SELECT 
            r.name, 
            r.location_name,
            COUNT(DISTINCT rs.object_id) as equipment_count
        FROM Rack r
        LEFT JOIN RackSpace rs ON r.id = rs.rack_id
        LEFT JOIN Object o ON rs.object_id = o.id AND o.objtype_id NOT IN (1560, 1561, 1562)
        GROUP BY r.id
        HAVING equipment_count > 0
        ORDER BY equipment_count DESC
        LIMIT 10
    """)
    stats['top_racks'] = cursor.fetchall()

    # Equipamentos por localização (apenas equipamentos)
    cursor.execute("""
        SELECT 
            l.name as location_name,
            COUNT(DISTINCT o.id) as equipment_count
        FROM Object o
        JOIN RackSpace rs ON o.id = rs.object_id
        JOIN Rack r ON rs.rack_id = r.id
        JOIN Location l ON r.location_id = l.id
        WHERE o.objtype_id NOT IN (1560, 1561, 1562)
        GROUP BY l.name
        ORDER BY equipment_count DESC
    """)
    stats['equipments_by_location'] = cursor.fetchall()

    # Estatísticas de problemas
    cursor.execute("""
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN has_problems = 'yes' THEN 1 ELSE 0 END) as with_problems,
            SUM(CASE WHEN has_problems = 'no' THEN 1 ELSE 0 END) as without_problems
        FROM Object 
        WHERE objtype_id NOT IN (1560, 1561, 1562)
    """)
    problems_stats = cursor.fetchone()
    stats['problems'] = problems_stats
    
    cursor.close()
    return jsonify(stats)