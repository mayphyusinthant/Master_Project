from flask import Flask, render_template, request, jsonify
from flask_mysqldb import MySQL
from flask_cors import CORS
from navigation_utils import create_navigation
from datetime import datetime
import time
app = Flask(__name__)

CORS(app, supports_credentials=True, origins=["http://localhost:5173"])

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
    query = """SELECT * FROM room_info"""
    cur.execute(query)   
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



@app.route('/api/library_room_types', methods=['GET'])
def get_library_room_types():
    cur = mysql.connection.cursor()
    cur.execute("""SELECT DISTINCT room_type FROM `room_info` 
                WHERE room_type != 'Lecture Room'
                AND room_type != 'Stairs'
                AND room_type != 'Toilet'
                AND room_type != 'Elevator'
                """)
    
    rows = cur.fetchall()
    cur.close()

    # Prepare the library_rooms_type
    library_rooms_type = []
    library_rooms_type.append({"type": "All"})

    for row in rows:
        library_rooms_type.append({
            "type": row[0],
        })

    # Debug print to console
    print("Returning data:", library_rooms_type)
    
    # Make sure we're returning a properly formatted JSON array
    return jsonify(library_rooms_type)


@app.route('/api/available_library_rooms', methods=['GET'])
def get_available_library_rooms():

    start_dt = datetime.strptime(request.args.get('start_date_time'), "%Y-%m-%d %H:%M:%S")
    end_dt = datetime.strptime(request.args.get('end_date_time'), "%Y-%m-%d %H:%M:%S")
    room_type = request.args.get('roomType')

    # Validate input
    if not start_dt or not end_dt:
        return jsonify({"error": "start_date_time and end_date_time are required"}), 400

    if not room_type:
        room_type = "All"

    start_dt_str = start_dt.strftime('%Y-%m-%d %H:%M:%S')
    end_dt_str = end_dt.strftime('%Y-%m-%d %H:%M:%S')
        
    cur = mysql.connection.cursor()
    if room_type == "All" or room_type == "":
        query = """
            SELECT * FROM room_info 
            WHERE room_id NOT IN (
                SELECT room_id 
                FROM rooms_booking_info 
                WHERE 
                    (start_date_time >= %s AND start_date_time <= %s)  
                    OR 
                    (end_date_time >= %s AND end_date_time <= %s)
            ) 
            AND room_name LIKE %s OR room_type LIKE %s;
        """
        
        params = (start_dt_str, end_dt_str, start_dt_str, end_dt_str, 'L%', 'SCEBE %')
        cur.execute(query, params)
   
    else:
        query = """
            SELECT * FROM room_info 
            WHERE room_id NOT IN (
                SELECT room_id 
                FROM rooms_booking_info 
                WHERE 
                    (start_date_time >= %s AND start_date_time <= %s)  
                    OR 
                    (end_date_time >= %s AND end_date_time <= %s)
            ) 
            AND room_type = %s;
        """
        
        params = (start_dt_str, end_dt_str, start_dt_str, end_dt_str, room_type)
        cur.execute(query, params)

    rows = cur.fetchall()
    cur.close()

    # Prepare the available rooms data
    available_library_rooms = []
    for row in rows:
        available_library_rooms.append({
            "roomId": row[0],
            "roomName": row[1],
            "type": row[2],
            "description": row[3],
            "floor": row[4]
        })

    return jsonify(available_library_rooms)


@app.route('/api/all_room_types', methods=['GET'])
def get_all_room_types():
    cur = mysql.connection.cursor()
    cur.execute("""SELECT DISTINCT room_type FROM `room_info` 
                WHERE room_type != 'Stairs'
                AND room_type != 'Toilet'
                AND room_type != 'Elevator'
                """)
    
    rows = cur.fetchall()
    cur.close()

    # Prepare the library_rooms_type
    library_rooms_type = []
    library_rooms_type.append({"type": "All"})

    for row in rows:
        library_rooms_type.append({
            "type": row[0],
        })

    # Debug print to console
    print("Returning data:", library_rooms_type)
    
    # Make sure we're returning a properly formatted JSON array
    return jsonify(library_rooms_type)


@app.route('/api/available_rooms', methods=['GET'])
def get_available_rooms():
    room_type = request.args.get('roomType')

    if not room_type:
        room_type = "All"

    cur = mysql.connection.cursor()
    if room_type == "All" or room_type == "":
        query = """SELECT * FROM room_info;"""
        cur.execute(query)
   
    else:
        query = """SELECT * FROM room_info  WHERE room_type = %s; """
        params = (room_type,)
        cur.execute(query, params)

    rows = cur.fetchall()
    cur.close()

    # Prepare the available rooms data
    available_rooms = []
    for row in rows:
        available_rooms.append({
            "roomId": row[0],
            "roomName": row[1],
            "type": row[2],
            "description": row[3],
            "floor": row[4]
        })

    return jsonify(available_rooms)


@app.route('/api/current_bookings', methods=['GET'])
def get_current_bookings():

    student_id = request.args.get('student_id')

    if not student_id:
       return jsonify({"error": "Fetching data failed - student Id Required !"}), 400

    cur = mysql.connection.cursor()
    query = """
        SELECT rooms_booking_info.*, room_info.room_name, room_info.floor FROM rooms_booking_info LEFT JOIN room_info ON rooms_booking_info.room_id = room_info.room_id WHERE rooms_booking_info.student_id = %s
    """
    cur.execute(query, (student_id,))

    rows = cur.fetchall()
    cur.close()

    # Prepare the available rooms data
    current_bookings = []
    for row in rows:
        current_bookings.append({
            "booking_id": row[0],
            "room_id": row[1],
            "start_date_time": row[2],
            "end_date_time": row[3],
            "status": row[4],
            "student_id": row[5],
            "title": row[6],
            "room_name": row[7],
            "floor": row[8],
            
        })

    return jsonify(current_bookings)


@app.route('/api/book_room', methods=['POST'])
def book_room():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid or missing JSON body"}), 400

    required_fields = ['roomId', 'start_date_time', 'end_date_time', 'matriculationNumber', 'title']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing booking information"}), 400


    room_id = data['roomId']
    start_date_time = data['start_date_time']
    end_date_time = data['end_date_time']
    student_id = data['matriculationNumber']
    title = data['title']

    cur = mysql.connection.cursor()
    query = """
        INSERT INTO rooms_booking_info (room_id, start_date_time, end_date_time, status, student_id, title)
        VALUES (%s, %s, %s, %s, %s, %s)
    """
    cur.execute(query, (room_id, start_date_time, end_date_time, '', student_id, title))
    mysql.connection.commit()
    cur.close()

    return jsonify({"message": "Booking successful!"}), 201


@app.route('/api/remove_booking/<bookingId>', methods=['DELETE'])
def remove_booking(bookingId):
    if not bookingId:
        return jsonify({ 'error': 'Booking ID is required.' }), 400

    cur = mysql.connection.cursor()
    query = "DELETE FROM rooms_booking_info WHERE booking_id = %s"
    cur.execute(query, (bookingId,))
    mysql.connection.commit()  # Make sure to commit after delete
    cur.close()
    return jsonify({ 'message': 'Booking removed successfully.' }), 200



if __name__ == '__main__':
    app.run(debug=True)




