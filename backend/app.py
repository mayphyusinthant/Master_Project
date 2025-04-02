from flask import Flask, render_template, request, jsonify
from flask_mysqldb import MySQL
from flask_cors import CORS
from navigation_utils import create_navigation

app = Flask(__name__)

CORS(app)

# MySQL Configuration
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = ''
app.config['MYSQL_DB'] = 'campus_database'

mysql = MySQL(app)

@app.route("/")
def index():
    cur = mysql.connection.cursor()
    cur.execute("SELECT DISTINCT floor FROM room_info ORDER BY floor ASC")
    floors = [row[0] for row in cur.fetchall()]
    cur.close()

    return render_template("index.html", floors=floors)

@app.route("/campus_info")
def campus_mgmt():
    per_page = 25  
    page = request.args.get('page', 1, type=int)  
    offset = (page - 1) * per_page  

    cur = mysql.connection.cursor()
    cur.execute("SELECT COUNT(*) FROM room_info")
    total_rows = cur.fetchone()[0]
    cur.execute("SELECT room_id, room_name, description, floor FROM room_info LIMIT %s OFFSET %s", (per_page, offset))
    rooms = cur.fetchall()
    
    cur.close()

    total_pages = (total_rows // per_page) + (1 if total_rows % per_page > 0 else 0)  
    return render_template('campus_info.html', rooms=rooms, page=page, total_pages=total_pages)


@app.route('/users')
def users():
    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM users")
    data = cur.fetchall()
    cur.close()
    return str(data)

# api routes for react (need to be imported from file after)
@app.route('/api/rooms', methods=['GET'])
def get_rooms():
    cur = mysql.connection.cursor()
    cur.execute("SELECT room_id, room_name, room_type, description, floor, x_coordinate, y_coordinate FROM room_info")
    rows = cur.fetchall()
    cur.close()

    rooms = []
    for row in rows:
         rooms.append({
            "roomId": row[0],  # fallback if description is empty
            "roomName": row[1],
            "type": row[2],
            "description": row[3],
            "floor": row[4]
        })

    return jsonify(rooms)

@app.route('/api/navigate', methods=['POST'])
def handle_navigation():
    data = request.get_json()
    print(data)
    from_name = data.get('from')
    to_name = data.get('to')

    cur = mysql.connection.cursor()

    # Fetch FROM room
    cur.execute("SELECT room_id, room_name, floor, x_coordinate, y_coordinate FROM room_info WHERE room_name = %s", (from_name,))
    from_row = cur.fetchone()

    # Fetch TO room
    cur.execute("SELECT room_id, room_name, floor, x_coordinate, y_coordinate FROM room_info WHERE room_name = %s", (to_name,))
    to_row = cur.fetchone()

    cur.close()

    if not from_row or not to_row:
        return jsonify({"status": "error", "message": "One or both rooms not found"}), 404
    
    from_room = {
        "roomId": from_row[0],
        "roomName": from_row[1],
        "floor": from_row[2],
        "x_coordinate": from_row[3],
        "y_coordinate": from_row[4]
    }

    to_room = {
        "roomId": to_row[0],
        "roomName": to_row[1],
        "floor": to_row[2],
        "x_coordinate": to_row[3],
        "y_coordinate": to_row[4]
    }

    result = create_navigation(from_room, to_room)

    return jsonify({"status": "success", "message": result}), 200





if __name__ == '__main__':
    app.run(debug=True)




