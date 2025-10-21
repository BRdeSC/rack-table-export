from flask import Blueprint, request, jsonify
from ..utils.database import db_connection
import MySQLdb
import hashlib

search_bp = Blueprint('search', __name__)

@search_bp.route("/api/search/global")
@db_connection
def global_search(db):
    """
    Busca global em racks, equipamentos e contatos
    """
    search_term = request.args.get('q', '').strip()
    
    if not search_term or len(search_term) < 2:
        return jsonify([])
    
    cursor = db.cursor(MySQLdb.cursors.DictCursor)
    results = []
    
    try:
        # Busca em Racks
        cursor.execute("""
            SELECT 
                'rack' as type, 
                id, 
                name,
                NULL as rack_name,
                CONCAT('Rack: ', name) as display_text,
                NULL as objtype_id,
                NULL as has_problems
            FROM Rack 
            WHERE name LIKE %s
            ORDER BY name
            LIMIT 10
        """, (f'%{search_term}%',))
        results.extend(cursor.fetchall())
        
        # Busca em Equipamentos
        cursor.execute("""
            SELECT DISTINCT
                'equipment' as type,
                o.id, 
                o.name,
                GROUP_CONCAT(DISTINCT r.name) as rack_name,
                CONCAT('Equipamento: ', o.name, 
                       CASE 
                         WHEN COUNT(DISTINCT r.name) > 0 THEN 
                           CONCAT(' (', GROUP_CONCAT(DISTINCT r.name), ')') 
                         ELSE '' 
                       END
                ) as display_text,
                o.objtype_id,
                o.has_problems
            FROM Object o
            LEFT JOIN RackSpace rs ON o.id = rs.object_id
            LEFT JOIN Rack r ON rs.rack_id = r.id
            WHERE o.name LIKE %s OR o.comment LIKE %s
            GROUP BY o.id, o.name, o.objtype_id, o.has_problems
            ORDER BY o.name
            LIMIT 15
        """, (f'%{search_term}%', f'%{search_term}%'))
        equipment_results = cursor.fetchall()
        results.extend(equipment_results)
        
        # Busca em Contatos (se a tabela existir)
        cursor.execute("""
            SELECT DISTINCT
                'contact' as type,
                av.string_value as contact_name,
                NULL as rack_name,
                CONCAT('Responsável: ', av.string_value) as display_text,
                NULL as objtype_id,
                NULL as has_problems
            FROM AttributeValue av 
            JOIN Attribute a ON av.attr_id = a.id
            WHERE a.name = 'contact person' 
            AND av.string_value LIKE %s
            ORDER BY av.string_value
            LIMIT 10
        """, (f'%{search_term}%',))
        
        contact_results = cursor.fetchall()
        
        # Processar resultados de contatos para adicionar ID único
        for contact in contact_results:
            # Usar a mesma lógica de hash do seu contacts_bp
            contact_id = hashlib.sha1(contact['contact_name'].encode()).hexdigest()
            contact['id'] = contact_id
            contact['name'] = contact['contact_name']  # Padronizar para 'name'
            
        results.extend(contact_results)
            
    except Exception as e:
        print(f"Erro na busca global: {e}")
        return jsonify({"error": "Erro interno no servidor"}), 500
    finally:
        cursor.close()
    
    return jsonify(results)

@search_bp.route("/api/search/equipments")
@db_connection
def search_equipments(db):
    """
    Busca específica em equipamentos com filtros
    """
    search_term = request.args.get('q', '')
    objtype_id = request.args.get('type_id', '')
    has_problems = request.args.get('has_problems', '')
    rack_id = request.args.get('rack_id', '')
    
    query = """
        SELECT 
            o.id, o.name, o.objtype_id, o.asset_no,
            o.has_problems, o.comment,
            GROUP_CONCAT(DISTINCT r.name) as rack_names,
            GROUP_CONCAT(DISTINCT l.name) as location_names
        FROM Object o
        LEFT JOIN RackSpace rs ON o.id = rs.object_id
        LEFT JOIN Rack r ON rs.rack_id = r.id
        LEFT JOIN Location l ON r.location_id = l.id
        WHERE 1=1
    """
    
    params = []
    
    if search_term:
        query += " AND (o.name LIKE %s OR o.comment LIKE %s)"
        params.extend([f'%{search_term}%', f'%{search_term}%'])
    
    if objtype_id:
        query += " AND o.objtype_id = %s"
        params.append(objtype_id)
    
    if has_problems == 'true':
        query += " AND o.has_problems = 'yes'"
    
    if rack_id:
        query += " AND r.id = %s"
        params.append(rack_id)
    
    query += " GROUP BY o.id ORDER BY o.name"
    
    cursor = db.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute(query, params)
    results = cursor.fetchall()
    cursor.close()
    
    return jsonify(results)

@search_bp.route("/api/search/racks")
@db_connection
def search_racks(db):
    """
    Busca específica em racks
    """
    search_term = request.args.get('q', '')
    location_id = request.args.get('location_id', '')
    
    query = """
        SELECT 
            r.id, r.name, r.height,
            l.name as location_name,
            l.address as location_address,
            COUNT(DISTINCT rs.object_id) as equipment_count
        FROM Rack r
        LEFT JOIN Location l ON r.location_id = l.id
        LEFT JOIN RackSpace rs ON r.id = rs.rack_id
        WHERE 1=1
    """
    
    params = []
    
    if search_term:
        query += " AND r.name LIKE %s"
        params.append(f'%{search_term}%')
    
    if location_id:
        query += " AND r.location_id = %s"
        params.append(location_id)
    
    query += " GROUP BY r.id ORDER BY r.name"
    
    cursor = db.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute(query, params)
    results = cursor.fetchall()
    cursor.close()
    
    return jsonify(results)