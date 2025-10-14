from flask import Blueprint, jsonify
import MySQLdb
import hashlib
from src.utils.database import db_connection
from src.utils.object_types import get_object_type_name

contacts_bp = Blueprint('contacts', __name__)

# Rota para listar todas as pessoas que são contatos em equipamentos
@contacts_bp.route("/api/contacts", methods=['GET'])
@db_connection
def get_contact_persons(db):
    cursor = db.cursor(MySQLdb.cursors.DictCursor)
    
    query = """
        SELECT 
            DISTINCT av.string_value AS contact_name
        FROM 
            AttributeValue av
        JOIN
            Attribute a ON av.attr_id = a.id
        WHERE
            a.name = 'contact person'
        ORDER BY 
            contact_name
    """
    
    cursor.execute(query)
    data = cursor.fetchall()

    # Adiciona um ID único para cada contato
    for contact in data:
        contact_id = hashlib.sha1(contact['contact_name'].encode()).hexdigest()
        contact['id'] = contact_id
    
    cursor.close()
    
    return jsonify(data)

# Rota para buscar equipamentos por nome de pessoa (ATUALIZADA seguindo o padrão da API de objetos)
@contacts_bp.route("/api/objects/by_person/<string:name>")
@db_connection
def get_objects_by_person(db, name):
    cursor = db.cursor(MySQLdb.cursors.DictCursor)
    
    query = """
        SELECT 
            o.id, 
            o.name, 
            o.objtype_id, 
            o.asset_no
        FROM 
            Object o
        JOIN 
            AttributeValue av ON o.id = av.object_id
        JOIN
            Attribute a ON av.attr_id = a.id
        WHERE
            a.name = 'contact person' AND av.string_value = %s
        GROUP BY 
            o.id
        ORDER BY 
            o.name
    """
    
    cursor.execute(query, (name,))
    
    data = cursor.fetchall()
    
    # ADICIONADO: Seguindo o mesmo padrão da API de objetos
    # Adicionar nome do tipo a cada objeto
    for obj in data:
        obj['objtype_name'] = get_object_type_name(obj['objtype_id'])
    
    cursor.close()
    
    return jsonify(data)