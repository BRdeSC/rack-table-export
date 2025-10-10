import MySQLdb
import os
from functools import wraps

def get_db():
    return MySQLdb.connect(
        host=os.getenv('DB_HOST'),
        user=os.getenv('DB_USER'),
        passwd=os.getenv('DB_PASSWORD'),
        db=os.getenv('DB_NAME'),
        charset=os.getenv('DB_CHARSET', 'utf8'),
        port=int(os.getenv('DB_PORT', 3306))
    )
    
def db_connection(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        db = get_db()
        try:
            return f(db, *args, **kwargs)
        finally:
            db.close()
    return decorated_function