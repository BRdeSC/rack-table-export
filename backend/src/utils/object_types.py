# src/utils/object_types.py
def get_object_type_name(objtype_id):
    type_map = {
        1: 'BlackBox',
        2: 'PDU', 
        4: 'Server',
        5: 'DiskArray',
        6: 'Tape Library',
        8: 'Network Switch',
        9: 'Patch Panel',
        15: 'Console',
        445: 'KVM Switch',
        1055: 'FC Switch',
        1502: 'Server Chassis',
        1560: 'Rack',
        1561: 'Fileira',
        1562: 'Local',
        50022: 'Storage',
        50024: 'Controller'
    }
    return type_map.get(objtype_id, f'Tipo {objtype_id}')