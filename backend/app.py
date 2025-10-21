from flask import Flask
from flask_cors import CORS
from src.utils.database import get_db, db_connection
from src.routes.contacts import contacts_bp
from src.routes.racks import racks_bp
from src.routes.objects import objects_bp
from src.routes.stats import stats_bp
from src.routes.exports import exports_bp
from src.routes.search import search_bp

app = Flask(__name__)
CORS(app)  # Habilita CORS para o React

# Registrar blueprints
app.register_blueprint(contacts_bp) 
app.register_blueprint(racks_bp)
app.register_blueprint(objects_bp)
app.register_blueprint(stats_bp)
app.register_blueprint(exports_bp)
app.register_blueprint(search_bp)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)